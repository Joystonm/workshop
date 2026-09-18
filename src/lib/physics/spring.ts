// Spring-mass oscillator (damped SHM).
// State: { x, v }   (x is displacement from natural length, positive = stretched).
// Equation:  d²x/dt² = -(k/m)·x - (b/m)·v
// Theoretical period: T = 2π√(m/k).

import { Experiment, ParamDef } from './experiments'
import { rk2Step } from './engine'
import { drawSpring } from './draw2d'

const params: ParamDef[] = [
  { key: 'k', label: 'Spring constant k', min: 1, max: 100, step: 0.5, default: 20, unit: 'N/m' },
  { key: 'm', label: 'Mass', min: 0.1, max: 5, step: 0.1, default: 0.5, unit: 'kg' },
  { key: 'b', label: 'Damping', min: 0, max: 1.0, step: 0.01, default: 0.05, unit: 'kg/s' },
  { key: 'x0', label: 'Initial displacement', min: -1.5, max: 1.5, step: 0.05, default: 1.0, unit: 'm' },
]

interface State {
  x: number
  v: number
  amplitude: number   // running peak |x|
  t: number
  trail: { x: number; t: number }[]
}

function reset(p: Record<string, number>) {
  const s: State = {
    x: p.x0,
    v: 0,
    amplitude: Math.abs(p.x0),
    t: 0,
    trail: [],
  }
  return {
    state: s,
    sample: sampleFrom(s),
    measurements: measurementsFrom(s, p),
  }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const k = p.k, m = p.m, b = p.b, g = p.gravity
  const deriv = (y: State, _t: number) => ({
    ...y,
    x: y.v,
    v: -(k / m) * y.x - (b / m) * y.v,
  })
  // For a vertical spring, gravity shifts the equilibrium by mg/k. We absorb
  // that by working in displacement from the *static* equilibrium so the
  // motion is pure SHM around 0, with gravity only acting on the displayed
  // position. Here we keep the model simple - horizontal.
  const next = rk2Step(s, 0, dt, deriv) as State
  next.t = s.t + dt
  next.amplitude = Math.max(s.amplitude, Math.abs(next.x))
  next.trail = [...s.trail, { x: next.x, t: next.t }].slice(-600)
  return {
    nextState: next,
    sample: sampleFrom(next),
    measurements: measurementsFrom(next, p),
  }
}

function sampleFrom(s: State) {
  return { x: s.x, v: s.v }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const T = 2 * Math.PI * Math.sqrt(p.m / p.k)
  // Damped period (under-damped): Td = 2π/ωd, ωd = √(ω0² - (b/2m)²)
  const omega0 = Math.sqrt(p.k / p.m)
  const zeta = p.b / (2 * Math.sqrt(p.k * p.m))
  const omegaD = omega0 * Math.sqrt(Math.max(0, 1 - zeta * zeta))
  const T_damped = omegaD > 0 ? (2 * Math.PI) / omegaD : T
  const KE = 0.5 * p.m * s.v * s.v
  const PE = 0.5 * p.k * s.x * s.x
  return {
    T_undamped: T,
    T_damped,
    zeta,
    amplitude: s.amplitude,
    KE,
    PE,
    E_total: KE + PE,
  }
}

export const springExperiment: Experiment = {
  id: 'spring',
  title: 'Spring / SHM',
  description: 'Mass on a spring. Adjust k, mass, damping and initial displacement.',
  icon: 'spring',
  params,
  graphAxes: { yKey: 'x', yLabel: 'x (m)' },
  reset,
  step,
  applyParams(state: any, p: Record<string, number>) {
    // When the user changes x0 or other params while idle, snap the mass
    // to the new initial displacement so the visual updates immediately.
    return { ...(state as State), x: p.x0, v: 0, amplitude: Math.abs(p.x0), t: 0, trail: [] }
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawSpring(ctx, state as State, params, width, height)
  },
}
