'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ShieldCheck,
  Send,
  MoreVertical,
  Plus,
  Filter,
  ArrowUpRight,
  Zap,
} from 'lucide-react'

interface EmployeeRecord {
  id: string
  name: string
  role: string
  department: string
  status: 'Compliant' | 'Pending Training' | 'Retake Required'
  completedCount: number
  avgScore: number
  lastActive: string
  avatar: string
  avatarBg: string
}

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp-01',
    name: 'Marcus Vance',
    role: 'Forklift Operator',
    department: 'Logistics / Warehouse A',
    status: 'Compliant',
    completedCount: 6,
    avgScore: 96,
    lastActive: '2 hours ago',
    avatar: 'MV',
    avatarBg: '#f97316',
  },
  {
    id: 'emp-02',
    name: 'Sarah Chen',
    role: 'Chemical Handling Specialist',
    department: 'Hazardous Materials Wing',
    status: 'Compliant',
    completedCount: 5,
    avgScore: 92,
    lastActive: 'Yesterday',
    avatar: 'SC',
    avatarBg: '#38bdf8',
  },
  {
    id: 'emp-03',
    name: 'David Rodriguez',
    role: 'Maintenance Technician',
    department: 'Electrical Infrastructure',
    status: 'Retake Required',
    completedCount: 3,
    avgScore: 68,
    lastActive: '3 days ago',
    avatar: 'DR',
    avatarBg: '#ef4444',
  },
  {
    id: 'emp-04',
    name: 'Elena Rostova',
    role: 'Inventory Specialist',
    department: 'Receiving Dock 4',
    status: 'Pending Training',
    completedCount: 2,
    avgScore: 84,
    lastActive: '1 week ago',
    avatar: 'ER',
    avatarBg: '#f59e0b',
  },
  {
    id: 'emp-05',
    name: 'Tyler Johnson',
    role: 'Site Safety Officer',
    department: 'EHS Department',
    status: 'Compliant',
    completedCount: 8,
    avgScore: 98,
    lastActive: 'Today',
    avatar: 'TJ',
    avatarBg: '#10b981',
  },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredEmployees = INITIAL_EMPLOYEES.filter((emp) => {
    if (selectedFilter !== 'all' && emp.status.toLowerCase().replace(' ', '_') !== selectedFilter) return false
    if (
      searchQuery &&
      !emp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1360, margin: '0 auto' }}>
      {/* ── Top Header Strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Workforce Compliance Roster
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Monitor operator safety certifications, 3D simulation pass rates, and schedule refresher drills.
          </p>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
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
          <Plus size={16} /> Enroll Personnel
        </button>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Enrolled Operators', value: '48', stat: '+3 this month', color: '#0f172a', icon: Users },
          { label: 'OSHA Compliant Certified', value: '87.5%', stat: '42 certified', color: '#16a34a', icon: ShieldCheck },
          { label: 'Refresher Drills Due', value: '6', stat: '2 high priority', color: '#ea580c', icon: AlertTriangle },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: 18,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: kpi.color, letterSpacing: '-0.02em' }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{kpi.stat}</div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: kpi.color,
              }}
            >
              <kpi.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #edf2f7',
          borderRadius: 16,
          padding: '12px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 999,
            padding: '7px 14px',
            minWidth: 280,
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by personnel name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#0f172a',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, background: '#f3f5f9', padding: 3, borderRadius: 999 }}>
          {[
            { id: 'all', label: 'All Personnel' },
            { id: 'compliant', label: 'Compliant' },
            { id: 'pending_training', label: 'Pending' },
            { id: 'retake_required', label: 'Retake' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedFilter === tab.id ? '#0f172a' : 'transparent',
                color: selectedFilter === tab.id ? '#ffffff' : '#64748b',
                boxShadow: selectedFilter === tab.id ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #edf2f7',
          borderRadius: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f4f8', background: '#fafbfc', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 20px' }}>Employee & Role</th>
              <th style={{ padding: '14px 20px' }}>Department</th>
              <th style={{ padding: '14px 20px' }}>Certification Status</th>
              <th style={{ padding: '14px 20px' }}>Simulation Score</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fcfdfe')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Employee info */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: emp.avatarBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: '#ffffff',
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {emp.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{emp.role}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '16px 20px', color: '#64748b' }}>{emp.department}</td>

                <td style={{ padding: '16px 20px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        emp.status === 'Compliant'
                          ? 'rgba(22, 163, 74, 0.1)'
                          : emp.status === 'Pending Training'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(220, 38, 38, 0.1)',
                      color:
                        emp.status === 'Compliant'
                          ? '#16a34a'
                          : emp.status === 'Pending Training'
                          ? '#ea580c'
                          : '#dc2626',
                      border: `1px solid ${
                        emp.status === 'Compliant'
                          ? 'rgba(22, 163, 74, 0.2)'
                          : emp.status === 'Pending Training'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(220, 38, 38, 0.2)'
                      }`,
                    }}
                  >
                    {emp.status === 'Compliant' ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                    {emp.status}
                  </span>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: emp.avgScore >= 90 ? '#16a34a' : emp.avgScore >= 80 ? '#f97316' : '#dc2626',
                    }}
                  >
                    {emp.avgScore}%
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
                    ({emp.completedCount} modules)
                  </span>
                </td>

                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0f172a'
                      e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9'
                      e.currentTarget.style.color = '#0f172a'
                    }}
                  >
                    Assign Drill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
