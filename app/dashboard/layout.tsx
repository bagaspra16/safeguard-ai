'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Eye,
  Cpu,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Dock, type DockItemData } from '@/components/ui/dock-two'
import { AnimatePresence, motion } from 'framer-motion'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Inside a training session the dock starts collapsed so it doesn't cover
  // the drill; the chevron still expands it.
  const inSession = /^\/dashboard\/training\/[^/]+/.test(pathname)
  const [dockPref, setDockPref] = useState<boolean | null>(null)
  const isDockCollapsed = dockPref ?? inSession

  const dockItems: DockItemData[] = [
    {
      label: 'Overview',
      icon: LayoutDashboard,
      href: '/dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      label: '3D Training Lab',
      icon: Eye,
      href: '/dashboard/training/forklift-blindspot',
      isActive: pathname.startsWith('/dashboard/training'),
      badge: '3D',
    },
    {
      label: 'Scenarios',
      icon: Cpu,
      href: '/dashboard/scenarios',
      isActive: pathname.startsWith('/dashboard/scenarios'),
    },
    {
      label: 'Employees',
      icon: Users,
      href: '/dashboard/employees',
      isActive: pathname.startsWith('/dashboard/employees'),
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      isActive: pathname.startsWith('/dashboard/analytics'),
    },
    {
      label: 'Admin',
      icon: Settings,
      href: '/dashboard/admin',
      isActive: pathname.startsWith('/dashboard/admin'),
    },
  ]

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-[#e8eaf0] antialiased selection:bg-amber-500/30">
      {/* ───────────────────────────────────────────────────────────────────
          1. MAIN CONTENT VIEWPORT WITH GENEROUS TOP & BOTTOM CLEARANCE
      ─────────────────────────────────────────────────────────────────── */}
      <main className="relative h-full w-full overflow-y-auto overflow-x-hidden pt-8 pb-32 px-5 sm:px-8 md:px-10">
        {children}
      </main>

      {/* ───────────────────────────────────────────────────────────────────
          2. FLOATING DOCK (DOCK-TWO MODEL) WITH ICON-ONLY COLLAPSE TOGGLE
      ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto">
        <AnimatePresence>
          {!isDockCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            >
              <Dock items={dockItems} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Icon-Only Collapse & Expand Button */}
        <motion.button
          layout
          type="button"
          onClick={() => setDockPref(!isDockCollapsed)}
          title={isDockCollapsed ? 'Expand Navigation Dock' : 'Collapse (Fullscreen View)'}
          aria-label={isDockCollapsed ? 'Expand Navigation Dock' : 'Collapse (Fullscreen View)'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="size-7.5 rounded-full bg-black/85 border border-white/15 text-zinc-400 hover:text-amber-400 hover:border-amber-400/50 flex items-center justify-center shadow-lg backdrop-blur-xl transition-colors cursor-pointer outline-none"
        >
          {isDockCollapsed ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </motion.button>
      </div>
    </div>
  )
}

