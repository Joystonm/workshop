// USGS Earthquake Hazards Program — FDSN web service.
// No API key required. Returns real recent earthquakes worldwide.

import { cachedFetch } from './cache'

const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

export interface UsgsEarthquake {
  id: string
  mag: number
  place: string
  time: number // ms since epoch
  url: string
  lat: number
  lon: number
  depth: number // km
  type: string
}

interface UsgsFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    url: string
    type: string
  }
  geometry: {
    type: string
    coordinates: [number, number, number] // [lon, lat, depth]
  }
}

interface UsgsResponse {
  features: UsgsFeature[]
}

export async function fetchEarthquakes(opts: {
  minMagnitude?: number
  startTime?: string
  endTime?: string
  limit?: number
  orderBy?: 'time' | 'magnitude'
} = {}): Promise<UsgsEarthquake[]> {
  const q = new URLSearchParams({
    format: 'geojson',
    minmagnitude: String(opts.minMagnitude ?? 4),
    limit: String(opts.limit ?? 50),
    orderby: opts.orderBy ?? 'time',
  })
  if (opts.startTime) q.set('starttime', opts.startTime)
  if (opts.endTime) q.set('endtime', opts.endTime)
  const key = `usgs:${q.toString()}`
  return cachedFetch(key, 5 * 60 * 1000, async () => {
    const resp = await fetch(`${BASE}?${q.toString()}`)
    if (!resp.ok) throw new Error(`USGS: HTTP ${resp.status}`)
    const data = (await resp.json()) as UsgsResponse
    return data.features.map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      type: f.properties.type,
    }))
  })
}