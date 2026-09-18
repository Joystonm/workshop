import { useWorkshop } from '../hooks/useWorkshop'

const workshopStats = [
  { slug: 'cad', name: 'CAD', completed: 0, attempted: 0, total: 8 },
  { slug: 'physics', name: 'PHYSICS', completed: 0, attempted: 0, total: 12 },
  { slug: 'chemistry', name: 'CHEMISTRY', completed: 0, attempted: 0, total: 10 },
  { slug: 'climate', name: 'EARTH & CLIMATE', completed: 0, attempted: 0, total: 8 },
]

export function ProgressPage() {
  const totalExperiments = workshopStats.reduce((sum, w) => sum + w.total, 0)
  const totalCompleted = workshopStats.reduce((sum, w) => sum + w.completed, 0)

  return (
    <div className="progress-page">
      <header className="page-header">
        <h1>Progress</h1>
        <p>Track your journey through the workshops</p>
      </header>

      {/* Overview */}
      <section className="overview-section">
        <div className="overview-card">
          <div className="overview-stat">
            <span className="stat-number">{totalCompleted}</span>
            <span className="stat-divider">/</span>
            <span className="stat-total">{totalExperiments}</span>
            <span className="stat-label">experiments completed</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(totalCompleted / totalExperiments) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Workshop Progress */}
      <section className="workshops-section">
        <h2 className="section-title">Workshop Progress</h2>
        <div className="workshops-list">
          {workshopStats.map((workshop) => (
            <div key={workshop.slug} className="workshop-row">
              <div className="workshop-info">
                <span className="workshop-name">{workshop.name}</span>
                <span className="workshop-meta">{workshop.attempted} attempted</span>
              </div>
              <div className="workshop-progress">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(workshop.completed / workshop.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="workshop-count">{workshop.completed}/{workshop.total}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-empty">
          <p>No recent activity</p>
          <span>Start experimenting to see your history here</span>
        </div>
      </section>

      <style>{`
        .progress-page {
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

        .section-title {
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: var(--space-4);
        }

        .overview-section {
          margin-bottom: var(--space-10);
        }

        .overview-card {
          padding: var(--space-6);
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
        }

        .overview-stat {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .stat-number {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--accent);
          letter-spacing: -0.02em;
        }

        .stat-divider {
          font-size: var(--text-xl);
          color: var(--text-muted);
        }

        .stat-total {
          font-size: var(--text-xl);
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-left: var(--space-2);
        }

        .progress-bar {
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .workshops-section {
          margin-bottom: var(--space-10);
        }

        .workshops-list {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .workshop-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
        }

        .workshop-row:last-child {
          border-bottom: none;
        }

        .workshop-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .workshop-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }

        .workshop-meta {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .workshop-progress {
          width: 100px;
        }

        .progress-track {
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .workshop-row .progress-fill {
          background: var(--text-muted);
        }

        .workshop-count {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
          width: 40px;
          text-align: right;
        }

        .activity-section {
          margin-bottom: var(--space-8);
        }

        .activity-empty {
          padding: var(--space-8);
          background: var(--bg-secondary);
          border: 1px dashed var(--border-default);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .activity-empty p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--space-1);
        }

        .activity-empty span {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}
