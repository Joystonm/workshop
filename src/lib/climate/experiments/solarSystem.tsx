// Solar System — Sun + 8 planets + Pluto orbiting under gravity.
// Real masses, real semi-major axes. Time-speed presets let the user
// watch a year in seconds. Distance scale is logarithmic so all
// planets are visible at once. Planet trails, period measurement,
// and zoom views turn this from a screensaver into a real tool.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClimateStore } from '../store'
import {
  createSolarSystem,
  step as engineStep,
  ORBITAL_DATA,
  State,
  Body,
  period,
  angle,
} from '../engine'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateCanvas } from '../../../components/climate/ClimateCanvas'

const DAY_S = 86400
const AU = 1.495978707e11
const TRAIL_LEN = 90 // number of positions kept per planet trail

type View = 'all' | 'inner' | 'outer'

export function SolarSystemScene() {
  const [timeScale, setTimeScale] = useState<number>(8) // sim-days per real-second
  const [view, setView] = useState<View>('all')
  const [trailOn, setTrailOn] = useState(true)
  const [focus, setFocus] = useState<string>('Earth')

  const timeScaleRef = useRef(timeScale)
  timeScaleRef.current = timeScale
  const trailOnRef = useRef(trailOn)
  trailOnRef.current = trailOn

  // Engine state + per-planet position trails
  const stateRef = useRef<State>(createSolarSystem())
  const trailsRef = useRef<Record<string, [number, number][]>>({})
  // Initialise trail buffers
  if (Object.keys(trailsRef.current).length === 0) {
    for (const b of stateRef.current.bodies) trailsRef.current[b.name] = []
  }
  // Measured Earth-crossing time → Earth orbital period in sim-days
  const lastEarthAngleRef = useRef<number>(0)
  const earthCrossingsRef = useRef<{ t: number; ang: number }[]>([])
  // UI mirror
  const [, tick] = useState(0)
  const [elapsedDays, setElapsedDays] = useState(0)

  const reset = () => {
    stateRef.current = createSolarSystem()
    trailsRef.current = {}
    for (const b of stateRef.current.bodies) trailsRef.current[b.name] = []
    earthCrossingsRef.current = []
    lastEarthAngleRef.current = angle(stateRef.current.bodies.find((b) => b.name === 'Earth')!)
    setElapsedDays(0)
    tick((n) => n + 1)
    useClimateStore.getState().setMeasurement('sim_years_elapsed', 0)
  }

  // Preset time-speed anchors
  const presets = [
    { label: 'real-time', value: 1 / 365.25 }, // 1 sim-day per 365.25 real-seconds
    { label: '1 day/s', value: 1 },
    { label: '1 week/s', value: 7 },
    { label: '1 month/s', value: 30 },
    { label: '1 year/s', value: 365.25 },
    { label: '10 yr/s', value: 3652.5 },
  ]

  const uiAccumRef = useRef(0)
  const uiLastRef = useRef(0)

  const step = useCallback((dtRealSeconds: number) => {
    const dt = Math.min(0.05, dtRealSeconds)
    const ts = timeScaleRef.current
    const simDays = dt * ts
    engineStep(stateRef.current, simDays * DAY_S)

    // Trails: push current position into each planet's ring buffer
    if (trailOnRef.current) {
      for (const b of stateRef.current.bodies) {
        if (b.name === 'Sun') continue
        const buf = trailsRef.current[b.name] ?? (trailsRef.current[b.name] = [])
        buf.push([b.pos[0], b.pos[1]])
        if (buf.length > TRAIL_LEN) buf.shift()
      }
    } else {
      for (const k of Object.keys(trailsRef.current)) trailsRef.current[k].length = 0
    }

    // Detect Earth crossing 0° (positive-x axis) to measure its period
    const earth = stateRef.current.bodies.find((b) => b.name === 'Earth')!
    const earthAng = angle(earth)
    const last = lastEarthAngleRef.current
    if (last < 0 && earthAng >= 0) {
      // crossed +x going counter-clockwise — but we orbit CW so check opposite
    }
    // Actually we initialise Earth at angle 0 with +y velocity, so it orbits
    // CW (negative direction). Crossings occur when ang wraps from -π → π.
    if (last > Math.PI * 0.9 && earthAng < -Math.PI * 0.9) {
      // wrapped from +π to -π — Earth completed a full revolution
      const t = stateRef.current.t
      const arr = earthCrossingsRef.current
      arr.push({ t, ang: earthAng })
      if (arr.length > 8) arr.shift()
    }
    lastEarthAngleRef.current = earthAng

    // Throttled UI updates ~6 Hz
    uiAccumRef.current += dt
    if (uiAccumRef.current - uiLastRef.current >= 0.16) {
      const dtElapsed = uiAccumRef.current * ts
      uiLastRef.current = uiAccumRef.current
      uiAccumRef.current = 0
      setElapsedDays((d) => d + dtElapsed)
      tick((n) => n + 1)
      const sun = stateRef.current.bodies[0]
      const simYears = stateRef.current.t / ORBITAL_DATA.Earth.period_s
      const earthAngle = (earthAng * 180) / Math.PI
      const earthDist = Math.hypot(earth.pos[0] - sun.pos[0], earth.pos[1] - sun.pos[1]) / AU
      const setM = useClimateStore.getState().setMeasurement
      setM('sim_years_elapsed', simYears)
      setM('earth_angle_deg', earthAngle)
      setM('earth_distance_au', earthDist)
      setM('focus_planet', focus)
    }
  }, [focus])

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawSolarSystem(ctx, w, h, stateRef.current, trailsRef.current, view, focus)
  }, [view, focus])

  const s = stateRef.current
  const sun = s.bodies[0]
  const earth = s.bodies.find((b) => b.name === 'Earth')!
  const mercury = s.bodies.find((b) => b.name === 'Mercury')!
  const mars = s.bodies.find((b) => b.name === 'Mars')!

  // Theoretical periods
  const earthPeriodDays = period(sun.mass, ORBITAL_DATA.Earth.a) / DAY_S
  const mercuryPeriodDays = period(sun.mass, ORBITAL_DATA.Mercury.a) / DAY_S
  const marsPeriodDays = period(sun.mass, ORBITAL_DATA.Mars.a) / DAY_S

  // Measured Earth period (mean of last N crossings)
  const measuredEarthDays = useMemo(() => {
    const xs = earthCrossingsRef.current
    if (xs.length < 2) return null
    const diffs: number[] = []
    for (let i = 1; i < xs.length; i++) diffs.push(xs[i].t - xs[i - 1].t)
    return diffs.reduce((a, b) => a + b, 0) / diffs.length / DAY_S
  }, [elapsedDays])

  const measuredVsTheoretical = measuredEarthDays
    ? ((measuredEarthDays - earthPeriodDays) / earthPeriodDays) * 100
    : null

  const simYears = s.t / ORBITAL_DATA.Earth.period_s

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Solar System</h2>
          <p className="cli-sub">Newtonian gravity · real masses &amp; semi-major axes</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="cli-control" onClick={reset} type="button">↻ Reset</button>
          <label className="cli-control">
            <input
              type="checkbox"
              checked={trailOn}
              onChange={(e) => setTrailOn(e.target.checked)}
            />
            Trails
          </label>
          <div className="cli-control" style={{ gap: 4 }}>
            {(['all', 'inner', 'outer'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={view === v ? 'cli-tab is-active' : 'cli-tab'}
                style={{
                  background: view === v ? 'var(--ws-climate)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <label className="cli-control">
            Time speed
            <input
              type="range"
              min={0}
              max={40}
              step={0.5}
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">{timeScale.toFixed(1)} d/s</span>
          </label>
        </div>
      </header>

      <section className="cli-scenario-row" style={{ borderLeft: '3px solid var(--warning, #D97706)' }}>
        <div
          aria-hidden
          style={{
            width: 6,
            height: 32,
            borderRadius: 3,
            background: 'var(--warning, #D97706)',
          }}
        />
        <div className="cli-scenario-body">
          <div className="cli-scenario-top">
            <span className="cli-scenario-g">{simYears.toFixed(2)}</span>
            <span className="cli-scenario-unit">sim yr · {Math.round(elapsedDays).toLocaleString()} d elapsed</span>
          </div>
          <p className="cli-scenario-summary">
            Focus <strong>{focus}</strong> · Earth at{' '}
            <strong>{((angle(earth) * 180) / Math.PI).toFixed(0)}°</strong> ·{' '}
            {((timeScale / 365.25)).toFixed(2)} sim-yr/s
            {measuredEarthDays ? (
              <>
                {' · measured Earth period '}
                <strong>{measuredEarthDays.toFixed(1)} d</strong>{' '}
                <span style={{ color: Math.abs(measuredVsTheoretical!) < 1 ? 'var(--success)' : 'var(--warning)' }}>
                  ({measuredVsTheoretical! > 0 ? '+' : ''}{measuredVsTheoretical!.toFixed(2)}% vs Kepler)
                </span>
              </>
            ) : (
              ' · waiting for first Earth orbit…'
            )}
          </p>
        </div>
        <div className="cli-scenario-controls">
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFocus(n)}
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 3,
                  background: focus === n ? 'var(--bg-tertiary)' : 'transparent',
                  color: focus === n ? 'var(--ws-climate)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '0 2px', fontFamily: 'var(--font-mono)' }}>
        Presets: {presets.map((p) => `${p.label} = ${p.value.toFixed(2)} d/s`).join(' · ')}
      </div>

      <section className="cli-stat-strip">
        <StatCard
          label="Earth period"
          value={earthPeriodDays.toFixed(2)}
          unit="d"
          icon="earth"
          tone="info"
          sub={
            measuredEarthDays
              ? `Measured: ${measuredEarthDays.toFixed(2)} d`
              : 'Wait one full orbit…'
          }
        />
        <StatCard
          label="Mercury period"
          value={mercuryPeriodDays.toFixed(1)}
          unit="d"
          icon="trend"
          tone="warn"
          sub="0.39 AU · fastest planet"
        />
        <StatCard
          label="Mars period"
          value={marsPeriodDays.toFixed(0)}
          unit="d"
          icon="compass"
          tone="info"
          sub="1.52 AU · outer neighbour"
        />
      </section>

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">Live orbits</h3>
          <span className="cli-section-meta">
            log-scaled radii · view: {view}
            {view === 'inner' ? ' (Mercury–Mars)' : view === 'outer' ? ' (Jupiter–Pluto)' : ' (all 9)'}
          </span>
        </div>
        <div className="cli-section-body" style={{ padding: 0 }}>
          <ClimateCanvas height={340} step={step} draw={draw} />
        </div>
      </section>

      <footer className="cli-foot">
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">F = G·m₁·m₂ / r²</span>
          <span className="cli-formula-chip-meaning">Newton's law of universal gravitation</span>
        </span>
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">T² = 4π²a³/(GM)</span>
          <span className="cli-formula-chip-meaning">Kepler's 3rd — verified live against sim</span>
        </span>
      </footer>
    </div>
  )
}

// ── Canvas renderer ──────────────────────────────────────────────────

function drawSolarSystem(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: State,
  trails: Record<string, [number, number][]>,
  view: View,
  focusName: string,
) {
  // Stars
  ctx.fillStyle = '#0B0B12'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 100; i++) {
    const sx = (i * 1103515245 + 12345) % w
    const sy = (i * 22695477 + 12345) % h
    ctx.fillStyle = `rgba(255,255,255,${0.1 + ((i % 5) / 14)})`
    ctx.fillRect(sx, sy, 1, 1)
  }

  const cx = w / 2
  const cy = h / 2

  // Pick log-scale window based on view
  let minR: number, maxR: number
  if (view === 'inner') {
    minR = 0.3
    maxR = 2.0
  } else if (view === 'outer') {
    minR = 3
    maxR = 45
  } else {
    minR = 0.3
    maxR = 32
  }
  const minLog = Math.log10(minR)
  const maxLog = Math.log10(maxR)
  const span = maxLog - minLog
  const maxPx = Math.min(w, h) * 0.45
  const r2px = (au: number) => {
    const clamped = Math.max(minR, Math.min(maxR, au))
    const t = (Math.log10(clamped) - minLog) / span
    return t * maxPx
  }

  // Orbit rings (real semi-major axes)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)'
  ctx.lineWidth = 1
  for (let i = 1; i < state.bodies.length; i++) {
    const b = state.bodies[i]
    const a = ORBITAL_DATA[b.name]?.a ?? 0
    const rAU = a / AU
    if (view === 'inner' && rAU > 2) continue
    if (view === 'outer' && rAU < 3) continue
    const r = r2px(rAU)
    if (r <= 0) continue
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Trails: draw faded polylines for each planet's recent path
  ctx.lineWidth = 1.2
  for (const name of Object.keys(trails)) {
    const buf = trails[name]
    if (!buf || buf.length < 2) continue
    const spec = state.bodies.find((b) => b.name === name)
    if (!spec) continue
    ctx.beginPath()
    for (let i = 0; i < buf.length; i++) {
      const [xM, yM] = buf[i]
      const rAU = Math.hypot(xM, yM) / AU
      const r = r2px(rAU)
      const ang = Math.atan2(yM, xM)
      const px = cx + Math.cos(ang) * r
      const py = cy + Math.sin(ang) * r
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.strokeStyle = spec.colour + 'AA' // ~67% alpha
    ctx.stroke()
  }

  // Planets
  for (const b of state.bodies) {
    const xM = b.pos[0]
    const yM = b.pos[1]
    const rAU = Math.hypot(xM, yM) / AU
    const r = r2px(rAU)
    const ang = Math.atan2(yM, xM)
    const px = cx + Math.cos(ang) * r
    const py = cy + Math.sin(ang) * r
    const dotR = b.name === 'Sun' ? 16 : Math.max(2.5, Math.log10(Math.max(1, rAU)) * 4)
    ctx.beginPath()
    ctx.arc(px, py, dotR, 0, 2 * Math.PI)
    ctx.fillStyle = b.colour
    ctx.fill()
    if (b.name === 'Sun') {
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 26)
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.5)')
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(px, py, 26, 0, 2 * Math.PI)
      ctx.fill()
    } else if (b.name === focusName) {
      // Highlight ring around focused planet
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.9)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(px, py, dotR + 5, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 11px ui-monospace, monospace'
      ctx.fillText(`${b.name} • ${rAU.toFixed(3)} AU`, px + dotR + 8, py + 4)
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '10px ui-monospace, monospace'
      ctx.fillText(b.name, px + dotR + 4, py - dotR - 4)
    }
  }

  // Scale bar: how many AU does one tick represent?
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '10px ui-monospace, monospace'
  ctx.fillText(`view: ${view} · log-scale ${minR}–${maxR} AU`, 8, h - 8)
}
