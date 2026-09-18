// Physics lab shell - mirrors the CAD layout pattern:
// left rail (experiment list) | stage (canvas + status bar) | right panel
// (controls + graph). Every level of the flex chain has min-height: 0 /
// min-width: 0 so the children can shrink and grow correctly.

import { useEffect } from 'react'
import { usePhysicsStore } from '../../lib/physics/store'
import { EXPERIMENTS, ExperimentId } from '../../lib/physics/experiments'
import { ActiveExperiment } from './ActiveExperiment'
import { ControlsPanel } from './ControlsPanel'
import { MiniGraph } from './MiniGraph'
import { useCompanionContext } from '../../hooks/useCompanionContext'

export function LabShell() {
  const experimentId = usePhysicsStore((s) => s.experimentId)
  const setExperiment = usePhysicsStore((s) => s.setExperiment)
  const t = usePhysicsStore((s) => s.t)
  const running = usePhysicsStore((s) => s.running)
  const paused = usePhysicsStore((s) => s.paused)
  const measurements = usePhysicsStore((s) => s.measurements)
  const params = usePhysicsStore((s) => s.params)
  const { setSnapshot } = useCompanionContext()

  // Publish the active experiment to the AI Companion. Recomputes when the
  // experiment changes OR when measurements/params change so the assistant
  // always sees current data.
  useEffect(() => {
    if (!experimentId) return
    const exp = EXPERIMENTS.find((e) => e.id === experimentId)
    if (!exp) return
    setSnapshot({
      section: 'physics',
      experimentId: exp.id,
      experimentTitle: exp.title,
      objective: exp.description,
      params: { ...params },
      measurements: { ...measurements },
      formulas: [
        // Lightweight formula hints per experiment family.
        'T = 2π√(L/g)            (pendulum period)',
        'v = u + at              (kinematics)',
        'F = ma                  (Newton 2nd law)',
        'KE = ½mv²                (kinetic energy)',
        'PE = mgh                (potential energy)',
      ],
    })
    return () => setSnapshot(null)
  }, [experimentId, params, measurements, setSnapshot])

  return (
    <div className="lab-shell">
      {/* Left rail - experiment picker */}
      <aside className="lab-rail">
        <div className="rail-header">
          <span className="rail-title">EXPERIMENTS</span>
        </div>
        <div className="rail-list">
          {EXPERIMENTS.map((ex) => (
            <button
              key={ex.id}
              className={`rail-item ${ex.id === experimentId ? 'active' : ''}`}
              onClick={() => setExperiment(ex.id as ExperimentId)}
              title={ex.description}
            >
              <ExperimentIcon name={ex.icon} active={ex.id === experimentId} />
              <span className="rail-item-title">{ex.title}</span>
            </button>
          ))}
        </div>
        <div className="rail-footer">
          <span className="rail-foot-label">Priority set</span>
          <span className="rail-foot-hint">
            {EXPERIMENTS.length} experiments ready.
            More coming in phase 2.
          </span>
        </div>
      </aside>

      {/* Center stage - canvas + status bar */}
      <main className="lab-stage">
        <div className="lab-canvas-area">
          <ActiveExperiment />
        </div>
        <div className="lab-status-bar">
          <div className="status-left">
            <span className={`status-dot ${running ? 'on' : paused ? 'pause' : 'off'}`} />
            <span className="status-text">
              {running ? 'Running' : paused ? 'Paused' : 'Stopped'}
            </span>
            <span className="status-sep">·</span>
            <span className="status-text">t = {t.toFixed(3)} s</span>
          </div>
          <div className="status-right">
            {Object.entries(measurements).slice(0, 2).map(([k, v]) => (
              <span key={k} className="status-text">
                {k.replace(/_/g, ' ')} = {typeof v === 'number' ? v.toFixed(3) : v}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Right panel - controls + graph */}
      <aside className="lab-panel">
        <ControlsPanel />
        <div className="panel-graph">
          <h3 className="section-title">History</h3>
          <MiniGraph height={140} />
        </div>
      </aside>

      <style>{`
        .lab-shell {
          flex: 1;
          min-height: 0;
          min-width: 0;
          display: flex;
          background: var(--bg-primary);
          overflow: hidden;
        }
        .lab-rail {
          width: 200px;
          flex-shrink: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .rail-header {
          padding: var(--space-3) var(--space-3) var(--space-2);
          border-bottom: 1px solid var(--border-subtle);
        }
        .rail-title {
          font-size: 10px;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--text-muted);
        }
        .rail-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: var(--space-1);
        }
        .rail-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-2);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
          margin-bottom: 2px;
        }
        .rail-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .rail-item.active {
          background: var(--accent-dim);
          color: var(--accent);
        }
        .rail-item-title { flex: 1; }
        .rail-footer {
          padding: var(--space-3);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rail-foot-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .rail-foot-hint {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .lab-stage {
          flex: 1;
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          overflow: hidden;
        }
        .lab-canvas-area {
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
        }
        .lab-status-bar {
          height: 28px;
          flex-shrink: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-3);
          font-size: 10px;
          color: var(--text-muted);
          font-family: ui-monospace, monospace;
        }
        .status-left, .status-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .status-dot.on { background: var(--success); }
        .status-dot.pause { background: var(--warning); }
        .status-sep { opacity: 0.4; }

        .lab-panel {
          width: 300px;
          flex-shrink: 0;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .lab-panel .controls-panel {
          flex-shrink: 0;
          max-height: 60%;
          overflow-y: auto;
        }
        .panel-graph {
          flex: 1;
          min-height: 0;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          border-top: 1px solid var(--border-subtle);
        }
        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
        }
        @media (max-width: 900px) {
          .lab-rail { width: 160px; }
          .lab-panel { width: 260px; }
        }
      `}</style>
    </div>
  )
}

function ExperimentIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'var(--accent)' : 'currentColor'
  const size = 18
  switch (name) {
    case 'pendulum':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M12 4v1" />
          <line x1="6" y1="5" x2="18" y2="5" />
          <line x1="12" y1="5" x2="12" y2="14" />
          <circle cx="12" cy="17" r="2.5" fill={active ? 'var(--accent)' : 'none'} />
        </svg>
      )
    case 'projectile':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 19h18" />
          <path d="M5 19c0-6 5-10 10-12" />
          <circle cx="15" cy="7" r="1.5" fill={active ? 'var(--accent)' : 'none'} />
        </svg>
      )
    case 'freefall':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <line x1="12" y1="3" x2="12" y2="15" />
          <polyline points="9 12 12 15 15 12" />
          <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      )
    case 'spring':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <line x1="3" y1="12" x2="6" y2="12" />
          <path d="M6 12c2-2 2-2 4 0s2 2 4 0 2-2 4 0 2 2 4 0" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <rect x="20" y="9" width="2" height="6" />
        </svg>
      )
    case 'collision':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <circle cx="8" cy="12" r="3" fill={active ? 'var(--accent)' : 'none'} />
          <circle cx="16" cy="12" r="3" fill={active ? 'var(--accent)' : 'none'} opacity="0.5" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
        </svg>
      )
    case 'incline':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 20h18" />
          <path d="M3 20L18 6" />
          <rect x="9" y="14" width="6" height="4" transform="rotate(-31 12 16)" fill={active ? 'var(--accent)' : 'none'} />
        </svg>
      )
    case 'waves':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
        </svg>
      )
    case 'sound':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
          <line x1="3" y1="6" x2="3" y2="18" />
          <line x1="21" y1="6" x2="21" y2="18" opacity="0.4" strokeDasharray="2 2" />
        </svg>
      )
    case 'beats':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 12c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0" />
          <path d="M3 12c1.5 3 3 3 4.5 0s3-3 4.5 0 3 3 4.5 0 3-3 4.5 0" opacity="0.5" />
        </svg>
      )
    case 'buoyancy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <line x1="3" y1="9" x2="21" y2="9" />
          <path d="M3 9c0 5 4 9 9 9s9-4 9-9" />
          <rect x="10" y="11" width="4" height="3" fill={active ? 'var(--accent)' : 'none'} />
        </svg>
      )
    case 'hooke':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <line x1="6" y1="3" x2="18" y2="3" />
          <path d="M12 3v2c0 1 0 1-1 2s-1 1 0 2 1 1 0 2-1 1 0 2 1 1 1 1 1 2v1" />
          <rect x="9" y="17" width="6" height="3" fill={active ? 'var(--accent)' : 'none'} />
        </svg>
      )
    case 'newton':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <rect x="6" y="9" width="6" height="6" fill={active ? 'var(--accent)' : 'none'} />
          <line x1="3" y1="18" x2="21" y2="18" />
          <path d="M12 6V3" />
          <path d="M10 4l2-1 2 1" />
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
          <circle cx="12" cy="12" r="6" />
        </svg>
      )
  }
}
