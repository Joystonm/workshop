// Header "Ask Agent" button. Rendered inside WorkshopShell's header-right.
// Reads `open` from the companion UI store; opens the CompanionPanel on click.

import { useCompanionUI } from '../../lib/companion/store'

export function CompanionHeaderButton() {
  const open = useCompanionUI((s) => s.open)
  const toggle = useCompanionUI((s) => s.toggle)

  return (
    <button
      type="button"
      className={`header-action companion-trigger ${open ? 'open' : ''}`}
      onClick={toggle}
      title={open ? 'Hide companion' : 'Ask the AI agent about this experiment'}
      aria-label={open ? 'Hide companion' : 'Ask the AI agent about this experiment'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="M5.6 5.6l2.8 2.8" />
        <path d="M15.6 15.6l2.8 2.8" />
        <path d="M5.6 18.4l2.8-2.8" />
        <path d="M15.6 8.4l2.8-2.8" />
      </svg>
      <span>{open ? 'Close Agent' : 'Ask Agent'}</span>

      <style>{`
        .companion-trigger {
          /* inherits .header-action styling — just adds the open-state colour */
        }
        .companion-trigger.open {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        .companion-trigger:hover:not(:disabled) {
          border-color: var(--accent);
        }
      `}</style>
    </button>
  )
}
