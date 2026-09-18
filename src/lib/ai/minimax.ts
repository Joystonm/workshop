// MiniMax integration via GMI Cloud
// API: https://console.gmicloud.ai/user-console/ie/model-hub/llm/3c25d31e-d652-4d0b-bb0f-24476766da32

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MiniMaxResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generateHint(
  context: {
    workshopSlug: string
    experimentTitle: string
    attemptHistory: string[]
    currentState: string
  },
  apiKey: string
): Promise<string> {
  const systemPrompt = `You are a helpful workshop companion for students learning through hands-on experimentation.
Your role is to guide students toward discovery without giving away the answer.
When a student asks for help or their experiment fails, provide Socratic hints that encourage thinking.
Never reveal the solution directly. Ask questions that lead to insight.`

  const userMessage = `The student is working on: "${context.experimentTitle}" in ${context.workshopSlug}.
Their recent attempts:
${context.attemptHistory.slice(-3).map((a, i) => `${i + 1}. ${a}`).join('\n')}

Current state: ${context.currentState}

Provide a helpful hint that guides the student toward discovery without giving away the answer.`

  return callMiniMax(systemPrompt, userMessage, apiKey)
}

export async function generateChallenge(
  params: {
    workshopSlug: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    conceptsExplored: string[]
    previousChallengeIds: string[]
  },
  apiKey: string
): Promise<{
  title: string
  description: string
  objectives: string[]
  constraints: string[]
  hints: string[]
}> {
  const systemPrompt = `You are an expert curriculum designer for a hands-on learning workshop.
Generate creative, engaging challenges that teach through experimentation.
Each challenge should have a clear objective, reasonable constraints, and hints for when students get stuck.
Make challenges specific enough to be testable but open enough to allow creative solutions.`

  const userMessage = `Generate a challenge for the ${params.workshopSlug} workshop at ${params.difficulty} difficulty.
Concepts already explored: ${params.conceptsExplored.join(', ')}
Previous challenge IDs: ${params.previousChallengeIds.join(', ')}

Respond with JSON: { title, description, objectives: string[], constraints: string[], hints: string[] }`

  const response = await callMiniMax(systemPrompt, userMessage, apiKey)

  try {
    return JSON.parse(response)
  } catch {
    return {
      title: 'Custom Challenge',
      description: 'Create your own experiment based on what you learned.',
      objectives: ['Complete your custom experiment'],
      constraints: [],
      hints: ['Think about what you want to test'],
    }
  }
}

export async function explainExperiment(
  params: {
    experimentType: string
    whatHappened: string
    simulationData: Record<string, any>
    studentAttempt: string
  },
  apiKey: string
): Promise<string> {
  const systemPrompt = `You are a science educator explaining experimental results.
Use the actual simulation data to explain what happened.
Connect the observations to underlying scientific principles.
Be encouraging and curious in tone.`

  const userMessage = `Explain what happened in this ${params.experimentType} experiment:
What happened: ${params.whatHappened}
Simulation data: ${JSON.stringify(params.simulationData, null, 2)}
Student's approach: ${params.studentAttempt}

Provide an educational explanation that helps them understand why their experiment behaved this way.`

  return callMiniMax(systemPrompt, userMessage, apiKey)
}

export async function adaptDifficulty(
  params: {
    workshopSlug: string
    completedChallenges: string[]
    failedChallenges: string[]
    attemptsPerChallenge: Record<string, number>
  },
  apiKey: string
): Promise<'beginner' | 'intermediate' | 'advanced'> {
  const systemPrompt = `You are a learning progression expert.
Based on a student's history, recommend the appropriate difficulty level for their next challenge.
Consider: completion rate, number of attempts, and which challenges were easy vs hard.`

  const userMessage = `Student history for ${params.workshopSlug}:
Completed: ${params.completedChallenges.join(', ')}
Failed: ${params.failedChallenges.join(', ')}
Attempts per challenge: ${JSON.stringify(params.attemptsPerChallenge)}

Recommend the next difficulty level: beginner, intermediate, or advanced.`

  const response = await callMiniMax(systemPrompt, userMessage, apiKey)

  if (response.toLowerCase().includes('advanced')) return 'advanced'
  if (response.toLowerCase().includes('intermediate')) return 'intermediate'
  return 'beginner'
}

async function callMiniMax(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string = 'MiniMax/Abab6'
): Promise<string> {
  const apiUrl = import.meta.env.VITE_MINIMAX_API_URL ||
    'https://console.gmicloud.ai/user-console/ie/model-hub/llm/3c25d31e-d652-4d0b-bb0f-24476766da32'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data: MiniMaxResponse = await response.json()
    return data.choices[0]?.message?.content || 'I need more information to help you.'
  } catch (error) {
    console.error('MiniMax API error:', error)
    return 'I encountered an issue. Let me know if you have specific questions about your experiment.'
  }
}
