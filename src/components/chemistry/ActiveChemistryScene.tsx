// Active scene: pick the experiment from the store and mount its
// component. Some experiments are 2D (PeriodicTable, Challenges) and
// render plain DOM; others are 3D (Molecule Builder, Combine, etc.)
// and render inside an R3F Canvas. The render type lives on the
// experiment record (render: 'three' | 'dom'). We also drive the tick
// loop here for all running experiments.

import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useChemistryStore } from '../../lib/chemistry/store'
import { EXPERIMENTS_BY_ID, ExperimentId } from '../../lib/chemistry/experiments'

function Ticker() {
  useFrame((_, dt) => {
    useChemistryStore.getState().tick(dt)
  })
  return null
}

// DOM tick loop. The Canvas's useFrame doesn't exist for plain DOM
// scenes, so we use rAF to call tick while running.
function DomTicker() {
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(performance.now())
  useEffect(() => {
    const loop = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      useChemistryStore.getState().tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])
  return null
}

import { PeriodicTableSceneStyles } from './scenes/PeriodicTableScene.styles'
import { ElementExplorerSceneStyles } from './scenes/ElementExplorerScene.styles'
import { CombineSceneStyles } from './scenes/CombineScene.styles'
import { MoleculeBuilderSceneStyles } from './scenes/MoleculeBuilderScene.styles'
import { IsotopesSceneStyles } from './scenes/IsotopesScene.styles'
import { ElectronConfigSceneStyles } from './scenes/ElectronConfigScene.styles'
import { ReactionSimulatorSceneStyles } from './scenes/ReactionSimulatorScene.styles'
import { PhScaleSceneStyles } from './scenes/PhScaleScene.styles'
import { TitrationSceneStyles } from './scenes/TitrationScene.styles'
import { ConcentrationSceneStyles } from './scenes/ConcentrationScene.styles'
import { PeriodicTablePanel } from './scenes/PeriodicTablePanel'

export function ActiveChemistryScene() {
  const experimentId = useChemistryStore((s) => s.experimentId)
  if (!experimentId) return null
  const exp = EXPERIMENTS_BY_ID[experimentId as ExperimentId]
  if (!exp) return null
  const Scene = exp.Scene

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PerSceneStyles experimentId={experimentId} />
      {exp.render === 'dom' ? (
        // 2D experiment (no Canvas). Use the Panel if present; otherwise
        // fall back to the Scene wrapped in a div.
        <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
          {exp.Panel ? <exp.Panel /> : <Scene />}
          <DomTicker />
        </div>
      ) : (
        <Canvas
          camera={{ position: [0, 0, 14], fov: 50, near: 0.1, far: 1000 }}
          style={{ background: '#FAFAFA' }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} />
          <Scene />
          <Ticker />
        </Canvas>
      )}
    </div>
  )
}

function PerSceneStyles({ experimentId }: { experimentId: string }) {
  switch (experimentId) {
    case 'periodic-table': return <PeriodicTableSceneStyles />
    case 'element-explorer': return <ElementExplorerSceneStyles />
    case 'combine': return <CombineSceneStyles />
    case 'molecule-builder': return <MoleculeBuilderSceneStyles />
    case 'isotopes': return <IsotopesSceneStyles />
    case 'electron-config': return <ElectronConfigSceneStyles />
    case 'reaction-simulator': return <ReactionSimulatorSceneStyles />
    case 'ph-scale': return <PhScaleSceneStyles />
    case 'titration': return <TitrationSceneStyles />
    case 'concentration': return <ConcentrationSceneStyles />
    case 'molecule-viewer': return <MoleculeBuilderSceneStyles />
    default: return null
  }
}
