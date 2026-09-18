// Titration scene. Pick an acid + base, dial in the volume of titrant
// added, and watch the pH curve climb with a sharp equivalence-point
// inflection. A first-derivative curve below the pH curve highlights
// the equivalence point. An animated burette on the right ticks drops
// into the flask, whose liquid changes colour with pH.
//
// Math supported:
//   - Strong/strong: piecewise before/after equivalence, pH 7 at equivalence.
//   - Weak acid / strong base: Henderson–Hasselbalch before equivalence;
//     hydrolysis at equivalence; excess OH⁻ after.

import { useEffect, useRef, useMemo, useState } from 'react'
import { useChemistryStore } from '../../../lib/chemistry/store'
import { SOLUTIONS, compute, type Solution, type ComputedSolution } from '../../../lib/chemistry/acidsBases'
import { INDICATORS, indicatorAtPH, getIndicator } from '../../../lib/chemistry/indicators'
import { noteFor } from '../../../lib/chemistry/pedagogy'

interface Pair {
  acid: Solution
  base: Solution
  label: string
  kind: 'strong-strong' | 'weak-strong'
}

function findSolution(predicate: (s: Solution) => boolean): Solution {
  const s = SOLUTIONS.find(predicate)
  if (!s) throw new Error('Solution not found in SOLUTIONS')
  return s
}

const PAIRS: Pair[] = [
  { label: 'HCl 0.1 M vs NaOH 0.1 M (strong/strong)',
    kind: 'strong-strong',
    acid: findSolution((s) => s.id === 'hcl-0.1M'),
    base: findSolution((s) => s.id === 'naoh-0.1M') },
  { label: 'HCl 1.0 M vs NaOH 1.0 M (strong/strong)',
    kind: 'strong-strong',
    acid: findSolution((s) => s.id === 'hcl-1M'),
    base: findSolution((s) => s.id === 'naoh-1M') },
  { label: 'CH₃COOH 0.1 M vs NaOH 0.1 M (weak/strong)',
    kind: 'weak-strong',
    acid: findSolution((s) => s.id === 'ch3cooh-vinegar'),
    base: findSolution((s) => s.id === 'naoh-0.1M') },
  { label: 'CH₃COOH 1 M vs NaOH 1 M (weak/strong)',
    kind: 'weak-strong',
    acid: findSolution((s) => s.id === 'ch3cooh-1M'),
    base: findSolution((s) => s.id === 'naoh-1M') },
]

// Compute pH at a given Vb for a (strong/strong OR weak/strong) titration.
// All volumes in mL, concentrations in mol/L.
function pHAt(acid: Solution, base: Solution, Va: number, Vb: number, kind: 'strong-strong' | 'weak-strong'): number {
  const Ma = acid.concentration
  const Mb = base.concentration
  const Veq = (Ma * Va) / Mb
  const molesAcid = (Ma * Va) / 1000
  const molesBase = (Mb * Vb) / 1000
  const totVol = (Va + Vb) / 1000

  if (kind === 'strong-strong') {
    if (Vb < Veq - 1e-6) {
      const molesH = Math.max(0, molesAcid - molesBase)
      return -Math.log10(molesH / totVol)
    } else if (Vb > Veq + 1e-6) {
      const molesOH = molesBase - molesAcid
      const pOH = -Math.log10(molesOH / totVol)
      return 14 - pOH
    }
    return 7
  }

  // weak/strong: weak acid HA + strong base OH⁻ → A⁻ + H₂O.
  // Henderson–Hasselbalch before equivalence:
  //   pH = pKa + log([A⁻] / [HA])
  //   [A⁻] = molesBase / totVol, [HA] = (molesAcid - molesBase) / totVol
  const Ka = acid.Ka ?? 1.8e-5
  const pKa = -Math.log10(Ka)
  if (Vb < Veq - 1e-6) {
    const molesA = molesBase // produced by neutralisation
    const molesHA = Math.max(1e-30, molesAcid - molesBase)
    const ratio = molesA / molesHA
    return pKa + Math.log10(ratio)
  } else if (Vb > Veq + 1e-6) {
    // Excess OH⁻.
    const molesOH = molesBase - molesAcid
    const pOH = -Math.log10(molesOH / totVol)
    return 14 - pOH
  } else {
    // At equivalence: pH > 7 due to hydrolysis of A⁻.
    // A⁻ + H₂O ⇌ HA + OH⁻, Kb = Kw/Ka
    const Ca = molesAcid / totVol
    const Kb = 1e-14 / Ka
    const x = 0.5 * (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * Ca))
    const pOH = -Math.log10(x)
    return Math.min(14, 14 - pOH)
  }
}

function computeCurve(acid: Solution, base: Solution, Va: number, maxV: number, kind: 'strong-strong' | 'weak-strong') {
  const steps = 240
  const out: Array<{ v: number; pH: number }> = []
  for (let i = 0; i <= steps; i++) {
    const Vb = (i / steps) * maxV
    const pH = pHAt(acid, base, Va, Vb, kind)
    out.push({ v: Vb, pH: Math.max(0, Math.min(14, pH)) })
  }
  return out
}

function computeDerivative(curve: Array<{ v: number; pH: number }>, maxV: number): Array<{ v: number; d: number }> {
  const out: Array<{ v: number; d: number }> = []
  // dpH/dV — central difference.
  for (let i = 1; i < curve.length - 1; i++) {
    const dv = (curve[i + 1].v - curve[i - 1].v) || 1e-9
    const dpH = curve[i + 1].pH - curve[i - 1].pH
    out.push({ v: curve[i].v, d: dpH / dv })
  }
  return out
}

function phToColor(pH: number): string {
  const clamped = Math.max(0, Math.min(14, pH))
  const palette = [
    [126, 34, 206], [147, 51, 234], [168, 85, 247], [192, 38, 211],
    [225, 29, 72], [244, 63, 94], [249, 115, 22], [245, 158, 11],
    [234, 179, 8], [132, 204, 22], [34, 197, 94], [16, 185, 129],
    [20, 184, 166], [14, 165, 233], [59, 130, 246],
  ]
  const idx = Math.min(palette.length - 1, clamped)
  const lo = Math.floor(idx)
  const hi = Math.min(palette.length - 1, lo + 1)
  const t = idx - lo
  const a = palette[lo], b = palette[hi]
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

export function TitrationScene() {
  const pairIdx = useChemistryStore((s) => Math.round(s.params.pair ?? 0))
  const Va = useChemistryStore((s) => s.params.Va ?? 25)
  const Vb = useChemistryStore((s) => s.params.Vb ?? 0)
  const indicatorIdx = useChemistryStore((s) => Math.round(s.params.indicator ?? 3))
  const setParam = useChemistryStore((s) => s.setParam)

  const pair = PAIRS[Math.max(0, Math.min(PAIRS.length - 1, pairIdx))]
  const acid: ComputedSolution = useMemo(() => compute(pair.acid), [pair])
  const base: ComputedSolution = useMemo(() => compute(pair.base), [pair])
  const Ma = acid.concentration
  const Mb = base.concentration
  const VeqSimple = (Ma * Va) / Mb
  const maxV = Math.max(VeqSimple * 2, 30)

  const curve = useMemo(
    () => computeCurve(pair.acid, pair.base, Va, maxV, pair.kind),
    [pair, Va, maxV]
  )
  const derivative = useMemo(() => computeDerivative(curve, maxV), [curve, maxV])

  const currentPH = useMemo(
    () => Math.max(0, Math.min(14, pHAt(pair.acid, pair.base, Va, Vb, pair.kind))),
    [pair, Va, Vb]
  )

  const indicator = INDICATORS[Math.max(0, Math.min(INDICATORS.length - 1, indicatorIdx))]
  const indicatorColor = indicatorAtPH(indicator, currentPH)

  // Find peak of derivative for the equivalence-point marker.
  const peak = useMemo(() => {
    let maxD = -Infinity
    let maxIdx = 0
    derivative.forEach((d, i) => {
      if (d.d > maxD) { maxD = d.d; maxIdx = i }
    })
    return derivative[maxIdx] ?? { v: VeqSimple, d: 0 }
  }, [derivative, VeqSimple])

  const pHCurveRef = useRef<HTMLCanvasElement | null>(null)
  const dCurveRef = useRef<HTMLCanvasElement | null>(null)
  // Re-draw on resize too — canvas pixel buffer must follow layout size.
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const update = () => {
      const ph = pHCurveRef.current
      const dc = dCurveRef.current
      if (!ph || !dc) return
      setSize({ w: ph.clientWidth, h: ph.clientHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    if (pHCurveRef.current) ro.observe(pHCurveRef.current)
    if (dCurveRef.current) ro.observe(dCurveRef.current)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    drawPHCurve(pHCurveRef.current, { curve, Vb, currentPH, maxV, VeqSimple, Va, peak, weak: pair.kind === 'weak-strong' })
  }, [curve, Vb, currentPH, maxV, VeqSimple, Va, peak, pair.kind, size])
  useEffect(() => {
    drawDerivative(dCurveRef.current, { derivative, Vb, peak })
  }, [derivative, Vb, peak, size])

  // Animated burette drop counter: a drop falls every 1.5s when Vb > 0.
  const [dropKey, setDropKey] = useState(0)
  useEffect(() => {
    if (Vb <= 0) return
    const t = setInterval(() => setDropKey((k) => k + 1), 1500)
    return () => clearInterval(t)
  }, [Vb])
  const dropCount = Math.floor(Vb / 0.05)

  return (
    <div className="ti-root">
      <div className="ti-header">
        <span className="ti-title">Titration</span>
        <span className="ti-eq">MₐVₐ = MᵦVᵦ</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#52525B' }}>
          {pair.kind === 'strong-strong' ? 'Strong/strong' : 'Weak acid + strong base'}
        </span>
      </div>

      <div className="ti-controls">
        <div className="ti-ctrl">
          <label>Analyte · Titrant</label>
          <select
            value={pairIdx}
            onChange={(e) => setParam('pair', parseInt(e.target.value, 10))}
          >
            {PAIRS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="ti-ctrl">
          <label>V_analyte (mL)</label>
          <input
            type="number"
            min={5}
            max={100}
            step={1}
            value={Va}
            onChange={(e) => {
              const next = parseFloat(e.target.value) || 25
              setParam('Va', next)
            }}
          />
        </div>
        <div className="ti-ctrl">
          <label>V_titrant added (mL): {Vb.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={maxV}
            step={maxV / 200}
            value={Vb}
            onChange={(e) => setParam('Vb', parseFloat(e.target.value))}
            style={{ accentColor: '#9333EA' }}
          />
        </div>
      </div>

      <div className="ti-canvases">
        <div className="ti-plot-wrap">
          <span className="ti-section-label">pH curve</span>
          <canvas ref={pHCurveRef} className="ti-plot" />
        </div>
        <div className="ti-plot-wrap ti-plot-deriv">
          <span className="ti-section-label">dpH/dV (peak = equivalence)</span>
          <canvas ref={dCurveRef} className="ti-plot" />
        </div>
      </div>

      <div className="ti-side">
        <div className="ti-flask-col">
          <div className="ti-flask-bottle">
            <div
              className="ti-flask-liquid"
              style={{ background: phToColor(currentPH), height: `${75 + (currentPH / 14) * 10}%` }}
            />
            <div className="ti-flask-label">pH {currentPH.toFixed(1)}</div>
          </div>
          <div className="ti-flask-meta">
            <span className="ti-flask-pill">{pair.acid.formula} · {pair.base.formula}</span>
          </div>
        </div>

        {/* Burette animation */}
        <div className="ti-burette">
          <div className="ti-burette-top">
            <span className="ti-burette-label">burette</span>
            <span className="ti-burette-drop-count">{dropCount} drops</span>
          </div>
          <svg width={40} height={140} className="ti-burette-svg">
            <line x1={20} y1={4} x2={20} y2={120} stroke="#52525B" strokeWidth={3} />
            <line x1={20} y1={120} x2={20} y2={132} stroke="#52525B" strokeWidth={3} />
            {/* ticks */}
            {[10, 30, 50, 70, 90, 110].map((y) => (
              <line key={y} x1={14} y1={y} x2={26} y2={y} stroke="#A1A1AA" strokeWidth={1} />
            ))}
            {/* falling drop */}
            {Vb > 0 && (
              <circle
                key={dropKey}
                cx={20}
                cy={20}
                r={4}
                fill="#2563EB"
              >
                <animate attributeName="cy" from={20} to={128} dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from={1} to={0.4} dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
          {/* Flask under burette */}
          <svg width={36} height={20}>
            <path d="M 6 8 L 12 18 L 24 18 L 30 8 Z" fill="none" stroke="#52525B" strokeWidth={1.5} />
          </svg>
        </div>

        {/* Indicator selector + swatch */}
        <div className="ti-indicator-card">
          <span className="ti-section-label">Indicator</span>
          <div className="ti-indicator-row">
            {INDICATORS.map((ind, i) => (
              <button
                key={ind.id}
                type="button"
                className={`ti-indicator-chip ${i === indicatorIdx ? 'active' : ''}`}
                onClick={() => setParam('indicator', i)}
                title={ind.name}
              >
                <span className="ti-indicator-swatch" style={{ background: indicatorAtPH(ind, currentPH) }} />
                <span className="ti-indicator-name">{ind.name.replace(' blue', '').replace(/ .*/, '')}</span>
              </button>
            ))}
          </div>
          <div className="ti-indicator-meta">
            <span style={{ fontSize: 11, color: '#71717A' }}>Flask colour</span>
            <div className="ti-indicator-now">
              <span className="ti-indicator-swatch" style={{ background: indicatorColor, width: 28, height: 28 }} />
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#18181B' }}>
                {indicator.name} · {currentPH < indicator.rangeLow ? 'acid form' : currentPH > indicator.rangeHigh ? 'base form' : 'transition'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ti-stats">
        <div className="ti-stat">
          <div className="ti-stat-label">Current pH</div>
          <div className="ti-stat-value">{currentPH.toFixed(2)}</div>
        </div>
        <div className="ti-stat">
          <div className="ti-stat-label">Equivalence V</div>
          <div className="ti-stat-value">{VeqSimple.toFixed(2)} mL</div>
        </div>
        <div className="ti-stat">
          <div className="ti-stat-label">M_a · V_a</div>
          <div className="ti-stat-value">{(Ma * Va).toFixed(2)}</div>
        </div>
        <div className="ti-stat">
          <div className="ti-stat-label">M_b · V_b</div>
          <div className="ti-stat-value">{(Mb * Vb).toFixed(2)}</div>
        </div>
        <div className={`ti-stat ${Vb >= VeqSimple - 0.05 && Vb <= VeqSimple + 0.05 ? 'equiv' : 'warn'}`}>
          <div className="ti-stat-label">Status</div>
          <div className="ti-stat-value">
            {Vb < VeqSimple - 0.05 ? 'analyte excess' : Vb > VeqSimple + 0.05 ? 'titrant excess' : 'equivalence'}
          </div>
        </div>
      </div>

      {(() => {
        const note = noteFor('titration')
        return note ? (
          <div className="ti-concept">
            <span className="ti-concept-icon">💡</span>
            <span>{note}</span>
          </div>
        ) : null
      })()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Canvas drawers
// ---------------------------------------------------------------------------

function drawPHCurve(
  cvs: HTMLCanvasElement | null,
  ctx_: { curve: { v: number; pH: number }[]; Vb: number; currentPH: number; maxV: number; VeqSimple: number; Va: number; peak: { v: number; d: number }; weak: boolean }
) {
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = cvs.clientWidth
  const h = cvs.clientHeight
  if (w <= 0 || h <= 0) return
  cvs.width = w * dpr
  cvs.height = h * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const padL = 40, padR = 16, padT = 16, padB = 26
  const plotW = w - padL - padR
  const plotH = h - padT - padB

  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(padL, padT, plotW, plotH)

  // Grid + pH 7 mid-line.
  ctx.strokeStyle = '#E4E4E7'
  ctx.lineWidth = 1
  for (let i = 0; i <= 14; i++) {
    const y = padT + (1 - i / 14) * plotH
    ctx.beginPath()
    ctx.moveTo(padL, y)
    ctx.lineTo(padL + plotW, y)
    ctx.stroke()
  }
  for (let i = 0; i <= 10; i++) {
    const x = padL + (i / 10) * plotW
    ctx.beginPath()
    ctx.moveTo(x, padT)
    ctx.lineTo(x, padT + plotH)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(21, 128, 61, 0.4)'
  ctx.setLineDash([4, 4])
  const midY = padT + (1 - 7 / 14) * plotH
  ctx.beginPath()
  ctx.moveTo(padL, midY)
  ctx.lineTo(padL + plotW, midY)
  ctx.stroke()
  ctx.setLineDash([])

  // Axes
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(padL, padT)
  ctx.lineTo(padL, padT + plotH)
  ctx.lineTo(padL + plotW, padT + plotH)
  ctx.stroke()

  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 14; i += 2) {
    const y = padT + (1 - i / 14) * plotH
    ctx.fillText(String(i), padL - 6, y)
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let i = 0; i <= 10; i++) {
    const x = padL + (i / 10) * plotW
    const xv = (i / 10) * ctx_.maxV
    ctx.fillText(xv.toFixed(Math.abs(ctx_.maxV) >= 100 ? 0 : 1), x, padT + plotH + 6)
  }

  // Curve
  ctx.strokeStyle = '#9333EA'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx_.curve.forEach((pt, i) => {
    const x = padL + (pt.v / ctx_.maxV) * plotW
    const y = padT + (1 - Math.max(0, Math.min(14, pt.pH)) / 14) * plotH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Half-equivalence marker for weak-strong curves.
  if (ctx_.weak) {
    const halfV = ctx_.VeqSimple / 2
    if (halfV < ctx_.maxV) {
      const x = padL + (halfV / ctx_.maxV) * plotW
      ctx.strokeStyle = '#0EA5E9'
      ctx.lineWidth = 1.5
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x, padT)
      ctx.lineTo(x, padT + plotH)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#0EA5E9'
      ctx.font = 'bold 10px ui-monospace, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`½ eq · V = ${halfV.toFixed(2)}`, x, padT + 2)
      ctx.fillText(`pH = pKa`, x, padT + 14)
    }
  }

  // Equivalence point marker (vertical dashed green).
  const eqX = padL + (ctx_.VeqSimple / ctx_.maxV) * plotW
  ctx.strokeStyle = '#15803D'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(eqX, padT)
  ctx.lineTo(eqX, padT + plotH)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#15803D'
  ctx.font = 'bold 10px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`eq. pt · ${ctx_.VeqSimple.toFixed(2)} mL`, eqX, padT + 2)

  // Current operating point
  const opX = padL + (ctx_.Vb / ctx_.maxV) * plotW
  const opY = padT + (1 - ctx_.currentPH / 14) * plotH
  ctx.fillStyle = '#18181B'
  ctx.beginPath()
  ctx.arc(opX, opY, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()

  // Drop line
  ctx.strokeStyle = 'rgba(24, 24, 27, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  ctx.moveTo(opX, opY)
  ctx.lineTo(opX, padT + plotH)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawDerivative(
  cvs: HTMLCanvasElement | null,
  ctx_: { derivative: { v: number; d: number }[]; Vb: number; peak: { v: number; d: number } }
) {
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = cvs.clientWidth
  const h = cvs.clientHeight
  if (w <= 0 || h <= 0) return
  cvs.width = w * dpr
  cvs.height = h * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const padL = 40, padR = 16, padT = 8, padB = 20
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  const maxV = ctx_.derivative.at(-1)?.v ?? 1
  const maxD = Math.max(0.1, ...ctx_.derivative.map((d) => d.d))

  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(padL, padT, plotW, plotH)

  // Axes
  ctx.strokeStyle = '#A1A1AA'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padT + (i / 5) * plotH
    ctx.beginPath()
    ctx.moveTo(padL, y)
    ctx.lineTo(padL + plotW, y)
    ctx.stroke()
  }
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padL, padT)
  ctx.lineTo(padL, padT + plotH)
  ctx.lineTo(padL + plotW, padT + plotH)
  ctx.stroke()

  // Curve filled
  ctx.fillStyle = 'rgba(147, 51, 234, 0.2)'
  ctx.beginPath()
  ctx.moveTo(padL, padT + plotH)
  ctx_.derivative.forEach((d) => {
    const x = padL + (d.v / maxV) * plotW
    const y = padT + (1 - d.d / maxD) * plotH
    ctx.lineTo(x, y)
  })
  ctx.lineTo(padL + plotW, padT + plotH)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#9333EA'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx_.derivative.forEach((d, i) => {
    const x = padL + (d.v / maxV) * plotW
    const y = padT + (1 - d.d / maxD) * plotH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Peak marker
  const peakX = padL + (ctx_.peak.v / maxV) * plotW
  const peakY = padT + (1 - ctx_.peak.d / maxD) * plotH
  ctx.fillStyle = '#15803D'
  ctx.beginPath()
  ctx.arc(peakX, peakY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#15803D'
  ctx.font = 'bold 10px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`peak @ V = ${ctx_.peak.v.toFixed(2)}`, peakX, padT + 2)

  // Current operating point
  const opD = ctx_.derivative.find((d) => Math.abs(d.v - ctx_.Vb) < (maxV / 240))
  if (opD) {
    const x = padL + (opD.v / maxV) * plotW
    const y = padT + (1 - opD.d / maxD) * plotH
    ctx.fillStyle = '#18181B'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Y label
  ctx.fillStyle = '#52525B'
  ctx.font = '9px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(maxD.toFixed(1), padL - 4, padT + 6)
  ctx.fillText('0', padL - 4, padT + plotH)
}
