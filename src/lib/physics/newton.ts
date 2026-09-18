// Newton's 2nd law: a = F/m.
// A block on a frictionless surface is pushed by a constant net force F.
// Measures acceleration directly as a = F/m and shows v(t) = v₀ + a·t.

import { Experiment, ParamDef } from './experiments'
import { rk2Step } from './engine'
import { drawNewton } from './draw2d'

const params: ParamDef[] = [
  { key: 'F', label: 'Net force F', min: -50, max: 50, step: 0.5, default: 12, unit: 'N' },
  { key: 'm', label: 'Mass m', min: 0.1, max: 10, step: 0.1, default: 2.0, unit: 'kg' },
  { key: 'v0', label: 'Initial velocity v₀', min: -5, max: 5, step: 0.1, default: 0.0, unit: 'm/s' },
]

interface State {
  x: number; v: number
  trail: { x: number }[]
  aMeasured: number  // running estimate of a from v
  vPrev: number
  tPrev: number
  simT: number
}

const TRACK_HALF = 8

function reset(p: Record<string, number>) {
  const s: State = {
    x: 0, v: p.v0,
    trail: [],
    aMeasured: 0,
    vPrev: p.v0,
    tPrev: 0,
    simT: 0,
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const Fnet = p.F
  const a = Fnet / p.m
  const deriv = (y: State, _t: number) => ({ ...y, x: y.v, v: a })
  const next = rk2Step(s, 0, dt, deriv) as State
  next.simT = s.simT + dt
  // Numerically estimate a from velocity change
  next.aMeasured = (next.v - s.v) / Math.max(dt, 1e-6)
  next.vPrev = s.v
  next.tPrev = s.simT
  next.trail = [...s.trail, { x: next.x }].slice(-300)
  // Stop at the track ends — no bouncing. The block holds position
  // until the user changes the force or resets.
  if (next.x > TRACK_HALF) { next.x = TRACK_HALF; next.v = 0 }
  if (next.x < -TRACK_HALF) { next.x = -TRACK_HALF; next.v = 0 }
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { x: s.x, y: s.x, v: s.v }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const Fnet = p.F
  const aTheory = Fnet / p.m
  return {
    'F net': Fnet,
    'a (theory)': aTheory,
    'a (measured)': s.aMeasured,
    speed: s.v,
    p: p.m * s.v,
    KE: 0.5 * p.m * s.v * s.v,
  }
}

export const newtonExperiment: Experiment = {
  id: 'newton',
  title: "Newton's 2nd law",
  description: 'Pure Newton\'s 2nd law on a frictionless surface: F = m·a. Adjust F, m, v₀.',
  icon: 'newton',
  params,
  graphAxes: { yKey: 'x', yLabel: 'x (m)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawNewton(ctx, state as State, params, width, height, TRACK_HALF)
  },
}
