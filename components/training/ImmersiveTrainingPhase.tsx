'use client'

import { useState } from 'react'
import type { ImmersiveScenario, TimelineState } from '@/types'
import { ImmersiveVideoPlayer } from './ImmersiveVideoPlayer'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  AlertTriangle, CheckCircle, ChevronRight, BarChart2, Zap, ShieldAlert
} from 'lucide-react'

interface Props {
  scenario: ImmersiveScenario
  caseType: 'negative' | 'positive'
  onComplete: (cueResults: TimelineState['cueResults']) => void
}

export function ImmersiveTrainingPhase({ scenario, caseType, onComplete }: Props) {
  const addEvent = useSimulationStore((s) => s.addEvent)
  const [cueResults, setCueResults] = useState<TimelineState['cueResults']>({})

  const track = caseType === 'negative'
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
    const correctCount = Object.values(results).filter(r => r.correct).length
    const totalCues = activeTrack.cues.length
    addEvent('video_completed', undefined, { caseType, correctCues: correctCount, totalCues })
    onComplete(results)
  }

  // Compute a summary of how the trainee did on in-video decisions
  const answeredCues = Object.entries(cueResults)
  const correctCues = answeredCues.filter(([, r]) => r.correct)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Phase header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          padding: '3px 12px', borderRadius: 999,
          background: isNegative ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${isNegative ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
          color: isNegative ? '#ef4444' : '#10b981',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {isNegative ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
          {isNegative ? 'PHASE 1 — INCIDENT ANALYSIS' : 'PHASE 3 — CORRECT PROCEDURE'}
        </div>
        <span style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>
          {activeTrack.cues.length} decision point{activeTrack.cues.length !== 1 ? 's' : ''} embedded
        </span>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
        {isNegative ? 'Observe the Incident' : 'Study the Correct Response'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        {isNegative
          ? 'Watch how the incident unfolds. The AI will pause the video at critical moments and ask you to evaluate the situation in real time.'
          : 'This demonstration shows the correct procedure. Notice each deliberate action the worker takes and why it prevents the incident.'}
      </p>

      {/* Player */}
      <ImmersiveVideoPlayer
        track={activeTrack}
        onComplete={handleVideoComplete}
      />

      {/* Cue summary (shows after answering) */}
      {answeredCues.length > 0 && (
        <div style={{
          marginTop: 20,
          padding: '16px 20px',
          background: 'var(--sg-bg-surface)',
          border: '1px solid var(--sg-border)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13 }}>
            <BarChart2 size={15} color="#38bdf8" />
            In-Video Decisions
          </div>
          <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{correctCues.length}</div>
              <div style={{ fontSize: 10, color: 'var(--sg-text-muted)', fontWeight: 600 }}>CORRECT</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{answeredCues.length - correctCues.length}</div>
              <div style={{ fontSize: 10, color: 'var(--sg-text-muted)', fontWeight: 600 }}>INCORRECT</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sg-accent)' }}>{answeredCues.length}</div>
              <div style={{ fontSize: 10, color: 'var(--sg-text-muted)', fontWeight: 600 }}>TOTAL</div>
            </div>
          </div>
        </div>
      )}

      {/* Learning objectives sidebar */}
      {scenario.learningObjectives.length > 0 && (
        <div style={{
          marginTop: 20,
          padding: '16px 20px',
          background: 'var(--sg-bg-elevated)',
          border: '1px solid var(--sg-border)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--sg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <ShieldAlert size={12} /> Learning Objectives
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scenario.learningObjectives.slice(0, 3).map((obj, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--sg-text-secondary)' }}>
                <Zap size={12} style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
                {obj}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
