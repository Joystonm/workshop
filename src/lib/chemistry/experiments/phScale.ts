// pH Scale — pick a common acid or base, see its pH on the strip,
// [H⁺], [OH⁻], and the indicator colour. Optional A/B compare mode
// renders two flasks side-by-side with a ΔpH badge between them.

import { SOLUTIONS, compute } from '../acidsBases'
import type { Experiment } from '../experiments'
import { PhScaleScene } from '../../../components/chemistry/scenes/PhScaleScene'


const DEFAULT_IDX = SOLUTIONS.findIndex((s) => s.id === 'ch3cooh-vinegar')
const DEFAULT_IDX_B = SOLUTIONS.findIndex((s) => s.id === 'water')

export const phScaleExperiment: Experiment = {
  id: 'ph-scale',
  title: 'pH Scale',
  description: 'Compare acids and bases on the pH scale. pH = −log[H⁺], pH + pOH = 14.',
  icon: 'ph',
  params: [
    { key: 'solution', label: 'Solution A', min: 0, max: SOLUTIONS.length - 1, step: 1, default: DEFAULT_IDX >= 0 ? DEFAULT_IDX : 0, unit: '' },
    { key: 'compare', label: 'A/B compare', min: 0, max: 1, step: 1, default: 0, unit: '' },
    { key: 'solutionB', label: 'Solution B', min: 0, max: SOLUTIONS.length - 1, step: 1, default: DEFAULT_IDX_B >= 0 ? DEFAULT_IDX_B : 0, unit: '' },
  ],
  graphAxes: { yKey: 'pH', yLabel: 'pH' },
  passive: true,
  reset(p) {
    const idx = Math.round(p.solution ?? DEFAULT_IDX)
    const s = SOLUTIONS[Math.max(0, Math.min(SOLUTIONS.length - 1, idx))]
    const c = compute(s)
    return {
      state: { solutionIdx: idx },
      sample: { pH: c.pH },
      measurements: { pH: c.pH, h_conc: c.hConcentration, oh_conc: c.ohConcentration, kind: c.kind === 'acid' ? 0 : 1 },
    }
  },
  step(state, _dt, p) {
    const idx = Math.round(p.solution ?? state.solutionIdx ?? DEFAULT_IDX)
    const compare = Math.round(p.compare ?? 0) === 1
    const idxB = Math.round(p.solutionB ?? DEFAULT_IDX_B)
    const s = SOLUTIONS[Math.max(0, Math.min(SOLUTIONS.length - 1, idx))]
    const c = compute(s)
    const sB = SOLUTIONS[Math.max(0, Math.min(SOLUTIONS.length - 1, idxB))]
    const cB = compute(sB)
    return {
      nextState: { solutionIdx: idx },
      sample: { pH: c.pH },
      measurements: {
        pH: c.pH,
        pOH: c.pOH,
        h_conc: c.hConcentration,
        oh_conc: c.ohConcentration,
        kind: c.kind === 'acid' ? 0 : 1,
        strong: c.strong ? 1 : 0,
        idxB: idxB,
        pH_B: cB.pH,
        compare: compare ? 1 : 0,
        dPH: c.pH - cB.pH,
      },
    }
  },
  applyParams(state, p) {
    return { ...state, solutionIdx: Math.round(p.solution ?? state.solutionIdx ?? DEFAULT_IDX) }
  },
  render: 'dom',
  Panel: PhScaleScene,
  Scene: PhScaleScene,
}
