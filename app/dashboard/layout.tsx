'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopNavbar } from '@/components/dashboard/TopNavbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Active training scenario drill session check (e.g. /dashboard/training/forklift-blind-corner-001)
  const inDrillSession =
    pathname.startsWith('/dashboard/training/') && pathname !== '/dashboard/training'

  const [isCollapsed, setIsCollapsed] = useState(false)

  // In training drill session: Fullscreen immersion with zero sidebar/navbar distractions
  if (inDrillSession) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          position: 'relative',
        }}
      >
        {children}
      </div>
    )
  }

  // Regular Dashboard Views: Modern Sidebar + Top Navbar + Content Viewport
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Left Expandable & Collapsible Sidebar ── */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* ── Right Main Workspace (TopNavbar + Viewport) ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <TopNavbar />

        {/* Main Content Viewport */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '28px 32px 60px',
            position: 'relative',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
