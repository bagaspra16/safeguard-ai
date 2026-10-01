import { Boxes, Tubes, type BoxItem, type Segment } from './Instances'

const CRANE_YELLOW = '#eab308'
const MAST_HEIGHT = 19
const SECTION = 1.9
const HALF = 0.7
const JIB_Y = MAST_HEIGHT + 0.6
const JIB_LENGTH = 20
const COUNTER_JIB = 6
const APEX_Y = JIB_Y + 4
const TROLLEY_X = 11

function buildCrane() {
  const chords: Segment[] = []
  const lacing: Segment[] = []
  const boxes: BoxItem[] = []

  // Lattice mast
  const corners = [
    [-HALF, -HALF],
    [HALF, -HALF],
    [HALF, HALF],
    [-HALF, HALF],
  ]
  for (const [x, z] of corners) chords.push([x, 0, z, x, MAST_HEIGHT, z])
  for (let i = 0; i < MAST_HEIGHT / SECTION; i++) {
    const y0 = i * SECTION
    const y1 = y0 + SECTION
    for (let c = 0; c < 4; c++) {
      const [ax, az] = corners[c]
      const [bx, bz] = corners[(c + 1) % 4]
      lacing.push([ax, y1, az, bx, y1, bz])
      lacing.push(i % 2 ? [ax, y0, az, bx, y1, bz] : [bx, y0, bz, ax, y1, az])
    }
  }
  boxes.push({ p: [0, 0.25, 0], s: [3.2, 0.5, 3.2], c: '#bdbdb8' })

  // Slewing unit and cab
  boxes.push({ p: [0, MAST_HEIGHT + 0.3, 0], s: [1.9, 0.6, 1.9], c: '#4b5563' })
  boxes.push({ p: [0.3, MAST_HEIGHT + 1.3, 1.2], s: [1.2, 1.4, 1.0], c: '#f3f4f6' })

  // Jib
  chords.push([0, JIB_Y, -0.6, JIB_LENGTH, JIB_Y, -0.6])
  chords.push([0, JIB_Y, 0.6, JIB_LENGTH, JIB_Y, 0.6])
  chords.push([0, JIB_Y + 1.1, 0, JIB_LENGTH, JIB_Y + 1.1, 0])
  for (let x = 0; x < JIB_LENGTH; x += 2) {
    lacing.push([x, JIB_Y, -0.6, x + 1, JIB_Y + 1.1, 0], [x + 1, JIB_Y + 1.1, 0, x + 2, JIB_Y, -0.6])
    lacing.push([x, JIB_Y, 0.6, x + 1, JIB_Y + 1.1, 0], [x + 1, JIB_Y + 1.1, 0, x + 2, JIB_Y, 0.6])
    lacing.push([x, JIB_Y, -0.6, x, JIB_Y, 0.6])
  }

  // Counter-jib and counterweight
  chords.push([0, JIB_Y, -0.6, -COUNTER_JIB, JIB_Y, -0.6])
  chords.push([0, JIB_Y, 0.6, -COUNTER_JIB, JIB_Y, 0.6])
  for (let x = 0; x > -COUNTER_JIB; x -= 1.5) lacing.push([x, JIB_Y, -0.6, x - 1.5, JIB_Y, 0.6])
  boxes.push({ p: [-COUNTER_JIB + 0.9, JIB_Y - 0.5, 0], s: [1.6, 1.3, 1.3], c: '#9ca3af' })

  // Tower top and tie rods
  chords.push([-HALF, JIB_Y, 0, 0, APEX_Y, 0], [HALF, JIB_Y, 0, 0, APEX_Y, 0])
  lacing.push([0, APEX_Y, 0, JIB_LENGTH * 0.65, JIB_Y + 1.1, 0])
  lacing.push([0, APEX_Y, 0, -COUNTER_JIB + 0.5, JIB_Y, 0])

  // Trolley, hoist line and hook block
  boxes.push({ p: [TROLLEY_X, JIB_Y - 0.25, 0], s: [0.9, 0.3, 1.0], c: '#4b5563' })
  lacing.push([TROLLEY_X, JIB_Y - 0.3, 0, TROLLEY_X, JIB_Y - 7, 0])
  boxes.push({ p: [TROLLEY_X, JIB_Y - 7.2, 0], s: [0.35, 0.5, 0.35], c: '#4b5563' })

  return { chords, lacing, boxes }
}

const CRANE = buildCrane()

/** Static tower crane behind the building; fills the upper part of the hero. */
export function TowerCrane() {
  return (
    <group position={[-9, 0, -12]} rotation={[0, 0.5, 0]}>
      <Tubes segments={CRANE.chords} radius={0.07} color={CRANE_YELLOW} />
      <Tubes segments={CRANE.lacing} radius={0.035} color={CRANE_YELLOW} />
      <Boxes items={CRANE.boxes} />
    </group>
  )
}
