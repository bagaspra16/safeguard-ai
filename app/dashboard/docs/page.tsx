'use client'

import { useState } from 'react'
import {
  BookOpen,
  Glasses,
  Cpu,
  Shield,
  Search,
  ChevronRight,
  Crosshair,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

interface DocSection {
  id: string
  title: string
  category: string
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  badge?: string
  content: React.ReactNode
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<string>('simulation-guide')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const sections: DocSection[] = [
    {
      id: 'simulation-guide',
      title: '3D Simulation & First-Person Controls',
      category: 'Simulation Architecture',
      icon: Glasses,
      badge: 'Interactive Lab',
      content: (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Glasses className="size-4" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Standard PC & WebXR Locomotion Engine
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dual-mode spatial camera and physical navigation pipeline
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              SafeGuard AI provides high-fidelity first-person workplace training simulations. In the 3D canvas, controls adapt seamlessly between desktop keyboard/mouse and immersive VR headsets with 6-degrees-of-freedom tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Desktop Keyboard & Mouse
                  </span>
                  <span className="text-[10px] bg-white/[0.08] px-2 py-0.5 rounded text-zinc-400 font-mono">
                    PC Mode
                  </span>
                </div>
                <ul className="text-xs text-zinc-300 space-y-2.5 list-none">
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">W A S D</span>
                    <span>Walk forward, strafe left/right, and step backward</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">Mouse Look</span>
                    <span>Smooth 360° pitch and yaw first-person view</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">Crosshair</span>
                    <span>Inspect blindspots, pedestrian lanes & forklift paths</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">Click / Space</span>
                    <span>Confirm choices during slowed decision points</span>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    WebXR & VR Headsets
                  </span>
                  <span className="text-[10px] bg-white/[0.08] px-2 py-0.5 rounded text-zinc-400 font-mono">
                    Quest / Vision Pro
                  </span>
                </div>
                <ul className="text-xs text-zinc-300 space-y-2.5 list-none">
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">6DoF Head</span>
                    <span>Spatial head orientation and checking blind corners</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">Thumbstick</span>
                    <span>Smooth locomotion or teleport-to-safety movement</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">Laser Pointer</span>
                    <span>Target hazard markers and submit in-headset choices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="font-mono bg-zinc-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">3D Audio</span>
                    <span>Positional forklift horn and backup beeper acoustics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drill Step Flow */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 flex items-center gap-2">
              <Crosshair className="size-4 text-amber-400" />
              Scenario Hazard Pointing & Decision Flow
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
              Simulations slow down when approaching critical moments to evaluate hazard awareness without artificial visual clues:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/10">
                <div className="size-6 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-2.5">
                  01
                </div>
                <div className="text-xs font-bold text-white mb-1">Hazard Detection</div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Visually scan the pedestrian aisle and point crosshair at the blindspot intersection.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-white/10">
                <div className="size-6 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-2.5">
                  02
                </div>
                <div className="text-xs font-bold text-white mb-1">Tactical Decision</div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Select the OSHA-compliant protective action before the crossing conflict point.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-white/10">
                <div className="size-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2.5">
                  03
                </div>
                <div className="text-xs font-bold text-white mb-1">AI Debrief</div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Consequence simulation plays out with real-time AI scoring and feedback report.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'osha-standards',
      title: 'OSHA & Regulatory Standards',
      category: 'Regulatory Matrix',
      icon: Shield,
      badge: '29 CFR 1910',
      content: (
        <div className="space-y-5">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="size-4" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  OSHA 1910 Scenario Framework
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Strictly aligned with OSHA General Industry & ISO 45001
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              All scenarios map directly to specific OSHA enforcement standards for audit readiness:
            </p>

            <div className="space-y-4">
              <div className="border border-white/10 bg-zinc-950 p-4.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-white">OSHA 1910.178 — Powered Industrial Trucks</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Mandatory</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Pedestrian aisle clearance, mandatory horn deceleration at corners, load center limits, and driver eye-contact protocols.
                </p>
              </div>

              <div className="border border-white/10 bg-zinc-950 p-4.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-white">OSHA 1910.147 — Lockout / Tagout (LOTO)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Mandatory</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Hazardous energy isolation, lockout tag hardware placement, and zero-energy state verification.
                </p>
              </div>

              <div className="border border-white/10 bg-zinc-950 p-4.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-white">OSHA 1910.1200 — Hazard Communication & GHS</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Mandatory</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Safety data sheets (SDS), secondary container GHS labeling, and spill barrier isolation radii.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-custom-generator',
      title: 'AI Scenario Generator API & Prompts',
      category: 'AI Pipeline',
      icon: Cpu,
      badge: 'REST API',
      content: (
        <div className="space-y-5">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cpu className="size-4" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Dynamic Simulation Synthesis Pipeline
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Synthesize Three.js scenario graphs with AI questions from incident notes
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              Send incident reports to generate interactive 3D simulations via structured JSON endpoint:
            </p>

            <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 font-mono text-xs text-amber-400 overflow-x-auto shadow-inner">
              <pre>{`// POST /api/ai/scenario-generate
{
  "industry": "Manufacturing & Logistics",
  "incident_type": "Forklift Pedestrian Near-Miss",
  "hazard_level": "CRITICAL",
  "facility_layout": "Aisle_B_Blind_Corner",
  "options": {
    "interactive_blindspot_count": 3,
    "osha_references": ["1910.178(n)(4)"],
    "voice_trainer_enabled": true
  }
}`}</pre>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeSection = sections.find((s) => s.id === activeTab) || sections[0]

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Documentation Hub
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Technical guides, controls, OSHA references, and AI scenario API.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/80 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Topics */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-0.5">
            Topics
          </div>
          {filteredSections.map((sec) => {
            const Icon = sec.icon
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  activeTab === sec.id
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="size-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">{sec.title}</span>
                </div>
                {sec.badge && (
                  <span className="text-[9px] bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-300 font-bold shrink-0">
                    {sec.badge}
                  </span>
                )}
              </button>
            )
          })}

          <div className="pt-4 border-t border-white/10 mt-4">
            <Link
              href="/dashboard/training/forklift-blindspot"
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:border-amber-400 text-xs font-bold transition-all"
            >
              <span>Launch 3D Simulation</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-zinc-950/85 border border-white/10 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {activeSection.category}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {activeSection.title}
                </h2>
              </div>
              {activeSection.badge && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {activeSection.badge}
                </span>
              )}
            </div>

            {activeSection.content}
          </div>
        </div>
      </div>
    </div>
  )
}
