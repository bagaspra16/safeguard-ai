'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function TopNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') return ['ClumsAI', 'Overview']
    if (pathname.startsWith('/dashboard/training/')) return ['ClumsAI', 'Training', 'Active Drill']
    if (pathname === '/dashboard/training') return ['ClumsAI', 'Training Catalog']
    if (pathname === '/dashboard/scenarios') return ['ClumsAI', 'Scenario Library']
    if (pathname === '/dashboard/analytics') return ['ClumsAI', 'My Performance']
    if (pathname === '/dashboard/admin') return ['ClumsAI', 'Settings']
    return ['ClumsAI', 'Dashboard']
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header
      style={{
        height: 60,
        background: '#ffffff',
        borderBottom: '1px solid #eef2f6',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 30,
        boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
      }}
    >
      {/* ── Left Side: Clean Breadcrumbs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Breadcrumb Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {idx > 0 && <span style={{ color: '#cbd5e1', fontSize: 11 }}>›</span>}
              <span
                style={{
                  fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500,
                  color: idx === breadcrumbs.length - 1 ? '#0f172a' : '#64748b',
                }}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Side Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notifications Bell */}
        <button
          title="Safety Notifications"
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#f97316',
              border: '1px solid #ffffff',
            }}
          />
        </button>

        {/* Live OSHA Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            color: '#16a34a',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#16a34a',
            }}
          />
          <span>OSHA 1910 Verified</span>
        </div>
      </div>
    </header>
  )
}
