// Companion panel host. Mounted once at app root. The trigger button lives
// in the workshop header (CompanionHeaderButton). This component just
// renders the slide-up panel when the UI store says it's open.

import { useEffect, useMemo } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCompanionContext, CompanionSnapshot } from '../../hooks/useCompanionContext'
import { CompanionPanel } from './CompanionPanel'
import { suggestedQuestionsFor } from './suggestions'
import { useCompanionUI } from '../../lib/companion/store'

const SESSION_KEY = 'workshop.companion.sessionId'

function ensureSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const fresh = `s_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
    localStorage.setItem(SESSION_KEY, fresh)
    return fresh
  } catch {
    return `s_${Math.random().toString(36).slice(2)}`
  }
}

export function CompanionFab() {
  const { snapshot } = useCompanionContext()
  const open = useCompanionUI((s) => s.open)
  const setOpen = useCompanionUI((s) => s.setOpen)
  const sessionId = useMemo(() => ensureSessionId(), [])

  const ensureSession = useMutation(api.companion.ensureSession)
  useEffect(() => {
    void ensureSession({ sessionId }).catch(() => {})
  }, [sessionId, ensureSession])

  const hasContext = !!snapshot?.experimentId
  const suggestions = useMemo(
    () => (snapshot ? suggestedQuestionsFor(snapshot) : []),
    [snapshot],
  )

  if (!hasContext) return null
  if (!open) return null

  return (
    <CompanionPanel
      sessionId={sessionId}
      snapshot={snapshot as CompanionSnapshot}
      suggestions={suggestions}
      onClose={() => setOpen(false)}
    />
  )
}
