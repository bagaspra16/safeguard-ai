import { create } from 'zustand'
import type { SimulationPhase, SimulationEventType, PlayerState, ForkliftState, QuizAnswer, AIResponse } from '@/types'
import { FORKLIFT_QUIZ_QUESTIONS } from '@/lib/scenarios/data'

export interface SimulationEvent {
  id: string
  eventType: SimulationEventType
  objectId?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface AIMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  response?: AIResponse
  timestamp: Date
}

export interface SimulationStore {
  // ─ Session
  sessionId: string
  scenarioId: string

  // ─ Phase
  phase: SimulationPhase
  setPhase: (phase: SimulationPhase) => void

  // ─ Player
  playerState: PlayerState
  setPlayerState: (state: PlayerState) => void

  // ─ Forklift
  forkliftState: ForkliftState
  setForkliftState: (state: ForkliftState) => void

  // ─ Events
  events: SimulationEvent[]
  addEvent: (type: SimulationEventType, objectId?: string, metadata?: Record<string, unknown>) => void

  // ─ Hazard Detection
  detectedHazards: string[]
  detectHazard: (hazardId: string) => void

  // ─ Decision
  decisionMade: boolean
  decisionCorrect: boolean | null
  makeDecision: (correct: boolean) => void

  // ─ AI Trainer
  aiMessages: AIMessage[]
  addAIMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => void
  isAIThinking: boolean
  setAIThinking: (v: boolean) => void

  // ─ Quiz
  quizAnswers: QuizAnswer[]
  currentQuestionIndex: number
  submitQuizAnswer: (answer: QuizAnswer) => void
  nextQuestion: () => void

  // ─ Results
  score: number | null
  setScore: (score: number) => void

  // ─ VR
  vrMode: boolean
  vrAvailable: boolean
  setVrMode: (v: boolean) => void
  setVrAvailable: (v: boolean) => void

  // ─ Timer
  elapsedSeconds: number
  incrementTimer: () => void

  // ─ Reset
  reset: () => void
}

const initialState = {
  sessionId: `session_${Date.now()}`,
  scenarioId: 'forklift-blind-corner-001',
  phase: 'idle' as SimulationPhase,
  playerState: 'idle' as PlayerState,
  forkliftState: 'idle' as ForkliftState,
  events: [] as SimulationEvent[],
  detectedHazards: [] as string[],
  decisionMade: false,
  decisionCorrect: null,
  aiMessages: [] as AIMessage[],
  isAIThinking: false,
  quizAnswers: [] as QuizAnswer[],
  currentQuestionIndex: 0,
  score: null,
  vrMode: false,
  vrAvailable: false,
  elapsedSeconds: 0,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => {
    set({ phase })
    get().addEvent('scenario_started', undefined, { phase })
  },

  setPlayerState: (playerState) => set({ playerState }),
  setForkliftState: (forkliftState) => set({ forkliftState }),

  addEvent: (eventType, objectId, metadata) => {
    const event: SimulationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      objectId,
      timestamp: new Date(),
      metadata,
    }
    set((state) => ({ events: [...state.events, event] }))
  },

  detectHazard: (hazardId) => {
    const { detectedHazards } = get()
    if (!detectedHazards.includes(hazardId)) {
      set((state) => ({ detectedHazards: [...state.detectedHazards, hazardId] }))
      get().addEvent('hazard_detected', hazardId)
    }
  },

  makeDecision: (correct) => {
    set({ decisionMade: true, decisionCorrect: correct })
    get().addEvent(correct ? 'correct_action' : 'wrong_action', 'intersection-decision')
  },

  addAIMessage: (msg) => {
    const message: AIMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    }
    set((state) => ({ aiMessages: [...state.aiMessages, message] }))
  },

  setAIThinking: (isAIThinking) => set({ isAIThinking }),

  submitQuizAnswer: (answer) => {
    set((state) => ({ quizAnswers: [...state.quizAnswers, answer] }))
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, FORKLIFT_QUIZ_QUESTIONS.length - 1),
    }))
  },

  setScore: (score) => set({ score }),
  setVrMode: (vrMode) => set({ vrMode }),
  setVrAvailable: (vrAvailable) => set({ vrAvailable }),
  incrementTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  reset: () => {
    set({
      ...initialState,
      sessionId: `session_${Date.now()}`,
      vrAvailable: get().vrAvailable, // preserve VR detection
    })
  },
}))
