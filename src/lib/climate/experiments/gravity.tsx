// Gravity — drop objects on Earth, Moon, Mars, Jupiter, or the Sun.
// Compare two scenarios side-by-side: same drop height on two different
// worlds, or the same world at two different heights. Optionally toggle
// atmospheric drag to see how it slows the fall and reduces impact speed.
// Live height-vs-time traces for both scenarios on the same axes.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClimateStore } from '../store'
import {
  createFreefall,
  step as engineStep,
  gPlanet,
  bodyInfo,
  tFall,
  vImpact,
  State,
  Body,
} from '../engine'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateCanvas } from '../../../components/climate/ClimateCanvas'

const BODIES = ['Moon', 'Mars', 'Earth', 'Jupiter', 'Sun']
const MAX_SAMPLES = 240
const DT_SIM_MAX = 0.02

type Scenario = {
  id: 'A' | 'B'
  body: string
  height: number
  state: State
  samples: { t: number; h: number; v: number }[]
  impacted: { t: number; v: number } | null
}

// Atmosphere density proxies (kg/m³ × drag coefficient · A / m).
// 0 = vacuum (no drag). Calibrated so a 1 kg ball feels noticeable
// drag on Earth but not on the Moon or Mars.
const DRAG_K: Record<string, number> = {
  Moon: 0,
  Mars: 0.02, // thin CO₂ atmosphere
  Earth: 0.12, // sea-level N₂/O₂
  Jupiter: 0.25, // dense H₂/He
  Sun: 0,
}

export function GravityScene() {
  // Two scenarios side by side. Default: A=Earth 1km, B=Moon 1km.
  const [bodyA, setBodyA] = useState<string>('Earth')
  const [bodyB, setBodyB] = useState<string>('Moon')
  const [heightA, setHeightA] = useState<number>(1000)
  const [heightB, setHeightB] = useState<number>(1000)
  const [dragOn, setDragOn] = useState(false)
  const [timeScale, setTimeScale] = useState(1)
  const [, force] = useState(0)

  // Refs for stable step() closure
  const bodyARef = useRef(bodyA); bodyARef.current = bodyA
  const bodyBRef = useRef(bodyB); bodyBRef.current = bodyB
  const heightARef = useRef(heightA); heightARef.current = heightA
  const heightBRef = useRef(heightB); heightBRef.current = heightB
  const dragOnRef = useRef(dragOn); dragOnRef.current = dragOn
  const tsRef = useRef(timeScale); tsRef.current = timeScale

  const scenariosRef = useRef<{
    A: Scenario
    B: Scenario
    uiAccum: number
    lastT: number
  }>({
    A: makeScenario('A', 'Earth', 1000),
    B: makeScenario('B', 'Moon', 1000),
    uiAccum: 0,
    lastT: 0,
  })

  // Recreate scenario state on body / height change
  useEffect(() => {
    scenariosRef.current.A = makeScenario('A', bodyA, heightA)
    force((x) => x + 1)
    const setM = useClimateStore.getState().setMeasurement
    setM('body_A', bodyA)
    setM('g_A', gPlanet(bodyA))
    setM('t_A_theory', tFall(heightA, gPlanet(bodyA)))
    setM('v_A_theory', vImpact(heightA, gPlanet(bodyA)))
  }, [bodyA, heightA])

  useEffect(() => {
    scenariosRef.current.B = makeScenario('B', bodyB, heightB)
    force((x) => x + 1)
    const setM = useClimateStore.getState().setMeasurement
    setM('body_B', bodyB)
    setM('g_B', gPlanet(bodyB))
    setM('t_B_theory', tFall(heightB, gPlanet(bodyB)))
    setM('v_B_theory', vImpact(heightB, gPlanet(bodyB)))
  }, [bodyB, heightB])

  // Drag toggle is a global measurement (it applies to both scenarios).
  useEffect(() => {
    useClimateStore.getState().setMeasurement('drag_on', dragOn ? 1 : 0)
  }, [dragOn])

  const step = useCallback((dtRealSeconds: number) => {
    const dt = Math.min(0.05, dtRealSeconds)
    const ts = tsRef.current
    const dtSim = Math.min(DT_SIM_MAX, dt * ts)
    for (const scen of [scenariosRef.current.A, scenariosRef.current.B]) {
      stepScenario(scen, dtSim, dragOnRef.current)
    }
    force((x) => x + 1)
  }, [])

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawComparison(ctx, w, h, scenariosRef.current.A, scenariosRef.current.B, dragOnRef.current)
  }, [dragOn])

  const A = scenariosRef.current.A
  const B = scenariosRef.current.B
  const gA = gPlanet(bodyA)
  const gB = gPlanet(bodyB)
  const tTheoA = tFall(heightA, gA)
  const tTheoB = tFall(heightB, gB)
  const vTheoA = vImpact(heightA, gA)
  const vTheoB = vImpact(heightB, gB)

  // Swap A↔B for convenience
  const swap = () => {
    const ta = bodyA, tb = bodyB; setBodyA(tb); setBodyB(ta)
    const ha = heightA, hb = heightB; setHeightA(hb); setHeightB(ha)
  }

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Free-Fall — Gravity on Other Worlds</h2>
          <p className="cli-sub">Two worlds, same height — or same world, two heights.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="cli-control">
            <input type="checkbox" checked={dragOn} onChange={(e) => setDragOn(e.target.checked)} />
            Air drag
          </label>
          <button className="cli-control" type="button" onClick={swap}>⇄ Swap A↔B</button>
          <label className="cli-control">
            Time ×
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">{timeScale.toFixed(1)}×</span>
          </label>
        </div>
      </header>

      {/* Scenario A */}
      <ScenarioPanel
        label="A"
        accent="#0EA5E9"
        bodyName={bodyA}
        setBodyName={setBodyA}
        dropHeight={heightA}
        setDropHeight={setHeightA}
        g={gA}
        tTheo={tTheoA}
        vTheo={vTheoA}
        impacted={A.impacted}
      />
      {/* Scenario B */}
      <ScenarioPanel
        label="B"
        accent="#F472B6"
        bodyName={bodyB}
        setBodyName={setBodyB}
        dropHeight={heightB}
        setDropHeight={setHeightB}
        g={gB}
        tTheo={tTheoB}
        vTheo={vTheoB}
        impacted={B.impacted}
      />

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">Live fall</h3>
          <span className="cli-section-meta">side-by-side · same time axis</span>
        </div>
        <div className="cli-section-body" style={{ padding: 0 }}>
          <ClimateCanvas height={220} step={step} draw={draw} />
        </div>
      </section>

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">Height traces</h3>
          <span className="cli-section-meta">h(t) = h₀ − ½gt² (vacuum) or with drag</span>
        </div>
        <div className="cli-section-body" style={{ padding: 12 }}>
          {A.samples.length > 1 || B.samples.length > 1 ? (
            <DualMiniLine
              pointsA={A.samples.map((d, i) => ({ x: d.t, y: d.h }))}
              pointsB={B.samples.map((d, i) => ({ x: d.t, y: d.h }))}
              maxY={Math.max(heightA, heightB)}
              labelA={`A: ${bodyA}`}
              labelB={`B: ${bodyB}`}
            />
          ) : (
            <div className="cli-loading">Collecting samples…</div>
          )}
        </div>
      </section>

      <section className="cli-stat-strip">
        <StatCard
          label="A: impact speed"
          value={vTheoA.toFixed(0)}
          unit="m/s"
          icon="lightning"
          tone={vTheoA > 200 ? 'bad' : vTheoA > 50 ? 'warn' : 'good'}
          sub={
            A.impacted
              ? `Measured: ${A.impacted.v.toFixed(1)} m/s · ${dragOn ? 'with drag' : 'vacuum'}`
              : 'Theoretical'
          }
        />
        <StatCard
          label="A: fall time"
          value={tTheoA.toFixed(2)}
          unit="s"
          icon="compass"
          tone="info"
          sub={`From ${heightA} m on ${bodyA}`}
        />
        <StatCard
          label="B: impact speed"
          value={vTheoB.toFixed(0)}
          unit="m/s"
          icon="lightning"
          tone={vTheoB > 200 ? 'bad' : vTheoB > 50 ? 'warn' : 'good'}
          sub={
            B.impacted
              ? `Measured: ${B.impacted.v.toFixed(1)} m/s · ${dragOn ? 'with drag' : 'vacuum'}`
              : 'Theoretical'
          }
        />
        <StatCard
          label="B: fall time"
          value={tTheoB.toFixed(2)}
          unit="s"
          icon="compass"
          tone="info"
          sub={`From ${heightB} m on ${bodyB}`}
        />
      </section>

      <footer className="cli-foot">
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">t = √(2h/g)</span>
          <span className="cli-formula-chip-meaning">vacuum fall time</span>
        </span>
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">v = √(2gh)</span>
          <span className="cli-formula-chip-meaning">vacuum impact speed</span>
        </span>
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">F_drag = −k·v²</span>
          <span className="cli-formula-chip-meaning">quadratic drag when enabled</span>
        </span>
      </footer>
    </div>
  )
}

// ── ScenarioPanel ────────────────────────────────────────────────────

function ScenarioPanel({
  label,
  accent,
  bodyName,
  setBodyName,
  dropHeight,
  setDropHeight,
  g,
  tTheo,
  vTheo,
  impacted,
}: {
  label: 'A' | 'B'
  accent: string
  bodyName: string
  setBodyName: (s: string) => void
  dropHeight: number
  setDropHeight: (n: number) => void
  g: number
  tTheo: number
  vTheo: number
  impacted: { t: number; v: number } | null
}) {
  return (
    <section className="cli-scenario-row" style={{ borderLeft: `3px solid ${accent}` }}>
      <span className="cli-scenario-tag" style={{ background: accent }}>{label}</span>
      <div className="cli-scenario-body">
        <div className="cli-scenario-top">
          <span className="cli-scenario-g">{g.toFixed(2)}</span>
          <span className="cli-scenario-unit">m/s² · g on {bodyName}</span>
        </div>
        <p className="cli-scenario-summary">
          Drop from <strong>{dropHeight < 1000 ? `${dropHeight} m` : `${(dropHeight / 1000).toFixed(2)} km`}</strong>{' '}
          on <strong>{bodyName}</strong> · t = <strong>{tTheo.toFixed(2)} s</strong> · v ={' '}
          <strong>{vTheo.toFixed(0)} m/s</strong>
          {impacted && (
            <>
              {' · measured '}
              <strong style={{ color: Math.abs(impacted.v - vTheo) < 0.5 ? 'var(--success)' : 'var(--warning)' }}>
                {impacted.v.toFixed(1)} m/s @ {impacted.t.toFixed(2)} s
              </strong>
            </>
          )}
        </p>
      </div>
      <div className="cli-scenario-controls">
        <select
          className="cli-select"
          value={bodyName}
          onChange={(e) => setBodyName(e.target.value)}
        >
          {BODIES.map((b) => (
            <option key={b} value={b}>
              {b} (g = {gPlanet(b).toFixed(2)} m/s²)
            </option>
          ))}
        </select>
        <label className="cli-control">
          Height
          <input
            type="range"
            min={10}
            max={100000}
            step={10}
            value={dropHeight}
            onChange={(e) => setDropHeight(parseFloat(e.target.value))}
          />
          <span className="cli-control-val">
            {dropHeight < 1000 ? `${dropHeight} m` : `${(dropHeight / 1000).toFixed(1)} km`}
          </span>
        </label>
      </div>
    </section>
  )
}

// ── Scenario helpers ─────────────────────────────────────────────────

function makeScenario(id: 'A' | 'B', body: string, height: number): Scenario {
  return {
    id,
    body,
    height,
    state: createFreefall(body, height),
    samples: [],
    impacted: null,
  }
}

function stepScenario(scen: Scenario, dtSim: number, dragOn: boolean) {
  // Optional drag: apply a quadratic drag force on the projectile,
  // proportional to velocity squared. Operates in-place on velocity.
  const k = dragOn ? DRAG_K[scen.body] ?? 0 : 0
  if (k > 0) {
    const proj = scen.state.bodies[1]
    const speed = Math.hypot(proj.vel[0], proj.vel[1])
    if (speed > 0) {
      const f = k * speed * speed
      proj.vel[0] -= (proj.vel[0] / speed) * f * dtSim
      proj.vel[1] -= (proj.vel[1] / speed) * f * dtSim
    }
  }
  engineStep(scen.state, dtSim)
  const primary = scen.state.bodies[0]
  const proj = scen.state.bodies[1]
  const hAbove = proj.pos[0] - primary.radius
  const v = Math.abs(proj.vel[0])
  if (Number.isFinite(hAbove) && Number.isFinite(v)) {
    const last = scen.samples[scen.samples.length - 1]
    const t = (last?.t ?? 0) + dtSim
    scen.samples.push({ t, h: Math.max(0, hAbove), v })
    if (scen.samples.length > MAX_SAMPLES) scen.samples.shift()
  }
  if (proj.pos[0] <= primary.radius && !scen.impacted) {
    const last = scen.samples[scen.samples.length - 1]
    const t = (last?.t ?? 0) + dtSim
    scen.impacted = { t, v: Math.abs(proj.vel[0]) }
  }
}

// ── Canvas renderer ──────────────────────────────────────────────────

function drawComparison(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  A: Scenario,
  B: Scenario,
  dragOn: boolean,
) {
  // Sky background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0B0B12')
  grad.addColorStop(1, '#1E293B')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const halfW = w / 2
  // Divider
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(halfW, 0)
  ctx.lineTo(halfW, h)
  ctx.stroke()
  ctx.setLineDash([])

  drawOneFaller(ctx, 0, halfW, h, A, '#0EA5E9', dragOn)
  drawOneFaller(ctx, halfW, halfW, h, B, '#F472B6', dragOn)
}

function drawOneFaller(
  ctx: CanvasRenderingContext2D,
  x0: number,
  width: number,
  height: number,
  scen: Scenario,
  accent: string,
  dragOn: boolean,
) {
  const primary = scen.state.bodies[0]
  const proj = scen.state.bodies[1]
  const cx = x0 + width / 2
  const worldR = Math.min(width * 0.42, height * 0.45)
  const worldCy = height - worldR * 0.4

  // Ground
  ctx.beginPath()
  ctx.arc(cx, worldCy, worldR, Math.PI, 2 * Math.PI)
  ctx.fillStyle = primary.colour
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Drop column markers
  const hAbove = Math.max(0, proj.pos[0] - primary.radius)
  const frac = Math.min(1, hAbove / Math.max(1, scen.height))
  const topY = worldCy - worldR * 0.95
  const py = topY - (1 - frac) * (topY - 12)

  // Top-of-drop dashed line
  ctx.strokeStyle = `${accent}55`
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(x0, topY)
  ctx.lineTo(x0 + width, topY)
  ctx.stroke()
  ctx.setLineDash([])

  // Velocity vector arrow (length capped)
  const v = Math.abs(proj.vel[0])
  if (hAbove > 1 && v > 0) {
    const vScale = Math.min(60, v * 0.05)
    ctx.beginPath()
    ctx.moveTo(cx, py)
    ctx.lineTo(cx, py + vScale)
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Projectile
  ctx.beginPath()
  ctx.arc(cx, py, 7, 0, 2 * Math.PI)
  ctx.fillStyle = accent
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '11px ui-monospace, monospace'
  ctx.fillText(
    `h = ${scen.height < 1000 ? `${scen.height} m` : `${(scen.height / 1000).toFixed(1)} km`}`,
    x0 + 8,
    topY - 6,
  )
  ctx.fillText(`t = ${scen.state.t.toFixed(2)} s · v = ${v.toFixed(1)} m/s`, x0 + 8, topY + 16)
  ctx.fillText(
    `${scen.id}: ${primary.name} (g=${gPlanet(primary.name).toFixed(2)}) ${dragOn ? '+drag' : ''}`,
    x0 + 8,
    16,
  )
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '13px ui-monospace, monospace'
  ctx.fillText(primary.name, cx - 30, height - 14)
}

// ── MiniLine (dual-series) ───────────────────────────────────────────

function DualMiniLine({
  pointsA,
  pointsB,
  maxY,
  labelA,
  labelB,
}: {
  pointsA: { x: number; y: number }[]
  pointsB: { x: number; y: number }[]
  maxY: number
  labelA: string
  labelB: string
}) {
  const safeA = pointsA.filter((p) => Number.isFinite(p.y))
  const safeB = pointsB.filter((p) => Number.isFinite(p.y))
  if (safeA.length < 2 && safeB.length < 2) return null
  const w = 600
  const h = 160
  const xMax = Math.max(
    safeA[safeA.length - 1]?.x ?? 0,
    safeB[safeB.length - 1]?.x ?? 0,
  )
  const xSpan = Math.max(1e-6, xMax)
  const buildPath = (pts: { x: number; y: number }[]) =>
    pts
      .map((p, i) => {
        const x = 24 + (p.x / xSpan) * (w - 36)
        const y = 12 + (1 - p.y / Math.max(1, maxY)) * (h - 32)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
        <line x1="24" x2={w - 12} y1={h - 12} y2={h - 12} stroke="rgba(255,255,255,0.2)" />
        <line x1="24" x2="24" y1="12" y2={h - 12} stroke="rgba(255,255,255,0.2)" />
        <text x="6" y="14" fontSize="10" fill="rgba(255,255,255,0.5)">h</text>
        <text x={w - 30} y={h - 2} fontSize="10" fill="rgba(255,255,255,0.5)">t (s)</text>
        {safeA.length >= 2 && (
          <path d={buildPath(safeA)} fill="none" stroke="#0EA5E9" strokeWidth="2" />
        )}
        {safeB.length >= 2 && (
          <path d={buildPath(safeB)} fill="none" stroke="#F472B6" strokeWidth="2" strokeDasharray="5 3" />
        )}
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 2, background: '#0EA5E9', marginRight: 6, verticalAlign: 'middle' }} />
          {labelA}
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 2, background: '#F472B6', marginRight: 6, verticalAlign: 'middle' }} />
          {labelB}
        </span>
      </div>
    </div>
  )
}
