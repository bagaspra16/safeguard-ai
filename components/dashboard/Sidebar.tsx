'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Sparkles,
  Search,
} from 'lucide-react'
import { ClumsAILogo } from '@/components/ui/ClumsAILogo'

interface NavItem {
  label: string
  icon: any
  href: string
  badge?: string | number
  exact?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN MENU',
    items: [
      {
        label: 'AI Scenario Studio',
        icon: Sparkles,
        href: '/dashboard/scenarios',
        badge: 'AI',
        exact: true,
      },
      {
        label: 'Training Catalog',
        icon: Boxes,
        href: '/dashboard/training',
        badge: 3,
      },
      {
        label: 'My Performance',
        icon: BarChart3,
        href: '/dashboard/analytics',
      },
    ],
  },
  {
    title: 'PREFERENCES',
    items: [
      {
        label: 'Account & Settings',
        icon: Settings,
        href: '/dashboard/admin',
      },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 74 : 252 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      style={{
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 40,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* ── Brand Header ── */}
      <div
        style={{
          height: 64,
          padding: isCollapsed ? '0 16px' : '0 16px 0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f8fafc',
          flexShrink: 0,
        }}
      >
        {isCollapsed ? (
          // Collapsed State: Clicking the ClumsAI icon directly expands the sidebar
          <button
            onClick={onToggleCollapse}
            title="Click to expand sidebar"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
              transition: 'transform 0.15s ease',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            C
          </button>
        ) : (
          // Expanded State: Brand logo link on the left + single top collapse button on the right
          <>
            <Link
              href="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  <ClumsAILogo height={28} />
                </motion.div>
              </AnimatePresence>
            </Link>

            {/* Single Clear Top Collapse Button */}
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
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
              <ChevronLeft size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Minimalist Search Bar ── */}
      <div style={{ padding: isCollapsed ? '12px 10px' : '12px 14px', flexShrink: 0 }}>
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            title="Search (click to expand)"
            style={{
              width: '100%',
              height: 36,
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <Search size={14} />
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
            }}
          >
            <Search size={13} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: '#0f172a',
                width: '100%',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1px 4px',
                borderRadius: 4,
                color: '#94a3b8',
                fontFamily: 'monospace',
              }}
            >
              ⌘K
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation List ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isCollapsed ? '0 8px' : '0 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Section Heading */}
            {section.title && !isCollapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '2px 8px 4px',
                }}
              >
                {section.title}
              </div>
            )}

            {/* Menu Items */}
            {section.items.map((item) => {
              const active = isItemActive(item)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: isCollapsed ? '8px 0' : '8px 10px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: 8,
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'all 0.12s ease',
                    background: active ? '#0f172a' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    fontWeight: active ? 700 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.color = '#0f172a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#475569'
                    }
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      flexShrink: 0,
                      color: active ? '#f97316' : '#64748b',
                    }}
                  />

                  {!isCollapsed && (
                    <span
                      style={{
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Clean Monotone Badge */}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: active ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                        color: active ? '#ffffff' : '#64748b',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Minimalist Personal Profile Footer ── */}
      <div
        style={{
          padding: isCollapsed ? '10px 8px' : '10px 12px',
          borderTop: '1px solid #f8fafc',
          flexShrink: 0,
          background: '#ffffff',
        }}
      >
        {isCollapsed ? (
          <div
            title="John Doe · Certified Operator"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              margin: '0 auto',
              cursor: 'default',
            }}
          >
            JD
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                JD
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                  John Doe
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Safety Trainee</div>
              </div>
            </div>

            <Link
              href="/dashboard/admin"
              title="Settings"
              style={{
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
                borderRadius: 4,
                textDecoration: 'none',
              }}
            >
              <Settings size={13} />
            </Link>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
