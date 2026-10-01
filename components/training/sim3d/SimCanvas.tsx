'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useSimulationStore } from '@/lib/simulation/store'
import { SimAudio } from './audio'
import type { StepResult } from './ui'

/**
 * Shared canvas for the drills: capped pixel ratio that drops automatically
 * when the frame rate dips, soft shadows, and rendering halted while paused.
 */
export function SimCanvas({ children, fov = 68, background }: { children: ReactNode; fov?: number; background: string }) {
  const isPaused = useSimulationStore((s) => s.isPaused)
  const [maxDpr] = useState(() => (typeof window === 'undefined' ? 1 : Math.min(1.5, window.devicePixelRatio || 1)))
  const [dpr, setDpr] = useState(maxDpr)

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      frameloop={isPaused ? 'never' : 'always'}
      camera={{ fov, near: 0.05, far: 420, position: [0, 1.65, 0] }}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(Math.max(0.75, maxDpr * 0.66))}
        onIncline={() => setDpr(maxDpr)}
        onFallback={() => setDpr(0.75)}
      />
      <color attach="background" args={[background]} />
      {children}
    </Canvas>
  )
}

/** One synthesiser per drill; follows the global pause state. */
export function useSimAudio() {
  const [audio] = useState(() => new SimAudio())
  const isPaused = useSimulationStore((s) => s.isPaused)
  useEffect(() => audio.setPaused(isPaused), [audio, isPaused])
  useEffect(() => () => audio.dispose(), [audio])
  return audio
}

/** Attempts per step, for the mission checklist and the debrief. */
export function useStepResults() {
  const [results, setResults] = useState<Record<string, StepResult>>({})
  const record = useCallback((id: string, correct: boolean) => {
    setResults((r) => ({
      ...r,
      [id]: { attempts: (r[id]?.attempts ?? 0) + 1, done: correct || !!r[id]?.done },
    }))
  }, [])
  const reset = useCallback(() => setResults({}), [])
  return { results, record, reset }
}

/** setTimeout that is cancelled on unmount and respects pause. */
export function useSceneTimers() {
  const [timers] = useState(() => new Set<ReturnType<typeof setTimeout>>())
  useEffect(() => () => timers.forEach(clearTimeout), [timers])
  const after = useCallback(
    (ms: number, fn: () => void) => {
      const start = () => {
        const id = setTimeout(() => {
          timers.delete(id)
          if (useSimulationStore.getState().isPaused) {
            // Wait for resume, then run
            const unsub = useSimulationStore.subscribe((s) => {
              if (!s.isPaused) {
                unsub()
                fn()
              }
            })
          } else fn()
        }, ms)
        timers.add(id)
      }
      start()
    },
    [timers]
  )
  const clearAll = useCallback(() => {
    timers.forEach(clearTimeout)
    timers.clear()
  }, [timers])
  return { after, clearAll }
}
