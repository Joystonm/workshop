// Physics engine - core types, vector math, deterministic integrators.
//
// The simulation is the source of truth: every render frame we advance the
// state by a fixed sub-step (FIXED_DT) using RK2, then read state to draw.
// React only holds parameters + a snapshot of derived values for the UI.

export type Vec2 = { x: number; y: number }

export const FIXED_DT = 1 / 120 // 120 Hz simulation; render at rAF (~60 Hz).
export const HISTORY_LIMIT = 720 // 12 s @ 60 Hz history samples.

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const deg2rad = (d: number): number => (d * Math.PI) / 180
export const rad2deg = (r: number): number => (r * 180) / Math.PI

export const v2 = (x: number, y: number): Vec2 => ({ x, y })
export const vAdd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const vSub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const vScale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s })
export const vLen = (a: Vec2): number => Math.hypot(a.x, a.y)
export const vLenSq = (a: Vec2): number => a.x * a.x + a.y * a.y

/**
 * Generic 2nd-order Runge-Kutta (midpoint) step.
 *   yDot: (y, t) => dy/dt
 *   y:    current state
 *   t:    current time
 *   dt:   step
 * Returns the new y.
 */
export function rk2Step<T>(
  y: T,
  t: number,
  dt: number,
  yDot: (y: T, t: number) => T
): T {
  const k1 = yDot(y, t)
  // For object state, we treat T as a plain object and project k1 onto a
  // midpoint approximation by averaging. This is a simple, accurate
  // enough integrator for our use at FIXED_DT = 1/120.
  const yMid = addScaled(y, k1, dt * 0.5)
  const k2 = yDot(yMid, t + dt * 0.5)
  return addScaled(y, k2, dt)
}

/** y + scale * k  (treats T as { [k: string]: number }). */
function addScaled<T>(y: T, k: T, scale: number): T {
  const out: any = Array.isArray(y) ? [] : {}
  for (const key of Object.keys(y as any)) {
    out[key] = (y as any)[key] + (k as any)[key] * scale
  }
  return out as T
}

/** Format a number compactly for measurement labels. */
export function fmt(value: number, digits = 3): string {
  if (!isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1000) return value.toFixed(1)
  if (abs >= 100) return value.toFixed(2)
  if (abs >= 10) return value.toFixed(2)
  if (abs >= 1) return value.toFixed(3)
  if (abs >= 0.01) return value.toFixed(4)
  return value.toExponential(2)
}
