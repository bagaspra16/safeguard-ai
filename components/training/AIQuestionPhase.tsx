'use client'

import { useState, useEffect, useRef } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { getAfterVideoQuestion } from '@/lib/scenarios/data'
import { AITrainerPanel } from './AITrainerPanel'
import { Bot, ChevronRight } from 'lucide-react'

interface Props {
  scenario: Scenario
  onContinue: () => void
}

export function AIQuestionPhase({ scenario, onContinue }: Props) {
  const afterVideoQuestion = getAfterVideoQuestion(scenario)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const addEvent = useSimulationStore((s) => s.addEvent)
  const addAIMessage = useSimulationStore((s) => s.addAIMessage)
  const setAIThinking = useSimulationStore((s) => s.setAIThinking)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    // Add AI opening message
    setAIThinking(true)
    setTimeout(() => {
      addAIMessage({
        role: 'assistant',
        content: `You've watched the ${scenario.title} incident video. Before we enter the active 3D simulation, I want to evaluate your hazard assessment. Please answer the question below.`,
        response: {
          type: 'quiz_question',
          message: afterVideoQuestion.question,
        },
      })
      setAIThinking(false)
    }, 800)
  }, [addAIMessage, setAIThinking, scenario.title, afterVideoQuestion.question])

  const handleSubmit = () => {
    if (selectedOption === null) return
    setSubmitted(true)
    const correct = selectedOption === afterVideoQuestion.correctIndex
    addEvent(correct ? 'correct_action' : 'wrong_action', 'ai-question-phase')
    addAIMessage({
      role: 'assistant',
      content: correct
        ? `Correct. ${afterVideoQuestion.explanation}`
        : `Not quite. The standard procedure is: "${afterVideoQuestion.options[afterVideoQuestion.correctIndex]}". ${afterVideoQuestion.explanation}`,
      response: {
        type: 'evaluation',
        message: correct ? 'Correct!' : 'Incorrect',
        correct,
        explanation: afterVideoQuestion.explanation,
      },
    })
  }

  const isCorrect = submitted && selectedOption === afterVideoQuestion.correctIndex

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Bot size={20} style={{ color: 'var(--sg-accent)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>AI Safety Instructor</h2>
      </div>
      <p style={{ color: 'var(--sg-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Your AI trainer is reviewing the incident with you. Answer the question below, then watch how the situation should have been handled.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Question panel */}
        <div>
          <div className="sg-surface" style={{ padding: '24px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bot size={14} /> AI Safety Assessment
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, lineHeight: 1.5 }}>
              {afterVideoQuestion.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {afterVideoQuestion.options.map((opt, i) => {
                let borderColor = 'var(--sg-border)'
                let bg = 'var(--sg-bg-elevated)'
                let color = 'var(--sg-text-secondary)'

                if (submitted) {
                  if (i === afterVideoQuestion.correctIndex) {
                    borderColor = 'rgba(34,197,94,0.5)'
                    bg = 'var(--sg-safe-bg)'
                    color = 'var(--sg-safe)'
                  } else if (i === selectedOption && !isCorrect) {
                    borderColor = 'rgba(239,68,68,0.5)'
                    bg = 'var(--sg-hazard-bg)'
                    color = 'var(--sg-hazard)'
                  }
                } else if (i === selectedOption) {
                  borderColor = 'rgba(245,158,11,0.5)'
                  bg = 'var(--sg-accent-dim)'
                  color = 'var(--sg-accent)'
                }

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedOption(i)}
                    disabled={submitted}
                    style={{
                      background: bg, border: `1px solid ${borderColor}`,
                      borderRadius: 8, padding: '14px 16px',
                      textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                      color, fontSize: 14, fontWeight: i === selectedOption || (submitted && i === afterVideoQuestion.correctIndex) ? 600 : 400,
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ marginRight: 10, opacity: 0.6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
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
              <div style={{ fontWeight: 700, fontSize: 13, color: isCorrect ? 'var(--sg-safe)' : 'var(--sg-hazard)', marginBottom: 8 }}>
                {isCorrect ? 'Standard Procedure Confirmed' : 'Safety Deviation Identified'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.6 }}>
                {afterVideoQuestion.explanation}
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
              <button
                className="sg-btn sg-btn-primary"
                onClick={onContinue}
                style={{ gap: 8 }}
              >
                Watch Correct Procedure <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* AI Trainer panel */}
        <AITrainerPanel scenario={scenario} compact />
      </div>
    </div>
  )
}
