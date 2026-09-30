'use client'

import Link from 'next/link'
import { Shield, TrendingUp, Users, BookOpen, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react'

// Demo data
const METRICS = [
  { label: 'Total Employees', value: '48', icon: Users, color: 'var(--sg-info)', delta: '+3 this month' },
  { label: 'Active Trainings', value: '12', icon: BookOpen, color: 'var(--sg-accent)', delta: '4 due this week' },
  { label: 'Completion Rate', value: '87%', icon: CheckCircle, color: 'var(--sg-safe)', delta: '+5% vs last month' },
  { label: 'High-Risk Alerts', value: '3', icon: AlertTriangle, color: 'var(--sg-hazard)', delta: '2 unresolved' },
]

const RECENT_SESSIONS = [
  { employee: 'Alice Chen', scenario: 'Forklift Blind Corner', score: 94, status: 'completed', time: '12 min ago' },
  { employee: 'Marcus Webb', scenario: 'Forklift Blind Corner', score: 71, status: 'completed', time: '34 min ago' },
  { employee: 'Priya Sharma', scenario: 'Forklift Blind Corner', score: null, status: 'in_progress', time: '1 hr ago' },
  { employee: 'Tom Rodriguez', scenario: 'Forklift Blind Corner', score: 88, status: 'completed', time: '2 hr ago' },
  { employee: 'Fatima Al-Hassan', scenario: 'Forklift Blind Corner', score: 56, status: 'failed', time: '3 hr ago' },
]

const PERFORMANCE_BARS = [
  { label: 'Hazard Recognition', value: 92, color: 'var(--sg-safe)' },
  { label: 'Decision Accuracy', value: 78, color: 'var(--sg-accent)' },
  { label: 'Procedure Compliance', value: 85, color: 'var(--sg-info)' },
  { label: 'Quiz Accuracy', value: 81, color: 'var(--sg-vr)' },
]

function MetricCard({ label, value, icon: Icon, color, delta }: typeof METRICS[0]) {
  return (
    <div className="sg-surface" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `rgba(${color === 'var(--sg-info)' ? '59,130,246' : color === 'var(--sg-accent)' ? '245,158,11' : color === 'var(--sg-safe)' ? '34,197,94' : '239,68,68'},0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--sg-text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>{delta}</div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Shield size={20} style={{ color: 'var(--sg-accent)' }} />
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Safety Overview</h1>
        </div>
        <p style={{ color: 'var(--sg-text-secondary)', fontSize: 14 }}>
          Acme Warehouse Co. — All data reflects demo session activity.
        </p>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 32,
      }}>
        {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Active Scenario */}
        <div className="sg-surface" style={{ padding: '24px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            Featured Scenario
          </div>
          <div style={{
            background: 'var(--sg-bg-elevated)',
            border: '1px solid var(--sg-border)',
            borderRadius: 8, padding: 20, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="sg-badge sg-badge-hazard">HIGH RISK</div>
              <div className="sg-badge sg-badge-info">3D + WebXR</div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Forklift Blind Corner Collision</h3>
            <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Warehouse pedestrian-forklift separation training. Interactive 3D simulation with AI-guided hazard detection.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['Warehouse', '5 min', '5 Objectives', 'Mock Mode'].map((tag) => (
                <span key={tag} style={{
                  padding: '3px 8px', borderRadius: 4,
                  background: 'var(--sg-bg-overlay)', border: '1px solid var(--sg-border)',
                  fontSize: 11, color: 'var(--sg-text-secondary)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <Link href="/dashboard/training/forklift-blind-corner-001" className="sg-btn sg-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Start Training →
            </Link>
          </div>
          <div style={{ fontSize: 12, color: 'var(--sg-text-muted)', textAlign: 'center' }}>
            Full vertical slice available in demo mode
          </div>
        </div>

        {/* Performance bars */}
        <div className="sg-surface" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Team Performance
            </div>
            <Link href="/dashboard/analytics" style={{ fontSize: 12, color: 'var(--sg-accent)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          {PERFORMANCE_BARS.map((bar) => (
            <div key={bar.label} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{bar.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: bar.color }}>{bar.value}%</span>
              </div>
              <div className="sg-progress-bar">
                <div
                  className="sg-progress-fill"
                  style={{
                    width: `${bar.value}%`,
                    background: bar.color,
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 8, padding: '12px 16px',
            background: 'var(--sg-bg-elevated)',
            borderRadius: 6, border: '1px solid var(--sg-border)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--sg-text-muted)', marginBottom: 4 }}>Data source</div>
            <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>
              Based on 48 training sessions — Demo data for demonstration purposes.
            </div>
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="sg-surface" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent Training Sessions
          </div>
          <Link href="/dashboard/employees" style={{ fontSize: 12, color: 'var(--sg-accent)', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        <div>
          {RECENT_SESSIONS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 0',
              borderBottom: i < RECENT_SESSIONS.length - 1 ? '1px solid var(--sg-border)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--sg-bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--sg-accent)',
              }}>
                {s.employee.split(' ').map((n) => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.employee}</div>
                <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>{s.scenario}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {s.score !== null ? (
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: s.score >= 80 ? 'var(--sg-safe)' : s.score >= 60 ? 'var(--sg-warning)' : 'var(--sg-hazard)',
                  }}>
                    {s.score}%
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--sg-accent)' }}>In Progress</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>{s.time}</div>
              </div>
              <div>
                {s.status === 'completed' && <span className="sg-badge sg-badge-safe">Done</span>}
                {s.status === 'in_progress' && <span className="sg-badge sg-badge-warning">Active</span>}
                {s.status === 'failed' && <span className="sg-badge sg-badge-hazard">Retry</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
