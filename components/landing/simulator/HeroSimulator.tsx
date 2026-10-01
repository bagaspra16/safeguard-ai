'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SCENARIOS, type Phase, type ScenarioId } from './timeline'
import styles from './simulator.module.css'

function Placeholder() {
  return (
    <div className={styles.placeholder} aria-hidden="true">
      <span className={styles.placeholderDot} />
      Loading 3D simulation…
    </div>
  )
}

// three.js and the scene are split into their own chunk and only load on the client
const SimulatorCanvas = dynamic(() => import('./SimulatorCanvas'), {
  ssr: false,
  loading: () => <Placeholder />,
})

export default function HeroSimulator() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [scenarioId, setScenarioId] = useState<ScenarioId>('fall')
  const [phase, setPhase] = useState<Phase>('normal')

  // Render only while on screen
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setShouldLoad(true)
      },
      { rootMargin: '100px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scenarios play in turn
  const handleCycleEnd = useCallback(() => {
    setScenarioId((current) => {
      const available = SCENARIOS.filter((s) => s.available)
      const i = available.findIndex((s) => s.id === current)
      return available[(i + 1) % available.length].id
    })
  }, [])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div ref={rootRef} className={styles.root}>
      {shouldLoad ? (
        <SimulatorCanvas scenarioId={scenarioId} active={inView} onPhase={setPhase} onCycleEnd={handleCycleEnd} />
      ) : (
        <Placeholder />
      )}

      <div className={styles.hud}>
        <div className={`${styles.status} ${styles[phase]}`} role="status">
          <span className={styles.statusDot} />
          {scenario.status[phase]}
        </div>
      </div>
    </div>
  )
}
