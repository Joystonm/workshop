// Ocean & Waves — wave height, period, direction, SST and ocean
// current at any ocean point. Data: Open-Meteo /v1/marine (no key).
//
// Layout: hero (wave height + cardinal arrow) → 3 stat cards
// (wave height, wave period, SST) → 7-day wave-height line with
// direction band → footer.

import React, { useEffect, useMemo, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchMarine, PRESETS, MarineData } from '../api/openMeteo'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateChart, ChartDatum } from '../../../components/climate/ClimateChart'
import { cardinal, Compass } from '../../../components/climate/primitives'

const PRESET_KEYS = Object.keys(PRESETS)

export function OceanScene() {
  const [presetKey, setPresetKey] = useState<string>('gulf-of-mexico')
  const [data, setData] = useState<MarineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const preset = PRESETS[presetKey]
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMarine(preset.lat, preset.lon)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
        const setM = useClimateStore.getState().setMeasurement
        setM('ocean_point', preset.name)
        const c = d.current
        setM('wave_height_m', c.wave_height)
        setM('wave_direction_deg', c.wave_direction)
        setM('wave_period_s', d.daily.wave_period_max?.[0] ?? 0)
        setM('sst_celsius', c.sea_surface_temperature)
        setM('current_velocity_ms', c.ocean_current_velocity)
        setM('current_direction_deg', c.ocean_current_direction)
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

  const chart = useMemo(() => {
    if (!data) return { xLabels: [] as string[], wh: [] as ChartDatum[], wp: [] as ChartDatum[] }
    const xLabels = data.daily.time.map((d) =>
      new Date(d).toLocaleDateString(undefined, { weekday: 'short' }),
    )
    return {
      xLabels,
      wh: data.daily.time.map((d, i) => ({ x: i, y: data.daily.wave_height_max[i], label: xLabels[i] })),
      wp: data.daily.time.map((d, i) => ({ x: i, y: data.daily.wave_period_max?.[i] ?? 0, label: xLabels[i] })),
    }
  }, [data])

  const c = data?.current

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Ocean & Waves — {preset.name}</h2>
          <p className="cli-sub">
            {preset.lat.toFixed(2)}°, {preset.lon.toFixed(2)}° · source: Open-Meteo /v1/marine
          </p>
        </div>
        <select className="cli-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {PRESET_KEYS.map((k) => (
            <option key={k} value={k}>{PRESETS[k].name}</option>
          ))}
        </select>
      </header>

      {loading && <div className="cli-loading">Fetching marine data…</div>}
      {error && <div className="cli-error">Open-Meteo unreachable: {error}</div>}

      {c && (
        <>
          <section className="cli-hero">
            <div className="cli-hero-glyph" aria-hidden>
              <Compass direction={c.wave_direction} size={80} />
            </div>
            <div className="cli-hero-body">
              <div className="cli-hero-primary">
                <span className="cli-hero-val">{c.wave_height.toFixed(2)}</span>
                <span className="cli-hero-unit">m</span>
              </div>
              <p className="cli-hero-caption">
                Swell from {cardinal(c.wave_direction)} ({Math.round(c.wave_direction)}°)
                {data?.daily.wave_period_max?.[0] != null && (
                  <> · period {data.daily.wave_period_max[0].toFixed(1)} s</>
                )}
              </p>
              <div className="cli-hero-substats">
                <HeroStat label="SST" value={`${c.sea_surface_temperature.toFixed(1)} °C`} />
                <HeroStat label="Current" value={`${c.ocean_current_velocity.toFixed(2)} m/s`} />
                <HeroStat label="Current dir" value={`${cardinal(c.ocean_current_direction)} (${Math.round(c.ocean_current_direction)}°)`} />
              </div>
              <span className="cli-hero-meta">Observed at {c.time}</span>
            </div>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Wave height"
              value={c.wave_height.toFixed(2)}
              unit="m"
              icon="wave"
              tone={c.wave_height > 3 ? 'warn' : c.wave_height > 1.5 ? 'info' : 'good'}
              sub={
                <>
                  Swell from <strong>{cardinal(c.wave_direction)}</strong> ({Math.round(c.wave_direction)}°)
                </>
              }
            />
            <StatCard
              label="Wave period"
              value={(data?.daily.wave_period_max?.[0] ?? 0).toFixed(1)}
              unit="s"
              icon="compass"
              tone={(data?.daily.wave_period_max?.[0] ?? 0) > 10 ? 'warn' : 'info'}
              sub={
                (data?.daily.wave_period_max?.[0] ?? 0) > 12
                  ? 'Long-period swell — high energy'
                  : (data?.daily.wave_period_max?.[0] ?? 0) > 7
                  ? 'Medium-period swell'
                  : 'Short-period wind chop'
              }
            />
            <StatCard
              label="Sea surface T"
              value={c.sea_surface_temperature.toFixed(1)}
              unit="°C"
              icon="thermometer"
              tone={c.sea_surface_temperature > 28 ? 'warn' : c.sea_surface_temperature < 5 ? 'info' : 'good'}
              sub={`Current ${c.ocean_current_velocity.toFixed(2)} m/s ${cardinal(c.ocean_current_direction)}`}
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">7-day wave height + period</h3>
            </div>
            <div className="cli-section-body">
              <ClimateChart
                type="area"
                data={chart.wh}
                height={200}
                color="#0EA5E9"
                fillColor="#0EA5E9"
                yLabel="m"
                xLabels={chart.xLabels}
                tooltip={(d) => (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{chart.xLabels[d.x]}</div>
                    <div><strong>{chart.wh[d.x].y.toFixed(2)} m</strong> · period {chart.wp[d.x].y.toFixed(1)} s</div>
                  </div>
                )}
              />
            </div>
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Dominant direction by day</h3>
            </div>
            <div className="cli-section-body" style={{ display: 'flex', gap: 12, justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {data.daily.time.map((d, i) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: 8,
                    minWidth: 60,
                  }}
                >
                  <Compass direction={data.daily.wave_direction_dominant[i]} size={48} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">T</span>
              <span className="cli-formula-chip-meaning">Wave period T — time between successive crests</span>
            </span>
            <a
              className="cli-source-link"
              href="https://open-meteo.com/en/docs/marine-weather-api"
              target="_blank"
              rel="noreferrer"
            >
              marine-api.open-meteo.com ↗
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