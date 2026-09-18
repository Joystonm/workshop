// pH Scale scene — pick an acid or base from the library. Visualises:
//   1. Colour-coded pH strip with pointer
//   2. Logarithmic [H⁺] and [OH⁻] bars (each segment = 1 pH unit)
//   3. Indicator swatches (4 indicators, colour blended by pH)
//   4. Big flask with solution colour, formula, strong/weak pill
//   5. Optional A/B compare mode showing two flasks side-by-side
//      with a ΔpH badge

import { useMemo } from 'react'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { SOLUTIONS, compute, type ComputedSolution } from '../../../lib/chemistry/acidsBases'
import { INDICATORS, indicatorAtPH } from '../../../lib/chemistry/indicators'
import { noteFor } from '../../../lib/chemistry/pedagogy'

// pH 0 → 14 strip colours, one per integer step.
const PH_COLORS = [
  '#7E22CE', '#9333EA', '#A855F7', '#C026D3', '#E11D48',
  '#F43F5E', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#0EA5E9', '#3B82F6',
]

export function PhScaleScene() {
  const idx = useChemistryStore((s) => Math.round(s.params.solution ?? 9))
  const compare = useChemistryStore((s) => Math.round(s.params.compare ?? 0) === 1)
  const idxB = useChemistryStore((s) => Math.round(s.params.solutionB ?? 0))
  const setParam = useChemistryStore((s) => s.setParam)

  const solution: ComputedSolution = useMemo(() => {
    const s = SOLUTIONS[Math.max(0, Math.min(SOLUTIONS.length - 1, idx))]
    return compute(s)
  }, [idx])

  const solutionB: ComputedSolution = useMemo(() => {
    const s = SOLUTIONS[Math.max(0, Math.min(SOLUTIONS.length - 1, idxB))]
    return compute(s)
  }, [idxB])

  // pH pointer position: 0 = far left (pH 0), 14 = far right (pH 14).
  const phClamped = Math.max(0, Math.min(14, solution.pH))
  const pointerPercent = (phClamped / 14) * 100

  const isAcid = solution.pH < 7
  const isBase = solution.pH > 7
  const isNeutral = Math.abs(solution.pH - 7) < 0.05

  // Determine which [H+] / [OH-] segments to highlight.
  // Use the floor of the pH as the segment index (0..13).
  const hSegIdx = Math.max(0, Math.min(13, Math.floor(solution.pH)))
  const ohSegIdx = Math.max(0, Math.min(13, Math.floor(solution.pOH)))

  return (
    <div className="ph-root">
      <div className="ph-header">
        <span className="ph-title">pH Scale</span>
        <span className="ph-eq">pH = −log[H⁺]</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#52525B' }}>
          pH + pOH = 14
        </span>
      </div>

      <div className="ph-picker">
        <label>Solution A</label>
        <select
          value={idx}
          onChange={(e) => setParam('solution', parseInt(e.target.value, 10))}
        >
          {SOLUTIONS.map((s, i) => (
            <option key={s.id} value={i}>
              {s.kind === 'acid' ? 'acid' : 'base'} · {s.formula} · {s.concentration} M
              {s.strong ? '' : ` (weak, ${s.Ka ? 'Ka' : 'Kb'} = ${(s.Ka ?? s.Kb ?? 0).toExponential(1)})`}
            </option>
          ))}
        </select>
      </div>

      {/* pH strip */}
      <div className="ph-scale-frame">
        <div className="ph-pointer" style={{ left: `${pointerPercent}%` }}>
          <div className="ph-pointer-label">pH {solution.pH.toFixed(2)}</div>
        </div>
        <div className="ph-scale">
          {PH_COLORS.map((color, i) => (
            <div key={i} className="ph-marker" style={{ background: color }}>
              <span>{i}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#71717A', fontFamily: 'ui-monospace, monospace' }}>
          <span>← acidic (more H⁺)</span>
          <span>basic (more OH⁻) →</span>
        </div>
      </div>

      {/* Logarithmic [H+] / [OH-] bars */}
      <div className="ph-log-block">
        <div className="ph-log-row">
          <span className="ph-log-label">[H⁺]</span>
          <div className="ph-log-bar">
            {PH_COLORS.map((color, i) => (
              <div
                key={i}
                className={`ph-log-seg ${i === hSegIdx ? 'active acid' : ''}`}
                style={{ background: i === hSegIdx ? color : '#F4F4F5' }}
                title={`pH ${i}: [H⁺] = 10⁻${i}`}
              >
                <span className="ph-log-seg-label">10⁻{superscript(i)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ph-log-row">
          <span className="ph-log-label">[OH⁻]</span>
          <div className="ph-log-bar">
            {PH_COLORS.map((color, i) => (
              <div
                key={i}
                className={`ph-log-seg ${i === ohSegIdx ? 'active base' : ''}`}
                style={{ background: i === ohSegIdx ? color : '#F4F4F5' }}
                title={`pOH ${i}: [OH⁻] = 10⁻${i}`}
              >
                <span className="ph-log-seg-label">10⁻{superscript(i)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicator swatches — coloured by pH */}
      <div className="ph-indicators">
        <span className="ph-section-label">Indicators at pH {solution.pH.toFixed(2)}</span>
        <div className="ph-indicator-row">
          {INDICATORS.map((ind) => (
            <div
              key={ind.id}
              className="ph-indicator"
              title={`${ind.name} · transitions ${ind.rangeLow}–${ind.rangeHigh}`}
            >
              <div
                className="ph-indicator-swatch"
                style={{ background: indicatorAtPH(ind, solution.pH) }}
              />
              <span className="ph-indicator-name">{ind.name}</span>
              <span className="ph-indicator-range">pH {ind.rangeLow.toFixed(1)}–{ind.rangeHigh.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ph-grid">
        <div className={`ph-stat ${isAcid ? 'acid' : isBase ? 'base' : 'neutral'}`}>
          <div className="ph-stat-label">pH</div>
          <div className="ph-stat-value">{solution.pH.toFixed(2)}</div>
        </div>
        <div className="ph-stat">
          <div className="ph-stat-label">pOH</div>
          <div className="ph-stat-value">{solution.pOH.toFixed(2)}</div>
        </div>
        <div className={`ph-stat ${isAcid ? 'acid' : ''}`}>
          <div className="ph-stat-label">[H⁺] (M)</div>
          <div className="ph-stat-value">{formatConc(solution.hConcentration)}</div>
        </div>
        <div className={`ph-stat ${isBase ? 'base' : ''}`}>
          <div className="ph-stat-label">[OH⁻] (M)</div>
          <div className="ph-stat-value">{formatConc(solution.ohConcentration)}</div>
        </div>
      </div>

      <div className="ph-info">
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {solution.name} ({solution.formula})
        </div>
        <div style={{ marginBottom: 6 }}>
          {solution.kind === 'acid' ? 'Acid' : 'Base'} · {solution.concentration} M ·{' '}
          {solution.strong ? 'strong' : `weak (${solution.Ka ? 'Ka' : 'Kb'} = ${(solution.Ka ?? solution.Kb ?? 0).toExponential(1)})`}
        </div>
        <div style={{ color: '#52525B' }}>{solution.note}</div>
      </div>

      {/* Flask(s) */}
      <div className="ph-flask-row">
        <Flask solution={solution} label="A" />
        {compare && (
          <>
            <div className="ph-flask-delta">
              <span className="ph-flask-delta-label">ΔpH</span>
              <span className="ph-flask-delta-value">{(solution.pH - solutionB.pH).toFixed(2)}</span>
            </div>
            <Flask solution={solutionB} label="B" />
          </>
        )}
      </div>

      {/* Compare toggle is rendered inside the controls panel via params; here just a hint */}
      {compare && (
        <div className="ph-picker" style={{ marginTop: 4 }}>
          <label>Solution B</label>
          <select
            value={idxB}
            onChange={(e) => setParam('solutionB', parseInt(e.target.value, 10))}
          >
            {SOLUTIONS.map((s, i) => (
              <option key={s.id} value={i}>
                {s.kind === 'acid' ? 'acid' : 'base'} · {s.formula} · {s.concentration} M
              </option>
            ))}
          </select>
        </div>
      )}

      {(() => {
        const note = noteFor('ph-scale')
        return note ? (
          <div className="ph-concept">
            <span className="ph-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}

function Flask({ solution, label }: { solution: ComputedSolution; label: string }) {
  return (
    <div className="ph-flask">
      <div className="ph-flask-tag">{label} · {solution.formula}</div>
      <div className="ph-flask-bottle" style={{ '--liq-color': solution.indicatorColor } as React.CSSProperties}>
        <div className="ph-flask-liquid" style={{ background: solution.indicatorColor }} />
        <div className="ph-flask-label">{solution.pH.toFixed(2)}</div>
      </div>
      <div className="ph-flask-meta">
        <span className={`ph-flask-pill ${solution.strong ? 'strong' : 'weak'}`}>
          {solution.strong ? 'Strong' : 'Weak'}
        </span>
      </div>
    </div>
  )
}

function formatConc(c: number): string {
  if (c <= 0) return '0'
  if (c < 1e-3) return c.toExponential(2)
  if (c < 1) return c.toFixed(4)
  if (c < 10) return c.toFixed(3)
  return c.toFixed(2)
}

function superscript(n: number): string {
  const sup: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(n).split('').map((c) => sup[c] ?? c).join('')
}
