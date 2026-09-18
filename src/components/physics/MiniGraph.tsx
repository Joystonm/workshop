// Tiny time-series chart rendered on its own <canvas>. Used in the right
// panel to show the most recent history of the experiment's yKey.

import { useEffect, useRef } from 'react'
import { usePhysicsStore } from '../../lib/physics/store'
import { EXPERIMENTS_BY_ID } from '../../lib/physics/experiments'

interface MiniGraphProps {
  height?: number
  yLabel?: string
}

export function MiniGraph({ height = 120, yLabel }: MiniGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    let cancelled = false

    const resize = () => {
      const r = container.getBoundingClientRect()
      const w = Math.max(40, Math.floor(r.width))
      const h = height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let raf = 0
    const draw = () => {
      if (cancelled) return
      const s = usePhysicsStore.getState()
      const id = s.experimentId
      if (id) {
        const expt = EXPERIMENTS_BY_ID[id]
        const r = container.getBoundingClientRect()
        const w = Math.max(40, Math.floor(r.width))
        const h = height
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)
        // Background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = '#E4E4E7'
        ctx.lineWidth = 1
        ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
        // Title
        ctx.fillStyle = '#52525B'
        ctx.font = '10px ui-monospace, monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${yLabel ?? expt.graphAxes.yLabel} vs t`, 6, 4)
        // Find y range
        const hist = s.history
        if (hist.length > 1) {
          let yMin = Infinity
          let yMax = -Infinity
          for (const p of hist) {
            if (p.y < yMin) yMin = p.y
            if (p.y > yMax) yMax = p.y
          }
          if (yMin === yMax) {
            yMin -= 1
            yMax += 1
          } else {
            const pad = (yMax - yMin) * 0.1
            yMin -= pad
            yMax += pad
          }
          // Grid lines
          ctx.strokeStyle = 'rgba(0,0,0,0.06)'
          ctx.lineWidth = 1
          for (let i = 1; i < 4; i++) {
            const y = (h * i) / 4
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(w, y)
            ctx.stroke()
          }
          // Line
          const tMin = hist[0].t
          const tMax = hist[hist.length - 1].t
          const tRange = Math.max(1e-6, tMax - tMin)
          ctx.strokeStyle = '#2563EB'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let i = 0; i < hist.length; i++) {
            const p = hist[i]
            const px = ((p.t - tMin) / tRange) * w
            const py = h - ((p.y - yMin) / (yMax - yMin)) * h
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
          // Axis labels
          ctx.fillStyle = '#A1A1AA'
          ctx.font = '9px ui-monospace, monospace'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'bottom'
          ctx.fillText(yMax.toFixed(2), 4, 12)
          ctx.textAlign = 'right'
          ctx.textBaseline = 'top'
          ctx.fillText(yMin.toFixed(2), w - 4, h - 10)
        } else {
          ctx.fillStyle = '#A1A1AA'
          ctx.font = '11px ui-sans-serif, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('Press Run to start', w / 2, h / 2)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [height, yLabel])

  return (
    <div className="mini-graph" ref={containerRef}>
      <canvas ref={canvasRef} />
      <style>{`
        .mini-graph {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .mini-graph canvas { display: block; width: 100%; }
      `}</style>
    </div>
  )
}
