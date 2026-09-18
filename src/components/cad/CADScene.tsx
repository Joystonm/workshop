// Three.js scene composition for CAD. Owns the lighting, grid, axes, object
// rendering, transform gizmo, and measurement overlay. Subscribes properly to
// the store so all visual state is reactive (the previous CAD.tsx had inline
// getState() calls that didn't trigger re-renders).
//
// Three.js material colors must be hex strings — they don't read CSS custom
// properties. We define them as constants to match --accent from index.css.

import { useRef, useCallback, useMemo, useLayoutEffect, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useCADStore } from '../../lib/cad/store'
import { createGeometry, getBoundingBox, getObjectVolume } from '../../lib/cad/geometry'
import { CADObject, ToolMode } from '../../lib/cad/types'

// Match --accent in src/index.css. Three.js needs a hex literal.
const SELECTION_COLOR = '#2563EB'

// ─── Object renderer ─────────────────────────────────────────────────────

function CADShape({
  object,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  registerRef,
}: {
  object: CADObject
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
  registerRef?: (id: string, ref: THREE.Object3D | null) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => createGeometry(object), [object])

  // Apply transforms imperatively so the gizmo can manipulate them without
  // React overwriting the values on every render.
  useLayoutEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(object.position.x, object.position.y, object.position.z)
    groupRef.current.rotation.set(
      (object.rotation.x * Math.PI) / 180,
      (object.rotation.y * Math.PI) / 180,
      (object.rotation.z * Math.PI) / 180
    )
    groupRef.current.scale.set(object.scale.x, object.scale.y, object.scale.z)
  }, [
    object.id,
    object.position.x, object.position.y, object.position.z,
    object.rotation.x, object.rotation.y, object.rotation.z,
    object.scale.x, object.scale.y, object.scale.z,
  ])

  useEffect(() => {
    if (registerRef) registerRef(object.id, groupRef.current)
    return () => { if (registerRef) registerRef(object.id, null) }
  }, [object.id, registerRef])

  return (
    <group ref={groupRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerEnter={(e) => {
          e.stopPropagation()
          onHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={() => {
          onHover(false)
          document.body.style.cursor = 'default'
        }}
        castShadow
        receiveShadow
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={object.material.color}
          roughness={object.material.roughness}
          metalness={object.material.metalness}
          transparent={object.visibility === 'transparent'}
          opacity={object.visibility === 'transparent' ? 0.5 : 1}
          wireframe={object.visibility === 'wireframe'}
        />
      </mesh>
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color={SELECTION_COLOR} linewidth={2} />
        </lineSegments>
      )}
      {isHovered && !isSelected && (
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color={SELECTION_COLOR} transparent opacity={0.4} linewidth={1} />
        </lineSegments>
      )}
    </group>
  )
}

// ─── Transform gizmo ─────────────────────────────────────────────────────

function TransformGizmo({
  targetRef,
  objectId,
  mode,
}: {
  targetRef: THREE.Object3D
  objectId: string
  mode: ToolMode
}) {
  const transformRef = useRef<any>(null)
  const isDragging = useRef(false)
  const transformMode = mode === 'move' ? 'translate' : mode === 'rotate' ? 'rotate' : 'scale'

  // Mirror store changes into the 3D object when the user edits values via the
  // properties panel. Skip while the gizmo is being dragged to avoid fighting.
  useFrame(() => {
    if (!targetRef) return
    const store = useCADStore.getState()
    const obj = store.document.objects[objectId]
    if (!obj) return

    if (transformRef.current && isDragging.current) return

    if (
      Math.abs(targetRef.position.x - obj.position.x) > 0.0001 ||
      Math.abs(targetRef.position.y - obj.position.y) > 0.0001 ||
      Math.abs(targetRef.position.z - obj.position.z) > 0.0001
    ) {
      targetRef.position.set(obj.position.x, obj.position.y, obj.position.z)
    }

    const rx = (obj.rotation.x * Math.PI) / 180
    const ry = (obj.rotation.y * Math.PI) / 180
    const rz = (obj.rotation.z * Math.PI) / 180
    if (
      Math.abs(targetRef.rotation.x - rx) > 0.0001 ||
      Math.abs(targetRef.rotation.y - ry) > 0.0001 ||
      Math.abs(targetRef.rotation.z - rz) > 0.0001
    ) {
      targetRef.rotation.set(rx, ry, rz)
    }

    if (
      Math.abs(targetRef.scale.x - obj.scale.x) > 0.0001 ||
      Math.abs(targetRef.scale.y - obj.scale.y) > 0.0001 ||
      Math.abs(targetRef.scale.z - obj.scale.z) > 0.0001
    ) {
      targetRef.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
    }
  })

  if (!targetRef) return null

  return (
    <TransformControls
      ref={transformRef}
      object={targetRef}
      mode={transformMode}
      onMouseDown={() => { isDragging.current = true }}
      onMouseUp={() => { isDragging.current = false }}
      onObjectChange={() => {
        const store = useCADStore.getState()
        const obj = store.document.objects[objectId]
        if (!obj) return
        const p = targetRef.position
        const r = targetRef.rotation
        const s = targetRef.scale
        store.updateObject(objectId, {
          position: { x: p.x, y: p.y, z: p.z },
          rotation: {
            x: (r.x * 180) / Math.PI,
            y: (r.y * 180) / Math.PI,
            z: (r.z * 180) / Math.PI,
          },
          scale: { x: s.x, y: s.y, z: s.z },
        })
      }}
    />
  )
}

// ─── Measurement overlay ─────────────────────────────────────────────────

function MeasurementOverlay() {
  const selectedIds = useCADStore((s) => s.selectedIds)
  const objects = useCADStore((s) => s.document.objects)
  const measureMode = useCADStore((s) => s.activeTool === 'measure')

  if (!measureMode || selectedIds.length === 0) return null

  const obj = objects[selectedIds[0]]
  if (!obj) return null

  const bbox = getBoundingBox(obj)
  const volume = getObjectVolume(obj)

  return (
    <Html
      position={[obj.position.x, obj.position.y + bbox.y / 2 + 0.5, obj.position.z]}
      center
      style={{
        background: 'var(--bg-elevated)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'Geist, sans-serif',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>{obj.name}</div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', fontVariantNumeric: 'tabular-nums' }}>
        <span>{bbox.x.toFixed(1)} × {bbox.y.toFixed(1)} × {bbox.z.toFixed(1)} mm</span>
        <span style={{ color: 'var(--text-muted)' }}>{volume.toFixed(0)} mm³</span>
      </div>
    </Html>
  )
}

// ─── Camera fit-to-view ──────────────────────────────────────────────────
// Re-frames the orbit camera so the whole scene is visible. Triggered by the
// status bar's "Fit View" button, automatically on add, or when the user
// switches view modes. Computes an axis-aligned bounding box over every
// visible object's bbox, then positions the camera appropriately:
//   - perspective: along the diagonal at a distance derived from FOV.
//   - orthographic (top/right/front/iso): aligned to the chosen axis with a
//     zoom level computed from the bbox dimensions projected onto the
//     camera's view plane.

const VIEW_AXES: Record<string, { position: [number, number, number]; up: [number, number, number] }> = {
  top:         { position: [0, 200, 0], up: [0, 0, -1] },
  right:       { position: [200, 0, 0], up: [0, 1, 0] },
  front:       { position: [0, 0, 200], up: [0, 1, 0] },
  isometric:   { position: [100, 85, 100], up: [0, 1, 0] },
  perspective: { position: [40, 35, 40], up: [0, 1, 0] },
}

function CameraFit({
  trigger,
  viewMode,
  objectOrder,
  objects,
  controlsRef,
}: {
  trigger: number
  viewMode: string
  objectOrder: string[]
  objects: Record<string, CADObject>
  controlsRef: React.RefObject<any>
}) {
  const { camera, size } = useThree()
  const lastCount = useRef<number>(-1)

  useEffect(() => {
    const order = objectOrder.length > 0 ? objectOrder : Object.keys(objects)

    const axes = VIEW_AXES[viewMode] ?? VIEW_AXES.perspective
    const isOrtho = viewMode !== 'perspective'

    if (order.length === 0) {
      // No objects — still orient the camera to the chosen view axis.
      camera.position.set(...axes.position)
      camera.up.set(...axes.up)
      camera.lookAt(0, 0, 0)
      if (isOrtho && (camera as THREE.OrthographicCamera).isOrthographicCamera) {
        const oc = camera as THREE.OrthographicCamera
        oc.zoom = 1
        oc.updateProjectionMatrix()
      }
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
      return
    }

    const box = new THREE.Box3()
    const tmp = new THREE.Box3()
    let any = false
    for (const id of order) {
      const obj = objects[id]
      if (!obj || obj.visibility === 'hidden') continue
      const bbox = getBoundingBox(obj)
      if (!bbox) continue
      tmp.set(
        new THREE.Vector3(
          obj.position.x - bbox.x / 2,
          obj.position.y - bbox.y / 2,
          obj.position.z - bbox.z / 2
        ),
        new THREE.Vector3(
          obj.position.x + bbox.x / 2,
          obj.position.y + bbox.y / 2,
          obj.position.z + bbox.z / 2
        )
      )
      if (any) box.union(tmp)
      else { box.copy(tmp); any = true }
    }
    if (!any || box.isEmpty()) return

    const center = new THREE.Vector3()
    box.getCenter(center)
    const size3 = new THREE.Vector3()
    box.getSize(size3)
    const radius = Math.max(size3.x, size3.y, size3.z, 1) * 0.5

    if (isOrtho) {
      // OrthographicCamera — compute zoom from bbox extents projected onto
      // the camera's view plane. The visible area is (viewport / zoom) units
      // across the smaller dimension.
      const oc = camera as THREE.OrthographicCamera
      const margin = 1.4 // padding around the bbox
      const minDim = Math.min(size.width, size.height)
      const fitZoom = (minDim / Math.max(radius * 2, 1)) / margin
      oc.zoom = Math.max(0.05, Math.min(50, fitZoom))

      // Position camera along the chosen view axis, looking at the scene center.
      const dist = 1000 // arbitrary — zoom handles framing for ortho
      const dir = new THREE.Vector3(...axes.position).normalize()
      camera.position.copy(center.clone().add(dir.multiplyScalar(dist)))
      camera.up.set(...axes.up)
      camera.near = -dist * 10
      camera.far = dist * 10
      camera.lookAt(center)
      oc.updateProjectionMatrix()
    } else {
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 45
      const fitDistance = radius / Math.sin((fov * Math.PI) / 180 / 2)
      const distance = fitDistance * 1.7 // breathing room
      const dir = new THREE.Vector3(...axes.position).normalize()
      camera.position.copy(center.clone().add(dir.multiplyScalar(distance)))
      camera.up.set(...axes.up)
      camera.near = Math.max(0.1, distance / 100)
      camera.far = distance * 100
      camera.lookAt(center)
      camera.updateProjectionMatrix()
    }

    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }, [trigger, viewMode, camera, controlsRef, objectOrder, objects, size.width, size.height])

  return null
}

// ─── Scene composition ───────────────────────────────────────────────────

export function CADScene() {
  const objects = useCADStore((s) => s.document.objects)
  const objectOrder = useCADStore((s) => s.document.objectOrder)
  const selectedIds = useCADStore((s) => s.selectedIds)
  const hoveredId = useCADStore((s) => s.hoveredId)
  const activeTool = useCADStore((s) => s.activeTool)
  const showGrid = useCADStore((s) => s.showGrid)
  const showAxes = useCADStore((s) => s.showAxes)
  const selectObject = useCADStore((s) => s.selectObject)
  const setHovered = useCADStore((s) => s.setHovered)
  const fitViewTrigger = useCADStore((s) => s.fitViewTrigger)
  const viewMode = useCADStore((s) => s.viewMode)

  // Track Object3D refs for each rendered shape so the gizmo can attach to the
  // real mesh/group instead of fighting React renders.
  const objectRefs = useRef<Map<string, THREE.Object3D>>(new Map())
  const registerRef = useCallback((id: string, ref: THREE.Object3D | null) => {
    if (ref) objectRefs.current.set(id, ref)
    else objectRefs.current.delete(id)
  }, [])
  const orbitRef = useRef<any>(null)

  const selectedId = selectedIds[0]
  const selectedObj = selectedId ? objects[selectedId] : null
  const selectedRef = selectedId ? objectRefs.current.get(selectedId) : null

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-15, 10, -10]} intensity={0.3} />

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#D4D4D8"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#A1A1AA"
          fadeDistance={60}
          fadeStrength={1}
          followCamera={false}
          position={[0, -0.01, 0]}
        />
      )}

      {/* World axes — color-matched to convention (red X, green Y, blue Z) */}
      {showAxes && (
        <group position={[0, 0.01, 0]}>
          <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0xef4444, 0.3, 0.2]} />
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0x22c55e, 0.3, 0.2]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 5, 0x3b82f6, 0.3, 0.2]} />
        </group>
      )}

      {/* Scene objects */}
      {objectOrder.map((id) => {
        const obj = objects[id]
        if (!obj || obj.visibility === 'hidden') return null
        return (
          <CADShape
            key={id}
            object={obj}
            isSelected={selectedIds.includes(id)}
            isHovered={hoveredId === id}
            onSelect={() => selectObject(id, false)}
            onHover={(h) => setHovered(h ? id : null)}
            registerRef={registerRef}
          />
        )
      })}

      {/* Transform gizmo — attaches to the selected shape so the user can drag
          without React overrides fighting the gizmo's internal updates. */}
      {selectedObj && selectedRef && activeTool !== 'select' && (
        <TransformGizmo targetRef={selectedRef} mode={activeTool} objectId={selectedObj.id} />
      )}

      <MeasurementOverlay />

      <CameraFit
        trigger={fitViewTrigger}
        viewMode={viewMode}
        objectOrder={objectOrder}
        objects={objects}
        controlsRef={orbitRef}
      />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={viewMode === 'perspective' ? 1 : 0.01}
        maxDistance={viewMode === 'perspective' ? 200 : 10000}
        // 2D views: disable rotation so the camera stays aligned to the axis.
        enableRotate={viewMode === 'perspective'}
        maxPolarAngle={Math.PI * 0.9}
      />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="#18181B"
        />
      </GizmoHelper>
    </>
  )
}
