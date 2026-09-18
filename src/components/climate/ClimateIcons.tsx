// Inline SVG icons for the climate lab.
// - `name` covers the rail tabs (the 8 originals) plus extra glyphs for
//   stat cards: thermometer, droplet, wind, gauge, sun, cloud, wave,
//   leaf, lightning, factory, droplet-cloud, mountain, compass.

import React from 'react'

export type IconKey =
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
  | 'thermometer'
  | 'droplet'
  | 'wind'
  | 'gauge'
  | 'cloud'
  | 'leaf'
  | 'lightning'
  | 'factory'
  | 'mountain'
  | 'compass'
  | 'globe'

interface Props {
  name: IconKey
  size?: number
}

export function ClimateIcon({ name, size = 18 }: Props) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'weather':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )
    case 'air':
      return (
        <svg {...props}>
          <path d="M3 8h12a3 3 0 1 0-3-3" />
          <path d="M3 16h16a3 3 0 1 1-3 3" />
          <path d="M3 12h9" />
        </svg>
      )
    case 'quake':
      return (
        <svg {...props}>
          <path d="M3 12h3l2-7 4 14 3-9 2 6h4" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...props}>
          <path d="M2 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        </svg>
      )
    case 'trend':
      return (
        <svg {...props}>
          <path d="M3 17l5-5 4 4 8-8" />
          <path d="M14 8h6v6" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )
    case 'earth':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      )
    case 'apod':
      return (
        <svg {...props}>
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21 8 14l-6-4.6h7.6z" />
        </svg>
      )
    case 'solar-system':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="6" opacity="0.7" />
          <circle cx="12" cy="12" r="9.5" opacity="0.4" />
        </svg>
      )
    case 'gravity':
      return (
        <svg {...props}>
          <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'tide':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="6" />
          <ellipse cx="12" cy="12" rx="9" ry="3" opacity="0.6" />
          <circle cx="20" cy="6" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'thermometer':
      return (
        <svg {...props}>
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      )
    case 'droplet':
      return (
        <svg {...props}>
          <path d="M12 2.5s-7 7-7 12a7 7 0 0 0 14 0c0-5-7-12-7-12z" />
        </svg>
      )
    case 'wind':
      return (
        <svg {...props}>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 16h15a3 3 0 1 1-3 3" />
        </svg>
      )
    case 'gauge':
      return (
        <svg {...props}>
          <path d="M12 14l4-4" />
          <path d="M3.5 14a8.5 8.5 0 0 1 17 0" />
          <path d="M3.5 14h17" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...props}>
          <path d="M17 18a4 4 0 0 0-1-7.9 6 6 0 0 0-11.6 1.4A4 4 0 0 0 5 18z" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...props}>
          <path d="M21 3c-7 0-13 5-13 12v6h6c7 0 12-6 12-13V3z" />
          <path d="M8 17l8-8" />
        </svg>
      )
    case 'lightning':
      return (
        <svg {...props}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      )
    case 'factory':
      return (
        <svg {...props}>
          <path d="M3 21V11l5 3V11l5 3V11l5 3v7z" />
          <path d="M3 21h18" />
          <path d="M9 17h2M14 17h2" />
        </svg>
      )
    case 'mountain':
      return (
        <svg {...props}>
          <path d="M3 21l6-10 4 6 2-3 6 7z" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8l-2 6-6 2 2-6z" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z" />
        </svg>
      )
  }
}