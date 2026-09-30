import { NextResponse } from 'next/server'
import { createVideoJob, pollVideoJob, buildVideoPrompt } from '@/lib/video/service'
import type { VideoCase } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { scenarioId, caseType, prompt, scenarioTitle } = body

    if (!scenarioId || !caseType) {
      return NextResponse.json({ error: 'scenarioId and caseType are required' }, { status: 400 })
    }

    const finalPrompt = prompt || buildVideoPrompt(scenarioTitle || 'Workplace Safety', caseType as VideoCase)

    const job = await createVideoJob({
      scenarioId,
      caseType: caseType as VideoCase,
      prompt: finalPrompt,
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('API /api/video/generate POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video generation failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId query param required' }, { status: 400 })
    }

    const job = await pollVideoJob(jobId)
    return NextResponse.json(job)
  } catch (error) {
    console.error('API /api/video/generate GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Job retrieval failed' },
      { status: 500 }
    )
  }
}
