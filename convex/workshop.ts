import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Get user by session ID
export const getUserBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('sessionId'), args.sessionId))
      .first()
  },
})

// Create a new user (session-based)
export const createUser = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('sessionId'), args.sessionId))
      .first()

    if (existing) return existing._id

    const now = Date.now()
    return await ctx.db.insert('users', {
      sessionId: args.sessionId,
      name: `Explorer ${Math.floor(Math.random() * 10000)}`,
      createdAt: now,
      lastActiveAt: now,
    })
  },
})

// Get all workshops
export const listWorkshops = query({
  handler: async (ctx) => {
    return await ctx.db.query('workshops').order("asc").collect()
  },
})

// Get workshop by slug
export const getWorkshopBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('workshops').filter((q) => q.eq(q.field('slug'), args.slug)).first()
  },
})

// Get experiments for a workshop
export const getExperimentsByWorkshop = query({
  args: { workshopSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('experiments')
      .filter((q) => q.and(
        q.eq(q.field('workshopSlug'), args.workshopSlug),
        q.eq(q.field('isPublished'), true)
      ))
      .order("asc")
      .collect()
  },
})

// Get user's progress across all workshops
export const getUserProgress = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.query('progress').filter((q) => q.eq(q.field('userId'), args.userId)).collect()
  },
})

// Get user's attempts for an experiment
export const getAttemptsByExperiment = query({
  args: { userId: v.id('users'), experimentId: v.id('experiments') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('attempts')
      .filter((q) => q.and(
        q.eq(q.field('userId'), args.userId),
        q.eq(q.field('experimentId'), args.experimentId)
      ))
      .order('desc')
      .collect()
  },
})

// Get user's saved projects
export const getSavedProjects = query({
  args: { userId: v.id('users'), workshopSlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query('savedProjects').filter((q) => q.eq(q.field('userId'), args.userId))
    if (args.workshopSlug) {
      query = ctx.db.query('savedProjects').filter((q) => q.and(
        q.eq(q.field('userId'), args.userId),
        q.eq(q.field('workshopSlug'), args.workshopSlug)
      ))
    }
    return await query.order('desc').collect()
  },
})

// Get activity history
export const getActivityHistory = query({
  args: { userId: v.id('users'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20
    const activities = await ctx.db
      .query('activityHistory')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .take(limit)
    return activities
  },
})

// Save a new attempt
export const saveAttempt = mutation({
  args: {
    userId: v.id('users'),
    experimentId: v.id('experiments'),
    workshopSlug: v.string(),
    state: v.any(),
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
  },
  handler: async (ctx, args) => {
    // Get previous attempts count
    const previousAttempts = await ctx.db
      .query('attempts')
      .filter((q) => q.and(
        q.eq(q.field('userId'), args.userId),
        q.eq(q.field('experimentId'), args.experimentId)
      ))
      .collect()

    const attemptNumber = previousAttempts.length + 1
    const now = Date.now()

    const attemptId = await ctx.db.insert('attempts', {
      userId: args.userId,
      experimentId: args.experimentId,
      workshopSlug: args.workshopSlug,
      state: { data: args.state },
      status: args.status,
      result: args.result,
      attemptNumber,
      createdAt: now,
      updatedAt: now,
    })

    // Update progress
    await updateProgress(ctx, args.userId, args.workshopSlug, args.status)

    // Record activity
    await ctx.db.insert('activityHistory', {
      userId: args.userId,
      type: args.status === 'completed' ? 'experiment_completed' : args.status === 'failed' ? 'experiment_failed' : 'experiment_started',
      workshopSlug: args.workshopSlug,
      experimentId: args.experimentId,
      details: { attemptNumber, passed: args.result?.passed },
      createdAt: now,
    })

    return attemptId
  },
})

// Update an existing attempt
export const updateAttempt = mutation({
  args: {
    attemptId: v.id('attempts'),
    state: v.any(),
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
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId)
    if (!attempt) throw new Error('Attempt not found')

    await ctx.db.patch(args.attemptId, {
      state: { data: args.state },
      status: args.status,
      result: args.result,
      updatedAt: Date.now(),
    })

    // Update progress if completed or failed
    if (args.status !== 'in_progress') {
      await updateProgress(ctx, attempt.userId, attempt.workshopSlug, args.status)
    }

    return args.attemptId
  },
})

// Save a project
export const saveProject = mutation({
  args: {
    userId: v.id('users'),
    workshopSlug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    state: v.any(),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const projectId = await ctx.db.insert('savedProjects', {
      userId: args.userId,
      workshopSlug: args.workshopSlug,
      title: args.title,
      description: args.description,
      state: args.state,
      thumbnail: args.thumbnail,
      createdAt: now,
      updatedAt: now,
    })

    // Record activity
    await ctx.db.insert('activityHistory', {
      userId: args.userId,
      type: 'project_saved',
      workshopSlug: args.workshopSlug,
      projectId,
      details: { title: args.title },
      createdAt: now,
    })

    return projectId
  },
})

// Update a project
export const updateProject = mutation({
  args: {
    projectId: v.id('savedProjects'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    state: v.optional(v.any()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) throw new Error('Project not found')

    const updates: any = { updatedAt: Date.now() }
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.state !== undefined) updates.state = args.state
    if (args.thumbnail !== undefined) updates.thumbnail = args.thumbnail

    await ctx.db.patch(args.projectId, updates)
    return args.projectId
  },
})

// Helper to update progress
async function updateProgress(
  ctx: any,
  userId: string,
  workshopSlug: string,
  status: 'in_progress' | 'completed' | 'failed'
) {
  const existingProgress = await ctx.db
    .query('progress')
    .filter((q: any) => q.and(
      q.eq(q.field('userId'), userId),
      q.eq(q.field('workshopSlug'), workshopSlug)
    ))
    .first()

  const now = Date.now()

  if (existingProgress) {
    const updates: any = {
      totalAttempts: existingProgress.totalAttempts + 1,
      lastActivityAt: now,
    }

    if (status === 'completed') {
      updates.experimentsCompleted = existingProgress.experimentsCompleted + 1
    }
    if (status === 'in_progress' && !existingProgress.lastActivityAt) {
      updates.experimentsAttempted = existingProgress.experimentsAttempted + 1
    }

    await ctx.db.patch(existingProgress._id, updates)
  } else {
    await ctx.db.insert('progress', {
      userId,
      workshopSlug,
      experimentsCompleted: status === 'completed' ? 1 : 0,
      experimentsAttempted: 1,
      totalAttempts: 1,
      discoveries: [],
      streak: 1,
      lastActivityAt: now,
    })
  }
}

// Seed initial workshops
export const seedWorkshops = mutation({
  handler: async (ctx) => {
    const existingWorkshops = await ctx.db.query('workshops').collect()
    if (existingWorkshops.length > 0) return { success: false, reason: 'Workshops already seeded' }

    const now = Date.now()

    await ctx.db.insert('workshops', {
      slug: 'cad',
      name: 'CAD',
      description: 'Build and test structures. Create 3D models and engineering designs.',
      icon: 'cube',
      color: '#6366f1',
      order: 1,
    })

    await ctx.db.insert('workshops', {
      slug: 'physics',
      name: 'Physics',
      description: 'Discover how things move, interact, and work through hands-on experiments.',
      icon: 'atom',
      color: '#22c55e',
      order: 2,
    })

    await ctx.db.insert('workshops', {
      slug: 'chemistry',
      name: 'Chemistry',
      description: 'Mix. Observe. Understand. Safe virtual chemistry experiments.',
      icon: 'flask',
      color: '#ec4899',
      order: 3,
    })

    await ctx.db.insert('workshops', {
      slug: 'climate',
      name: 'Earth & Climate',
      description: 'Live weather, air quality, earthquakes, ocean waves, climate trends and NASA Earth observation.',
      icon: 'globe',
      color: '#0EA5E9',
      order: 4,
    })

    return { success: true }
  },
})
