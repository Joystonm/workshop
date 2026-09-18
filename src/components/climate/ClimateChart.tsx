// Reusable SVG chart with hover crosshair + tooltip.
// Supports four chart types — line, area, bar, scatter — and an
// arbitrary number of horizontal reference lines (zero, baseline, etc.).
// Self-sizing, theme-aware (uses --ws-climate for the default stroke).

import React, { useMemo, useState } from 'react'

export interface ChartDatum {
  x: number
  y: number
  label?: string
  meta?: Record<string, string | number>
}

export interface ReferenceLine {
  y: number
  label?: string
  color?: string
  dashed?: boolean
}

interface Props {
  type: 'line' | 'area' | 'bar' | 'scatter'
  data: ChartDatum[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  yLabel?: string
  xLabels?: string[]
  referenceLines?: ReferenceLine[]
  yDomain?: [number, number]
  formatY?: (v: number) => string
  formatX?: (v: number, i: number) => string
  /** Scatter: extra dimensional encoding (size, color). */
  pointSize?: (d: ChartDatum) => number
  pointColor?: (d: ChartDatum) => string
  /** Optional tooltip formatter. Defaults to label/y. */
  tooltip?: (d: ChartDatum) => React.ReactNode
}

const PAD_L = 44
const PAD_R = 16
const PAD_T = 16
const PAD_B = 24

export function ClimateChart({
  type,
  data,
  width = 720,
  height = 220,
  color = '#0EA5E9',
  fillColor,
  yLabel,
  xLabels,
  referenceLines,
  yDomain,
  formatY = (v) => v.toFixed(1),
  formatX,
  pointSize,
  pointColor,
  tooltip,
}: Props) {
  const [hover, setHover] = useState<number | null>(null)

  const { xMin, xMax, yMin, yMax, plotW, plotH } = useMemo(() => {
    const xs = data.map((d) => d.x)
    const ys = data.map((d) => d.y)
    const xMin = xs.length ? Math.min(...xs) : 0
    const xMax = xs.length ? Math.max(...xs) : 1
    const yMin0 = ys.length ? Math.min(...ys, 0) : 0
    const yMax0 = ys.length ? Math.max(...ys) : 1
    const pad = (yMax0 - yMin0) * 0.1 || 1
    return {
      xMin,
      xMax,
      yMin: yDomain?.[0] ?? yMin0 - pad,
      yMax: yDomain?.[1] ?? yMax0 + pad,
      plotW: width - PAD_L - PAD_R,
      plotH: height - PAD_T - PAD_B,
    }
  }, [data, width, height, yDomain])

  const sx = (x: number) => PAD_L + ((x - xMin) / Math.max(0.0001, xMax - xMin)) * plotW
  const sy = (y: number) => PAD_T + (1 - (y - yMin) / Math.max(0.0001, yMax - yMin)) * plotH

  // Tick lines: 4 evenly spaced horizontal gridlines
  const yTicks = useMemo(() => {
    const n = 4
    const out: number[] = []
    for (let i = 0; i <= n; i++) out.push(yMin + ((yMax - yMin) * i) / n)
    return out
  }, [yMin, yMax])

  // X-axis labels (cap at 7 to avoid overlap)
  const xTickIdxs = useMemo(() => {
    if (xLabels && xLabels.length > 0) {
      const n = Math.min(xLabels.length, 7)
      const step = Math.max(1, Math.floor((xLabels.length - 1) / (n - 1)))
      const out: number[] = []
      for (let i = 0; i < xLabels.length; i += step) out.push(i)
      if (out[out.length - 1] !== xLabels.length - 1) out.push(xLabels.length - 1)
      return out
    }
    return data.length > 0 ? [0, Math.floor(data.length / 2), data.length - 1] : []
  }, [xLabels, data.length])

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (data.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * width
    // Find nearest data point by x
    let nearest = 0
    let bestDist = Infinity
    for (let i = 0; i < data.length; i++) {
      const dx = Math.abs(sx(data[i].x) - px)
      if (dx < bestDist) {
        bestDist = dx
        nearest = i
      }
    }
    setHover(nearest)
  }

  const hoverDatum = hover != null ? data[hover] : null
  const hoverMeta = hoverDatum ? (xLabels?.[hover] ?? (formatX ? formatX(hoverDatum.x, hover) : '')) : ''

  const fill = fillColor ?? color
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.x).toFixed(1)},${sy(d.y).toFixed(1)}`).join(' ')
  const areaPath =
    data.length > 1
      ? `${linePath} L ${sx(data[data.length - 1].x).toFixed(1)},${sy(yMin).toFixed(1)} L ${sx(data[0].x).toFixed(1)},${sy(yMin).toFixed(1)} Z`
      : ''
  const barW = data.length > 0 ? Math.max(2, plotW / data.length - 4) : 0

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block', cursor: 'crosshair' }}
      >
        {/* Gridlines */}
        {yTicks.map((tv, i) => (
          <line
            key={`g${i}`}
            x1={PAD_L}
            x2={width - PAD_R}
            y1={sy(tv)}
            y2={sy(tv)}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line x1={PAD_L} x2={width - PAD_R} y1={height - PAD_B} y2={height - PAD_B} stroke="var(--border-default)" />
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={height - PAD_B} stroke="var(--border-default)" />

        {/* Y tick labels */}
        {yTicks.map((tv, i) => (
          <text
            key={`yt${i}`}
            x={PAD_L - 6}
            y={sy(tv) + 3}
            fontSize={10}
            fill="var(--text-muted)"
            textAnchor="end"
            fontFamily="var(--font-mono, ui-monospace, SFMono-Regular, monospace)"
          >
            {formatY(tv)}
          </text>
        ))}

        {/* Y axis label */}
        {yLabel && (
          <text
            x={12}
            y={PAD_T + plotH / 2}
            fontSize={9}
            fill="var(--text-muted)"
            textAnchor="middle"
            transform={`rotate(-90, 12, ${PAD_T + plotH / 2})`}
          >
            {yLabel}
          </text>
        )}

        {/* X tick labels */}
        {xTickIdxs.map((i) => {
          const label = xLabels ? xLabels[i] : formatX ? formatX(data[i]?.x ?? 0, i) : ''
          const xPos = data[i] ? sx(data[i].x) : PAD_L
          return (
            <text
              key={`xt${i}`}
              x={xPos}
              y={height - PAD_B + 14}
              fontSize={10}
              fill="var(--text-muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono, ui-monospace, SFMono-Regular, monospace)"
            >
              {label}
            </text>
          )
        })}

        {/* Reference lines */}
        {referenceLines?.map((r, i) => (
          <g key={`ref${i}`}>
            <line
              x1={PAD_L}
              x2={width - PAD_R}
              y1={sy(r.y)}
              y2={sy(r.y)}
              stroke={r.color ?? 'var(--text-muted)'}
              strokeDasharray={r.dashed ? '4 4' : undefined}
              strokeWidth={1}
            />
            {r.label && (
              <text
                x={width - PAD_R - 4}
                y={sy(r.y) - 4}
                fontSize={9}
                fill={r.color ?? 'var(--text-muted)'}
                textAnchor="end"
                fontFamily="var(--font-mono, ui-monospace, SFMono-Regular, monospace)"
              >
                {r.label}
              </text>
            )}
          </g>
        ))}

        {/* Series */}
        {type === 'area' && areaPath && <path d={areaPath} fill={fill} fillOpacity={0.18} />}
        {(type === 'line' || type === 'area') && linePath && (
          <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        )}

        {type === 'bar' &&
          data.map((d, i) => (
            <rect
              key={`bar${i}`}
              x={sx(d.x) - barW / 2}
              y={sy(Math.max(yMin, d.y))}
              width={barW}
              height={Math.abs(sy(d.y) - sy(yMin))}
              fill={color}
              opacity={0.85}
              rx={2}
            />
          ))}

        {type === 'scatter' &&
          data.map((d, i) => {
            const r = pointSize ? pointSize(d) : 4
            const c = pointColor ? pointColor(d) : color
            return <circle key={`pt${i}`} cx={sx(d.x)} cy={sy(d.y)} r={r} fill={c} opacity={0.75} />
          })}

        {/* Hover crosshair */}
        {hoverDatum && (
          <g>
            <line
              x1={sx(hoverDatum.x)}
              x2={sx(hoverDatum.x)}
              y1={PAD_T}
              y2={height - PAD_B}
              stroke="var(--text-secondary)"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.5}
            />
            <circle cx={sx(hoverDatum.x)} cy={sy(hoverDatum.y)} r={5} fill="white" stroke={color} strokeWidth={2} />
          </g>
        )}
      </svg>

      {hoverDatum && (
        <div
          style={{
            position: 'absolute',
            left: `calc(${(sx(hoverDatum.x) / width) * 100}% + 12px)`,
            top: 8,
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 5,
            transform: 'translateY(0)',
            maxWidth: 280,
          }}
        >
          {tooltip
            ? tooltip(hoverDatum)
            : (
              <div>
                {hoverMeta && <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2 }}>{hoverMeta}</div>}
                <div>
                  <strong>{formatY(hoverDatum.y)}</strong>
                  {yLabel ? <span style={{ color: 'var(--text-muted)' }}> {yLabel}</span> : null}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}