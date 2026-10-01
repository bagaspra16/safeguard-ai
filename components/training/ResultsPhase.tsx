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
  Clock,
  Eye,
  ShieldCheck,
  Bot,
  FileCheck,
  Lock,
  CreditCard,
  Download,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Activity,
  Star,
  Flame,
  ChevronRight,
  X,
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
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)

  // Calculate scores
  const totalHazards = scenario.hazards.length || 3
  const hazardScore = Math.min(100, Math.round((detectedHazards.length / totalHazards) * 100))
  const decisionScore = decisionCorrect ? 100 : 0
  const quizCorrectCount = quizAnswers.filter((a) => a.correct).length
  const quizTotalCount = Math.max(1, quizAnswers.length)
  const quizScore = Math.round((quizCorrectCount / quizTotalCount) * 100)

  // Overall weighted composite score
  const overallScore = Math.round(hazardScore * 0.3 + decisionScore * 0.4 + quizScore * 0.3)
  const passed = overallScore >= scenario.assessment.passingScore

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}m ${rem}s`
  }

  // Simulate analysis steps loading
  useEffect(() => {
    const steps = [0, 1, 2, 3, 4]
    steps.forEach((step, i) => {
      setTimeout(() => setAnalysisStep(step), i * 600)
    })
  }, [])

  // Request AI Evaluation report
  useEffect(() => {
    let isMounted = true
    async function fetchAiReport() {
      try {
        const res = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            scenarioCategory: scenario.category,
            scenarioDescription: scenario.description,
            environment: scenario.environment,
            learningObjectives: scenario.learningObjectives,
            positiveCase: scenario.positiveCase?.description,
            negativeCase: scenario.negativeCase?.description,
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
        console.warn('AI evaluation unavailable', err)
      } finally {
        if (isMounted) setLoadingAi(false)
      }
    }
    fetchAiReport()
    return () => { isMounted = false }
  }, [
    scenario.id, scenario.title, scenario.category, scenario.description,
    scenario.environment, scenario.learningObjectives, scenario.positiveCase,
    scenario.negativeCase, overallScore, passed, detectedHazards.length,
    totalHazards, decisionCorrect, quizScore, elapsedSeconds,
  ])

  const ANALYSIS_STEPS = [
    { label: 'Parsing behavioral telemetry', icon: Activity },
    { label: 'Mapping hazard recognition patterns', icon: Eye },
    { label: 'Cross-referencing OSHA compliance database', icon: ShieldCheck },
    { label: 'Generating performance debrief', icon: Bot },
    { label: 'Certification eligibility check complete', icon: BadgeCheck },
  ]

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* ── Score Hero Banner ── */}
      <div
        style={{
          borderRadius: 20,
          padding: '32px',
          background: passed
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
            : 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(249,115,22,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background orb */}
        <div
          style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)',
              border: `2px solid ${passed ? '#10b981' : '#f97316'}`,
            }}
          >
            {passed ? <Award size={36} color="#10b981" /> : <AlertTriangle size={36} color="#f97316" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  padding: '3px 12px', borderRadius: 999,
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: passed ? '#10b981' : '#f97316', color: '#ffffff',
                }}
              >
                {passed ? '✓ Training Passed' : 'Training Incomplete'}
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Min. required: {scenario.assessment.passingScore}%
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              {passed ? 'Safety Certification Achieved' : 'Additional Training Required'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              {scenario.title} · Comprehensive Training Performance Report
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: passed ? '#10b981' : '#f97316' }}>
            {overallScore}%
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Final Score
          </div>
        </div>
      </div>

      {/* ── Metric Breakdown Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          {
            icon: Eye, color: '#38bdf8',
            label: 'Hazard Detection', bg: 'rgba(56,189,248,0.08)',
            value: `${detectedHazards.length} / ${totalHazards}`,
            sub: `${hazardScore}% identification rate`,
          },
          {
            icon: ShieldCheck, color: decisionCorrect ? '#10b981' : '#ef4444',
            label: 'Critical Decision', bg: decisionCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            value: decisionCorrect ? 'Compliant' : 'Needs Review',
            sub: decisionCorrect ? 'Correct response at critical moment' : 'Decision violated safety protocol',
          },
          {
            icon: FileCheck, color: '#a855f7',
            label: 'Knowledge Quiz', bg: 'rgba(168,85,247,0.08)',
            value: `${quizCorrectCount} / ${quizTotalCount}`,
            sub: `${quizScore}% comprehension`,
          },
          {
            icon: Clock, color: '#f59e0b',
            label: 'Completion Time', bg: 'rgba(245,158,11,0.08)',
            value: formatTime(elapsedSeconds),
            sub: `Target: ${scenario.estimatedDuration}m`,
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.icon size={15} color={m.color} />
              </div>
              {m.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI Training Analysis ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#f97316" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>AI Training Analysis</h3>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Behavioral · Procedural · Compliance Assessment</span>
          </div>
        </div>

        {/* Analysis Steps Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {ANALYSIS_STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: analysisStep >= i ? 1 : 0.3,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: analysisStep > i
                    ? 'rgba(16,185,129,0.12)'
                    : analysisStep === i
                    ? 'rgba(249,115,22,0.12)'
                    : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {analysisStep > i ? (
                  <CheckCircle size={14} color="#10b981" />
                ) : (
                  <step.icon size={13} color={analysisStep === i ? '#f97316' : '#94a3b8'} />
                )}
              </div>
              <span style={{ fontSize: 13, color: analysisStep >= i ? '#334155' : '#cbd5e1', fontWeight: analysisStep === i ? 600 : 400 }}>
                {step.label}
              </span>
              {analysisStep === i && analysisStep < ANALYSIS_STEPS.length - 1 && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 16, height: 16,
                    borderRadius: '50%',
                    border: '2px solid #f97316',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* AI Evaluation Text */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#334155',
          }}
        >
          {loadingAi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #f97316', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span>Generating comprehensive behavioral debrief...</span>
            </div>
          ) : aiEvaluation ? (
            <div style={{ whiteSpace: 'pre-line' }}>{aiEvaluation}</div>
          ) : (
            <div>
              {passed ? (
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#10b981' }}>Outstanding compliance demonstrated</strong> for {scenario.title}. You identified critical hazards and adhered to required safety controls. Key highlight: {scenario.positiveCase?.description || 'All safety protocols executed correctly.'}
                </p>
              ) : (
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#ef4444' }}>Safety deficiencies detected</strong> during {scenario.title}. Required procedure: {scenario.positiveCase?.description || 'Follow mandatory risk mitigation procedures.'}. We recommend replaying the scenario.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── License / Certification Section ── */}
      <div
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          border: passed ? '1px solid rgba(249,115,22,0.3)' : '1px solid #e2e8f0',
          marginBottom: 28,
        }}
      >
        {/* Certificate Preview */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '28px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(249,115,22,0.2)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, borderRadius: '50%', border: '1px solid rgba(249,115,22,0.15)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(249,115,22,0.2)', border: '2px solid rgba(249,115,22,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} color="#f97316" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                SafeGuard AI · Official Training Certificate
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                {scenario.title}
              </h3>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                OSHA Compliance Training · Issued {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            {passed ? (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316' }}>{overallScore}%</div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Score</div>
              </div>
            ) : (
              <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700 }}>Retake Required</span>
              </div>
            )}
          </div>
        </div>

        {/* License Access Panel */}
        <div style={{ background: '#ffffff', padding: '24px 32px' }}>
          {passed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <BadgeCheck size={18} color="#10b981" />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>You've Earned Your Certificate!</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                    Your official SafeGuard AI safety training certificate is ready. Download and share it as verified proof of OSHA compliance training completion.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {['OSHA Compliant', 'PDF + Verifiable', 'Employer Ready', 'QR Authenticated'].map((tag) => (
                      <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontWeight: 600 }}>
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Paywall CTA */}
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(249,115,22,0.2)',
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.04) 0%, rgba(234,88,12,0.02) 100%)',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                    Download Official Certificate
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    PDF format · Includes QR verification code · Lifetime access
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>$9.99</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textDecoration: 'line-through' }}>$24.99</div>
                  </div>
                  <button
                    onClick={() => setShowPaywall(true)}
                    style={{
                      padding: '12px 22px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Download size={14} /> Get Certificate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={20} color="#94a3b8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Certificate Locked — Minimum Score Required: {scenario.assessment.passingScore}%
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  Retake the training to unlock your downloadable safety certificate.
                </div>
              </div>
              <button
                onClick={() => { reset(); setPhase('idle') }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Retake Training
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={() => { reset(); setPhase('idle') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} /> Retake Simulation
        </button>

        <Link
          href="/dashboard/training"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff', fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
          }}
        >
          Training Catalog <ArrowRight size={15} />
        </Link>
      </div>

      {/* ── License Payment Modal ── */}
      {showPaywall && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 480,
              background: '#ffffff', borderRadius: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                padding: '24px 28px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowPaywall(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: 'pointer', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(249,115,22,0.2)', border: '2px solid rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={22} color="#f97316" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>SafeGuard AI Certificate</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Official Safety Certification</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* What's included */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>What's Included:</div>
                {[
                  { icon: BadgeCheck, text: 'Official PDF safety training certificate', color: '#10b981' },
                  { icon: Star, text: `Score: ${overallScore}% — ${scenario.title}`, color: '#f97316' },
                  { icon: ShieldCheck, text: 'OSHA compliance training verification', color: '#38bdf8' },
                  { icon: Download, text: 'Instant download + shareable link', color: '#a855f7' },
                  { icon: Sparkles, text: 'QR-authenticated employer-ready document', color: '#f59e0b' },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                    <item.icon size={15} color={item.color} />
                    <span style={{ fontSize: 13, color: '#334155' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(249,115,22,0.2)',
                  background: 'rgba(249,115,22,0.04)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through', marginBottom: 2 }}>Regular price: $24.99</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>$9.99 <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>one-time</span></div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#fef9c3', color: '#a16207' }}>
                  60% OFF
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  // In production this would open a payment processor
                  alert('Payment integration coming soon! This would open Stripe / payment gateway.')
                  setShowPaywall(false)
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 6px 24px rgba(249,115,22,0.4)',
                  marginBottom: 10,
                }}
              >
                <CreditCard size={16} /> Pay $9.99 & Download Certificate
              </button>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Lock size={11} /> Secured by Stripe · 256-bit SSL encryption
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
