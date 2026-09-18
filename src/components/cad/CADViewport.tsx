// R3F Canvas wrapper for the CAD scene. Kept thin — the actual scene
// composition (lighting, grid, objects, gizmo) lives in CADScene.tsx so it
// can be tested in isolation if needed.
//
// The Canvas is keyed by viewMode so perspective vs orthographic cameras are
// constructed cleanly when the user toggles view modes. Switching camera
// types on a live Canvas requires manual re-attach of OrbitControls; the
// brief remount is simpler and reliable.

import { Canvas } from '@react-three/fiber'
import { useCADStore } from '../../lib/cad/store'
import { CADScene } from './CADScene'

export function CADViewport() {
  const deselectAll = useCADStore((s) => s.deselectAll)
  const viewMode = useCADStore((s) => s.viewMode)

  const isOrtho = viewMode !== 'perspective'

  return (
    <div className="cad-viewport">
      <Canvas
        key={viewMode}
        orthographic={isOrtho}
        camera={isOrtho ? { position: [0, 0, 200], near: 0.1, far: 5000 } : { position: [40, 35, 40], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        onPointerMissed={() => deselectAll()}
      >
        <color attach="background" args={['#F4F4F5']} />
        <CADScene />
      </Canvas>
    </div>
  )
}
