'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  AlertTriangle,
  Flame,
  Boxes,
  Play,
  RotateCcw,
} from 'lucide-react'
import MorphOrb from '@/components/ui/ai-thinking-orb'
import { ShaderBackground } from '@/components/ui/mesh-portfolio'
import { ClumsAILogo } from '@/components/ui/ClumsAILogo'

/* ─────────────────── Scenario keyword matching ──────────────────── */
type ScenarioKey = 'forklift' | 'fire' | 'fall'

interface MatchedScenario {
  key: ScenarioKey
  id: string
  title: string
  category: string
  description: string
  oshaRef: string
  icon: React.ReactNode
  color: string
  href: string
  meshCount: string
  environment: string
  coreCompetency: string
}

const SCENARIO_MAP: Record<ScenarioKey, MatchedScenario> = {
  forklift: {
    key: 'forklift',
    id: 'forklift-blind-corner-001',
    title: 'Forklift Blind Corner Collision',
    category: 'Warehouse Logistics',
    description:
      'A warehouse employee approaches a blind intersection while a forklift approaches from the other side. Covers stop-and-check procedures, pedestrian separation, and hazard recognition.',
    oshaRef: 'OSHA 29 CFR 1910.178',
    icon: <Boxes size={22} />,
    color: '#f97316',
    href: '/dashboard/training/forklift-blind-corner-001',
    meshCount: '4,120 Spatial Polygons',
    environment: 'Industrial Logistics Bay 4',
    coreCompetency: 'Blind Corner Stop & Pedestrian Separation',
  },
  fire: {
    key: 'fire',
    id: 'industrial-fire-005',
    title: 'Industrial Solvent Fire & RACE Protocol',
    category: 'Fire Safety',
    description:
      'A flash fire ignites in a paint storage room. Covers the full RACE protocol, fire classification, extinguisher selection, and low-crawl evacuation procedures.',
    oshaRef: 'OSHA 29 CFR 1910.157 / NFPA 10',
    icon: <Flame size={22} />,
    color: '#dc2626',
    href: '/dashboard/training/industrial-fire-005',
    meshCount: '5,380 Thermal & Volumetric Polygons',
    environment: 'Chemical Mixing & Solvent Bay',
    coreCompetency: 'RACE Protocol & PASS Extinguisher Deployment',
  },
  fall: {
    key: 'fall',
    id: 'construction-fall-006',
    title: 'Scaffold Fall Protection & Dual Lanyard',
    category: 'Working at Heights',
    description:
      'A structural ironworker on an 8-meter elevated steel frame. Covers 100% continuous tie-off, dual-lanyard leapfrog technique, harness inspection, and Stop Work Authority.',
    oshaRef: 'OSHA 29 CFR 1926.501 & 1926.502',
    icon: <AlertTriangle size={22} />,
    color: '#ea580c',
    href: '/dashboard/training/construction-fall-006',
    meshCount: '6,240 Structural Scaffold Polygons',
    environment: 'Elevated Structural Steel Grid',
    coreCompetency: '100% Tie-Off & Dual Lanyard Leapfrog',
  },
}

function matchScenario(text: string): ScenarioKey | null {
  const t = text.toLowerCase()
  if (t.match(/forklift|fork.?lift|warehouse|blind.?corner|vehicle|collision|pallet/)) return 'forklift'
  if (t.match(/fire|flame|blaze|burn|evacua|smoke|race.protocol|extinguish|solvent|paint/)) return 'fire'
  if (t.match(/fall|falling|fell|height|scaffold|elevation|lanyard|harness|drop|plank/)) return 'fall'
  return null
}

const TOTAL_GEN_MS = 14000 // 14s dedicated simulation & meshing focus

/* ─────────────────── Example prompts ────────────────────────────── */
const EXAMPLE_PROMPTS = [
  'Forklift blind corner collision',
  'Industrial solvent flash fire',
  'Scaffold fall protection & harness',
]

export default function AIScenarioPage() {
  const router = useRouter()

  const [genState, setGenState] = useState<'idle' | 'running' | 'done' | 'nomatch'>('idle')
  const [matchedScenario, setMatchedScenario] = useState<MatchedScenario | null>(null)
  const [submittedText, setSubmittedText] = useState('')
  const [orbKey, setOrbKey] = useState(0)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => { abortRef.current?.abort() }, [])

  const handleOrbSubmit = async (text: string): Promise<string> => {
    setSubmittedText(text)

    const matched = matchScenario(text)
    if (!matched) {
      setGenState('nomatch')
      return 'No matching scenario found. Try describing a forklift, fire, or scaffold fall hazard.'
    }

    setMatchedScenario(SCENARIO_MAP[matched])
    setGenState('running')

    const ac = new AbortController()
    abortRef.current = ac

    // Realistic 3D generation computation delay for the animation
    await new Promise<void>((res) => {
      const id = setTimeout(res, TOTAL_GEN_MS)
      ac.signal.addEventListener('abort', () => { clearTimeout(id); res() }, { once: true })
    })

    if (!ac.signal.aborted) {
      setGenState('done')
    }

    return `3D Scenario Ready: ${SCENARIO_MAP[matched].title}`
  }

  const handleReset = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setGenState('idle')
    setMatchedScenario(null)
    setSubmittedText('')
    setOrbKey((k) => k + 1)
  }

  const handleExampleClick = (prompt: string) => {
    handleReset()
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.mo-field')
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        nativeInputValueSetter?.call(input, prompt)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.focus()
      }
    }, 60)
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
      }}
    >
      {/* ── WebGL Mesh Drift Shader Background (Light Mode Safety Theme) ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }}
        aria-hidden="true"
      >
        <ShaderBackground className="w-full h-full" />
      </div>

      {/* ── Content Container (Clean, Centered, Focused) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 780,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: genState === 'running' ? 0 : 20,
          transition: 'all 0.4s ease',
        }}
      >
        {/* ── Concise Header (Smooth Transition Fade & Slide on generation) ── */}
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: genState === 'idle' ? 1 : 0,
            transform: genState === 'idle' ? 'translateY(0)' : 'translateY(-14px)',
            maxHeight: genState === 'idle' ? 140 : 0,
            pointerEvents: genState === 'idle' ? 'auto' : 'none',
            overflow: 'hidden',
            transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.5s ease',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <ClumsAILogo height={22} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AI Scenario Studio
            </span>
          </div>


          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              margin: '0 0 8px',
            }}
          >
            What safety scenario do you want to create?
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Describe any workplace hazard to generate an interactive 3D simulation drill.
          </p>
        </div>

        {/* ── AI Input & Morphing Thinking Orb (Centered Focus) ── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <MorphOrb
            key={orbKey}
            onSubmit={handleOrbSubmit}
            minThinkMs={TOTAL_GEN_MS}
          />

          {/* Minimalist prompt suggestions (Smooth Transition Fade & Slide) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginTop: genState === 'idle' ? 12 : 0,
              opacity: genState === 'idle' ? 1 : 0,
              transform: genState === 'idle' ? 'translateY(0)' : 'translateY(12px)',
              maxHeight: genState === 'idle' ? 60 : 0,
              pointerEvents: genState === 'idle' ? 'auto' : 'none',
              overflow: 'hidden',
              transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.45s ease, margin 0.4s ease',
            }}
          >
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Try:</span>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleExampleClick(prompt)}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #e2e8f0',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f97316'
                  e.currentTarget.style.color = '#f97316'
                  e.currentTarget.style.background = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.color = '#475569'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* No match notice */}
          {genState === 'nomatch' && (
            <div
              style={{
                fontSize: 13,
                color: '#ea580c',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid rgba(234, 88, 12, 0.2)',
              }}
            >
              <span>No matching hazard scenario found. Try describing a forklift, fire, or scaffold fall.</span>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f97316',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* ── Generated Scenario Outcome (Cardless, Minimalist, Direct CTA) ── */}
        {genState === 'done' && matchedScenario && (
          <div
            style={{
              maxWidth: 620,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginTop: 12,
              paddingTop: 20,
              borderTop: '2px solid #0f172a',
              animation: 'sgFadeSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Top Status & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#16a34a',
                    background: 'rgba(22,163,74,0.08)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  ✓ 3D Simulation Ready
                </span>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{matchedScenario.category}</span>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: 12, color: '#ea580c', fontWeight: 600 }}>{matchedScenario.oshaRef}</span>
              </div>

              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <RotateCcw size={12} /> New Prompt
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.015em' }}>
                {matchedScenario.title}
              </h2>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {matchedScenario.description}
              </p>
            </div>

            {/* Minimalist Specs Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 12,
                padding: '10px 0',
                borderTop: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Spatial Environment
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                  {matchedScenario.environment}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3D Simulation Mesh
                </div>
                <div style={{ fontSize: 13, color: '#f97316', fontWeight: 700, marginTop: 2 }}>
                  {matchedScenario.meshCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Core Competency
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                  {matchedScenario.coreCompetency}
                </div>
              </div>
            </div>

            {/* Direct CTA Action */}
            <div style={{ paddingTop: 4 }}>
              <button
                onClick={() => router.push(matchedScenario.href)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '13px 28px',
                  borderRadius: 999,
                  background: '#f97316',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ea580c'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f97316'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <Play size={15} fill="#fff" /> Enter 3D Simulation Drill
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
