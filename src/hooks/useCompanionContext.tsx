// Workshop-wide context for the AI Companion. Every workshop page registers
// the active experiment (id, title, objective, parameters, measurements,
// results, formulas) here so the floating companion button can read it
// without each workshop needing to know the companion's API.

import { createContext, useContext, ReactNode, useRef, useState, useCallback, useMemo } from 'react'

export interface CompanionSnapshot {
  // Section is the workshop slug, e.g. 'physics', 'chemistry', 'climate', 'cad'.
  section: string
  // Experiment id — free-form string. Use the experiment's registry id when
  // available so threads reuse sensibly across visits.
  experimentId: string
  experimentTitle: string
  // One-line student-facing goal.
  objective?: string
  // Parameters the student set (e.g. { length: 1.2, mass: 2 }).
  params?: Record<string, unknown>
  // Live measurements (e.g. { period: 2.20, vmax: 3.4 }).
  measurements?: Record<string, unknown>
  // Calculated results / errors (e.g. { expectedPeriod: 2.20, error: 0.0 }).
  results?: Record<string, unknown>
  // Short hint-formula strings ("T = 2π√(L/g)", "pH = -log[H+]").
  formulas?: string[]
  // If the experiment produced a failure message, surface it here.
  errorMessage?: string
  // Free-form notes — short pedagogical hints already shown in the UI.
  notes?: string
  // Parameter definitions with labels/units/options. Lets the agent resolve
  // numeric indices (e.g. reaction=5 → "HCl + NaOH") without inventing.
  paramDefs?: Array<{
    key: string
    label: string
    unit?: string
    min?: number
    max?: number
    options?: string[]
  }>
  // Raw experiment state — chemistry/combine holds the full Reaction here,
  // molecule-builder holds the Molecule, etc. The agent should read this
  // to understand what's actually loaded, not just the numeric index.
  state?: unknown
  // Plain-English summary of what's currently happening in the experiment.
  // Built by the workshop, so the agent gets a sentence it can quote back
  // without re-interpreting raw state.
  stateSummary?: string
}

interface CompanionContextValue {
  snapshot: CompanionSnapshot | null
  setSnapshot: (s: CompanionSnapshot | null) => void
  // Update only certain fields without forcing the caller to remember the
  // rest. Useful when the student drags a slider and only `params` changes.
  patchSnapshot: (patch: Partial<CompanionSnapshot>) => void
}

const CompanionContext = createContext<CompanionContextValue>({
  snapshot: null,
  setSnapshot: () => {},
  patchSnapshot: () => {},
})

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshotState] = useState<CompanionSnapshot | null>(null)
  const setSnapshot = useCallback((s: CompanionSnapshot | null) => setSnapshotState(s), [])
  const patchSnapshot = useCallback((patch: Partial<CompanionSnapshot>) => {
    setSnapshotState((prev) => (prev ? { ...prev, ...patch } : { ...(patch as CompanionSnapshot) }))
  }, [])
  const value = useMemo(() => ({ snapshot, setSnapshot, patchSnapshot }), [snapshot, setSnapshot, patchSnapshot])
  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>
}

export function useCompanionContext() {
  return useContext(CompanionContext)
}

// Convenience hook for a workshop to publish itself. The `key` argument lets
// the workshop reset the snapshot whenever the active experiment changes.
export function usePublishCompanion(key: string, snapshot: Omit<CompanionSnapshot, 'section'> & { section?: string }) {
  const { setSnapshot } = useCompanionContext()
  const lastKey = useRef<string | null>(null)
  if (lastKey.current !== key) {
    lastKey.current = key
    // Fill in section with a placeholder if the caller didn't set it. The
    // workshop shell normally sets it, so this is only a safety net.
    setSnapshot({ section: 'unknown', ...snapshot })
  }
}
