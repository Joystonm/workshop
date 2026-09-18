// Real, balanced chemical reactions with thermodynamic and observable data.
// Sources: CRC Handbook of Chemistry and Physics, NIST WebBook, standard
// general-chemistry texts. Each reaction has the format:
//
//   "aA + bB → cC + dD"    (states-of-matter noted in parens)
//
// where the integer coefficients a, b, c, d are already balanced.
//
// `balanceEquation` below can balance arbitrary simple user-supplied
// equations via Gaussian elimination over the element-count matrix. The
// hard-coded `REACTIONS` list is the source of truth for the
// Reaction-Lab scene; `balanceEquation` is for the open-ended combine
// elements feature.

export type ReactionType =
  | 'acid-base'
  | 'precipitation'
  | 'redox'
  | 'combustion'
  | 'gas-evolution'
  | 'single-displacement'
  | 'double-displacement'
  | 'synthesis'
  | 'decomposition'
  | 'complexation'

export type Observable =
  | 'color-change'
  | 'precipitate'
  | 'gas-evolution'
  | 'temperature-rise'
  | 'temperature-fall'
  | 'flame'
  | 'light'
  | 'none'

export interface Reaction {
  id: string
  // Reactant formula strings exactly as they appear in the balanced eq.
  reactants: string[]
  // Product formula strings.
  products: string[]
  // Integer coefficients in the same order as reactants and products.
  coefficients: { reactants: number[]; products: number[] }
  // Standard enthalpy of reaction at 25 °C, kJ per stoichiometric unit.
  dH_kJ: number
  // Equilibrium constant at 25 °C (for the reaction as written). Optional.
  Keq?: number
  type: ReactionType
  observables: Observable[]
  // Short description of what a student would see.
  description: string
  // Phases in the same order as the formulas, e.g. "(aq)", "(s)", "(g)".
  phases: { reactants: string[]; products: string[] }
}

// ---------------------------------------------------------------------------
// Hard-coded database of common reactions. Coefficients are pre-balanced.
// ---------------------------------------------------------------------------

export const REACTIONS: Reaction[] = [
  // --- Acid-base neutralization ---
  {
    id: 'hcl-naoh',
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H2O'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -57.1,
    type: 'acid-base',
    observables: ['temperature-rise'],
    description: 'Strong acid + strong base → salt + water. The reaction is exothermic; the solution warms noticeably.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)', '(l)'] },
  },
  {
    id: 'h2so4-naoh',
    reactants: ['H2SO4', 'NaOH'],
    products: ['Na2SO4', 'H2O'],
    coefficients: { reactants: [1, 2], products: [1, 2] },
    dH_kJ: -114.7,
    type: 'acid-base',
    observables: ['temperature-rise'],
    description: 'Diprotic acid + strong base; requires 2 mol NaOH per mol H₂SO₄.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)', '(l)'] },
  },
  {
    id: 'hcl-koh',
    reactants: ['HCl', 'KOH'],
    products: ['KCl', 'H2O'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -57.6,
    type: 'acid-base',
    observables: ['temperature-rise'],
    description: 'Standard strong-acid + strong-base neutralisation.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)', '(l)'] },
  },
  {
    id: 'hcl-caco3',
    reactants: ['HCl', 'CaCO3'],
    products: ['CaCl2', 'H2O', 'CO2'],
    coefficients: { reactants: [2, 1], products: [1, 1, 1] },
    dH_kJ: -15.5,
    type: 'gas-evolution',
    observables: ['gas-evolution'],
    description: 'Carbonate + acid → CO₂ bubbles. The "limestone + acid" test for carbonates.',
    phases: { reactants: ['(aq)', '(s)'], products: ['(aq)', '(l)', '(g)'] },
  },
  {
    id: 'hcl-na2co3',
    reactants: ['HCl', 'Na2CO3'],
    products: ['NaCl', 'H2O', 'CO2'],
    coefficients: { reactants: [2, 1], products: [2, 1, 1] },
    dH_kJ: -28.0,
    type: 'gas-evolution',
    observables: ['gas-evolution'],
    description: 'Washing soda + acid → fizzing CO₂.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)', '(l)', '(g)'] },
  },
  {
    id: 'hcl-nahco3',
    reactants: ['HCl', 'NaHCO3'],
    products: ['NaCl', 'H2O', 'CO2'],
    coefficients: { reactants: [1, 1], products: [1, 1, 1] },
    dH_kJ: -11.8,
    type: 'gas-evolution',
    observables: ['gas-evolution'],
    description: 'Bicarbonate + acid → CO₂. Used in "baking-soda volcanoes".',
    phases: { reactants: ['(aq)', '(s)'], products: ['(aq)', '(l)', '(g)'] },
  },
  {
    id: 'hcl-mg',
    reactants: ['HCl', 'Mg'],
    products: ['MgCl2', 'H2'],
    coefficients: { reactants: [2, 1], products: [1, 1] },
    dH_kJ: -467.4,
    type: 'single-displacement',
    observables: ['gas-evolution', 'temperature-rise'],
    description: 'Active metal + acid → H₂ gas. The ribbon dissolves; vigorous bubbling.',
    phases: { reactants: ['(aq)', '(s)'], products: ['(aq)', '(g)'] },
  },
  {
    id: 'hcl-zn',
    reactants: ['HCl', 'Zn'],
    products: ['ZnCl2', 'H2'],
    coefficients: { reactants: [2, 1], products: [1, 1] },
    dH_kJ: -152.0,
    type: 'single-displacement',
    observables: ['gas-evolution', 'temperature-rise'],
    description: 'Zinc + HCl → hydrogen gas; classic "dry cell" chemistry.',
    phases: { reactants: ['(aq)', '(s)'], products: ['(aq)', '(g)'] },
  },
  {
    id: 'h2so4-fe',
    reactants: ['H2SO4', 'Fe'],
    products: ['FeSO4', 'H2'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -88.0,
    type: 'single-displacement',
    observables: ['gas-evolution', 'color-change'],
    description: 'Iron + dilute sulfuric acid → hydrogen + pale-green iron(II) solution.',
    phases: { reactants: ['(aq)', '(s)'], products: ['(aq)', '(g)'] },
  },

  // --- Precipitation ---
  {
    id: 'nacl-agno3',
    reactants: ['NaCl', 'AgNO3'],
    products: ['AgCl', 'NaNO3'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -65.5,
    type: 'precipitation',
    observables: ['precipitate'],
    description: 'Mix → curdy white AgCl precipitate (insoluble halide).',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'nacl-pbno3',
    reactants: ['NaCl', 'Pb(NO3)2'],
    products: ['PbCl2', 'NaNO3'],
    coefficients: { reactants: [2, 1], products: [1, 2] },
    dH_kJ: -25.9,
    type: 'precipitation',
    observables: ['precipitate'],
    description: 'White PbCl₂ precipitate (sparingly soluble, more so when hot).',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'na2so4-bacl2',
    reactants: ['Na2SO4', 'BaCl2'],
    products: ['BaSO4', 'NaCl'],
    coefficients: { reactants: [1, 1], products: [1, 2] },
    dH_kJ: -4.6,
    type: 'precipitation',
    observables: ['precipitate'],
    description: 'White BaSO₄ — extremely insoluble (Ksp ~ 1e-10). Used in gravimetric analysis.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'k2cro4-pbno3',
    reactants: ['K2CrO4', 'Pb(NO3)2'],
    products: ['PbCrO4', 'KNO3'],
    coefficients: { reactants: [1, 1], products: [1, 2] },
    dH_kJ: -42.0,
    type: 'precipitation',
    observables: ['precipitate', 'color-change'],
    description: 'Yellow PbCrO₄ precipitate (chrome yellow pigment).',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'cuso4-naoh',
    reactants: ['CuSO4', 'NaOH'],
    products: ['Cu(OH)2', 'Na2SO4'],
    coefficients: { reactants: [1, 2], products: [1, 1] },
    dH_kJ: -50.0,
    type: 'precipitation',
    observables: ['precipitate', 'color-change'],
    description: 'Pale-blue Cu(OH)₂ gel. Heated, dehydrates to black CuO.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'agno3-kbr',
    reactants: ['AgNO3', 'KBr'],
    products: ['AgBr', 'KNO3'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -84.0,
    type: 'precipitation',
    observables: ['precipitate', 'color-change'],
    description: 'Pale-yellow AgBr — light-sensitive, the basis of photographic film.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'feso4-naoh',
    reactants: ['FeSO4', 'NaOH'],
    products: ['Fe(OH)2', 'Na2SO4'],
    coefficients: { reactants: [1, 2], products: [1, 1] },
    dH_kJ: -38.0,
    type: 'precipitation',
    observables: ['precipitate', 'color-change'],
    description: 'Pale-green Fe(OH)₂, oxidises in air to brown Fe(OH)₃.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },
  {
    id: 'fecl3-naoh',
    reactants: ['FeCl3', 'NaOH'],
    products: ['Fe(OH)3', 'NaCl'],
    coefficients: { reactants: [1, 3], products: [1, 3] },
    dH_kJ: -97.0,
    type: 'precipitation',
    observables: ['precipitate', 'color-change'],
    description: 'Rust-brown Fe(OH)₃ gel.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(s)', '(aq)'] },
  },

  // --- Combustion ---
  {
    id: 'comb-ch4',
    reactants: ['CH4', 'O2'],
    products: ['CO2', 'H2O'],
    coefficients: { reactants: [1, 2], products: [1, 2] },
    dH_kJ: -890.4,
    type: 'combustion',
    observables: ['flame', 'temperature-rise'],
    description: 'Methane combustion: clean blue flame, lots of heat.',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)', '(g)'] },
  },
  {
    id: 'comb-c2h6',
    reactants: ['C2H6', 'O2'],
    products: ['CO2', 'H2O'],
    coefficients: { reactants: [2, 7], products: [4, 6] },
    dH_kJ: -1560.0,
    type: 'combustion',
    observables: ['flame', 'temperature-rise'],
    description: 'Ethane combustion (used in Bunsen burners).',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)', '(g)'] },
  },
  {
    id: 'comb-c3h8',
    reactants: ['C3H8', 'O2'],
    products: ['CO2', 'H2O'],
    coefficients: { reactants: [1, 5], products: [3, 4] },
    dH_kJ: -2220.0,
    type: 'combustion',
    observables: ['flame', 'temperature-rise'],
    description: 'Propane combustion (LPG).',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)', '(g)'] },
  },
  {
    id: 'comb-mg',
    reactants: ['Mg', 'O2'],
    products: ['MgO'],
    coefficients: { reactants: [2, 1], products: [2] },
    dH_kJ: -1203.0,
    type: 'combustion',
    observables: ['flame', 'light', 'temperature-rise'],
    description: 'Magnesium burns with a blindingly bright white flame. Do not look directly at it.',
    phases: { reactants: ['(s)', '(g)'], products: ['(s)'] },
  },
  {
    id: 'comb-fe',
    reactants: ['Fe', 'O2'],
    products: ['Fe2O3'],
    coefficients: { reactants: [4, 3], products: [2] },
    dH_kJ: -1648.0,
    type: 'combustion',
    observables: ['temperature-rise'],
    description: 'Iron rusting — slow, exothermic oxidation (combustion in air).',
    phases: { reactants: ['(s)', '(g)'], products: ['(s)'] },
  },
  {
    id: 'comb-c2h5oh',
    reactants: ['C2H5OH', 'O2'],
    products: ['CO2', 'H2O'],
    coefficients: { reactants: [1, 3], products: [2, 3] },
    dH_kJ: -1367.0,
    type: 'combustion',
    observables: ['flame', 'temperature-rise'],
    description: 'Ethanol burns with a clean, almost invisible blue flame.',
    phases: { reactants: ['(l)', '(g)'], products: ['(g)', '(g)'] },
  },

  // --- Redox ---
  {
    id: 'zn-cuso4',
    reactants: ['Zn', 'CuSO4'],
    products: ['ZnSO4', 'Cu'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -216.0,
    type: 'redox',
    observables: ['color-change', 'temperature-rise'],
    description: 'Zinc displaces copper from solution; copper plates out on the zinc. Blue → colourless.',
    phases: { reactants: ['(s)', '(aq)'], products: ['(aq)', '(s)'] },
  },
  {
    id: 'fe-cuso4',
    reactants: ['Fe', 'CuSO4'],
    products: ['FeSO4', 'Cu'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -150.0,
    type: 'redox',
    observables: ['color-change', 'temperature-rise'],
    description: 'Iron displaces copper from solution; copper deposits on the nail.',
    phases: { reactants: ['(s)', '(aq)'], products: ['(aq)', '(s)'] },
  },
  {
    id: 'al-cucl2',
    reactants: ['Al', 'CuCl2'],
    products: ['AlCl3', 'Cu'],
    coefficients: { reactants: [2, 3], products: [2, 3] },
    dH_kJ: -470.0,
    type: 'single-displacement',
    observables: ['temperature-rise', 'color-change'],
    description: 'Aluminium + copper(II) chloride; vigorous; exothermic. "Thermite-like" demonstration.',
    phases: { reactants: ['(s)', '(aq)'], products: ['(aq)', '(s)'] },
  },
  {
    id: 'h2o2-mno2',
    reactants: ['H2O2'],
    products: ['H2O', 'O2'],
    coefficients: { reactants: [2], products: [2, 1] },
    dH_kJ: -196.0,
    type: 'decomposition',
    observables: ['gas-evolution', 'temperature-rise'],
    description: 'MnO₂ catalyst decomposes H₂O₂ → O₂. Vigorous fizzing.',
    phases: { reactants: ['(l)'], products: ['(l)', '(g)'] },
  },
  {
    id: 'h2o2-ki',
    reactants: ['H2O2', 'KI'],
    products: ['H2O', 'O2', 'KI'],
    coefficients: { reactants: [2, 2], products: [2, 1, 2] },
    dH_kJ: -196.0,
    type: 'decomposition',
    observables: ['gas-evolution', 'color-change'],
    description: 'KI catalyses the disproportionation of H₂O₂.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(l)', '(g)', '(aq)'] },
  },

  // --- Synthesis ---
  {
    id: 'syn-h2-cl2',
    reactants: ['H2', 'Cl2'],
    products: ['HCl'],
    coefficients: { reactants: [1, 1], products: [2] },
    dH_kJ: -184.6,
    type: 'synthesis',
    observables: ['flame', 'temperature-rise'],
    description: 'Hydrogen + chlorine → HCl. Photocatalysed by UV light; explosively fast.',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)'] },
  },
  {
    id: 'syn-n2-h2',
    reactants: ['N2', 'H2'],
    products: ['NH3'],
    coefficients: { reactants: [1, 3], products: [2] },
    dH_kJ: -92.4,
    type: 'synthesis',
    observables: ['none'],
    description: 'Haber-Bosch: nitrogen fixation to ammonia. High T/P, Fe catalyst.',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)'] },
  },
  {
    id: 'syn-so3',
    reactants: ['SO2', 'O2'],
    products: ['SO3'],
    coefficients: { reactants: [2, 1], products: [2] },
    dH_kJ: -198.4,
    type: 'synthesis',
    observables: ['none'],
    description: 'Catalytic oxidation of SO₂; contact process for sulfuric acid.',
    phases: { reactants: ['(g)', '(g)'], products: ['(g)'] },
  },

  // --- Decomposition ---
  {
    id: 'dec-caco3',
    reactants: ['CaCO3'],
    products: ['CaO', 'CO2'],
    coefficients: { reactants: [1], products: [1, 1] },
    dH_kJ: 178.3,
    type: 'decomposition',
    observables: ['temperature-fall'],
    description: 'Limestone calcination (lime burning). Strongly endothermic.',
    phases: { reactants: ['(s)'], products: ['(s)', '(g)'] },
  },
  {
    id: 'dec-kclo3',
    reactants: ['KClO3'],
    products: ['KCl', 'O2'],
    coefficients: { reactants: [2], products: [2, 3] },
    dH_kJ: -89.4,
    type: 'decomposition',
    observables: ['gas-evolution', 'temperature-rise'],
    description: 'KClO₃ → O₂ (oxygen generation; MnO₂ catalyst).',
    phases: { reactants: ['(s)'], products: ['(s)', '(g)'] },
  },
  {
    id: 'dec-nh4no3',
    reactants: ['NH4NO3'],
    products: ['N2O', 'H2O'],
    coefficients: { reactants: [1], products: [1, 2] },
    dH_kJ: -36.0,
    type: 'decomposition',
    observables: ['gas-evolution', 'temperature-rise'],
    description: 'Ammonium nitrate decomposes to N₂O ("laughing gas") + water.',
    phases: { reactants: ['(s)'], products: ['(g)', '(l)'] },
  },

  // --- Complexation ---
  {
    id: 'cu-nh3',
    reactants: ['CuSO4', 'NH3'],
    products: ['[Cu(NH3)4]SO4'],
    coefficients: { reactants: [1, 4], products: [1] },
    dH_kJ: -130.0,
    type: 'complexation',
    observables: ['color-change'],
    description: 'Pale blue → deep royal blue [Cu(NH₃)₄]²⁺ tetraamminecopper(II) complex.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)'] },
  },
  {
    id: 'fe-scn',
    reactants: ['FeCl3', 'KSCN'],
    products: ['[Fe(SCN)]Cl2', 'KCl'],
    coefficients: { reactants: [1, 1], products: [1, 1] },
    dH_kJ: -25.0,
    type: 'complexation',
    observables: ['color-change'],
    description: 'Pale yellow → blood-red [Fe(SCN)]²⁺. Classic test for Fe³⁺.',
    phases: { reactants: ['(aq)', '(aq)'], products: ['(aq)', '(aq)'] },
  },
]

// Quick lookup from id.
const REACTIONS_BY_ID: Record<string, Reaction> = Object.fromEntries(REACTIONS.map((r) => [r.id, r]))
export function getReaction(id: string): Reaction | undefined { return REACTIONS_BY_ID[id] }

// Find the unique reaction whose reactants match exactly (ignoring coefficients).
export function findReactionByReactants(reactants: string[]): Reaction | undefined {
  const set = new Set(reactants.map((s) => s.toLowerCase()))
  return REACTIONS.find((r) => {
    if (r.reactants.length !== reactants.length) return false
    const rs = new Set(r.reactants.map((s) => s.toLowerCase()))
    return rs.size === set.size && [...rs].every((x) => set.has(x))
  })
}

// ---------------------------------------------------------------------------
// Equation-balancing engine (Gaussian elimination over element counts).
// Handles the common case: a few simple compounds on each side, with
// unique element counts. Not a CAS; sufficient for undergraduate chem.
// ---------------------------------------------------------------------------

// Parse a formula into a map of element -> count. Supports parentheses
// with a single trailing multiplier, e.g. Ca(OH)2, (NH4)2SO4.
export function parseFormula(formula: string): Map<string, number> {
  const counts = new Map<string, number>()
  const stack: Map<string, number>[] = [counts]
  let i = 0
  while (i < formula.length) {
    const c = formula[i]
    if (c === '(' || c === '[') {
      const inner: Map<string, number> = new Map()
      stack.push(inner)
      i++
    } else if (c === ')' || c === ']') {
      const inner = stack.pop()!
      i++
      // Read multiplier
      let mult = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) { mult += formula[i]; i++ }
      const m = mult ? parseInt(mult, 10) : 1
      const top = stack[stack.length - 1]
      for (const [el, n] of inner) top.set(el, (top.get(el) ?? 0) + n * m)
    } else if (/[A-Z]/.test(c)) {
      let el = c
      i++
      if (i < formula.length && /[a-z]/.test(formula[i])) { el += formula[i]; i++ }
      let n = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) { n += formula[i]; i++ }
      const count = n ? parseInt(n, 10) : 1
      const top = stack[stack.length - 1]
      top.set(el, (top.get(el) ?? 0) + count)
    } else if (c === '·' || c === '.') {
      // Hydrate dot, e.g. CuSO4·5H2O; skip the coefficient after.
      i++
      let mult = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) { mult += formula[i]; i++ }
      const m = mult ? parseInt(mult, 10) : 1
      // Parse the rest of the formula as if it were parenthesised by m.
      let rest = ''
      while (i < formula.length) { rest += formula[i]; i++ }
      const restCounts = parseFormula(rest)
      const top = stack[stack.length - 1]
      for (const [el, n] of restCounts) top.set(el, (top.get(el) ?? 0) + n * m)
    } else {
      // Unknown character — skip.
      i++
    }
  }
  return counts
}

// All distinct elements appearing in a list of formulas.
export function elementsIn(formulas: string[]): string[] {
  const set = new Set<string>()
  for (const f of formulas) for (const k of parseFormula(f).keys()) set.add(k)
  return [...set]
}

// Build the element-count matrix: rows = elements, cols = species.
// Products contribute as negative.
function buildMatrix(species: string[]): { matrix: number[][]; elements: string[] } {
  const elements = elementsIn(species)
  const matrix: number[][] = elements.map((el) =>
    species.map((f) => parseFormula(f).get(el) ?? 0)
  )
  return { matrix, elements }
}

// Solve M · x = 0 with the smallest positive integer solution.
// Strategy: row-reduce, express variables in terms of free variables,
// pick the smallest free-variable set that gives all-positive integer x.
function nullSpaceInteger(matrix: number[][]): number[] | null {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0
  if (cols === 0) return null
  // Augment with identity to track pivots.
  const M: number[][] = matrix.map((r) => r.slice())
  const pivotCol: number[] = []
  let r = 0
  for (let c = 0; c < cols && r < rows; c++) {
    // Find pivot.
    let p = -1
    for (let i = r; i < rows; i++) if (M[i][c] !== 0) { p = i; break }
    if (p === -1) continue
    // Swap.
    ;[M[r], M[p]] = [M[p], M[r]]
    // Normalise (avoid fractions for clarity; we just want integer null space).
    // We keep things as integers, scaling rows to clear denominators later.
    for (let i = 0; i < rows; i++) {
      if (i === r) continue
      if (M[i][c] === 0) continue
      // Row op: M[i] = M[i] * M[r][c] - M[r] * M[i][c]
      const factor = M[r][c]
      for (let k = 0; k < cols; k++) {
        M[i][k] = M[i][k] * factor - M[r][k] * M[i][c]
      }
    }
    pivotCol.push(c)
    r++
  }
  // Free columns are those not in pivotCol.
  const free: number[] = []
  for (let c = 0; c < cols; c++) if (!pivotCol.includes(c)) free.push(c)
  if (free.length === 0) {
    // Only the trivial solution exists.
    return null
  }
  // Set each free variable to 1 in turn, derive the rest. Pick the
  // assignment that yields all-positive integer dependent values.
  for (let trial = 0; trial < 1000; trial++) {
    const x: number[] = new Array(cols).fill(0)
    // Free vars: use trial index to assign small integers 1..n
    for (let f = 0; f < free.length; f++) {
      x[free[f]] = 1 + ((trial >> (f * 2)) & 0x3)
    }
    // Compute pivot vars from row reduction.
    let ok = true
    for (let i = pivotCol.length - 1; i >= 0; i--) {
      const c = pivotCol[i]
      let s = 0
      for (let k = 0; k < cols; k++) if (k !== c) s += M[i][k] * x[k]
      // M[i][c] * x[c] + s = 0  =>  x[c] = -s / M[i][c]
      if (M[i][c] === 0) { ok = false; break }
      const v = -s / M[i][c]
      if (!Number.isInteger(v) || v <= 0) { ok = false; break }
      x[c] = v
    }
    if (ok) {
      // All positive integers — done. Make sure they're coprime by dividing by GCD.
      let g = x[0]
      for (let k = 1; k < cols; k++) g = gcd(g, x[k])
      if (g > 1) for (let k = 0; k < cols; k++) x[k] /= g
      return x
    }
  }
  return null
}

function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b) }

export interface BalancedEquation {
  reactants: { formula: string; coefficient: number }[]
  products: { formula: string; coefficient: number }[]
  ok: boolean
  reason?: string
}

export function balanceEquation(reactants: string[], products: string[]): BalancedEquation {
  const all = [...reactants, ...products]
  if (all.length === 0) return { reactants: [], products: [], ok: false, reason: 'No species given.' }
  const { matrix } = buildMatrix(all)
  const x = nullSpaceInteger(matrix)
  if (!x) return { reactants: reactants.map((f) => ({ formula: f, coefficient: 1 })), products: products.map((f) => ({ formula: f, coefficient: 1 })), ok: false, reason: 'Could not balance automatically.' }
  return {
    reactants: reactants.map((f, i) => ({ formula: f, coefficient: x[i] })),
    products: products.map((f, i) => ({ formula: f, coefficient: x[reactants.length + i] })),
    ok: true,
  }
}

// ---------------------------------------------------------------------------
// Format helpers.
// ---------------------------------------------------------------------------

export function formatEquation(eq: BalancedEquation): string {
  const fmt = (arr: { formula: string; coefficient: number }[]) =>
    arr
      .map(({ formula, coefficient }) => (coefficient === 1 ? formula : `${coefficient}${formula}`))
      .join(' + ')
  return `${fmt(eq.reactants)} → ${fmt(eq.products)}`
}

export function formatReaction(r: Reaction): string {
  const fmt = (arr: string[], coefs: number[], phases: string[]) =>
    arr
      .map((f, i) => `${coefs[i] === 1 ? '' : coefs[i]}${f}${phases[i] ?? ''}`)
      .join(' + ')
  return `${fmt(r.reactants, r.coefficients.reactants, r.phases.reactants)} → ${fmt(r.products, r.coefficients.products, r.phases.products)}`
}
