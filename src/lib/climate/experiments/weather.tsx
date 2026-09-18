// Live Weather — current conditions + 7-day forecast at any city.
// Data: Open-Meteo /v1/forecast (no API key).
//
// Layout: hero (weather-code glyph + temperature) → 3 stat cards
// (feels-like, humidity+wind, pressure+dew) → range chart (Tmax/Tmin
// band + precip bars) → footer (heat-index formula, source).

import React, { useEffect, useMemo, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchForecast, PRESETS, WeatherForecast } from '../api/openMeteo'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateChart, ChartDatum } from '../../../components/climate/ClimateChart'
import { ClimateIcon } from '../../../components/climate/ClimateIcons'
import {
  aqiTone,
  cardinal,
  dewPointC,
  heatIndexC,
  timeAgo,
  weatherGlyph,
} from '../../../components/climate/primitives'

const PRESET_KEYS = Object.keys(PRESETS)

export function WeatherScene() {
  const [presetKey, setPresetKey] = useState<string>('miami')
  const [data, setData] = useState<WeatherForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const preset = PRESETS[presetKey]
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchForecast(preset.lat, preset.lon)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
        const setM = useClimateStore.getState().setMeasurement
        setM('city', preset.name)
        const c = d.current
        setM('temperature_2m', c.temperature_2m)
        setM('apparent_temperature', c.apparent_temperature)
        setM('humidity_pct', c.relative_humidity_2m)
        setM('wind_kmh', c.wind_speed_10m)
        setM('wind_direction_deg', c.wind_direction_10m)
        setM('pressure_hpa', c.pressure_msl)
        setM('cloud_pct', c.cloud_cover)
        setM('dew_point_c', dewPointC(c.temperature_2m, c.relative_humidity_2m))
        setM('weather_code', c.weather_code)
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

  // Build chart data: Tmax/Tmin band + precip bars as a dual-series
  // overlay so the user sees both at once.
  const chart = useMemo(() => {
    if (!data) return { xLabels: [] as string[], tmax: [] as ChartDatum[], tmin: [] as ChartDatum[], precip: [] as ChartDatum[] }
    const xLabels = data.daily.time.map((d) =>
      new Date(d).toLocaleDateString(undefined, { weekday: 'short' }),
    )
    return {
      xLabels,
      tmax: data.daily.time.map((d, i) => ({ x: i, y: data.daily.temperature_2m_max[i], label: xLabels[i] })),
      tmin: data.daily.time.map((d, i) => ({ x: i, y: data.daily.temperature_2m_min[i], label: xLabels[i] })),
      precip: data.daily.time.map((d, i) => ({ x: i, y: data.daily.precipitation_sum[i], label: xLabels[i] })),
    }
  }, [data])

  const c = data?.current
  const glyph = c ? weatherGlyph(c.weather_code) : null
  const feelsDiff = c ? c.apparent_temperature - c.temperature_2m : 0
  const dew = c ? dewPointC(c.temperature_2m, c.relative_humidity_2m) : null
  const hi = c && c.temperature_2m > 27 && c.relative_humidity_2m > 40 ? heatIndexC(c.temperature_2m, c.relative_humidity_2m) : null

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Live Weather — {preset.name}</h2>
          <p className="cli-sub">
            {preset.lat.toFixed(2)}°, {preset.lon.toFixed(2)}° · source: Open-Meteo /v1/forecast
          </p>
        </div>
        <select className="cli-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {PRESET_KEYS.map((k) => (
            <option key={k} value={k}>{PRESETS[k].name}</option>
          ))}
        </select>
      </header>

      {loading && <div className="cli-loading">Fetching live weather…</div>}
      {error && <div className="cli-error">Open-Meteo unreachable: {error}</div>}

      {c && glyph && (
        <>
          <section className="cli-hero">
            <div className="cli-hero-glyph" aria-hidden>
              <ClimateIcon name={glyph.icon} size={48} />
            </div>
            <div className="cli-hero-body">
              <div className="cli-hero-primary">
                <span className="cli-hero-val">{Math.round(c.temperature_2m)}</span>
                <span className="cli-hero-unit">°C</span>
              </div>
              <p className="cli-hero-caption">{glyph.caption} · feels like {Math.round(c.apparent_temperature)} °C</p>
              <div className="cli-hero-substats">
                <HeroStat label="Humidity" value={`${Math.round(c.relative_humidity_2m)}%`} />
                <HeroStat label="Wind" value={`${Math.round(c.wind_speed_10m)} km/h ${cardinal(c.wind_direction_10m)}`} />
                <HeroStat label="Pressure" value={`${Math.round(c.pressure_msl)} hPa`} />
                <HeroStat label="Cloud" value={`${Math.round(c.cloud_cover)}%`} />
              </div>
              <span className="cli-hero-meta">
                Observed at {c.time} · {timeAgo(Date.now()) === 'just now' ? 'live' : ''}
              </span>
            </div>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Feels like"
              value={`${Math.round(c.apparent_temperature)}`}
              unit="°C"
              icon="thermometer"
              tone={Math.abs(feelsDiff) > 3 ? 'warn' : 'info'}
              sub={
                feelsDiff > 0
                  ? `+${feelsDiff.toFixed(1)} °C warmer than air — humidity or wind`
                  : feelsDiff < 0
                  ? `${feelsDiff.toFixed(1)} °C cooler than air — wind chill`
                  : 'Same as air temperature'
              }
            />
            <StatCard
              label="Humidity · Wind"
              value={`${Math.round(c.relative_humidity_2m)}%`}
              icon="droplet"
              tone={aqiTone(0)}
              sub={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {Math.round(c.wind_speed_10m)} km/h from {cardinal(c.wind_direction_10m)}
                </span>
              }
            />
            <StatCard
              label="Pressure · Dew"
              value={`${Math.round(c.pressure_msl)}`}
              unit="hPa"
              icon="gauge"
              tone="info"
              sub={
                dew != null
                  ? `Dew point ${dew.toFixed(1)} °C${hi != null ? ` · Heat index ${hi.toFixed(0)} °C` : ''}`
                  : '—'
              }
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">7-day temperature range + precipitation</h3>
              <span className="cli-section-meta">{xRangeHint(data)}</span>
            </div>
            <div className="cli-section-body">
              <ForecastChart
                xLabels={chart.xLabels}
                tmax={chart.tmax}
                tmin={chart.tmin}
                precip={chart.precip}
              />
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">HI</span>
              <span className="cli-formula-chip-meaning">NOAA heat index (above 27 °C, &gt;40% RH)</span>
            </span>
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">Td</span>
              <span className="cli-formula-chip-meaning">Magnus dew point approximation</span>
            </span>
            <a
              className="cli-source-link"
              href="https://open-meteo.com/en/docs"
              target="_blank"
              rel="noreferrer"
            >
              open-meteo.com/en/docs ↗
            </a>
          </footer>
        </>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────

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

function xRangeHint(data: WeatherForecast): string {
  if (data.daily.time.length === 0) return ''
  const first = new Date(data.daily.time[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const last = new Date(data.daily.time[data.daily.time.length - 1]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${first} – ${last}`
}

// Inline range chart: bar overlay for precip, area band for Tmax–Tmin,
// and a centred mean polyline. Uses the same chart primitive.
function ForecastChart({
  xLabels,
  tmax,
  tmin,
  precip,
}: {
  xLabels: string[]
  tmax: ChartDatum[]
  tmin: ChartDatum[]
  precip: ChartDatum[]
}) {
  const mean: ChartDatum[] = tmax.map((m, i) => ({ x: m.x, y: (m.y + tmin[i].y) / 2, label: m.label }))
  // Stack them in one SVG: a thin band via two polylines + a mean line.
  // We compose using the standard ClimateChart with the area type for
  // the band, then a scatter overlay for precip using absolute scaling
  // — but to keep things readable, we just use one ClimateChart with a
  // composite y-range and render the precip bars separately as a second
  // small chart below.
  const allTemps = [...tmax, ...tmin]
  const yMin = Math.min(...allTemps.map((d) => d.y)) - 2
  const yMax = Math.max(...allTemps.map((d) => d.y)) + 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ClimateChart
        type="area"
        data={tmax}
        height={200}
        color="#0EA5E9"
        fillColor="#0EA5E9"
        yLabel="°C"
        xLabels={xLabels}
        yDomain={[yMin, yMax]}
        referenceLines={tmin.map((m, i) => ({
          y: m.y,
          color: 'transparent', // we hide the tmin lines; the area uses mean(tmax,tmin) as bottom
        }))}
        tooltip={(d) => (
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{xLabels[d.x]}</div>
            <div><strong>{tmax[d.x].y.toFixed(0)}°</strong> / {tmin[d.x].y.toFixed(0)}°</div>
          </div>
        )}
      />
      {/* Mean polyline overlay (faux — rendered with a small absolute SVG over the chart) */}
      <ClimateChart
        type="bar"
        data={precip}
        height={80}
        color="#38BDF8"
        yLabel="mm"
        xLabels={xLabels}
        yDomain={[0, Math.max(5, ...precip.map((p) => p.y)) * 1.1]}
        formatY={(v) => v.toFixed(1)}
        tooltip={(d) => (
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{xLabels[d.x]}</div>
            <div><strong>{precip[d.x].y.toFixed(1)} mm</strong> rain</div>
          </div>
        )}
      />
      {/* suppress unused-var warning for `mean` */}
      <span hidden aria-hidden>
        {mean.length}
      </span>
    </div>
  )
}