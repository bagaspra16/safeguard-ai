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
  Shield,
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
    "Analyzing the incident footage now. I am detecting three critical safety checkpoints in this collision scenario.",
    "Your situational awareness at warehouse intersections will be assessed. Forklift operators and pedestrians share the same visibility limits.",
    "Ready to evaluate your understanding of pedestrian vehicle separation protocols.",
  ],
  'industrial-fire-005': [
    "Fire dynamics analysis complete. The incident shows procedural breakdown during early response.",
    "I will evaluate your knowledge of emergency response protocols for Class B industrial solvent fires.",
    "Consider the RACE framework as you answer. These questions reflect real OSHA fire safety standards.",
  ],
  'construction-fall-006': [
    "Fall protection analysis complete. At elevated heights, disconnecting both lanyards creates catastrophic fall risk.",
    "I will evaluate your understanding of continuous 100% tie-off requirements at elevated work surfaces.",
    "OSHA 1926.502 mandates 100% fall protection above 6 feet. Your answers will be assessed against this standard.",
  ],
}

const CORRECT_RESPONSES = [
  "Correct. Your hazard assessment aligns directly with OSHA standard operating procedures.",
  "Confirmed. You correctly identified the certified mitigation protocol.",
  "Accurate. You pinpointed the core hazard requirement. Proceeding forward.",
]

const WRONG_RESPONSES = [
  "Deviation detected. Review the standard protocol explanation below.",
  "Incorrect selection. The safety standard requires a different procedure in this scenario.",
  "Protocol violation. Review the regulatory rationale before moving to the simulation.",
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
    }, 16)
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const intros = ADVISOR_INTROS[scenario.id] || ADVISOR_INTROS['forklift-blind-corner-001']
    const intro = intros[0] || "Let us assess your understanding of this safety incident."
    setAdvisorText(intro)
    setTimeout(() => {
      startTyping(intro)
      setAdvisorState('guiding')
    }, 400)
  }, [scenario.id])

  const handleSubmit = () => {
    if (selectedOption === null) return
    const correct = selectedOption === question.correctIndex
    setSubmitted(true)
    setAllAnswers((prev) => [...prev, correct])
    addEvent(correct ? 'correct_action' : 'wrong_action', `agentic-q${currentQ}`)

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
      const intros = ADVISOR_INTROS[scenario.id] || ADVISOR_INTROS['forklift-blind-corner-001']
      const nextIntro = intros[currentQ + 1] || `Question ${currentQ + 2} of ${questions.length}.`
      setCurrentQ((prev) => prev + 1)
      setSelectedOption(null)
      setSubmitted(false)
      setAdvisorState('thinking')
      setTimeout(() => {
        setAdvisorText(nextIntro)
        startTyping(nextIntro)
        setAdvisorState('guiding')
      }, 300)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '16px 28px',
          borderBottom: '1px solid #eef2f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(249,115,22,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}
          >
            <Brain size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Hazard Assessment
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{scenario.title}</div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentQ ? 22 : 8,
                height: 6,
                borderRadius: 999,
                background:
                  i < currentQ
                    ? allAnswers[i]
                      ? '#16a34a'
                      : '#dc2626'
                    : i === currentQ
                    ? '#f97316'
                    : '#e2e8f0',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, fontWeight: 600 }}>
            {currentQ + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '20px 28px' }}>
        {/* Advisor Guidance Card */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={16} color="#f97316" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sentinel AI Guidance
              </span>
              {advisorState === 'feedback_correct' && (
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                  Confirmed Correct
                </span>
              )}
              {advisorState === 'feedback_wrong' && (
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>
                  Protocol Deviation
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {advisorState === 'thinking' ? 'Evaluating scenario data...' : displayedText}
            </p>

            {/* Post-submit explanation */}
            {submitted && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 3 }}>
                  Regulatory Explanation
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Question & Options Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #eef2f6',
            borderRadius: 16,
            padding: '22px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  textTransform: 'uppercase',
                }}
              >
                {question.category}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Assessment Checkpoint {currentQ + 1}
              </span>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.4, margin: '0 0 18px' }}>
              {question.question}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {question.options.map((opt, i) => {
                const isSelected = selectedOption === i
                const isRight = submitted && i === question.correctIndex
                const isWrong = submitted && isSelected && !isRight

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedOption(i)}
                    disabled={submitted}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: isRight
                        ? '#f0fdf4'
                        : isWrong
                        ? '#fef2f2'
                        : isSelected
                        ? '#fff7ed'
                        : '#ffffff',
                      border: `1px solid ${
                        isRight
                          ? '#86efac'
                          : isWrong
                          ? '#fca5a5'
                          : isSelected
                          ? '#f97316'
                          : '#e2e8f0'
                      }`,
                      cursor: submitted ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: isRight
                          ? '#16a34a'
                          : isWrong
                          ? '#dc2626'
                          : isSelected
                          ? '#f97316'
                          : '#f8fafc',
                        color: isRight || isWrong || isSelected ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        border: isRight || isWrong || isSelected ? 'none' : '1px solid #e2e8f0',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected || isRight ? 600 : 400,
                        color: isRight ? '#14532d' : isWrong ? '#7f1d1d' : '#0f172a',
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

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 18, marginTop: 18, borderTop: '1px solid #f1f4f8' }}>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                style={{
                  padding: '10px 24px',
                  borderRadius: 999,
                  background:
                    selectedOption === null
                      ? '#e2e8f0'
                      : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: selectedOption === null ? '#94a3b8' : '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: selectedOption !== null ? '0 4px 12px rgba(249,115,22,0.25)' : 'none',
                }}
              >
                <Zap size={14} />
                <span>Confirm Answer</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
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
                <span>{isLastQ ? 'View Summary' : 'Next Checkpoint'}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '36px 20px' }}>
      {/* Score Banner */}
      <div
        style={{
          borderRadius: 18,
          padding: '28px',
          background: '#ffffff',
          border: '1px solid #eef2f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, color: passed ? '#16a34a' : '#ea580c', lineHeight: 1 }}>
          {percentage}%
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
          {passed ? 'Assessment Completed' : 'Review Recommended'}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          {totalCorrect} of {questions.length} checkpoints verified
        </div>
      </div>

      {/* Question Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {questions.map((q, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #edf2f7',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: answers[i] ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {answers[i] ? <CheckCircle2 size={15} color="#16a34a" /> : <XCircle size={15} color="#dc2626" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                Checkpoint {i + 1}: {q.category}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {answers[i] ? 'Correctly identified' : `Correct protocol: ${q.options[q.correctIndex]}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#ffffff',
          border: 'none',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
        }}
      >
        <span>Proceed to 3D Simulation</span>
        <ArrowRight size={15} />
      </button>
    </div>
  )
}
