// Small shared UI primitives that are too small for their own files but
// are reused across multiple scenes: AQI level helpers, compass arrow,
// weather-code glyph for the Weather hero, sky-object guesser for APOD,
// and an EU AQI scale legend.

import React from 'react'

// ── AQI scale (European AQI per Open-Meteo's classification) ─────

export interface AqiLevel {
  label: string
  color: string
  recommendation: string
}

export function aqiLevel(aqi: number): AqiLevel {
  if (aqi <= 20) return { label: 'Good', color: '#10B981', recommendation: 'Air quality is satisfactory. Enjoy outdoor activities.' }
  if (aqi <= 40) return { label: 'Fair', color: '#84CC16', recommendation: 'Acceptable for most. Unusually sensitive people should consider reducing prolonged exertion.' }
  if (aqi <= 60) return { label: 'Moderate', color: '#F59E0B', recommendation: 'Members of sensitive groups may experience minor effects. Limit prolonged outdoor exertion.' }
  if (aqi <= 80) return { label: 'Poor', color: '#F97316', recommendation: 'Sensitive groups should reduce outdoor exertion. Consider an air purifier indoors.' }
  if (aqi <= 100) return { label: 'Very Poor', color: '#EF4444', recommendation: 'Everyone may begin to experience effects. Avoid prolonged outdoor exertion.' }
  return { label: 'Extreme', color: '#7F1D1D', recommendation: 'Health alert — serious effects for everyone. Stay indoors and close windows.' }
}

export function aqiTone(aqi: number): 'good' | 'info' | 'warn' | 'bad' {
  if (aqi <= 40) return 'good'
  if (aqi <= 60) return 'info'
  if (aqi <= 80) return 'warn'
  return 'bad'
}

export const AQI_LEGEND: { label: string; max: number; color: string }[] = [
  { label: 'Good', max: 20, color: '#10B981' },
  { label: 'Fair', max: 40, color: '#84CC16' },
  { label: 'Moderate', max: 60, color: '#F59E0B' },
  { label: 'Poor', max: 80, color: '#F97316' },
  { label: 'Very Poor', max: 100, color: '#EF4444' },
  { label: 'Extreme', max: 999, color: '#7F1D1D' },
]

// ── Compass arrow for wind / wave direction ───────────────────────

interface CompassProps {
  direction: number // degrees, 0 = N
  size?: number
  label?: string
}

export function Compass({ direction, size = 64, label }: CompassProps) {
  return (
    <div className="cli-compass" style={{ width: size, height: size }} aria-hidden>
      <span className="cli-compass-label n">N</span>
      <span className="cli-compass-label e">E</span>
      <span className="cli-compass-label s">S</span>
      <span className="cli-compass-label w">W</span>
      <div
        className="cli-compass-arrow"
        style={{
          transform: `translate(-50%, -100%) rotate(${direction}deg)`,
          background: 'var(--ws-climate, #0EA5E9)',
        }}
      />
      {label && (
        <span
          style={{
            position: 'absolute',
            bottom: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export function cardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const ix = Math.round(((deg % 360) / 45)) % 8
  return dirs[ix]
}

// ── Weather-code glyph (WMO codes used by Open-Meteo) ─────────────

export interface WeatherGlyph {
  icon: 'sun' | 'cloud' | 'droplet' | 'lightning' | 'wave'
  caption: string
}

export function weatherGlyph(code: number): WeatherGlyph {
  if (code === 0) return { icon: 'sun', caption: 'Clear sky' }
  if (code <= 3) return { icon: 'sun', caption: 'Mainly clear' }
  if (code <= 48) return { icon: 'cloud', caption: 'Fog' }
  if (code <= 57) return { icon: 'droplet', caption: 'Drizzle' }
  if (code <= 67) return { icon: 'droplet', caption: 'Rain' }
  if (code <= 77) return { icon: 'cloud', caption: 'Snow' }
  if (code <= 82) return { icon: 'droplet', caption: 'Rain showers' }
  if (code <= 86) return { icon: 'cloud', caption: 'Snow showers' }
  if (code <= 99) return { icon: 'lightning', caption: 'Thunderstorm' }
  return { icon: 'cloud', caption: 'Unknown' }
}

// ── Sky-object guesser for APOD title ─────────────────────────────
//
// Returns the most likely named object mentioned in the title. Falls back
// to null when the title is generic ("A Starry Sky over the Rockies").

const SKY_OBJECTS: Record<string, string> = {
  'M31': 'Andromeda Galaxy (M31)',
  'M42': 'Orion Nebula (M42)',
  'M45': 'Pleiades (M45)',
  'M51': 'Whirlpool Galaxy (M51)',
  'M81': "Bode's Galaxy (M81)",
  'M82': 'Cigar Galaxy (M82)',
  'M101': 'Pinwheel Galaxy (M101)',
  'M104': 'Sombrero Galaxy (M104)',
  'NGC': 'NGC catalog object',
  'IC': 'IC catalog object',
  'Andromeda': 'Andromeda Galaxy',
  'Orion': 'Orion Nebula region',
  'Pleiades': 'Pleiades (M45)',
  'Crab': 'Crab Nebula (M1)',
  'Eagle': 'Eagle Nebula (M16)',
  'Helix': 'Helix Nebula',
  'Horsehead': 'Horsehead Nebula',
  'Veil': 'Veil Nebula',
  'Lagoon': 'Lagoon Nebula (M8)',
  'Trifid': 'Trifid Nebula (M20)',
  'Rosette': 'Rosette Nebula',
  'Solar': 'The Sun',
  'Sun': 'The Sun',
  'Moon': "Earth's Moon",
  'Jupiter': 'Planet Jupiter',
  'Saturn': 'Planet Saturn',
  'Mars': 'Planet Mars',
  'Venus': 'Planet Venus',
  'Mercury': 'Planet Mercury',
  'Neptune': 'Planet Neptune',
  'Uranus': 'Planet Uranus',
  'Milky Way': 'Milky Way',
  'aurora': 'Aurora (polar)',
  'eclipse': 'Solar/lunar eclipse',
}

export function guessSkyObject(title: string): string | null {
  for (const [key, value] of Object.entries(SKY_OBJECTS)) {
    if (title.includes(key)) return value
  }
  return null
}

// ── WHO 2021 air-quality thresholds (annual mean unless noted) ────

export const WHO_THRESHOLDS = {
  pm2_5: { limit: 5, unit: 'µg/m³', label: 'WHO 2021 annual PM2.5' },
  pm10: { limit: 15, unit: 'µg/m³', label: 'WHO 2021 annual PM10' },
  o3_8h: { limit: 60, unit: 'µg/m³', label: 'WHO 2021 peak-season O₃' },
  no2: { limit: 10, unit: 'µg/m³', label: 'WHO 2021 annual NO₂' },
  so2: { limit: 40, unit: 'µg/m³', label: 'WHO 2021 24-hour SO₂' },
  co: { limit: 4000, unit: 'µg/m³', label: 'WHO 2021 24-hour CO' },
} as const

// ── Dew point (Magnus approximation, °C) ──────────────────────────

export function dewPointC(t: number, rh: number): number {
  const a = 17.625
  const b = 243.04
  const rh_ = Math.max(0.0001, Math.min(1, rh / 100))
  const gamma = Math.log(rh_) + (a * t) / (b + t)
  return (b * gamma) / (a - gamma)
}

// ── Heat index (NOAA, °C) — only valid above ~27°C and >40% RH ──────

export function heatIndexC(t: number, rh: number): number {
  const tf = t * 1.8 + 32
  const r = rh
  const hiF =
    -42.379 +
    2.04901523 * tf +
    10.14333127 * r -
    0.22475541 * tf * r -
    0.00683783 * tf * tf -
    0.05481717 * r * r +
    0.00122874 * tf * tf * r +
    0.00085282 * tf * r * r -
    0.00000199 * tf * tf * r * r
  return (hiF - 32) / 1.8
}

// ── Clear-sky solar potential (very rough) ────────────────────────
//
// Astronomical peak GHI for the location around the equinox at noon is
// ≈ 1000 W/m². Multiplied by 24 hours and divided by 1000 (W→kW) gives
// a daily clear-sky ceiling of ~24 kWh/m²/day — well above what any
// real location experiences due to night, clouds, and atmospheric loss.
// We compute a latitude-clamped "max possible" so the chart can plot a
// reference line that the irradiance rarely reaches.

export function clearSkyKwhPerDay(lat: number, dayOfYear = 172 /* ~equinox */): number {
  const rad = (lat * Math.PI) / 180
  const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81)) * (Math.PI / 180)
  const cosH0 = -Math.tan(rad) * Math.tan(decl)
  if (cosH0 >= 1) return 0 // polar night
  if (cosH0 <= -1) return 36 // polar day (max ~24h × 1.4 kW/m²)
  const h0 = Math.acos(cosH0)
  const hours = (2 * h0 * 24) / (2 * Math.PI)
  // Peak clear-sky GHI ~ 1.0 kW/m² at sub-solar point, falls off with
  // air mass. Use a simple sin(elevation) daily integral approximation.
  const avgGhi = 0.85 // average kW/m² over daylight hours in clear sky
  return Math.min(36, hours * avgGhi)
}

// ── Distance to DSCOVR (L1, ≈ 1.5 million km) ─────────────────────

export function l1DistanceKm(): number {
  return 1_500_000
}

// ── Magnitude → colour for earthquakes ────────────────────────────

export function magColor(m: number): string {
  if (m < 4) return '#10B981'
  if (m < 5) return '#F59E0B'
  if (m < 6) return '#F97316'
  if (m < 7) return '#EF4444'
  return '#7F1D1D'
}

// ── Time-ago formatter for relative timestamps ────────────────────

export function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.floor(h / 24)
  return `${d} d ago`
}

// ── Pretty-print a YYYYMMDD POWER date as MMM DD ──────────────────

export function powerDateLabel(ymd: string): string {
  if (ymd.length !== 8) return ymd
  const m = parseInt(ymd.slice(4, 6), 10) - 1
  const d = parseInt(ymd.slice(6, 8), 10)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[m]} ${d}`
}