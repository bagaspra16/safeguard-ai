'use client'

import { useState, useEffect, useRef } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { getAgenticQuestions, type AgenticQuestion } from '@/lib/scenarios/data'
import {
  Brain,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface Props {
  scenario: Scenario
  onContinue: () => void
}

type AdvisorState = 'thinking' | 'guiding' | 'feedback_correct' | 'feedback_wrong' | 'done'

const ADVISOR_INTROS: Record<string, string[]> = {
  'forklift-blind-corner-001': [
    "Analyzing the incident footage now. I'm detecting three critical safety breakdowns in this collision scenario.",
    "Your situational awareness at warehouse intersections will be assessed. Think carefully — forklift operators have the same visibility constraints as pedestrians.",
    "Ready to evaluate your understanding of pedestrian-vehicle separation protocols.",
  ],
  'industrial-fire-005': [
    "Fire dynamics analysis complete. The incident shows cascade failure from a single procedural error.",
    "I'll evaluate your knowledge of emergency response protocols for Class B industrial fires.",
    "Consider the RACE framework as you answer — these questions reflect real OSHA fire safety standards.",
  ],
  'construction-fall-006': [
    "Fall protection analysis complete. At 50 meters, a single lanyard disconnect means zero recovery time.",
    "I'll evaluate your understanding of continuous tie-off requirements at elevated heights.",
    "OSHA 1926.502 mandates 100% fall protection above 6 feet — your answers will be assessed against this standard.",
  ],
}

const CORRECT_RESPONSES = [
  "Correct. That's exactly what the data shows. A clear understanding of the protocol.",
  "Confirmed. Your hazard assessment aligns with OSHA standards for this scenario.",
  "Accurate. You identified the key failure point. Keep this pattern recognition sharp.",
]

const WRONG_RESPONSES = [
  "Negative. Let me show you what actually happened and why the correct answer matters.",
  "That's not quite right. The incident data reveals a more critical failure. Let me explain.",
  "Incorrect. In a real emergency, that choice has consequences. Here's the standard procedure:",
]

export function AgenticAssessmentPhase({ scenario, onContinue }: Props) {
  const addEvent = useSimulationStore((s) => s.addEvent)
  const questions = getAgenticQuestions(scenario)

  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [advisorState, setAdvisorState] = useState<AdvisorState>('thinking')
  const [advisorText, setAdvisorText] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [allAnswers, setAllAnswers] = useState<boolean[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initialized = useRef(false)

  const question = questions[currentQ]
  const isCorrect = submitted && selectedOption === question.correctIndex
  const totalCorrect = allAnswers.filter(Boolean).length
  const isLastQ = currentQ === questions.length - 1

  // Typewriter effect
  const startTyping = (text: string) => {
    if (typingRef.current) clearInterval(typingRef.current)
    setDisplayedText('')
    let i = 0
    typingRef.current = setInterval(() => {
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        if (typingRef.current) clearInterval(typingRef.current)
      }
    }, 18)
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const intros = ADVISOR_INTROS[scenario.id] || ADVISOR_INTROS['industrial-fire-005']
    const intro = intros[0] || "Let's assess your understanding of this incident."
    setAdvisorText(intro)
    setTimeout(() => {
      startTyping(intro)
      setAdvisorState('guiding')
    }, 600)
  }, [scenario.id])

  const handleSubmit = () => {
    if (selectedOption === null) return
    const correct = selectedOption === question.correctIndex
    setSubmitted(true)
    setAllAnswers((prev) => [...prev, correct])
    addEvent(correct ? 'correct_action' : 'wrong_action', `agentic-q${currentQ}`)

    const intros = ADVISOR_INTROS[scenario.id] || ADVISOR_INTROS['industrial-fire-005']
    if (correct) {
      const resp = CORRECT_RESPONSES[currentQ % CORRECT_RESPONSES.length]
      setAdvisorText(resp)
      startTyping(resp)
      setAdvisorState('feedback_correct')
    } else {
      const resp = WRONG_RESPONSES[currentQ % WRONG_RESPONSES.length]
      setAdvisorText(resp)
      startTyping(resp)
      setAdvisorState('feedback_wrong')
    }
  }

  const handleNext = () => {
    if (isLastQ) {
      setShowSummary(true)
    } else {
      const intros = ADVISOR_INTROS[scenario.id] || ADVISOR_INTROS['industrial-fire-005']
      const nextIntro = intros[currentQ + 1] || `Question ${currentQ + 2} of ${questions.length}.`
      setCurrentQ((prev) => prev + 1)
      setSelectedOption(null)
      setSubmitted(false)
      setAdvisorState('thinking')
      setTimeout(() => {
        setAdvisorText(nextIntro)
        startTyping(nextIntro)
        setAdvisorState('guiding')
      }, 400)
    }
  }

  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [])

  if (showSummary) {
    return (
      <SummaryScreen
        questions={questions}
        answers={allAnswers}
        scenario={scenario}
        onContinue={onContinue}
        totalCorrect={totalCorrect}
      />
    )
  }

  const progress = ((currentQ) / questions.length) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              Hazard Intelligence Assessment
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{scenario.title}</div>
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentQ ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  i < currentQ
                    ? allAnswers[i]
                      ? '#10b981'
                      : '#ef4444'
                    : i === currentQ
                    ? '#f97316'
                    : '#e2e8f0',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
            {currentQ + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Agentic Advisor Panel */}
        <div
          style={{
            margin: '24px 32px 0',
            padding: '20px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Advisor Avatar */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <ShieldAlert size={24} color="#ffffff" />
              {advisorState === 'thinking' && (
                <div
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#f97316',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', maxWidth: 48 }}>
              SENTINEL
            </span>
          </div>

          {/* Advisor Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Safety Intelligence Advisor
              </span>
              {advisorState === 'feedback_correct' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                  <CheckCircle2 size={12} /> Confirmed
                </span>
              )}
              {advisorState === 'feedback_wrong' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                  <AlertTriangle size={12} /> Deviation Detected
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 14,
                color: '#e2e8f0',
                lineHeight: 1.6,
                margin: 0,
                minHeight: 40,
                fontStyle: advisorState === 'thinking' ? 'italic' : 'normal',
              }}
            >
              {advisorState === 'thinking' ? 'Analyzing incident data...' : displayedText}
            </p>

            {/* Explanation after submit */}
            {submitted && (
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: isCorrect ? '#10b981' : '#f87171',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Lightbulb size={12} />
                  {isCorrect ? 'Standard Procedure Confirmed' : 'Safety Deviation — Correct Answer:'}
                </div>
                {!isCorrect && (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px', fontWeight: 600 }}>
                    → {question.options[question.correctIndex]}
                  </p>
                )}
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Question Card */}
        <div style={{ margin: '20px 32px', flex: 1 }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '24px',
            }}
          >
            {/* Question Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                {currentQ + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {question.category}
              </span>
              {question.difficulty && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background:
                      question.difficulty === 'hard'
                        ? 'rgba(239,68,68,0.1)'
                        : question.difficulty === 'medium'
                        ? 'rgba(249,115,22,0.1)'
                        : 'rgba(16,185,129,0.1)',
                    color:
                      question.difficulty === 'hard'
                        ? '#ef4444'
                        : question.difficulty === 'medium'
                        ? '#f97316'
                        : '#10b981',
                    textTransform: 'uppercase',
                  }}
                >
                  {question.difficulty}
                </span>
              )}
            </div>

            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: 20 }}>
              {question.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {question.options.map((opt, i) => {
                const isSelected = selectedOption === i
                const isRight = submitted && i === question.correctIndex
                const isWrong = submitted && i === selectedOption && !isCorrect

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedOption(i)}
                    disabled={submitted}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: `2px solid ${
                        isRight
                          ? '#10b981'
                          : isWrong
                          ? '#ef4444'
                          : isSelected
                          ? '#f97316'
                          : '#e2e8f0'
                      }`,
                      background: isRight
                        ? 'rgba(16,185,129,0.06)'
                        : isWrong
                        ? 'rgba(239,68,68,0.06)'
                        : isSelected
                        ? 'rgba(249,115,22,0.06)'
                        : '#ffffff',
                      cursor: submitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: isRight
                          ? '#10b981'
                          : isWrong
                          ? '#ef4444'
                          : isSelected
                          ? '#f97316'
                          : '#e2e8f0',
                        color: isRight || isWrong || isSelected ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        flexShrink: 0,
                        fontFamily: 'monospace',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isRight ? <CheckCircle2 size={14} /> : isWrong ? <XCircle size={14} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: isRight || isSelected ? 600 : 400,
                        color: isRight ? '#065f46' : isWrong ? '#7f1d1d' : '#1e293b',
                        lineHeight: 1.4,
                      }}
                    >
                      {opt}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            padding: '16px 32px 28px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            flexShrink: 0,
          }}
        >
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              style={{
                padding: '13px 28px',
                borderRadius: 12,
                background:
                  selectedOption === null
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: selectedOption === null ? '#94a3b8' : '#ffffff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: selectedOption !== null ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={15} />
              Submit Analysis
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                padding: '13px 28px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              }}
            >
              {isLastQ ? (
                <>
                  <Target size={15} /> View Assessment Summary
                </>
              ) : (
                <>
                  Next Question <ChevronRight size={15} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Summary Screen ────────────────────────────────────────────────────────────

function SummaryScreen({
  questions,
  answers,
  scenario,
  onContinue,
  totalCorrect,
}: {
  questions: AgenticQuestion[]
  answers: boolean[]
  scenario: Scenario
  onContinue: () => void
  totalCorrect: number
}) {
  const percentage = Math.round((totalCorrect / questions.length) * 100)
  const passed = percentage >= 67

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      {/* Score Banner */}
      <div
        style={{
          borderRadius: 20,
          padding: '32px',
          background: passed
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.04) 100%)',
          border: `1px solid ${passed ? 'rgba(16,185,129,0.25)' : 'rgba(249,115,22,0.25)'}`,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 900, color: passed ? '#10b981' : '#f97316', lineHeight: 1 }}>
          {percentage}%
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
          {passed ? 'Hazard Awareness Verified' : 'Review Recommended'}
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          {totalCorrect} of {questions.length} critical assessments correct
        </div>
      </div>

      {/* Question Review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {questions.map((q, i) => (
          <div
            key={i}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              border: `1px solid ${answers[i] ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              background: answers[i] ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: answers[i] ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {answers[i] ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                Q{i + 1}: {q.category}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {answers[i] ? 'Correct assessment' : `Correct: ${q.options[q.correctIndex].slice(0, 60)}...`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advisor note */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: '#0f172a',
          border: '1px solid rgba(249,115,22,0.2)',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 28,
        }}
      >
        <Sparkles size={16} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
          {passed
            ? `Strong situational awareness confirmed for ${scenario.title}. Proceeding to the live 3D simulation where you'll apply these decisions in real-time.`
            : `Some gaps in hazard awareness detected. The 3D simulation ahead will give you hands-on practice. Focus on the protocols from the questions you missed.`}
        </p>
      </div>

      <button
        onClick={onContinue}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#ffffff',
          border: 'none',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
        }}
      >
        Enter 3D Simulation <ArrowRight size={16} />
      </button>
    </div>
  )
}
