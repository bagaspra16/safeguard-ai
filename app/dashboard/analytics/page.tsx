'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Eye,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Workforce Safety Analytics & Compliance</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--sg-text-secondary)', fontSize: 14 }}>
            Aggregated behavioral metrics, hazard reaction velocity, and OSHA compliance tracking across all facilities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--sg-bg-surface)',
              border: '1px solid var(--sg-border)',
              borderRadius: 8,
              padding: 2,
            }}
          >
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: timeRange === r ? 'var(--sg-accent-dim)' : 'transparent',
                  color: timeRange === r ? 'var(--sg-accent)' : 'var(--sg-text-secondary)',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'var(--sg-bg-surface)',
              border: '1px solid var(--sg-border)',
              color: 'var(--sg-text-primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Export OSHA Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)', fontWeight: 600 }}>Avg. Safety Pass Rate</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowUpRight size={14} /> +4.2%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginBottom: 4 }}>91.4%</div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>Target standard: 85.0%</div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)', fontWeight: 600 }}>Mean Reaction Time</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowDownRight size={14} /> -0.8s
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#38bdf8', marginBottom: 4 }}>1.9s</div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>Hazard recognition speed</div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)', fontWeight: 600 }}>Total Simulations Run</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowUpRight size={14} /> +18%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--sg-text-primary)', marginBottom: 4 }}>1,482</div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>Across 14 facility wings</div>
        </div>

        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)', fontWeight: 600 }}>Near-Miss Reduction</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowDownRight size={14} /> -42%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--sg-accent)', marginBottom: 4 }}>-42.8%</div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>Post-training incident drop</div>
        </div>
      </div>

      {/* Analytics Charts & Risk Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Module Performance Breakdown */}
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Scenario Performance Breakdown</h3>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>Comprehension & 3D reaction rates by module</span>
            </div>
            <BarChart3 size={18} color="var(--sg-accent)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Forklift Blind Corner Collision', passRate: 94, sessions: 620, risk: 'Low' },
              { label: 'Hazardous Acid Spill Containment', passRate: 88, sessions: 340, risk: 'Medium' },
              { label: 'High-Voltage Breaker (LOTO)', passRate: 82, sessions: 280, risk: 'High' },
              { label: 'Elevated Scaffold & Harness Tie-Off', passRate: 89, sessions: 242, risk: 'Low' },
            ].map((mod) => (
              <div key={mod.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{mod.label}</span>
                  <span style={{ color: 'var(--sg-text-secondary)', fontWeight: 700 }}>{mod.passRate}% ({mod.sessions} runs)</span>
                </div>
                <div style={{ height: 8, background: 'var(--sg-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${mod.passRate}%`,
                      background: mod.passRate >= 90 ? '#10b981' : mod.passRate >= 85 ? 'var(--sg-accent)' : '#ef4444',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hazard Recognition Errors */}
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Frequent Procedural Violations</h3>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>AI-detected failure modes during 3D simulations</span>
            </div>
            <ShieldAlert size={18} color="#ef4444" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                violation: 'Premature Intersection Crossing',
                desc: 'Stepping past perimeter racking line prior to full vehicle stop',
                rate: '14.2%',
                severity: 'Critical',
              },
              {
                violation: 'Omission of Multimeter Zero-Energy Verification',
                desc: 'Touching distribution terminal prior to calibrating tester',
                rate: '9.8%',
                severity: 'Critical',
              },
              {
                violation: 'Failure to Check Convex Mirror',
                desc: 'Entering shared traffic aisle without scanning overhead mirror',
                rate: '8.4%',
                severity: 'High',
              },
              {
                violation: 'Delayed Emergency Alarm Pull',
                desc: 'Attempting manual containment before alerting facility team',
                rate: '5.1%',
                severity: 'Medium',
              },
            ].map((v) => (
              <div
                key={v.violation}
                style={{
                  padding: '12px 14px',
                  background: 'var(--sg-bg-elevated)',
                  border: '1px solid var(--sg-border)',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sg-text-primary)' }}>{v.violation}</div>
                  <div style={{ fontSize: 11, color: 'var(--sg-text-secondary)', marginTop: 2 }}>{v.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{v.rate}</div>
                  <div style={{ fontSize: 10, color: 'var(--sg-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {v.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
