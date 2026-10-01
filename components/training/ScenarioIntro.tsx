'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Scenario } from '@/types'
import {
  Shield,
  Target,
  AlertTriangle,
  Play,
  ArrowLeft,
  Lock,
  Clock,
  CheckCircle2,
  Boxes,
  Zap,
} from 'lucide-react'

interface Props {
  scenario: Scenario
  onStart: () => void
}

export function ScenarioIntro({ scenario, onStart }: Props) {
  const [showReadinessModal, setShowReadinessModal] = useState(false)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Top Header Return Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link
          href="/dashboard/training"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            color: '#64748b',
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0f172a'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <ArrowLeft size={15} /> Back to Catalog
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(249, 115, 22, 0.1)',
              color: '#ea580c',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              textTransform: 'uppercase',
            }}
          >
            {scenario.severity} Priority
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 999,
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            OSHA 1910 Standard
          </span>
        </div>
      </div>

      {/* Scenario Title & Overview Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #eef2f6',
          padding: '28px 30px',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Interactive 3D Curriculum
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          {scenario.title}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          {scenario.description}
        </p>
      </div>

      {/* 2-Column Specs: Learning Objectives & Critical Hazards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 18,
          marginBottom: 20,
        }}
      >
        {/* Learning Objectives */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #eef2f6',
            padding: '24px 26px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 16,
            }}
          >
            <Target size={15} color="#ea580c" />
            <span>Learning Objectives</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scenario.learningObjectives.map((obj, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#0f172a',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Hazards In Scenario */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #eef2f6',
            padding: '24px 26px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 16,
            }}
          >
            <Shield size={15} color="#ea580c" />
            <span>Hazard Identifications</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scenario.hazards.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#0f172a',
                    marginBottom: 3,
                  }}
                >
                  {h.label}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  {h.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Stage Training Curriculum Flow */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #eef2f6',
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Session Workflow
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          {[
            { step: '1', name: 'Incident Study' },
            { step: '2', name: 'AI Assessment' },
            { step: '3', name: '3D Simulation' },
            { step: '4', name: 'Correct Protocol' },
            { step: '5', name: 'Final Quiz' },
            { step: '6', name: 'Certification' },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: '#f8fafc',
                border: '1px solid #edf2f7',
                borderRadius: 10,
                padding: '10px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Stage {item.step}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onStart}
          style={{
            padding: '13px 36px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Play size={15} fill="#ffffff" />
          <span>Begin Training Session</span>
        </button>
      </div>
    </div>
  )
}
