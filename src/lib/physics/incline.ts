// Block on an inclined plane.
// State: { s, v } where s is distance along the slope (m, positive = down-slope).
// Equation:  dv/dt = g·(sinθ - μ·cosθ)   (with kinetic friction μ)
//   For θ > arctan(μ_s) the block slides; otherwise it remains at rest.

import { Experiment, ParamDef } from './experiments'
import { rk2Step, deg2rad } from './engine'
import { drawIncline } from './draw2d'

const params: ParamDef[] = [
  { key: 'theta', label: 'Angle', min: 1, max: 80, step: 1, default: 30, unit: '°' },
  { key: 'mu', label: 'Friction μ', min: 0, max: 1.0, step: 0.01, default: 0.1, unit: '' },
  { key: 'm', label: 'Mass', min: 0.1, max: 10, step: 0.1, default: 1.0, unit: 'kg' },
  { key: 'g', label: 'Gravity', min: 0.5, max: 25, step: 0.1, default: 9.81, unit: 'm/s²' },
]

interface State {
  s: number      // distance along slope (down-slope positive), metres
  v: number      // velocity along slope
  maxS: number   // furthest point reached
  startY: number // y-position of the top of the slope (in world coords)
  slopeLen: number
}

const SLOPE_LEN = 10

function reset(p: Record<string, number>) {
  const s: State = {
    s: 0,
    v: 0,
    maxS: 0,
    startY: 0,
    slopeLen: SLOPE_LEN,
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const theta = deg2rad(p.theta)
  const mu = p.mu
  const g = p.g
  // Component of gravity along slope (down-slope positive)
  const aGrav = g * Math.sin(theta)
  // Normal force per unit mass: g·cosθ
  const aFricMax = mu * g * Math.cos(theta)
  // If stationary and gravity component is below static friction threshold,
  // remain at rest. (We treat μ_s = μ_k = μ for simplicity.)
  let aNet: number
  if (Math.abs(s.v) < 1e-3 && aGrav < aFricMax) {
    aNet = 0  // static - block stays put
  } else {
    // Friction opposes motion
    aNet = aGrav - Math.sign(s.v || 1) * aFricMax
  }
  const deriv = (y: State, _t: number) => ({ ...y, s: y.v, v: aNet })
  const next = rk2Step(s, 0, dt, deriv) as State
  next.maxS = Math.max(s.maxS, next.s)
  // Bounce off the end: stop at bottom of slope
  if (next.s >= SLOPE_LEN) {
    next.s = SLOPE_LEN
    next.v = 0
  }
  if (next.s < 0) { next.s = 0; next.v = 0 }
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { y: s.s, v: s.v, x: s.s }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const theta = deg2rad(p.theta)
  const mu = p.mu
  const g = p.g
  const aNet = g * Math.sin(theta) - mu * g * Math.cos(theta)
  const aFrictionless = g * Math.sin(theta)
  const v_now = s.v
  const KE = 0.5 * p.m * v_now * v_now
  const PE = p.m * g * (SLOPE_LEN - s.s) * Math.sin(theta)
  return {
    'a along slope': aNet,
    'a frictionless': aFrictionless,
    speed: v_now,
    KE, PE,
    'E total': KE + PE,
    'distance': s.s,
    'friction threshold': Math.atan(mu) * 180 / Math.PI,
  }
}

export const inclineExperiment: Experiment = {
  id: 'incline',
  title: 'Inclined plane',
  description: 'Block sliding down a ramp. Adjust angle and friction.',
  icon: 'incline',
  params,
  graphAxes: { yKey: 's', yLabel: 's (m)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    // When the user changes theta or mu, restart the block from the top
    // of the slope so they can see the new dynamics immediately.
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawIncline(ctx, state as State, params, width, height, SLOPE_LEN)
  },
}
