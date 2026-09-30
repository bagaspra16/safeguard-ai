'use client'

import Link from 'next/link'
import { BookOpen, Play, CheckCircle, Clock, Cpu, Glasses, AlertTriangle } from 'lucide-react'
import { ALL_SCENARIOS } from '@/lib/scenarios/data'

export default function TrainingPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <BookOpen size={20} style={{ color: 'var(--sg-accent)' }} />
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Training Library</h1>
        </div>
        <p style={{ color: 'var(--sg-text-secondary)', fontSize: 14 }}>
          Select a safety scenario to begin your training session.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {ALL_SCENARIOS.map((scenario) => (
          <div key={scenario.id} className="sg-surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`sg-badge ${scenario.severity === 'high' || scenario.severity === 'critical' ? 'sg-badge-hazard' : 'sg-badge-warning'}`}>
                {scenario.severity.toUpperCase()} RISK
              </span>
              <span className="sg-badge sg-badge-info">3D Simulation</span>
              <span className="sg-badge sg-badge-vr">WebXR Available</span>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{scenario.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.5 }}>{scenario.description}</p>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--sg-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                {scenario.estimatedDuration} min
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Cpu size={12} />
                {scenario.environment}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} />
                {scenario.learningObjectives.length} objectives
              </div>
            </div>

            {/* Hazards */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Hazards
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {scenario.hazards.map((h) => (
                  <span key={h.id} style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--sg-hazard-bg)', border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: 11, color: 'var(--sg-hazard)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <AlertTriangle size={11} /> {h.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--sg-bg-elevated)',
              borderRadius: 6, border: '1px solid var(--sg-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>Status</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-accent)' }}>Not Started</span>
            </div>

            {/* CTA */}
            <Link
              href={`/dashboard/training/${scenario.id}`}
              className="sg-btn sg-btn-primary"
              style={{ justifyContent: 'center', gap: 8 }}
            >
              <Play size={14} />
              Begin Training
            </Link>
          </div>
        ))}

        {/* Placeholder coming soon */}
        {['Chemical Safety', 'Electrical Safety', 'Working at Heights'].map((title) => (
          <div key={title} className="sg-surface" style={{ padding: '24px', opacity: 0.4 }}>
            <div className="sg-badge sg-badge-info" style={{ marginBottom: 16 }}>Coming Soon</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--sg-text-secondary)' }}>{title}</h2>
            <p style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>
              Additional scenarios are in development. Use the AI Scenario Generator to create custom training content.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
