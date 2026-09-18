// Electron Configuration scene — pick Z, watch the subshells fill from
// the bottom up following the Aufbau (n + ℓ) rule. Hund's rule is applied
// when filling each subshell: electrons occupy empty orbitals singly with
// parallel spins before pairing. A Bohr-ring diagram on the right shows
// the shell-by-shell view.

import { useMemo } from 'react'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { getElementByZ } from '../../../lib/chemistry/elements'
import { noteFor } from '../../../lib/chemistry/pedagogy'

interface SubshellSpec {
  label: string
  cap: number
  kind: 's' | 'p' | 'd' | 'f'
  n: number
  l: number
}

// Aufbau order, (n, ℓ) rule.
const SUBSHELLS: SubshellSpec[] = [
  { label: '1s', cap: 2, kind: 's', n: 1, l: 0 },
  { label: '2s', cap: 2, kind: 's', n: 2, l: 0 },
  { label: '2p', cap: 6, kind: 'p', n: 2, l: 1 },
  { label: '3s', cap: 2, kind: 's', n: 3, l: 0 },
  { label: '3p', cap: 6, kind: 'p', n: 3, l: 1 },
  { label: '4s', cap: 2, kind: 's', n: 4, l: 0 },
  { label: '3d', cap: 10, kind: 'd', n: 3, l: 2 },
  { label: '4p', cap: 6, kind: 'p', n: 4, l: 1 },
  { label: '5s', cap: 2, kind: 's', n: 5, l: 0 },
  { label: '4d', cap: 10, kind: 'd', n: 4, l: 2 },
  { label: '5p', cap: 6, kind: 'p', n: 5, l: 1 },
  { label: '6s', cap: 2, kind: 's', n: 6, l: 0 },
  { label: '4f', cap: 14, kind: 'f', n: 4, l: 3 },
  { label: '5d', cap: 10, kind: 'd', n: 5, l: 2 },
  { label: '6p', cap: 6, kind: 'p', n: 6, l: 1 },
  { label: '7s', cap: 2, kind: 's', n: 7, l: 0 },
  { label: '5f', cap: 14, kind: 'f', n: 5, l: 3 },
  { label: '6d', cap: 10, kind: 'd', n: 6, l: 2 },
  { label: '7p', cap: 6, kind: 'p', n: 7, l: 1 },
]

// Hund's rule: place electrons singly across orbitals first, then pair.
// Returns the electron distribution as an array of orbital-state counts
// where the index is the orbital index (0..n-1) and the value is 0, 1, or 2.
function hundFill(e: number, orbitals: number): number[] {
  const out = new Array(orbitals).fill(0)
  let remaining = e
  // First pass: singly occupy each orbital in order.
  for (let i = 0; i < orbitals && remaining > 0; i++) {
    out[i] = 1
    remaining--
  }
  // Second pass: pair up from orbital 0 onward.
  for (let i = 0; i < orbitals && remaining > 0; i++) {
    out[i] = 2
    remaining--
  }
  return out
}

export function ElectronConfigScene() {
  const z = useChemistryStore((s) => Math.round(s.params.z ?? 6))
  const setParam = useChemistryStore((s) => s.setParam)
  const el = getElementByZ(z)

  // Fill subshells greedily up to Z.
  const filled = useMemo(() => {
    let remaining = z
    let fillOrder = 0
    return SUBSHELLS.map((s) => {
      const n = Math.min(remaining, s.cap)
      remaining -= n
      fillOrder++
      const orbitals = s.cap / 2
      return {
        ...s,
        electrons: n,
        fillOrder: fillOrder,
        orbitals: hundFill(n, orbitals),
      }
    })
  }, [z])

  const totalE = filled.reduce((a, s) => a + s.electrons, 0)
  const missing = z - totalE

  // Index of the currently-filling subshell (first partial).
  const firstPartialIdx = filled.findIndex((x) => x.electrons < x.cap)

  // Noble-gas shorthand notation.
  const nobleCores: Array<{ z: number; symbol: string }> = [
    { z: 2, symbol: 'He' },
    { z: 10, symbol: 'Ne' },
    { z: 18, symbol: 'Ar' },
    { z: 36, symbol: 'Kr' },
    { z: 54, symbol: 'Xe' },
    { z: 86, symbol: 'Rn' },
  ]
  let configStr = ''
  if (z > 0) {
    const core = [...nobleCores].reverse().find((c) => c.z < z)
    if (core && z - core.z >= 1) {
      configStr = `[${core.symbol}] `
    }
    configStr += filled
      .map((s) => (s.electrons > 0 ? `${s.label}${formatSuperscript(s.electrons)}` : ''))
      .filter(Boolean)
      .join(' ')
  }

  // Anomalous configurations worth calling out (Aufbau exceptions).
  const anomalous: Record<number, string> = {
    24: 'Chromium is [Ar] 3d⁵ 4s¹ — a half-filled d-subshell is extra stable.',
    29: 'Copper is [Ar] 3d¹⁰ 4s¹ — a fully-filled d-subshell is extra stable.',
    41: 'Niobium prefers 4d⁴ 5s¹ over the expected 4d³ 5s².',
    47: 'Silver is [Kr] 4d¹⁰ 5s¹.',
    79: 'Gold is [Xe] 4f¹⁴ 5d¹⁰ 6s¹.',
  }
  const anomalousNote = anomalous[z]

  // Build the shells array for the Bohr-ring diagram.
  const shells = el?.shells ?? []

  return (
    <div className="ec-root">
      <div className="ec-header">
        <span className="ec-title">Electron Configuration</span>
        <span className="ec-eq">Σ e⁻ = Z = {z}</span>
      </div>

      <div className="ec-z-row">
        <div className="ec-tile">
          <div className="ec-tile-z">Z={el?.z}</div>
          <div className="ec-tile-sym">{el?.symbol}</div>
          <div className="ec-tile-name">{el?.name}</div>
        </div>
        <div className="ec-z-meta">
          <div className="ec-z-meta-row"><span className="k">Period</span><span className="v">{el?.period}</span></div>
          <div className="ec-z-meta-row"><span className="k">Group</span><span className="v">{el?.group ?? '—'}</span></div>
          <div className="ec-z-meta-row"><span className="k">Block</span><span className="v">{el?.block.toUpperCase()}-block</span></div>
          <div className="ec-z-meta-row"><span className="k">Category</span><span className="v">{el?.category}</span></div>
        </div>
        <input
          type="range"
          min={1}
          max={118}
          step={1}
          value={z}
          onChange={(e) => setParam('z', parseInt(e.target.value, 10))}
          style={{ flex: 1, accentColor: '#9333EA', minWidth: 160 }}
        />
      </div>

      <div className="ec-two-col">
        <div className="ec-config">
          <div className="ec-config-head">Ground-state configuration</div>
          <div className="ec-config-line">
            {(() => {
              return filled.map((s, idx) => {
                const inCore = idx < firstPartialIdx && s.electrons === s.cap
                const isFull = s.electrons === s.cap
                const cls = isFull ? (inCore ? 'core' : 'full') : (s.electrons > 0 ? 'partial' : 'empty')
                return (
                  <span key={s.label} className={`ec-tok ${cls}`}>
                    {s.label}
                    <sup>{s.electrons || '·'}</sup>
                  </span>
                )
              })
            })()}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#71717A', fontFamily: 'ui-monospace, monospace' }}>
            Noble-gas shorthand: {configStr || '—'}
          </div>
          {anomalousNote && (
            <div className="ec-anomaly">
              <span className="ec-anomaly-icon">⚠</span>
              <span>{anomalousNote}</span>
            </div>
          )}
          <div className="ec-arrow-legend">
            <span className="up">single e⁻</span>
            <span className="paired">paired e⁻</span>
            <span style={{ marginLeft: 'auto', fontSize: 11 }}>
              {missing > 0 ? `${missing} e⁻ do not fit in modelled shells` : `Σ = ${totalE} e⁻, matches Z`}
            </span>
          </div>
        </div>

        <BohrRings shells={shells} />
      </div>

      <div className="ec-subshells">
        {filled.map((s, idx) => {
          const fillFraction = s.electrons / s.cap
          const cls = s.electrons === s.cap ? 'filled' : s.electrons > 0 ? 'partial' : 'empty'
          const isFilling = idx === firstPartialIdx
          return (
            <div key={s.label} className={`ec-sub ${cls} ${isFilling ? 'filling' : ''}`}>
              <div className="ec-sub-head">
                <span className="ec-sub-label">{s.label}</span>
                <span className="ec-sub-cap">{s.electrons} / {s.cap}</span>
              </div>
              <div className="ec-sub-body">
                <OrbitalIcon kind={s.kind} />
                <div className="ec-orbitals">
                  {s.orbitals.map((orbFill, i) => {
                    // Render each orbital with ↑ / ↓ / ↑↓ as SVG paths.
                    return (
                      <OrbitalBox
                        key={i}
                        kind={s.kind}
                        fill={orbFill}
                      />
                    )
                  })}
                </div>
                <span className="ec-sub-fillorder">#{s.fillOrder}</span>
              </div>
            </div>
          )
        })}
      </div>

      {(() => {
        const note = noteFor('electron-config')
        return note ? (
          <div className="ec-concept">
            <span className="ec-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bohr-ring diagram: concentric circles, electrons on each ring.
// ---------------------------------------------------------------------------

function BohrRings({ shells }: { shells: number[] }) {
  const W = 200
  const H = 200
  const cx = W / 2
  const cy = H / 2
  // Skip the first shell if it's n=1 (innermost is small).
  const maxShell = Math.max(...shells.map((_, i) => i + 1))
  return (
    <div className="ec-bohr-card">
      <span className="ec-config-head">Bohr model · shells</span>
      <svg width={W} height={H} className="ec-bohr-svg">
        {shells.map((count, idx) => {
          const shellN = idx + 1
          const r = 18 + (shellN - 1) * 22
          if (r > cy - 10) return null
          return (
            <g key={idx}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#A78BFA" strokeOpacity={0.6} strokeDasharray="2 3" />
              {Array.from({ length: Math.min(count, 18) }, (_, i) => {
                const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2
                const x = cx + r * Math.cos(angle)
                const y = cy + r * Math.sin(angle)
                return (
                  <circle key={i} cx={x} cy={y} r={3.5} fill="#581C87" />
                )
              })}
              {count > 18 && (
                <text x={cx + r + 6} y={cy + 4} fontSize="9" fill="#71717A" fontFamily="ui-monospace, monospace">
                  +{count - 18}
                </text>
              )}
              <text
                x={cx + r * 0.7}
                y={cy - r - 2}
                fontSize="9"
                fill="#71717A"
                fontFamily="ui-monospace, monospace"
              >
                n={shellN}
              </text>
            </g>
          )
        })}
        {/* nucleus */}
        <circle cx={cx} cy={cy} r={9} fill="#9333EA" />
        <text x={cx} y={cy + 3} fontSize="10" fill="white" textAnchor="middle" fontFamily="ui-monospace, monospace" fontWeight="700">
          {shells.reduce((a, b) => a + b, 0)}
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Orbital shape thumbnails — simple SVG approximations.
// ---------------------------------------------------------------------------

function OrbitalIcon({ kind }: { kind: 's' | 'p' | 'd' | 'f' }) {
  // 32×32 SVG.
  const fill = '#A78BFA'
  const stroke = '#6D28D9'
  if (kind === 's') {
    return (
      <svg width={32} height={32} viewBox="0 0 32 32">
        <circle cx={16} cy={16} r={10} fill={fill} fillOpacity={0.4} stroke={stroke} strokeWidth={1.5} />
      </svg>
    )
  }
  if (kind === 'p') {
    return (
      <svg width={32} height={32} viewBox="0 0 32 32">
        <ellipse cx={16} cy={16} rx={5} ry={12} fill={fill} fillOpacity={0.4} stroke={stroke} strokeWidth={1.5} transform="rotate(0 16 16)" />
        <ellipse cx={16} cy={16} rx={5} ry={12} fill={fill} fillOpacity={0.4} stroke={stroke} strokeWidth={1.5} transform="rotate(90 16 16)" />
      </svg>
    )
  }
  if (kind === 'd') {
    // Four-lobed clover
    return (
      <svg width={32} height={32} viewBox="0 0 32 32">
        {[0, 45, 90, 135].map((rot) => (
          <ellipse
            key={rot}
            cx={16}
            cy={16}
            rx={4}
            ry={11}
            fill={fill}
            fillOpacity={0.4}
            stroke={stroke}
            strokeWidth={1.2}
            transform={`rotate(${rot} 16 16)`}
          />
        ))}
      </svg>
    )
  }
  // f: simplified 8-lobed
  return (
    <svg width={32} height={32} viewBox="0 0 32 32">
      {[0, 30, 60, 90, 120, 150].map((rot) => (
        <ellipse
          key={rot}
          cx={16}
          cy={16}
          rx={3}
          ry={12}
          fill={fill}
          fillOpacity={0.35}
          stroke={stroke}
          strokeWidth={1}
          transform={`rotate(${rot} 16 16)`}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Orbital box — 28×28 with SVG arrows for the electron spins.
// ---------------------------------------------------------------------------

function OrbitalBox({ kind, fill }: { kind: 's' | 'p' | 'd' | 'f'; fill: number }) {
  // fill = 0 (empty), 1 (single e⁻, gold), 2 (paired, purple).
  const radius = kind === 's' ? 4 : kind === 'p' ? 4 : kind === 'd' ? 4 : 3
  const cls = fill === 0 ? 'empty' : fill === 1 ? 'single' : 'paired'
  const bg = fill === 0 ? '#fff' : fill === 1 ? '#FBBF24' : '#9333EA'
  const border = fill === 0 ? '#D4D4D8' : fill === 1 ? '#B45309' : '#581C87'
  return (
    <div className={`ec-orb ${kind} ${cls}`}>
      {fill === 1 && (
        <svg width={20} height={20} viewBox="0 0 20 20">
          <path d="M 10 16 L 10 4 M 6 8 L 10 4 L 14 8" stroke="white" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {fill === 2 && (
        <svg width={20} height={20} viewBox="0 0 20 20">
          <path d="M 7 16 L 7 4 M 4 7 L 7 4 L 10 7" stroke="white" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 13 4 L 13 16 M 10 13 L 13 16 L 16 13" stroke="white" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <style>{`
        .ec-orb.${kind} {
          width: 28px;
          height: 28px;
          border-radius: ${kind === 's' ? '6px' : '50%'};
          border: 1.5px solid ${border};
          background: ${bg};
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}

function formatSuperscript(n: number): string {
  const sup: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(n).split('').map((c) => sup[c] ?? c).join('')
}
