import { action } from './_generated/server'
import { v } from 'convex/values'

// MiniMax AI Actions
export const aiGenerateHint = action({
  args: {
    context: v.object({
      workshopSlug: v.string(),
      experimentTitle: v.string(),
      attemptHistory: v.array(v.string()),
      currentState: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.MINIMAX_API_KEY

    if (!apiKey) {
      return { error: 'MiniMax API key not configured', hint: 'Check your environment variables.' }
    }

    const response = await fetch(
      process.env.MINIMAX_API_URL || 'https://console.gmicloud.ai/user-console/ie/model-hub/llm/3c25d31e-d652-4d0b-bb0f-24476766da32',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'MiniMax/Abab6',
          messages: [
            {
              role: 'system',
              content: `You are a helpful workshop companion for students learning through hands-on experimentation.
Your role is to guide students toward discovery without giving away the answer.
When a student asks for help or their experiment fails, provide Socratic hints that encourage thinking.
Never reveal the solution directly. Ask questions that lead to insight.`,
            },
            {
              role: 'user',
              content: `The student is working on: "${args.context.experimentTitle}" in ${args.context.workshopSlug}.
Their recent attempts:
${args.context.attemptHistory.slice(-3).map((a, i) => `${i + 1}. ${a}`).join('\n')}

Current state: ${args.context.currentState}

Provide a helpful hint that guides the student toward discovery without giving away the answer.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    )

    if (!response.ok) {
      return { error: `API error: ${response.status}`, hint: 'Unable to generate hint right now.' }
    }

    const data = await response.json()
    return { hint: data.choices?.[0]?.message?.content || 'Keep experimenting!' }
  },
})

export const aiGenerateChallenge = action({
  args: {
    params: v.object({
      workshopSlug: v.string(),
      difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
      conceptsExplored: v.array(v.string()),
      previousChallengeIds: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.MINIMAX_API_KEY

    if (!apiKey) {
      return {
        title: 'Custom Challenge',
        description: 'Create your own experiment',
        objectives: ['Complete your experiment'],
        constraints: [],
        hints: ['Think about what you want to test'],
      }
    }

    const response = await fetch(
      process.env.MINIMAX_API_URL || 'https://console.gmicloud.ai/user-console/ie/model-hub/llm/3c25d31e-d652-4d0b-bb0f-24476766da32',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'MiniMax/Abab6',
          messages: [
            {
              role: 'system',
              content: `You are an expert curriculum designer for a hands-on learning workshop.
Generate creative, engaging challenges that teach through experimentation.
Each challenge should have a clear objective, reasonable constraints, and hints for when students get stuck.
Respond ONLY with valid JSON: { title, description, objectives: string[], constraints: string[], hints: string[] }`,
            },
            {
              role: 'user',
              content: `Generate a challenge for the ${args.params.workshopSlug} workshop at ${args.params.difficulty} difficulty.
Concepts already explored: ${args.params.conceptsExplored.join(', ')}
Previous challenges: ${args.params.previousChallengeIds.join(', ')}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      }
    )

    if (!response.ok) {
      return {
        title: 'Custom Challenge',
        description: 'Create your own experiment',
        objectives: ['Complete your experiment'],
        constraints: [],
        hints: ['Think about what you want to test'],
      }
    }

    const data = await response.json()
    try {
      return JSON.parse(data.choices?.[0]?.message?.content || '{}')
    } catch {
      return {
        title: 'Custom Challenge',
        description: 'Create your own experiment',
        objectives: ['Complete your experiment'],
        constraints: [],
        hints: ['Think about what you want to test'],
      }
    }
  },
})

// Firecrawl Research Actions
export const researchTopic = action({
  args: {
    topic: v.string(),
    workshopContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY

    if (!apiKey) {
      return {
        sources: [],
        concepts: args.topic.split(/\s+/).filter(w => w.length > 3).slice(0, 5),
        experimentSuggestion: {
          title: `Explore: ${args.topic}`,
          description: `Build an experiment to understand ${args.topic}`,
          workshopSlug: args.workshopContext || 'physics',
        },
      }
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v0/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: `${args.topic} educational science tutorial`,
          limit: 5,
        }),
      })

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`)
      }

      const searchData = await response.json()

      const sources = searchData.data?.map((result: any) => ({
        url: result.url,
        title: result.title,
        snippet: result.description || '',
      })) || []

      // Extract concepts
      const conceptKeywords: Record<string, string[]> = {
        solar: ['photovoltaic', 'solar cell', 'renewable energy', 'efficiency'],
        electricity: ['circuit', 'voltage', 'current', 'resistance', 'parallel', 'series'],
        chemistry: ['reaction', 'molecule', 'acid', 'base', 'precipitate'],
        physics: ['force', 'motion', 'energy', 'gravity', 'momentum'],
        cad: ['structure', 'load', 'stress', 'strain', 'beam', 'bridge'],
      }

      const concepts: string[] = []
      const lowerTopic = args.topic.toLowerCase()

      for (const [key, kw] of Object.entries(conceptKeywords)) {
        if (lowerTopic.includes(key)) {
          concepts.push(...kw)
        }
      }

      return {
        sources,
        concepts: [...new Set(concepts)].slice(0, 10),
        experimentSuggestion: {
          title: `Explore: ${args.topic}`,
          description: `Build an experiment to understand ${args.topic}. Key concepts: ${concepts.slice(0, 3).join(', ')}`,
          workshopSlug: args.workshopContext || 'physics',
        },
      }
    } catch (error) {
      console.error('Firecrawl error:', error)
      return {
        sources: [],
        concepts: args.topic.split(/\s+/).filter(w => w.length > 3).slice(0, 5),
        experimentSuggestion: {
          title: `Explore: ${args.topic}`,
          description: `Build an experiment to understand ${args.topic}`,
          workshopSlug: args.workshopContext || 'physics',
        },
      }
    }
  },
})
