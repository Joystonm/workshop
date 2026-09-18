// Projectile motion in 2D, with optional quadratic air drag.
// State: { x, y, vx, vy }   (y points up; ground is y = 0).
// Equation:  a = (0, -g) - (k/m)·|v|·v    (k is drag coefficient, 0 = vacuum).
// On ground hit, motion stops (y <= 0 → freeze, log flight time / range).

import { Experiment, ParamDef } from './experiments'
import { rk2Step, deg2rad, vLen } from './engine'
import { drawProjectile } from './draw2d'

const params: ParamDef[] = [
  { key: 'v0', label: 'Initial speed', min: 1, max: 80, step: 0.5, default: 30, unit: 'm/s' },
  { key: 'angle', label: 'Launch angle', min: 1, max: 89, step: 1, default: 45, unit: '°' },
  { key: 'g', label: 'Gravity', min: 0.5, max: 25, step: 0.1, default: 9.81, unit: 'm/s²' },
  { key: 'k', label: 'Air drag k', min: 0, max: 0.1, step: 0.001, default: 0.0, unit: 'kg/m' },
  { key: 'm', label: 'Mass', min: 0.1, max: 10, step: 0.1, default: 1.0, unit: 'kg' },
]

interface State {
  x: number
  y: number
  vx: number
  vy: number
  t: number
  // Sample metrics
  landed: boolean
  range: number       // x at landing (m)
  flightTime: number  // s
  maxHeight: number
  tAtMaxHeight: number
  trail: { x: number; y: number }[]
}

function reset(p: Record<string, number>) {
  const a = deg2rad(p.angle)
  const s: State = {
    x: 0,
    y: 0,
    vx: p.v0 * Math.cos(a),
    vy: p.v0 * Math.sin(a),
    t: 0,
    landed: false,
    range: 0,
    flightTime: 0,
    maxHeight: 0,
    tAtMaxHeight: 0,
    trail: [],
  }
  return {
    state: s,
    sample: sampleFrom(s),
    measurements: measurementsFrom(s, p),
  }
}

function step(s: State, dt: number, p: Record<string, number>) {
  if (s.landed) {
    return { nextState: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
  }
  const m = p.m, g = p.g, k = p.k

  const deriv = (y: State, _t: number) => {
    const speed = vLen({ x: y.vx, y: y.vy })
    const dragFactor = -(k / m) * speed
    return {
      ...y,
      x: y.vx,
      y: y.vy,
      vx: dragFactor * y.vx,
      vy: dragFactor * y.vy - g,
    }
  }

  const next = rk2Step(s, 0, dt, deriv) as State
  next.t = s.t + dt
  next.maxHeight = Math.max(s.maxHeight, next.y)
  next.trail = [...s.trail, { x: next.x, y: next.y }].slice(-600)

  // Detect ground hit (y <= 0 means projectile has landed).
  if (next.y <= 0 && s.y > 0) {
    // Linear interpolation for the crossing time / position.
    const frac = s.y / (s.y - next.y)
    const tCross = s.t + frac * dt
    const xCross = s.x + frac * (next.x - s.x)
    next.t = tCross
    next.x = xCross
    next.y = 0
    next.landed = true
    next.range = xCross
    next.flightTime = tCross
  } else if (s.landed) {
    next.landed = true
    next.range = s.range
    next.flightTime = s.flightTime
  }

  return {
    nextState: next,
    sample: sampleFrom(next),
    measurements: measurementsFrom(next, p),
  }
}

function sampleFrom(s: State) {
  return { y: s.y, x: s.x, vy: s.vy, vx: s.vx }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const v = Math.hypot(s.vx, s.vy)
  const KE = 0.5 * p.m * v * v
  // Theoretical range (no drag) for the current parameters:
  const a = deg2rad(p.angle)
  const v0 = p.v0, g = p.g
  const R_theory = (v0 * v0 * Math.sin(2 * a)) / g
  const H_theory = (v0 * v0 * Math.sin(a) * Math.sin(a)) / (2 * g)
  return {
    speed: v,
    KE,
    R_theory,
    R_actual: s.range,
    H_theory,
    H_actual: s.maxHeight,
    flightTime: s.flightTime,
    landed: s.landed ? 1 : 0,
  }
}

export const projectileExperiment: Experiment = {
  id: 'projectile',
  title: 'Projectile',
  description: 'Launch a projectile with adjustable speed, angle, gravity and air drag.',
  icon: 'projectile',
  params,
  graphAxes: { yKey: 'y', yLabel: 'y (m)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    // When the user changes v0, angle, g, k, m while running, re-launch
    // the projectile from the origin with the new initial conditions.
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    const s = state as State
    drawProjectile(ctx, s, params, width, height)
  },
}
