// Properties panel for the selected CAD object. Shows object name + type, lock
// toggle, quick actions, position/rotation/scale/dimensions editors, visibility
// mode, material (popover + roughness/metalness sliders), and read-only bbox +
// volume info. Uses human-readable parameter labels and stepper buttons on
// every numeric input.

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useCADStore } from '../../lib/cad/store'
import {
  MATERIAL_PRESETS,
  MaterialType,
  CADParameters,
  CADMaterial,
  VisibilityState,
} from '../../lib/cad/types'
import { getBoundingBox, getObjectVolume } from '../../lib/cad/geometry'
import {
  SettingsIcon,
  LockIcon,
  UnlockIcon,
  DuplicateIcon,
  ResetIcon,
  DeleteIcon,
  StepUpIcon,
  StepDownIcon,
} from './icons'
import { PRIMITIVE_ICONS } from './primitiveIcons'

// Map raw CADParameters keys → human-readable short labels used in the UI.
const PARAM_LABEL: Record<string, string> = {
  width: 'Width',
  height: 'Height',
  depth: 'Depth',
  radius: 'Radius',
  radiusTop: 'Radius (top)',
  radiusBottom: 'Radius (bot)',
  innerRadius: 'Inner R',
  outerRadius: 'Outer R',
  length: 'Length',
  segments: 'Segments',
  extrudeDepth: 'Extrude depth',
  revolveAngle: 'Revolve angle',
  sides: 'Sides',
}

// Parameter keys that affect rendering — segment counts shouldn't be shown as
// dimension controls (they're quality knobs, not sizes).
const DIMENSION_KEYS = new Set([
  'width', 'height', 'depth',
  'radius', 'radiusTop', 'radiusBottom',
  'innerRadius', 'outerRadius',
  'length', 'extrudeDepth', 'revolveAngle',
  'sides',
])

const VISIBILITY_OPTIONS: { value: VisibilityState; label: string }[] = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'transparent', label: 'Trans.' },
  { value: 'wireframe', label: 'Wire' },
]

export function PropertiesPanel() {
  const selectedIds = useCADStore((s) => s.selectedIds)
  const objects = useCADStore((s) => s.document.objects)
  const units = useCADStore((s) => s.units)

  const obj = selectedIds[0] ? objects[selectedIds[0]] : null

  if (!obj) {
    return (
      <div className="cad-panel">
        <div className="cad-panel-header">
          <SettingsIcon size={12} />
          <span>PROPERTIES</span>
        </div>
        <div className="cad-panel-empty">No selection</div>
      </div>
    )
  }

  return (
    <div className="cad-panel">
      <div className="cad-panel-header">
        <SettingsIcon size={12} />
        <span>PROPERTIES</span>
      </div>
      <div className="cad-properties">
        <ObjectSection obj={obj} />
        <QuickActionsSection objectId={obj.id} />
        <PositionSection objectId={obj.id} position={obj.position} units={units} />
        <RotationSection objectId={obj.id} rotation={obj.rotation} />
        <ScaleSection objectId={obj.id} scale={obj.scale} />
        <DimensionsSection objectId={obj.id} params={obj.parameters} units={units} />
        <VisibilitySection objectId={obj.id} current={obj.visibility} />
        <MaterialSection objectId={obj.id} material={obj.material} />
        <InfoSection objectId={obj.id} units={units} />
      </div>
    </div>
  )
}

// ─── Object name + type + lock ────────────────────────────────────────────

function ObjectSection({ obj }: { obj: { id: string; name: string; type: keyof typeof PRIMITIVE_ICONS; locked: boolean } }) {
  const renameObject = useCADStore((s) => s.renameObject)
  const updateObject = useCADStore((s) => s.updateObject)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(obj.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setDraft(obj.name)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing, obj.name])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== obj.name) renameObject(obj.id, trimmed)
    setIsEditing(false)
  }

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">Object</div>
      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            else if (e.key === 'Escape') { setDraft(obj.name); setIsEditing(false) }
          }}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <div className="cad-property-name-row">
          <div
            className="cad-property-name"
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to rename"
          >
            {obj.name}
            <span className="type-tag">{obj.type}</span>
          </div>
          <button
            className={`cad-lock-btn ${obj.locked ? 'locked' : ''}`}
            onClick={() => updateObject(obj.id, { locked: !obj.locked })}
            title={obj.locked ? 'Unlock — allow transforms' : 'Lock — prevent transforms'}
            aria-label={obj.locked ? 'Unlock object' : 'Lock object'}
          >
            {obj.locked ? <LockIcon size={12} /> : <UnlockIcon size={12} />}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Quick actions ───────────────────────────────────────────────────────

function QuickActionsSection({ objectId }: { objectId: string }) {
  const duplicateObject = useCADStore((s) => s.duplicateObject)
  const removeObject = useCADStore((s) => s.removeObject)
  const updateObject = useCADStore((s) => s.updateObject)
  const objects = useCADStore((s) => s.document.objects)

  const onDuplicate = () => { duplicateObject(objectId) }
  const onDelete = () => { removeObject(objectId) }
  const onReset = () => {
    const obj = objects[objectId]
    if (!obj) return
    updateObject(objectId, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    })
  }

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">Quick actions</div>
      <div className="cad-quick-actions">
        <button className="cad-quick-btn" onClick={onDuplicate} title="Duplicate (Ctrl+D)">
          <DuplicateIcon size={12} />
          <span>Duplicate</span>
        </button>
        <button className="cad-quick-btn" onClick={onReset} title="Reset transform">
          <ResetIcon size={12} />
          <span>Reset</span>
        </button>
        <button className="cad-quick-btn danger" onClick={onDelete} title="Delete (Del)">
          <DeleteIcon size={12} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}

// ─── Position ────────────────────────────────────────────────────────────

function PositionSection({
  objectId,
  position,
  units,
}: {
  objectId: string
  position: { x: number; y: number; z: number }
  units: string
}) {
  const updateObject = useCADStore((s) => s.updateObject)
  return (
    <div className="cad-property-section">
      <div className="cad-property-label">
        Position <span className="unit">{units}</span>
      </div>
      <div className="cad-input-grid cols-3">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <NumberInput
            key={axis}
            label={axis.toUpperCase()}
            value={position[axis]}
            step={1}
            onChange={(v) => updateObject(objectId, { position: { ...position, [axis]: v } })}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Rotation ────────────────────────────────────────────────────────────

const ROTATION_SNAPS = [0, 90, 180, 270]
const ROTATION_NUDGES: { label: string; degrees: number }[] = [
  { label: '−180°', degrees: -180 },
  { label: '−90°', degrees: -90 },
  { label: '−45°', degrees: -45 },
  { label: '+45°', degrees: 45 },
  { label: '+90°', degrees: 90 },
]

function RotationSection({
  objectId,
  rotation,
}: {
  objectId: string
  rotation: { x: number; y: number; z: number }
}) {
  const updateObject = useCADStore((s) => s.updateObject)
  const setAll = (deg: number) =>
    updateObject(objectId, { rotation: { x: deg, y: deg, z: deg } })
  const nudgeAll = (deg: number) =>
    updateObject(objectId, {
      rotation: {
        x: rotation.x + deg,
        y: rotation.y + deg,
        z: rotation.z + deg,
      },
    })
  const reset = () => setAll(0)
  const setAxis = (axis: 'x' | 'y' | 'z', v: number) =>
    updateObject(objectId, { rotation: { ...rotation, [axis]: v } })

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">
        Rotation <span className="unit">deg</span>
        <button className="cad-label-action" onClick={reset} title="Reset all to 0°">
          Reset
        </button>
      </div>

      <div className="cad-input-grid cols-3">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <NumberInput
            key={axis}
            label={
              <span className={`cad-axis-label cad-axis-${axis}`}>{axis.toUpperCase()}</span>
            }
            value={rotation[axis]}
            step={5}
            precision={1}
            onChange={(v) => setAxis(axis, v)}
            onReset={() => setAxis(axis, 0)}
          />
        ))}
      </div>

      <div className="cad-control-sub">
        <span className="cad-control-sub-label">Snap all</span>
        <div className="cad-chip-row">
          {ROTATION_SNAPS.map((deg) => (
            <button
              key={deg}
              className="cad-chip"
              onClick={() => setAll(deg)}
              title={`Set all axes to ${deg}°`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div className="cad-control-sub">
        <span className="cad-control-sub-label">Nudge all</span>
        <div className="cad-chip-row">
          {ROTATION_NUDGES.map((n) => (
            <button
              key={n.label}
              className="cad-chip"
              onClick={() => nudgeAll(n.degrees)}
              title={`Add ${n.degrees}° to all axes`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Scale ───────────────────────────────────────────────────────────────
//
// Scale is hard to use in most 3D editors, so we lead with the most common
// intent: scale uniformly with a slider + numeric input. The X/Y/Z badges
// are read-only in this mode and just confirm the live value.
//
// Click "Per-axis" to unlock independent X/Y/Z scaling. The slider disappears
// and three numeric inputs become editable.
//
// Presets cover the common shrink / grow / mirror range. Mirror flips an
// axis to -1, which in CAD is a free way to mirror geometry.

const SCALE_PRESETS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
const SCALE_MIN = 0.05
const SCALE_MAX = 50
const SCALE_STEP = 0.05

function clampScale(v: number): number {
  if (!Number.isFinite(v)) return 1
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, v))
}

function ScaleSection({
  objectId,
  scale,
}: {
  objectId: string
  scale: { x: number; y: number; z: number }
}) {
  const updateObject = useCADStore((s) => s.updateObject)
  const [linked, setLinked] = useState(true)
  const [sliderDraft, setSliderDraft] = useState<string | null>(null)

  // In linked mode, all three axes track the uniform value. When unlinked,
  // each axis keeps its own value.
  const isLinked = linked
  const linkedValue = scale.x // any axis is representative when linked
  const isActuallyLinked =
    Math.abs(scale.x - scale.y) < 1e-6 && Math.abs(scale.y - scale.z) < 1e-6
  const uniform = isActuallyLinked ? linkedValue : (scale.x + scale.y + scale.z) / 3
  const showUniform = isLinked

  const setAll = (v: number) => {
    const c = clampScale(v)
    updateObject(objectId, { scale: { x: c, y: c, z: c } })
  }
  const setAxis = (axis: 'x' | 'y' | 'z', v: number) => {
    const c = clampScale(v)
    updateObject(objectId, { scale: { ...scale, [axis]: c } })
  }
  const mirrorAxis = (axis: 'x' | 'y' | 'z') => {
    updateObject(objectId, { scale: { ...scale, [axis]: -scale[axis] } })
  }
  const resetAll = () => updateObject(objectId, { scale: { x: 1, y: 1, z: 1 } })

  // When the user clicks "Per-axis" but the current scale has diverging axes,
  // we keep their values — they may want to fine-tune one axis from the
  // current state. When they click "Linked", we collapse to the X value.

  const handleLinkToggle = (nextLinked: boolean) => {
    setLinked(nextLinked)
    if (nextLinked && !isActuallyLinked) {
      // Collapsing to linked — pick the X axis as the new uniform value.
      setAll(scale.x)
    }
  }

  const sliderValue = clampScale(uniform)
  const sliderDisplay = sliderDraft ?? sliderValue.toFixed(2)

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">
        Scale <span className="unit">×</span>
        <button className="cad-label-action" onClick={resetAll} title="Reset all axes to 1×">
          Reset
        </button>
      </div>

      {/* Mode toggle — Linked vs Per-axis. */}
      <div className="cad-segmented" role="tablist" aria-label="Scale mode">
        <button
          type="button"
          role="tab"
          aria-selected={linked}
          className={`cad-segmented-btn ${linked ? 'active' : ''}`}
          onClick={() => handleLinkToggle(true)}
          title="One slider drives all three axes together"
        >
          Linked
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!linked}
          className={`cad-segmented-btn ${!linked ? 'active' : ''}`}
          onClick={() => handleLinkToggle(false)}
          title="X, Y and Z scale independently"
        >
          Per-axis
        </button>
      </div>

      {showUniform ? (
        <div className="cad-uniform">
          <div className="cad-uniform-head">
            <span className="cad-uniform-label">Uniform scale</span>
            <span className="cad-uniform-value">{sliderDisplay}×</span>
          </div>
          <input
            className="cad-uniform-slider"
            type="range"
            min={SCALE_MIN}
            max={10}
            step={SCALE_STEP}
            value={Math.min(10, Math.max(SCALE_MIN, sliderValue))}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setSliderDraft(null)
              setAll(v)
            }}
          />
          <div className="cad-uniform-ticks">
            <span>0.1×</span>
            <span>1×</span>
            <span>10×</span>
          </div>

          {/* Precise numeric input — typing beats dragging for non-round values. */}
          <div className="cad-scale-exact">
            <label className="cad-scale-exact-label">Exact value</label>
            <input
              className="cad-scale-exact-input"
              type="number"
              step="any"
              min={SCALE_MIN}
              max={SCALE_MAX}
              value={sliderDisplay}
              onChange={(e) => {
                const raw = e.target.value
                setSliderDraft(raw)
                const v = parseFloat(raw)
                if (Number.isFinite(v)) setAll(v)
              }}
              onBlur={() => setSliderDraft(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              }}
            />
            <span className="cad-scale-exact-unit">×</span>
          </div>

          {/* X/Y/Z badges — read-only confirmation of the live value. */}
          <div className="cad-axis-badges">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className={`cad-axis-badge cad-axis-${axis}`}>
                <span className="cad-axis-badge-letter">{axis.toUpperCase()}</span>
                <span className="cad-axis-badge-value">{sliderDisplay}×</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="cad-input-grid cols-3">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <NumberInput
                key={axis}
                label={
                  <span className={`cad-axis-label cad-axis-${axis}`}>{axis.toUpperCase()}</span>
                }
                value={scale[axis]}
                step={0.1}
                precision={2}
                onChange={(v) => setAxis(axis, v)}
                onReset={() => setAxis(axis, 1)}
              />
            ))}
          </div>

          {/* Per-axis row: each axis gets a slider + a flip (mirror) toggle. */}
          <div className="cad-scale-per-axis">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="cad-scale-axis-row">
                <div className="cad-scale-axis-head">
                  <span className={`cad-axis-label cad-axis-${axis}`}>{axis.toUpperCase()}</span>
                  <span className="cad-scale-axis-value">{scale[axis].toFixed(2)}×</span>
                  <button
                    type="button"
                    className={`cad-mirror-btn ${scale[axis] < 0 ? 'flipped' : ''}`}
                    onClick={() => mirrorAxis(axis)}
                    title={`Mirror along ${axis.toUpperCase()} (flip sign)`}
                    aria-label={`Mirror ${axis.toUpperCase()}`}
                  >
                    ⇄
                  </button>
                </div>
                <input
                  type="range"
                  className={`cad-axis-slider cad-axis-slider-${axis}`}
                  min={-5}
                  max={5}
                  step={SCALE_STEP}
                  value={Math.min(5, Math.max(-5, scale[axis]))}
                  onChange={(e) => setAxis(axis, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="cad-control-sub">
        <span className="cad-control-sub-label">Presets</span>
        <div className="cad-chip-row">
          {SCALE_PRESETS.map((v) => {
            const active = isActuallyLinked && Math.abs(uniform - v) < 1e-3
            return (
              <button
                key={v}
                className={`cad-chip ${active ? 'active' : ''}`}
                onClick={() => setAll(v)}
                title={`Set all axes to ${v}×`}
              >
                {v}×
              </button>
            )
          })}
        </div>
      </div>

      <div className="cad-tip" role="note">
        <strong>Tip:</strong> In the viewport, drag the scale gizmo handles — corner boxes scale uniformly, axis arrows scale along that axis. Hold <kbd>Shift</kbd> for uniform.
      </div>
    </div>
  )
}

// ─── Dimensions ──────────────────────────────────────────────────────────

function DimensionsSection({
  objectId,
  params,
  units,
}: {
  objectId: string
  params: CADParameters
  units: string
}) {
  const updateObjectParameters = useCADStore((s) => s.updateObjectParameters)
  const entries = Object.entries(params).filter(([k]) => DIMENSION_KEYS.has(k))

  if (entries.length === 0) return null

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">
        Dimensions <span className="unit">{units}</span>
      </div>
      <div className="cad-input-grid cols-2">
        {entries.map(([key, value]) => (
          <NumberInput
            key={key}
            label={PARAM_LABEL[key] ?? key}
            value={typeof value === 'number' ? value : 0}
            step={1}
            min={key === 'sides' || key === 'segments' ? 3 : 0}
            onChange={(v) => updateObjectParameters(objectId, { [key]: v })}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Visibility ──────────────────────────────────────────────────────────

function VisibilitySection({
  objectId,
  current,
}: {
  objectId: string
  current: VisibilityState
}) {
  const setObjectVisibility = useCADStore((s) => s.setObjectVisibility)
  return (
    <div className="cad-property-section">
      <div className="cad-property-label">Display</div>
      <div className="cad-segmented">
        {VISIBILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`cad-segmented-btn ${current === opt.value ? 'active' : ''}`}
            onClick={() => setObjectVisibility(objectId, opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Material (custom dropdown + roughness/metalness sliders) ────────────

function MaterialSection({
  objectId,
  material,
}: {
  objectId: string
  material: CADMaterial
}) {
  const updateObject = useCADStore((s) => s.updateObject)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onMaterialChange = (next: CADMaterial) => {
    updateObject(objectId, { material: next })
  }
  const onPreset = (type: MaterialType) => {
    onMaterialChange(MATERIAL_PRESETS[type])
    setOpen(false)
  }
  const onRoughness = (v: number) => onMaterialChange({ ...material, roughness: v })
  const onMetalness = (v: number) => onMaterialChange({ ...material, metalness: v })

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">Material</div>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button className="cad-material-button" onClick={() => setOpen((v) => !v)}>
          <span className="cad-material-swatch" style={{ background: material.color }} />
          <span style={{ flex: 1, textTransform: 'capitalize' }}>{material.type}</span>
          <SettingsIcon size={12} />
        </button>
        {open && (
          <div className="cad-material-popover">
            {(Object.keys(MATERIAL_PRESETS) as MaterialType[]).map((type) => {
              const m = MATERIAL_PRESETS[type]
              return (
                <button
                  key={type}
                  className={`cad-material-row ${type === material.type ? 'active' : ''}`}
                  onClick={() => onPreset(type)}
                >
                  <span className="cad-material-swatch" style={{ background: m.color }} />
                  <span style={{ flex: 1, textTransform: 'capitalize' }}>{type}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Advanced — roughness / metalness sliders */}
      <div className="cad-material-advanced">
        <SliderRow
          label="Roughness"
          value={material.roughness}
          min={0}
          max={1}
          step={0.05}
          onChange={onRoughness}
        />
        <SliderRow
          label="Metalness"
          value={material.metalness}
          min={0}
          max={1}
          step={0.05}
          onChange={onMetalness}
        />
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="cad-slider">
      <div className="cad-slider-head">
        <span className="cad-slider-label">{label}</span>
        <span className="cad-slider-value">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

// ─── Info (bbox dims + volume) ───────────────────────────────────────────

function InfoSection({ objectId, units }: { objectId: string; units: string }) {
  const objects = useCADStore((s) => s.document.objects)
  const obj = objects[objectId]
  if (!obj) return null

  const bbox = getBoundingBox(obj)
  const volume = getObjectVolume(obj)
  const volumeLabel = formatVolume(volume, units)

  return (
    <div className="cad-property-section">
      <div className="cad-property-label">
        Info
      </div>
      <div className="cad-info">
        <div className="cad-info-row">
          <span>Bounding box</span>
          <span className="cad-info-value">
            {bbox.x.toFixed(1)} × {bbox.y.toFixed(1)} × {bbox.z.toFixed(1)} {units}
          </span>
        </div>
        <div className="cad-info-row">
          <span>Volume</span>
          <span className="cad-info-value">{volumeLabel}</span>
        </div>
        <div className="cad-info-row">
          <span>Position</span>
          <span className="cad-info-value">
            ({obj.position.x.toFixed(1)}, {obj.position.y.toFixed(1)}, {obj.position.z.toFixed(1)})
          </span>
        </div>
        <div className="cad-info-row">
          <span>Visibility</span>
          <span className="cad-info-value" style={{ textTransform: 'capitalize' }}>{obj.visibility}</span>
        </div>
      </div>
    </div>
  )
}

// Format the volume using the unit scale (1 m = 1000 mm, etc.).
function formatVolume(mm3: number, units: string): string {
  let value = mm3
  let label = 'mm³'
  if (units === 'cm') { value = mm3 / 1000; label = 'cm³' }
  else if (units === 'm') { value = mm3 / 1e9; label = 'm³' }
  else if (units === 'inch') { value = mm3 / 16387.064; label = 'in³' }
  if (value >= 1000) return `${(value / 1000).toFixed(2)}k ${label}`
  if (value >= 1) return `${value.toFixed(2)} ${label}`
  return `${value.toFixed(4)} ${label}`
}

// ─── Number input primitive (with stepper buttons) ───────────────────────

function NumberInput({
  label,
  value,
  onChange,
  onReset,
  step = 1,
  precision = 2,
  min,
}: {
  label: React.ReactNode
  value: number
  onChange: (v: number) => void
  onReset?: () => void
  step?: number
  precision?: number
  min?: number
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const safe = Number.isFinite(value) ? value : 0
  const display = draft ?? safe.toFixed(precision)
  const bump = (dir: 1 | -1) => {
    setDraft(null)
    let next = safe + dir * step
    if (typeof min === 'number' && next < min) next = min
    onChange(Number(next.toFixed(precision)))
  }
  return (
    <div className="cad-input">
      <div className="cad-input-head">
        <label className="cad-input-label">{label}</label>
        {onReset && (
          <button
            type="button"
            className="cad-input-reset"
            onClick={onReset}
            title="Reset this axis"
            aria-label="Reset axis"
          >
            <ResetIcon size={10} />
          </button>
        )}
      </div>
      <div className="cad-input-wrap">
        <input
          type="number"
          step="any"
          value={display}
          onChange={(e) => {
            setDraft(e.target.value)
            const v = parseFloat(e.target.value)
            if (Number.isFinite(v)) onChange(v)
          }}
          onBlur={() => setDraft(null)}
        />
        <div className="cad-input-steps">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => bump(1)}
            title={`+${step}`}
            aria-label="Increase value"
          >
            <StepUpIcon size={9} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => bump(-1)}
            title={`-${step}`}
            aria-label="Decrease value"
          >
            <StepDownIcon size={9} />
          </button>
        </div>
      </div>
    </div>
  )
}
