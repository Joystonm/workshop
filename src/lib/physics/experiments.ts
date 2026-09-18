// Experiment registry. Each experiment is a self-contained module that
// owns its state, integration, derived measurements, and 2D draw routine.

import { pendulumExperiment } from './pendulum'
import { projectileExperiment } from './projectile'
import { freefallExperiment } from './freefall'
import { springExperiment } from './spring'
import { collisionExperiment } from './collision'
import { inclineExperiment } from './incline'
import { wavesExperiment } from './waves'
import { buoyancyExperiment } from './buoyancy'
import { hookeExperiment } from './hooke'
import { newtonExperiment } from './newton'
import { soundExperiment } from './sound'
import { beatsExperiment } from './beats'

export type ExperimentId =
  | 'pendulum' | 'projectile' | 'freefall' | 'spring'
  | 'collision' | 'incline'
  | 'waves' | 'sound' | 'beats'
  | 'buoyancy' | 'hooke' | 'newton'

export interface ParamDef {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  unit: string
}

export interface Sample {
  t: number
  values: Record<string, number>
}

export interface StepResult {
  nextState: any
  sample: Record<string, number>
  measurements: Record<string, number>
}

export interface ResetResult {
  state: any
  sample: Record<string, number>
  measurements: Record<string, number>
}

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  state: any,
  params: Record<string, number>,
  width: number,
  height: number
) => void

export interface Experiment {
  id: ExperimentId
  title: string
  description: string
  icon: string
  params: ParamDef[]
  graphAxes: { yKey: string; yLabel: string }
  /**
   * If true, the experiment is "passive" — it should still tick (call step
   * at least once) even when the user hasn't pressed Run. Used by Hooke's
   * law and waves, where the visual is driven by parameters alone.
   */
  passive?: boolean
  /**
   * Optional: rebuild the state when a parameter changes. The store calls
   * this from setParam so the visual responds live. If not provided, the
   * state is left as-is (assumes step reads params from p on every call).
   */
  applyParams?: (
    state: any,
    newParams: Record<string, number>
  ) => any
  reset: (params: Record<string, number>) => ResetResult
  step: (
    state: any,
    dt: number,
    params: Record<string, number>
  ) => StepResult
  render: 'canvas2d' | 'three'
  draw: DrawFn
}

export const EXPERIMENTS: Experiment[] = [
  pendulumExperiment,
  projectileExperiment,
  freefallExperiment,
  springExperiment,
  collisionExperiment,
  inclineExperiment,
  wavesExperiment,
  soundExperiment,
  beatsExperiment,
  buoyancyExperiment,
  hookeExperiment,
  newtonExperiment,
]

export const EXPERIMENTS_BY_ID: Record<ExperimentId, Experiment> =
  EXPERIMENTS.reduce(
    (acc, e) => ({ ...acc, [e.id]: e }),
    {} as Record<ExperimentId, Experiment>
  )

export function defaultParams(e: Experiment): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of e.params) out[p.key] = p.default
  return out
}
