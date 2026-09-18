// Reusable 2D canvas that drives a physics experiment's rAF loop and
// dispatches ticks into the physics store. Each experiment supplies a
// `draw` function and reads its state from the store via subscription.

import { useEffect, useRef } from 'react'
import { usePhysicsStore } from '../../lib/physics/store'
import { EXPERIMENTS_BY_ID } from '../../lib/physics/experiments'
import { drawGrid } from '../../lib/physics/draw2d'

interface Canvas2DViewProps {
  // Optional override draw function (defaults to the active experiment's draw).
  overrideDraw?: import('../../lib/physics/experiments').DrawFn
}

export function Canvas2DView({ overrideDraw }: Canvas2DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 })

  // Drive the simulation. We re-create the rAF loop on every state change
  // so the closure captures the latest store state.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    let lastT = performance.now()

    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(r.width))
      const h = Math.max(1, Math.floor(r.height))
      sizeRef.current = { w, h, dpr }
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    })
    ro.observe(container)

    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - lastT) / 1000)
      lastT = now
      // Tick the store: advances the active experiment.
      // For passive experiments (Hooke, Waves) we also want to drive the
      // simulation even when the user hasn't pressed Run, so the visual
      // animates with parameter changes.
      const s0 = usePhysicsStore.getState()
      const id0 = s0.experimentId
      const expt0 = id0 ? EXPERIMENTS_BY_ID[id0] : null
      if (s0.running || expt0?.passive) {
        usePhysicsStore.getState().tick(dt)
      }
      // Read latest values and draw.
      const s = usePhysicsStore.getState()
      const id = s.experimentId
      if (id) {
        const expt = EXPERIMENTS_BY_ID[id]
        const { w, h, dpr } = sizeRef.current
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)
        // Subtle background grid
        drawGrid(ctx, w, h, 40)
        // Delegate to the experiment's draw routine
        const draw = overrideDraw ?? expt.draw
        draw(ctx, s.state, s.params, w, h)
        // Watermark
        ctx.fillStyle = 'rgba(82, 82, 91, 0.6)'
        ctx.font = '10px ui-monospace, monospace'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText(expt.title, w - 8, 6)
        ctx.fillText(`t = ${s.t.toFixed(2)} s`, w - 8, 20)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [overrideDraw])

  return (
    <div className="canvas2d-view" ref={containerRef}>
      <canvas ref={canvasRef} />
      <style>{`
        .canvas2d-view {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          overflow: hidden;
        }
        .canvas2d-view canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}
