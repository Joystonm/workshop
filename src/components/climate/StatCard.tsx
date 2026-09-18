// Reusable stat card used by every climate scene.
// - Big monospace value, tracked-uppercase label, optional small icon,
//   optional sub-line under the value.
// - Tone tints the whole card (good = green, warn = amber, bad = red,
//   info = sky). Neutral is the default and uses the surface background.

import React from 'react'
import { ClimateIcon, IconKey } from './ClimateIcons'

export type StatTone = 'neutral' | 'good' | 'warn' | 'bad' | 'info'

interface Props {
  label: string
  value: string | number
  unit?: string
  sub?: React.ReactNode
  icon?: IconKey
  tone?: StatTone
}

export function StatCard({ label, value, unit, sub, icon, tone = 'neutral' }: Props) {
  return (
    <div className={`cli-stat-card tone-${tone}`}>
      <div className="cli-stat-card-head">
        {icon && (
          <span className="cli-stat-card-icon">
            <ClimateIcon name={icon} size={16} />
          </span>
        )}
        <span className="cli-stat-card-label">{label}</span>
      </div>
      <div className="cli-stat-card-value">
        {value}
        {unit && <span className="cli-stat-card-unit">{unit}</span>}
      </div>
      {sub != null && <div className="cli-stat-card-sub">{sub}</div>}
    </div>
  )
}