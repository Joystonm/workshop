// Element Explorer scene. A 3D atom: nucleus + electron shells with
// electrons on each shell, with a real time-based animation.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { getElementByZ } from '../../../lib/chemistry/elements'

const SHELL_RADII = [1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0]

export function ElementExplorerScene() {
  const z = useChemistryStore((s) => Math.round(s.params.z ?? 6))
  const scale = useChemistryStore((s) => s.params.scale ?? 1.0)
  const speed = useChemistryStore((s) => s.params.speed ?? 1.0)
  const el = getElementByZ(z)
  if (!el) return null

  const total = el.shells.reduce((s, n) => s + n, 0)
  const nucleusRadius = 0.4 + Math.min(1.5, z / 80)

  return (
    <group>
      <Nucleus radius={nucleusRadius} z={z} />
      {el.shells.map((nElectrons, shellIdx) => {
        const r = (SHELL_RADII[shellIdx] ?? (shellIdx + 1) * 1.2) * scale
        return (
          <Shell key={shellIdx} radius={r} count={nElectrons} phase={shellIdx * 0.7} speed={speed} tilt={shellIdx * 0.5} />
        )
      })}
      <Html
        position={[0, -5.5, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="atom-hud">
          <div className="atom-z">{el.z}</div>
          <div className="atom-symbol">{el.symbol}</div>
          <div className="atom-name">{el.name}</div>
          <div className="atom-config">{el.electronConfig}</div>
          <div className="atom-shells">
            Shells: [{el.shells.join(', ')}] = {total} e⁻
          </div>
        </div>
      </Html>
      <Html
        position={[5.5, 3, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div className="atom-data">
          <div>Mass: {el.mass} u</div>
          <div>Phase: {el.phase}</div>
          <div>Density: {el.density ? `${el.density} g/cm³` : '—'}</div>
          <div>Mp: {el.meltingPoint ? `${el.meltingPoint} K` : '—'}</div>
          <div>Bp: {el.boilingPoint ? `${el.boilingPoint} K` : '—'}</div>
          <div>χ: {el.electronegativity ?? '—'}</div>
        </div>
      </Html>
    </group>
  )
}

function Nucleus({ radius, z }: { radius: number; z: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.3
      meshRef.current.rotation.x += dt * 0.2
    }
  })
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[radius, 2]} />
      <meshStandardMaterial color="#9333EA" emissive="#581C87" emissiveIntensity={0.4} roughness={0.4} metalness={0.2} />
    </mesh>
  )
}

function Shell({ radius, count, phase, speed, tilt }: { radius: number; count: number; phase: number; speed: number; tilt: number }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * speed * 0.3 + phase
    }
  })
  const angles = useRef<number[]>([])
  if (angles.current.length === 0) {
    for (let i = 0; i < count; i++) angles.current.push((i / count) * Math.PI * 2)
  }
  return (
    <group ref={groupRef} rotation={[tilt, 0, tilt * 0.7]}>
      <mesh>
        <torusGeometry args={[radius, 0.005, 8, 64]} />
        <meshBasicMaterial color="#A78BFA" opacity={0.5} transparent />
      </mesh>
      {angles.current.slice(0, count).map((a, i) => (
        <Electron key={i} radius={radius} angle={a} phase={phase + i * 0.2} speed={speed} />
      ))}
    </group>
  )
}

function Electron({ radius, angle, phase, speed }: { radius: number; angle: number; phase: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed * 0.4 + phase
      const a = angle + t * 0.3
      ref.current.position.set(radius * Math.cos(a), 0, radius * Math.sin(a))
    }
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color="#2563EB" emissive="#1D4ED8" emissiveIntensity={0.6} />
    </mesh>
  )
}
