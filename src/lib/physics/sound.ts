// Longitudinal sound wave in a tube of air.
// Models pressure variation along the tube axis:
//
//   p(x, t) = p₀ + A · sin(k·x − ω·t)
//
// Visualised two ways:
//   1. The tube is drawn horizontally with vertical coloured stripes whose
//      density encodes the instantaneous pressure — dense stripes mean a
//      compression, sparse stripes mean a rarefaction.
//   2. A pressure-vs-position line plot directly below shows the wave shape.
//
// Passive: the visual is driven by the parameters alone, no time integration.

import { Experiment, ParamDef } from './experiments'

const params: ParamDef[] = [
  { key: 'A', label: 'Amplitude', min: 0, max: 1, step: 0.01, default: 0.4, unit: 'Pa' },
  { key: 'f', label: 'Frequency', min: 50, max: 2000, step: 10, default: 440, unit: 'Hz' },
  { key: 'lambda', label: 'Wavelength', min: 0.1, max: 4, step: 0.05, default: 0.78, unit: 'm' },
  { key: 'v', label: 'Speed of sound', min: 200, max: 1500, step: 10, default: 343, unit: 'm/s' },
]

interface State {
  t: number
  A: number
  f: number
  lambda: number
  v: number
  // Pre-sampled pressure values along the tube (length N), so draw is cheap.
  pressure: number[]
}

const N = 240  // sample points along the tube
const TUBE_LEN = 4  // metres shown
// Slow the animation so the wave shape is actually visible. Real-time at
// 440 Hz scrolls too fast to read — divide the incoming dt by 200.
const TIME_SCALE = 0.005

function reset(p: Record<string, number>) {
  const s: State = {
    t: 0,
    A: p.A,
    f: p.f,
    lambda: p.lambda,
    v: p.v,
    pressure: new Array(N).fill(0),
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const next: State = { ...s, t: s.t + dt * TIME_SCALE }
  next.A = p.A
  next.f = p.f
  next.lambda = p.lambda
  next.v = p.v
  // p(x,t) = A·sin(kx − ωt)
  const k = (2 * Math.PI) / next.lambda
  const omega = 2 * Math.PI * next.f
  const pressure: number[] = []
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * TUBE_LEN
    pressure.push(next.A * Math.sin(k * x - omega * next.t))
  }
  next.pressure = pressure
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { y: s.pressure[Math.floor(s.pressure.length / 2)] || 0, v: 0 }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const waveSpeed = p.f * p.lambda
  // Period & period-related beat quantity would go here if we had two
  // sources — we don't, so report the basic kinematic quantities.
  return {
    'period T (s)': 1 / p.f,
    'ω (rad/s)': 2 * Math.PI * p.f,
    'k (rad/m)': (2 * Math.PI) / p.lambda,
    'computed v (m/s)': waveSpeed,
    'p₀ max |p| (Pa)': Math.max(...s.pressure.map(Math.abs)),
  }
}

export const soundExperiment: Experiment = {
  id: 'sound',
  title: 'Sound Waves',
  description: 'Longitudinal pressure wave in a tube. Compressions travel at the speed of sound.',
  icon: 'sound',
  params,
  graphAxes: { yKey: 'y', yLabel: 'p (Pa)' },
  reset,
  step,
  passive: true,
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    const s = state as State
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const p = params as Record<string, number>

    // ─── Tube visualisation (top 60%) ────────────────────────────────
    const tubeTop = 60
    const tubeH = Math.min(height * 0.45, 220)
    const tubeLeft = 60
    const tubeRight = width - 60
    const tubeW = tubeRight - tubeLeft

    // Tube outline
    ctx.fillStyle = '#F4F4F5'
    ctx.fillRect(tubeLeft, tubeTop, tubeW, tubeH)
    ctx.strokeStyle = '#52525B'
    ctx.lineWidth = 2
    ctx.strokeRect(tubeLeft, tubeTop, tubeW, tubeH)

    // Pressure stripes (vertical bars whose spacing encodes compression density)
    const Np = s.pressure.length
    const stripeStep = tubeW / Np
    for (let i = 0; i < Np; i++) {
      const px = tubeLeft + i * stripeStep
      // Density: more saturated where |p| is large.
      const mag = Math.abs(s.pressure[i])
      const hue = s.pressure[i] >= 0 ? 210 : 30 // blue = compression, orange = rarefaction
      const sat = 30 + mag * 60
      const light = 92 - mag * 25
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`
      ctx.fillRect(px, tubeTop, stripeStep + 1, tubeH)
    }
    // Tube outline re-stroke on top so it stays crisp
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 2
    ctx.strokeRect(tubeLeft, tubeTop, tubeW, tubeH)

    // Source piston (left) — small blue rectangle that pulses
    const pistonW = 12
    const pistonX = tubeLeft - pistonW - 2
    const omega = 2 * Math.PI * p.f
    const pistonOffset = (s.pressure[0] || 0) * 30
    ctx.fillStyle = '#2563EB'
    ctx.fillRect(pistonX, tubeTop + tubeH / 2 - 18 - pistonOffset, pistonW, 36)
    ctx.strokeStyle = '#1D4ED8'
    ctx.lineWidth = 1.5
    ctx.strokeRect(pistonX, tubeTop + tubeH / 2 - 18 - pistonOffset, pistonW, 36)

    // Open end indicator (right)
    ctx.strokeStyle = '#52525B'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(tubeRight, tubeTop + 6)
    ctx.lineTo(tubeRight, tubeTop + tubeH - 6)
    ctx.stroke()
    ctx.setLineDash([])

    // Tube label
    ctx.fillStyle = '#52525B'
    ctx.font = '11px ui-monospace, monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Tube (air)', tubeLeft, tubeTop - 16)
    ctx.textAlign = 'right'
    ctx.fillText('open →', tubeRight, tubeTop - 16)

    // ─── Pressure-vs-position plot (bottom 35%) ──────────────────────
    const plotX = tubeLeft
    const plotY = tubeTop + tubeH + 40
    const plotW = tubeW
    const plotH = height - plotY - 30
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 1
    ctx.strokeRect(plotX, plotY, plotW, plotH)

    // Axis labels
    ctx.fillStyle = '#52525B'
    ctx.font = '10px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('position x (m)', plotX + plotW / 2, plotY + plotH + 6)
    ctx.save()
    ctx.translate(plotX - 8, plotY + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('pressure p (Pa)', 0, 0)
    ctx.restore()

    // Zero line
    const cy = plotY + plotH / 2
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(plotX, cy)
    ctx.lineTo(plotX + plotW, cy)
    ctx.stroke()
    ctx.setLineDash([])

    // Pressure curve
    const amp = Math.max(p.A, 0.05)
    ctx.strokeStyle = '#2563EB'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < Np; i++) {
      const x = plotX + (i / (Np - 1)) * plotW
      const y = cy - (s.pressure[i] / amp) * (plotH / 2 - 6)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Compression / rarefaction markers along curve
    for (let i = 0; i < Np - 1; i++) {
      const a = s.pressure[i], b = s.pressure[i + 1]
      // local maxima (compressions) and minima (rarefactions)
      if (a > 0.7 * amp && a >= b && a >= (s.pressure[i - 1] ?? -Infinity)) {
        const x = plotX + (i / (Np - 1)) * plotW
        ctx.fillStyle = '#1D4ED8'
        ctx.beginPath()
        ctx.arc(x, cy - (a / amp) * (plotH / 2 - 6), 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (a < -0.7 * amp && a <= b && a <= (s.pressure[i - 1] ?? Infinity)) {
        const x = plotX + (i / (Np - 1)) * plotW
        ctx.fillStyle = '#D97706'
        ctx.beginPath()
        ctx.arc(x, cy - (a / amp) * (plotH / 2 - 6), 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Title block
    ctx.fillStyle = '#18181B'
    ctx.font = 'bold 16px ui-monospace, monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('p(x,t) = A·sin(kx − ωt)', 60, 14)
    ctx.fillStyle = '#52525B'
    ctx.font = '11px ui-sans-serif, system-ui'
    ctx.fillText('Sound wave — pressure oscillates along the tube', 60, 36)

    // Live readouts (top-right)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#52525B'
    ctx.font = '11px ui-monospace, monospace'
    ctx.fillText(`f = ${p.f.toFixed(0)} Hz`, width - 60, 14)
    ctx.fillText(`λ = ${p.lambda.toFixed(2)} m`, width - 60, 30)
    ctx.fillText(`v = ${(p.f * p.lambda).toFixed(1)} m/s`, width - 60, 46)
  },
}
