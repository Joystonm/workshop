// Molecule Viewer — pick a molecule, drag to rotate and scroll to zoom.
// Inspect molecular geometry. Reuses the same 3D scene as the molecule
// builder but with extra view modes: bond-length labels, VSEPR info,
// compare mode (two molecules side-by-side), polarity indicator.

import { MOLECULES } from '../molecules'
import type { Experiment } from '../experiments'
import { MoleculeBuilderScene } from '../../../components/chemistry/scenes/MoleculeBuilderScene'

export const moleculeViewerExperiment: Experiment = {
  id: 'molecule-viewer',
  title: 'Molecule Viewer',
  description: 'Rotate, zoom, and inspect molecular geometry.',
  icon: 'viewer',
  params: [
    { key: 'molecule', label: 'Molecule A', min: 0, max: MOLECULES.length - 1, step: 1, default: 3, unit: '' },
    { key: 'rotateSpeed', label: 'Auto-rotate', min: 0, max: 1.5, step: 0.05, default: 0.15, unit: '×' },
    { key: 'showLabels', label: 'Atom labels', min: 0, max: 1, step: 1, default: 1, unit: '' },
    { key: 'showBondLengths', label: 'Bond lengths', min: 0, max: 1, step: 1, default: 0, unit: '' },
    { key: 'compareMode', label: 'A/B compare', min: 0, max: 1, step: 1, default: 0, unit: '' },
    { key: 'moleculeB', label: 'Molecule B', min: 0, max: MOLECULES.length - 1, step: 1, default: 0, unit: '' },
  ],
  graphAxes: { yKey: 'molar_mass', yLabel: 'Molar mass (g/mol)' },
  passive: true,
  reset(p) {
    const idx = Math.round(p.molecule ?? 3)
    const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
    return {
      state: { moleculeId: m.id },
      sample: { molar_mass: m.properties.molarMass },
      measurements: { molar_mass: m.properties.molarMass, atoms: m.atoms.length, bonds: m.bonds.length },
    }
  },
  step(state, _dt, p) {
    const idx = Math.round(p.molecule ?? 0)
    const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idx))]
    const compare = Math.round(p.compareMode ?? 0) === 1
    const idxB = Math.round(p.moleculeB ?? 0)
    const mB = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, idxB))]
    return {
      nextState: { moleculeId: m.id },
      sample: { molar_mass: m.properties.molarMass },
      measurements: {
        molar_mass: m.properties.molarMass,
        atoms: m.atoms.length,
        bonds: m.bonds.length,
        polar: m.polar ? 1 : 0,
        compare: compare ? 1 : 0,
        idxB: idxB,
        molar_mass_B: mB.properties.molarMass,
        bondAngle: m.bondAngle ?? 0,
      },
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
