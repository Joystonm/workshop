import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // User profiles (session-based anonymous users)
  users: defineTable({
    sessionId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  }).index('by_session', ['sessionId']),

  // Workshops (CAD, Physics, Solar, Chemistry)
  workshops: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    order: v.number(),
  }).index('by_slug', ['slug']),

  // Individual experiments/challenges within workshops
  experiments: defineTable({
    workshopSlug: v.string(), // 'cad', 'physics', 'solar', 'chemistry'
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
    objectives: v.array(v.string()),
    constraints: v.optional(v.array(v.string())),
    successCriteria: v.string(),
    hints: v.optional(v.array(v.string())),
    order: v.number(),
    isPublished: v.boolean(),
    createdBy: v.optional(v.id('users')),
  }).index('by_workshop', ['workshopSlug']).index('by_difficulty', ['difficulty']),

  // User's experiment attempts/saves
  attempts: defineTable({
    userId: v.id('users'),
    experimentId: v.id('experiments'),
    workshopSlug: v.string(),
    state: v.object({
      // Flexible state storage for different workshop types
      data: v.any(),
    }),
    status: v.union(
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed')
    ),
    result: v.optional(v.object({
      passed: v.boolean(),
      score: v.optional(v.number()),
      duration: v.optional(v.number()),
      details: v.optional(v.any()),
    })),
    attemptNumber: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_experiment', ['experimentId'])
    .index('by_user_experiment', ['userId', 'experimentId']),

  // Saved projects (user's own designs)
  savedProjects: defineTable({
    userId: v.id('users'),
    workshopSlug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    state: v.any(), // Workshop-specific state
    thumbnail: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_workshop', ['workshopSlug']),

  // User progress tracking
  progress: defineTable({
    userId: v.id('users'),
    workshopSlug: v.string(),
    experimentsCompleted: v.number(),
    experimentsAttempted: v.number(),
    totalAttempts: v.number(),
    discoveries: v.array(v.string()),
    streak: v.number(),
    lastActivityAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_user_workshop', ['userId', 'workshopSlug']),

  // AI conversation history
  conversations: defineTable({
    userId: v.id('users'),
    experimentId: v.optional(v.id('experiments')),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_experiment', ['experimentId']),

  // Companion threads — one thread per experiment session.
  companionThreads: defineTable({
    sessionId: v.string(),          // localStorage / cookie session identifier (no auth required)
    userId: v.optional(v.id('users')),
    workshopSlug: v.string(),        // 'physics' | 'chemistry' | 'cad' | 'solar'
    experimentId: v.string(),        // free-form id e.g. 'pendulum', 'periodic-table', 'mesh-1'
    experimentTitle: v.string(),
    title: v.string(),               // first user message, trimmed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_session', ['sessionId'])
    .index('by_session_experiment', ['sessionId', 'experimentId'])
    .index('by_session_updated', ['sessionId', 'updatedAt']),

  // Companion messages — each row is one user or assistant turn.
  companionMessages: defineTable({
    threadId: v.id('companionThreads'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    // Snapshot of the experiment state captured when this message was sent.
    // Lets the assistant ground future answers in what the student saw.
    contextSnapshot: v.optional(v.object({
      section: v.string(),
      experimentId: v.string(),
      experimentTitle: v.string(),
      objective: v.optional(v.string()),
      params: v.optional(v.any()),
      measurements: v.optional(v.any()),
      results: v.optional(v.any()),
      formulas: v.optional(v.array(v.string())),
      errorMessage: v.optional(v.string()),
      // Rich context persisted for replay when the LLM asks follow-ups.
      paramDefs: v.optional(v.array(v.any())),
      state: v.optional(v.any()),
      stateSummary: v.optional(v.string()),
    })),
    usedFirecrawl: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index('by_thread', ['threadId'])
    .index('by_thread_created', ['threadId', 'createdAt']),

  // Research sessions (Firecrawl)
  researchSessions: defineTable({
    userId: v.id('users'),
    query: v.string(),
    sources: v.array(v.object({
      url: v.string(),
      title: v.string(),
      snippet: v.string(),
    })),
    extractedConcepts: v.array(v.string()),
    generatedExperiment: v.optional(v.object({
      title: v.string(),
      description: v.string(),
      workshopSlug: v.string(),
    })),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Achievements
  achievements: defineTable({
    userId: v.id('users'),
    achievementId: v.string(),
    title: v.string(),
    description: v.string(),
    unlockedAt: v.number(),
  }).index('by_user', ['userId']),

  // Activity history for timeline
  activityHistory: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('experiment_started'),
      v.literal('experiment_completed'),
      v.literal('experiment_failed'),
      v.literal('project_saved'),
      v.literal('achievement_unlocked'),
      v.literal('ai_assistance'),
      v.literal('research_completed')
    ),
    workshopSlug: v.optional(v.string()),
    experimentId: v.optional(v.id('experiments')),
    projectId: v.optional(v.id('savedProjects')),
    details: v.any(),
    createdAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_user_created', ['userId', 'createdAt']),
})
