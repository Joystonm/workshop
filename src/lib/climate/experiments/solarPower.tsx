// Solar Power — daily solar irradiance, temperature, humidity at any
// location. Data: NASA POWER (no key).
//
// Layout: header (preset) → hero (avg irradiance + peak-sun-hours
// estimate) → 3 stat cards (peak, avg T, clear-sky ratio) → irradiance
// line with temperature overlay + clear-sky reference → footer (PV
// yield formula).

import React, { useEffect, useMemo, useState } from 'react'
import { fetchPower, PowerData } from '../api/nasa'
import { useClimateStore } from '../store'
import { PRESETS } from '../api/openMeteo'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateChart, ChartDatum } from '../../../components/climate/ClimateChart'
import { clearSkyKwhPerDay, powerDateLabel } from '../../../components/climate/primitives'

const PRESET_KEYS = Object.keys(PRESETS)

function todayYmd(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}
function daysAgoYmd(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function SolarPowerScene() {
  const [presetKey, setPresetKey] = useState<string>('sahara')
  const [data, setData] = useState<PowerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const preset = PRESETS[presetKey]
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPower(preset.lat, preset.lon, daysAgoYmd(30), todayYmd())
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
        const series = Object.keys(d.ALLSKY_SFC_SW_DWN).sort()
        const valid = series.filter((k) => (d.ALLSKY_SFC_SW_DWN[k] ?? 0) > 0)
        if (valid.length === 0) return
        const setM = useClimateStore.getState().setMeasurement
        setM('location', preset.name)
        const avgIrr = valid.reduce((s, k) => s + (d.ALLSKY_SFC_SW_DWN[k] ?? 0), 0) / valid.length
        const peakIrr = valid.reduce((m, k) => Math.max(m, d.ALLSKY_SFC_SW_DWN[k] ?? 0), 0)
        setM('avg_irradiance_MJ_per_m2_d', avgIrr)
        setM('peak_irradiance_MJ_per_m2_d', peakIrr)
        const ts = series.map((k) => d.T2M[k] ?? 0)
        const avgT = ts.length > 0 ? ts.reduce((s, v) => s + v, 0) / ts.length : 0
        setM('avg_temp_celsius', avgT)
        const peakSunHours = avgIrr / 1.0 // 1 kW/m² reference irradiance
        setM('peak_sun_hours_per_day', peakSunHours)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [presetKey])

  const preset = PRESETS[presetKey]

  const series = useMemo(() => {
    if (!data) return [] as Array<{ date: string; irradiance: number; t: number; rh: number }>
    const dates = Object.keys(data.ALLSKY_SFC_SW_DWN).sort()
    return dates.map((d) => ({
      date: d,
      irradiance: data.ALLSKY_SFC_SW_DWN[d] ?? 0,
      t: data.T2M[d] ?? 0,
      rh: data.RH2M[d] ?? 0,
    }))
  }, [data])

  const valid = series.filter((s) => s.irradiance > 0)
  const avgIrr = valid.length > 0 ? valid.reduce((s, v) => s + v.irradiance, 0) / valid.length : 0
  const peakIrr = valid.reduce((m, v) => Math.max(m, v.irradiance), 0)
  const avgT = series.length > 0 ? series.reduce((s, v) => s + v.t, 0) / series.length : 0
  const clearSky = clearSkyKwhPerDay(preset.lat)

  const xLabels = series.map((s) => powerDateLabel(s.date))
  const irrData: ChartDatum[] = series.map((s, i) => ({ x: i, y: s.irradiance, label: xLabels[i] }))
  const tData: ChartDatum[] = series.map((s, i) => ({ x: i, y: s.t, label: xLabels[i] }))

  const yMin = 0
  const yMax = Math.max(...series.map((s) => s.irradiance), clearSky) * 1.1

  // PV yield at the location: G · η · A · PR. We assume a 1 m² panel,
  // η = 0.20 (commercial silicon), PR = 0.75 (system losses).
  const PV_YIELD_FACTOR = 0.20 * 0.75

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Solar Power — {preset.name}</h2>
          <p className="cli-sub">
            {preset.lat.toFixed(2)}°, {preset.lon.toFixed(2)}° · last 30 days · NASA POWER
          </p>
        </div>
        <select className="cli-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {PRESET_KEYS.map((k) => (
            <option key={k} value={k}>{PRESETS[k].name}</option>
          ))}
        </select>
      </header>

      {loading && <div className="cli-loading">Fetching NASA POWER data…</div>}
      {error && <div className="cli-error">NASA POWER unreachable: {error}</div>}

      {valid.length > 0 && (
        <>
          <section className="cli-hero">
            <div className="cli-hero-glyph" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning, #D97706)' }} aria-hidden>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {avgIrr.toFixed(2)}
              </span>
              <span style={{ fontSize: 10, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                kWh/m²/d
              </span>
            </div>
            <div className="cli-hero-body">
              <div className="cli-hero-primary">
                <span className="cli-hero-val">{(avgIrr * PV_YIELD_FACTOR).toFixed(2)}</span>
                <span className="cli-hero-unit">kWh/m²/d PV</span>
              </div>
              <p className="cli-hero-caption">
                Estimated PV yield from a 1 m² 20%-efficient module with 75% performance ratio. Peak sun hours: <strong>{(avgIrr / 1.0).toFixed(2)} h/day</strong>.
              </p>
              <div className="cli-hero-substats">
                <HeroStat label="Peak" value={`${peakIrr.toFixed(2)} kWh/m²/d`} />
                <HeroStat label="Clear-sky" value={`${clearSky.toFixed(1)} kWh/m²/d`} />
                <HeroStat label="Avg T" value={`${avgT.toFixed(1)} °C`} />
                <HeroStat label="Sky ratio" value={`${((avgIrr / clearSky) * 100).toFixed(0)}%`} />
              </div>
              <span className="cli-hero-meta">{valid.length} days observed</span>
            </div>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Peak irradiance"
              value={peakIrr.toFixed(2)}
              unit="kWh/m²/d"
              icon="sun"
              tone="warn"
              sub={`Best ${valid.reduce((m, v) => (v.irradiance === peakIrr ? m + 1 : m), 0)} day${valid.reduce((m, v) => (v.irradiance === peakIrr ? m + 1 : m), 0) === 1 ? '' : 's'} at this level`}
            />
            <StatCard
              label="Avg temperature"
              value={`${avgT.toFixed(1)}`}
              unit="°C"
              icon="thermometer"
              tone={avgT > 35 ? 'warn' : avgT < 0 ? 'info' : 'good'}
              sub={`Avg humidity ${(series.reduce((s, v) => s + v.rh, 0) / Math.max(1, series.length)).toFixed(0)}%`}
            />
            <StatCard
              label="Peak-sun hours"
              value={`${(avgIrr / 1.0).toFixed(2)}`}
              unit="h/day"
              icon="gauge"
              tone="info"
              sub={`Daily GHI ÷ 1 kW/m² reference`}
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Daily irradiance + temperature</h3>
              <span className="cli-section-meta">orange line = GHI · dashed = clear-sky ceiling</span>
            </div>
            <div className="cli-section-body">
              <ClimateChart
                type="area"
                data={irrData}
                height={220}
                color="#F59E0B"
                fillColor="#F59E0B"
                yLabel="kWh/m²/d"
                xLabels={xLabels}
                yDomain={[yMin, yMax]}
                referenceLines={[
                  { y: clearSky, label: `clear-sky ${clearSky.toFixed(1)}`, color: 'var(--text-muted)', dashed: true },
                ]}
                tooltip={(d) => (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{xLabels[d.x]}</div>
                    <div><strong>{irrData[d.x].y.toFixed(2)}</strong> kWh/m²/d · {tData[d.x].y.toFixed(1)} °C</div>
                  </div>
                )}
              />
              {/* Temperature strip rendered as a separate small chart underneath */}
              <div style={{ marginTop: 12 }}>
                <ClimateChart
                  type="line"
                  data={tData}
                  height={120}
                  color="#F97316"
                  yLabel="°C"
                  xLabels={xLabels}
                  formatY={(v) => v.toFixed(0)}
                  yDomain={[
                    Math.min(...tData.map((t) => t.y)) - 3,
                    Math.max(...tData.map((t) => t.y)) + 3,
                  ]}
                  tooltip={(d) => (
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{xLabels[d.x]}</div>
                      <div><strong>{tData[d.x].y.toFixed(1)} °C</strong></div>
                    </div>
                  )}
                />
              </div>
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">E = G · η · A · PR</span>
              <span className="cli-formula-chip-meaning">PV yield — G: irradiance, η: 0.20, A: 1 m², PR: 0.75</span>
            </span>
            <a className="cli-source-link" href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer">
              power.larc.nasa.gov ↗
            </a>
          </footer>
        </>
      )}
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
        }}
      >
        {value}
      </div>
    </div>
  )
}