// CAD Persistence - Save/Load via Convex
import { useCADStore } from './store'
import { CADDocument } from './types'

// Local storage keys
const AUTOSAVE_KEY = 'workshop_cad_autosave'

// Auto-save to local storage (debounced)
let autosaveTimeout: number | null = null

export function autoSaveDocument() {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout)
  }

  autosaveTimeout = window.setTimeout(() => {
    const doc = useCADStore.getState().getDocument()
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(doc))
      console.log('Auto-saved CAD document')
    } catch (e) {
      console.error('Failed to auto-save:', e)
    }
  }, 2000) // Debounce 2 seconds
}

// Load from local storage
export function loadFromLocalStorage(): CADDocument | null {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    if (saved) {
      const doc = JSON.parse(saved) as CADDocument
      return doc
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return null
}

// Export document as JSON
export function exportDocument(doc: CADDocument): string {
  return JSON.stringify(doc, null, 2)
}

// Import document from JSON
export function importDocument(json: string): CADDocument | null {
  try {
    const doc = JSON.parse(json) as CADDocument
    // Basic validation
    if (!doc.id || !doc.objects || !doc.objectOrder) {
      throw new Error('Invalid document structure')
    }
    return doc
  } catch (e) {
    console.error('Failed to import document:', e)
    return null
  }
}

// Export as STL (simplified - just the geometry data)
export function exportAsSTL(doc: CADDocument): string {
  // For a full implementation, you would use a library like three-stlExporter
  // This is a placeholder that outputs basic structure
  const objects = doc.objectOrder.map(id => doc.objects[id]).filter(Boolean)

  let output = 'solid workshop_export\n'

  objects.forEach(obj => {
    // This is simplified - real implementation would compute mesh triangles
    output += `  // Object: ${obj.name} (${obj.type})\n`
    output += `  // Position: ${obj.position.x}, ${obj.position.y}, ${obj.position.z}\n`
  })

  output += 'endsolid workshop_export\n'

  return output
}

// Generate thumbnail (placeholder - real implementation would use canvas)
export function generateThumbnail(): string | null {
  // This would need actual WebGL canvas capture
  return null
}

// Debounced auto-save subscriber
useCADStore.subscribe(
  (state) => [state.document.objects, state.document.objectOrder, state.selectedIds],
  () => {
    autoSaveDocument()
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
)
