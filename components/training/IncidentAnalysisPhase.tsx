'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Scenario } from '@/types'
import {
  AlertTriangle,
  ShieldAlert,
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Flame,
  HardHat,
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react'

interface Props {
  scenario: Scenario
  onComplete: () => void
}

interface IncidentDetail {
  imageSrc: string
  caseNumber: string
  oshaStandard: string
  rootCauses: string[]
  consequences: string[]
  correctActions: string[]
  initialGreeting: string
  suggestedQuestions: string[]
  hazardTags: { label: string; severity: 'high' | 'critical' | 'medium' }[]
}

const INCIDENT_DETAILS_MAP: Record<string, IncidentDetail> = {
  'forklift-blind-corner-001': {
    imageSrc: '/images/incidents/forklift-incident.jpg',
    caseNumber: 'OSHA-2026-WHS-0482',
    oshaStandard: 'OSHA 29 CFR 1910.178(n)(4) & (n)(6)',
    rootCauses: [
      'Blind intersection line-of-sight obstructed by 3-meter industrial pallet racking.',
      'Forklift operated with elevated load obstructing forward operator sightline.',
      'Pedestrian worker failed to yield right-of-way and did not verify clear path before entering vehicle lane.',
      'Audible horn warning was not sounded prior to negotiating blind intersection.',
    ],
    consequences: [
      'Near-miss critical impact with potential crush injury (3,000 kg forklift mass).',
      'Loss of situational awareness in designated shared pedestrian-vehicle corridor.',
      'Facility downtime and required OSHA incident reporting investigation.',
    ],
    correctActions: [
      'Pedestrian must pause at intersection marking and look both directions (Stop & Look).',
      'Forklift operator must sound horn 5 meters before blind corners and slow down.',
      'Forklift must carry loads low (10-15 cm from floor) or drive in reverse if sight is blocked.',
    ],
    initialGreeting:
      'Welcome to Incident Case Study #OSHA-2026-WHS-0482. In this real-world scenario, a warehouse worker bypassed the Stop-and-Look protocol at an unmirrored blind corner while a forklift was rounding the aisle with an obstructed forward view.\n\nI am your Sentinel AI Safety Advisor. Ask me anything about the root causes, OSHA 1910.178 requirements, or pedestrian-vehicle separation protocols before you begin your assessment.',
    suggestedQuestions: [
      'Why was the pedestrian in the danger zone?',
      'What are the OSHA requirements for forklift blind corners?',
      'How should the forklift operator have handled the high load?',
      'What preventative controls should the warehouse install?',
    ],
    hazardTags: [
      { label: 'Obstructed Sightline (3m Racks)', severity: 'critical' },
      { label: 'Unsounded Horn Violation', severity: 'high' },
      { label: 'Pedestrian Lane Incursion', severity: 'critical' },
      { label: 'Elevated Pallet Load', severity: 'high' },
    ],
  },
  'industrial-fire-005': {
    imageSrc: '/images/incidents/fire-incident.jpg',
    caseNumber: 'OSHA-2026-IND-0914',
    oshaStandard: 'OSHA 29 CFR 1910.157 & NFPA 10 / 30',
    rootCauses: [
      'Flammable Class B solvent drum breached and ignited near heating manifold.',
      'Worker panicked and applied water onto liquid chemical/solvent fire.',
      'Water caused instant violent steam explosion, atomizing flaming solvent and spreading fire across 15 meters.',
      'Manual fire alarm pull station was not activated prior to fighting fire.',
    ],
    consequences: [
      'Explosive flare-up endangering floor personnel and blocking primary egress.',
      'Generation of dense toxic hydrocarbon and cyanide smoke in unventilated bay.',
      'Complete evacuation triggered with severe facility structural damage.',
    ],
    correctActions: [
      'Never use water on Class B flammable liquid or electrical fires.',
      'Execute RACE protocol: Rescue, Alarm (pull station), Contain (fire doors), Evacuate.',
      'Deploy only Class B rated CO₂ or ABC dry chemical extinguishers using PASS technique.',
    ],
    initialGreeting:
      'Welcome to Incident Case Study #OSHA-2026-IND-0914. This critical incident illustrates the catastrophic danger of applying water to a Class B solvent fire. The water instantaneously boiled into steam, violently spreading flaming liquid across the warehouse bay.\n\nI am your Sentinel AI Safety Advisor. Ask me about Class B fire dynamics, the RACE protocol, or appropriate extinguishing agents for industrial environments.',
    suggestedQuestions: [
      'Why does water cause an explosion on solvent fires?',
      'What extinguisher type is required for Class B fires?',
      'What are the steps of the RACE protocol?',
      'When should a worker evacuate instead of attempting suppression?',
    ],
    hazardTags: [
      { label: 'Class B Flammable Solvents', severity: 'critical' },
      { label: 'Water Application Failure (Explosion Risk)', severity: 'critical' },
      { label: 'Delayed Alarm Trigger', severity: 'high' },
      { label: 'Toxic Smoke Inhalation Risk', severity: 'high' },
    ],
  },
  'construction-fall-006': {
    imageSrc: '/images/incidents/fall-incident.jpg',
    caseNumber: 'OSHA-2026-CST-1102',
    oshaStandard: 'OSHA 29 CFR 1926.501 & 1926.502',
    rootCauses: [
      'Worker detached both lanyards simultaneously while traversing elevated scaffolding at 8m height.',
      'Stepped onto an unpinned, cantilevered scaffolding plank with no toe boards or midrails.',
      'Complete lack of 100% continuous tie-off using dual-lanyard leapfrog protocol.',
      'Coworker failed to exercise Stop Work Authority upon witnessing unsafe edge transit.',
    ],
    consequences: [
      'Immediate 8-meter free-fall hazard with fatal/critical trauma risk.',
      'Catastrophic scaffold structural failure due to unanchored plank tipping.',
      'Immediate OSHA Stop-Work order and total site safety audit.',
    ],
    correctActions: [
      'Maintain 100% continuous dual-lanyard tie-off at all times above 1.8m (6 ft).',
      'Inspect scaffold planks before stepping: verify pinned brackets and guardrails.',
      'Immediately exercise Stop Work Authority when observing coworker unclipped.',
    ],
    initialGreeting:
      'Welcome to Incident Case Study #OSHA-2026-CST-1102. In this high-elevation incident, a worker disconnected both lanyard snap hooks to quickly step across an unpinned scaffold plank 8 meters above ground level, resulting in an unarrested tipping fall.\n\nI am your Sentinel AI Safety Advisor. Ask me about 100% continuous tie-off, OSHA 1926 fall clearance calculations, or scaffold inspection criteria.',
    suggestedQuestions: [
      'How does the dual-lanyard leapfrog technique work?',
      'What is the minimum OSHA fall protection trigger height?',
      'What should a worker do upon spotting an unpinned plank?',
      'What is Stop Work Authority (SWA)?',
    ],
    hazardTags: [
      { label: 'Dual-Lanyard Disconnection (0% Tie-Off)', severity: 'critical' },
      { label: 'Unpinned Cantilever Plank (8m Height)', severity: 'critical' },
      { label: 'Missing Guardrail & Toe Boards', severity: 'high' },
      { label: 'Overlooked Pre-Shift Inspection', severity: 'medium' },
    ],
  },
}

export function IncidentAnalysisPhase({ scenario, onComplete }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'causes' | 'osha' | 'controls'>('overview')
  const [chatMessages, setChatMessages] = useState<
    { role: 'assistant' | 'user'; content: string; timestamp: string }[]
  >([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Resolve incident details
  const isFire =
    scenario.id === 'industrial-fire-005' || scenario.category === 'fire_safety'
  const isFall =
    scenario.id === 'construction-fall-006' ||
    scenario.id === 'fall-protection-004' ||
    scenario.category === 'construction_safety'

  const incidentKey = isFire
    ? 'industrial-fire-005'
    : isFall
    ? 'construction-fall-006'
    : 'forklift-blind-corner-001'

  const incident = INCIDENT_DETAILS_MAP[incidentKey] || INCIDENT_DETAILS_MAP['forklift-blind-corner-001']

  // Initial greeting message
  useEffect(() => {
    setChatMessages([
      {
        role: 'assistant',
        content: incident.initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [incident])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || inputMessage).trim()
    if (!text) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMessages((prev) => [...prev, { role: 'user', content: text, timestamp: userTime }])
    if (!msgToSend) setInputMessage('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          scenarioId: scenario.id,
          phase: 'incident_analysis',
          conversationHistory: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantReply =
          data.message || data.explanation || 'Always follow established OSHA safety guidelines and stop before hazard zones.'
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } else {
        throw new Error('Chat API returned error')
      }
    } catch {
      // Fallback response tailored to scenario
      let fallbackText = ''
      const lower = text.toLowerCase()
      if (isFire) {
        if (lower.includes('water') || lower.includes('explosion') || lower.includes('class b')) {
          fallbackText =
            'Water must never be applied to Class B flammable liquid fires. Water vaporizes rapidly into steam with a 1,700:1 expansion ratio, violently propelling burning solvent across the work area.'
        } else {
          fallbackText =
            'Under OSHA 1910.157 and NFPA guidelines, workers must first alert others and pull the fire alarm (RACE protocol) before considering suppression with a Class B extinguisher.'
        }
      } else if (isFall) {
        if (lower.includes('lanyard') || lower.includes('tie') || lower.includes('leapfrog')) {
          fallbackText =
            'The dual-lanyard leapfrog technique requires keeping one lanyard attached at all times while moving the other to the next certified 5,000-lb anchor point.'
        } else {
          fallbackText =
            'OSHA 1926.501 requires mandatory fall protection for any worker operating at or above 6 feet (1.8m) from a lower elevation.'
        }
      } else {
        fallbackText =
          'OSHA 1910.178(n)(4) mandates that forklift operators sound the horn and slow down at all cross aisles and blind corners, while pedestrians must always stop and look both directions.'
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0d14',
        color: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header Bar ── */}
      <div
        style={{
          flexShrink: 0,
          background: '#0f1422',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            {isFire ? <Flame size={20} /> : isFall ? <HardHat size={20} /> : <Truck size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'rgba(239,68,68,0.2)',
                  color: '#f87171',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(239,68,68,0.35)',
                }}
              >
                Phase 1: Incident Analysis
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                {incident.caseNumber}
              </span>
            </div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: '2px 0 0' }}>
              {scenario.title} — Unsafe Procedure Breakdown
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            <ShieldAlert size={14} color="#f97316" />
            <span>Standard: <strong style={{ color: '#f8fafc' }}>{incident.oshaStandard}</strong></span>
          </div>

          <button
            id="btn-proceed-assessment"
            onClick={onComplete}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              transition: 'all 0.2s',
            }}
          >
            Start Assessment <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Workspace ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* ── LEFT COLUMN: Incident Evidence & Technical Breakdown ── */}
        <div
          style={{
            overflowY: 'auto',
            padding: '20px 24px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Incident Image Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#131826',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 320,
                cursor: 'pointer',
              }}
              onClick={() => setIsImageZoomed(true)}
            >
              <Image
                src={incident.imageSrc}
                alt={scenario.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />

              {/* Gradient Overlay for labels */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(10,13,20,0.92) 0%, rgba(10,13,20,0.2) 60%, rgba(0,0,0,0.4) 100%)',
                }}
              />

              {/* Top Banner Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(220,38,38,0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 6,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <AlertTriangle size={13} />
                Critical Incident Case Evidence
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(15,23,42,0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#94a3b8',
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Maximize2 size={12} /> Click to expand
              </div>

              {/* Bottom Caption */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 16,
                  right: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  Failure Mechanism
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                  {scenario.negativeCase.description}
                </div>
              </div>
            </div>

            {/* Incident Hazard Badges Strip */}
            <div
              style={{
                background: '#0d111a',
                padding: '10px 16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {incident.hazardTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background:
                      tag.severity === 'critical'
                        ? 'rgba(239,68,68,0.15)'
                        : tag.severity === 'high'
                        ? 'rgba(249,115,22,0.15)'
                        : 'rgba(234,179,8,0.15)',
                    color:
                      tag.severity === 'critical'
                        ? '#fca5a5'
                        : tag.severity === 'high'
                        ? '#fdba74'
                        : '#fde047',
                    border: `1px solid ${
                      tag.severity === 'critical'
                        ? 'rgba(239,68,68,0.3)'
                        : tag.severity === 'high'
                        ? 'rgba(249,115,22,0.3)'
                        : 'rgba(234,179,8,0.3)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background:
                        tag.severity === 'critical'
                          ? '#ef4444'
                          : tag.severity === 'high'
                          ? '#f97316'
                          : '#eab308',
                    }}
                  />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Analysis Tabs */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              {[
                { key: 'overview', label: 'Case Overview', icon: FileText },
                { key: 'causes', label: 'Root Causes', icon: AlertTriangle },
                { key: 'osha', label: 'OSHA Violations', icon: ShieldAlert },
                { key: 'controls', label: 'Corrective Protocol', icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(249,115,22,0.18)' : 'transparent',
                      color: isActive ? '#f97316' : '#94a3b8',
                      border: isActive ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div
              style={{
                background: '#0f1422',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '18px 20px',
              }}
            >
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                      Incident Summary & Context
                    </h3>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                      {scenario.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 10,
                      padding: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Severity Class</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                        {scenario.severity} Risk
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Environment</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', textTransform: 'capitalize' }}>
                        {scenario.environment}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Drill Duration</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                        ~{scenario.estimatedDuration} min
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={14} /> Critical Error Sequence:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {scenario.negativeCase.actions.map((act, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#cbd5e1',
                            background: 'rgba(239,68,68,0.08)',
                            padding: '6px 12px',
                            borderRadius: 6,
                            borderLeft: '3px solid #ef4444',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#ef4444' }}>Step {i + 1}:</span>
                          <span>{act.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'causes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Identified Root Causes & Failure Chain
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {incident.rootCauses.map((cause, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 13,
                          color: '#cbd5e1',
                          lineHeight: 1.5,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'rgba(239,68,68,0.2)',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 800,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>{cause}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(249,115,22,0.08)',
                      border: '1px solid rgba(249,115,22,0.25)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginBottom: 4 }}>
                      Direct Consequences:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
                      {incident.consequences.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'osha' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={18} color="#ef4444" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      Regulatory Non-Compliance Summary
                    </h3>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Governing Standard</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171', marginTop: 2 }}>
                      {incident.oshaStandard}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                    This incident triggers immediate mandatory OSHA reporting due to severe life-safety violations.
                    Failure to implement physical separation controls and operator refresher drills subjects the enterprise
                    to repeat-violation penalties under OSHA Section 17.
                  </div>
                </div>
              )}

              {activeTab === 'controls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      Required Corrective Actions & Standard Protocol
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {incident.correctActions.map((action, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 13,
                          color: '#e2e8f0',
                          background: 'rgba(34,197,94,0.08)',
                          padding: '10px 12px',
                          borderRadius: 8,
                          borderLeft: '3px solid #22c55e',
                          lineHeight: 1.5,
                        }}
                      >
                        <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive Sentinel AI Safety Agent ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#0a0d14',
            overflow: 'hidden',
          }}
        >
          {/* Agent Header */}
          <div
            style={{
              padding: '14px 18px',
              background: '#0f1422',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  position: 'relative',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(249,115,22,0.4)',
                }}
              >
                <Bot size={18} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #0f1422',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                    Sentinel AI Safety Advisor
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: 'rgba(34,197,94,0.15)',
                      color: '#4ade80',
                      padding: '1px 6px',
                      borderRadius: 4,
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}
                  >
                    Active
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Ask questions to understand the concept before assessment
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    role: 'assistant',
                    content: incident.initialGreeting,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }}
              title="Reset Chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Chat Message Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {chatMessages.map((msg, i) => {
              const isAssistant = msg.role === 'assistant'
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 4,
                      fontSize: 10,
                      color: '#64748b',
                      padding: '0 4px',
                    }}
                  >
                    {isAssistant ? (
                      <>
                        <Sparkles size={11} color="#f97316" />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Sentinel Copilot</span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#94a3b8' }}>You (Trainee)</span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '92%',
                      padding: '12px 14px',
                      borderRadius: isAssistant ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: isAssistant ? '#131826' : 'linear-gradient(135deg, #ea580c, #c2410c)',
                      border: isAssistant ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      color: '#f8fafc',
                      fontSize: 13,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#131826', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Sentinel is analyzing safety regulation...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick-Prompt Recommendation Chips */}
          <div
            style={{
              padding: '10px 16px 4px',
              background: '#0c101c',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <HelpCircle size={12} /> Suggested Concept Queries:
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                maxHeight: 74,
                overflowY: 'auto',
              }}
            >
              {incident.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isTyping}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(249,115,22,0.15)'
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'
                    e.currentTarget.style.color = '#f97316'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#cbd5e1'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Box */}
          <div
            style={{
              padding: '12px 16px 16px',
              background: '#0c101c',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              id="input-incident-chat"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask Sentinel AI about this incident case..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#151b2c',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              id="btn-send-incident-chat"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: inputMessage.trim() && !isTyping ? '#f97316' : 'rgba(255,255,255,0.06)',
                color: inputMessage.trim() && !isTyping ? '#ffffff' : '#64748b',
                border: 'none',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Image Modal ── */}
      {isImageZoomed && (
        <div
          onClick={() => setIsImageZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
            cursor: 'zoom-out',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '90vw',
              maxWidth: 1100,
              height: '75vh',
              borderRadius: 16,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            }}
          >
            <Image
              src={incident.imageSrc}
              alt={scenario.title}
              fill
              style={{ objectFit: 'contain', background: '#000' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 20,
                right: 20,
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(8px)',
                padding: '12px 18px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: 13,
              }}
            >
              <strong style={{ color: '#f87171' }}>{incident.caseNumber}:</strong> {scenario.negativeCase.description}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
