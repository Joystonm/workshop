// Reaction Simulator — pick a balanced reaction from the database. We
// visualise:
//   1. Balanced equation with coefficients and phases
//   2. CPK-coloured atom cartoon for reactants vs products
//   3. Energy diagram (reactants → TS → products) with ΔH bar
//   4. Observable cues with iconography
//   5. Concept-note footer keyed by reaction type

import { useMemo } from 'react'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { REACTIONS, type Reaction, type Observable } from '../../../lib/chemistry/reactions'
import { getElementByZ, ELEMENTS } from '../../../lib/chemistry/elements'
import { noteFor, REACTION_TIPS } from '../../../lib/chemistry/pedagogy'

// Compact element parser — pulls element symbols out of a formula and
// counts them. Subscripts (1–9, 10–99) are supported. Parentheses and
// multipliers are handled with a tiny recursive descent.
function parseFormula(formula: string): Record<string, number> {
  const out: Record<string, number> = {}
  const stack: Record<string, number>[] = [out]

  let i = 0
  while (i < formula.length) {
    const ch = formula[i]
    if (ch === '(') {
      stack.push({})
      i++
    } else if (ch === ')') {
      const frame = stack.pop()!
      i++
      let numStr = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        numStr += formula[i]
        i++
      }
      const mult = numStr ? parseInt(numStr, 10) : 1
      const top = stack[stack.length - 1]
      for (const [el, n] of Object.entries(frame)) {
        top[el] = (top[el] ?? 0) + n * mult
      }
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch
      i++
      if (i < formula.length && /[a-z]/.test(formula[i])) {
        sym += formula[i]
        i++
      }
      let numStr = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        numStr += formula[i]
        i++
      }
      const n = numStr ? parseInt(numStr, 10) : 1
      const top = stack[stack.length - 1]
      top[sym] = (top[sym] ?? 0) + n
    } else {
      i++
    }
  }
  return out
}

// Expand a list of formulas × coefficients into a flat list of
// (elementSymbol, atomCount) pairs that we can render as circles.
function expandAtoms(formulas: string[], coefs: number[]): Array<{ symbol: string; count: number }> {
  const out: Array<{ symbol: string; count: number }> = []
  formulas.forEach((f, idx) => {
    const coef = coefs[idx] ?? 1
    const parsed = parseFormula(f)
    for (const [sym, n] of Object.entries(parsed)) {
      out.push({ symbol: sym, count: n * coef })
    }
  })
  return out
}

function AtomCartoon({ formulas, coefs }: { formulas: string[]; coefs: number[] }) {
  const atoms = expandAtoms(formulas, coefs)
  return (
    <div className="rx-cartoon">
      {atoms.map((a, i) => {
        const el = ELEMENTS.find((e) => e.symbol === a.symbol)
        const color = el?.cpkColor ?? '#A1A1AA'
        // Render `count` circles (cap to 8 for readability).
        const dots = Array.from({ length: Math.min(a.count, 8) }, (_, k) => k)
        return (
          <div key={`${a.symbol}-${i}`} className="rx-atom-row">
            <span className="rx-atom-label">{a.symbol}{a.count > 1 ? `×${a.count}` : ''}</span>
            <div className="rx-atom-dots">
              {dots.map((k) => (
                <div
                  key={k}
                  className="rx-atom-dot"
                  style={{ background: color, color: pickAtomTextColor(color) }}
                  title={`${a.symbol} atom`}
                >
                  {a.symbol}
                </div>
              ))}
              {a.count > 8 && <span className="rx-atom-more">+{a.count - 8}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function pickAtomTextColor(bg: string): string {
  // Light backgrounds → dark text; dark → white.
  if (bg.startsWith('#FFFFFF') || bg === '#FFFFFF' || bg === '#D9FFFF' || bg === '#CC80FF' || bg === '#F0C8A0') return '#18181B'
  // CPK convention: H/C/N/O/F/Cl/S/P are light-tinted.
  const light = ['#FFFFFF', '#D9FFFF', '#CC80FF', '#C2FF00', '#FFB5B5', '#909090', '#3050F8', '#FF0D0D', '#90E050', '#B3E3F5', '#AB5CF2']
  if (light.includes(bg.toUpperCase())) return '#18181B'
  return '#fff'
}

function ObservableChip({ obs }: { obs: Observable }) {
  const ICONS: Record<Observable, JSX.Element> = {
    'color-change': <svg width={12} height={12} viewBox="0 0 12 12"><circle cx={6} cy={6} r={5} fill="#EC4899" stroke="#831843" /></svg>,
    'precipitate': <svg width={12} height={12} viewBox="0 0 12 12"><circle cx={6} cy={6} r={4} fill="#FEF3C7" stroke="#92400E" /></svg>,
    'gas-evolution': <svg width={12} height={12} viewBox="0 0 12 12"><path d="M 3 9 L 5 5 L 4 5 L 6 1 L 5 1 L 7 5 L 6 5 L 8 9 Z" fill="#1E40AF" /></svg>,
    'temperature-rise': <svg width={12} height={12} viewBox="0 0 12 12"><path d="M 6 2 L 9 9 L 3 9 Z" fill="#B91C1C" /></svg>,
    'temperature-fall': <svg width={12} height={12} viewBox="0 0 12 12"><path d="M 3 3 L 9 3 L 6 9 Z" fill="#1E3A8A" /></svg>,
    'flame': <svg width={12} height={12} viewBox="0 0 12 12"><path d="M 6 1 C 4 4 5 5 5 7 C 5 9 7 9 7 7 C 7 5 8 4 6 1 Z" fill="#F97316" /></svg>,
    'light': <svg width={12} height={12} viewBox="0 0 12 12"><path d="M 6 1 L 7 5 L 11 6 L 7 7 L 6 11 L 5 7 L 1 6 L 5 5 Z" fill="#FBBF24" /></svg>,
    'none': <span>·</span>,
  }
  return (
    <span className={`rx-obs-chip ${obs}`}>
      {ICONS[obs]}
      <span>{obs.replace(/-/g, ' ')}</span>
    </span>
  )
}

function EnergyDiagram({ dH }: { dH: number }) {
  // Visualise reactants on left, products on right, transition state in middle.
  const W = 280
  const H = 110
  const padL = 36, padR = 36, padT = 14, padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  // Normalise dH so exo = reactants higher, endo = reactants lower.
  const absDH = Math.min(80, Math.max(10, Math.abs(dH)))
  const reactantLevel = dH < 0 ? 0.20 : 0.55
  const productLevel = dH < 0 ? 0.20 + absDH / 200 : 0.55 - absDH / 200
  const tsLevel = Math.min(reactantLevel, productLevel) - 0.22 - absDH / 400
  const xReactants = padL
  const xTS = padL + plotW / 2
  const xProducts = padL + plotW

  // Map level (0..1) to y (top→bottom).
  const y = (lvl: number) => padT + lvl * plotH

  const reactantY = y(reactantLevel)
  const tsY = y(Math.max(0.05, tsLevel))
  const productY = y(productLevel)

  // Build a smooth bezier through three points (R → TS → P).
  const path = `M ${xReactants} ${reactantY}
                 Q ${xReactants + plotW / 4} ${reactantY}, ${xTS} ${tsY}
                 Q ${xReactants + (3 * plotW) / 4} ${productY}, ${xProducts} ${productY}`

  return (
    <svg width={W} height={H} className="rx-energy-svg">
      {/* axes */}
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#A1A1AA" strokeWidth={1} />
      <text x={padL} y={H - 4} fontSize="9" fill="#71717A" fontFamily="ui-monospace, monospace">R</text>
      <text x={W - padR - 6} y={H - 4} fontSize="9" fill="#71717A" fontFamily="ui-monospace, monospace">P</text>
      {/* horizontal levels */}
      <line x1={xReactants - 6} y1={reactantY} x2={xReactants + 10} y2={reactantY} stroke="#52525B" strokeWidth={1.5} />
      <line x1={xProducts - 10} y1={productY} x2={xProducts + 6} y2={productY} stroke="#52525B" strokeWidth={1.5} />
      {/* curve */}
      <path d={path} fill="none" stroke="#9333EA" strokeWidth={2} />
      {/* TS marker */}
      <circle cx={xTS} cy={tsY} r={4} fill="#DC2626" />
      <text x={xTS} y={tsY - 6} fontSize="9" textAnchor="middle" fill="#71717A" fontFamily="ui-monospace, monospace">TS</text>
      {/* ΔH bar between R and P levels */}
      <line
        x1={xProducts + 14}
        y1={reactantY}
        x2={xProducts + 14}
        y2={productY}
        stroke={dH < 0 ? '#DC2626' : '#2563EB'}
        strokeWidth={2}
      />
      <polygon
        points={`${xProducts + 10},${reactantY} ${xProducts + 18},${reactantY} ${xProducts + 14},${reactantY - 4}`}
        fill={dH < 0 ? '#DC2626' : '#2563EB'}
      />
      <polygon
        points={`${xProducts + 10},${productY} ${xProducts + 18},${productY} ${xProducts + 14},${productY + 4}`}
        fill={dH < 0 ? '#DC2626' : '#2563EB'}
      />
      <text
        x={xProducts + 26}
        y={(reactantY + productY) / 2 + 3}
        fontSize="10"
        fill={dH < 0 ? '#DC2626' : '#2563EB'}
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
      >
        ΔH = {dH.toFixed(1)}
      </text>
      {/* axis label */}
      <text x={W / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="#71717A" fontFamily="ui-monospace, monospace">
        reaction progress →
      </text>
    </svg>
  )
}

export function ReactionSimulatorScene() {
  const rIdx = useChemistryStore((s) => Math.round(s.params.reaction ?? 0))
  const setParam = useChemistryStore((s) => s.setParam)
  const reaction: Reaction = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, rIdx))]

  const { reactantsCounts, productsCounts } = useMemo(() => {
    const r: Record<string, number> = {}
    const p: Record<string, number> = {}
    reaction.reactants.forEach((f, i) => {
      const coef = reaction.coefficients.reactants[i] ?? 1
      const parsed = parseFormula(f)
      for (const [el, n] of Object.entries(parsed)) {
        r[el] = (r[el] ?? 0) + n * coef
      }
    })
    reaction.products.forEach((f, i) => {
      const coef = reaction.coefficients.products[i] ?? 1
      const parsed = parseFormula(f)
      for (const [el, n] of Object.entries(parsed)) {
        p[el] = (p[el] ?? 0) + n * coef
      }
    })
    return { reactantsCounts: r, productsCounts: p }
  }, [reaction])

  const isExo = reaction.dH_kJ < 0
  const elementKeys = Array.from(new Set([...Object.keys(reactantsCounts), ...Object.keys(productsCounts)])).sort()

  return (
    <div className="rx-root">
      <div className="rx-header">
        <span className="rx-title">Reaction Simulator</span>
        <span className="rx-eq">Σ reactants → Σ products</span>
      </div>

      <div className="rx-picker">
        <label>Reaction</label>
        <select
          value={rIdx}
          onChange={(e) => setParam('reaction', parseInt(e.target.value, 10))}
        >
          {REACTIONS.map((r, i) => (
            <option key={r.id} value={i}>
              {r.id} — {r.reactants.join(' + ')} → {r.products.join(' + ')}
            </option>
          ))}
        </select>
      </div>

      {/* The balanced equation, rendered coefficient-by-coefficient. */}
      <div className="rx-eq-card">
        <div className="rx-eq-side reactants">
          <div className="label">Reactants</div>
          <div className="rx-eq-mol-list">
            {reaction.reactants.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="rx-eq-mol">
                  <div className="rx-eq-coef">
                    {reaction.coefficients.reactants[i] > 1 ? reaction.coefficients.reactants[i] : ''}
                  </div>
                  <div className="rx-eq-formula">{f}</div>
                  <div className="rx-eq-phase">{reaction.phases.reactants[i]}</div>
                </div>
                {i < reaction.reactants.length - 1 && <span className="rx-eq-plus">+</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="rx-eq-arrow">→</div>
        <div className="rx-eq-side products">
          <div className="label">Products</div>
          <div className="rx-eq-mol-list">
            {reaction.products.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="rx-eq-mol products">
                  <div className="rx-eq-coef">
                    {reaction.coefficients.products[i] > 1 ? reaction.coefficients.products[i] : ''}
                  </div>
                  <div className="rx-eq-formula">{f}</div>
                  <div className="rx-eq-phase">{reaction.phases.products[i]}</div>
                </div>
                {i < reaction.products.length - 1 && <span className="rx-eq-plus">+</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atom cartoon: reactants vs products */}
      <div className="rx-cartoon-card">
        <span className="rx-section-label">Atom cartoon · before → after</span>
        <div className="rx-cartoon-row">
          <AtomCartoon formulas={reaction.reactants} coefs={reaction.coefficients.reactants} />
          <div className="rx-cartoon-arrow">
            <span className="rx-cartoon-pill">{reaction.type}</span>
            <span className="rx-cartoon-arrow-line">→</span>
          </div>
          <AtomCartoon formulas={reaction.products} coefs={reaction.coefficients.products} />
        </div>
      </div>

      {/* Energy diagram */}
      <div className="rx-energy-card">
        <span className="rx-section-label">Energy diagram</span>
        <EnergyDiagram dH={reaction.dH_kJ} />
      </div>

      <div className="rx-summary">
        <div className={`rx-stat ${isExo ? 'exo' : 'endo'}`}>
          <div className="rx-stat-label">ΔH°ᵣ</div>
          <div className="rx-stat-value">{reaction.dH_kJ.toFixed(1)} kJ/mol</div>
        </div>
        <div className="rx-stat">
          <div className="rx-stat-label">Type</div>
          <div className="rx-stat-value" style={{ fontSize: 14 }}>{reaction.type}</div>
        </div>
        <div className="rx-stat">
          <div className="rx-stat-label">Heat</div>
          <div className="rx-stat-value">{isExo ? 'exothermic' : 'endothermic'}</div>
        </div>
        <div className="rx-stat">
          <div className="rx-stat-label">Keq (25 °C)</div>
          <div className="rx-stat-value">{reaction.Keq != null ? formatKeq(reaction.Keq) : '—'}</div>
        </div>
      </div>

      <div className="rx-balance">
        <div className="rx-balance-block">
          <div className="rx-balance-head">Reactants — atom count</div>
          <div className="rx-balance-grid">
            {elementKeys.map((el) => {
              const rCount = reactantsCounts[el] ?? 0
              const pCount = productsCounts[el] ?? 0
              const balanced = rCount === pCount
              return (
                <span key={el} style={{ display: 'contents' }}>
                  <span className="el">{el}</span>
                  <span className={`ct ${balanced ? 'rx-conserved' : ''}`}>{rCount}</span>
                </span>
              )
            })}
          </div>
        </div>
        <div className="rx-balance-block">
          <div className="rx-balance-head">Products — atom count</div>
          <div className="rx-balance-grid">
            {elementKeys.map((el) => {
              const rCount = reactantsCounts[el] ?? 0
              const pCount = productsCounts[el] ?? 0
              const balanced = rCount === pCount
              return (
                <span key={el} style={{ display: 'contents' }}>
                  <span className="el">{el}</span>
                  <span className={`ct ${balanced ? 'rx-conserved' : ''}`}>{pCount}</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {reaction.observables.length > 0 && (
        <div className="rx-info">
          <div className="rx-info-head">Observables</div>
          <div className="rx-obs">
            {reaction.observables.map((o) => (
              <ObservableChip key={o} obs={o} />
            ))}
          </div>
          <div className="rx-desc">{reaction.description}</div>
        </div>
      )}

      {(() => {
        const note = REACTION_TIPS[reaction.type] ?? noteFor('reaction-simulator')
        return note ? (
          <div className="rx-concept">
            <span className="rx-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}

function formatKeq(K: number): string {
  if (K === 0) return '0'
  const log = Math.log10(K)
  const sign = log >= 0 ? '+' : '−'
  return `10${sign}${Math.abs(log).toFixed(1)}`
}
