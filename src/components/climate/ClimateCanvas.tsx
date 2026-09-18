// Self-contained 2D canvas for the climate lab's physics scenes.
// The parent supplies a `step(dt)` callback (advances the simulation)
// and a `draw(ctx, w, h)` callback (renders it). Both are captured
// via refs so the parent can re-render freely without restarting the
// rAF loop, and the canvas owns a single rAF loop driving everything.

import React, { useEffect, useRef } from 'react'

interface Props {
  height: number
  /** Advance the simulation by `dtSeconds` of real time. Called once
   *  per animation frame. */
  step?: (dtSeconds: number) => void
  /** Render the current state. Called once per animation frame after
   *  `step`. */
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
}

export function ClimateCanvas({ height, step, draw }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // Latest callbacks are held in refs so the rAF effect runs once.
  const stepRef = useRef(step)
  const drawRef = useRef(draw)
  stepRef.current = step
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    let lastT = performance.now()

    const resize = () => {
      const r = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(r.width))
      const h = Math.max(1, Math.floor(r.height))
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now
      const r = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(r.width))
      const h = Math.max(1, Math.floor(r.height))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const s = stepRef.current
      if (s) s(dt)
      drawRef.current(ctx, w, h)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="climate-canvas"
      style={{
        width: '100%',
        height,
        background: '#0B0B12',
        borderRadius: 'var(--radius-lg, 8px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
