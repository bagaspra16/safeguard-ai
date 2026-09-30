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
  },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')

  const filteredEmployees = INITIAL_EMPLOYEES.filter((emp) => {
    if (searchQuery && !emp.name.toLowerCase().includes(searchQuery.toLowerCase()) && !emp.role.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Workforce Compliance & Personnel Roster</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--sg-text-secondary)', fontSize: 14 }}>
            Monitor safety qualification certificates, simulation scores, and assign refresher modules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              background: 'var(--sg-primary)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Enroll Personnel
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 18px',
          background: 'var(--sg-bg-surface)',
          border: '1px solid var(--sg-border)',
          borderRadius: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 260,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--sg-bg-elevated)',
            border: '1px solid var(--sg-border)',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <Search size={16} color="var(--sg-text-muted)" />
          <input
            type="text"
            placeholder="Search employees by name, role, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--sg-text-primary)',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Employees Table */}
      <div
        style={{
          background: 'var(--sg-bg-surface)',
          border: '1px solid var(--sg-border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 2fr 1.5fr 1.2fr 1fr',
            padding: '14px 20px',
            borderBottom: '1px solid var(--sg-border)',
            background: 'var(--sg-bg-elevated)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--sg-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          <div>Employee & Role</div>
          <div>Department</div>
          <div>Certification Status</div>
          <div>Avg. Sim Score</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        <div>
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 2fr 1.5fr 1.2fr 1fr',
                padding: '16px 20px',
                borderBottom: '1px solid var(--sg-border)',
                alignItems: 'center',
                fontSize: 13,
              }}
            >
              {/* Employee info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {emp.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sg-text-primary)' }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>{emp.role}</div>
                </div>
              </div>

              {/* Department */}
              <div style={{ color: 'var(--sg-text-secondary)' }}>{emp.department}</div>

              {/* Status */}
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background:
                      emp.status === 'Compliant'
                        ? 'rgba(16,185,129,0.15)'
                        : emp.status === 'Pending Training'
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(239,68,68,0.15)',
                    color:
                      emp.status === 'Compliant'
                        ? '#10b981'
                        : emp.status === 'Pending Training'
                        ? '#f59e0b'
                        : '#ef4444',
                    border: `1px solid ${
                      emp.status === 'Compliant'
                        ? 'rgba(16,185,129,0.3)'
                        : emp.status === 'Pending Training'
                        ? 'rgba(245,158,11,0.3)'
                        : 'rgba(239,68,68,0.3)'
                    }`,
                  }}
                >
                  {emp.status === 'Compliant' ? (
                    <ShieldCheck size={13} />
                  ) : (
                    <AlertTriangle size={13} />
                  )}
                  {emp.status}
                </span>
              </div>

              {/* Score */}
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: emp.avgScore >= 90 ? '#10b981' : emp.avgScore >= 80 ? 'var(--sg-accent)' : '#ef4444',
                  }}
                >
                  {emp.avgScore}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--sg-text-muted)', marginLeft: 4 }}>
                  ({emp.completedCount} modules)
                </span>
              </div>

              {/* Actions */}
              <div style={{ textAlign: 'right' }}>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'var(--sg-bg-elevated)',
                    border: '1px solid var(--sg-border)',
                    color: 'var(--sg-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Assign Sim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
