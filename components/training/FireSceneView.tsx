'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { Boxes, Tubes, type BoxItem, type Segment } from '@/components/landing/simulator/parts/Instances'
import { PlayerRig, createPlayer, type PlayerState } from './sim3d/PlayerRig'
import { SimCanvas, useSceneTimers, useSimAudio, useStepResults } from './sim3d/SimCanvas'
import { AnimatedWorker } from './sim3d/AnimatedWorker'
import { FlickerLight, ParticleEmitter, PulseRing, type ParticleConfig } from './sim3d/effects'
import { LightPanels, Paint, Sign, box, collide, type AABB } from './sim3d/scenery'
import { claddingTexture, cloudTexture, concreteTexture, hazardStripeTexture, signTexture } from './sim3d/textures'
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
// Production hall x ∈ [-16, 16], z ∈ [-12, 12]. The paint store occupies the
// north-east corner behind a fire door. North exit (nearest, will smoke-log)
// is beside the call point; the south emergency exit leads to the assembly point.

const START: [number, number, number] = [-9, 0, 5]
const DOOR_HINGE: [number, number, number] = [10, 0, -3]
const DOOR_W = 1.5
const DOOR_OPEN = 1.42
const CALL_POINT = new THREE.Vector3(1.6, 1.3, -11.8)
const CALL_SPOT = new THREE.Vector3(1.6, 0, -10.5)
const FIRE_POINT = new THREE.Vector3(7.25, 1.0, -2.72)
const FIRE_SPOT = new THREE.Vector3(8.0, 0, -0.6)
const NORTH_EXIT = new THREE.Vector3(-1, 1.2, -11.9)
const SOUTH_EXIT_X = -6
const CEILING = 7.6

// ─── Drill content ───────────────────────────────────────────────────────────

const STEPS: StepDef[] = [
  { id: 'discover', label: 'Spot the fire' },
  { id: 'alarm', label: 'Raise the alarm' },
  { id: 'assess', label: 'Fight it or leave it?' },
  { id: 'contain', label: 'Contain the fire' },
  { id: 'evacuate', label: 'Evacuate safely' },
]

const HAZARDS: Record<'fire' | 'smoke' | 'exit', HazardIntel> = {
  fire: {
    id: 'paint-fire-01',
    name: 'Class B fire in the solvent paint store',
    severity: 'critical',
    whatsWrong:
      'Solvent-based paints and thinners are burning on the store shelving. The thick, black smoke rolling out of the doorway is typical of burning hydrocarbons.',
    risk: 'Flammable-liquid fires grow in seconds, can flare up violently and give off toxic smoke containing carbon monoxide and hydrogen cyanide.',
    control: 'Raise the alarm immediately, keep the fire behind the fire door and evacuate. Only trained staff tackle small, early fires with the correct extinguisher.',
    ref: 'NFPA 10 (Class B) · OSHA 1910.106',
  },
  smoke: {
    id: 'smoke-cloud-01',
    name: 'Smoke banking down into the hall',
    severity: 'high',
    whatsWrong:
      'Hot smoke is pouring out of the top of the wedged-open doorway and spreading under the roof, forming a layer that gets deeper every minute.',
    risk: 'Once the layer drops below head height, visibility falls to a few metres and every breath contains toxic gases. Smoke, not flame, causes most fire deaths.',
    control: 'Close the fire door to cut off the source, and stay low when you move through smoke.',
    ref: 'NFPA 80 · NFPA 101',
  },
  exit: {
    id: 'blocked-exit-01',
    name: 'North exit is smoke-logged',
    severity: 'high',
    whatsWrong: 'The nearest exit sits next to the paint store. Smoke in front of it is already down to about 1.5 m and the exit sign is fading from view.',
    risk: 'Heading for the nearest exit out of habit can take you straight into smoke, where people lose their way within a few steps.',
    control: 'Use the alternative route in the emergency action plan — the south exit — and stay low.',
    ref: 'OSHA 1910.36(b) · 1910.38',
  },
}

type StepId = 'alarm' | 'assess' | 'contain' | 'evacuate'

const DECISIONS: Record<StepId, Decision> = {
  alarm: {
    id: 'alarm',
    tag: 'Alarm',
    title: 'Fire in the paint store — what do you do first?',
    situation:
      'You are at the manual call point beside the north exit. Black smoke is pouring out of the paint store doorway and you can hear cans popping. A colleague is still working near the store wearing ear defenders.',
    cues: ['Thick black smoke — burning solvents', 'The building alarm has not sounded yet', 'Your colleague near the store hasn\'t noticed'],
    question: 'Choose your first action:',
    options: [
      {
        id: 'look',
        label: 'Go back for a closer look first',
        detail: 'Make sure it is really serious so you don\'t cause a false alarm.',
        verdict: 'unsafe',
        outcome: {
          title: 'Two minutes lost',
          happened:
            'While you went back to look, the smoke spread under the whole roof and nobody else was warned. Your colleague kept working beside the store.',
          why: 'Flammable-liquid fires grow extremely fast. Worrying about a false alarm is one of the most common reasons alarms are raised late — and a false alarm costs far less than a late one.',
          rule: 'Every workplace must have an alarm system that warns all employees and an emergency action plan explaining how fires are reported. Raise the alarm first, then decide what else to do.',
          ruleRef: 'OSHA 1910.165 · 1910.38',
          takeaway: 'If in doubt, raise the alarm. You don\'t need permission to pull a call point.',
        },
      },
      {
        id: 'pull',
        label: 'Pull the call point and shout "Fire!"',
        detail: 'Warn the whole building and trigger the fire service call-out.',
        verdict: 'correct',
        outcome: {
          title: 'Alarm raised within seconds',
          happened:
            'Sounders and strobes started across the site and the monitoring centre called the fire service. Your colleague saw the strobes, dropped his tools and headed for the south exit.',
          why: 'Every second before an alarm is raised is evacuation time lost for everyone else. A call point warns everyone at once — and on monitored systems it also summons the fire brigade.',
          rule: 'Alarm systems must be able to warn every employee, and the emergency action plan must say how fires are reported. Rescue anyone in immediate danger, then Alarm — before anything else.',
          ruleRef: 'OSHA 1910.165 · 1910.38 · RACE',
          takeaway: 'R-A-C-E: Rescue, Alarm, Contain, Extinguish or Evacuate.',
        },
      },
      {
        id: 'phone',
        label: 'Phone your supervisor for instructions',
        detail: 'They will know whether the building needs to be evacuated.',
        verdict: 'risky',
        outcome: {
          title: 'Alarm delayed by a phone call',
          happened:
            'Your supervisor didn\'t answer straight away. By the time you got through, smoke had spread across the ceiling — and the building alarm still hadn\'t sounded.',
          why: 'A phone call warns one person. The fire alarm warns everyone at once and calls the fire service. Supervisors can be told after the alarm is raised.',
          rule: 'Any employee who discovers a fire raises the alarm using the means in the emergency action plan — without waiting for instructions.',
          ruleRef: 'OSHA 1910.38(c)(1)',
          takeaway: 'Pull first, phone later.',
        },
      },
    ],
  },
  assess: {
    id: 'assess',
    tag: 'Assess',
    title: 'Two extinguishers at the fire point',
    situation:
      'A red water extinguisher and a black-banded CO₂ extinguisher hang beside the store. Through the doorway you can see flames across two shelves of solvent paint, and a drum has started to burn.',
    cues: [
      'Fire covers well over a square metre and is climbing the shelving',
      'Smoke is banking down from the ceiling',
      'Your escape route is behind you — for now',
    ],
    question: 'Do you fight this fire?',
    options: [
      {
        id: 'water',
        label: 'Use the water extinguisher',
        detail: 'Water cools the burning material — aim at the base of the flames.',
        verdict: 'unsafe',
        outcome: {
          title: 'Burning solvent splashed out of the store',
          happened:
            'The water jet hit the burning paint and scattered it. Lit solvent ran across the floor towards you and the fire doubled in size.',
          why: 'Solvents float on water and keep burning. A water jet breaks up and spreads burning liquid. Water extinguishers are for Class A fires only — wood, paper, textiles.',
          rule: 'Extinguishers must be matched to the class of fire. Water-type extinguishers must never be used on Class B (flammable liquid) fires.',
          ruleRef: 'NFPA 10 · OSHA 1910.157',
          takeaway: 'Never put water on a flammable-liquid fire.',
        },
      },
      {
        id: 'co2',
        label: 'Use the CO₂ extinguisher',
        detail: 'CO₂ is rated for Class B fires — smother it from the doorway.',
        verdict: 'risky',
        outcome: {
          title: 'Right extinguisher — wrong size of fire',
          happened:
            'The CO₂ knocked the flames down for a few seconds, then the cylinder ran empty. The hot solvent re-ignited and you had spent valuable time standing next to a growing fire.',
          why: 'Portable extinguishers hold roughly 10–20 seconds of agent and are meant for incipient fires — about the size of a wastebasket. CO₂ doesn\'t cool, so hot liquids re-ignite once it disperses.',
          rule: 'Only fight a fire if it is still incipient, you are trained, you have the right extinguisher and a clear escape route behind you. Otherwise, evacuate.',
          ruleRef: 'OSHA 1910.155 (incipient stage) · 1910.157',
          takeaway: 'Bigger than a wastebasket? Don\'t fight it — get out.',
        },
      },
      {
        id: 'leave',
        label: 'Leave it — it\'s beyond a first-aid fire',
        detail: 'The fire is past the incipient stage. Focus on containing it and getting out.',
        verdict: 'correct',
        outcome: {
          title: 'Correct risk assessment',
          happened:
            'You recognised that the fire had spread across the shelving and that a portable extinguisher would not control it. You stayed out of the store and turned to containing it.',
          why: 'A portable extinguisher gives you 10–20 seconds of agent. Several litres of burning solvent, multiple shelves and a drum are far beyond that — trying anyway puts you between the fire and your exit.',
          rule: 'Employees may only fight incipient-stage fires, and only when trained. Anything larger is left to the fire service.',
          ruleRef: 'OSHA 1910.155 · 1910.157(g)',
          takeaway: 'Fight only small, early fires — and only with your exit behind you.',
        },
      },
    ],
  },
  contain: {
    id: 'contain',
    tag: 'Contain',
    title: 'The fire door has been wedged open',
    situation:
      'The store\'s self-closing fire door is propped open with a wooden wedge. Smoke is rolling out of the top of the doorway and along the roof of the hall.',
    cues: ['Door label: "Fire door — keep shut"', 'The smoke layer is now about 4 m above the floor', 'Nobody is left inside the store'],
    question: 'What do you do with the door?',
    options: [
      {
        id: 'vent',
        label: 'Leave it open so the smoke can vent',
        detail: 'Let the smoke escape from the store into the much bigger hall.',
        verdict: 'unsafe',
        outcome: {
          title: 'Smoke flooded the hall',
          happened:
            'With the door open, hot smoke poured into the hall and the fire drew in fresh air and flared up. Within a minute the smoke layer had dropped below head height.',
          why: 'An open door feeds the fire with oxygen and lets toxic smoke reach the escape routes. The hall isn\'t a vent — it\'s where everyone needs to breathe on the way out.',
          rule: 'Fire doors must be kept closed, or held open only by devices that release automatically on alarm. Never wedge them open.',
          ruleRef: 'NFPA 80 · NFPA 101',
          takeaway: 'Close doors on a fire — it buys everyone time.',
        },
      },
      {
        id: 'close',
        label: 'Kick out the wedge and let it close',
        detail: 'Remove the wedge so the self-closer shuts and latches the door.',
        verdict: 'correct',
        outcome: {
          title: 'Fire contained',
          happened:
            'The door swung shut and latched. The flow of smoke into the hall dropped at once and the fire was starved of fresh air.',
          why: 'A closed fire-rated door holds back flames, heat and smoke for long enough for everyone to escape and for firefighters to arrive.',
          rule: 'Fire doors must be self-closing and kept shut; wedging them open defeats the building\'s fire compartments.',
          ruleRef: 'NFPA 80 · NFPA 101',
          takeaway: 'Close the door on a fire — never prop it open.',
        },
      },
      {
        id: 'drums',
        label: 'Dash in and drag the unburnt drums out',
        detail: 'Get the fuel away from the flames before it catches.',
        verdict: 'unsafe',
        outcome: {
          title: 'Driven back by heat and smoke',
          happened:
            'As you stepped into the doorway the radiant heat and smoke forced you back, and you took a lungful of hot, toxic smoke.',
          why: 'Burning solvent stores can flash over without warning. Drums of flammable liquid can rupture when heated. No stock is worth entering a burning room for.',
          rule: 'Never re-enter a burning area to save property. Leave firefighting inside the store to the fire service.',
          ruleRef: 'OSHA 1910.38 · 1910.157',
          takeaway: 'Property can be replaced. Close the door and walk away.',
        },
      },
    ],
  },
  evacuate: {
    id: 'evacuate',
    tag: 'Evacuate',
    title: 'Choose your way out',
    situation:
      'The alarm is sounding. The north exit is 12 m away but the smoke in front of it is down to about 1.5 m. The south emergency exit is 22 m away across the hall, and the air near the floor is still clear.',
    cues: ['North exit: sign barely visible through the smoke', 'South exit: clear route along the marked aisle', 'Assembly point is outside the south exit'],
    question: 'How do you get out?',
    options: [
      {
        id: 'wait',
        label: 'Wait by the store to brief the fire service',
        detail: 'You know exactly where the fire started — they will need that.',
        verdict: 'unsafe',
        outcome: {
          title: 'Stayed inside a burning building',
          happened:
            'You waited in the hall as the smoke layer kept dropping. By the time firefighters arrived you were in thick smoke and they had to search for you.',
          why: 'Firefighters get their briefing from the warden at the assembly point. Anyone still inside becomes someone they have to rescue.',
          rule: 'Everyone evacuates when the alarm sounds. Information is passed to the fire service by the warden at the assembly point.',
          ruleRef: 'OSHA 1910.38(c)',
          takeaway: 'Never stay behind — brief the fire service from outside.',
        },
      },
      {
        id: 'north',
        label: 'North exit — it\'s the closest',
        detail: 'Twelve metres is quicker than twenty-two. Walk fast and hold your breath.',
        verdict: 'unsafe',
        outcome: {
          title: 'Overcome by smoke',
          happened:
            'Walking upright into the smoke, you lost sight of the exit sign within a few steps and started coughing. Disoriented, you went down short of the door.',
          why: 'Fire smoke contains carbon monoxide and hydrogen cyanide — a few breaths can cause confusion and collapse. The nearest exit is not the safest one if it is smoke-logged.',
          rule: 'Workplaces need at least two exit routes so one can be used if the other is blocked by fire or smoke. Follow the alternative route in your emergency action plan.',
          ruleRef: 'OSHA 1910.36(b) · 1910.38',
          takeaway: 'Nearest isn\'t safest — take the exit with clear air.',
        },
      },
      {
        id: 'south',
        label: 'South exit, staying low under the smoke',
        detail: 'Crouch below the smoke layer and follow the marked aisle to the south exit.',
        verdict: 'correct',
        outcome: {
          title: 'Safe evacuation',
          happened:
            'You stayed low where the air is cleaner, followed the marked aisle to the south exit and closed the door behind you. At the assembly point you reported to the fire warden.',
          why: 'Heat and smoke rise, so the cleanest air is near the floor. A clear route and a head count at the assembly point mean nobody is left behind.',
          rule: 'Exit routes must be kept clear and the emergency action plan must name an assembly point where everyone is accounted for.',
          ruleRef: 'OSHA 1910.36 · 1910.38(c)(4)',
          takeaway: 'Get low, get out, stay out — and report at the assembly point.',
        },
      },
    ],
  },
}

// ─── Particle presets ────────────────────────────────────────────────────────

const FIRE_CFG: ParticleConfig = {
  count: 120,
  kind: 'fire',
  origin: [11, 0.45, -7.4],
  spread: [3.0, 0.25, 1.2],
  life: [0.5, 1.1],
  velocity: [0, 2.0, 0],
  jitter: [0.35, 0.7, 0.35],
  size: [1.25, 0.35],
  colorStart: '#fff0c2',
  colorEnd: '#ff4a00',
  opacity: 0.9,
  lift: 1.2,
}
const SHELF_FIRE_CFG: ParticleConfig = {
  ...FIRE_CFG,
  count: 60,
  origin: [11, 1.9, -9.6],
  spread: [2.6, 0.6, 0.3],
  size: [0.9, 0.2],
}
const SPARK_CFG: ParticleConfig = {
  count: 36,
  kind: 'spark',
  origin: [11, 0.8, -7.4],
  spread: [2.5, 0.4, 1.0],
  life: [0.8, 1.8],
  velocity: [0, 2.6, 0],
  jitter: [0.9, 1.2, 0.9],
  size: [0.08, 0.03],
  colorStart: '#ffe9b0',
  colorEnd: '#ff5a00',
  opacity: 1,
  lift: -0.6,
}
const ROOM_SMOKE_CFG: ParticleConfig = {
  count: 60,
  kind: 'smoke',
  origin: [11, 2.6, -7],
  spread: [2.8, 0.6, 1.6],
  life: [2.5, 4.5],
  velocity: [0, 0.8, 0],
  jitter: [0.4, 0.3, 0.4],
  size: [1.6, 3.8],
  colorStart: '#2a2622',
  colorEnd: '#151515',
  opacity: 0.75,
  ceiling: 4.3,
}
const DOOR_SMOKE_CFG: ParticleConfig = {
  count: 150,
  kind: 'smoke',
  origin: [9.25, 1.9, -3.1],
  spread: [0.6, 0.25, 0.1],
  life: [5, 9],
  velocity: [0, 0.8, 1.2],
  jitter: [0.4, 0.3, 0.45],
  size: [1.0, 4.2],
  colorStart: '#4a433b',
  colorEnd: '#2a2723',
  opacity: 0.5,
  ceiling: CEILING - 0.4,
  drag: 0.12,
}
const SPILL_FIRE_CFG: ParticleConfig = {
  ...FIRE_CFG,
  count: 70,
  origin: [8.9, 0.15, -1.7],
  spread: [1.1, 0.05, 1.0],
  size: [0.9, 0.3],
  velocity: [0, 1.4, 0],
}
const NORTH_SMOKE_CFG: ParticleConfig = {
  count: 70,
  kind: 'smoke',
  origin: [0.5, 2.6, -9.8],
  spread: [5, 1.4, 2.2],
  life: [5, 9],
  velocity: [-0.15, 0.05, 0.05],
  jitter: [0.2, 0.1, 0.2],
  size: [3.5, 6],
  colorStart: '#4b443c',
  colorEnd: '#2e2a26',
  opacity: 0.55,
  drag: 0.3,
}
const SPRAY_CFG: ParticleConfig = {
  count: 70,
  kind: 'spray',
  origin: [8.3, 1.05, -1.25],
  spread: [0.04, 0.04, 0.04],
  life: [0.4, 0.7],
  velocity: [1.6, 0.4, -3.6],
  jitter: [0.35, 0.3, 0.35],
  size: [0.05, 0.35],
  colorStart: '#e0f2fe',
  colorEnd: '#93c5fd',
  opacity: 0.6,
  lift: -6,
}
const CO2_CFG: ParticleConfig = {
  ...SPRAY_CFG,
  count: 80,
  kind: 'smoke',
  life: [0.7, 1.4],
  velocity: [1.2, 0.2, -3.0],
  jitter: [0.5, 0.4, 0.5],
  size: [0.2, 1.8],
  colorStart: '#ffffff',
  colorEnd: '#e2e8f0',
  opacity: 0.55,
  lift: 0,
  drag: 1.2,
}

// ─── World state shared by the director and the flow ────────────────────────

interface FireWorld {
  burning: boolean
  fireTarget: number
  /** Height of the smoke layer underside */
  smokeY: number
  /** Metres per second the smoke layer drops */
  smokeRate: number
  smokeFloor: number
  doorTarget: number
  doorAngle: number
  alarm: boolean
}

const initialWorld = (): FireWorld => ({
  burning: false,
  fireTarget: 0,
  smokeY: CEILING,
  smokeRate: 0,
  smokeFloor: 4.2,
  doorTarget: DOOR_OPEN,
  doorAngle: DOOR_OPEN,
  alarm: false,
})

// ─── Geometry ────────────────────────────────────────────────────────────────

function buildFactory() {
  const boxes: BoxItem[] = []
  const colliders: AABB[] = []
  const machine = (x: number, z: number, sx: number, sy: number, sz: number, c = '#d9dde2') => {
    boxes.push({ p: [x, sy / 2, z], s: [sx, sy, sz], c })
    // Control panel + window strip
    boxes.push({ p: [x, sy * 0.62, z + sz / 2 + 0.02], s: [sx * 0.5, sy * 0.35, 0.04], c: '#1f2937' })
    boxes.push({ p: [x + sx / 2 - 0.25, sy * 0.55, z + sz / 2 + 0.05], s: [0.3, 0.45, 0.08], c: '#334155' })
    boxes.push({ p: [x, sy + 0.04, z], s: [sx * 0.9, 0.08, sz * 0.9], c: '#f97316' })
    colliders.push(box(x, z, sx, sz))
  }
  machine(-12, -7, 2.4, 2.1, 1.7)
  machine(-8, -7, 2.4, 2.1, 1.7)
  machine(-12, -3.2, 2.4, 2.1, 1.7)
  machine(-8, -3.2, 2.4, 2.1, 1.7, '#cfd6dd')
  machine(10.5, 5, 2.6, 2.3, 1.8)
  machine(13.8, 5, 2.0, 2.0, 1.8, '#c7ced6')
  machine(10.5, 9, 2.6, 2.3, 1.8, '#cfd6dd')

  // Conveyor along the west side
  boxes.push({ p: [-11.5, 0.85, 8.8], s: [7, 0.18, 1.0], c: '#475569' })
  for (let x = -14.6; x <= -8.4; x += 1.55) boxes.push({ p: [x, 0.42, 8.8], s: [0.12, 0.85, 0.9], c: '#64748b' })
  for (let x = -14.4; x < -8.6; x += 1.2) boxes.push({ p: [x, 1.12, 8.8], s: [0.6, 0.38, 0.55], c: '#b98a55' })
  colliders.push(box(-11.5, 8.8, 7, 1.0))

  // Workbench where the colleague works
  boxes.push({ p: [4.6, 0.9, 1.6], s: [2.0, 0.08, 0.8], c: '#8b5a2b' })
  for (const [dx, dz] of [[-0.9, -0.33], [0.9, -0.33], [-0.9, 0.33], [0.9, 0.33]]) boxes.push({ p: [4.6 + dx, 0.45, 1.6 + dz], s: [0.06, 0.9, 0.06], c: '#374151' })
  boxes.push({ p: [4.3, 1.05, 1.6], s: [0.5, 0.22, 0.35], c: '#1f2937' })
  colliders.push(box(4.6, 1.6, 2.0, 0.8, 0.25))

  // Pallets & drums along the south wall
  for (let i = 0; i < 4; i++) boxes.push({ p: [3 + i * 1.3, 0.55, 11], s: [1.1, 1.1, 1.0], c: i % 2 ? '#c49a6c' : '#dcd6c8' })
  colliders.push(box(4.95, 11, 5.0, 1.0))

  // Paint store shelving (inside)
  for (const [x, z, sx, sz] of [
    [11, -9.9, 6, 0.8],
    [14.2, -7, 0.8, 4.5],
  ] as const) {
    for (const y of [0.15, 1.05, 1.95, 2.85]) boxes.push({ p: [x, y, z], s: [sx, 0.06, sz], c: '#64748b' })
    for (const dx of [-sx / 2, sx / 2]) for (const dz of [-sz / 2, sz / 2]) boxes.push({ p: [x + dx, 1.5, z + dz], s: [0.06, 3.0, 0.06], c: '#475569' })
    // Paint tins on the shelves
    const along = sx > sz
    const n = Math.floor((along ? sx : sz) / 0.32)
    for (const y of [0.33, 1.23, 2.13]) {
      for (let i = 0; i < n; i++) {
        if ((i * 7 + y * 10) % 5 < 1) continue
        const t = -((along ? sx : sz) / 2) + 0.2 + i * 0.32
        const col = ['#dc2626', '#2563eb', '#f59e0b', '#e5e7eb', '#16a34a'][(i + Math.round(y)) % 5]
        boxes.push({ p: [along ? x + t : x, y, along ? z : z + t], s: [0.24, 0.3, 0.24], c: col })
      }
    }
  }
  return { boxes, colliders }
}

function buildShell() {
  // Paint-store walls with door, window openings
  const walls: BoxItem[] = []
  const H = 4.5
  const wall = (x0: number, x1: number, y0: number, y1: number, z: number) =>
    walls.push({ p: [(x0 + x1) / 2, (y0 + y1) / 2, z], s: [x1 - x0, y1 - y0, 0.25], c: '#9aa3ad' })
  wall(6, 8.5, 0, H, -3)
  wall(8.5, 10, 2.25, H, -3)
  wall(10, 11.5, 0, H, -3)
  wall(11.5, 13.5, 0, 1.1, -3)
  wall(11.5, 13.5, 2.1, H, -3)
  wall(13.5, 16, 0, H, -3)
  walls.push({ p: [6, H / 2, -7.5], s: [0.25, H, 9], c: '#9aa3ad' })
  walls.push({ p: [11, H + 0.1, -7.5], s: [10, 0.2, 9], c: '#7b838c' })
  // Structural columns & roof trusses
  const cols: BoxItem[] = []
  for (const x of [-10, -2, 6, 14]) for (const z of [-11.6, 11.6]) cols.push({ p: [x, CEILING / 2, z], s: [0.4, CEILING, 0.4], c: '#475569' })
  const truss: Segment[] = []
  for (let x = -14; x <= 14; x += 4) {
    truss.push([x, CEILING, -12, x, CEILING, 12], [x, CEILING - 0.8, -12, x, CEILING - 0.8, 12])
    for (let z = -12; z < 12; z += 2) truss.push([x, CEILING - 0.8, z, x, CEILING, z + 1], [x, CEILING, z + 1, x, CEILING - 0.8, z + 2])
  }
  const lights: BoxItem[] = []
  for (let x = -12; x <= 12; x += 6) for (let z = -8; z <= 8; z += 5.3) lights.push({ p: [x + 2, CEILING - 0.95, z], s: [0.5, 0.06, 1.3], c: '#fff' })
  return { walls, cols, truss, lights }
}

const FACTORY = buildFactory()
const SHELL = buildShell()
const COLLIDERS: AABB[] = [...FACTORY.colliders, { minX: 5.7, maxX: 16, minZ: -12, maxZ: -2.7 }]

// ─── Scene pieces ────────────────────────────────────────────────────────────

function FactoryHall() {
  const floor = useMemo(() => concreteTexture([9, 7], '#7d847f'), [])
  const wall = useMemo(() => claddingTexture([12, 2], '#c3c9cf'), [])
  const exitSign = useMemo(() => signTexture('exit', ['EXIT'], { bg: '#16a34a', fg: '#ffffff', w: 256, h: 96, glyph: undefined, font: 64 }), [])
  const store = useMemo(
    () => signTexture('paint-store', ['PAINT STORE', 'HIGHLY FLAMMABLE'], { bg: '#facc15', fg: '#111111', border: '#111111', w: 512, h: 200 }),
    []
  )
  const fireDoor = useMemo(() => signTexture('fire-door', ['FIRE DOOR', 'KEEP SHUT'], { bg: '#1d4ed8', fg: '#ffffff', w: 256, h: 160 }), [])
  const assembly = useMemo(() => signTexture('assembly', ['ASSEMBLY', 'POINT →'], { bg: '#16a34a', fg: '#ffffff', w: 256, h: 160 }), [])
  const stripes = useMemo(() => hazardStripeTexture([6, 1]), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 26]} />
        <meshStandardMaterial map={floor} roughness={0.6} metalness={0.04} />
      </mesh>
      {/* Marked aisles */}
      {[
        [0, 2.6, 30, 0.1],
        [0, -1.0, 12, 0.1],
      ].map(([x, z, w, h], i) => (
        <Paint key={i} position={[x, 0.006, z]} size={[w, h]} color="#facc15" />
      ))}
      <Paint position={[SOUTH_EXIT_X, 0.006, 6.5]} size={[0.1, 11]} color="#22c55e" />
      <Paint position={[SOUTH_EXIT_X + 1.4, 0.006, 6.5]} size={[0.1, 11]} color="#22c55e" />
      {/* Hazard stripes in front of the paint store */}
      <mesh position={[11, 0.008, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 0.25]} />
        <meshStandardMaterial map={stripes} roughness={0.6} polygonOffset polygonOffsetFactor={-2} />
      </mesh>

      {/* Perimeter walls (with exit doorways) */}
      <mesh position={[0, CEILING / 2, -12.1]}>
        <boxGeometry args={[34, CEILING, 0.2]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-16.1, CEILING / 2, 0]}>
        <boxGeometry args={[0.2, CEILING, 26]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[16.1, CEILING / 2, 0]}>
        <boxGeometry args={[0.2, CEILING, 26]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* South wall split around the exit door */}
      <mesh position={[(-16 + SOUTH_EXIT_X - 0.6) / 2, CEILING / 2, 12.1]}>
        <boxGeometry args={[SOUTH_EXIT_X - 0.6 + 16, CEILING, 0.2]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[(16 + SOUTH_EXIT_X + 0.6) / 2, CEILING / 2, 12.1]}>
        <boxGeometry args={[16 - SOUTH_EXIT_X - 0.6, CEILING, 0.2]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[SOUTH_EXIT_X, (CEILING + 2.2) / 2, 12.1]}>
        <boxGeometry args={[1.2, CEILING - 2.2, 0.2]} />
        <meshStandardMaterial map={wall} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Daylight beyond the south exit */}
      <mesh position={[SOUTH_EXIT_X, 1.1, 12.5]}>
        <planeGeometry args={[1.2, 2.2]} />
        <meshBasicMaterial color="#dff3ff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CEILING + 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 26]} />
        <meshStandardMaterial color="#2d3238" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* North exit door */}
      <mesh position={[NORTH_EXIT.x, 1.1, -11.98]}>
        <boxGeometry args={[1.1, 2.2, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>
      <Sign map={exitSign} position={[NORTH_EXIT.x, 2.6, -11.95]} size={[0.8, 0.3]} glow />
      <Sign map={exitSign} position={[SOUTH_EXIT_X, 2.6, 11.95]} size={[0.8, 0.3]} rotationY={Math.PI} glow />
      <Sign map={assembly} position={[SOUTH_EXIT_X + 1.4, 1.9, 11.95]} size={[0.6, 0.38]} rotationY={Math.PI} />

      <Boxes items={SHELL.walls} roughness={0.85} />
      <Boxes items={SHELL.cols} roughness={0.5} />
      <Tubes segments={SHELL.truss} radius={0.05} color="#59616b" metalness={0.5} roughness={0.5} />
      <LightPanels items={SHELL.lights} />
      <Boxes items={FACTORY.boxes} roughness={0.65} />

      {/* Paint store signage + window glass */}
      <Sign map={store} position={[9.25, 2.75, -2.86]} size={[1.6, 0.62]} />
      <Sign map={fireDoor} position={[7.25, 2.1, -2.86]} size={[0.5, 0.31]} />

      {/* Drums inside the store */}
      {[
        [8.2, -9.2],
        [8.9, -9.4],
        [13.4, -4.2],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.45, z]} castShadow>
          <cylinderGeometry args={[0.29, 0.29, 0.9, 16]} />
          <meshStandardMaterial color="#1e40af" roughness={0.45} metalness={0.5} />
        </mesh>
      ))}

      {/* Fire point: call-out sign, water + CO2 extinguishers */}
      <group position={[FIRE_POINT.x, 0, FIRE_POINT.z + 0.05]}>
        <mesh position={[0, 1.6, -0.03]}>
          <planeGeometry args={[1.0, 1.2]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        {[
          { x: -0.24, band: '#1f2937', label: 'CO₂' },
          { x: 0.24, band: '#dc2626', label: 'H₂O' },
        ].map((e) => (
          <group key={e.label} position={[e.x, 0.95, 0.12]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.62, 14]} />
              <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.092, 0.092, 0.1, 14]} />
              <meshStandardMaterial color={e.band} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <boxGeometry args={[0.06, 0.1, 0.12]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {e.label === 'CO₂' && (
              <mesh position={[0.1, 0.1, 0.06]} rotation={[0, 0, -0.3]}>
                <coneGeometry args={[0.05, 0.22, 10]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Manual call point */}
      <group position={[CALL_POINT.x, CALL_POINT.y, CALL_POINT.z]}>
        <mesh>
          <boxGeometry args={[0.2, 0.24, 0.08]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[0.14, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

function FireDoor({ worldRef }: { worldRef: React.RefObject<FireWorld> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const w = worldRef.current
    const k = 1 - Math.exp(-(w.doorTarget < w.doorAngle ? 2.5 : 5) * Math.min(dt, 0.05))
    w.doorAngle += (w.doorTarget - w.doorAngle) * k
    if (ref.current) ref.current.rotation.y = w.doorAngle
  })
  return (
    <group ref={ref} position={DOOR_HINGE}>
      <mesh position={[-DOOR_W / 2, 1.1, 0]} castShadow>
        <boxGeometry args={[DOOR_W, 2.2, 0.06]} />
        <meshStandardMaterial color="#9b1c1c" roughness={0.45} metalness={0.3} />
      </mesh>
      {/* Vision panel and push bar */}
      <mesh position={[-DOOR_W / 2, 1.55, 0.032]}>
        <planeGeometry args={[0.3, 0.45]} />
        <meshStandardMaterial color="#ffb067" emissive="#ff6a00" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-DOOR_W * 0.75, 1.0, 0.06]}>
        <boxGeometry args={[0.6, 0.05, 0.04]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Self-closer arm */}
      <mesh position={[-0.35, 2.12, 0.07]}>
        <boxGeometry args={[0.5, 0.06, 0.06]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} />
      </mesh>
    </group>
  )
}

function Wedge({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <mesh position={[9.85, 0.04, -1.55]} rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.12, 0.08, 0.3]} />
      <meshStandardMaterial color="#a16207" roughness={0.8} />
    </mesh>
  )
}

/** Advances the fire, smoke layer and fog each frame from the world ref. */
function FireDirector({
  worldRef,
  playerRef,
  fireRef,
  doorSmokeRef,
  windowRef,
}: {
  worldRef: React.RefObject<FireWorld>
  playerRef: React.RefObject<PlayerState>
  fireRef: React.RefObject<number>
  doorSmokeRef: React.RefObject<number>
  windowRef: React.RefObject<THREE.Mesh | null>
}) {
  const fogClear = useMemo(() => new THREE.Color('#262b31'), [])
  const fogSmoke = useMemo(() => new THREE.Color('#1c1916'), [])
  const layer = useRef<THREE.Group>(null)
  const clouds = useMemo(() => [cloudTexture([3, 2]), cloudTexture([5, 4])], [])

  useFrame(({ clock, scene }, rawDt) => {
    const w = worldRef.current
    const player = playerRef.current
    const dt = Math.min(rawDt, 0.05) * player.timeScale
    const real = Math.min(rawDt, 0.05)

    const target = w.burning ? w.fireTarget : 0
    fireRef.current += (target - fireRef.current) * (1 - Math.exp(-1.5 * real))
    const open = Math.abs(w.doorAngle) > 0.25
    doorSmokeRef.current += ((open ? Math.min(1, fireRef.current) : 0.04) - doorSmokeRef.current) * (1 - Math.exp(-2 * real))

    if (w.burning && w.smokeY > w.smokeFloor) w.smokeY = Math.max(w.smokeFloor, w.smokeY - w.smokeRate * dt)

    // Haze: 0 with a high layer, 1 once smoke is at head height
    const haze = THREE.MathUtils.clamp((CEILING - 0.3 - w.smokeY) / 5.6, 0, 1)
    const eyeY = player.pos.y + player.eye
    const inSmoke = THREE.MathUtils.clamp((eyeY - w.smokeY + 0.4) / 0.8, 0, 1)
    const fog = scene.fog as THREE.Fog | null
    if (fog) {
      const d = Math.max(haze * 0.65, inSmoke)
      fog.near = THREE.MathUtils.lerp(16, 0.5, d)
      fog.far = THREE.MathUtils.lerp(48, 6, d)
      fog.color.copy(fogClear).lerp(fogSmoke, d)
    }
    if (layer.current) layer.current.position.y = w.smokeY
    clouds[0].offset.set(clock.elapsedTime * 0.006, clock.elapsedTime * 0.004)
    clouds[1].offset.set(-clock.elapsedTime * 0.009, clock.elapsedTime * 0.003)

    if (windowRef.current) {
      const m = windowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = fireRef.current * (1.2 + Math.sin(clock.elapsedTime * 11) * 0.25)
    }
  })

  return (
    <group ref={layer} position={[0, CEILING, 0]}>
      {/* Underside of the hot smoke layer (two sheets for a soft edge) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.7, 0]} renderOrder={1}>
        <planeGeometry args={[32, 24]} />
        <meshBasicMaterial color="#3d3731" transparent opacity={0.95} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.25, 0]} renderOrder={1}>
        <planeGeometry args={[32, 24]} />
        <meshBasicMaterial map={clouds[0]} color="#6b625a" transparent opacity={0.95} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} renderOrder={1}>
        <planeGeometry args={[32, 24]} />
        <meshBasicMaterial map={clouds[1]} color="#857a6f" transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function AlarmStrobes({ on }: { on: boolean }) {
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  useFrame(({ clock }) => {
    const flash = on && clock.elapsedTime % 1.0 < 0.09
    mats.current.forEach((m) => m && m.color.set(flash ? '#ffffff' : on ? '#7f1d1d' : '#450a0a'))
  })
  const spots: [number, number, number][] = [
    [CALL_POINT.x, 2.6, -11.95],
    [-14, 3.2, -11.95],
    [SOUTH_EXIT_X + 1.6, 2.8, 11.95],
    [15.95, 3.2, 4],
  ]
  return (
    <group>
      {spots.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.18, 0.12, 0.1]} />
          <meshBasicMaterial ref={(m) => { if (m) mats.current[i] = m }} color="#450a0a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Colleague at the bench; after the alarm, walks out via the south exit. */
function Colleague({ evacuating }: { evacuating: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(0)
  const path = useMemo(
    () => [new THREE.Vector3(4.6, 0, 0.7), new THREE.Vector3(0, 0, 4.5), new THREE.Vector3(SOUTH_EXIT_X + 0.6, 0, 10.6), new THREE.Vector3(SOUTH_EXIT_X + 0.6, 0, 13.5)],
    []
  )
  const [gone, setGone] = useState(false)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g || !evacuating || gone) return
    t.current += Math.min(dt, 0.05) * 1.6
    let d = t.current
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]
      const b = path[i + 1]
      const len = a.distanceTo(b)
      if (d <= len) {
        g.position.lerpVectors(a, b, d / len)
        g.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)
        return
      }
      d -= len
    }
    setGone(true)
  })
  if (gone) return null
  return <AnimatedWorker ref={ref} clip={evacuating ? 'Walk' : 'Interact'} position={[4.6, 0, 0.75]} rotation={0} speed={evacuating ? 1.15 : 1} />
}

// ─── Drill controller ────────────────────────────────────────────────────────

type Stage = 'briefing' | 'ignite' | 'spot' | 'travel' | 'hazard' | 'decide' | 'playout' | 'explain' | 'debrief'

interface Checkpoint {
  world: FireWorld
  pos: THREE.Vector3
  yaw: number
}

interface Props {
  scenario: Scenario
}

export function FireSceneView({ scenario }: Props) {
  const setPhase = useSimulationStore((s) => s.setPhase)
  const detectHazard = useSimulationStore((s) => s.detectHazard)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const makeDecision = useSimulationStore((s) => s.makeDecision)
  const addEvent = useSimulationStore((s) => s.addEvent)

  const audio = useSimAudio()
  const { after, clearAll } = useSceneTimers()
  const { toasts, push } = useToasts()
  const { results, record, reset: resetResults } = useStepResults()

  const player = useRef<PlayerState>(createPlayer(START, -1.16))
  const world = useRef<FireWorld>(initialWorld())
  const fireK = useRef(0)
  const doorSmokeK = useRef(0)
  const spillK = useRef(0)
  const sprayK = useRef(0)
  const northSmokeK = useRef(0)
  const windowRef = useRef<THREE.Mesh | null>(null)
  const checkpoint = useRef<Checkpoint | null>(null)

  const [stage, setStage] = useState<Stage>('briefing')
  const [step, setStep] = useState<StepId>('alarm')
  const [hazardOpen, setHazardOpen] = useState<HazardIntel | null>(null)
  const [choice, setChoice] = useState<DecisionOption | null>(null)
  const [alarmOn, setAlarmOn] = useState(false)
  const [doorShut, setDoorShut] = useState(false)
  const [spray, setSpray] = useState<'water' | 'co2' | null>(null)
  const [spill, setSpill] = useState(false)
  const [danger, setDanger] = useState(false)
  const [flash, setFlash] = useState<{ key: number; color: string } | null>(null)
  const [letterbox, setLetterbox] = useState(false)
  const [blackout, setBlackout] = useState(0)
  const [caption, setCaption] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [hintVisible, setHintVisible] = useState(true)
  const [inRange, setInRange] = useState(false)
  const [runId, setRunId] = useState(0)
  const [distance, setDistance] = useState<number | null>(null)
  const firstTry = useRef<Record<string, boolean>>({})
  const stageRef = useRef<Stage>('briefing')
  const stepRef = useRef<StepId>('alarm')
  const choiceRef = useRef<DecisionOption | null>(null)
  useEffect(() => {
    stageRef.current = stage
    stepRef.current = step
    choiceRef.current = choice
  }, [stage, step, choice])

  useEffect(() => {
    audio.setEnabled(soundOn)
  }, [audio, soundOn])

  const doFlash = (color: string) => setFlash({ key: Date.now(), color })
  const decisionIndex = (['alarm', 'assess', 'contain', 'evacuate'] as StepId[]).indexOf(step) + 1

  const currentStepId =
    stage === 'briefing' || stage === 'ignite' || (stage === 'spot' && !results.discover?.done)
      ? 'discover'
      : stage === 'debrief'
        ? null
        : step

  // ── Begin: short calm, then the store ignites ──
  const begin = () => {
    audio.unlock()
    audio.startLoop('hum')
    setStage('ignite')
    const p = player.current
    p.canLook = true
    p.canWalk = false
    addEvent('scenario_started', 'factory-fire')
    setCaption('Late shift on the production floor. Machines humming…')
    after(2200, ignite)
  }

  const ignite = () => {
    const w = world.current
    const p = player.current
    w.burning = true
    w.fireTarget = 1
    w.smokeRate = 0.07
    w.smokeFloor = 4.0
    audio.flareUp()
    audio.startLoop('fire', 0.5)
    p.trauma = 0.35
    p.focus = new THREE.Vector3(9.25, 1.8, -3)
    p.focusRate = 2.2
    doFlash('rgba(255,140,40,0.35)')
    setCaption('A flash and a dull thump from the paint store — smoke is pouring out of the doorway.')
    setPhase('hazard_detection')
    after(3200, () => {
      setCaption(null)
      p.focus = null
      p.timeScale = 0.25
      setStage('spot')
      push('Identify the hazard — click the marker on the paint store.', 'info', 4500)
    })
  }

  const identifyFire = () => {
    if (stageRef.current !== 'spot') return
    audio.notify()
    detectHazard(HAZARDS.fire.id)
    player.current.timeScale = 0
    setHazardOpen(HAZARDS.fire)
    setStage('hazard')
  }

  const acknowledgeHazard = () => {
    const h = hazardOpen
    setHazardOpen(null)
    if (h?.id === HAZARDS.fire.id) {
      record('discover', true)
      goTravel('alarm')
    } else {
      openDecision(stepRef.current)
    }
  }

  const goTravel = (s: StepId) => {
    const p = player.current
    p.timeScale = 1
    p.canWalk = true
    p.canLook = true
    p.focus = null
    setStep(s)
    setStage('travel')
    setPhase('simulation_active')
  }

  const target = step === 'alarm' ? CALL_SPOT : FIRE_SPOT
  const targetLook = step === 'alarm' ? CALL_POINT : FIRE_POINT

  const arrive = () => {
    const p = player.current
    p.canWalk = false
    p.autoWalk = null
    p.vel.set(0, 0, 0)
    p.focus = targetLook.clone()
    p.focusRate = 4
    p.timeScale = 0
    audio.click()
    after(450, () => openDecision(stepRef.current))
  }

  const openDecision = (s: StepId) => {
    const p = player.current
    p.timeScale = 0
    p.canWalk = false
    checkpoint.current = { world: { ...world.current }, pos: p.pos.clone(), yaw: p.yaw }
    setStep(s)
    setPhase('decision_point')
    setStage('decide')
  }

  const autoWalk = () => {
    const p = player.current
    p.autoWalk = { target: target.clone(), speed: 2.4, onArrive: arrive }
  }

  // ── Decisions ──
  const choose = (o: DecisionOption) => {
    const s = stepRef.current
    setChoice(o)
    if (firstTry.current[s] === undefined) firstTry.current[s] = o.verdict === 'correct'
    record(s, o.verdict === 'correct')
    addEvent(o.verdict === 'correct' ? 'correct_action' : 'wrong_action', `fire-${s}-${o.id}`)
    setStage('playout')
    setLetterbox(true)
    const p = player.current
    p.timeScale = 1
    p.focus = null
    p.canLook = false

    if (s === 'alarm') playAlarm(o.id)
    else if (s === 'assess') playAssess(o.id)
    else if (s === 'contain') playContain(o.id)
    else playEvacuate(o.id)
  }

  const playAlarm = (id: string) => {
    const w = world.current
    const p = player.current
    if (id === 'pull') {
      audio.pull()
      p.trauma = 0.1
      after(250, () => {
        w.alarm = true
        setAlarmOn(true)
        audio.startLoop('alarm')
        setCaption('Sounders and strobes across the site. Your colleague spots the strobes and heads for the south exit.')
        p.focus = new THREE.Vector3(4.6, 1.2, 1.2)
        p.focusRate = 2
      })
      after(4200, finishPlayout)
    } else {
      setCaption(id === 'look' ? 'You head back towards the store to take a closer look…' : 'Ringing… ringing… still no answer.')
      if (id === 'look') p.autoWalk = { target: new THREE.Vector3(3.5, 0, -4.5), speed: 1.6 }
      w.smokeRate = 0.55
      w.fireTarget = 1.3
      after(1800, () => {
        audio.cough()
        setDanger(true)
        setCaption('The smoke spreads under the whole roof — and nobody else has been warned.')
      })
      after(5200, finishPlayout)
    }
  }

  const playAssess = (id: string) => {
    const w = world.current
    const p = player.current
    p.focus = new THREE.Vector3(9.25, 1.1, -3.6)
    p.focusRate = 3
    if (id === 'leave') {
      setCaption('Flames are across two shelves and a drum is alight — far beyond a first-aid fire. You step back.')
      p.autoWalk = { target: new THREE.Vector3(7.6, 0, 0.2), speed: 1, face: false }
      after(3600, finishPlayout)
    } else if (id === 'water') {
      setSpray('water')
      sprayK.current = 1
      audio.hiss(1.2)
      setCaption('You aim the water jet into the burning paint…')
      after(1100, () => {
        sprayK.current = 0
        w.fireTarget = 1.6
        w.smokeRate = 0.3
        setSpill(true)
        spillK.current = 1
        audio.flareUp()
        p.trauma = 0.8
        doFlash('rgba(255,120,30,0.7)')
        setDanger(true)
        setCaption('Burning solvent sprays out of the doorway and runs across the floor towards you!')
        p.autoWalk = { target: new THREE.Vector3(6.2, 0, 1.8), speed: 2.6, face: false }
      })
      after(4800, finishPlayout)
    } else {
      setSpray('co2')
      sprayK.current = 1
      audio.hiss(2.6)
      setCaption('A roar of CO₂ — the flames drop back…')
      w.fireTarget = 0.35
      after(2600, () => {
        sprayK.current = 0
        setCaption('…and the cylinder is empty. The hot solvent re-ignites.')
      })
      after(3600, () => {
        w.fireTarget = 1.25
        audio.flareUp()
        p.trauma = 0.4
        doFlash('rgba(255,140,40,0.45)')
      })
      after(6000, finishPlayout)
    }
  }

  const playContain = (id: string) => {
    const w = world.current
    const p = player.current
    p.focus = new THREE.Vector3(9.25, 1.4, -3)
    p.focusRate = 3
    if (id === 'close') {
      setCaption('You kick the wedge clear. The self-closer pulls the door shut…')
      after(700, () => {
        w.doorTarget = 0
        setDoorShut(true)
      })
      after(1900, () => {
        audio.doorSlam()
        p.trauma = 0.2
        w.smokeRate = 0.01
        w.smokeFloor = Math.min(w.smokeY, 4.4)
        audio.setLoopVolume('fire', 0.2)
        setCaption('Latched. The smoke pouring into the hall is cut off.')
      })
      after(4300, finishPlayout)
    } else if (id === 'vent') {
      w.fireTarget = 1.5
      w.smokeRate = 0.7
      w.smokeFloor = 1.3
      setCaption('Fresh air rushes in — the fire roars and smoke floods the hall.')
      after(900, () => audio.flareUp())
      after(2600, () => {
        audio.cough()
        setDanger(true)
      })
      after(5000, finishPlayout)
    } else {
      p.autoWalk = { target: new THREE.Vector3(9.1, 0, -2.2), speed: 1.6 }
      after(1300, () => {
        audio.flareUp()
        audio.cough()
        p.trauma = 0.7
        doFlash('rgba(255,90,20,0.65)')
        setDanger(true)
        setCaption('A wall of heat and smoke drives you back from the doorway.')
        p.autoWalk = { target: new THREE.Vector3(7.4, 0, 0.3), speed: 2.4, face: false }
      })
      after(4600, finishPlayout)
    }
  }

  const playEvacuate = (id: string) => {
    const w = world.current
    const p = player.current
    if (id === 'south') {
      p.eyeTarget = 0.95
      setCaption('Staying low, you follow the marked aisle to the south exit.')
      const waypoints = [new THREE.Vector3(4.2, 0, 3.4), new THREE.Vector3(-3.2, 0, 7.6), new THREE.Vector3(SOUTH_EXIT_X + 0.6, 0, 10.9), new THREE.Vector3(SOUTH_EXIT_X + 0.6, 0, 13.2)]
      const walk = (i: number) => {
        if (i >= waypoints.length) return
        p.autoWalk = {
          target: waypoints[i],
          speed: 1.9,
          onArrive: () => {
            if (i === waypoints.length - 2) setCaption('Through the exit — the door closes behind you.')
            walk(i + 1)
          },
        }
      }
      walk(0)
      after(14500, () => setBlackout(1))
      after(15500, () => {
        setCaption('Assembly point: you report to the fire warden. Everyone is accounted for.')
        audio.success()
      })
      after(18500, () => {
        setBlackout(0.85)
        finishPlayout()
      })
    } else {
      const north = id === 'north'
      if (north) p.autoWalk = { target: new THREE.Vector3(NORTH_EXIT.x + 0.4, 0, -10.6), speed: 1.7 }
      w.smokeRate = north ? 0.6 : 0.5
      w.smokeFloor = 1.0
      setCaption(north ? 'You head upright for the north exit…' : 'You wait beside the store. The smoke keeps coming down…')
      after(2600, () => {
        audio.cough()
        setDanger(true)
        setCaption(north ? 'Within a few steps the exit sign disappears. You can\'t stop coughing.' : 'You can no longer see the far wall.')
      })
      after(4200, () => audio.cough())
      after(5200, () => {
        audio.heartbeat(3)
        const start = p.pos.clone()
        let t = 0
        p.autoWalk = null
        p.script = (s, dt, camera) => {
          t += dt
          const u = Math.min(1, t / 1.6)
          const e = u * u * (3 - 2 * u)
          s.pos.copy(start)
          camera.position.set(start.x, THREE.MathUtils.lerp(s.eye, 0.35, e), start.z)
          camera.quaternion.setFromEuler(new THREE.Euler(THREE.MathUtils.lerp(s.pitch, -0.4, e), s.yaw, THREE.MathUtils.lerp(0, 0.9, e), 'YXZ'))
          return true
        }
        setBlackout(0.9)
      })
      after(7400, finishPlayout)
    }
  }

  const finishPlayout = () => {
    setLetterbox(false)
    setCaption(null)
    setSpray(null)
    const correct = choiceRef.current?.verdict === 'correct'
    if (correct) audio.success()
    else audio.error()
    setPhase(correct ? 'outcome_correct' : 'outcome_incorrect')
    setStage('explain')
  }

  const retry = () => {
    clearAll()
    const cp = checkpoint.current
    const p = player.current
    if (cp) {
      Object.assign(world.current, cp.world)
      p.pos.copy(cp.pos)
      p.yaw = cp.yaw
    }
    p.script = null
    p.autoWalk = null
    p.vel.set(0, 0, 0)
    p.pitch = 0
    p.roll = 0
    p.eye = p.eyeTarget = 1.65
    p.trauma = 0
    p.focus = stepRef.current === 'alarm' ? CALL_POINT.clone() : stepRef.current === 'evacuate' ? null : FIRE_POINT.clone()
    setDoorShut(Math.abs(world.current.doorTarget) < 0.1)
    setSpill(false)
    spillK.current = 0
    setDanger(false)
    setBlackout(0)
    setChoice(null)
    audio.setLoopVolume('fire', Math.abs(world.current.doorTarget) < 0.1 ? 0.2 : 0.5)
    openDecision(stepRef.current)
  }

  const nextAfterCorrect = () => {
    const s = stepRef.current
    setChoice(null)
    setDanger(false)
    const p = player.current
    if (s === 'alarm') goTravel('assess')
    else if (s === 'assess') {
      // Contain happens right here: show the smoke hazard, then decide
      p.focus = new THREE.Vector3(9.25, 3, -3)
      p.focusRate = 3
      setStep('contain')
      detectHazard(HAZARDS.smoke.id)
      audio.notify()
      setHazardOpen(HAZARDS.smoke)
      setStage('hazard')
    } else if (s === 'contain') {
      // Evacuate: pan to the smoke-logged north exit
      p.timeScale = 1
      world.current.smokeRate = 0.08
      world.current.smokeFloor = 2.6
      p.focus = NORTH_EXIT.clone()
      p.focusRate = 2.5
      northSmokeK.current = 1
      setStep('evacuate')
      setStage('playout')
      setCaption('The alarm keeps sounding. Smoke has drifted along the roof towards the north exit.')
      after(2800, () => {
        setCaption(null)
        detectHazard(HAZARDS.exit.id)
        audio.notify()
        setHazardOpen(HAZARDS.exit)
        setStage('hazard')
      })
    } else {
      setStage('debrief')
    }
  }

  const finish = () => {
    makeDecision(Object.values(firstTry.current).every(Boolean))
    audio.stopAllLoops()
    setPhase('positive_video')
  }

  const replay = () => {
    clearAll()
    audio.stopLoop('alarm')
    audio.stopLoop('fire')
    Object.assign(world.current, initialWorld())
    Object.assign(player.current, createPlayer(START, -1.16))
    fireK.current = 0
    doorSmokeK.current = 0
    northSmokeK.current = 0
    firstTry.current = {}
    resetResults()
    setAlarmOn(false)
    setDoorShut(false)
    setSpill(false)
    setDanger(false)
    setBlackout(0)
    setChoice(null)
    setStep('alarm')
    setStage('briefing')
    setRunId((n) => n + 1)
    setPhase('simulation_active')
  }

  // Per-frame: distance to the current objective
  const lastDist = useRef(-1)
  const onTick = (s: PlayerState) => {
    if (stageRef.current !== 'travel') return
    const d = Math.hypot(s.pos.x - target.x, s.pos.z - target.z)
    const rounded = Math.round(d)
    if (rounded !== lastDist.current) {
      lastDist.current = rounded
      setDistance(rounded)
    }
    const near = d < 1.6
    if (near !== inRangeRef.current) {
      inRangeRef.current = near
      setInRange(near)
    }
  }
  const inRangeRef = useRef(false)

  const interact = () => {
    if (stageRef.current === 'travel' && inRangeRef.current) {
      inRangeRef.current = false
      setInRange(false)
      arrive()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE' || stageRef.current !== 'travel') return
      if (inRangeRef.current) interact()
      else autoWalk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const constrain = (next: THREE.Vector3, prev: THREE.Vector3) => {
    if (!player.current.autoWalk) collide(next, prev, COLLIDERS)
    next.x = THREE.MathUtils.clamp(next.x, -15.5, 15.5)
    const outside = Math.abs(next.x - (SOUTH_EXIT_X + 0.6)) < 0.6
    next.z = THREE.MathUtils.clamp(next.z, -11.5, outside && stageRef.current === 'playout' ? 14 : 11.5)
  }

  const hazardsFound = detectedHazards.filter((h) => h === HAZARDS.fire.id || h === HAZARDS.smoke.id || h === HAZARDS.exit.id).length

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0b0f14', userSelect: 'none' }}>
      <SimCanvas background="#262b31" fov={70}>
        <fog attach="fog" args={['#262b31', 16, 48]} />
        <hemisphereLight args={['#dbe4ee', '#3b342c', 0.85]} />
        <directionalLight position={[-6, 14, 6]} intensity={1.1} color="#f2f5ff" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.04}>
          <orthographicCamera attach="shadow-camera" args={[-18, 18, 14, -14, 1, 40]} />
        </directionalLight>
        <ambientLight intensity={0.12} />

        <PlayerRig playerRef={player} constrain={constrain} onTick={onTick} onFirstInput={() => setHintVisible(false)} />
        <FactoryHall />
        <FireDoor worldRef={world} />
        <Wedge visible={!doorShut} />
        <mesh ref={windowRef} position={[12.5, 1.6, -2.98]}>
          <planeGeometry args={[2, 1]} />
          <meshStandardMaterial color="#3b2a1d" emissive="#ff6a1a" emissiveIntensity={0} transparent opacity={0.85} roughness={0.1} />
        </mesh>
        <FireDirector worldRef={world} playerRef={player} fireRef={fireK} doorSmokeRef={doorSmokeK} windowRef={windowRef} />
        <AlarmStrobes on={alarmOn} />

        <ParticleEmitter config={FIRE_CFG} intensityRef={fireK} />
        <ParticleEmitter config={SHELF_FIRE_CFG} intensityRef={fireK} />
        <ParticleEmitter config={SPARK_CFG} intensityRef={fireK} />
        <ParticleEmitter config={ROOM_SMOKE_CFG} intensityRef={fireK} />
        <ParticleEmitter config={DOOR_SMOKE_CFG} intensityRef={doorSmokeK} />
        <ParticleEmitter config={NORTH_SMOKE_CFG} intensityRef={northSmokeK} />
        {spill && <ParticleEmitter config={SPILL_FIRE_CFG} intensityRef={spillK} />}
        {spray === 'water' && <ParticleEmitter config={SPRAY_CFG} intensityRef={sprayK} />}
        {spray === 'co2' && <ParticleEmitter config={CO2_CFG} intensityRef={sprayK} />}
        <FlickerLight position={[9.25, 1.6, -4.2]} intensityRef={fireK} base={22} distance={16} />
        <FlickerLight position={[11, 2.2, -7.5]} intensityRef={fireK} base={14} distance={9} />

        <Suspense fallback={null}>
          <Colleague key={runId} evacuating={alarmOn} />
        </Suspense>

        <PulseRing position={[target.x, 0, target.z]} visible={stage === 'travel'} />
        {stage === 'spot' && (
          <Html position={[9.25, 3.3, -2.9]} center zIndexRange={[20, 0]}>
            <WorldTag label="Paint store — smoke & flames" sub="Click to identify the hazard" onClick={identifyFire} />
          </Html>
        )}
        {stage === 'travel' && (
          <Html position={[targetLook.x, targetLook.y + 0.75, targetLook.z]} center zIndexRange={[20, 0]}>
            <WorldTag label={step === 'alarm' ? 'Manual call point' : 'Fire point'} sub={distance !== null ? `${distance} m` : undefined} tone="target" />
          </Html>
        )}
      </SimCanvas>

      <ScreenFX danger={danger} flash={flash} letterbox={letterbox} blackout={blackout} caption={caption} />

      {stage !== 'briefing' && stage !== 'debrief' && (
        <>
          <MissionPanel
            title="RACE response"
            steps={STEPS}
            currentId={currentStepId}
            results={results}
            chips={[
              { label: 'Hazards found', value: `${hazardsFound} / 3`, tone: hazardsFound === 3 ? 'ok' : 'warn' },
              { label: 'Building alarm', value: alarmOn ? 'Sounding' : 'Silent', tone: alarmOn ? 'ok' : 'bad' },
              { label: 'Fire door', value: doorShut ? 'Closed' : 'Wedged open', tone: doorShut ? 'ok' : 'bad' },
            ]}
          />
          <SimToolbar soundOn={soundOn} onToggleSound={() => setSoundOn((v) => !v)} />
        </>
      )}
      <ToastStack toasts={toasts} />

      {stage === 'travel' && (
        <>
          <ObjectivePrompt
            text={step === 'alarm' ? 'Raise the alarm: go to the manual call point by the north exit' : 'Go to the fire point beside the paint store'}
            sub={inRange ? 'You are there' : distance !== null ? `${distance} m away` : undefined}
            actionLabel={inRange ? (step === 'alarm' ? 'Use call point' : 'Assess the fire') : undefined}
            onAction={inRange ? interact : undefined}
            autoWalkLabel={inRange ? undefined : 'Walk there'}
            onAutoWalk={inRange ? undefined : autoWalk}
          />
          {hintVisible && <ControlsHint />}
        </>
      )}
      {stage === 'spot' && <ObjectivePrompt tone="danger" text="Something is wrong — identify the hazard" sub="Click the marker on the paint store" />}

      <AnimatePresence>
        {stage === 'briefing' && (
          <BriefingCard
            key="brief"
            eyebrow="Factory · Fire emergency"
            title={scenario.title}
            role="You are a floor technician, 12 m from the paint store."
            situation="It's the late shift in the production hall. Solvent-based paints are kept in a store with a self-closing fire door. You know where the call points, extinguishers and exits are — today you'll need them."
            objectives={[
              'Spot the fire and recognise what is burning',
              'Raise the alarm',
              'Decide whether the fire can be fought',
              'Contain it behind the fire door',
              'Evacuate by the safest route',
            ]}
            controls={[
              ['W A S D', 'walk'],
              ['Drag', 'look around'],
              ['E', 'interact / walk there'],
              ['Space', 'pause'],
            ]}
            onBegin={begin}
          />
        )}
        {hazardOpen && (
          <HazardCard
            key={hazardOpen.id}
            hazard={hazardOpen}
            onAcknowledge={acknowledgeHazard}
            cta={hazardOpen.id === HAZARDS.fire.id ? 'Raise the alarm' : 'Decide what to do'}
          />
        )}
        {stage === 'decide' && <DecisionCard key={`d-${step}`} decision={DECISIONS[step]} index={decisionIndex} total={4} onChoose={choose} />}
        {stage === 'explain' && choice && (
          <ExplanationCard
            key={`e-${step}`}
            verdict={choice.verdict}
            explanation={choice.outcome}
            primaryLabel={choice.verdict === 'correct' ? (step === 'evacuate' ? 'See debrief' : 'Continue') : 'Retry this decision'}
            onPrimary={choice.verdict === 'correct' ? nextAfterCorrect : retry}
          />
        )}
        {stage === 'debrief' && (
          <DebriefCard
            key="debrief"
            title="RACE protocol completed"
            summary="You raised the alarm, judged the fire too big to fight, shut the fire door to hold back smoke and escaped low through the clear exit — the actions that save lives in industrial fires."
            steps={STEPS}
            results={results}
            hazardsFound={hazardsFound}
            totalHazards={3}
            onContinue={finish}
            onReplay={replay}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
