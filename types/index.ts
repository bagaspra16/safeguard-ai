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
