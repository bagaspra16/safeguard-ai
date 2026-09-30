'use client'

import type { Scenario } from '@/types'
import { Shield, Target, AlertTriangle, Play } from 'lucide-react'

interface Props {
  scenario: Scenario
  onStart: () => void
}

export function ScenarioIntro({ scenario, onStart }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      {/* Severity banner */}
      <div style={{
        padding: '12px 20px',
        background: 'var(--sg-hazard-bg)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 8, marginBottom: 32,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <AlertTriangle size={18} style={{ color: 'var(--sg-hazard)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--sg-hazard)', fontWeight: 500 }}>
          HIGH RISK SCENARIO — This training simulates a real workplace hazard. Pay close attention to all instructions.
        </span>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{scenario.title}</h1>
      <p style={{ fontSize: 16, color: 'var(--sg-text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
        {scenario.description}
      </p>

      {/* Learning objectives */}
      <div className="sg-surface" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
        }}>
          <Target size={14} />
          Learning Objectives
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenario.learningObjectives.map((obj, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--sg-accent-dim)', border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--sg-accent)', flexShrink: 0, marginTop: 1,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14, color: 'var(--sg-text-secondary)', lineHeight: 1.5 }}>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hazards */}
      <div className="sg-surface" style={{ padding: '24px', marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
        }}>
          <AlertTriangle size={14} />
          Identified Hazards
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenario.hazards.map((h) => (
            <div key={h.id} style={{
              padding: '14px 16px',
              background: 'var(--sg-hazard-bg)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 6,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sg-hazard)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> {h.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.5 }}>
                {h.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training flow */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--sg-bg-elevated)',
        border: '1px solid var(--sg-border)',
        borderRadius: 8, marginBottom: 32,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Training Flow
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
          {[
            'Incident Video', '→', 'AI Question', '→', '3D Simulation', '→',
            'Hazard Detection', '→', 'Decision', '→', 'Safe Response Video', '→', 'Quiz', '→', 'Results'
          ].map((step, i) => (
            <span key={i} style={{
              color: step === '→' ? 'var(--sg-text-muted)' : 'var(--sg-text-secondary)',
              fontWeight: step !== '→' ? 500 : 400,
            }}>
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Start button */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: '14px 32px', gap: 10 }} onClick={onStart}>
          <Play size={16} />
          Begin Training Session
        </button>
        <span style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>
          Estimated time: {scenario.estimatedDuration} minutes
        </span>
      </div>
    </div>
  )
}
