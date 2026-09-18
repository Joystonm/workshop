// Zustand store for the Climate lab. Each experiment is a pure data
// view — every Scene component fetches its own data on mount, and the
// store holds only the active experiment id and a shared
// measurements record so the AI Companion can read what the user sees.

import { create } from 'zustand'

export interface ClimateStore {
  experimentId: string | null
  measurements: Record<string, number | string>
  setExperiment: (id: string) => void
  setMeasurement: (key: string, value: number | string) => void
  clearMeasurements: () => void
}

export const useClimateStore = create<ClimateStore>((set) => ({
  experimentId: null,
  measurements: {},
  setExperiment(id) {
    set({ experimentId: id, measurements: {} })
  },
  setMeasurement(key, value) {
    set((s) => ({ measurements: { ...s.measurements, [key]: value } }))
  },
  clearMeasurements() {
    set({ measurements: {} })
  },
}))