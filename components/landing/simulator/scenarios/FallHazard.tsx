import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { BRAND, SCENARIOS, clamp01, smooth, type SimClock } from '../timeline'
import { Boxes, Tubes, type BoxItem, type Segment } from '../parts/Instances'
import { Worker, type WorkerPose } from '../parts/Worker'
import { applyStageView } from '../parts/stageView'

const META = SCENARIOS[0]

// ─── Layout (metres) ──────────────────────────────────────────────────────────

// Scaffold standards along the building face; the last bay has no guardrail
const XS = [-3.6, -1.8, 0, 1.8, 3.6]
const Z_IN = 2.2
const Z_OUT = 3.1
const Z_MID = (Z_IN + Z_OUT) / 2
const LIFTS = [2, 4]
const DECK_Y = 4.075
const OPEN_X = 2.7 // centre of the unguarded bay
const END_X = 3.6

const CONCRETE = '#bdbdb8'
const CONCRETE_DARK = '#a9a9a4'
const WOOD = ['#c8a46e', '#bf9a63', '#d1ad78']

function buildScene() {
  const pipes: Segment[] = []
  const rebar: Segment[] = []
  const boxes: BoxItem[] = []

  // Scaffold frame
  for (const x of XS) {
    for (const z of [Z_IN, Z_OUT]) {
      pipes.push([x, 0.02, z, x, x === END_X ? 4.12 : 5.1, z])
      boxes.push({ p: [x, 0.01, z], s: [0.18, 0.02, 0.18], c: '#6b7280' })
    }
    for (const y of [0.2, ...LIFTS]) pipes.push([x, y, Z_IN, x, y, Z_OUT])
  }
  for (const y of [0.2, ...LIFTS]) {
    for (const z of [Z_IN, Z_OUT]) pipes.push([XS[0], y, z, END_X, y, z])
  }
  // Guardrails: full length on the lower lift, missing over the last bay on the top lift
  for (const y of [2.5, 3.0]) {
    pipes.push([XS[0], y, Z_OUT, END_X, y, Z_OUT])
    pipes.push([XS[0], y, Z_IN, XS[0], y, Z_OUT])
    pipes.push([END_X, y, Z_IN, END_X, y, Z_OUT])
  }
  for (const y of [4.5, 5.0]) {
    pipes.push([XS[0], y, Z_OUT, XS[3], y, Z_OUT])
    pipes.push([XS[0], y, Z_IN, XS[0], y, Z_OUT])
  }
  // Diagonal bracing
  pipes.push([XS[0], 0.2, Z_OUT, XS[1], 2, Z_OUT], [XS[1], 2, Z_OUT, XS[0], 4, Z_OUT])
  pipes.push([XS[2], 0.2, Z_OUT, XS[3], 2, Z_OUT], [XS[3], 2, Z_OUT, XS[2], 4, Z_OUT])

  // Deck planks and toe boards
  LIFTS.forEach((lift, level) => {
    for (let bay = 0; bay < 4; bay++) {
      const x = XS[bay] + 0.9
      for (let k = 0; k < 3; k++) {
        boxes.push({ p: [x, lift + 0.05, Z_IN + 0.15 + k * 0.3], s: [1.76, 0.045, 0.28], c: WOOD[(bay + k) % 3] })
      }
      if (level === 0 || bay < 3) {
        boxes.push({ p: [x, lift + 0.15, Z_OUT - 0.03], s: [1.76, 0.15, 0.025], c: '#b08a55' })
      }
    }
  })

  // Concrete frame under construction
  boxes.push({ p: [0, 0.1, -1], s: [8.6, 0.2, 6.2], c: CONCRETE })
  boxes.push({ p: [0, 3.875, -1], s: [8.6, 0.25, 6.2], c: CONCRETE })
  for (const x of [-3.9, 0, 3.9]) {
    for (const z of [1.7, -3.7]) {
      boxes.push({ p: [x, 1.975, z], s: [0.4, 3.55, 0.4], c: CONCRETE_DARK })
      boxes.push({ p: [x, 4.7, z], s: [0.4, 1.4, 0.4], c: CONCRETE_DARK })
      // Starter bars for the next pour
      for (const dx of [-0.13, 0.13]) {
        for (const dz of [-0.13, 0.13]) rebar.push([x + dx, 5.35, z + dz, x + dx, 6.05, z + dz])
      }
    }
  }
  boxes.push({ p: [-2, 4.15, -1.6], s: [1.8, 0.3, 1.1], c: WOOD[1], ry: 0.2 })

  // Materials on the ground
  for (let k = 0; k < 4; k++) {
    boxes.push({ p: [-2.2, 0.04 + k * 0.08, 5.7], s: [2.6, 0.075, 0.9], c: WOOD[k % 3], ry: 0.03 * (k % 2 ? 1 : -1) })
  }
  boxes.push({ p: [2.4, 0.07, 6.3], s: [1.2, 0.14, 1.0], c: '#a98652' })
  for (let layer = 0; layer < 2; layer++) {
    for (const dx of [-0.29, 0.29]) {
      for (const dz of [-0.22, 0.22]) {
        boxes.push({ p: [2.4 + dx, 0.21 + layer * 0.14, 6.3 + dz], s: [0.55, 0.13, 0.4], c: '#cfc8b8' })
      }
    }
  }
  // Spare scaffold pipes
  for (let i = 0; i < 5; i++) pipes.push([5.6 + i * 0.075, 0.035, 4.2, 5.6 + i * 0.075, 0.035, 7.4])

  return { pipes, rebar, boxes }
}

const SCENE = buildScene()

// ─── Worker motion ────────────────────────────────────────────────────────────

const START_X = -3.2
const WALK_SPEED = 0.9
const STOP_AT = META.detectedAt
const STOP_LEN = 0.8
const BACK_AT = 9.4
const BACK_LEN = 1.4
const BACK_DIST = 0.7

/** Walks along the top deck, stops short of the open edge when alerted, then steps back. */
function deckWorkerPose(t: number, o: WorkerPose) {
  let distance: number
  let speed: number
  if (t < STOP_AT) {
    distance = WALK_SPEED * t
    speed = WALK_SPEED
  } else {
    const u = clamp01((t - STOP_AT) / STOP_LEN)
    distance = WALK_SPEED * STOP_AT + WALK_SPEED * STOP_LEN * (u - (u * u) / 2)
    speed = WALK_SPEED * (1 - u)
  }
  if (t > BACK_AT) {
    const u = clamp01((t - BACK_AT) / BACK_LEN)
    distance -= BACK_DIST * smooth(u)
    speed = -(BACK_DIST / BACK_LEN) * 6 * u * (1 - u)
  }
  o.x = START_X + distance
  o.y = DECK_Y
  o.z = Z_MID
  o.rotY = Math.PI / 2
  o.walk = clamp01(Math.abs(speed) / 0.35)
  o.speed = speed
  o.base = 'Idle'
}

function groundWorkerPose(_t: number, o: WorkerPose) {
  o.x = -2.2
  o.y = 0
  o.z = 4.8
  o.rotY = 0
  o.walk = 0
  o.speed = 0
  o.base = 'Interact'
}

// ─── Camera ───────────────────────────────────────────────────────────────────

const CAM_DIR = new THREE.Vector3(9.5, 4, 12).normalize()
const BASE_TARGET = new THREE.Vector3(0.3, 4.4, 2)
const FOCUS_TARGET = new THREE.Vector3(2.6, 4.9, Z_MID)

function Cone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.34, 0.04, 0.34]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.29, 0]} castShadow>
        <coneGeometry args={[0.13, 0.5, 14]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.062, 0.088, 0.1, 14]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
      </mesh>
    </group>
  )
}

/** One piece of the pulsing orange highlight; `max` is its peak opacity. */
function ZonePart({ max, children, ...props }: { max: number; children: ReactNode } & ThreeElements['mesh']) {
  return (
    <mesh userData={{ max }} {...props}>
      {children}
      <meshBasicMaterial color={BRAND} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function FallHazard({ clockRef }: { clockRef: RefObject<SimClock> }) {
  const zoneRef = useRef<THREE.Group>(null)
  const targetRef = useRef(new THREE.Vector3())
  const stageRef = useRef(0)
  // 0 normal · 1 hazard highlighted · 2 worker detected · 3 worker alerted
  const [stage, setStage] = useState(0)

  useFrame(({ camera, size }) => {
    const t = clockRef.current.t

    const next = t >= BACK_AT ? 3 : t >= META.detectedAt ? 2 : t >= META.warningAt ? 1 : 0
    if (next !== stageRef.current) {
      stageRef.current = next
      setStage(next)
    }

    // Unprotected edge highlight
    const zone = zoneRef.current
    if (zone) {
      const fade = clamp01((t - META.warningAt) / 0.5)
      const pulse = 0.65 + 0.35 * Math.sin(t * 5)
      zone.visible = fade > 0
      for (const part of zone.children) {
        const material = (part as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = part.userData.max * fade * pulse
      }
    }

    // Slow drift, then push in on the worker at the detection moment
    const focus = smooth((t - META.detectedAt + 0.2) / 1.2) * (1 - smooth((t - 11) / 0.8))
    const aspect = applyStageView(camera, size.width, size.height)
    const fit = aspect < 1.4 ? Math.min(1.4 / aspect, 1.35) : 1
    const distance = THREE.MathUtils.lerp(18, 13, focus) * fit
    const target = targetRef.current.lerpVectors(BASE_TARGET, FOCUS_TARGET, focus)
    const sway = Math.sin((t * Math.PI) / 6) * 0.6
    camera.position.set(
      target.x + CAM_DIR.x * distance + sway,
      target.y + CAM_DIR.y * distance,
      target.z + CAM_DIR.z * distance,
    )
    camera.lookAt(target)
  })

  return (
    <group>
      <Boxes items={SCENE.boxes} />
      <Tubes segments={SCENE.pipes} radius={0.032} />
      <Tubes segments={SCENE.rebar} radius={0.012} color="#8a5a3c" metalness={0.2} roughness={0.8} />

      <Cone position={[4.5, 0, 2.6]} />
      <Cone position={[4.6, 0, 3.7]} />
      <Cone position={[3.7, 0, 4.2]} />

      {/* Where the guardrail should be */}
      <group ref={zoneRef} visible={false}>
        {[4.5, 5.0].map((y) => (
          <ZonePart key={`rail-${y}`} max={0.9} position={[OPEN_X, y, Z_OUT]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 1.8, 6]} />
          </ZonePart>
        ))}
        {[4.5, 5.0].map((y) => (
          <ZonePart key={`end-${y}`} max={0.9} position={[END_X, y, Z_MID]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 6]} />
          </ZonePart>
        ))}
        <ZonePart max={0.28} position={[OPEN_X, 4.6, Z_OUT]}>
          <planeGeometry args={[1.8, 1.05]} />
        </ZonePart>
        <ZonePart max={0.28} position={[END_X, 4.6, Z_MID]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 1.05]} />
        </ZonePart>
        <ZonePart max={0.32} position={[OPEN_X, DECK_Y + 0.005, Z_MID]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.9]} />
        </ZonePart>
        {/* Drop height marker */}
        <ZonePart max={0.9} position={[END_X + 0.14, 2, Z_OUT]}>
          <cylinderGeometry args={[0.015, 0.015, 4, 6]} />
        </ZonePart>
      </group>
      <Worker clockRef={clockRef} pose={deckWorkerPose} />
      <Worker clockRef={clockRef} pose={groundWorkerPose} />
    </group>
  )
}
