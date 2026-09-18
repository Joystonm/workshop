// Titration — pick a strong acid / strong base pair, add titrant, watch
// the pH curve climb with a sharp equivalence-point inflection.
// M_a · V_a = M_b · V_b at equivalence.

import type { Experiment } from '../experiments'
import { TitrationScene } from '../../../components/chemistry/scenes/TitrationScene'
import { SOLUTIONS, compute } from '../acidsBases'

// Re-implementation of pHAt here (not exported from the scene file) so the
// store's step/reset can produce correct pH measurements. Keep in sync with
// TitrationScene.tsx.
function phAtTitration(
  acid: ReturnType<typeof compute>,
  base: ReturnType<typeof compute>,
  Va: number,
  Vb: number,
  kind: 'strong-strong' | 'weak-strong',
): number {
  const Ma = acid.concentration
  const Mb = base.concentration
  const Veq = (Ma * Va) / Mb
  const totVol = (Va + Vb) / 1000
  const molesAcid = (Ma * Va) / 1000
  const molesBase = (Mb * Vb) / 1000
  if (kind === 'strong-strong') {
    if (Vb < Veq - 1e-6) {
      const molesH = Math.max(0, molesAcid - molesBase)
      return -Math.log10(molesH / totVol)
    } else if (Vb > Veq + 1e-6) {
      const molesOH = molesBase - molesAcid
      const pOH = -Math.log10(molesOH / totVol)
      return 14 - pOH
    }
    return 7
  }
  // weak/strong
  const Ka = acid.Ka ?? 1.8e-5
  const pKa = -Math.log10(Ka)
  if (Vb < Veq - 1e-6) {
    const molesA = molesBase
    const molesHA = Math.max(1e-30, molesAcid - molesBase)
    return pKa + Math.log10(molesA / molesHA)
  } else if (Vb > Veq + 1e-6) {
    const molesOH = molesBase - molesAcid
    const pOH = -Math.log10(molesOH / totVol)
    return 14 - pOH
  } else {
    const Ca = molesAcid / totVol
    const Kb = 1e-14 / Ka
    const x = 0.5 * (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * Ca))
    const pOH = -Math.log10(x)
    return Math.min(14, 14 - pOH)
  }
}

const PAIRS = [
  { kind: 'strong-strong' as const, acidId: 'hcl-0.1M', baseId: 'naoh-0.1M' },
  { kind: 'strong-strong' as const, acidId: 'hcl-1M',   baseId: 'naoh-1M'   },
  { kind: 'weak-strong'   as const, acidId: 'ch3cooh-vinegar', baseId: 'naoh-0.1M' },
  { kind: 'weak-strong'   as const, acidId: 'ch3cooh-1M', baseId: 'naoh-1M'   },
]

function pairFor(idx: number) {
  const i = Math.max(0, Math.min(PAIRS.length - 1, Math.round(idx)))
  return PAIRS[i]
}

function currentPH(p: Record<string, number>): number {
  const pair = pairFor(p.pair ?? 0)
  const acid = SOLUTIONS.find((s) => s.id === pair.acidId)
  const base = SOLUTIONS.find((s) => s.id === pair.baseId)
  if (!acid || !base) return 7
  const Va = p.Va ?? 25
  const Vb = p.Vb ?? 0
  const ph = phAtTitration(compute(acid), compute(base), Va, Vb, pair.kind)
  return Math.max(0, Math.min(14, ph))
}

function equivalenceV(p: Record<string, number>): number {
  const pair = pairFor(p.pair ?? 0)
  const acid = SOLUTIONS.find((s) => s.id === pair.acidId)
  const base = SOLUTIONS.find((s) => s.id === pair.baseId)
  if (!acid || !base) return 0
  const Va = p.Va ?? 25
  return (acid.concentration * Va) / base.concentration
}

export const titrationExperiment: Experiment = {
  id: 'titration',
  title: 'Titration',
  description: 'Titrate an acid with a base; find the equivalence point. M_aV_a = M_bV_b.',
  icon: 'titration',
  params: [
    { key: 'pair', label: 'Acid / base pair', min: 0, max: 3, step: 1, default: 0, unit: '' },
    { key: 'Va', label: 'V_analyte', min: 5, max: 100, step: 1, default: 25, unit: 'mL' },
    { key: 'Vb', label: 'V_titrant added', min: 0, max: 100, step: 0.05, default: 0, unit: 'mL' },
    { key: 'indicator', label: 'Indicator', min: 0, max: 3, step: 1, default: 3, unit: '' },
  ],
  graphAxes: { yKey: 'pH', yLabel: 'pH' },
  passive: true,
  reset(p) {
    const Vb = Math.round((p.Vb ?? 0) * 100) / 100
    const Va = p.Va ?? 25
    const pH = currentPH(p)
    const Veq = equivalenceV(p)
    return {
      state: { Va: p.Va ?? 25, Vb, pH, Veq },
      sample: { pH },
      measurements: { Va: p.Va ?? 25, Vb, pH, Veq, indicator: p.indicator ?? 3, pair: p.pair ?? 0 },
    }
  },
  step(state, _dt, p) {
    const Va = p.Va ?? state.Va ?? 25
    const Vb = p.Vb ?? state.Vb ?? 0
    const pH = currentPH(p)
    const Veq = equivalenceV(p)
    return {
      nextState: { Va, Vb, pH, Veq },
      sample: { pH },
      measurements: { Va, Vb, pH, Veq, indicator: p.indicator ?? 3, pair: p.pair ?? 0 },
    }
  },
  applyParams(state, p) {
    return { ...state, Va: p.Va ?? state.Va, Vb: p.Vb ?? state.Vb }
  },
  render: 'dom',
  Panel: TitrationScene,
  Scene: TitrationScene,
}
