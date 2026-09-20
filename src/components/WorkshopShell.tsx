import { ReactNode, useCallback } from 'react'
import { Link } from 'wouter'
import { useCADStore } from '../lib/cad/store'
import { CompanionHeaderButton } from './companion/CompanionHeaderButton'

const workshopInfo: Record<string, { name: string; description: string }> = {
  cad: {
    name: 'CAD',
    description: 'Design and build 3D structures',
  },
  physics: {
    name: 'PHYSICS',
    description: 'Build circuits and experiment',
  },
  chemistry: {
    name: 'CHEMISTRY',
    description: 'Mix substances and observe',
  },
  climate: {
    name: 'EARTH & CLIMATE',
    description: 'Real weather, air quality and seismic data',
  },
}

interface WorkshopShellProps {
  workshopSlug: string
  children: ReactNode
}

export function WorkshopShell({ workshopSlug, children }: WorkshopShellProps) {
  const info = workshopInfo[workshopSlug] || {
    name: 'WORKSHOP',
    description: '',
  }

  const isCAD = workshopSlug === 'cad'
  const newDocument = useCADStore(state => state.newDocument)

  const handleNew = useCallback(() => {
    if (!isCAD) return
    newDocument()
  }, [isCAD, newDocument])

  return (
    <div className="workshop-shell">
      <header className="workshop-header">
        <div className="header-left">
          <Link href="/">
            <button className="back-btn" title="Back to Home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <div className="header-divider" />
          <div className="header-title">
            <h1 className="workshop-name">{info.name}</h1>
            <span className="workshop-desc">{info.description}</span>
          </div>
        </div>

        <div className="header-right">
          {isCAD && (
            <button className="header-action" onClick={handleNew} title="New (Ctrl+N)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span>New</span>
            </button>
          )}
          <div className="header-divider" />
          <CompanionHeaderButton />
        </div>
      </header>

      <div className="workshop-content">
        {children}
      </div>

      <style>{`
        .workshop-shell {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          padding-top: 8px;       /* breathing room below the fixed navbar */
          /* Header (48px) + content (flex: 1) — content fills all remaining height */
        }

        .workshop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-4);
          height: 48px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .back-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .back-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .header-divider {
          width: 1px;
          height: 20px;
          background: var(--border-default);
        }

        .header-title {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
        }

        .workshop-name {
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .workshop-desc {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .header-action {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
        }

        .header-action:hover:not(:disabled) {
          background: var(--bg-elevated);
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .header-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .header-action.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .header-action.primary:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .header-action.primary.success {
          background: var(--success);
          border-color: var(--success);
        }

        .header-action.primary.danger {
          background: var(--danger);
          border-color: var(--danger);
        }

        .workshop-content {
          flex: 1;
          min-height: 0;          /* critical: lets the flex item shrink so children can fill it */
          overflow: hidden;       /* clip rather than grow */
          display: flex;
          flex-direction: column;  /* per-workshop children stack vertically */
          background: var(--bg-primary);
          /* No padding here — we want the per-workshop child (e.g. CAD canvas) to
             fill the full width. The breathing room below the navbar is created
             by .workshop-header's own border and the fixed nav's own bottom border. */
        }

        @media (max-width: 640px) {
          .workshop-desc {
            display: none;
          }

          .header-action span {
            display: none;
          }

          .header-action {
            padding: var(--space-2);
          }
        }
      `}</style>
    </div>
  )
}
