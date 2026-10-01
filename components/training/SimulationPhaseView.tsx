'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, useFBO } from '@react-three/drei'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { Boxes, Tubes, type BoxItem, type Segment } from '@/components/landing/simulator/parts/Instances'
import { AITrainerPanel } from './AITrainerPanel'
import { PlayerRig, createPlayer, type PlayerState } from './sim3d/PlayerRig'
import { SimCanvas, useSceneTimers, useSimAudio, useStepResults } from './sim3d/SimCanvas'
import { AnimatedWorker } from './sim3d/AnimatedWorker'
import { Beacon, PulseRing } from './sim3d/effects'
import { FloorDecal, LightPanels, Paint } from './sim3d/scenery'
import { claddingTexture, concreteTexture, signTexture, stencilTexture } from './sim3d/textures'
import {
  AnimatePresence,
  BriefingCard,
  ControlsHint,
  DebriefCard,
  DecisionCard,
  ExplanationCard,
  HazardCard,
  MissionPanel,
  ObjectivePrompt,
  ScreenFX,
  SimToolbar,
  ToastStack,
  WorldTag,
  useToasts,
  type Decision,
  type DecisionOption,
  type HazardIntel,
  type StepDef,
} from './sim3d/ui'

// ─── Layout ──────────────────────────────────────────────────────────────────
// Pedestrian walkway runs along +X at z = 0. The forklift aisle crosses it
// along Z at x = 0, coming from +Z (the trainee's right) behind tall racking.

const START: [number, number, number] = [-14, 0, 0]
const STOP_LINE_X = -3.1
const WAIT_X = -3.55
const FORKLIFT_LANE_X = -0.35
const FORKLIFT_HOLD_Z = 8.2
const RACK_INNER = 1.6
const RACK_DEPTH = 1.8
const RACK_END = 2.0
const MIRROR_POS = new THREE.Vector3(2.35, 2.95, -1.95)

// ─── Drill content ───────────────────────────────────────────────────────────

const STEPS: StepDef[] = [
  { id: 'approach', label: 'Approach the cross-aisle' },
  { id: 'identify', label: 'Identify the hazards' },
  { id: 'yield', label: 'Yield to the forklift' },
  { id: 'cross', label: 'Cross safely' },
]

const HAZARDS: Record<'corner' | 'forklift', HazardIntel> = {
  corner: {
    id: 'blind-corner-01',
    name: 'Blind intersection — racking blocks the view',
    severity: 'high',
    whatsWrong:
      'Fully loaded pallet racking runs right up to the corner. From the walkway you cannot see down the forklift aisle, and the operator cannot see you.',
    risk: 'A pedestrian and a forklift can arrive at the crossing at the same moment with no warning — the classic struck-by scenario.',
    control: 'Stop at the red line, use the convex mirror, listen for horns, and only cross once the aisle is confirmed clear.',
    ref: 'OSHA 1910.178(n)(4) · 1910.176(a)',
  },
  forklift: {
    id: 'forklift-01',
    name: 'Loaded forklift approaching the crossing',
    severity: 'critical',
    whatsWrong:
      'The mirror shows a counterbalance forklift carrying a full pallet towards the crossing. Its blue warning spot is already moving across the aisle floor.',
    risk: 'A loaded forklift weighs over 4 tonnes and needs several metres to stop. Its load also blocks part of the operator\'s forward view.',
    control: 'Pedestrians yield to powered industrial trucks at crossings. Stay behind the line until it has fully passed.',
    ref: 'OSHA 1910.178(m)(1) · ANSI/ITSDF B56.1',
  },
}

const DECISION: Decision = {
  id: 'intersection',
  tag: 'Yield',
  title: 'A forklift is about to cross in front of you',
  situation:
    'You are at the red stop line. The horn sounded twice from behind the racking on your right and the engine note is getting louder. Your next pick location is just across the aisle.',
  cues: [
    'Convex mirror: forklift with a raised pallet, travelling towards the crossing',
    'Blue pedestrian-warning spot sweeping across the aisle floor',
    'Racking on your right blocks any direct line of sight',
  ],
  question: 'What do you do?',
  options: [
    {
      id: 'hurry',
      label: 'Cross quickly before it arrives',
      detail: 'It still sounds a few seconds away — a brisk walk gets you across first.',
      verdict: 'unsafe',
      outcome: {
        title: 'Struck by a loaded forklift',
        happened:
          'You stepped into the aisle as the forklift came round the racking. The operator saw you too late — even with the brakes locked, the truck could not stop in time.',
        why: 'Sound is misleading in a warehouse: echoes off the racking hide distance and direction. A loaded forklift at walking-plus speed needs several metres to stop, and the pallet blocks part of the driver\'s view.',
        rule: 'Operators must slow down and sound the horn at cross aisles where vision is obstructed — and pedestrians must not rely on that alone. At marked crossings the pedestrian stops, checks and yields.',
        ruleRef: 'OSHA 1910.178(n)(4)',
        takeaway: 'Never race a forklift. Stop at the line, check the mirror, and let it pass.',
      },
    },
    {
      id: 'peek',
      label: 'Step past the rack end to look down the aisle',
      detail: 'Lean out beyond the racking so you can see the forklift directly.',
      verdict: 'risky',
      outcome: {
        title: 'Near miss — you stepped into the travel path',
        happened:
          'To see past the racking you had to step over the stop line and into the aisle. The operator braked hard and stopped half a metre from you.',
        why: 'The stop line is placed so that you can see — via the mirror — without entering the vehicle path. "Just having a look" puts your body exactly where the forklift is going to be.',
        rule: 'Pedestrians stay within marked walkways and behind stop lines at vehicle crossings. Aisles must be kept clear and marked so traffic routes stay separated.',
        ruleRef: 'OSHA 1910.176(a) · 1910.22',
        takeaway: 'Use the mirror from behind the line — never step into the aisle to look.',
      },
    },
    {
      id: 'yield',
      label: 'Stay behind the line, watch the mirror, let it pass',
      detail: 'Hold position, make eye contact with the operator, and cross only once the aisle is clear.',
      verdict: 'correct',
      outcome: {
        title: 'Textbook yield at a blind crossing',
        happened:
          'You held position behind the stop line, tracked the forklift in the mirror and made eye contact with the operator. It passed safely, then you checked both directions and crossed.',
        why: 'Stopping behind the line keeps you out of the vehicle path while the mirror gives you the view the racking blocks. Eye contact confirms the operator knows you are there.',
        rule: 'Forklift operators must slow down and sound the horn at cross aisles with obstructed vision; pedestrians yield right of way to powered trucks at crossings.',
        ruleRef: 'OSHA 1910.178(n)(4) · Site traffic plan',
        takeaway: 'Stop · Look (mirror) · Listen · Eye contact · Cross only when clear.',
      },
    },
  ],
}

// ─── Procedural warehouse geometry (built once) ─────────────────────────────

function rand(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** Racking: four blocks around the intersection, plus pallets and loads. */
function buildRacking() {
  const frame: BoxItem[] = []
  const goods: BoxItem[] = []
  const r = rand(42)
  const BAY = 2.75
  const LEVELS = [0.12, 1.65, 3.15, 4.65]
  const HEIGHT = 5.7
  const loadColors = ['#c49a6c', '#b98a55', '#d2b48c', '#e8e4da', '#a97c50', '#dcdcd2', '#3b6aa0', '#c4a070']

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const z0 = sz * RACK_INNER
      const z1 = sz * (RACK_INNER + RACK_DEPTH)
      const zc = (z0 + z1) / 2
      for (let b = 0; b < 4; b++) {
        const xa = sx * (RACK_END + b * BAY)
        const xb = sx * (RACK_END + (b + 1) * BAY)
        // Uprights
        for (const x of [xa, xb]) {
          for (const z of [z0, z1]) frame.push({ p: [x, HEIGHT / 2, z], s: [0.09, HEIGHT, 0.09], c: '#1d4ed8' })
          // Diagonal bracing proxy
          frame.push({ p: [x, HEIGHT / 2, zc], s: [0.04, HEIGHT, 0.04], c: '#1e40af' })
        }
        const xc = (xa + xb) / 2
        for (const [li, y] of LEVELS.entries()) {
          if (li > 0) {
            for (const z of [z0, z1]) frame.push({ p: [xc, y - 0.06, z], s: [BAY, 0.12, 0.06], c: '#ea580c' })
          }
          // Two pallets per bay, occasionally an empty slot
          for (const off of [-0.65, 0.65]) {
            if (r() < 0.1) continue
            const px = xc + off
            goods.push({ p: [px, y + 0.08, zc], s: [1.15, 0.14, 1.05], c: '#a07a4c' })
            const h = 0.7 + r() * 0.65
            const col = loadColors[Math.floor(r() * loadColors.length)]
            goods.push({ p: [px, y + 0.15 + h / 2, zc], s: [1.05, h, 0.98], c: col })
            if (r() < 0.35 && h < 1.0) {
              const h2 = 0.25 + r() * 0.2
              goods.push({ p: [px + (r() - 0.5) * 0.2, y + 0.15 + h + h2 / 2, zc], s: [0.7, h2, 0.6], c: loadColors[Math.floor(r() * 4)] })
            }
          }
        }
      }
      // End-of-aisle column protector at the corner
      frame.push({ p: [sx * RACK_END, 0.45, sz * RACK_INNER], s: [0.3, 0.9, 0.3], c: '#facc15' })
    }
  }
  return { frame, goods }
}

/** Walkway barriers (posts + rails) with a gap at the crossing. */
function buildBarriers() {
  const posts: BoxItem[] = []
  const rails: Segment[] = []
  for (const z of [-1.25, 1.25]) {
    for (const [a, b] of [[-15, -2.3], [2.3, 15]] as const) {
      for (let x = a; x <= b + 0.01; x += 1.6) posts.push({ p: [x, 0.55, z], s: [0.1, 1.1, 0.1], c: '#facc15' })
      rails.push([a, 1.05, z, b, 1.05, z], [a, 0.55, z, b, 0.55, z])
    }
  }
  return { posts, rails }
}

function buildRoof() {
  const trusses: Segment[] = []
  for (let x = -20; x <= 20; x += 6) {
    trusses.push([x, 9, -22, x, 9, 22], [x, 8.2, -22, x, 8.2, 22])
    for (let z = -22; z < 22; z += 2) trusses.push([x, 8.2, z, x, 9, z + 1], [x, 9, z + 1, x, 8.2, z + 2])
  }
  const lights: BoxItem[] = []
  for (let x = -18; x <= 18; x += 6) for (let z = -15; z <= 15; z += 5) lights.push({ p: [x + 3, 7.95, z], s: [0.6, 0.08, 1.4], c: '#ffffff' })
  return { trusses, lights }
}

const RACKING = buildRacking()
const BARRIERS = buildBarriers()
const ROOF = buildRoof()

// ─── Scene pieces ────────────────────────────────────────────────────────────

function Warehouse() {
  const floor = useMemo(() => concreteTexture([10, 10], '#80868d'), [])
  const wall = useMemo(() => claddingTexture([14, 2], '#d4d8dd'), [])
  const stop = useMemo(() => stencilTexture('stop', 'STOP · LOOK · LISTEN', '#ffffff'), [])
  const xing = useMemo(() => stencilTexture('xing', 'FORKLIFT CROSSING', '#facc15'), [])
  const ped = useMemo(() => stencilTexture('ped', 'PEDESTRIAN WALKWAY', '#e2f5e9'), [])
  const sign = useMemo(
    () => signTexture('fk-warning', ['FORKLIFT', 'TRAFFIC'], { bg: '#facc15', fg: '#111111', border: '#111111', glyph: '⚠', w: 256, h: 256 }),
    []
  )
  const pedSign = useMemo(
    () => signTexture('ped-sign', ['PEDESTRIANS', 'STOP AT LINE'], { bg: '#ffffff', fg: '#b91c1c', border: '#b91c1c', w: 384, h: 192 }),
    []
  )

  const zebra = useMemo(() => {
    const items: number[] = []
    for (let x = -1.6; x <= 1.61; x += 0.55) items.push(x)
    return items
  }, [])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial map={floor} roughness={0.62} metalness={0.05} />
      </mesh>

      {/* Pedestrian walkway */}
      <Paint position={[-8.6, 0.004, 0]} size={[12.6, 2.5]} color="#2f6b4a" />
      <Paint position={[8.6, 0.004, 0]} size={[12.6, 2.5]} color="#2f6b4a" />
      {[-1.25, 1.25].map((z) => (
        <Paint key={z} position={[0, 0.006, z]} size={[30, 0.1]} color="#facc15" />
      ))}
      <FloorDecal map={ped} position={[-9, 0.008, 0]} size={[2.2, 0.275]} rotation={-Math.PI / 2} />

      {/* Forklift aisle edge lines */}
      {[-1.95, 1.95].map((x) => (
        <Paint key={x} position={[x, 0.006, 0]} size={[0.1, 44]} color="#facc15" />
      ))}
      <FloorDecal map={xing} position={[0, 0.008, 5.2]} size={[3.4, 0.42]} rotation={0} />
      <FloorDecal map={xing} position={[0, 0.008, -5.2]} size={[3.4, 0.42]} rotation={Math.PI} />

      {/* Zebra crossing */}
      {zebra.map((x) => (
        <Paint key={x} position={[x, 0.007, 0]} size={[0.3, 2.3]} color="#f1f5f9" />
      ))}

      {/* Stop line + stencil */}
      <Paint position={[STOP_LINE_X, 0.008, 0]} size={[0.32, 2.4]} color="#dc2626" />
      <FloorDecal map={stop} position={[STOP_LINE_X - 0.75, 0.009, 0]} size={[2.2, 0.28]} rotation={-Math.PI / 2} />

      {/* Walls */}
      <mesh position={[0, 4.5, -22]} receiveShadow>
        <boxGeometry args={[50, 9, 0.3]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 4.5, 22]} receiveShadow>
        <boxGeometry args={[50, 9, 0.3]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-20, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[44, 9, 0.3]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[20, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[44, 9, 0.3]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 9.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3a4048" roughness={0.9} />
      </mesh>

      <Tubes segments={ROOF.trusses} radius={0.05} color="#59616b" metalness={0.5} roughness={0.5} />
      <LightPanels items={ROOF.lights} />

      <Boxes items={RACKING.frame} roughness={0.5} />
      <Boxes items={RACKING.goods} roughness={0.85} />
      <Boxes items={BARRIERS.posts} roughness={0.5} />
      <Tubes segments={BARRIERS.rails} radius={0.035} color="#facc15" roughness={0.45} />

      {/* Signs on the rack ends */}
      <mesh position={[-RACK_END - 0.02, 3.0, RACK_INNER + RACK_DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial map={sign} roughness={0.5} />
      </mesh>
      <group position={[STOP_LINE_X - 0.4, 0, -1.55]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.02, 1.95, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshStandardMaterial map={pedSign} roughness={0.5} />
        </mesh>
      </group>

      {/* Parked pallet jack & stacked pallets for clutter near the start */}
      <Boxes
        items={[
          { p: [-12, 0.36, -2.5], s: [1.2, 0.72, 1.0], c: '#a07a4c' },
          { p: [-12, 0.85, -2.5], s: [1.1, 0.26, 0.95], c: '#c49a6c' },
          { p: [11, 0.5, 2.6], s: [1.2, 1.0, 1.0], c: '#dcdcd2' },
        ]}
      />
    </group>
  )
}

/** Convex mirror that really reflects the aisle via a small render target. */
function ConvexMirror() {
  const fbo = useFBO(256, 256, { samples: 0 })
  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(100, 1, 0.1, 60)
    c.position.copy(MIRROR_POS)
    c.lookAt(FORKLIFT_LANE_X, 0.9, 9)
    return c
  }, [])
  const mirrorRef = useRef<THREE.Group>(null)
  const frame = useRef(0)
  const lens = useMemo(() => {
    // Dome cap around +Y, re-mapped with planar UVs so the reflection isn't swirled
    const R = 0.78
    const theta = 0.56
    const geo = new THREE.SphereGeometry(R, 32, 10, 0, Math.PI * 2, 0, theta)
    const rim = R * Math.sin(theta)
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (2 * rim), 0.5 - pos.getZ(i) / (2 * rim))
    geo.rotateX(Math.PI / 2)
    geo.translate(0, 0, -R * Math.cos(theta))
    return { geo, rim }
  }, [])

  const normalLook = useMemo(() => {
    // Face halfway between the walkway and the aisle so it reads as "angled"
    const toPlayer = new THREE.Vector3(WAIT_X, 1.65, 0).sub(MIRROR_POS).normalize()
    const toAisle = new THREE.Vector3(FORKLIFT_LANE_X, 1.2, 9).sub(MIRROR_POS).normalize()
    return MIRROR_POS.clone().add(toPlayer.add(toAisle).normalize())
  }, [])

  useEffect(() => {
    mirrorRef.current?.lookAt(normalLook)
  }, [normalLook])

  useFrame(({ gl, scene }) => {
    // Update the reflection every other frame — enough for a 256px mirror
    if (frame.current++ % 2) return
    const m = mirrorRef.current
    if (!m) return
    m.visible = false
    const autoShadow = gl.shadowMap.autoUpdate
    gl.shadowMap.autoUpdate = false
    gl.setRenderTarget(fbo)
    gl.render(scene, cam)
    gl.setRenderTarget(null)
    gl.shadowMap.autoUpdate = autoShadow
    m.visible = true
  })

  return (
    <group>
      {/* Post */}
      <mesh position={[MIRROR_POS.x + 0.15, MIRROR_POS.y / 2, MIRROR_POS.z - 0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, MIRROR_POS.y, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={mirrorRef} position={MIRROR_POS}>
        {/* Bulged lens showing the reflection; scale.x = -1 mirrors the image */}
        <mesh geometry={lens.geo} scale={[-1, 1, 1]}>
          <meshBasicMaterial map={fbo.texture} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[lens.rim, 0.04, 10, 40]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[lens.rim + 0.02, 40]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
    </group>
  )
}

// ─── Forklift ────────────────────────────────────────────────────────────────

interface ForkliftSim {
  z: number
  speed: number
  targetSpeed: number
  decel: number
  /** Do not drive past this z while holding */
  holdZ: number | null
  wheel: number
}

function ForkliftModel({ simRef, playerRef, groupRef }: { simRef: React.RefObject<ForkliftSim>; playerRef: React.RefObject<PlayerState>; groupRef: React.RefObject<THREE.Group | null> }) {
  const wheels = useRef<THREE.Mesh[]>([])
  const spot = useRef<THREE.Mesh>(null)

  useFrame((_, rawDt) => {
    const f = simRef.current
    const dt = Math.min(rawDt, 0.05) * playerRef.current.timeScale
    const rate = f.targetSpeed < f.speed ? f.decel : 1.6
    f.speed += Math.sign(f.targetSpeed - f.speed) * Math.min(Math.abs(f.targetSpeed - f.speed), rate * dt)
    f.z -= f.speed * dt
    // Hold point, or park before the far wall
    const stopZ = f.holdZ ?? -19
    if (f.z < stopZ) {
      f.z = stopZ
      f.speed = 0
    }
    f.wheel += (f.speed * dt) / 0.32
    if (groupRef.current) groupRef.current.position.z = f.z
    wheels.current.forEach((w) => w && (w.rotation.y = f.wheel))
    if (spot.current) {
      const m = spot.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.55 + Math.sin(performance.now() * 0.012) * 0.15
    }
  })

  const yellow = '#f5b301'
  return (
    <group ref={groupRef} position={[FORKLIFT_LANE_X, 0, 18]}>
      {/* Chassis */}
      <mesh position={[0, 0.62, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.62, 1.9]} />
        <meshStandardMaterial color={yellow} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Counterweight */}
      <mesh position={[0, 0.72, 1.12]} castShadow>
        <boxGeometry args={[1.14, 0.95, 0.5]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 1.37]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.47, 0.47, 1.14, 18, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Seat + steering */}
      <mesh position={[0, 1.1, 0.55]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.45]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.38, 0.78]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.35, -0.1]} rotation={[-0.9, 0, 0]}>
        <torusGeometry args={[0.16, 0.022, 8, 20]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* Operator */}
      <group position={[0, 1.15, 0.45]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.38, 0.5, 0.24]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.34, -0.125]}>
          <planeGeometry args={[0.36, 0.05]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#9ca3af" emissiveIntensity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.11, 14, 12]} />
          <meshStandardMaterial color="#c68c5a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.79, 0]}>
          <sphereGeometry args={[0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0.3, -0.25]} rotation={[-1.1, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.42, 8]} />
            <meshStandardMaterial color="#f97316" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* Overhead guard */}
      {[
        [-0.5, -0.55],
        [0.5, -0.55],
        [-0.5, 0.85],
        [0.5, 0.85],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.6, z]} castShadow>
          <boxGeometry args={[0.07, 1.3, 0.07]} />
          <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.26, 0.15]} castShadow>
        <boxGeometry args={[1.08, 0.06, 1.5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      <group position={[0, 2.38, 0.8]}>
        <Beacon />
      </group>
      {/* Mast */}
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 1.25, -0.95]} castShadow>
          <boxGeometry args={[0.09, 2.5, 0.14]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} position={[x, 1.3, -1.02]}>
          <boxGeometry args={[0.07, 2.3, 0.08]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, -0.92]}>
        <cylinderGeometry args={[0.045, 0.045, 1.9, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Carriage + forks */}
      <mesh position={[0, 0.5, -1.1]} castShadow>
        <boxGeometry args={[0.92, 0.6, 0.06]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.2, -1.7]} castShadow>
          <boxGeometry args={[0.1, 0.045, 1.15]} />
          <meshStandardMaterial color="#52525b" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* Pallet load (shrink-wrapped) */}
      <mesh position={[0, 0.28, -1.7]} castShadow>
        <boxGeometry args={[1.0, 0.14, 1.15]} />
        <meshStandardMaterial color="#a07a4c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.88, -1.7]} castShadow>
        <boxGeometry args={[0.98, 1.05, 1.1]} />
        <meshStandardMaterial color="#d9d4c7" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Wheels */}
      {[
        [-0.58, 0.32, -0.62, 0.32],
        [0.58, 0.32, -0.62, 0.32],
        [-0.55, 0.25, 0.95, 0.25],
        [0.55, 0.25, 0.95, 0.25],
      ].map(([x, y, z, rad], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh
            ref={(m) => {
              if (m) wheels.current[i] = m
            }}
            castShadow
          >
            <cylinderGeometry args={[rad, rad, 0.24, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh position={[0, x < 0 ? -0.125 : 0.125, 0]}>
            <cylinderGeometry args={[rad * 0.55, rad * 0.55, 0.01, 12]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 1.9, -0.62]}>
          <circleGeometry args={[0.06, 14]} />
          <meshBasicMaterial color="#fffbe8" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Blue pedestrian-warning spot projected 5 m ahead */}
      <mesh ref={spot} position={[0, 0.02, -5.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 28]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.019, -5.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 28]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.18} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

// ─── Background life: a picker walking the far walkway ──────────────────────

function BackgroundWorker() {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05)
    const g = ref.current
    if (!g) return
    const u = (t.current * 1.1) % 20
    const forward = u < 10
    const x = forward ? 5 + u : 15 - (u - 10)
    g.position.set(x, 0, -0.45)
    g.rotation.y = forward ? Math.PI / 2 : -Math.PI / 2
  })
  return <AnimatedWorker ref={ref} clip="Walk" speed={0.8} />
}

// ─── Drill controller ────────────────────────────────────────────────────────

type Stage =
  | 'briefing'
  | 'walk'
  | 'alert'
  | 'identify'
  | 'hazard'
  | 'decide'
  | 'playout'
  | 'explain'
  | 'cross'
  | 'debrief'

interface Props {
  scenario: Scenario
}

export function SimulationPhaseView({ scenario }: Props) {
  const setPhase = useSimulationStore((s) => s.setPhase)
  const detectHazard = useSimulationStore((s) => s.detectHazard)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const makeDecision = useSimulationStore((s) => s.makeDecision)
  const addAIMessage = useSimulationStore((s) => s.addAIMessage)
  const addEvent = useSimulationStore((s) => s.addEvent)

  const audio = useSimAudio()
  const { after, clearAll } = useSceneTimers()
  const { toasts, push } = useToasts()
  const { results, record, reset: resetResults } = useStepResults()

  const player = useRef<PlayerState>(createPlayer(START, -Math.PI / 2))
  const forklift = useRef<ForkliftSim>({ z: 18, speed: 0, targetSpeed: 0, decel: 2.5, holdZ: FORKLIFT_HOLD_Z, wheel: 0 })
  const forkliftGroup = useRef<THREE.Group | null>(null)

  const [stage, setStage] = useState<Stage>('briefing')
  const [hazardOpen, setHazardOpen] = useState<HazardIntel | null>(null)
  const [found, setFound] = useState<{ corner: boolean; forklift: boolean }>({ corner: false, forklift: false })
  const [choice, setChoice] = useState<DecisionOption | null>(null)
  const [slowmo, setSlowmo] = useState(false)
  const [danger, setDanger] = useState(false)
  const [flash, setFlash] = useState<{ key: number; color: string } | null>(null)
  const [letterbox, setLetterbox] = useState(false)
  const [blackout, setBlackout] = useState(0)
  const [caption, setCaption] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [coachOpen, setCoachOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [firstAttempt, setFirstAttempt] = useState<boolean | null>(null)
  const stageRef = useRef<Stage>('briefing')
  const choiceRef = useRef<DecisionOption | null>(null)
  useEffect(() => {
    stageRef.current = stage
    choiceRef.current = choice
  }, [stage, choice])

  const currentStep =
    stage === 'briefing' || stage === 'walk'
      ? 'approach'
      : stage === 'alert' || stage === 'identify' || stage === 'hazard'
        ? 'identify'
        : stage === 'cross'
          ? 'cross'
          : stage === 'debrief'
            ? null
            : 'yield'

  // ── Helpers ──
  const doFlash = (color: string) => setFlash({ key: Date.now(), color })

  const resetForklift = (z: number, hold: number | null) => {
    const f = forklift.current
    f.z = z
    f.speed = 0
    f.targetSpeed = 0
    f.holdZ = hold
    f.decel = 2.5
  }

  // ── Stage: begin walking ──
  const begin = () => {
    audio.unlock()
    audio.startLoop('hum')
    setStage('walk')
    setPhase('simulation_active')
    const p = player.current
    p.canWalk = true
    p.canLook = true
    addEvent('scenario_started', 'forklift-walkway')
  }

  // ── Trigger: reaching the approach zone ──
  const triggerAlert = () => {
    const p = player.current
    p.canWalk = false
    p.autoWalk = {
      target: new THREE.Vector3(WAIT_X, 0, 0),
      speed: 1.2,
      onArrive: () => {
        p.focus = MIRROR_POS.clone().add(new THREE.Vector3(-0.3, -0.2, 0.8))
        p.focusRate = 2
      },
    }
    record('approach', true)
    setStage('alert')
    setPhase('hazard_detection')
    audio.startLoop('engine', 0.6)
    audio.horn(true)
    after(350, () => audio.horn())
    // Forklift starts its run behind the racking
    const f = forklift.current
    f.z = 17
    f.targetSpeed = 2.6
    f.holdZ = FORKLIFT_HOLD_Z
    setCaption('A horn sounds from behind the racking on your right…')
    after(1600, () => {
      audio.whooshSlow()
      player.current.timeScale = 0.18
      setSlowmo(true)
      setCaption(null)
      setStage('identify')
      push('Time slowed — identify the hazards before you act.', 'info', 4200)
      addAIMessage({
        role: 'assistant',
        content: 'Horn at a blind crossing. Before moving, identify what you cannot see — the racking corner and what the mirror shows.',
        response: { type: 'warning', message: '' },
      })
    })
  }

  // ── Identify hazards ──
  const identify = (which: 'corner' | 'forklift') => {
    if (found[which]) return
    audio.notify()
    const p = player.current
    p.timeScale = 0
    if (which === 'forklift') {
      p.focus = MIRROR_POS.clone()
      p.focusRate = 4
      p.zoomTarget = 2.6
      setCaption('In the mirror: a loaded forklift heading for the crossing.')
      after(1700, () => {
        setCaption(null)
        setHazardOpen(HAZARDS.forklift)
      })
    } else {
      p.focus = new THREE.Vector3(-RACK_END, 2.2, RACK_INNER + 0.4)
      p.focusRate = 4
      after(500, () => setHazardOpen(HAZARDS.corner))
    }
    detectHazard(HAZARDS[which].id)
    setFound((f) => ({ ...f, [which]: true }))
    setStage('hazard')
  }

  const acknowledgeHazard = () => {
    setHazardOpen(null)
    const p = player.current
    p.zoomTarget = 1
    const both = found.corner && found.forklift
    if (both) {
      record('identify', true)
      p.focus = null
      setPhase('decision_point')
      setStage('decide')
    } else {
      p.timeScale = 0.18
      p.focus = null
      setStage('identify')
      push(found.corner ? 'Now check what the convex mirror shows.' : 'Now look at what is blocking your view.', 'info')
    }
  }

  // ── Decision ──
  const choose = (o: DecisionOption) => {
    setChoice(o)
    setStage('playout')
    if (firstAttempt === null) setFirstAttempt(o.verdict === 'correct')
    record('yield', o.verdict === 'correct')
    addEvent(o.verdict === 'correct' ? 'correct_action' : 'wrong_action', `intersection-${o.id}`)
    setSlowmo(false)
    const p = player.current
    const f = forklift.current
    p.timeScale = 1
    p.focus = null
    p.canLook = false
    f.holdZ = null
    f.z = FORKLIFT_HOLD_Z
    setLetterbox(true)

    if (o.id === 'yield') playYield()
    else if (o.id === 'peek') playPeek()
    else playHurry()
  }

  const playYield = () => {
    const p = player.current
    const f = forklift.current
    f.speed = 2.2
    f.targetSpeed = 2.4
    p.focus = new THREE.Vector3(FORKLIFT_LANE_X, 1.6, f.z)
    p.focusRate = 3
    setCaption('You hold behind the line. The operator sees you and gives a short horn.')
    after(1200, () => audio.horn())
  }

  const playPeek = () => {
    const p = player.current
    const f = forklift.current
    p.autoWalk = { target: new THREE.Vector3(-0.8, 0, 0.1), speed: 1.4, face: false }
    p.focus = new THREE.Vector3(FORKLIFT_LANE_X, 1.4, 6)
    p.focusRate = 3
    f.speed = 2.6
    f.targetSpeed = 2.6
    setCaption('You step past the rack end to get a look…')
  }

  const playHurry = () => {
    const p = player.current
    const f = forklift.current
    p.autoWalk = { target: new THREE.Vector3(2.8, 0, 0), speed: 1.75 }
    f.speed = 3.1
    f.targetSpeed = 3.1
    setCaption('You start across the aisle…')
  }

  // Per-frame trigger checks (no React state unless something happens)
  const fired = useRef<Set<string>>(new Set())
  const onTick = (s: PlayerState) => {
      const st = stageRef.current
      const f = forklift.current
      if (st === 'walk' && s.pos.x > -6.8 && !fired.current.has('alert')) {
        fired.current.add('alert')
        triggerAlert()
      }
      if (st !== 'playout') return
      const id = choiceRef.current?.id

      if (id === 'yield') {
        if (s.focus) s.focus.set(FORKLIFT_LANE_X, 1.6, f.z - 0.6)
        if (f.z < -5 && !fired.current.has('yield-clear')) {
          fired.current.add('yield-clear')
          crossAfterYield()
        }
      }

      if (id === 'peek') {
        if (s.focus) s.focus.set(FORKLIFT_LANE_X, 1.5, Math.max(f.z - 2, 0.5))
        if (f.z < 5.6 && !fired.current.has('peek-brake')) {
          fired.current.add('peek-brake')
          f.targetSpeed = 0
          f.decel = 3.2
          f.holdZ = 2.75
          audio.brakeSqueal()
          audio.hornBlasts(3)
          s.trauma = 0.45
          setDanger(true)
          setCaption('The operator slams on the brakes —')
        }
        if (fired.current.has('peek-brake') && f.speed < 0.05 && !fired.current.has('peek-done')) {
          fired.current.add('peek-done')
          setCaption('— and stops half a metre from you.')
          audio.heartbeat(3)
          after(2200, () => finishPlayout())
        }
      }

      if (id === 'hurry') {
        const overlapX = Math.abs(s.pos.x - FORKLIFT_LANE_X) < 1.0
        const forkTip = f.z - 2.3
        if (f.z < 3.7 && !fired.current.has('hurry-slow')) {
          fired.current.add('hurry-slow')
          // Brief slow-motion as the forklift clears the racking
          s.timeScale = 0.35
          s.focus = new THREE.Vector3(FORKLIFT_LANE_X, 1.4, f.z - 1.5)
          s.focusRate = 6
          setSlowmo(true)
          audio.brakeSqueal()
          audio.heartbeat(2)
          f.targetSpeed = 2.0
          f.decel = 3.0
          setCaption('The forklift emerges from behind the racking — too close to stop.')
        }
        if (s.focus && fired.current.has('hurry-slow')) s.focus.set(FORKLIFT_LANE_X, 1.4, f.z - 1.5)
        if (overlapX && forkTip < 0.35 && f.z > -1 && !fired.current.has('impact')) {
          fired.current.add('impact')
          impact()
        }
      }
  }


  const impact = () => {
    const p = player.current
    const f = forklift.current
    audio.impact(true)
    setSlowmo(false)
    setDanger(true)
    doFlash('rgba(220,38,38,0.85)')
    setCaption(null)
    p.timeScale = 1
    p.autoWalk = null
    p.trauma = 1
    f.targetSpeed = 0
    f.decel = 5
    f.holdZ = f.z - 0.4
    // Knock-down: thrown back along -Z and onto the floor
    const start = p.pos.clone()
    let t = 0
    p.script = (s, dt, camera) => {
      t += dt
      const u = Math.min(1, t / 0.9)
      const e = 1 - Math.pow(1 - u, 3)
      s.pos.set(start.x + 0.4 * e, 0, start.z - 1.7 * e)
      const eye = THREE.MathUtils.lerp(1.65, 0.28, e)
      camera.position.set(s.pos.x, eye, s.pos.z)
      camera.quaternion.setFromEuler(new THREE.Euler(THREE.MathUtils.lerp(s.pitch, 0.9, e), s.yaw + 0.5 * e, THREE.MathUtils.lerp(0, 1.1, e), 'YXZ'))
      return true
    }
    after(1700, () => setBlackout(0.85))
    after(2600, () => finishPlayout())
  }

  const crossAfterYield = () => {
    const p = player.current
    setStage('cross')
    setCaption('Aisle clear. Look both ways — then cross on the zebra.')
    p.focus = new THREE.Vector3(FORKLIFT_LANE_X, 1.5, -8)
    p.focusRate = 3.5
    after(1100, () => {
      p.focus = new THREE.Vector3(FORKLIFT_LANE_X, 1.5, 8)
    })
    after(2200, () => {
      p.focus = null
      setCaption(null)
      p.autoWalk = {
        target: new THREE.Vector3(3.2, 0, 0),
        speed: 1.5,
        onArrive: () => {
          record('cross', true)
          finishPlayout()
        },
      }
    })
  }

  const finishPlayout = () => {
    audio.setLoopVolume('engine', 0.25)
    setLetterbox(false)
    setCaption(null)
    const correct = choiceRef.current?.verdict === 'correct'
    setPhase(correct ? 'outcome_correct' : 'outcome_incorrect')
    if (!correct) audio.error()
    else audio.success()
    addAIMessage({
      role: 'assistant',
      content: correct
        ? 'Good yield: stopped behind the line, used the mirror and crossed only once the aisle was clear.'
        : 'Incident recorded: entering an obstructed crossing with a forklift approaching. Review the yield procedure and try again.',
      response: { type: correct ? 'training_feedback' : 'warning', message: '', correct },
    })
    setStage('explain')
  }

  // ── After the explanation ──
  const retry = () => {
    clearAll()
    fired.current = new Set(['alert'])
    const p = player.current
    p.script = null
    p.autoWalk = null
    p.pos.set(WAIT_X, 0, 0)
    p.vel.set(0, 0, 0)
    p.yaw = -Math.PI / 2 + 0.25
    p.pitch = 0.05
    p.roll = 0
    p.trauma = 0
    p.timeScale = 0
    p.canLook = true
    resetForklift(FORKLIFT_HOLD_Z, FORKLIFT_HOLD_Z)
    setDanger(false)
    setBlackout(0)
    setChoice(null)
    setPhase('decision_point')
    setStage('decide')
  }

  const toDebrief = () => {
    setStage('debrief')
    audio.stopLoop('engine')
  }

  const finish = () => {
    makeDecision(firstAttempt === true)
    audio.stopAllLoops()
    setPhase('positive_video')
  }

  const replay = () => {
    clearAll()
    fired.current = new Set()
    const p = player.current
    Object.assign(p, createPlayer(START, -Math.PI / 2))
    resetForklift(18, FORKLIFT_HOLD_Z)
    resetResults()
    setFound({ corner: false, forklift: false })
    setChoice(null)
    setDanger(false)
    setBlackout(0)
    setSlowmo(false)
    setLetterbox(false)
    setCaption(null)
    setFirstAttempt(null)
    setStage('briefing')
    setPhase('simulation_active')
  }

  const autoWalkToCrossing = () => {
    const p = player.current
    p.autoWalk = { target: new THREE.Vector3(-6.5, 0, 0), speed: 2.2 }
  }

  // Keyboard: E to auto-walk / act on the current prompt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      if (stageRef.current === 'walk') autoWalkToCrossing()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    audio.setEnabled(soundOn)
  }, [audio, soundOn])

  const constrain = useCallback((next: THREE.Vector3) => {
    next.z = THREE.MathUtils.clamp(next.z, -1.0, 1.0)
    const st = stageRef.current
    const maxX = st === 'walk' || st === 'alert' || st === 'identify' || st === 'hazard' || st === 'decide' ? WAIT_X + 0.05 : 4
    next.x = THREE.MathUtils.clamp(next.x, -15, maxX)
  }, [])

  const hazardsFound = detectedHazards.filter((h) => h === HAZARDS.corner.id || h === HAZARDS.forklift.id).length

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0b0f14', userSelect: 'none' }}>
      <SimCanvas background="#1a1f26">
        <fog attach="fog" args={['#1a1f26', 18, 46]} />
        <hemisphereLight args={['#e8eef5', '#3a3530', 1.1]} />
        <directionalLight
          position={[6, 14, 4]}
          intensity={1.5}
          color="#fff6e8"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        >
          <orthographicCamera attach="shadow-camera" args={[-16, 16, 16, -16, 1, 40]} />
        </directionalLight>
        <ambientLight intensity={0.15} />

        <PlayerRig playerRef={player} constrain={constrain} onTick={onTick} onFirstInput={() => setHintVisible(false)} />
        <Warehouse />
        <ConvexMirror />
        <ForkliftModel simRef={forklift} playerRef={player} groupRef={forkliftGroup} />
        <Suspense fallback={null}>
          <BackgroundWorker />
        </Suspense>

        {/* Approach guidance */}
        <PulseRing position={[-6.5, 0, 0]} visible={stage === 'walk'} />
        <PulseRing position={[WAIT_X, 0, 0]} color="#ef4444" radius={0.55} visible={stage === 'alert'} />

        {/* Hazard tags */}
        {(stage === 'identify' || stage === 'hazard') && (
          <>
            <Html position={[-RACK_END - 0.1, 2.4, RACK_INNER + 0.3]} center zIndexRange={[20, 0]}>
              <WorldTag
                label={found.corner ? 'Blind corner ✓' : 'What is blocking your view?'}
                sub={found.corner ? undefined : 'Click to inspect'}
                tone={found.corner ? 'done' : 'hazard'}
                onClick={() => identify('corner')}
              />
            </Html>
            <Html position={[MIRROR_POS.x, MIRROR_POS.y + 0.75, MIRROR_POS.z]} center zIndexRange={[20, 0]}>
              <WorldTag
                label={found.forklift ? 'Forklift in mirror ✓' : 'Convex safety mirror'}
                sub={found.forklift ? undefined : 'Click to check the mirror'}
                tone={found.forklift ? 'done' : 'target'}
                onClick={() => identify('forklift')}
              />
            </Html>
          </>
        )}
      </SimCanvas>

      <ScreenFX slowmo={slowmo} danger={danger} flash={flash} letterbox={letterbox} blackout={blackout} caption={caption} />

      {stage !== 'briefing' && stage !== 'debrief' && (
        <>
          <MissionPanel
            title="Blind-corner crossing"
            steps={STEPS}
            currentId={currentStep}
            results={results}
            chips={[
              { label: 'Hazards found', value: `${hazardsFound} / 2`, tone: hazardsFound === 2 ? 'ok' : 'warn' },
              {
                label: 'Forklift',
                value: stage === 'walk' ? 'Not visible' : stage === 'cross' ? 'Passed' : 'Approaching',
                tone: stage === 'walk' ? 'info' : stage === 'cross' ? 'ok' : 'bad',
              },
            ]}
          />
          <SimToolbar soundOn={soundOn} onToggleSound={() => setSoundOn((v) => !v)} coachOpen={coachOpen} onToggleCoach={() => setCoachOpen((v) => !v)} />
        </>
      )}

      <ToastStack toasts={toasts} />

      {stage === 'walk' && (
        <>
          <ObjectivePrompt
            text="Walk along the green pedestrian walkway to the cross-aisle"
            sub="Stay inside the yellow barriers"
            autoWalkLabel="Walk for me"
            onAutoWalk={autoWalkToCrossing}
          />
          {hintVisible && <ControlsHint />}
        </>
      )}
      {stage === 'identify' && (
        <ObjectivePrompt
          tone="danger"
          text={`Identify the hazards at this crossing (${hazardsFound}/2)`}
          sub="Click the markers in the scene — drag to look around"
        />
      )}

      {coachOpen && (
        <div style={{ position: 'absolute', top: 76, right: 20, zIndex: 35, width: 320, maxWidth: 'calc(100vw - 40px)' }}>
          <AITrainerPanel scenario={scenario} compact />
        </div>
      )}

      <AnimatePresence>
        {stage === 'briefing' && (
          <BriefingCard
            key="brief"
            eyebrow="Warehouse · Blind-corner crossing"
            title={scenario.title}
            role="You are a picker walking to your next pick location."
            situation="Your route crosses a forklift aisle where tall, fully-loaded racking hides traffic coming from the right. Forklifts are operating on this shift."
            objectives={[
              'Walk the marked pedestrian walkway to the crossing',
              'Identify what makes this crossing dangerous',
              'Choose the correct way to deal with an approaching forklift',
              'Cross safely once the aisle is clear',
            ]}
            controls={[
              ['W A S D', 'walk'],
              ['Drag', 'look around'],
              ['E', 'walk for me'],
              ['Space', 'pause'],
            ]}
            onBegin={begin}
          />
        )}
        {hazardOpen && <HazardCard key={hazardOpen.id} hazard={hazardOpen} onAcknowledge={acknowledgeHazard} cta={found.corner && found.forklift ? 'Decide what to do' : 'Continue scanning'} />}
        {stage === 'decide' && <DecisionCard key="decide" decision={DECISION} index={1} total={1} onChoose={choose} />}
        {stage === 'explain' && choice && (
          <ExplanationCard
            key="explain"
            verdict={choice.verdict}
            explanation={choice.outcome}
            primaryLabel={choice.verdict === 'correct' ? 'See debrief' : 'Retry from the stop line'}
            onPrimary={choice.verdict === 'correct' ? toDebrief : retry}
          />
        )}
        {stage === 'debrief' && (
          <DebriefCard
            key="debrief"
            title="Crossing completed safely"
            summary="You recognised the blind corner, read the approaching forklift in the mirror and yielded before crossing — the behaviours that prevent most pedestrian struck-by incidents in warehouses."
            steps={STEPS}
            results={results}
            hazardsFound={hazardsFound}
            totalHazards={2}
            onContinue={finish}
            onReplay={replay}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
