'use client'

import { useState } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import {
  FORKLIFT_QUIZ_QUESTIONS,
  FIRE_QUIZ_QUESTIONS,
  CONSTRUCTION_FALL_QUIZ_QUESTIONS,
} from '@/lib/scenarios/data'
import { Brain, CheckCircle, XCircle, ChevronRight, Zap } from 'lucide-react'

interface Props {
  scenario: Scenario
  onComplete: () => void
}

export function QuizPhase({ scenario, onComplete }: Props) {
  const currentQuestionIndex = useSimulationStore((s) => s.currentQuestionIndex)
  const submitQuizAnswer = useSimulationStore((s) => s.submitQuizAnswer)
  const nextQuestion = useSimulationStore((s) => s.nextQuestion)
  const setScore = useSimulationStore((s) => s.setScore)
  const quizAnswers = useSimulationStore((s) => s.quizAnswers)
  const addEvent = useSimulationStore((s) => s.addEvent)

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now())

  const questions = (() => {
    if (scenario.id === 'industrial-fire-005' || scenario.category === 'fire_safety') {
      return FIRE_QUIZ_QUESTIONS
    }
    if (
      scenario.id === 'construction-fall-006' ||
      scenario.id === 'fall-protection-004' ||
      scenario.category === 'construction_safety'
    ) {
      return CONSTRUCTION_FALL_QUIZ_QUESTIONS
    }
    return FORKLIFT_QUIZ_QUESTIONS
  })()

  const currentQ = questions[currentQuestionIndex] || questions[0]
  const totalQ = questions.length
  const isLast = currentQuestionIndex === totalQ - 1

  const handleSubmit = () => {
    if (selectedOption === null) return
    const timeMs = Date.now() - questionStartTime
    const correct = selectedOption === currentQ.correctIndex

    submitQuizAnswer({
      questionId: currentQ.id,
      selectedIndex: selectedOption,
      correct,
      timeMs,
    })

    addEvent(correct ? 'correct_action' : 'wrong_action', `quiz-q${currentQuestionIndex}`)
    setSubmitted(true)
  }

  const handleNext = () => {
    setSelectedOption(null)
    setSubmitted(false)
    setQuestionStartTime(Date.now())

    if (isLast) {
      const allAnswers = [...quizAnswers]
      const currentAnswer = {
        questionId: currentQ.id,
        selectedIndex: selectedOption!,
        correct: selectedOption === currentQ.correctIndex,
        timeMs: Date.now() - questionStartTime,
      }
      const combined = [...allAnswers]
      const correctCount = combined.filter((a) => a.correct).length + (currentAnswer.correct ? 1 : 0)
      const score = Math.round((correctCount / totalQ) * 100)
      setScore(score)
      addEvent('assessment_completed', undefined, { score, correctCount, totalQ })
      onComplete()
    } else {
      nextQuestion()
    }
  }

  const progress = ((currentQuestionIndex + 1) / totalQ) * 100

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
              Final Knowledge Evaluation
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{scenario.title}</div>
          </div>
        </div>

        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          Question {currentQuestionIndex + 1} of {totalQ}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 4, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f97316, #ea580c)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #eef2f6',
          padding: '24px 26px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#ea580c',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
          }}
        >
          Assessment Question {currentQuestionIndex + 1}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.5, margin: '0 0 20px' }}>
          {currentQ.question}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i
            const isRight = submitted && i === currentQ.correctIndex
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

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            <span>{isLast ? 'Complete & View Results' : 'Next Question'}</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
