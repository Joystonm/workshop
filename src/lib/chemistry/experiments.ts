// Experiment registry for the chemistry lab. Each experiment has state,
// parameters, reset/step functions, and an R3F scene component.
//
// We follow the same shape as the physics lab but with a `Scene` React
// component instead of a 2D draw function.

import type { ComponentType } from 'react'

export type ExperimentId =
  | 'periodic-table'
  | 'element-explorer'
  | 'combine'
  | 'molecule-builder'
  | 'isotopes'
  | 'electron-config'
  | 'reaction-simulator'
  | 'ph-scale'
  | 'titration'
  | 'concentration'
  | 'molecule-viewer'

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

export interface Experiment {
  id: ExperimentId
  title: string
  description: string
  icon: string
  params: ParamDef[]
  graphAxes: { yKey: string; yLabel: string }
  passive?: boolean
  applyParams?: (state: any, newParams: Record<string, number>) => any
  reset: (params: Record<string, number>) => ResetResult
  step: (state: any, dt: number, params: Record<string, number>) => StepResult
  render: 'three' | 'dom'
  Panel?: ComponentType<any>
  Scene: ComponentType<any>
}

import { periodicTableExperiment } from './experiments/periodicTable'
import { elementExplorerExperiment } from './experiments/elementExplorer'
import { combineExperiment } from './experiments/combine'
import { moleculeBuilderExperiment } from './experiments/moleculeBuilder'
import { isotopesExperiment } from './experiments/isotopes'
import { electronConfigExperiment } from './experiments/electronConfig'
import { reactionSimulatorExperiment } from './experiments/reactionSimulator'
import { phScaleExperiment } from './experiments/phScale'
import { titrationExperiment } from './experiments/titration'
import { concentrationExperiment } from './experiments/concentration'
import { moleculeViewerExperiment } from './experiments/moleculeViewer'

export const EXPERIMENTS: Experiment[] = [
  periodicTableExperiment,
  elementExplorerExperiment,
  combineExperiment,
  moleculeBuilderExperiment,
  isotopesExperiment,
  electronConfigExperiment,
  reactionSimulatorExperiment,
  phScaleExperiment,
  titrationExperiment,
  concentrationExperiment,
  moleculeViewerExperiment,
]

export const EXPERIMENTS_BY_ID: Record<ExperimentId, Experiment> = EXPERIMENTS.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {} as Record<ExperimentId, Experiment>,
)

export function defaultParams(e: Experiment): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of e.params) out[p.key] = p.default
  return out
}
