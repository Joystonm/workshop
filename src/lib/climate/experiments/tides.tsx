// Tides — Earth–Moon–Sun tidal animation with spring/neap cycle.
// The user can drag the Moon's distance and the Sun's tidal weight.
// We classify the current state as spring / neap / intermediate based
// on the Sun–Moon–Earth angle, track the tide height at a fixed ocean
// point over a 24 h period (sinusoidal modulation at the lunar & solar
// frequencies), and overlay real-world reference facts (Earth-Moon
// system today, M₂ semi-diurnal constituent amplitude).

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useClimateStore } from '../store'
import {
  createTides,
  step as engineStep,
  State,
  distance,
  angle,
  period,
  BODY_SPECS,
  G,
} from '../engine'
import { StatCard } from '../../../components/climate/StatCard'
import { ClimateCanvas } from '../../../components/climate/ClimateCanvas'

const HOUR_S = 3600
const DAY_S = 86400
const MAX_SAMPLES = 240

type TidePhase = 'spring' | 'neap' | 'intermediate'

/** Classify based on Sun–Moon–Earth angle. 0° (collinear) → spring,
 *  90° (perpendicular) → neap. ±1° dead-band so the label is stable. */
function classifyTide(sunMoonEarthDeg: number): TidePhase {
  const a = Math.abs(((sunMoonEarthDeg + 180) % 360) - 180)
  if (a < 10 || a > 170) return 'spring'
  if (a > 80 && a < 100) return 'neap'
  return 'intermediate'
}

/** Spring factor: 1.0 at perfect alignment, 0.5 at quadrature. */
function springFactor(sunMoonEarthDeg: number): number {
  const a = Math.abs(((sunMoonEarthDeg + 180) % 360) - 180)
  const cosine = Math.cos((a * Math.PI) / 180)
  return 0.5 * (1 + cosine) // 1 at 0°, 0.5 at 90°
}

export function TidesScene() {
  const [moonDistanceEarthRadii, setMoonDistanceEarthRadii] = useState<number>(60)
  const [sunStrength, setSunStrength] = useState<number>(0.46)
  const [timeScale, setTimeScale] = useState<number>(20) // sim-hours per real-second

  // Refs so the canvas step() closure (created once) reads latest values
  const moonDistRef = useRef(moonDistanceEarthRadii)
  moonDistRef.current = moonDistanceEarthRadii
  const sunRef = useRef(sunStrength)
  sunRef.current = sunStrength
  const timeScaleRef = useRef(timeScale)
  timeScaleRef.current = timeScale

  const stateRef = useRef<State>(createTides(moonDistanceEarthRadii, sunStrength))
  const samplesRef = useRef<{ t: number; amp: number }[]>([])
  const cycleRef = useRef<{ hour: number; height: number }[]>([])
  const [, force] = useState(0)

  // Real-world reference: Earth-Moon system at current epoch is ~60 R⊕
  // with M2 dominant constituent producing ~38 cm of half-amplitude at
  // the lunar-tide frequency. Solar M2K ≈ 19 cm. Real spring range
  // peaks ≈ 0.8 m amplitude near perigee-syzygy.
  const REAL_MOON_DISTANCE_R = 60.3
  const REAL_LUNAR_M2_M = 0.376 // metres, dominant lunar semi-diurnal
  const REAL_SOLAR_S2_M = 0.188

  useEffect(() => {
    stateRef.current = createTides(moonDistanceEarthRadii, sunStrength)
    samplesRef.current = []
    cycleRef.current = []
    force((x) => x + 1)
    const setM = useClimateStore.getState().setMeasurement
    const earth = stateRef.current.bodies[0]
    const moon = stateRef.current.bodies[1]
    const sun = stateRef.current.bodies[2]
    setM('moon_distance_earth_radii', moonDistanceEarthRadii)
    setM('sun_strength', sunStrength)
    setM('moon_period_days', period(earth.mass, distance(moon, earth)) / DAY_S)
    const aM = (angle(moon) * 180) / Math.PI
    const aS = (angle(sun) * 180) / Math.PI
    let sMer = aS - aM
    while (sMer < -180) sMer += 360
    while (sMer > 180) sMer -= 360
    setM('sun_moon_earth_deg', sMer)
    setM('spring_factor', springFactor(sMer))
  }, [moonDistanceEarthRadii, sunStrength])

  const step = useCallback((dtRealSeconds: number) => {
    const dt = Math.min(0.05, dtRealSeconds)
    const dtSimHours = dt * timeScaleRef.current
    const dtSim = dtSimHours * HOUR_S
    engineStep(stateRef.current, dtSim)
    // Sample — both raw instantaneous tide force and the 24 h envelope.
    const earth = stateRef.current.bodies[0]
    const moon = stateRef.current.bodies[1]
    const sun = stateRef.current.bodies[2]
    const R = BODY_SPECS.Earth.radius
    const mM = BODY_SPECS.Moon.mass
    const mS = BODY_SPECS.Sun.mass * sunRef.current
    const rM = distance(moon, earth)
    const rS = distance(sun, earth)
    const lunarTide = (2 * G * mM * R) / Math.pow(rM, 3)
    const solarTide = (2 * G * mS * R) / Math.pow(rS, 3)
    const total = lunarTide + solarTide
    if (Number.isFinite(total)) {
      const last = samplesRef.current[samplesRef.current.length - 1]
      const t = (last?.t ?? 0) + dtSimHours
      samplesRef.current.push({ t, amp: total })
      if (samplesRef.current.length > MAX_SAMPLES) samplesRef.current.shift()
      // Sample the 24 h envelope as well (point on equator facing the
      // sub-lunar meridian). Hour = t mod 24.
      const localHour = t % 24
      const lunarHeight =
        (lunarTide / total) * Math.cos((localHour / 12.42) * 2 * Math.PI)
      const solarHeight =
        (solarTide / total) * Math.cos((localHour / 12) * 2 * Math.PI)
      const height = lunarHeight + solarHeight
      // Append to a 48-sample moving 24 h window for the chart.
      const cycle = cycleRef.current
      const cycleLastHour = cycle[cycle.length - 1]?.hour ?? -1
      if (Math.abs(localHour - cycleLastHour) > 0.5) {
        cycle.push({ hour: localHour, height })
        if (cycle.length > 48) cycle.shift()
      }
    }
    force((x) => x + 1)
  }, [])

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawTides(ctx, w, h, stateRef.current, moonDistRef.current, sunRef.current)
  }, [])

  const s = stateRef.current
  const earth = s.bodies[0]
  const moon = s.bodies[1]
  const sun = s.bodies[2]
  const moonAngle = (angle(moon) * 180) / Math.PI
  const sunAngle = (angle(sun) * 180) / Math.PI
  // Sun-Moon-Earth angle as observed from Earth.
  let sunMoonEarthDeg = sunAngle - moonAngle
  while (sunMoonEarthDeg < -180) sunMoonEarthDeg += 360
  while (sunMoonEarthDeg > 180) sunMoonEarthDeg -= 360
  const phase = classifyTide(sunMoonEarthDeg)
  const spring = springFactor(sunMoonEarthDeg)

  const moonDistEarthRadii = distance(moon, earth) / BODY_SPECS.Earth.radius
  const moonPeriodDays = period(earth.mass, distance(moon, earth)) / DAY_S

  // Lunar / solar tide forces
  const R = BODY_SPECS.Earth.radius
  const rM = distance(moon, earth)
  const rS = distance(sun, earth)
  const lunarTideForce = (2 * G * BODY_SPECS.Moon.mass * R) / Math.pow(rM, 3)
  const solarTideForce = (2 * G * BODY_SPECS.Sun.mass * sunStrength * R) / Math.pow(rS, 3)
  const total = lunarTideForce + solarTideForce
  const ratio = lunarTideForce / Math.max(1e-30, solarTideForce)

  // Predicted amplitude in metres for a station at the sub-lunar equator:
  // amp ≈ M2 · cos(t·2π/12.42h) + S2 · cos(t·2π/12h)
  const lunarAmpM = (lunarTideForce / total) * REAL_LUNAR_M2_M
  const solarAmpM = (solarTideForce / total) * REAL_SOLAR_S2_M
  const eqMaxM = lunarAmpM + solarAmpM
  const eqMinM = lunarAmpM - solarAmpM

  return (
    <div className="cli">
      <header className="cli-head">
        <div>
          <h2 className="cli-title">Tides — Earth, Moon &amp; Sun</h2>
          <p className="cli-sub">Spring vs neap · 24 h cycle at a fixed ocean point</p>
        </div>
      </header>

      <section
        className="cli-scenario-row"
        style={{
          borderLeft: `3px solid ${
            phase === 'spring' ? 'var(--bad)' : phase === 'neap' ? 'var(--good)' : 'var(--text-muted)'
          }`,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 6,
            height: 28,
            borderRadius: 3,
            background:
              phase === 'spring'
                ? 'var(--bad)'
                : phase === 'neap'
                ? 'var(--good)'
                : 'var(--text-muted)',
          }}
        />
        <div className="cli-scenario-body">
          <div className="cli-scenario-top">
            <span className="cli-scenario-g">{(spring * 100).toFixed(0)}%</span>
            <span
              className="cli-scenario-unit"
              style={{
                color:
                  phase === 'spring'
                    ? 'var(--bad)'
                    : phase === 'neap'
                    ? 'var(--good)'
                    : 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {phase} tide
            </span>
            <span className="cli-scenario-unit">· Sun-Moon-Earth alignment</span>
          </div>
          <p className="cli-scenario-summary">
            Angle{' '}
            <strong>{sunMoonEarthDeg > 0 ? '+' : ''}{sunMoonEarthDeg.toFixed(0)}°</strong>{' '}
            · Moon at <strong>{moonDistEarthRadii.toFixed(1)} R⊕</strong>{' '}
            · lunar / solar <strong>{ratio.toFixed(2)}×</strong>.{' '}
            {phase === 'spring' && (
              <span style={{ color: 'var(--bad)' }}>Syzygy — largest tidal range.</span>
            )}
            {phase === 'neap' && (
              <span style={{ color: 'var(--good)' }}>Quadrature — smallest tidal range.</span>
            )}
            {phase === 'intermediate' && (
              <span style={{ color: 'var(--text-secondary)' }}>
                Scaling toward {sunMoonEarthDeg > 0 ? 'spring' : 'neap'}.
              </span>
            )}
          </p>
        </div>
        <div className="cli-scenario-controls">
          <label className="cli-control">
            Moon dist
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={moonDistanceEarthRadii}
              onChange={(e) => setMoonDistanceEarthRadii(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">{moonDistanceEarthRadii} R⊕</span>
          </label>
          <label className="cli-control">
            Solar
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={sunStrength}
              onChange={(e) => setSunStrength(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">{(sunStrength * 100).toFixed(0)}%</span>
          </label>
          <label className="cli-control">
            Time ×
            <input
              type="range"
              min={1}
              max={80}
              step={1}
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            />
            <span className="cli-control-val">{timeScale}×</span>
          </label>
        </div>
      </section>

      <section className="cli-stat-strip">
        <StatCard
          label="Lunar/Solar ratio"
          value={ratio.toFixed(2)}
          unit="×"
          icon="wave"
          tone={ratio < 1 ? 'bad' : 'good'}
          sub={`Real value at ${REAL_MOON_DISTANCE_R} R⊕ is ≈ 2.18`}
        />
        <StatCard
          label="Lunar height (M2)"
          value={lunarAmpM.toFixed(3)}
          unit="m"
          icon="tide"
          tone="info"
          sub={`Peak semi-diurnal at moon altitude`}
        />
        <StatCard
          label="Solar height (S2)"
          value={solarAmpM.toFixed(3)}
          unit="m"
          icon="sun"
          tone="warn"
          sub={`Smaller semi-diurnal contribution`}
        />
        <StatCard
          label="Moon orbital period"
          value={moonPeriodDays.toFixed(2)}
          unit="d"
          icon="compass"
          tone="info"
          sub="Kepler's 3rd: T² = 4π²a³/(GM)"
        />
      </section>

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">Live tidal system</h3>
          <span className="cli-section-meta">
            phase <strong>{phase}</strong> · spring {(spring * 100).toFixed(0)}%
          </span>
        </div>
        <div className="cli-section-body" style={{ padding: 0 }}>
          <ClimateCanvas height={300} step={step} draw={draw} />
        </div>
      </section>

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">24 h tide cycle at a fixed ocean point</h3>
          <span className="cli-section-meta">
            modelled: M2 (12.42 h) + S2 (12 h) · peak{' '}
            <strong>{eqMaxM.toFixed(2)} m</strong> · trough{' '}
            <strong>{eqMinM.toFixed(2)} m</strong>
          </span>
        </div>
        <div className="cli-section-body" style={{ padding: 12 }}>
          {cycleRef.current.length > 4 ? (
            <TideCycleChart
              samples={cycleRef.current}
              maxAmpM={Math.max(0.5, eqMaxM)}
              phase={phase}
            />
          ) : (
            <div className="cli-loading">Collecting tidal samples…</div>
          )}
        </div>
      </section>

      <section className="cli-section">
        <div className="cli-section-head">
          <h3 className="cli-section-title">Total tidal force vs time</h3>
          <span className="cli-section-meta">dF ∝ M/r³ — instantaneous differential force</span>
        </div>
        <div className="cli-section-body" style={{ padding: 12 }}>
          {samplesRef.current.length > 1 ? (
            <MiniLine
              points={samplesRef.current.map((s, i) => ({ x: i, y: s.amp }))}
              color="#0EA5E9"
            />
          ) : (
            <div className="cli-loading">Collecting samples…</div>
          )}
        </div>
      </section>

      <footer className="cli-foot">
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">F_tide ∝ M/r³</span>
          <span className="cli-formula-chip-meaning">Differential pull on a thin ocean shell</span>
        </span>
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">spring ∝ ½(1 + cos Δ)</span>
          <span className="cli-formula-chip-meaning">Spring factor from Sun-Moon-Earth angle</span>
        </span>
        <span className="cli-formula-chip">
          <span className="cli-formula-chip-symbol">T² = 4π²a³/GM</span>
          <span className="cli-formula-chip-meaning">Kepler's 3rd — sidereal month from orbital radius</span>
        </span>
      </footer>
    </div>
  )
}

// ── Canvas renderer ──────────────────────────────────────────────────

function drawTides(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: State,
  moonDistanceEarthRadii: number,
  sunStrength: number,
) {
  void sunStrength

  // Stars
  ctx.fillStyle = '#0B0B12'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 80; i++) {
    const sx = (i * 1103515245 + 12345) % w
    const sy = (i * 22695477 + 12345) % h
    ctx.fillStyle = `rgba(255,255,255,${0.1 + ((i % 5) / 12)})`
    ctx.fillRect(sx, sy, 1, 1)
  }

  const earth = state.bodies[0]
  const moon = state.bodies[1]
  const sun = state.bodies[2]

  const cx = w / 2
  const cy = h / 2
  const earthPx = 56
  const maxMoonPx = Math.min(w, h) * 0.42
  const moonPx = Math.min(maxMoonPx, Math.max(70, (moonDistanceEarthRadii / 100) * maxMoonPx))

  const moonAngle = angle(moon)
  const sunAngle = angle(sun)
  const mx = cx + Math.cos(moonAngle) * moonPx
  const my = cy + Math.sin(moonAngle) * moonPx

  // Spring/neap tint for bulge
  let sMer = sunAngle - moonAngle
  while (sMer < -Math.PI) sMer += 2 * Math.PI
  while (sMer > Math.PI) sMer -= 2 * Math.PI
  const phase = classifyTide((sMer * 180) / Math.PI)
  const bulgeAmp = phase === 'spring' ? 1.32 : phase === 'neap' ? 1.06 : 1.18

  // Tidal bulge ellipse (rotated to align with moon line)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(moonAngle)
  const bulgeX = earthPx * bulgeAmp
  const bulgeY = earthPx * 0.85
  ctx.beginPath()
  ctx.ellipse(0, 0, bulgeX, bulgeY, 0, 0, 2 * Math.PI)
  // Spring: warmer; neap: cooler
  const grad = ctx.createLinearGradient(-bulgeX, 0, bulgeX, 0)
  if (phase === 'spring') {
    grad.addColorStop(0, '#7F1D1D')
    grad.addColorStop(0.5, '#EF4444')
    grad.addColorStop(1, '#7F1D1D')
  } else if (phase === 'neap') {
    grad.addColorStop(0, '#064E3B')
    grad.addColorStop(0.5, '#10B981')
    grad.addColorStop(1, '#064E3B')
  } else {
    grad.addColorStop(0, '#1E3A8A')
    grad.addColorStop(0.5, '#3B82F6')
    grad.addColorStop(1, '#1E3A8A')
  }
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()

  // Bulge marker dots (high-tide points along moon line)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  for (const sign of [1, -1]) {
    ctx.beginPath()
    ctx.arc(
      cx + Math.cos(moonAngle) * earthPx * (bulgeAmp + 0.08) * sign,
      cy + Math.sin(moonAngle) * earthPx * (bulgeAmp + 0.08) * sign,
      3.5,
      0,
      2 * Math.PI,
    )
    ctx.fill()
  }

  // Earth label
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '11px ui-monospace, monospace'
  ctx.fillText('EARTH', cx - 18, cy + 5)

  // Earth–Moon line
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(mx, my)
  ctx.stroke()
  ctx.setLineDash([])

  // Sun direction indicator (small arrow at edge of canvas)
  const arrowX = cx + Math.cos(sunAngle) * (w * 0.46)
  const arrowY = cy + Math.sin(sunAngle) * (h * 0.46)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)'
  ctx.beginPath()
  ctx.arc(arrowX, arrowY, 6, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)'
  ctx.font = '10px ui-monospace, monospace'
  ctx.fillText('SUN', arrowX + 8, arrowY + 4)

  // Moon
  const moonR = 14
  const moonGrad = ctx.createRadialGradient(mx - 4, my - 4, 1, mx, my, moonR)
  moonGrad.addColorStop(0, '#F3F4F6')
  moonGrad.addColorStop(1, '#9CA3AF')
  ctx.beginPath()
  ctx.arc(mx, my, moonR, 0, 2 * Math.PI)
  ctx.fillStyle = moonGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '11px ui-monospace, monospace'
  ctx.fillText('MOON', mx - 16, my - moonR - 8)

  // Phase chip in upper-left
  ctx.fillStyle =
    phase === 'spring'
      ? 'rgba(239, 68, 68, 0.85)'
      : phase === 'neap'
      ? 'rgba(34, 197, 94, 0.85)'
      : 'rgba(148, 163, 184, 0.85)'
  ctx.font = 'bold 11px ui-monospace, monospace'
  ctx.fillText(`PHASE: ${phase.toUpperCase()}`, 12, 18)
}

// ── 24 h tide cycle chart ────────────────────────────────────────────

function TideCycleChart({
  samples,
  maxAmpM,
  phase,
}: {
  samples: { hour: number; height: number }[]
  maxAmpM: number
  phase: TidePhase
}) {
  const w = 600
  const h = 160
  if (samples.length < 2) return null
  const path = samples
    .map((p, i) => {
      const x = 24 + ((p.hour / 24) * (w - 36))
      const y = 12 + (0.5 - p.height / Math.max(0.5, maxAmpM * 1.4)) * (h - 32)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const stroke = phase === 'spring' ? '#EF4444' : phase === 'neap' ? '#10B981' : '#3B82F6'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      {/* Zero line (mean sea level) */}
      <line
        x1="24"
        x2={w - 12}
        y1={h / 2}
        y2={h / 2}
        stroke="rgba(255,255,255,0.25)"
        strokeDasharray="4 6"
      />
      {/* Hour ticks */}
      {[0, 6, 12, 18, 24].map((hr) => (
        <g key={hr}>
          <line
            x1={24 + (hr / 24) * (w - 36)}
            x2={24 + (hr / 24) * (w - 36)}
            y1={h - 12}
            y2={h - 16}
            stroke="rgba(255,255,255,0.4)"
          />
          <text
            x={24 + (hr / 24) * (w - 36)}
            y={h - 2}
            fontSize="10"
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
          >
            {hr}h
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" />
      <text x="6" y="14" fontSize="10" fill="rgba(255,255,255,0.5)">η (m)</text>
    </svg>
  )
}

// ── MiniLine (force series) ──────────────────────────────────────────

function MiniLine({
  points,
  color,
}: {
  points: { x: number; y: number }[]
  color: string
}) {
  const safe = points.filter((p) => Number.isFinite(p.y))
  if (safe.length < 2) return null
  const w = 600
  const h = 140
  const ys = safe.map((p) => p.y)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const range = Math.max(1e-30, yMax - yMin)
  const path = safe
    .map((p, i) => {
      const x = 24 + (i / (safe.length - 1)) * (w - 36)
      const y = 12 + (1 - (p.y - yMin) / range) * (h - 32)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      <line x1="24" x2={w - 12} y1={h - 12} y2={h - 12} stroke="rgba(255,255,255,0.2)" />
      <line x1="24" x2="24" y1="12" y2={h - 12} stroke="rgba(255,255,255,0.2)" />
      <text x="6" y="14" fontSize="10" fill="rgba(255,255,255,0.5)">F</text>
      <text x={w - 30} y={h - 2} fontSize="10" fill="rgba(255,255,255,0.5)">t</text>
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}
