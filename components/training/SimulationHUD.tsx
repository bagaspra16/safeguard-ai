'use client'

import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { CheckCircle2, Glasses, ShieldAlert } from 'lucide-react'

interface Props {
  scenario?: Scenario
}

export function SimulationHUD({ scenario }: Props) {
  const phase = useSimulationStore((s) => s.phase)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const vrAvailable = useSimulationStore((s) => s.vrAvailable)
  const vrMode = useSimulationStore((s) => s.vrMode)

  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const getObjective = () => {
    switch (phase) {
      case 'simulation_active':
        return `Scan the active ${scenario?.environment || 'work'} area. Identify environmental risks and maintain safety perimeter.`
      case 'hazard_detection':
        return 'Locate and identify critical hazards in the operational zone.'
      case 'decision_point':
        return 'Standard decision point reached. Select the OSHA-compliant procedure.'
      case 'outcome_correct':
        return 'Standard verified. Compliant risk controls and clearance observed.'
      case 'outcome_incorrect':
        return 'Safety deviation recorded. Review standard operating procedure.'
      default:
        return 'Follow the enterprise EHS protocol instructions.'
    }
  }

  const title = scenario?.title || 'Interactive Safety Simulation'
  const hazards = scenario?.hazards || []

  return (
    <>
      {/* Top-left: Scenario */}
      <div
        className="sg-hud-panel"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          padding: '10px 14px',
          minWidth: 220,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: 'var(--sg-text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 2,
          }}
        >
          ACTIVE DRILL
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {hazards.map((h) => {
            const isDetected = detectedHazards.includes(h.id)
            if (!isDetected) return null
            return (
              <span
                key={h.id}
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'var(--sg-safe-bg)',
                  color: 'var(--sg-safe)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCircle2 size={10} /> {h.label.slice(0, 16)}...
              </span>
            )
          })}
          {detectedHazards.length === 0 && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--sg-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ShieldAlert size={10} /> Scan scene for hazards
            </span>
          )}
        </div>
      </div>

      {/* Top-right: Timer */}
      <div
        className="sg-hud-panel"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          padding: '10px 14px',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: 'var(--sg-text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 2,
          }}
        >
          ELAPSED TIME
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--sg-accent)',
          }}
        >
          {timeStr}
        </div>
      </div>

      {/* Bottom: Objective */}
      <div
        className="sg-hud-panel"
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          padding: '12px 20px',
          maxWidth: 560,
          textAlign: 'center',
          minWidth: 300,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: 'var(--sg-text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          OPERATIONAL OBJECTIVE
        </div>
        <div style={{ fontSize: 13, color: 'var(--sg-text-primary)', lineHeight: 1.5 }}>
          {getObjective()}
        </div>
      </div>

      {/* VR indicator */}
      {vrAvailable && !vrMode && (
        <div
          className="sg-hud-panel"
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 20,
            padding: '8px 12px',
            fontSize: 11,
            color: 'var(--sg-vr)',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Glasses size={13} /> WebXR Ready
        </div>
      )}
    </>
  )
}
