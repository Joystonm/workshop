// Common acids and bases with their real concentrations and computed
// pH at 25 °C. Includes both strong (full dissociation) and weak
// (Ka/Kb equilibrium) examples.
//
// Source: CRC Handbook of Chemistry and Physics.

export type AcidOrBaseKind = 'acid' | 'base'

export interface Solution {
  id: string
  name: string
  formula: string
  kind: AcidOrBaseKind
  // Concentration in mol/L (M).
  concentration: number
  // True if fully dissociated in water (strong); false for weak.
  strong: boolean
  // Ka for acids, Kb for bases (only meaningful when !strong).
  Ka?: number
  Kb?: number
  // Hex color used to tint the flask liquid at this concentration.
  indicatorColor: string
  // One-line textbook note.
  note: string
}

// pH/pOH helpers — operating in mol/L.
const KW = 1e-14

function phFromAcid(c: number, strong: boolean, Ka?: number): number {
  if (strong) {
    const h = c
    return -Math.log10(h)
  }
  // Weak acid: solve x² / (c − x) = Ka
  const aKa = Ka ?? 1e-5
  const x = 0.5 * (-aKa + Math.sqrt(aKa * aKa + 4 * aKa * c))
  return -Math.log10(x)
}

function phFromBase(c: number, strong: boolean, Kb?: number): number {
  if (strong) {
    const oh = c
    return 14 + Math.log10(oh)
  }
  const bKb = Kb ?? 1e-5
  const x = 0.5 * (-bKb + Math.sqrt(bKb * bKb + 4 * bKb * c))
  const pOH = -Math.log10(x)
  return 14 - pOH
}

export interface ComputedSolution extends Solution {
  pH: number
  pOH: number
  hConcentration: number
  ohConcentration: number
}

export function compute(s: Solution): ComputedSolution {
  const pH = s.kind === 'acid' ? phFromAcid(s.concentration, s.strong, s.Ka) : phFromBase(s.concentration, s.strong, s.Kb)
  const pOH = 14 - pH
  const hConcentration = Math.pow(10, -pH)
  const ohConcentration = Math.pow(10, -pOH)
  return { ...s, pH, pOH, hConcentration, ohConcentration }
}

export const SOLUTIONS: Solution[] = [
  // Strong acids
  { id: 'hcl-1M', name: 'Hydrochloric acid', formula: 'HCl', kind: 'acid', concentration: 1.0, strong: true, indicatorColor: '#DC2626', note: 'Gastric acid; strong acid in the stomach.' },
  { id: 'hcl-0.1M', name: 'Hydrochloric acid (dilute)', formula: 'HCl', kind: 'acid', concentration: 0.1, strong: true, indicatorColor: '#F87171', note: 'Typical "dilute HCl" used in school labs.' },
  { id: 'hcl-stomach', name: 'Stomach acid (typical)', formula: 'HCl', kind: 'acid', concentration: 0.05, strong: true, indicatorColor: '#FCA5A5', note: 'pH ~ 1.5 in the stomach during digestion.' },
  { id: 'h2so4-1M', name: 'Sulfuric acid', formula: 'H₂SO₄', kind: 'acid', concentration: 1.0, strong: true, indicatorColor: '#B91C1C', note: 'Diprotic strong acid — first proton fully dissociated.' },
  { id: 'hno3-1M', name: 'Nitric acid', formula: 'HNO₃', kind: 'acid', concentration: 1.0, strong: true, indicatorColor: '#EF4444', note: 'Strong oxidising acid.' },

  // Weak acids
  { id: 'ch3cooh-1M', name: 'Acetic acid (vinegar)', formula: 'CH₃COOH', kind: 'acid', concentration: 1.0, strong: false, Ka: 1.8e-5, indicatorColor: '#FB923C', note: 'Ka = 1.8 × 10⁻⁵. The acid in vinegar.' },
  { id: 'ch3cooh-vinegar', name: 'White vinegar (~5%)', formula: 'CH₃COOH', kind: 'acid', concentration: 0.83, strong: false, Ka: 1.8e-5, indicatorColor: '#F59E0B', note: 'Household vinegar, pH ≈ 2.4.' },
  { id: 'hf-0.1M', name: 'Hydrofluoric acid', formula: 'HF', kind: 'acid', concentration: 0.1, strong: false, Ka: 6.6e-4, indicatorColor: '#F97316', note: 'Weak but extremely corrosive — etches glass.' },
  { id: 'hcooh-0.1M', name: 'Formic acid', formula: 'HCOOH', kind: 'acid', concentration: 0.1, strong: false, Ka: 1.8e-4, indicatorColor: '#EA580C', note: 'Ant sting venom.' },
  { id: 'h2co3', name: 'Carbonic acid', formula: 'H₂CO₃', kind: 'acid', concentration: 0.034, strong: false, Ka: 4.3e-7, indicatorColor: '#FCD34D', note: 'Forms when CO₂ dissolves in water.' },

  // Strong bases
  { id: 'naoh-1M', name: 'Sodium hydroxide', formula: 'NaOH', kind: 'base', concentration: 1.0, strong: true, indicatorColor: '#1E3A8A', note: 'Caustic soda — drain cleaner.' },
  { id: 'naoh-0.1M', name: 'Sodium hydroxide (dilute)', formula: 'NaOH', kind: 'base', concentration: 0.1, strong: true, indicatorColor: '#2563EB', note: 'Standard lab "dilute NaOH".' },
  { id: 'koh-1M', name: 'Potassium hydroxide', formula: 'KOH', kind: 'base', concentration: 1.0, strong: true, indicatorColor: '#1D4ED8', note: 'Used in soft soap manufacture.' },

  // Weak bases
  { id: 'nh3-1M', name: 'Ammonia (aqueous)', formula: 'NH₃', kind: 'base', concentration: 1.0, strong: false, Kb: 1.8e-5, indicatorColor: '#3B82F6', note: 'Kb = 1.8 × 10⁻⁵. Household ammonia cleaners.' },
  { id: 'nh3-household', name: 'Household ammonia', formula: 'NH₃', kind: 'base', concentration: 0.5, strong: false, Kb: 1.8e-5, indicatorColor: '#60A5FA', note: 'pH ≈ 11.6 in commercial cleaners.' },

  // Neutral
  { id: 'water', name: 'Pure water', formula: 'H₂O', kind: 'acid', concentration: 1e-7, strong: true, indicatorColor: '#15803D', note: 'pH 7.0 in pure water at 25 °C.' },
]
