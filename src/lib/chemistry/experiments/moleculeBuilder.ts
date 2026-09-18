// Molecule Builder: select from a library of real molecules and view
// their 3D structures. The user can rotate and zoom; the right panel
// shows molecular properties.

import { MOLECULES, getMolecule } from '../molecules'
import type { Experiment } from '../experiments'
import { MoleculeBuilderScene } from '../../../components/chemistry/scenes/MoleculeBuilderScene'

export const moleculeBuilderExperiment: Experiment = {
  id: 'molecule-builder',
  title: 'Molecule Builder',
  description: 'Choose a molecule to see its 3D structure, geometry and properties.',
  icon: 'molecule',
  params: [
    { key: 'molecule', label: 'Molecule', min: 0, max: MOLECULES.length - 1, step: 1, default: 3, unit: '' },
    { key: 'rotateSpeed', label: 'Rotation', min: 0, max: 2, step: 0.05, default: 0.4, unit: '×' },
    { key: 'showLabels', label: 'Labels', min: 0, max: 1, step: 1, default: 1, unit: '' },
  ],
  graphAxes: { yKey: 'molar_mass', yLabel: 'Molar mass (g/mol)' },
  passive: true,
  reset(p) {
    const idx = Math.round(p.molecule ?? 3)
    const m = getMolecule(MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))].id) ?? MOLECULES[0]
    return { state: { moleculeId: m.id, rotation: 0 }, sample: { molar_mass: m.properties.molarMass }, measurements: { molar_mass: m.properties.molarMass } }
  },
  step(state, dt, p) {
    const idx = Math.round(p.molecule ?? 0)
    const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
    const newRot = (state.rotation ?? 0) + dt * (p.rotateSpeed ?? 0.4)
    return {
      nextState: { moleculeId: m.id, rotation: newRot },
      sample: { molar_mass: m.properties.molarMass },
      measurements: { molar_mass: m.properties.molarMass, atoms: m.atoms.length, bonds: m.bonds.length, rotation: newRot },
    }
  },
  applyParams(state, p) {
    const idx = Math.round(p.molecule ?? 0)
    const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
    return { ...state, moleculeId: m.id }
  },
  render: 'three',
  Scene: MoleculeBuilderScene,
}
