// CAD workshop shell — composes the 4-zone layout (56px tool shelf / 240px
// content rail / flex stage / 300px properties panel), wires keyboard shortcuts,
// and owns the content-rail tab state (Scene tree vs. Add primitive picker).

import { useEffect, useMemo, useState } from 'react'
import { useCADStore } from '../../lib/cad/store'
import { CADToolRail } from './CADToolRail'
import { SceneTree } from './SceneTree'
import { PrimitivePicker } from './PrimitivePicker'
import { CADViewport } from './CADViewport'
import { PropertiesPanel } from './PropertiesPanel'
import { StatusBar } from './StatusBar'
import { ViewSelector } from './ViewSelector'
import { CAD_STYLES } from './styles'
import { useCompanionContext } from '../../hooks/useCompanionContext'

type ContentTab = 'scene' | 'add'

export function CADShell() {
  const [tab, setTab] = useState<ContentTab>('scene')
  const { setSnapshot } = useCompanionContext()

  // Publish the current CAD document to the Companion so it can answer
  // questions about the structure under design.
  const document = useCADStore((s) => s.document)
  const testResult = useCADStore((s) => s.testResult)
  const testLoad = useCADStore((s) => s.testLoad)
  const selectedIds = useCADStore((s) => s.selectedIds)
  const activeTool = useCADStore((s) => s.activeTool)

  const summary = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const id of document.objectOrder) {
      const obj = document.objects[id]
      if (!obj) continue
      counts[obj.type] = (counts[obj.type] ?? 0) + 1
    }
    return {
      name: document.name,
      nObjects: document.objectOrder.length,
      primitiveCounts: counts,
      testLoad,
      testResult,
      selectedCount: selectedIds.length,
      activeTool,
    }
  }, [document, testLoad, testResult, selectedIds, activeTool])

  useEffect(() => {
    const docName = document.name || 'Untitled CAD model'
    setSnapshot({
      section: 'cad',
      experimentId: `document:${docName}`,
      experimentTitle: docName,
      objective: 'Design and test a load-bearing 3D structure.',
      params: {
        activeTool,
        selectedCount: selectedIds.length,
        testLoad,
        testResult,
      },
      measurements: {},
      results: summary as unknown as Record<string, unknown>,
      formulas: [
        'σ = F / A              (stress)',
        'ε = ΔL / L             (strain)',
        'E = σ / ε              (Young\'s modulus)',
        'M = ρ · V              (mass)',
      ],
      errorMessage: testResult === 'failure'
        ? 'The most recent load test failed — the structure exceeded allowable stress.'
        : undefined,
    })
    return () => setSnapshot(null)
  }, [document, summary, selectedIds.length, activeTool, testLoad, testResult, setSnapshot])

  // Keyboard shortcuts — V/G/R/S, undo/redo, delete, duplicate, select-all.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const store = useCADStore.getState()

      switch (e.key.toLowerCase()) {
        case 'v': store.setActiveTool('select'); break
        case 'g': store.setActiveTool('move'); break
        case 'r': store.setActiveTool('rotate'); break
        case 's': store.setActiveTool('scale'); break
        case 'f': store.triggerFitView(); break
        case '1': store.setViewMode('perspective'); break
        case '2': store.setViewMode('top'); break
        case '3': store.setViewMode('right'); break
        case '4': store.setViewMode('front'); break
        case '5': store.setViewMode('isometric'); break
        case 'delete':
        case 'backspace':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            store.removeSelectedObjects()
          }
          break
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.shiftKey) store.redo()
            else store.undo()
          }
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            store.duplicateSelectedObjects()
          }
          break
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            store.selectAll()
          }
          break
        case 'escape':
          store.deselectAll()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="cad-shell">
      {/* Narrow vertical tool shelf — 56px column of tool icons */}
      <div className="cad-tool-shelf">
        <CADToolRail />
      </div>

      {/* Content rail: 240px wide, tabs + scene tree or primitive picker */}
      <aside className="cad-rail">
        <ViewSelector />
        <div className="cad-panel-tabs">
          <button
            className={`cad-panel-tab ${tab === 'scene' ? 'active' : ''}`}
            onClick={() => setTab('scene')}
          >
            Objects
          </button>
          <button
            className={`cad-panel-tab ${tab === 'add' ? 'active' : ''}`}
            onClick={() => setTab('add')}
          >
            Primitives
          </button>
        </div>
        {tab === 'scene' ? <SceneTree /> : <PrimitivePicker />}
      </aside>

      <main className="cad-stage">
        <CADViewport />
        <StatusBar />
      </main>

      <PropertiesPanel />

      <style>{CAD_STYLES}</style>
    </div>
  )
}
