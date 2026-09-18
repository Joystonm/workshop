// Isotopes of the common elements. Real data — the textbook isotopes that
// show up in any intro-chemistry problem set plus a few extras where the
// nuclide list is well-known (e.g. uranium).
//
// An isotope is identified by its mass number A = Z + N. We list each one
// with its natural abundance and (for unstable isotopes) a half-life so
// the panel can flag stable vs. radioactive.
//
// Sources: IUPAC, NNDC (National Nuclear Data Center), standard periodic
// table references.

export type DecayMode = 'stable' | 'beta-' | 'beta+' | 'alpha' | 'electron-capture' | 'gamma'

export interface Isotope {
  // Proton count — same as the element Z this isotope belongs to.
  // Optional in raw records; getIsotopes(z) injects it from the lookup key
  // so isotope records are self-describing without an external call.
  z?: number
  // Mass number A (total nucleons)
  a: number
  // Half-life. "Stable" for non-radioactive isotopes, otherwise a string
  // like "5730 y" (years), "5.27 y", "24.1 d" (days), "8.02 d", "4.2 min",
  // "1.6 ms", etc.
  halfLife: string
  // Natural percent abundance on Earth (0–100). Synthetic isotopes are 0.
  abundance: number
  // Decay mode. "stable" for non-radioactive isotopes; otherwise the dominant
  // decay channel (β⁻ for most light/medium-weight radioisotopes, α for the
  // heaviest). Defaults to 'stable' when absent.
  decay?: DecayMode
  // One-line notes — e.g. "used in carbon dating" or "fissile".
  note?: string
}

// Default decay mode based on halfLife + Z. Stable nuclides have no decay;
// everything else defaults to β⁻ (most common by far). Heavy Z naturally
// lean toward α. The hard-coded `decay` field above overrides this lookup.
export function decayMode(iso: Isotope): DecayMode {
  if (iso.halfLife === 'Stable') return 'stable'
  if (iso.decay) return iso.decay
  const z = iso.z ?? 0
  if (z >= 84) return 'alpha'
  return 'beta-'
}

// Indexed by atomic number Z. Conservative, well-known isotope sets — we
// don't try to enumerate every known nuclide, just the ones that appear
// in a typical chemistry classroom plus a handful of high-impact ones.
export const ISOTOPES_BY_Z: Record<number, Isotope[]> = {
  1: [
    { a: 1, halfLife: 'Stable', abundance: 99.985, note: 'Protium — the common hydrogen.' },
    { a: 2, halfLife: 'Stable', abundance: 0.015, note: 'Deuterium — heavy hydrogen, used in NMR.' },
    { a: 3, halfLife: '12.32 y', abundance: 0, decay: 'beta-', note: 'Tritium — used in self-illuminating exit signs.' },
  ],
  2: [
    { a: 3, halfLife: 'Stable', abundance: 0.000137, note: 'Light helium, primordial.' },
    { a: 4, halfLife: 'Stable', abundance: 99.999863, note: 'Common helium, from alpha decay.' },
  ],
  6: [
    { a: 12, halfLife: 'Stable', abundance: 98.93, note: 'Basis of the unified atomic mass unit.' },
    { a: 13, halfLife: 'Stable', abundance: 1.07, note: 'Used in ¹³C NMR spectroscopy.' },
    { a: 14, halfLife: '5730 y', abundance: 0, decay: 'beta-', note: 'Radiocarbon — used in dating.' },
  ],
  7: [
    { a: 13, halfLife: '9.97 min', abundance: 0, decay: 'beta+', note: 'Synthetic.' },
    { a: 14, halfLife: 'Stable', abundance: 99.636, note: 'Dominant nitrogen isotope.' },
    { a: 15, halfLife: 'Stable', abundance: 0.364, note: 'Used as a tracer in biology.' },
  ],
  8: [
    { a: 16, halfLife: 'Stable', abundance: 99.757, note: 'Common oxygen.' },
    { a: 17, halfLife: 'Stable', abundance: 0.038, note: 'Spin 5/2 — used in NMR.' },
    { a: 18, halfLife: 'Stable', abundance: 0.205, note: 'Heavy oxygen; used as a tracer.' },
  ],
  11: [
    { a: 22, halfLife: '2.602 y', abundance: 0, decay: 'beta+', note: 'Positron emitter; used in PET scans.' },
    { a: 23, halfLife: 'Stable', abundance: 100, note: 'The only stable sodium nuclide.' },
    { a: 24, halfLife: '14.96 h', abundance: 0, decay: 'beta-', note: 'Beta emitter; tracer isotope.' },
  ],
  17: [
    { a: 35, halfLife: 'Stable', abundance: 75.76, note: 'Dominant chlorine.' },
    { a: 37, halfLife: 'Stable', abundance: 24.24, note: 'Used in NMR.' },
  ],
  19: [
    { a: 39, halfLife: 'Stable', abundance: 93.258, note: 'Common potassium.' },
    { a: 40, halfLife: '1.248e9 y', abundance: 0.0117, decay: 'beta-', note: 'Used in K-Ar dating.' },
    { a: 41, halfLife: 'Stable', abundance: 6.730, note: '' },
  ],
  26: [
    { a: 54, halfLife: 'Stable', abundance: 5.845, note: '' },
    { a: 56, halfLife: 'Stable', abundance: 91.754, note: 'Most abundant iron.' },
    { a: 57, halfLife: 'Stable', abundance: 2.119, note: 'Mössbauer spectroscopy.' },
    { a: 58, halfLife: 'Stable', abundance: 0.282, note: '' },
    { a: 59, halfLife: '44.5 d', abundance: 0, decay: 'beta-', note: 'Tracer in biochemistry.' },
  ],
  29: [
    { a: 63, halfLife: 'Stable', abundance: 69.15, note: '' },
    { a: 65, halfLife: 'Stable', abundance: 30.85, note: '' },
  ],
  47: [
    { a: 107, halfLife: 'Stable', abundance: 51.839, note: '' },
    { a: 109, halfLife: 'Stable', abundance: 48.161, note: '' },
  ],
  53: [
    { a: 127, halfLife: 'Stable', abundance: 100, note: 'Only stable iodine nuclide.' },
    { a: 129, halfLife: '1.57e7 y', abundance: 0, decay: 'beta-', note: 'Fission product; long-lived.' },
    { a: 131, halfLife: '8.02 d', abundance: 0, decay: 'beta-', note: 'Medical — thyroid therapy.' },
  ],
  82: [
    { a: 204, halfLife: 'Stable', abundance: 1.4, note: '' },
    { a: 206, halfLife: 'Stable', abundance: 24.1, note: 'End of the U-238 chain.' },
    { a: 207, halfLife: 'Stable', abundance: 22.1, note: 'End of the U-235 chain.' },
    { a: 208, halfLife: 'Stable', abundance: 52.4, note: 'Most abundant lead.' },
  ],
  92: [
    { a: 233, halfLife: '1.59e5 y', abundance: 0, decay: 'alpha', note: 'Fertile.' },
    { a: 234, halfLife: '2.45e5 y', abundance: 0.0055, decay: 'alpha', note: 'Trace natural.' },
    { a: 235, halfLife: '7.04e8 y', abundance: 0.720, decay: 'alpha', note: 'Fissile — used in reactors.' },
    { a: 238, halfLife: '4.47e9 y', abundance: 99.274, decay: 'alpha', note: 'Most abundant uranium.' },
  ],
}

// Default Z for the slider — Carbon is the textbook example.
export const DEFAULT_ISOTOPE_Z = 6

export function getIsotopes(z: number): Isotope[] {
  const list = ISOTOPES_BY_Z[z] ?? []
  return list.map((iso) => ({ ...iso, z }))
}

export function getDefaultIsotope(z: number): Isotope | null {
  const list = getIsotopes(z)
  // Prefer the most abundant stable one.
  const stable = list.find((i) => i.halfLife === 'Stable')
  if (stable) return stable
  return list[0] ?? null
}
