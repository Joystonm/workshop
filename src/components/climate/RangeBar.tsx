// Horizontal gauge — used by Air Quality to show a pollutant vs the
// WHO 2021 limit, and by Climate Trends for temperature anomalies.
//
// Props:
//   - value: current measurement
//   - domain: [min, max] for the track (e.g. [0, 250] for PM2.5 µg/m³)
//   - limit (optional): a single value where to draw a thin marker
//     line representing the threshold (e.g. WHO 2021 annual mean).
//   - tone: positive (low = good), inverse (low = bad). Default positive.

import React from 'react'

interface Props {
  value: number
  domain: [number, number]
  limit?: number
  tone?: 'positive' | 'inverse'
  fillColor?: string
}

export function RangeBar({ value, domain, limit, tone = 'positive', fillColor }: Props) {
  const [dMin, dMax] = domain
  const range = dMax - dMin || 1
  const fillPct = Math.max(0, Math.min(100, ((value - dMin) / range) * 100))
  const markerPct = limit != null ? Math.max(0, Math.min(100, ((limit - dMin) / range) * 100)) : null

  const toneColor = fillColor ?? (tone === 'positive' ? 'var(--success, #16A34A)' : 'var(--danger, #DC2626)')

  return (
    <div className="cli-rangebar" aria-hidden>
      <div className="cli-rangebar-track">
        <div className="cli-rangebar-fill" style={{ width: `${fillPct}%`, background: toneColor }} />
        {markerPct != null && (
          <div
            className="cli-rangebar-marker"
            style={{ left: `${markerPct}%` }}
            title="WHO 2021 limit"
          />
        )}
      </div>
      <div className="cli-rangebar-caption">
        <span>{dMin}</span>
        <span>{dMax}</span>
      </div>
    </div>
  )
}