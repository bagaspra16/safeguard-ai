'use client'

import { useState } from 'react'
import type { ImmersiveScenario, TimelineState } from '@/types'
import { ImmersiveVideoPlayer } from './ImmersiveVideoPlayer'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  BarChart2,
  Zap,
  ShieldAlert,
  ArrowRight,
  Lock,
  Play,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react'

interface Props {
  scenario: ImmersiveScenario
  caseType: 'negative' | 'positive'
  onComplete: (cueResults: TimelineState['cueResults']) => void
}

export function ImmersiveTrainingPhase({ scenario, caseType, onComplete }: Props) {
  const addEvent = useSimulationStore((s) => s.addEvent)
  const [cueResults, setCueResults] = useState<TimelineState['cueResults']>({})
  const [showWarningModal, setShowWarningModal] = useState(false)

  const track =
    caseType === 'negative'
      ? scenario.immersiveTracks?.negative
      : scenario.immersiveTracks?.positive

  // Fallback to legacy VideoPhase data if no immersive tracks
  const fallbackTrack = {
    url: caseType === 'negative' ? scenario.video.negative : scenario.video.positive,
    is360: false,
    label: caseType === 'negative' ? 'Incident Video' : 'Safe Procedure Video',
    caseType,
    cues: [],
  }

  const activeTrack = track ?? fallbackTrack
  const isNegative = caseType === 'negative'
  const accentColor = isNegative ? '#ef4444' : '#10b981'

  const handleVideoComplete = (results: TimelineState['cueResults']) => {
    setCueResults(results)
    const correctCount = Object.values(results).filter((r) => r.correct).length
    const totalCues = activeTrack.cues.length
    addEvent('video_completed', undefined, { caseType, correctCues: correctCount, totalCues })
    // Open warning modal so user can confirm they're ready for the final exam
    setShowWarningModal(true)
  }

  const handleConfirmProceedToQuiz = () => {
    setShowWarningModal(false)
    onComplete(cueResults)
  }

  // Compute a summary of how the trainee did on in-video decisions
  const answeredCues = Object.entries(cueResults)
  const correctCues = answeredCues.filter(([, r]) => r.correct)

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px 20px 60px',
        color: '#f8fafc',
      }}
    >
      {/* ── Top Header with Fast Forward / Proceed Button ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          padding: '12px 18px',
          background: '#0f1422',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              background: isNegative ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: `1px solid ${isNegative ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isNegative ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isNegative ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
            {isNegative ? 'PHASE 1 — INCIDENT ANALYSIS' : 'PHASE 4 — CORRECT PROCEDURE'}
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {isNegative ? 'Root cause study' : 'Optional video demonstration'}
          </span>
        </div>

        {/* Top Direct Proceed CTA */}
        <button
          id="btn-skip-to-quiz-top"
          onClick={() => setShowWarningModal(true)}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff',
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>Ready for Final Quiz</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Title & Info Banner */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
          {isNegative ? 'Observe the Incident Dynamics' : 'Study the Compliant Safety Procedure'}
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
            fontSize: 12,
            color: '#93c5fd',
          }}
        >
          <Info size={16} style={{ flexShrink: 0, color: '#38bdf8' }} />
          <span>
            Watching the entire video is <strong>optional</strong>. If you feel confident in the safety protocol from your 3D simulation practice, you can click <strong>Ready for Final Quiz</strong> at any time.
          </span>
        </div>
      </div>

      {/* Video Player */}
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          background: '#0d111a',
        }}
      >
        <ImmersiveVideoPlayer
          track={activeTrack}
          onComplete={handleVideoComplete}
        />
      </div>

      {/* Decision Results (if any cues were answered) */}
      {answeredCues.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: '16px 20px',
            background: '#0f1422',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            <BarChart2 size={16} color="#38bdf8" />
            In-Video Verification Decisions:
          </div>
          <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{correctCues.length}</div>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>CORRECT</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{answeredCues.length - correctCues.length}</div>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>INCORRECT</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f97316' }}>{answeredCues.length}</div>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>TOTAL</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Compliant Procedure Key Points ── */}
      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {/* Positive Protocol Box */}
        <div
          style={{
            padding: '18px 20px',
            background: '#0f1422',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 800,
              color: '#10b981',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            <CheckCircle size={15} /> Standard Compliant Protocol
          </div>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, margin: 0, marginBottom: 12 }}>
            {scenario.positiveCase.description}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scenario.positiveCase.actions.map((act, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#e2e8f0',
                  background: 'rgba(16,185,129,0.08)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  borderLeft: '3px solid #10b981',
                }}
              >
                <span style={{ fontWeight: 700, color: '#10b981' }}>✓ Step {i + 1}:</span>
                <span>{act.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Objectives Box */}
        {scenario.learningObjectives.length > 0 && (
          <div
            style={{
              padding: '18px 20px',
              background: '#0f1422',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 800,
                color: '#f97316',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 12,
              }}
            >
              <ShieldAlert size={15} /> Exam Topic Focus
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scenario.learningObjectives.slice(0, 4).map((obj, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                  <Zap size={13} style={{ color: '#f97316', flexShrink: 0, marginTop: 2 }} />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          id="btn-proceed-to-quiz-bottom"
          onClick={() => setShowWarningModal(true)}
          style={{
            padding: '14px 36px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff',
            border: 'none',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 6px 24px rgba(249,115,22,0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>I am Ready — Take Final Knowledge Quiz</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ── Warning & Confirmation Modal ── */}
      {showWarningModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#0f1422',
              borderRadius: 22,
              border: '2px solid rgba(249,115,22,0.4)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
              padding: '28px 24px 22px',
              textAlign: 'center',
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(249,115,22,0.15)',
                border: '2px solid rgba(249,115,22,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Ready for the Final Certification Quiz?
            </h3>

            {/* Critical Notice Callout */}
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Lock size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffffff' }}>No Back Step Warning:</strong> Once you begin the final quiz, you <strong>cannot return to re-watch the video</strong> or review the training materials.
                </div>
              </div>
            </div>

            {/* Assessment Rules */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'left',
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>5 scenario-specific compliance questions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Minimum passing score: <strong>80%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Results directly determine certification approval</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                id="btn-cancel-quiz-warning"
                onClick={() => setShowWarningModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Review Video More
              </button>
              <button
                id="btn-confirm-start-quiz"
                onClick={handleConfirmProceedToQuiz}
                style={{
                  flex: 1.2,
                  padding: '12px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>Start Final Quiz</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
