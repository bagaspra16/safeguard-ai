'use client'

import { useState } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { FORKLIFT_QUIZ_QUESTIONS } from '@/lib/scenarios/data'
import { Brain, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

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
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  const questions = FORKLIFT_QUIZ_QUESTIONS
  const currentQ = questions[currentQuestionIndex]
  const totalQ = questions.length
  const isLast = currentQuestionIndex === totalQ - 1
  const isCorrect = submitted && selectedOption === currentQ.correctIndex

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
      // Calculate score
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

  const progress = ((currentQuestionIndex) / totalQ) * 100

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Brain size={20} style={{ color: 'var(--sg-info)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Knowledge Check</h2>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--sg-text-muted)' }}>
          {currentQuestionIndex + 1} / {totalQ}
        </span>
      </div>

      {/* Progress */}
      <div className="sg-progress-bar" style={{ marginBottom: 32 }}>
        <div
          className="sg-progress-fill"
          style={{ width: `${progress}%`, background: 'var(--sg-info)' }}
        />
      </div>

      {/* Question */}
      <div className="sg-surface" style={{ padding: '28px', marginBottom: 20 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--sg-info)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
        }}>
          Question {currentQuestionIndex + 1}
        </div>
        <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginBottom: 28 }}>
          {currentQ.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQ.options.map((opt, i) => {
            let style: React.CSSProperties = {
              background: 'var(--sg-bg-elevated)',
              border: '1px solid var(--sg-border)',
              borderRadius: 8, padding: '14px 16px',
              textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
              fontSize: 14, fontFamily: 'inherit',
              color: 'var(--sg-text-secondary)',
              transition: 'all 0.15s', width: '100%',
            }

            if (submitted) {
              if (i === currentQ.correctIndex) {
                style = { ...style, background: 'var(--sg-safe-bg)', border: '1px solid rgba(34,197,94,0.5)', color: 'var(--sg-safe)', fontWeight: 600 }
              } else if (i === selectedOption) {
                style = { ...style, background: 'var(--sg-hazard-bg)', border: '1px solid rgba(239,68,68,0.5)', color: 'var(--sg-hazard)', fontWeight: 600 }
              }
            } else if (i === selectedOption) {
              style = { ...style, background: 'var(--sg-accent-dim)', border: '1px solid rgba(245,158,11,0.4)', color: 'var(--sg-accent)', fontWeight: 600 }
            }

            return (
              <button
                key={i}
                onClick={() => !submitted && setSelectedOption(i)}
                disabled={submitted}
                style={style}
              >
                <span style={{ marginRight: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, opacity: 0.6 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
                {submitted && i === currentQ.correctIndex && (
                  <CheckCircle size={14} style={{ marginLeft: 8, color: 'var(--sg-safe)', verticalAlign: 'middle' }} />
                )}
                {submitted && i === selectedOption && i !== currentQ.correctIndex && (
                  <XCircle size={14} style={{ marginLeft: 8, color: 'var(--sg-hazard)', verticalAlign: 'middle' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explanation */}
      {submitted && (
        <div style={{
          padding: '16px 20px',
          background: isCorrect ? 'var(--sg-safe-bg)' : 'var(--sg-hazard-bg)',
          border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 8, marginBottom: 20,
        }}>
          <div style={{
            fontWeight: 700, fontSize: 13, marginBottom: 8,
            color: isCorrect ? 'var(--sg-safe)' : 'var(--sg-hazard)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {isCorrect ? 'Correct' : 'Incorrect'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.6 }}>
            {currentQ.explanation}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {!submitted ? (
          <button
            className="sg-btn sg-btn-primary"
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <button className="sg-btn sg-btn-primary" onClick={handleNext} style={{ gap: 8 }}>
            {isLast ? 'See Results' : 'Next Question'}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
