// Bottom status bar. Mirrors the family pattern from physics/Chemistry/Space
// lab shells: monospace text, dot indicator for state, `·` separators.

import { useCADStore } from '../../lib/cad/store'
import { FitViewIcon } from './icons'

export function StatusBar() {
  const testResult = useCADStore((s) => s.testResult)
  const testLoad = useCADStore((s) => s.testLoad)
  const objectCount = useCADStore((s) => s.document.objectOrder.length)
  const selectedCount = useCADStore((s) => s.selectedIds.length)
  const activeTool = useCADStore((s) => s.activeTool)
  const units = useCADStore((s) => s.units)
  const gridSize = useCADStore((s) => s.gridSize)
  const triggerFitView = useCADStore((s) => s.triggerFitView)

  const testLabel =
    testResult === 'idle' ? 'Ready' :
    testResult === 'testing' ? `Testing… ${testLoad}N` :
    testResult === 'success' ? 'Structure held' :
    'Structure failed'

  return (
    <div className="cad-status-bar">
      <div className="cad-status-left">
        <span className={`cad-status-dot ${testResult === 'idle' ? '' : testResult}`} />
        <span>{testLabel}</span>
        <span className="cad-status-sep">·</span>
        <span>Objects: {objectCount}</span>
        {selectedCount > 0 && (
          <>
            <span className="cad-status-sep">·</span>
            <span>Selected: {selectedCount}</span>
          </>
        )}
      </div>
      <div className="cad-status-right">
        <span>Tool: {activeTool}</span>
        <span className="cad-status-sep">·</span>
        <span>Grid: {gridSize}{units}</span>
        <span className="cad-status-sep">·</span>
        <span>Units: {units}</span>
        <span className="cad-status-sep">·</span>
        <button
          className="cad-status-fit-view"
          onClick={triggerFitView}
          title="Fit camera to all objects (F)"
          disabled={objectCount === 0}
        >
          <FitViewIcon size={11} />
          <span>Fit View</span>
        </button>
      </div>
    </div>
  )
}
