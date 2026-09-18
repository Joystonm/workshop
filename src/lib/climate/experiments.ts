// Climate lab experiment registry. Eight entries are driven by a live
// public API; three are local Newtonian simulations (Solar System,
// Gravity & Free Fall, Moon & Tides). Each scene is a 2D DOM view — no
// 3D, no synthetic data — every number you see comes either from a live
// fetch or from running the deterministic engine.

export type ClimateIconName =
  | 'weather'
  | 'air'
  | 'quake'
  | 'wave'
  | 'trend'
  | 'sun'
  | 'earth'
  | 'apod'
  | 'solar-system'
  | 'gravity'
  | 'tide'

export interface ClimateSource {
  /** Whether the scene is driven by a live API fetch or a local sim. */
  kind: 'live' | 'local'
  /** Primary label shown in the sidebar rail button. */
  label: string
  /** Optional second line for richer description. */
  subtitle?: string
}

export interface ClimateExperiment {
  id: string
  title: string
  description: string
  icon: ClimateIconName
  source: ClimateSource
  /** Back-compat alias of `source.label` for any consumer still reading
   *  the old field. */
  api: string
  Scene: React.ComponentType
}

import { WeatherScene } from './experiments/weather'
import { AirQualityScene } from './experiments/airQuality'
import { EarthquakesScene } from './experiments/earthquakes'
import { OceanScene } from './experiments/ocean'
import { ClimateTrendsScene } from './experiments/climateTrends'
import { SolarPowerScene } from './experiments/solarPower'
import { TodaysEarthScene } from './experiments/todaysEarth'
import { AstronomyPhotoScene } from './experiments/astronomyPhoto'
import { SolarSystemScene } from './experiments/solarSystem'
import { GravityScene } from './experiments/gravity'
import { TidesScene } from './experiments/tides'

export const CLIMATE_EXPERIMENTS: ClimateExperiment[] = [
  {
    id: 'weather',
    title: 'Live Weather',
    description: 'Current temperature, wind, pressure and a 7-day forecast at any city.',
    icon: 'weather',
    source: { kind: 'live', label: 'Open-Meteo forecast' },
    api: 'Open-Meteo forecast',
    Scene: WeatherScene,
  },
  {
    id: 'air-quality',
    title: 'Air Quality',
    description: 'PM2.5, PM10, ozone, CO, NO2, SO2 and the European/US AQI for the next 7 days.',
    icon: 'air',
    source: { kind: 'live', label: 'Open-Meteo air-quality' },
    api: 'Open-Meteo air-quality',
    Scene: AirQualityScene,
  },
  {
    id: 'earthquakes',
    title: 'Earthquakes',
    description: 'Recent significant earthquakes worldwide from USGS, with magnitude, depth and time.',
    icon: 'quake',
    source: { kind: 'live', label: 'USGS FDSN feed' },
    api: 'USGS FDSN',
    Scene: EarthquakesScene,
  },
  {
    id: 'ocean',
    title: 'Ocean & Waves',
    description: 'Wave height, sea-surface temperature and ocean current at any ocean point.',
    icon: 'wave',
    source: { kind: 'live', label: 'Open-Meteo marine' },
    api: 'Open-Meteo marine',
    Scene: OceanScene,
  },
  {
    id: 'climate-trends',
    title: 'Climate Trends',
    description: 'Annual mean temperature and precipitation over the last decades at any city.',
    icon: 'trend',
    source: { kind: 'live', label: 'Open-Meteo historical' },
    api: 'Open-Meteo historical',
    Scene: ClimateTrendsScene,
  },
  {
    id: 'solar-power',
    title: 'Solar Power',
    description: 'Daily solar irradiance, temperature and humidity at any location.',
    icon: 'sun',
    source: { kind: 'live', label: 'NASA POWER' },
    api: 'NASA POWER',
    Scene: SolarPowerScene,
  },
  {
    id: 'todays-earth',
    title: "Today's Earth",
    description: "DSCOVR's daily natural-colour image of Earth as seen from a million miles away.",
    icon: 'earth',
    source: { kind: 'live', label: 'NASA EPIC' },
    api: 'NASA EPIC',
    Scene: TodaysEarthScene,
  },
  {
    id: 'astronomy-photo',
    title: 'Astronomy Photo',
    description: "NASA's Astronomy Picture of the Day with title, explanation and credit.",
    icon: 'apod',
    source: { kind: 'live', label: 'NASA APOD' },
    api: 'NASA APOD',
    Scene: AstronomyPhotoScene,
  },
  {
    id: 'solar-system',
    title: 'Solar System',
    description: 'Sun + 8 planets + Pluto on real orbits. Newtonian gravity, log-scaled rendering.',
    icon: 'solar-system',
    source: {
      kind: 'local',
      label: '9 planets · real masses',
      subtitle: 'Log-scaled orbits',
    },
    api: 'Local Newtonian engine',
    Scene: SolarSystemScene,
  },
  {
    id: 'gravity',
    title: 'Gravity & Free Fall',
    description: 'Drop an object on Earth, Moon, Mars, Jupiter or the Sun. Compare g, fall time and impact speed.',
    icon: 'gravity',
    source: {
      kind: 'local',
      label: 'Compare 2 worlds side-by-side',
      subtitle: 'Optional air drag',
    },
    api: 'Local Newtonian engine',
    Scene: GravityScene,
  },
  {
    id: 'tides',
    title: 'Moon & Tides',
    description: 'Earth–Moon–Sun tidal animation with adjustable lunar distance and solar strength.',
    icon: 'tide',
    source: {
      kind: 'local',
      label: 'Earth · Moon · Sun',
      subtitle: 'Spring vs neap',
    },
    api: 'Local Newtonian engine',
    Scene: TidesScene,
  },
]

export const CLIMATE_EXPERIMENTS_BY_ID: Record<string, ClimateExperiment> =
  CLIMATE_EXPERIMENTS.reduce((acc, e) => ({ ...acc, [e.id]: e }), {})