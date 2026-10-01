'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Users,
  Award,
  CreditCard,
  Wifi,
  BarChart3,
  Flame,
  FileCheck2,
  Box,
} from 'lucide-react'

// Demo data for Recent Activities Table
const RECENT_ACTIVITIES = [
  {
    id: 'DRL_000876',
    scenario: 'Forklift Blind Corner Collision',
    category: 'Warehouse Logistics',
    score: '96%',
    status: 'Completed',
    date: '17 Apr, 2026 03:45 PM',
    iconColor: '#38bdf8',
    type: 'simulation',
  },
  {
    id: 'DRL_000875',
    scenario: 'Chemical Spill Containment',
    category: 'Hazardous Materials',
    score: '78%',
    status: 'Pending',
    date: '15 Apr, 2026 11:30 AM',
    iconColor: '#f97316',
    type: 'video',
  },
  {
    id: 'DRL_000874',
    scenario: 'High-Voltage Lockout/Tagout',
    category: 'Electrical Safety',
    score: '92%',
    status: 'Completed',
    date: '15 Apr, 2026 12:00 PM',
    iconColor: '#a855f7',
    type: 'quiz',
  },
  {
    id: 'DRL_000873',
    scenario: 'Elevated Scaffold Harness Check',
    category: 'Working at Heights',
    score: '84%',
    status: 'In Progress',
    date: '14 Apr, 2026 09:15 PM',
    iconColor: '#f59e0b',
    type: 'simulation',
  },
  {
    id: 'DRL_000872',
    scenario: 'Emergency Evacuation & Staging',
    category: 'General EHS',
    score: '98%',
    status: 'Completed',
    date: '10 Apr, 2026 06:00 AM',
    iconColor: '#10b981',
    type: 'simulation',
  },
]

// Monthly Dual-Tone Chart Data (Orange: Safe Procedures, Charcoal: Violations Intercepted)
const CHART_MONTHS = [
  { month: 'Jan', safe: 65, hazard: 25 },
  { month: 'Feb', safe: 75, hazard: 20 },
  { month: 'Mar', safe: 55, hazard: 35 },
  { month: 'Apr', safe: 85, hazard: 20 },
  { month: 'May', safe: 70, hazard: 30 },
  { month: 'Jun', safe: 95, hazard: 15 },
  { month: 'Jul', safe: 80, hazard: 25 },
  { month: 'Aug', safe: 90, hazard: 18 },
]

export default function DashboardPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>(['DRL_000873'])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const filteredActivities = RECENT_ACTIVITIES.filter(
    (a) =>
      a.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1360, margin: '0 auto' }}>
      {/* ── Greeting Banner ── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Good morning, John
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Stay on top of your safety tasks, monitor workforce compliance, and track risk status.
        </p>
      </div>

      {/* ── Top 3-Column Bento Grid Layout (Reference Design) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {/* ─── COLUMN 1: Total Safety Score & Quick Wallets ─── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Safety Index</span>
              <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                OSHA Standard
              </span>
            </div>

            <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>
              98.4%
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 2 }}>
                <ArrowUpRight size={14} /> +5.2%
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>than last month</span>
            </div>

            {/* Two Action Buttons (Black pill + Light pill) */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <Link
                href="/dashboard/training/forklift-blind-corner-001"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '11px 16px',
                  borderRadius: 999,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                  transition: 'all 0.15s',
                }}
              >
                <Zap size={14} fill="#f97316" color="#f97316" /> Launch Sim
              </Link>

              <Link
                href="/dashboard/scenarios"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '11px 16px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.15s',
                }}
              >
                <Plus size={14} /> Assign Drill
              </Link>
            </div>
          </div>

          {/* Facility Breakdown Sub-cards (Reference "Wallets" row) */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Facilities | Total 3 Zones
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { name: 'Zone A', score: '98%', status: 'Active', color: '#16a34a' },
                { name: 'Zone B', score: '92%', status: 'Active', color: '#16a34a' },
                { name: 'Hazard Wing', score: '84%', status: 'Review', color: '#f97316' },
              ].map((w) => (
                <div
                  key={w.name}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    borderRadius: 10,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{w.score}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: w.color }}>{w.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── COLUMN 2: 4 Bento Metric Tiles ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14 }}>
          {/* Tile 1: Vibrant Orange Bento Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: 20,
              padding: 20,
              color: '#ffffff',
              boxShadow: '0 8px 24px -6px rgba(249, 115, 22, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Active Drills</span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={15} color="#ffffff" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', margin: '4px 0' }}>
                12
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>
                ↑ 7% this month
              </div>
            </div>
          </div>

          {/* Tile 2: White Card - Incidents Prevented */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Incidents Prevented</span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={14} color="#0f172a" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '4px 0' }}>
                48
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626' }}>
                ↓ 5% risk drop
              </div>
            </div>
          </div>

          {/* Tile 3: White Card - Total Trained */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Certified</span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={14} color="#0f172a" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '4px 0' }}>
                1,050
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                ↑ 6% this month
              </div>
            </div>
          </div>

          {/* Tile 4: White Card - Reaction Speed */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Avg. Reaction Speed</span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={14} color="#0f172a" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '4px 0' }}>
                1.8s
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                ↑ 4% faster
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 3: Performance & Loss Dual-Tone Chart ─── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Training Outcomes</h3>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} /> Safe
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f172a' }} /> Violations
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>
              Monthly safe compliance vs hazard detections
            </p>

            {/* Stacked Dual-Tone Bar Chart Graphic */}
            <div
              style={{
                height: 140,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 8,
                paddingBottom: 4,
                borderBottom: '1px solid #f1f4f8',
              }}
            >
              {CHART_MONTHS.map((col) => (
                <div key={col.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  {/* Stacked Bar Container */}
                  <div
                    style={{
                      width: 14,
                      height: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      gap: 2,
                    }}
                  >
                    {/* Top Orange Segment (Safe Procedures) */}
                    <div
                      style={{
                        width: '100%',
                        height: `${col.safe}%`,
                        background: 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)',
                        borderRadius: '4px 4px 2px 2px',
                        transition: 'height 0.3s',
                      }}
                    />
                    {/* Bottom Charcoal Segment (Violations Intercepted) */}
                    <div
                      style={{
                        width: '100%',
                        height: `${col.hazard}%`,
                        background: '#0f172a',
                        borderRadius: '2px 2px 4px 4px',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{col.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Annual Mitigation Rate</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>+94.2%</span>
          </div>
        </div>
      </div>

      {/* ── Bottom 2-Column Row (Left: Monthly Limit + Visual Cards | Right: Recent Activities Table) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left Sub-Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Monthly Training Limit / Target Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 22,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Monthly Safety Quota Limit
            </div>
            {/* Horizontal Bar with Orange Fill */}
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #f97316, #ea580c)', borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>480 drills completed</span>
              <span style={{ color: '#94a3b8' }}>600 target</span>
            </div>
          </div>

          {/* Visual Safety Cards (Credit Cards Style in Reference) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 20,
              padding: 22,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Personnel Credentials</span>
              <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600, cursor: 'pointer' }}>+ Add Credential</span>
            </div>

            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              {/* Black Card */}
              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 110,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Wifi size={14} style={{ transform: 'rotate(90deg)' }} />
                  <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontWeight: 700 }}>
                    Active
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.05em' }}>**** 6782</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.6, marginTop: 4 }}>
                    <span>EHS Master</span>
                    <span>EXP 09/29</span>
                  </div>
                </div>
              </div>

              {/* Orange Card */}
              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 110,
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Wifi size={14} style={{ transform: 'rotate(90deg)' }} />
                  <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.25)', borderRadius: 999, fontWeight: 700 }}>
                    Active
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.9, letterSpacing: '0.05em' }}>**** 4356</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.8, marginTop: 4 }}>
                    <span>Forklift Cert</span>
                    <span>EXP 12/28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sub-Column: Recent Activities Interactive Table */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          {/* Table Header & Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Recent Activities</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 999,
                }}
              >
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search drill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 12,
                    color: '#0f172a',
                    width: 120,
                  }}
                />
              </div>

              {/* Filter Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <Filter size={12} /> Filter
              </button>
            </div>
          </div>

          {/* Table Grid */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f4f8', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 8px', width: 30 }}>
                    <input type="checkbox" style={{ accentColor: '#0f172a', cursor: 'pointer' }} readOnly checked />
                  </th>
                  <th style={{ padding: '10px 8px' }}>Drill ID</th>
                  <th style={{ padding: '10px 8px' }}>Scenario</th>
                  <th style={{ padding: '10px 8px' }}>Score</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Date</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => {
                  const isChecked = selectedRows.includes(act.id)
                  return (
                    <tr
                      key={act.id}
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fcfdfe')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRow(act.id)}
                          style={{ accentColor: '#0f172a', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        {act.id}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: `${act.iconColor}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Box size={14} color={act.iconColor} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{act.scenario}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{act.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>
                        {act.score}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              act.status === 'Completed'
                                ? '#16a34a'
                                : act.status === 'Pending'
                                ? '#f59e0b'
                                : '#3b82f6',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background:
                                act.status === 'Completed'
                                  ? '#16a34a'
                                  : act.status === 'Pending'
                                  ? '#f59e0b'
                                  : '#3b82f6',
                            }}
                          />
                          {act.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 12, color: '#64748b' }}>
                        {act.date}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 4,
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
