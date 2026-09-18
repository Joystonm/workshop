// Controls panel for the chemistry lab. Same pattern as the physics
// ControlsPanel: list of param sliders, run/pause/reset buttons, and
// live measurements.

import { useChemistryStore } from '../../lib/chemistry/store'
import { EXPERIMENTS_BY_ID, ExperimentId } from '../../lib/chemistry/experiments'
import { MOLECULES } from '../../lib/chemistry/molecules'
import { REACTIONS } from '../../lib/chemistry/reactions'
import { ELEMENTS, getElementByZ } from '../../lib/chemistry/elements'

export function ChemistryControlsPanel() {
  const experimentId = useChemistryStore((s) => s.experimentId)
  const params = useChemistryStore((s) => s.params)
  const setParam = useChemistryStore((s) => s.setParam)
  const running = useChemistryStore((s) => s.running)
  const paused = useChemistryStore((s) => s.paused)
  const play = useChemistryStore((s) => s.play)
  const pause = useChemistryStore((s) => s.pause)
  const togglePause = useChemistryStore((s) => s.togglePause)
  const measurements = useChemistryStore((s) => s.measurements)

  if (!experimentId) return null
  const exp = EXPERIMENTS_BY_ID[experimentId as ExperimentId]

  // Get a friendlier display label for a few keys.
  const labelFor = (key: string, defLabel: string): string => {
    if (
      experimentId === 'periodic-table' ||
      experimentId === 'element-explorer' ||
      experimentId === 'isotopes' ||
      experimentId === 'electron-config'
    ) {
      if (key === 'z') {
        const z = Math.round(params.z ?? 0)
        const e = getElementByZ(z)
        return e ? `${defLabel} (${e.symbol})` : defLabel
      }
    }
    if (
      (key === 'molecule' && (experimentId === 'molecule-builder' || experimentId === 'molecule-viewer'))
    ) {
      const idx = Math.round(params.molecule ?? 0)
      const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
      return `${defLabel} (${m?.formula ?? ''})`
    }
    if (key === 'reaction' && (experimentId === 'combine' || experimentId === 'reaction-simulator')) {
      const idx = Math.round(params.reaction ?? 0)
      const r = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, idx))]
      return `${defLabel} (${r?.reactants.join(' + ') ?? ''})`
    }
    if (key === 'solution' && experimentId === 'ph-scale') {
      // Inline import would couple; we just show the index.
      return `${defLabel} (#${Math.round(params.solution ?? 0)})`
    }
    if (key === 'compare' && experimentId === 'ph-scale') {
      return Math.round(params.compare ?? 0) === 1 ? `${defLabel} (on)` : `${defLabel} (off)`
    }
    if (key === 'solutionB' && experimentId === 'ph-scale') {
      return `${defLabel} (#${Math.round(params.solutionB ?? 0)})`
    }
    if (key === 'indicator' && experimentId === 'titration') {
      const inds = ['Methyl orange', 'Litmus', 'Bromothymol blue', 'Phenolphthalein']
      return `${defLabel} (${inds[Math.round(params.indicator ?? 3)]})`
    }
    if (key === 'showBondLengths' && experimentId === 'molecule-viewer') {
      return Math.round(params.showBondLengths ?? 0) === 1 ? `${defLabel} (on)` : `${defLabel} (off)`
    }
    if (key === 'compareMode' && experimentId === 'molecule-viewer') {
      return Math.round(params.compareMode ?? 0) === 1 ? `${defLabel} (on)` : `${defLabel} (off)`
    }
    if (key === 'moleculeB' && experimentId === 'molecule-viewer') {
      const idx = Math.round(params.moleculeB ?? 0)
      const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
      return `${defLabel} (${m?.formula ?? ''})`
    }
    if (key === 'solute' && experimentId === 'concentration') {
      const solutes = ['NaCl', 'KCl', 'CuSO₄', 'KNO₃', 'CaCl₂', 'Na₂CO₃', 'C₆H₁₂O₆']
      return `${defLabel} (${solutes[Math.round(params.solute ?? 0)] ?? ''})`
    }
    return defLabel
  }

  return (
    <div className="controls-panel">
      <div className="controls-header">
        <span className="controls-title">{exp.title}</span>
        <span className="controls-subtitle">{exp.description}</span>
      </div>

      <div className="control-buttons">
        {!exp.passive && (
          !running ? (
            <button className="btn btn-primary" onClick={play}>
              {paused ? 'Resume' : 'Run'}
            </button>
          ) : (
            <button className="btn" onClick={togglePause}>
              Pause
            </button>
          )
        )}
      </div>

      <div className="control-section">
        <span className="section-title">Parameters</span>
        <div className="controls-list">
          {exp.params.map((p) => (
            <div key={p.key} className="control-row">
              <label className="control-label" title={p.key}>
                {labelFor(p.key, p.label)}
              </label>
              <div className="control-input">
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={params[p.key] ?? p.default}
                  onChange={(e) => setParam(p.key, parseFloat(e.target.value))}
                />
                <span className="control-value">
                  {formatValue(params[p.key] ?? p.default, p)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="control-section">
        <span className="section-title">Live values</span>
        <div className="measurements">
          {Object.entries(measurements).map(([k, v]) => (
            <div key={k} className="measurement-row">
              <span className="measurement-label">{k.replace(/_/g, ' ')}</span>
              <span className="measurement-value">{formatMeasurement(k, v)}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .controls-panel {
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          border-bottom: 1px solid var(--border-subtle);
        }
        .controls-header { display: flex; flex-direction: column; gap: 2px; }
        .controls-title { font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); }
        .controls-subtitle { font-size: 11px; color: var(--text-muted); line-height: 1.4; }
        .control-buttons { display: flex; gap: var(--space-2); }
        .btn {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn:hover { background: var(--bg-tertiary); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary {
          background: var(--ws-chemistry);
          color: white;
          border-color: var(--ws-chemistry);
        }
        .btn-primary:hover { background: #7E22CE; }
        .control-section { display: flex; flex-direction: column; gap: var(--space-2); }
        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .controls-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .control-row { display: flex; flex-direction: column; gap: 2px; }
        .control-label { font-size: 11px; color: var(--text-secondary); }
        .control-input { display: flex; align-items: center; gap: var(--space-2); }
        .control-input input { flex: 1; accent-color: var(--ws-chemistry); }
        .control-value { font-size: 11px; color: var(--text-primary); font-family: ui-monospace, monospace; min-width: 60px; text-align: right; }
        .measurements { display: flex; flex-direction: column; gap: 2px; }
        .measurement-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 0;
        }
        .measurement-label { font-size: 11px; color: var(--text-muted); }
        .measurement-value { font-size: 11px; color: var(--text-primary); font-family: ui-monospace, monospace; }
      `}</style>
    </div>
  )
}

function formatValue(v: number, p: { step: number; unit: string }): string {
  if (Number.isInteger(p.step) && Math.abs(v) < 1e6) return `${v}${p.unit}`
  if (Math.abs(v) >= 1000) return `${v.toExponential(2)} ${p.unit}`.trim()
  if (Math.abs(v) >= 10) return `${v.toFixed(2)}${p.unit ? ' ' + p.unit : ''}`
  return `${v.toFixed(3)}${p.unit ? ' ' + p.unit : ''}`
}

function formatMeasurement(k: string, v: number): string {
  if (k === 'pH' || k.endsWith('_pH')) return v.toFixed(2)
  if (k === 'pOH') return v.toFixed(2)
  if (k === 'temperature' || k === 'T') return `${v.toFixed(1)} °C`
  if (k === 'dH' || k === 'dH_kJ') return `${v.toFixed(1)} kJ`
  if (k === 'dT') return `${v >= 0 ? '+' : ''}${v.toFixed(1)} K`
  if (k === 'heat' || k === 'Q_kJ') return `${v.toFixed(2)} kJ`
  if (k === 'v_rms' || k === 'v_avg') return `${v.toFixed(0)} m/s`
  if (k === 'electronegativity' || k === 'electroneg') return v.toFixed(2)
  if (k === 'molar_mass' || k === 'atomic_mass') return `${v.toFixed(3)} g/mol`
  if (k === 'molarity') return `${v.toFixed(3)} M`
  if (k === 'h_conc' || k === 'oh_conc') return formatConcForStatus(v)
  if (k === 'Vb' || k === 'Va' || k === 'Veq') return `${v.toFixed(2)} mL`
  if (k === 'n' && Math.abs(v) < 100) return `${v.toFixed(3)} mol`
  if (k === 'electrons') return v.toFixed(0)
  if (k === 'atoms' || k === 'bonds') return v.toFixed(0)
  if (k === 'a') return v.toFixed(0)
  if (k === 'bondAngle') return `${v.toFixed(1)}°`
  if (k === 'idxB' || k === 'compare') return v.toFixed(0)
  if (k === 'molar_mass_B') return `${v.toFixed(3)} g/mol`
  if (Math.abs(v) >= 1000) return v.toExponential(2)
  if (Math.abs(v) >= 10) return v.toFixed(2)
  return v.toFixed(3)
}

function formatConcForStatus(c: number): string {
  if (c <= 0) return '0 M'
  if (c < 1e-3) return `${c.toExponential(2)} M`
  if (c < 1) return `${c.toFixed(4)} M`
  return `${c.toFixed(3)} M`
}
