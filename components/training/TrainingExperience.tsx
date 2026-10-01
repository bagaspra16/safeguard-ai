'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Scenario } from '@/types'
import { FORKLIFT_IMMERSIVE_SCENARIO } from '@/lib/scenarios/data'
import { useSimulationStore } from '@/lib/simulation/store'
import { ScenarioIntro } from './ScenarioIntro'
import { IncidentAnalysisPhase } from './IncidentAnalysisPhase'
import { ImmersiveTrainingPhase } from './ImmersiveTrainingPhase'
import { AgenticAssessmentPhase } from './AgenticAssessmentPhase'
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
  Clock,
  Shield,
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

  // Keyboard shortcut listener for spacebar / Escape to pause/resume (only during 3D phase)
  const is3DPhase =
    phase === 'simulation_active' ||
    phase === 'hazard_detection' ||
    phase === 'decision_point' ||
    phase === 'outcome_correct' ||
    phase === 'outcome_incorrect'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) return

      if ((e.code === 'Space' || e.code === 'Escape') && is3DPhase) {
        e.preventDefault()
        togglePause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [is3DPhase, togglePause])

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
      case 'negative_video': return 'Incident Analysis & Concept Study'
      case 'ai_question':    return 'AI Hazard Assessment'
      case 'simulation_active':
      case 'hazard_detection':
      case 'decision_point':
      case 'outcome_correct':
      case 'outcome_incorrect': return '3D Interactive Simulation'
      case 'positive_video': return 'Correct Procedure Video'
      case 'quiz':           return 'Knowledge Assessment'
      case 'results':        return 'Training Analysis'
      default:               return 'Scenario Overview'
    }
  }

  // Build the immersive version of the scenario
  const immersiveScenario = {
    ...FORKLIFT_IMMERSIVE_SCENARIO,
    ...scenario,
    immersiveTracks: FORKLIFT_IMMERSIVE_SCENARIO.immersiveTracks,
  }

  // ── Phase Step Indicator ──────────────────────────────────────────────────────
  const PHASE_STEPS = [
    { key: 'negative_video', label: 'Incident Analysis' },
    { key: 'ai_question',    label: 'Assessment' },
    { key: 'simulation_active', label: '3D Simulation' },
    { key: 'positive_video', label: 'Correct Video' },
    { key: 'quiz',           label: 'Final Quiz' },
    { key: 'results',        label: 'Analysis' },
  ]
  const currentStepIdx = PHASE_STEPS.findIndex(
    (s) => s.key === phase || (s.key === 'simulation_active' && is3DPhase)
  )

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
      {/* ── Phase Progress Bar (shown outside 3D and idle) ── */}
      {phase !== 'idle' && !is3DPhase && (
        <div
          style={{
            flexShrink: 0,
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            overflowX: 'auto',
          }}
        >
          {PHASE_STEPS.map((step, i) => {
            const isActive = currentStepIdx === i
            const isDone = currentStepIdx > i
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      background: isActive
                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                        : isDone
                        ? '#10b981'
                        : '#e2e8f0',
                      color: isActive || isDone ? '#ffffff' : '#94a3b8',
                      transition: 'all 0.3s',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#f97316' : isDone ? '#10b981' : '#94a3b8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < PHASE_STEPS.length - 1 && (
                  <div
                    style={{
                      width: 24,
                      height: 1,
                      background: isDone ? '#10b981' : '#e2e8f0',
                      margin: '0 8px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            )
          })}

          {/* Elapsed time pill */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              flexShrink: 0,
            }}
          >
            <Clock size={12} color="#f97316" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      )}

      {/* ── 3D Phase Floating HUD (only during 3D) ── */}
      {is3DPhase && (
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
          {/* Left badge */}
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              padding: '6px 16px 6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}
            >
              <Shield size={15} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {scenario.title}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                3D Interactive Simulation
              </div>
            </div>
          </div>

          {/* Right: Timer + Pause */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
                padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8,
                color: '#fff', fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
              }}
            >
              <Clock size={14} color="#f97316" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={togglePause}
              style={{
                background: isPaused
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 999,
                padding: '8px 18px',
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {isPaused ? <Play size={15} fill="#fff" /> : <Pause size={15} fill="#fff" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                Space
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, position: 'relative', overflow: is3DPhase ? 'hidden' : 'auto', width: '100%', height: '100%' }}>
        {/* PHASE 0: idle → Scenario Intro */}
        {phase === 'idle' && (
          <ScenarioIntro scenario={scenario} onStart={() => setPhase('negative_video')} />
        )}

        {/* PHASE 1: negative_video → Incident picture & AI Safety Agent Analysis */}
        {phase === 'negative_video' && (
          <IncidentAnalysisPhase
            scenario={scenario}
            onComplete={() => setPhase('ai_question')}
          />
        )}

        {/* PHASE 2: ai_question → 3-question Agentic Assessment */}
        {phase === 'ai_question' && (
          <AgenticAssessmentPhase
            scenario={scenario}
            onContinue={() => setPhase('simulation_active')}
          />
        )}

        {/* PHASE 3: 3D interactive simulation (Forklift / Fire / Construction Fall) */}
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

        {/* PHASE 4: positive_video → Correct procedure demonstration */}
        {phase === 'positive_video' && (
          <ImmersiveTrainingPhase
            scenario={immersiveScenario}
            caseType="positive"
            onComplete={() => setPhase('quiz')}
          />
        )}

        {/* PHASE 5: quiz → Final knowledge assessment */}
        {phase === 'quiz' && (
          <QuizPhase scenario={scenario} onComplete={() => setPhase('results')} />
        )}

        {/* PHASE 6: results → Analysis + license */}
        {phase === 'results' && <ResultsPhase scenario={scenario} />}
      </div>

      {/* ── Frosted Blur Pause Overlay (only during 3D) ── */}
      {isPaused && is3DPhase && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 440,
              background: '#ffffff', borderRadius: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              padding: '32px 28px 26px', textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(249,115,22,0.12)',
                border: '2px solid rgba(249,115,22,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ea580c', margin: '0 auto 16px',
              }}
            >
              <Pause size={26} fill="#ea580c" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Simulation Paused
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              Timer and AI evaluation halted. Take a break and resume when ready.
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Elapsed Time:</span>
                <span style={{ fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>{formatTime(elapsedSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Scenario:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{scenario.title}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => setIsPaused(false)}
                style={{
                  width: '100%', padding: '13px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Play size={15} fill="#fff" /> Resume Simulation
              </button>
              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  width: '100%', padding: '11px', borderRadius: 999,
                  background: '#f8fafc', color: '#ef4444',
                  border: '1px solid #fee2e2', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <LogOut size={14} /> Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Abort Confirmation Modal ── */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 420,
              background: '#ffffff', borderRadius: 20,
              border: '1px solid #fecaca',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              padding: '26px 24px', textAlign: 'center',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', margin: '0 auto 12px' }}>
              <AlertTriangle size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Abort Training Session?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Your progress will be marked <strong>Incomplete</strong> and will not count toward certification.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 999, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Keep Training
              </button>
              <button
                onClick={handleAbortDrill}
                style={{ flex: 1, padding: '11px', borderRadius: 999, background: '#dc2626', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
