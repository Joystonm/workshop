// AI Companion backend. Hosts three concerns:
//   1. askCompanion — calls MiniMax-M3 with the student's question + experiment
//      context. The model is allowed to declare whether its knowledge of the
//      topic is sufficient; if not (or if the student explicitly asked for
//      external info), we route to Firecrawl, then re-ask the model with the
//      fetched sources baked into the prompt.
//   2. Threads + messages — convex queries/mutations that persist every
//      interaction. The frontend reads from these.
//   3. Session helper — generateOrGetSession resolves a stable sessionId
//      without requiring user login so the workshop can still remember
//      conversations anonymously.

import { v } from 'convex/values'
import { mutation, query, action } from './_generated/server'
import { CATALOG_BY_ID, catalogForPrompt } from './companionCatalog'

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

export const getOrCreateThread = mutation({
  args: {
    sessionId: v.string(),
    workshopSlug: v.string(),
    experimentId: v.string(),
    experimentTitle: v.string(),
    firstMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    // Reuse the most recent thread for this (session, experiment) within the
    // last hour so the panel doesn't fragment into a new thread for every
    // question. Past that, start a fresh thread.
    const recent = await ctx.db
      .query('companionThreads')
      .withIndex('by_session_experiment', (q) =>
        q.eq('sessionId', args.sessionId).eq('experimentId', args.experimentId),
      )
      .order('desc')
      .first()

    if (recent && now - recent.updatedAt < 60 * 60 * 1000) {
      // Update title if the previous one was a placeholder.
      if (recent.title === 'New conversation') {
        await ctx.db.patch(recent._id, { title: args.firstMessage.slice(0, 80), updatedAt: now })
      } else {
        await ctx.db.patch(recent._id, { updatedAt: now })
      }
      return recent._id
    }

    return await ctx.db.insert('companionThreads', {
      sessionId: args.sessionId,
      workshopSlug: args.workshopSlug,
      experimentId: args.experimentId,
      experimentTitle: args.experimentTitle,
      title: args.firstMessage.slice(0, 80),
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const listThreads = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companionThreads')
      .withIndex('by_session_updated', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .take(20)
  },
})

export const listMessages = query({
  args: { threadId: v.id('companionThreads') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companionMessages')
      .withIndex('by_thread_created', (q) => q.eq('threadId', args.threadId))
      .order('asc')
      .collect()
  },
})

export const appendMessage = mutation({
  args: {
    threadId: v.id('companionThreads'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    contextSnapshot: v.optional(
      v.object({
        section: v.string(),
        experimentId: v.string(),
        experimentTitle: v.string(),
        objective: v.optional(v.string()),
        params: v.optional(v.any()),
        measurements: v.optional(v.any()),
        results: v.optional(v.any()),
        formulas: v.optional(v.array(v.string())),
        errorMessage: v.optional(v.string()),
        // Rich context fields shipped from the workshop — kept on the
        // mutation so persisted messages replay the same snapshot the LLM
        // saw at ask time.
        paramDefs: v.optional(v.array(v.any())),
        state: v.optional(v.any()),
        stateSummary: v.optional(v.string()),
      }),
    ),
    usedFirecrawl: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert('companionMessages', {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      contextSnapshot: args.contextSnapshot,
      usedFirecrawl: args.usedFirecrawl,
      createdAt: now,
    })
    // Bump the parent thread so it stays at the top of the list.
    const thread = await ctx.db.get(args.threadId)
    if (thread) {
      await ctx.db.patch(thread._id, { updatedAt: now })
    }
    return id
  },
})

export const deleteThread = mutation({
  args: { threadId: v.id('companionThreads') },
  handler: async (ctx, args) => {
    // Delete messages first.
    const messages = await ctx.db
      .query('companionMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', args.threadId))
      .collect()
    for (const m of messages) await ctx.db.delete(m._id)
    await ctx.db.delete(args.threadId)
  },
})

// ---------------------------------------------------------------------------
// LLM helpers
// ---------------------------------------------------------------------------

const MINIMAX_API_URL =
  process.env.MINIMAX_API_URL || 'https://api.gmi-serving.com/v1/chat/completions'
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMaxAI/MiniMax-M3'
// Firecrawl deprecated /v0/* in favour of /v2/*. The default points at /v2 so
// new deployments don't need to override FIRECRAWL_API_URL.
const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v2'
const FIRECRAWL_TIMEOUT_MS = 12_000

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callLLM(messages: LLMMessage[], opts: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not set on the server.')
  }
  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 600,
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`MiniMax-M3 returned ${response.status}: ${text.slice(0, 200)}`)
  }
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new Error('MiniMax-M3 returned no message content.')
  }
  return text.trim()
}

// Ask MiniMax to decide if its training is sufficient. Returns the answer
// itself when confident; otherwise returns a marker string we can detect.
async function callLLMWithConfidenceFlag(messages: LLMMessage[]): Promise<{ text: string; confident: boolean }> {
  const probeMessages: LLMMessage[] = [
    ...messages,
    {
      role: 'system',
      content:
        'Before answering, decide if you have enough reliable knowledge to answer this question accurately using only the provided context. ' +
        'If yes, prefix your reply with the literal token [CONFIDENT] then give the answer. ' +
        'If no, prefix your reply with [NEED_EXTERNAL] and a single-line reason.',
    },
  ]
  const probe = await callLLM(probeMessages, { maxTokens: 800 })
  if (probe.startsWith('[CONFIDENT]')) {
    return { text: probe.replace('[CONFIDENT]', '').trim(), confident: true }
  }
  if (probe.startsWith('[NEED_EXTERNAL]')) {
    return { text: probe.replace('[NEED_EXTERNAL]', '').trim(), confident: false }
  }
  // Conservative default: treat as confident but strip any leading markers.
  return { text: probe.replace(/^\[(CONFIDENT|NEED_EXTERNAL)\]\s*/i, '').trim(), confident: true }
}

async function callFirecrawl(query: string): Promise<{ sources: Array<{ url: string; title: string; snippet: string }> }> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return { sources: [] }
  }

  // Try /search first (with timeout). /v0/search on Firecrawl has been
  // observed to hang for >30s, so we cap each call.
  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, limit: 3 }),
      signal: AbortSignal.timeout(FIRECRAWL_TIMEOUT_MS),
    })
    if (response.ok) {
      const data = await response.json()
      const sources = (data.data ?? []).map((r: any) => ({
        url: r.url ?? '',
        title: r.title ?? '',
        snippet: (r.description ?? '').toString().slice(0, 280),
      }))
      if (sources.length > 0) return { sources }
    }
  } catch {
    // fall through to scrape fallback
  }

  // Fallback: scrape a Wikipedia article whose slug approximates the query.
  // Reliable, low-latency, and works for any science topic the student asks
  // about.
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'Science'
  const url = `https://en.wikipedia.org/wiki/${slug}`
  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url, formats: ['markdown'] }),
      signal: AbortSignal.timeout(FIRECRAWL_TIMEOUT_MS),
    })
    if (!response.ok) return { sources: [] }
    const data = await response.json()
    const md = (data?.data?.markdown ?? '').toString().replace(/[#*_>`]/g, ' ').replace(/\s+/g, ' ').trim()
    const title = data?.data?.metadata?.title ?? query
    const sourceUrl = data?.data?.metadata?.sourceURL ?? url
    return {
      sources: [
        {
          url: sourceUrl,
          title,
          snippet: md.slice(0, 280),
        },
      ],
    }
  } catch {
    return { sources: [] }
  }
}

// ---------------------------------------------------------------------------
// Ask the companion — main entry point.
// ---------------------------------------------------------------------------

interface ContextSnapshot {
  section: string
  experimentId: string
  experimentTitle: string
  objective?: string
  params?: Record<string, unknown>
  measurements?: Record<string, unknown>
  results?: Record<string, unknown>
  formulas?: string[]
  errorMessage?: string
  // Rich context shipped by the workshop so the agent can decode numeric
  // indices and read the actual active objects (Reaction / Molecule / etc.).
  paramDefs?: Array<{
    key: string
    label: string
    unit?: string
    min?: number
    max?: number
    options?: string[]
  }>
  state?: unknown
  stateSummary?: string
}

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

interface AskArgs {
  context: ContextSnapshot
  question: string
  // History is passed in by the frontend so the model can reference earlier
  // turns. We cap it server-side too.
  history?: ConversationTurn[]
  forceExternal?: boolean
}

function formatContext(ctx: ContextSnapshot): string {
  const lines: string[] = []
  lines.push(`Section: ${ctx.section}`)
  lines.push(`Experiment: ${ctx.experimentTitle} (id=${ctx.experimentId})`)
  if (ctx.objective) lines.push(`Objective: ${ctx.objective}`)
  // stateSummary is the workshop's plain-English description of what's
  // currently happening. It already resolves numeric indices to labels
  // (e.g. "reaction 5 → HCl + NaOH → NaCl + H₂O"). Show it FIRST so the
  // model reads it before guessing from raw numbers.
  if (ctx.stateSummary) lines.push(`Current state: ${ctx.stateSummary}`)
  if (ctx.params && Object.keys(ctx.params).length > 0) {
    lines.push(`Parameters: ${JSON.stringify(ctx.params)}`)
  }
  if (ctx.paramDefs && ctx.paramDefs.length > 0) {
    // Render param defs with their options arrays so the model can decode
    // numeric indices (e.g. reaction=5 → options[5] = "HCl + NaOH").
    const defLines = ctx.paramDefs.map((p) => {
      const bits: string[] = [`${p.label} (${p.key})`]
      if (p.unit) bits.push(p.unit)
      if (typeof p.min === 'number' && typeof p.max === 'number') {
        bits.push(`range ${p.min}..${p.max}`)
      }
      if (p.options && p.options.length > 0) {
        bits.push(`options=[${p.options.join(', ')}]`)
      }
      return `  - ${bits.join(', ')}`
    })
    lines.push(`Parameter definitions:\n${defLines.join('\n')}`)
  }
  if (ctx.measurements && Object.keys(ctx.measurements).length > 0) {
    lines.push(`Measurements: ${JSON.stringify(ctx.measurements)}`)
  }
  if (ctx.state !== undefined && ctx.state !== null) {
    // Raw experiment state — for chemistry this includes the active
    // Reaction / Molecule / Solution objects, so the model doesn't have to
    // guess what numeric indices point at.
    lines.push(`Active state object: ${JSON.stringify(ctx.state)}`)
  }
  if (ctx.results && Object.keys(ctx.results).length > 0) {
    lines.push(`Results: ${JSON.stringify(ctx.results)}`)
  }
  if (ctx.errorMessage) lines.push(`Error / failure: ${ctx.errorMessage}`)
  if (ctx.formulas && ctx.formulas.length > 0) {
    lines.push(`Relevant formulas:`)
    for (const f of ctx.formulas) lines.push(`  - ${f}`)
  }
  return lines.join('\n')
}

function buildSystemPrompt(ctx: ContextSnapshot): string {
  // Resolve a richer entry for the active experiment from the catalog. This
  // gives the model full params/measurements/formulas for the experiment so it
  // can answer "what is this?" and "how do I build this?" accurately.
  const catalogHit = CATALOG_BY_ID[ctx.experimentId]
  const catalogEntry = catalogHit
    ? `\n\nCatalog entry for ${ctx.experimentId}:\n${JSON.stringify(catalogHit.exp, null, 2)}`
    : ''

  return (
    `You are the Workshop Companion — an AI lab assistant embedded in the Workshop app.\n` +
    `You are the student's lab companion, not a lecturer. You know the entire workshop ` +
    `catalog (every section, every experiment, their parameters, measured values, and ` +
    `formulas). You use the live experiment context block as the source of truth for ` +
    `numerical answers.\n\n` +
    `CAPABILITIES\n` +
    `- Explain what the current experiment is and what it demonstrates.\n` +
    `- Tell the student how to use it: which sliders to move, what to expect, what to compare.\n` +
    `- Walk through calculations step by step using the actual numbers from the experiment.\n` +
    `- Diagnose unexpected results and suggest concrete next actions.\n` +
    `- When the student asks about something outside the current experiment (e.g. "what ` +
    `experiments are in chemistry?", "how does gravity work?"), use the catalog below as ` +
    `your reference. Do not invent experiments.\n` +
    `- When the student asks "how can I build this?", give step-by-step guidance: which ` +
    `sliders to change, in what order, and what to observe.\n\n` +
    `RULES\n` +
    `1. Source of truth: the numbers in <experiment_context> are the running measurements. ` +
    `Never invent or substitute values that aren't there.\n` +
    `2. Catalog is authoritative for what exists, parameter ranges, formulas, and what ` +
    `each measurement means. If the student asks about an experiment not in the catalog, ` +
    `say so.\n` +
    `3. Read "Current state" first — it already resolves numeric indices to labels (e.g. ` +
    `"reaction 5 → HCl + NaOH → NaCl + H₂O"). Use "Active state object" and "Parameter ` +
    `definitions" (with their options arrays) as your fallback for full detail. Never ` +
    `guess what an index points at; if it isn't in any of those blocks, say you can't tell.\n` +
    `4. Format: prefer concise markdown. Use short paragraphs (≤4 sentences) and bulleted ` +
    `lists (≤6 items). Use \`code\` for variable names and **bold** sparingly for key ` +
    `terms. Avoid walls of text.\n` +
    `5. Tone: Socratic. End explanations with a follow-up question when it would help the ` +
    `student think ("What do you think would happen if…?", "Try halving length — what does ` +
    `the period do?"). Never refuse to answer.\n` +
    `6. If context is missing something critical, say so plainly: "I don't have enough ` +
    `information from this experiment to answer that accurately." Then suggest what they ` +
    `could change or measure.\n` +
    `7. Failed tests / errors: explain the most likely cause using the provided values, ` +
    `then suggest one concrete next action.\n` +
    `8. When the question is about a parameter or measurement, always cite the value from ` +
    `context (e.g. "your measured period is 2.01 s, theory predicts 2.00 s — within 0.5%").\n\n` +
    `STRUCTURED-REPLY FORMAT (REQUIRED)\n` +
    `Every reply must follow this exact layout — the panel renders it as a stack of cards:\n` +
    `  1. First line: **TL;DR:** <one sentence, ≤18 words, the bottom-line answer>.\n` +
    `  2. A single ### Data section containing either a markdown table OR up to 4 bullet rows ` +
    `of 'key — value' drawn from the measurements in context.\n` +
    `  3. An ### Explain section: at most 2 short paragraphs (≤3 sentences each), citing the ` +
    `actual numbers from context.\n` +
    `  4. A single ### Try this section: one concrete suggestion phrased as a question the ` +
    `student can immediately act on, ending with a ?.\n` +
    `When the experiment is one of the physics scenes (Solar System, Gravity & Free Fall, Moon ` +
    `& Tides) and the context contains paired A/B fields (body_A / body_B, g_A / g_B, ` +
    `t_A_theory / t_B_theory, v_A_theory / v_B_theory), your Data block MUST be a markdown ` +
    `table with one row per measurement and one column per scenario — never a bullet list.\n` +
    `After the Try-this sentence, append the literal token [STRUCTURED_OK] on its own line so ` +
    `we can confirm the layout was followed.\n\n` +
    `<experiment_context>\n${formatContext(ctx)}\n</experiment_context>\n` +
    `${catalogEntry}\n\n` +
    `FULL WORKSHOP CATALOG\n` +
    `=====================\n` +
    `${catalogForPrompt()}`
  )
}

export const askCompanion = action({
  args: {
    context: v.object({
      section: v.string(),
      experimentId: v.string(),
      experimentTitle: v.string(),
      objective: v.optional(v.string()),
      params: v.optional(v.any()),
      measurements: v.optional(v.any()),
      results: v.optional(v.any()),
      formulas: v.optional(v.array(v.string())),
      errorMessage: v.optional(v.string()),
      paramDefs: v.optional(v.array(v.any())),
      state: v.optional(v.any()),
      stateSummary: v.optional(v.string()),
    }),
    question: v.string(),
    history: v.optional(v.array(v.object({
      role: v.union(v.literal('user'), v.literal('assistant')),
      content: v.string(),
    }))),
    forceExternal: v.optional(v.boolean()),
  },
  handler: async (_ctx, args: AskArgs) => {
    const trimmedQuestion = args.question.trim().slice(0, 800)
    if (!trimmedQuestion) {
      return { answer: 'Type a question to get started.', usedFirecrawl: false }
    }

    const systemPrompt = buildSystemPrompt(args.context)
    const recentHistory = (args.history ?? []).slice(-8) // cap to 8 turns

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map<LLMMessage>((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: trimmedQuestion },
    ]

    // First pass — MiniMax with the confidence probe.
    let usedFirecrawl = false
    let finalAnswer: string
    try {
      const probe = await callLLMWithConfidenceFlag(messages)
      if (probe.confident && !args.forceExternal) {
        finalAnswer = probe.text
      } else {
        // Need external info. Try Firecrawl.
        const searchQuery = `${args.context.experimentTitle} ${trimmedQuestion}`.slice(0, 200)
        const { sources } = await callFirecrawl(searchQuery)
        usedFirecrawl = true

        if (sources.length === 0) {
          // No external info available — fall back to the model's own answer
          // and disclose the gap.
          finalAnswer =
            probe.confident
              ? probe.text
              : 'I don\'t have enough information from this experiment to answer that accurately, ' +
                'and I couldn\'t reach external sources right now. Try rephrasing the question or ' +
                'try again when online. ' +
                (probe.text ? `My best guess from general knowledge: ${probe.text}` : '')
        } else {
          // Build a follow-up prompt that hands the sources to MiniMax and
          // asks for a clean explanation. We do NOT dump raw source text on
          // the user.
          const sourceBlock = sources
            .map((s, i) => `[${i + 1}] ${s.title} — ${s.url}\n    ${s.snippet}`)
            .join('\n\n')
          const followUp: LLMMessage[] = [
            ...messages,
            {
              role: 'system',
              content:
                'You indicated you needed external information. Here are some sources ' +
                'that were just retrieved from the web. Use them to give a precise, ' +
                'student-friendly answer. Cite the relevant source inline like [1] when ' +
                'you use it. Do not paste the source list verbatim — explain naturally.',
            },
            {
              role: 'user',
              content: `Question: ${trimmedQuestion}\n\nSources:\n${sourceBlock}`,
            },
          ]
          finalAnswer = await callLLM(followUp, { maxTokens: 800 })
        }
      }
    } catch (err) {
      finalAnswer =
        'I couldn\'t reach the model right now. ' +
        'Check your network and try again in a moment. ' +
        `(${err instanceof Error ? err.message : 'unknown error'})`
      usedFirecrawl = false
    }

    return {
      answer: finalAnswer || '...',
      usedFirecrawl,
    }
  },
})

// Lightweight session helper. Generates a session id if none exists, and
// records the session in the workshop-users table so we can scope future
// features (progress, achievements) to the same id.
export const ensureSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, { lastActiveAt: Date.now() })
      return existing._id
    }
    return await ctx.db.insert('users', {
      sessionId: args.sessionId,
      name: undefined,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    })
  },
})
