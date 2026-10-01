'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Play,
  CheckCircle2,
  Clock,
  Search,
  Boxes,
  Shield,
  Zap,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1360, margin: '0 auto' }}>
      {/* ── Top Header & Filter Strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            3D Training Simulations
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Interactive 3D simulation modules with AI guidance, OSHA hazard identification, and verified credentials.
          </p>
        </div>

        {/* Filter & Search Bar */}
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
              placeholder="Search 3D drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: '#0f172a',
                width: 140,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 999,
              padding: 3,
              border: '1px solid #edf2f7',
            }}
          >
            {[
              { id: 'all', label: 'All 3D Drills' },
              { id: 'high', label: 'High Severity' },
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
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Minimalist 3D Scenario Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
        {filtered.map((scenario) => (
          <div
            key={scenario.id}
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f6',
              borderRadius: 18,
              padding: 22,
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#fed7aa'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#eef2f6'
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    padding: '3px 9px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#ea580c',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                  }}
                >
                  {scenario.severity.toUpperCase()} PRIORITY
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(15, 23, 42, 0.06)',
                    color: '#0f172a',
                  }}
                >
                  <Boxes size={11} color="#ea580c" />
                  <span>3D Simulation</span>
                </span>
              </div>

              {/* Title & Description */}
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3 }}>
                {scenario.title}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 14px' }}>
                {scenario.description}
              </p>

              {/* Info Metrics */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <Clock size={12} color="#94a3b8" />
                  <span>{scenario.estimatedDuration} mins</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={12} color="#16a34a" />
                  <span>{scenario.learningObjectives.length} Checkpoints</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <Shield size={12} color="#ea580c" />
                  <span>{scenario.hazards.length} Hazards</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div style={{ paddingTop: 12, borderTop: '1px solid #f1f4f8' }}>
              <Link
                href={`/dashboard/training/${scenario.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Play size={13} fill="#ffffff" />
                <span>Launch 3D Simulation</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
