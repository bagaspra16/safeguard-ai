'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  Award,
  CheckCircle,
  RotateCcw,
  ArrowRight,
  Clock,
  Eye,
  ShieldCheck,
  FileCheck,
  Lock,
  CreditCard,
  Download,
  BadgeCheck,
  Sparkles,
  X,
  Shield,
  Hash,
  Calendar,
  Copy,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  scenario: Scenario
}

type ModalStep = 'payment_form' | 'processing' | 'certificate'

// Locked certificate data after payment is confirmed
interface CertData {
  holderName: string
  certId: string
  certUrl: string
}

export function ResultsPhase({ scenario }: Props) {
  const reset = useSimulationStore((s) => s.reset)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const decisionCorrect = useSimulationStore((s) => s.decisionCorrect)
  const quizAnswers = useSimulationStore((s) => s.quizAnswers)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)

  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('payment_form')
  const [copied, setCopied] = useState(false)
  const [lockedCert, setLockedCert] = useState<CertData | null>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)

  // Payment form state
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  // Calculate scores
  const totalHazards = scenario.hazards.length || 3
  const hazardScore = Math.min(100, Math.round((detectedHazards.length / totalHazards) * 100))
  const decisionScore = decisionCorrect ? 100 : 0
  const quizCorrectCount = quizAnswers.filter((a) => a.correct).length
  const quizTotalCount = Math.max(1, quizAnswers.length)
  const quizScore = Math.round((quizCorrectCount / quizTotalCount) * 100)

  const overallScore = Math.round(hazardScore * 0.3 + decisionScore * 0.4 + quizScore * 0.3)
  const passed = overallScore >= scenario.assessment.passingScore

  // Dates
  const { issuedDate, expiryDate } = useMemo(() => {
    const now = Date.now()
    return {
      issuedDate: new Date(now).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      expiryDate: new Date(now + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }
  }, [])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}m ${rem}s`
  }

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 4)
    if (digits.length >= 3) return digits.substring(0, 2) + '/' + digits.substring(2)
    return digits
  }

  const isFormValid =
    cardName.trim().length > 2 &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3

  const handlePay = () => {
    // Lock in the certificate data at the moment of payment
    const holderName = cardName.trim() || 'Safety Professional'
    const payload = {
      holderName,
      scenarioTitle: scenario.title,
      score: overallScore,
      issuedDate,
      expiryDate,
      issuer: 'ClumsAI Certification Authority',
      standard: 'OSHA 29 CFR 1910',
    }
    const id = btoa(JSON.stringify(payload)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40)
    const url = `${window.location.origin}/certificate/${id}`

    setLockedCert({ holderName, certId: id, certUrl: url })
    setModalStep('processing')

    setTimeout(() => {
      setModalStep('certificate')
    }, 2400)
  }

  const handleCopy = () => {
    if (!lockedCert) return
    navigator.clipboard.writeText(lockedCert.certUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const openModal = () => {
    setCardName('')
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setLockedCert(null)
    setModalStep('payment_form')
    setShowModal(true)
  }

  // Spinner animation via useEffect
  useEffect(() => {
    if (modalStep !== 'processing' || !spinnerRef.current) return
    let angle = 0
    let raf: number
    const tick = () => {
      angle = (angle + 4) % 360
      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotate(${angle}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [modalStep])

  // AI Evaluation
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

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* ── Score Hero Banner ── */}
      <div
        style={{
          borderRadius: 18,
          padding: '28px 30px',
          background: '#ffffff',
          border: '1px solid #eef2f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: passed ? 'rgba(22,163,74,0.1)' : 'rgba(249,115,22,0.1)',
              color: passed ? '#16a34a' : '#ea580c',
            }}
          >
            <Award size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: passed ? 'rgba(22,163,74,0.1)' : 'rgba(249,115,22,0.1)',
                  color: passed ? '#16a34a' : '#ea580c',
                }}
              >
                {passed ? 'Assessment Passed' : 'Training Incomplete'}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Required: {scenario.assessment.passingScore}%
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px', color: '#0f172a' }}>
              {passed ? 'Certification Performance Verified' : 'Refresher Required'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>
              {scenario.title} · Compliance Performance Report
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: passed ? '#16a34a' : '#ea580c' }}>
            {overallScore}%
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Composite Score
          </div>
        </div>
      </div>

      {/* ── Metric Breakdown Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: Eye, label: 'Hazard Detection', value: `${detectedHazards.length} / ${totalHazards}`, sub: `${hazardScore}% recognition` },
          { icon: ShieldCheck, label: 'Decision Checkpoint', value: decisionCorrect ? 'Compliant' : 'Review Needed', sub: decisionCorrect ? 'Standard procedure followed' : 'Safety deviation recorded' },
          { icon: FileCheck, label: 'Knowledge Quiz', value: `${quizCorrectCount} / ${quizTotalCount}`, sub: `${quizScore}% score` },
          { icon: Clock, label: 'Session Time', value: formatTime(elapsedSeconds), sub: `Target: ${scenario.estimatedDuration}m` },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f6',
              borderRadius: 14,
              padding: '16px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
              <m.icon size={14} color="#ea580c" />
              <span>{m.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI Analysis Summary ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #eef2f6',
          borderRadius: 18,
          padding: '22px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={16} color="#ea580c" />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>AI Training Debrief</h3>
        </div>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #edf2f7',
            padding: '16px 18px',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#334155',
          }}
        >
          {loadingAi ? (
            <span style={{ color: '#94a3b8' }}>Synthesizing compliance evaluation...</span>
          ) : aiEvaluation ? (
            <div style={{ whiteSpace: 'pre-line' }}>{aiEvaluation}</div>
          ) : (
            <p style={{ margin: 0 }}>
              {passed
                ? `Standard safety compliance verified for ${scenario.title}. All required OSHA controls were correctly identified and executed.`
                : 'Safety deviations were identified during the simulation. Review standard operating protocols and retake the module.'}
            </p>
          )}
        </div>
      </div>

      {/* ── Certificate Access Card ── */}
      <div
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid #eef2f6',
          marginBottom: 24,
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            padding: '20px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ClumsAI Verified Credential
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '2px 0 0', color: '#ffffff' }}>
                  {scenario.title}
                </h3>
              </div>
            </div>
            {passed && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                Eligible
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px' }}>
          {passed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Official OSHA Verified Certificate
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  PDF format · Unique credential ID · Employer verifiable online
                </div>
              </div>
              <button
                onClick={openModal}
                style={{
                  padding: '10px 22px',
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
                  boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
                }}
              >
                <Download size={14} />
                <span>Get Certificate · $9.99</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                A passing score of {scenario.assessment.passingScore}% is required to unlock certification.
              </div>
              <button
                onClick={() => { reset(); setPhase('idle') }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retake Module
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => { reset(); setPhase('idle') }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 999,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          <span>Retake Session</span>
        </button>

        <Link
          href="/dashboard/training"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
          }}
        >
          <span>Training Catalog</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ──────────────────────────────────────────
          PAYMENT MODAL
      ────────────────────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(100,116,139,0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* ── STEP 1: Payment Form ── */}
          {modalStep === 'payment_form' && (
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                background: '#ffffff',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  padding: '24px 28px',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Shield size={22} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      ClumsAI Certification
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                      Complete Your Purchase
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px 28px' }}>
                {/* Summary box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e8f0fe',
                    borderRadius: 14,
                    padding: '16px 18px',
                    marginBottom: 22,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    What you receive
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {[
                      `Assessment verified: ${overallScore}% score on ${scenario.title}`,
                      'Official PDF certificate with unique credential ID',
                      'Shareable online verification link for employers',
                      'Valid for 12 months from date of issue',
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, color: '#334155' }}>
                        <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price highlight */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>One-time certification fee</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#ea580c', marginTop: 1 }}>$9.99</div>
                  </div>
                  <div
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: 'rgba(249,115,22,0.12)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#ea580c',
                    }}
                  >
                    No subscription
                  </div>
                </div>

                {/* Card form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Smith"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM / YY"
                        maxLength={5}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={!isFormValid}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 999,
                    border: 'none',
                    background: isFormValid
                      ? 'linear-gradient(135deg, #f97316, #ea580c)'
                      : '#e2e8f0',
                    color: isFormValid ? '#ffffff' : '#94a3b8',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: isFormValid ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
                    marginBottom: 12,
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  <CreditCard size={16} />
                  Pay $9.99 and Get Certificate
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <Lock size={11} />
                  Secured by 256-bit SSL encryption
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Processing ── */}
          {modalStep === 'processing' && (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: '#ffffff',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                padding: '52px 40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#fff7ed',
                  border: '3px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  position: 'relative',
                }}
              >
                {/* Animated arc via ref */}
                <div
                  ref={spinnerRef}
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#f97316',
                    borderRightColor: '#f97316',
                  }}
                />
                <CreditCard size={28} color="#f97316" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Processing Payment
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                Verifying your details and generating your official credential...
              </div>
            </div>
          )}

          {/* ── STEP 3: Certificate ── */}
          {modalStep === 'certificate' && lockedCert && (
            <div
              style={{
                width: '100%',
                maxWidth: 580,
                background: '#ffffff',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                maxHeight: '92vh',
                overflowY: 'auto',
              }}
            >
              {/* Certificate Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  padding: '28px 32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative shapes */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 2,
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Shield size={24} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        ClumsAI
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff' }}>
                        Certificate of Completion
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 999, padding: '5px 12px',
                    }}
                  >
                    <BadgeCheck size={13} color="#ffffff" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>Verified</span>
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div style={{ padding: '30px 32px' }}>

                {/* Success notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 24,
                  }}
                >
                  <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Payment successful</div>
                    <div style={{ fontSize: 11, color: '#16a34a' }}>Your certificate has been generated and is ready to download</div>
                  </div>
                </div>

                {/* Holder */}
                <div style={{ textAlign: 'center', marginBottom: 26 }}>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px', fontStyle: 'italic' }}>
                    This is to certify that
                  </p>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: '#0f172a',
                      borderBottom: '2px solid #f97316',
                      display: 'inline-block',
                      paddingBottom: 6,
                      marginBottom: 12,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {lockedCert.holderName}
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    has successfully completed the required training and assessment for
                  </p>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#0f172a',
                      marginTop: 10,
                      padding: '9px 20px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #eef2f6',
                      display: 'inline-block',
                    }}
                  >
                    {scenario.title}
                  </div>
                </div>

                {/* Metadata grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: Award, label: 'Assessment Score', value: `${overallScore}% — Passed` },
                    { icon: CheckCircle, label: 'Compliance Standard', value: 'OSHA 29 CFR 1910' },
                    { icon: Calendar, label: 'Date of Issue', value: issuedDate },
                    { icon: Clock, label: 'Valid Until', value: expiryDate },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #eef2f6',
                        borderRadius: 10,
                        padding: '13px 15px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 5,
                        }}
                      >
                        <item.icon size={10} color="#ea580c" />
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Credential ID */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #eef2f6',
                    borderRadius: 10,
                    padding: '13px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <Hash size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Credential ID
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        SGA-{lockedCert.certId.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#15803d',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '3px 10px',
                      borderRadius: 999,
                      flexShrink: 0,
                    }}
                  >
                    Authentic
                  </span>
                </div>

                {/* Online verification link */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #eef2f6',
                    borderRadius: 12,
                    padding: '15px 16px',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ExternalLink size={12} color="#ea580c" />
                    Online Verification Link
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: '#64748b',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '8px 12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lockedCert.certUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '8px 13px',
                        borderRadius: 8,
                        flexShrink: 0,
                        background: copied ? '#f0fdf4' : '#ffffff',
                        border: `1px solid ${copied ? '#bbf7d0' : '#e2e8f0'}`,
                        color: copied ? '#15803d' : '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Copy size={12} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={lockedCert.certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 13px',
                        borderRadius: 8,
                        flexShrink: 0,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 999,
                      border: 'none',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
                    }}
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 22px',
                      borderRadius: 999,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Shared input styles
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  display: 'block',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontSize: 13,
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
}
