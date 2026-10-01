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
  Maximize2,
  RefreshCw,
  Shield,
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
      'Pedestrian must pause at intersection marking and look both directions (Stop and Look).',
      'Forklift operator must sound horn 5 meters before blind corners and slow down.',
      'Forklift must carry loads low (10-15 cm from floor) or drive in reverse if sight is blocked.',
    ],
    initialGreeting:
      'Welcome to Incident Case Study OSHA-2026-WHS-0482. In this real-world scenario, a warehouse worker bypassed the Stop-and-Look protocol at an unmirrored blind corner while a forklift was rounding the aisle with an obstructed forward view.\n\nI am your Sentinel AI Safety Advisor. Ask me anything about the root causes, OSHA 1910.178 requirements, or pedestrian-vehicle separation protocols before you begin your assessment.',
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
      'Deploy only Class B rated CO2 or ABC dry chemical extinguishers using PASS technique.',
    ],
    initialGreeting:
      'Welcome to Incident Case Study OSHA-2026-IND-0914. This critical incident illustrates the catastrophic danger of applying water to a Class B solvent fire. The water instantaneously boiled into steam, violently spreading flaming liquid across the warehouse bay.\n\nI am your Sentinel AI Safety Advisor. Ask me about Class B fire dynamics, the RACE protocol, or appropriate extinguishing agents for industrial environments.',
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
      'Welcome to Incident Case Study OSHA-2026-CST-1102. In this high-elevation incident, a worker disconnected both lanyard snap hooks to quickly step across an unpinned scaffold plank 8 meters above ground level, resulting in an unarrested tipping fall.\n\nI am your Sentinel AI Safety Advisor. Ask me about 100% continuous tie-off, OSHA 1926 fall clearance calculations, or scaffold inspection criteria.',
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

  const [activeTab, setActiveTab] = useState<'overview' | 'causes' | 'osha' | 'controls'>('overview')
  const [chatMessages, setChatMessages] = useState<
    { role: 'assistant' | 'user'; content: string; timestamp: string }[]
  >(() => [
    {
      role: 'assistant',
      content: incident.initialGreeting,
      timestamp: 'Just now',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

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
        background: '#ffffff',
        color: '#0f172a',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header Bar ── */}
      <div
        style={{
          flexShrink: 0,
          background: '#ffffff',
          borderBottom: '1px solid #eef2f6',
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
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(249,115,22,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}
          >
            {isFire ? <Flame size={18} /> : isFall ? <HardHat size={18} /> : <Truck size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: '#f8fafc',
                  color: '#64748b',
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid #e2e8f0',
                }}
              >
                Stage 1: Case Review
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                {incident.caseNumber}
              </span>
            </div>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
              {scenario.title}: Incident Breakdown
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #e2e8f0',
              fontSize: 11,
              color: '#64748b',
            }}
          >
            <Shield size={13} color="#ea580c" />
            <span>Standard: <strong style={{ color: '#0f172a' }}>{incident.oshaStandard}</strong></span>
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
              boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Begin Assessment</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Workspace ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* ── LEFT COLUMN: Incident Evidence & Technical Breakdown ── */}
        <div
          style={{
            overflowY: 'auto',
            padding: '20px 24px',
            borderRight: '1px solid #eef2f6',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: '#ffffff',
          }}
        >
          {/* Incident Image Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 300,
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

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.1) 50%, rgba(0,0,0,0.3) 100%)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(15,23,42,0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>Incident Reference Evidence</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  color: '#0f172a',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Maximize2 size={12} />
                <span>Expand View</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 16,
                  right: 16,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  Incident Observation
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                  {scenario.negativeCase.description}
                </div>
              </div>
            </div>

            {/* Hazard Tags Strip */}
            <div
              style={{
                background: '#f8fafc',
                padding: '10px 14px',
                borderTop: '1px solid #edf2f7',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
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
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                  }}
                >
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
                gap: 4,
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 10,
                marginBottom: 14,
                border: '1px solid #e2e8f0',
              }}
            >
              {[
                { key: 'overview', label: 'Summary', icon: FileText },
                { key: 'causes', label: 'Root Causes', icon: AlertTriangle },
                { key: 'osha', label: 'Regulations', icon: ShieldAlert },
                { key: 'controls', label: 'Action Protocol', icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'overview' | 'causes' | 'osha' | 'controls')}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 8,
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#0f172a' : '#64748b',
                      border: 'none',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon size={13} color={isActive ? '#ea580c' : '#94a3b8'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1px solid #eef2f6',
                padding: '16px 18px',
              }}
            >
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                      Incident Overview
                    </h3>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      {scenario.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #edf2f7',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Severity</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                        {scenario.severity}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Domain</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                        {scenario.environment}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Duration</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                        {scenario.estimatedDuration} min
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'causes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Identified Root Causes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {incident.rootCauses.map((cause, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 12,
                          color: '#334155',
                          lineHeight: 1.5,
                          padding: '8px 10px',
                          background: '#f8fafc',
                          borderRadius: 8,
                          border: '1px solid #edf2f7',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#ea580c' }}>{idx + 1}.</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'osha' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    OSHA Standard Compliance
                  </h3>
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 8,
                      padding: '10px 12px',
                      border: '1px solid #edf2f7',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Governing Standard</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {incident.oshaStandard}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    This scenario evaluates mandatory OSHA safety practices. Compliance requires proper hazard verification and adherence to certified safe behaviors.
                  </div>
                </div>
              )}

              {activeTab === 'controls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Required Corrective Protocol
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {incident.correctActions.map((action, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 12,
                          color: '#1e293b',
                          background: '#f8fafc',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #edf2f7',
                          lineHeight: 1.5,
                        }}
                      >
                        <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive Sentinel AI Safety Advisor ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Agent Header */}
          <div
            style={{
              padding: '12px 18px',
              background: '#ffffff',
              borderBottom: '1px solid #eef2f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  position: 'relative',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={16} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#16a34a',
                    border: '1px solid #ffffff',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Sentinel AI Advisor
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: 'rgba(22,163,74,0.08)',
                      color: '#16a34a',
                      padding: '1px 6px',
                      borderRadius: 999,
                    }}
                  >
                    Active
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Ask questions to understand the concept
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
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={12} />
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
              gap: 12,
              background: '#f8fafc',
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
                      marginBottom: 3,
                      fontSize: 10,
                      color: '#94a3b8',
                      padding: '0 4px',
                    }}
                  >
                    {isAssistant ? (
                      <span style={{ fontWeight: 700, color: '#ea580c' }}>Sentinel AI</span>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#64748b' }}>You</span>
                    )}
                    <span>· {msg.timestamp}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '92%',
                      padding: '10px 14px',
                      borderRadius: isAssistant ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      background: isAssistant ? '#ffffff' : '#0f172a',
                      border: isAssistant ? '1px solid #e2e8f0' : 'none',
                      color: isAssistant ? '#1e293b' : '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', width: 'fit-content' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>Analyzing safety protocol...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts */}
          <div
            style={{
              padding: '8px 16px 4px',
              background: '#ffffff',
              borderTop: '1px solid #eef2f6',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                maxHeight: 64,
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
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#475569'
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
              padding: '10px 16px 14px',
              background: '#ffffff',
              borderTop: '1px solid #eef2f6',
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
              placeholder="Ask Sentinel AI about this incident..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              id="btn-send-incident-chat"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: inputMessage.trim() && !isTyping ? '#f97316' : '#f1f5f9',
                color: inputMessage.trim() && !isTyping ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Modal ── */}
      {isImageZoomed && (
        <div
          onClick={() => setIsImageZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '90vw',
              maxWidth: 1000,
              height: '70vh',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)',
              background: '#000000',
            }}
          >
            <Image
              src={incident.imageSrc}
              alt={scenario.title}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
