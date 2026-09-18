// Combine Elements scene. Shows the two reactants on the left, the two
// products on the right, with the balanced equation and ΔH floating in
// the middle.

import { Html } from '@react-three/drei'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { REACTIONS, formatReaction } from '../../../lib/chemistry/reactions'

export function CombineScene() {
  const rIdx = useChemistryStore((s) => Math.round(s.params.reaction ?? 0))
  const reaction = REACTIONS[Math.max(0, Math.min(REACTIONS.length - 1, rIdx))]
  const progress = useChemistryStore((s) => s.state?.progress ?? 0)
  const phase = useChemistryStore((s) => s.state?.phase ?? 0)

  const reactantPositions: [number, number, number][] = []
  for (let i = 0; i < reaction.reactants.length; i++) {
    const baseY = 1.5 - i * 1.0
    const ang = phase * 0.4 + i * 0.5
    reactantPositions.push([-3.5, baseY + Math.sin(ang) * 0.2, 0])
  }
  const productPositions: [number, number, number][] = []
  for (let i = 0; i < reaction.products.length; i++) {
    const baseY = 1.5 - i * 1.0
    productPositions.push([3.5, baseY, 0])
  }

  const reactantScale = 0.5 + 0.5 * (1 - progress)
  const productScale = 0.5 + 0.5 * progress

  return (
    <group>
      {reaction.reactants.map((formula, i) => (
        <group key={`r-${i}`} position={reactantPositions[i]} scale={reactantScale}>
          <mesh>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color={getReactantColor(formula)} emissive={getReactantColor(formula)} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <Html position={[0, 1.1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="comb-formula">{formula}</div>
          </Html>
        </group>
      ))}

      {reaction.products.map((formula, i) => (
        <group key={`p-${i}`} position={productPositions[i]} scale={productScale}>
          <mesh>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color={getProductColor(formula)} emissive={getProductColor(formula)} emissiveIntensity={0.2} roughness={0.4} />
          </mesh>
          <Html position={[0, 1.1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="comb-formula">{formula}</div>
          </Html>
        </group>
      ))}

      <Html
        position={[0, 0, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="comb-card">
          <div className="comb-eq">{formatReaction(reaction)}</div>
          <div className="comb-dh">ΔH = {reaction.dH_kJ} kJ/mol</div>
          <div className="comb-type">{reaction.type}</div>
          <div className="comb-progress">Progress: {(progress * 100).toFixed(0)}%</div>
          {reaction.observables.length > 0 && (
            <div className="comb-obs">
              Observed: {reaction.observables.join(', ')}
            </div>
          )}
          <div className="comb-desc">{reaction.description}</div>
        </div>
      </Html>
    </group>
  )
}

function getReactantColor(formula: string): string {
  if (/HCl|HNO3|H2SO4|HF|HCN/.test(formula)) return '#FCA5A5'
  if (/NaOH|KOH|CaOH/.test(formula)) return '#93C5FD'
  if (/Cu/.test(formula)) return '#7DD3FC'
  if (/Fe/.test(formula)) return '#F59E0B'
  if (/Ag/.test(formula)) return '#D1D5DB'
  if (/Pb/.test(formula)) return '#FBBF24'
  if (/H2O/.test(formula)) return '#BFDBFE'
  if (/H2|O2|N2|Cl2/.test(formula)) return '#A7F3D0'
  return '#D1D5DB'
}

function getProductColor(formula: string): string {
  if (/NaCl|KCl|Na2SO4/.test(formula)) return '#E5E7EB'
  if (/H2O/.test(formula)) return '#BFDBFE'
  if (/H2|O2|N2|CO2/.test(formula)) return '#86EFAC'
  if (/AgCl|AgBr|AgI|PbCl2|BaSO4|CuOH|PbCrO4|FeOH/.test(formula)) return '#FDE68A'
  if (/HCl|NaOH|H2SO4|HNO3/.test(formula)) return '#FCA5A5'
  if (/Cu/.test(formula)) return '#7DD3FC'
  if (/Fe/.test(formula)) return '#F59E0B'
  return '#D1D5DB'
}
