// Workshop experiment catalog. Baked into the AI Companion's system prompt so
// the model can answer "what is this experiment?" and "how do I use it?"
// accurately without inventing parameters or measurements.
//
// Sources (kept in sync with):
//   src/lib/physics/experiments.ts + src/lib/physics/<name>.ts
//   src/lib/chemistry/experiments/*.ts
//   src/lib/space/experiments.ts
//   src/lib/cad/store.ts (single design-and-test experiment)

export interface CatalogParam {
  key: string
  label: string
  default: number | string
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: string[] // when the param is a discrete enum
}

export interface CatalogExperiment {
  id: string
  title: string
  description: string
  /** Short student-facing hint on what the experiment is "good for". */
  useCase: string
  params: CatalogParam[]
  /** Measurements emitted by the simulation, with their human meaning. */
  measurements: Array<{ key: string; meaning: string; unit?: string }>
  formulas: string[]
  notes?: string[]
}

export interface CatalogSection {
  slug: string
  title: string
  blurb: string
  experiments: CatalogExperiment[]
}

export const CATALOG: CatalogSection[] = [
  // -----------------------------------------------------------------------
  {
    slug: 'physics',
    title: 'Physics Lab',
    blurb:
      'Hands-on mechanics, oscillations, waves and fluid dynamics. Run experiments with adjustable parameters and see live numerical readouts.',
    experiments: [
      {
        id: 'pendulum',
        title: 'Pendulum',
        description: 'Damped simple pendulum.',
        useCase: 'Investigate how length, gravity, and amplitude change the period.',
        params: [
          { key: 'L', label: 'Length', default: 1.0, min: 0.2, max: 3.0, step: 0.05, unit: 'm' },
          { key: 'm', label: 'Mass', default: 1.0, min: 0.1, max: 5.0, step: 0.1, unit: 'kg' },
          { key: 'g', label: 'Gravity', default: 9.81, min: 0.5, max: 25, step: 0.1, unit: 'm/s²' },
          { key: 'b', label: 'Damping', default: 0.0, min: 0, max: 0.5, step: 0.01, unit: '1/s' },
          { key: 'theta0', label: 'Initial angle', default: 30, min: 1, max: 89, step: 1, unit: '°' },
        ],
        measurements: [
          { key: 'T_small', meaning: 'Theoretical period at small angle (s)', unit: 's' },
          { key: 'T_anharm', meaning: 'Period with anharmonic correction', unit: 's' },
          { key: 'T_measured', meaning: 'Period measured from zero-crossings', unit: 's' },
          { key: 'KE', meaning: 'Kinetic energy of the bob', unit: 'J' },
          { key: 'PE', meaning: 'Potential energy relative to lowest point', unit: 'J' },
          { key: 'E_total', meaning: 'Total mechanical energy', unit: 'J' },
          { key: 'speed', meaning: 'Speed of the bob', unit: 'm/s' },
        ],
        formulas: ['T = 2π·√(L/g)', 'T ≈ T₀·(1 + θ₀²/16)  (anharmonic correction)'],
        notes: ['Length has no effect on period when θ₀ = 0.', 'Damping gradually reduces amplitude.'],
      },
      {
        id: 'projectile',
        title: 'Projectile',
        description: 'Launch a projectile with adjustable speed, angle, gravity and air drag.',
        useCase: 'Find the launch angle that maximises range, or study how air drag shrinks it.',
        params: [
          { key: 'v0', label: 'Initial speed', default: 30, min: 1, max: 80, step: 0.5, unit: 'm/s' },
          { key: 'angle', label: 'Launch angle', default: 45, min: 1, max: 89, step: 1, unit: '°' },
          { key: 'g', label: 'Gravity', default: 9.81, min: 0.5, max: 25, step: 0.1, unit: 'm/s²' },
          { key: 'k', label: 'Air drag k', default: 0.0, min: 0, max: 0.1, step: 0.001, unit: 'kg/m' },
          { key: 'm', label: 'Mass', default: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
        ],
        measurements: [
          { key: 'range', meaning: 'Horizontal distance at landing', unit: 'm' },
          { key: 'flightTime', meaning: 'Time from launch to landing', unit: 's' },
          { key: 'maxHeight', meaning: 'Highest point reached', unit: 'm' },
        ],
        formulas: [
          'R = v₀² · sin(2θ) / g   (no drag, level ground)',
          'a = (0, -g) - (k/m)·|v|·v   (with drag)',
        ],
        notes: ['Without drag, max range is at θ = 45°.', 'Drag reduces range and shifts optimal angle below 45°.'],
      },
      {
        id: 'freefall',
        title: 'Free Fall',
        description: 'Drop multiple objects from a height. In vacuum, all masses fall together.',
        useCase: "See Galileo's experiment — heavy and light objects fall at the same rate in vacuum.",
        params: [
          { key: 'h0', label: 'Drop height', default: 50, min: 5, max: 200, step: 1, unit: 'm' },
          { key: 'g', label: 'Gravity', default: 9.81, min: 0.5, max: 25, step: 0.1, unit: 'm/s²' },
          { key: 'k', label: 'Air drag k', default: 0.0, min: 0, max: 0.1, step: 0.001, unit: 'kg/m' },
          { key: 'n', label: 'Number of objects', default: 3, min: 1, max: 5, step: 1 },
        ],
        measurements: [
          { key: 't_fall', meaning: 'Time until landing', unit: 's' },
          { key: 'v_impact', meaning: 'Speed at impact', unit: 'm/s' },
          { key: 'landed', meaning: '1 if all balls have landed, else 0' },
        ],
        formulas: ['t_fall = √(2h/g)', 'v_impact = √(2gh)'],
        notes: ['Default objects: 0.2 / 0.5 / 1.0 / 2.0 / 5.0 kg.', 'With drag, heavier objects fall faster.'],
      },
      {
        id: 'spring',
        title: 'Spring / SHM',
        description: 'Mass on a spring. Adjust k, mass, damping and initial displacement.',
        useCase: 'See simple harmonic motion and how k and m set the period.',
        params: [
          { key: 'k', label: 'Spring constant k', default: 20, min: 1, max: 100, step: 0.5, unit: 'N/m' },
          { key: 'm', label: 'Mass', default: 0.5, min: 0.1, max: 5, step: 0.1, unit: 'kg' },
          { key: 'b', label: 'Damping', default: 0.05, min: 0, max: 1.0, step: 0.01, unit: 'kg/s' },
          { key: 'x0', label: 'Initial displacement', default: 1.0, min: -1.5, max: 1.5, step: 0.05, unit: 'm' },
        ],
        measurements: [
          { key: 'T_theory', meaning: 'Theoretical period 2π√(m/k)', unit: 's' },
          { key: 'T_measured', meaning: 'Period measured from zero-crossings', unit: 's' },
          { key: 'amplitude', meaning: 'Current peak displacement', unit: 'm' },
          { key: 'E_total', meaning: 'Total mechanical energy', unit: 'J' },
        ],
        formulas: ['T = 2π·√(m/k)', 'ω = √(k/m)'],
        notes: ['Higher k or lower m → faster oscillation.'],
      },
      {
        id: 'collision',
        title: 'Collision',
        description: 'Two balls collide elastically or inelastically. Watch momentum transfer.',
        useCase: 'Explore conservation of momentum and energy across 1D and 2D collisions.',
        params: [
          { key: 'm1', label: 'Mass 1', default: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
          { key: 'm2', label: 'Mass 2', default: 2.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
          { key: 'v1x', label: 'v₁ x', default: 4.0, min: -10, max: 10, step: 0.1, unit: 'm/s' },
          { key: 'v1y', label: 'v₁ y', default: 0.0, min: -5, max: 5, step: 0.1, unit: 'm/s' },
          { key: 'v2x', label: 'v₂ x', default: -2.0, min: -10, max: 10, step: 0.1, unit: 'm/s' },
          { key: 'v2y', label: 'v₂ y', default: 0.0, min: -5, max: 5, step: 0.1, unit: 'm/s' },
          { key: 'e', label: 'Restitution', default: 1.0, min: 0, max: 1, step: 0.05 },
          { key: 'd', label: '1D/2D mode', default: 0, min: 0, max: 1, step: 1, options: ['1D', '2D'] },
        ],
        measurements: [
          { key: 'pBefore', meaning: 'Total momentum before collision', unit: 'kg·m/s' },
          { key: 'pAfter', meaning: 'Total momentum after collision', unit: 'kg·m/s' },
          { key: 'keBefore', meaning: 'Total kinetic energy before', unit: 'J' },
          { key: 'keAfter', meaning: 'Total kinetic energy after', unit: 'J' },
        ],
        formulas: ['p = m·v   (conserved)', 'KE = ½mv²  (only conserved for e = 1)'],
        notes: ['e = 1 is elastic (energy conserved); e < 1 is inelastic.'],
      },
      {
        id: 'incline',
        title: 'Inclined Plane',
        description: 'Block sliding down a ramp. Adjust angle and friction.',
        useCase: 'See how friction stops motion below a critical angle.',
        params: [
          { key: 'theta', label: 'Angle', default: 30, min: 1, max: 80, step: 1, unit: '°' },
          { key: 'mu', label: 'Friction μ', default: 0.1, min: 0, max: 1.0, step: 0.01 },
          { key: 'm', label: 'Mass', default: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
          { key: 'g', label: 'Gravity', default: 9.81, min: 0.5, max: 25, step: 0.1, unit: 'm/s²' },
        ],
        measurements: [
          { key: 'v', meaning: 'Speed along the slope', unit: 'm/s' },
          { key: 's', meaning: 'Distance travelled down the slope', unit: 'm' },
        ],
        formulas: [
          'a = g·(sinθ − μ·cosθ)',
          'Critical angle: tan(θ_c) = μ',
        ],
        notes: ['Block stays at rest when tan(θ) < μ.'],
      },
      {
        id: 'waves',
        title: 'Waves',
        description: 'Transverse wave on a string. See travelling, standing, and beat patterns.',
        useCase: 'See how two counter-propagating waves create a standing wave.',
        params: [
          { key: 'A', label: 'Amplitude', default: 0.4, min: 0, max: 1, step: 0.01, unit: 'm' },
          { key: 'lambda', label: 'Wavelength', default: 3.0, min: 0.5, max: 8, step: 0.1, unit: 'm' },
          { key: 'f', label: 'Frequency', default: 0.6, min: 0.1, max: 3, step: 0.05, unit: 'Hz' },
          { key: 'mode', label: 'Mode', default: 1, min: 0, max: 2, step: 1, options: ['travelling', 'standing', 'beats'] },
          { key: 'damping', label: 'Damping', default: 0.0, min: 0, max: 1, step: 0.01, unit: '1/s' },
        ],
        measurements: [
          { key: 'wavelength', meaning: 'Distance between two nodes', unit: 'm' },
          { key: 'frequency', meaning: 'Wave frequency', unit: 'Hz' },
        ],
        formulas: ['v = f·λ', 'y(x, t) = A·sin(kx − ωt) + A·sin(kx + ωt)'],
        notes: ['Mode 1 (standing) shows fixed nodes and antinodes.'],
      },
      {
        id: 'sound',
        title: 'Sound Waves',
        description: 'Longitudinal pressure wave in a tube.',
        useCase: 'Visualise compressions and rarefactions in a sound wave.',
        params: [
          { key: 'A', label: 'Amplitude', default: 0.4, min: 0, max: 1, step: 0.01, unit: 'Pa' },
          { key: 'f', label: 'Frequency', default: 440, min: 50, max: 2000, step: 10, unit: 'Hz' },
          { key: 'lambda', label: 'Wavelength', default: 0.78, min: 0.1, max: 4, step: 0.05, unit: 'm' },
          { key: 'v', label: 'Speed of sound', default: 343, min: 200, max: 1500, step: 10, unit: 'm/s' },
        ],
        measurements: [],
        formulas: ['p(x, t) = p₀ + A·sin(k·x − ω·t)', 'v = f·λ'],
        notes: ['Passive: the visual is driven by parameters, not by Run.'],
      },
      {
        id: 'beats',
        title: 'Beat Frequencies',
        description: 'Two close-frequency waves superpose to create a slow beat envelope.',
        useCase: 'Hear/see why two slightly-detuned instruments "beat" against each other.',
        params: [
          { key: 'f1', label: 'Frequency f₁', default: 440, min: 50, max: 1000, step: 1, unit: 'Hz' },
          { key: 'f2', label: 'Frequency f₂', default: 444, min: 50, max: 1000, step: 1, unit: 'Hz' },
          { key: 'A', label: 'Amplitude', default: 0.5, min: 0.05, max: 1, step: 0.05 },
          { key: 'window', label: 'Time window', default: 0.2, min: 0.02, max: 1, step: 0.01, unit: 's' },
        ],
        measurements: [],
        formulas: [
          'f_avg = (f₁ + f₂) / 2     (carrier)',
          'f_beat = |f₁ − f₂|        (envelope)',
        ],
        notes: ['Larger |f₁ − f₂| → faster beats.'],
      },
      {
        id: 'buoyancy',
        title: 'Buoyancy',
        description: 'Drop an object into a fluid. Compare densities to see float vs sink.',
        useCase: 'See Archimedes\' principle: float when ρ_obj < ρ_fluid, sink when ρ_obj > ρ_fluid.',
        params: [
          { key: 'rho_obj', label: 'Object density', default: 800, min: 100, max: 10000, step: 50, unit: 'kg/m³' },
          { key: 'rho_fluid', label: 'Fluid density', default: 1000, min: 100, max: 10000, step: 50, unit: 'kg/m³' },
          { key: 'V', label: 'Object volume', default: 0.02, min: 0.001, max: 0.1, step: 0.001, unit: 'm³' },
          { key: 'g', label: 'Gravity', default: 9.81, min: 0.5, max: 25, step: 0.1, unit: 'm/s²' },
          { key: 'b', label: 'Drag', default: 0.5, min: 0, max: 5, step: 0.1, unit: 'kg/s' },
        ],
        measurements: [
          { key: 'submerged', meaning: 'Fraction of object submerged (0..1)' },
          { key: 'settled', meaning: '1 when equilibrium reached' },
        ],
        formulas: [
          'F_b = ρ_fluid · V_submerged · g',
          'Floating: V_submerged / V = ρ_obj / ρ_fluid',
        ],
        notes: ['Wood (~800 kg/m³) floats on water (1000), sinks in mercury (13600).'],
      },
      {
        id: 'hooke',
        title: "Hooke's Law",
        description: 'Apply force to a spring and watch it extend. F = kx.',
        useCase: 'Verify the linear F vs x relationship and read k off the slope.',
        params: [
          { key: 'k', label: 'Spring constant k', default: 50, min: 5, max: 200, step: 1, unit: 'N/m' },
          { key: 'F', label: 'Applied force', default: 25, min: 0, max: 100, step: 0.5, unit: 'N' },
          { key: 'm', label: 'Mass', default: 1.0, min: 0.1, max: 5, step: 0.1, unit: 'kg' },
        ],
        measurements: [
          { key: 'x', meaning: 'Current extension of the spring', unit: 'm' },
          { key: 'xTarget', meaning: 'Static equilibrium extension F/k', unit: 'm' },
        ],
        formulas: ['F = k·x', 'x = F/k'],
        notes: ['Slope of F vs x line gives k.'],
      },
      {
        id: 'newton',
        title: "Newton's Second Law",
        description: "Pure Newton's 2nd law on a frictionless surface: F = m·a.",
        useCase: 'See acceleration directly proportional to F, inversely to m.',
        params: [
          { key: 'F', label: 'Net force F', default: 12, min: -50, max: 50, step: 0.5, unit: 'N' },
          { key: 'm', label: 'Mass m', default: 2.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
          { key: 'v0', label: 'Initial velocity v₀', default: 0.0, min: -5, max: 5, step: 0.1, unit: 'm/s' },
        ],
        measurements: [
          { key: 'a', meaning: 'Acceleration F/m', unit: 'm/s²' },
          { key: 'aMeasured', meaning: 'Acceleration estimated numerically', unit: 'm/s²' },
          { key: 'v', meaning: 'Current velocity', unit: 'm/s' },
        ],
        formulas: ['F = m·a', 'v(t) = v₀ + (F/m)·t'],
        notes: ['Compare aMeasured with a = F/m to confirm.'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: 'chemistry',
    title: 'Chemistry Lab',
    blurb:
      'Real elements, real reactions, real molecules. Build atomic structures, balance equations, titrate acids, and explore 3D molecular geometry.',
    experiments: [
      {
        id: 'periodic-table',
        title: 'Periodic Table',
        description: 'All 118 elements with their real properties. Click an element to inspect it.',
        useCase: 'Browse the table, hover for properties, click to inspect.',
        params: [
          { key: 'z', label: 'Selected Z', default: 6, min: 1, max: 118, step: 1 },
        ],
        measurements: [
          { key: 'z', meaning: 'Atomic number of selected element' },
          { key: 'atomic_mass', meaning: 'Atomic mass in u', unit: 'u' },
        ],
        formulas: ['A = Z + N'],
        notes: ['Click any tile to update the selected element.'],
      },
      {
        id: 'element-explorer',
        title: 'Element Explorer',
        description: 'Inspect a single element: nucleus, electron shells, and full property card.',
        useCase: 'Pick an element; see its Bohr-style shells and properties.',
        params: [
          { key: 'z', label: 'Atomic number', default: 6, min: 1, max: 118, step: 1 },
          { key: 'scale', label: 'Shell scale', default: 1.0, min: 0.4, max: 1.4, step: 0.05, unit: '×' },
          { key: 'speed', label: 'Electron speed', default: 1.0, min: 0, max: 3, step: 0.1, unit: '×' },
        ],
        measurements: [
          { key: 'z', meaning: 'Selected atomic number' },
          { key: 'kinetic_e', meaning: 'Kinetic energy sample for graph', unit: 'eV' },
        ],
        formulas: ['A = Z + N'],
      },
      {
        id: 'combine',
        title: 'Combine Elements',
        description: 'Pick two substances; the lab finds the real balanced reaction and animates it.',
        useCase: 'Drop two substances together and watch the animation of the balanced reaction.',
        params: [
          { key: 'reaction', label: 'Reaction', default: 0, min: 0, step: 1, options: ['reaction index in REACTIONS'] },
          { key: 'timeScale', label: 'Time scale', default: 1.0, min: 0.1, max: 3, step: 0.1, unit: '×' },
        ],
        measurements: [
          { key: 'reactants_remaining', meaning: 'Fraction of reactants remaining' },
        ],
        formulas: ['mass balance: Σ reactants → Σ products'],
      },
      {
        id: 'molecule-builder',
        title: 'Molecule Builder',
        description: 'Choose a molecule to see its 3D structure, geometry and properties.',
        useCase: 'Pick a molecule from the catalog, rotate it, see bonds and geometry.',
        params: [
          { key: 'molecule', label: 'Molecule', default: 3, min: 0, step: 1 },
          { key: 'rotateSpeed', label: 'Rotation', default: 0.4, min: 0, max: 2, step: 0.05, unit: '×' },
          { key: 'showLabels', label: 'Labels', default: 1, min: 0, max: 1, step: 1, options: ['off', 'on'] },
        ],
        measurements: [
          { key: 'atoms', meaning: 'Atom count' },
          { key: 'bonds', meaning: 'Bond count' },
          { key: 'molar_mass', meaning: 'Molar mass', unit: 'g/mol' },
        ],
        formulas: ['VSEPR geometry determines 3D shape'],
      },
      {
        id: 'isotopes',
        title: 'Isotopes',
        description: 'Compare isotopes of common elements. A = Z + N, half-life, and natural abundance.',
        useCase: 'Move the mass-number slider and see the nucleus update with proton/neutron counts.',
        params: [
          { key: 'z', label: 'Atomic number', default: 6, min: 1, max: 92, step: 1 },
          { key: 'A', label: 'Mass number', default: 12, min: 1, max: 240, step: 1 },
        ],
        measurements: [
          { key: 'a', meaning: 'Mass number A', unit: 'u' },
          { key: 'n', meaning: 'Neutron count N = A − Z' },
          { key: 'z', meaning: 'Proton count Z' },
        ],
        formulas: ['A = Z + N', 'N = A − Z'],
      },
      {
        id: 'electron-config',
        title: 'Electron Configuration',
        description: 'Build ground-state electron configurations shell by shell following the Aufbau rule.',
        useCase: 'Move Z, see Aufbau filling order, Hund\'s rule, Bohr rings.',
        params: [
          { key: 'z', label: 'Atomic number', default: 6, min: 1, max: 118, step: 1 },
        ],
        measurements: [
          { key: 'z', meaning: 'Atomic number' },
          { key: 'electrons', meaning: 'Total electron count (= Z)' },
        ],
        formulas: [
          'Aufbau filling order: 1s · 2s · 2p · 3s · 3p · 4s · 3d · 4p · 5s · 4d · 5p · 6s · 4f · 5d · 6p · 7s · 5f · 6d · 7p',
        ],
        notes: ['Cr (Z=24) and Cu (Z=29) have anomalous ground states.'],
      },
      {
        id: 'reaction-simulator',
        title: 'Reaction Simulator',
        description: 'Mix reactants and observe a balanced equation. Σ reactants → Σ products.',
        useCase: 'Pick a reaction, see balanced equation, ΔH, and energy diagram.',
        params: [
          { key: 'reaction', label: 'Reaction', default: 0, min: 0, step: 1 },
        ],
        measurements: [
          { key: 'dH', meaning: 'Enthalpy change ΔH', unit: 'kJ/mol' },
          { key: 'type', meaning: 'Reaction type (encoded as numeric)' },
        ],
        formulas: ['ΔH < 0 → exothermic; ΔH > 0 → endothermic'],
      },
      {
        id: 'ph-scale',
        title: 'pH Scale',
        description: 'Compare acids and bases on the pH scale. pH = −log[H⁺], pH + pOH = 14.',
        useCase: 'Switch solutions, see pH, [H⁺], indicator colour.',
        params: [
          { key: 'solution', label: 'Solution A', default: 0, min: 0, step: 1 },
          { key: 'compare', label: 'A/B compare', default: 0, min: 0, max: 1, step: 1, options: ['off', 'on'] },
          { key: 'solutionB', label: 'Solution B', default: 0, min: 0, step: 1 },
        ],
        measurements: [
          { key: 'pH', meaning: 'pH of solution A' },
          { key: 'h_conc', meaning: '[H⁺] of A', unit: 'mol/L' },
        ],
        formulas: ['pH = −log₁₀[H⁺]', 'pH + pOH = 14'],
      },
      {
        id: 'titration',
        title: 'Titration',
        description: 'Titrate an acid with a base; find the equivalence point. M_aV_a = M_bV_b.',
        useCase: 'Add titrant, watch pH jump at equivalence, identify endpoint with indicator.',
        params: [
          { key: 'pair', label: 'Acid / base pair', default: 0, min: 0, max: 3, step: 1 },
          { key: 'Va', label: 'V_analyte', default: 25, min: 5, max: 100, step: 1, unit: 'mL' },
          { key: 'Vb', label: 'V_titrant added', default: 0, min: 0, max: 100, step: 0.05, unit: 'mL' },
          { key: 'indicator', label: 'Indicator', default: 3, min: 0, max: 3, step: 1 },
        ],
        measurements: [
          { key: 'Vb', meaning: 'Volume of titrant added', unit: 'mL' },
          { key: 'pH', meaning: 'pH at current Vb' },
          { key: 'Veq', meaning: 'Equivalence-point volume', unit: 'mL' },
        ],
        formulas: ['M_a · V_a = M_b · V_b', 'pH = pKa + log([A⁻]/[HA])  (weak-acid buffer)'],
        notes: ['Strong-strong: equivalence pH = 7.', 'Weak-acid + strong-base: equivalence pH > 7.'],
      },
      {
        id: 'concentration',
        title: 'Concentration',
        description: 'Adjust solute and solvent; read molarity. M = n / V.',
        useCase: 'Pick a solute, set moles and volume, read molarity.',
        params: [
          { key: 'solute', label: 'Solute', default: 0, min: 0, max: 6, step: 1 },
          { key: 'n', label: 'Moles of solute', default: 0.5, min: 0, max: 2, step: 0.01, unit: 'mol' },
          { key: 'V', label: 'Volume of solution', default: 0.5, min: 0.05, max: 0.5, step: 0.005, unit: 'L' },
        ],
        measurements: [
          { key: 'molarity', meaning: 'M = n / V', unit: 'mol/L' },
          { key: 'n', meaning: 'Moles', unit: 'mol' },
        ],
        formulas: ['M = n / V', 'Dilution: M₁V₁ = M₂V₂'],
      },
      {
        id: 'molecule-viewer',
        title: 'Molecule Viewer',
        description: 'Rotate, zoom, and inspect molecular geometry.',
        useCase: 'Inspect a 3D molecule with bond lengths and angles; compare A/B.',
        params: [
          { key: 'molecule', label: 'Molecule A', default: 3, min: 0, step: 1 },
          { key: 'rotateSpeed', label: 'Auto-rotate', default: 0.15, min: 0, max: 1.5, step: 0.05, unit: '×' },
          { key: 'showLabels', label: 'Atom labels', default: 1, min: 0, max: 1, step: 1, options: ['off', 'on'] },
          { key: 'showBondLengths', label: 'Bond lengths', default: 0, min: 0, max: 1, step: 1, options: ['off', 'on'] },
          { key: 'compareMode', label: 'A/B compare', default: 0, min: 0, max: 1, step: 1, options: ['off', 'on'] },
          { key: 'moleculeB', label: 'Molecule B', default: 0, min: 0, step: 1 },
        ],
        measurements: [
          { key: 'atoms', meaning: 'Atom count of A' },
          { key: 'bonds', meaning: 'Bond count of A' },
          { key: 'molar_mass', meaning: 'Molar mass of A', unit: 'g/mol' },
        ],
        formulas: ['VSEPR geometry determines 3D shape'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: 'cad',
    title: 'CAD Workshop',
    blurb:
      'Design 3D structures with primitives, beams, and channels. Inspect them from any angle.',
    experiments: [
      {
        id: 'cad-design',
        title: 'Structural Design & Test',
        description: 'Build a 3D structure out of primitives (boxes, beams, I-beams, etc.) and save/load it as JSON.',
        useCase: 'Compose a structure in the viewport, optionally run a load test from the store.',
        params: [
          { key: 'activeTool', label: 'Active tool', default: 'select', options: ['select', 'move', 'rotate', 'scale'] },
          { key: 'selectedCount', label: 'Selected objects', default: 0, min: 0 },
          { key: 'testLoad', label: 'Applied load', default: 0, min: 0, max: 10000, step: 50, unit: 'N' },
          { key: 'testResult', label: 'Test status', default: 'idle', options: ['idle', 'testing', 'success', 'failure'] },
        ],
        measurements: [
          { key: 'nObjects', meaning: 'Total primitive count in the document' },
          { key: 'primitiveCounts', meaning: 'Per-kind count (e.g. {beam: 4, plate: 1})' },
        ],
        formulas: [
          'σ = F / A   (axial stress)',
          'ε = ΔL / L  (strain)',
          'E = σ / ε   (Young\'s modulus)',
          'M = ρ · V   (mass)',
        ],
        notes: [
          'Tool shelf: V/G/R/S for select/move/rotate/scale; 1-5 for view presets.',
          'New: blank document. Save: download JSON. Load: upload JSON.',
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: 'climate',
    title: 'Earth & Climate Lab',
    blurb:
      'Live data from free public APIs: Open-Meteo (forecast, air-quality, marine, historical), USGS (earthquakes), NASA (APOD, EPIC, POWER). Every number shown is real.',
    experiments: [
      {
        id: 'weather',
        title: 'Live Weather',
        description: 'Current temperature, humidity, wind, pressure and a 7-day forecast for any city.',
        useCase: 'Compare weather between cities; check apparent temperature vs measured.',
        params: [
          { key: 'preset', label: 'City', default: 'miami', options: ['miami','tokyo','london','reykjavik','sahara','mumbai','antarctica','arctic','gulf-of-mexico','s-pacific-gyre','pacific-ring','sydney','delhi','beijing','lagos'] },
        ],
        measurements: [
          { key: 'temperature_2m', meaning: 'Current air temperature 2m above ground', unit: '°C' },
          { key: 'apparent_temperature', meaning: 'Wind-chill / heat-index adjusted T', unit: '°C' },
          { key: 'relative_humidity_2m', meaning: 'Relative humidity', unit: '%' },
          { key: 'wind_speed_10m', meaning: '10m wind speed', unit: 'km/h' },
          { key: 'pressure_msl', meaning: 'Mean-sea-level pressure', unit: 'hPa' },
          { key: 'cloud_cover', meaning: 'Total cloud cover', unit: '%' },
          { key: 'precipitation', meaning: 'Current precipitation', unit: 'mm' },
        ],
        formulas: [
          'Apparent T combines T, wind, humidity via the Steadman/NOAA formula',
        ],
        notes: ['Source: Open-Meteo /v1/forecast (no key, CORS-enabled).'],
      },
      {
        id: 'air-quality',
        title: 'Air Quality',
        description: 'PM2.5, PM10, O3, NO2, SO2, CO and the European/US AQI for the next 7 days.',
        useCase: 'Check whether today is safe for outdoor exercise at a chosen city.',
        params: [
          { key: 'preset', label: 'City', default: 'delhi', options: ['delhi','beijing','london','mumbai','lagos','tokyo','sydney','reykjavik'] },
        ],
        measurements: [
          { key: 'pm2_5', meaning: 'PM2.5 fine particulate', unit: 'µg/m³' },
          { key: 'pm10', meaning: 'PM10 coarse particulate', unit: 'µg/m³' },
          { key: 'ozone', meaning: 'O3', unit: 'µg/m³' },
          { key: 'nitrogen_dioxide', meaning: 'NO2', unit: 'µg/m³' },
          { key: 'sulphur_dioxide', meaning: 'SO2', unit: 'µg/m³' },
          { key: 'carbon_monoxide', meaning: 'CO', unit: 'µg/m³' },
          { key: 'european_aqi', meaning: 'European AQI (0-100+)' },
          { key: 'us_aqi', meaning: 'US EPA AQI' },
        ],
        formulas: [
          'EU AQI: piecewise linear mapping per pollutant, then overall = max',
        ],
        notes: ['Source: Open-Meteo /v1/air-quality (no key).'],
      },
      {
        id: 'earthquakes',
        title: 'Earthquakes',
        description: 'Recent significant earthquakes worldwide from the USGS FDSN feed.',
        useCase: 'See where the Earth is shaking right now and how magnitude scales with depth.',
        params: [
          { key: 'minMagnitude', label: 'Minimum magnitude', default: 4.5, min: 3, max: 8, step: 0.1 },
        ],
        measurements: [
          { key: 'count', meaning: 'Events returned' },
          { key: 'maxMag', meaning: 'Largest magnitude in the window' },
          { key: 'avgDepth', meaning: 'Average depth', unit: 'km' },
          { key: 'mostRecent', meaning: 'Age of most recent event', unit: 'time' },
        ],
        formulas: [
          'M = (2/3) · (log10(E) − 9.1)  (Richter-style magnitude from energy)',
        ],
        notes: ['Source: USGS Earthquake Hazards Program FDSN feed (no key).'],
      },
      {
        id: 'ocean',
        title: 'Ocean & Waves',
        description: 'Wave height, sea-surface temperature and ocean current at any ocean point.',
        useCase: 'Check surf conditions or compare tropical vs polar sea-surface T.',
        params: [
          { key: 'preset', label: 'Ocean point', default: 'gulf-of-mexico', options: ['gulf-of-mexico','s-pacific-gyre','pacific-ring','antarctica','arctic'] },
        ],
        measurements: [
          { key: 'wave_height', meaning: 'Significant wave height', unit: 'm' },
          { key: 'wave_direction', meaning: 'Dominant wave direction', unit: '°' },
          { key: 'sea_surface_temperature', meaning: 'Sea-surface T', unit: '°C' },
          { key: 'ocean_current_velocity', meaning: 'Surface current speed', unit: 'm/s' },
          { key: 'ocean_current_direction', meaning: 'Current direction', unit: '°' },
        ],
        formulas: [
          'Wave height H_s ≈ 4σ  (significant height ≈ 4·std-dev of surface elevation)',
        ],
        notes: ['Source: Open-Meteo /v1/marine (no key).'],
      },
      {
        id: 'climate-trends',
        title: 'Climate Trends',
        description: 'Annual mean temperature and precipitation over the last decades at any city.',
        useCase: 'See the warming trend at a city of your choice.',
        params: [
          { key: 'preset', label: 'City', default: 'reykjavik', options: ['reykjavik','tokyo','miami','london','delhi','beijing','lagos','sydney','antarctica'] },
          { key: 'years', label: 'Years observed', default: 30, min: 10, max: 60, step: 5 },
        ],
        measurements: [
          { key: 't_mean_first', meaning: 'Mean T at start of window', unit: '°C' },
          { key: 't_mean_last', meaning: 'Mean T at end of window', unit: '°C' },
          { key: 'trend', meaning: 'Decadal trend', unit: '°C/decade' },
        ],
        formulas: [
          'Trend = (T_last − T_first) / (years − 1) · 10',
        ],
        notes: ['Source: Open-Meteo /v1/archive ERA5 (no key).'],
      },
      {
        id: 'solar-power',
        title: 'Solar Power',
        description: 'Daily solar irradiance, temperature and humidity at any location for the last 30 days.',
        useCase: 'Estimate PV yield at a candidate location; see how cloud/season cuts output.',
        params: [
          { key: 'preset', label: 'Location', default: 'sahara', options: ['sahara','miami','tokyo','london','reykjavik','sydney','mumbai','beijing'] },
        ],
        measurements: [
          { key: 'avg_irradiance', meaning: 'Mean daily all-sky shortwave', unit: 'kWh/m²/d' },
          { key: 'peak_irradiance', meaning: 'Peak daily irradiance', unit: 'kWh/m²/d' },
          { key: 'avg_temp', meaning: 'Mean air T', unit: '°C' },
          { key: 'avg_rh', meaning: 'Mean relative humidity', unit: '%' },
        ],
        formulas: [
          '1 kWh/m² = 3.6 MJ/m²',
          'PV yield ≈ G · η · A · PR  (G=irradiance, η=efficiency, A=area, PR=performance ratio)',
        ],
        notes: ['Source: NASA POWER power.larc.nasa.gov (no key required).'],
      },
      {
        id: 'todays-earth',
        title: "Today's Earth",
        description: "DSCOVR's daily natural-colour image of Earth from ~1.5 million km away.",
        useCase: 'Look at our planet from space on the day the satellite photographed it.',
        params: [],
        measurements: [
          { key: 'caption', meaning: 'NASA caption for the latest EPIC image' },
          { key: 'centroid_lat', meaning: 'Sub-spacecraft latitude centroid', unit: '°' },
          { key: 'centroid_lon', meaning: 'Sub-spacecraft longitude centroid', unit: '°' },
        ],
        formulas: [],
        notes: ['Source: NASA EPIC /EPIC/api/natural/images (DEMO_KEY).'],
      },
      {
        id: 'astronomy-photo',
        title: 'Astronomy Picture of the Day',
        description: "NASA's daily APOD with title, full-resolution image, and explanation.",
        useCase: 'Read and discuss the explanation of a fresh astronomical image each day.',
        params: [],
        measurements: [
          { key: 'title', meaning: 'APOD title' },
          { key: 'date', meaning: 'APOD date' },
          { key: 'media_type', meaning: '"image" or "video"' },
        ],
        formulas: [],
        notes: ['Source: NASA APOD /planetary/apod (DEMO_KEY).'],
      },
      {
        id: 'solar-system',
        title: 'Solar System',
        description: 'Live Newtonian simulation of the Sun + 8 planets + Pluto on their real orbits.',
        useCase: 'Watch planets move at different speeds; verify Kepler\'s 3rd law (T² ∝ a³).',
        params: [
          { key: 'timeScale', label: 'Time speed (sim-days per real second)', default: 2.0, min: 0, max: 50, step: 0.5, unit: 'd/s' },
        ],
        measurements: [
          { key: 'sim_years_elapsed', meaning: 'Sim years since reset', unit: 'yr' },
          { key: 'earth_angle_deg', meaning: 'Earth\'s current angle from +x axis', unit: '°' },
          { key: 'earth_distance_au', meaning: 'Earth\'s current distance from the Sun', unit: 'AU' },
          { key: 'earth_period_days', meaning: 'Keplerian period of Earth', unit: 'd' },
          { key: 'jupiter_period_yr', meaning: 'Keplerian period of Jupiter', unit: 'yr' },
          { key: 'mercury_period_days', meaning: 'Keplerian period of Mercury', unit: 'd' },
          { key: 'mars_period_days', meaning: 'Keplerian period of Mars', unit: 'd' },
          { key: 'focus_planet', meaning: 'Currently focused planet (highlighted on canvas)' },
          { key: 'view', meaning: 'Current view mode: all / inner / outer' },
        ],
        formulas: [
          'F = G·m₁·m₂ / r²   (Newton\'s law)',
          'T² = 4π²a³ / (GM)  (Kepler\'s 3rd)',
        ],
        notes: [
          'All distances in AU; rendering uses log-scale so Mercury (0.387 AU) and Neptune (30 AU) are visible together.',
          'Sun stays at the origin; planets initialised on +x axis with circular-orbit speed.',
          'Measured Earth period is the rolling mean of the last N orbital crossings — should agree with Kepler\'s 3rd to within integrator drift.',
        ],
      },
      {
        id: 'gravity',
        title: 'Gravity & Free Fall',
        description: 'Drop an object on Earth, Moon, Mars, Jupiter or the Sun and watch it fall.',
        useCase: 'Compare surface gravity, fall time and impact speed across bodies.',
        params: [
          { key: 'body', label: 'Body', default: 'Earth', options: ['Moon', 'Mars', 'Earth', 'Jupiter', 'Sun'] },
          { key: 'drop_height_m', label: 'Drop height', default: 1000, min: 10, max: 100000, step: 10, unit: 'm' },
          { key: 'timeScale', label: 'Time ×', default: 1.0, min: 0.1, max: 5, step: 0.1, unit: '×' },
        ],
        measurements: [
          { key: 'body_A', meaning: 'Scenario A primary body' },
          { key: 'body_B', meaning: 'Scenario B primary body' },
          { key: 'g_A', meaning: 'Surface gravity on scenario A body', unit: 'm/s²' },
          { key: 'g_B', meaning: 'Surface gravity on scenario B body', unit: 'm/s²' },
          { key: 't_A_theory', meaning: 'Closed-form fall time for scenario A √(2h/g)', unit: 's' },
          { key: 't_B_theory', meaning: 'Closed-form fall time for scenario B √(2h/g)', unit: 's' },
          { key: 'v_A_theory', meaning: 'Closed-form impact speed for scenario A √(2gh)', unit: 'm/s' },
          { key: 'v_B_theory', meaning: 'Closed-form impact speed for scenario B √(2gh)', unit: 'm/s' },
          { key: 'drag_on', meaning: 'Whether atmospheric drag is enabled (0 or 1)' },
        ],
        formulas: [
          't_fall = √(2h / g)',
          'v_impact = √(2·g·h)',
          'g = G·M / r²',
          'F_drag = −k·v²',
        ],
        notes: [
          'Two scenarios (A and B) run side-by-side; compare same height on different worlds, or different heights on the same world.',
          'Atmospheric drag is quadratic (F = −k·v²). Drag coefficients are calibrated so Earth feels notable drag but the Moon and Mars do not.',
          'Measured impact time records the first frame the projectile crosses the surface — should match closed-form within one timestep when drag is off.',
          'Sun is included for an extreme reference point (g ≈ 274 m/s²).',
        ],
      },
      {
        id: 'tides',
        title: 'Moon & Tides',
        description: 'Earth–Moon–Sun tidal animation with adjustable lunar distance and solar strength.',
        useCase: 'See how the Moon dominates tides and why spring tides happen on alignment.',
        params: [
          { key: 'moon_distance_earth_radii', label: 'Moon distance', default: 60, min: 30, max: 100, step: 1, unit: 'R⊕' },
          { key: 'sun_strength', label: 'Solar tide strength', default: 0.46, min: 0, max: 1, step: 0.01, unit: '×' },
          { key: 'timeScale', label: 'Time ×', default: 50, min: 1, max: 200, step: 1, unit: '×' },
        ],
        measurements: [
          { key: 'moon_distance_earth_radii', meaning: 'Moon distance in Earth radii', unit: 'R⊕' },
          { key: 'sun_strength', meaning: 'Solar tide strength multiplier', unit: '×' },
          { key: 'moon_period_days', meaning: 'Sidereal month derived from current lunar distance', unit: 'd' },
          { key: 'lunar_solar_ratio', meaning: 'Lunar vs solar tidal force ratio (real ≈ 2.2)' },
          { key: 'moon_phase_deg', meaning: 'Moon\'s angle from +x axis (phase angle)', unit: '°' },
          { key: 'sun_moon_earth_deg', meaning: 'Sun-Moon-Earth alignment angle — drives spring vs neap', unit: '°' },
          { key: 'spring_factor', meaning: 'Spring factor 0.5..1.0 — 1 at syzygy, 0.5 at quadrature' },
          { key: 'lunar_tide_force', meaning: 'Differential lunar tide magnitude', unit: 'N (proxy)' },
          { key: 'solar_tide_force', meaning: 'Differential solar tide magnitude', unit: 'N (proxy)' },
        ],
        formulas: [
          'F_tide ∝ M / r³   (differential pull on a thin ocean shell)',
          'T² = 4π²a³ / (GM)  (sidereal month from orbital radius)',
          'spring = ½(1 + cos Δ) where Δ is the Sun–Moon–Earth angle',
        ],
        notes: [
          'Real value at 60 R⊕ is L/S ≈ 2.2.',
          'Sun is held fixed at 1 AU; its strength is a multiplier on solar mass for visualisation.',
          'Spring tides occur near full/new moon (Sun-Moon-Earth ≈ 0°); neap tides at first/third quarter (≈ 90°).',
          'Real-world M2 lunar semi-diurnal amplitude is ~38 cm; S2 solar is ~19 cm — the 24 h cycle chart visualises both superimposed.',
        ],
      },
    ],
  },
]

/** Flat list of all experiments across sections, for fast lookup. */
export const CATALOG_BY_ID: Record<string, { section: string; exp: CatalogExperiment }> = (() => {
  const out: Record<string, { section: string; exp: CatalogExperiment }> = {}
  for (const section of CATALOG) {
    for (const exp of section.experiments) {
      out[exp.id] = { section: section.slug, exp }
    }
  }
  return out
})()

/**
 * Format the catalog as a string for inclusion in the system prompt. Kept
 * compact so we don't blow up the prompt context — the LLM uses it for
 * general knowledge, not for verbatim citation.
 */
export function catalogForPrompt(): string {
  const lines: string[] = ['WORKSHOP CATALOG', '================', '']
  for (const section of CATALOG) {
    lines.push(`### ${section.title} (/${section.slug})`)
    lines.push(section.blurb)
    lines.push('')
    for (const exp of section.experiments) {
      lines.push(`- ${exp.id} — ${exp.title}: ${exp.description}`)
      lines.push(`    Use case: ${exp.useCase}`)
      if (exp.params.length) {
        lines.push(`    Params: ${exp.params.map((p) => p.label).join(', ')}`)
      }
      if (exp.measurements.length) {
        lines.push(`    Measures: ${exp.measurements.map((m) => `${m.key}=${m.meaning}`).join('; ')}`)
      }
      if (exp.formulas.length) {
        lines.push(`    Formulas: ${exp.formulas.join(' | ')}`)
      }
      if (exp.notes?.length) {
        lines.push(`    Notes: ${exp.notes.join(' ')}`)
      }
    }
    lines.push('')
  }
  return lines.join('\n')
}
