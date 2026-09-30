'use client'

import { useEffect, useRef } from 'react'
import type { Scenario } from '@/types'
import { FORKLIFT_IMMERSIVE_SCENARIO } from '@/lib/scenarios/data'
import { useSimulationStore } from '@/lib/simulation/store'
import { ScenarioIntro } from './ScenarioIntro'
import { ImmersiveTrainingPhase } from './ImmersiveTrainingPhase'
import { AIQuestionPhase } from './AIQuestionPhase'
import { QuizPhase } from './QuizPhase'
import { ResultsPhase } from './ResultsPhase'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function TrainingExperience({ scenario }: Props) {
  const phase = useSimulationStore((s) => s.phase)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const incrementTimer = useSimulationStore((s) => s.incrementTimer)

  // Timer only runs during the knowledge assessment (quiz) phase now
  useEffect(() => {
    if (phase === 'quiz') {
      timerRef.current = setInterval(incrementTimer, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, incrementTimer])

  // Build the immersive version of the scenario (falls back gracefully)
  const immersiveScenario = {
    ...FORKLIFT_IMMERSIVE_SCENARIO,
    // Allow page-specific overrides (title, severity etc.) from the passed scenario
    ...scenario,
    // But always keep the immersive tracks from the data file
    immersiveTracks: FORKLIFT_IMMERSIVE_SCENARIO.immersiveTracks,
  }

  const showTopNav = phase !== 'idle'

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-120px)] overflow-hidden rounded-xl">
      {/* Top nav strip */}
      {showTopNav && (
        <div style={{
          flexShrink: 0, padding: '12px 24px',
          borderBottom: '1px solid var(--sg-border)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--sg-bg-surface)',
        }}>
          <Link href="/dashboard/training" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--sg-text-secondary)', textDecoration: 'none', fontSize: 13,
          }}>
            <ArrowLeft size={14} /> Training
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--sg-border)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{scenario.title}</span>

          {/* Phase progress indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['negative_video', 'ai_question', 'positive_video', 'quiz', 'results'] as const).map((p, i) => {
              const labels = ['Incident', 'Debrief', 'Procedure', 'Quiz', 'Results']
              const phases = ['negative_video', 'ai_question', 'positive_video', 'quiz', 'results']
              const currentIdx = phases.indexOf(phase)
              const isActive = phase === p
              const isDone = currentIdx > i
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: isActive ? 'var(--sg-accent)' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--sg-bg-elevated)',
                    border: `1px solid ${isActive ? 'var(--sg-accent)' : isDone ? 'rgba(16,185,129,0.5)' : 'var(--sg-border)'}`,
                    fontSize: 9, fontWeight: 800, color: isActive ? '#000' : isDone ? '#10b981' : 'var(--sg-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: isActive ? 'var(--sg-text-primary)' : 'var(--sg-text-muted)', fontWeight: isActive ? 600 : 400 }}>
                    {labels[i]}
                  </span>
                  {i < 4 && <div style={{ width: 12, height: 1, background: 'var(--sg-border)' }} />}
                </div>
              )
            })}
            <div style={{ width: 1, height: 16, background: 'var(--sg-border)', margin: '0 4px' }} />
            <span className={`sg-badge ${scenario.severity === 'high' || scenario.severity === 'critical' ? 'sg-badge-hazard' : 'sg-badge-warning'}`}>
              {scenario.severity.toUpperCase()} RISK
            </span>
          </div>
        </div>
      )}

      {/* Phase content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>

        {/* PHASE: idle → Scenario Intro */}
        {phase === 'idle' && (
          <ScenarioIntro scenario={scenario} onStart={() => setPhase('negative_video')} />
        )}

        {/* PHASE: negative_video → Watch the incident with embedded decision cues */}
        {phase === 'negative_video' && (
          <ImmersiveTrainingPhase
            scenario={immersiveScenario}
            caseType="negative"
            onComplete={() => setPhase('ai_question')}
          />
        )}

        {/* PHASE: ai_question → AI Debrief / comprehension check */}
        {phase === 'ai_question' && (
          <AIQuestionPhase
            scenario={scenario}
            onContinue={() => setPhase('positive_video')}
          />
        )}

        {/* PHASE: positive_video → Correct procedure with observation cues */}
        {phase === 'positive_video' && (
          <ImmersiveTrainingPhase
            scenario={immersiveScenario}
            caseType="positive"
            onComplete={() => setPhase('quiz')}
          />
        )}

        {/* PHASE: quiz → Knowledge assessment */}
        {phase === 'quiz' && (
          <QuizPhase scenario={scenario} onComplete={() => setPhase('results')} />
        )}

        {/* PHASE: results → Full debrief + AI evaluation */}
        {phase === 'results' && (
          <ResultsPhase scenario={scenario} />
        )}
      </div>
    </div>
  )
}
