import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { SimClock } from '../timeline'

// "Worker" by Quaternius, CC0 — see public/models/CREDITS.md
const MODEL_URL = '/models/worker.glb'
const MODEL_SCALE = 0.95
// Ground speed (m/s) the Walk clip looks right at when played at 1x
const WALK_CLIP_SPEED = 1.4

export interface WorkerPose {
  x: number
  y: number
  z: number
  rotY: number
  /** 0 = standing, 1 = walking */
  walk: number
  /** Signed ground speed in m/s; negative walks backwards */
  speed: number
  /** Animation used while not walking */
  base: 'Idle' | 'Interact'
}

interface Rig {
  mixer: THREE.AnimationMixer
  walk: THREE.AnimationAction
  idle: THREE.AnimationAction
  interact: THREE.AnimationAction
}

interface WorkerProps {
  clockRef: RefObject<SimClock>
  /** Writes the pose for scenario time `t` into `out`. */
  pose: (t: number, out: WorkerPose) => void
  children?: ReactNode
}

export function Worker({ clockRef, pose, children }: WorkerProps) {
  const { scene, animations } = useGLTF(MODEL_URL, false, true)
  const groupRef = useRef<THREE.Group>(null)
  const rigRef = useRef<Rig | null>(null)
  const poseRef = useRef<WorkerPose>({ x: 0, y: 0, z: 0, rotY: 0, walk: 0, speed: 0, base: 'Idle' })
  const lastT = useRef(0)

  // Skinned meshes need a skeleton-aware clone to be used more than once
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

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(model)
    const action = (name: string) => {
      const clip = THREE.AnimationClip.findByName(animations, name)
      if (!clip) throw new Error(`worker.glb is missing the "${name}" animation`)
      const a = mixer.clipAction(clip)
      a.play()
      return a
    }
    rigRef.current = { mixer, walk: action('Walk'), idle: action('Idle'), interact: action('Interact') }
    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(model)
      rigRef.current = null
    }
  }, [model, animations])

  useFrame(() => {
    const group = groupRef.current
    const rig = rigRef.current
    if (!group || !rig) return

    const t = clockRef.current.t
    let dt = t - lastT.current
    if (dt < 0 || dt > 0.2) dt = 0 // timeline looped or was reset
    lastT.current = t

    const p = poseRef.current
    pose(t, p)
    group.position.set(p.x, p.y, p.z)
    group.rotation.y = p.rotY

    rig.walk.setEffectiveWeight(p.walk)
    rig.walk.setEffectiveTimeScale(p.speed / WALK_CLIP_SPEED)
    rig.idle.setEffectiveWeight(p.base === 'Idle' ? 1 - p.walk : 0)
    rig.interact.setEffectiveWeight(p.base === 'Interact' ? 1 - p.walk : 0)
    rig.mixer.update(dt)
  })

  return (
    <group ref={groupRef}>
      <primitive object={model} scale={MODEL_SCALE} />
      {children}
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)
