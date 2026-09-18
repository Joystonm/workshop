// Newtonian engine for the new solar-system, gravity and tides
// experiments. Self-contained: SI units, leapfrog integrator, no API
// calls. Real constants for Sun/planets/Moon — enough accuracy to
// show qualitatively correct orbits and periods.
//
// Reusable building blocks:
//   - `createState()`        — initial state for the solar-system
//   - `step(state, dt)`      — advance the simulation by dt seconds
//   - `bodyInfo(name)`       — mass + radius + colour for a body
//   - `gPlanet(name)`        — surface gravity m/s² for a body
//   - `vOrbit(primary, a)`   — circular-orbit speed at semi-major axis
//   - `vEscape(primary, r)`  — escape velocity at radius r
//   - `period(primary, a)`   — orbital period at semi-major axis
//
// Time scale: callers pass `dtSeconds` in real seconds. To watch a
// year go by in 10 s, scale `dtSeconds` accordingly.

export const G = 6.67430e-11 // m³ kg⁻¹ s⁻²

export interface Body {
  name: string
  mass: number // kg
  radius: number // m (mean)
  colour: string // hex
  /** Position (m) and velocity (m/s) in heliocentric / planetocentric
   *  inertial frame. Caller decides the frame. */
  pos: [number, number]
  vel: [number, number]
  /** If true, the engine treats this body as fixed at its initial
   *  position and applies no force to it. Use for reference bodies
   *  (e.g. the Sun in the tides scene) that shouldn't move under the
   *  simulation. */
  fixed?: boolean
}

export interface State {
  bodies: Body[]
  /** Optional primary index — the body whose gravity dominates. For
   *  the solar system this is the Sun (index 0). For the Moon-around-
   *  Earth scene it's Earth. step() pulls each body toward the
   *  primary using F = G·m₁·m₂/r². Other body-body interactions are
   *  ignored for performance (this is a teaching toy, not N-body). */
  primaryIx: number
  /** Seconds elapsed in the simulation. */
  t: number
}

const AU_M = 1.495978707e11 // 1 AU in metres

// ── Real-world body data ──────────────────────────────────────────────
// Mass, mean radius, approximate orbital semi-major axis (relative to
// primary), and a hex colour. Sources: NASA fact sheets.

interface BodySpec {
  name: string
  mass: number
  radius: number
  colour: string
}

export const BODY_SPECS: Record<string, BodySpec> = {
  Sun: { name: 'Sun', mass: 1.9885e30, radius: 6.957e8, colour: '#F59E0B' },
  Mercury: { name: 'Mercury', mass: 3.3011e23, radius: 2.4397e6, colour: '#A1A1AA' },
  Venus: { name: 'Venus', mass: 4.8675e24, radius: 6.0518e6, colour: '#FCD34D' },
  Earth: { name: 'Earth', mass: 5.9722e24, radius: 6.371e6, colour: '#3B82F6' },
  Moon: { name: 'Moon', mass: 7.342e22, radius: 1.7374e6, colour: '#E5E7EB' },
  Mars: { name: 'Mars', mass: 6.4171e23, radius: 3.3895e6, colour: '#EF4444' },
  Jupiter: { name: 'Jupiter', mass: 1.898e27, radius: 6.9911e7, colour: '#FB923C' },
  Saturn: { name: 'Saturn', mass: 5.683e26, radius: 5.8232e7, colour: '#FACC15' },
  Uranus: { name: 'Uranus', mass: 8.681e25, radius: 2.5362e7, colour: '#67E8F9' },
  Neptune: { name: 'Neptune', mass: 1.024e26, radius: 2.4622e7, colour: '#3B82F6' },
  Pluto: { name: 'Pluto', mass: 1.303e22, radius: 1.1883e6, colour: '#D1D5DB' },
}

// Semi-major axes (m) and orbital periods (s) — real values.
export const ORBITAL_DATA: Record<string, { a: number; period_s: number }> = {
  Mercury: { a: 0.387 * AU_M, period_s: 7.6005e6 },
  Venus: { a: 0.723 * AU_M, period_s: 1.9414e7 },
  Earth: { a: 1.000 * AU_M, period_s: 3.1558e7 },
  Mars: { a: 1.524 * AU_M, period_s: 5.9354e7 },
  Jupiter: { a: 5.203 * AU_M, period_s: 3.7435e9 },
  Saturn: { a: 9.537 * AU_M, period_s: 9.2936e9 },
  Uranus: { a: 19.19 * AU_M, period_s: 2.6493e10 },
  Neptune: { a: 30.07 * AU_M, period_s: 5.2008e10 },
  Pluto: { a: 39.48 * AU_M, period_s: 7.8233e10 },
  Moon: { a: 3.844e8, period_s: 2.3606e6 }, // around Earth
}

// ── Initial state builders ────────────────────────────────────────────

/**
 * Solar system: Sun at origin (stationary), 8 planets + Pluto on
 * circular orbits in the x-y plane. Earth is initialised on the +x
 * axis (so its angle starts at 0 and the simulation reads naturally).
 */
export function createSolarSystem(planets: string[] = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']): State {
  const sun: Body = {
    name: 'Sun',
    mass: BODY_SPECS.Sun.mass,
    radius: BODY_SPECS.Sun.radius,
    colour: BODY_SPECS.Sun.colour,
    pos: [0, 0],
    vel: [0, 0],
    fixed: true,
  }
  const bodies: Body[] = [sun]
  for (const pName of planets) {
    const orb = ORBITAL_DATA[pName]
    if (!orb) continue
    const spec = BODY_SPECS[pName]
    const v = vOrbit(sun.mass, orb.a)
    bodies.push({
      name: pName,
      mass: spec.mass,
      radius: spec.radius,
      colour: spec.colour,
      pos: [orb.a, 0],
      vel: [0, v],
    })
  }
  return { bodies, primaryIx: 0, t: 0 }
}

/**
 * Free-fall scene: a primary body (Earth / Moon / Mars / Jupiter / Sun)
 * sitting still, and a small projectile released from `dropHeight`
 * metres above its surface with zero initial velocity. The projectile
 * falls under g until it hits the surface.
 */
export function createFreefall(primaryName: string, dropHeight: number): State {
  const spec = BODY_SPECS[primaryName]
  if (!spec) throw new Error(`Unknown primary: ${primaryName}`)
  const primary: Body = {
    name: primaryName,
    mass: spec.mass,
    radius: spec.radius,
    colour: spec.colour,
    pos: [0, 0],
    vel: [0, 0],
    fixed: true,
  }
  const projectile: Body = {
    name: 'projectile',
    mass: 1, // mass doesn't matter — acceleration independent of m
    radius: 0,
    colour: '#DC2626',
    pos: [spec.radius + dropHeight, 0],
    vel: [0, 0],
  }
  return { bodies: [primary, projectile], primaryIx: 0, t: 0 }
}

/**
 * Tides scene: Earth at origin, Moon at orbital distance, Sun far
 * away at 1 AU. Earth is fixed (the simulation just tracks the Moon's
 * phase angle and shows the tidal bulge). For the user-facing scene
 * we use Earth as the primary so the tidal bulge stays put, while
 * Moon/Sun pull on a thin ocean layer.
 */
export function createTides(moonDistanceEarthRadii: number, sunStrength: number): State {
  const earth: Body = {
    name: 'Earth',
    mass: BODY_SPECS.Earth.mass,
    radius: BODY_SPECS.Earth.radius,
    colour: BODY_SPECS.Earth.colour,
    pos: [0, 0],
    vel: [0, 0],
    fixed: true,
  }
  const earthRadius = BODY_SPECS.Earth.radius
  const moonDistanceM = moonDistanceEarthRadii * earthRadius
  const vMoon = Math.sqrt((G * earth.mass) / moonDistanceM)
  const moon: Body = {
    name: 'Moon',
    mass: BODY_SPECS.Moon.mass,
    radius: BODY_SPECS.Moon.radius,
    colour: BODY_SPECS.Moon.colour,
    pos: [moonDistanceM, 0],
    vel: [0, vMoon],
  }
  // Sun stays fixed at 1 AU on the +x axis. Its gravity contribution
  // is scaled by the user parameter `sunStrength` (0..1).
  const sun: Body = {
    name: 'Sun',
    mass: BODY_SPECS.Sun.mass * sunStrength,
    radius: BODY_SPECS.Sun.radius,
    colour: '#F59E0B',
    pos: [AU_M, 0],
    vel: [0, 0],
    fixed: true,
  }
  return { bodies: [earth, moon, sun], primaryIx: 0, t: 0 }
}

// ── Helpers ───────────────────────────────────────────────────────────

export function bodyInfo(name: string): BodySpec {
  const s = BODY_SPECS[name]
  if (!s) throw new Error(`Unknown body: ${name}`)
  return s
}

export function gPlanet(name: string): number {
  const s = bodyInfo(name)
  return (G * s.mass) / (s.radius * s.radius)
}

/** Circular orbital speed at semi-major axis `a` (m) around a primary
 *  of mass `primaryMass` (kg). */
export function vOrbit(primaryMass: number, a: number): number {
  return Math.sqrt((G * primaryMass) / a)
}

/** Escape velocity at radius `r` from a primary of mass `primaryMass`. */
export function vEscape(primaryMass: number, r: number): number {
  return Math.sqrt((2 * G * primaryMass) / r)
}

/** Orbital period at semi-major axis `a` around a primary of mass `primaryMass`. */
export function period(primaryMass: number, a: number): number {
  return 2 * Math.PI * Math.sqrt((a * a * a) / (G * primaryMass))
}

// ── Integrator (kick-drift-kick leapfrog, symplectic) ─────────────────
//
// Leapfrog conserves energy much better than forward Euler at large
// time-steps. We still keep dt small for visual stability:
//   - Solar system: dt ≈ 1 day (86400 s) × userTimeScale
//   - Free fall: dt ≈ 0.01 s × userTimeScale
//   - Tides: dt ≈ 60 s × userTimeScale

export function step(state: State, dtSeconds: number): void {
  const primary = state.bodies[state.primaryIx]
  // Cache accelerations on bodies so we apply a half-kick to velocity,
  // drift position by full dt, recompute accelerations, apply the
  // other half-kick.
  const accels = state.bodies.map((b) => accel(state, b, primary))
  // half-kick
  for (let i = 0; i < state.bodies.length; i++) {
    state.bodies[i].vel[0] += 0.5 * accels[i][0] * dtSeconds
    state.bodies[i].vel[1] += 0.5 * accels[i][1] * dtSeconds
  }
  // drift
  for (let i = 0; i < state.bodies.length; i++) {
    state.bodies[i].pos[0] += state.bodies[i].vel[0] * dtSeconds
    state.bodies[i].pos[1] += state.bodies[i].vel[1] * dtSeconds
  }
  // recompute accels
  const newAccels = state.bodies.map((b) => accel(state, b, primary))
  // half-kick
  for (let i = 0; i < state.bodies.length; i++) {
    state.bodies[i].vel[0] += 0.5 * newAccels[i][0] * dtSeconds
    state.bodies[i].vel[1] += 0.5 * newAccels[i][1] * dtSeconds
  }
  state.t += dtSeconds
}

function accel(state: State, body: Body, primary: Body): [number, number] {
  // The primary exerts no net gravitational force on itself. Fixed
  // bodies (e.g. the Sun in the tides scene) are reference points and
  // we don't accelerate them either.
  if (body === primary || body.fixed) return [0, 0]
  const dx = primary.pos[0] - body.pos[0]
  const dy = primary.pos[1] - body.pos[1]
  const r2 = dx * dx + dy * dy
  const r = Math.sqrt(r2)
  // Softening to prevent singularities if the projectile is dropped
  // directly on the primary.
  const softR2 = Math.max(r2, 1e4)
  const a = (G * primary.mass) / softR2
  const ax = a * (dx / r)
  const ay = a * (dy / r)
  return [ax, ay]
}

// ── Body-vs-primary distance / speed / angle helpers ─────────────────

export function distance(b: Body, primary: Body): number {
  const dx = b.pos[0] - primary.pos[0]
  const dy = b.pos[1] - primary.pos[1]
  return Math.sqrt(dx * dx + dy * dy)
}

export function speed(b: Body): number {
  return Math.sqrt(b.vel[0] * b.vel[0] + b.vel[1] * b.vel[1])
}

export function angle(b: Body): number {
  // angle from +x axis, radians
  return Math.atan2(b.pos[1], b.pos[0])
}

// ── Free-fall impact prediction (closed-form for verification) ───────

/** Time in seconds to fall from `h` m under surface gravity `g` m/s². */
export function tFall(h: number, g: number): number {
  return Math.sqrt((2 * h) / g)
}

/** Impact speed in m/s after falling from `h` m under g. */
export function vImpact(h: number, g: number): number {
  return Math.sqrt(2 * g * h)
}