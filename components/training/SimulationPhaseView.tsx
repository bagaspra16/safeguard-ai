'use client'

import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { SimulationHUD } from './SimulationHUD'
import { AITrainerPanel } from './AITrainerPanel'
import {
  Glasses,
  RotateCcw,
  ShieldAlert,
  Eye,
  Crosshair,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  XCircle,
  UserCheck,
  MousePointer,
  AlertOctagon,
  Award,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'

// ─── Web Audio Procedural Sound Synthesizer ──────────────────────────────────

class SafetySoundEngine {
  private ctx: AudioContext | null = null
  public enabled: boolean = true

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
  }

  playHorn() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc1.type = 'sawtooth'
      osc2.type = 'sawtooth'
      osc1.frequency.setValueAtTime(380, t)
      osc2.frequency.setValueAtTime(475, t)

      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)

      osc1.start(t)
      osc2.start(t)
      osc1.stop(t + 0.65)
      osc2.stop(t + 0.65)
    } catch {}
  }

  playRapidHorns() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      ;[0, 0.2, 0.4].forEach((offset) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(440, t + offset)
        gain.gain.setValueAtTime(0.22, t + offset)
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(t + offset)
        osc.stop(t + offset + 0.15)
      })
    } catch {}
  }

  playSlowMoWhoosh() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, t)
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.9)

      gain.gain.setValueAtTime(0.22, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(t)
      osc.stop(t + 0.9)
    } catch {}
  }

  playSuccessChime() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((f, i) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(f, t + i * 0.08)
        gain.gain.setValueAtTime(0.12, t + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.4)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(t + i * 0.08)
        osc.stop(t + i * 0.08 + 0.4)
      })
    } catch {}
  }

  playHappyCelebrationSound() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const melody = [
        { f: 523.25, time: 0, dur: 0.18 }, // C5
        { f: 659.25, time: 0.18, dur: 0.18 }, // E5
        { f: 783.99, time: 0.36, dur: 0.22 }, // G5
        { f: 1046.5, time: 0.58, dur: 0.45 }, // C6
        { f: 1318.51, time: 0.8, dur: 0.6 }, // E6
      ]

      melody.forEach((note) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(note.f, t + note.time)
        gain.gain.setValueAtTime(0.2, t + note.time)
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(t + note.time)
        osc.stop(t + note.time + note.dur)
      })
    } catch {}
  }

  playWrongBuzzer() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(160, t)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    } catch {}
  }

  playCrashSound() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, t)
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.8)
      gain.gain.setValueAtTime(0.45, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.8)

      const noiseOsc = this.ctx.createOscillator()
      const noiseGain = this.ctx.createGain()
      noiseOsc.type = 'square'
      noiseOsc.frequency.setValueAtTime(650, t)
      noiseOsc.frequency.linearRampToValueAtTime(150, t + 0.6)
      noiseGain.gain.setValueAtTime(0.3, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      noiseOsc.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noiseOsc.start(t)
      noiseOsc.stop(t + 0.6)
    } catch {}
  }
}

const soundEngine = new SafetySoundEngine()

// ─── First-Person Controller Rig with PC WASD & Mouse Look ───────────────────

function FirstPersonController({
  playerPos,
  setPlayerPos,
  yaw,
  setYaw,
  pitch,
  setPitch,
  viewMode,
  isSlowMo,
  isCrashing,
  timeScale,
}: {
  playerPos: [number, number, number]
  setPlayerPos: (fn: (prev: [number, number, number]) => [number, number, number]) => void
  yaw: number
  setYaw: (fn: (prev: number) => number) => void
  pitch: number
  setPitch: (fn: (prev: number) => number) => void
  viewMode: 'fpv' | 'orbit'
  isSlowMo: boolean
  isCrashing: boolean
  timeScale: number
}) {
  const { camera, gl } = useThree()
  const keysRef = useRef<Record<string, boolean>>({})
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const handsRef = useRef<THREE.Group>(null)
  const shakeOffsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = gl.domElement
    const onMouseDown = (e: MouseEvent) => {
      if (viewMode !== 'fpv') return
      isDraggingRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || viewMode !== 'fpv') return
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }

      const sensitivity = 0.0035
      setYaw((prev) => prev - dx * sensitivity)
      setPitch((prev) => Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, prev - dy * sensitivity)))
    }
    const onMouseUp = () => {
      isDraggingRef.current = false
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [gl, viewMode, setYaw, setPitch])

  useFrame((state, delta) => {
    if (viewMode !== 'fpv') return

    if (isCrashing) {
      shakeOffsetRef.current = {
        x: (Math.random() - 0.5) * 0.18,
        y: (Math.random() - 0.5) * 0.18,
      }
    } else {
      shakeOffsetRef.current = { x: 0, y: 0 }
    }

    let moveX = 0
    let moveZ = 0
    const keys = keysRef.current
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1

    const isMoving = moveX !== 0 || moveZ !== 0
    if (isMoving && !isCrashing) {
      const speed = (isSlowMo ? 0.6 : 3.5) * timeScale * delta
      const forwardX = Math.sin(yaw)
      const forwardZ = Math.cos(yaw)
      const rightX = Math.cos(yaw)
      const rightZ = -Math.sin(yaw)

      const dx = (forwardX * moveZ + rightX * moveX) * speed
      const dz = (forwardZ * moveZ + rightZ * moveX) * speed

      setPlayerPos(([px, py, pz]) => [
        Math.max(-14, Math.min(6, px + dx)),
        py,
        Math.max(-8, Math.min(8, pz + dz)),
      ])
    }

    const eyeHeight = isCrashing ? 0.4 : 1.65
    camera.position.set(
      playerPos[0] + shakeOffsetRef.current.x,
      eyeHeight + shakeOffsetRef.current.y,
      playerPos[2]
    )

    const euler = new THREE.Euler(pitch + (isCrashing ? 0.75 : 0), yaw, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)

    if (handsRef.current) {
      const t = state.clock.getElapsedTime()
      const bob = isMoving ? Math.sin(t * 10) * 0.015 : Math.sin(t * 2) * 0.004
      handsRef.current.position.set(0.04, -0.36 + bob, -0.52)
    }
  })

  if (viewMode !== 'fpv') return null

  return (
    <group ref={handsRef}>
      <group position={[0.04, -0.05, 0]} rotation={[0.4, 0.05, -0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.18, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {[
          [-0.13, 0.09],
          [0.13, 0.09],
          [-0.13, -0.09],
          [0.13, -0.09],
        ].map(([cx, cy], i) => (
          <mesh key={i} position={[cx, cy, 0]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.23, 0.15]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} roughness={0.1} />
        </mesh>
      </group>

      <group position={[-0.16, -0.06, 0.05]} rotation={[0.5, 0.3, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.12, 0.09]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} />
        </mesh>
        <mesh position={[-0.04, -0.16, -0.05]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.048, 0.28, 10]} />
          <meshStandardMaterial color="#84cc16" roughness={0.5} />
        </mesh>
      </group>
      <group position={[0.2, -0.06, 0.05]} rotation={[0.5, -0.3, 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.12, 0.09]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} />
        </mesh>
        <mesh position={[0.04, -0.16, -0.05]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.048, 0.28, 10]} />
          <meshStandardMaterial color="#84cc16" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Forklift Entity Driving Down Z Cross-Aisle ───────────────────────────────

function Forklift({
  forkliftZ,
  beaconIntensity,
}: {
  forkliftZ: number
  beaconIntensity: number
}) {
  return (
    <group position={[0, 0, forkliftZ]} rotation={[0, 0, 0]}>
      {/* Driver seated inside */}
      <group position={[0, 0.85, 0.1]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.34, 0.38, 0.2]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.54, 0]} castShadow>
          <sphereGeometry args={[0.095, 12, 12]} />
          <meshStandardMaterial color="#d4a373" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.115, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* Main CAT-Yellow Chassis */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.7, 2.2]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Rear Counterweight & Hazard Striping */}
      <mesh position={[0, 0.75, 0.85]} castShadow>
        <boxGeometry args={[1.38, 0.85, 0.7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.5} />
      </mesh>
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.42, 1.21]}>
          <planeGeometry args={[0.07, 0.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#f59e0b' : '#111827'} roughness={0.5} />
        </mesh>
      ))}

      {/* ROPS Overhead Protective Steel Cage */}
      {[
        [-0.58, 1.45, -0.7],
        [0.58, 1.45, -0.7],
        [-0.58, 1.45, 0.4],
        [0.58, 1.45, 0.4],
      ].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow>
          <boxGeometry args={[0.08, 1.2, 0.08]} />
          <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 2.06, -0.15]} castShadow>
        <boxGeometry args={[1.28, 0.05, 1.25]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Dual Steel Mast & Carriage facing -Z */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 1.9, -1.15]} castShadow>
          <boxGeometry args={[0.1, 2.7, 0.12]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.8, -1.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} />
      </mesh>

      {/* Forged Steel Forks pointing towards -Z */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.15, -1.29]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.12, 0.55, 0.06]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.02, -0.65]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.05, 1.25]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Heavy-Duty Pneumatic Wheels */}
      {[
        [-0.68, 0.32, 0.7],
        [0.68, 0.32, 0.7],
        [-0.68, 0.38, -0.75],
        [0.68, 0.38, -0.75],
      ].map(([wx, wy, wz], i) => (
        <mesh key={i} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wz < 0 ? 0.38 : 0.32, wz < 0 ? 0.38 : 0.32, 0.26, 18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} />
        </mesh>
      ))}

      {/* Amber Strobe Beacon on Roof */}
      <mesh position={[0, 2.18, 0.6]}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={beaconIntensity} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 2.3, 0.6]} color="#f59e0b" distance={10} intensity={beaconIntensity} />

      {/* Front Spotlights pointing forward (-Z) */}
      {[-0.45, 0.45].map((x, i) => (
        <group key={i} position={[x, 1.45, -1.15]}>
          <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.065, 14]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
          </mesh>
          <spotLight
            position={[0, 0, -0.1]}
            target-position={[x, -1.4, -10]}
            angle={0.5}
            penumbra={0.4}
            intensity={5}
            color="#fff8e7"
            castShadow
          />
        </group>
      ))}

      {/* Blue Safety Floor Projection Light (4m ahead along -Z) */}
      <mesh position={[0, 0.03, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={4} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// ─── Epoxy Floor & High-Contrast Markings ─────────────────────────────────────

function WarehouseFloor({ showClearanceHalo }: { showClearanceHalo: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#22262c" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Pedestrian Walkway along X at z = 0 (Green OSHA Walkway) */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 2.4]} />
        <meshStandardMaterial color="#1e3a2b" roughness={0.6} />
      </mesh>
      {[-1.2, 1.2].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 0.16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
      ))}

      {/* Vehicle Cross-Aisle Lane along Z at x = 0 */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 30]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.5} />
      </mesh>

      {/* Intersection Crosswalk Zebra Stripes */}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 2.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      ))}

      {/* Critical Red Stop Line for Pedestrians at x = -3.5 */}
      <mesh position={[-3.5, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 2.6]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* Safe Clearance Halo when user yields correctly */}
      {showClearanceHalo && (
        <mesh position={[-3.5, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 2.2, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} transparent opacity={0.65} />
        </mesh>
      )}

      {/* Stenciled Warning Text */}
      <Html position={[-3.6, 0.04, -0.9]} rotation={[-Math.PI / 2, 0, 0]} transform>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: '#f59e0b',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        >
          STOP • LOOK BOTH WAYS • PEDESTRIAN YIELD
        </div>
      </Html>
    </group>
  )
}

// ─── Heavy Industrial Pallet Racks ───────────────────────────────────────────

function PalletRack({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[
        [-1.8, 1.9, 0.55],
        [-1.8, 1.9, -0.55],
        [1.8, 1.9, 0.55],
        [1.8, 1.9, -0.55],
      ].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow>
          <boxGeometry args={[0.1, 3.8, 0.1]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {[0.4, 1.6, 2.8].map((y, li) => (
        <group key={li} position={[0, y, 0]}>
          {[-0.55, 0.55].map((z, bi) => (
            <mesh key={bi} position={[0, 0, z]} castShadow receiveShadow>
              <boxGeometry args={[3.7, 0.12, 0.08]} />
              <meshStandardMaterial color="#ea580c" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
          {[-1.0, 1.0].map((px, pi) => (
            <group key={pi} position={[px, 0.15, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.2, 0.7, 0.9]} />
                <meshStandardMaterial color="#92400e" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0, 0.46]}>
                <planeGeometry args={[0.3, 0.2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

// ─── Subtle Blind Spot Pointing Target (Right Corner Only) ─────────────────

function BlindSpotTarget({
  position,
  id,
  label,
  onSelect,
}: {
  position: [number, number, number]
  id: string
  label: string
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const isSelected = detectedHazards.includes(id)

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onSelect(id)
  }

  return (
    <group position={position}>
      {/* Visible interactive hazard marker */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'crosshair'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial
          color={isSelected ? '#10b981' : hovered ? '#f59e0b' : '#38bdf8'}
          emissive={isSelected ? '#10b981' : hovered ? '#f59e0b' : '#0284c7'}
          emissiveIntensity={isSelected ? 1.8 : hovered ? 2.0 : 0.8}
          transparent
          opacity={isSelected ? 0.75 : hovered ? 0.55 : 0.3}
          wireframe
        />
      </mesh>

      {/* Outer subtle concentric indicator ring for visibility */}
      {!isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.78, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {hovered && (
        <Html center position={[0, 0.9, 0]}>
          <div
            onClick={handleClick}
            style={{
              background: 'rgba(13, 15, 17, 0.95)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'crosshair',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              border: '1px solid rgba(245,158,11,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Crosshair size={13} color="#f59e0b" />
            <span>Identify: {label}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Overhead Convex Blind-Corner Mirror ─────────────────────────────────────

function ConvexSafetyMirror({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0.3, 0, 0.3]} rotation={[0.4, -Math.PI / 4, 0]}>
        <torusGeometry args={[0.46, 0.04, 12, 28]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0, 0.3]} rotation={[0.4, -Math.PI / 4, 0]}>
        <sphereGeometry args={[0.44, 20, 20, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.05} />
      </mesh>
    </group>
  )
}

// ─── In-Scene 3D Simulation World ─────────────────────────────────────────────

function SimulationWorld({
  viewMode,
  isSlowMo,
  timeScale,
  playerPos,
  setPlayerPos,
  yaw,
  setYaw,
  pitch,
  setPitch,
  scenarioStage,
  forkliftZ,
  beaconIntensity,
  showClearanceHalo,
  onBlindSpotSelected,
  onDecisionAnswer,
  onContinueVideo,
  decisionMade,
  decisionCorrect,
  isCrashing,
}: {
  viewMode: 'fpv' | 'orbit'
  isSlowMo: boolean
  timeScale: number
  playerPos: [number, number, number]
  setPlayerPos: (fn: (prev: [number, number, number]) => [number, number, number]) => void
  yaw: number
  setYaw: (fn: (prev: number) => number) => void
  pitch: number
  setPitch: (fn: (prev: number) => number) => void
  scenarioStage: 'walking' | 'pointing' | 'deciding' | 'animating_correct' | 'animating_wrong' | 'resolved'
  forkliftZ: number
  beaconIntensity: number
  showClearanceHalo: boolean
  onBlindSpotSelected: (id: string) => void
  onDecisionAnswer: (correct: boolean) => void
  onContinueVideo: () => void
  decisionMade: boolean
  decisionCorrect: boolean | null
  isCrashing: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[12, 18, 10]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-6, 7, 0]} intensity={1.2} color="#ffffff" distance={20} />
      <pointLight position={[6, 7, 0]} intensity={1.2} color="#f0f4ff" distance={20} />

      <FirstPersonController
        playerPos={playerPos}
        setPlayerPos={setPlayerPos}
        yaw={yaw}
        setYaw={setYaw}
        pitch={pitch}
        setPitch={setPitch}
        viewMode={viewMode}
        isSlowMo={isSlowMo}
        isCrashing={isCrashing}
        timeScale={timeScale}
      />

      <Forklift forkliftZ={forkliftZ} beaconIntensity={beaconIntensity} />

      <WarehouseFloor showClearanceHalo={showClearanceHalo} />

      {/* Pallet Racks forming the blind corner on +Z cross-aisle */}
      <PalletRack position={[-2.0, 0, 2.5]} rotation={Math.PI / 2} />
      <PalletRack position={[-2.0, 0, -2.5]} rotation={Math.PI / 2} />
      <PalletRack position={[2.0, 0, 2.5]} rotation={Math.PI / 2} />
      <PalletRack position={[2.0, 0, -2.5]} rotation={Math.PI / 2} />

      {/* Overhead Convex Mirror */}
      <ConvexSafetyMirror position={[-1.5, 3.2, 2.0]} />

      {/* Single clean Blind Spot target at the corner rack */}
      {scenarioStage === 'pointing' && (
        <BlindSpotTarget
          position={[-2.0, 1.5, 2.5]}
          id="blind-corner-01"
          label="Blind Corner Pallet Rack"
          onSelect={onBlindSpotSelected}
        />
      )}

      {/* Stage 2: Neutral In-World Decision Dilemma (No green/red giveaway colors!) */}
      {scenarioStage === 'deciding' && !decisionMade && (
        <Html position={[-3.5, 1.8, 0]} center>
          <div
            style={{
              background: 'rgba(19, 22, 26, 0.98)',
              border: '1px solid var(--sg-border)',
              borderRadius: 14,
              padding: '24px 30px',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(16px)',
              minWidth: 420,
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'var(--sg-bg-elevated)',
                border: '1px solid var(--sg-border)',
                color: 'var(--sg-text-secondary)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              <ShieldAlert size={13} color="var(--sg-accent)" /> Procedural Safety Decision
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: 'var(--sg-text-primary)' }}>
              Forklift Horn Echoes at Blind Intersection
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.5 }}>
              You have approached the cross-aisle boundary line. Select your required operational protocol:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => onDecisionAnswer(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 8,
                  background: 'var(--sg-bg-elevated)',
                  border: '1px solid var(--sg-border)',
                  color: 'var(--sg-text-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  A
                </div>
                <span>Come to a full stop before the red line, verify overhead convex mirror, and yield right-of-way</span>
              </button>

              <button
                onClick={() => onDecisionAnswer(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 8,
                  background: 'var(--sg-bg-elevated)',
                  border: '1px solid var(--sg-border)',
                  color: 'var(--sg-text-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  B
                </div>
                <span>Accelerate pace across the intersection before the approaching vehicle reaches the crossing</span>
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Outcome Debrief Modal */}
      {scenarioStage === 'resolved' && decisionMade && decisionCorrect !== null && (
        <Html position={[-3.5, 2.0, 0]} center>
          <div
            style={{
              background: 'rgba(19, 22, 26, 0.98)',
              border: `1px solid ${decisionCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: 16,
              padding: '26px 34px',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(16px)',
              maxWidth: 420,
              boxShadow: `0 20px 60px ${decisionCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: decisionCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: `1px solid ${decisionCorrect ? '#10b981' : '#ef4444'}`,
              }}
            >
              {decisionCorrect ? <ShieldCheck size={24} color="#10b981" /> : <AlertOctagon size={24} color="#ef4444" />}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: decisionCorrect ? '#10b981' : '#ef4444' }}>
              {decisionCorrect ? 'Procedural Standard Verified' : 'Critical Vehicle Collision Impact'}
            </h3>

            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--sg-text-secondary)', lineHeight: 1.5 }}>
              {decisionCorrect
                ? 'You stopped safely prior to the designated stop line and verified mirror reflections. The forklift cleared the intersection with compliant pedestrian-vehicle separation.'
                : 'Entering an obstructed crossing zone without stopping resulted in a direct pedestrian strike by a 3,000kg forklift. Always respect vehicle right-of-way.'}
            </p>

            <button
              onClick={onContinueVideo}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                background: decisionCorrect ? 'var(--sg-primary)' : 'var(--sg-accent)',
                border: 'none',
                color: decisionCorrect ? '#ffffff' : '#000000',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {decisionCorrect ? 'Proceed to Benchmark Video →' : 'Review Correct Procedure Video →'}
            </button>
          </div>
        </Html>
      )}

      {viewMode === 'orbit' && (
        <OrbitControls
          enablePan
          minDistance={3}
          maxDistance={24}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2.05}
          target={[-2, 1.2, 0]}
        />
      )}
    </>
  )
}

// ─── Main Simulation Phase View ───────────────────────────────────────────────

interface Props {
  scenario: Scenario
}

export function SimulationPhaseView({ scenario }: Props) {
  const phase = useSimulationStore((s) => s.phase)
  const setPhase = useSimulationStore((s) => s.setPhase)
  const makeDecision = useSimulationStore((s) => s.makeDecision)
  const detectHazard = useSimulationStore((s) => s.detectHazard)
  const decisionMade = useSimulationStore((s) => s.decisionMade)
  const decisionCorrect = useSimulationStore((s) => s.decisionCorrect)
  const addAIMessage = useSimulationStore((s) => s.addAIMessage)
  const vrAvailable = useSimulationStore((s) => s.vrAvailable)
  const setVrAvailable = useSimulationStore((s) => s.setVrAvailable)
  const setVrMode = useSimulationStore((s) => s.setVrMode)
  const reset = useSimulationStore((s) => s.reset)

  // Camera & Movement State
  const [viewMode, setViewMode] = useState<'fpv' | 'orbit'>('fpv')
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-9, 0, 0])
  const [yaw, setYaw] = useState<number>(-Math.PI / 2)
  const [pitch, setPitch] = useState<number>(0)

  // Forklift State along Z
  const [forkliftZ, setForkliftZ] = useState(12)
  const [beaconIntensity, setBeaconIntensity] = useState(2.0)

  // Multi-Stage Scenario Flow
  const [scenarioStage, setScenarioStage] = useState<
    'walking' | 'pointing' | 'deciding' | 'animating_correct' | 'animating_wrong' | 'resolved'
  >('walking')
  const [isSlowMo, setIsSlowMo] = useState(false)
  const [timeScale, setTimeScale] = useState(1.0)
  const [isCrashing, setIsCrashing] = useState(false)
  const [showClearanceHalo, setShowClearanceHalo] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)

  // Detect WebXR
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      ;(navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr
        ?.isSessionSupported('immersive-vr')
        .then((supported) => setVrAvailable(supported))
        .catch(() => setVrAvailable(false))
    }
  }, [setVrAvailable])

  // Initial auto-walking along green road towards red line (x = -4.2)
  useEffect(() => {
    if (scenarioStage !== 'walking') return
    const interval = setInterval(() => {
      setPlayerPos(([px, py, pz]) => {
        const nextX = px + 0.075 * timeScale
        if (nextX >= -4.2) {
          soundEngine.playHorn()
          soundEngine.playSlowMoWhoosh()
          setIsSlowMo(true)
          setTimeScale(0.1)
          setScenarioStage('pointing')
          addAIMessage({
            role: 'assistant',
            content:
              'Vehicle Warning: Approaching machinery detected. Identify the blind corner storage rack obstructing the cross-aisle sightline.',
            response: { type: 'warning', message: '' },
          })
          return [-4.2, py, pz]
        }
        return [nextX, py, pz]
      })

      setForkliftZ((prev) => Math.max(prev - 0.12 * timeScale, 4.5))
    }, 40)
    return () => clearInterval(interval)
  }, [scenarioStage, timeScale, addAIMessage])

  // Handle Blind Spot Selection
  const handleBlindSpotSelected = (id: string) => {
    detectHazard(id)
    soundEngine.playSuccessChime()
    setScenarioStage('deciding')
    addAIMessage({
      role: 'assistant',
      content:
        'Hazard confirmed: Blind corner racking identified. Now select your required operational protocol.',
      response: { type: 'training_feedback', message: '', correct: true },
    })
  }

  // Handle Decision Answer with Smooth Post-Answer Animation
  const handleDecisionAnswer = (correct: boolean) => {
    makeDecision(correct)
    setIsSlowMo(false)
    setTimeScale(1.0)

    if (correct) {
      setScenarioStage('animating_correct')
      soundEngine.playHappyCelebrationSound()
      setShowClearanceHalo(true)

      let fZ = 4.5
      const animInterval = setInterval(() => {
        fZ -= 0.35
        setForkliftZ(fZ)
        if (fZ <= -10) {
          clearInterval(animInterval)
          setScenarioStage('resolved')
          setPhase('outcome_correct')
          addAIMessage({
            role: 'assistant',
            content:
              'Standard verified: Maintained position behind the designated stop line. The vehicle has cleared the intersection safely.',
            response: { type: 'training_feedback', message: '', correct: true },
          })
        }
      }, 40)
    } else {
      setScenarioStage('animating_wrong')
      soundEngine.playRapidHorns()

      let pX = -4.2
      let fZ = 4.5
      let ticks = 0

      const animInterval = setInterval(() => {
        ticks++
        if (pX < -0.5) pX += 0.1
        setPlayerPos([pX, 0, 0])

        fZ -= 0.4
        setForkliftZ(fZ)

        if (fZ <= 0.8 && !isCrashing) {
          setIsCrashing(true)
          soundEngine.playCrashSound()
        }

        if (ticks >= 45) {
          clearInterval(animInterval)
          setScenarioStage('resolved')
          setPhase('outcome_incorrect')
          addAIMessage({
            role: 'assistant',
            content:
              'Incident recorded: Failure to yield at an obstructed intersection resulted in a direct pedestrian strike by mobile equipment.',
            response: { type: 'warning', message: '', correct: false },
          })
        }
      }, 40)
    }
  }

  const handleContinueVideo = () => {
    setPhase('positive_video')
  }

  const handleEnterVR = async () => {
    if (!vrAvailable) return
    try {
      const xr = (navigator as Navigator & { xr?: WebXR }).xr
      if (xr) {
        const session = await xr.requestSession('immersive-vr', {
          requiredFeatures: ['local-floor'],
          optionalFeatures: ['hand-tracking'],
        })
        setVrMode(true)
        session.addEventListener('end', () => setVrMode(false))
      }
    } catch (e) {
      console.warn('VR session initialization failed:', e)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 56px)', userSelect: 'none' }}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [-9, 1.65, 0], fov: 65 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#0d0f11' }}
      >
        <fog attach="fog" args={['#0d0f11', 16, 45]} />
        <Suspense fallback={null}>
          <SimulationWorld
            viewMode={viewMode}
            isSlowMo={isSlowMo}
            timeScale={timeScale}
            playerPos={playerPos}
            setPlayerPos={setPlayerPos}
            yaw={yaw}
            setYaw={setYaw}
            pitch={pitch}
            setPitch={setPitch}
            scenarioStage={scenarioStage}
            forkliftZ={forkliftZ}
            beaconIntensity={beaconIntensity}
            showClearanceHalo={showClearanceHalo}
            onBlindSpotSelected={handleBlindSpotSelected}
            onDecisionAnswer={handleDecisionAnswer}
            onContinueVideo={handleContinueVideo}
            decisionMade={decisionMade}
            decisionCorrect={decisionCorrect}
            isCrashing={isCrashing}
          />
        </Suspense>
      </Canvas>

      {/* Reticle Pointer in First Person View */}
      {viewMode === 'fpv' && !decisionMade && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${isSlowMo ? '#f59e0b' : 'rgba(255,255,255,0.7)'}`,
              background: isSlowMo ? 'rgba(245,158,11,0.3)' : 'transparent',
              boxShadow: isSlowMo ? '0 0 14px #f59e0b' : 'none',
            }}
          />
        </div>
      )}

      {/* Crash Red Flash Impact Vignette */}
      {isCrashing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'rgba(239, 68, 68, 0.45)',
            boxShadow: 'inset 0 0 120px #ef4444',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.85)',
              padding: '16px 32px',
              borderRadius: 12,
              border: '2px solid #ef4444',
              color: '#ef4444',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <AlertOctagon size={26} /> VEHICLE COLLISION DETECTED
          </div>
        </div>
      )}

      {/* Slow-Motion Time-Dilation Vignette */}
      {isSlowMo && !isCrashing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 100px rgba(245, 158, 11, 0.45)',
            border: '2px solid rgba(245,158,11,0.6)',
            zIndex: 15,
          }}
        />
      )}

      {/* HUD Overlay */}
      <SimulationHUD />

      {/* Top Center Camera & Audio Bar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(13, 15, 17, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: 999,
          border: '1px solid var(--sg-border)',
        }}
      >
        <button
          onClick={() => setViewMode(viewMode === 'fpv' ? 'orbit' : 'fpv')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 999,
            background: viewMode === 'fpv' ? 'var(--sg-accent)' : 'transparent',
            color: viewMode === 'fpv' ? '#000000' : 'var(--sg-text-secondary)',
            border: 'none',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <UserCheck size={14} /> {viewMode === 'fpv' ? 'First-Person FPV (VR View)' : 'Tactical 3D Orbit'}
        </button>

        <div style={{ width: 1, height: 14, background: 'var(--sg-border)' }} />

        <button
          onClick={() => {
            soundEngine.enabled = !soundEngine.enabled
            setSoundMuted(!soundEngine.enabled)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: soundMuted ? '#ef4444' : 'var(--sg-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
          }}
        >
          {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Bottom Controls Helper Bar in FPV Mode */}
      {viewMode === 'fpv' && !decisionMade && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            zIndex: 30,
            background: 'rgba(13, 15, 17, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--sg-border)',
            fontSize: 12,
            color: 'var(--sg-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ padding: '2px 6px', background: 'var(--sg-bg-elevated)', borderRadius: 4, fontWeight: 700, color: '#fff' }}>
              WASD / Arrows
            </span>{' '}
            Walk on Walkway
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MousePointer size={14} color="var(--sg-accent)" /> Drag Mouse to Look 360°
          </span>
        </div>
      )}

      {/* Floating AI Trainer */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          right: 16,
          zIndex: 30,
          width: 310,
        }}
      >
        <AITrainerPanel scenario={scenario} compact />
      </div>

      {/* VR Launch & Replay Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {vrAvailable ? (
          <button
            className="sg-btn sg-btn-vr"
            onClick={handleEnterVR}
            style={{ fontSize: 13, padding: '8px 16px', gap: 6, fontWeight: 700 }}
          >
            <Glasses size={16} /> Enter Immersive WebXR VR
          </button>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: 'var(--sg-text-muted)',
              padding: '6px 12px',
              background: 'rgba(13,15,17,0.85)',
              borderRadius: 6,
              border: '1px solid var(--sg-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Eye size={13} color="var(--sg-accent)" /> FPV Realistic Simulator Active
          </div>
        )}
        <button
          onClick={() => {
            reset()
            setPlayerPos([-9, 0, 0])
            setForkliftZ(12)
            setYaw(-Math.PI / 2)
            setPitch(0)
            setScenarioStage('walking')
            setIsSlowMo(false)
            setTimeScale(1.0)
            setIsCrashing(false)
            setShowClearanceHalo(false)
            setPhase('simulation_active')
          }}
          className="sg-btn sg-btn-secondary"
          style={{ fontSize: 12, padding: '8px 14px', gap: 6 }}
        >
          <RotateCcw size={13} /> Replay Scenario
        </button>
      </div>
    </div>
  )
}

interface WebXR {
  isSessionSupported: (mode: string) => Promise<boolean>
  requestSession: (
    mode: string,
    options?: Record<string, unknown>
  ) => Promise<{ addEventListener: (event: string, cb: () => void) => void }>
}
