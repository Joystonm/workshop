// Structural Simulation Engine
// Simplified educational FEA-like simulation

import { CADObject, MaterialType, CADMaterial, StructuralTestResult } from './types'
import { getBoundingBox, getObjectVolume } from './geometry'

// Material properties for simulation
interface MaterialProperties {
  youngsModulus: number  // GPa
  yieldStrength: number   // MPa
  density: number         // kg/m³
  maxStrain: number       // dimensionless
}

const MATERIAL_PROPERTIES: Record<MaterialType, MaterialProperties> = {
  steel:    { youngsModulus: 200,  yieldStrength: 250,  density: 7850, maxStrain: 0.002 },
  aluminum: { youngsModulus: 70,   yieldStrength: 270,  density: 2700, maxStrain: 0.003 },
  copper:   { youngsModulus: 110,  yieldStrength: 33,   density: 8960, maxStrain: 0.003 },
  plastic:  { youngsModulus: 2.5,   yieldStrength: 50,   density: 1200, maxStrain: 0.01 },
  wood:     { youngsModulus: 12,   yieldStrength: 40,   density: 600,  maxStrain: 0.005 },
  glass:    { youngsModulus: 70,   yieldStrength: 50,   density: 2500, maxStrain: 0.001 },
  rubber:   { youngsModulus: 0.01, yieldStrength: 10,   density: 1100, maxStrain: 0.5 },
  concrete: { youngsModulus: 30,    yieldStrength: 3,    density: 2400, maxStrain: 0.0005 },
}

interface LoadCase {
  load: number           // N (Newtons)
  position: { x: number, y: number, z: number }
  direction: { x: number, y: number, z: number }
}

interface SupportCase {
  type: 'fixed' | 'pinned' | 'roller'
  position: { x: number, y: number, z: number }
}

// Calculate cross-sectional moment of inertia for beam-like structures
function calculateMomentOfInertia(obj: CADObject): number {
  const bbox = getBoundingBox(obj)
  const w = bbox.x / 1000  // Convert mm to m
  const h = bbox.y / 1000
  const d = bbox.z / 1000

  // For a rectangular cross-section
  return (w * h * h * h) / 12
}

// Calculate section modulus
function calculateSectionModulus(obj: CADObject): number {
  const bbox = getBoundingBox(obj)
  const w = bbox.x / 1000
  const h = bbox.y / 1000

  // For rectangular section: Z = I / (h/2) = bh²/6
  return (w * h * h) / 6
}

// Calculate effective length based on object dimensions and support conditions
function calculateEffectiveLength(obj: CADObject): number {
  const bbox = getBoundingBox(obj)
  const length = Math.max(bbox.x, bbox.y, bbox.z) / 1000  // Convert to meters

  // Assume simply supported beam with length = effective length
  return length
}

// Calculate buckling load using Euler's formula
function calculateBucklingLoad(obj: CADObject, material: MaterialProperties): number {
  const I = calculateMomentOfInertia(obj)
  const L = calculateEffectiveLength(obj)
  const E = material.youngsModulus * 1e9  // Convert GPa to Pa
  const K = 1.0  // Effective length factor (pinned-pinned)

  // Euler's buckling load: Pcr = π²EI / (KL)²
  return (Math.PI * Math.PI * E * I) / ((K * L) * (K * L))
}

// Calculate bending stress from load
function calculateBendingStress(load: number, sectionModulus: number): number {
  // σ = M / Z = F * L / (2 * Z) for simply supported beam with central load
  // Simplified: σ = F / A * L / Z
  return load / sectionModulus
}

// Calculate deflection using beam theory
function calculateDeflection(
  load: number,
  length: number,
  E: number,
  I: number
): number {
  // For simply supported beam with central point load:
  // δ = PL³ / (48EI)
  return (load * Math.pow(length, 3)) / (48 * E * I)
}

// Main structural analysis function
export function analyzeStructure(
  objects: CADObject[],
  loadCase: LoadCase,
  supportCase: SupportCase
): StructuralTestResult {
  if (objects.length === 0) {
    return {
      objectId: '',
      load: loadCase.load,
      maxDisplacement: 0,
      stress: 0,
      passed: true,
    }
  }

  // Combine all objects into one analysis
  // For simplicity, analyze each object separately and find the weakest

  let worstResult: StructuralTestResult = {
    objectId: '',
    load: loadCase.load,
    maxDisplacement: 0,
    stress: 0,
    passed: true,
  }

  objects.forEach(obj => {
    const materialType = obj.material.type
    const material = MATERIAL_PROPERTIES[materialType]

    if (!material) return

    const bbox = getBoundingBox(obj)
    const volume = getObjectVolume(obj)

    // Calculate structural properties
    const Z = calculateSectionModulus(obj)  // Section modulus (m³)
    const I = calculateMomentOfInertia(obj)  // Moment of inertia (m⁴)
    const L = calculateEffectiveLength(obj)  // Effective length (m)

    // Calculate stress
    const stress = calculateBendingStress(loadCase.load, Z)  // Pa

    // Calculate deflection
    const E = material.youngsModulus * 1e9  // Convert GPa to Pa
    const deflection = calculateDeflection(loadCase.load, L, E, I)  // meters

    // Calculate buckling load
    const bucklingLoad = calculateBucklingLoad(obj, material)

    // Calculate self-weight
    const selfWeight = volume * material.density * 9.81  // N

    // Combined load
    const totalLoad = loadCase.load + selfWeight

    // Determine failure mode
    let failureMode: 'yield' | 'buckling' | 'excessive_deflection' | undefined
    let passed = true

    // Check yield
    if (stress > material.yieldStrength * 1e6) {
      passed = false
      failureMode = 'yield'
    }

    // Check buckling
    if (bucklingLoad < totalLoad) {
      passed = false
      failureMode = 'buckling'
    }

    // Check excessive deflection (allow 5mm for typical structures)
    const deflectionMm = deflection * 1000
    if (deflectionMm > 5) {
      passed = false
      failureMode = 'excessive_deflection'
    }

    // Update worst result
    if (!passed && (worstResult.passed || stress > worstResult.stress)) {
      worstResult = {
        objectId: obj.id,
        load: loadCase.load,
        maxDisplacement: deflectionMm,
        stress: stress / 1e6,  // Convert to MPa
        passed,
        failureMode,
      }
    }

    // If all pass, track the maximum deflection
    if (passed && deflectionMm > worstResult.maxDisplacement) {
      worstResult.maxDisplacement = deflectionMm
    }
  })

  // If we have no failing objects, check if the structure is reasonable
  if (worstResult.objectId === '') {
    // All passed
    return {
      objectId: objects[0]?.id || '',
      load: loadCase.load,
      maxDisplacement: worstResult.maxDisplacement,
      stress: 0,
      passed: true,
    }
  }

  return worstResult
}

// Default load case for testing
export function createDefaultLoadCase(loadN: number = 500): LoadCase {
  return {
    load: loadN,
    position: { x: 0, y: 0, z: 0 },
    direction: { x: 0, y: -1, z: 0 },  // Downward
  }
}

// Default support case
export function createDefaultSupportCase(): SupportCase {
  return {
    type: 'fixed',
    position: { x: 0, y: 0, z: 0 },
  }
}

// Run a complete structural test
export function runStructuralTest(
  objects: CADObject[],
  loadN: number = 500
): StructuralTestResult {
  const loadCase = createDefaultLoadCase(loadN)
  const supportCase = createDefaultSupportCase()

  return analyzeStructure(objects, loadCase, supportCase)
}
