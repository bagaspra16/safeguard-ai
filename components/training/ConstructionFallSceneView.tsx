'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, Sky } from '@react-three/drei'
import type { Scenario } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { Boxes, Tubes, type BoxItem, type Segment } from '@/components/landing/simulator/parts/Instances'
import { TowerCrane } from '@/components/landing/simulator/parts/TowerCrane'
import { PlayerRig, createPlayer, type PlayerState } from './sim3d/PlayerRig'
import { SimCanvas, useSceneTimers, useSimAudio, useStepResults } from './sim3d/SimCanvas'
import { AnimatedWorker } from './sim3d/AnimatedWorker'
import { PulseRing } from './sim3d/effects'
import { concreteTexture, dirtTexture, hazardStripeTexture, signTexture, windowsTexture } from './sim3d/textures'
import { Sign } from './sim3d/scenery'
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
// Steel frame, working level 8 m above ground. West bay (x -12…-6) and east
// bay (x 6…12) are decked; between them a two-plank scaffold walkway runs
// along a beam at z = 0 under a horizontal lifeline. The east bay's outer
// edge (x = 12) has no guardrail.

const LEVEL = 8
const START: [number, number, number] = [-10.5, LEVEL, 0]
const LIFELINE_Y = LEVEL + 1.85
const WALK_HALF = 0.32
const PLANK_LOOSE = { x0: 0.45, x1: 3.35 }
const EDGE_X = 12
const COWORKER_POS = new THREE.Vector3(11.15, LEVEL, 1.5)

// ─── Drill content ───────────────────────────────────────────────────────────

const STEPS: StepDef[] = [
  { id: 'tieoff', label: '100% tie-off' },
  { id: 'plank', label: 'Unsecured plank' },
  { id: 'coworker', label: 'Unclipped coworker' },
  { id: 'guardrail', label: 'Open edge' },
]

const HAZARDS: Record<'plank' | 'coworker' | 'edge', HazardIntel> = {
  plank: {
    id: 'unsecured-plank-01',
    name: 'Unsecured scaffold plank — tip hazard',
    severity: 'critical',
    whatsWrong:
      'This plank has slid along the walkway. Its west end no longer rests on a bearer — it overhangs by about 45 cm with nothing under it, and it isn\'t cleated or clamped.',
    risk: 'Step on the unsupported end and the plank pivots on the next bearer like a seesaw, dropping you through the walkway — 8 m to the ground.',
    control: 'Stop. Don\'t step on it. Re-seat it on both bearers with at least 15 cm of bearing, clamp or cleat it, and get the scaffold inspected and re-tagged.',
    ref: 'OSHA 1926.451(b)(4)–(5)',
  },
  coworker: {
    id: 'disconnected-lanyard-01',
    name: 'Coworker working unclipped at the edge',
    severity: 'critical',
    whatsWrong:
      'Your coworker has unclipped both lanyard hooks to reach a bolt on the edge column. He\'s leaning out over an unprotected edge, 8 m up.',
    risk: 'A slip, a gust or a shift of weight and there is nothing to stop him. Falls are the leading cause of death in construction.',
    control: 'Use your Stop Work Authority: call to him from a safe distance, get him to step back from the edge and reconnect before work continues.',
    ref: 'OSHA 1926.501(b)(1) · 1926.502(d)',
  },
  edge: {
    id: 'missing-guardrail-01',
    name: 'Missing guardrail — open edge',
    severity: 'critical',
    whatsWrong: 'The outer edge of this bay has no top rail, mid-rail or toe board — just an 8 m drop. Only a few stub posts remain.',
    risk: 'Anyone walking backwards, carrying material or tripping near this edge can go straight over it. Loose tools and bolts can also fall onto people below.',
    control: 'Stop work at this edge until a compliant guardrail is installed (or everyone exposed is tied off), and report it to the supervisor.',
    ref: 'OSHA 1926.501(b)(1) · 1926.502(b)',
  },
}

type StepId = 'tieoff' | 'plank' | 'coworker' | 'guardrail'

const DECISIONS: Record<StepId, Decision> = {
  tieoff: {
    id: 'tieoff',
    tag: 'Tie-off',
    title: 'You\'re about to step onto the scaffold walkway',
    situation:
      'Beyond the guardrail gap, a two-plank walkway runs 12 m along the beam to the east bay — with an 8 m drop on both sides. A horizontal lifeline runs overhead. You\'re wearing a full-body harness with a twin (Y) shock-absorbing lanyard.',
    cues: ['Walkway is about 60 cm wide, no guardrails', 'Lifeline anchors are rated and tagged', 'Light wind gusting across the frame'],
    question: 'How do you cross?',
    options: [
      {
        id: 'single',
        label: 'Clip one hook and swap it at each post',
        detail: 'One lanyard is enough — unclip and re-clip it as you pass the stanchions.',
        verdict: 'risky',
        outcome: {
          title: 'Unprotected while passing a post',
          happened:
            'At the middle stanchion you unclipped your only hook to pass it. A gust hit you at that moment and you lurched towards the edge — you grabbed the post just in time.',
          why: 'With one hook, every pass of an anchor point is a moment with zero fall protection. That moment is exactly when you\'re off-balance, reaching and looking up.',
          rule: 'Workers on a walkway with unprotected sides and edges 6 ft (1.8 m) or more above a lower level must be protected at all times — the twin lanyard lets you stay connected while you move past anchors.',
          ruleRef: 'OSHA 1926.501(b)(1) · 1926.502(d)',
          takeaway: 'Two hooks, and at least one is always clipped — 100% tie-off.',
        },
      },
      {
        id: 'none',
        label: 'Walk it unclipped — it\'s only 12 m',
        detail: 'Clipping in slows you down. Keep your eyes on the planks and you\'ll be fine.',
        verdict: 'unsafe',
        outcome: {
          title: 'Fall from 8 m',
          happened:
            'Halfway across, a gust caught you and your boot slipped off the plank edge. With nothing connected, you fell 8 metres to the ground.',
          why: 'Balance doesn\'t protect you from a gust, a trip or a dizzy spell. A fall of 8 m reaches over 40 km/h before impact — very often fatal.',
          rule: 'Each employee on a walking/working surface with an unprotected side or edge 6 ft (1.8 m) or more above a lower level must be protected by guardrails, safety nets or a personal fall arrest system.',
          ruleRef: 'OSHA 1926.501(b)(1)',
          takeaway: 'Never step onto an unprotected edge without being connected.',
        },
      },
      {
        id: 'twin',
        label: 'Inspect harness, clip both hooks to the lifeline',
        detail: 'Check webbing, D-ring and hooks, then cross with 100% tie-off — always at least one hook attached.',
        verdict: 'correct',
        outcome: {
          title: '100% tie-off — protected all the way',
          happened:
            'You checked your harness and lanyard, clipped both hooks to the lifeline and leap-frogged them past each stanchion. You were connected for every step of the crossing.',
          why: 'A personal fall arrest system only works if it\'s connected. Twin lanyards remove the gap that a single hook leaves each time you pass an anchor.',
          rule: 'Personal fall arrest systems must be inspected before each use and anchored to points capable of supporting 5,000 lb (22.2 kN) per worker.',
          ruleRef: 'OSHA 1926.502(d)(15), (d)(21)',
          takeaway: 'Inspect, connect, then step out — and stay connected.',
        },
      },
    ],
  },
  plank: {
    id: 'plank',
    tag: 'Plank',
    title: 'The next plank isn\'t resting on its bearer',
    situation:
      'You\'ve stopped just before a gap in the walkway. The next plank has slid along: its near end hangs in mid-air, supported only by the bearer 2.5 m further on.',
    cues: ['No cleats or clamps on the plank', 'Scaffold tag at the access is green — but was signed this morning', 'Your crew is waiting for you on the east bay'],
    question: 'What do you do?',
    options: [
      {
        id: 'quick',
        label: 'Step across it quickly',
        detail: 'Put your weight on it briefly and keep moving — it\'s only one plank.',
        verdict: 'unsafe',
        outcome: {
          title: 'The plank tipped under you',
          happened:
            'The moment your weight landed on the unsupported end, the plank see-sawed and dropped. Your lanyard arrested the fall — leaving you hanging below the walkway, 6 m above the ground.',
          why: 'An overhanging plank pivots on its last bearer. Speed doesn\'t help — your full weight arrives on the end before you can step off. Your harness saved you, but a suspended worker needs rescue within minutes.',
          rule: 'Scaffold planks must extend over their supports by at least 6 in (15 cm) and be cleated or restrained if the overhang exceeds 12 in (30 cm).',
          ruleRef: 'OSHA 1926.451(b)(4)–(5)',
          takeaway: 'Never trust a plank you haven\'t seen sitting on both bearers.',
        },
      },
      {
        id: 'secure',
        label: 'Stop, re-seat and clamp it, then report',
        detail: 'Slide it back onto both bearers, fit the clamps, and tell the supervisor so the scaffold is re-inspected.',
        verdict: 'correct',
        outcome: {
          title: 'Hazard fixed and reported',
          happened:
            'Still clipped in, you slid the plank back onto both bearers, fitted the clamps and radioed the supervisor to have the scaffold re-inspected before anyone else used it.',
          why: 'Planks get knocked out of position by materials and people. A defect found after the morning inspection still has to be fixed and reported — the tag only shows the scaffold\'s condition when it was checked.',
          rule: 'Scaffolds must be inspected by a competent person before each shift and after any occurrence that could affect their integrity; defects must be corrected before use.',
          ruleRef: 'OSHA 1926.451(f)(3)',
          takeaway: 'Spot it, stop, fix or isolate it, report it.',
        },
      },
      {
        id: 'beam',
        label: 'Step onto the beam flange to get past',
        detail: 'Bypass the plank by walking on the top of the steel beam beside it.',
        verdict: 'unsafe',
        outcome: {
          title: 'Slipped off the beam flange',
          happened:
            'The flange was only 20 cm wide and dusty. Your boot slid off the edge and your lanyard arrested your fall — you\'re hanging beside the beam waiting for rescue.',
          why: 'Detouring around a hazard onto an even narrower surface trades one fall risk for a worse one. The fix is to correct the walkway, not to improvise a route.',
          rule: 'Walking/working surfaces must be safe for the work; employees must not use surfaces that aren\'t designed or approved as a walkway.',
          ruleRef: 'OSHA 1926.451 · 1926.501',
          takeaway: 'Don\'t work around a hazard — make it safe first.',
        },
      },
    ],
  },
  coworker: {
    id: 'coworker',
    tag: 'Stop work',
    title: 'Your coworker is unclipped at the edge',
    situation:
      'On the east bay, your coworker has unhooked both lanyards to reach a bolt on the edge column. He\'s leaning over the open edge with his back to you.',
    cues: ['Both lanyard hooks are hanging loose at his back', 'No guardrail on this edge', 'He\'s concentrating — he hasn\'t seen you'],
    question: 'What do you do?',
    options: [
      {
        id: 'ignore',
        label: 'Leave him — he\'s experienced',
        detail: 'It\'s his decision and he\'s been doing this for years.',
        verdict: 'unsafe',
        outcome: {
          title: 'A preventable fall',
          happened:
            'Seconds later the bolt freed suddenly and he lost his balance. With nothing connected and no guardrail, he fell from the edge.',
          why: 'Experience doesn\'t stop gravity — most fatal falls involve experienced workers doing a "quick job". Everyone on site has the authority, and the duty, to stop unsafe work.',
          rule: 'Employees exposed to falls of 6 ft (1.8 m) or more must be protected by a fall protection system at all times; supervisors and coworkers must act on hazards they see.',
          ruleRef: 'OSHA 1926.501(b)(1) · 1926.21(b)(2)',
          takeaway: 'See it, say it — Stop Work Authority belongs to everyone.',
        },
      },
      {
        id: 'grab',
        label: 'Rush over and grab his harness',
        detail: 'Get to him fast and pull him back from the edge yourself.',
        verdict: 'risky',
        outcome: {
          title: 'Near miss — you startled him',
          happened:
            'He didn\'t hear you coming. When you grabbed him he jerked round, lost his footing and nearly took you both over the edge.',
          why: 'Startling someone at an unprotected edge can trigger the fall you\'re trying to prevent — and puts you in the danger zone too.',
          rule: 'Intervene from a safe position: get the worker\'s attention calmly, have them step back and reconnect. Don\'t enter the fall zone unprotected.',
          ruleRef: 'OSHA 1926.501(b)(1) · Site Stop Work policy',
          takeaway: 'Call out calmly from a safe distance — don\'t lunge.',
        },
      },
      {
        id: 'stop',
        label: 'Call "Stop!" from a safe distance',
        detail: 'Get his attention, have him step back from the edge and clip both hooks before carrying on.',
        verdict: 'correct',
        outcome: {
          title: 'Stop Work Authority used well',
          happened:
            'You called out clearly from where you stood. He stopped, stepped back from the edge and clipped both hooks to the anchor before finishing the bolt.',
          why: 'A clear call from a safe distance gets attention without startling. Making reconnection a condition of carrying on fixes the hazard at its source.',
          rule: 'Every worker exposed to an unprotected edge 6 ft (1.8 m) or more above a lower level must be protected; anyone on site may stop work to correct an imminent danger.',
          ruleRef: 'OSHA 1926.501(b)(1) · 1926.502(d)',
          takeaway: 'Stop, step back, clip in — then carry on.',
        },
      },
    ],
  },
  guardrail: {
    id: 'guardrail',
    tag: 'Edge',
    title: 'This bay\'s outer edge has no guardrail',
    situation:
      'Your coworker is clipped in, but the edge itself is still open — only a few stub posts are left. Other trades will be moving materials onto this bay this afternoon.',
    cues: ['No top rail, mid-rail or toe board', 'Guardrail components are stacked on the bay', 'A roll of caution tape is in your pouch'],
    question: 'How do you deal with the open edge?',
    options: [
      {
        id: 'tape',
        label: 'String caution tape across it',
        detail: 'Quick and visible — everyone will see it and keep away.',
        verdict: 'risky',
        outcome: {
          title: 'Tape is a warning, not protection',
          happened:
            'The tape fluttered across the posts. A few minutes later a labourer carrying sheets backed into it — it stretched and tore without slowing him down. He stopped just short of the edge.',
          why: 'Caution tape gives no physical resistance. Someone walking backwards, carrying material or tripping goes straight through it.',
          rule: 'Guardrails need a top rail at 42 in (±3 in) that withstands 200 lb of force, a mid-rail, and toe boards where objects could fall.',
          ruleRef: 'OSHA 1926.502(b)',
          takeaway: 'Tape warns. Only a guardrail (or tie-off) protects.',
        },
      },
      {
        id: 'install',
        label: 'Stop work here, install the guardrail, report',
        detail: 'Fit top rail, mid-rail and toe board from the stacked components, and report the missing edge protection.',
        verdict: 'correct',
        outcome: {
          title: 'Edge protected and reported',
          happened:
            'Working tied off, you and your coworker fitted the top rail, mid-rail and toe board, then reported the missing edge protection so the supervisor could find out why it had been removed.',
          why: 'Collective protection like guardrails protects everyone — including people who don\'t know the edge is there. Reporting makes sure it doesn\'t go missing again.',
          rule: 'Top rail 42 in (1.07 m) ±3 in, withstanding 200 lb; mid-rail about halfway; toe boards at least 3.5 in high where objects can fall to lower levels.',
          ruleRef: 'OSHA 1926.502(b)(1)–(3), (j)',
          takeaway: 'Restore the guardrail before work continues — and report the gap.',
        },
      },
      {
        id: 'avoid',
        label: 'Just keep away from it yourself',
        detail: 'You know it\'s there — stay on the inside of the bay.',
        verdict: 'unsafe',
        outcome: {
          title: 'Hazard left for others',
          happened:
            'You stayed clear — but the next crew up the ladder didn\'t know the edge was open, and one of them backed towards it while unloading.',
          why: 'Avoiding a hazard yourself does nothing for the people who arrive after you. Unreported edges are a common factor in falls by other trades.',
          rule: 'Open sides and edges 6 ft (1.8 m) or more above a lower level must be protected by guardrails, safety nets or personal fall arrest systems.',
          ruleRef: 'OSHA 1926.501(b)(1)',
          takeaway: 'If you find it, you own it until it\'s fixed or handed over.',
        },
      },
    ],
  },
}

// ─── Geometry ────────────────────────────────────────────────────────────────

function buildFrame() {
  const steel: BoxItem[] = []
  const PRIMER = '#9a3d12'
  const xs = [-12, -6, 0, 6, 12]
  const zs = [-3, 3]
  for (const x of xs) for (const z of zs) steel.push({ p: [x, (LEVEL + 3.5) / 2, z], s: [0.32, LEVEL + 3.5, 0.32], c: PRIMER })
  // Beams at the lower floor and working level
  for (const y of [4, LEVEL - 0.25]) {
    for (const z of zs) steel.push({ p: [0, y, z], s: [24.3, 0.45, 0.22], c: PRIMER })
    for (const x of xs) steel.push({ p: [x, y, 0], s: [0.22, 0.45, 6.3], c: PRIMER })
  }
  // Walkway beam (top flange at LEVEL - 0.05)
  steel.push({ p: [0, LEVEL - 0.3, 0], s: [12, 0.5, 0.2], c: PRIMER })
  steel.push({ p: [0, LEVEL - 0.07, 0], s: [12, 0.04, 0.22], c: '#7c2d12' })
  // Upper-level beams (frame continues upwards)
  for (const z of zs) steel.push({ p: [0, LEVEL + 3.3, z], s: [24.3, 0.4, 0.2], c: PRIMER })

  // Decks: west & east bays (metal deck + concrete topping)
  const deck: BoxItem[] = [
    { p: [-9, LEVEL - 0.08, 0], s: [6.2, 0.16, 6.2], c: '#a3a39e' },
    { p: [9, LEVEL - 0.08, 0], s: [6.2, 0.16, 6.2], c: '#a3a39e' },
    { p: [-9, LEVEL - 0.22, 0], s: [6.2, 0.12, 6.2], c: '#6b7280' },
    { p: [9, LEVEL - 0.22, 0], s: [6.2, 0.12, 6.2], c: '#6b7280' },
    // Lower floor (partially decked) to sell the height
    { p: [-9, 3.9, 0], s: [6.2, 0.14, 6.2], c: '#9b9b96' },
    { p: [9, 3.9, 0], s: [6.2, 0.14, 6.2], c: '#9b9b96' },
  ]

  // Guardrails on decked bays (except the east edge and the walkway gaps)
  const rail: Segment[] = []
  const posts: BoxItem[] = []
  const railRun = (ax: number, az: number, bx: number, bz: number) => {
    for (const y of [1.07, 0.53]) rail.push([ax, LEVEL + y, az, bx, LEVEL + y, bz])
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 1.8))
    for (let i = 0; i <= n; i++) {
      const t = i / n
      posts.push({ p: [ax + (bx - ax) * t, LEVEL + 0.55, az + (bz - az) * t], s: [0.06, 1.1, 0.06], c: '#facc15' })
    }
    posts.push({ p: [(ax + bx) / 2, LEVEL + 0.06, (az + bz) / 2], s: [Math.abs(bx - ax) + 0.04, 0.12, Math.abs(bz - az) + 0.04], c: '#d97706' })
  }
  railRun(-12, -3.05, -6, -3.05)
  railRun(-12, 3.05, -6, 3.05)
  railRun(-12.05, -3, -12.05, 3)
  railRun(-6.05, -3, -6.05, -0.45)
  railRun(-6.05, 0.45, -6.05, 3)
  railRun(6, -3.05, 12, -3.05)
  railRun(6, 3.05, 12, 3.05)
  railRun(6.05, -3, 6.05, -0.45)
  railRun(6.05, 0.45, 6.05, 3)
  // Stub posts on the open east edge
  for (const z of [-2.6, 0.2, 2.6]) posts.push({ p: [EDGE_X + 0.05, LEVEL + 0.2, z], s: [0.06, 0.4, 0.06], c: '#facc15' })

  // Scaffold walkway: bearers and fixed planks (the loose plank is separate)
  const planks: BoxItem[] = []
  for (const [x0, x1] of [
    [-6, -3],
    [-3, 0.02],
    [3.0, 6],
  ]) {
    for (const z of [-0.15, 0.15]) planks.push({ p: [(x0 + x1) / 2, LEVEL + 0.02, z], s: [x1 - x0 - 0.02, 0.05, 0.28], c: '#b7884f' })
  }
  const bearers: Segment[] = []
  for (const x of [-6, -3, 0, 3, 6]) bearers.push([x, LEVEL - 0.03, -0.4, x, LEVEL - 0.03, 0.4])

  // Lifeline stanchions
  const stanchions: Segment[] = []
  for (const x of [-6, 0, 6]) stanchions.push([x, LEVEL - 0.05, 0.36, x, LIFELINE_Y + 0.05, 0.36])

  return { steel, deck, rail, posts, planks, bearers, stanchions }
}

function buildSite() {
  const boxes: BoxItem[] = []
  const r = (() => {
    let s = 9
    return () => {
      s = (s * 16807) % 2147483647
      return (s - 1) / 2147483646
    }
  })()
  // Steel stock, pallets, site cabins on the ground
  for (let i = 0; i < 6; i++) boxes.push({ p: [-4 + i * 0.35, 0.2 + (i % 2) * 0.25, 9], s: [8, 0.22, 0.25], c: '#9a3d12' })
  for (let i = 0; i < 5; i++) boxes.push({ p: [3 + i * 1.4, 0.4, -9], s: [1.2, 0.8, 1.0], c: i % 2 ? '#b98a55' : '#c9c3b8' })
  boxes.push({ p: [-18, 1.3, 8], s: [6, 2.6, 2.4], c: '#e2e8f0' })
  boxes.push({ p: [-18, 3.9, 8], s: [6, 2.6, 2.4], c: '#e2e8f0' })
  boxes.push({ p: [-17, 1.2, -10], s: [1.2, 2.4, 1.2], c: '#16a34a' })
  boxes.push({ p: [18, 1.6, 10], s: [3, 3.2, 2.5], c: '#334155' })
  // Distant city massing
  const city: BoxItem[] = []
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + r() * 0.15
    const d = 70 + r() * 40
    const h = 8 + r() * 34
    city.push({ p: [Math.cos(a) * d, h / 2, Math.sin(a) * d], s: [10 + r() * 10, h, 10 + r() * 10], c: ['#b8c0c8', '#9aa4ae', '#c9cdd2', '#8e98a3'][i % 4], ry: r() })
  }
  return { boxes, city }
}

const FRAME = buildFrame()
const SITE = buildSite()

// ─── Scene pieces ────────────────────────────────────────────────────────────

function SiteGround() {
  const dirt = useMemo(() => dirtTexture([30, 30]), [])
  const slab = useMemo(() => concreteTexture([3, 3], '#9a9b98'), [])
  const windows = useMemo(() => windowsTexture([3, 6]), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial map={dirt} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial map={slab} roughness={0.9} />
      </mesh>
      <Boxes items={SITE.boxes} roughness={0.8} />
      <CityBlocks />
      {/* A couple of glazed towers nearby */}
      {[
        [-34, 18, -40, 14, 36, 14],
        [40, 14, -30, 16, 28, 12],
        [30, 12, 44, 12, 24, 12],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial map={windows} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      <group position={[-14, 0, -22]} rotation={[0, 0.9, 0]}>
        <TowerCrane />
      </group>
    </group>
  )
}

function CityBlocks() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const map = useMemo(() => windowsTexture([4, 8]), [])
  useEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const col = new THREE.Color()
    SITE.city.forEach((b, i) => {
      q.setFromAxisAngle(UP, b.ry ?? 0)
      m.setMatrixAt(i, mat.compose(new THREE.Vector3(...b.p), q, new THREE.Vector3(...b.s)))
      m.setColorAt(i, col.set(b.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SITE.city.length]}>
      <boxGeometry />
      <meshStandardMaterial map={map} roughness={0.6} metalness={0.2} />
    </instancedMesh>
  )
}

function SteelFrame() {
  const deckTex = useMemo(() => concreteTexture([2, 2], '#a8a8a3'), [])
  const stripes = useMemo(() => hazardStripeTexture([8, 1]), [])
  return (
    <group>
      <Boxes items={FRAME.steel} roughness={0.55} />
      <Boxes items={FRAME.deck.slice(2)} roughness={0.85} />
      {FRAME.deck.slice(0, 2).map((d, i) => (
        <mesh key={i} position={d.p} receiveShadow castShadow>
          <boxGeometry args={d.s} />
          <meshStandardMaterial map={deckTex} roughness={0.85} />
        </mesh>
      ))}
      <Tubes segments={FRAME.rail} radius={0.025} color="#facc15" roughness={0.45} />
      <Boxes items={FRAME.posts} roughness={0.5} />
      <Boxes items={FRAME.planks} roughness={0.9} />
      <Tubes segments={FRAME.bearers} radius={0.024} color="#9ca3af" metalness={0.6} roughness={0.35} />
      <Tubes segments={FRAME.stanchions} radius={0.035} color="#1f2937" metalness={0.5} roughness={0.4} />
      {/* Lifeline */}
      <Tubes segments={[[-6, LIFELINE_Y, 0.36, 6, LIFELINE_Y, 0.36]]} radius={0.008} color="#e5e7eb" metalness={0.9} roughness={0.2} />
      {/* Open-edge warning stripe on the east bay */}
      <mesh position={[EDGE_X - 0.15, LEVEL + 0.005, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[6, 0.25]} />
        <meshStandardMaterial map={stripes} roughness={0.6} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {/* Anchor sling on the edge column */}
      <mesh position={[EDGE_X - 0.18, LEVEL + 2.1, 2.85]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.02, 8, 16]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>
      {/* Stacked guardrail components on the east bay */}
      <Boxes
        items={[
          { p: [8.2, LEVEL + 0.08, -2.2], s: [2.4, 0.08, 0.5], c: '#facc15' },
          { p: [8.2, LEVEL + 0.16, -2.2], s: [2.4, 0.08, 0.5], c: '#facc15' },
          { p: [8.2, LEVEL + 0.24, -2.2], s: [2.4, 0.08, 0.5], c: '#d97706' },
        ]}
      />
    </group>
  )
}

/** The plank that has slid off its west bearer; tips or gets re-seated. */
function LoosePlank({ stateRef }: { stateRef: React.RefObject<{ mode: 'loose' | 'tipped' | 'secured'; t: number }> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const s = stateRef.current
    s.t += Math.min(dt, 0.05)
    if (s.mode === 'tipped') {
      // Pivot about the east bearer (x = 3): near end drops
      const u = Math.min(1, s.t / 0.35)
      g.rotation.z = THREE.MathUtils.lerp(0, 0.9, u * u)
      g.position.x = PLANK_LOOSE.x1 - 0.35
    } else if (s.mode === 'secured') {
      const u = Math.min(1, s.t / 1.2)
      g.rotation.z = 0
      g.position.x = THREE.MathUtils.lerp(PLANK_LOOSE.x1 - 0.35, 3.0, u)
    } else {
      g.rotation.z = 0
      g.position.x = PLANK_LOOSE.x1 - 0.35
    }
  })
  const len = PLANK_LOOSE.x1 - PLANK_LOOSE.x0
  return (
    // Group origin sits on the east bearer; plank extends towards -X
    <group ref={ref} position={[PLANK_LOOSE.x1 - 0.35, LEVEL + 0.02, 0]}>
      {[-0.15, 0.15].map((z) => (
        <mesh key={z} position={[-len / 2 + 0.35, 0, z]} castShadow receiveShadow>
          <boxGeometry args={[len, 0.05, 0.28]} />
          <meshStandardMaterial color="#b07d45" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Clamps({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <group>
      {[0.05, 2.95].map((x) => (
        <mesh key={x} position={[x, LEVEL + 0.03, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.66]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/** Guardrail that rises into place on the open east edge. */
function EastGuardrail({ installed }: { installed: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const k = useRef(0)
  useFrame((_, dt) => {
    k.current += ((installed ? 1 : 0) - k.current) * (1 - Math.exp(-3 * Math.min(dt, 0.05)))
    if (ref.current) {
      ref.current.scale.y = Math.max(0.001, k.current)
      ref.current.visible = k.current > 0.01
    }
  })
  return (
    <group ref={ref} position={[EDGE_X + 0.05, LEVEL, 0]}>
      {[-3, -1.5, 0, 1.5, 3].map((z) => (
        <mesh key={z} position={[0, 0.55, z]}>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
      ))}
      {[1.07, 0.53].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 6, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, 6]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
    </group>
  )
}

function CautionTape({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const stripes = useMemo(() => hazardStripeTexture([12, 1]), [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 6) * 0.08
  })
  if (!visible) return null
  return (
    <mesh ref={ref} position={[EDGE_X + 0.07, LEVEL + 0.95, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[5.4, 0.08]} />
      <meshStandardMaterial map={stripes} side={THREE.DoubleSide} roughness={0.6} />
    </mesh>
  )
}

/** Lanyard from the trainee's back D-ring up to the lifeline. */
function PlayerLanyard({ playerRef, connected }: { playerRef: React.RefObject<PlayerState>; connected: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  useFrame(() => {
    const m = ref.current
    if (!m) return
    const p = playerRef.current
    const onWalk = p.pos.x > -6.6 && p.pos.x < 6.6
    m.visible = connected && onWalk
    if (!m.visible) return
    // D-ring sits behind the shoulders
    const back = 0.25
    a.set(p.pos.x + Math.sin(p.yaw) * back, p.pos.y + p.eye - 0.25, p.pos.z + Math.cos(p.yaw) * back)
    b.set(THREE.MathUtils.clamp(p.pos.x + 0.2, -6, 6), LIFELINE_Y, 0.36)
    const dir = b.clone().sub(a)
    const len = dir.length()
    m.position.copy(a).addScaledVector(dir, 0.5)
    m.quaternion.setFromUnitVectors(up, dir.normalize())
    m.scale.set(1, len, 1)
  })
  return (
    <mesh ref={ref} visible={false}>
      <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
      <meshStandardMaterial color="#f97316" roughness={0.6} />
    </mesh>
  )
}

const ANCHOR = new THREE.Vector3(EDGE_X - 0.18, LEVEL + 2.1, 2.85)
const UP = new THREE.Vector3(0, 1, 0)
const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()

/** Coworker at the edge; steps back and connects when told. */
function Coworker({ mode }: { mode: 'unclipped' | 'safe' | 'startled' | 'falling' }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(0)
  const lanyard = useRef<THREE.Mesh>(null)
  const [arrivedFor, setArrivedFor] = useState<string | null>(null)
  const arrived = arrivedFor === mode
  useEffect(() => {
    t.current = 0
  }, [mode])
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    t.current += Math.min(dt, 0.05)
    const u = t.current
    g.visible = true
    if (mode === 'safe') {
      const k = Math.min(1, u / 1.4)
      if (k >= 1 && !arrived) setArrivedFor(mode)
      g.position.set(THREE.MathUtils.lerp(COWORKER_POS.x, COWORKER_POS.x - 1.2, k), LEVEL, COWORKER_POS.z)
      g.rotation.set(0, THREE.MathUtils.lerp(Math.PI / 2, -Math.PI / 2, k), 0)
    } else if (mode === 'startled') {
      g.position.set(COWORKER_POS.x + Math.sin(u * 14) * 0.05 * Math.max(0, 1 - u), LEVEL, COWORKER_POS.z)
      g.rotation.set(0, Math.PI / 2 - Math.min(1, u * 3) * 2.4, Math.sin(u * 10) * 0.25 * Math.max(0, 1 - u / 1.5))
    } else if (mode === 'falling') {
      const fall = Math.max(0, u - 0.4)
      g.position.set(COWORKER_POS.x + Math.min(u, 0.4) * 2 + fall * 1.2, LEVEL - 0.5 * 9.81 * fall * fall, COWORKER_POS.z)
      g.rotation.set(0, Math.PI / 2, -Math.min(1.4, u * 1.6))
      g.visible = g.position.y > 0.2
    } else {
      g.position.copy(COWORKER_POS)
      g.rotation.set(0, Math.PI / 2, 0.08)
    }
    const l = lanyard.current
    if (l) {
      l.visible = mode === 'safe' && u > 1.4
      if (l.visible) {
        tmpA.set(g.position.x + 0.15, LEVEL + 1.15, g.position.z)
        tmpB.copy(ANCHOR)
        const dir = tmpB.sub(tmpA)
        const len = dir.length()
        l.position.copy(tmpA).addScaledVector(dir, 0.5)
        l.quaternion.setFromUnitVectors(UP, dir.normalize())
        l.scale.set(1, len, 1)
      }
    }
  })
  return (
    <>
      <AnimatedWorker ref={ref} clip={mode === 'safe' && !arrived ? 'Walk' : 'Interact'} position={COWORKER_POS.toArray() as [number, number, number]} rotation={Math.PI / 2}>
        {/* Loose lanyard hooks hanging from his back */}
        {mode !== 'safe' && (
          <mesh position={[0, 0.9, -0.2]} rotation={[0.25, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.8, 6]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        )}
      </AnimatedWorker>
      {/* Connected lanyard once safe: from his back to the column anchor */}
      <mesh ref={lanyard} visible={false}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </>
  )
}

// ─── Drill controller ────────────────────────────────────────────────────────

type Stage = 'briefing' | 'walk' | 'hazard' | 'decide' | 'playout' | 'explain' | 'debrief'

interface Props {
  scenario: Scenario
}

const STOPS: Record<StepId, number> = { tieoff: -6.55, plank: -0.15, coworker: 7.6, guardrail: 7.6 }

export function ConstructionFallSceneView({ scenario }: Props) {
  const setPhase = useSimulationStore((s) => s.setPhase)
  const detectHazard = useSimulationStore((s) => s.detectHazard)
  const detectedHazards = useSimulationStore((s) => s.detectedHazards)
  const makeDecision = useSimulationStore((s) => s.makeDecision)
  const addEvent = useSimulationStore((s) => s.addEvent)

  const audio = useSimAudio()
  const { after, clearAll } = useSceneTimers()
  const { toasts, push } = useToasts()
  const { results, record, reset: resetResults } = useStepResults()

  const player = useRef<PlayerState>(createPlayer(START, -Math.PI / 2, -0.05))
  const plank = useRef<{ mode: 'loose' | 'tipped' | 'secured'; t: number }>({ mode: 'loose', t: 0 })

  const [stage, setStage] = useState<Stage>('briefing')
  const [step, setStep] = useState<StepId>('tieoff')
  const [hazardOpen, setHazardOpen] = useState<HazardIntel | null>(null)
  const [choice, setChoice] = useState<DecisionOption | null>(null)
  const [tiedOff, setTiedOff] = useState(false)
  const [plankSafe, setPlankSafe] = useState(false)
  const [coworker, setCoworker] = useState<'unclipped' | 'safe' | 'startled' | 'falling'>('unclipped')
  const [railInstalled, setRailInstalled] = useState(false)
  const [tape, setTape] = useState(false)
  const [danger, setDanger] = useState(false)
  const [flash, setFlash] = useState<{ key: number; color: string } | null>(null)
  const [letterbox, setLetterbox] = useState(false)
  const [blackout, setBlackout] = useState(0)
  const [caption, setCaption] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [hintVisible, setHintVisible] = useState(true)
  const firstTry = useRef<Record<string, boolean>>({})
  const stageRef = useRef<Stage>('briefing')
  const stepRef = useRef<StepId>('tieoff')
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
  const decisionIndex = STEPS.findIndex((s) => s.id === step) + 1

  // ── Start ──
  const begin = () => {
    audio.unlock()
    audio.startLoop('wind', 0.7)
    const p = player.current
    p.canWalk = true
    p.speed = 1.8
    setStage('walk')
    setPhase('simulation_active')
    addEvent('scenario_started', 'construction-fall')
  }

  // Walk triggers: stop the trainee at each hazard
  const fired = useRef<Set<string>>(new Set())
  const onTick = (s: PlayerState) => {
    if (stageRef.current !== 'walk') return
    const st = stepRef.current
    if (s.pos.x >= STOPS[st] - 0.3 && !fired.current.has(st)) {
      fired.current.add(st)
      reachStop(st)
    }
  }

  const reachStop = (st: StepId) => {
    const p = player.current
    p.canWalk = false
    p.autoWalk = null
    p.vel.set(0, 0, 0)
    audio.click()
    if (st === 'tieoff') {
      p.focus = new THREE.Vector3(0, LEVEL + 0.4, 0)
      p.focusRate = 2.5
      after(900, () => openDecision('tieoff'))
    } else if (st === 'plank') {
      p.focus = new THREE.Vector3(1.2, LEVEL - 0.1, 0)
      p.focusRate = 3
      audio.creak()
      setCaption('The next plank shifts under the edge of your boot…')
      after(1500, () => {
        setCaption(null)
        showHazard('plank')
      })
    } else {
      p.focus = COWORKER_POS.clone().setY(LEVEL + 1.3)
      p.focusRate = 2.5
      after(900, () => showHazard('coworker'))
    }
  }

  const showHazard = (which: 'plank' | 'coworker' | 'edge') => {
    detectHazard(HAZARDS[which].id)
    audio.notify()
    setHazardOpen(HAZARDS[which])
    setStage('hazard')
  }

  const acknowledgeHazard = () => {
    setHazardOpen(null)
    openDecision(stepRef.current)
  }

  const openDecision = (s: StepId) => {
    setStep(s)
    setPhase('decision_point')
    setStage('decide')
  }

  const autoWalk = () => {
    const p = player.current
    const st = stepRef.current
    p.autoWalk = { target: new THREE.Vector3(STOPS[st] + 0.2, LEVEL, 0), speed: 1.6 }
  }

  // ── Fall scripts ──
  const freeFall = (onGround: () => void) => {
    const p = player.current
    const start = p.pos.clone()
    let v = 0
    let y = p.pos.y + p.eye
    let t = 0
    let landed = false
    audio.whooshSlow()
    p.autoWalk = null
    p.script = (s, dt, camera) => {
      t += dt
      if (!landed) {
        v += 9.81 * dt
        y -= v * dt
        if (y <= 0.35) {
          y = 0.35
          landed = true
          audio.impact(true)
          s.trauma = 1
          onGround()
        }
      }
      const tumble = Math.min(1, t / 1.2)
      camera.position.set(start.x, y, start.z + (s.pos.z >= 0 ? 1 : -1) * Math.min(1.2, t * 0.9))
      camera.quaternion.setFromEuler(new THREE.Euler(THREE.MathUtils.lerp(s.pitch, 1.1, tumble), s.yaw, THREE.MathUtils.lerp(0, 0.7, tumble), 'YXZ'))
      return true
    }
  }

  const arrestedFall = (side: number, then: () => void) => {
    const p = player.current
    const start = p.pos.clone()
    const eye0 = p.eye
    let t = 0
    let snapped = false
    audio.whooshSlow()
    p.autoWalk = null
    p.script = (s, dt, camera) => {
      t += dt
      // Free fall ~1.8 m, then shock absorber deploys and you bounce/swing
      let drop: number
      if (t < 0.6) drop = 0.5 * 9.81 * t * t
      else {
        if (!snapped) {
          snapped = true
          audio.ropeSnap()
          s.trauma = 0.9
          then()
        }
        const k = t - 0.6
        drop = 2.4 + Math.sin(k * 6) * 0.35 * Math.exp(-k * 1.6)
      }
      const swing = t > 0.6 ? Math.sin((t - 0.6) * 2.2) * 0.35 * Math.exp(-(t - 0.6) * 0.5) : 0
      camera.position.set(start.x + swing * 0.4, start.y + eye0 - Math.min(drop, 2.6), start.z + side * Math.min(0.55, t * 1.2))
      camera.quaternion.setFromEuler(new THREE.Euler(THREE.MathUtils.lerp(s.pitch, -0.55, Math.min(1, t * 1.5)), s.yaw + swing * 0.3, swing * 0.4 + side * 0.15, 'YXZ'))
      return true
    }
  }

  // ── Decisions ──
  const choose = (o: DecisionOption) => {
    const s = stepRef.current
    setChoice(o)
    if (firstTry.current[s] === undefined) firstTry.current[s] = o.verdict === 'correct'
    record(s, o.verdict === 'correct')
    addEvent(o.verdict === 'correct' ? 'correct_action' : 'wrong_action', `fall-${s}-${o.id}`)
    setStage('playout')
    setLetterbox(true)
    const p = player.current
    p.focus = null
    p.canLook = false
    if (s === 'tieoff') playTieoff(o.id)
    else if (s === 'plank') playPlank(o.id)
    else if (s === 'coworker') playCoworker(o.id)
    else playGuardrail(o.id)
  }

  const playTieoff = (id: string) => {
    const p = player.current
    if (id === 'twin') {
      p.focus = new THREE.Vector3(-5, LIFELINE_Y, 0.36)
      p.focusRate = 3
      setCaption('Webbing, stitching, D-ring, hooks — all good. Clip… clip.')
      after(1200, () => audio.carabiner())
      after(1900, () => {
        audio.carabiner()
        setTiedOff(true)
      })
      after(3300, finishPlayout)
    } else {
      p.autoWalk = { target: new THREE.Vector3(id === 'none' ? -2.6 : -0.25, LEVEL, 0), speed: 1.3 }
      setCaption(id === 'none' ? 'You step out onto the planks, unclipped…' : 'One hook on the lifeline. At the middle post you unclip to pass it…')
      if (id === 'single') {
        setTiedOff(true)
      }
      after(id === 'none' ? 2600 : 4300, () => {
        audio.startLoop('wind', 1.4)
        p.trauma = 0.6
        setDanger(true)
        if (id === 'none') {
          setCaption('A gust hits you — your boot slides off the plank edge!')
          freeFall(() => {
            doFlash('rgba(0,0,0,0.9)')
            after(400, () => setBlackout(1))
            after(1600, finishPlayout)
          })
        } else {
          setTiedOff(false)
          setCaption('A gust hits you while you\'re unclipped — you lurch towards the edge and grab the post.')
          p.roll = -0.35
          p.eyeTarget = 1.2
          audio.heartbeat(3)
          after(2600, finishPlayout)
        }
      })
      after(id === 'none' ? 3000 : 4800, () => audio.setLoopVolume('wind', 0.7))
    }
  }

  const playPlank = (id: string) => {
    const p = player.current
    if (id === 'secure') {
      p.focus = new THREE.Vector3(1.5, LEVEL, 0)
      p.focusRate = 3
      p.eyeTarget = 0.9
      setCaption('Kneeling, still clipped in, you slide the plank back onto both bearers…')
      after(900, () => {
        plank.current = { mode: 'secured', t: 0 }
        audio.creak()
      })
      after(2300, () => {
        audio.click()
        setPlankSafe(true)
        setCaption('Clamps on. You radio the supervisor to have the scaffold re-inspected.')
      })
      after(4300, () => {
        p.eyeTarget = 1.65
        finishPlayout()
      })
    } else if (id === 'quick') {
      p.autoWalk = { target: new THREE.Vector3(0.9, LEVEL, 0), speed: 1.6 }
      after(500, () => {
        plank.current = { mode: 'tipped', t: 0 }
        audio.creak()
        doFlash('rgba(0,0,0,0.6)')
        setDanger(true)
        setCaption('The plank see-saws — and drops away under you!')
        arrestedFall(0, () => {
          setCaption('Your lanyard catches you. You\'re hanging below the walkway, 6 m above the ground.')
          audio.heartbeat(3)
        })
      })
      after(5200, finishPlayout)
    } else {
      p.autoWalk = { target: new THREE.Vector3(0.4, LEVEL, -0.05), speed: 1.0 }
      setCaption('You step onto the narrow top flange of the beam…')
      after(1500, () => {
        audio.creak()
        p.trauma = 0.5
        setDanger(true)
        setCaption('Your boot slides off the dusty flange!')
        arrestedFall(-1, () => {
          setCaption('Your lanyard arrests the fall — you\'re left hanging beside the beam.')
          audio.heartbeat(3)
        })
      })
      after(6200, finishPlayout)
    }
  }

  const playCoworker = (id: string) => {
    const p = player.current
    p.focus = COWORKER_POS.clone().setY(LEVEL + 1.3)
    p.focusRate = 3
    if (id === 'stop') {
      setCaption('"Stop! Step back from the edge and clip in before you finish that."')
      after(1400, () => setCoworker('safe'))
      after(3200, () => {
        audio.carabiner()
        setCaption('He steps back and clips both hooks to the column anchor. "Thanks — I should have."')
      })
      after(5600, finishPlayout)
    } else if (id === 'grab') {
      p.autoWalk = { target: new THREE.Vector3(10.4, LEVEL, 1.3), speed: 2.8 }
      setCaption('You rush across the bay towards him…')
      after(1400, () => {
        setCoworker('startled')
        p.trauma = 0.6
        setDanger(true)
        audio.heartbeat(2)
        setCaption('He jerks round in surprise and staggers at the edge — you both nearly go over.')
      })
      after(4800, finishPlayout)
    } else {
      setCaption('You leave him to it and turn back to your own work…')
      after(2000, () => {
        setCoworker('falling')
        audio.creak()
        setDanger(true)
        setCaption('The bolt frees suddenly. He loses his balance at the open edge.')
      })
      after(3200, () => audio.impact(false))
      after(3600, () => setBlackout(0.9))
      after(5000, finishPlayout)
    }
  }

  const playGuardrail = (id: string) => {
    const p = player.current
    p.focus = new THREE.Vector3(EDGE_X, LEVEL + 0.6, 0)
    p.focusRate = 3
    if (id === 'install') {
      setCaption('Tied off, you fit the posts, top rail, mid-rail and toe board.')
      after(1200, () => {
        setRailInstalled(true)
        audio.click()
      })
      after(2600, () => {
        audio.success()
        setCaption('Edge protected. You report the missing guardrail to the supervisor.')
      })
      after(4800, finishPlayout)
    } else if (id === 'tape') {
      setTape(true)
      setCaption('The tape flutters across the stub posts…')
      after(2400, () => {
        setDanger(true)
        p.trauma = 0.3
        setCaption('…a labourer carrying sheets backs straight through it and stops inches from the edge.')
        setTape(false)
      })
      after(5200, finishPlayout)
    } else {
      setCaption('You stay on the inside of the bay and carry on.')
      after(2200, () => {
        setDanger(true)
        setCaption('The next crew up doesn\'t know the edge is open.')
      })
      after(4600, finishPlayout)
    }
  }

  const finishPlayout = () => {
    setLetterbox(false)
    setCaption(null)
    const correct = choiceRef.current?.verdict === 'correct'
    if (correct) audio.success()
    else audio.error()
    setPhase(correct ? 'outcome_correct' : 'outcome_incorrect')
    setStage('explain')
  }

  // Restore the trainee to the stop point of the current step
  const resetToStop = (st: StepId) => {
    const p = player.current
    p.script = null
    p.autoWalk = null
    p.vel.set(0, 0, 0)
    p.pos.set(STOPS[st] - (st === 'coworker' || st === 'guardrail' ? 0 : 0.05), LEVEL, 0)
    p.yaw = -Math.PI / 2
    p.pitch = -0.1
    p.roll = 0
    p.eye = p.eyeTarget = 1.65
    p.trauma = 0
    p.canLook = true
  }

  const retry = () => {
    clearAll()
    const st = stepRef.current
    resetToStop(st)
    if (st === 'tieoff') setTiedOff(false)
    if (st === 'plank') plank.current = { mode: 'loose', t: 0 }
    if (st === 'coworker') setCoworker('unclipped')
    if (st === 'guardrail') setTape(false)
    setDanger(false)
    setBlackout(0)
    setChoice(null)
    openDecision(st)
  }

  const nextAfterCorrect = () => {
    const st = stepRef.current
    setChoice(null)
    setDanger(false)
    const p = player.current
    p.canLook = true
    p.focus = null
    if (st === 'tieoff') {
      setStep('plank')
      p.canWalk = true
      setStage('walk')
      setPhase('simulation_active')
      push('Connected. Walk along the planks — stay in the middle.', 'ok')
    } else if (st === 'plank') {
      setStep('coworker')
      p.canWalk = true
      setStage('walk')
      setPhase('simulation_active')
      push('Plank secured. Continue to the east bay.', 'ok')
    } else if (st === 'coworker') {
      setStep('guardrail')
      p.focus = new THREE.Vector3(EDGE_X, LEVEL + 0.4, -1)
      after(700, () => showHazard('edge'))
      setStage('playout')
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
    fired.current = new Set()
    firstTry.current = {}
    Object.assign(player.current, createPlayer(START, -Math.PI / 2, -0.05))
    plank.current = { mode: 'loose', t: 0 }
    resetResults()
    setTiedOff(false)
    setPlankSafe(false)
    setCoworker('unclipped')
    setRailInstalled(false)
    setTape(false)
    setDanger(false)
    setBlackout(0)
    setChoice(null)
    setStep('tieoff')
    setStage('briefing')
    setPhase('simulation_active')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && stageRef.current === 'walk') autoWalk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const constrain = (next: THREE.Vector3) => {
    const st = stepRef.current
    // While walking freely you can't pass the current hazard stop
    if (stageRef.current === 'walk') next.x = Math.min(next.x, STOPS[st])
    next.x = Math.max(next.x, -11.6)
    if (next.x > -6.05 && next.x < 6.05) next.z = THREE.MathUtils.clamp(next.z, -WALK_HALF + 0.12, WALK_HALF - 0.12)
    else next.z = THREE.MathUtils.clamp(next.z, -2.6, 2.6)
    next.y = LEVEL
  }

  const hazardsFound = detectedHazards.filter((h) => h === HAZARDS.plank.id || h === HAZARDS.coworker.id || h === HAZARDS.edge.id).length
  const walkPrompt =
    step === 'tieoff'
      ? 'Walk to the end of the deck where the scaffold walkway starts'
      : step === 'plank'
        ? 'Cross the walkway towards the east bay'
        : 'Continue onto the east bay where your coworker is working'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#9cc6e8', userSelect: 'none' }}>
      <SimCanvas background="#a9cbe6" fov={70}>
        <Sky distance={450} sunPosition={[60, 40, 30]} turbidity={6} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.85} />
        <fog attach="fog" args={['#bcd3e6', 45, 180]} />
        <hemisphereLight args={['#dbeafe', '#8a7558', 1.15]} />
        <directionalLight
          position={[30, 40, 18]}
          intensity={2.2}
          color="#fff4e0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        >
          <orthographicCamera attach="shadow-camera" args={[-18, 18, 14, -14, 1, 90]} />
        </directionalLight>

        <PlayerRig playerRef={player} constrain={constrain} onTick={onTick} onFirstInput={() => setHintVisible(false)} />
        <SiteGround />
        <SteelFrame />
        <LoosePlank stateRef={plank} />
        <Clamps visible={plankSafe} />
        <EastGuardrail installed={railInstalled} />
        <CautionTape visible={tape} />
        <PlayerLanyard playerRef={player} connected={tiedOff} />
        <Suspense fallback={null}>
          <Coworker mode={coworker} />
        </Suspense>
        <SignBoard />

        <PulseRing position={[STOPS[step], LEVEL, 0]} visible={stage === 'walk'} radius={0.45} />
        {stage === 'walk' && step === 'tieoff' && (
          <Html position={[-6.05, LIFELINE_Y - 0.2, 0.4]} center zIndexRange={[20, 0]}>
            <WorldTag label="Lifeline anchor" sub="Tie-off point" tone="target" />
          </Html>
        )}
      </SimCanvas>

      <ScreenFX danger={danger} flash={flash} letterbox={letterbox} blackout={blackout} caption={caption} />

      {stage !== 'briefing' && stage !== 'debrief' && (
        <>
          <MissionPanel
            title="Working at height"
            steps={STEPS}
            currentId={step}
            results={results}
            chips={[
              { label: 'Height above ground', value: '8.0 m', tone: 'warn' },
              { label: 'Your tie-off', value: tiedOff ? '100% connected' : 'Not connected', tone: tiedOff ? 'ok' : 'bad' },
              { label: 'Hazards found', value: `${hazardsFound} / 3`, tone: hazardsFound === 3 ? 'ok' : 'warn' },
            ]}
          />
          <SimToolbar soundOn={soundOn} onToggleSound={() => setSoundOn((v) => !v)} />
        </>
      )}
      <ToastStack toasts={toasts} />

      {stage === 'walk' && (
        <>
          <ObjectivePrompt text={walkPrompt} sub="8 m drop on both sides of the walkway" autoWalkLabel="Walk for me" onAutoWalk={autoWalk} />
          {hintVisible && <ControlsHint />}
        </>
      )}

      <AnimatePresence>
        {stage === 'briefing' && (
          <BriefingCard
            key="brief"
            eyebrow="Construction · Working at height"
            title={scenario.title}
            role="You are a structural ironworker on the 8 m level of a steel frame."
            situation="Your task is on the east bay, across a scaffold walkway laid along a beam. The frame was inspected this morning, but things change during a shift. Watch where you put your feet — and who's around you."
            objectives={[
              'Connect your fall protection before stepping onto the walkway',
              'Deal with any defect you find on the way across',
              'Look out for your crew',
              'Leave the work area safer than you found it',
            ]}
            controls={[
              ['W A S D', 'walk'],
              ['Drag', 'look around (look down!)'],
              ['E', 'walk for me'],
              ['Space', 'pause'],
            ]}
            onBegin={begin}
          />
        )}
        {hazardOpen && <HazardCard key={hazardOpen.id} hazard={hazardOpen} onAcknowledge={acknowledgeHazard} />}
        {stage === 'decide' && <DecisionCard key={`d-${step}`} decision={DECISIONS[step]} index={decisionIndex} total={4} onChoose={choose} />}
        {stage === 'explain' && choice && (
          <ExplanationCard
            key={`e-${step}`}
            verdict={choice.verdict}
            explanation={choice.outcome}
            primaryLabel={choice.verdict === 'correct' ? (step === 'guardrail' ? 'See debrief' : 'Continue') : 'Retry this decision'}
            onPrimary={choice.verdict === 'correct' ? nextAfterCorrect : retry}
          />
        )}
        {stage === 'debrief' && (
          <DebriefCard
            key="debrief"
            title="Safe at height"
            summary="You stayed 100% tied off, fixed the unsecured plank instead of working around it, stopped an unsafe act without startling anyone and restored the edge protection — the habits that stop falls, the top killer in construction."
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

function SignBoard() {
  const map = useMemo(
    () => signTexture('fall-sign', ['100% TIE-OFF', 'BEYOND THIS POINT'], { bg: '#1d4ed8', fg: '#ffffff', border: '#ffffff', w: 512, h: 256 }),
    []
  )
  return <Sign map={map} position={[-6.1, LEVEL + 1.55, -1.6]} size={[1.0, 0.5]} rotationY={-Math.PI / 2} />
}
