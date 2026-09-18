// Today's Earth — DSCOVR's daily natural-colour image of Earth.
// Data: NASA EPIC (no-auth mirror at epic.gsfc.nasa.gov).
//
// Layout: hero (large image with "X h old" badge + L1 caption) → 3
// stat cards (image count, centroid, sun elevation angle) → recent
// days strip (click to expand caption) → footer.

import React, { useEffect, useMemo, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchEpicImages, epicImageUrl, EpicImage } from '../api/nasa'
import { StatCard } from '../../../components/climate/StatCard'
import { l1DistanceKm, timeAgo } from '../../../components/climate/primitives'

export function TodaysEarthScene() {
  const [images, setImages] = useState<EpicImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEpicImages(8)
      .then((d) => {
        if (cancelled) return
        setImages(d)
        setLoading(false)
        const main = d[0]
        if (!main) return
        const setM = useClimateStore.getState().setMeasurement
        setM('caption', main.caption || 'Earth from a million miles away')
        setM('image_count', d.length)
        setM('centroid_lat', main.centroid_coordinates.lat)
        setM('centroid_lon', main.centroid_coordinates.lon)
        setM('l1_distance_km', l1DistanceKm())
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const main = images[0]

  const mainAge = useMemo(() => {
    if (!main) return null
    const ts = main.date // "YYYY-MM-DD HH:MM:SS" UTC
    const iso = `${ts[0]}-${ts[1]}-${ts[2]}T${ts[3] ?? ''}`
    // Parse as UTC
    const ms = Date.parse(`${ts.split(' ')[0]}T${ts.split(' ')[1]}Z`)
    if (Number.isNaN(ms)) return null
    return ms
  }, [main])

  const ageStr = mainAge != null ? timeAgo(mainAge) : '—'
  const ageHours = mainAge != null ? Math.round((Date.now() - mainAge) / 3600000) : 0

  // Approximate sun-elevation angle from DSCOVR's vantage point:
  // DSCOVR sits at L1, ~1.5M km sunward of Earth. The spacecraft
  // always sees Earth's sunlit hemisphere fully, so the angle is
  // effectively 0° (sun behind DSCOVR). We render 0° as a constant
  // but compute the apparent angle of the centroid's sub-solar point.
  const sunAngle = useMemo(() => {
    if (!main) return 0
    const lat = main.centroid_coordinates.lat
    const lon = main.centroid_coordinates.lon
    // Crude: take day-of-year → solar declination, and report the
    // latitude difference between centroid and sub-solar point.
    const day = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000)
    const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (day - 81))
    return Math.abs(lat - decl)
  }, [main])

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Today's Earth — DSCOVR</h2>
          <p className="cli-sub">Source: NASA EPIC · {l1DistanceKm().toLocaleString()} km away at L1</p>
        </div>
      </header>

      {loading && <div className="cli-loading">Fetching latest DSCOVR imagery…</div>}
      {error && <div className="cli-error">NASA EPIC unreachable: {error}</div>}
      {!loading && !error && images.length === 0 && (
        <div className="cli-empty">DSCOVR is currently offline — no images available.</div>
      )}

      {main && (
        <>
          <section className="cli-img-frame">
            <img
              src={epicImageUrl(main)}
              alt={main.caption}
              className="cli-img"
              loading="lazy"
            />
            <span className="cli-img-badge" title="DSCOVR L1, ~1.5M km from Earth">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              L1 · {ageHours} h old
            </span>
            <span className="cli-img-badge right">
              {main.date.split(' ')[0]}
            </span>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Image count"
              value={String(images.length)}
              icon="earth"
              tone="info"
              sub="Most recent EPIC natural-colour images"
            />
            <StatCard
              label="Centroid"
              value={`${main.centroid_coordinates.lat.toFixed(1)}°, ${main.centroid_coordinates.lon.toFixed(1)}°`}
              icon="globe"
              tone="info"
              sub={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <WorldDot lat={main.centroid_coordinates.lat} lon={main.centroid_coordinates.lon} />
                  Sun-side subsolar offset
                </span>
              }
            />
            <StatCard
              label="Subsolar offset"
              value={`${sunAngle.toFixed(1)}`}
              unit="°"
              icon="compass"
              tone="good"
              sub={`Distance from L1 ≈ 1.5M km`}
            />
          </section>

          <section className="cli-section">
            <div className="cli-section-head">
              <h3 className="cli-section-title">Recent days</h3>
              <span className="cli-section-meta">click a tile to expand its caption</span>
            </div>
            <div className="cli-thumb-strip">
              {images.slice(1).map((img) => (
                <button
                  key={img.identifier}
                  type="button"
                  className="cli-thumb"
                  onClick={() => setExpandedId(expandedId === img.identifier ? null : img.identifier)}
                  style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  <img src={epicImageUrl(img)} alt={img.caption} className="cli-thumb-img" loading="lazy" />
                  <span className="cli-thumb-date">{img.date.split(' ')[0]}</span>
                  {expandedId === img.identifier && (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                      {img.caption}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">L1</span>
              <span className="cli-formula-chip-meaning">Sun-Earth Lagrange point 1 — always sunlit view of Earth</span>
            </span>
            <a className="cli-source-link" href="https://epic.gsfc.nasa.gov" target="_blank" rel="noreferrer">
              epic.gsfc.nasa.gov ↗
            </a>
          </footer>
        </>
      )}
    </div>
  )
}

// Small inline SVG: a 60×30 world rectangle with a dot for the centroid.
function WorldDot({ lat, lon }: { lat: number; lon: number }) {
  const x = ((lon + 180) / 360) * 60
  const y = ((90 - lat) / 180) * 30
  return (
    <svg width={60} height={30} viewBox="0 0 60 30" style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <rect width={60} height={30} fill="var(--bg-tertiary)" />
      <line x1={30} y1={0} x2={30} y2={30} stroke="var(--border-subtle)" />
      <line x1={0} y1={15} x2={60} y2={15} stroke="var(--border-subtle)" />
      <circle cx={x} cy={y} r={2} fill="var(--ws-climate, #0EA5E9)" />
    </svg>
  )
}