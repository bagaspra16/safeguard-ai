'use client'

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
  ChevronRight,
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sg-bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--sg-bg-surface)',
        borderRight: '1px solid var(--sg-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--sg-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--sg-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16, color: '#000',
              flexShrink: 0,
            }}>S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>SafeGuard AI</div>
              <div style={{ fontSize: 10, color: 'var(--sg-text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Safety Platform</div>
            </div>
          </div>
          <div style={{
            marginTop: 12, padding: '6px 10px',
            background: 'var(--sg-bg-elevated)',
            borderRadius: 6, border: '1px solid var(--sg-border)',
            fontSize: 11,
          }}>
            <div style={{ color: 'var(--sg-text-muted)', marginBottom: 2 }}>Organization</div>
            <div style={{ fontWeight: 600, color: 'var(--sg-text-primary)' }}>Acme Warehouse Co.</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 6, marginBottom: 2,
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  textDecoration: 'none',
                  color: active ? 'var(--sg-accent)' : 'var(--sg-text-secondary)',
                  background: active ? 'var(--sg-accent-dim)' : 'transparent',
                  border: active ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--sg-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0,
            }}>JD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>John Demo</div>
              <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>Safety Manager</div>
            </div>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--sg-text-muted)', padding: 4,
            }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, flexShrink: 0,
          borderBottom: '1px solid var(--sg-border)',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--sg-bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: 'var(--sg-accent)' }} />
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)' }}>
              {NAV_ITEMS.find((n) => isActive(n.href, n.exact))?.label ?? 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="sg-badge sg-badge-safe">● Demo Mode Active</div>
            <button style={{
              background: 'var(--sg-bg-elevated)', border: '1px solid var(--sg-border)',
              borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--sg-text-secondary)',
            }}>
              <Bell size={15} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
