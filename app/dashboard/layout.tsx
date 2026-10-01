'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Cpu,
  Users,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Bell,
  Search,
  RotateCcw,
  Info,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/training', label: 'Training', icon: BookOpen },
  { href: '/dashboard/scenarios', label: 'Scenarios', icon: Cpu },
  { href: '/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin', label: 'Admin', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  // Hide dashboard sidebar and header when user is inside the simulation process
  const isSimulationProcess = pathname.startsWith('/dashboard/training/') && pathname !== '/dashboard/training'

  if (isSimulationProcess) {
    return (
      <div style={{ width: '100vw', height: '100vh', minHeight: '100vh', background: '#0a0d12', overflow: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        background: '#fafbfc',
        display: 'flex',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Far-Left Slim Floating Icon Dock ── */}
      <aside
        style={{
          width: 76,
          height: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #eef2f6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
          {/* Top: Light/Dark Theme Switcher Pill */}
          <div
            style={{
              background: '#f3f5f9',
              borderRadius: 999,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setIsDarkMode(false)}
              title="Light Mode"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: !isDarkMode ? '#ffffff' : 'transparent',
                boxShadow: !isDarkMode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: !isDarkMode ? '#f97316' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              title="Dark Mode (Preview)"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: isDarkMode ? '#0f172a' : 'transparent',
                boxShadow: isDarkMode ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Moon size={14} />
            </button>
          </div>

          {/* Middle: Vertical Menu Icon Dock */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#f8fafc',
              padding: '10px 8px',
              borderRadius: 999,
              border: '1px solid #edf2f7',
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    background: active ? '#0f172a' : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    boxShadow: active ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#e2e8f0'
                      e.currentTarget.style.color = '#0f172a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#64748b'
                    }
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                </Link>
              )
            })}
          </div>

          {/* Bottom: Help & Logout Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <button
              title="Help & Documentation"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a'
                e.currentTarget.style.background = '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <HelpCircle size={17} />
            </button>
            <Link
              href="/"
              title="Exit / Logout"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dc2626'
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={16} />
            </Link>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafbfc' }}>
          {/* Top Bar Header (Reference: Logo + Segmented Pill Tabs + Action Icons + Profile Capsule) */}
          <header
            style={{
              padding: '16px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f4f8',
              background: '#ffffff',
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {/* Left: Brand Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
                }}
              >
                <Shield size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#0f172a' }}>
                SafeGuard
              </span>
            </div>

            {/* Center: Sleek Segmented Pill Tabs */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#f3f5f9',
                padding: '4px 6px',
                borderRadius: 999,
                border: '1px solid #edf2f7',
              }}
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '7px 18px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      textDecoration: 'none',
                      color: active ? '#ffffff' : '#64748b',
                      background: active ? '#0f172a' : 'transparent',
                      boxShadow: active ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right: Quick Actions & Profile Capsule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Search Icon Button */}
              <button
                title="Search drills or hazards"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <Search size={15} />
              </button>

              {/* Sync / Refresh Button */}
              <button
                title="Sync OSHA Logs"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <RotateCcw size={14} />
              </button>

              {/* Info Icon Button */}
              <button
                title="System Status"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <Info size={15} />
              </button>

              {/* User Profile Capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 12px 4px 6px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 999,
                  marginLeft: 4,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  JD
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>John Demo</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>john.demo@acme.com</div>
                </div>
                <ChevronDown size={13} color="#94a3b8" />
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {children}
          </main>
        </div>
    </div>
  )
}

