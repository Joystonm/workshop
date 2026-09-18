// Canvas 2D mini-graph for the chemistry lab. Mirrors physics MiniGraph.

import { useEffect, useRef } from 'react'
import { useChemistryStore } from '../../lib/chemistry/store'
import { EXPERIMENTS_BY_ID, ExperimentId } from '../../lib/chemistry/experiments'

interface ChemistryGraphProps {
  height?: number
}

export function ChemistryGraph({ height = 140 }: ChemistryGraphProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const history = useChemistryStore((s) => s.history)
  const experimentId = useChemistryStore((s) => s.experimentId)
  const measurements = useChemistryStore((s) => s.measurements)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = height
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    if (history.length < 2) {
      ctx.fillStyle = 'var(--text-muted)'
      ctx.font = '11px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Waiting for data…', w / 2, h / 2)
      return
    }

    const exp = experimentId ? EXPERIMENTS_BY_ID[experimentId as ExperimentId] : null
    const yLabel = exp?.graphAxes.yLabel ?? 'y'
    const yKey = exp?.graphAxes.yKey ?? 'y'

    const ys = history.map((s) => (yKey === 'pH' || yKey === 'temperature' ? s.y : s.y))
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    if (yMax - yMin < 1e-9) { yMax = yMin + 1; yMin = yMin - 1 }
    // Add a 10% margin top/bottom.
    const pad = (yMax - yMin) * 0.1
    yMin -= pad
    yMax += pad

    const tMin = history[0].t
    const tMax = history[history.length - 1].t
    const tRange = Math.max(tMax - tMin, 1e-6)

    // Axes.
    ctx.strokeStyle = 'rgba(0,0,0,0.10)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(36, 8)
    ctx.lineTo(36, h - 24)
    ctx.lineTo(w - 8, h - 24)
    ctx.stroke()

    // Y axis labels.
    ctx.fillStyle = 'var(--text-muted)'
    ctx.font = '10px ui-sans-serif, system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(yMax.toFixed(2), 32, 12)
    ctx.fillText(yMin.toFixed(2), 32, h - 26)

    // X axis labels.
    ctx.textAlign = 'left'
    ctx.fillText(tMin.toFixed(1), 38, h - 10)
    ctx.textAlign = 'right'
    ctx.fillText(tMax.toFixed(1), w - 8, h - 10)

    // Series line.
    ctx.strokeStyle = 'var(--ws-chemistry)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    history.forEach((s, i) => {
      const x = 36 + ((s.t - tMin) / tRange) * (w - 36 - 12)
      const y = h - 24 - ((s.y - yMin) / (yMax - yMin)) * (h - 24 - 8)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Title.
    ctx.fillStyle = 'var(--text-muted)'
    ctx.font = '10px ui-sans-serif, system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`${yLabel} (current = ${history[history.length - 1].y.toFixed(2)})`, 38, 12)
  }, [history, experimentId, height, measurements])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height, display: 'block' }}
    />
  )
}
