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
  Volume2,
  Clock,
  CheckCircle2,
  Sparkles,
  PauseCircle,
  X,
} from 'lucide-react'

interface Props {
  scenario: Scenario
  onStart: () => void
}

export function ScenarioIntro({ scenario, onStart }: Props) {
  const [showReadinessModal, setShowReadinessModal] = useState(false)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 60px' }}>
      {/* Top Header Return Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
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
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
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
          <ArrowLeft size={15} /> Exit to Training Catalog
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 999,
              background: scenario.severity === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              color: scenario.severity === 'high' ? '#dc2626' : '#d97706',
              border: `1px solid ${scenario.severity === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}
          >
            {scenario.severity.toUpperCase()} RISK SCENARIO
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 999,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            OSHA 1910.178
          </span>
        </div>
      </div>

      {/* Severity banner */}
      <div
        style={{
          padding: '16px 20px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 14,
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(249, 115, 22, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412', marginBottom: 2 }}>
            High-Stakes Workplace Drill
          </div>
          <div style={{ fontSize: 13, color: '#c2410c', lineHeight: 1.4 }}>
            This simulation tests real-time hazard detection and pedestrian-vehicle compliance under pressure.
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 10 }}>
        {scenario.title}
      </h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
        {scenario.description}
      </p>

      {/* Learning objectives */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          <Target size={15} color="#f97316" />
          Key Learning Objectives
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenario.learningObjectives.map((obj, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ea580c',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                {obj}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hazards */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={15} color="#ef4444" />
          Critical Hazards In This Scenario
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenario.hazards.map((h) => (
            <div
              key={h.id}
              style={{
                padding: '16px 18px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#dc2626',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                {h.label}
              </div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                {h.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training flow */}
      <div
        style={{
          padding: '18px 24px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Simulated Drill Architecture
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
          {[
            'Incident Video Analysis', '→', 'AI Scenario Debrief', '→', '3D Walkway Simulation', '→',
            'Hazard Target ID', '→', 'Decision Dilemma', '→', 'Benchmark Video', '→', 'OSHA Quiz', '→', 'Certification'
          ].map((step, i) => (
            <span
              key={i}
              style={{
                color: step === '→' ? '#94a3b8' : '#1e293b',
                fontWeight: step !== '→' ? 600 : 400,
                background: step !== '→' ? '#ffffff' : 'transparent',
                padding: step !== '→' ? '4px 10px' : '0',
                borderRadius: 999,
                border: step !== '→' ? '1px solid #e2e8f0' : 'none',
              }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Start button trigger */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="sg-btn sg-btn-primary"
          style={{
            fontSize: 15,
            padding: '14px 34px',
            borderRadius: 999,
            gap: 10,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => setShowReadinessModal(true)}
        >
          <Play size={16} fill="#ffffff" />
          Begin Training Session
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
          <Clock size={15} color="#94a3b8" />
          <span>Estimated time: <strong>{scenario.estimatedDuration} minutes</strong></span>
        </div>
      </div>

      {/* ── Pre-Simulation Readiness Confirmation Modal ── */}
      {showReadinessModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
              padding: '32px 32px 28px',
              position: 'relative',
              animation: 'fadeScaleIn 0.2s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowReadinessModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.2) 100%)',
                border: '1px solid rgba(249,115,22,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                marginBottom: 20,
              }}
            >
              <Shield size={28} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Confirm Simulation Readiness
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              You are launching <strong>{scenario.title}</strong>. Once started, this simulation enters <strong>Locked Focus Mode</strong> to evaluate your real-time decision making.
            </p>

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: '16px 18px', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                <Lock size={15} color="#ea580c" />
                <span><strong>Locked In:</strong> External navigation is disabled during the active run.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                <Volume2 size={15} color="#ea580c" />
                <span><strong>Audio Required:</strong> Turn sound on for machinery horns & vehicle beepers.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                <PauseCircle size={15} color="#ea580c" />
                <span><strong>Pause Support:</strong> You can pause anytime via the on-screen button or <code>[Space]</code>.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowReadinessModal(false)
                  onStart()
                }}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Play size={15} fill="#ffffff" /> I&apos;m Ready — Start Drill
              </button>
              <button
                onClick={() => setShowReadinessModal(false)}
                style={{
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

