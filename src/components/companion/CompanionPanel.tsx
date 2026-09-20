// AI Companion — panel that opens from the header "Ask Agent" button.
// Shows current experiment context, conversation history, suggested
// questions, and an input box. Markdown rendering for assistant replies
// so the agent's formatting (lists, code, bold) actually shows.
//
// All conversation state is persisted to Convex. The thread id is kept
// in localStorage keyed by (sessionId, experimentId).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { CompanionSnapshot } from '../../hooks/useCompanionContext'

interface Props {
  sessionId: string
  snapshot: CompanionSnapshot
  suggestions: string[]
  onClose: () => void
}

interface UiMessage {
  _id?: string
  role: 'user' | 'assistant'
  content: string
  usedFirecrawl?: boolean
  pending?: boolean
  failed?: boolean
}

const THREAD_KEY = (sessionId: string, experimentId: string) =>
  `workshop.companion.thread.${sessionId}.${experimentId}`

export function CompanionPanel({ sessionId, snapshot, suggestions, onClose }: Props) {
  const [threadId, setThreadId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(THREAD_KEY(sessionId, snapshot.experimentId))
    } catch {
      return null
    }
  })
  const [draft, setDraft] = useState('')
  const [pendingReply, setPendingReply] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const getOrCreateThread = useMutation(api.companion.getOrCreateThread)
  const appendMessage = useMutation(api.companion.appendMessage)
  const askCompanion = useAction(api.companion.askCompanion)

  const persistedMessages = useQuery(
    api.companion.listMessages,
    threadId ? { threadId: threadId as any } : ('skip' as any),
  )

  const messages: UiMessage[] = useMemo(() => {
    const base: UiMessage[] = (persistedMessages ?? []).map((m: any) => ({
      _id: m._id,
      role: m.role,
      content: m.content,
      usedFirecrawl: m.usedFirecrawl,
    }))
    if (pendingReply) {
      base.push({ role: 'assistant', content: pendingReply, pending: true })
    }
    return base
  }, [persistedMessages, pendingReply])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length, pendingReply])

  const ensureThread = useCallback(
    async (firstMessage: string): Promise<string> => {
      if (threadId) return threadId
      const id = await getOrCreateThread({
        sessionId,
        workshopSlug: snapshot.section,
        experimentId: snapshot.experimentId,
        experimentTitle: snapshot.experimentTitle,
        firstMessage,
      })
      setThreadId(id as string)
      try {
        localStorage.setItem(THREAD_KEY(sessionId, snapshot.experimentId), id as string)
      } catch {}
      return id as string
    },
    [threadId, getOrCreateThread, sessionId, snapshot.section, snapshot.experimentId, snapshot.experimentTitle],
  )

  const sendQuestion = useCallback(
    async (raw: string) => {
      const question = raw.trim()
      if (!question) return
      setDraft('')

      const tid = await ensureThread(question)
      await appendMessage({
        threadId: tid as any,
        role: 'user',
        content: question,
        contextSnapshot: snapshot,
      })

      const recent = (messages ?? [])
        .filter((m) => !m.pending)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }))

      setPendingReply('Thinking…')
      try {
        const result = await askCompanion({
          context: snapshot,
          question,
          history: recent,
        } as any)
        await appendMessage({
          threadId: tid as any,
          role: 'assistant',
          content: result.answer,
          contextSnapshot: snapshot,
          usedFirecrawl: result.usedFirecrawl,
        })
        setPendingReply(null)
      } catch (err) {
        setPendingReply(
          'I couldn\'t reach the companion right now. ' +
            'Please retry — your message was saved. ' +
            (err instanceof Error ? `(${err.message.slice(0, 60)})` : ''),
        )
      }
    },
    [appendMessage, askCompanion, ensureThread, messages, snapshot],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendQuestion(draft)
  }

  return (
    <div className="companion-panel" role="dialog" aria-label="Workshop Companion">
      <div className="companion-header">
        <div className="companion-header-left">
          <span className="companion-header-title">WORKSHOP COMPANION</span>
          <span className="companion-header-sub">
            {snapshot.section.toUpperCase()} · {snapshot.experimentTitle}
          </span>
        </div>
        <button
          type="button"
          className="companion-close"
          onClick={onClose}
          title="Close"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      <div className="companion-context">
        <CompanionContext snapshot={snapshot} />
      </div>

      {messages.length === 0 && (
        <CompanionIntro
          snapshot={snapshot}
          suggestions={suggestions}
          onAsk={(q) => void sendQuestion(q)}
        />
      )}

      <div className="companion-thread" ref={scrollRef}>
        {messages.map((m, i) => (
          <MessageBubble
            key={m._id ?? `pending-${i}`}
            message={m}
            onAction={(q) => {
              setDraft(q)
              requestAnimationFrame(() => {
                const ta = document.querySelector<HTMLTextAreaElement>('.companion-input textarea')
                ta?.focus()
              })
            }}
          />
        ))}
      </div>

      <form className="companion-input" onSubmit={onSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void sendQuestion(draft)
            }
          }}
          placeholder="Ask why something happened, what to change, or what to try next…"
          rows={2}
        />
        <button
          type="submit"
          className="companion-send"
          disabled={!draft.trim() || pendingReply !== null}
          aria-label="Send"
          title="Send"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l14-7-5 16-3-7-6-2z" />
          </svg>
        </button>
      </form>

      <style>{PANEL_STYLES}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty-state — clear CTAs that demonstrate what the agent can do.
// ---------------------------------------------------------------------------

function CompanionIntro({
  snapshot,
  suggestions,
  onAsk,
}: {
  snapshot: CompanionSnapshot
  suggestions: string[]
  onAsk: (q: string) => void
}) {
  const primary = useMemo(
    () => buildPrimaryPrompts(snapshot),
    [snapshot],
  )
  return (
    <div className="companion-intro">
      <div className="companion-intro-hero">
        <span className="companion-intro-eyebrow">What this does</span>
        <span className="companion-intro-line">{snapshot.objective ?? snapshot.experimentTitle}</span>
      </div>
      <span className="companion-section-label">Ask</span>
      <div className="companion-chip-row">
        {primary.map((s) => (
          <button key={s} type="button" className="companion-chip primary" onClick={() => onAsk(s)}>
            {s}
          </button>
        ))}
      </div>
      {suggestions.length > 0 && (
        <>
          <span className="companion-section-label">More</span>
          <div className="companion-chip-row">
            {suggestions.slice(0, 4).map((s) => (
              <button key={s} type="button" className="companion-chip" onClick={() => onAsk(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function buildPrimaryPrompts(s: CompanionSnapshot): string[] {
  const id = s.experimentId.toLowerCase()
  const title = s.experimentTitle.toLowerCase()
  const out: string[] = []
  if (id.includes('pendulum') || title.includes('pendulum')) {
    out.push('What is this experiment and what does it show?')
    out.push('How should I change the length to double the period?')
  } else if (id.includes('projectile') || title.includes('projectile')) {
    out.push('What angle gives the longest range, and why?')
    out.push('How do I use this to hit a target at distance X?')
  } else if (id.includes('titration') || title.includes('titration')) {
    out.push('How do I find the equivalence point from this curve?')
    out.push('What\'s happening chemically at the equivalence point?')
  } else if (id.includes('orbit') || title.includes('orbit')) {
    out.push('What\'s the difference between circular, elliptical, and hyperbolic orbits?')
    out.push('How do I read T² and a³ off this simulation?')
  } else if (id.includes('escape')) {
    out.push('How do I know if my projectile escaped?')
    out.push('What is escape velocity and how do I calculate it here?')
  } else if (id.includes('periodic') || id.includes('element')) {
    out.push('What trends will I see by changing Z?')
    out.push('Why is this element in this group/period?')
  } else if (id.includes('molecule')) {
    out.push('What\'s the geometry and is it polar?')
    out.push('How do I read the bond angles?')
  } else if (id.includes('isotope')) {
    out.push('How are isotopes of the same element different?')
    out.push('What does A = Z + N tell me?')
  } else if (s.section === 'cad' || title.includes('beam') || title.includes('truss')) {
    out.push('How do I build a stiffer structure?')
    out.push('What does the test result actually measure?')
  } else {
    out.push('What does this experiment show?')
    out.push('How should I change parameters to see the effect?')
  }
  // Always offer a generic "what is this" CTA at the top for clarity.
  out.unshift('What is this experiment and how do I use it?')
  // De-dupe and cap at 3.
  const seen = new Set<string>()
  const final: string[] = []
  for (const q of out) {
    if (seen.has(q)) continue
    seen.add(q)
    final.push(q)
    if (final.length >= 3) break
  }
  return final
}

// ---------------------------------------------------------------------------
// Message bubble with lightweight markdown.
// ---------------------------------------------------------------------------

function MessageBubble({
  message,
  onAction,
}: {
  message: UiMessage
  onAction?: (q: string) => void
}) {
  const isUser = message.role === 'user'
  return (
    <div className={`msg ${isUser ? 'user' : 'assistant'}`}>
      <div className="msg-author">
        {isUser ? 'You' : 'Companion'}
        {message.usedFirecrawl && (
          <span className="msg-tag" title="Answer drew on external sources.">
            ·web
          </span>
        )}
        {message.failed && <span className="msg-tag danger">retry</span>}
      </div>
      <div className={`msg-body ${message.failed ? 'failed' : ''}`}>
        {isUser ? (
          <span className="msg-text">{message.content}</span>
        ) : message.content && detectStructured(message.content) ? (
          <StructuredReply
            text={message.content}
            onAction={onAction ?? (() => undefined)}
          />
        ) : (
          <Markdown text={message.content} />
        )}
        {message.pending && (
          <span className="msg-pending" aria-label="thinking">
            ···
          </span>
        )}
      </div>
      <style>{`
        .msg { display: flex; flex-direction: column; gap: 2px; }
        .msg-author {
          font-size: 10px;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .msg-body {
          font-size: 13px;
          line-height: 1.55;
          padding: 8px 11px;
          border-radius: 10px;
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: anywhere;
        }
        .msg.user .msg-body {
          background: var(--accent);
          color: white;
          border-bottom-right-radius: 2px;
        }
        .msg.assistant .msg-body {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 2px;
        }
        .msg-body.failed {
          background: rgba(220, 38, 38, 0.08);
          color: var(--danger);
          border-color: rgba(220, 38, 38, 0.30);
        }
        .msg-pending {
          display: inline-block;
          margin-left: 4px;
          animation: companion-pending 1s steps(2, end) infinite;
          opacity: 0.6;
        }
        @keyframes companion-pending {
          0%, 50% { opacity: 0.15; }
          51%, 100% { opacity: 0.85; }
        }
        .msg-tag {
          font-size: 9px;
          font-family: ui-monospace, monospace;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          border-radius: 4px;
          padding: 1px 4px;
          letter-spacing: 0.02em;
        }
        .msg-tag.danger {
          background: rgba(220, 38, 38, 0.12);
          color: var(--danger);
        }
      `}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Structured reply — TL;DR / Data / Explain / Try-this cards.
// Detected when the assistant opened with **TL;DR:** and includes at
// least one ### Data and one ### Try this section. Anything else falls
// back to the regular Markdown renderer below.
// ---------------------------------------------------------------------------

interface StructuredSections {
  tldr: string
  data: string
  explain: string
  action: string
}

function detectStructured(text: string): StructuredSections | null {
  if (!text) return null
  const tldrMatch = /\*\*TL;DR:\*\*\s*(.+?)(?:\n|$)/i.exec(text)
  if (!tldrMatch) return null
  const tldr = tldrMatch[1].trim()

  const dataMatch = /###\s*Data\s*\n([\s\S]*?)(?=\n###\s*(?:Explain|Try\s+this)|$)/i.exec(text)
  if (!dataMatch) return null
  const data = dataMatch[1].trim()

  const explainMatch = /###\s*Explain\s*\n([\s\S]*?)(?=\n###\s*Try\s+this|$)/i.exec(text)
  if (!explainMatch) return null
  const explain = explainMatch[1].trim()

  const actionMatch = /###\s*Try\s+this\s*\n([\s\S]*?)(?:\n\[STRUCTURED_OK\])?$/i.exec(text)
  if (!actionMatch) return null
  let action = actionMatch[1].trim()
  // Strip trailing [STRUCTURED_OK] token if present anywhere.
  action = action.replace(/\[STRUCTURED_OK\]\s*$/i, '').trim()
  if (!action) return null

  return { tldr, data, explain, action }
}

function parseDataTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  const headerLine = /^\|(.+)\|$/.exec(lines[0])
  const sepLine = /^\|[\s:|-]+\|$/.exec(lines[1])
  if (!headerLine || !sepLine) return null
  const headers = headerLine[1].split('|').map((h) => h.trim()).filter(Boolean)
  const rows: string[][] = []
  for (let i = 2; i < lines.length; i++) {
    const line = /^\|(.+)\|$/.exec(lines[i])
    if (!line) continue
    rows.push(line[1].split('|').map((c) => c.trim()))
  }
  if (rows.length === 0) return null
  return { headers, rows }
}

function parseDataList(text: string): string[] | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
  if (lines.length === 0) return null
  return lines.map((l) => l.replace(/^[-*]\s+/, ''))
}

function StructuredReply({
  text,
  onAction,
}: {
  text: string
  onAction: (q: string) => void
}) {
  const sections = useMemo(() => detectStructured(text), [text])
  if (!sections) return <Markdown text={text} />
  const { tldr, data, explain, action } = sections
  const table = parseDataTable(data)
  const list = !table ? parseDataList(data) : null

  return (
    <div className="sr">
      {/* Summary card */}
      <div className="sr-card sr-card-summary">
        <span className="sr-eyebrow">TL;DR</span>
        <span className="sr-line">{tldr}</span>
      </div>

      {/* Data card */}
      {(table || list) && (
        <div className="sr-card sr-card-data">
          <span className="sr-eyebrow">Data</span>
          {table && (
            <table className="sr-table">
              <thead>
                <tr>
                  {table.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {list && !table && (
            <ul className="sr-list">
              {list.map((item, i) => (
                <li key={i}>{renderInline(item)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Explain card */}
      {explain && (
        <div className="sr-card sr-card-explain">
          <span className="sr-eyebrow">Explain</span>
          {explain.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="sr-p">
              {renderInline(para.replace(/\n/g, ' '))}
            </p>
          ))}
        </div>
      )}

      {/* Try-this card with clickable action */}
      <div className="sr-card sr-card-action">
        <span className="sr-eyebrow">Try this</span>
        <p className="sr-p sr-p-action">{renderInline(action)}</p>
        <button
          type="button"
          className="sr-action-btn"
          onClick={() => onAction(action)}
          title="Send this as a follow-up"
        >
          Send follow-up →
        </button>
      </div>

      <style>{`
        .sr {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 100%;
        }
        .sr-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
          font-size: 12px;
          line-height: 1.45;
        }
        .sr-eyebrow {
          font-size: 9px;
          letter-spacing: 0.08em;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .sr-line {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }
        .sr-p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.5;
        }
        .sr-p-action {
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 500;
        }
        .sr-card-summary {
          border-left: 3px solid var(--accent);
          background: rgba(14, 165, 233, 0.06);
        }
        .sr-card-data {
          border-left: 3px solid #6b7280;
        }
        .sr-card-explain {
          border-left: 3px solid #94a3b8;
        }
        .sr-card-action {
          border-left: 3px solid var(--accent);
          background: rgba(14, 165, 233, 0.04);
        }
        .sr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 2px;
        }
        .sr-table th, .sr-table td {
          padding: 3px 6px;
          border-bottom: 1px solid var(--border-subtle);
          text-align: left;
          font-family: ui-monospace, monospace;
        }
        .sr-table th {
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-size: 9.5px;
          color: var(--text-muted);
        }
        .sr-table td {
          color: var(--text-primary);
        }
        .sr-list {
          margin: 0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sr-list li {
          color: var(--text-primary);
          font-family: ui-monospace, monospace;
          font-size: 11px;
        }
        .sr-list li::marker { color: var(--text-muted); }
        .sr-action-btn {
          align-self: flex-start;
          margin-top: 6px;
          font-size: 10.5px;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 6px;
          background: var(--accent);
          color: white;
          border: none;
          cursor: pointer;
          transition: opacity 120ms;
        }
        .sr-action-btn:hover { opacity: 0.85; }
      `}</style>
    </div>
  )
}

/**
 * Tiny markdown renderer for the agent's replies. Supports:
 *   - paragraphs (blank line separated)
 *   - headings: #, ##, ###
 *   - unordered lists: - or *
 *   - ordered lists: 1. 2. 3.
 *   - **bold**, *italic*, `inline code`
 *   - > blockquote
 *   - line breaks within a paragraph
 *
 * Sanitises any raw HTML to text. No XSS surface.
 */
function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdown(text), [text])
  return (
    <div className="md">
      {blocks.map((b, i) => renderBlock(b, i))}
      <style>{`
        .md { display: flex; flex-direction: column; gap: 6px; }
        .md-p { margin: 0; white-space: pre-wrap; }
        .md-h1 { font-size: 14px; font-weight: 700; margin: 2px 0 0; }
        .md-h2 { font-size: 13px; font-weight: 700; margin: 2px 0 0; }
        .md-h3 { font-size: 12px; font-weight: 700; margin: 2px 0 0; }
        .md-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
        .md-list li::marker { color: var(--text-muted); }
        .md-quote {
          border-left: 2px solid var(--border-default);
          margin: 0;
          padding: 0 8px;
          color: var(--text-secondary);
          font-style: italic;
        }
        .md-code {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 0 4px;
          border-radius: 3px;
          font-family: ui-monospace, monospace;
          font-size: 12px;
        }
        .md-bold { font-weight: 600; }
        .md-italic { font-style: italic; }
      `}</style>
    </div>
  )
}

type InlineToken = { kind: 'text'; value: string } | { kind: 'code'; value: string } | { kind: 'bold'; value: string } | { kind: 'italic'; value: string }

type Block =
  | { kind: 'h'; level: 1 | 2 | 3; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string }

function parseMarkdown(input: string): Block[] {
  const text = (input ?? '').replace(/\r\n/g, '\n')
  const lines = text.split('\n')
  const out: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i++
      continue
    }
    // Heading
    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    if (h) {
      out.push({ kind: 'h', level: h[1].length as 1 | 2 | 3, text: h[2].trim() })
      i++
      continue
    }
    // Blockquote (collect consecutive)
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push({ kind: 'quote', text: buf.join(' ') })
      continue
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      out.push({ kind: 'ul', items })
      continue
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      out.push({ kind: 'ol', items })
      continue
    }
    // Paragraph (collect until blank line / heading / list / quote)
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push({ kind: 'p', text: buf.join('\n') })
  }
  return out
}

function renderBlock(b: Block, key: number): JSX.Element {
  switch (b.kind) {
    case 'h':
      if (b.level === 1) return <div key={key} className="md-h1">{renderInline(b.text)}</div>
      if (b.level === 2) return <div key={key} className="md-h2">{renderInline(b.text)}</div>
      return <div key={key} className="md-h3">{renderInline(b.text)}</div>
    case 'p':
      return <p key={key} className="md-p">{renderInline(b.text)}</p>
    case 'ul':
      return (
        <ul key={key} className="md-list">
          {b.items.map((it, k) => <li key={k}>{renderInline(it)}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol key={key} className="md-list">
          {b.items.map((it, k) => <li key={k}>{renderInline(it)}</li>)}
        </ol>
      )
    case 'quote':
      return <blockquote key={key} className="md-quote">{renderInline(b.text)}</blockquote>
  }
}

function renderInline(text: string): JSX.Element[] {
  const tokens = tokeniseInline(text)
  return tokens.map((t, i) => {
    if (t.kind === 'text') return <span key={i}>{t.value}</span>
    if (t.kind === 'code') return <code key={i} className="md-code">{t.value}</code>
    if (t.kind === 'bold') return <strong key={i} className="md-bold">{t.value}</strong>
    return <em key={i} className="md-italic">{t.value}</em>
  })
}

function tokeniseInline(text: string): InlineToken[] {
  const out: InlineToken[] = []
  let i = 0
  let buf = ''
  const flush = () => {
    if (buf.length > 0) {
      out.push({ kind: 'text', value: buf })
      buf = ''
    }
  }
  while (i < text.length) {
    const ch = text[i]
    // Inline code: `...`
    if (ch === '`') {
      const end = text.indexOf('`', i + 1)
      if (end > i) {
        flush()
        out.push({ kind: 'code', value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    // Bold: **...**
    if (ch === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2)
      if (end > i + 1) {
        flush()
        out.push({ kind: 'bold', value: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // Italic: *...*
    if (ch === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1)
      if (end > i) {
        flush()
        out.push({ kind: 'italic', value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    buf += ch
    i++
  }
  flush()
  return out
}

// ---------------------------------------------------------------------------
// Context block — shows the live experiment snapshot.
// ---------------------------------------------------------------------------

function CompanionContext({ snapshot }: { snapshot: CompanionSnapshot }) {
  const lines = useMemo(() => buildContextLines(snapshot), [snapshot])
  return (
    <div className="cc">
      <span className="cc-label">Live context</span>
      <ul className="cc-list">
        {lines.map((l, i) => (
          <li key={i}>
            <span className="cc-key">{l.key}</span>
            <span className="cc-val">{l.value}</span>
          </li>
        ))}
      </ul>
      <style>{`
        .cc { display: flex; flex-direction: column; gap: 4px; }
        .cc-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .cc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .cc-list li { display: flex; gap: 8px; font-size: 11px; line-height: 1.4; }
        .cc-key {
          flex-shrink: 0;
          min-width: 96px;
          color: var(--text-muted);
          font-family: ui-monospace, monospace;
        }
        .cc-val {
          color: var(--text-primary);
          font-family: ui-monospace, monospace;
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  )
}

function buildContextLines(s: CompanionSnapshot): Array<{ key: string; value: string }> {
  const lines: Array<{ key: string; value: string }> = []
  lines.push({ key: 'experiment', value: s.experimentTitle })
  if (s.objective) lines.push({ key: 'objective', value: s.objective })
  // stateSummary is the workshop's plain-English description of what's
  // happening right now. Show it as a single highlighted line so the user
  // can see what the agent is being told.
  if (s.stateSummary) lines.push({ key: 'now', value: s.stateSummary })

  const fmt = (v: unknown): string => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return v.toString()
      if (Math.abs(v) >= 1000 || (Math.abs(v) > 0 && Math.abs(v) < 0.01)) return v.toExponential(2)
      return v.toFixed(3).replace(/\.?0+$/, '')
    }
    if (typeof v === 'string') return v
    if (typeof v === 'boolean') return v ? 'yes' : 'no'
    if (Array.isArray(v)) return v.join(', ')
    try { return JSON.stringify(v) } catch { return String(v) }
  }

  if (s.params) {
    for (const [k, v] of Object.entries(s.params)) {
      lines.push({ key: `param · ${k}`, value: fmt(v) })
    }
  }
  if (s.measurements) {
    for (const [k, v] of Object.entries(s.measurements)) {
      lines.push({ key: `meas · ${k}`, value: fmt(v) })
    }
  }
  if (s.results) {
    for (const [k, v] of Object.entries(s.results)) {
      lines.push({ key: `result · ${k}`, value: fmt(v) })
    }
  }
  if (s.errorMessage) lines.push({ key: 'error', value: s.errorMessage })
  return lines
}

// ---------------------------------------------------------------------------
// Static CSS for the panel.
// ---------------------------------------------------------------------------

const PANEL_STYLES = `
  .companion-panel {
    position: fixed;
    top: 64px;
    right: 16px;
    z-index: 60;
    width: 380px;
    max-width: calc(100vw - 28px);
    height: min(620px, calc(100vh - 88px));
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    border-radius: 12px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  @media (max-width: 640px) {
    .companion-panel {
      right: 10px;
      left: 10px;
      width: auto;
      top: 60px;
      height: min(78vh, 640px);
    }
  }
  .companion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px 10px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .companion-header-left {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .companion-header-title {
    font-size: 10px;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: var(--accent);
  }
  .companion-header-sub {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .companion-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
    border-radius: 6px;
    cursor: pointer;
  }
  .companion-close:hover { color: var(--text-primary); border-color: var(--border-default); }

  .companion-context {
    padding: 9px 14px 10px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-tertiary);
    max-height: 160px;
    overflow-y: auto;
  }

  .companion-intro {
    padding: 10px 14px 12px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .companion-intro-hero {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
  }
  .companion-intro-eyebrow {
    font-size: 9px;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  .companion-intro-line {
    font-size: 12px;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .companion-section-label {
    font-size: 10px;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  .companion-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .companion-chip {
    font-size: 11px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-default);
    border-radius: 999px;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 120ms;
    line-height: 1.3;
  }
  .companion-chip:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .companion-chip.primary {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
    font-weight: 500;
  }

  .companion-thread {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
  }

  .companion-input {
    display: flex;
    gap: 6px;
    align-items: flex-end;
    padding: 10px 12px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-secondary);
  }
  .companion-input textarea {
    flex: 1;
    resize: none;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 12px;
    font-family: inherit;
    line-height: 1.4;
  }
  .companion-input textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
  }
  .companion-send {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--accent);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  .companion-send:disabled { opacity: 0.4; cursor: not-allowed; }
`
