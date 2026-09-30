'use client'

import { useState, useEffect } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  ShieldCheck,
  Bot,
  Activity,
  FileCheck
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  scenario: Scenario
}

export function ResultsPhase({ scenario }: Props) {
  const reset = useSimulationStore((s) => s.reset)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const decisionCorrect = useSimulationStore((s) => s.decisionCorrect)
  const quizAnswers = useSimulationStore((s) => s.quizAnswers)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const events = useSimulationStore((s) => s.events)

  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(true)

  // Calculate scores
  const totalHazards = scenario.hazards.length || 3
  const hazardScore = Math.min(100, Math.round((detectedHazards.length / totalHazards) * 100))
  const decisionScore = decisionCorrect ? 100 : 0
  const quizCorrectCount = quizAnswers.filter((a) => a.correct).length
  const quizTotalCount = Math.max(1, quizAnswers.length)
  const quizScore = Math.round((quizCorrectCount / quizTotalCount) * 100)

  // Overall weighted composite score: 35% Hazard Detection, 35% 3D Decision, 30% Quiz
  const overallScore = Math.round(hazardScore * 0.35 + decisionScore * 0.35 + quizScore * 0.3)
  const passed = overallScore >= scenario.assessment.passingScore

  // Format time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}m ${rem}s`
  }

  // Request AI Evaluation report
  useEffect(() => {
    let isMounted = true
    async function fetchAiReport() {
      try {
        const res = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioTitle: scenario.title,
            score: overallScore,
            passed,
            hazardsDetectedCount: detectedHazards.length,
            totalHazards,
            decisionCorrect,
            quizScore,
            completionTimeSeconds: elapsedSeconds,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted) setAiEvaluation(data.feedback || data.evaluation)
        }
      } catch (err) {
        console.warn('AI evaluation API unavailable, using fallback', err)
      } finally {
        if (isMounted) setLoadingAi(false)
      }
    }
    fetchAiReport()
    return () => {
      isMounted = false
    }
  }, [scenario.title, overallScore, passed, detectedHazards.length, totalHazards, decisionCorrect, quizScore, elapsedSeconds])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header Banner */}
      <div
        style={{
          borderRadius: 16,
          padding: '36px 32px',
          background: passed
            ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,78,59,0.25))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(127,29,29,0.25))',
          border: `1px solid ${passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              border: `2px solid ${passed ? '#10b981' : '#ef4444'}`,
            }}
          >
            {passed ? <Award size={34} color="#10b981" /> : <AlertTriangle size={34} color="#ef4444" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: passed ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                }}
              >
                {passed ? 'Certification Achieved' : 'Review Required'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)' }}>
                Target: {scenario.assessment.passingScore}%
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              {passed ? 'Simulation Completed Successfully!' : 'Simulation Incomplete - Additional Practice Needed'}
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--sg-text-secondary)', fontSize: 14 }}>
              {scenario.title} — Comprehensive Training Performance Debrief
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 120 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              lineHeight: 1,
              color: passed ? '#10b981' : '#ef4444',
            }}
          >
            {overallScore}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 4, fontWeight: 600 }}>
            FINAL SCORE
          </div>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13, marginBottom: 8 }}>
            <Eye size={16} color="#38bdf8" /> Hazard Identification
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
            {detectedHazards.length} / {totalHazards}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 4 }}>
            {hazardScore}% recognition rate
          </div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13, marginBottom: 8 }}>
            <ShieldCheck size={16} color={decisionCorrect ? '#10b981' : '#ef4444'} /> 3D Intersection Action
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: decisionCorrect ? '#10b981' : '#ef4444' }}>
            {decisionCorrect ? 'Compliant' : 'Violation'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 4 }}>
            {decisionCorrect ? 'Stopped at blind corner' : 'Walked into vehicle path'}
          </div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13, marginBottom: 8 }}>
            <FileCheck size={16} color="#a855f7" /> Knowledge Assessment
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#a855f7' }}>
            {quizCorrectCount} / {quizTotalCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 4 }}>
            {quizScore}% comprehension score
          </div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13, marginBottom: 8 }}>
            <Clock size={16} color="#f59e0b" /> Completion Time
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
            {formatTime(elapsedSeconds)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 4 }}>
            Est. target: {scenario.estimatedDuration}m
          </div>
        </div>
      </div>

      {/* AI Debrief & Instructor Analysis */}
      <div
        style={{
          background: 'var(--sg-bg-surface)',
          border: '1px solid var(--sg-border)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56,189,248,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={18} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AI Safety Instructor Debrief</h3>
            <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>Automated Behavioral & Procedural Analysis</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-elevated)',
            border: '1px solid var(--sg-border)',
            borderRadius: 12,
            padding: 20,
            fontSize: 14,
            lineHeight: 1.7,
            color: 'var(--sg-text-primary)',
          }}
        >
          {loadingAi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--sg-text-secondary)' }}>
              <div className="sg-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Generating comprehensive behavioral debrief with AI instructor...
            </div>
          ) : aiEvaluation ? (
            <div style={{ whiteSpace: 'pre-line' }}>{aiEvaluation}</div>
          ) : (
            <div>
              {passed ? (
                <div>
                  <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#10b981' }}>
                    Excellent performance! You successfully identified high-risk blind corners and respected vehicle right-of-way.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Key Highlights:</strong> You yielded appropriately before intersection lines, verified convex mirror reflections, and demonstrated clear comprehension of OSHA 1910.178 pedestrian safety regulations during the quiz assessment.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#ef4444' }}>
                    Critical Safety Deficiencies Detected:
                  </p>
                  <p style={{ margin: 0 }}>
                    During the 3D blind corner intersection, safety protocols require coming to a full stop at designated line markings, checking the convex overhead mirror, and establishing eye contact with the forklift operator before crossing. We recommend replaying the positive demonstration video and re-taking this simulation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--sg-border)',
        }}
      >
        <button
          onClick={() => {
            reset()
            setPhase('idle')
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            borderRadius: 10,
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            color: 'var(--sg-text-primary)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} /> Retake Simulation
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="/dashboard/training"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 10,
              background: 'var(--sg-primary)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Training Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
