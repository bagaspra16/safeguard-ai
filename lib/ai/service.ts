import type { AIMessage, AIResponse, Scenario } from '@/types'
import { getAfterVideoQuestion } from '@/lib/scenarios/data'

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

  return `You are a certified workplace safety training instructor for SafeGuard AI. You are currently conducting a high-fidelity interactive training session for the following scenario:

SCENARIO TITLE: ${scenario.title}
CATEGORY: ${scenario.category}
ENVIRONMENT: ${scenario.environment}
SEVERITY LEVEL: ${scenario.severity}
OVERVIEW: ${scenario.description}

ACTIVE HAZARDS:
${hazardList}

LEARNING OBJECTIVES:
- ${objectives}

CRITICAL NEGATIVE ACTIONS (What caused the incident): ${scenario.negativeCase.actions.join(', ')} - ${scenario.negativeCase.description}
COMPLIANT STANDARD PROCEDURE: ${scenario.positiveCase.actions.join(', ')} - ${scenario.positiveCase.description}

CURRENT DRILL PHASE: ${context.phase}

Your role:
- Guide the employee through safety training for this EXACT scenario (${scenario.title})
- Directly reference the scenario's hazards, environmental constraints, and OSHA/NFPA regulations
- If the scenario is an industrial fire, focus on RACE protocol, alarm pull, Class B extinguisher (CO2/dry chemical), fire doors, and low-crawl smoke evacuation
- If the scenario is construction fall, focus on OSHA 1926.502, 100% continuous dual-lanyard tie-off, scaffolding board pinning, and Stop Work Authority
- If the scenario is warehouse/forklift, focus on OSHA 1910.178, blind corner stop-and-check, and pedestrian-vehicle separation
- If the scenario is chemical, focus on SDS Class 8, Level B PPE, acid neutralizers, and upwind isolation
- If the scenario is electrical LOTO, focus on OSHA 1910.147, 6-step zero-energy isolation, multimeter verification, and padlock hasps
- Use a professional, authoritative, instructional enterprise EHS tone
- STRICT RULE: NEVER use emojis, emoticons, or casual slang. Maintain rigorous OSHA/EHS industrial safety standard language at all times.

Always respond with a valid JSON object matching this structure:
{
  "type": "training_feedback" | "hint" | "quiz_question" | "evaluation" | "summary" | "explanation" | "warning",
  "message": "Your response here",
  "severity": "low" | "medium" | "high",
  "correct": true | false | null,
  "nextAction": "optional next step for the UI",
  "explanation": "optional deeper explanation",
  "hint": "optional hint text",
  "options": ["option A", "option B"] (optional),
  "correctOption": 0 (optional)
}`
}

function getMockResponse(userMessage: string, context: ChatContext): AIResponse {
  const lower = userMessage.toLowerCase()
  const { scenario } = context
  const cat = scenario.category
  const isFire = scenario.id.includes('fire') || cat === 'fire_safety'
  const isFall = scenario.id.includes('fall') || cat === 'construction_safety'
  const isChemical = scenario.id.includes('chemical') || cat === 'chemical_safety'
  const isLOTO = scenario.id.includes('loto') || cat === 'electrical_safety'
  const isForklift = scenario.id.includes('forklift') || cat === 'warehouse_safety'

  // Fire-specific queries
  if (isFire) {
    if (lower.includes('extinguisher') || lower.includes('water') || lower.includes('class')) {
      return {
        type: 'explanation',
        message:
          'Industrial solvent and paint fires are Class B flammable liquid hazards. Never apply water on Class B fires as it causes violent steam explosions and spreads flaming liquid. Use CO₂ or ABC dry chemical extinguishers only.',
        severity: 'medium',
      }
    }
    if (lower.includes('alarm') || lower.includes('pull') || lower.includes('race')) {
      return {
        type: 'training_feedback',
        message:
          'Under the RACE protocol (Rescue, Alarm, Contain, Evacuate), immediately pulling the manual alarm station alerts facility personnel and emergency responders before any suppression attempt.',
        severity: 'low',
        correct: true,
      }
    }
    if (lower.includes('smoke') || lower.includes('crawl') || lower.includes('breath')) {
      return {
        type: 'explanation',
        message:
          'Toxic smoke and superheated gases rise to ceiling level. Maintaining a low-crawl position keeps your airway in the breathable zone closest to the floor where ambient oxygen is highest.',
        severity: 'low',
      }
    }
  }

  // Construction Fall-specific queries
  if (isFall) {
    if (lower.includes('harness') || lower.includes('lanyard') || lower.includes('tie')) {
      return {
        type: 'training_feedback',
        message:
          'OSHA 1926.502 mandates 100% continuous tie-off above 6 feet (1.8m). When moving along scaffolding, the dual-lanyard leapfrog technique ensures you are connected to a 5,000-lb rated anchor at all times.',
        severity: 'low',
        correct: true,
      }
    }
    if (lower.includes('plank') || lower.includes('board') || lower.includes('loose')) {
      return {
        type: 'warning',
        message:
          'Unpinned or cantilever scaffold planks are tipping hazards. Never step onto an unsecured plank. Immediately apply a Danger tag and notify the designated competent person.',
        severity: 'high',
      }
    }
    if (lower.includes('coworker') || lower.includes('stop') || lower.includes('authority')) {
      return {
        type: 'training_feedback',
        message:
          'Every employee possesses Stop Work Authority. When observing an unclipped coworker at height, issue an immediate verbal directive to step back and attach both snap hooks.',
        severity: 'low',
        correct: true,
      }
    }
  }

  // Chemical-specific queries
  if (isChemical) {
    if (lower.includes('ppe') || lower.includes('respirator') || lower.includes('acid')) {
      return {
        type: 'explanation',
        message:
          'Concentrated corrosive acid releases toxic vapors. Approach only from upwind positions and ensure Level B respiratory PPE is fully donned prior to containment perimeter setup.',
        severity: 'medium',
      }
    }
  }

  // Electrical-specific queries
  if (isLOTO) {
    if (lower.includes('meter') || lower.includes('voltage') || lower.includes('padlock')) {
      return {
        type: 'explanation',
        message:
          'OSHA 1910.147 requires physical padlocking with individual keys and three-point multimeter testing (Live-Dead-Live) to confirm a zero-energy state before contacting busbars.',
        severity: 'medium',
      }
    }
  }

  // Forklift queries
  if (isForklift) {
    if (lower.includes('forklift') || lower.includes('vehicle') || lower.includes('speed')) {
      return {
        type: 'training_feedback',
        message:
          'A loaded 3,000kg forklift traveling at 8 km/h requires up to 4 meters to come to a complete stop. Never assume the operator has visual contact around racking corners.',
        severity: 'low',
        correct: true,
      }
    }
    if (lower.includes('blind') || lower.includes('corner') || lower.includes('intersection')) {
      return {
        type: 'explanation',
        message:
          'Blind intersections created by storage shelving eliminate line-of-sight for both pedestrians and operators. OSHA 1910.178 requires stopping and checking both directions prior to crossing.',
        severity: 'low',
      }
    }
  }

  // Generic contextual responses based on active scenario objectives
  if (lower.includes('stop') || lower.includes('check') || lower.includes('correct') || lower.includes('safe') || lower.includes('help')) {
    return {
      type: 'training_feedback',
      message: `Confirmed. Standard operating procedure for ${scenario.title}: ${scenario.positiveCase.description}. Adhere to all outlined safety controls.`,
      severity: 'low',
      correct: true,
    }
  }

  if (lower.includes('wrong') || lower.includes('hazard') || lower.includes('danger') || lower.includes('risk')) {
    const primaryHazard = scenario.hazards[0]
    return {
      type: 'warning',
      message: `Critical hazard in this area: ${primaryHazard?.label ?? 'Active site hazard'}. ${primaryHazard?.description ?? 'Follow designated PPE and isolation protocols.'}`,
      severity: 'high',
      correct: false,
    }
  }

  // Default scenario-tailored instructor advice
  return {
    type: 'training_feedback',
    message: `In ${scenario.title}, ensure compliance with key learning objectives: ${scenario.learningObjectives[0] || scenario.description}`,
    severity: 'low',
  }
}

// ─── Main AI Service Function ─────────────────────────────────────────────────

export async function getAIResponse(userMessage: string, context: ChatContext): Promise<AIResponse> {
  const isMock = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY

  if (isMock) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500))
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

    if (!parsed.type || !parsed.message) {
      throw new Error('Invalid AI response structure')
    }

    return parsed
  } catch (error) {
    console.error('AI service error:', error)
    return {
      type: 'training_feedback',
      message: `Training checkpoint: Adhere to standard operating procedures for ${context.scenario.title}. Verify all required safety controls before proceeding.`,
      severity: 'low',
    }
  }
}

export async function getIntroMessage(context: ChatContext): Promise<AIResponse> {
  return {
    type: 'training_feedback',
    message: `Welcome to ${context.scenario.title} simulation training. Review the initial incident video carefully to identify procedural failures and root causes.`,
    severity: 'low',
    nextAction: 'watch_negative_video',
  }
}

export async function getAfterNegativeVideoMessage(context: ChatContext): Promise<AIResponse> {
  const q = getAfterVideoQuestion(context.scenario)
  return {
    type: 'quiz_question',
    message: q.question,
    options: q.options,
    correctOption: q.correctIndex,
    explanation: q.explanation,
  }
}

export async function getPerformanceSummary(context: ChatContext, score: number): Promise<AIResponse> {
  const passed = score >= (context.scenario.assessment.passingScore || 80)
  return {
    type: 'summary',
    message: passed
      ? `Assessment completed with passing score of ${score}%. Demonstrated compliance with core safety controls for ${context.scenario.title}.`
      : `Assessment recorded score of ${score}% (passing threshold: ${context.scenario.assessment.passingScore || 80}%). Review the positive demonstration and re-attempt module.`,
    severity: passed ? 'low' : 'high',
    nextAction: 'complete',
  }
}

export async function evaluateQuizAnswer(
  questionId: string,
  selectedIndex: number,
  correctIndex: number,
  context: ChatContext
): Promise<AIResponse> {
  const isCorrect = selectedIndex === correctIndex
  return {
    type: 'evaluation',
    message: isCorrect
      ? `Correct. Adherence to ${context.scenario.title} safety standards confirmed.`
      : `Incorrect. Please review the standard procedure for ${context.scenario.title}: ${context.scenario.positiveCase.description}`,
    severity: isCorrect ? 'low' : 'medium',
    correct: isCorrect,
  }
}
