'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

// First-person rig. All per-frame state lives in a mutable ref so moving and
// looking never re-render React — the scene logic reads the same ref.

export interface AutoWalk {
  target: THREE.Vector3
  /** Face the walking direction while moving */
  face?: boolean
  speed?: number
  onArrive?: () => void
}

export interface PlayerState {
  /** Feet position */
  pos: THREE.Vector3
  vel: THREE.Vector3
  yaw: number
  pitch: number
  roll: number
  eye: number
  eyeTarget: number
  /** Walking speed in m/s */
  speed: number
  /** Player can walk with the keyboard */
  canWalk: boolean
  /** Player can look around with mouse / touch drag */
  canLook: boolean
  /** Camera shake amount, decays on its own (0..1) */
  trauma: number
  /** When set, the view eases towards this point (cinematic focus) */
  focus: THREE.Vector3 | null
  focusRate: number
  autoWalk: AutoWalk | null
  /** Scripted camera; return true to skip the normal update this frame */
  script: ((s: PlayerState, dt: number, camera: THREE.Camera, t: number) => boolean) | null
  /** Time scale used by scripted slow-motion (1 = real time) */
  timeScale: number
  /** Camera zoom factor (1 = base FOV); eases towards zoomTarget */
  zoom: number
  zoomTarget: number
  moving: boolean
  bobPhase: number
}

export function createPlayer(pos: [number, number, number], yaw: number, pitch = 0, eye = 1.65): PlayerState {
  return {
    pos: new THREE.Vector3(...pos),
    vel: new THREE.Vector3(),
    yaw,
    pitch,
    roll: 0,
    eye,
    eyeTarget: eye,
    speed: 2.6,
    canWalk: false,
    canLook: true,
    trauma: 0,
    focus: null,
    focusRate: 2.5,
    autoWalk: null,
    script: null,
    timeScale: 1,
    zoom: 1,
    zoomTarget: 1,
    moving: false,
    bobPhase: 0,
  }
}

/** Shortest signed difference between two angles. */
export function angleDelta(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

/** Yaw/pitch that make a camera at `from` look at `to`. */
export function lookAngles(from: THREE.Vector3, to: THREE.Vector3) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dz = to.z - from.z
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }
}

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [1, 0],
  ArrowUp: [1, 0],
  KeyS: [-1, 0],
  ArrowDown: [-1, 0],
  KeyA: [0, -1],
  ArrowLeft: [0, -1],
  KeyD: [0, 1],
  ArrowRight: [0, 1],
}

interface Props {
  playerRef: React.RefObject<PlayerState>
  /** Clamp / collide the proposed position in place */
  constrain?: (next: THREE.Vector3, prev: THREE.Vector3) => void
  /** Called every frame after movement (trigger zones etc.) */
  onTick?: (s: PlayerState, dt: number) => void
  /** Notified once when the user first moves or looks (to hide hints) */
  onFirstInput?: () => void
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ')
const tmp = new THREE.Vector3()
const wish = new THREE.Vector3()

export function PlayerRig({ playerRef, constrain, onTick, onFirstInput }: Props) {
  const { gl } = useThree()
  const keys = useRef(new Set<string>())
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const firstInputSent = useRef(false)
  const baseFov = useRef<number | null>(null)
  const onFirstInputRef = useRef(onFirstInput)
  useEffect(() => {
    onFirstInputRef.current = onFirstInput
  }, [onFirstInput])

  const signalInput = () => {
    if (!firstInputSent.current) {
      firstInputSent.current = true
      onFirstInputRef.current?.()
    }
  }

  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA'
    }
    const down = (e: KeyboardEvent) => {
      if (isTyping()) return
      if (MOVE_KEYS[e.code]) {
        keys.current.add(e.code)
        if (playerRef.current.canWalk) signalInput()
        if (e.code.startsWith('Arrow')) e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [playerRef])

  useEffect(() => {
    const el = gl.domElement
    el.style.setProperty('touch-action', 'none')
    const onDown = (e: PointerEvent) => {
      if (!playerRef.current.canLook) return
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
      el.style.setProperty('cursor', 'grabbing')
    }
    const onMove = (e: PointerEvent) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      const s = playerRef.current
      if (!s.canLook) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      d.x = e.clientX
      d.y = e.clientY
      const sens = e.pointerType === 'touch' ? 0.006 : 0.0038
      s.yaw -= dx * sens
      s.pitch = THREE.MathUtils.clamp(s.pitch - dy * sens, -1.25, 1.25)
      // Manual look cancels any cinematic focus
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        s.focus = null
        signalInput()
      }
    }
    const onUp = (e: PointerEvent) => {
      if (drag.current?.id === e.pointerId) drag.current = null
      el.style.setProperty('cursor', 'grab')
    }
    el.style.setProperty('cursor', 'grab')
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl, playerRef])

  useFrame((state, rawDt) => {
    const camera = state.camera as THREE.PerspectiveCamera
    if (baseFov.current === null) baseFov.current = camera.fov
    const s = playerRef.current
    const realDt = Math.min(rawDt, 0.05)
    const dt = realDt * s.timeScale
    const t = state.clock.elapsedTime

    if (s.script && s.script(s, dt, camera, t)) {
      onTick?.(s, dt)
      return
    }

    // ── Desired velocity from keys or auto-walk ──
    wish.set(0, 0, 0)
    let speed = s.speed
    if (s.autoWalk) {
      const a = s.autoWalk
      tmp.subVectors(a.target, s.pos).setY(0)
      const dist = tmp.length()
      speed = a.speed ?? s.speed
      if (dist < 0.12) {
        s.autoWalk = null
        s.vel.set(0, 0, 0)
        a.onArrive?.()
      } else {
        wish.copy(tmp.normalize())
        if (dist < 0.8) speed *= Math.max(0.35, dist / 0.8)
        if (a.face !== false) {
          const targetYaw = Math.atan2(-wish.x, -wish.z)
          s.yaw += angleDelta(s.yaw, targetYaw) * (1 - Math.exp(-5 * dt))
          s.pitch += (-0.05 - s.pitch) * (1 - Math.exp(-3 * dt))
        }
      }
    } else if (s.canWalk) {
      let fwd = 0
      let strafe = 0
      for (const k of keys.current) {
        const m = MOVE_KEYS[k]
        if (m) {
          fwd += m[0]
          strafe += m[1]
        }
      }
      if (fwd || strafe) {
        const sin = Math.sin(s.yaw)
        const cos = Math.cos(s.yaw)
        wish.set(-sin * fwd + cos * strafe, 0, -cos * fwd - sin * strafe).normalize()
      }
    }

    // Smooth acceleration / deceleration
    const accel = 1 - Math.exp(-(wish.lengthSq() > 0 ? 9 : 12) * dt)
    s.vel.x += (wish.x * speed - s.vel.x) * accel
    s.vel.z += (wish.z * speed - s.vel.z) * accel
    const horizSpeed = Math.hypot(s.vel.x, s.vel.z)
    s.moving = horizSpeed > 0.15

    if (horizSpeed > 0.001) {
      tmp.copy(s.pos)
      s.pos.x += s.vel.x * dt
      s.pos.z += s.vel.z * dt
      constrain?.(s.pos, tmp)
    }

    // ── Cinematic focus ──
    if (s.focus) {
      tmp.copy(s.pos).setY(s.pos.y + s.eye)
      const want = lookAngles(tmp, s.focus)
      const k = 1 - Math.exp(-s.focusRate * realDt)
      s.yaw += angleDelta(s.yaw, want.yaw) * k
      s.pitch += (want.pitch - s.pitch) * k
    }

    // ── Eye height, head bob, shake ──
    s.eye += (s.eyeTarget - s.eye) * (1 - Math.exp(-6 * realDt))
    s.bobPhase += dt * horizSpeed * 4.2
    const bobAmt = Math.min(1, horizSpeed / 2.5)
    const bobY = Math.abs(Math.sin(s.bobPhase)) * 0.045 * bobAmt
    const bobX = Math.cos(s.bobPhase) * 0.025 * bobAmt
    const breathe = Math.sin(t * 1.4) * 0.006

    // Zoom (FOV) easing, used to inspect distant objects such as a mirror
    if (Math.abs(s.zoomTarget - s.zoom) > 0.001) {
      s.zoom += (s.zoomTarget - s.zoom) * (1 - Math.exp(-5 * realDt))
      camera.fov = baseFov.current / s.zoom
      camera.updateProjectionMatrix()
    }

    s.trauma = Math.max(0, s.trauma - rawDt * 0.9)
    const shake = s.trauma * s.trauma
    const sx = shake ? (Math.random() - 0.5) * 0.3 * shake : 0
    const sy = shake ? (Math.random() - 0.5) * 0.3 * shake : 0
    const sr = shake ? (Math.random() - 0.5) * 0.12 * shake : 0

    const sin = Math.sin(s.yaw)
    const cos = Math.cos(s.yaw)
    camera.position.set(
      s.pos.x + cos * bobX + sx,
      s.pos.y + s.eye + bobY + breathe + sy,
      s.pos.z - sin * bobX
    )
    euler.set(s.pitch, s.yaw, s.roll + sr + bobX * 0.15)
    camera.quaternion.setFromEuler(euler)

    onTick?.(s, dt)
  })

  return null
}
