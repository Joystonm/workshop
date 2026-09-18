// Concentration scene. Sliders for n (moles of solute) and V (volume of
// solution in litres). Molarity M = n / V is derived live, and the
// beaker visualisation:
//   - fills to the chosen V with a hue that intensifies with M
//   - shows particle-scale circles (count ∝ n, seeded so they don't dance)
//   - has a labelled volume scale
// Plus a step-by-step math block, a mass-to-moles input, and a
// "dilute by 100 mL" button that recomputes M.

import { useChemistryStore } from '../../../lib/chemistry/store'
import { noteFor } from '../../../lib/chemistry/pedagogy'
import { SOLUTES as SOLUTES_LIST } from '../../../lib/chemistry/solutes'
import { useMemo, useState } from 'react'

const SOLUTES = SOLUTES_LIST

// Deterministic pseudo-random based on a seed.
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Pick a solute-circles array with positions inside the beaker (rect).
function makeParticles(count: number, V: number, color: string) {
  const n = Math.min(36, Math.max(0, Math.round(count * 10)))
  if (n === 0) return []
  const rand = seededRand(Math.round((count + 1) * (V + 0.1) * 1000))
  const arr: Array<{ x: number; y: number; r: number; color: string }> = []
  for (let i = 0; i < n; i++) {
    arr.push({
      x: 8 + rand() * 84,
      y: 90 - rand() * 84, // bias to lower part (water level)
      r: 4 + rand() * 1.5,
      color,
    })
  }
  return arr
}

export function ConcentrationScene() {
  const n = useChemistryStore((s) => s.params.n ?? 0.5)
  const V = useChemistryStore((s) => s.params.V ?? 0.5)
  const soluteIdx = useChemistryStore((s) => Math.round(s.params.solute ?? 0))
  const setParam = useChemistryStore((s) => s.setParam)
  const solute = SOLUTES[Math.max(0, Math.min(SOLUTES.length - 1, soluteIdx))]

  const [gramsInput, setGramsInput] = useState((n * solute.molarMass).toFixed(2))

  const M = V > 0 ? n / V : 0
  const grams = n * solute.molarMass
  const fillFraction = Math.min(1, V / 0.5)
  const intensity = Math.min(1, M / 3)
  const liquidColor = solute.color
  const fillPercent = `${fillFraction * 100}%`

  const particles = useMemo(() => makeParticles(n, V, solute.color), [n, V, solute.color])

  // After dilution: M1V1 = M2V2 → M2 = M1V1/(V1+0.1)
  const M_after = (V + 0.1) > 0 ? M * V / (V + 0.1) : 0

  return (
    <div className="co-root">
      <div className="co-header">
        <span className="co-title">Concentration</span>
        <span className="co-eq">M = n / V</span>
      </div>

      <div className="co-stage">
        <div className="co-controls">
          <div className="co-ctrl">
            <div className="co-ctrl-head">
              <span className="co-ctrl-label">Solute</span>
            </div>
            <div className="co-solute">
              {SOLUTES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`co-solute-chip ${i === soluteIdx ? 'active' : ''}`}
                  onClick={() => setParam('solute', i)}
                >
                  {s.formula}
                </button>
              ))}
            </div>
          </div>

          <div className="co-ctrl">
            <div className="co-ctrl-head">
              <span className="co-ctrl-label">n · moles of solute</span>
              <span className="co-ctrl-value">{n.toFixed(3)} mol</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={n}
              onChange={(e) => setParam('n', parseFloat(e.target.value))}
            />
          </div>

          <div className="co-ctrl">
            <div className="co-ctrl-head">
              <span className="co-ctrl-label">V · volume of solution</span>
              <span className="co-ctrl-value">{V.toFixed(3)} L</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.005}
              value={V}
              onChange={(e) => setParam('V', parseFloat(e.target.value))}
            />
          </div>

          {/* Mass ↔ moles converter */}
          <div className="co-ctrl">
            <div className="co-ctrl-head">
              <span className="co-ctrl-label">Mass · type grams to convert</span>
            </div>
            <input
              type="number"
              className="co-grams-input"
              step={0.01}
              value={gramsInput}
              onChange={(e) => {
                const g = parseFloat(e.target.value)
                setGramsInput(e.target.value)
                if (Number.isFinite(g) && solute.molarMass > 0) {
                  setParam('n', g / solute.molarMass)
                }
              }}
              placeholder="grams"
            />
            <span className="co-grams-hint">
              ÷ {solute.molarMass.toFixed(2)} g/mol = {(gramsInput && Number.isFinite(parseFloat(gramsInput)) ? parseFloat(gramsInput) / solute.molarMass : n).toFixed(3)} mol
            </span>
          </div>

          {/* Dilution button */}
          <button
            type="button"
            className="co-dilute-btn"
            onClick={() => setParam('V', Math.min(0.5, V + 0.1))}
            disabled={V >= 0.5}
          >
            + Add 100 mL water
            <span className="co-dilute-preview">M → {M_after.toFixed(3)}</span>
          </button>
        </div>

        <div className="co-flask-wrap">
          <div className="co-flask" aria-label="Beaker of solution">
            <div
              className="co-flask-liquid"
              style={{
                height: fillPercent,
                background: liquidColor,
                opacity: 0.55 + intensity * 0.4,
              }}
            />
            <div className="co-flask-particles">
              {particles.map((p, i) => (
                <div
                  key={i}
                  className="co-particle"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.r * 2,
                    height: p.r * 2,
                    background: p.color,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <div className="co-flask-ticks">
              {[0.5, 0.4, 0.3, 0.2, 0.1].map((t) => (
                <div key={t} className="co-flask-tick" data-label={`${t.toFixed(1)} L`} />
              ))}
            </div>
            <div className="co-flask-tag">{solute.formula}</div>
          </div>
          <div className="co-flask-label">
            {M.toFixed(2)} M · {(V * 1000).toFixed(0)} mL
          </div>
        </div>
      </div>

      <div className="co-stats">
        <div className="co-stat">
          <div className="co-stat-label">Molarity M</div>
          <div className="co-stat-value">{M.toFixed(3)} M</div>
        </div>
        <div className="co-stat">
          <div className="co-stat-label">Moles n</div>
          <div className="co-stat-value">{n.toFixed(3)} mol</div>
        </div>
        <div className="co-stat">
          <div className="co-stat-label">Volume V</div>
          <div className="co-stat-value">{(V * 1000).toFixed(1)} mL</div>
        </div>
        <div className="co-stat">
          <div className="co-stat-label">Mass of solute</div>
          <div className="co-stat-value">{grams.toFixed(2)} g</div>
        </div>
      </div>

      {/* Step-by-step math */}
      <div className="co-math">
        <span className="co-section-label">Step-by-step</span>
        <div className="co-math-line">
          <span className="op">M</span> = <span className="op">n</span> / <span className="op">V</span>
        </div>
        <div className="co-math-line">
          = <span className="num">{n.toFixed(3)}</span> / <span className="num">{V.toFixed(3)}</span>
        </div>
        <div className="co-math-line">
          = <span className="num-result">{M.toFixed(3)} M</span>
        </div>
      </div>

      {(() => {
        const note = noteFor('concentration')
        return note ? (
          <div className="co-concept">
            <span className="co-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}
