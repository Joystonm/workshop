import { Link } from 'wouter'

export function MyExperiments() {
  return (
    <div className="my-experiments">
      <header className="page-header">
        <h1>My Experiments</h1>
        <p>Your saved projects and experiment history</p>
      </header>

      <div className="experiments-empty">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M16 12V8a2 2 0 012-2h12a2 2 0 012 2v4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="34" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <h3>Nothing built yet</h3>
        <p>Start with a blank workspace.</p>
        <Link href="/">
          <a className="start-link">Enter a Workshop</a>
        </Link>
      </div>

      <style>{`
        .my-experiments {
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: var(--space-12);
          max-width: 640px;
          margin: 0 auto;
          padding-left: var(--space-6);
          padding-right: var(--space-6);
          background: var(--bg-primary);
        }

        .page-header {
          margin-bottom: var(--space-8);
        }

        .page-header h1 {
          font-size: var(--text-2xl);
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: var(--space-2);
        }

        .page-header p {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        .experiments-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-12);
          background: var(--bg-secondary);
          border: 1px dashed var(--border-default);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.5;
          margin-bottom: var(--space-6);
        }

        .experiments-empty h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .experiments-empty p {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-bottom: var(--space-6);
        }

        .start-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--accent);
          color: white;
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .start-link:hover {
          background: var(--accent-hover);
        }
      `}</style>
    </div>
  )
}
