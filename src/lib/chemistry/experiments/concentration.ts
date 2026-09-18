// Concentration — adjust moles of solute and volume of solution; read
// molarity live. M = n / V.

import type { Experiment } from '../experiments'
import { ConcentrationScene } from '../../../components/chemistry/scenes/ConcentrationScene'

export const concentrationExperiment: Experiment = {
  id: 'concentration',
  title: 'Concentration',
  description: 'Adjust solute and solvent; read molarity. M = n / V.',
  icon: 'beaker',
  params: [
    { key: 'solute', label: 'Solute', min: 0, max: 6, step: 1, default: 0, unit: '' },
    { key: 'n', label: 'Moles of solute', min: 0, max: 2, step: 0.01, default: 0.5, unit: 'mol' },
    { key: 'V', label: 'Volume of solution', min: 0.05, max: 0.5, step: 0.005, default: 0.5, unit: 'L' },
  ],
  graphAxes: { yKey: 'molarity', yLabel: 'Molarity (mol/L)' },
  passive: true,
  reset(p) {
    const n = p.n ?? 0.5
    const V = p.V ?? 0.5
    const M = V > 0 ? n / V : 0
    return { state: { n, V }, sample: { molarity: M }, measurements: { n, V, molarity: M } }
  },
  step(state, _dt, p) {
    const n = p.n ?? state.n ?? 0.5
    const V = p.V ?? state.V ?? 0.5
    const M = V > 0 ? n / V : 0
    return {
      nextState: { n, V },
      sample: { molarity: M },
      measurements: { n, V, molarity: M, mL: V * 1000 },
    }
  },
  applyParams(state, p) {
    return { ...state, n: p.n ?? state.n, V: p.V ?? state.V }
  },
  render: 'dom',
  Panel: ConcentrationScene,
  Scene: ConcentrationScene,
}
