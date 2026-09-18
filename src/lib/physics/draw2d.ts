// Shared 2D drawing helpers for the physics lab experiments.
// Co-ordinate system in the experiment modules: metres in their own
// physics frame. Here we provide scale + draw primitives that experiments
// use from their `draw` callback.

// --- Collision ---

interface CollisionState {
  balls: { x: number; y: number; vx: number; vy: number; m: number; r: number; color: string }[]
  collided: boolean
  collisionT: number
  trail1: { x: number; y: number }[]
  trail2: { x: number; y: number }[]
}

export function drawCollision(
  ctx: CanvasRenderingContext2D,
  s: CollisionState,
  widthM: number, heightM: number,
  width: number, height: number
) {
  drawGrid(ctx, width, height, 50)
  const sx = width / widthM
  const sy = height / heightM
  const cx = width / 2
  const cy = height / 2
  const toScreen = (x: number, y: number) => ({ x: cx + x * sx, y: cy + y * sy })
  // Boundary
  ctx.strokeStyle = '#A1A1AA'
  ctx.lineWidth = 1
  ctx.strokeRect(cx - widthM / 2 * sx, cy - heightM / 2 * sy, widthM * sx, heightM * sy)
  // Trails
  const drawTrail = (trail: { x: number; y: number }[], color: string) => {
    if (trail.length < 2) return
    ctx.strokeStyle = color + '55'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i]
      const q = toScreen(p.x, p.y)
      if (i === 0) ctx.moveTo(q.x, q.y)
      else ctx.lineTo(q.x, q.y)
    }
    ctx.stroke()
  }
  drawTrail(s.trail1, s.balls[0].color)
  drawTrail(s.trail2, s.balls[1].color)
  // Balls
  for (const b of s.balls) {
    const p = toScreen(b.x, b.y)
    const r = b.r * Math.min(sx, sy)
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = b.color
    ctx.fill()
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 1.2
    ctx.stroke()
    // Velocity arrow
    const vmag = 0.06
    const tip = toScreen(b.x + b.vx * vmag, b.y + b.vy * vmag)
    drawArrow(ctx, p.x, p.y, tip.x, tip.y, '#DC2626', 1.6)
  }
}

// --- Inclined plane ---

interface InclineState {
  s: number
  v: number
  startY: number
  slopeLen: number
}

export function drawIncline(
  ctx: CanvasRenderingContext2D,
  s: InclineState,
  p: Record<string, number>,
  width: number, height: number,
  slopeLen: number
) {
  drawGrid(ctx, width, height, 50)
  const theta = (p.theta * Math.PI) / 180
  const margin = 40
  // The slope is drawn from top-left to bottom-right.
  // Origin of slope: top of ramp at (margin, margin). Bottom at margin + L*cosθ (right), margin + L*sinθ (down).
  const L = Math.min(width - 2 * margin, height - 2 * margin) * 0.95
  const dx = L * Math.cos(theta)
  const dy = L * Math.sin(theta)
  // Top of slope
  const topX = margin
  const topY = margin
  const botX = topX + dx
  const botY = topY + dy
  // Ground (horizontal line from topX leftward to a level ground)
  ctx.fillStyle = '#E4E4E7'
  ctx.fillRect(0, topY, width, height - topY)
  // Slope triangle
  ctx.fillStyle = '#D4D4D8'
  ctx.beginPath()
  ctx.moveTo(topX, topY)
  ctx.lineTo(botX, botY)
  ctx.lineTo(topX, botY)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 1.5
  ctx.stroke()
  // Block position: s metres down the slope from the top
  const blockX = topX + (s.s / slopeLen) * dx
  const blockY = topY + (s.s / slopeLen) * dy
  const blockW = 26, blockH = 26
  ctx.save()
  ctx.translate(blockX, blockY)
  ctx.rotate(theta)
  ctx.fillStyle = '#2563EB'
  ctx.fillRect(-blockW / 2, -blockH / 2, blockW, blockH)
  ctx.strokeStyle = '#1D4ED8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(-blockW / 2, -blockH / 2, blockW, blockH)
  ctx.restore()
  // Velocity arrow along slope
  if (Math.abs(s.v) > 0.05) {
    const vpx = 0.06 * s.v
    const tipX = blockX + vpx * Math.cos(theta)
    const tipY = blockY + vpx * Math.sin(theta)
    drawArrow(ctx, blockX, blockY, tipX, tipY, '#DC2626', 2)
  }
  // Angle label
  ctx.fillStyle = '#52525B'
  ctx.font = '12px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`θ = ${p.theta.toFixed(0)}°`, topX + 8, topY + 14)
}

// --- Friction (removed; μ stays available as a param in the Incline experiment) ---

// --- Waves ---

interface WavesState {
  currentWave: number[]
  nodes: number[]
  t: number
  A: number
  lambda: number
}

export function drawWaves(
  ctx: CanvasRenderingContext2D,
  s: WavesState,
  width: number, height: number
) {
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  // Centre line (rest position of string)
  const cy = height / 2
  ctx.strokeStyle = '#A1A1AA'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(width, cy)
  ctx.stroke()
  ctx.setLineDash([])
  // Wave path
  const N = s.currentWave.length
  if (N < 2) return
  const scale = Math.min(height * 0.4, 100)
  ctx.strokeStyle = '#2563EB'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * width
    const y = cy - s.currentWave[i] * scale
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  // Mark nodes for standing wave
  if (s.nodes.length > 0) {
    ctx.fillStyle = '#DC2626'
    for (const nx of s.nodes) {
      const px = (nx / 10) * width
      ctx.beginPath()
      ctx.arc(px, cy, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // Title
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(`t = ${s.t.toFixed(2)} s`, width - 8, 6)
  ctx.fillText(`λ = ${s.lambda.toFixed(1)} m`, width - 8, 20)
}

// --- Buoyancy ---

interface BuoyancyState {
  y: number
  vy: number
  h: number
  submerged: number
  history: { y: number; submerged: number }[]
}

export function drawBuoyancy(
  ctx: CanvasRenderingContext2D,
  s: BuoyancyState,
  width: number, height: number,
  fluidDepth: number
) {
  drawGrid(ctx, width, height, 50)
  // World -> screen
  const worldHeight = 6  // metres shown
  const margin = 30
  const sy = (height - 2 * margin) / worldHeight
  const surfaceY = margin + 1.5 * sy  // surface is 1.5 m from top
  const floorY = surfaceY + fluidDepth * sy
  // Sky
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, surfaceY)
  // Fluid
  ctx.fillStyle = 'rgba(37, 99, 235, 0.18)'
  ctx.fillRect(0, surfaceY, width, floorY - surfaceY)
  // Surface line
  ctx.strokeStyle = '#2563EB'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, surfaceY)
  ctx.lineTo(width, surfaceY)
  ctx.stroke()
  // Floor
  ctx.fillStyle = '#E4E4E7'
  ctx.fillRect(0, floorY, width, height - floorY)
  // Object
  const objX = width / 2
  const objY = surfaceY - s.y * sy
  const objH = s.h * sy
  const objW = objH * 0.6
  ctx.fillStyle = '#D97706'
  ctx.fillRect(objX - objW / 2, objY - objH / 2, objW, objH)
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 1.5
  ctx.strokeRect(objX - objW / 2, objY - objH / 2, objW, objH)
  // Labels
  ctx.fillStyle = '#52525B'
  ctx.font = '11px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('air', 8, surfaceY - 14)
  ctx.fillStyle = '#2563EB'
  ctx.fillText('fluid', 8, (surfaceY + floorY) / 2)
  // Submerged indicator
  if (s.submerged > 0) {
    ctx.fillStyle = 'rgba(37, 99, 235, 0.45)'
    ctx.fillRect(objX - objW / 2 - 2, Math.max(surfaceY, objY - objH / 2),
                 objW + 4, Math.min(floorY, objY + objH / 2) - Math.max(surfaceY, objY - objH / 2))
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 1.5
    ctx.strokeRect(objX - objW / 2, objY - objH / 2, objW, objH)
  }
  // Force arrows
  const cx = objX + objW / 2 + 30
  const cy0 = objY
  // Weight (down)
  drawArrow(ctx, cx, cy0, cx, cy0 + 40, '#DC2626', 2)
  // Buoyancy (up)
  if (s.submerged > 0) {
    const fLen = 40 * s.submerged
    drawArrow(ctx, cx + 20, cy0, cx + 20, cy0 - fLen, '#16A34A', 2)
  }
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.fillText('Fg', cx - 4, cy0 + 48)
  ctx.fillText('Fb', cx + 22, cy0 - 4)
}

// --- Hooke's law ---

interface HookeState {
  x: number
  xTarget: number
  dataPoints: { F: number; x: number }[]
}

export function drawHooke(
  ctx: CanvasRenderingContext2D,
  s: HookeState,
  p: Record<string, number>,
  width: number, height: number
) {
  drawGrid(ctx, width, height, 50)
  // Vertical spring on left side, mass hangs from it
  const springX = width * 0.3
  const ceilingY = height * 0.1
  const naturalLen = Math.min(height * 0.4, 200)
  const xPx = s.x * 80  // 80 px per metre
  const massY = ceilingY + naturalLen + xPx
  const massW = 50, massH = 40
  // Ceiling
  ctx.fillStyle = '#52525B'
  ctx.fillRect(springX - 30, ceilingY - 8, 60, 8)
  // Spring (zigzag vertical)
  drawZigzagSpring(ctx, springX, ceilingY, springX, massY - massH / 2, 12, 14)
  // Mass
  ctx.fillStyle = '#2563EB'
  ctx.fillRect(springX - massW / 2, massY - massH / 2, massW, massH)
  ctx.strokeStyle = '#1D4ED8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(springX - massW / 2, massY - massH / 2, massW, massH)
  // Force arrow down on mass
  const fMag = p.F
  const arrowLen = Math.min(80, fMag * 0.8)
  if (arrowLen > 1) {
    drawArrow(ctx, springX, massY + massH / 2 + 4, springX, massY + massH / 2 + 4 + arrowLen, '#DC2626', 2)
    ctx.fillStyle = '#52525B'
    ctx.font = '11px ui-monospace, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`F = ${fMag.toFixed(1)} N`, springX + 8, massY + massH / 2 + 8)
  }
  // F vs x plot in the right area
  const plotX = width * 0.55
  const plotY = height * 0.15
  const plotW = width - plotX - 20
  const plotH = height * 0.6
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 1
  ctx.strokeRect(plotX, plotY, plotW, plotH)
  // Axes labels
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('F (N)', plotX + plotW / 2, plotY + plotH + 6)
  ctx.save()
  ctx.translate(plotX - 6, plotY + plotH / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('x (m)', 0, 0)
  ctx.restore()
  // Determine plot range
  let fMax = 50, xMax = 1
  for (const dp of s.dataPoints) {
    fMax = Math.max(fMax, dp.F * 1.1)
    xMax = Math.max(xMax, dp.x * 1.1)
  }
  fMax = Math.max(fMax, p.F * 1.1)
  xMax = Math.max(xMax, s.x * 1.1)
  // Data points
  ctx.fillStyle = '#2563EB'
  for (const dp of s.dataPoints) {
    const px = plotX + (dp.F / fMax) * plotW
    const py = plotY + plotH - (dp.x / xMax) * plotH
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  // Best-fit line: F = k·x
  ctx.strokeStyle = '#16A34A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(plotX, plotY + plotH)
  ctx.lineTo(plotX + (p.k * xMax / fMax) * plotW, plotY)
  ctx.stroke()
  // Current point
  if (p.F > 0) {
    const px = plotX + (p.F / fMax) * plotW
    const py = plotY + plotH - (s.x / xMax) * plotH
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  // Title
  ctx.fillStyle = '#18181B'
  ctx.font = '11px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`x = ${s.x.toFixed(3)} m`, 8, 8)
  ctx.fillText(`F = k·x   (k = ${p.k.toFixed(0)} N/m)`, 8, 22)
}

// --- Newton's 2nd law ---

interface NewtonState {
  x: number; v: number
  aMeasured: number
  trail: { x: number }[]
}

export function drawNewton(
  ctx: CanvasRenderingContext2D,
  s: NewtonState,
  p: Record<string, number>,
  width: number, height: number,
  trackHalf: number
) {
  drawGrid(ctx, width, height, 50)
  const margin = 50
  const trackY = height * 0.65
  // Track — bright orange to differentiate from the blue Friction experiment
  ctx.fillStyle = '#FED7AA'
  ctx.fillRect(margin, trackY, width - 2 * margin, 6)
  ctx.strokeStyle = '#9A3412'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(margin, trackY)
  ctx.lineTo(width - margin, trackY)
  ctx.stroke()
  // Block (orange, size scales with mass)
  const px = width / 2 + (s.x / trackHalf) * (width / 2 - margin - 20)
  const blockW = 36 + Math.min(20, p.m * 2)
  const blockH = 36
  ctx.fillStyle = '#EA580C'
  ctx.fillRect(px - blockW / 2, trackY - blockH - 4, blockW, blockH)
  ctx.strokeStyle = '#9A3412'
  ctx.lineWidth = 1.5
  ctx.strokeRect(px - blockW / 2, trackY - blockH - 4, blockW, blockH)
  // F net arrow (above block, big)
  const fNet = p.F - p.F2
  const fScale = 1.2
  const fTipX = px + fNet * fScale
  drawArrow(ctx, px, trackY - blockH - 16, fTipX, trackY - blockH - 16, '#16A34A', 3)
  // Velocity arrow (below block, big)
  if (Math.abs(s.v) > 0.05) {
    const vTipX = px + s.v * 8
    drawArrow(ctx, px, trackY - 2, vTipX, trackY - 2, '#7C3AED', 2.5)
  }
  // Acceleration arrow (above F arrow, smaller)
  const a = fNet / p.m
  if (Math.abs(a) > 0.05) {
    const aTipX = px + a * 8
    drawArrow(ctx, px, trackY - blockH - 32, aTipX, trackY - blockH - 32, '#DC2626', 2)
  }
  // Trail
  if (s.trail.length > 1) {
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let i = 0; i < s.trail.length; i++) {
      const tx = width / 2 + (s.trail[i].x / trackHalf) * (width / 2 - margin - 20)
      const ty = trackY - 4
      if (i === 0) ctx.moveTo(tx, ty)
      else ctx.lineTo(tx, ty)
    }
    ctx.stroke()
  }
  // Inline equations on the right side
  ctx.fillStyle = '#52525B'
  ctx.font = '11px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  const eqX = width - margin
  const eqY = trackY - blockH - 60
  ctx.fillText(`F_net = ${fNet.toFixed(1)} N`, eqX, eqY)
  ctx.fillText(`a = F/m = ${a.toFixed(2)} m/s²`, eqX, eqY + 18)
  ctx.fillText(`v = ${s.v.toFixed(2)} m/s`, eqX, eqY + 36)
  // Big "F = m·a" formula at top
  ctx.fillStyle = '#18181B'
  ctx.font = 'bold 18px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('F = m · a', margin, 18)
  ctx.fillStyle = '#52525B'
  ctx.font = '11px ui-sans-serif, system-ui'
  ctx.fillText('Newton\'s 2nd law — frictionless, constant force', margin, 42)
  // Legend
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const legY = trackY - blockH - 50
  ctx.fillStyle = '#16A34A'
  ctx.fillRect(margin, legY - 4, 8, 2)
  ctx.fillStyle = '#52525B'
  ctx.fillText('F', margin + 14, legY)
  ctx.fillStyle = '#DC2626'
  ctx.fillRect(margin + 50, legY - 4, 8, 2)
  ctx.fillStyle = '#52525B'
  ctx.fillText('a', margin + 64, legY)
  ctx.fillStyle = '#7C3AED'
  ctx.fillRect(margin + 100, legY - 4, 8, 2)
  ctx.fillStyle = '#52525B'
  ctx.fillText('v', margin + 114, legY)
  // 0-mark
  ctx.fillStyle = '#18181B'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('0', width / 2, trackY + 16)
  ctx.fillText(`+${trackHalf} m`, width - margin - 18, trackY + 16)
  ctx.fillText(`-${trackHalf} m`, margin + 18, trackY + 16)
}


export interface PendulumDrawCtx {
  pivotX: number
  pivotY: number
  scale: number  // px per metre
  theta: number  // radians from vertical
  length: number
  bobRadius?: number  // optional; defaults to 18
}

export function drawPendulum(
  ctx: CanvasRenderingContext2D,
  c: PendulumDrawCtx
) {
  const { pivotX, pivotY, scale, theta, length } = c
  const bobR = c.bobRadius ?? 18
  // Ceiling mount
  ctx.fillStyle = '#52525B'
  ctx.fillRect(pivotX - 26, pivotY - 6, 52, 8)
  // Rod
  const bobX = pivotX + scale * length * Math.sin(theta)
  const bobY = pivotY + scale * length * Math.cos(theta)
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  ctx.lineTo(bobX, bobY)
  ctx.stroke()
  // Bob
  ctx.beginPath()
  ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2)
  ctx.fillStyle = '#2563EB'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#1D4ED8'
  ctx.stroke()
  // Pivot dot
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#18181B'
  ctx.fill()
}

export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number }[],
  pivotX: number,
  pivotY: number,
  scale: number
) {
  if (trail.length < 2) return
  ctx.save()
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i]
    const x = pivotX + scale * p.x
    const y = pivotY + scale * p.y
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

// Projectile

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  s: {
    x: number; y: number; vx: number; vy: number
    trail: { x: number; y: number }[]
    landed: boolean
  },
  p: Record<string, number>,
  width: number,
  height: number
) {
  // World bounds: x ∈ [0, R_theory·1.2], y ∈ [0, H_theory·1.4]
  const g = p.g
  const v0 = p.v0
  const a = (p.angle * Math.PI) / 180
  const R = (v0 * v0 * Math.sin(2 * a)) / g
  const H = (v0 * v0 * Math.sin(a) * Math.sin(a)) / (2 * g)
  const xMax = Math.max(R * 1.2, 10)
  const yMax = Math.max(H * 1.4, 5)
  const sx = width / xMax
  const sy = height / yMax
  const toScreen = (wx: number, wy: number) => ({ x: wx * sx, y: height - wy * sy })

  // Grid
  drawGrid(ctx, width, height, 50)

  // Ground
  ctx.fillStyle = '#F4F4F5'
  ctx.fillRect(0, height - 4, width, 4)
  ctx.strokeStyle = '#A1A1AA'
  ctx.beginPath()
  ctx.moveTo(0, height - 4)
  ctx.lineTo(width, height - 4)
  ctx.stroke()

  // Trail
  if (s.trail.length > 1) {
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let i = 0; i < s.trail.length; i++) {
      const p = s.trail[i]
      const q = toScreen(p.x, p.y)
      if (i === 0) ctx.moveTo(q.x, q.y)
      else ctx.lineTo(q.x, q.y)
    }
    ctx.stroke()
  }

  // Projectile
  const pos = toScreen(s.x, s.y)
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2)
  ctx.fillStyle = s.landed ? '#16A34A' : '#2563EB'
  ctx.fill()
  ctx.strokeStyle = s.landed ? '#15803D' : '#1D4ED8'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Velocity vector
  const vmag = 1.5
  const vTip = toScreen(s.x + s.vx * vmag * 0.04, s.y + s.vy * vmag * 0.04)
  drawArrow(ctx, pos.x, pos.y, vTip.x, vTip.y, '#DC2626', 2)
  // vx / vy components
  const vxTip = toScreen(s.x + s.vx * vmag * 0.04, s.y)
  const vyTip = toScreen(s.x, s.y + s.vy * vmag * 0.04)
  drawArrow(ctx, pos.x, pos.y, vxTip.x, vxTip.y, '#16A34A', 1.5)
  drawArrow(ctx, vxTip.x, vxTip.y, vTip.x, vTip.y, '#D97706', 1.5)
}

// Free fall

export function drawFreeFall(
  ctx: CanvasRenderingContext2D,
  s: {
    balls: { y: number; vy: number; mass: number; label: string; color: string; landed: boolean; landTime: number }[]
    t: number
  },
  p: Record<string, number>,
  width: number,
  height: number
) {
  const h0 = p.h0
  // y in metres, ground at bottom of canvas. Scale to fit height.
  const yMax = Math.max(h0 * 1.1, 10)
  const sx = width / Math.max(s.balls.length * 30, 60)
  const toScreen = (idx: number, y: number) => ({
    x: 30 + idx * (width - 60) / Math.max(s.balls.length - 1, 1),
    y: 24 + (1 - y / yMax) * (height - 60),
  })
  drawGrid(ctx, width, height, 50)

  // Drop line (heights) - left side
  ctx.strokeStyle = '#A1A1AA'
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 1
  for (let y = 0; y <= yMax; y += Math.max(1, Math.round(yMax / 6))) {
    const py = 24 + (1 - y / yMax) * (height - 60)
    ctx.beginPath()
    ctx.moveTo(20, py)
    ctx.lineTo(width - 20, py)
    ctx.stroke()
    ctx.fillText(`${y.toFixed(0)}m`, 18, py)
  }

  // Ground
  ctx.fillStyle = '#E4E4E7'
  ctx.fillRect(0, height - 32, width, 32)
  ctx.strokeStyle = '#A1A1AA'
  ctx.beginPath()
  ctx.moveTo(0, height - 32)
  ctx.lineTo(width, height - 32)
  ctx.stroke()

  s.balls.forEach((b, i) => {
    const pos = toScreen(i, b.y)
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = b.landed ? '#16A34A' : b.color
    ctx.fill()
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 1
    ctx.stroke()
    // Label below
    ctx.fillStyle = '#18181B'
    ctx.font = '11px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(b.label, pos.x, pos.y + 14)
  })
}

// Spring

export function drawSpring(
  ctx: CanvasRenderingContext2D,
  s: { x: number; v: number; amplitude: number },
  p: Record<string, number>,
  width: number,
  height: number
) {
  // Horizontal spring fixed at left wall; mass on right end.
  // x = displacement from equilibrium (metres).
  // Visualise: equilibrium at x = width/2. Each metre = scale.
  const k = p.k, m = p.m
  const baseX = Math.min(width * 0.18, 80)
  const eqX = width / 2
  const scale = Math.min((width - baseX - 80) / 3, 120) // px per metre
  const massX = eqX + s.x * scale
  const massY = height / 2

  // Wall
  ctx.fillStyle = '#52525B'
  ctx.fillRect(baseX - 12, massY - 60, 12, 120)
  // Hatching
  ctx.strokeStyle = '#52525B'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    const y = massY - 60 + i * 20
    ctx.beginPath()
    ctx.moveTo(baseX - 12, y)
    ctx.lineTo(baseX - 22, y + 10)
    ctx.stroke()
  }

  // Spring as zigzag
  const springStart = baseX
  const springEnd = massX - 18
  drawZigzagSpring(ctx, springStart, massY, springEnd, massY, 8, 16)

  // Equilibrium reference
  ctx.strokeStyle = 'rgba(161, 161, 170, 0.6)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(eqX, massY - 50)
  ctx.lineTo(eqX, massY + 50)
  ctx.stroke()
  ctx.setLineDash([])

  // Mass block
  ctx.fillStyle = '#2563EB'
  ctx.fillRect(massX - 18, massY - 22, 36, 44)
  ctx.strokeStyle = '#1D4ED8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(massX - 18, massY - 22, 36, 44)

  // Force arrow (restoring) - always points toward equilibrium
  const restoringSign = -Math.sign(s.x || 1)
  const fTipX = massX + restoringSign * 60
  drawArrow(ctx, massX, massY, fTipX, massY, '#16A34A', 2)
  // Velocity arrow
  if (Math.abs(s.v) > 0.01) {
    const vSign = Math.sign(s.v)
    const vTipX = massX + vSign * 60
    drawArrow(ctx, massX, massY + 30, vTipX, massY + 30, '#DC2626', 2)
  }

  // Bottom axis
  ctx.fillStyle = '#52525B'
  ctx.font = '10px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`m = ${m.toFixed(2)} kg`, massX, massY + 32)
  ctx.fillText(`k = ${k.toFixed(1)} N/m`, massX, massY + 48)
}

// Common helpers

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number
) {
  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  color: string,
  width: number
) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  if (len < 0.5) return
  const ux = dx / len
  const uy = dy / len
  // Shaft
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
  // Head
  const headSize = 6
  const hx = x1 - ux * headSize
  const hy = y1 - uy * headSize
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(hx - uy * headSize * 0.5, hy + ux * headSize * 0.5)
  ctx.lineTo(hx + uy * headSize * 0.5, hy - ux * headSize * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawZigzagSpring(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  coils: number,
  amplitude: number
) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 4) return
  const steps = coils * 4
  const stepLen = len / steps
  const ux = (x1 - x0) / len
  const uy = (y1 - y0) / len
  // Perpendicular for the zigzag
  const px = -uy
  const py = ux
  ctx.save()
  ctx.strokeStyle = '#18181B'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  for (let i = 1; i <= steps; i++) {
    const cx = x0 + ux * stepLen * i
    const cy = y0 + uy * stepLen * i
    const offset = (i % 4 === 2 || i % 4 === 0) ? amplitude : 0
    ctx.lineTo(cx + px * offset, cy + py * offset)
  }
  ctx.lineTo(x1, y1)
  ctx.stroke()
  ctx.restore()
}
