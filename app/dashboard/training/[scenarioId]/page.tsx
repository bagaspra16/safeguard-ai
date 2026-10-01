'use client'

import { use, useEffect } from 'react'
import { getScenarioById } from '@/lib/scenarios/data'
import { useSimulationStore } from '@/lib/simulation/store'
import type { SimulationPhase } from '@/types'
import { TrainingExperience } from '@/components/training/TrainingExperience'
import Link from 'next/link'

export default function TrainingSessionPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>
}) {
  const { scenarioId } = use(params)
  const scenario = getScenarioById(scenarioId)
  const reset = useSimulationStore((s) => s.reset)

  useEffect(() => {
    reset()
    // Dev shortcut: ?phase=simulation_active jumps straight to the 3D drill
    if (process.env.NODE_ENV === 'development') {
      const phase = new URLSearchParams(window.location.search).get('phase')
      if (phase) useSimulationStore.getState().setPhase(phase as SimulationPhase)
    }
  }, [scenarioId, reset])

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Scenario Not Found</h2>
        <p style={{ color: 'var(--sg-text-secondary)', marginBottom: 24 }}>
          Scenario &quot;{scenarioId}&quot; does not exist in the library.
        </p>
        <Link href="/dashboard/training" className="sg-btn sg-btn-primary">
          ← Back to Training
        </Link>
      </div>
    )
  }

  return <TrainingExperience scenario={scenario} />
}
