// Suggested follow-up questions, derived from the current experiment context.
// The chips are intentionally short and starter-shaped.

import { CompanionSnapshot } from '../../hooks/useCompanionContext'

const GENERIC = [
  'What should I try next?',
  'Explain what just happened.',
  'Why is my result different from expected?',
]

const SECTION_PROMPTS: Record<string, string[]> = {
  physics: [
    'Why is the period changing?',
    'What happens if I increase the length?',
    'Explain this trajectory.',
  ],
  chemistry: [
    'Why did this reaction happen?',
    'Explain this result.',
    'What should I try next?',
  ],
  solar: [
    'Why did the orbit change?',
    'What happens if I increase velocity?',
    'Explain the gravity here.',
  ],
  cad: [
    'Why did my structure fail?',
    'What should I change to make it stiffer?',
    'Explain this measurement.',
  ],
}

export function suggestedQuestionsFor(snapshot: CompanionSnapshot): string[] {
  const base = SECTION_PROMPTS[snapshot.section] ?? GENERIC

  // Specialize based on the experiment id so e.g. titration asks about
  // equivalence point and pendulum asks about period.
  const id = snapshot.experimentId.toLowerCase()
  const title = snapshot.experimentTitle.toLowerCase()
  let extra: string[] = []
  if (id.includes('pendulum') || title.includes('pendulum')) {
    extra = ['Why is my period different from 2π√(L/g)?', 'What changes if I double the length?']
  } else if (id.includes('projectile') || title.includes('projectile')) {
    extra = ['Why didn\'t it reach the target?', 'How do I hit a farther target?']
  } else if (id.includes('titration') || title.includes('titration')) {
    extra = ['Why did pH jump so suddenly?', 'How do I find the equivalence point?']
  } else if (id.includes('reaction') || title.includes('reaction')) {
    extra = ['Is this reaction endothermic or exothermic?', 'What does ΔH tell me?']
  } else if (id.includes('orbit') || title.includes('orbit') || id.includes('kepler')) {
    extra = ['What shape is this orbit?', 'How does mass change the period?']
  } else if (id.includes('escape') || title.includes('escape')) {
    extra = ['What is escape velocity here?', 'Why does gravity fall off with distance?']
  } else if (id.includes('periodic') || title.includes('periodic')) {
    extra = ['Why does this element sit in this group?', 'Explain this trend.']
  } else if (id.includes('molecule') || title.includes('molecule')) {
    extra = ['Is this molecule polar?', 'Why does it have this geometry?']
  } else if (id.includes('mesh') || id.includes('cad') || title.includes('beam') || title.includes('truss')) {
    extra = ['Where is the load concentrated?', 'How can I make this lighter?']
  }

  // Merge, dedupe, cap at 4.
  const merged = [...extra, ...base]
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of merged) {
    const key = q.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(q)
    if (out.length >= 4) break
  }
  return out
}
