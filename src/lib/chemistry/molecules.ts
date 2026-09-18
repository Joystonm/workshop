// Library of real molecules with their atoms, bonds, and 3D coordinates.
// Coordinates are in Angstroms. Where experimental coords are not available
// we use VSEPR-predicted geometries from central atom bond angles.
//
// Sources: PubChem 3D conformers, CCCBDB. We use idealised geometries
// for clarity — exact bond lengths vary in the real molecule but these
// match standard textbook structures.

export type VseprGeometry =
  | 'linear'
  | 'bent'
  | 'trigonal-planar'
  | 'trigonal-pyramidal'
  | 'tetrahedral'
  | 'trigonal-bipyramidal'
  | 'octahedral'
  | 'square-planar'

export interface Atom {
  symbol: string
  position: [number, number, number]
  // Formal charge, e.g. +1 for the metal in [Cu(NH3)4]^2+
  charge?: number
}

export interface Bond {
  a: number
  b: number
  order: 1 | 2 | 3
  // True for aromatic bonds (1.5 order, drawn shorter)
  aromatic?: boolean
}

export interface Molecule {
  id: string
  name: string
  formula: string
  // Display grouping in the picker.
  category: 'simple-inorganic' | 'common-organic' | 'biochem' | 'salt' | 'acid-base'
  // VSEPR geometry around the central atom (if applicable).
  geometry?: VseprGeometry
  // Bond angle in degrees (informational).
  bondAngle?: number
  // Polarity — affects whether it dissolves in water / has a dipole.
  polar: boolean
  // Short notes for the data card.
  properties: {
    molarMass: number // g/mol
    state: 'solid' | 'liquid' | 'gas'
    meltingPoint?: number // K
    boilingPoint?: number // K
    density?: number // g/cm³
    solubility?: string // qualitative
  }
  description: string
  // Atoms in order, with explicit 3D positions.
  atoms: Atom[]
  bonds: Bond[]
}

// -- 1. Simple inorganic --
const SIMPLE: Molecule[] = [
  {
    id: 'h2',
    name: 'Hydrogen',
    formula: 'H₂',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: false,
    properties: { molarMass: 2.016, state: 'gas', meltingPoint: 13.99, boilingPoint: 20.271, density: 0.00008988, solubility: 'slightly soluble in water' },
    description: 'Diatomic gas; lightest molecule; the most abundant in the universe.',
    atoms: [
      { symbol: 'H', position: [-0.37, 0, 0] },
      { symbol: 'H', position: [0.37, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: 'o2',
    name: 'Oxygen',
    formula: 'O₂',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: false,
    properties: { molarMass: 31.998, state: 'gas', meltingPoint: 54.36, boilingPoint: 90.188, density: 0.001429, solubility: 'slightly soluble in water' },
    description: 'Diatomic gas; essential for cellular respiration.',
    atoms: [
      { symbol: 'O', position: [-0.60, 0, 0] },
      { symbol: 'O', position: [0.60, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 2 }],
  },
  {
    id: 'n2',
    name: 'Nitrogen',
    formula: 'N₂',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: false,
    properties: { molarMass: 28.014, state: 'gas', meltingPoint: 63.15, boilingPoint: 77.355, density: 0.0012506, solubility: 'slightly soluble in water' },
    description: 'Triple bond makes N₂ very stable; 78% of atmosphere.',
    atoms: [
      { symbol: 'N', position: [-0.55, 0, 0] },
      { symbol: 'N', position: [0.55, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 3 }],
  },
  {
    id: 'h2o',
    name: 'Water',
    formula: 'H₂O',
    category: 'simple-inorganic',
    geometry: 'bent',
    bondAngle: 104.5,
    polar: true,
    properties: { molarMass: 18.015, state: 'liquid', meltingPoint: 273.15, boilingPoint: 373.15, density: 1.00, solubility: 'universal solvent' },
    description: 'Bent geometry (104.5°) makes water polar; hydrogen bonding gives water its unusual properties.',
    atoms: [
      { symbol: 'O', position: [0, 0, 0] },
      { symbol: 'H', position: [0.7572, 0.5860, 0] },
      { symbol: 'H', position: [-0.7572, 0.5860, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  {
    id: 'co2',
    name: 'Carbon dioxide',
    formula: 'CO₂',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: false,
    properties: { molarMass: 44.009, state: 'gas', meltingPoint: 194.7, boilingPoint: 194.7, density: 0.001977, solubility: 'soluble in water (forms carbonic acid)' },
    description: 'Linear molecule, nonpolar despite polar bonds (dipoles cancel). Greenhouse gas.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'O', position: [-1.16, 0, 0] },
      { symbol: 'O', position: [1.16, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  {
    id: 'nh3',
    name: 'Ammonia',
    formula: 'NH₃',
    category: 'simple-inorganic',
    geometry: 'trigonal-pyramidal',
    bondAngle: 107.8,
    polar: true,
    properties: { molarMass: 17.031, state: 'gas', meltingPoint: 195.42, boilingPoint: 239.81, density: 0.000769, solubility: 'highly soluble in water' },
    description: 'Trigonal pyramidal (107.8°); lone pair on N makes it a Brønsted base.',
    atoms: [
      { symbol: 'N', position: [0, 0, 0] },
      { symbol: 'H', position: [0, 0.94, -0.32] },
      { symbol: 'H', position: [0.81, -0.47, -0.32] },
      { symbol: 'H', position: [-0.81, -0.47, -0.32] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
    ],
  },
  {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH₄',
    category: 'simple-inorganic',
    geometry: 'tetrahedral',
    bondAngle: 109.5,
    polar: false,
    properties: { molarMass: 16.043, state: 'gas', meltingPoint: 90.7, boilingPoint: 111.7, density: 0.000656, solubility: 'insoluble in water' },
    description: 'Perfect tetrahedral geometry (109.5°); simplest hydrocarbon.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'H', position: [0.6276, 0.6276, 0.6276] },
      { symbol: 'H', position: [-0.6276, -0.6276, 0.6276] },
      { symbol: 'H', position: [-0.6276, 0.6276, -0.6276] },
      { symbol: 'H', position: [0.6276, -0.6276, -0.6276] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
  },
  {
    id: 'hcl',
    name: 'Hydrogen chloride',
    formula: 'HCl',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: true,
    properties: { molarMass: 36.461, state: 'gas', meltingPoint: 158.97, boilingPoint: 188.15, density: 0.00149, solubility: 'highly soluble in water (hydrochloric acid)' },
    description: 'Strong monoprotic acid in water; very polar diatomic.',
    atoms: [
      { symbol: 'Cl', position: [-0.31, 0, 0] },
      { symbol: 'H', position: [1.25, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: 'co',
    name: 'Carbon monoxide',
    formula: 'CO',
    category: 'simple-inorganic',
    geometry: 'linear',
    polar: true,
    properties: { molarMass: 28.010, state: 'gas', meltingPoint: 68.13, boilingPoint: 81.61, density: 0.001145, solubility: 'slightly soluble in water' },
    description: 'Toxic; binds to hemoglobin 200× more strongly than O₂.',
    atoms: [
      { symbol: 'C', position: [-0.56, 0, 0] },
      { symbol: 'O', position: [0.56, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 3 }],
  },
  {
    id: 'no2',
    name: 'Nitrogen dioxide',
    formula: 'NO₂',
    category: 'simple-inorganic',
    geometry: 'bent',
    bondAngle: 134,
    polar: true,
    properties: { molarMass: 46.006, state: 'gas', meltingPoint: 261.95, boilingPoint: 294.25, density: 0.00188, solubility: 'reacts with water' },
    description: 'Brown gas; odd-electron (radical); air pollutant from combustion.',
    atoms: [
      { symbol: 'N', position: [0, 0, 0] },
      { symbol: 'O', position: [1.20, 0.69, 0] },
      { symbol: 'O', position: [-1.20, 0.69, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  {
    id: 'so2',
    name: 'Sulfur dioxide',
    formula: 'SO₂',
    category: 'simple-inorganic',
    geometry: 'bent',
    bondAngle: 119,
    polar: true,
    properties: { molarMass: 64.066, state: 'gas', meltingPoint: 197.65, boilingPoint: 263.13, density: 0.00226, solubility: 'soluble in water (forms sulfurous acid)' },
    description: 'Bent geometry, polar; product of burning sulfur; causes acid rain.',
    atoms: [
      { symbol: 'S', position: [0, 0, 0] },
      { symbol: 'O', position: [1.43, 0.83, 0] },
      { symbol: 'O', position: [-1.43, 0.83, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
]

// -- 2. Common organic --
const ORGANIC: Molecule[] = [
  {
    id: 'c2h4',
    name: 'Ethylene (ethene)',
    formula: 'C₂H₄',
    category: 'common-organic',
    geometry: 'trigonal-planar',
    bondAngle: 120,
    polar: false,
    properties: { molarMass: 28.054, state: 'gas', meltingPoint: 104.0, boilingPoint: 169.4, density: 0.001178, solubility: 'slightly soluble in water' },
    description: 'Planar with C=C double bond; plant hormone that ripens fruit.',
    atoms: [
      { symbol: 'C', position: [-0.67, 0, 0] },
      { symbol: 'C', position: [0.67, 0, 0] },
      { symbol: 'H', position: [-1.23, 0.93, 0] },
      { symbol: 'H', position: [-1.23, -0.93, 0] },
      { symbol: 'H', position: [1.23, 0.93, 0] },
      { symbol: 'H', position: [1.23, -0.93, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
    ],
  },
  {
    id: 'c2h6',
    name: 'Ethane',
    formula: 'C₂H₆',
    category: 'common-organic',
    geometry: 'tetrahedral',
    bondAngle: 109.5,
    polar: false,
    properties: { molarMass: 30.070, state: 'gas', meltingPoint: 90.4, boilingPoint: 184.6, density: 0.001356, solubility: 'insoluble in water' },
    description: 'Simplest alkane with C-C single bond; freely rotating.',
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0] },
      { symbol: 'C', position: [0.77, 0, 0] },
      { symbol: 'H', position: [-1.16, 1.02, 0] },
      { symbol: 'H', position: [-1.16, -0.51, 0.88] },
      { symbol: 'H', position: [-1.16, -0.51, -0.88] },
      { symbol: 'H', position: [1.16, -1.02, 0] },
      { symbol: 'H', position: [1.16, 0.51, 0.88] },
      { symbol: 'H', position: [1.16, 0.51, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
      { a: 1, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
    ],
  },
  {
    id: 'c2h2',
    name: 'Acetylene (ethyne)',
    formula: 'C₂H₂',
    category: 'common-organic',
    geometry: 'linear',
    polar: false,
    properties: { molarMass: 26.038, state: 'gas', meltingPoint: 192.4, boilingPoint: 189.0, density: 0.001097, solubility: 'slightly soluble in water' },
    description: 'Triple bond makes this linear; oxyacetylene flame > 3000 °C.',
    atoms: [
      { symbol: 'C', position: [-0.60, 0, 0] },
      { symbol: 'C', position: [0.60, 0, 0] },
      { symbol: 'H', position: [-1.66, 0, 0] },
      { symbol: 'H', position: [1.66, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 3 },
      { a: 0, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 },
    ],
  },
  {
    id: 'c6h6',
    name: 'Benzene',
    formula: 'C₆H₆',
    category: 'common-organic',
    geometry: 'trigonal-planar',
    bondAngle: 120,
    polar: false,
    properties: { molarMass: 78.114, state: 'liquid', meltingPoint: 278.7, boilingPoint: 353.3, density: 0.8765, solubility: 'slightly soluble in water' },
    description: 'Aromatic ring with 6 delocalised π-electrons; planar, equilateral hexagon.',
    atoms: (() => {
      const a: Atom[] = []
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3
        a.push({ symbol: 'C', position: [1.40 * Math.cos(theta), 1.40 * Math.sin(theta), 0] })
      }
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3
        a.push({ symbol: 'H', position: [2.49 * Math.cos(theta), 2.49 * Math.sin(theta), 0] })
      }
      return a
    })(),
    bonds: (() => {
      const b: Bond[] = []
      for (let i = 0; i < 6; i++) b.push({ a: i, b: (i + 1) % 6, order: 2, aromatic: true })
      for (let i = 0; i < 6; i++) b.push({ a: i, b: i + 6, order: 1 })
      return b
    })(),
  },
  {
    id: 'ch3oh',
    name: 'Methanol',
    formula: 'CH₃OH',
    category: 'common-organic',
    geometry: 'tetrahedral',
    polar: true,
    properties: { molarMass: 32.042, state: 'liquid', meltingPoint: 175.6, boilingPoint: 337.7, density: 0.792, solubility: 'miscible with water' },
    description: 'Simplest alcohol; polar OH group allows hydrogen bonding.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'O', position: [1.43, 0, 0] },
      { symbol: 'H', position: [1.81, 0.97, 0] },
      { symbol: 'H', position: [-0.55, 1.02, 0] },
      { symbol: 'H', position: [-0.55, -0.51, 0.88] },
      { symbol: 'H', position: [-0.55, -0.51, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
    ],
  },
  {
    id: 'c2h5oh',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    category: 'common-organic',
    geometry: 'tetrahedral',
    polar: true,
    properties: { molarMass: 46.069, state: 'liquid', meltingPoint: 159.0, boilingPoint: 351.5, density: 0.789, solubility: 'miscible with water' },
    description: 'The alcohol in beverages; biofuel additive; polar and hydrogen-bonding.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'C', position: [1.51, 0, 0] },
      { symbol: 'O', position: [2.07, 1.24, 0] },
      { symbol: 'H', position: [1.21, 2.05, 0] },
      { symbol: 'H', position: [-0.55, 1.02, 0] },
      { symbol: 'H', position: [-0.55, -0.51, 0.88] },
      { symbol: 'H', position: [-0.55, -0.51, -0.88] },
      { symbol: 'H', position: [2.05, -0.52, 0.88] },
      { symbol: 'H', position: [2.05, -0.52, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 2, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
      { a: 0, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 1, b: 8, order: 1 },
    ],
  },
  {
    id: 'ch3cooh',
    name: 'Acetic acid',
    formula: 'CH₃COOH',
    category: 'common-organic',
    geometry: 'trigonal-planar',
    polar: true,
    properties: { molarMass: 60.052, state: 'liquid', meltingPoint: 289.8, boilingPoint: 391.0, density: 1.049, solubility: 'miscible with water' },
    description: 'Vinegar acid; weak organic acid (pKa = 4.76).',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'C', position: [1.50, 0, 0] },
      { symbol: 'O', position: [2.10, 1.05, 0] },
      { symbol: 'O', position: [2.10, -1.05, 0] },
      { symbol: 'H', position: [3.05, -1.05, 0] },
      { symbol: 'H', position: [-0.55, 1.02, 0] },
      { symbol: 'H', position: [-0.55, -0.51, 0.88] },
      { symbol: 'H', position: [-0.55, -0.51, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 2 },
      { a: 1, b: 3, order: 1 },
      { a: 3, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
      { a: 0, b: 6, order: 1 },
      { a: 0, b: 7, order: 1 },
    ],
  },
  {
    id: 'acetone',
    name: 'Acetone',
    formula: '(CH₃)₂CO',
    category: 'common-organic',
    geometry: 'trigonal-planar',
    polar: true,
    properties: { molarMass: 58.080, state: 'liquid', meltingPoint: 178.5, boilingPoint: 329.2, density: 0.7845, solubility: 'miscible with water' },
    description: 'Simplest ketone; common laboratory and industrial solvent.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'C', position: [1.52, 0, 0] },
      { symbol: 'C', position: [-1.52, 0, 0] },
      { symbol: 'O', position: [0, 1.21, 0] },
      { symbol: 'H', position: [2.06, 1.02, 0] },
      { symbol: 'H', position: [2.06, -0.51, 0.88] },
      { symbol: 'H', position: [2.06, -0.51, -0.88] },
      { symbol: 'H', position: [-2.06, 1.02, 0] },
      { symbol: 'H', position: [-2.06, -0.51, 0.88] },
      { symbol: 'H', position: [-2.06, -0.51, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 2 },
      { a: 1, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
      { a: 1, b: 6, order: 1 },
      { a: 2, b: 7, order: 1 },
      { a: 2, b: 8, order: 1 },
      { a: 2, b: 9, order: 1 },
    ],
  },
  {
    id: 'hcho',
    name: 'Formaldehyde',
    formula: 'H₂C=O',
    category: 'common-organic',
    geometry: 'trigonal-planar',
    bondAngle: 116,
    polar: true,
    properties: { molarMass: 30.026, state: 'gas', meltingPoint: 181.15, boilingPoint: 254.05, density: 0.001067, solubility: 'highly soluble in water' },
    description: 'Simplest aldehyde; used in preservation; trigonal planar around C.',
    atoms: [
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'O', position: [1.21, 0, 0] },
      { symbol: 'H', position: [-0.60, 0.94, 0] },
      { symbol: 'H', position: [-0.60, -0.94, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
    ],
  },
  {
    id: 'hcn',
    name: 'Hydrogen cyanide',
    formula: 'HCN',
    category: 'common-organic',
    geometry: 'linear',
    polar: true,
    properties: { molarMass: 27.026, state: 'liquid', meltingPoint: 259.85, boilingPoint: 298.85, density: 0.6876, solubility: 'miscible with water' },
    description: 'Linear triatomic; weak acid (pKa = 9.2); highly toxic.',
    atoms: [
      { symbol: 'H', position: [-2.05, 0, 0] },
      { symbol: 'C', position: [-0.60, 0, 0] },
      { symbol: 'N', position: [0.65, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 3 },
    ],
  },
]

// -- 3. Biochemicals --
const BIO: Molecule[] = [
  {
    id: 'glucose',
    name: 'Glucose (β-D, idealised)',
    formula: 'C₆H₁₂O₆',
    category: 'biochem',
    geometry: 'tetrahedral',
    polar: true,
    properties: { molarMass: 180.156, state: 'solid', meltingPoint: 419.15, density: 1.54, solubility: 'highly soluble in water' },
    description: 'Primary cellular fuel; pyranose ring with 5 stereocenters. Hydrogens omitted for clarity.',
    atoms: [
      { symbol: 'C', position: [1.25, 0.20, 0.20] },
      { symbol: 'C', position: [0.40, 1.40, -0.20] },
      { symbol: 'C', position: [-0.90, 1.10, -0.60] },
      { symbol: 'C', position: [-1.40, -0.30, -0.40] },
      { symbol: 'C', position: [-0.50, -1.20, 0.20] },
      { symbol: 'C', position: [-1.80, -1.30, 0.30] },
      { symbol: 'O', position: [0.80, -0.90, 0.30] },
      { symbol: 'O', position: [2.20, 0.85, 0.50] },
      { symbol: 'O', position: [0.95, 2.50, -0.55] },
      { symbol: 'O', position: [-1.65, 2.10, -1.05] },
      { symbol: 'O', position: [-2.50, -0.55, -0.85] },
      { symbol: 'O', position: [-2.50, -2.20, 0.10] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 2, b: 3, order: 1 },
      { a: 3, b: 4, order: 1 },
      { a: 4, b: 5, order: 1 },
      { a: 4, b: 6, order: 1 },
      { a: 6, b: 0, order: 1 },
      { a: 0, b: 7, order: 1 },
      { a: 1, b: 8, order: 1 },
      { a: 2, b: 9, order: 1 },
      { a: 3, b: 10, order: 1 },
      { a: 5, b: 11, order: 1 },
    ],
  },
  {
    id: 'glycine',
    name: 'Glycine',
    formula: 'C₂H₅NO₂',
    category: 'biochem',
    geometry: 'tetrahedral',
    polar: true,
    properties: { molarMass: 75.067, state: 'solid', meltingPoint: 506, density: 1.607, solubility: 'highly soluble in water' },
    description: 'Simplest amino acid; zwitterion at physiological pH. H atoms omitted.',
    atoms: [
      { symbol: 'N', position: [-1.50, -0.50, 0] },
      { symbol: 'C', position: [-0.50, 0.50, 0] },
      { symbol: 'C', position: [0.95, 0.00, 0] },
      { symbol: 'O', position: [1.40, 1.15, 0] },
      { symbol: 'O', position: [1.65, -1.10, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 2, b: 3, order: 2 },
      { a: 2, b: 4, order: 1 },
    ],
  },
]

// -- 4. Salts / ionic --
const SALT_ATOMS: Atom[] = []
const SALT_BONDS: Bond[] = []
// Build a 3×3×3 alternating Na/Cl lattice, nearest-neighbour bonds.
{
  const positions: [number, number, number][] = []
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        positions.push([i * 2.0 - 2.0, j * 2.0 - 2.0, k * 2.0 - 2.0])
  for (let i = 0; i < positions.length; i++) {
    const isNa = (Math.floor((positions[i][0] + 2) / 2) + Math.floor((positions[i][1] + 2) / 2) + Math.floor((positions[i][2] + 2) / 2)) % 2 === 0
    SALT_ATOMS.push({ symbol: isNa ? 'Na' : 'Cl', position: positions[i], charge: isNa ? 1 : -1 })
  }
  for (let i = 0; i < SALT_ATOMS.length; i++) {
    for (let j = i + 1; j < SALT_ATOMS.length; j++) {
      const dx = SALT_ATOMS[i].position[0] - SALT_ATOMS[j].position[0]
      const dy = SALT_ATOMS[i].position[1] - SALT_ATOMS[j].position[1]
      const dz = SALT_ATOMS[i].position[2] - SALT_ATOMS[j].position[2]
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (d < 1.5) SALT_BONDS.push({ a: i, b: j, order: 1 })
    }
  }
}

const SALT: Molecule[] = [
  {
    id: 'nacl',
    name: 'Sodium chloride',
    formula: 'NaCl',
    category: 'salt',
    polar: true,
    properties: { molarMass: 58.443, state: 'solid', meltingPoint: 1074, boilingPoint: 1686, density: 2.165, solubility: 'highly soluble in water (358 g/L)' },
    description: 'Ionic compound; cubic crystal lattice. Shown as discrete ion pair (gas phase).',
    atoms: [
      { symbol: 'Na', position: [-1.20, 0, 0], charge: 1 },
      { symbol: 'Cl', position: [1.20, 0, 0], charge: -1 },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: 'kcl',
    name: 'Potassium chloride',
    formula: 'KCl',
    category: 'salt',
    polar: true,
    properties: { molarMass: 74.55, state: 'solid', meltingPoint: 1044, boilingPoint: 1689, density: 1.984, solubility: 'highly soluble in water (344 g/L)' },
    description: 'Ionic salt; used as a salt substitute and fertilizer.',
    atoms: [
      { symbol: 'K', position: [-1.45, 0, 0], charge: 1 },
      { symbol: 'Cl', position: [1.45, 0, 0], charge: -1 },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: 'caco3',
    name: 'Calcium carbonate',
    formula: 'CaCO₃',
    category: 'salt',
    polar: true,
    properties: { molarMass: 100.087, state: 'solid', meltingPoint: 1170, density: 2.711, solubility: 'poorly soluble in water (Ksp ~ 3.3e-9)' },
    description: 'Limestone, marble, chalk; carbonate ion is trigonal planar.',
    atoms: [
      { symbol: 'Ca', position: [-2.00, 0, 0], charge: 2 },
      { symbol: 'C', position: [0, 0, 0] },
      { symbol: 'O', position: [0, 1.21, 0], charge: -1 },
      { symbol: 'O', position: [1.05, -0.61, 0], charge: -1 },
      { symbol: 'O', position: [-1.05, -0.61, 0], charge: -1 },
    ],
    bonds: [
      { a: 1, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
    ],
  },
  {
    id: 'nacl-crystal',
    name: 'Sodium chloride (crystal)',
    formula: 'NaCl',
    category: 'salt',
    polar: true,
    properties: { molarMass: 58.443, state: 'solid', meltingPoint: 1074, density: 2.165, solubility: 'highly soluble in water' },
    description: 'Face-centered cubic lattice; each Na⁺ surrounded by 6 Cl⁻. Shown as 27-ion cluster.',
    atoms: SALT_ATOMS,
    bonds: SALT_BONDS,
  },
  {
    id: 'h2so4',
    name: 'Sulfuric acid',
    formula: 'H₂SO₄',
    category: 'acid-base',
    geometry: 'tetrahedral',
    polar: true,
    properties: { molarMass: 98.079, state: 'liquid', meltingPoint: 283.4, boilingPoint: 611, density: 1.84, solubility: 'miscible with water' },
    description: 'Strong diprotic acid; tetrahedral S. Powerful dehydrating agent.',
    atoms: [
      { symbol: 'S', position: [0, 0, 0] },
      { symbol: 'O', position: [1.43, 0, 0] },
      { symbol: 'O', position: [-1.43, 0, 0] },
      { symbol: 'O', position: [0, 1.43, 0.50] },
      { symbol: 'O', position: [0, -1.43, 0.50] },
      { symbol: 'H', position: [0, 1.95, 1.30] },
      { symbol: 'H', position: [0, -1.95, 1.30] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 3, b: 5, order: 1 },
      { a: 4, b: 6, order: 1 },
    ],
  },
  {
    id: 'hno3',
    name: 'Nitric acid',
    formula: 'HNO₃',
    category: 'acid-base',
    geometry: 'trigonal-planar',
    polar: true,
    properties: { molarMass: 63.012, state: 'liquid', meltingPoint: 231.55, boilingPoint: 356, density: 1.51, solubility: 'miscible with water' },
    description: 'Strong monoprotic acid; powerful oxidiser.',
    atoms: [
      { symbol: 'N', position: [0, 0, 0] },
      { symbol: 'O', position: [0, 1.21, 0.50] },
      { symbol: 'O', position: [1.07, -0.61, -0.50] },
      { symbol: 'O', position: [-1.07, -0.61, -0.50] },
      { symbol: 'H', position: [0, 1.81, 1.30] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 2 },
      { a: 0, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
    ],
  },
]

export const MOLECULES: Molecule[] = [...SIMPLE, ...ORGANIC, ...BIO, ...SALT]

const MOLECULES_BY_ID: Record<string, Molecule> = Object.fromEntries(MOLECULES.map((m) => [m.id, m]))

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULES_BY_ID[id]
}

// Center a molecule at its centroid (so 3D camera frames it nicely).
export function centroid(m: Molecule): [number, number, number] {
  const c: [number, number, number] = [0, 0, 0]
  for (const a of m.atoms) {
    c[0] += a.position[0]
    c[1] += a.position[1]
    c[2] += a.position[2]
  }
  c[0] /= m.atoms.length
  c[1] /= m.atoms.length
  c[2] /= m.atoms.length
  return c
}

export const VSEPR_INFO: Record<VseprGeometry, { angle: number; shape: string; description: string }> = {
  'linear': { angle: 180, shape: 'Linear', description: '2 electron domains, 180° apart.' },
  'bent': { angle: 104.5, shape: 'Bent', description: '2 bonds + 2 lone pairs on central atom. ~104.5° (e.g. H₂O).' },
  'trigonal-planar': { angle: 120, shape: 'Trigonal planar', description: '3 bonds, no lone pairs. 120° (e.g. BF₃).' },
  'trigonal-pyramidal': { angle: 107.8, shape: 'Trigonal pyramidal', description: '3 bonds + 1 lone pair. ~107° (e.g. NH₃).' },
  'tetrahedral': { angle: 109.5, shape: 'Tetrahedral', description: '4 bonds, no lone pairs. 109.5° (e.g. CH₄).' },
  'trigonal-bipyramidal': { angle: 90, shape: 'Trigonal bipyramidal', description: '5 bonds. Two axial 90° to three equatorial (e.g. PCl₅).' },
  'octahedral': { angle: 90, shape: 'Octahedral', description: '6 bonds. All neighbours 90° apart (e.g. SF₆).' },
  'square-planar': { angle: 90, shape: 'Square planar', description: '4 bonds + 2 lone pairs. d⁸ complexes (e.g. XeF₄).' },
}
