'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { ScenarioIntro } from './ScenarioIntro'
import { VideoPhase } from './VideoPhase'
import { AIQuestionPhase } from './AIQuestionPhase'
import { SimulationPhaseView } from './SimulationPhaseView'
import { FireSceneView } from './FireSceneView'
import { ConstructionFallSceneView } from './ConstructionFallSceneView'
import { QuizPhase } from './QuizPhase'
import { ResultsPhase } from './ResultsPhase'
import {
  Pause,
  Play,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Clock,
  Shield,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function TrainingExperience({ scenario }: Props) {
  const router = useRouter()
  const phase = useSimulationStore((s) => s.phase)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const setIsPaused = useSimulationStore((s) => s.setIsPaused)
  const togglePause = useSimulationStore((s) => s.togglePause)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const incrementTimer = useSimulationStore((s) => s.incrementTimer)
  const reset = useSimulationStore((s) => s.reset)

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Is the drill actively in progress? (not in intro and not in final results)
  const isDrillActive = phase !== 'idle' && phase !== 'results'

  // Timer interval (respects isPaused)
  useEffect(() => {
    if (isDrillActive && !isPaused) {
      timerRef.current = setInterval(incrementTimer, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isDrillActive, isPaused, incrementTimer])

  // Prevent accidental tab close / reload during active drill
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDrillActive) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDrillActive])

  // Keyboard shortcut listener for spacebar / Escape to pause/resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger pause if typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (e.code === 'Space' || e.code === 'Escape') {
        if (isDrillActive) {
          e.preventDefault()
          togglePause()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrillActive, togglePause])

  const handleAbortDrill = () => {
    reset()
    router.push('/dashboard/training')
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  const getPhaseName = () => {
    switch (phase) {
      case 'negative_video':
        return 'Incident Video Analysis'
      case 'ai_question':
        return 'AI Hazard Debrief'
      case 'simulation_active':
      case 'hazard_detection':
      case 'decision_point':
      case 'outcome_correct':
      case 'outcome_incorrect':
        return '3D Interactive Walkway Simulation'
      case 'positive_video':
        return 'Benchmark Safety Procedure Video'
      case 'quiz':
        return 'OSHA Certification Knowledge Quiz'
      case 'results':
        return 'Evaluation & Credential Summary'
      default:
        return 'Scenario Overview'
    }
  }

  const is3DPhase =
    phase === 'simulation_active' ||
    phase === 'hazard_detection' ||
    phase === 'decision_point' ||
    phase === 'outcome_correct' ||
    phase === 'outcome_incorrect'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: is3DPhase ? '#0d0f11' : '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── Active Simulation Floating Control Bar (Only during active drill) ── */}
      {isDrillActive && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 20,
            right: 20,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {/* Left: Scenario & Current Phase Badge */}
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 999,
              padding: '6px 16px 6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Shield size={15} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {scenario.title}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                {getPhaseName()}
              </div>
            </div>
          </div>

          {/* Right: Timer & Dedicated Pause Button */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* Live Clock Capsule */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 999,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#ffffff',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
              }}
            >
              <Clock size={14} color="#f97316" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Universal Pause Button */}
            <button
              onClick={togglePause}
              title={isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
              style={{
                background: isPaused
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                  : 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 999,
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {isPaused ? <Play size={15} fill="#ffffff" /> : <Pause size={15} fill="#ffffff" />}
              <span>{isPaused ? 'Resume' : 'Pause Drill'}</span>
              <span
                style={{
                  fontSize: 10,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                  marginLeft: 2,
                }}
              >
                Space
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Simulation Phase Content Container ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'auto', width: '100%', height: '100%' }}>
        {phase === 'idle' && (
          <ScenarioIntro scenario={scenario} onStart={() => setPhase('negative_video')} />
        )}
        {phase === 'negative_video' && (
          <VideoPhase
            scenario={scenario}
            caseType="negative"
            onComplete={() => setPhase('ai_question')}
          />
        )}
        {phase === 'ai_question' && (
          <AIQuestionPhase
            scenario={scenario}
            onContinue={() => setPhase('simulation_active')}
          />
        )}
        {is3DPhase &&
          (scenario.id === 'industrial-fire-005' || scenario.category === 'fire_safety' ? (
            <FireSceneView scenario={scenario} />
          ) : scenario.id === 'construction-fall-006' ||
            scenario.id === 'fall-protection-004' ||
            scenario.category === 'construction_safety' ? (
            <ConstructionFallSceneView scenario={scenario} />
          ) : (
            <SimulationPhaseView scenario={scenario} />
          ))}
        {phase === 'positive_video' && (
          <VideoPhase
            scenario={scenario}
            caseType="positive"
            onComplete={() => setPhase('quiz')}
          />
        )}
        {phase === 'quiz' && (
          <QuizPhase scenario={scenario} onComplete={() => setPhase('results')} />
        )}
        {phase === 'results' && <ResultsPhase scenario={scenario} />}
      </div>

      {/* ── Frosted Blur Pause Overlay Modal ── */}
      {isPaused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              padding: '36px 32px 30px',
              textAlign: 'center',
            }}
          >
            {/* Pause Badge */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.12)',
                border: '2px solid rgba(249, 115, 22, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                margin: '0 auto 18px',
              }}
            >
              <Pause size={28} fill="#ea580c" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Simulation Drill Paused
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              The simulation clock and AI evaluation have been halted. Take a moment before continuing.
            </p>

            {/* Drill Status Snapshot */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Current Phase:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{getPhaseName()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Elapsed Time:</span>
                <span style={{ fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>OSHA Standard:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>29 CFR 1910.178</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => setIsPaused(false)}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <Play size={16} fill="#ffffff" /> Resume Training Drill
              </button>

              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: '#f8fafc',
                  color: '#ef4444',
                  border: '1px solid #fee2e2',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <LogOut size={14} /> Abort & Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Abort / Exit Early Confirmation Modal ── */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
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
              border: '1px solid #fecaca',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              padding: '28px 26px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                margin: '0 auto 14px',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Abort Current Simulation Drill?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Exiting now will mark this attempt as <strong>Incomplete</strong>. Your current score and reaction timing will not count toward OSHA certification.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Training
              </button>
              <button
                onClick={handleAbortDrill}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 999,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                }}
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

