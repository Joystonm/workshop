// Molecule Builder scene. Renders atoms as CPK-coloured spheres and
// bonds as cylinders, with optional auto-rotation. Supports:
//   - Atom labels (toggle)
//   - Bond length labels (toggle)
//   - VSEPR geometry info card (auto)
//   - Bond-angle arc annotation (when bondAngle available)
//   - Polarity indicator (δ⁺ δ⁻ arrow)
//   - Compare mode (render two molecules side-by-side via MoleculeView sub-comp)

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { MOLECULES, centroid } from '../../../lib/chemistry/molecules'
import { ELEMENTS } from '../../../lib/chemistry/elements'
import { VSEPR_INFO } from '../../../lib/chemistry/pedagogy'

const CPK: Record<string, string> = {
  H: '#FFFFFF', He: '#D9FFFF', Li: '#CC80FF', Be: '#C2FF00', B: '#FFB5B5',
  C: '#909090', N: '#3050F8', O: '#FF0D0D', F: '#90E050', Ne: '#B3E3F5',
  Na: '#AB5CF2', Mg: '#8AFF00', Al: '#BFA6A6', Si: '#F0C8A0', P: '#FF8000',
  S: '#FFFF30', Cl: '#1FF01F', Ar: '#80D1E3', K: '#8F40D4', Ca: '#3DFF00',
  Fe: '#E06633', Cu: '#C88033', Zn: '#7D80B0', Br: '#A62929', Ag: '#C0C0C0',
  Pb: '#575961', Au: '#FFD123', Hg: '#B8B8D0',
}

function cpkColor(sym: string): string {
  return CPK[sym] ?? ELEMENTS.find((e) => e.symbol === sym)?.cpkColor ?? '#888888'
}

function atomicRadius(sym: string): number {
  const r: Record<string, number> = {
    H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66,
    F: 0.57, Ne: 0.58, Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05,
    Cl: 1.02, Ar: 1.06, K: 2.03, Ca: 1.76, Fe: 1.32, Cu: 1.32, Zn: 1.22, Br: 1.20,
    Ag: 1.45, Pb: 1.46, Au: 1.36, Hg: 1.32,
  }
  return r[sym] ?? 0.77
}

// Compute the bond length between two atoms in Angstroms.
function bondLength(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

interface MoleculeViewProps {
  moleculeIdx: number
  speed: number
  showLabels: number
  showBondLengths: number
}

function MoleculeView({ moleculeIdx, speed, showLabels, showBondLengths }: MoleculeViewProps) {
  const m = MOLECULES[Math.max(0, Math.min(MOLECULES.length - 1, moleculeIdx))]
  const c = useMemo(() => centroid(m), [m.id])
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (groupRef.current && speed > 0) groupRef.current.rotation.y += dt * speed
  })

  // Pick a central atom for the bond-angle arc — first non-hydrogen.
  const centralIdx = m.atoms.findIndex((a) => a.symbol !== 'H')
  const centralAtom = centralIdx >= 0 ? m.atoms[centralIdx] : m.atoms[0]
  // Bonds from the central atom.
  const centralBonds: Array<{ otherIdx: number; otherPos: [number, number, number]; bondOrder: 1 | 2 | 3; idx: number }> = []
  m.bonds.forEach((b, i) => {
    if (b.a === centralIdx) centralBonds.push({ otherIdx: b.b, otherPos: m.atoms[b.b].position, bondOrder: b.order, idx: i })
    else if (b.b === centralIdx) centralBonds.push({ otherIdx: b.a, otherPos: m.atoms[b.a].position, bondOrder: b.order, idx: i })
  })
  const vec1 = centralBonds[0] ? bondVector(centralAtom.position, centralBonds[0].otherPos) : null
  const vec2 = centralBonds[1] ? bondVector(centralAtom.position, centralBonds[1].otherPos) : null

  return (
    <group>
      <group ref={groupRef} position={[-c[0], -c[1], -c[2]]}>
        {m.atoms.map((a, i) => (
          <Atom key={i} symbol={a.symbol} position={a.position} />
        ))}
        {m.bonds.map((b, i) => {
          const ap = m.atoms[b.a].position
          const bp = m.atoms[b.b].position
          return (
            <Bond
              key={i}
              a={ap}
              b={bp}
              order={b.order}
              aromatic={b.aromatic}
            />
          )
        })}
        {/* Atom labels */}
        {showLabels && m.atoms.map((a, i) => (
          <Html key={`l${i}`} position={a.position} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="mb-label">{a.symbol}</div>
          </Html>
        ))}
        {/* Bond length labels at midpoints */}
        {showBondLengths && m.bonds.map((b, i) => {
          const ap = m.atoms[b.a].position
          const bp = m.atoms[b.b].position
          const mid: [number, number, number] = [(ap[0] + bp[0]) / 2, (ap[1] + bp[1]) / 2, (ap[2] + bp[2]) / 2]
          return (
            <Html key={`bl${i}`} position={mid} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
              <div className="mb-bond-length">{bondLength(ap, bp).toFixed(2)} Å</div>
            </Html>
          )
        })}
      </group>

      {/* VSEPR info card */}
      <Html position={[0, -3.2, 0]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
        <div className="mb-info">
          <div className="mb-name">{m.name}</div>
          <div className="mb-formula">{m.formula}</div>
          <div className="mb-cat">{m.category.replace(/-/g, ' ')} · {m.properties.molarMass.toFixed(2)} g/mol</div>
          {m.geometry && (
            <div className="mb-vsepr">
              <span className="mb-vsepr-shape">{VSEPR_INFO[m.geometry]?.shape ?? m.geometry}</span>
              {m.bondAngle && <span className="mb-vsepr-angle">{m.bondAngle}°</span>}
              <span className={`mb-polar-pill ${m.polar ? 'polar' : 'nonpolar'}`}>
                {m.polar ? 'polar' : 'non-polar'}
              </span>
            </div>
          )}
        </div>
      </Html>

      {/* Bond-angle arc annotation */}
      {vec1 && vec2 && m.bondAngle && (
        <BondAngleArc center={centralAtom.position} v1={vec1} v2={vec2} angle={m.bondAngle} />
      )}

      {/* Polarity indicator arrow (drawn after polarisation calc). */}
      {m.polar && <PolarityArrow m={m} />}
    </group>
  )
}

function bondVector(a: [number, number, number], b: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
}

function BondAngleArc({ center, v1, v2, angle }: { center: [number, number, number]; v1: THREE.Vector3; v2: THREE.Vector3; angle: number }) {
  // Build an arc that lives in the plane defined by v1 and v2 (the
  // bisector plane through `center`). Use lineSegments to avoid the
  // torus-rotation math entirely.
  const radius = 0.8
  const n1 = v1.clone().normalize()
  const n2 = v2.clone().normalize()
  // Build orthonormal basis: bisector + perpendicular in v1/v2 plane.
  const bisector = n1.clone().add(n2).normalize()
  // Choose a vector not parallel to bisector for the in-plane perpendicular.
  const helper = Math.abs(bisector.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const inPlane = new THREE.Vector3().crossVectors(bisector, helper).normalize()

  // Angle between v1 and v2 around the bisector (in radians).
  const cosA = Math.max(-1, Math.min(1, n1.dot(n2)))
  const fullAngle = Math.acos(cosA)

  // Parameterise the arc on the unit circle of the (bisector, inPlane) plane:
  //   dir(t) = cos(t) * bisector + sin(t) * inPlane
  //   t goes from -fullAngle/2 to +fullAngle/2, so the arc centre is the
  //   bisector and the endpoints align with n1 (t = -halfAngle) and n2
  //   (t = +halfAngle).
  const segments = 32
  const halfAngle = fullAngle / 2
  const positions = useMemo(() => {
    const arr = new Float32Array((segments) * 2 * 3) // (segments) line segments × 2 endpoints × 3 coords
    for (let i = 0; i < segments; i++) {
      const t0 = -halfAngle + (i / segments) * fullAngle
      const t1 = -halfAngle + ((i + 1) / segments) * fullAngle
      const dx0 = Math.cos(t0) * bisector.x + Math.sin(t0) * inPlane.x
      const dy0 = Math.cos(t0) * bisector.y + Math.sin(t0) * inPlane.y
      const dz0 = Math.cos(t0) * bisector.z + Math.sin(t0) * inPlane.z
      const dx1 = Math.cos(t1) * bisector.x + Math.sin(t1) * inPlane.x
      const dy1 = Math.cos(t1) * bisector.y + Math.sin(t1) * inPlane.y
      const dz1 = Math.cos(t1) * bisector.z + Math.sin(t1) * inPlane.z
      const o = i * 6
      arr[o + 0] = center[0] + dx0 * radius
      arr[o + 1] = center[1] + dy0 * radius
      arr[o + 2] = center[2] + dz0 * radius
      arr[o + 3] = center[0] + dx1 * radius
      arr[o + 4] = center[1] + dy1 * radius
      arr[o + 5] = center[2] + dz1 * radius
    }
    return arr
  }, [center[0], center[1], center[2], radius, fullAngle, bisector.x, bisector.y, bisector.z, inPlane.x, inPlane.y, inPlane.z])

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  // Mid-arc label position — at the bisector.
  const labelPos: [number, number, number] = [
    center[0] + bisector.x * radius * 1.25,
    center[1] + bisector.y * radius * 1.25,
    center[2] + bisector.z * radius * 1.25,
  ]

  return (
    <>
      <lineSegments geometry={geom}>
        <lineBasicMaterial color="#9333EA" />
      </lineSegments>
      <Html position={labelPos} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
        <div className="mb-angle-label">{angle.toFixed(1)}°</div>
      </Html>
    </>
  )
}

// Compute a coarse polarity arrow direction (vector sum of bond
// differences in electronegativity). Just for visual hint; not physical.
function PolarityArrow({ m }: { m: { atoms: Array<{ symbol: string; position: [number, number, number] }> } }) {
  // Approximate EN values for the common atoms.
  const EN: Record<string, number> = { H: 2.2, C: 2.55, N: 3.04, O: 3.44, F: 3.98, S: 2.58, Cl: 3.16, P: 2.19, Br: 2.96 }
  const avgEN = m.atoms.reduce((a, x) => a + (EN[x.symbol] ?? 2.5), 0) / m.atoms.length
  // Arrow from "more positive" toward "more negative" — opposite to dipole moment.
  const acc = new THREE.Vector3(0, 0, 0)
  m.atoms.forEach((a) => {
    const diff = avgEN - (EN[a.symbol] ?? 2.5)
    acc.x += a.position[0] * diff
    acc.y += a.position[1] * diff
    acc.z += a.position[2] * diff
  })
  if (acc.length() < 0.01) return null
  const dir = acc.clone().normalize()
  const start: [number, number, number] = [-dir.x * 2.5, -dir.y * 2.5, -dir.z * 2.5]
  const end: [number, number, number] = [dir.x * 2.5, dir.y * 2.5, dir.z * 2.5]
  return (
    <group>
      <ArrowLine start={start} end={end} color="#DC2626" />
      <Html position={[dir.x * 3.2, dir.y * 3.2, dir.z * 3.2]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
        <div className="mb-dipole">δ⁻ → δ⁺</div>
      </Html>
    </group>
  )
}

function ArrowLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null)
  const a = new THREE.Vector3(...start)
  const b = new THREE.Vector3(...end)
  const dir = b.clone().sub(a)
  const len = dir.length()
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const axis = new THREE.Vector3(0, 1, 0)
  const quat = new THREE.Quaternion().setFromUnitVectors(axis, dir.clone().normalize())
  return (
    <group ref={ref} position={mid.toArray()} quaternion={quat}>
      <mesh position={[0, -len / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, len - 0.1, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, len / 2 - 0.1, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function Atom({ symbol, position }: { symbol: string; position: [number, number, number] }) {
  const r = atomicRadius(symbol) * 0.45
  return (
    <mesh position={position}>
      <sphereGeometry args={[r, 24, 24]} />
      <meshStandardMaterial color={cpkColor(symbol)} roughness={0.35} metalness={0.15} />
    </mesh>
  )
}

function Bond({ a, b, order, aromatic }: { a: [number, number, number]; b: [number, number, number]; order: number; aromatic?: boolean }) {
  const start = new THREE.Vector3(...a)
  const end = new THREE.Vector3(...b)
  const bondDir = end.clone().sub(start)
  const len = bondDir.length()
  if (len < 1e-6) return null
  const mid = start.clone().add(end).multiplyScalar(0.5)
  // Orient the parent so its local +Y axis points along the bond direction.
  // The cylinder geometry's default axis is Y, so each child mesh is already
  // aligned with the bond — no extra rotation needed on the mesh itself.
  // The cylinder's *length* is `len`, centred at the origin (Y range -len/2..+len/2).
  const axis = new THREE.Vector3(0, 1, 0)
  const quat = new THREE.Quaternion().setFromUnitVectors(axis, bondDir.clone().normalize())
  const r = aromatic ? 0.07 : 0.09
  // Offsets for double/triple bonds run perpendicular to the bond in the
  // local X-Y plane. We pick a stable perpendicular axis (world X) and
  // rotate it by the bond quaternion to get the local-X direction.
  const worldPerp = Math.abs(bondDir.x) < 0.9
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0)
  const localPerp = worldPerp.clone().applyQuaternion(quat).normalize()
  const offsetMag = order === 2 ? 0.18 : order === 3 ? 0.27 : 0
  const offsets: Array<[number, number, number]> = order === 1
    ? [[0, 0, 0]]
    : order === 2
      ? [
          [-offsetMag * localPerp.x, -offsetMag * localPerp.y, -offsetMag * localPerp.z],
          [ offsetMag * localPerp.x,  offsetMag * localPerp.y,  offsetMag * localPerp.z],
        ]
      : [
          [-offsetMag * localPerp.x, -offsetMag * localPerp.y, -offsetMag * localPerp.z],
          [0, 0, 0],
          [ offsetMag * localPerp.x,  offsetMag * localPerp.y,  offsetMag * localPerp.z],
        ]
  return (
    <group position={mid.toArray()} quaternion={quat}>
      {offsets.map((off, i) => (
        <mesh key={i} position={off}>
          <cylinderGeometry args={[r, r, len, 12]} />
          <meshStandardMaterial color="#D4D4D8" roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// The exported scene — decides between single-molecule and side-by-side compare.
export function MoleculeBuilderScene() {
  const idx = useChemistryStore((s) => Math.round(s.params.molecule ?? 0))
  const speed = useChemistryStore((s) => s.params.rotateSpeed ?? 0.4)
  const showLabels = useChemistryStore((s) => Math.round(s.params.showLabels ?? 1))
  const showBondLengths = useChemistryStore((s) => Math.round(s.params.showBondLengths ?? 0))
  const compareMode = useChemistryStore((s) => Math.round(s.params.compareMode ?? 0) === 1)
  const idxB = useChemistryStore((s) => Math.round(s.params.moleculeB ?? 0))

  // OrbitControls is mounted exactly once at the top level — never inside
  // the molecule view — so compare mode doesn't create two listeners that
  // fight for input on the same canvas.
  return (
    <>
      {compareMode ? (
        <group>
          <group position={[-3.5, 0, 0]}>
            <MoleculeView
              moleculeIdx={idx}
              speed={speed}
              showLabels={showLabels}
              showBondLengths={showBondLengths}
            />
          </group>
          <group position={[3.5, 0, 0]}>
            <MoleculeView
              moleculeIdx={idxB}
              speed={speed}
              showLabels={showLabels}
              showBondLengths={showBondLengths}
            />
          </group>
        </group>
      ) : (
        <MoleculeView
          moleculeIdx={idx}
          speed={speed}
          showLabels={showLabels}
          showBondLengths={showBondLengths}
        />
      )}
      <OrbitControls enablePan={false} enableZoom={true} />
    </>
  )
}
