// Climate lab shell. Left rail with experiment picker, centre stage
// with the active Scene. Each Scene fetches its own live data and writes
// key measurements into the climate store, which this shell publishes
// to the AI Companion.

import { useEffect } from 'react'
import { useClimateStore } from '../../lib/climate/store'
import { CLIMATE_EXPERIMENTS, CLIMATE_EXPERIMENTS_BY_ID } from '../../lib/climate/experiments'
import { useCompanionContext } from '../../hooks/useCompanionContext'
import { ClimateIcon } from './ClimateIcons'
import './dashboard.css'
import './rail.css'

export function ClimateLabShell() {
  const experimentId = useClimateStore((s) => s.experimentId)
  const setExperiment = useClimateStore((s) => s.setExperiment)
  const measurements = useClimateStore((s) => s.measurements)
  const { setSnapshot } = useCompanionContext()

  useEffect(() => {
    if (!experimentId) return
    const exp = CLIMATE_EXPERIMENTS_BY_ID[experimentId]
    if (!exp) return
    setSnapshot({
      section: 'climate',
      experimentId: exp.id,
      experimentTitle: exp.title,
      objective: exp.description,
      params: {},
      measurements: { ...measurements },
      paramDefs: [],
      state: {},
      stateSummary: summarizeClimateExperiment(exp.id, measurements, exp.api),
      formulas: [],
    })
    return () => setSnapshot(null)
  }, [experimentId, measurements, setSnapshot])

  const activeId = experimentId ?? CLIMATE_EXPERIMENTS[0].id
  const active = CLIMATE_EXPERIMENTS_BY_ID[activeId]
  const Scene = active.Scene

  return (
    <div className="climate-shell">
      <aside className="climate-rail">
        <div className="climate-rail-header">
          <span className="climate-rail-eyebrow">Live data</span>
          <h2 className="climate-rail-title">EARTH &amp; CLIMATE</h2>
        </div>
        <nav className="climate-rail-nav">
          {CLIMATE_EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              type="button"
              className={`climate-rail-btn${activeId === exp.id ? ' is-active' : ''}`}
              onClick={() => setExperiment(exp.id)}
            >
              <span className="climate-rail-btn-icon">
                <ClimateIcon name={exp.icon} />
              </span>
              <span className="climate-rail-btn-text">
                <span className="climate-rail-btn-row">
                  <span className="climate-rail-btn-title">{exp.title}</span>
                  {exp.source.kind === 'local' && (
                    <span className="climate-rail-pill" title="Runs on the local Newtonian engine, not live data">
                      sim
                    </span>
                  )}
                </span>
                <span
                  className="climate-rail-btn-source"
                  title={exp.source.subtitle ? `${exp.source.label} · ${exp.source.subtitle}` : exp.source.label}
                >
                  {exp.source.label}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div className="climate-rail-foot">
          <p>All numbers come from live public APIs. No simulation, no caching beyond a short TTL.</p>
        </div>
      </aside>

      <main className="climate-stage">
        <Scene />
      </main>
    </div>
  )
}

function summarizeClimateExperiment(
  experimentId: string,
  measurements: Record<string, number | string>,
  api?: string,
): string {
  if (Object.keys(measurements).length === 0) {
    return api ? `Loading live data from ${api}…` : 'Loading live data from the upstream API…'
  }
  const parts: string[] = []
  for (const [key, value] of Object.entries(measurements)) {
    parts.push(`${key}=${typeof value === 'number' ? value.toFixed(2) : value}`)
  }
  return `Experiment "${experimentId}" (${api ?? 'live API'}) latest readings: ${parts.slice(0, 6).join(', ')}${
    parts.length > 6 ? `, +${parts.length - 6} more` : ''
  }`
}