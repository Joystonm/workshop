// Per-experiment summarizers. The chemistry snapshot sends the raw state
// object to the agent, but a one-line plain-English description lets the
// model quote the active reaction / molecule / solution without having to
// reverse-engineer numeric indices. This is the single highest-impact thing
// for "what is this experiment?" accuracy — without it the model only sees
// `reaction: 5` and guesses.

import { REACTIONS, type Reaction } from './reactions'
import { SOLUTIONS } from './acidsBases'
import { MOLECULES } from './molecules'
import { ELEMENTS } from './elements'
import { ISOTOPES_BY_Z, type Isotope } from './isotopes'
import { SOLUTES } from './solutes'
import { EXPERIMENTS_BY_ID } from './experiments'

// Acid/base pairs the Titration experiment exposes. Keep in sync with
// titration.ts PAIRS — duplication is intentional to avoid coupling the
// summarizer to scene-internal state.
const TITRATION_PAIRS: Array<{
  kind: 'strong-strong' | 'weak-strong'
  acidId: string
  baseId: string
  label: string
}> = [
  { kind: 'strong-strong', acidId: 'hcl-0.1M',      baseId: 'naoh-0.1M',    label: 'HCl (0.1 M) + NaOH (0.1 M)' },
  { kind: 'strong-strong', acidId: 'hcl-1M',        baseId: 'naoh-1M',      label: 'HCl (1 M) + NaOH (1 M)' },
  { kind: 'weak-strong',   acidId: 'ch3cooh-vinegar', baseId: 'naoh-0.1M',  label: 'CH₃COOH (vinegar) + NaOH (0.1 M)' },
  { kind: 'weak-strong',   acidId: 'ch3cooh-1M',    baseId: 'naoh-1M',      label: 'CH₃COOH (1 M) + NaOH (1 M)' },
]

function formatReaction(r: Reaction): string {
  const coeff = (cs: number[], fs: string[]) => cs.map((c, i) => (c === 1 ? '' : `${c} `) + fs[i]).join(' + ')
  const lhs = coeff(r.coefficients.reactants, r.reactants)
  const rhs = coeff(r.coefficients.products, r.products)
  const phaseL = r.phases.reactants.map((p, i) => r.reactants[i] + (p ?? '')).join(' + ')
  const phaseR = r.phases.products.map((p, i) => r.products[i] + (p ?? '')).join(' + ')
  const sign = r.dH_kJ >= 0 ? '+' : '−'
  return `Active reaction: ${phaseL} → ${phaseR} (balanced: ${lhs} → ${rhs}). ` +
    `Type: ${r.type}. ΔH = ${sign}${Math.abs(r.dH_kJ).toFixed(1)} kJ/mol. ${r.description}`
}

function reactionAtIndex(i: number): Reaction | undefined {
  if (!Number.isFinite(i)) return undefined
  const idx = Math.max(0, Math.min(REACTIONS.length - 1, Math.round(i)))
  return REACTIONS[idx]
}

function solutionAtIndex(i: number) {
  if (!Number.isFinite(i)) return undefined
  const idx = Math.max(0, Math.min(SOLUTIONS.length - 1, Math.round(i)))
  return SOLUTIONS[idx]
}

function moleculeAtIndex(i: number) {
  if (!Number.isFinite(i)) return undefined
  const idx = Math.max(0, Math.min(MOLECULES.length - 1, Math.round(i)))
  return MOLECULES[idx]
}

function soluteAtIndex(i: number) {
  if (!Number.isFinite(i)) return undefined
  const idx = Math.max(0, Math.min(SOLUTES.length - 1, Math.round(i)))
  return SOLUTES[idx]
}

function elementAtZ(z: number) {
  if (!Number.isFinite(z)) return undefined
  return ELEMENTS[Math.max(1, Math.min(118, Math.round(z)))]
}

function isotopeAtZA(z: number, A: number): Isotope | undefined {
  const list = ISOTOPES_BY_Z[Math.max(1, Math.min(118, Math.round(z)))]
  if (!list || list.length === 0) return undefined
  return list.find((i) => i.a === Math.round(A)) ?? list[0]
}

export function summarizeChemistryExperiment(
  experimentId: string,
  params: Record<string, number>,
  state: any,
  measurements: Record<string, number> = {},
): string {
  switch (experimentId) {
    case 'periodic-table': {
      const z = params.selected_z ?? state?.z ?? 0
      const el = elementAtZ(z)
      if (!el) return 'Periodic table active.'
      return `Selected element: ${el.symbol} (${el.name}, Z=${el.z}). ` +
        `Atomic mass ${el.mass?.toFixed?.(3) ?? '—'} u. Category: ${el.category}.`
    }
    case 'element-explorer': {
      const z = params.z ?? state?.z ?? 0
      const el = elementAtZ(z)
      if (!el) return 'Element explorer active.'
      return `Exploring ${el.symbol} (${el.name}, Z=${el.z}). ` +
        `Electron configuration: ${el.electronConfig ?? '—'}. ` +
        `Group ${el.group ?? '—'}, period ${el.period ?? '—'}.`
    }
    case 'combine': {
      const idx = params.reaction ?? 0
      // state.reaction IS the Reaction object when populated by the experiment
      const r = (state?.reaction && state.reaction.reactants) ? state.reaction : reactionAtIndex(idx)
      if (!r) return 'Combine Elements active.'
      return formatReaction(r)
    }
    case 'reaction-simulator': {
      const idx = params.reaction ?? 0
      const r = (state?.reaction && state.reaction.reactants) ? state.reaction : reactionAtIndex(idx)
      if (!r) return 'Reaction Simulator active.'
      return formatReaction(r) + ` Progress: ${((state?.progress ?? 0) * 100).toFixed(0)}%.`
    }
    case 'molecule-builder':
    case 'molecule-viewer': {
      const idx = params.molecule ?? 0
      const m = (state?.molecule && state.molecule.formula) ? state.molecule : moleculeAtIndex(idx)
      if (!m) return 'Molecule viewer active.'
      const parts: string[] = []
      parts.push(`Active molecule: ${m.formula} (${m.name}).`)
      if (m.geometry) parts.push(`Geometry: ${m.geometry}${m.bondAngle ? `, bond angle ${m.bondAngle}°` : ''}.`)
      parts.push(m.polar ? 'Polar.' : 'Non-polar.')
      parts.push(`Molar mass ${m.molarMass ?? '—'} g/mol.`)
      return parts.join(' ')
    }
    case 'isotopes': {
      const z = params.z ?? state?.z ?? 0
      const A = params.A ?? state?.A ?? 0
      const iso = isotopeAtZA(z, A)
      const el = elementAtZ(z)
      if (!iso) return 'Isotopes active.'
      const halflife = iso.halfLife ?? 'stable'
      return `Selected isotope: ${el?.symbol ?? '?'}-${iso.a} (Z=${z}). Half-life: ${halflife}.`
    }
    case 'electron-config': {
      const z = params.z ?? state?.z ?? 0
      const el = elementAtZ(z)
      if (!el) return 'Electron configuration active.'
      return `Atomic number Z=${z} (${el.symbol}). Configuration: ${el.electronConfig ?? '—'}.`
    }
    case 'ph-scale': {
      const idx = params.solution ?? 0
      const sol = solutionAtIndex(idx)
      const pH = measurements.pH ?? state?.pH ?? 7
      const compare = params.compare ? 'Comparison mode ON.' : ''
      if (!sol) return `pH Scale active. pH ≈ ${Number(pH).toFixed(2)}. ${compare}`.trim()
      const hConc = measurements.h_conc
      const hStr = typeof hConc === 'number' ? hConc.toExponential(2) : '—'
      return `Solution A: ${sol.name}${sol.formula ? ` (${sol.formula})` : ''}. ` +
        `pH ≈ ${Number(pH).toFixed(2)}, [H⁺] = ${hStr} M. ${compare}`.trim()
    }
    case 'titration': {
      const idx = Math.round(params.pair ?? 0)
      const pair = TITRATION_PAIRS[Math.max(0, Math.min(TITRATION_PAIRS.length - 1, idx))]
      const pH = measurements.pH ?? state?.pH ?? 7
      const Vb = params.Vb ?? state?.Vb ?? 0
      const Veq = measurements.Veq ?? state?.Veq ?? 0
      const Va = params.Va ?? state?.Va ?? 25
      return `Titration: ${pair?.label ?? `pair #${idx + 1}`}. ` +
        `${Va.toFixed(1)} mL analyte, ${Vb.toFixed(2)} mL titrant added (equivalence ≈ ${Number(Veq).toFixed(1)} mL). ` +
        `Current pH = ${Number(pH).toFixed(2)}.`
    }
    case 'concentration': {
      const idx = params.solute ?? 0
      const solute = soluteAtIndex(idx)
      const n = params.n ?? state?.n ?? 0
      const V = params.V ?? state?.V ?? 0
      const M = measurements.molarity ?? (V > 0 ? n / V : 0)
      return `Concentration: ${n.toFixed(3)} mol of ${solute?.formula ?? `solute #${idx + 1}`} ` +
        `dissolved in ${V.toFixed(3)} L → M = ${Number(M).toFixed(3)} mol/L. ` +
        `${solute ? `Molar mass ${solute.molarMass} g/mol.` : ''}`.trim()
    }
    default:
      return `Experiment "${EXPERIMENTS_BY_ID[experimentId]?.title ?? experimentId}" active.`
  }
}
