import { NextResponse } from 'next/server'
import { ALL_SCENARIOS, getScenarioById } from '@/lib/scenarios/data'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const scenario = getScenarioById(id)
      if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
      }
      return NextResponse.json(scenario)
    }

    return NextResponse.json(ALL_SCENARIOS)
  } catch (error) {
    console.error('API /api/scenarios GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
  }
}
