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
  HardHat,
  Wind,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link,
  ChevronRight,
  Sparkles,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Compass,
} from 'lucide-react'

// ─── Procedural High-Altitude Construction & Fall Sound Engine ────────────────

class ConstructionFallSoundEngine {
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

  playCarabinerSnap() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'highpass' as unknown as OscillatorType
      osc.frequency.setValueAtTime(2800, t)
      gain.gain.setValueAtTime(0.4, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.09)
    } catch {}
  }

  playWindRush() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const bufferSize = this.ctx.sampleRate * 2.5
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800, t)
      filter.frequency.linearRampToValueAtTime(2200, t + 1.5)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.6, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)
      noise.start(t)
      noise.stop(t + 2.5)
    } catch {}
  }

  playGroundImpact() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(90, t)
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.8)
      gain.gain.setValueAtTime(1.0, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.8)
    } catch {}
  }

  playPlankCreak() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, t)
      osc.frequency.linearRampToValueAtTime(120, t + 0.35)
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.4)
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
      osc.frequency.setValueAtTime(150, t)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.6)
    } catch {}
  }
}

const soundEngine = new ConstructionFallSoundEngine()

// ─── Highly Realistic 3D High-Altitude Skyscraper Steel Frame ─────────────────

function HighAltitudeSkyscraperScene({
  plankTipped,
  isTiedOff,
  guardrailRepaired,
}: {
  plankTipped: boolean
  isTiedOff: boolean
  guardrailRepaired: boolean
}) {
  // PBR Materials
  const orangeSteelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d97706',
        metalness: 0.6,
        roughness: 0.35,
      }),
    []
  )
  const greySteelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#475569',
        metalness: 0.8,
        roughness: 0.25,
      }),
    []
  )
  const woodPlankMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b45309',
        roughness: 0.85,
      }),
    []
  )
  const concreteMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.9,
      }),
    []
  )
  const yellowRailMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#eab308',
        metalness: 0.5,
        roughness: 0.3,
      }),
    []
  )

  return (
    <group>
      {/* ── Distant City Below (50 Meters Vertigo Drop) ── */}
      <group position={[0, -50, 0]}>
        {/* City Floor Grid */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Surrounding Low-Rise & High-Rise Towers below */}
        {[-80, -40, 0, 40, 80].map((bx, i) =>
          [-60, 60].map((bz, zi) => (
            <group key={`bldg-${i}-${zi}`} position={[bx + zi * 10, 15, bz]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[26, 30 + (i % 3) * 10, 26]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#1e293b' : '#334155'} roughness={0.7} />
              </mesh>
              {/* Roof HVAC units */}
              <mesh position={[0, 16 + (i % 3) * 5, 0]}>
                <boxGeometry args={[8, 3, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* ── Towering Structural Columns (Continuous steel pillars from -50m to +15m) ── */}
      {[-8, 0, 8].map((x, xi) =>
        [-4, 4].map((z, zi) => (
          <group key={`column-rig-${xi}-${zi}`} position={[x, -18, z]}>
            <mesh material={orangeSteelMat} castShadow receiveShadow>
              <boxGeometry args={[0.7, 68, 0.7]} />
            </mesh>
            {/* Structural Rivet Flange Plates */}
            {[-10, 0, 10, 18].map((fy, fyi) => (
              <mesh key={`flange-${fyi}`} position={[0, fy, 0]} material={greySteelMat}>
                <boxGeometry args={[0.95, 0.4, 0.95]} />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* ── Starting Safe Concrete Deck (West: X = -12 to -6, Y = 0) ── */}
      <group position={[-9, -0.2, 0]}>
        {/* Concrete Slab Deck with Rebar Edges */}
        <mesh receiveShadow material={concreteMat}>
          <boxGeometry args={[6.5, 0.4, 6.5]} />
        </mesh>
        {/* Corrugated Metal Pan underneath slab */}
        <mesh position={[0, -0.25, 0]} material={greySteelMat}>
          <boxGeometry args={[6.5, 0.1, 6.5]} />
        </mesh>
        {/* Three-Sided Safety Perimeter Guardrails */}
        <mesh position={[0, 1.07, 3.2]} material={yellowRailMat}>
          <boxGeometry args={[6.5, 0.08, 0.08]} />
        </mesh>
        <mesh position={[0, 0.53, 3.2]} material={yellowRailMat}>
          <boxGeometry args={[6.5, 0.08, 0.08]} />
        </mesh>
        <mesh position={[0, 1.07, -3.2]} material={yellowRailMat}>
          <boxGeometry args={[6.5, 0.08, 0.08]} />
        </mesh>
        <mesh position={[0, 0.53, -3.2]} material={yellowRailMat}>
          <boxGeometry args={[6.5, 0.08, 0.08]} />
        </mesh>
        <mesh position={[-3.2, 1.07, 0]} material={yellowRailMat}>
          <boxGeometry args={[0.08, 0.08, 6.5]} />
        </mesh>
        <mesh position={[-3.2, 0.53, 0]} material={yellowRailMat}>
          <boxGeometry args={[0.08, 0.08, 6.5]} />
        </mesh>
      </group>

      {/* ── The Elevated Narrow Steel Girder Bridge (X = -6 to +6, Y = 0, Width = 0.5m) ── */}
      <group position={[0, 0, 0]}>
        {/* Main Walking Flange (Top) */}
        <mesh position={[0, -0.05, 0]} material={orangeSteelMat} receiveShadow castShadow>
          <boxGeometry args={[14, 0.1, 0.55]} />
        </mesh>
        {/* Girder Vertical Web */}
        <mesh position={[0, -0.45, 0]} material={orangeSteelMat}>
          <boxGeometry args={[14, 0.7, 0.12]} />
        </mesh>
        {/* Girder Bottom Flange */}
        <mesh position={[0, -0.85, 0]} material={orangeSteelMat}>
          <boxGeometry args={[14, 0.1, 0.55]} />
        </mesh>
        {/* Cross Bracing Tension Rods */}
        {[-4, 0, 4].map((bx, bi) => (
          <group key={`brace-${bi}`} position={[bx, -1.2, 0]}>
            <mesh rotation={[0, 0, Math.PI / 4]} material={greySteelMat}>
              <cylinderGeometry args={[0.02, 0.02, 2.8, 8]} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]} material={greySteelMat}>
              <cylinderGeometry args={[0.02, 0.02, 2.8, 8]} />
            </mesh>
          </group>
        ))}

        {/* Overhead Yellow Static Lifeline Cable (Rated 5,000 lbs ANSI Z359) */}
        <group position={[0, 2.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 14, 8]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Lifeline Stanchion Posts */}
          {[-6, 0, 6].map((sx, si) => (
            <mesh key={`stanchion-${si}`} position={[sx, -1.0, 0]} material={orangeSteelMat}>
              <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
            </mesh>
          ))}
        </group>

        {/* 100% Dual-Lanyard Snap Hook Slider (Visible when connected) */}
        {isTiedOff && (
          <group position={[-1, 1.4, 0]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.7} />
            </mesh>
            {/* Sliding Carabiner */}
            <mesh position={[0, 0.7, 0]}>
              <torusGeometry args={[0.05, 0.015, 8, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── HAZARD: Loose Cantilever Scaffold Board at X = 2.4, Y = 0.06, Z = 0 ── */}
      <group
        position={[2.4, 0.06, 0]}
        rotation={plankTipped ? [0.45, 0, -0.65] : [0, 0, 0]}
      >
        <mesh castShadow receiveShadow material={woodPlankMat}>
          <boxGeometry args={[2.8, 0.08, 0.58]} />
        </mesh>
        {/* Warning Hazard Stripes on Wood Board */}
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 0.2]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      </group>

      {/* ── Destination Landing Platform (East: X = +6 to +12, Y = 0) ── */}
      <group position={[9, -0.2, 0]}>
        <mesh receiveShadow material={concreteMat}>
          <boxGeometry args={[6.5, 0.4, 6.5]} />
        </mesh>

        {/* East Perimeter Guardrail (Repaired vs Open Gap Hazard) */}
        {guardrailRepaired ? (
          <group position={[3.2, 0, 0]}>
            <mesh position={[0, 1.07, 0]} material={yellowRailMat}>
              <boxGeometry args={[0.08, 0.08, 6.5]} />
            </mesh>
            <mesh position={[0, 0.53, 0]} material={yellowRailMat}>
              <boxGeometry args={[0.08, 0.08, 6.5]} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.08, 0.2, 6.5]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
          </group>
        ) : (
          /* Open Unguarded Edge with Red Hazard Glow Line */
          <group position={[3.2, 0, 0]}>
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.6, 6.5]} />
              <meshStandardMaterial color="#ef4444" transparent opacity={0.65} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── Giant Tower Crane in Background ── */}
      <group position={[18, 10, -22]}>
        {/* Yellow Lattice Tower Mast */}
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[2.2, 44, 2.2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Horizontal Jib Arm */}
        <mesh position={[-14, 32, 0]}>
          <boxGeometry args={[42, 1.6, 1.6]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} />
        </mesh>
        {/* Counter Jib & Heavy Concrete Weights */}
        <mesh position={[12, 32, 0]}>
          <boxGeometry args={[16, 1.6, 1.6]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[16, 31, 0]}>
          <boxGeometry args={[4, 2.5, 3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
    </group>
  )
}

// ─── 3D Coworker Model at Edge ────────────────────────────────────────────────

function CoworkerModelAtEdge({ isWarned }: { isWarned: boolean }) {
  return (
    <group position={[8.0, 0, -1.2]} rotation={[0, isWarned ? -Math.PI / 2 : Math.PI / 3, 0]}>
      {/* Torso & Orange High Vis Vest */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.48, 0.75, 0.28]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
      {/* Reflective Stripes */}
      <mesh position={[0, 1.35, 0.145]}>
        <planeGeometry args={[0.44, 0.08]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} />
      </mesh>
      {/* Head & Hard Hat */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.22, 0.2, 0.14, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0.45, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.9, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.15, 0.45, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.9, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Floating Status Callout */}
      <Html position={[0, 2.6, 0]} center distanceFactor={12}>
        <div
          style={{
            background: isWarned ? 'rgba(22, 101, 52, 0.95)' : 'rgba(185, 28, 28, 0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            border: `1px solid ${isWarned ? '#4ade80' : '#f87171'}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
        >
          {isWarned ? '✓ Coworker Clipped & Safe' : '⚠️ UNCLIPPED COWORKER AT 50m!'}
        </div>
      </Html>
    </group>
  )
}

// ─── First-Person Camera Rig with Free Fall Plunge Physics ────────────────────

function FirstPersonFallingCameraRig({
  position,
  yaw,
  pitch,
  isFalling,
  fallY,
  fallRoll,
}: {
  position: [number, number, number]
  yaw: number
  pitch: number
  isFalling: boolean
  fallY: number
  fallRoll: number
}) {
  const { camera } = useThree()

  useFrame(() => {
    if (isFalling) {
      // Free fall downward plunge with tumbling pitch & roll
      camera.position.set(position[0], fallY, position[2])
      const euler = new THREE.Euler(pitch + Math.PI * 0.4, yaw, fallRoll, 'YXZ')
      camera.quaternion.setFromEuler(euler)
    } else {
      // Standard eye level 1.7m above beam
      camera.position.set(position[0], 1.7, position[2])
      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ')
      camera.quaternion.setFromEuler(euler)
    }
  })

  return null
}

// ─── Main Construction Fall Scene Component ───────────────────────────────────

interface Props {
  scenario: Scenario
}

export function ConstructionFallSceneView({ scenario }: Props) {
  const setPhase = useSimulationStore((s) => s.setPhase)
  const addEvent = useSimulationStore((s) => s.addEvent)
  const setScore = useSimulationStore((s) => s.setScore)

  // Start at X = -7 (safe concrete platform), looking towards +X (yaw = -Math.PI / 2)
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-7, 0, 0])
  const [yaw, setYaw] = useState(-Math.PI / 2)
  const [pitch, setPitch] = useState(-0.1)

  // Safety checklist
  const [isTiedOff, setIsTiedOff] = useState(false)
  const [plankInspected, setPlankInspected] = useState(false)
  const [coworkerWarned, setCoworkerWarned] = useState(false)
  const [guardrailRepaired, setGuardrailRepaired] = useState(false)
  const [plankTipped, setPlankTipped] = useState(false)

  // Fall physics state
  const [isFalling, setIsFalling] = useState(false)
  const [fallY, setFallY] = useState(1.7)
  const [fallVelocity, setFallVelocity] = useState(0)
  const [fallRoll, setFallRoll] = useState(0)
  const [fallReason, setFallReason] = useState('')

  // Modals & UI
  const [activeModal, setActiveModal] = useState<'harness' | 'plank' | 'coworker' | 'guardrail' | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info')

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Trigger Fall Down Sequence
  const triggerFall = (reason: string) => {
    if (isFalling) return
    setIsFalling(true)
    setFallReason(reason)
    setFallVelocity(1.0)
    soundEngine.playWindRush()
    soundEngine.playWrongBuzzer()
    addEvent('wrong_action', `Fall from height: ${reason}`)
    setFeedbackMessage(`💀 FATAL FALL FROM 50 METERS: ${reason}`)
    setFeedbackType('error')
  }

  // Free-fall frame physics loop
  useEffect(() => {
    if (!isFalling) return
    let animId: number
    let currentY = fallY
    let currentV = fallVelocity
    let currentRoll = fallRoll

    const fallStep = () => {
      currentV += 0.9
      currentY -= currentV * 0.055
      currentRoll += 0.09

      if (currentY <= -48) {
        currentY = -48
        soundEngine.playGroundImpact()
      } else {
        animId = requestAnimationFrame(fallStep)
      }

      setFallY(currentY)
      setFallVelocity(currentV)
      setFallRoll(currentRoll)
    }

    animId = requestAnimationFrame(fallStep)
    return () => cancelAnimationFrame(animId)
  }, [isFalling, fallY, fallVelocity, fallRoll])

  // Fixed Precise First-Person Movement Math
  const movePlayer = (fwd: number, strafe: number) => {
    if (isFalling) return
    const speed = 0.45

    // In Three.js with Euler(pitch, yaw, 0, 'YXZ'):
    // Forward direction on XZ plane:
    const fwdX = -Math.sin(yaw)
    const fwdZ = -Math.cos(yaw)
    // Right direction on XZ plane:
    const rightX = Math.cos(yaw)
    const rightZ = -Math.sin(yaw)

    const dx = (fwdX * fwd + rightX * strafe) * speed
    const dz = (fwdZ * fwd + rightZ * strafe) * speed

    setPlayerPos(([px, py, pz]) => {
      let nx = px + dx
      let nz = pz + dz

      // On narrow girder (X between -5.5 and +6.5): Width Z is [-0.3, 0.3]
      if (nx > -5.5 && nx < 6.5) {
        if (Math.abs(nz) > 0.35) {
          if (!isTiedOff) {
            triggerFall('Stepped off narrow steel girder without 100% continuous tie-off!')
          } else {
            // Harness catches you!
            nz = Math.sign(nz) * 0.25
            soundEngine.playCarabinerSnap()
            setFeedbackMessage('⚠️ Slipped off beam edge, but arrested safely by 100% dual lanyard tie-off!')
            setFeedbackType('success')
          }
        }
      }

      // Stepping onto unpinned cantilever board at X = 2.4
      if (nx > 1.8 && nx < 3.2 && !plankInspected) {
        setPlankTipped(true)
        soundEngine.playPlankCreak()
        if (!isTiedOff) {
          triggerFall('Stepped on loose cantilever scaffold board! Board flipped over 50m drop!')
        } else {
          setFeedbackMessage('⚠️ Cantilever board flipped! Saved from falling by safety harness!')
          setFeedbackType('error')
        }
      }

      // Stepping into unbarricaded eastern perimeter edge (X > 12)
      if (nx > 12.5 && !guardrailRepaired && !isTiedOff) {
        triggerFall('Walked off unguarded eastern perimeter edge at 50 meters elevation!')
      }

      // Clamp within world limits
      nx = Math.max(-11.5, Math.min(12.8, nx))
      nz = Math.max(-3.0, Math.min(3.0, nz))

      return [nx, py, nz]
    })
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFalling) return
      if (e.key === 'w' || e.key === 'ArrowUp') movePlayer(1, 0)
      if (e.key === 's' || e.key === 'ArrowDown') movePlayer(-1, 0)
      if (e.key === 'd' || e.key === 'ArrowRight') movePlayer(0, 1)
      if (e.key === 'a' || e.key === 'ArrowLeft') movePlayer(0, -1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [yaw, isTiedOff, plankInspected, guardrailRepaired, isFalling])

  // Mouse Look (Dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isFalling) return
    const dx = e.clientX - lastMousePos.x
    const dy = e.clientY - lastMousePos.y
    setLastMousePos({ x: e.clientX, y: e.clientY })

    // Non-inverted standard camera controls:
    // Drag right -> turn right (yaw decreases)
    // Drag left -> turn left (yaw increases)
    // Drag up -> look up (pitch increases)
    // Drag down -> look down (pitch decreases)
    setYaw((y) => y - dx * 0.0045)
    setPitch((p) => Math.max(-1.3, Math.min(1.3, p - dy * 0.0045)))
  }

  const handleMouseUp = () => setIsDragging(false)

  // Decision Handlers
  const handleHarnessDecision = (correct: boolean) => {
    if (correct) {
      setIsTiedOff(true)
      soundEngine.playCarabinerSnap()
      soundEngine.playSuccessChime()
      addEvent('correct_action', '100% Continuous Dual-Lanyard Leapfrog Tie-Off Connected')
      setFeedbackMessage('✅ 100% Dual Lanyard Tie-off locked to overhead 5,000-lb static lifeline!')
      setFeedbackType('success')
    } else {
      triggerFall('Bypassed 100% tie-off and attempted walking narrow girder unclipped!')
    }
    setActiveModal(null)
  }

  const handlePlankDecision = (correct: boolean) => {
    if (correct) {
      setPlankInspected(true)
      setPlankTipped(false)
      soundEngine.playSuccessChime()
      addEvent('hazard_detected', 'Unsecured cantilever board tagged out and cleated')
      setFeedbackMessage('✅ Loose cantilever board secured with cleats and tagged safe for crossing.')
      setFeedbackType('success')
    } else {
      setPlankTipped(true)
      soundEngine.playPlankCreak()
      if (!isTiedOff) {
        triggerFall('Stepped on unsecured cantilever board! Board tipped into 50m abyss!')
      }
    }
    setActiveModal(null)
  }

  const handleCoworkerDecision = (correct: boolean) => {
    if (correct) {
      setCoworkerWarned(true)
      soundEngine.playSuccessChime()
      addEvent('correct_action', 'Stop Work Authority applied: Coworker clipped to static lifeline')
      setFeedbackMessage('✅ Stop Work Authority executed! Coworker stepped back and clipped lanyards.')
      setFeedbackType('success')
    } else {
      soundEngine.playWrongBuzzer()
      addEvent('wrong_action', 'Ignored coworker unclipped at 50m open edge')
      setFeedbackMessage('❌ OSHA VIOLATION: All workers are mandated to halt life-safety violations!')
      setFeedbackType('error')
    }
    setActiveModal(null)
  }

  const handleGuardrailDecision = (correct: boolean) => {
    if (correct) {
      setGuardrailRepaired(true)
      soundEngine.playSuccessChime()
      addEvent('hazard_detected', 'OSHA 1926.502 top-rail, mid-rail, and toe-board barrier installed')
      setFeedbackMessage('✅ 1.07m top rail, mid rail, and toe board installed along open perimeter.')
      setFeedbackType('success')
    } else {
      triggerFall('Left open perimeter unguarded and misstepped into the open drop!')
    }
    setActiveModal(null)
  }

  const allResolved = isTiedOff && plankInspected && coworkerWarned && guardrailRepaired && playerPos[0] > 6.5

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0284c7',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Red Falling Trauma Blur Overlay */}
      {isFalling && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 35,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(185,28,28,0.95) 100%)',
            animation: 'shake 0.1s infinite',
          }}
        />
      )}

      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [-7, 1.7, 0], fov: 75 }} shadows style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <FirstPersonFallingCameraRig
            position={playerPos}
            yaw={yaw}
            pitch={pitch}
            isFalling={isFalling}
            fallY={fallY}
            fallRoll={fallRoll}
          />

          {/* High Altitude Sky & Sunlight */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[20, 50, 20]} intensity={1.5} castShadow />
          <hemisphereLight groundColor="#334155" color="#bae6fd" intensity={0.6} />

          {/* Sky dome representation */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[140, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.BackSide} />
          </mesh>

          {/* 3D High Altitude Environment */}
          <HighAltitudeSkyscraperScene
            plankTipped={plankTipped}
            isTiedOff={isTiedOff}
            guardrailRepaired={guardrailRepaired}
          />
          <CoworkerModelAtEdge isWarned={coworkerWarned} />

          {/* 3D Hotspots */}
          {!isFalling && (
            <group>
              <Html position={[-6, 2.2, 0]} center distanceFactor={12}>
                <button
                  onClick={() => setActiveModal('harness')}
                  style={{
                    background: isTiedOff ? '#15803d' : '#ea580c',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <Link size={14} />
                  {isTiedOff ? '✓ 100% Dual Lanyard Locked' : 'Clip Dual Lanyard to Overhead Lifeline'}
                </button>
              </Html>

              <Html position={[2.4, 1.0, 0]} center distanceFactor={12}>
                <button
                  onClick={() => setActiveModal('plank')}
                  style={{
                    background: plankInspected ? '#15803d' : '#dc2626',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <AlertTriangle size={14} />
                  {plankInspected ? '✓ Cantilever Board Cleated' : 'Inspect Unpinned Cantilever Board'}
                </button>
              </Html>

              <Html position={[8.0, 2.8, -1.2]} center distanceFactor={12}>
                <button
                  onClick={() => setActiveModal('coworker')}
                  style={{
                    background: coworkerWarned ? '#15803d' : '#dc2626',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <UserCheck size={14} />
                  {coworkerWarned ? '✓ Coworker Secured' : 'Issue Stop Work Directive'}
                </button>
              </Html>

              <Html position={[12.2, 1.8, 0]} center distanceFactor={12}>
                <button
                  onClick={() => setActiveModal('guardrail')}
                  style={{
                    background: guardrailRepaired ? '#15803d' : '#ea580c',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <ShieldAlert size={14} />
                  {guardrailRepaired ? '✓ Perimeter Guardrail Installed' : 'Install Missing Guardrail Barrier'}
                </button>
              </Html>
            </group>
          )}
        </Suspense>
      </Canvas>

      {/* ── Top HUD ── */}
      <SimulationHUD scenario={scenario} />

      {/* Elevation Height Badge */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 30,
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.6)',
          borderRadius: 12,
          padding: '10px 16px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <AlertOctagon size={20} color="#ef4444" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>
            ELEVATION: {isFalling ? `${Math.max(0, Math.round(50 + fallY))} METERS (FALLING!)` : '50 METERS (165 FT)'}
          </div>
          <div style={{ fontSize: 10, color: '#fca5a5' }}>
            OSHA 1926 Subpart M • 100% Continuous Tie-Off Required
          </div>
        </div>
      </div>

      {/* ── Virtual On-Screen Direction D-Pad (Guaranteed Intuitive Movement) ── */}
      {!isFalling && (
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

      {/* ── Fall Incident Modal ── */}
      {isFalling && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.88)',
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
              <ArrowDown size={36} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f87171', marginBottom: 12 }}>
              FATAL FALL FROM ELEVATION
            </h2>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 24 }}>
              {fallReason}
            </p>
            <button
              onClick={() => {
                setIsFalling(false)
                setFallY(1.7)
                setFallVelocity(0)
                setFallRoll(0)
                setPlayerPos([-7, 0, 0])
                setPlankTipped(false)
                setIsTiedOff(false)
                setPlankInspected(false)
                setCoworkerWarned(false)
                setGuardrailRepaired(false)
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
              Re-attempt High Girder Walk with 100% Tie-Off
            </button>
          </div>
        </div>
      )}

      {/* ── Scenario Completed Banner ── */}
      {allResolved && !isFalling && (
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
            High-Altitude Traversal Completed!
          </h2>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 24 }}>
            You maintained 100% dual-lanyard continuous tie-off across the 50m narrow girder, cleated the
            loose cantilever board, intervened with your unclipped coworker, and installed perimeter guardrails.
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
      {activeModal === 'harness' && (
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 480, color: '#0f172a' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link size={20} color="#ea580c" /> 100% Fall Protection Hook-Up
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              You are about to step onto the 0.5m wide steel girder at 50 meters elevation. What is your tie-off protocol?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleHarnessDecision(true)}
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
                🔗 <strong>Leapfrog 100% Tie-Off:</strong> Lock dual snap hooks to the overhead static wire rope before taking a step.
              </button>
              <button
                onClick={() => handleHarnessDecision(false)}
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
                🚶 <strong>Walk Unclipped:</strong> Rely on balance and clip in only after crossing to the other side.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'plank' && (
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 480, color: '#0f172a' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} color="#dc2626" /> Cantilever Board Identified
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              A wooden board bridges the middle span, but the overhang is unpinned and unsupported over the 50m drop.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handlePlankDecision(true)}
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
                🛑 <strong>Halt & Secure:</strong> Fasten safety cleats and tag out the board before stepping onto it.
              </button>
              <button
                onClick={() => handlePlankDecision(false)}
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
                🏃 <strong>Walk Across Quickly:</strong> Step in the middle of the board without stopping.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'coworker' && (
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 480, color: '#0f172a' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={20} color="#dc2626" /> Stop Work Authority: Coworker at Edge
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              Your coworker is reaching for bolts with both lanyards unclipped at 50 meters elevation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleCoworkerDecision(true)}
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
                📣 <strong>Immediate Stop Work Call-Out:</strong> Direct coworker to step away from edge and lock snap hooks.
              </button>
              <button
                onClick={() => handleCoworkerDecision(false)}
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
                🤫 <strong>Wait Until Shift End:</strong> Avoid distracting him while he works.
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'guardrail' && (
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 480, color: '#0f172a' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} color="#ea580c" /> Perimeter Edge Guardrail System
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
              The eastern landing platform has an unprotected 50-meter open drop.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleGuardrailDecision(true)}
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
                🛡️ <strong>Install OSHA Guardrail:</strong> 1.07m top rail (200 lbs force), 0.53m mid-rail, and 4-inch toe board.
              </button>
              <button
                onClick={() => handleGuardrailDecision(false)}
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
                ⚠️ <strong>Tape Only:</strong> String yellow caution tape across the edge.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification Banner ── */}
      {feedbackMessage && !isFalling && (
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
