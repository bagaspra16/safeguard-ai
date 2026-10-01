'use client'

import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { SimulationHUD } from './SimulationHUD'
import {
  Glasses,
  RotateCcw,
  ShieldAlert,
  Eye,
  Crosshair,
  Volume2,
  VolumeX,
  UserCheck,
  MousePointer,
  AlertOctagon,
  ShieldCheck,
  Flame,
  Wind,
  Bomb,
  AlertTriangle,
  DoorClosed,
  Bell,
  Sparkles,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

// ─── Procedural Sound Engine with Explosive Blast & Fire Synthesizer ───────────

class FireSoundEngine {
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

  playExplosion() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime

      // 1. Deep sub-bass punch (40Hz to 15Hz rumble)
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, t)
      osc.frequency.exponentialRampToValueAtTime(25, t + 1.2)
      gain.gain.setValueAtTime(0.9, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 1.8)

      // 2. High energy noise burst (explosive detonation crack)
      const bufferSize = this.ctx.sampleRate * 1.5
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(3200, t)
      filter.frequency.exponentialRampToValueAtTime(180, t + 1.5)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.8, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noise.start(t)
      noise.stop(t + 1.5)
    } catch {}
  }

  playAlarm() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      ;[0, 0.35, 0.7].forEach((offset) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(880, t + offset)
        osc.frequency.setValueAtTime(660, t + offset + 0.15)
        gain.gain.setValueAtTime(0.28, t + offset)
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.28)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(t + offset)
        osc.stop(t + offset + 0.28)
      })
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
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.6)
    } catch {}
  }
}

const soundEngine = new FireSoundEngine()

// ─── 3D Realistic Industrial Factory Floor & Paint Storage Room ──────────────

function IndustrialFactoryBuilding({ isExploded }: { isExploded: boolean }) {
  const concreteMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85, metalness: 0.1 }),
    []
  )
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7, metalness: 0.2 }),
    []
  )
  const metalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.35, metalness: 0.8 }),
    []
  )
  const yellowStripeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 }),
    []
  )

  return (
    <group>
      {/* Heavy Polished Concrete Factory Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <primitive object={concreteMat} attach="material" />
      </mesh>

      {/* Safety Walkway Striping */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.01, 0]}>
        <planeGeometry args={[2.5, 36]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      {[-4.25, -1.75].map((x, i) => (
        <mesh key={`stripe-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
          <planeGeometry args={[0.15, 36]} />
          <primitive object={yellowStripeMat} attach="material" />
        </mesh>
      ))}

      {/* Factory Perimeter Walls */}
      {/* North Wall */}
      <mesh position={[0, 6, -18]} receiveShadow>
        <boxGeometry args={[58, 12, 0.5]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* South Wall with Emergency Exit Door */}
      <mesh position={[0, 6, 18]} receiveShadow>
        <boxGeometry args={[58, 12, 0.5]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* West Wall */}
      <mesh position={[-28, 6, 0]} receiveShadow>
        <boxGeometry args={[0.5, 12, 36]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* East Wall (Behind Paint Room) */}
      <mesh position={[28, 6, 0]} receiveShadow>
        <boxGeometry args={[0.5, 12, 36]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Steel Roof Trusses & Structural Columns */}
      {[-20, -10, 0, 10, 20].map((x, i) => (
        <group key={`column-pair-${i}`} position={[x, 6, 0]}>
          <mesh position={[0, 0, -17]} material={metalMat}>
            <boxGeometry args={[0.6, 12, 0.6]} />
          </mesh>
          <mesh position={[0, 0, 17]} material={metalMat}>
            <boxGeometry args={[0.6, 12, 0.6]} />
          </mesh>
          {/* Overhead Steel Truss */}
          <mesh position={[0, 5.5, 0]} material={metalMat}>
            <boxGeometry args={[0.4, 0.8, 34]} />
          </mesh>
        </group>
      ))}

      {/* Industrial Ventilation Ducting System */}
      <mesh position={[0, 10, -5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 50, 16]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* ── Paint Storage Hazardous Chemical Isolation Enclosure (East Room) ── */}
      <group position={[14, 0, -6]}>
        {/* Paint Room Containment Wall */}
        <mesh position={[-7, 3.5, 0]} receiveShadow>
          <boxGeometry args={[0.3, 7, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Paint Room Top Header */}
        <mesh position={[0, 6.8, 0]}>
          <boxGeometry args={[14, 0.6, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Heavy Chemical Storage Metal Racks inside room */}
        {[-3, 3].map((z, i) => (
          <group key={`rack-${i}`} position={[2, 0, z]}>
            {/* Metal Shelves */}
            {[0.8, 2.2, 3.6].map((y, yi) => (
              <mesh key={`shelf-${yi}`} position={[0, y, 0]} material={metalMat}>
                <boxGeometry args={[4.5, 0.1, 1.4]} />
              </mesh>
            ))}
            {/* Solvent & Paint Drums (Scattered if exploded) */}
            {[-1.5, 0, 1.5].map((dx, di) => (
              <group
                key={`drum-${di}`}
                position={[
                  dx + (isExploded ? Math.sin(di * 3) * 3 : 0),
                  0.4 + (isExploded ? 0.8 : 0),
                  0,
                ]}
                rotation={isExploded ? [1.2, 0.4, di] : [0, 0, 0]}
              >
                <mesh castShadow>
                  <cylinderGeometry args={[0.28, 0.28, 0.75, 16]} />
                  <meshStandardMaterial
                    color={di === 0 ? '#ea580c' : di === 1 ? '#dc2626' : '#2563eb'}
                    roughness={0.4}
                    metalness={0.6}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

// ─── 3D Volumetric Fire & Dense Smoke System ──────────────────────────────────

function DynamicFireAndSmoke({ isExploded }: { isExploded: boolean }) {
  const fireParticlesRef = useRef<THREE.Points>(null)
  const smokeParticlesRef = useRef<THREE.Points>(null)

  const particleCount = isExploded ? 800 : 400
  const smokeCount = isExploded ? 1200 : 600

  const [fireGeo, fireMat] = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 14 + (Math.random() - 0.5) * (isExploded ? 16 : 5)
      positions[i * 3 + 1] = Math.random() * (isExploded ? 8 : 3.5)
      positions[i * 3 + 2] = -6 + (Math.random() - 0.5) * (isExploded ? 16 : 5)
      scales[i] = Math.random() * 0.4 + 0.2
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

    const mat = new THREE.PointsMaterial({
      color: '#f97316',
      size: isExploded ? 0.9 : 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    return [geo, mat]
  }, [particleCount, isExploded])

  const [smokeGeo, smokeMat] = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(smokeCount * 3)

    for (let i = 0; i < smokeCount; i++) {
      positions[i * 3] = 14 + (Math.random() - 0.5) * (isExploded ? 25 : 10)
      positions[i * 3 + 1] = 2.0 + Math.random() * 7
      positions[i * 3 + 2] = -6 + (Math.random() - 0.5) * (isExploded ? 25 : 10)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color: '#1e293b',
      size: 1.2,
      transparent: true,
      opacity: isExploded ? 0.75 : 0.45,
    })
    return [geo, mat]
  }, [smokeCount, isExploded])

  useFrame(() => {
    if (fireParticlesRef.current) {
      const pos = fireParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < particleCount; i++) {
        let y = pos.getY(i) + 0.04
        if (y > (isExploded ? 9 : 4)) y = 0.1
        pos.setY(i, y)
      }
      pos.needsUpdate = true
    }

    if (smokeParticlesRef.current) {
      const pos = smokeParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < smokeCount; i++) {
        let y = pos.getY(i) + 0.02
        if (y > 10) y = 2.0
        pos.setY(i, y)
      }
      pos.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Point Light simulating roaring fire flicker */}
      <pointLight
        position={[14, isExploded ? 4.5 : 2.5, -6]}
        color={isExploded ? '#ff2200' : '#ea580c'}
        intensity={isExploded ? 8.0 : 4.5}
        distance={isExploded ? 35 : 20}
      />
      <points ref={fireParticlesRef} geometry={fireGeo} material={fireMat} />
      <points ref={smokeParticlesRef} geometry={smokeGeo} material={smokeMat} />
    </group>
  )
}

// ─── 3D Real-Time Explosive Shockwave & Fireball Burst Animation ──────────────

function ExplosionShockwaveEffect({ isExploding }: { isExploding: boolean }) {
  const fireballRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const shockwaveRef = useRef<THREE.Mesh>(null)
  const animTime = useRef(0)

  useFrame((state, delta) => {
    if (!isExploding) return
    animTime.current += delta * 2.5

    const progress = Math.min(animTime.current, 1)

    // Fireball expansion & dissipation
    if (fireballRef.current) {
      const scale = Math.sin(progress * Math.PI * 0.5) * 14 + 0.5
      fireballRef.current.scale.set(scale, scale * 1.1, scale)
      const mat = fireballRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = Math.max(0, 1 - progress * 0.9)
    }

    // Ground Shockwave ring expanding outward
    if (ringRef.current) {
      const ringScale = progress * 24 + 1
      ringRef.current.scale.set(ringScale, ringScale, 1)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.9 - progress)
    }

    // Outer spherical shockwave pulse
    if (shockwaveRef.current) {
      const shockScale = progress * 18 + 0.5
      shockwaveRef.current.scale.set(shockScale, shockScale, shockScale)
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.7 - progress * 0.8)
    }
  })

  if (!isExploding) return null

  return (
    <group position={[14, 2.5, -6]}>
      {/* Central Boiling Fireball Sphere */}
      <mesh ref={fireballRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ff3b00"
          emissive="#ffaa00"
          emissiveIntensity={3.5}
          roughness={0.2}
          transparent
          opacity={1.0}
        />
      </mesh>

      {/* Ground Blast Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Concussive Air Shockwave Sphere */}
      <mesh ref={shockwaveRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#ff7700" transparent opacity={0.6} wireframe />
      </mesh>
    </group>
  )
}

// ─── First-Person Camera Rig with Violent Explosion Concussion Shake ─────────

function FirstPersonCameraRig({
  position,
  yaw,
  pitch,
  isExploding,
}: {
  position: [number, number, number]
  yaw: number
  pitch: number
  isExploding: boolean
}) {
  const { camera } = useThree()

  useFrame((state) => {
    let shakeX = 0
    let shakeY = 0
    let shakeZ = 0

    if (isExploding) {
      const t = state.clock.getElapsedTime() * 35
      shakeX = (Math.sin(t) + (Math.random() - 0.5) * 1.5) * 0.35
      shakeY = (Math.cos(t * 1.3) + (Math.random() - 0.5) * 1.5) * 0.35
      shakeZ = (Math.sin(t * 0.7) + (Math.random() - 0.5) * 1.5) * 0.2
    }

    camera.position.set(position[0] + shakeX, 1.65 + shakeY, position[2] + shakeZ)
    const euler = new THREE.Euler(pitch + (isExploding ? (Math.random() - 0.5) * 0.15 : 0), yaw, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)
  })

  return null
}

// ─── Interactive Fire Decision Hotspots in 3D ─────────────────────────────────

function FireDecisionHotspots({
  onSelectAlarm,
  onSelectExtinguisher,
  onSelectFireDoor,
  onSelectEvacuate,
  alarmPulled,
  doorClosed,
  extinguisherResolved,
}: {
  onSelectAlarm: () => void
  onSelectExtinguisher: () => void
  onSelectFireDoor: () => void
  onSelectEvacuate: () => void
  alarmPulled: boolean
  doorClosed: boolean
  extinguisherResolved: boolean
}) {
  return (
    <group>
      {/* Hotspot 1: Manual Pull Station Alarm */}
      <Html position={[-6, 1.8, -17.5]} center distanceFactor={14}>
        <button
          onClick={onSelectAlarm}
          style={{
            background: alarmPulled ? '#15803d' : '#dc2626',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        >
          <Bell size={14} />
          {alarmPulled ? '✓ Fire Alarm Activated' : 'Activate Manual Fire Alarm Pull Station'}
        </button>
      </Html>

      {/* Hotspot 2: Paint Fire & Extinguisher Decision */}
      <Html position={[10, 2.0, -6]} center distanceFactor={14}>
        <button
          onClick={onSelectExtinguisher}
          style={{
            background: extinguisherResolved ? '#15803d' : '#ea580c',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        >
          <Flame size={14} />
          {extinguisherResolved ? '✓ Class B Protocol Executed' : 'Assess Solvent Fire & Select Extinguisher'}
        </button>
      </Html>

      {/* Hotspot 3: Fire Barrier Door Containment */}
      <Html position={[7, 2.0, -6]} center distanceFactor={14}>
        <button
          onClick={onSelectFireDoor}
          style={{
            background: doorClosed ? '#15803d' : '#ea580c',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        >
          <DoorClosed size={14} />
          {doorClosed ? '✓ Fire Door Latched & Contained' : 'Close 90-Min Fire Barrier Door'}
        </button>
      </Html>

      {/* Hotspot 4: South Emergency Exit Low-Crawl Evacuation */}
      <Html position={[0, 1.8, 17.5]} center distanceFactor={14}>
        <button
          onClick={onSelectEvacuate}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        >
          <Wind size={14} />
          Low-Crawl Evacuate via South Emergency Exit
        </button>
      </Html>
    </group>
  )
}

// ─── Main Fire Incident 3D Scene View Component ───────────────────────────────

interface Props {
  scenario: Scenario
}

export function FireSceneView({ scenario }: Props) {
  const setPhase = useSimulationStore((s) => s.setPhase)
  const addEvent = useSimulationStore((s) => s.addEvent)
  const setScore = useSimulationStore((s) => s.setScore)

  // Start at X = -4, looking along +X (yaw = -Math.PI / 2)
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-4, 0, 0])
  const [yaw, setYaw] = useState(-Math.PI / 2)
  const [pitch, setPitch] = useState(0)

  // Simulation states
  const [alarmPulled, setAlarmPulled] = useState(false)
  const [doorClosed, setDoorClosed] = useState(false)
  const [extinguisherResolved, setExtinguisherResolved] = useState(false)
  const [evacuated, setEvacuated] = useState(false)

  // Explosion state
  const [isExploding, setIsExploding] = useState(false)
  const [explosionReason, setExplosionReason] = useState('')

  // Active Decision Modal
  const [activeModal, setActiveModal] = useState<'alarm' | 'extinguisher' | 'door' | 'evacuate' | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info')

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Trigger explosive failure
  const triggerExplosion = (reason: string) => {
    setIsExploding(true)
    setExplosionReason(reason)
    soundEngine.playExplosion()
    addEvent('wrong_action', `Explosion triggered: ${reason}`)
    setFeedbackMessage(`💥 CATASTROPHIC EXPLOSION: ${reason}`)
    setFeedbackType('error')
  }

  // Fixed Precise First-Person Movement Math
  const movePlayer = (fwd: number, strafe: number) => {
    if (isExploding) return
    const speed = 0.55

    // In Three.js with Euler(pitch, yaw, 0, 'YXZ'):
    const fwdX = -Math.sin(yaw)
    const fwdZ = -Math.cos(yaw)
    const rightX = Math.cos(yaw)
    const rightZ = -Math.sin(yaw)

    const dx = (fwdX * fwd + rightX * strafe) * speed
    const dz = (fwdZ * fwd + rightZ * strafe) * speed

    setPlayerPos(([px, py, pz]) => {
      let nx = px + dx
      let nz = pz + dz

      // Clamp to factory floor
      nx = Math.max(-25, Math.min(25, nx))
      nz = Math.max(-16, Math.min(16, nz))

      // If player enters paint room while on fire without door containment
      if (nx > 10 && nz < 0 && !doorClosed && !isExploding) {
        triggerExplosion('Walked directly into dense solvent flash vapor cloud!')
      }

      return [nx, py, nz]
    })
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExploding) return
      if (e.key === 'w' || e.key === 'ArrowUp') movePlayer(1, 0)
      if (e.key === 's' || e.key === 'ArrowDown') movePlayer(-1, 0)
      if (e.key === 'd' || e.key === 'ArrowRight') movePlayer(0, 1)
      if (e.key === 'a' || e.key === 'ArrowLeft') movePlayer(0, -1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [yaw, doorClosed, isExploding])

  // Mouse look drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isExploding) return
    const dx = e.clientX - lastMousePos.x
    const dy = e.clientY - lastMousePos.y
    setLastMousePos({ x: e.clientX, y: e.clientY })

    setYaw((y) => y - dx * 0.0045)
    setPitch((p) => Math.max(-1.3, Math.min(1.3, p - dy * 0.0045)))
  }

  const handleMouseUp = () => setIsDragging(false)

  // Decision actions
  const handleAlarmDecision = (correct: boolean) => {
    if (correct) {
      setAlarmPulled(true)
      soundEngine.playAlarm()
      soundEngine.playSuccessChime()
      addEvent('correct_action', 'Manual fire pull station activated. RACE Protocol initiated.')
      setFeedbackMessage('✅ Emergency fire alarm pulled! Building evacuation and dispatch alert confirmed.')
      setFeedbackType('success')
    } else {
      soundEngine.playWrongBuzzer()
      addEvent('wrong_action', 'Attempted suppression without sounding building alarm')
      setFeedbackMessage('❌ RACE PROTOCOL VIOLATION: Must alert building occupants before suppression!')
      setFeedbackType('error')
    }
    setActiveModal(null)
  }

  const handleExtinguisherDecision = (option: 'water' | 'co2' | 'evacuate') => {
    if (option === 'water') {
      triggerExplosion('Applied Water extinguisher to Class B flammable solvent liquid fire! Caused instant boiling-liquid vapor explosion (BLEVE)!')
    } else if (option === 'co2') {
      setExtinguisherResolved(true)
      soundEngine.playSuccessChime()
      addEvent('correct_action', 'Selected Class B CO2 extinguisher to suppress initial flash outbreak')
      setFeedbackMessage('✅ Class B CO₂ Extinguisher deployed! Oxygen displaced without liquid splatter.')
      setFeedbackType('success')
    } else {
      setExtinguisherResolved(true)
      soundEngine.playSuccessChime()
      addEvent('correct_action', 'Assessed fire size exceeds safe threshold and prioritized immediate evacuation')
      setFeedbackMessage('✅ Safe assessment: Fire exceeded wastebasket size. Immediate evacuation executed.')
      setFeedbackType('success')
    }
    setActiveModal(null)
  }

  const handleDoorDecision = (correct: boolean) => {
    if (correct) {
      setDoorClosed(true)
      soundEngine.playSuccessChime()
      addEvent('correct_action', '90-minute fire barrier door latched to isolate solvent fire')
      setFeedbackMessage('✅ Fire door closed! Smoke and flames isolated to paint room.')
      setFeedbackType('success')
    } else {
      triggerExplosion('Propped open fire barrier door! Draft allowed oxygen rush into solvent vapors causing flashover explosion!')
    }
    setActiveModal(null)
  }

  const handleEvacuateDecision = (correct: boolean) => {
    if (correct) {
      setEvacuated(true)
      soundEngine.playSuccessChime()
      addEvent('correct_action', 'Low-crawl evacuation through south emergency exit completed')
      setFeedbackMessage('✅ Low-crawl evacuation successful! Reached safe exterior muster point.')
      setFeedbackType('success')
    } else {
      soundEngine.playWrongBuzzer()
      addEvent('wrong_action', 'Attempted upright run through toxic upper smoke layer')
      setFeedbackMessage('❌ INHALATION HAZARD: Running upright through hydrocarbon smoke causes asphyxiation!')
      setFeedbackType('error')
    }
    setActiveModal(null)
  }

  const allResolved = alarmPulled && extinguisherResolved && doorClosed && evacuated

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0a0a0f',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Red Screen Flash Vignette during explosion */}
      {isExploding && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 35,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(255,50,0,0.6) 0%, rgba(200,0,0,0.9) 100%)',
            animation: 'pulse 0.3s infinite alternate',
          }}
        />
      )}

      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [-4, 1.65, 0], fov: 75 }} shadows style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <FirstPersonCameraRig position={playerPos} yaw={yaw} pitch={pitch} isExploding={isExploding} />

          {/* Dim factory lighting with emergency red strobe */}
          <ambientLight intensity={isExploding ? 1.5 : 0.35} color={isExploding ? '#ff4400' : '#ffffff'} />
          <directionalLight position={[10, 20, 10]} intensity={0.6} castShadow />

          {/* Scene Assets */}
          <IndustrialFactoryBuilding isExploded={isExploding} />
          <DynamicFireAndSmoke isExploded={isExploding} />
          <ExplosionShockwaveEffect isExploding={isExploding} />

          {/* 3D Hotspots */}
          {!isExploding && (
            <FireDecisionHotspots
              onSelectAlarm={() => setActiveModal('alarm')}
              onSelectExtinguisher={() => setActiveModal('extinguisher')}
              onSelectFireDoor={() => setActiveModal('door')}
              onSelectEvacuate={() => setActiveModal('evacuate')}
              alarmPulled={alarmPulled}
              doorClosed={doorClosed}
              extinguisherResolved={extinguisherResolved}
            />
          )}
        </Suspense>
      </Canvas>

      {/* ── Top HUD ── */}
      <SimulationHUD scenario={scenario} />

      {/* ── Virtual On-Screen Direction D-Pad (Guaranteed Intuitive Movement) ── */}
      {!isExploding && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '8px',
            borderRadius: 16,
            border: '1px solid #334155',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            onClick={() => movePlayer(1, 0)}
            style={{
              width: 44,
              height: 40,
              background: '#334155',
              border: '1px solid #475569',
              borderRadius: 8,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Step Forward (W)"
          >
            <ArrowUp size={18} />
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => movePlayer(0, -1)}
              style={{
                width: 44,
                height: 40,
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Step Left (A)"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => movePlayer(-1, 0)}
              style={{
                width: 44,
                height: 40,
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Step Backward (S)"
            >
              <ArrowDown size={18} />
            </button>
            <button
              onClick={() => movePlayer(0, 1)}
              style={{
                width: 44,
                height: 40,
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Step Right (D)"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Explosion Incident Modal ── */}
      {isExploding && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#1e1b4b',
              border: '2px solid #ef4444',
              borderRadius: 24,
              padding: '36px 40px',
              maxWidth: 540,
              textAlign: 'center',
              color: '#fff',
              boxShadow: '0 25px 60px rgba(239, 68, 68, 0.5)',
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                background: 'rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Bomb size={36} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f87171', marginBottom: 12 }}>
              CATASTROPHIC SOLVENT EXPLOSION TRIGGERED
            </h2>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 24 }}>
              {explosionReason}
            </p>
            <button
              onClick={() => {
                setIsExploding(false)
                setPlayerPos([-4, 0, 0])
                setAlarmPulled(false)
                setDoorClosed(false)
                setExtinguisherResolved(false)
                setEvacuated(false)
                setFeedbackMessage(null)
              }}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RotateCcw size={16} />
              Re-attempt Scenario with RACE Protocol
            </button>
          </div>
        </div>
      )}

      {/* ── Scenario Completed Banner ── */}
      {allResolved && !isExploding && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '2px solid #22c55e',
            borderRadius: 24,
            padding: '32px 40px',
            maxWidth: 500,
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Sparkles size={32} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#4ade80', marginBottom: 8 }}>
            RACE Protocol Mastered!
          </h2>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 24 }}>
            You activated the emergency pull station, avoided dangerous water application on Class B
            solvents, contained the outbreak with fire barriers, and led a low-crawl evacuation.
          </p>
          <button
            onClick={() => {
              setScore(95)
              setPhase('positive_video')
            }}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Proceed to Positive Training Video & Quiz</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Decision Modals ── */}
      {activeModal === 'alarm' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              maxWidth: 480,
              color: '#0f172a',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={20} color="#dc2626" /> RACE Protocol: Alarm Activation
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              Flames are spreading across paint containers in the storage room. What is the mandatory immediate action?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleAlarmDecision(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🚨 <strong>Pull Manual Fire Alarm:</strong> Alert all facility occupants and auto-dispatch emergency response immediately.
              </button>
              <button
                onClick={() => handleAlarmDecision(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🤫 <strong>Quiet Assessment:</strong> Inspect the fire closely first before alerting others to avoid false alarms.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'extinguisher' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              maxWidth: 480,
              color: '#0f172a',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={20} color="#ea580c" /> Extinguisher Selection (Class B Hazard)
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              The fire involves solvent-based paint cans (Class B flammable liquids). Which suppression tactic do you apply?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleExtinguisherDecision('water')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#991b1b',
                }}
              >
                💧 <strong>Class A Water Hose / Extinguisher:</strong> Spray cold water directly onto burning solvent cans to cool them.
              </button>
              <button
                onClick={() => handleExtinguisherDecision('co2')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#166534',
                }}
              >
                🧯 <strong>Class B CO₂ Extinguisher:</strong> Smother oxygen supply at the base of the fire without splashing liquid.
              </button>
              <button
                onClick={() => handleExtinguisherDecision('evacuate')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🏃 <strong>Evacuate Immediately:</strong> Fire has expanded past initial wastebasket size; abandon suppression.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'door' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              maxWidth: 480,
              color: '#0f172a',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DoorClosed size={20} color="#ea580c" /> Fire Door Containment Discipline
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              You are leaving the paint storage room. How do you handle the 90-minute rated fire barrier door?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleDoorDecision(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#166534',
                }}
              >
                🔒 <strong>Close & Latch Completely:</strong> Contain heat, toxic fumes, and oxygen deprivation inside the room.
              </button>
              <button
                onClick={() => handleDoorDecision(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#991b1b',
                }}
              >
                🚪 <strong>Prop Door Open:</strong> Allow air draft so smoke dissipates into the main factory hall.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'evacuate' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              maxWidth: 480,
              color: '#0f172a',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wind size={20} color="#2563eb" /> Smoke Navigation Technique
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              Dense hydrocarbon smoke has reduced visibility to 3 meters. What is the compliant evacuation body posture?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleEvacuateDecision(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#166534',
                }}
              >
                🧎 <strong>Low-Crawl on Hands and Knees:</strong> Keep breathing zone under the thermal smoke inversion layer near floor.
              </button>
              <button
                onClick={() => handleEvacuateDecision(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#991b1b',
                }}
              >
                🏃 <strong>Sprint Upright:</strong> Run as fast as possible to minimize transit time.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification Banner ── */}
      {feedbackMessage && !isExploding && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: feedbackType === 'success' ? 'rgba(22, 101, 52, 0.95)' : 'rgba(185, 28, 28, 0.95)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 30,
            border: `1px solid ${feedbackType === 'success' ? '#4ade80' : '#f87171'}`,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {feedbackType === 'success' ? <ShieldCheck size={18} color="#4ade80" /> : <AlertOctagon size={18} color="#fca5a5" />}
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', marginLeft: 12, fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Bottom Controls ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            soundEngine.enabled = next
          }}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#fff',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          {soundEnabled ? <Volume2 size={14} color="#f97316" /> : <VolumeX size={14} color="#94a3b8" />}
          <span>{soundEnabled ? 'Audio Active' : 'Muted'}</span>
        </button>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '8px 14px',
            color: '#94a3b8',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <MousePointer size={12} color="#f97316" />
          <span>Drag Mouse to Look • WASD or On-Screen D-Pad to Walk</span>
        </div>
      </div>
    </div>
  )
}
