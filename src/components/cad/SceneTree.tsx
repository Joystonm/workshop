// Scene tree — lists every object in the document. Click-to-select, double-
// click to rename (inline input, no native prompt), hover-revealed visibility
// toggle. Each row has a proper type-icon badge for visual scanning.

import { useState, useRef, useEffect } from 'react'
import { useCADStore } from '../../lib/cad/store'
import { PRIMITIVE_ICONS } from './primitiveIcons'
import { LayersIcon, EyeIcon, EyeOffIcon } from './icons'

export function SceneTree() {
  const objects = useCADStore((s) => s.document.objects)
  const objectOrder = useCADStore((s) => s.document.objectOrder)
  const selectedIds = useCADStore((s) => s.selectedIds)
  const selectObject = useCADStore((s) => s.selectObject)
  const setObjectVisibility = useCADStore((s) => s.setObjectVisibility)

  return (
    <div className="cad-tree">
      <div className="cad-tree-header">
        <LayersIcon size={12} />
        <span>OBJECTS</span>
        <span className="count">{objectOrder.length}</span>
      </div>
      <div className="cad-tree-content">
        {objectOrder.length === 0 ? (
          <div className="cad-tree-empty">
            No objects yet.
            <br />
            Switch to <strong>Primitives</strong> to add one.
          </div>
        ) : (
          objectOrder.map((id) => {
            const obj = objects[id]
            if (!obj) return null
            const isSelected = selectedIds.includes(id)
            return (
              <TreeRow
                key={id}
                id={id}
                name={obj.name}
                type={obj.type}
                isSelected={isSelected}
                visibility={obj.visibility}
                onSelect={() => selectObject(id, false)}
                onToggleVisibility={() =>
                  setObjectVisibility(id, obj.visibility === 'visible' ? 'hidden' : 'visible')
                }
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function TreeRow({
  id,
  name,
  type,
  isSelected,
  visibility,
  onSelect,
  onToggleVisibility,
}: {
  id: string
  name: string
  type: keyof typeof PRIMITIVE_ICONS
  isSelected: boolean
  visibility: 'visible' | 'hidden' | 'isolated' | 'transparent' | 'wireframe'
  onSelect: () => void
  onToggleVisibility: () => void
}) {
  const renameObject = useCADStore((s) => s.renameObject)
  const [isRenaming, setIsRenaming] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) {
      setDraft(name)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isRenaming, name])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) renameObject(id, trimmed)
    setIsRenaming(false)
  }

  const cancel = () => {
    setDraft(name)
    setIsRenaming(false)
  }

  const Icon = PRIMITIVE_ICONS[type] ?? PRIMITIVE_ICONS.box

  return (
    <div
      className={`cad-tree-row ${isSelected ? 'selected' : ''}`}
      onClick={isRenaming ? undefined : onSelect}
      title={name}
    >
      <span className="row-icon">
        <Icon size={14} />
      </span>
      <span className="row-name">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commit}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') commit()
              else if (e.key === 'Escape') cancel()
            }}
          />
        ) : (
          <span onDoubleClick={(e) => { e.stopPropagation(); setIsRenaming(true) }}>
            {name}
          </span>
        )}
      </span>
      <div className="row-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility() }}
          title={visibility === 'visible' ? 'Hide' : 'Show'}
          aria-label={visibility === 'visible' ? 'Hide object' : 'Show object'}
        >
          {visibility === 'visible' ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
        </button>
      </div>
    </div>
  )
}
