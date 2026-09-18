// Vertical tool rail — Select / Move / Rotate / Scale, view toggles, history,
// and delete. Subscribes properly so highlights and disabled states update
// reactively (the previous inline `getState()` calls did not re-render).

import { useCADStore } from '../../lib/cad/store'
import { ToolMode } from '../../lib/cad/types'
import {
  SelectIcon,
  MoveIcon,
  RotateIcon,
  ScaleIcon,
  GridIcon,
  AxesIcon,
  UndoIcon,
  RedoIcon,
  DeleteIcon,
} from './icons'

type ToolDef = {
  id: ToolMode
  label: string
  shortcut: string
  Icon: (p?: { size?: number }) => React.ReactElement
}

const TRANSFORM_TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', shortcut: 'V', Icon: SelectIcon },
  { id: 'move', label: 'Move', shortcut: 'G', Icon: MoveIcon },
  { id: 'rotate', label: 'Rotate', shortcut: 'R', Icon: RotateIcon },
  { id: 'scale', label: 'Scale', shortcut: 'S', Icon: ScaleIcon },
]

export function CADToolRail() {
  // Subscribe to everything that affects the rail's appearance.
  const activeTool = useCADStore((s) => s.activeTool)
  const showGrid = useCADStore((s) => s.showGrid)
  const showAxes = useCADStore((s) => s.showAxes)
  const historyIndex = useCADStore((s) => s.document.historyIndex)
  const historyLength = useCADStore((s) => s.document.history.length)
  const hasSelection = useCADStore((s) => s.selectedIds.length > 0)

  const setActiveTool = useCADStore((s) => s.setActiveTool)
  const toggleGrid = useCADStore((s) => s.toggleGrid)
  const toggleAxes = useCADStore((s) => s.toggleAxes)
  const undo = useCADStore((s) => s.undo)
  const redo = useCADStore((s) => s.redo)
  const removeSelectedObjects = useCADStore((s) => s.removeSelectedObjects)

  const canUndo = historyIndex >= 0
  const canRedo = historyIndex < historyLength - 1

  return (
    <div className="cad-tool-rail">
      {TRANSFORM_TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={`rail-btn ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => setActiveTool(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
        >
          <tool.Icon size={16} />
        </button>
      ))}

      <div className="rail-divider" />

      <button
        className={`rail-btn ${showGrid ? 'active' : ''}`}
        onClick={toggleGrid}
        title="Toggle Grid"
        aria-label="Toggle grid"
      >
        <GridIcon size={16} />
      </button>
      <button
        className={`rail-btn ${showAxes ? 'active' : ''}`}
        onClick={toggleAxes}
        title="Toggle Axes"
        aria-label="Toggle axes"
      >
        <AxesIcon size={16} />
      </button>

      <div className="rail-divider" />

      <button
        className="rail-btn"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <UndoIcon size={16} />
      </button>
      <button
        className="rail-btn"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        <RedoIcon size={16} />
      </button>

      <div className="rail-spacer" />

      <button
        className="rail-btn danger"
        onClick={removeSelectedObjects}
        disabled={!hasSelection}
        title="Delete (⌫)"
        aria-label="Delete selection"
      >
        <DeleteIcon size={16} />
      </button>
    </div>
  )
}
