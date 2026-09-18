// Tiny UI store for the AI Companion. Keeps the "panel open" flag in one
// place so the header button (WorkshopShell) and the panel itself
// (CompanionHost, mounted at app root) stay in sync.

import { create } from 'zustand'

interface CompanionUIState {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

export const useCompanionUI = create<CompanionUIState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
