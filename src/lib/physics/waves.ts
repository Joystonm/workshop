// Transverse wave on a string: superposition of two sine waves
// travelling in opposite directions producing a standing wave.
// State: array of y-displacements y(x) over N sample points.
// This is a *visualisation* of the wave equation; the displacement at
// each x is computed analytically each frame, then drawn.
//
//   y(x, t) = A·sin(kx - ωt) + A·sin(kx + ωt + φ)
//   = 2A·cos(ωt - φ/2)·sin(kx + φ/2)    [standing wave]
// We can also drive a single travelling wave or two counter-propagating
// waves with different frequencies (beats).

import { Experiment, ParamDef } from './experiments'
import { drawWaves } from './draw2d'

const params: ParamDef[] = [
  { key: 'A', label: 'Amplitude', min: 0, max: 1, step: 0.01, default: 0.4, unit: 'm' },
  { key: 'lambda', label: 'Wavelength', min: 0.5, max: 8, step: 0.1, default: 3.0, unit: 'm' },
  { key: 'f', label: 'Frequency', min: 0.1, max: 3, step: 0.05, default: 0.6, unit: 'Hz' },
  { key: 'mode', label: 'Mode (0=travel, 1=stand, 2=beats)', min: 0, max: 2, step: 1, default: 1, unit: '' },
  { key: 'damping', label: 'Damping', min: 0, max: 1, step: 0.01, default: 0.0, unit: '1/s' },
]

interface State {
  t: number
  A: number
  lambda: number
  f: number
  mode: number
  damping: number
  currentWave: number[]   // last rendered y values across N points
  nodes: number[]         // node positions
}

const N = 200  // number of points along the string

function reset(p: Record<string, number>) {
  const s: State = {
    t: 0,
    A: p.A,
    lambda: p.lambda,
    f: p.f,
    mode: Math.round(p.mode),
    damping: p.damping,
    currentWave: new Array(N).fill(0),
    nodes: [],
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const next: State = { ...s, t: s.t + dt }
  next.A = p.A * Math.exp(-p.damping * s.t)
  next.lambda = p.lambda
  next.f = p.f
  next.mode = Math.round(p.mode)
  // Compute the wave displacement at each point
  const k = (2 * Math.PI) / next.lambda
  const omega = 2 * Math.PI * next.f
  const L = 10
  const yvals: number[] = []
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * L
    let y = 0
    if (next.mode === 0) {
      // Single travelling wave
      y = next.A * Math.sin(k * x - omega * next.t)
    } else if (next.mode === 1) {
      // Standing wave: y = 2A·cos(ωt)·sin(kx)
      y = 2 * next.A * Math.cos(omega * next.t) * Math.sin(k * x)
    } else {
      // Beats: two waves with slightly different frequencies
      const f2 = next.f * 1.18
      const omega2 = 2 * Math.PI * f2
      y = next.A * (Math.sin(k * x - omega * next.t) + Math.sin(k * x - omega2 * next.t))
    }
    yvals.push(y)
  }
  next.currentWave = yvals
  // Compute node positions (zero-crossings) for standing wave
  if (next.mode === 1) {
    const nodes: number[] = []
    for (let i = 1; i < N; i++) {
      if (Math.sign(yvals[i]) !== Math.sign(yvals[i - 1]) && Math.abs(yvals[i] - yvals[i - 1]) < 0.1) {
        nodes.push((i / (N - 1)) * L)
      }
    }
    next.nodes = nodes
  } else {
    next.nodes = []
  }
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { y: s.currentWave[Math.floor(s.currentWave.length / 2)] || 0, v: 0 }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const v_wave = p.f * p.lambda  // wave speed v = fλ
  const maxY = Math.max(...s.currentWave.map(Math.abs))
  return {
    'wave speed v': v_wave,
    'ω (rad/s)': 2 * Math.PI * p.f,
    'k (rad/m)': (2 * Math.PI) / p.lambda,
    'max |y|': maxY,
    'nodes (standing)': s.nodes.length,
  }
}

export const wavesExperiment: Experiment = {
  id: 'waves',
  title: 'Waves',
  description: 'Transverse wave on a string. See travelling, standing, and beat patterns.',
  icon: 'waves',
  params,
  graphAxes: { yKey: 'y', yLabel: 'y (m)' },
  reset,
  step,
  passive: true,
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawWaves(ctx, state as State, width, height)
  },
}
