import type { AIMessage, AIResponse, Scenario } from '@/types'

// ─── Mock AI Responses for Forklift Scenario ──────────────────────────────────

const MOCK_INTRO_RESPONSES: AIResponse[] = [
  {
    type: 'training_feedback',
    message:
      "Welcome to Forklift Blind Corner training. I'm your AI Safety Instructor. Before we run the simulation, watch the incident video carefully. Pay attention to what the worker does wrong — and why it could be fatal.",
    severity: 'low',
    nextAction: 'watch_negative_video',
  },
]

const MOCK_AFTER_NEGATIVE_VIDEO: AIResponse[] = [
  {
    type: 'quiz_question',
    message: "You just watched an unsafe scenario. What was the worker's critical mistake when approaching the intersection?",
    options: [
      'They were walking too slowly',
      'They did not stop or check before entering the intersection',
      'They were carrying too many items',
      'They made eye contact with the forklift operator',
    ],
    correctOption: 1,
    explanation:
      'The worker failed to stop and check at the blind intersection. This is the fundamental error that makes blind corner incidents fatal.',
  },
]

const MOCK_HAZARD_DETECTED: AIResponse = {
  type: 'training_feedback',
  message:
    'Correct — you identified the moving forklift. Now look at the intersection ahead. Why is this location particularly dangerous?',
  severity: 'low',
  correct: true,
  nextAction: 'identify_blind_corner',
  explanation:
    'The forklift is the active vehicle hazard, but the danger is amplified by the shelving unit that blocks visibility at the intersection.',
}

const MOCK_HAZARD_MISSED: AIResponse = {
  type: 'hint',
  message: "Look again. Something in this warehouse could enter your path unexpectedly. Pay attention to moving objects and obstructed sightlines.",
  severity: 'medium',
  correct: false,
  hint: 'Focus on the far aisle. What type of industrial vehicle do you see?',
}

const MOCK_CORRECT_DECISION: AIResponse = {
  type: 'training_feedback',
  message:
    "Excellent. You stopped, checked left and right, confirmed the forklift had passed, and proceeded safely. That is the correct stop-and-check procedure — every time, without exception.",
  severity: 'low',
  correct: true,
  nextAction: 'watch_positive_video',
}

const MOCK_INCORRECT_DECISION: AIResponse = {
  type: 'warning',
  message:
    "You entered the intersection without checking. In a real scenario, this decision could be fatal. The forklift weighs 3,000 kg and cannot stop instantly. Let's review why the check is non-negotiable.",
  severity: 'high',
  correct: false,
  nextAction: 'explain_mistake',
  explanation:
    'A 3,000kg forklift traveling at 8 km/h has a stopping distance of approximately 4 meters. By the time you enter its path, the operator has no time to react.',
}

const MOCK_QUIZ_FEEDBACK_CORRECT: AIResponse = {
  type: 'evaluation',
  message: 'Correct. The stop-and-check procedure is the most critical habit in forklift zones.',
  severity: 'low',
  correct: true,
}

const MOCK_QUIZ_FEEDBACK_INCORRECT: AIResponse = {
  type: 'evaluation',
  message:
    "That's not correct. Remember: in a warehouse with active forklifts, your safety depends entirely on consistent procedure — not assumptions.",
  severity: 'medium',
  correct: false,
}

const MOCK_PERFORMANCE_SUMMARY: AIResponse = {
  type: 'summary',
  message:
    "Training complete. You demonstrated strong hazard recognition skills. Your key area for improvement is decision speed at blind intersections — remember that hesitation in the real environment could mean the difference between a near-miss and an incident. Keep practicing the stop-and-check behavior until it becomes automatic.",
  severity: 'low',
  nextAction: 'complete',
}

const MOCK_GENERAL_RESPONSES: AIResponse[] = [
  {
    type: 'explanation',
    message:
      'Pedestrian-forklift separation means using designated walkways that are physically separated from forklift routes. Floor markings, barriers, and signage are used to enforce this separation.',
    severity: 'low',
  },
  {
    type: 'training_feedback',
    message:
      "Good question. OSHA standard 1910.178(n)(4) requires that operators slow down and sound the horn at cross aisles and other locations where vision is obstructed. Pedestrians should also treat these zones as stop-and-check points.",
    severity: 'low',
  },
  {
    type: 'hint',
    message:
      'Think about what happens at this intersection from both perspectives: the worker walking and the forklift operator driving. What does each party NOT know?',
    severity: 'low',
  },
]

// ─── AI Service ───────────────────────────────────────────────────────────────

export interface ChatContext {
  scenario: Scenario
  phase: string
  recentEvents?: string[]
  conversationHistory?: AIMessage[]
}

async function callGroqAPI(messages: AIMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not configured')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content ?? '{}'
}

function buildSystemPrompt(context: ChatContext): string {
  const { scenario } = context
  const hazardList = scenario.hazards.map((h) => `- ${h.label}: ${h.description}`).join('\n')
  const objectives = scenario.learningObjectives.join('\n- ')

  return `You are a workplace safety training instructor for SafeGuard AI. You are currently running a training session for the following scenario:

SCENARIO: ${scenario.title}
ENVIRONMENT: ${scenario.environment}
SEVERITY: ${scenario.severity}

HAZARDS:
${hazardList}

LEARNING OBJECTIVES:
- ${objectives}

NEGATIVE BEHAVIOR (what NOT to do): ${scenario.negativeCase.actions.join(', ')}
POSITIVE BEHAVIOR (correct procedure): ${scenario.positiveCase.actions.join(', ')}

CURRENT TRAINING PHASE: ${context.phase}

Your role:
- Guide the employee through safety training for this specific scenario
- Reference actual scenario hazards and context in your responses
- Ask probing questions that help employees discover hazards themselves
- Provide clear, factual feedback based on the scenario
- Do NOT invent regulatory claims beyond what is provided
- Do NOT go off-topic — stay focused on this scenario
- Use a calm, professional, instructional enterprise EHS tone
- STRICT RULE: NEVER use emojis, emoticons, or conversational filler slang. Maintain rigorous OSHA/EHS industrial safety standard language at all times.

Always respond with a JSON object matching this structure:
{
  "type": "training_feedback" | "hint" | "quiz_question" | "evaluation" | "summary" | "explanation" | "warning",
  "message": "Your response here",
  "severity": "low" | "medium" | "high",
  "correct": true | false | null,
  "nextAction": "optional next step for the UI",
  "explanation": "optional deeper explanation",
  "hint": "optional hint text",
  "options": ["option A", "option B", ...] if type is quiz_question,
  "correctOption": 0 (index) if type is quiz_question
}`
}

function getMockResponse(userMessage: string, context: ChatContext): AIResponse {
  const lower = userMessage.toLowerCase()

  if (lower.includes('forklift') && (lower.includes('hazard') || lower.includes('danger') || lower.includes('risk'))) {
    return MOCK_HAZARD_DETECTED
  }
  if (lower.includes('blind') || lower.includes('corner') || lower.includes('intersection')) {
    return {
      type: 'explanation',
      message:
        'The blind intersection is where the shelving unit blocks the line of sight. Neither you nor the forklift operator can see around it until you are already in the danger zone — which is why you must stop and check every time.',
      severity: 'medium',
      nextAction: 'identify_blind_corner',
    }
  }
  if (lower.includes('stop') || lower.includes('check') || lower.includes('correct') || lower.includes('safe')) {
    return MOCK_CORRECT_DECISION
  }
  if (lower.includes('wrong') || lower.includes('mistake') || lower.includes('error') || lower.includes('fail')) {
    return MOCK_INCORRECT_DECISION
  }

  // Return a random general response
  return MOCK_GENERAL_RESPONSES[Math.floor(Math.random() * MOCK_GENERAL_RESPONSES.length)]
}

// ─── Main AI Service Function ─────────────────────────────────────────────────

export async function getAIResponse(userMessage: string, context: ChatContext): Promise<AIResponse> {
  const isMock = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY

  if (isMock) {
    // Simulate a small delay for realism
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))
    return getMockResponse(userMessage, context)
  }

  try {
    const systemPrompt = buildSystemPrompt(context)
    const messages: AIMessage[] = [
      ...(context.conversationHistory ?? []),
      { role: 'user', content: userMessage },
    ]

    const raw = await callGroqAPI(messages, systemPrompt)
    const parsed = JSON.parse(raw) as AIResponse

    // Validate required fields
    if (!parsed.type || !parsed.message) {
      throw new Error('Invalid AI response structure')
    }

    return parsed
  } catch (error) {
    console.error('AI service error:', error)
    // Graceful fallback
    return {
      type: 'training_feedback',
      message:
        'I encountered a technical issue, but your training continues. Please refer to the scenario materials on screen. Focus on the stop-and-check procedure at all blind intersections.',
      severity: 'low',
    }
  }
}

export async function getIntroMessage(context: ChatContext): Promise<AIResponse> {
  return MOCK_INTRO_RESPONSES[0]
}

export async function getAfterNegativeVideoMessage(context: ChatContext): Promise<AIResponse> {
  return MOCK_AFTER_NEGATIVE_VIDEO[0]
}

export async function getPerformanceSummary(_context: ChatContext, _score: number): Promise<AIResponse> {
  return MOCK_PERFORMANCE_SUMMARY
}

export async function evaluateQuizAnswer(
  questionId: string,
  selectedIndex: number,
  correctIndex: number,
  _context: ChatContext
): Promise<AIResponse> {
  if (selectedIndex === correctIndex) {
    return MOCK_QUIZ_FEEDBACK_CORRECT
  }
  return MOCK_QUIZ_FEEDBACK_INCORRECT
}
