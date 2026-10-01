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
  Flame,
  Shield,
  Layers,
} from 'lucide-react'

const CHART_DATA = [
  { month: 'Jan', safe: 70, hazard: 30 },
  { month: 'Feb', safe: 78, hazard: 22 },
  { month: 'Mar', safe: 65, hazard: 35 },
  { month: 'Apr', safe: 88, hazard: 18 },
  { month: 'May', safe: 82, hazard: 25 },
  { month: 'Jun', safe: 94, hazard: 12 },
  { month: 'Jul', safe: 89, hazard: 16 },
  { month: 'Aug', safe: 96, hazard: 10 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1360, margin: '0 auto' }}>
      {/* ── Top Header Strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Workforce Safety Analytics & OSHA Reports
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Aggregated behavioral metrics, hazard reaction velocity, and OSHA compliance tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: '#f3f5f9',
              borderRadius: 999,
              padding: 3,
              border: '1px solid #edf2f7',
            }}
          >
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: timeRange === r ? '#0f172a' : 'transparent',
                  color: timeRange === r ? '#ffffff' : '#64748b',
                  boxShadow: timeRange === r ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
                  transition: 'all 0.15s',
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
              padding: '9px 18px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* ── 4 KPI Bento Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Avg. Safety Pass Rate</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowUpRight size={14} /> +4.2%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#16a34a', marginBottom: 4 }}>91.4%</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Target standard: 85.0%</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Mean Reaction Time</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowDownRight size={14} /> -0.8s
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7', marginBottom: 4 }}>1.9s</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Hazard recognition speed</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Simulations Run</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowUpRight size={14} /> +18%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>1,482</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Across 14 facility zones</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Near-Miss Reduction</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
              <ArrowDownRight size={14} /> -42%
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#f97316', marginBottom: 4 }}>-42.8%</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Post-training incident drop</div>
        </div>
      </div>

      {/* ── Main Dual-Column Analysis Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Module Performance Breakdown */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Scenario Performance Breakdown</h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Comprehension & 3D reaction rates by module</span>
            </div>
            <BarChart3 size={18} color="#f97316" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Forklift Blind Corner Collision', passRate: 94, sessions: 620, color: '#16a34a' },
              { label: 'Hazardous Acid Spill Containment', passRate: 88, sessions: 340, color: '#f97316' },
              { label: 'High-Voltage Breaker (LOTO)', passRate: 82, sessions: 280, color: '#ea580c' },
              { label: 'Elevated Scaffold & Harness Check', passRate: 89, sessions: 242, color: '#16a34a' },
            ].map((mod) => (
              <div key={mod.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{mod.label}</span>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>
                    {mod.passRate}% <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>({mod.sessions} runs)</span>
                  </span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${mod.passRate}%`,
                      background: mod.color,
                      borderRadius: 999,
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
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Frequent Procedural Violations</h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>AI-detected failure modes during 3D simulations</span>
            </div>
            <ShieldAlert size={18} color="#dc2626" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                violation: 'Premature Intersection Crossing',
                desc: 'Stepping past perimeter racking line prior to full vehicle stop',
                rate: '14.2%',
                severity: 'Critical',
              },
              {
                violation: 'Omission of Zero-Energy Verification',
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
                  padding: '12px 16px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.violation}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{v.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#dc2626' }}>{v.rate}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
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
