// Zustand store for the chemistry lab. Same shape as the physics store:
// experiment registry, parameters, run/pause/reset, fixed-dt tick, history.
// The chemistry experiments don't all need a fixed-dt integrator (most are
// "passive" / closed-form: titration curve, periodic table, etc.), so we
// support a `passive` flag like the physics registry does.

import { create } from 'zustand'
import {
  EXPERIMENTS_BY_ID,
  Experiment,
  ExperimentId,
  ResetResult,
  StepResult,
  defaultParams,
} from './experiments'

export interface HistorySample {
  t: number
  y: number
  v?: number
  x?: number
  // Free-form additional axis labels.
  [k: string]: number | undefined
}

export interface ChemistryStore {
  experimentId: ExperimentId | null
  params: Record<string, number>
  state: any
  running: boolean
  paused: boolean
  t: number
  history: HistorySample[]
  measurements: Record<string, number>

  setExperiment: (id: ExperimentId) => void
  setParam: (key: string, value: number) => void
  setParams: (p: Record<string, number>) => void
  play: () => void
  pause: () => void
  togglePause: () => void
  reset: () => void
  tick: (frameDt: number) => void
}

function initialForExperiment(e: Experiment): ResetResult {
  return e.reset(defaultParams(e))
}

export const useChemistryStore = create<ChemistryStore>((set, get) => ({
  experimentId: 'periodic-table',
  params: defaultParams(EXPERIMENTS_BY_ID['periodic-table']),
  state: initialForExperiment(EXPERIMENTS_BY_ID['periodic-table']).state,
  running: false,
  paused: false,
  t: 0,
  history: [],
  measurements: initialForExperiment(EXPERIMENTS_BY_ID['periodic-table']).measurements,

  setExperiment(id) {
    const e = EXPERIMENTS_BY_ID[id]
    if (!e) return
    const params = defaultParams(e)
    const init = e.reset(params)
    set({
      experimentId: id,
      params,
      state: init.state,
      running: false,
      paused: false,
      t: 0,
      history: [],
      measurements: init.measurements,
    })
  },

  setParam(key, value) {
    const { params, experimentId, state, running } = get()
    if (!experimentId) {
      set({ params: { ...params, [key]: value } })
      return
    }
    const e = EXPERIMENTS_BY_ID[experimentId]
    if (!e) return
    const newParams = { ...params, [key]: value }

    let nextState = state
    let nextT = get().t
    let nextHistory = get().history
    let nextMeasurements = get().measurements

    if (e.passive) {
      // Passive: just recompute measurements from the live state with new
      // params. State itself doesn't change for slider tweaks in a passive
      // experiment.
      const r = e.step(nextState, 0, newParams)
      nextState = r.nextState
      nextMeasurements = r.measurements
    } else if (running) {
      if (e.applyParams) {
        try {
          nextState = e.applyParams(state, newParams)
        } catch {
          // fall through
        }
      }
      const r = e.step(nextState, 0, newParams)
      nextState = r.nextState
      nextMeasurements = r.measurements
    } else {
      const init = e.reset(newParams)
      nextState = init.state
      nextT = 0
      nextHistory = []
      nextMeasurements = init.measurements
    }

    set({
      params: newParams,
      state: nextState,
      t: nextT,
      history: nextHistory,
      measurements: nextMeasurements,
    })
  },

  setParams(p) {
    set({ params: { ...get().params, ...p } })
  },

  play() { set({ running: true, paused: false }) },
  pause() { set({ running: false, paused: true }) },
  togglePause() {
    const { running, paused } = get()
    if (running) set({ running: false, paused: true })
    else if (paused) set({ running: true, paused: false })
    else set({ running: true })
  },

  reset() {
    const { experimentId, params } = get()
    if (!experimentId) return
    const e = EXPERIMENTS_BY_ID[experimentId]
    if (!e) return
    const init = e.reset(params)
    set({
      state: init.state,
      running: false,
      paused: false,
      t: 0,
      history: [],
      measurements: init.measurements,
    })
  },

  tick(frameDt) {
    const { experimentId, state, running, t, params, history } = get()
    if (!experimentId || !running) return
    const e = EXPERIMENTS_BY_ID[experimentId]
    if (!e) return
    // Chemistry experiments are mostly passive or use small fixed steps.
    // We use a 60 Hz fixed dt so live running visuals (combustion, gas
    // particles) move smoothly.
    const FIXED_DT = 1 / 60
    const budget = Math.min(frameDt, 0.1)
    let remaining = budget
    let curState = state
    let curT = t
    let lastResult: StepResult | null = null
    let lastSample: any = null
    while (remaining > 0) {
      const dt = Math.min(FIXED_DT, remaining)
      const r: StepResult = e.step(curState, dt, params)
      curState = r.nextState
      curT += dt
      remaining -= dt
      lastResult = r
      lastSample = r.sample
    }
    if (!lastResult) return
    const yKey = e.graphAxes.yKey
    const newSample: HistorySample = {
      t: curT,
      y: lastSample[yKey] ?? 0,
      v: lastSample.v,
      x: lastSample.x,
    }
    const nextHistory = history.length >= 600
      ? [...history.slice(1), newSample]
      : [...history, newSample]
    set({
      state: curState,
      t: curT,
      history: nextHistory,
      measurements: lastResult.measurements,
    })
  },
}))
