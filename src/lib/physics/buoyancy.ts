// Buoyancy / Archimedes' principle.
// A solid object is placed in a fluid. The object experiences:
//   - gravity: F_g = -m·g = -ρ_obj·V·g
//   - buoyancy: F_b = ρ_fluid·V_submerged·g   (upward)
//
// We track vertical position of the object's centre of mass. If the
// object is denser than the fluid it sinks; if less dense it floats
// with V_submerged/V = ρ_obj/ρ_fluid.

import { Experiment, ParamDef } from './experiments'
import { rk2Step } from './engine'
import { drawBuoyancy } from './draw2d'

const params: ParamDef[] = [
  { key: 'rho_obj', label: 'Object density', min: 100, max: 10000, step: 50, default: 800, unit: 'kg/m³' },
  { key: 'rho_fluid', label: 'Fluid density', min: 100, max: 10000, step: 50, default: 1000, unit: 'kg/m³' },
  { key: 'V', label: 'Object volume', min: 0.001, max: 0.1, step: 0.001, default: 0.02, unit: 'm³' },
  { key: 'g', label: 'Gravity', min: 0.5, max: 25, step: 0.1, default: 9.81, unit: 'm/s²' },
  { key: 'b', label: 'Drag', min: 0, max: 5, step: 0.1, default: 0.5, unit: 'kg/s' },
]

interface State {
  y: number      // vertical position of object CoM (m); surface at y = 0
  vy: number
  h: number      // height of the object (m)
  rho_obj: number
  rho_fluid: number
  V: number
  submerged: number   // fraction of volume submerged (0..1)
  settled: boolean
  history: { y: number; submerged: number }[]
}

const FLUID_DEPTH = 4  // visible fluid depth in metres (just for drawing)
const OBJECT_HEIGHT_BASE = 0.4  // visual height per m³ volume

function reset(p: Record<string, number>) {
  // Object starts above the fluid.
  const s: State = {
    y: 1.5,  // metres above surface
    vy: 0,
    h: OBJECT_HEIGHT_BASE * Math.cbrt(p.V),
    rho_obj: p.rho_obj,
    rho_fluid: p.rho_fluid,
    V: p.V,
    submerged: 0,
    settled: false,
    history: [],
  }
  return { state: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
}

function step(s: State, dt: number, p: Record<string, number>) {
  if (s.settled) return { nextState: s, sample: sampleFrom(s), measurements: measurementsFrom(s, p) }
  const m = p.rho_obj * p.V
  const g = p.g
  const b = p.b
  // Determine submerged fraction
  // Object's bottom is at y_bottom = y - h/2; surface is at y=0.
  // Top is at y_top = y + h/2.
  const y_bottom = s.y - s.h / 2
  const y_top = s.y + s.h / 2
  let submerged: number
  if (y_bottom >= 0) submerged = 0
  else if (y_top <= 0) submerged = 1
  else submerged = -y_bottom / s.h  // fraction below surface

  // Forces (positive = up)
  const F_g = -m * g
  const F_b = p.rho_fluid * (submerged * p.V) * g
  const F_drag = -b * s.vy
  const F_net = F_g + F_b + F_drag
  const a = F_net / m
  let vy2 = s.vy + a * dt
  let y2 = s.y + vy2 * dt
  let settled = false

  // Floor of the fluid: object rests on the bottom
  if (y2 - s.h / 2 <= -FLUID_DEPTH) {
    y2 = -FLUID_DEPTH + s.h / 2
    vy2 = 0
    settled = true
  }
  // Object cannot be above the visible top
  if (y2 > 4) y2 = 4

  // Detect floating equilibrium: |F_g + F_b| is small *relative* to the
  // weight, and the object is at the surface, and velocity is small.
  // Floating equilibrium: rho_obj = rho_fluid * submerged_eq
  // => submerged_eq = rho_obj / rho_fluid
  const rhoRatio = p.rho_obj / p.rho_fluid
  if (rhoRatio < 1 && y_bottom <= 0 && y_top >= 0) {
    // Object straddles the surface. Check if it's near the equilibrium
    // submerged fraction.
    const subEq = rhoRatio
    if (Math.abs(submerged - subEq) < 0.01 && Math.abs(vy2) < 0.01) {
      vy2 = 0
      settled = true
      // Snap to the exact equilibrium position
      y2 = s.h * (0.5 - subEq)  // y such that y - h/2 = -h·subEq
    }
  }

  const next: State = {
    ...s,
    y: y2, vy: vy2, submerged, settled,
    history: [...s.history, { y: y2, submerged }].slice(-300),
  }
  return { nextState: next, sample: sampleFrom(next), measurements: measurementsFrom(next, p) }
}

function sampleFrom(s: State) {
  return { y: s.y, v: s.vy }
}

function measurementsFrom(s: State, p: Record<string, number>) {
  const m = p.rho_obj * p.V
  const F_g = m * p.g
  const F_b = p.rho_fluid * s.submerged * p.V * p.g
  const floating = s.rho_obj < s.rho_fluid
  const sub_frac_eq = floating ? s.rho_obj / s.rho_fluid : 1
  return {
    'weight (Fg)': F_g,
    'buoyancy (Fb)': F_b,
    'net force': F_g - F_b,
    submerged: s.submerged,
    'floating?': floating ? 1 : 0,
    'submerged at eq': sub_frac_eq,
  }
}

export const buoyancyExperiment: Experiment = {
  id: 'buoyancy',
  title: 'Buoyancy',
  description: 'Drop an object into a fluid. Compare densities to see float vs sink.',
  icon: 'buoyancy',
  params,
  graphAxes: { yKey: 'y', yLabel: 'y (m)' },
  reset,
  step,
  applyParams(_state: any, p: Record<string, number>) {
    return reset(p).state
  },
  render: 'canvas2d',
  draw: (ctx, state, params, width, height) => {
    drawBuoyancy(ctx, state as State, width, height, FLUID_DEPTH)
  },
}
