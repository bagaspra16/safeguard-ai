'use client'

import { useEffect, useRef, useState } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { ScenarioIntro } from './ScenarioIntro'
import { VideoPhase } from './VideoPhase'
import { AIQuestionPhase } from './AIQuestionPhase'
import { SimulationPhaseView } from './SimulationPhaseView'
import { QuizPhase } from './QuizPhase'
import { ResultsPhase } from './ResultsPhase'
import { AITrainerPanel } from './AITrainerPanel'
import { SimulationHUD } from './SimulationHUD'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function TrainingExperience({ scenario }: Props) {
  const phase = useSimulationStore((s) => s.phase)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const incrementTimer = useSimulationStore((s) => s.incrementTimer)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start timer when simulation is active
  useEffect(() => {
    if (phase === 'simulation_active' || phase === 'hazard_detection') {
      timerRef.current = setInterval(incrementTimer, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, incrementTimer])

  // Is this a 3D simulation phase?
  const is3DPhase = phase === 'simulation_active' || phase === 'hazard_detection' ||
    phase === 'decision_point' || phase === 'outcome_correct' || phase === 'outcome_incorrect'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Top nav strip */}
      {!is3DPhase && (
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
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <span className={`sg-badge ${scenario.severity === 'high' ? 'sg-badge-hazard' : 'sg-badge-warning'}`}>
              {scenario.severity.toUpperCase()} RISK
            </span>
          </div>
        </div>
      )}

      {/* Phase content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
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
        {is3DPhase && (
          <SimulationPhaseView scenario={scenario} />
        )}
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
        {phase === 'results' && (
          <ResultsPhase scenario={scenario} />
        )}
      </div>
    </div>
  )
}
