// Isotopes scene — pick an element from a chip picker, then inspect its
// isotopes. The top section visualises the nucleus as a hex-packed cluster
// of protons + neutrons. Below the isotope table a stability-band chart
// shows every isotope we know. A "did you know?" note footer pulls from
// the pedagogy database.

import { useMemo } from 'react'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { getElementByZ } from '../../../lib/chemistry/elements'
import { getIsotopes, getDefaultIsotope, DEFAULT_ISOTOPE_Z, decayMode, type DecayMode } from '../../../lib/chemistry/isotopes'
import { noteFor } from '../../../lib/chemistry/pedagogy'

// All element Z values for the picker chip row — keep ordered.
const ELEMENT_CHIPS = [1, 2, 6, 7, 8, 11, 17, 19, 26, 29, 47, 53, 82, 92]

export function IsotopesScene() {
  const z = useChemistryStore((s) => Math.round(s.params.z ?? DEFAULT_ISOTOPE_Z))
  const setParam = useChemistryStore((s) => s.setParam)
  const selectedA = useChemistryStore((s) => Math.round(s.params.A ?? getDefaultIsotope(z)?.a ?? 1))

  const el = getElementByZ(z)
  const isotopes = useMemo(() => getIsotopes(z), [z])

  // If the selected A is from a previous element, pick a sensible default.
  const activeA = isotopes.find((i) => i.a === selectedA) ? selectedA : (getDefaultIsotope(z)?.a ?? isotopes[0]?.a ?? 0)
  const active = isotopes.find((i) => i.a === activeA) ?? isotopes[0]

  if (!el || !active) {
    return (
      <div className="iso-root">
        <div className="iso-header">
          <span className="iso-title">Isotopes</span>
        </div>
        <div className="iso-sub">No isotope data for Z = {z}. Try H, C, N, O, U, …</div>
      </div>
    )
  }

  const nNeutrons = active.a - active.z
  const decay = decayMode(active)

  return (
    <div className="iso-root">
      <div className="iso-header">
        <span className="iso-title">Isotopes of {el.name}</span>
        <span className="iso-eq">A = Z + N   ⟹   {active.a} = {active.z} + {nNeutrons}</span>
        <span className="iso-sub">Σ e⁻ = Z = {el.z}</span>
      </div>

      {/* Element picker — quick chips for elements that have isotope data. */}
      <div className="iso-picker">
        {ELEMENT_CHIPS.map((ez) => {
          const eEl = getElementByZ(ez)
          if (!eEl) return null
          const has = getIsotopes(ez).length > 0
          return (
            <button
              key={ez}
              type="button"
              className={`iso-chip ${ez === z ? 'active' : ''}`}
              onClick={() => {
                setParam('z', ez)
                const def = getDefaultIsotope(ez)
                if (def) setParam('A', def.a)
              }}
              disabled={!has}
              title={has ? `${eEl.name} (Z=${ez})` : 'No data'}
            >
              <span className="iso-chip-z">Z={ez}</span>
              {eEl.symbol}
            </button>
          )
        })}
      </div>

      <div className="iso-grid-main">
        {/* Hex-packed nucleus visualisation: Z protons + N neutrons */}
        <div className="iso-nucleus-card">
          <span className="iso-section-label">Nucleus</span>
          <HexNucleus protons={el.z} neutrons={nNeutrons} />
          <div className="iso-nuc-legend">
            <span className="iso-legend-dot p" /> {el.z} protons
            <span className="iso-legend-sep">·</span>
            <span className="iso-legend-dot n" /> {nNeutrons} neutrons
          </div>
          <DecayBadge mode={decay} z={el.z} a={active.a} />
        </div>

        {/* Right column: stats */}
        <div className="iso-summary">
          <SummaryCard label="Z (protons)" value={active.z} />
          <SummaryCard label="N (neutrons)" value={nNeutrons} />
          <SummaryCard label="A (mass #)" value={active.a} />
          <SummaryCard
            label="Stability"
            value={active.halfLife === 'Stable' ? 'Stable' : `t½ = ${active.halfLife}`}
            color={active.halfLife === 'Stable' ? '#15803D' : '#B91C1C'}
          />
        </div>
      </div>

      {/* Isotope table */}
      <div className="iso-table">
        <div className="iso-row head">
          <div>A (mass)</div>
          <div>N</div>
          <div>Half-life</div>
          <div>Notes · Abundance</div>
        </div>
        {isotopes.map((i) => {
          const isActive = i.a === activeA
          const hlClass = i.halfLife === 'Stable' ? 'stable' : i.abundance > 0 ? 'syn' : 'radio'
          return (
            <div
              key={i.a}
              className={`iso-row ${isActive ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setParam('A', i.a)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setParam('A', i.a)
                }
              }}
              style={{ cursor: 'pointer', display: 'contents' }}
            >
              <div className="iso-a">{isActive && <span className="iso-row-pin" />}{i.a}</div>
              <div className="iso-n">{i.a - i.z}</div>
              <div className={`iso-hl ${hlClass}`}>
                {i.halfLife}
              </div>
              <div className="iso-note">
                <span>{i.note ?? '—'}</span>
                <span className="iso-abundance"> · {i.abundance > 0 ? `${i.abundance.toFixed(3)}%` : 'synthetic'}</span>
              </div>
            </div>
          )
        })}
      </div>

      <StabilityBand
        isotopes={isotopes}
        activeA={activeA}
        // Also include every element's isotopes so the band shows the
        // global trend — heavier Z right, lighter Z left.
        allBands={ELEMENT_CHIPS.map((ez) => ({
          z: ez,
          list: getIsotopes(ez),
        }))}
        currentZ={z}
      />

      {/* Concept-note footer */}
      {(() => {
        const note = noteFor('isotopes', `iso-${z}`) ?? noteFor('isotopes')
        return note ? (
          <div className="iso-concept">
            <span className="iso-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hex-packed nucleus
// ---------------------------------------------------------------------------
// Concentric rings of nucleons: 1 centre + 6n per ring. Ring capacity
// grows with A so we visualise every nucleon — for heavy nuclides
// (Pb-208, U-238) we add rings and shrink each dot so the whole cluster
// still fits.
//
// Ring radius scales with the total nucleon count so the cluster stays
// visually compact at every Z.

const NUCLEUS_VIEWBOX = 200 // px — cluster fits inside this square
const DOT_MIN = 4
const DOT_MAX = 14

// Find the smallest number of rings (r=0..R) whose total capacity >= N.
// Capacity: 1 + Σ 6k for k=1..R = 1 + 6·R·(R+1)/2 = 3R² + 3R + 1.
function ringsNeeded(n: number): { rings: number; spacing: number; dot: number } {
  let rings = 0
  while (3 * rings * rings + 3 * rings + 1 < n) rings++
  // Scale radius so outer ring fits in the viewbox.
  // Outer ring radius = rings * spacing. Spacing chosen so outer = viewbox/2 - dot/2.
  const usable = NUCLEUS_VIEWBOX / 2 - DOT_MAX
  const spacing = rings > 0 ? usable / rings : 0
  // Dot size shrinks slightly when the cluster is dense.
  const dot = Math.max(DOT_MIN, Math.min(DOT_MAX, DOT_MAX - Math.floor(rings / 2)))
  return { rings, spacing, dot }
}

function ringPositions(ring: number, spacing: number, capacityForRing: number): [number, number][] {
  if (ring === 0) return [[0, 0]]
  const r = ring * spacing
  const positions: [number, number][] = []
  for (let i = 0; i < capacityForRing; i++) {
    const angle = (i / capacityForRing) * Math.PI * 2 + (ring % 2) * (Math.PI / capacityForRing)
    positions.push([r * Math.cos(angle), r * Math.sin(angle)])
  }
  return positions
}

function HexNucleus({ protons, neutrons }: { protons: number; neutrons: number }) {
  const total = protons + neutrons
  const { rings, spacing, dot } = ringsNeeded(total)

  // Per-ring capacities (ring 0 = 1; ring k = 6k).
  const ringCapacities: number[] = []
  for (let r = 0; r <= rings; r++) ringCapacities.push(r === 0 ? 1 : 6 * r)

  // Build a flat list of "proton" or "neutron" entries.
  const items: Array<'p' | 'n'> = [
    ...Array.from({ length: protons }, () => 'p' as const),
    ...Array.from({ length: neutrons }, () => 'n' as const),
  ]

  // Place ring-by-ring; outer rings auto-shrink so we never overflow.
  const placed: Array<{ type: 'p' | 'n'; x: number; y: number }> = []
  let idx = 0
  for (let r = 0; r <= rings && idx < items.length; r++) {
    const ringSlots = Math.min(ringCapacities[r], items.length - idx)
    const positions = ringPositions(r, spacing, ringSlots)
    for (const [x, y] of positions) {
      if (idx >= items.length) break
      placed.push({ type: items[idx++], x, y })
    }
  }

  // Convert px → percent of viewbox so the cluster scales with the container.
  const cx0 = NUCLEUS_VIEWBOX / 2

  return (
    <div
      className="iso-nucleus-pack"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        maxWidth: 260,
        margin: '0 auto',
      }}
    >
      <div className="iso-nucleus-glow" />
      <svg
        viewBox={`0 0 ${NUCLEUS_VIEWBOX} ${NUCLEUS_VIEWBOX}`}
        width="100%"
        height="100%"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {placed.map((nuc, i) => (
          <circle
            key={i}
            cx={cx0 + nuc.x}
            cy={cx0 + nuc.y}
            r={dot}
            fill={nuc.type === 'p' ? '#DC2626' : '#52525B'}
            stroke="white"
            strokeWidth={1}
          >
            <title>{nuc.type === 'p' ? 'proton' : 'neutron'}</title>
          </circle>
        ))}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Decay-mode pill — shows the dominant decay channel + daughter nuclide.
// ---------------------------------------------------------------------------

function DecayBadge({ mode, z, a }: { mode: DecayMode; z: number; a: number }) {
  const config: Record<DecayMode, { label: string; symbol: string; color: string; bg: string }> = {
    stable: { label: 'Stable', symbol: '∞', color: '#15803D', bg: '#DCFCE7' },
    'beta-': { label: 'β⁻ beta-minus', symbol: 'β⁻', color: '#6D28D9', bg: '#EDE9FE' },
    'beta+': { label: 'β⁺ beta-plus (positron)', symbol: 'β⁺', color: '#6D28D9', bg: '#EDE9FE' },
    alpha: { label: 'α alpha particle', symbol: 'α', color: '#B91C1C', bg: '#FEE2E2' },
    'electron-capture': { label: 'Electron capture', symbol: 'EC', color: '#1D4ED8', bg: '#DBEAFE' },
    gamma: { label: 'γ gamma', symbol: 'γ', color: '#0F766E', bg: '#CCFBF1' },
  }
  const cfg = config[mode]
  // Daughter nuclide: α removes 2p + 2n, β⁻ converts n → p (A unchanged), β⁺ converts p → n (A unchanged).
  let daughter: string | null = null
  if (mode === 'alpha') {
    const dZ = z - 2
    const dA = a - 4
    const dEl = getElementByZ(dZ)
    if (dEl) daughter = `${dEl.symbol}-${dA}`
    else daughter = `Z=${dZ}, A=${dA}`
  }
  return (
    <div className="iso-decay-row">
      <span className="iso-decay-pill" style={{ color: cfg.color, background: cfg.bg }}>
        <span className="iso-decay-symbol">{cfg.symbol}</span> {cfg.label}
      </span>
      {daughter && (
        <span className="iso-decay-daughter">
          → {daughter}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stability-band mini chart — N vs Z scatter across all known isotopes.
// ---------------------------------------------------------------------------

function StabilityBand({
  isotopes,
  activeA,
  allBands,
  currentZ,
}: {
  isotopes: { a: number; z?: number }[]
  activeA: number
  allBands: { z: number; list: { a: number; z?: number; halfLife: string }[] }[]
  currentZ: number
}) {
  const W = 360
  const H = 160
  // Domain: Z up to ~95, N up to ~150.
  const maxZ = 95
  const maxN = 150

  // Build scatter points.
  type Pt = { z: number; n: number; a: number; stable: boolean; active: boolean }
  const pts: Pt[] = []
  for (const { z: ez, list } of allBands) {
    for (const iso of list) {
      if (iso.z === undefined) continue
      pts.push({
        z: iso.z,
        n: iso.a - iso.z,
        a: iso.a,
        stable: iso.halfLife === 'Stable',
        active: ez === currentZ && iso.a === activeA,
      })
    }
  }

  const sx = (z: number) => 30 + (z / maxZ) * (W - 50)
  const sy = (n: number) => H - 20 - (n / maxN) * (H - 30)

  // Stability band: approximate N/Z ratio (1 for light, 1.5 for heavy).
  const bandPts: [number, number][] = []
  for (let z = 1; z <= maxZ; z++) {
    const n = z <= 20 ? z : z <= 80 ? z * 1.2 : z * 1.55
    bandPts.push([sx(z), sy(n)])
  }

  return (
    <div className="iso-band-card">
      <span className="iso-section-label">Stability band — N vs Z</span>
      <svg width={W} height={H} className="iso-band-svg">
        {/* axes */}
        <line x1={30} y1={H - 20} x2={W - 10} y2={H - 20} stroke="#A1A1AA" strokeWidth={1} />
        <line x1={30} y1={10} x2={30} y2={H - 20} stroke="#A1A1AA" strokeWidth={1} />
        <text x={32} y={20} fontSize="9" fill="#71717A">N</text>
        <text x={W - 14} y={H - 22} fontSize="9" fill="#71717A">Z</text>
        {/* band curve */}
        <polyline
          points={bandPts.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#9333EA"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        {/* points */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.z)}
            cy={sy(p.n)}
            r={p.active ? 6 : p.stable ? 3 : 2}
            fill={p.active ? '#9333EA' : p.stable ? '#15803D' : '#B91C1C'}
            fillOpacity={p.active ? 1 : p.stable ? 0.7 : 0.45}
            stroke={p.active ? 'white' : 'none'}
            strokeWidth={p.active ? 2 : 0}
          >
            {p.active && (
              <animate attributeName="r" values="6;8;6" dur="1.6s" repeatCount="indefinite" />
            )}
          </circle>
        ))}
      </svg>
      <div className="iso-band-legend">
        <span><span className="iso-band-swatch stable" /> Stable</span>
        <span><span className="iso-band-swatch radio" /> Radioactive</span>
        <span><span className="iso-band-swatch band" /> Band of stability</span>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="iso-stat">
      <div className="iso-stat-label">{label}</div>
      <div className="iso-stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}
