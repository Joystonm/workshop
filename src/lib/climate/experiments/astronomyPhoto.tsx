// Astronomy Picture of the Day — NASA's daily image with explanation.
// Data: NASA APOD (no-auth mirror at apod.as93.net).
//
// Layout: hero (image with date badge + media-type chip) → 3 stat
// cards (date, sky object, copyright) → 7-day archive strip → footer.

import React, { useEffect, useState } from 'react'
import { useClimateStore } from '../store'
import { fetchApod, ApodData } from '../api/nasa'
import { StatCard } from '../../../components/climate/StatCard'
import { guessSkyObject } from '../../../components/climate/primitives'

export function AstronomyPhotoScene() {
  const [data, setData] = useState<ApodData | null>(null)
  const [archive, setArchive] = useState<ApodData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    // Fetch today's APOD + the last 6 days in parallel so we can show
    // an archive strip without a UI switch.
    const archivePromises = Array.from({ length: 6 }, (_, i) => {
      // compute "today - i days" relative to today (in UTC)
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - (i + 1))
      return fetchApod(d.toISOString().slice(0, 10)).catch(() => null)
    })
    fetchApod()
      .then(async (d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
        const setM = useClimateStore.getState().setMeasurement
        setM('apod_title', d.title)
        setM('apod_date', d.date)
        setM('media_type', d.media_type)
        if (d.copyright) setM('copyright', d.copyright)
        const obj = guessSkyObject(d.title)
        if (obj) setM('sky_object', obj)

        const arch = (await Promise.all(archivePromises)).filter((x): x is ApodData => x !== null)
        if (!cancelled) setArchive(arch)
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

  const skyObj = data ? guessSkyObject(data.title) : null
  // APOD sequence number (rough — APOD started 1995-06-16; days since then)
  const seq = data
    ? Math.floor((Date.parse(data.date) - Date.UTC(1995, 5, 16)) / 86400000) + 1
    : 0

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Astronomy Picture of the Day — {data?.date ?? '…'}</h2>
          <p className="cli-sub">NASA APOD · daily since 16 Jun 1995 · #{seq.toLocaleString()}</p>
        </div>
      </header>

      {loading && <div className="cli-loading">Fetching today's APOD…</div>}
      {error && <div className="cli-error">NASA APOD unreachable: {error}</div>}

      {data && (
        <>
          <section className="cli-img-frame">
            {data.media_type === 'image' ? (
              <img src={data.hdurl ?? data.url} alt={data.title} className="cli-img" loading="lazy" />
            ) : (
              <div className="cli-apod-video" style={{ padding: 'var(--space-6)' }}>
                <a href={data.url} target="_blank" rel="noreferrer" style={{ color: 'var(--ws-climate, #0EA5E9)', fontWeight: 600 }}>
                  Watch today's video ↗
                </a>
              </div>
            )}
            <span className="cli-img-badge">{data.date}</span>
            <span className="cli-img-badge right">{data.media_type.toUpperCase()}</span>
          </section>

          <section className="cli-stat-strip">
            <StatCard
              label="Date"
              value={data.date}
              icon="apod"
              tone="info"
              sub={`APOD sequence #${seq.toLocaleString()}`}
            />
            <StatCard
              label="Sky object"
              value={skyObj ?? 'Not catalogued'}
              icon="compass"
              tone={skyObj ? 'good' : 'neutral'}
              sub={skyObj ? 'Inferred from title' : 'Title doesn’t match known objects'}
            />
            <StatCard
              label="Copyright"
              value={data.copyright ?? 'Public domain'}
              icon="leaf"
              tone={data.copyright ? 'info' : 'good'}
              sub={data.copyright ? 'Credit per NASA APOD' : 'Most APODs are PD'}
            />
          </section>

          <section className="cli-img-caption">
            <p className="cli-img-caption-title">{data.title}</p>
            <p className="cli-img-caption-sub">{data.date}</p>
            <p className="cli-hero-caption" style={{ marginTop: 12 }}>{data.explanation}</p>
            {data.copyright && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                © {data.copyright}
              </p>
            )}
          </section>

          {archive.length > 0 && (
            <section className="cli-section">
              <div className="cli-section-head">
                <h3 className="cli-section-title">Last 6 days</h3>
              </div>
              <div className="cli-thumb-strip">
                {archive.map((apod) => (
                  <a
                    key={apod.date}
                    href={apod.url}
                    target="_blank"
                    rel="noreferrer"
                    className="cli-thumb"
                  >
                    {apod.media_type === 'image' ? (
                      <img src={apod.url} alt={apod.title} className="cli-thumb-img" loading="lazy" />
                    ) : (
                      <div
                        className="cli-thumb-img"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          background: 'var(--bg-inverse)',
                        }}
                      >
                        ▶ video
                      </div>
                    )}
                    <span className="cli-thumb-date">{apod.date}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <footer className="cli-foot">
            <span className="cli-formula-chip">
              <span className="cli-formula-chip-symbol">APOD</span>
              <span className="cli-formula-chip-meaning">Astronomy Picture of the Day · daily since 1995</span>
            </span>
            <a className="cli-source-link" href="https://apod.nasa.gov" target="_blank" rel="noreferrer">
              apod.nasa.gov ↗
            </a>
          </footer>
        </>
      )}
    </div>
  )
}