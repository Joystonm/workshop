// Free fall under gravity, with one or more objects of different masses.
// State: array of { y, vy, mass }.  In vacuum (no drag) all masses fall
// identically - we render that as a teaching point.

import { Experiment, ParamDef } from './experiments'
import { rk2Step, vLen } from './engine'
import { drawFreeFall } from './draw2d'

const params: ParamDef[] = [
  { key: 'h0', label: 'Drop height', min: 5, max: 200, step: 1, default: 50, unit: 'm' },
  { key: 'g', label: 'Gravity', min: 0.5, max: 25, step: 0.1, default: 9.81, unit: 'm/s²' },
  { key: 'k', label: 'Air drag k', min: 0, max: 0.1, step: 0.001, default: 0.0, unit: 'kg/m' },
  { key: 'n', label: 'Number of objects', min: 1, max: 5, step: 1, default: 3, unit: '' },
]

interface Ball {
  y: number
  vy: number
  mass: number
  label: string
  color: string
  landed: boolean
  landTime: number
  impactSpeed: number
}

interface State {
  balls: Ball[]
  t: number
  palette: string[]
}

const PALETTE = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#DC2626']

function reset(p: Record<string, number>): {
  state: State
  sample: any
  measurements: any
} {
  const n = Math.max(1, Math.min(5, Math.round(p.n)))
  const masses = [0.2, 0.5, 1.0, 2.0, 5.0].slice(0, n)
  const labels = ['0.2 kg', '0.5 kg', '1.0 kg', '2.0 kg', '5.0 kg']
  const balls: Ball[] = masses.map((m, i) => ({
    y: p.h0,
    vy: 0,
    mass: m,
    label: labels[i],
    color: PALETTE[i % PALETTE.length],
    landed: false,
    landTime: 0,
    impactSpeed: 0,
  }))
  const s: State = { balls, t: 0, palette: PALETTE }
  return {
    state: s,
    sample: sampleFrom(s),
    measurements: measurementsFrom(s, p),
  }
}

function step(s: State, dt: number, p: Record<string, number>) {
  // Each ball has its own mass — drag uses its mass, so heavier objects
  // fall slightly faster in air (correct physics) and identically in vacuum
  // (no drag, drag = 0).
  const nextBalls: Ball[] = s.balls.map((b) => {
    if (b.landed) return b
    const speed = vLen({ x: 0, y: b.vy })
    const drag = -(p.k / b.mass) * speed * b.vy
    const accel = drag - p.g
    const vy2 = b.vy + accel * dt
    const y2 = b.y + vy2 * dt
    if (y2 <= 0) {
      return { ...b, y: 0, vy: vy2, landed: true, landTime: s.t + dt, impactSpeed: Math.abs(vy2) }
    }
    return { ...b, y: y2, vy: vy2 }
  })
  const next: State = { ...s, balls: nextBalls, t: s.t + dt }
  return {
    nextState: next,
    sample: sampleFrom(next),
    measurements: measurementsFrom(next, p),
  }
}

function sampleFrom(s: State) {
  // The mini-graph for free fall shows the y of the first ball vs time.
  const b = s.balls[0]
  return { y: b.y, vy: Math.abs(b.vy) }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const t_first = s.balls.reduce((acc, b) => Math.max(acc, b.landed ? b.landTime : acc), 0)
  const T_theory = Math.sqrt((2 * p.h0) / p.g)
  const v_theory = Math.sqrt(2 * p.g * p.h0)
  return {
    T_theory,
    T_actual: t_first,
    v_impact_theory: v_theory,
    n_landed: s.balls.filter((b) => b.landed).length,
    n_total: s.balls.length,
  }
}

export const freefallExperiment: Experiment = {
  id: 'freefall',
  title: 'Free fall',
  description: 'Drop multiple objects from a height. In vacuum, all masses fall together.',
  icon: 'freefall',
  params,
  graphAxes: { yKey: 'y', yLabel: 'y (m)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    // When the user changes n (number of objects) or h0 (drop height),
    // rebuild the balls with the new initial conditions. We don't keep
    // the old trail because the layout is different.
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawFreeFall(ctx, state as State, params, width, height)
  },
}
