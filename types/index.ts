// ─── Core Scenario Types ──────────────────────────────────────────────────────

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'
export type EnvironmentType = 'warehouse' | 'construction' | 'chemical' | 'electrical' | 'laboratory' | 'healthcare' | 'factory'
export type ScenarioStatus = 'draft' | 'published' | 'archived'

export interface Hazard {
  id: string
  type: 'vehicle' | 'visibility' | 'chemical' | 'electrical' | 'fall' | 'fire' | 'ergonomic'
  label: string
  description: string
  severity: SeverityLevel
  position?: { x: number; y: number; z: number }
}

export interface ScenarioBehavior {
  id: string
  label: string
  description: string
  actions: string[]
}

export interface AssessmentCriteria {
  requiredActions: string[]
  passingScore: number
  timeLimit?: number
}

export interface VideoConfig {
  positive: string | null
  negative: string | null
  positiveJobId?: string
  negativeJobId?: string
}

export interface SimulationConfig {
  environment: EnvironmentType
  assetSet: string
  playerStart: { x: number; y: number; z: number }
  hazardPositions: Record<string, { x: number; y: number; z: number }>
  interactionZones: InteractionZone[]
}

export interface InteractionZone {
  id: string
  type: 'hazard_detect' | 'decision_point' | 'information' | 'goal'
  position: { x: number; y: number; z: number }
  radius: number
  label: string
  triggersEvent: SimulationEventType
}

export interface Scenario {
  id: string
  title: string
  description: string
  category: string
  severity: SeverityLevel
  environment: EnvironmentType
  estimatedDuration: number // minutes
  status: ScenarioStatus
  hazards: Hazard[]
  learningObjectives: string[]
  negativeCase: ScenarioBehavior
  positiveCase: ScenarioBehavior
  assessment: AssessmentCriteria
  video: VideoConfig
  simulation: SimulationConfig
  createdAt: Date
  updatedAt: Date
}

// ─── Simulation State Machine ─────────────────────────────────────────────────

export type SimulationPhase =
  | 'idle'
  | 'intro'
  | 'negative_video'
  | 'ai_question'
  | 'simulation_active'
  | 'hazard_detection'
  | 'decision_point'
  | 'outcome_correct'
  | 'outcome_incorrect'
  | 'positive_video'
  | 'ai_explanation'
  | 'quiz'
  | 'results'
  | 'completed'

export type SimulationEventType =
  | 'scenario_started'
  | 'video_started'
  | 'video_completed'
  | 'hazard_detected'
  | 'hazard_missed'
  | 'object_interacted'
  | 'player_stopped'
  | 'player_moved'
  | 'wrong_action'
  | 'correct_action'
  | 'assessment_started'
  | 'assessment_completed'
  | 'vr_entered'
  | 'vr_exited'
  | 'scenario_completed'
  | 'quiz_started'
  | 'quiz_answer_submitted'
  | 'decision_made'

export interface SimulationEvent {
  id: string
  sessionId: string
  scenarioId: string
  eventType: SimulationEventType
  objectId?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export type PlayerState = 'idle' | 'walking' | 'stopped' | 'looking' | 'correct_response' | 'incorrect_response'
export type ForkliftState = 'idle' | 'moving' | 'approaching' | 'danger' | 'stopped'

// ─── Training Session ─────────────────────────────────────────────────────────

export type SessionStatus = 'started' | 'in_progress' | 'completed' | 'failed' | 'abandoned'

export interface TrainingSession {
  id: string
  userId: string
  scenarioId: string
  assignmentId?: string
  status: SessionStatus
  startedAt: Date
  completedAt?: Date
  score?: number
  reactionTime?: number
  hazardsDetected: string[]
  decisionsCorrect: number
  decisionsTotal: number
  quizScore?: number
  vrUsed: boolean
  events: SimulationEvent[]
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export type AIMessageRole = 'system' | 'assistant' | 'user'
export type AIFeedbackType = 'training_feedback' | 'hint' | 'quiz_question' | 'evaluation' | 'summary' | 'explanation' | 'encouragement' | 'warning'

export interface AIMessage {
  role: AIMessageRole
  content: string
}

export interface AIResponse {
  type: AIFeedbackType
  message: string
  severity?: SeverityLevel
  correct?: boolean
  nextAction?: string
  explanation?: string
  hint?: string
  score?: number
  options?: string[]
  correctOption?: number
}

// ─── Quiz Types ───────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  hazardId?: string
}

export interface QuizAnswer {
  questionId: string
  selectedIndex: number
  correct: boolean
  timeMs: number
}

export interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: QuizAnswer[]
  feedback: string
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface PerformanceMetric {
  label: string
  value: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  color?: string
}

export interface ScenarioAnalytics {
  scenarioId: string
  totalSessions: number
  completionRate: number
  averageScore: number
  averageReactionTime: number
  commonMistakes: { action: string; count: number; percentage: number }[]
  hazardDetectionRate: number
  quizAccuracy: number
  vrUsageRate: number
  retryRate: number
}

export interface EmployeeAnalytics {
  employeeId: string
  name: string
  completedTrainings: number
  averageScore: number
  lastActive: Date
  riskAreas: string[]
}

// ─── User / Auth Types ────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee' | 'instructor'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  avatar?: string
  createdAt: Date
}

export interface Organization {
  id: string
  name: string
  industry: string
  employeeCount: number
  logoUrl?: string
}

// ─── Video Job Types ──────────────────────────────────────────────────────────

export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type VideoCase = 'positive' | 'negative'

// ─── Immersive Video / Timeline Engine Types (SIVS v1.0) ─────────────────────

// ─ Cue (fired during video playback at a timestamp) ────────────────────────────

/** A timed cue that fires during immersive video playback */
export interface TimelineCue {
  id: string
  /** Video timestamp (seconds) to trigger this cue */
  atSeconds: number
  type: 'question' | 'observation' | 'warning' | 'highlight'
  /** Learning stage per SIVS §41: recognize | decide | reflect */
  stage?: 'recognize' | 'decide' | 'reflect'
  /** Question prompt displayed to the trainee */
  prompt: string
  options?: string[]
  correctOptionIndex?: number
  /** Shown after the trainee answers */
  explanation?: string
  /** How long to pause the video while cue is active (0 = no pause) */
  pauseDurationMs?: number
  /** Safety color coding */
  severity?: SeverityLevel
  /**
   * Spatial direction for VR gaze-based detection (SIVS §13).
   * yaw = horizontal angle from forward (0°) in degrees.
   * pitch = vertical angle from horizon.
   */
  spatialDirection?: { yaw: number; pitch: number; toleranceDeg?: number }
}

// ─ SIVS Video Metadata (§33) ──────────────────────────────────────────────────

export type VideoProjection = 'equirectangular' | 'flat'
export type VideoStereoMode = 'mono' | 'stereo_tb' | 'stereo_lr'

export interface SIVSVideoMetadata {
  /** Equirectangular for 360°; flat for standard video */
  projection: VideoProjection
  /** Stereo mode — MVP uses mono */
  stereo: VideoStereoMode
  /** Native resolution string e.g. '5760x2880' */
  resolution: string
  /** Frames per second */
  fps: number
  /** Duration in seconds */
  duration: number
  /** First-person camera height in metres */
  cameraHeight: number
  /** Camera forward direction at t=0 */
  initialOrientation?: { yaw: number; pitch: number; roll: number }
  /** True when compatible with WebXR / Quest */
  webXRCompatible: boolean
  /** Audio format */
  audio: 'stereo' | 'ambisonic' | 'none'
}

// ─ Spatial Interaction Zone (§13) ────────────────────────────────────────────

export interface SpatialInteractionZone {
  id: string
  type: 'hazard' | 'safe' | 'information' | 'goal'
  /** Horizontal angle from forward direction (degrees) */
  yaw: number
  /** Vertical angle from horizon (degrees) */
  pitch: number
  /** Visual arc the zone covers (degrees) */
  angleDeg: number
  label: string
}

// ─ SIVS Video Track (§17, §33) ─────────────────────────────────────────────

/** Video configuration with embedded timeline cues */
export interface ImmersiveVideoTrack {
  url: string | null
  /** True = render inside Three.js equirectangular sphere (SIVS §35) */
  is360: boolean
  cues: TimelineCue[]
  /** Thumbnail shown during loading */
  thumbnailUrl?: string
  /** Human-readable label */
  label: string
  /** 'negative' = incident | 'positive' = correct procedure */
  caseType: VideoCase
  /** SIVS production metadata */
  sivsMetadata?: SIVSVideoMetadata
  /** Optional spatial zones for gaze interaction */
  spatialZones?: SpatialInteractionZone[]
}

// ─ Scenario Visual Identity (§27–30, §45) ──────────────────────────────────

export interface ScenarioCharacter {
  role: string
  ppe: string[]
  gender?: 'male' | 'female' | 'neutral'
  approximateAge?: string
}

export interface ScenarioVisualIdentity {
  environment: {
    type: string
    floor: string
    lighting: string
    structures: string[]
    pedestrianPath: string
    vehicleZone?: string
  }
  character: ScenarioCharacter
  camera: {
    height: number
    perspective: 'first_person'
    projection: VideoProjection
    motion: string[]
  }
  lighting: {
    type: string
    timeOfDay: string
    consistent: true
  }
  colorProfile?: string
  audio: {
    ambience: string
    hazardSounds: string[]
  }
}

// ─ SIVS Timeline (§17–18) ─────────────────────────────────────────────────────────

export type SIVSEventType = 'observation' | 'decision' | 'incident' | 'feedback' | 'resume'

export interface SIVSTimelineEvent {
  time: number
  type: SIVSEventType
  pauseVideo?: boolean
  cueId?: string
}

export interface SIVSTimeline {
  videoId: string
  duration: number
  events: SIVSTimelineEvent[]
}

// ─ ImmersiveScenario (§45) ────────────────────────────────────────────────────────

/** Extends Scenario with SIVS-compliant immersive video tracks + visual identity */
export interface ImmersiveScenario extends Scenario {
  immersiveTracks?: {
    negative: ImmersiveVideoTrack
    positive: ImmersiveVideoTrack
  }
  visualIdentity?: ScenarioVisualIdentity
  sivsMasterSpec?: {
    scenarioId: string
    negativeBehavior: { action: string; description: string }
    positiveBehavior: { action: string; description: string }
    hazard: { type: string; location: string; importance: 'primary' | 'secondary' }
  }
}

// ─ SIVS Video Generation Request (§20, £44) ───────────────────────────────────

export interface SIVSVideoGenerationRequest {
  scenarioId: string
  caseType: VideoCase
  visualIdentity: ScenarioVisualIdentity
  sivsMasterSpec: ImmersiveScenario['sivsMasterSpec']
  targetMetadata: Pick<SIVSVideoMetadata, 'resolution' | 'fps' | 'projection' | 'stereo'>
}

// ─ Local Timeline Engine state ───────────────────────────────────────────────────

export type TimelinePhase =
  | 'idle'
  | 'playing'
  | 'cue_active'
  | 'paused'
  | 'completed'

export interface TimelineState {
  phase: TimelinePhase
  currentTime: number
  activeCue: TimelineCue | null
  answeredCueIds: string[]
  cueResults: Record<string, { selectedIndex: number; correct: boolean }>
}

export interface VideoGenerationJob {
  id: string
  scenarioId: string
  caseType: VideoCase
  status: VideoJobStatus
  prompt: string
  resultUrl?: string
  externalJobId?: string
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}
