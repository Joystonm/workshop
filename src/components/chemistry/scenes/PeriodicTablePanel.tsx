// Periodic Table panel — plain DOM (not 3D). The table is a 2D grid;
// rendering it as R3F Html tiles was unreliable (frustum culling, off-
// screen positions, click handling). DOM is simpler and behaves.

import { useChemistryStore } from '../../../lib/chemistry/store'
import { ELEMENTS, getTablePosition, CATEGORY_COLORS, CATEGORY_LABELS, getElementByZ } from '../../../lib/chemistry/elements'

export function PeriodicTablePanel() {
  const z = useChemistryStore((s) => Math.round(s.params.z ?? 6))
  const setParam = useChemistryStore((s) => s.setParam)
  const sel = getElementByZ(z)

  return (
    <div className="pt-root">
      <div className="pt-table-wrap">
        <div className="pt-table">
          {ELEMENTS.map((el) => {
            const pos = getTablePosition(el.z)
            if (!pos) return null
            const isSelected = el.z === z
            const isLanthAct = pos.row === 8 || pos.row === 9
            return (
              <button
                key={el.z}
                type="button"
                className={`pt-tile ${isSelected ? 'selected' : ''} ${isLanthAct ? `lanthact ${pos.isLanthanide ? 'lanthanide' : 'actinide'}` : ''}`}
                style={{
                  gridColumn: pos.col,
                  gridRow: pos.row,
                  borderColor: isSelected ? 'var(--ws-chemistry)' : CATEGORY_COLORS[el.category],
                  background: isSelected ? 'rgba(147,51,234,0.12)' : 'rgba(255,255,255,0.92)',
                }}
                onClick={() => setParam('z', el.z)}
                title={`${el.name} (${el.symbol})`}
              >
                <div className="pt-z">{el.z}</div>
                <div className="pt-sym" style={{ color: CATEGORY_COLORS[el.category] }}>{el.symbol}</div>
                <div className="pt-mass">{el.mass.toFixed(el.mass < 100 ? 2 : 1)}</div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="pt-legend">
        {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((k) => (
          <span key={k} className="pt-legend-item">
            <span className="pt-legend-swatch" style={{ background: CATEGORY_COLORS[k] }} />
            {CATEGORY_LABELS[k]}
          </span>
        ))}
      </div>
      {sel && (
        <div className="pt-detail">
          <div className="pt-detail-head">
            <span className="pt-detail-sym" style={{ background: CATEGORY_COLORS[sel.category], color: '#fff' }}>{sel.symbol}</span>
            <div className="pt-detail-id">
              <div className="pt-detail-name">{sel.name}</div>
              <div className="pt-detail-z">Z = {sel.z} · {CATEGORY_LABELS[sel.category]}</div>
            </div>
          </div>
          <div className="pt-detail-grid">
            <div><span>Mass</span><b>{sel.mass.toFixed(3)} u</b></div>
            <div><span>Config</span><b>{sel.electronConfig}</b></div>
            <div><span>Shells</span><b>[{sel.shells.join(', ')}]</b></div>
            <div><span>Period / Group</span><b>{sel.period} / {sel.group ?? '—'}</b></div>
            <div><span>Electroneg.</span><b>{sel.electronegativity ?? '—'}</b></div>
            <div><span>Density</span><b>{sel.density != null ? `${sel.density} g/cm³` : '—'}</b></div>
            <div><span>Melting pt</span><b>{sel.meltingPoint != null ? `${sel.meltingPoint} K` : '—'}</b></div>
            <div><span>Boiling pt</span><b>{sel.boilingPoint != null ? `${sel.boilingPoint} K` : '—'}</b></div>
            <div><span>Phase (STP)</span><b>{sel.phase}</b></div>
            <div><span>Discovered</span><b>{sel.discovered}</b></div>
          </div>
          <p className="pt-detail-desc">{sel.description}</p>
        </div>
      )}
    </div>
  )
}
