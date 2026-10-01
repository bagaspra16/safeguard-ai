'use client'

import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { SCENARIOS, phaseAt, type Phase, type ScenarioId, type ScenarioMeta, type SimClock } from './timeline'
import { Ground } from './parts/Ground'
import { TowerCrane } from './parts/TowerCrane'
import { SiteBackdrop } from './parts/SiteBackdrop'
import { FallHazard } from './scenarios/FallHazard'

// Matches the landing page background so the ground fades into the page
const FOG_COLOR = '#f9fafb'

interface TimelineProps {
  scenario: ScenarioMeta
  clockRef: RefObject<SimClock>
  reducedMotion: boolean
  onPhase: (phase: Phase) => void
  onCycleEnd: () => void
}

/** Advances the scenario clock and reports phase changes to the DOM overlay. */
function Timeline({ scenario, clockRef, reducedMotion, onPhase, onCycleEnd }: TimelineProps) {
  const lastPhase = useRef<Phase | null>(null)

  useEffect(() => {
    clockRef.current.t = 0
    lastPhase.current = null
  }, [scenario, clockRef])

  useFrame(({ gl }, delta) => {
    const clock = clockRef.current
    if (reducedMotion) {
      // Static frame at the detection moment
      clock.t = scenario.detectedAt + 1
    } else {
      clock.t += Math.min(delta, 0.1)
      if (clock.t >= scenario.duration) {
        clock.t = 0
        onCycleEnd()
      }
      // Short fade around the loop point
      const fade = Math.min(1, clock.t / 0.4, (scenario.duration - clock.t) / 0.4)
      gl.domElement.style.opacity = String(fade)
    }

    const phase = phaseAt(scenario, clock.t)
    if (phase !== lastPhase.current) {
      lastPhase.current = phase
      onPhase(phase)
    }
  }, -1)

  return null
}

interface SimulatorCanvasProps {
  scenarioId: ScenarioId
  active: boolean
  onPhase: (phase: Phase) => void
  onCycleEnd: () => void
}

export default function SimulatorCanvas({ scenarioId, active, onPhase, onCycleEnd }: SimulatorCanvasProps) {
  const clockRef = useRef<SimClock>({ t: 0 })
  const [smallScreen] = useState(() => window.matchMedia('(max-width: 640px)').matches)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const shadowMapSize = smallScreen ? 512 : 1024

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={active ? (reducedMotion ? 'demand' : 'always') : 'never'}
      camera={{ position: [11, 9, 15], fov: 35, near: 0.5, far: 140 }}
      gl={{ antialias: !smallScreen, alpha: true, powerPreference: 'high-performance' }}
    >
      <fog attach="fog" args={[FOG_COLOR, 26, 80]} />
      <hemisphereLight args={['#ffffff', '#b9a78c', 1.1]} />
      <directionalLight
        castShadow
        position={[9, 16, 7]}
        intensity={2.4}
        color="#fff3df"
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      >
        {/* Shadow frustum limited to the work area */}
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 16, -16, 1, 60]} />
      </directionalLight>

      <Timeline
        scenario={scenario}
        clockRef={clockRef}
        reducedMotion={reducedMotion}
        onPhase={onPhase}
        onCycleEnd={onCycleEnd}
      />

      <Ground />
      <TowerCrane />
      <SiteBackdrop />

      <Suspense fallback={null}>
        {scenario.id === 'fall' && <FallHazard clockRef={clockRef} />}
      </Suspense>
    </Canvas>
  )
}
