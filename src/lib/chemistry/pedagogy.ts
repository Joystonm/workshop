// "Did you know?" notes and key takeaways shown at the bottom of each
// chemistry scene. Keyed by experiment id, then by element Z / reaction
// id / molecule id when the note is specific to a single subject.
//
// Plain prose — short, pedagogical, no jargon without context. Kept
// short so they fit on screen without truncation.

export const CONCEPT_NOTES: Record<string, string[]> = {
  // --- experiment-level "key takeaway" notes ---
  'isotopes': [
    'Isotopes share the same chemistry but differ in mass and nuclear stability.',
    'A = Z + N — the mass number counts every nucleon.',
    'Stable isotopes cluster near N ≈ Z for light elements and N > Z for heavy elements.',
  ],
  'electron-config': [
    'Electrons fill the lowest-energy subshell first (Aufbau principle).',
    'Within a subshell, electrons occupy empty orbitals before pairing (Hund\'s rule).',
    'Noble-gas shorthand: e.g. [Ne] 3s¹ for sodium, not 1s² 2s² 2p⁶ 3s¹.',
  ],
  'reaction-simulator': [
    'Mass is conserved: Σ atoms on the left equals Σ atoms on the right.',
    'Negative ΔH = exothermic (releases heat); positive ΔH = endothermic (absorbs heat).',
    'Activation energy is the barrier between reactants and products — even spontaneous reactions need a push to start.',
  ],
  'ph-scale': [
    'pH = −log[H⁺]. Each unit is a 10× change in hydrogen-ion concentration.',
    'pH 7 is neutral at 25 °C. Below is acidic; above is basic.',
    'Indicators change colour across a narrow pH range, signalling the endpoint of a reaction.',
  ],
  'titration': [
    'At equivalence, moles of acid = moles of base × the stoichiometric ratio.',
    'A strong + strong titration has pH 7 at equivalence; weak + strong is shifted away from 7.',
    'The first-derivative peak (dpH/dV) marks the equivalence point — that\'s where pH changes fastest.',
  ],
  'concentration': [
    'Molarity M = n / V — moles of solute per litre of solution.',
    'Adding solvent dilutes: same n, larger V, lower M.',
    'M₁V₁ = M₂V₂ (at constant n) is the dilution equation.',
  ],
  'molecule-builder': [
    'VSEPR theory predicts geometry from the number of electron pairs around the central atom.',
    'Bond length and angle come from experiment (X-ray diffraction, microwave spectroscopy).',
    'Polarity matters for solubility, boiling point, and biological function.',
  ],
  'molecule-viewer': [
    'Geometry around the central atom decides polarity — e.g. CO₂ is linear and non-polar; H₂O is bent and polar.',
    'Bond length decreases with bond order (single > double > triple).',
    'Compare two molecules side-by-side to see how adding lone pairs bends the geometry.',
  ],

  // --- element-specific isotopes notes ---
  'iso-1': [
    'Tritium (H-3) is used in self-illuminating exit signs; decays β⁻ with t½ = 12.3 y.',
    'Heavy water (D₂O) uses deuterium — it follows hydrogen through metabolism without the radiation.',
  ],
  'iso-6': [
    'C-14 forms in the upper atmosphere by cosmic-ray spallation and decays with t½ = 5730 y — this is radiocarbon dating.',
    'C-12 is the basis of the unified atomic mass unit; one u = 1/12 the mass of a C-12 atom.',
  ],
  'iso-7': [
    'N-15 is used as a tracer to track nitrogen in biological systems — agricultural research uses it heavily.',
  ],
  'iso-8': [
    'O-18 is a stable tracer; ratios of O-18/O-16 in ice cores record ancient temperatures.',
  ],
  'iso-11': [
    'Na-22 emits positrons; it\'s used as a positron source in PET scanner calibration.',
  ],
  'iso-17': [
    'Cl-35 and Cl-37 are both stable; their ratio is essentially constant in nature.',
  ],
  'iso-19': [
    'K-40 is a long-lived natural radioisotope (t½ = 1.25 × 10⁹ y) — K-Ar dating uses its decay to Ar-40.',
  ],
  'iso-26': [
    'Fe-56 has the highest binding energy per nucleon of any nuclide — the "most stable" nucleus in the universe.',
  ],
  'iso-29': [
    'Cu is unusual: both stable isotopes (Cu-63, Cu-65) are odd-Z. Most odd-Z elements have no stable isotopes.',
  ],
  'iso-47': [
    'Silver has two stable isotopes, roughly equally abundant — used in mass-spectrometry calibrations.',
  ],
  'iso-53': [
    'I-131 concentrates in the thyroid; a small dose treats hyperthyroidism and thyroid cancer.',
  ],
  'iso-82': [
    'Pb-208 is the heaviest stable nuclide — a "doubly magic" nucleus with closed shells of both protons and neutrons.',
  ],
  'iso-92': [
    'U-235 is fissile — a slow neutron can split it, releasing ~200 MeV of energy per fission.',
    'U-238 dominates natural uranium (99.27%) and decays to Pb-206 via a long chain.',
  ],
}

// VSEPR info keyed by geometry — used by the molecule viewer.
export interface VseprInfo {
  shape: string
  description: string
  lonePairs: number
}

export const VSEPR_INFO: Record<string, VseprInfo> = {
  linear: { shape: 'Linear', description: '2 bonding pairs, 0 lone pairs. Bond angle 180°.', lonePairs: 0 },
  bent: { shape: 'Bent', description: '2 bonding pairs, 2 lone pairs. Bond angle ≈104.5° (water).', lonePairs: 2 },
  'trigonal-planar': { shape: 'Trigonal planar', description: '3 bonding pairs, 0 lone pairs. Bond angle 120°.', lonePairs: 0 },
  'trigonal-pyramidal': { shape: 'Trigonal pyramidal', description: '3 bonding pairs, 1 lone pair. Bond angle ≈107° (ammonia).', lonePairs: 1 },
  tetrahedral: { shape: 'Tetrahedral', description: '4 bonding pairs, 0 lone pairs. Bond angle 109.5° (methane).', lonePairs: 0 },
  'trigonal-bipyramidal': { shape: 'Trigonal bipyramidal', description: '5 bonding pairs, 0 lone pairs. Bond angles 90° and 120°.', lonePairs: 0 },
  octahedral: { shape: 'Octahedral', description: '6 bonding pairs, 0 lone pairs. Bond angle 90°.', lonePairs: 0 },
  'square-planar': { shape: 'Square planar', description: '4 bonding pairs, 2 lone pairs (AX₄E₂). Bond angle 90°.', lonePairs: 2 },
}

// Pedagogical tips for specific reactions, keyed by reaction type.
export const REACTION_TIPS: Record<string, string> = {
  'acid-base': 'Strong + strong = neutral salt + water; pH 7 at equivalence.',
  combustion: 'Hydrocarbons burn in O₂ to CO₂ + H₂O, releasing lots of energy (ΔH very negative).',
  precipitation: 'Two aqueous salts combine to form an insoluble solid plus a soluble salt.',
  redox: 'Electrons transfer between species; one is oxidised, the other reduced.',
  'gas-evolution': 'A gas forms that escapes the solution — e.g. CO₂, H₂, or NH₃.',
  'single-displacement': 'A free element displaces another from a compound (more reactive wins).',
  'double-displacement': 'Two compounds swap partners; often produces a precipitate or gas.',
  synthesis: 'Two or more reactants combine into a single product.',
  decomposition: 'A single compound breaks down into two or more products (often with heat).',
  complexation: 'A metal ion binds to ligands to form a coordination complex.',
}

// Lookup helper that falls back to a generic note.
export function noteFor(experimentId: string, subjectKey?: string | number): string | undefined {
  if (subjectKey !== undefined) {
    const key = `${experimentId}-${subjectKey}`
    if (CONCEPT_NOTES[key]?.[0]) return CONCEPT_NOTES[key][0]
  }
  return CONCEPT_NOTES[experimentId]?.[0]
}
