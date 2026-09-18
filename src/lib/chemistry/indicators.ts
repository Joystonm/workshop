// Common pH indicators used in titrations and pH demonstrations.
// Each indicator transitions between its acid and base forms across a
// narrow pH range; outside that range the colour is one or the other.
//
// `indicatorAtPH` blends the two colours through the transition range
// so the rendered swatch smoothly tracks the current pH.
//
// Sources: standard indicator tables; ranges match Sigma-Aldrich and
// common lab manuals.

export interface Indicator {
  id: string
  name: string
  // Mid-point of the transition (where the colour is a 50/50 mix).
  pKa: number
  // pH below which the indicator is fully in its acid form.
  rangeLow: number
  // pH above which the indicator is fully in its base form.
  rangeHigh: number
  // Colour of the acid form.
  acidColor: string
  // Colour of the base form.
  baseColor: string
}

export const INDICATORS: Indicator[] = [
  {
    id: 'methyl-orange',
    name: 'Methyl orange',
    pKa: 3.7,
    rangeLow: 3.1,
    rangeHigh: 4.4,
    acidColor: '#DC2626', // red
    baseColor: '#FBBF24', // yellow
  },
  {
    id: 'litmus',
    name: 'Litmus',
    pKa: 6.5,
    rangeLow: 4.5,
    rangeHigh: 8.3,
    acidColor: '#DC2626', // red
    baseColor: '#2563EB', // blue
  },
  {
    id: 'bromothymol',
    name: 'Bromothymol blue',
    pKa: 7.1,
    rangeLow: 6.0,
    rangeHigh: 7.6,
    acidColor: '#FBBF24', // yellow
    baseColor: '#2563EB', // blue
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    pKa: 9.4,
    rangeLow: 8.2,
    rangeHigh: 10.0,
    acidColor: '#FFFFFF', // colourless — render as white
    baseColor: '#EC4899', // pink
  },
]

export function getIndicator(id: string): Indicator | undefined {
  return INDICATORS.find((i) => i.id === id)
}

// Mix two hex colours in linear-ish space; t in [0, 1].
function mixHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16)
  const ag = parseInt(a.slice(3, 5), 16)
  const ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16)
  const bg = parseInt(b.slice(3, 5), 16)
  const bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

// Return the colour the indicator shows at the given pH.
export function indicatorAtPH(ind: Indicator, pH: number): string {
  if (pH <= ind.rangeLow) return ind.acidColor
  if (pH >= ind.rangeHigh) return ind.baseColor
  const t = (pH - ind.rangeLow) / (ind.rangeHigh - ind.rangeLow)
  return mixHex(ind.acidColor, ind.baseColor, t)
}
