// 1D and 2D elastic/inelastic collisions between two balls.
// State: array of 2 balls with { x, y, vx, vy, m, r, color }.
// On collision: impulse-based 2D elastic collision with restitution e in [0,1].

import { Experiment, ParamDef } from './experiments'
import { rk2Step, vLen } from './engine'
import { drawCollision } from './draw2d'

const params: ParamDef[] = [
  { key: 'm1', label: 'Mass 1', min: 0.1, max: 10, step: 0.1, default: 1.0, unit: 'kg' },
  { key: 'm2', label: 'Mass 2', min: 0.1, max: 10, step: 0.1, default: 2.0, unit: 'kg' },
  { key: 'v1x', label: 'v₁ x', min: -10, max: 10, step: 0.1, default: 4.0, unit: 'm/s' },
  { key: 'v1y', label: 'v₁ y', min: -5, max: 5, step: 0.1, default: 0.0, unit: 'm/s' },
  { key: 'v2x', label: 'v₂ x', min: -10, max: 10, step: 0.1, default: -2.0, unit: 'm/s' },
  { key: 'v2y', label: 'v₂ y', min: -5, max: 5, step: 0.1, default: 0.0, unit: 'm/s' },
  { key: 'e', label: 'Restitution', min: 0, max: 1, step: 0.05, default: 1.0, unit: '' },
  { key: 'd', label: '1D/2D mode', min: 0, max: 1, step: 1, default: 0, unit: '' },
]

interface Ball {
  x: number; y: number
  vx: number; vy: number
  m: number; r: number
  color: string
}

interface State {
  balls: Ball[]
  collided: boolean
  collisionT: number
  pBefore: number
  pAfter: number
  keBefore: number
  keAfter: number
  trail1: { x: number; y: number }[]
  trail2: { x: number; y: number }[]
}

const WIDTH_M = 20  // virtual world width in metres
const HEIGHT_M = 8

function buildBalls(p: Record<string, number>): Ball[] {
  const oneD = Math.round(p.d) === 0
  return [
    {
      x: -WIDTH_M * 0.3,
      y: 0,
      vx: p.v1x,
      vy: oneD ? 0 : p.v1y,
      m: p.m1,
      r: 0.4 + p.m1 * 0.15,
      color: '#2563EB',
    },
    {
      x: WIDTH_M * 0.3,
      y: 0,
      vx: p.v2x,
      vy: oneD ? 0 : p.v2y,
      m: p.m2,
      r: 0.4 + p.m2 * 0.15,
      color: '#DC2626',
    },
  ]
}

function reset(p: Record<string, number>) {
  const s: State = {
    balls: buildBalls(p),
    collided: false,
    collisionT: 0,
    pBefore: 0, pAfter: 0, keBefore: 0, keAfter: 0,
    trail1: [], trail2: [],
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

/**
 * When the user changes a parameter, rebuild the balls with the new
 * initial conditions but keep the trails so the user can see what
 * changed. We DO reset the collided state since the system is back to
 * its initial conditions.
 */
function applyParams(state: State, p: Record<string, number>): State {
  return {
    ...state,
    balls: buildBalls(p),
    collided: false,
    collisionT: 0,
    pBefore: 0, pAfter: 0, keBefore: 0, keAfter: 0,
    // Keep the trails for visual continuity
  }
}

function step(s: State, dt: number, p: Record<string, number>) {
  const oneD = Math.round(p.d) === 0
  // Free flight (no forces). In 1D mode, lock vy to 0 to keep the
  // simulation on the centre line.
  const next: State = {
    ...s,
    balls: s.balls.map((b) => {
      const vy = oneD ? 0 : b.vy
      const y = oneD ? 0 : b.y + vy * dt
      return { ...b, x: b.x + b.vx * dt, y, vy }
    }),
    trail1: [...s.trail1, { x: s.balls[0].x, y: s.balls[0].y }].slice(-120),
    trail2: [...s.trail2, { x: s.balls[1].x, y: s.balls[1].y }].slice(-120),
  }
  // Wall bounces (only the x-walls in 1D mode)
  for (const b of next.balls) {
    if (b.x - b.r < -WIDTH_M / 2) { b.x = -WIDTH_M / 2 + b.r; b.vx = Math.abs(b.vx) }
    if (b.x + b.r > WIDTH_M / 2) { b.x = WIDTH_M / 2 - b.r; b.vx = -Math.abs(b.vx) }
    if (!oneD) {
      if (b.y - b.r < -HEIGHT_M / 2) { b.y = -HEIGHT_M / 2 + b.r; b.vy = Math.abs(b.vy) }
      if (b.y + b.r > HEIGHT_M / 2) { b.y = HEIGHT_M / 2 - b.r; b.vy = -Math.abs(b.vy) }
    }
  }
  // Ball-ball collision detection
  const a = next.balls[0], b = next.balls[1]
  const dx = b.x - a.x, dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  if (dist < a.r + b.r) {
    // Compute pre-collision momentum & KE
    if (!s.collided) {
      next.pBefore = a.m * a.vx + b.m * b.vx
      next.keBefore = 0.5 * a.m * (a.vx * a.vx + a.vy * a.vy) + 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy)
    }
    // Normal vector
    const nx = dist > 1e-6 ? dx / dist : 1
    const ny = dist > 1e-6 ? dy / dist : 0
    // Relative velocity along normal
    const rvx = b.vx - a.vx
    const rvy = b.vy - a.vy
    const velAlongNormal = rvx * nx + rvy * ny
    if (velAlongNormal < 0) {
      // Impulse
      const e = p.e
      const j = -(1 + e) * velAlongNormal / (1 / a.m + 1 / b.m)
      const ix = j * nx
      const iy = j * ny
      a.vx -= ix / a.m
      a.vy -= iy / a.m
      b.vx += ix / b.m
      b.vy += iy / b.m
      // Separate
      const overlap = (a.r + b.r) - dist
      a.x -= nx * overlap * 0.5
      a.y -= ny * overlap * 0.5
      b.x += nx * overlap * 0.5
      b.y += ny * overlap * 0.5
      if (!s.collided) {
        next.collided = true
        next.collisionT = dt
        next.pAfter = a.m * a.vx + b.m * b.vx
        next.keAfter = 0.5 * a.m * (a.vx * a.vx + a.vy * a.vy) + 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy)
      }
    }
  }
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  const sep = Math.abs(s.balls[0].x - s.balls[1].x)
  return { y: sep, v: s.balls[0].vx }
}

function measurementsFrom(s: State, _p: Record<string, number>) {
  const a = s.balls[0], b = s.balls[1]
  const pTotal = a.m * a.vx + b.m * b.vx
  const ke = 0.5 * a.m * (a.vx * a.vx + a.vy * a.vy) + 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy)
  const v1 = Math.hypot(a.vx, a.vy)
  const v2 = Math.hypot(b.vx, b.vy)
  return {
    'p total': pTotal,
    KE: ke,
    v1, v2,
    collided: s.collided ? 1 : 0,
    'p conserved': Math.abs(pTotal - s.pBefore) < 0.1 ? 1 : 0,
    'energy lost': s.keBefore > 0 ? Math.max(0, s.keBefore - ke) : 0,
  }
}

export const collisionExperiment: Experiment = {
  id: 'collision',
  title: 'Collision',
  description: 'Two balls collide elastically or inelastically. Watch momentum transfer.',
  icon: 'collision',
  params,
  graphAxes: { yKey: 'y', yLabel: 'separation (m)' },
  reset,
  step,
  applyParams,
  render: 'canvas2d',
  draw: (ctx, state, _params, width, height) => {
    drawCollision(ctx, state as State, WIDTH_M, HEIGHT_M, width, height)
  },
}
