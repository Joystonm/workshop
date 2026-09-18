// SVG icons for the chemistry lab left rail.

import React from 'react'

interface IconProps {
  name: string
  active: boolean
}

export function ChemistryIcon({ name, active }: IconProps) {
  const stroke = active ? 'var(--ws-chemistry)' : 'currentColor'
  const fill = active ? 'var(--ws-chemistry)' : 'none'
  const size = 18
  switch (name) {
    case 'periodic':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <rect x="3" y="6" width="4" height="4" />
          <rect x="8" y="6" width="4" height="4" />
          <rect x="13" y="6" width="4" height="4" />
          <rect x="18" y="6" width="3" height="4" />
          <rect x="3" y="11" width="4" height="4" />
          <rect x="8" y="11" width="4" height="4" />
          <rect x="13" y="11" width="4" height="4" />
          <rect x="18" y="11" width="3" height="4" />
          <rect x="3" y="16" width="4" height="3" />
          <rect x="8" y="16" width="4" height="3" />
          <rect x="13" y="16" width="4" height="3" />
        </svg>
      )
    case 'atom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="12" cy="12" r="2" fill={fill} />
          <ellipse cx="12" cy="12" rx="10" ry="3.5" />
          <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(120 12 12)" />
        </svg>
      )
    case 'flask':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M9 3h6" />
          <path d="M10 3v5L5 19h14L14 8V3" />
          <path d="M7 14h10" />
          <circle cx="12" cy="17" r="1" fill={stroke} stroke="none" />
        </svg>
      )
    case 'molecule':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="6" cy="12" r="2.5" fill={fill} />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <circle cx="12" cy="12" r="1.6" fill={fill} />
          <line x1="8" y1="12" x2="11" y2="12" />
          <line x1="13" y1="12" x2="16" y2="8" />
          <line x1="13" y1="12" x2="16" y2="16" />
        </svg>
      )
    case 'isotope':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="9" cy="10" r="2" fill={fill} />
          <circle cx="9" cy="10" r="3.5" />
          <circle cx="15" cy="14" r="2" fill={fill} />
          <circle cx="15" cy="14" r="3.5" />
          <line x1="11" y1="11" x2="13" y2="13" />
        </svg>
      )
    case 'config':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="12" cy="12" r="2.5" fill={fill} />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="9.5" strokeDasharray="2 2" />
          <circle cx="20" cy="12" r="0.7" fill={stroke} stroke="none" />
          <circle cx="4" cy="12" r="0.7" fill={stroke} stroke="none" />
        </svg>
      )
    case 'reaction':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M9 3h6" />
          <path d="M10 3v5L5 19h14L14 8V3" />
          <circle cx="9" cy="14" r="0.7" fill={stroke} stroke="none" />
          <circle cx="12" cy="11" r="0.7" fill={stroke} stroke="none" />
          <circle cx="15" cy="14" r="0.7" fill={stroke} stroke="none" />
          <circle cx="15" cy="17" r="0.7" fill={stroke} stroke="none" />
        </svg>
      )
    case 'ph':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <rect x="3" y="9" width="18" height="11" rx="1" />
          <path d="M3 14h18" />
          <path d="M6 9V6" />
          <path d="M18 9V6" />
          <text x="12" y="18" textAnchor="middle" fontSize="6" fill={stroke} stroke="none" fontFamily="ui-monospace, monospace">pH</text>
        </svg>
      )
    case 'titration':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <rect x="9" y="3" width="6" height="2" rx="1" />
          <line x1="12" y1="5" x2="12" y2="9" />
          <line x1="12" y1="9" x2="12" y2="20" />
          <path d="M9 14h6l-1 6h-4z" />
          <path d="M9 14h6" />
        </svg>
      )
    case 'beaker':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M9 3h6" />
          <path d="M10 3v5L6 19h12L14 8V3" />
          <path d="M8 14h8" />
          <path d="M8 17c2 1 6 1 8 0" />
        </svg>
      )
    case 'viewer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill={fill} />
          <line x1="12" y1="3" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21" />
          <line x1="3" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21" y2="12" />
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="12" cy="12" r="6" />
        </svg>
      )
  }
}
