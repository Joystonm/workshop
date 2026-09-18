// View-mode selector — 5 chips (Perspective / Top / Right / Front / Iso).
// Lives at the top of the left content rail so the user can switch view
// modes without affecting selection. Switching modes auto-fits the camera.

import { useCADStore } from '../../lib/cad/store'
import type { ViewPreset } from '../../lib/cad/types'
import { LayersIcon } from './icons'

const VIEW_OPTIONS: { value: ViewPreset; label: string; key: string }[] = [
  { value: 'perspective', label: '3D', key: '1' },
  { value: 'top', label: 'Top', key: '2' },
  { value: 'right', label: 'Right', key: '3' },
  { value: 'front', label: 'Front', key: '4' },
  { value: 'isometric', label: 'Iso', key: '5' },
]

export function ViewSelector() {
  const viewMode = useCADStore((s) => s.viewMode)
  const setViewMode = useCADStore((s) => s.setViewMode)

  return (
    <div className="cad-view-selector">
      <div className="cad-view-selector-head">
        <LayersIcon size={11} />
        <span>VIEW</span>
      </div>
      <div className="cad-view-chips">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`cad-view-chip ${viewMode === opt.value ? 'active' : ''}`}
            onClick={() => setViewMode(opt.value)}
            title={`${opt.label} view (${opt.key})`}
          >
            <span className="cad-view-chip-label">{opt.label}</span>
            <span className="cad-view-chip-key">{opt.key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
