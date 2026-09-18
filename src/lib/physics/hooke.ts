// Hooke's law - static spring extension.
// The user applies a force F and the spring extends to x = F/k (static
// equilibrium). We animate the spring from the previous extension to the
// new one as the user changes F, showing the linear F vs x relationship.
//
// This is a *quasi-static* simulation: each frame we move the mass
// smoothly toward the new equilibrium position x = F/k.

import { Experiment, ParamDef } from './experiments'
import { drawHooke } from './draw2d'

const params: ParamDef[] = [
  { key: 'k', label: 'Spring constant k', min: 5, max: 200, step: 1, default: 50, unit: 'N/m' },
  { key: 'F', label: 'Applied force', min: 0, max: 100, step: 0.5, default: 25, unit: 'N' },
  { key: 'm', label: 'Mass', min: 0.1, max: 5, step: 0.1, default: 1.0, unit: 'kg' },
]

interface State {
  x: number         // current displayed extension (m)
  xTarget: number   // target extension (m)
  dataPoints: { F: number; x: number }[]   // collected F vs x data
  recordedMax: number  // so we can reset the data when F goes back down
}

function reset(p: Record<string, number>) {
  const xTarget = p.F / p.k
  const s: State = {
    x: 0, xTarget,
    dataPoints: [{ F: 0, x: 0 }, { F: p.F, x: xTarget }],
    recordedMax: p.F,
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const target = p.F / p.k
  // Critically-damped follow
  const next: State = { ...s, xTarget: target }
  // Track data points: when F increases past the previous max, record a new one
  if (p.F > s.recordedMax + 0.5) {
    next.recordedMax = p.F
    next.dataPoints = [...s.dataPoints, { F: p.F, x: target }]
  }
  // Smooth animation toward target
  const speed = 6
  next.x = s.x + (target - s.x) * Math.min(1, dt * speed)
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { y: s.x, x: s.x }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  // Best-fit slope through data points (or fallback to p.k)
  let kMeasured = p.k
  if (s.dataPoints.length >= 2) {
    let sx = 0, sy = 0, sxy = 0, sxx = 0
    for (const p of s.dataPoints) {
      sx += p.F; sy += p.x; sxy += p.F * p.x; sxx += p.F * p.F
    }
    const n = s.dataPoints.length
    const denom = n * sxx - sx * sx
    if (Math.abs(denom) > 1e-6) kMeasured = (n * sxy - sx * sy) / denom
  }
  const xTheory = p.F / p.k
  return {
    'x (extension)': s.x,
    'x (theory)': xTheory,
    'k (theory)': p.k,
    'k (best fit)': kMeasured,
    'PE (spring)': 0.5 * p.k * s.x * s.x,
  }
}

export const hookeExperiment: Experiment = {
  id: 'hooke',
  title: "Hooke's law",
  description: 'Apply force to a spring and watch it extend. F = kx.',
  icon: 'hooke',
  params,
  graphAxes: { yKey: 'x', yLabel: 'x (m)' },
  reset,
  step,
  passive: true,
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawHooke(ctx, state as State, params, width, height)
  },
}
