import { NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/ai/service'
import { getScenarioById, FORKLIFT_BLIND_CORNER_SCENARIO } from '@/lib/scenarios/data'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, scenarioId, phase, recentEvents, conversationHistory } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const scenario = (scenarioId ? getScenarioById(scenarioId) : null) || FORKLIFT_BLIND_CORNER_SCENARIO

    const response = await getAIResponse(message, {
      scenario,
      phase: phase || 'simulation_active',
      recentEvents,
      conversationHistory,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('API /api/ai/chat error:', error)
    return NextResponse.json(
      {
        type: 'training_feedback',
        message: 'Always remember to stop and look both directions at all blind corner intersections in industrial zones.',
        severity: 'low',
      },
      { status: 200 }
    )
  }
}
