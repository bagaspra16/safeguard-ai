import * as THREE from 'three'
import { BRAND } from '../timeline'
import { Boxes, Tubes, type BoxItem, type Segment } from './Instances'

const CONCRETE = '#bdbdb8'
const CONCRETE_DARK = '#a9a9a4'
const GLASS = '#5b6b7a'
const STEEL = '#4b5563'
const FACADES = ['#c9c5bd', '#b8b3aa', '#d6d1c7', '#a8a29a', '#c2a58c']

// Deterministic PRNG so the skyline is identical on every load
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Ground-plane basis of the default camera, used to spread the skyline across the view
const CAM = { x: 11, z: 15.5 }
const FORWARD = { x: -0.62, z: -0.785 }
const RIGHT = { x: 0.785, z: -0.62 }

function buildBackdrop() {
  const boxes: BoxItem[] = []
  const rebar: Segment[] = []
  const steel: Segment[] = []
  const rand = mulberry32(21)

  // Low-rise buildings in the haze behind the site
  const COUNT = 14
  for (let i = 0; i < COUNT; i++) {
    const depth = (i % 2 ? 62 : 46) + rand() * 5
    const lateral = (-0.72 + (1.44 * (i + 0.5)) / COUNT) * depth
    const x = CAM.x + FORWARD.x * depth + RIGHT.x * lateral
    const z = CAM.z + FORWARD.z * depth + RIGHT.z * lateral
    const storeys = 1 + Math.floor(rand() * 3)
    const w = 7 + rand() * 6
    const d = 7 + rand() * 5
    const h = storeys * 3.2 + 0.4
    boxes.push({ p: [x, h / 2, z], s: [w, h, d], c: FACADES[i % FACADES.length] })
    // Window bands on the two faces that look toward the camera
    for (let s = 0; s < storeys; s++) {
      const y = s * 3.2 + 1.9
      boxes.push({ p: [x, y, z + d / 2], s: [w * 0.82, 1.1, 0.08], c: GLASS })
      boxes.push({ p: [x + w / 2, y, z], s: [0.08, 1.1, d * 0.82], c: GLASS })
    }
  }

  // Site hoarding along the back
  for (let i = 0; i < 18; i++) {
    const x = -31 + i * 2.4
    boxes.push({ p: [x, 1, -18], s: [2.32, 2, 0.06], c: '#eceae4' })
    boxes.push({ p: [x, 1.8, -18], s: [2.32, 0.25, 0.08], c: BRAND })
  }

  // Second, lower concrete frame on the left
  const FX = -15
  const FZ = -3
  for (const y of [3.2, 6.4]) boxes.push({ p: [FX, y - 0.125, FZ], s: [7.6, 0.25, 6], c: CONCRETE })
  for (const dx of [-3.4, 0, 3.4]) {
    for (const dz of [-2.6, 2.6]) {
      boxes.push({ p: [FX + dx, 3.2, FZ + dz], s: [0.4, 6.4, 0.4], c: CONCRETE_DARK })
      boxes.push({ p: [FX + dx, 7, FZ + dz], s: [0.4, 1.2, 0.4], c: CONCRETE_DARK })
      for (const o of [-0.12, 0.12]) rebar.push([FX + dx + o, 7.5, FZ + dz + o, FX + dx + o, 8.2, FZ + dz + o])
    }
  }

  // Site cabin with an orange band, and a portable toilet
  boxes.push({ p: [7.5, 1.4, -12], s: [6, 2.6, 2.5], c: '#e7e5e0' })
  boxes.push({ p: [7.5, 2.5, -12], s: [6.04, 0.25, 2.54], c: BRAND })
  boxes.push({ p: [5.6, 1.1, -10.74], s: [0.9, 2, 0.05], c: '#6b7280' })
  boxes.push({ p: [8.4, 1.6, -10.74], s: [1.5, 0.9, 0.05], c: GLASS })
  boxes.push({ p: [12.2, 1.15, -12.6], s: [1.1, 2.3, 1.1], c: '#9ca3af' })

  // Skip, brick pallets, generator
  boxes.push({ p: [-10.5, 0.65, 3.2], s: [3, 1.3, 1.6], c: STEEL, ry: 0.15 })
  const pallets: [number, number][] = [
    [-6.5, 6.5],
    [-8.1, 6.2],
    [-6.9, 8],
  ]
  for (const [x, z] of pallets) {
    boxes.push({ p: [x, 0.07, z], s: [1.2, 0.14, 1], c: '#a98652' })
    boxes.push({ p: [x, 0.5, z], s: [1.1, 0.72, 0.9], c: '#b4553a' })
  }
  boxes.push({ p: [-12.6, 0.5, 0.6], s: [1.5, 1, 0.9], c: '#eab308' })

  // Rebar bundle
  for (let i = 0; i < 9; i++) {
    const z = 4.6 + (i % 5) * 0.06
    const y = 0.04 + Math.floor(i / 5) * 0.05
    rebar.push([-12.5, y, z + 0.4, -7, y, z])
  }

  // Lighting tower
  boxes.push({ p: [9.6, 0.45, -6.5], s: [1.3, 0.9, 0.8], c: '#eab308' })
  steel.push([9.6, 0.9, -6.5, 9.6, 6, -6.5])
  steel.push([9.1, 6, -6.5, 10.1, 6, -6.5])
  boxes.push({ p: [9.2, 6.05, -6.4], s: [0.5, 0.32, 0.16], c: '#f3f4f6' })
  boxes.push({ p: [10, 6.05, -6.4], s: [0.5, 0.32, 0.16], c: '#f3f4f6' })

  // Wheelbarrow handles and mixer frame legs
  steel.push([7.6, 0.45, -3.4, 8.5, 0.6, -3.15], [7.6, 0.45, -3.4, 8.5, 0.6, -3.65])
  steel.push([6.3, 0, -2.2, 6.6, 0.7, -2.5], [6.9, 0, -2.2, 6.6, 0.7, -2.5])

  return { boxes, rebar, steel }
}

const BACKDROP = buildBackdrop()

const BARRELS: { p: [number, number, number]; c: string }[] = [
  { p: [5.6, 0.45, -5.5], c: '#ea580c' },
  { p: [5.9, 0.45, -6.2], c: STEEL },
  { p: [5.2, 0.45, -6.1], c: '#ea580c' },
]

const PIPES: [number, number, number][] = [
  [-8.6, 0.6, 0.5],
  [-7.4, 0.6, 0.5],
  [-8, 1.64, 0.5],
]

/** Static scenery around the work area: skyline, hoarding, a second frame, plant and materials. */
export function SiteBackdrop() {
  return (
    <group>
      <Boxes items={BACKDROP.boxes} />
      <Tubes segments={BACKDROP.rebar} radius={0.014} color="#8a5a3c" metalness={0.2} roughness={0.8} />
      <Tubes segments={BACKDROP.steel} radius={0.04} color="#6b7280" />

      {/* Sand and gravel */}
      <mesh position={[8.2, 0.5, -4.2]} castShadow receiveShadow>
        <coneGeometry args={[1.7, 1, 20]} />
        <meshStandardMaterial color="#d9c7a0" roughness={1} />
      </mesh>
      <mesh position={[-13.5, 0.4, 6]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 0.8, 20]} />
        <meshStandardMaterial color="#9a968e" roughness={1} />
      </mesh>

      {/* Concrete pipe sections */}
      {PIPES.map((p) => (
        <mesh key={p.join()} position={p} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 2.2, 20, 1, true]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Barrels */}
      {BARRELS.map((b) => (
        <mesh key={b.p.join()} position={b.p} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.9, 14]} />
          <meshStandardMaterial color={b.c} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      {/* Cement mixer */}
      <group position={[6.6, 0, -2.5]}>
        <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0.6]} castShadow>
          <cylinderGeometry args={[0.26, 0.44, 0.85, 16]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.6]} />
          <meshStandardMaterial color={STEEL} roughness={0.7} />
        </mesh>
        {[-0.38, 0.38].map((z) => (
          <mesh key={z} position={[-0.35, 0.22, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 14]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Wheelbarrow */}
      <group position={[7.6, 0, -3.4]}>
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[0.9, 0.28, 0.6]} />
          <meshStandardMaterial color="#6b7280" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[-0.55, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.09, 14]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
