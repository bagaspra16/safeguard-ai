import type { Scenario } from '@/types'

// ─── Forklift Blind Corner — Primary MVP Scenario ─────────────────────────────

export const FORKLIFT_BLIND_CORNER_SCENARIO: Scenario = {
  id: 'forklift-blind-corner-001',
  title: 'Forklift Blind Corner Collision',
  description:
    'A warehouse employee approaches a blind intersection while a forklift is approaching from the other side. Learn to recognize vehicle hazards and apply stop-and-check behavior.',
  category: 'warehouse_safety',
  severity: 'high',
  environment: 'warehouse',
  estimatedDuration: 5,
  status: 'published',

  hazards: [
    {
      id: 'forklift-01',
      type: 'vehicle',
      label: 'Moving Forklift',
      description:
        'A 3,000kg forklift approaching at 8 km/h with a stopping distance of 4 meters. The operator has limited visibility around the blind corner.',
      severity: 'high',
      position: { x: 12, y: 0, z: 0 },
    },
    {
      id: 'blind-corner-01',
      type: 'visibility',
      label: 'Blind Intersection',
      description:
        'A shelving unit obstructs the line of sight at this intersection. Neither the forklift operator nor the pedestrian can see the other until they are within the danger zone.',
      severity: 'high',
      position: { x: 0, y: 0, z: 0 },
    },
  ],

  learningObjectives: [
    'Recognize active forklift hazards in a warehouse environment',
    'Identify blind intersections created by shelving and storage units',
    'Understand pedestrian-forklift separation principles',
    'Apply the stop-and-check procedure before entering any intersection',
    'React appropriately to unexpected vehicle movement',
    'Understand why bypassing safety checks creates collision risk',
  ],

  negativeCase: {
    id: 'negative-forklift-001',
    label: 'Unsafe Approach',
    description: 'Employee fails to slow down, does not check the intersection, and enters the forklift path.',
    actions: ['continue_walking', 'fail_to_check', 'enter_vehicle_path', 'collision_near_miss'],
  },

  positiveCase: {
    id: 'positive-forklift-001',
    label: 'Correct Procedure',
    description: 'Employee slows down, stops before the intersection, checks both directions, waits for the forklift to pass, then proceeds.',
    actions: ['slow_down', 'stop_before_intersection', 'look_left', 'look_right', 'wait_for_forklift', 'proceed_when_safe'],
  },

  assessment: {
    requiredActions: ['stop', 'check_left', 'check_right'],
    passingScore: 80,
    timeLimit: 300, // seconds
  },

  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },

  simulation: {
    environment: 'warehouse',
    assetSet: 'warehouse_basic',
    playerStart: { x: -8, y: 0, z: 0 },
    hazardPositions: {
      'forklift-01': { x: 12, y: 0, z: 0 },
      'blind-corner-01': { x: 0, y: 0, z: 0 },
    },
    interactionZones: [
      {
        id: 'zone-forklift-detect',
        type: 'hazard_detect',
        position: { x: 12, y: 0, z: 0 },
        radius: 5,
        label: 'Forklift Hazard Zone',
        triggersEvent: 'hazard_detected',
      },
      {
        id: 'zone-intersection',
        type: 'decision_point',
        position: { x: 0, y: 0, z: 0 },
        radius: 3,
        label: 'Intersection Decision Point',
        triggersEvent: 'decision_made',
      },
    ],
  },

  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

// ─── Quiz Questions for this Scenario ─────────────────────────────────────────

export const FORKLIFT_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the FIRST thing you should do when approaching a blind intersection in a warehouse?',
    options: [
      'Walk quickly to get through it faster',
      'Stop, look left and right, then proceed only when clear',
      'Honk or yell to warn others',
      'Look only in the direction you are walking',
    ],
    correctIndex: 1,
    explanation:
      'The correct procedure is to stop completely at blind intersections, look both ways, and only proceed when you are certain no vehicles are approaching.',
    hazardId: 'blind-corner-01',
  },
  {
    id: 'q2',
    question: 'Why are forklift blind corners particularly dangerous?',
    options: [
      'Forklifts are too slow to be dangerous',
      'Shelving blocks the line of sight for both the driver and pedestrian',
      'Forklifts always have a horn that warns pedestrians',
      'Pedestrians always have right-of-way over forklifts',
    ],
    correctIndex: 1,
    explanation:
      'Blind corners created by shelving units block visibility for BOTH the forklift operator and pedestrians, meaning neither party can react until it may be too late.',
    hazardId: 'blind-corner-01',
  },
  {
    id: 'q3',
    question: 'A forklift weighing 3,000kg is traveling at 8 km/h. What does this mean for stopping distance?',
    options: [
      'It can stop instantly because it has good brakes',
      'It needs approximately 4 meters to stop — much longer than a person expects',
      'The weight is irrelevant; only speed matters',
      'It will always stop before hitting a pedestrian',
    ],
    correctIndex: 1,
    explanation:
      'Heavy industrial forklifts require significant stopping distances. At 8 km/h, a 3,000kg forklift needs approximately 4 meters to stop. A pedestrian who steps into its path may not have enough time to react.',
    hazardId: 'forklift-01',
  },
  {
    id: 'q4',
    question: 'What is the correct behavior when you see a forklift approaching a shared zone?',
    options: [
      'Continue walking — forklifts always stop for pedestrians',
      'Run quickly to cross before the forklift arrives',
      'Stop, make eye contact with the operator, and wait until they signal you to pass',
      'Wave your hands and expect the forklift to stop immediately',
    ],
    correctIndex: 2,
    explanation:
      'When a forklift is approaching, stop and establish clear communication with the operator. Do not assume the operator has seen you or will stop. Only cross when you have received a clear signal.',
    hazardId: 'forklift-01',
  },
  {
    id: 'q5',
    question: 'What does pedestrian-forklift separation mean in practice?',
    options: [
      'Only one person can be in a warehouse at a time',
      'Forklifts and pedestrians must use designated, physically separated routes',
      'Pedestrians must always run when near forklifts',
      'Forklifts are only operated after working hours',
    ],
    correctIndex: 1,
    explanation:
      'Pedestrian-forklift separation means using designated pedestrian walkways marked with floor markings, barriers, or separate aisles that forklifts do not use. This physically removes the collision risk.',
    hazardId: 'blind-corner-01',
  },
]

// ─── Additional Scenarios for Rich Multi-Industry Simulation Catalog ────────

export const CHEMICAL_SPILL_SCENARIO: Scenario = {
  id: 'chemical-spill-002',
  title: 'Hazardous Acid Spill Containment',
  description:
    'A corrosive chemical container ruptures in the primary storage wing. Execute emergency evacuation, PPE verification, and secondary containment isolation.',
  category: 'chemical_safety',
  severity: 'critical',
  environment: 'chemical',
  estimatedDuration: 7,
  status: 'published',
  hazards: [
    {
      id: 'acid-leak-01',
      type: 'chemical',
      label: 'Concentrated Sulfuric Acid Pool',
      description: 'Corrosive vapors generating respiratory risk and immediate contact burns.',
      severity: 'critical',
      position: { x: 5, y: 0, z: -4 },
    },
    {
      id: 'ventilation-fail-01',
      type: 'visibility',
      label: 'Obstructed Exhaust Hood',
      description: 'Emergency air scrubber offline creating toxic vapor accumulation zone.',
      severity: 'high',
      position: { x: 0, y: 0, z: -8 },
    },
  ],
  learningObjectives: [
    'Identify SDS Class 8 corrosive hazard markings',
    'Select appropriate Level B chemical PPE before approaching zone',
    'Deploy neutralizer boom from upwind position',
    'Trigger emergency facility lockdown notification protocol',
  ],
  negativeCase: {
    id: 'negative-chemical-002',
    label: 'Direct Unprotected Contact',
    description: 'Worker approaches spill without respirator and attempts water cleanup on acid.',
    actions: ['enter_fume_cloud', 'skip_scba_gear', 'apply_water_to_acid', 'inhalation_exposure'],
  },
  positiveCase: {
    id: 'positive-chemical-002',
    label: 'Standard Hazmat Response',
    description: 'Worker retreats upwind, pulls emergency alarm, dons Level B gear, and places containment socks.',
    actions: ['evacuate_upwind', 'activate_pull_station', 'don_acid_suit', 'deploy_spill_kit'],
  },
  assessment: {
    requiredActions: ['evacuate_upwind', 'pull_alarm', 'spill_kit_containment'],
    passingScore: 85,
    timeLimit: 360,
  },
  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },
  simulation: {
    environment: 'chemical',
    assetSet: 'chemical_lab',
    playerStart: { x: -6, y: 0, z: 4 },
    hazardPositions: {
      'acid-leak-01': { x: 5, y: 0, z: -4 },
    },
    interactionZones: [],
  },
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
}

export const LOTO_ELECTRICAL_SCENARIO: Scenario = {
  id: 'loto-electrical-003',
  title: 'High-Voltage Breaker Lockout / Tagout (LOTO)',
  description:
    'Perform maintenance on a 480V conveyor distribution panel. Master zero-energy state verification, physical padlocking, and arc flash safety boundaries.',
  category: 'electrical_safety',
  severity: 'critical',
  environment: 'factory',
  estimatedDuration: 6,
  status: 'published',
  hazards: [
    {
      id: 'stored-energy-01',
      type: 'electrical',
      label: '480V Residual Capacitor Charge',
      description: 'Lethal stored electrical charge remaining active after primary switch disconnect.',
      severity: 'critical',
      position: { x: 0, y: 0, z: 2 },
    },
  ],
  learningObjectives: [
    'Execute OSHA 1910.147 standard 6-step LOTO procedure',
    'Verify zero-energy state with calibrated multimeter',
    'Apply individual safety padlock and danger tag',
    'Establish 1.2-meter NFPA 70E Arc Flash boundary',
  ],
  negativeCase: {
    id: 'negative-loto-003',
    label: 'Premature Panel Access',
    description: 'Technician turns off switch but fails to lock or test voltage before touching busbars.',
    actions: ['skip_padlock', 'omit_meter_test', 'touch_energized_terminal', 'arc_flash_incident'],
  },
  positiveCase: {
    id: 'positive-loto-003',
    label: 'Zero-Energy Isolation',
    description: 'Technician opens breaker, attaches padlock with personal key, tests with multimeter, grounds line.',
    actions: ['open_disconnect', 'apply_hasp_and_lock', 'verify_zero_voltage', 'attach_safety_tag'],
  },
  assessment: {
    requiredActions: ['open_disconnect', 'lock_hasp', 'test_voltage'],
    passingScore: 90,
    timeLimit: 300,
  },
  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },
  simulation: {
    environment: 'factory',
    assetSet: 'factory_loto',
    playerStart: { x: -4, y: 0, z: 0 },
    hazardPositions: {
      'stored-energy-01': { x: 0, y: 0, z: 2 },
    },
    interactionZones: [],
  },
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
}

export const FALL_PROTECTION_SCENARIO: Scenario = {
  id: 'fall-protection-004',
  title: 'Elevated Scaffold & Harness Tie-Off',
  description:
    'Work at heights exceeding 6 meters on modular scaffolding. Verify harness inspection, anchor point ratings (5,000 lbs), and dual lanyard tie-off.',
  category: 'construction_safety',
  severity: 'high',
  environment: 'construction',
  estimatedDuration: 5,
  status: 'published',
  hazards: [
    {
      id: 'unanchored-plank-01',
      type: 'fall',
      label: 'Loose Scaffolding Board & Missing Guardrail',
      description: 'Overhang scaffold section lacking toe boards and mid-rail guardrails.',
      severity: 'high',
      position: { x: 3, y: 6, z: 0 },
    },
  ],
  learningObjectives: [
    'Inspect full-body harness webbing and D-rings for fraying',
    'Calculate total fall clearance distance including deceleration buffer',
    'Maintain 100% continuous tie-off using dual snap hooks',
  ],
  negativeCase: {
    id: 'negative-fall-004',
    label: 'Unsecured High Work',
    description: 'Worker disconnects lanyard to move across planks and steps onto unpinned board.',
    actions: ['disconnect_both_lanyards', 'step_on_cantilever_board', 'fall_from_elevation'],
  },
  positiveCase: {
    id: 'positive-fall-004',
    label: '100% Continuous Tie-Off',
    description: 'Worker connects secondary lanyard before disconnecting primary lanyard at all times.',
    actions: ['inspect_harness', 'connect_primary_anchor', 'leapfrog_dual_lanyards', 'stay_within_rails'],
  },
  assessment: {
    requiredActions: ['inspect_harness', 'continuous_tie_off'],
    passingScore: 85,
    timeLimit: 300,
  },
  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },
  simulation: {
    environment: 'construction',
    assetSet: 'scaffold_zone',
    playerStart: { x: -2, y: 0, z: 0 },
    hazardPositions: {
      'unanchored-plank-01': { x: 3, y: 6, z: 0 },
    },
    interactionZones: [],
  },
  createdAt: new Date('2026-01-20'),
  updatedAt: new Date('2026-01-20'),
}

// ─── All Available Scenarios ──────────────────────────────────────────────────

export const ALL_SCENARIOS: Scenario[] = [
  FORKLIFT_BLIND_CORNER_SCENARIO,
  CHEMICAL_SPILL_SCENARIO,
  LOTO_ELECTRICAL_SCENARIO,
  FALL_PROTECTION_SCENARIO,
]

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id) || ALL_SCENARIOS[0]
}
