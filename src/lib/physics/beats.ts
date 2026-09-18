// Beat frequencies — superposition of two sinusoids of close but unequal
// frequency. The result is a carrier wave at the average frequency whose
// amplitude is modulated by an envelope at the beat frequency:
//
//   y₁(t) = A·sin(2π·f₁·t)
//   y₂(t) = A·sin(2π·f₂·t)
//   y(t)  = y₁ + y₂
//         = 2A·cos(2π·(f₁−f₂)/2 · t) · sin(2π·(f₁+f₂)/2 · t)
//
// f_avg = (f₁+f₂)/2   — the carrier frequency the ear hears
// f_beat = |f₁−f₂|    — the rate at which amplitude rises & falls
//
// Visualisation: top plot shows each source wave separately, bottom plot
// shows their sum with the beat envelope overlaid so the slow modulation
// is obvious.

import { Experiment, ParamDef } from './experiments'

const params: ParamDef[] = [
  { key: 'f1', label: 'Frequency f₁', min: 50, max: 1000, step: 1, default: 440, unit: 'Hz' },
  { key: 'f2', label: 'Frequency f₂', min: 50, max: 1000, step: 1, default: 444, unit: 'Hz' },
  { key: 'A', label: 'Amplitude', min: 0.05, max: 1, step: 0.05, default: 0.5, unit: '' },
  { key: 'window', label: 'Time window', min: 0.02, max: 1, step: 0.01, default: 0.2, unit: 's' },
]

interface State {
  t: number
  f1: number
  f2: number
  A: number
  window: number
  // Pre-sampled values over one frame so draw is cheap.
  y1: number[]
  y2: number[]
  ySum: number[]
  envelope: number[]
}

const N = 320
// Slow the animation so the carrier wave + beat envelope are readable.
// At real-time speed, 440 Hz scrolls too quickly to inspect.
const TIME_SCALE = 0.005

function reset(p: Record<string, number>) {
  const s: State = {
    t: 0,
    f1: p.f1,
    f2: p.f2,
    A: p.A,
    window: p.window,
    y1: new Array(N).fill(0),
    y2: new Array(N).fill(0),
    ySum: new Array(N).fill(0),
    envelope: new Array(N).fill(0),
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const next: State = { ...s, t: s.t + dt * TIME_SCALE }
  next.f1 = p.f1
  next.f2 = p.f2
  next.A = p.A
  next.window = p.window

  const fBeat = Math.abs(next.f1 - next.f2) / 2  // cos(π·f_beat·t) form

  const startT = next.t - next.window
  const y1: number[] = []
  const y2: number[] = []
  const ySum: number[] = []
  const envelope: number[] = []
  for (let i = 0; i < N; i++) {
    const ti = startT + (i / (N - 1)) * next.window
    const a1 = next.A * Math.sin(2 * Math.PI * next.f1 * ti)
    const a2 = next.A * Math.sin(2 * Math.PI * next.f2 * ti)
    y1.push(a1)
    y2.push(a2)
    ySum.push(a1 + a2)
    envelope.push(2 * next.A * Math.abs(Math.cos(2 * Math.PI * fBeat * ti)))
  }
  next.y1 = y1
  next.y2 = y2
  next.ySum = ySum
  next.envelope = envelope
  return {
    nextState: next,
    sample: sampleFrom(next),
    measurements: measurementsFrom(next),
  }
}

function sampleFrom(s: State) {
  return { y: s.ySum[Math.floor(s.ySum.length / 2)] || 0, v: 0 }
}

function measurementsFrom(s: State) {
  const fAvg = (s.f1 + s.f2) / 2
  const fBeat = Math.abs(s.f1 - s.f2)
  const beatPeriod = fBeat > 0 ? 1 / fBeat : Infinity
  return {
    'f avg (Hz)': fAvg,
    'f beat (Hz)': fBeat,
    'beat period T_b (s)': beatPeriod === Infinity ? 0 : beatPeriod,
    'envelope max': Math.max(...s.envelope),
    'p₂ − p₁': Math.abs(s.f1 - s.f2),
  }
}

export const beatsExperiment: Experiment = {
  id: 'beats',
  title: 'Beat Frequencies',
  description: 'Two close-frequency waves superpose to create a slowly modulated envelope — the "beat" you hear when tuning two instruments.',
  icon: 'beats',
  params,
  graphAxes: { yKey: 'y', yLabel: 'y (sum)' },
  reset,
  step,
  passive: true,
  render: 'canvas2d',
  draw: (ctx, state, _params: Record<string, number>, width, height) => {
    const s = state as State
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const margin = 50
    const gap = 18
    const plotH = (height - margin * 2 - gap * 2) / 3
    const w = width - margin * 2

    // Three stacked plots
    const drawAxes = (y: number, h: number, label: string) => {
      ctx.strokeStyle = '#18181B'
      ctx.lineWidth = 1
      ctx.strokeRect(margin, y, w, h)
      ctx.fillStyle = '#52525B'
      ctx.font = '10px ui-monospace, monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(label, margin + 6, y + 4)
    }

    const plotY = (i: number) => margin + i * (plotH + gap)

    // ─── Plot 1: y₁ ───
    drawAxes(plotY(0), plotH, `y₁(t) = A·sin(2π·f₁·t)`)
    drawSinusoid(ctx, s.y1, s.A, plotY(0), w, plotH, '#3B82F6')

    // ─── Plot 2: y₂ ───
    drawAxes(plotY(1), plotH, `y₂(t) = A·sin(2π·f₂·t)`)
    drawSinusoid(ctx, s.y2, s.A, plotY(1), w, plotH, '#EA580C')

    // ─── Plot 3: y₁ + y₂ + envelope ───
    drawAxes(plotY(2), plotH, `y₁ + y₂ — see envelope |2A·cos(π·(f₁−f₂)·t)|`)
    const ampScale = Math.max(s.A * 2, 0.1)
    drawSinusoid(ctx, s.ySum, ampScale, plotY(2), w, plotH, '#2563EB')

    // Envelope — upper and lower traces
    const upper: number[] = []
    const lower: number[] = []
    for (let i = 0; i < N; i++) {
      upper.push(s.envelope[i])
      lower.push(-s.envelope[i])
    }
    drawSinusoid(ctx, upper, ampScale, plotY(2), w, plotH, 'rgba(220, 38, 38, 0.6)', /*dashed*/ true)
    drawSinusoid(ctx, lower, ampScale, plotY(2), w, plotH, 'rgba(220, 38, 38, 0.6)', /*dashed*/ true)

    // Beat-period annotations on the bottom plot
    const fBeat = Math.abs(s.f1 - s.f2)
    if (fBeat > 0.1) {
      const T_b = 1 / fBeat
      ctx.fillStyle = '#DC2626'
      ctx.font = '10px ui-monospace, monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`T_b = 1/|f₁−f₂| = ${T_b.toFixed(3)} s`, margin + 8, plotY(2) + plotH - 4)
    }

    // Title
    ctx.fillStyle = '#18181B'
    ctx.font = 'bold 16px ui-monospace, monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Beats — superposition of two close tones', margin, 8)
    ctx.fillStyle = '#52525B'
    ctx.font = '11px ui-sans-serif, system-ui'
    ctx.fillText(`f₁ = ${s.f1.toFixed(0)} Hz,  f₂ = ${s.f2.toFixed(0)} Hz  →  ${Math.abs(s.f1 - s.f2).toFixed(1)} Hz beat`, margin, 28)
  },
}

function drawSinusoid(
  ctx: CanvasRenderingContext2D,
  values: number[],
  amp: number,
  plotY: number,
  w: number,
  h: number,
  color: string,
  dashed = false
) {
  const Np = values.length
  if (Np < 2) return
  const cy = plotY + h / 2
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.6
  if (dashed) ctx.setLineDash([5, 4])
  ctx.beginPath()
  for (let i = 0; i < Np; i++) {
    const x = 50 + (i / (Np - 1)) * w
    const y = cy - (values[i] / amp) * (h / 2 - 6)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
  // Zero line
  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.setLineDash([2, 4])
  ctx.beginPath()
  ctx.moveTo(50, cy)
  ctx.lineTo(50 + w, cy)
  ctx.stroke()
  ctx.restore()
}
