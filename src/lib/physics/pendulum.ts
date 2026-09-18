// Pendulum - simple (non-large-angle) damped pendulum.
// State: { theta, omega }   (angle in radians from vertical, angular velocity).
// Equation:  d²θ/dt² = -(g/L)·sin(θ) - b·ω
// At small angles this reduces to SHM with T = 2π√(L/g).

import { Experiment, ParamDef } from './experiments'
import { rk2Step, deg2rad, rad2deg } from './engine'
import { drawPendulum, drawTrail, PendulumDrawCtx } from './draw2d'

const params: ParamDef[] = [
  { key: 'L', label: 'Length', min: 0.2, max: 3.0, step: 0.05, default: 1.0, unit: 'm' },
  { key: 'm', label: 'Mass', min: 0.1, max: 5.0, step: 0.1, default: 1.0, unit: 'kg' },
  { key: 'g', label: 'Gravity', min: 0.5, max: 25, step: 0.1, default: 9.81, unit: 'm/s²' },
  { key: 'b', label: 'Damping', min: 0, max: 0.5, step: 0.01, default: 0.0, unit: '1/s' },
  { key: 'theta0', label: 'Initial angle', min: 1, max: 89, step: 1, default: 30, unit: '°' },
]

interface State {
  theta: number
  omega: number
  // Trail of bob positions in world units (origin at pivot), in metres.
  trail: { x: number; y: number }[]
  // Period detection: track the sim-time of the last two upward zero-crossings.
  simT: number
  lastCrossT: number   // sim-time of the most recent upward zero-crossing
  prevCrossT: number   // sim-time of the one before that
  period: number       // measured period (seconds)
  lastTheta: number
}

function reset(p: Record<string, number>) {
  const theta0 = deg2rad(p.theta0 ?? 30)
  const s: State = {
    theta: theta0,
    omega: 0,
    trail: [],
    simT: 0,
    lastCrossT: 0,
    prevCrossT: 0,
    period: 0,
    lastTheta: theta0,
  }
  return {
    state: s,
    sample: sampleFrom(s, p),
    measurements: measurementsFrom(s, p),
  }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const L = p.L
  const m = p.m
  const g = p.g
  const b = p.b

  const deriv = (y: State, _t: number) => {
    const omega = y.omega
    const alpha = -(g / L) * Math.sin(y.theta) - b * omega
    return { ...y, theta: omega, omega: alpha }
  }

  const next = rk2Step(s, 0, dt, deriv) as State
  next.simT = s.simT + dt
  // Period detection: count upward zero-crossings of θ (from negative to positive).
  if (s.lastTheta <= 0 && next.theta > 0) {
    next.prevCrossT = next.lastCrossT
    next.lastCrossT = next.simT
    if (next.prevCrossT !== 0) {
      // Two consecutive crossings one full period apart (upward -> upward).
      next.period = next.lastCrossT - next.prevCrossT
    }
  }
  next.lastTheta = next.theta
  // Position in world units relative to pivot: (L sinθ, L cosθ) — y points down.
  const px = L * Math.sin(next.theta)
  const py = L * Math.cos(next.theta)
  next.trail = [...s.trail, { x: px, y: py }].slice(-180)

  return {
    nextState: next,
    sample: sampleFrom(next, p),
    measurements: measurementsFrom(next, p),
  }
}

function sampleFrom(s: State, _p: Record<string, number>) {
  return { theta: s.theta, omega: s.omega }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const L = p.L, m = p.m, g = p.g
  const T_small = 2 * Math.PI * Math.sqrt(L / g)
  // Anharmonic correction (1st order): T ≈ T0·(1 + θ_max²/16) for sin(θ) series.
  const T_anharm = T_small * (1 + (p.theta0 * Math.PI / 180) ** 2 / 16)
  const omega = s.omega
  const v = omega * L
  const KE = 0.5 * m * v * v
  const PE = m * g * L * (1 - Math.cos(s.theta))
  return {
    T_small,
    T_anharm,
    T_measured: s.period,
    KE,
    PE,
    E_total: KE + PE,
    speed: v,
  }
}

export const pendulumExperiment: Experiment = {
  id: 'pendulum',
  title: 'Pendulum',
  description: 'Damped simple pendulum. Adjust length, mass, gravity and amplitude.',
  icon: 'pendulum',
  params,
  graphAxes: { yKey: 'theta', yLabel: 'θ (rad)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    // When the user changes theta0 (or any other param that should reset
    // the simulation), re-launch from the new initial conditions. Length
    // and gravity changes are picked up by step on the next tick, but a
    // fresh start keeps things predictable.
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    const s = state as State
    const pivotX = width / 2
    const pivotY = height * 0.18
    // World→screen scale: 1 metre = min(width, height)/4 px, so a 1m rod is roughly visible.
    const scale = Math.min(width, height) / 4
    // Bob size scales with mass (cube-root of mass, so doubling mass gives ~26% larger bob).
    const bobR = 10 + 8 * Math.cbrt(params.m)
    drawPendulum(ctx, {
      pivotX, pivotY, scale,
      theta: s.theta, length: params.L,
      bobRadius: bobR,
    } as PendulumDrawCtx)
    drawTrail(ctx, s.trail, pivotX, pivotY, scale)
  },
}
