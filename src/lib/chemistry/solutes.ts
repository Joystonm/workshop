// Solute catalog for the Concentration experiment. Shared between the
// scene (for the dropdown UI) and the Companion snapshot summarizer
// (so the AI knows which solute is currently selected, not just its index).

export interface Solute {
  id: string
  formula: string
  color: string
  molarMass: number
}

export const SOLUTES: Solute[] = [
  { id: 'nacl',  formula: 'NaCl',    color: '#A1A1AA', molarMass: 58.44 },
  { id: 'kcl',   formula: 'KCl',     color: '#71717A', molarMass: 74.55 },
  { id: 'cuso4', formula: 'CuSO₄',   color: '#3B82F6', molarMass: 159.61 },
  { id: 'kno3',  formula: 'KNO₃',    color: '#F59E0B', molarMass: 101.10 },
  { id: 'cacl2', formula: 'CaCl₂',   color: '#52525B', molarMass: 110.98 },
  { id: 'naco3', formula: 'Na₂CO₃',  color: '#10B981', molarMass: 105.99 },
  { id: 'gluc',  formula: 'C₆H₁₂O₆', color: '#A78BFA', molarMass: 180.16 },
]
