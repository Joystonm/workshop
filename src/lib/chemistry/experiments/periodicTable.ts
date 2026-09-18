// Periodic Table scene. The table is mostly a UI overlay rather than a
// simulation: clicking an element sets a selected Z and the right panel
// shows the data. There's no time integration.

import { ELEMENTS, getElementByZ } from '../elements'
import type { Experiment } from '../experiments'
import { PeriodicTablePanel } from '../../../components/chemistry/scenes/PeriodicTablePanel'
import { PeriodicTableScene } from '../../../components/chemistry/scenes/PeriodicTableScene'

export const periodicTableExperiment: Experiment = {
  id: 'periodic-table',
  title: 'Periodic Table',
  description: 'All 118 elements with their real properties. Click an element to inspect it.',
  icon: 'periodic',
  params: [
    { key: 'z', label: 'Selected Z', min: 1, max: 118, step: 1, default: 6, unit: '' },
  ],
  graphAxes: { yKey: 'atomic_mass', yLabel: 'Atomic mass (u)' },
  passive: true,
  reset(p) {
    const z = Math.round(p.z ?? 6)
    return {
      state: { selectedZ: z, hoveredZ: null },
      sample: { atomic_mass: getElementByZ(z)?.mass ?? 0 },
      measurements: {
        selected_z: z,
        atomic_mass: getElementByZ(z)?.mass ?? 0,
        electronegativity: getElementByZ(z)?.electronegativity ?? 0,
        group: getElementByZ(z)?.group ?? 0,
        period: getElementByZ(z)?.period ?? 0,
      },
    }
  },
  step(state, _dt, p) {
    const z = Math.round(p.z ?? state.selectedZ ?? 6)
    const el = getElementByZ(z)
    return {
      nextState: { ...state, selectedZ: z },
      sample: { atomic_mass: el?.mass ?? 0 },
      measurements: {
        selected_z: z,
        atomic_mass: el?.mass ?? 0,
        electronegativity: el?.electronegativity ?? 0,
        group: el?.group ?? 0,
        period: el?.period ?? 0,
        shells_total: el?.shells.reduce((s, n) => s + n, 0) ?? 0,
      },
    }
  },
  applyParams(state, p) {
    return { ...state, selectedZ: Math.round(p.z ?? state.selectedZ ?? 6) }
  },
  render: 'dom',
  Panel: PeriodicTablePanel,
  Scene: PeriodicTableScene,
}
