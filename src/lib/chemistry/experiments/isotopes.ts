// Isotopes — pick an element and inspect its known isotopes.
// A = Z + N: mass number is the count of protons + neutrons.

import { getElementByZ } from '../elements'
import { getIsotopes, getDefaultIsotope, DEFAULT_ISOTOPE_Z } from '../isotopes'
import type { Experiment } from '../experiments'
import { IsotopesScene } from '../../../components/chemistry/scenes/IsotopesScene'

export const isotopesExperiment: Experiment = {
  id: 'isotopes',
  title: 'Isotopes',
  description: 'Compare isotopes of common elements. A = Z + N, half-life, and natural abundance.',
  icon: 'isotope',
  params: [
    { key: 'z', label: 'Atomic number', min: 1, max: 92, step: 1, default: DEFAULT_ISOTOPE_Z, unit: '' },
    { key: 'A', label: 'Mass number', min: 1, max: 240, step: 1, default: 12, unit: '' },
  ],
  graphAxes: { yKey: 'electrons', yLabel: 'Electrons' },
  passive: true,
  reset(p) {
    const z = Math.round(p.z ?? DEFAULT_ISOTOPE_Z)
    const def = getDefaultIsotope(z)
    const a = def?.a ?? 1
    return {
      state: { z, a },
      sample: { electrons: z },
      measurements: {
        z,
        a,
        n: a - z,
        electrons: z,
      },
    }
  },
  step(state, _dt, p) {
    const z = Math.round(p.z ?? state.z ?? DEFAULT_ISOTOPE_Z)
    const iso = getIsotopes(z)
    const requestedA = Math.round(p.A ?? state.a ?? iso[0]?.a ?? 1)
    const a = iso.find((i) => i.a === requestedA) ? requestedA : (getDefaultIsotope(z)?.a ?? iso[0]?.a ?? requestedA)
    const el = getElementByZ(z)
    return {
      nextState: { z, a },
      sample: { electrons: z },
      measurements: {
        z,
        a,
        n: a - z,
        electrons: z,
        abundance: iso.find((i) => i.a === a)?.abundance ?? 0,
      },
    }
  },
  applyParams(state, p) {
    const z = Math.round(p.z ?? state.z ?? DEFAULT_ISOTOPE_Z)
    return { ...state, z }
  },
  render: 'dom',
  Panel: IsotopesScene,
  Scene: IsotopesScene,
}
