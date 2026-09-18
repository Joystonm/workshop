// Zustand store for the physics lab. Holds the active experiment, its
// parameters, run state, the simulation state itself, history samples, and
// derived measurements. The `tick` action is driven by the rAF loop in
// the canvas view and advances the active experiment by a fixed dt.

import { create } from 'zustand'
import {
  EXPERIMENTS_BY_ID,
  Experiment,
  ExperimentId,
  ResetResult,
  StepResult,
  defaultParams,
} from './experiments'
import { FIXED_DT, HISTORY_LIMIT } from './engine'

export interface HistorySample {
  t: number
  y: number
  v?: number
  x?: number
}

export interface PhysicsStore {
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

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
  experimentId: 'pendulum',
  params: defaultParams(EXPERIMENTS_BY_ID.pendulum),
  state: initialForExperiment(EXPERIMENTS_BY_ID.pendulum).state,
  running: false,
  paused: false,
  t: 0,
  history: [],
  measurements: initialForExperiment(EXPERIMENTS_BY_ID.pendulum).measurements,

  setExperiment(id) {
    const e = EXPERIMENTS_BY_ID[id]
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
    const newParams = { ...params, [key]: value }
    if (!experimentId) {
      set({ params: newParams })
      return
    }
    const e = EXPERIMENTS_BY_ID[experimentId]

    // Three cases:
    //  1) passive experiment (Hooke, Waves): step with dt=0 so the visual
    //     reflects the new params live.
    //  2) running: just step with dt=0 so measurements update, the running
    //     integrator picks up the new params on the next tick.
    //  3) NOT running: do a full reset so the new params take effect
    //     visually. This is the case the user kept hitting — they would
    //     change a slider, the measurement text would update, but the
    //     canvas state (e.g. spring.x, pendulum.theta) would still reflect
    //     the *old* initial conditions.
    let nextState = state
    let nextT = get().t
    let nextHistory = get().history
    let nextMeasurements = get().measurements

    if (e.passive) {
      // Passive: step with new params. dt=0 just recomputes measurements
      // and sample, doesn't advance time.
      const r = e.step(nextState, 0, newParams)
      nextState = r.nextState
      nextMeasurements = r.measurements
    } else if (running) {
      // Live: keep the integrator running, just refresh measurements.
      // If the experiment exposes applyParams, use it to apply the new
      // param to the live state (e.g. collision rebuilds the balls).
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
      // Idle: do a full reset so the new params take effect visually.
      // This is the key fix — before, the state was left untouched, so
      // the canvas kept showing the old simulation while measurements
      // (recomputed from a synthetic reset) showed the new values.
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

  play() {
    set({ running: true, paused: false })
  },
  pause() {
    set({ running: false, paused: true })
  },
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
    // Sub-step at FIXED_DT up to a max of ~0.1s per frame to avoid spiral of death.
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

    // Append history (one sample per frame is enough for graphs at 60 Hz).
    const yKey = e.graphAxes.yKey
    const newSample: HistorySample = {
      t: curT,
      y: lastSample[yKey] ?? 0,
      v: lastSample.v,
      x: lastSample.x,
    }
    const nextHistory = history.length >= HISTORY_LIMIT
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
