// CAD Store - Zustand state management for CAD workspace
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  CADObject,
  CADDocument,
  ToolMode,
  GizmoMode,
  Units,
  SnapType,
  VisibilityState,
  PrimitiveType,
  CADMaterial,
  Vector3,
  ViewPreset,
  MATERIAL_PRESETS,
  DEFAULT_PARAMETERS,
  PRIMITIVE_LIBRARY,
  HistoryEntry,
  BooleanOp,
} from './types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createDefaultObject(type: PrimitiveType, position: Vector3 = { x: 0, y: 0, z: 0 }): CADObject {
  const primitive = PRIMITIVE_LIBRARY.find(p => p.type === type)
  const params = primitive?.defaultParams || DEFAULT_PARAMETERS.box

  return {
    id: generateId(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now() % 1000}`,
    type,
    parameters: { ...params },
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    material: MATERIAL_PRESETS.steel,
    visibility: 'visible',
    locked: false,
    parentId: null,
    children: [],
  }
}

interface CADState {
  // Document state
  document: CADDocument

  // UI State
  activeTool: ToolMode
  transformMode: GizmoMode
  showGrid: boolean
  showAxes: boolean
  showObjectTree: boolean
  showProperties: boolean
  units: Units
  gridSize: number

  // Selection
  selectedIds: string[]
  hoveredId: string | null

  // Transform input
  transformInput: Vector3

  // Snap
  snapEnabled: Record<SnapType, boolean>
  snapIncrement: number

  // Sketch
  sketchMode: boolean

  // Test
  testResult: 'idle' | 'testing' | 'success' | 'failure'
  testLoad: number

  // Actions
  setActiveTool: (tool: ToolMode) => void
  setTransformMode: (mode: GizmoMode) => void
  setUnits: (units: Units) => void
  setGridSize: (size: number) => void
  toggleGrid: () => void
  toggleAxes: () => void
  toggleObjectTree: () => void
  toggleProperties: () => void
  toggleSnap: (type: SnapType) => void
  setSnapIncrement: (increment: number) => void

  // Object management
  addObject: (type: PrimitiveType, position?: Vector3) => string
  removeObject: (id: string) => void
  removeSelectedObjects: () => void
  duplicateObject: (id: string) => string | null
  duplicateSelectedObjects: () => void
  updateObject: (id: string, updates: Partial<CADObject>) => void
  updateObjectParameters: (id: string, params: Record<string, number>) => void
  setObjectVisibility: (id: string, visibility: VisibilityState) => void
  renameObject: (id: string, name: string) => void

  // Selection
  selectObject: (id: string, additive?: boolean) => void
  selectObjects: (ids: string[]) => void
  deselectAll: () => void
  selectAll: () => void
  setHovered: (id: string | null) => void

  // Transform
  setTransformInput: (input: Partial<Vector3>) => void
  applyTransform: () => void
  moveSelected: (delta: Vector3) => void
  rotateSelected: (delta: Vector3) => void
  scaleSelected: (factor: Vector3) => void

  // History
  undo: () => void
  redo: () => void
  pushHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void

  // Boolean operations
  booleanOperation: (operation: BooleanOp) => void

  // Test
  runTest: () => void
  resetTest: () => void

  // View
  fitViewTrigger: number
  triggerFitView: () => void
  viewMode: ViewPreset
  setViewMode: (mode: ViewPreset) => void

  // Document
  newDocument: () => void
  loadDocument: (doc: CADDocument) => void
  getDocument: () => CADDocument

  // Helpers
  getSelectedObjects: () => CADObject[]
  getObjectById: (id: string) => CADObject | undefined
}

const createInitialDocument = (): CADDocument => ({
  id: generateId(),
  name: 'Untitled',
  units: 'mm',
  objects: {},
  objectOrder: [],
  selectedIds: [],
  activeTool: 'select',
  transformMode: 'xyz',
  gridSize: 10,
  snapEnabled: {
    grid: true,
    vertex: true,
    edge: true,
    face: true,
    midpoint: true,
    center: true,
  },
  cameraPosition: { x: 10, y: 10, z: 10 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  history: [],
  historyIndex: -1,
  sketchMode: false,
  activeSketchId: null,
})

export const useCADStore = create<CADState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    document: createInitialDocument(),
    activeTool: 'select',
    transformMode: 'xyz',
    showGrid: true,
    showAxes: true,
    showObjectTree: true,
    showProperties: true,
    units: 'mm',
    gridSize: 10,
    selectedIds: [],
    hoveredId: null,
    transformInput: { x: 0, y: 0, z: 0 },
    snapEnabled: {
      grid: true,
      vertex: true,
      edge: true,
      face: true,
      midpoint: true,
      center: true,
    },
    snapIncrement: 1,
    sketchMode: false,
    testResult: 'idle',
    testLoad: 0,
    fitViewTrigger: 0,
    viewMode: 'perspective',

    // Tool actions
    setActiveTool: (tool) => set({ activeTool: tool }),
    setTransformMode: (mode) => set({ transformMode: mode }),
    setUnits: (units) => set((state) => ({ units, document: { ...state.document, units } })),
    setGridSize: (size) => set({ gridSize: size }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
    toggleObjectTree: () => set((state) => ({ showObjectTree: !state.showObjectTree })),
    toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
    toggleSnap: (type) => set((state) => ({
      snapEnabled: { ...state.snapEnabled, [type]: !state.snapEnabled[type] }
    })),
    setSnapIncrement: (increment) => set({ snapIncrement: increment }),

    // Object management
    addObject: (type, position = { x: 0, y: 0, z: 0 }) => {
      const obj = createDefaultObject(type, position)
      set((state) => {
        const newObjects = { ...state.document.objects, [obj.id]: obj }
        const newOrder = [...state.document.objectOrder, obj.id]
        return {
          document: { ...state.document, objects: newObjects, objectOrder: newOrder },
          selectedIds: [obj.id],
          fitViewTrigger: state.fitViewTrigger + 1,
        }
      })
      return obj.id
    },

    removeObject: (id) => {
      set((state) => {
        const { [id]: removed, ...remaining } = state.document.objects
        const newOrder = state.document.objectOrder.filter(oid => oid !== id)
        const newSelected = state.selectedIds.filter(sid => sid !== id)
        return {
          document: { ...state.document, objects: remaining, objectOrder: newOrder },
          selectedIds: newSelected,
        }
      })
    },

    removeSelectedObjects: () => {
      const { selectedIds, document } = get()
      if (selectedIds.length === 0) return
      set((state) => {
        const newObjects = { ...state.document.objects }
        selectedIds.forEach(id => delete newObjects[id])
        const newOrder = state.document.objectOrder.filter(oid => !selectedIds.includes(oid))
        return {
          document: { ...state.document, objects: newObjects, objectOrder: newOrder },
          selectedIds: [],
        }
      })
    },

    duplicateObject: (id) => {
      const obj = get().document.objects[id]
      if (!obj) return null
      const newObj: CADObject = {
        ...obj,
        id: generateId(),
        name: `${obj.name} (copy)`,
        position: {
          x: obj.position.x + 20,
          y: obj.position.y,
          z: obj.position.z,
        },
        parentId: null,
        children: [],
      }
      set((state) => {
        const newObjects = { ...state.document.objects, [newObj.id]: newObj }
        const newOrder = [...state.document.objectOrder, newObj.id]
        return {
          document: { ...state.document, objects: newObjects, objectOrder: newOrder },
          selectedIds: [newObj.id],
        }
      })
      return newObj.id
    },

    duplicateSelectedObjects: () => {
      const { selectedIds, document } = get()
      const newIds: string[] = []
      selectedIds.forEach(id => {
        const newId = get().duplicateObject(id)
        if (newId) newIds.push(newId)
      })
      set({ selectedIds: newIds })
    },

    updateObject: (id, updates) => {
      set((state) => {
        const obj = state.document.objects[id]
        if (!obj) return state
        const newObjects = {
          ...state.document.objects,
          [id]: { ...obj, ...updates }
        }
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    updateObjectParameters: (id, params) => {
      set((state) => {
        const obj = state.document.objects[id]
        if (!obj) return state
        const newObjects = {
          ...state.document.objects,
          [id]: { ...obj, parameters: { ...obj.parameters, ...params } }
        }
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    setObjectVisibility: (id, visibility) => {
      set((state) => {
        const obj = state.document.objects[id]
        if (!obj) return state
        const newObjects = { ...state.document.objects, [id]: { ...obj, visibility } }
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    renameObject: (id, name) => {
      set((state) => {
        const obj = state.document.objects[id]
        if (!obj) return state
        const newObjects = { ...state.document.objects, [id]: { ...obj, name } }
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    // Selection
    selectObject: (id, additive = false) => {
      set((state) => {
        if (additive) {
          const isSelected = state.selectedIds.includes(id)
          return {
            selectedIds: isSelected
              ? state.selectedIds.filter(sid => sid !== id)
              : [...state.selectedIds, id]
          }
        }
        return { selectedIds: [id] }
      })
    },

    selectObjects: (ids) => set({ selectedIds: ids }),
    deselectAll: () => set({ selectedIds: [] }),
    selectAll: () => set((state) => ({ selectedIds: [...state.document.objectOrder] })),
    setHovered: (id) => set({ hoveredId: id }),

    // Transform
    setTransformInput: (input) => {
      set((state) => ({ transformInput: { ...state.transformInput, ...input } }))
    },

    applyTransform: () => {
      const { selectedIds, transformInput, transformMode, document } = get()
      if (selectedIds.length === 0) return

      selectedIds.forEach(id => {
        const obj = document.objects[id]
        if (!obj) return

        if (transformMode === 'x' || transformMode === 'y' || transformMode === 'z' || transformMode === 'xyz' || transformMode === 'uniform') {
          get().moveSelected(transformInput)
        } else {
          get().rotateSelected(transformInput)
        }
      })
      set({ transformInput: { x: 0, y: 0, z: 0 } })
    },

    moveSelected: (delta) => {
      const { selectedIds, document } = get()
      if (selectedIds.length === 0) return
      set((state) => {
        const newObjects = { ...state.document.objects }
        selectedIds.forEach(id => {
          const obj = newObjects[id]
          if (obj && !obj.locked) {
            newObjects[id] = {
              ...obj,
              position: {
                x: obj.position.x + delta.x,
                y: obj.position.y + delta.y,
                z: obj.position.z + delta.z,
              }
            }
          }
        })
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    rotateSelected: (delta) => {
      const { selectedIds, document } = get()
      if (selectedIds.length === 0) return
      set((state) => {
        const newObjects = { ...state.document.objects }
        selectedIds.forEach(id => {
          const obj = newObjects[id]
          if (obj && !obj.locked) {
            newObjects[id] = {
              ...obj,
              rotation: {
                x: obj.rotation.x + delta.x,
                y: obj.rotation.y + delta.y,
                z: obj.rotation.z + delta.z,
              }
            }
          }
        })
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    scaleSelected: (factor) => {
      const { selectedIds, document } = get()
      if (selectedIds.length === 0) return
      set((state) => {
        const newObjects = { ...state.document.objects }
        selectedIds.forEach(id => {
          const obj = newObjects[id]
          if (obj && !obj.locked) {
            newObjects[id] = {
              ...obj,
              scale: {
                x: obj.scale.x * factor.x,
                y: obj.scale.y * factor.y,
                z: obj.scale.z * factor.z,
              }
            }
          }
        })
        return { document: { ...state.document, objects: newObjects } }
      })
    },

    // History
    pushHistory: (entry) => {
      set((state) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: generateId(),
          timestamp: Date.now(),
        }
        const newHistory = state.document.history.slice(0, state.document.historyIndex + 1)
        newHistory.push(newEntry)
        return {
          document: {
            ...state.document,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          }
        }
      })
    },

    undo: () => {
      set((state) => {
        if (state.document.historyIndex < 0) return state
        const entry = state.document.history[state.document.historyIndex]
        const obj = state.document.objects[entry.objectId]
        if (!obj) return state
        const newObjects = {
          ...state.document.objects,
          [entry.objectId]: { ...obj, ...entry.previousState }
        }
        return {
          document: {
            ...state.document,
            objects: newObjects,
            historyIndex: state.document.historyIndex - 1,
          }
        }
      })
    },

    redo: () => {
      set((state) => {
        if (state.document.historyIndex >= state.document.history.length - 1) return state
        const entry = state.document.history[state.document.historyIndex + 1]
        const obj = state.document.objects[entry.objectId]
        if (!obj) return state
        const newObjects = {
          ...state.document.objects,
          [entry.objectId]: { ...obj, ...entry.newState }
        }
        return {
          document: {
            ...state.document,
            objects: newObjects,
            historyIndex: state.document.historyIndex + 1,
          }
        }
      })
    },

    // Boolean operations
    booleanOperation: (operation) => {
      // Placeholder - real implementation would use CSG library
      console.log('Boolean operation:', operation, 'on objects:', get().selectedIds)
    },

    // Test
    runTest: () => {
      const objects = Object.values(get().document.objects)
      if (objects.length === 0) return

      set({ testResult: 'testing', testLoad: 500 })

      // Simulate analysis time
      setTimeout(() => {
        // Use simplified check: need at least 2 objects to form a structure
        const passed = objects.length >= 2
        set({ testResult: passed ? 'success' : 'failure' })
        setTimeout(() => set({ testResult: 'idle', testLoad: 0 }), 3000)
      }, 2000)
    },

    resetTest: () => {
      set({ testResult: 'idle', testLoad: 0 })
    },

    // View
    triggerFitView: () => set((state) => ({ fitViewTrigger: state.fitViewTrigger + 1 })),
    setViewMode: (mode) =>
      set((state) => ({
        viewMode: mode,
        // Re-fit on view change so the new framing shows all objects.
        fitViewTrigger: state.fitViewTrigger + 1,
      })),

    // Document
    newDocument: () => {
      set({ document: createInitialDocument(), selectedIds: [], hoveredId: null })
    },

    loadDocument: (doc) => {
      set({ document: doc, selectedIds: doc.selectedIds || [] })
    },

    getDocument: () => get().document,

    // Helpers
    getSelectedObjects: () => {
      const { selectedIds, document } = get()
      return selectedIds.map(id => document.objects[id]).filter(Boolean)
    },

    getObjectById: (id) => get().document.objects[id],
  }))
)
