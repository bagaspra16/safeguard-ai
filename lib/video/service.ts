import type { VideoGenerationJob, VideoCase, VideoJobStatus } from '@/types'

// ─── Video Service — Higgsfield + Mock Provider ───────────────────────────────

interface VideoGenerateRequest {
  scenarioId: string
  caseType: VideoCase
  prompt: string
}

interface HighgsfieldJobResponse {
  job_id: string
  status: string
}

// In-memory job store (replace with DB in production)
const jobStore = new Map<string, VideoGenerationJob>()

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Mock Provider ────────────────────────────────────────────────────────────

async function createMockJob(req: VideoGenerateRequest): Promise<VideoGenerationJob> {
  const job: VideoGenerationJob = {
    id: generateJobId(),
    scenarioId: req.scenarioId,
    caseType: req.caseType,
    status: 'processing',
    prompt: req.prompt,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  jobStore.set(job.id, job)

  // Simulate async completion after 3 seconds
  setTimeout(() => {
    const existingJob = jobStore.get(job.id)
    if (existingJob) {
      const videoPath = req.caseType === 'positive'
        ? '/demo/videos/forklift-positive.mp4'
        : '/demo/videos/forklift-negative.mp4'

      jobStore.set(job.id, {
        ...existingJob,
        status: 'completed',
        resultUrl: videoPath,
        updatedAt: new Date(),
      })
    }
  }, 3000)

  return job
}

// ─── Higgsfield Provider ──────────────────────────────────────────────────────

async function createHighgsfieldJob(req: VideoGenerateRequest): Promise<VideoGenerationJob> {
  const apiKey = process.env.HIGGSFIELD_API_KEY
  if (!apiKey) throw new Error('HIGGSFIELD_API_KEY not configured')

  const job: VideoGenerationJob = {
    id: generateJobId(),
    scenarioId: req.scenarioId,
    caseType: req.caseType,
    status: 'pending',
    prompt: req.prompt,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  jobStore.set(job.id, job)

  try {
    const response = await fetch('https://api.higgsfield.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: req.prompt,
        duration: 8,
        style: 'realistic',
        aspect_ratio: '16:9',
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`Higgsfield API error: ${response.status}`)
    }

    const data: HighgsfieldJobResponse = await response.json()

    const updated: VideoGenerationJob = {
      ...job,
      status: 'processing',
      externalJobId: data.job_id,
      updatedAt: new Date(),
    }
    jobStore.set(job.id, updated)
    return updated
  } catch (error) {
    console.error('Higgsfield job creation failed:', error)
    const failed: VideoGenerationJob = {
      ...job,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date(),
    }
    jobStore.set(job.id, failed)
    throw error
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildVideoPrompt(scenarioTitle: string, caseType: VideoCase): string {
  if (caseType === 'negative') {
    return `A warehouse worker approaches a blind corner intersection without stopping or checking for vehicles. A forklift rounds the corner unexpectedly. Near-collision. Safety incident demonstration for training purposes. Industrial warehouse environment, realistic lighting, 8 seconds.`
  }
  return `A warehouse worker approaches a blind corner intersection, stops completely, looks left and right, waits for a forklift to pass, then proceeds safely. Correct safety procedure demonstration. Industrial warehouse environment, realistic lighting, 8 seconds.`
}

export async function createVideoJob(req: VideoGenerateRequest): Promise<VideoGenerationJob> {
  const isMock = process.env.MOCK_VIDEO === 'true' || !process.env.HIGGSFIELD_API_KEY

  if (isMock) {
    return createMockJob(req)
  }

  return createHighgsfieldJob(req)
}

export async function pollVideoJob(jobId: string): Promise<VideoGenerationJob> {
  const job = jobStore.get(jobId)
  if (!job) throw new Error(`Job ${jobId} not found`)

  // If already done or failed, return immediately
  if (job.status === 'completed' || job.status === 'failed') {
    return job
  }

  // If using real Higgsfield, poll their API
  const isMock = process.env.MOCK_VIDEO === 'true' || !process.env.HIGGSFIELD_API_KEY
  if (!isMock && job.externalJobId) {
    try {
      const apiKey = process.env.HIGGSFIELD_API_KEY!
      const response = await fetch(`https://api.higgsfield.ai/v1/jobs/${job.externalJobId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed' && data.video_url) {
          const completed: VideoGenerationJob = {
            ...job,
            status: 'completed',
            resultUrl: data.video_url,
            updatedAt: new Date(),
          }
          jobStore.set(jobId, completed)
          return completed
        } else if (data.status === 'failed') {
          const failed: VideoGenerationJob = {
            ...job,
            status: 'failed',
            errorMessage: data.error ?? 'Generation failed',
            updatedAt: new Date(),
          }
          jobStore.set(jobId, failed)
          return failed
        }
      }
    } catch (error) {
      console.error('Higgsfield poll error:', error)
    }
  }

  return job
}

export function getVideoJob(jobId: string): VideoGenerationJob | undefined {
  return jobStore.get(jobId)
}

export function getVideoJobStatus(jobId: string): VideoJobStatus {
  const job = jobStore.get(jobId)
  return job?.status ?? 'pending'
}
