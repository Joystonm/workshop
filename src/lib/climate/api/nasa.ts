// NASA APIs — APOD, EPIC and POWER.
// APOD/EPIC live at api.nasa.gov (needs API key) but EPIC also has a
// no-auth mirror at epic.gsfc.nasa.gov which we prefer to avoid the
// DEMO_KEY rate limit. POWER moved to power.larc.nasa.gov and needs
// no key. APOD has a no-auth community mirror at apod.as93.net which
// we try first.

import { cachedFetch } from './cache'

const API_KEY = (import.meta.env.VITE_NASA_API_KEY as string | undefined) ?? 'DEMO_KEY'
const BASE = 'https://api.nasa.gov'
const EPIC_BASE = 'https://epic.gsfc.nasa.gov'
const POWER_BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point'
const APOD_MIRROR = 'https://apod.as93.net/apod'

// 429 means DEMO_KEY is rate-limited; treat as a soft error so callers
// can show a friendly message instead of an exception.
function isRateLimit(status: number): boolean {
  return status === 429 || status === 403
}

// --- Astronomy Picture of the Day ---

export interface ApodData {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
}

export async function fetchApod(date?: string): Promise<ApodData> {
  const key = `nasa:apod:${date ?? 'today'}`
  return cachedFetch(key, 24 * 60 * 60 * 1000, async () => {
    // 1) Try the no-auth mirror first so we don't burn the shared
    //    DEMO_KEY budget. It returns the same fields we need.
    try {
      const mirrorUrl = date ? `${APOD_MIRROR}?date=${date}` : APOD_MIRROR
      const r = await fetch(mirrorUrl)
      if (r.ok) {
        const m = (await r.json()) as {
          title?: string
          explanation?: string
          url?: string
          hdurl?: string
          media_type?: 'image' | 'video'
          copyright?: string
          date?: string
        }
        if (m.title && m.url) {
          return {
            date: m.date ?? date ?? new Date().toISOString().slice(0, 10),
            title: m.title,
            explanation: m.explanation ?? '',
            url: m.url,
            hdurl: m.hdurl,
            media_type: m.media_type ?? 'image',
            copyright: m.copyright,
          } as ApodData
        }
      }
    } catch {
      // mirror down — fall through to the official endpoint
    }

    // 2) Fall back to the official NASA APOD endpoint.
    const q = new URLSearchParams({ api_key: API_KEY })
    if (date) q.set('date', date)
    const resp = await fetch(`${BASE}/planetary/apod?${q.toString()}`)
    if (!resp.ok) {
      if (isRateLimit(resp.status)) {
        throw new Error('NASA APOD is rate-limited. Try again in an hour or sign up for a free personal key at api.nasa.gov.')
      }
      throw new Error(`NASA APOD: HTTP ${resp.status}`)
    }
    return (await resp.json()) as ApodData
  })
}

// --- EPIC (DSCOVR Earth imagery) ---

export interface EpicImage {
  identifier: string
  caption: string
  image: string
  date: string // YYYY-MM-DD HH:MM:SS
  centroid_coordinates: { lat: number; lon: number }
}

interface EpicResponse {
  identifier: string
  caption: string
  image: string
  date: string
  centroid_coordinates: { lat: number; lon: number }
}

export async function fetchEpicImages(count = 5): Promise<EpicImage[]> {
  const key = `nasa:epic:${count}`
  return cachedFetch(key, 6 * 60 * 60 * 1000, async () => {
    // 1) Try the no-auth epic.gsfc.nasa.gov mirror first so we don't
    //    consume DEMO_KEY quota. It returns the same JSON shape.
    try {
      const r = await fetch(`${EPIC_BASE}/api/natural`)
      if (r.ok) {
        const data = (await r.json()) as EpicResponse[]
        return data.slice(0, count).map((d) => ({
          identifier: d.identifier,
          caption: d.caption,
          image: d.image,
          date: d.date,
          centroid_coordinates: d.centroid_coordinates,
        }))
      }
    } catch {
      // mirror unreachable — fall through to api.nasa.gov
    }

    // 2) Fall back to api.nasa.gov with the user's API key.
    const resp = await fetch(`${BASE}/EPIC/api/natural?api_key=${API_KEY}`)
    if (!resp.ok) {
      if (resp.status === 503 || resp.status === 504 || isRateLimit(resp.status)) {
        return []
      }
      throw new Error(`NASA EPIC: HTTP ${resp.status}`)
    }
    const data = (await resp.json()) as EpicResponse[]
    return data.slice(0, count).map((d) => ({
      identifier: d.identifier,
      caption: d.caption,
      image: d.image,
      date: d.date,
      centroid_coordinates: d.centroid_coordinates,
    }))
  })
}

export function epicImageUrl(img: EpicImage, type: 'png' | 'jpg' = 'png'): string {
  const [datePart] = img.date.split(' ')
  const [y, m, d] = datePart.split('-')
  // The image archive on epic.gsfc.nasa.gov is open — no api_key needed.
  return `${EPIC_BASE}/archive/natural/${y}/${m}/${d}/${type}/${img.image}.${type}`
}

// --- POWER (solar + meteorological) ---

export interface PowerData {
  // Daily-avg values keyed by YYYYMMDD date string
  T2M: Record<string, number> // temperature at 2m, °C
  PRECTOTCORR: Record<string, number> // precipitation, mm/day
  ALLSKY_SFC_SW_DWN: Record<string, number> // solar irradiance, MJ/m²/day
  RH2M: Record<string, number> // relative humidity, %
  WS2M: Record<string, number> // wind speed at 2m, m/s
}

export async function fetchPower(
  lat: number,
  lon: number,
  startDate: string, // YYYYMMDD
  endDate: string,
): Promise<PowerData> {
  const params = ['T2M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN', 'RH2M', 'WS2M'].join(',')
  const q = new URLSearchParams({
    parameters: params,
    community: 'AG',
    longitude: String(lon),
    latitude: String(lat),
    start: startDate,
    end: endDate,
    format: 'JSON',
    'time-standard': 'UTC',
  })
  const key = `nasa:power:${lat.toFixed(2)},${lon.toFixed(2)},${startDate},${endDate}`
  return cachedFetch(key, 24 * 60 * 60 * 1000, async () => {
    const resp = await fetch(`${POWER_BASE}?${q.toString()}`)
    if (!resp.ok) {
      if (isRateLimit(resp.status)) {
        throw new Error('NASA POWER is rate-limited. POWER itself has no auth requirement, but the upstream gateway may still 429 — please retry in an hour.')
      }
      throw new Error(`NASA POWER: HTTP ${resp.status}`)
    }
    const data = await resp.json()
    const params = data.properties.parameter as Record<string, Record<string, number>>
    const fill = (data.header?.fill_value as number | undefined) ?? -999
    const clean = (r: Record<string, number> | undefined): Record<string, number> => {
      const out: Record<string, number> = {}
      if (!r) return out
      for (const [d, v] of Object.entries(r)) {
        if (v !== fill && Number.isFinite(v)) out[d] = v
      }
      return out
    }
    return {
      T2M: clean(params.T2M),
      PRECTOTCORR: clean(params.PRECTOTCORR),
      ALLSKY_SFC_SW_DWN: clean(params.ALLSKY_SFC_SW_DWN),
      RH2M: clean(params.RH2M),
      WS2M: clean(params.WS2M),
    }
  })
}