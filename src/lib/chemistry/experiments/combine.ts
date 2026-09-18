// Combine Elements / Reaction Lab. The user picks two substances; the
// scene shows the reactants and the products, with the balanced equation
// and a real-time particle animation.

import { findReactionByReactants, REACTIONS } from '../reactions'
import type { Experiment } from '../experiments'
import { CombineScene } from '../../../components/chemistry/scenes/CombineScene'

export const combineExperiment: Experiment = {
  id: 'combine',
  title: 'Combine Elements',
  description: 'Pick two substances; the lab finds the real balanced reaction and animates it.',
  icon: 'flask',
  params: [
    { key: 'reaction', label: 'Reaction', min: 0, max: REACTIONS.length - 1, step: 1, default: 0, unit: '' },
    { key: 'timeScale', label: 'Time scale', min: 0.1, max: 3, step: 0.1, default: 1, unit: '×' },
  ],
  graphAxes: { yKey: 'reactants_remaining', yLabel: 'Reactants remaining' },
  passive: false,
  reset(p) {
    const rIdx = Math.round(p.reaction ?? 0)
    const reaction = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, rIdx))]
    return {
      state: { reaction, progress: 0, phase: 0 },
      sample: { reactants_remaining: 1 },
      measurements: { reaction: rIdx, dH: reaction.dH_kJ },
    }
  },
  step(state, dt, p) {
    const rIdx = Math.round(p.reaction ?? state.reaction?.id ?? 0)
    const reaction = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, rIdx))]
    const ts = p.timeScale ?? 1
    // Animate the reaction over 5 simulated seconds (configurable).
    const duration = 5
    const newProgress = Math.min(1, (state.progress ?? 0) + (dt * ts) / duration)
    return {
      nextState: { reaction, progress: newProgress, phase: (state.phase ?? 0) + dt * ts },
      sample: { reactants_remaining: 1 - newProgress },
      measurements: {
        reaction: rIdx,
        dH: reaction.dH_kJ,
        progress: newProgress,
      },
    }
  },
  applyParams(state, p) {
    const rIdx = Math.round(p.reaction ?? 0)
    const reaction = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, rIdx))]
    return { ...state, reaction, progress: 0 }
  },
  render: 'three',
  Scene: CombineScene,
}
