// Climate Trends — annual mean temperature + annual precipitation over
// the last ~30 years at any city, plotted as anomalies against a
// user-selectable baseline decade (default 1991-2020). Data:
// Open-Meteo /v1/archive (no key).
//
// Layout: header (preset + baseline decade) → 3 stat cards (years,
// trend °C/decade, total precip trend) → anomaly chart with zero
// reference line + ±1σ band → precip anomaly chart → footer.

import React, { useEffect, useMemo, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchHistoricalAnnual, PRESETS, HistoricalAnnual } from '../api/openMeteo'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateChart, ChartDatum } from '../../../components/climate/ClimateChart'

const PRESET_KEYS = Object.keys(PRESETS)
const YEARS_BACK = 30
const BASELINE_OPTIONS = [
  { label: '1991–2020', start: 1991, end: 2020 },
  { label: '1961–1990', start: 1961, end: 1990 },
  { label: '1986–2015', start: 1986, end: 2015 },
]

export function ClimateTrendsScene() {
  const [presetKey, setPresetKey] = useState<string>('reykjavik')
  const [baselineIx, setBaselineIx] = useState<number>(0)
  const [data, setData] = useState<HistoricalAnnual[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [windowLabel, setWindowLabel] = useState<string>('')

  const baseline = BASELINE_OPTIONS[baselineIx]

  useEffect(() => {
    const preset = PRESETS[presetKey]
    const endYear = new Date().getFullYear() - 1
    const startYear = Math.min(endYear, baseline.start - 5) // fetch a bit earlier so baseline is in-window
    let cancelled = false
    setLoading(true)
    setError(null)
    setWindowLabel(`${startYear}–${endYear}`)
    fetchHistoricalAnnual(preset.lat, preset.lon, startYear, endYear)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
        const valid = d.filter((x) => x.t_mean != null) as Array<{ year: number; t_mean: number; precip_sum: number | null }>
        if (valid.length === 0) return
        const setM = useClimateStore.getState().setMeasurement
        setM('city', preset.name)
        setM('years_observed', valid.length)
        setM('t_mean_first', valid[0].t_mean)
        setM('t_mean_last', valid[valid.length - 1].t_mean)
        const trend = (valid[valid.length - 1].t_mean - valid[0].t_mean) / Math.max(1, valid.length - 1)
        setM('trend_celsius_per_year', trend)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [presetKey, baseline])

  const preset = PRESETS[presetKey]
  const valid = useMemo(
    () => data.filter((d) => d.t_mean != null) as Array<{ year: number; t_mean: number; precip_sum: number | null }>,
    [data],
  )

  // Baseline window in the fetched data — clip to years that exist.
  const baselineVals = useMemo(() => {
    const inWindow = valid.filter((v) => v.year >= baseline.start && v.year <= baseline.end)
    return inWindow.length > 0 ? inWindow : valid.slice(0, 5)
  }, [valid, baseline])

  const baseMeanT = baselineVals.length > 0 ? baselineVals.reduce((s, v) => s + v.t_mean, 0) / baselineVals.length : 0
  const baseMeanP = useMemo(() => {
    const pps = baselineVals.filter((v) => v.precip_sum != null) as Array<{ precip_sum: number }>
    return pps.length > 0 ? pps.reduce((s, v) => s + v.precip_sum, 0) / pps.length : 0
  }, [baselineVals])

  const anomalies = useMemo<ChartDatum[]>(() => {
    return valid.map((v) => ({ x: v.year, y: v.t_mean - baseMeanT, label: String(v.year) }))
  }, [valid, baseMeanT])

  const precipAnomalies = useMemo<ChartDatum[]>(() => {
    return valid.map((v) => ({
      x: v.year,
      y: (v.precip_sum ?? 0) - baseMeanP,
      label: String(v.year),
    }))
  }, [valid, baseMeanP])

  // 1σ band of the anomaly series (computed post-baseline subtraction).
  const sigma = useMemo(() => {
    if (anomalies.length === 0) return 0
    const mean = anomalies.reduce((s, v) => s + v.y, 0) / anomalies.length
    const variance = anomalies.reduce((s, v) => s + (v.y - mean) ** 2, 0) / anomalies.length
    return Math.sqrt(variance)
  }, [anomalies])

  const tFirst = valid[0]?.t_mean
  const tLast = valid[valid.length - 1]?.t_mean
  const trendPerDecade = tFirst != null && tLast != null && valid.length > 1 ? ((tLast - tFirst) / (valid.length - 1)) * 10 : 0
  const yMin = anomalies.length > 0 ? Math.min(...anomalies.map((a) => a.y), -sigma * 1.2) - 0.2 : -1
  const yMax = anomalies.length > 0 ? Math.max(...anomalies.map((a) => a.y), sigma * 1.2) + 0.2 : 1

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Climate Trends — {preset.name}</h2>
          <p className="cli-sub">
            {preset.lat.toFixed(2)}°, {preset.lon.toFixed(2)}° · {windowLabel} · Open-Meteo /v1/archive
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="cli-select" value={baselineIx} onChange={(e) => setBaselineIx(parseInt(e.target.value, 10))}>
            {BASELINE_OPTIONS.map((b, i) => (
              <option key={b.label} value={i}>
                Baseline {b.label}
              </option>
            ))}
          </select>
          <select className="cli-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
            {PRESET_KEYS.map((k) => (
              <option key={k} value={k}>{PRESETS[k].name}</option>
            ))}
          </select>
        </div>
      </header>

      {loading && <div className="cli-loading">Fetching historical annual means…</div>}
      {error && <div className="cli-error">Open-Meteo unreachable: {error}</div>}

      {valid.length > 0 && (
        <>
          <section className="cli-hero">
            <div className="cli-hero-glyph" style={{ background: trendPerDecade > 0 ? 'rgba(220, 38, 38, 0.12)' : 'rgba(14, 165, 233, 0.12)', color: trendPerDecade > 0 ? 'var(--danger)' : 'var(--ws-climate)' }} aria-hidden>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {trendPerDecade >= 0 ? '+' : ''}
                {trendPerDecade.toFixed(2)}
              </span>
              <span style={{ fontSize: 10, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                °C / decade
              </span>
            </div>
            <div className="cli-hero-body">
              <div className="cli-hero-primary">
                <span className="cli-hero-val">{trendPerDecade >= 0 ? 'Warming' : 'Cooling'}</span>
              </div>
              <p className="cli-hero-caption">
                Long-term trend at {preset.name} across {valid.length} years, relative to the {baseline.label} baseline of {baseMeanT.toFixed(2)} °C mean.
              </p>
              <div className="cli-hero-substats">
                <HeroStat label="First year" value={String(valid[0].year)} />
                <HeroStat label="Last year" value={String(valid[valid.length - 1].year)} />
                <HeroStat label="Mean T now" value={`${(tLast ?? 0).toFixed(1)} °C`} />
                <HeroStat label="σ band" value={`±${sigma.toFixed(2)} °C`} />
              </div>
              <span className="cli-hero-meta">WMO standard baseline</span>
            </div>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Years observed"
              value={String(valid.length)}
              icon="trend"
              tone="info"
              sub={`Window ${valid[0].year}–${valid[valid.length - 1].year}`}
            />
            <StatCard
              label="Temperature trend"
              value={`${trendPerDecade >= 0 ? '+' : ''}${trendPerDecade.toFixed(2)}`}
              unit="°C/decade"
              icon="thermometer"
              tone={trendPerDecade > 0.2 ? 'warn' : trendPerDecade > 0 ? 'info' : 'good'}
              sub={`First mean ${(tFirst ?? 0).toFixed(2)} °C · last mean ${(tLast ?? 0).toFixed(2)} °C`}
            />
            <StatCard
              label="Baseline"
              value={`${baseMeanT.toFixed(2)}`}
              unit="°C"
              icon="gauge"
              tone="info"
              sub={`${baseline.label} mean · ${baselineVals.length} years in baseline window`}
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Annual mean temperature anomaly</h3>
              <span className="cli-section-meta">vs {baseline.label} baseline · ±1σ band</span>
            </div>
            <div className="cli-section-body">
              <ClimateChart
                type="area"
                data={anomalies}
                height={220}
                color={trendPerDecade > 0 ? '#DC2626' : '#0EA5E9'}
                fillColor={trendPerDecade > 0 ? '#DC2626' : '#0EA5E9'}
                yLabel="°C anomaly"
                xLabels={anomalies.map((a) => a.label as string)}
                yDomain={[yMin, yMax]}
                referenceLines={[
                  { y: 0, label: 'baseline', color: 'var(--text-muted)', dashed: true },
                  { y: sigma, label: '+1σ', color: 'var(--text-muted)', dashed: true },
                  { y: -sigma, label: '−1σ', color: 'var(--text-muted)', dashed: true },
                ]}
                tooltip={(d) => (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>year {d.x}</div>
                    <div>
                      <strong>{d.y >= 0 ? '+' : ''}{d.y.toFixed(2)} °C</strong> anomaly
                    </div>
                  </div>
                )}
              />
            </div>
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Annual precipitation anomaly</h3>
              <span className="cli-section-meta">vs {baseline.label} baseline ({baseMeanP.toFixed(0)} mm/yr)</span>
            </div>
            <div className="cli-section-body">
              <ClimateChart
                type="bar"
                data={precipAnomalies}
                height={160}
                color="#38BDF8"
                yLabel="mm anomaly"
                xLabels={precipAnomalies.map((p) => p.label as string)}
                yDomain={[
                  Math.min(0, ...precipAnomalies.map((p) => p.y)) * 1.2,
                  Math.max(0, ...precipAnomalies.map((p) => p.y)) * 1.2,
                ]}
                referenceLines={[{ y: 0, label: 'baseline', color: 'var(--text-muted)', dashed: true }]}
                tooltip={(d) => (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>year {d.x}</div>
                    <div>
                      <strong>{d.y >= 0 ? '+' : ''}{d.y.toFixed(0)} mm</strong> vs baseline
                    </div>
                  </div>
                )}
              />
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">T'</span>
              <span className="cli-formula-chip-meaning">anomaly = T<sub>year</sub> − mean(T<sub>baseline</sub>)</span>
            </span>
            <a className="cli-source-link" href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">
              archive-api.open-meteo.com ↗
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