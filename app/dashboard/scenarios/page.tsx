'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ALL_SCENARIOS } from '@/lib/scenarios/data'
import type { Scenario, SeverityLevel } from '@/types'
import {
  Cpu,
  Plus,
  Play,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Video,
  Eye,
  Sliders,
  Filter,
} from 'lucide-react'

export default function ScenariosPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [promptInput, setPromptInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [scenariosList, setScenariosList] = useState<Scenario[]>(ALL_SCENARIOS)

  const filteredScenarios = scenariosList.filter((s) => {
    if (filterSeverity !== 'all' && s.severity !== filterSeverity) return false
    if (filterCategory !== 'all' && s.category !== filterCategory) return false
    return true
  })

  const handleGenerateScenario = async () => {
    if (!promptInput.trim()) return
    setIsGenerating(true)
    try {
      // Simulate AI generation or call AI endpoint
      await new Promise((r) => setTimeout(r, 1800))
      const newScenario: Scenario = {
        id: `custom-scenario-${Date.now()}`,
        title: promptInput.length > 50 ? promptInput.slice(0, 50) + '...' : promptInput,
        description: `Custom generated scenario based on incident: "${promptInput}". Analyzes risk factors and simulates OSHA compliant response procedures.`,
        category: 'custom_incident',
        severity: 'high' as SeverityLevel,
        environment: 'warehouse',
        estimatedDuration: 6,
        status: 'published',
        hazards: [
          {
            id: `hazard-gen-1`,
            type: 'vehicle',
            label: 'Dynamic Incident Zone',
            description: 'Uncontrolled hazard identified in workspace corridor.',
            severity: 'high',
          },
        ],
        learningObjectives: [
          'Identify immediate root cause of safety incident',
          'Execute proactive emergency halt or evacuation',
          'Report incident to safety supervisor per OSHA guidelines',
        ],
        negativeCase: {
          id: `neg-gen`,
          label: 'Unsafe Handling',
          description: 'Employee bypasses emergency protocol and attempts unauthorized intervention.',
          actions: ['ignore_hazard', 'continue_operation', 'incident_escalation'],
        },
        positiveCase: {
          id: `pos-gen`,
          label: 'Compliant Protocol',
          description: 'Employee activates safety stop, establishes perimeter, and verifies all clear.',
          actions: ['stop_work', 'clear_area', 'report_supervisor'],
        },
        assessment: {
          requiredActions: ['stop_work', 'clear_area'],
          passingScore: 80,
          timeLimit: 300,
        },
        video: {
          positive: '/demo/videos/forklift-positive.mp4',
          negative: '/demo/videos/forklift-negative.mp4',
        },
        simulation: {
          environment: 'warehouse',
          assetSet: 'warehouse_basic',
          playerStart: { x: -8, y: 0, z: 0 },
          hazardPositions: {},
          interactionZones: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setScenariosList([newScenario, ...scenariosList])
      setShowGeneratorModal(false)
      setPromptInput('')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Scenario Library & Simulation Engine</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--sg-text-secondary)', fontSize: 14 }}>
            Multi-modal synchronized safety simulations powered by AI, 3D WebXR, and procedural behavioral twins.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowGeneratorModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Sparkles size={16} /> Generate Scenario with AI
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 18px',
          background: 'var(--sg-bg-surface)',
          border: '1px solid var(--sg-border)',
          borderRadius: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sg-text-secondary)', fontSize: 13 }}>
          <Filter size={15} /> Filter By:
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'critical', 'high', 'medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                background: filterSeverity === sev ? 'var(--sg-accent-dim)' : 'transparent',
                border: filterSeverity === sev ? '1px solid var(--sg-accent)' : '1px solid var(--sg-border)',
                color: filterSeverity === sev ? 'var(--sg-accent)' : 'var(--sg-text-secondary)',
              }}
            >
              {sev} Severity
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 20,
        }}
      >
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            style={{
              background: 'var(--sg-bg-surface)',
              border: '1px solid var(--sg-border)',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
          >
            <div>
              {/* Header tags */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  className={`sg-badge ${
                    scenario.severity === 'critical' || scenario.severity === 'high'
                      ? 'sg-badge-hazard'
                      : 'sg-badge-warning'
                  }`}
                >
                  {scenario.severity.toUpperCase()} RISK
                </span>
                <span style={{ fontSize: 12, color: 'var(--sg-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {scenario.estimatedDuration} mins
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>{scenario.title}</h3>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 13,
                  color: 'var(--sg-text-secondary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {scenario.description}
              </p>

              {/* Hazards list preview */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sg-text-muted)', marginBottom: 8 }}>
                  Active Hazards ({scenario.hazards.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {scenario.hazards.map((h) => (
                    <span
                      key={h.id}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'var(--sg-bg-elevated)',
                        border: '1px solid var(--sg-border)',
                        fontSize: 11,
                        color: 'var(--sg-text-secondary)',
                      }}
                    >
                      {h.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Launch Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid var(--sg-border)',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--sg-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Video size={13} color="#10b981" /> Dual Video
                </span>
                <span style={{ fontSize: 12, color: 'var(--sg-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={13} color="#38bdf8" /> 3D WebXR
                </span>
              </div>

              <Link
                href={`/dashboard/training/${scenario.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)',
                }}
              >
                <Play size={13} fill="#ffffff" /> Launch
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* AI Scenario Generator Modal */}
      {showGeneratorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: 'var(--sg-bg-surface)',
              border: '1px solid var(--sg-border)',
              borderRadius: 16,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'var(--sg-accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} color="var(--sg-accent)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>AI Incident Simulation Synthesizer</h3>
                <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>
                  Transform raw workplace incident logs or OSHA reports into interactive 3D simulations
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.5, margin: '14px 0' }}>
              Describe a workplace safety incident, near-miss, or hazard condition. SafeGuard AI will generate learning objectives, 3D hazard coordinates, and positive/negative behavioral models.
            </p>

            <textarea
              rows={4}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g., A worker in cold storage slips on ice accumulation near the blast chiller door while carrying an unsealed container of coolant..."
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                background: 'var(--sg-bg-elevated)',
                border: '1px solid var(--sg-border)',
                color: 'var(--sg-text-primary)',
                fontSize: 13,
                resize: 'none',
                marginBottom: 20,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                disabled={isGenerating}
                onClick={() => setShowGeneratorModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid var(--sg-border)',
                  color: 'var(--sg-text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={isGenerating || !promptInput.trim()}
                onClick={handleGenerateScenario}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: isGenerating ? 'var(--sg-border)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="sg-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Synthesizing Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Synthesize Scenario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
