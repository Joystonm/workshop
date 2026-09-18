// Element Explorer: a 3D view of an atom with electron shells, plus the
// data card. The user picks an element Z via slider; the scene
// re-renders the nucleus and electron shells.

import { getElementByZ } from '../elements'
import type { Experiment } from '../experiments'
import { ElementExplorerScene } from '../../../components/chemistry/scenes/ElementExplorerScene'

export const elementExplorerExperiment: Experiment = {
  id: 'element-explorer',
  title: 'Element Explorer',
  description: 'Inspect a single element: nucleus, electron shells, and full property card.',
  icon: 'atom',
  params: [
    { key: 'z', label: 'Atomic number', min: 1, max: 118, step: 1, default: 6, unit: '' },
    { key: 'scale', label: 'Shell scale', min: 0.4, max: 1.4, step: 0.05, default: 1.0, unit: '×' },
    { key: 'speed', label: 'Electron speed', min: 0, max: 3, step: 0.1, default: 1.0, unit: '×' },
  ],
  graphAxes: { yKey: 'kinetic_e', yLabel: 'Kinetic energy (eV)' },
  passive: true,
  reset(p) {
    return { state: { z: Math.round(p.z ?? 6), phase: 0 }, sample: { kinetic_e: 0 }, measurements: { z: Math.round(p.z ?? 6) } }
  },
  step(state, dt, p) {
    const z = Math.round(p.z ?? state.z ?? 6)
    const phase = (state.phase ?? 0) + dt * (p.speed ?? 1)
    return {
      nextState: { z, phase },
      sample: { kinetic_e: 0 },
      measurements: {
        z,
        atomic_mass: getElementByZ(z)?.mass ?? 0,
        electronegativity: getElementByZ(z)?.electronegativity ?? 0,
        phase,
      },
    }
  },
  applyParams(state, p) {
    return { ...state, z: Math.round(p.z ?? state.z ?? 6) }
  },
  render: 'three',
  Scene: ElementExplorerScene,
}
