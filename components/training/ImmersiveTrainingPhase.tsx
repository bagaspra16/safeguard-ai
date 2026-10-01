'use client'

import { useState, useRef, useEffect } from 'react'
import type { ImmersiveScenario, TimelineState } from '@/types'
import { ImmersiveVideoPlayer } from './ImmersiveVideoPlayer'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  Sparkles,
  Bot,
  Send,
  ArrowRight,
  Shield,
  CheckCircle2,
  HelpCircle,
  Video,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

interface Props {
  scenario: ImmersiveScenario
  caseType: 'negative' | 'positive'
  onComplete: (cueResults: TimelineState['cueResults']) => void
}

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: string
}

export function ImmersiveTrainingPhase({ scenario, caseType, onComplete }: Props) {
  const addEvent = useSimulationStore((s) => s.addEvent)
  const [cueResults, setCueResults] = useState<TimelineState['cueResults']>({})
  const [showWarningModal, setShowWarningModal] = useState(false)

  // Incident & OSHA standard mapping
  const isFire =
    scenario.id === 'industrial-fire-005' || scenario.category === 'fire_safety'
  const isFall =
    scenario.id === 'construction-fall-006' ||
    scenario.id === 'fall-protection-004' ||
    scenario.category === 'construction_safety'

  const oshaStandard = isFire
    ? 'OSHA 29 CFR 1910.157'
    : isFall
    ? 'OSHA 29 CFR 1926.501'
    : 'OSHA 29 CFR 1910.178'

  const initialGreeting = isFire
    ? "Welcome to the correct procedure review for Industrial Fire Safety. Watch the video on the left for the certified RACE protocol and Class B fire suppression technique. Ask me anything regarding extinguisher ratings, evacuation, or NFPA rules."
    : isFall
    ? "Welcome to the correct procedure review for Working at Heights. Review the certified 100% tie-off protocol and dual lanyard leapfrogging in the demonstration. Feel free to ask about OSHA anchor requirements, harness fit, or fall clearance."
    : "Welcome to the correct procedure review for Forklift Blind Corner Navigation. Observe the mandatory 3-second stop, horn sounding, and pedestrian eye contact procedure. Ask me any questions about OSHA 1910.178 compliance!"

  // Sentinel AI Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const track =
    caseType === 'negative'
      ? scenario.immersiveTracks?.negative
      : scenario.immersiveTracks?.positive

  const fallbackTrack = {
    url: caseType === 'negative' ? scenario.video.negative : (isFall ? '/videos/fall-positive.mov' : scenario.video.positive),
    is360: false,
    label: caseType === 'negative' ? 'Incident Video' : 'Safe Procedure Video',
    caseType,
    cues: [],
  }

  const activeTrack =
    isFall && caseType === 'positive'
      ? {
          url: '/videos/fall-positive.mov',
          is360: false,
          label: '100% Continuous Tie-Off Safe Procedure',
          caseType: 'positive' as const,
          cues: [],
        }
      : (track ?? fallbackTrack)

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleVideoComplete = (results: TimelineState['cueResults']) => {
    setCueResults(results)
    const correctCount = Object.values(results).filter((r) => r.correct).length
    const totalCues = activeTrack.cues.length
    addEvent('video_completed', undefined, { caseType, correctCues: correctCount, totalCues })
    setShowWarningModal(true)
  }

  const handleConfirmProceedToQuiz = () => {
    setShowWarningModal(false)
    onComplete(cueResults)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isTyping) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: userTime,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          scenarioId: scenario.id,
          phase: 'positive_video',
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) throw new Error('Network error')
      const data = await response.json()

      const assistantReply =
        data.message || data.explanation || 'Always maintain 100% compliance with OSHA safety protocols.'

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, agentMsg])
    } catch {
      let fallbackText = ''
      const lower = text.toLowerCase()
      if (isFire) {
        if (lower.includes('water') || lower.includes('class b') || lower.includes('solvent')) {
          fallbackText =
            'Water must never be applied to Class B flammable liquid fires. It causes explosive steam expansion and spreads burning chemicals. Always use Class B CO2 or Dry Chemical extinguishers.'
        } else if (lower.includes('race')) {
          fallbackText =
            'The RACE protocol stands for: Rescue anyone in immediate danger, Alarm / alert 911 & sound the evacuation horn, Contain smoke/fire by closing doors, Evacuate or Extinguish if trained.'
        } else {
          fallbackText =
            'Under OSHA 1910.157 and NFPA guidelines, ensure your egress path is behind you at all times before discharging an extinguisher using the PASS method.'
        }
      } else if (isFall) {
        if (lower.includes('lanyard') || lower.includes('tie') || lower.includes('leapfrog')) {
          fallbackText =
            'The dual-lanyard leapfrog technique requires keeping at least one shock-absorbing lanyard connected to an approved 5,000-lb anchor at all times while transitioning.'
        } else {
          fallbackText =
            'OSHA 1926.501 requires mandatory fall arrest systems for all construction activities conducted at or above 6 feet from lower levels.'
        }
      } else {
        if (lower.includes('horn') || lower.includes('pause') || lower.includes('stop')) {
          fallbackText =
            'OSHA 1910.178(n)(4) mandates coming to a full stop before blind corners, sounding the horn with a 3-second pause, and verifying complete visual clearance.'
        } else {
          fallbackText =
            'Pedestrians and forklift operators share safety responsibility. Maintain at least 3 feet of lateral clearance and make direct eye contact before crossing.'
        }
      }

      const fallbackMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // Quick prompt questions
  const quickQuestions = isFire
    ? [
        'What is the first step in the RACE protocol?',
        'How do I select the right fire extinguisher?',
        'When should I evacuate vs extinguish?',
      ]
    : isFall
    ? [
        'How does dual lanyard leapfrogging work?',
        'What is the maximum allowed free fall distance?',
        'When is Stop Work Authority invoked?',
      ]
    : [
        'Why is the 3-second horn pause mandatory?',
        'What does OSHA 1910.178 state about blind corners?',
        'Who has right-of-way at cross aisles?',
      ]

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        color: '#0f172a',
        overflow: 'hidden',
      }}
    >
      {/* ── Sub-header with Scenario Context & Quiz Action ── */}
      <header
        style={{
          flexShrink: 0,
          height: 48,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Procedure Drill
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            {scenario.title}
          </span>
          <span style={{ fontSize: 12, color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            {oshaStandard}
          </span>
        </div>

        {/* Action Button to Proceed to Final Quiz */}
        <button
          id="btn-skip-to-quiz-top"
          onClick={() => setShowWarningModal(true)}
          style={{
            padding: '7px 16px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff',
            border: 'none',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 10px rgba(249, 115, 22, 0.25)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>Ready for Final Quiz</span>
          <ArrowRight size={13} />
        </button>
      </header>

      {/* ── Main Split View (Expansive Video on Left + Sentinel AI Chatbot on Right) ── */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 370px',
          overflow: 'hidden',
        }}
      >
        {/* ── Left Column: Maximized Cinema Video View (Clean, Minimalist, No Info Clutter) ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#f1f5f9',
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              background: '#000000',
            }}
          >
            <ImmersiveVideoPlayer
              track={activeTrack}
              onComplete={handleVideoComplete}
            />
          </div>
        </div>

        {/* ── Right Column: Sentinel AI Safety Agent Chatbot (Light Mode, Consistent Concept) ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Chatbot Header */}
          <div
            style={{
              padding: '14px 18px',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
                }}
              >
                <Bot size={17} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Sentinel AI
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '1px 6px',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
                    Active
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Ask questions to understand the concept
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'assistant',
                    content: initialGreeting,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }}
              title="Reset Chat"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Chat Message Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#f8fafc',
            }}
          >
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant'
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 3,
                      fontSize: 10,
                      color: '#94a3b8',
                      padding: '0 4px',
                    }}
                  >
                    {isAssistant ? (
                      <span style={{ fontWeight: 700, color: '#ea580c' }}>Sentinel AI</span>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#64748b' }}>You</span>
                    )}
                    <span>· {msg.timestamp}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '92%',
                      padding: '10px 14px',
                      borderRadius: isAssistant ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      background: isAssistant ? '#ffffff' : '#0f172a',
                      border: isAssistant ? '1px solid #e2e8f0' : 'none',
                      color: isAssistant ? '#1e293b' : '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  width: 'fit-content',
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>Analyzing safety protocol...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts */}
          <div
            style={{
              padding: '8px 16px 4px',
              background: '#ffffff',
              borderTop: '1px solid #eef2f6',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                maxHeight: 64,
                overflowY: 'auto',
              }}
            >
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isTyping}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#475569'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            style={{
              padding: '10px 16px 14px',
              background: '#ffffff',
              borderTop: '1px solid #eef2f6',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              id="input-correct-video-chat"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sentinel AI about this procedure..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              id="btn-send-correct-video-chat"
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: inputMessage.trim() && !isTyping ? '#f97316' : '#f1f5f9',
                color: inputMessage.trim() && !isTyping ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </main>

      {/* ── Warning / Confirmation Modal for Quiz ── */}
      {showWarningModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              padding: '28px 24px',
              textAlign: 'center',
              color: '#0f172a',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '2px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
                margin: '0 auto 14px',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
              Proceed to Final Exam?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 22px' }}>
              You are about to enter the final Knowledge Assessment. A score of <strong>80%+</strong> is required to earn your official certificate.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowWarningModal(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Reviewing
              </button>
              <button
                id="btn-confirm-proceed-quiz"
                onClick={handleConfirmProceedToQuiz}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 999,
                  background: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                }}
              >
                Start Final Exam →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
