// CAD Types - Core type definitions for the CAD system

export type Units = 'mm' | 'cm' | 'm' | 'inch'

export type PrimitiveType =
  | 'box' | 'cuboid' | 'sphere' | 'cylinder' | 'cone'
  | 'capsule' | 'torus' | 'plane' | 'prism' | 'pyramid'
  | 'wedge' | 'polyhedron'
  | 'beam' | 'rod' | 'pipe' | 'tube' | 'plate'
  | 'iBeam' | 'lBeam' | 'tBeam' | 'uChannel'

export type MaterialType = 'steel' | 'aluminum' | 'copper' | 'plastic' | 'wood' | 'glass' | 'rubber' | 'concrete'

export type ToolMode =
  | 'select'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'mirror'
  | 'array'
  | 'measure'
  | 'sketch'
  | 'extrude'
  | 'revolve'
  | 'fillet'
  | 'chamfer'
  | 'boolean'

export type BooleanOp = 'union' | 'subtract' | 'intersect'

export type GizmoMode = 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz' | 'uniform'

export type SnapType = 'grid' | 'vertex' | 'edge' | 'face' | 'midpoint' | 'center'

export type ConstraintType = 'horizontal' | 'vertical' | 'coincident' | 'parallel' | 'perpendicular' | 'tangent' | 'equal' | 'fixed' | 'distance' | 'angle' | 'radius'

export type ViewPreset = 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'isometric'

export type VisibilityState = 'visible' | 'hidden' | 'isolated' | 'transparent' | 'wireframe'

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface CADMaterial {
  type: MaterialType
  color: string
  roughness: number
  metalness: number
}

export interface CADParameters {
  // Box/Cuboid
  width?: number
  height?: number
  depth?: number
  // Cylinder/Cone
  radius?: number
  radiusTop?: number
  radiusBottom?: number
  // Sphere
  // Capsule
  // Torus
  innerRadius?: number
  outerRadius?: number
  // Beam
  // Prism
  sides?: number
  // General
  length?: number
  segments?: number
  // Extrude
  extrudeDepth?: number
  // Revolve
  revolveAngle?: number
}

export interface SketchPoint {
  id: string
  x: number
  y: number
  z: number
  constraints: ConstraintType[]
}

export interface SketchLine {
  id: string
  startId: string
  endId: string
  length?: number
  angle?: number
}

export interface Sketch {
  id: string
  name: string
  points: SketchPoint[]
  lines: SketchLine[]
  visible: boolean
}

export interface CADObject {
  id: string
  name: string
  type: PrimitiveType
  parameters: CADParameters
  position: Vector3
  rotation: Vector3
  scale: Vector3
  material: CADMaterial
  visibility: VisibilityState
  locked: boolean
  parentId: string | null
  children: string[]
  sketch?: Sketch
  sourceExtrusion?: string
  sourceRevolve?: string
}

export interface HistoryEntry {
  id: string
  type: string
  timestamp: number
  objectId: string
  previousState: Partial<CADObject>
  newState: Partial<CADObject>
}

export interface CADDocument {
  id: string
  name: string
  units: Units
  objects: Record<string, CADObject>
  objectOrder: string[]
  selectedIds: string[]
  activeTool: ToolMode
  transformMode: GizmoMode
  gridSize: number
  snapEnabled: Record<SnapType, boolean>
  cameraPosition: Vector3
  cameraTarget: Vector3
  history: HistoryEntry[]
  historyIndex: number
  sketchMode: boolean
  activeSketchId: string | null
}

export interface StructuralTestResult {
  objectId: string
  load: number
  maxDisplacement: number
  stress: number
  passed: boolean
  failureMode?: 'yield' | 'buckling' | 'excessive_deflection'
  weakJoint?: string
}

export interface ExperimentAttempt {
  id: string
  document: CADDocument
  testResult?: StructuralTestResult
  timestamp: number
}

// Material presets
export const MATERIAL_PRESETS: Record<MaterialType, CADMaterial> = {
  steel: { type: 'steel', color: '#6B7280', roughness: 0.3, metalness: 0.8 },
  aluminum: { type: 'aluminum', color: '#B8C4CE', roughness: 0.35, metalness: 0.7 },
  copper: { type: 'copper', color: '#B87333', roughness: 0.3, metalness: 0.75 },
  plastic: { type: 'plastic', color: '#404040', roughness: 0.6, metalness: 0.0 },
  wood: { type: 'wood', color: '#8B5A2B', roughness: 0.7, metalness: 0.0 },
  glass: { type: 'glass', color: '#87CEEB', roughness: 0.1, metalness: 0.0, },
  rubber: { type: 'rubber', color: '#2F2F2F', roughness: 0.9, metalness: 0.0 },
  concrete: { type: 'concrete', color: '#808080', roughness: 0.85, metalness: 0.1 },
}

// Default parameters for each primitive type
export const DEFAULT_PARAMETERS: Record<PrimitiveType, CADParameters> = {
  box: { width: 20, height: 20, depth: 20 },
  cuboid: { width: 50, height: 30, depth: 80 },
  sphere: { radius: 10, segments: 32 },
  cylinder: { radius: 10, height: 30, segments: 32 },
  cone: { radiusBottom: 10, radiusTop: 0, height: 30, segments: 32 },
  capsule: { radius: 5, height: 20, segments: 16 },
  torus: { innerRadius: 5, outerRadius: 15, segments: 24, },
  plane: { width: 50, height: 50 },
  prism: { radius: 10, height: 20, sides: 6 },
  pyramid: { radius: 10, height: 20, sides: 4 },
  wedge: { width: 20, height: 15, depth: 30 },
  polyhedron: { radius: 10, segments: 16 },
  beam: { width: 10, height: 20, depth: 100 },
  rod: { radius: 5, length: 100 },
  pipe: { innerRadius: 8, outerRadius: 10, length: 50 },
  tube: { innerRadius: 6, outerRadius: 10, length: 80 },
  plate: { width: 100, height: 100, depth: 5 },
  iBeam: { width: 20, height: 40, depth: 80, },
  lBeam: { width: 15, height: 30, depth: 60 },
  tBeam: { width: 20, height: 35, depth: 70 },
  uChannel: { width: 25, height: 40, depth: 60 },
}

// Primitive metadata for UI
export interface PrimitiveInfo {
  type: PrimitiveType
  label: string
  category: 'basic' | 'engineering' | 'structural'
  defaultParams: CADParameters
}

export const PRIMITIVE_LIBRARY: PrimitiveInfo[] = [
  // Basic
  { type: 'box', label: 'Box', category: 'basic', defaultParams: DEFAULT_PARAMETERS.box },
  { type: 'cuboid', label: 'Cuboid', category: 'basic', defaultParams: DEFAULT_PARAMETERS.cuboid },
  { type: 'sphere', label: 'Sphere', category: 'basic', defaultParams: DEFAULT_PARAMETERS.sphere },
  { type: 'cylinder', label: 'Cylinder', category: 'basic', defaultParams: DEFAULT_PARAMETERS.cylinder },
  { type: 'cone', label: 'Cone', category: 'basic', defaultParams: DEFAULT_PARAMETERS.cone },
  { type: 'capsule', label: 'Capsule', category: 'basic', defaultParams: DEFAULT_PARAMETERS.capsule },
  { type: 'torus', label: 'Torus', category: 'basic', defaultParams: DEFAULT_PARAMETERS.torus },
  { type: 'plane', label: 'Plane', category: 'basic', defaultParams: DEFAULT_PARAMETERS.plane },
  { type: 'prism', label: 'Prism', category: 'basic', defaultParams: DEFAULT_PARAMETERS.prism },
  { type: 'pyramid', label: 'Pyramid', category: 'basic', defaultParams: DEFAULT_PARAMETERS.pyramid },
  { type: 'wedge', label: 'Wedge', category: 'basic', defaultParams: DEFAULT_PARAMETERS.wedge },
  // Engineering
  { type: 'beam', label: 'Beam', category: 'engineering', defaultParams: DEFAULT_PARAMETERS.beam },
  { type: 'rod', label: 'Rod', category: 'engineering', defaultParams: DEFAULT_PARAMETERS.rod },
  { type: 'pipe', label: 'Pipe', category: 'engineering', defaultParams: DEFAULT_PARAMETERS.pipe },
  { type: 'tube', label: 'Tube', category: 'engineering', defaultParams: DEFAULT_PARAMETERS.tube },
  { type: 'plate', label: 'Plate', category: 'engineering', defaultParams: DEFAULT_PARAMETERS.plate },
  // Structural
  { type: 'iBeam', label: 'I-Beam', category: 'structural', defaultParams: DEFAULT_PARAMETERS.iBeam },
  { type: 'lBeam', label: 'L-Beam', category: 'structural', defaultParams: DEFAULT_PARAMETERS.lBeam },
  { type: 'tBeam', label: 'T-Beam', category: 'structural', defaultParams: DEFAULT_PARAMETERS.tBeam },
  { type: 'uChannel', label: 'U-Channel', category: 'structural', defaultParams: DEFAULT_PARAMETERS.uChannel },
]
