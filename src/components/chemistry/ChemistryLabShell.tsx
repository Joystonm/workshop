// Chemistry lab shell. Mirrors the physics LabShell: 200px left rail,
// R3F canvas in the centre, 300px right panel with controls + graph.

import { useEffect } from 'react'
import { useChemistryStore } from '../../lib/chemistry/store'
import { EXPERIMENTS, ExperimentId, EXPERIMENTS_BY_ID } from '../../lib/chemistry/experiments'
import { ChemistryIcon } from './ChemistryIcons'
import { ActiveChemistryScene } from './ActiveChemistryScene'
import { ChemistryControlsPanel } from './ControlsPanel'
import { ChemistryGraph } from './ChemistryGraph'
import { useCompanionContext } from '../../hooks/useCompanionContext'
import { summarizeChemistryExperiment } from '../../lib/chemistry/companionSummary'

export function ChemistryLabShell() {
  const experimentId = useChemistryStore((s) => s.experimentId)
  const setExperiment = useChemistryStore((s) => s.setExperiment)
  const t = useChemistryStore((s) => s.t)
  const running = useChemistryStore((s) => s.running)
  const paused = useChemistryStore((s) => s.paused)
  const measurements = useChemistryStore((s) => s.measurements)
  const params = useChemistryStore((s) => s.params)
  const state = useChemistryStore((s) => s.state)
  const { setSnapshot } = useCompanionContext()

  // Publish active chemistry experiment to the Companion.
  useEffect(() => {
    if (!experimentId) return
    const exp = EXPERIMENTS_BY_ID[experimentId] ?? EXPERIMENTS.find((e) => e.id === experimentId)
    if (!exp) return
    const stateSummary = summarizeChemistryExperiment(exp.id, params, state, measurements)
    setSnapshot({
      section: 'chemistry',
      experimentId: exp.id,
      experimentTitle: exp.title,
      objective: exp.description,
      params: { ...params },
      measurements: { ...measurements },
      paramDefs: exp.params.map((p) => ({
        key: p.key,
        label: p.label,
        unit: p.unit,
        min: p.min,
        max: p.max,
        // Include raw options array for index→label lookup when present
        options: (p as any).options,
      })),
      state,
      stateSummary,
      formulas: [
        'pH = -log[H⁺]',
        'pOH = -log[OH⁻]',
        'pH + pOH = 14',
        'M = n / V',
        'A = Z + N',
      ],
    })
    return () => setSnapshot(null)
  }, [experimentId, params, measurements, state, setSnapshot])

  // Pick a few top-level measurements to show in the status bar.
  const statusMeasureKeys: Record<string, string[]> = {
    'periodic-table': ['selected_z', 'atomic_mass'],
    'element-explorer': ['z', 'atomic_mass'],
    'combine': ['reaction', 'dH'],
    'molecule-builder': ['atoms', 'bonds'],
    'isotopes': ['a', 'n'],
    'electron-config': ['z', 'electrons'],
    'reaction-simulator': ['dH', 'type'],
    'ph-scale': ['pH', 'h_conc'],
    'titration': ['Vb', 'pH', 'Veq'],
    'concentration': ['molarity', 'n'],
    'molecule-viewer': ['atoms', 'bonds'],
  }
  const keys = statusMeasureKeys[experimentId ?? ''] ?? []

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
              <ChemistryIcon name={ex.icon} active={ex.id === experimentId} />
              <span className="rail-item-title">{ex.title}</span>
            </button>
          ))}
        </div>
        <div className="rail-footer">
          <span className="rail-foot-label">Chem lab</span>
          <span className="rail-foot-hint">
            {EXPERIMENTS.length} experiments ready.
            Real elements, real reactions, real molecules.
          </span>
        </div>
      </aside>

      {/* Center stage - 3D canvas + status bar */}
      <main className="lab-stage">
        <div className="lab-canvas-area">
          <ActiveChemistryScene />
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
            {keys.map((k) => {
              const v = measurements[k]
              if (v === undefined) return null
              return (
                <span key={k} className="status-text">
                  {k.replace(/_/g, ' ')} = {typeof v === 'number' ? v.toFixed(3) : v}
                </span>
              )
            })}
          </div>
        </div>
      </main>

      {/* Right panel - controls + graph */}
      <aside className="lab-panel">
        <ChemistryControlsPanel />
        <div className="panel-graph">
          <h3 className="section-title">History</h3>
          <ChemistryGraph height={140} />
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
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .rail-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .rail-item.active {
          background: rgba(147, 51, 234, 0.08);
          color: var(--ws-chemistry);
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
          position: relative;
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
