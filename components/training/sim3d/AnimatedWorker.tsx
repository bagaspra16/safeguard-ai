'use client'

import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

// "Worker" by Quaternius, CC0 — see public/models/CREDITS.md
const MODEL_URL = '/models/worker.glb'

export type WorkerClip = 'Idle' | 'Walk' | 'Interact'

interface Props {
  clip: WorkerClip
  position?: [number, number, number]
  rotation?: number
  scale?: number
  /** Playback speed of the active clip */
  speed?: number
  children?: ReactNode
}

/** Rigged worker that cross-fades between its clips when `clip` changes. */
export const AnimatedWorker = forwardRef<THREE.Group, Props>(function AnimatedWorker(
  { clip, position = [0, 0, 0], rotation = 0, scale = 0.95, speed = 1, children },
  ref
) {
  const { scene, animations } = useGLTF(MODEL_URL, false, true)
  const model = useMemo(() => {
    const copy = clone(scene)
    copy.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.frustumCulled = false
      }
    })
    return copy
  }, [scene])

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const current = useRef<THREE.AnimationAction | null>(null)

  useEffect(() => {
    const c = THREE.AnimationClip.findByName(animations, clip)
    if (!c) return
    const next = mixer.clipAction(c)
    next.reset().setEffectiveTimeScale(speed).setEffectiveWeight(1).fadeIn(0.35).play()
    current.current?.fadeOut(0.35)
    current.current = next
  }, [clip, animations, mixer, speed])

  useEffect(() => () => {
    mixer.stopAllAction()
    mixer.uncacheRoot(model)
  }, [mixer, model])

  useFrame((_, dt) => mixer.update(Math.min(dt, 0.05)))

  return (
    <group ref={ref} position={position} rotation={[0, rotation, 0]}>
      <primitive object={model} scale={scale} />
      {children}
    </group>
  )
})

useGLTF.preload(MODEL_URL, false, true)
