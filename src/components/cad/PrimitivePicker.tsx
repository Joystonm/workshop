// Primitive picker — professional list-style palette. Each primitive is a
// single row (icon + label + hint key) instead of a 2-column grid, matching
// the layout used by Fusion 360, OnShape, and Blender's tool shelf.

import { useState } from 'react'
import { useCADStore } from '../../lib/cad/store'
import { PRIMITIVE_LIBRARY, PrimitiveInfo, PrimitiveType } from '../../lib/cad/types'
import { PRIMITIVE_ICONS } from './primitiveIcons'
import { PlusIcon } from './icons'

type Category = 'basic' | 'engineering' | 'structural'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'structural', label: 'Structural' },
]

// Short description per primitive — surfaces on hover, helps users decide.
const DESCRIPTIONS: Partial<Record<PrimitiveType, string>> = {
  box: 'Solid cube',
  cuboid: 'Rectangular box',
  sphere: 'Round solid',
  cylinder: 'Circular prism',
  cone: 'Tapered cone',
  capsule: 'Rounded cylinder',
  torus: 'Donut / ring',
  plane: 'Flat 2D surface',
  prism: 'n-sided prism',
  pyramid: 'n-sided pyramid',
  wedge: 'Right-triangle block',
  polyhedron: '20-sided solid',
  beam: 'Long rectangular bar',
  rod: 'Cylindrical rod',
  pipe: 'Hollow cylinder',
  tube: 'Rectangular hollow',
  plate: 'Thin flat panel',
  iBeam: 'I-section profile',
  lBeam: 'L-section angle',
  tBeam: 'T-section profile',
  uChannel: 'U-section channel',
}

export function PrimitivePicker() {
  const addObject = useCADStore((s) => s.addObject)
  const [activeCategory, setActiveCategory] = useState<Category>('basic')

  const visible = PRIMITIVE_LIBRARY.filter((p) => p.category === activeCategory)

  return (
    <div className="cad-picker">
      <div className="cad-picker-header">
        <PlusIcon size={12} />
        <span>PRIMITIVES</span>
      </div>
      <div className="cad-picker-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cad-picker-category ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="cad-picker-content">
        {visible.map((p) => (
          <PrimitiveRow
            key={p.type}
            primitive={p}
            onClick={() => addObject(p.type as PrimitiveType)}
          />
        ))}
      </div>
    </div>
  )
}

function PrimitiveRow({
  primitive,
  onClick,
}: {
  primitive: PrimitiveInfo
  onClick: () => void
}) {
  const Icon = PRIMITIVE_ICONS[primitive.type] ?? PRIMITIVE_ICONS.box
  const description = DESCRIPTIONS[primitive.type] ?? ''
  return (
    <button
      className="cad-picker-row"
      onClick={onClick}
      title={description ? `${primitive.label} — ${description}` : primitive.label}
    >
      <span className="picker-icon">
        <Icon size={16} />
      </span>
      <span className="picker-label">{primitive.label}</span>
      <span className="picker-key">+</span>
    </button>
  )
}
