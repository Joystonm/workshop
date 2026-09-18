// Right-side controls panel: parameter sliders, run/pause/reset, and a
// live "Measurements" card. The sliders and measurements come straight
// from the experiment's ParamDef and the live store.measurements.

import { usePhysicsStore } from '../../lib/physics/store'
import { EXPERIMENTS_BY_ID } from '../../lib/physics/experiments'
import { fmt } from '../../lib/physics/engine'

export function ControlsPanel() {
  const experimentId = usePhysicsStore((s) => s.experimentId)
  const params = usePhysicsStore((s) => s.params)
  const running = usePhysicsStore((s) => s.running)
  const paused = usePhysicsStore((s) => s.paused)
  const measurements = usePhysicsStore((s) => s.measurements)
  const t = usePhysicsStore((s) => s.t)
  const setParam = usePhysicsStore((s) => s.setParam)
  const play = usePhysicsStore((s) => s.play)
  const togglePause = usePhysicsStore((s) => s.togglePause)
  const reset = usePhysicsStore((s) => s.reset)

  if (!experimentId) return null
  const expt = EXPERIMENTS_BY_ID[experimentId]

  return (
    <div className="controls-panel">
      {/* Buttons */}
      <div className="action-row">
        {!running ? (
          <button className="btn primary" onClick={play} title="Start">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            <span>{paused ? 'Resume' : 'Run'}</span>
          </button>
        ) : (
          <button className="btn" onClick={togglePause} title="Pause">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
            <span>Pause</span>
          </button>
        )}
        <button className="btn" onClick={reset} title="Reset">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <polyline points="21 3 21 8 16 8" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      {/* Parameters */}
      <div className="section">
        <h3 className="section-title">Parameters</h3>
        <div className="param-list">
          {expt.params.map((p) => {
            const v = params[p.key] ?? p.default
            return (
              <div key={p.key} className="param">
                <div className="param-head">
                  <label className="param-label">{p.label}</label>
                  <span className="param-value">
                    {fmt(v, 3)} <span className="param-unit">{p.unit}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={v}
                  onChange={(e) => setParam(p.key, parseFloat(e.target.value))}
                />
                <div className="param-bounds">
                  <span>{p.min}</span>
                  <span>{p.max}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live measurements */}
      <div className="section">
        <h3 className="section-title">Live measurements</h3>
        <div className="measurements">
          <div className="ms-row">
            <span className="ms-key">sim t</span>
            <span className="ms-val">{fmt(t, 3)} s</span>
          </div>
          {Object.entries(measurements).map(([k, v]) => (
            <div key={k} className="ms-row">
              <span className="ms-key">{labelFor(k)}</span>
              <span className="ms-val">
                {typeof v === 'number' ? fmt(v, 3) : String(v)} {unitFor(k)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .controls-panel {
          padding: var(--space-3) var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .action-row {
          display: flex;
          gap: var(--space-2);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: 6px 10px;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          flex: 1;
          transition: all var(--transition-fast);
        }
        .btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .btn.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        .btn.primary:hover { background: var(--accent-hover); }
        .section { display: flex; flex-direction: column; gap: 6px; }
        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
        }
        .param-list { display: flex; flex-direction: column; gap: 8px; }
        .param { display: flex; flex-direction: column; gap: 2px; }
        .param-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        .param-label {
          font-size: var(--text-sm);
          color: var(--text-primary);
        }
        .param-value {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-family: ui-monospace, monospace;
        }
        .param-unit { color: var(--text-muted); }
        .param input[type="range"] {
          width: 100%;
          accent-color: var(--accent);
        }
        .param-bounds {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: var(--text-muted);
          font-family: ui-monospace, monospace;
        }
        .measurements { display: flex; flex-direction: column; gap: 2px; }
        .ms-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          font-family: ui-monospace, monospace;
          padding: 1px 0;
        }
        .ms-key { color: var(--text-muted); }
        .ms-val { color: var(--text-primary); }
      `}</style>
    </div>
  )
}

function labelFor(k: string): string {
  return k.replace(/_/g, ' ')
}

function unitFor(k: string): string {
  if (k.startsWith('T_') || k === 'flightTime' || k === 'landTime') return 's'
  if (k === 'KE' || k === 'PE' || k === 'E_total') return 'J'
  if (k === 'speed' || k === 'v_impact_theory') return 'm/s'
  if (k.startsWith('R_') || k === 'range') return 'm'
  if (k.startsWith('H_') || k === 'maxHeight') return 'm'
  if (k === 'theta' || k === 'omega') return ''
  return ''
}
