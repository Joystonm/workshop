// Earthquakes — recent significant events from the USGS FDSN feed.
// Data: earthquake.usgs.gov /fdsnws/event/1/query (no API key).
//
// Layout: header (min-mag slider + region filter) → 3 stat cards
// (events, max M, last-24h-count) → depth-vs-magnitude scatter
// (size = magnitude, colour = age) → event list.

import React, { useEffect, useMemo, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchEarthquakes, UsgsEarthquake } from '../api/usgs'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateChart, ChartDatum } from '../../../components/climate/ClimateChart'
import { magColor, timeAgo } from '../../../components/climate/primitives'

type FilterMode = 'all' | 'M5+' | 'last7d'

export function EarthquakesScene() {
  const [minMag, setMinMag] = useState<number>(4.5)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [eqs, setEqs] = useState<UsgsEarthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEarthquakes({ minMagnitude: minMag, limit: 120, orderBy: 'time' })
      .then((d) => {
        if (cancelled) return
        setEqs(d)
        setLoading(false)
        const setM = useClimateStore.getState().setMeasurement
        setM('event_count', d.length)
        setM('min_mag', minMag)
        const max = d.reduce((m, e) => Math.max(m, e.mag), 0)
        const avg = d.length === 0 ? 0 : d.reduce((s, e) => s + e.depth, 0) / d.length
        setM('max_mag', max)
        setM('avg_depth_km', avg)
        const last24 = d.filter((e) => Date.now() - e.time < 24 * 60 * 60 * 1000).length
        setM('last_24h_count', last24)
        if (d[0]) setM('most_recent', d[0].place)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [minMag])

  const filtered = useMemo(() => {
    if (filter === 'M5+') return eqs.filter((e) => e.mag >= 5)
    if (filter === 'last7d') return eqs.filter((e) => Date.now() - e.time < 7 * 24 * 60 * 60 * 1000)
    return eqs
  }, [eqs, filter])

  const maxMag = eqs.reduce((m, e) => Math.max(m, e.mag), 0)
  const avgDepth = eqs.length === 0 ? 0 : eqs.reduce((s, e) => s + e.depth, 0) / eqs.length
  const last24h = eqs.filter((e) => Date.now() - e.time < 24 * 60 * 60 * 1000).length

  // Depth-vs-magnitude scatter. x = depth (km), y = magnitude, point
  // size = magnitude, colour = age.
  const scatter = useMemo<ChartDatum[]>(() => {
    return eqs.map((e) => ({ x: e.depth, y: e.mag, label: e.place, meta: { id: e.id, age: Date.now() - e.time } }))
  }, [eqs])

  const ageMax = eqs.length > 0 ? Math.max(...eqs.map((e) => Date.now() - e.time)) : 1

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Earthquakes — last 30 days</h2>
          <p className="cli-sub">Source: USGS Earthquake Hazards Program FDSN feed</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="cli-select" value={filter} onChange={(e) => setFilter(e.target.value as FilterMode)}>
            <option value="all">All events</option>
            <option value="M5+">M ≥ 5 only</option>
            <option value="last7d">Last 7 days</option>
          </select>
          <label className="cli-control">
            Min magnitude
            <input
              type="range"
              min={3}
              max={8}
              step={0.1}
              value={minMag}
              onChange={(e) => setMinMag(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">M ≥ {minMag.toFixed(1)}</span>
          </label>
        </div>
      </header>

      {loading && <div className="cli-loading">Fetching USGS events…</div>}
      {error && <div className="cli-error">USGS unreachable: {error}</div>}
      {!loading && !error && eqs.length === 0 && (
        <div className="cli-empty">No events above M {minMag.toFixed(1)} in the last 30 days.</div>
      )}

      {eqs.length > 0 && (
        <>
          <section className="cli-stat-strip">
            <StatCard
              label="Events"
              value={String(eqs.length)}
              icon="quake"
              tone="info"
              sub={`${filtered.length} matching current filter`}
            />
            <StatCard
              label="Max magnitude"
              value={maxMag.toFixed(1)}
              icon="gauge"
              tone={maxMag >= 6 ? 'bad' : maxMag >= 5 ? 'warn' : 'good'}
              sub={eqs[0] ? `${eqs.reduce((m, e) => (e.mag === maxMag ? m + 1 : m), 0)} event${eqs.reduce((m, e) => (e.mag === maxMag ? m + 1 : m), 0) === 1 ? '' : 's'} at this magnitude` : '—'}
            />
            <StatCard
              label="Last 24 h"
              value={String(last24h)}
              icon="compass"
              tone={last24h > 8 ? 'warn' : 'good'}
              sub={`Average depth ${avgDepth.toFixed(0)} km · ${timeAgo(eqs[0].time)} since most recent`}
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Depth vs magnitude</h3>
              <span className="cli-section-meta">dot size = magnitude · colour = age (newer = red, older = green)</span>
            </div>
            <div className="cli-section-body">
              <ClimateChart
                type="scatter"
                data={scatter}
                height={280}
                color="#F97316"
                yLabel="Magnitude"
                xLabels={undefined}
                formatX={undefined}
                yDomain={[Math.max(0, minMag - 0.5), Math.min(10, maxMag + 0.5)]}
                formatY={(v) => v.toFixed(1)}
                pointSize={(d) => Math.max(4, d.y * 2)}
                pointColor={(d) => {
                  const age = (d.meta?.age as number) ?? 0
                  const t = age / ageMax
                  // green (new) → orange (mid) → red (old). Inverted
                  // because in seismology, *recent* events are the
                  // urgent ones — but visually we use a clear age scale.
                  if (t < 0.33) return '#EF4444' // recent (red)
                  if (t < 0.66) return '#F59E0B' // days (orange)
                  return '#10B981' // weeks (green)
                }}
                tooltip={(d) => (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{d.label}</div>
                    <div><strong>M {d.y.toFixed(1)}</strong> · depth {d.x.toFixed(0)} km</div>
                  </div>
                )}
              />
            </div>
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Event list ({filtered.length})</h3>
            </div>
            <div className="cli-list">
              {filtered.map((e) => (
                <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="cli-eq-row">
                  <span className="cli-eq-mag" style={{ background: magColor(e.mag) }}>
                    {e.mag.toFixed(1)}
                  </span>
                  <div className="cli-eq-info">
                    <span className="cli-eq-place">{e.place}</span>
                    <span className="cli-eq-meta">
                      depth {e.depth.toFixed(0)} km · {new Date(e.time).toLocaleString()} · {timeAgo(e.time)}
                    </span>
                  </div>
                  <span className="cli-eq-coord">
                    {e.lat.toFixed(2)}°, {e.lon.toFixed(2)}°
                  </span>
                </a>
              ))}
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">Mw</span>
              <span className="cli-formula-chip-meaning">moment magnitude scale — logarithmic energy release</span>
            </span>
            <a className="cli-source-link" href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">
              earthquake.usgs.gov ↗
            </a>
          </footer>
        </>
      )}
    </div>
  )
}