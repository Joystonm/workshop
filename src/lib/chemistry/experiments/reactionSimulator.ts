// Reaction Simulator — pick a balanced reaction and inspect it.
// The Combine Elements experiment is a 3D animated version; this one is
// a static reference — equation, atom balance, ΔH, observables.

import { REACTIONS } from '../reactions'
import type { Experiment } from '../experiments'
import { ReactionSimulatorScene } from '../../../components/chemistry/scenes/ReactionSimulatorScene'


export const reactionSimulatorExperiment: Experiment = {
  id: 'reaction-simulator',
  title: 'Reaction Simulator',
  description: 'Mix reactants and observe a balanced equation. Σ reactants → Σ products.',
  icon: 'reaction',
  params: [
    { key: 'reaction', label: 'Reaction', min: 0, max: REACTIONS.length - 1, step: 1, default: 0, unit: '' },
  ],
  graphAxes: { yKey: 'dH', yLabel: 'ΔH (kJ/mol)' },
  passive: true,
  reset(p) {
    const r = Math.round(p.reaction ?? 0)
    const rxn = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, r))]
    return {
      state: { reactionIdx: r },
      sample: { dH: rxn.dH_kJ },
      measurements: { reaction: r, dH: rxn.dH_kJ },
    }
  },
  step(state, _dt, p) {
    const r = Math.round(p.reaction ?? state.reactionIdx ?? 0)
    const rxn = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, r))]
    return {
      nextState: { reactionIdx: r },
      sample: { dH: rxn.dH_kJ },
      measurements: {
        reaction: r,
        dH: rxn.dH_kJ,
        nReactants: rxn.reactants.length,
        nProducts: rxn.products.length,
      },
    }
  },
  applyParams(state, p) {
    return { ...state, reactionIdx: Math.round(p.reaction ?? state.reactionIdx ?? 0) }
  },
  render: 'dom',
  Panel: ReactionSimulatorScene,
  Scene: ReactionSimulatorScene,
}
