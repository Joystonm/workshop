// Open-Meteo API client. No API key required. Four endpoints:
//   - forecast:  current weather + 7-day forecast
//   - air-quality: PM2.5/PM10/CO/NO2/SO2/O3 + AQI
//   - marine:    wave height, SST, ocean current
//   - historical: past weather for any lat/lon
// Docs: https://open-meteo.com/en/docs

import { cachedFetch } from './cache'

const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const MARINE = 'https://marine-api.open-meteo.com/v1/marine'
const HISTORICAL = 'https://archive-api.open-meteo.com/v1/archive'

// --- Common types ---

export interface Preset {
  name: string
  lat: number
  lon: number
}

export const PRESETS: Record<string, Preset> = {
  miami: { name: 'Miami, FL', lat: 25.77, lon: -80.19 },
  tokyo: { name: 'Tokyo, JP', lat: 35.68, lon: 139.65 },
  london: { name: 'London, UK', lat: 51.51, lon: -0.13 },
  reykjavik: { name: 'Reykjavík, IS', lat: 64.13, lon: -21.94 },
  sahara: { name: 'Sahara Desert', lat: 23.4, lon: 25.7 },
  mumbai: { name: 'Mumbai, IN', lat: 19.08, lon: 72.88 },
  antarctica: { name: 'McMurdo Station, AQ', lat: -77.85, lon: 166.67 },
  arctic: { name: 'Arctic Ocean', lat: 80, lon: 0 },
  'gulf-of-mexico': { name: 'Gulf of Mexico', lat: 25.0, lon: -90.0 },
  's-pacific-gyre': { name: 'S. Pacific Gyre', lat: -30, lon: -120 },
  'pacific-ring': { name: 'Pacific Ring (PNG)', lat: -6, lon: 147 },
  'sydney': { name: 'Sydney, AU', lat: -33.87, lon: 151.21 },
  'delhi': { name: 'Delhi, IN', lat: 28.61, lon: 77.21 },
  'beijing': { name: 'Beijing, CN', lat: 39.90, lon: 116.41 },
  'lagos': { name: 'Lagos, NG', lat: 6.52, lon: 3.38 },
}

export interface CurrentWeather {
  temperature_2m: number
  apparent_temperature: number
  wind_speed_10m: number
  wind_direction_10m: number
  pressure_msl: number
  relative_humidity_2m: number
  cloud_cover: number
  precipitation: number
  weather_code: number
  time: string
}

export interface DailyForecast {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
}

export interface WeatherForecast {
  current: CurrentWeather
  daily: DailyForecast
  timezone: string
}

export async function fetchForecast(lat: number, lon: number): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,pressure_msl,relative_humidity_2m,cloud_cover,precipitation,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    forecast_days: '7',
    timezone: 'auto',
  })
  const key = `om:forecast:${lat.toFixed(2)},${lon.toFixed(2)}`
  return cachedFetch(key, 10 * 60 * 1000, async () => {
    const resp = await fetch(`${FORECAST}?${params.toString()}`)
    if (!resp.ok) throw new Error(`Open-Meteo forecast: HTTP ${resp.status}`)
    const data = await resp.json()
    return data as WeatherForecast
  })
}

// --- Air quality ---

export interface AirQualityCurrent {
  pm10: number
  pm2_5: number
  carbon_monoxide: number
  nitrogen_dioxide: number
  sulphur_dioxide: number
  ozone: number
  european_aqi: number
  us_aqi: number
  time: string
}

export interface AirQualityDaily {
  time: string[]
  pm2_5_max: number[]
  pm10_max: number[]
  ozone_max: number[]
  european_aqi_max: number[]
  us_aqi_max: number[]
}

export interface AirQualityData {
  current: AirQualityCurrent
  daily: AirQualityDaily
  timezone: string
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi',
    hourly: 'pm2_5,pm10,ozone,european_aqi,us_aqi',
    forecast_days: '7',
    timezone: 'auto',
  })
  const key = `om:air:${lat.toFixed(2)},${lon.toFixed(2)}`
  return cachedFetch(key, 15 * 60 * 1000, async () => {
    const resp = await fetch(`${AIR}?${params.toString()}`)
    if (!resp.ok) throw new Error(`Open-Meteo air-quality: HTTP ${resp.status}`)
    const raw = (await resp.json()) as {
      hourly: {
        time: string[]
        pm2_5: number[]
        pm10: number[]
        ozone: number[]
        european_aqi: number[]
        us_aqi: number[]
      }
    }
    // Aggregate hourly → daily max in JS (the API exposes pollutants
    // only as hourly variables; `pm2_5_max` etc. are not valid).
    const byDay = new Map<string, {
      pm2_5: number; pm10: number; ozone: number
      european_aqi: number; us_aqi: number
    }>()
    const negInf = -Infinity
    const h = raw.hourly
    for (let i = 0; i < h.time.length; i++) {
      const day = h.time[i].slice(0, 10)
      const cur = byDay.get(day) ?? {
        pm2_5: negInf, pm10: negInf, ozone: negInf,
        european_aqi: negInf, us_aqi: negInf,
      }
      if (Number.isFinite(h.pm2_5[i])) cur.pm2_5 = Math.max(cur.pm2_5, h.pm2_5[i])
      if (Number.isFinite(h.pm10[i])) cur.pm10 = Math.max(cur.pm10, h.pm10[i])
      if (Number.isFinite(h.ozone[i])) cur.ozone = Math.max(cur.ozone, h.ozone[i])
      if (Number.isFinite(h.european_aqi[i])) cur.european_aqi = Math.max(cur.european_aqi, h.european_aqi[i])
      if (Number.isFinite(h.us_aqi[i])) cur.us_aqi = Math.max(cur.us_aqi, h.us_aqi[i])
      byDay.set(day, cur)
    }
    const days = Array.from(byDay.keys()).sort()
    const empty: number = negInf // we collapse missing values below
    const daily: AirQualityDaily = {
      time: days,
      pm2_5_max: days.map((d) => byDay.get(d)!.pm2_5),
      pm10_max: days.map((d) => byDay.get(d)!.pm10),
      ozone_max: days.map((d) => byDay.get(d)!.ozone),
      european_aqi_max: days.map((d) => byDay.get(d)!.european_aqi),
      us_aqi_max: days.map((d) => byDay.get(d)!.us_aqi),
    }
    // Sanity: replace any remaining -Infinity (empty day) with 0 for chart
    // safety — UI never reaches this branch in practice.
    for (const arr of [daily.pm2_5_max, daily.pm10_max, daily.ozone_max, daily.european_aqi_max, daily.us_aqi_max]) {
      for (let i = 0; i < arr.length; i++) if (arr[i] === empty) arr[i] = 0
    }
    // The shape we pass up only includes `current` + `daily` (plus timezone).
    return {
      current: (raw as any).current as AirQualityCurrent,
      daily,
      timezone: (raw as any).timezone,
    }
  })
}

// --- Marine ---

export interface MarineCurrent {
  wave_height: number
  wave_direction: number
  sea_surface_temperature: number
  ocean_current_velocity: number
  ocean_current_direction: number
  time: string
}

export interface MarineDaily {
  time: string[]
  wave_height_max: number[]
  wave_direction_dominant: number[]
  sea_surface_temperature_max: number[]
  wave_period_max: number[]
}

export interface MarineData {
  current: MarineCurrent
  daily: MarineDaily
  timezone: string
}

export async function fetchMarine(lat: number, lon: number): Promise<MarineData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'wave_height,wave_direction,sea_surface_temperature,ocean_current_velocity,ocean_current_direction',
    daily: 'wave_height_max,wave_direction_dominant,sea_surface_temperature_max,wave_period_max',
    forecast_days: '7',
    timezone: 'auto',
  })
  const key = `om:marine:${lat.toFixed(2)},${lon.toFixed(2)}`
  return cachedFetch(key, 30 * 60 * 1000, async () => {
    const resp = await fetch(`${MARINE}?${params.toString()}`)
    if (!resp.ok) throw new Error(`Open-Meteo marine: HTTP ${resp.status}`)
    const data = await resp.json()
    return data as MarineData
  })
}

// --- Historical ---

export interface HistoricalAnnual {
  year: number
  t_mean: number | null
  precip_sum: number | null
}

export async function fetchHistoricalAnnual(
  lat: number,
  lon: number,
  startYear: number,
  endYear: number,
): Promise<HistoricalAnnual[]> {
  // The archive endpoint caps data at ~2 days behind "today". If the
  // caller asks for a future year, clip to the last completed year so we
  // don't get a 400 from Open-Meteo.
  const now = new Date()
  const maxEndYear = now.getFullYear() - 1
  const effectiveEnd = Math.min(endYear, maxEndYear)
  const effectiveStart = Math.min(startYear, effectiveEnd)
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: `${effectiveStart}-01-01`,
    end_date: `${effectiveEnd}-12-31`,
    daily: 'temperature_2m_mean,precipitation_sum',
    timezone: 'auto',
  })
  const key = `om:hist:${lat.toFixed(2)},${lon.toFixed(2)},${effectiveStart},${effectiveEnd}`
  return cachedFetch(key, 60 * 60 * 1000, async () => {
    const resp = await fetch(`${HISTORICAL}?${params.toString()}`)
    if (!resp.ok) throw new Error(`Open-Meteo historical: HTTP ${resp.status}`)
    const data = await resp.json()
    const daily = data.daily as { time: string[]; temperature_2m_mean: (number | null)[]; precipitation_sum: (number | null)[] }
    const byYear = new Map<number, { tSum: number; tCount: number; pSum: number }>()
    for (let i = 0; i < daily.time.length; i++) {
      const yr = parseInt(daily.time[i].slice(0, 4), 10)
      const t = daily.temperature_2m_mean[i]
      const p = daily.precipitation_sum[i]
      const cur = byYear.get(yr) ?? { tSum: 0, tCount: 0, pSum: 0 }
      if (typeof t === 'number' && Number.isFinite(t)) {
        cur.tSum += t
        cur.tCount += 1
      }
      if (typeof p === 'number' && Number.isFinite(p)) {
        cur.pSum += p
      }
      byYear.set(yr, cur)
    }
    const out: HistoricalAnnual[] = []
    for (let y = effectiveStart; y <= effectiveEnd; y++) {
      const v = byYear.get(y)
      if (!v || v.tCount === 0) {
        out.push({ year: y, t_mean: null, precip_sum: null })
      } else {
        out.push({
          year: y,
          t_mean: v.tSum / v.tCount,
          precip_sum: v.pSum,
        })
      }
    }
    return out
  })
}