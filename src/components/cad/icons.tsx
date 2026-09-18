// CAD icons - UI chrome (tools, view, history) + type-specific primitive icons.
// Single source of truth so the primitive picker can show distinct shapes instead
// of every primitive using a generic cube.

import React from 'react'

type IconProps = { size?: number; stroke?: string }

const svg = (children: React.ReactNode, p: IconProps = {}) => (
  <svg
    width={p.size ?? 16}
    height={p.size ?? 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke={p.stroke ?? 'currentColor'}
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// UI chrome
// ─────────────────────────────────────────────────────────────────────────────

export const SelectIcon = (p: IconProps = {}) =>
  svg(<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />, p)

export const MoveIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
    </>,
    p
  )

export const RotateIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
      <polyline points="21 3 21 9 15 9" />
    </>,
    p
  )

export const ScaleIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </>,
    p
  )

export const GridIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </>,
    p
  )

export const AxesIcon = (p: IconProps = {}) =>
  svg(
    <>
      <line x1="4" y1="20" x2="20" y2="4" />
      <polyline points="14 4 20 4 20 10" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </>,
    p
  )

export const UndoIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.36 2.64L3 13" />
    </>,
    p
  )

export const RedoIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016.36 2.64L21 13" />
    </>,
    p
  )

export const DeleteIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </>,
    p
  )

export const EyeIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    p
  )

export const EyeOffIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>,
    p
  )

export const ChevronDownIcon = (p: IconProps = {}) =>
  svg(<polyline points="6 9 12 15 18 9" />, p)

export const ChevronUpIcon = (p: IconProps = {}) =>
  svg(<polyline points="6 15 12 9 18 15" />, p)

export const LayersIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>,
    p
  )

export const SettingsIcon = (p: IconProps = {}) =>
  svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>,
    p
  )

export const PlusIcon = (p: IconProps = {}) =>
  svg(
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>,
    p
  )

export const FitViewIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
      <circle cx="12" cy="12" r="3" />
    </>,
    p
  )

export const LockIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>,
    p
  )

export const UnlockIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 017.5-2" />
    </>,
    p
  )

export const DuplicateIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3" />
    </>,
    p
  )

export const ResetIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </>,
    p
  )

export const StepUpIcon = (p: IconProps = {}) =>
  svg(<polyline points="6 14 12 8 18 14" />, p)

export const StepDownIcon = (p: IconProps = {}) =>
  svg(<polyline points="6 10 12 16 18 10" />, p)

export const InfoIcon = (p: IconProps = {}) =>
  svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none" />
    </>,
    p
  )

// ─────────────────────────────────────────────────────────────────────────────
// Primitive icons — distinct per shape so the picker reads at a glance.
// ─────────────────────────────────────────────────────────────────────────────

export const BoxIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>,
    p
  )

export const CuboidIcon = (p: IconProps = {}) =>
  // Same silhouette as Box, but a horizontal stretch hint
  svg(
    <>
      <path d="M21 16V8a2 2 0 00-1-1.73l-9-4a2 2 0 00-2 0l-9 4A2 2 0 00-2 8v8a2 2 0 001 1.73l9 4a2 2 0 002 0l9-4A2 2 0 0021 16z" transform="translate(2 0)" />
      <line x1="2" y1="12" x2="22" y2="12" opacity="0.5" />
    </>,
    p
  )

export const SphereIcon = (p: IconProps = {}) =>
  svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <ellipse cx="12" cy="12" rx="3.5" ry="9" />
    </>,
    p
  )

export const CylinderIcon = (p: IconProps = {}) =>
  svg(
    <>
      <ellipse cx="12" cy="5" rx="8" ry="2.5" />
      <path d="M4 5v14a8 2.5 0 0016 0V5" />
      <ellipse cx="12" cy="19" rx="8" ry="2.5" opacity="0.5" />
    </>,
    p
  )

export const ConeIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M12 3 L4 20 L20 20 Z" />
      <ellipse cx="12" cy="20" rx="8" ry="2" />
      <line x1="12" y1="3" x2="12" y2="20" opacity="0.4" />
    </>,
    p
  )

export const CapsuleIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M5 8a4 4 0 014-4h6a4 4 0 014 4v8a4 4 0 01-4 4H9a4 4 0 01-4-4z" />
      <line x1="5" y1="8" x2="5" y2="16" />
      <line x1="19" y1="8" x2="19" y2="16" />
    </>,
    p
  )

export const TorusIcon = (p: IconProps = {}) =>
  svg(
    <>
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
    </>,
    p
  )

export const PlaneIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" opacity="0.4" />
    </>,
    p
  )

export const PrismIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polygon points="12 3 21 8 17 19 7 19 3 8" />
      <line x1="12" y1="3" x2="12" y2="19" opacity="0.4" />
    </>,
    p
  )

export const PyramidIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polygon points="12 3 21 19 3 19" />
      <polygon points="3 19 21 19 12 14" opacity="0.5" />
      <line x1="12" y1="3" x2="12" y2="14" opacity="0.4" />
    </>,
    p
  )

export const WedgeIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polygon points="3 20 21 20 21 6" />
      <line x1="3" y1="20" x2="21" y2="6" opacity="0.5" />
    </>,
    p
  )

export const BeamIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="9" width="18" height="6" />
      <line x1="3" y1="12" x2="21" y2="12" opacity="0.4" />
    </>,
    p
  )

export const RodIcon = (p: IconProps = {}) =>
  svg(
    <>
      <ellipse cx="5" cy="12" rx="2" ry="6" />
      <ellipse cx="19" cy="12" rx="2" ry="6" />
      <line x1="5" y1="6" x2="19" y2="6" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </>,
    p
  )

export const PipeIcon = (p: IconProps = {}) =>
  svg(
    <>
      <ellipse cx="5" cy="12" rx="2" ry="6" />
      <ellipse cx="19" cy="12" rx="2" ry="6" />
      <ellipse cx="5" cy="12" rx="0.8" ry="2.4" fill="currentColor" stroke="none" opacity="0.4" />
      <ellipse cx="19" cy="12" rx="0.8" ry="2.4" fill="currentColor" stroke="none" opacity="0.4" />
      <line x1="5" y1="6" x2="19" y2="6" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </>,
    p
  )

export const TubeIcon = (p: IconProps = {}) =>
  // Rectangular hollow tube
  svg(
    <>
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <rect x="6" y="8" width="12" height="8" opacity="0.4" />
    </>,
    p
  )

export const PlateIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="6" width="18" height="12" rx="0.5" />
      <line x1="3" y1="12" x2="21" y2="12" opacity="0.4" />
    </>,
    p
  )

export const IBeamIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="4" y="3" width="16" height="3" />
      <rect x="9" y="6" width="6" height="12" />
      <rect x="4" y="18" width="16" height="3" />
    </>,
    p
  )

export const LBeamIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="3" width="5" height="18" />
      <rect x="8" y="16" width="13" height="5" />
    </>,
    p
  )

export const TBeamIcon = (p: IconProps = {}) =>
  svg(
    <>
      <rect x="3" y="3" width="18" height="5" />
      <rect x="10" y="8" width="4" height="13" />
    </>,
    p
  )

export const UChannelIcon = (p: IconProps = {}) =>
  svg(
    <>
      <path d="M4 3v18M20 3v18M4 3h16" />
      <path d="M4 21h16" opacity="0.4" />
    </>,
    p
  )

export const PolyhedronIcon = (p: IconProps = {}) =>
  svg(
    <>
      <polygon points="12 3 21 9 18 20 6 20 3 9" />
      <line x1="12" y1="3" x2="6" y2="20" opacity="0.4" />
      <line x1="12" y1="3" x2="18" y2="20" opacity="0.4" />
      <line x1="3" y1="9" x2="18" y2="20" opacity="0.5" />
    </>,
    p
  )

// Map primitive type → icon component lives in `./primitiveIcons.ts` so this
// file stays a pure component module (no non-component exports to trip
// react-refresh/only-export-components).
