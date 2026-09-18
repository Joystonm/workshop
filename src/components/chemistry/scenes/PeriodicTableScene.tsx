// Periodic Table scene. Renders all 118 elements as DOM tiles positioned
// in 3D space via drei <Html>. The user can click a tile to select an
// element; the right panel shows its full data card.

import { Html } from '@react-three/drei'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { ELEMENTS, getTablePosition, CATEGORY_COLORS, CATEGORY_LABELS } from '../../../lib/chemistry/elements'

const CELL = 1.4
const X0 = -10
const Y0 = 5

export function PeriodicTableScene() {
  const z = useChemistryStore((s) => Math.round(s.params.z ?? 6))
  const setParam = useChemistryStore((s) => s.setParam)

  return (
    <group>
      {ELEMENTS.map((el) => {
        const pos = getTablePosition(el.z)
        if (!pos) return null
        const x = X0 + (pos.col - 1) * CELL
        const y = Y0 - (pos.row - 1) * CELL
        const isLanthAct = pos.row === 8 || pos.row === 9
        return (
          <Html
            key={el.z}
            position={[x, y, 0]}
            center
            distanceFactor={10}
            zIndexRange={[0, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className={`pt-tile ${el.z === z ? 'selected' : ''} ${isLanthAct ? 'lanthact' : ''}`}
              style={{ borderColor: el.z === z ? 'var(--ws-chemistry)' : CATEGORY_COLORS[el.category] }}
              onClick={() => setParam('z', el.z)}
              title={`${el.name} (${el.symbol})`}
            >
              <div className="pt-z">{el.z}</div>
              <div className="pt-sym" style={{ color: CATEGORY_COLORS[el.category] }}>{el.symbol}</div>
              <div className="pt-mass">{el.mass.toFixed(el.mass < 100 ? 2 : 1)}</div>
            </div>
          </Html>
        )
      })}
      <Html
        position={[0, -Y0 - 2, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div className="pt-legend">
          {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((k) => (
            <span key={k} className="pt-legend-item">
              <span className="pt-legend-swatch" style={{ background: CATEGORY_COLORS[k] }} />
              {CATEGORY_LABELS[k]}
            </span>
          ))}
        </div>
      </Html>
    </group>
  )
}
