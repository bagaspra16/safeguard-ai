'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Cpu,
  Glasses,
  AlertTriangle,
  Zap,
  Filter,
  Search,
  ArrowRight,
  Boxes,
  Shield,
} from 'lucide-react'
import { ALL_SCENARIOS } from '@/lib/scenarios/data'

export default function TrainingPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = ALL_SCENARIOS.filter((s) => {
    if (filterType !== 'all' && s.severity !== filterType) return false
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1360, margin: '0 auto' }}>
      {/* ── Top Header & Filter Strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Training Simulation Library
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Select an OSHA-certified interactive safety scenario to start your immersion drill.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 999,
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            }}
          >
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: '#0f172a',
                width: 130,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              background: '#f3f5f9',
              borderRadius: 999,
              padding: 3,
              border: '1px solid #edf2f7',
            }}
          >
            {[
              { id: 'all', label: 'All Drills' },
              { id: 'high', label: 'High Risk' },
              { id: 'medium', label: 'Medium' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filterType === tab.id ? '#0f172a' : 'transparent',
                  color: filterType === tab.id ? '#ffffff' : '#64748b',
                  boxShadow: filterType === tab.id ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scenario Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {filtered.map((scenario) => (
          <div
            key={scenario.id}
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 18,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div>
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background:
                      scenario.severity === 'high' || scenario.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(249, 115, 22, 0.1)',
                    color:
                      scenario.severity === 'high' || scenario.severity === 'critical'
                        ? '#dc2626'
                        : '#ea580c',
                    border: `1px solid ${
                      scenario.severity === 'high' || scenario.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(249, 115, 22, 0.2)'
                    }`,
                  }}
                >
                  {scenario.severity.toUpperCase()} RISK
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#0284c7',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    3D Simulation
                  </span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: '#7c3aed',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    WebXR Ready
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.3 }}>
                {scenario.title}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                {scenario.description}
              </p>

              {/* Metrics Pill Row */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <Clock size={13} color="#94a3b8" />
                  <span>{scenario.estimatedDuration} mins</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={13} color="#16a34a" />
                  <span>{scenario.learningObjectives.length} Objectives</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <Shield size={13} color="#f97316" />
                  <span>{scenario.hazards.length} Hazards</span>
                </div>
              </div>

              {/* Hazard Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {scenario.hazards.map((h) => (
                  <span
                    key={h.id}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      fontSize: 11,
                      color: '#dc2626',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={11} /> {h.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTA Row */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid #f1f4f8' }}>
              <Link
                href={`/dashboard/training/${scenario.id}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 18px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                  transition: 'all 0.15s',
                }}
              >
                <Play size={14} fill="#ffffff" /> Begin Simulation
              </Link>
            </div>
          </div>
        ))}

        {/* Coming Soon Teasers */}
        {['Chemical Hazard Containment', 'High-Voltage Breaker (LOTO)', 'Confined Space Extraction'].map((title) => (
          <div
            key={title}
            style={{
              background: '#fbfcfd',
              border: '1px dashed #cbd5e1',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.75,
            }}
          >
            <div>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: '#f1f5f9',
                  color: '#64748b',
                }}
              >
                In Production (SIVS v1.0)
              </span>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#334155', margin: '14px 0 6px' }}>{title}</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Enterprise scenario module currently in automated 360° generative synthesis.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
