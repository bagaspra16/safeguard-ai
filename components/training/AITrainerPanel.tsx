'use client'

import { useState, useRef, useEffect } from 'react'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { Bot, Send, AlertTriangle, CheckCircle } from 'lucide-react'

interface Props {
  scenario: Scenario
  compact?: boolean
}

export function AITrainerPanel({ scenario, compact }: Props) {
  const aiMessages = useSimulationStore((s) => s.aiMessages)
  const isAIThinking = useSimulationStore((s) => s.isAIThinking)
  const addAIMessage = useSimulationStore((s) => s.addAIMessage)
  const setAIThinking = useSimulationStore((s) => s.setAIThinking)
  const phase = useSimulationStore((s) => s.phase)

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, isAIThinking])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const userMessage = input.trim()
    setInput('')
    setSending(true)

    addAIMessage({ role: 'user', content: userMessage })
    setAIThinking(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          scenarioId: scenario.id,
          phase,
        }),
      })

      if (!response.ok) throw new Error('AI service error')
      const data = await response.json()

      addAIMessage({
        role: 'assistant',
        content: data.message,
        response: data,
      })
    } catch {
      addAIMessage({
        role: 'assistant',
        content: 'AI service temporarily unavailable. Please continue with the simulation.',
      })
    } finally {
      setAIThinking(false)
      setSending(false)
    }
  }

  const getSeverityIcon = (type?: string, correct?: boolean | null) => {
    if (correct === true) return <CheckCircle size={12} style={{ color: 'var(--sg-safe)', flexShrink: 0 }} />
    if (correct === false) return <AlertTriangle size={12} style={{ color: 'var(--sg-hazard)', flexShrink: 0 }} />
    return <Bot size={12} style={{ color: 'var(--sg-accent)', flexShrink: 0 }} />
  }

  const height = compact ? 400 : 500

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height,
      background: 'var(--sg-bg-surface)',
      border: '1px solid var(--sg-border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--sg-border)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--sg-bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--sg-accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={14} style={{ color: 'var(--sg-accent)' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>AI Safety Instructor</div>
          <div style={{ fontSize: 10, color: 'var(--sg-text-muted)' }}>
            {isAIThinking ? (
              <span className="sg-ai-thinking">Thinking...</span>
            ) : (
              `Scenario: ${scenario.title}`
            )}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isAIThinking ? 'var(--sg-warning)' : 'var(--sg-safe)',
          }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {aiMessages.length === 0 && !isAIThinking && (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: 'var(--sg-text-muted)', fontSize: 12,
          }}>
            <Bot size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            Your AI instructor is ready.<br />Ask any question about this scenario.
          </div>
        )}

        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 8, alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--sg-accent-dim)', flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {getSeverityIcon(msg.response?.type, msg.response?.correct)}
              </div>
            )}

            <div style={{
              maxWidth: '85%',
              padding: '10px 12px',
              borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: msg.role === 'user'
                ? 'var(--sg-accent-dim)'
                : msg.response?.correct === true
                  ? 'rgba(34,197,94,0.08)'
                  : msg.response?.correct === false
                    ? 'rgba(239,68,68,0.08)'
                    : 'var(--sg-bg-elevated)',
              border: `1px solid ${msg.role === 'user'
                ? 'rgba(245,158,11,0.2)'
                : msg.response?.correct === true
                  ? 'rgba(34,197,94,0.2)'
                  : msg.response?.correct === false
                    ? 'rgba(239,68,68,0.2)'
                    : 'var(--sg-border)'}`,
              fontSize: 13, lineHeight: 1.6,
              color: msg.role === 'user' ? 'var(--sg-accent)' : 'var(--sg-text-secondary)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isAIThinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--sg-accent-dim)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={12} style={{ color: 'var(--sg-accent)' }} />
            </div>
            <div style={{
              padding: '10px 14px',
              background: 'var(--sg-bg-elevated)',
              border: '1px solid var(--sg-border)',
              borderRadius: '10px 10px 10px 2px',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--sg-accent)',
                    animation: `sg-pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--sg-border)',
        display: 'flex', gap: 8, flexShrink: 0,
        background: 'var(--sg-bg-elevated)',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask the AI instructor..."
          disabled={sending || isAIThinking}
          style={{
            flex: 1, background: 'var(--sg-bg-base)',
            border: '1px solid var(--sg-border)',
            borderRadius: 6, padding: '8px 12px',
            fontSize: 13, color: 'var(--sg-text-primary)',
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || isAIThinking}
          style={{
            background: 'var(--sg-accent)', border: 'none',
            borderRadius: 6, padding: '8px 12px',
            cursor: 'pointer', color: '#000', flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
