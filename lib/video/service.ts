import type { VideoGenerationJob, VideoCase, VideoJobStatus, ScenarioVisualIdentity, ImmersiveScenario } from '@/types'

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
        // SIVS §4: 360° equirectangular, 2:1, mono
        aspect_ratio: '2:1',
        projection: 'equirectangular',
        resolution: '3840x1920',
        fps: 30,
        stereo: false,
        vr_compatible: true,
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

// ─── SIVS Negative Constraints (§38) ─────────────────────────────────────────

const SIVS_NEGATIVE_CONSTRAINTS = `
AVOID:
third-person camera, cinematic camera, drone camera, overhead camera,
rapid camera movement, camera shake, handheld cinematic shake,
whip pan, rapid zoom, jump cuts, rolling horizon,
fisheye distortion beyond normal 360 projection, teleportation,
floating objects, inconsistent characters, inconsistent clothing,
changing architecture, changing lighting, duplicate people,
deformed hands, unnatural body movement, text artifacts, logos,
watermarks, third-person cutaways immediately before decision points.
`.trim()

// ─── SIVS Structured Prompt Builder (§20) ─────────────────────────────────────

export interface SIVSPromptContext {
  scenarioTitle: string
  caseType: VideoCase
  visualIdentity?: ScenarioVisualIdentity
  sivsMasterSpec?: ImmersiveScenario['sivsMasterSpec']
}

/**
 * Builds a full SIVS-compliant 13-field video generation prompt.
 * Falls back to a sensible default for each field if no visual identity is provided.
 */
export function buildSIVSPrompt(ctx: SIVSPromptContext): string {
  const { caseType, visualIdentity, sivsMasterSpec } = ctx
  const isNeg = caseType === 'negative'

  const env = visualIdentity?.environment
  const cam = visualIdentity?.camera
  const char = visualIdentity?.character
  const audio = visualIdentity?.audio
  const lighting = visualIdentity?.lighting

  const environmentDesc = env
    ? `${env.type} with ${env.floor} floor, ${env.lighting} lighting. ${env.pedestrianPath} pedestrian paths. ${env.vehicleZone ?? 'Clearly marked forklift crossing zone.'} Metal industrial shelving creating blind corners.`
    : 'Large modern warehouse with industrial concrete floor, overhead LED lighting, yellow-marked pedestrian paths, and clearly marked forklift crossing zones. Metal industrial shelving creates blind intersections.'

  const cameraDesc = `First-person, monoscopic 360-degree equirectangular perspective. Camera height ${cam?.height ?? 1.65} metres (average adult eye level). Horizon level. Stable with minimal movement.`

  const characterDesc = char
    ? `${char.role} wearing ${char.ppe.join(', ')}.`
    : 'Warehouse worker wearing high-visibility yellow vest, white safety helmet, and safety boots.'

  const hazardDesc = sivsMasterSpec?.hazard
    ? `Primary hazard: ${sivsMasterSpec.hazard.type} approaching from ${sivsMasterSpec.hazard.location}.`
    : 'Primary hazard: electric forklift (3,000 kg, 8 km/h) approaching from the right at a blind shelf intersection.'

  const action = isNeg
    ? (sivsMasterSpec?.negativeBehavior?.description ?? 'The employee continues walking without slowing, fails to stop at the intersection, and enters the forklift travel path without checking.')
    : (sivsMasterSpec?.positiveBehavior?.description ?? 'The employee slows on approach, stops completely before the intersection corner, looks left and right, makes eye contact with the forklift operator, waits for the forklift to pass, then proceeds safely.')

  const initialState = isNeg
    ? 'The employee is walking at normal pace toward a blind warehouse intersection. The pedestrian floor marking is visible.'
    : 'The employee is walking slowly toward the same blind warehouse intersection. The pedestrian floor marking is visible ahead.'

  const envMovement = isNeg
    ? 'The forklift enters from the right side of the environment, moving toward the intersection. Its warning light is flashing.'
    : 'The forklift enters from the right, slows when the employee is seen, and passes after the employee waits.'

  const endingState = isNeg
    ? 'The forklift enters the pedestrian crossing zone at the same moment as the employee, creating a dangerous near-collision. The forklift brakes hard. Both parties are in close proximity.'
    : 'The forklift passes safely. The employee looks both ways again and proceeds through the intersection without incident.'

  const safetyBehavior = isNeg
    ? 'NEGATIVE CASE: Employee demonstrates unsafe behavior — failure to stop, failure to check, failure to yield.'
    : 'POSITIVE CASE: Employee demonstrates correct stop-and-check procedure per OSHA 1910.178 pedestrian safety requirements.'

  const audioDesc = audio
    ? `${audio.ambience}. Hazard sounds: ${audio.hazardSounds.join(', ')}.`
    : 'Industrial warehouse ambience. Subtle forklift electric motor hum approaching from the right. Forklift warning beeper. Natural footstep sounds. No spoken narration.'

  const lightingDesc = lighting
    ? `${lighting.type} lighting. ${lighting.timeOfDay}. Consistent and stable throughout.`
    : 'Consistent overhead LED industrial lighting. Stable throughout. No flickering. No changing shadows or exposure.'

  return `
ENVIRONMENT:
${environmentDesc}

CAMERA:
${cameraDesc}

PERSPECTIVE:
Monoscopic 360-degree equirectangular VR perspective. Aspect ratio 2:1. Minimum 3840x1920, preferred 5760x2880. 30 FPS.

CHARACTER:
${characterDesc}

INITIAL STATE:
${initialState}

HAZARD:
${hazardDesc}

ACTION:
${action}

ENVIRONMENTAL MOVEMENT:
${envMovement}

LIGHTING:
${lightingDesc}

AUDIO:
${audioDesc}

SAFETY BEHAVIOR:
${safetyBehavior}

ENDING STATE:
${endingState}

VR CONSTRAINTS:
Stable camera. No rapid rotation. No camera shake. No artificial zoom. No sudden viewpoint change. Level horizon. Realistic human eye height (1.65m). No cinematic cuts during or immediately before the decision moment. Slow, realistic, predictable motion throughout. Suitable for Meta Quest 2 WebXR playback.

${SIVS_NEGATIVE_CONSTRAINTS}
`.trim()
}

/**
 * Legacy simple prompt — kept for backward compatibility.
 * New code should use buildSIVSPrompt().
 */
export function buildVideoPrompt(scenarioTitle: string, caseType: VideoCase): string {
  return buildSIVSPrompt({ scenarioTitle, caseType })
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
