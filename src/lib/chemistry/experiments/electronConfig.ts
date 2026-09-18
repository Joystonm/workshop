// Electron Configuration — pick an element and watch its ground-state
// configuration fill, subshell by subshell, following the Aufbau rule.

import { getElementByZ } from '../elements'
import type { Experiment } from '../experiments'
import { ElectronConfigScene } from '../../../components/chemistry/scenes/ElectronConfigScene'

export const electronConfigExperiment: Experiment = {
  id: 'electron-config',
  title: 'Electron Configuration',
  description: 'Build ground-state electron configurations shell by shell following the Aufbau rule.',
  icon: 'config',
  params: [
    { key: 'z', label: 'Atomic number', min: 1, max: 118, step: 1, default: 6, unit: '' },
  ],
  graphAxes: { yKey: 'electrons', yLabel: 'Electrons' },
  passive: true,
  reset(p) {
    const z = Math.round(p.z ?? 6)
    return { state: { z }, sample: { electrons: z }, measurements: { z, electrons: z } }
  },
  step(state, _dt, p) {
    const z = Math.round(p.z ?? state.z ?? 6)
    return {
      nextState: { z },
      sample: { electrons: z },
      measurements: {
        z,
        electrons: z,
        shells_total: getElementByZ(z)?.shells.reduce((a, n) => a + n, 0) ?? 0,
      },
    }
  },
  applyParams(state, p) {
    return { ...state, z: Math.round(p.z ?? state.z ?? 6) }
  },
  render: 'dom',
  Panel: ElectronConfigScene,
  Scene: ElectronConfigScene,
}
