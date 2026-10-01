import type { Scenario, ImmersiveScenario, ImmersiveVideoTrack } from '@/types'

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

// ─── Forklift Scenario — SIVS Visual Identity (§27–30, §45) ─────────────────

const FORKLIFT_VISUAL_IDENTITY = {
  environment: {
    type: 'large modern warehouse',
    floor: 'industrial concrete with yellow painted pedestrian lanes',
    lighting: 'overhead LED',
    structures: [
      'metal industrial shelving (height 3m)',
      'warehouse blind intersection',
      'yellow painted crossing zones',
      'forklift charging station visible in background',
    ],
    pedestrianPath: 'Yellow painted, 1.2-metre-wide designated pedestrian path',
    vehicleZone: 'Yellow and black striped forklift crossing zone at intersection',
  },
  character: {
    role: 'warehouse worker',
    ppe: ['high-visibility yellow vest', 'white safety helmet', 'safety boots', 'work gloves'],
    gender: 'neutral' as const,
    approximateAge: 'mid-30s',
  },
  camera: {
    height: 1.65,
    perspective: 'first_person' as const,
    projection: 'equirectangular' as const,
    motion: ['standing', 'slow forward walking', 'controlled stop'],
  },
  lighting: {
    type: 'Consistent overhead LED industrial',
    timeOfDay: 'daytime (no natural light)',
    consistent: true as const,
  },
  colorProfile: 'Cool industrial whites and greys with yellow safety marking accents',
  audio: {
    ambience: 'Industrial warehouse background hum, air conditioning, distant pallet movement',
    hazardSounds: [
      'electric forklift motor hum approaching from right',
      'forklift reverse beeper at 2m interval',
      'metal shelving ambient creak',
      'footsteps on concrete',
    ],
  },
}

// SIVS §45 — Master Scenario Specification
const FORKLIFT_SIVS_MASTER_SPEC = {
  scenarioId: 'forklift-blind-corner-001',
  negativeBehavior: {
    action: 'continue_without_checking',
    description: 'The employee walks at normal pace toward the blind intersection, does not slow down, does not look, does not stop before the floor marking, and enters the forklift travel path without checking.',
  },
  positiveBehavior: {
    action: 'stop_check_wait_proceed',
    description: 'The employee slows on approach, stops completely before the yellow intersection line, looks left then right using full body turn, identifies the approaching forklift, establishes eye contact with the operator, waits for the forklift to fully pass, then proceeds safely across the marking.',
  },
  hazard: {
    type: 'electric forklift, 3000 kg, 8 km/h',
    location: 'right_side_perpendicular_corridor',
    importance: 'primary' as const,
  },
}

// SIVS §17 — Standard Video Metadata
const FORKLIFT_SIVS_METADATA = {
  projection: 'equirectangular' as const,
  stereo: 'mono' as const,
  resolution: '5760x2880',
  fps: 30,
  duration: 20,
  cameraHeight: 1.65,
  initialOrientation: { yaw: 0, pitch: 0, roll: 0 },
  webXRCompatible: true,
  audio: 'stereo' as const,
}

// SIVS §13 — Spatial Interaction Zones
const FORKLIFT_SPATIAL_ZONES = [
  {
    id: 'zone-forklift-right',
    type: 'hazard' as const,
    yaw: 90,   // 90° to the right from forward direction
    pitch: 0,
    angleDeg: 30,
    label: 'Approaching Forklift',
  },
  {
    id: 'zone-intersection-ahead',
    type: 'hazard' as const,
    yaw: 0,    // directly ahead
    pitch: -10,
    angleDeg: 25,
    label: 'Blind Intersection',
  },
  {
    id: 'zone-pedestrian-path',
    type: 'information' as const,
    yaw: 0,
    pitch: -20,
    angleDeg: 20,
    label: 'Pedestrian Floor Marking',
  },
]

const FORKLIFT_NEGATIVE_TRACK = {
  url: '/demo/videos/forklift-negative.mp4',
  is360: false,                         // will become true when real 360° asset is ready
  label: 'UNSAFE BEHAVIOR — Incident at Blind Corner',
  caseType: 'negative' as const,
  sivsMetadata: FORKLIFT_SIVS_METADATA,
  spatialZones: FORKLIFT_SPATIAL_ZONES,
  cues: [
    {
      id: 'neg-cue-1',
      atSeconds: 8,
      type: 'warning' as const,
      stage: 'recognize' as const,
      prompt: 'The worker is approaching the intersection. What should they do RIGHT NOW?',
      options: [
        'Continue at the same pace — the aisle looks clear',
        'Slow down and prepare to stop before the corner',
        'Speed up to get past the junction quickly',
        'Look at their phone briefly — forklifts always honk',
      ],
      correctOptionIndex: 1,
      explanation: 'At any blind corner, OSHA 1910.178 requires slowing and preparing to stop. The shelving unit eliminates your sight-line — the forklift may already be around the corner.',
      severity: 'high' as const,
      spatialDirection: { yaw: 0, pitch: -5, toleranceDeg: 30 },
    },
    {
      id: 'neg-cue-2',
      atSeconds: 18,
      type: 'question' as const,
      stage: 'reflect' as const,
      prompt: 'The worker enters the intersection without stopping. What is the MOST dangerous outcome that is now possible?',
      options: [
        'The worker trips on the floor marking',
        'The forklift driver sees them and stops in time',
        'A 3,000 kg forklift at 8 km/h collides — 4-metre stopping distance is not enough',
        'The alarm system triggers automatically',
      ],
      correctOptionIndex: 2,
      explanation: 'A 3,000 kg forklift at 8 km/h requires approximately 4 metres to stop. Once a pedestrian enters the path at close range, physics prevents safe braking.',
      severity: 'critical' as const,
      spatialDirection: { yaw: 90, pitch: 0, toleranceDeg: 25 },
    },
  ],
}

const FORKLIFT_POSITIVE_TRACK = {
  url: '/demo/videos/forklift-positive.mp4',
  is360: false,
  label: 'CORRECT PROCEDURE — Stop-and-Check Protocol',
  caseType: 'positive' as const,
  sivsMetadata: FORKLIFT_SIVS_METADATA,
  spatialZones: FORKLIFT_SPATIAL_ZONES,
  cues: [
    {
      id: 'pos-cue-1',
      atSeconds: 6,
      type: 'observation' as const,
      stage: 'recognize' as const,
      prompt: 'The worker has stopped before the corner line. Why is stopping BEFORE the line critical, not just slowing down?',
      options: [
        'It is only a courtesy, not a safety requirement',
        'Stopping before the line ensures you are outside the forklift sweep radius before looking',
        'The line is purely decorative',
        'Stopping is only required when a forklift is visible',
      ],
      correctOptionIndex: 1,
      explanation: 'The floor line marks the outer edge of the forklift travel arc. Stopping before it means your body is physically outside the danger zone while you check — not partially inside it.',
      severity: 'medium' as const,
      spatialDirection: { yaw: 0, pitch: -15, toleranceDeg: 20 },
    },
    {
      id: 'pos-cue-2',
      atSeconds: 16,
      type: 'question' as const,
      stage: 'decide' as const,
      prompt: 'The worker looks left, right, and makes eye contact with the forklift operator before crossing. Which of these is the final correct action?',
      options: [
        'Immediately walk across while the driver is still approaching',
        'Wave quickly and assume they will stop',
        'Wait for a clear hand signal or head nod from the operator, then proceed',
        'Run quickly to minimize time in the intersection',
      ],
      correctOptionIndex: 2,
      explanation: 'Eye contact alone is not confirmation. Always wait for the operator to give a clear, deliberate signal before crossing. Forklifts can begin moving again unexpectedly.',
      severity: 'medium' as const,
      spatialDirection: { yaw: 90, pitch: 0, toleranceDeg: 25 },
    },
  ],
}

export const FORKLIFT_IMMERSIVE_SCENARIO = {
  ...FORKLIFT_BLIND_CORNER_SCENARIO,
  immersiveTracks: {
    negative: FORKLIFT_NEGATIVE_TRACK,
    positive: FORKLIFT_POSITIVE_TRACK,
  },
  visualIdentity: FORKLIFT_VISUAL_IDENTITY,
  sivsMasterSpec: FORKLIFT_SIVS_MASTER_SPEC,
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

// ─── Industrial Fire Scenario ─────────────────────────────────────────────────

export const INDUSTRIAL_FIRE_SCENARIO: Scenario = {
  id: 'industrial-fire-005',
  title: 'Industrial Factory Fire & Emergency Evacuation',
  description:
    'A flash fire ignites in a paint storage room adjacent to the main production floor. You are a floor technician 12 meters from the outbreak. Navigate the smoke, locate the nearest Class B extinguisher, assess whether suppression is viable, then execute the full RACE protocol evacuation procedure.',
  category: 'fire_safety',
  severity: 'critical',
  environment: 'factory',
  estimatedDuration: 7,
  status: 'published',

  hazards: [
    {
      id: 'paint-fire-01',
      type: 'fire',
      label: 'Class B Flash Fire — Flammable Paint Storage',
      description:
        'Solvent-based paint cans have ruptured and ignited. Produces dense black hydrocarbon smoke with cyanide compounds. Flames can spread to adjacent solvent rack within 90 seconds.',
      severity: 'critical',
      position: { x: 8, y: 0, z: -5 },
    },
    {
      id: 'smoke-cloud-01',
      type: 'visibility',
      label: 'Dense Smoke Accumulation',
      description:
        'Smoke layer dropping to 1.5m height, reducing visibility to 3 meters. Carbon monoxide rising rapidly. No personal respiratory protection available in immediate zone.',
      severity: 'high',
      position: { x: 4, y: 0, z: -3 },
    },
    {
      id: 'blocked-exit-01',
      type: 'visibility',
      label: 'Primary Exit Blocked by Smoke',
      description:
        'The main corridor exit (north) is smoke-filled and non-viable. Secondary emergency exit (south) is accessible but requires navigating around machinery.',
      severity: 'high',
      position: { x: -6, y: 0, z: 4 },
    },
  ],

  learningObjectives: [
    'Execute the RACE protocol: Rescue, Alarm, Contain, Evacuate',
    'Classify fire types and select correct extinguisher (A, B, C, D, K)',
    'Identify when to fight fire vs. when to evacuate immediately',
    'Navigate smoke-filled environments using low-crawl technique',
    'Locate and activate manual pull station emergency alarm',
    'Maintain fire door discipline to prevent smoke spread',
    'Identify the fire triangle and how to break combustion chain',
  ],

  negativeCase: {
    id: 'negative-fire-005',
    label: 'Improper Response — Escalation',
    description:
      'Worker uses wrong extinguisher type on solvent fire (water on Class B), causing fire spread. Wastes time attempting suppression instead of evacuating. Disables fire door, allowing smoke into main hall.',
    actions: ['use_water_on_class_b', 'prop_fire_door_open', 'delay_evacuation', 'miss_pull_station', 'overcome_by_smoke'],
  },

  positiveCase: {
    id: 'positive-fire-005',
    label: 'Correct RACE Protocol Execution',
    description:
      'Worker immediately pulls alarm, verifies fire size is beyond suppression threshold, closes nearest fire door to contain spread, then leads low-crawl evacuation through south emergency exit.',
    actions: ['pull_alarm', 'assess_fire_size', 'close_fire_door', 'low_crawl_technique', 'exit_via_south', 'muster_point'],
  },

  assessment: {
    requiredActions: ['pull_alarm', 'close_fire_door', 'evacuate_south'],
    passingScore: 80,
    timeLimit: 420,
  },

  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },

  simulation: {
    environment: 'factory',
    assetSet: 'factory_fire',
    playerStart: { x: -8, y: 0, z: 0 },
    hazardPositions: {
      'paint-fire-01': { x: 8, y: 0, z: -5 },
      'smoke-cloud-01': { x: 4, y: 0, z: -3 },
      'blocked-exit-01': { x: -6, y: 0, z: 4 },
    },
    interactionZones: [
      {
        id: 'zone-pull-station',
        type: 'hazard_detect',
        position: { x: -4, y: 0, z: 2 },
        radius: 2,
        label: 'Manual Pull Station',
        triggersEvent: 'hazard_detected',
      },
      {
        id: 'zone-fire-assess',
        type: 'decision_point',
        position: { x: 3, y: 0, z: -2 },
        radius: 3,
        label: 'Fire Assessment Zone',
        triggersEvent: 'decision_made',
      },
    ],
  },

  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
}

export const FIRE_QUIZ_QUESTIONS = [
  {
    id: 'fq1',
    question: 'You see a fire in a factory paint storage room. What is the FIRST action you should take according to the RACE protocol?',
    options: [
      'Grab the nearest fire extinguisher and try to put it out immediately',
      'Rescue anyone in immediate danger, then activate the fire alarm pull station',
      'Open all windows and doors to ventilate the area',
      'Call your supervisor and wait for instructions',
    ],
    correctIndex: 1,
    explanation:
      'RACE stands for Rescue, Alarm, Contain, Evacuate. Rescue any persons in immediate danger first (if safe to do so), then immediately activate the fire alarm to alert all building occupants and emergency services. Attempting to fight the fire before alarming others puts everyone at greater risk.',
    hazardId: 'paint-fire-01',
  },
  {
    id: 'fq2',
    question: 'A paint storage fire is classified as a Class B fire. What type of extinguisher should you use?',
    options: [
      'Class A water extinguisher — water cools all fires effectively',
      'CO₂ or dry chemical extinguisher rated for Class B flammable liquid fires',
      'Any available extinguisher — speed is more important than type',
      'Class K wet chemical extinguisher designed for cooking oils',
    ],
    correctIndex: 1,
    explanation:
      'Class B fires involve flammable liquids (solvents, paints, oils, gasoline). Using water on Class B fires is extremely dangerous — it spreads burning liquid and can cause steam explosions. CO₂ extinguishers smother the fire by removing oxygen. Dry chemical (ABC powder) interrupts the combustion chain reaction. Never use water on Class B fires.',
    hazardId: 'paint-fire-01',
  },
  {
    id: 'fq3',
    question: 'The fire has grown beyond the initial container. The smoke layer is dropping. Should you attempt to fight the fire or evacuate?',
    options: [
      'Continue fighting — more extinguisher passes will bring it under control',
      'Evacuate immediately — fire that has spread beyond initial containment exceeds safe suppression threshold',
      'Open nearby windows first to reduce smoke, then fight the fire',
      'Wait for additional coworkers to arrive before evacuating',
    ],
    correctIndex: 1,
    explanation:
      'OSHA and NFPA guidelines state that workers should only attempt fire suppression when: (1) the fire is smaller than a waste basket, (2) your back is to the exit, (3) you have been trained, and (4) air is still breathable. Once fire spreads beyond initial containment or smoke drops below standing height, immediate evacuation is the only safe option.',
    hazardId: 'smoke-cloud-01',
  },
  {
    id: 'fq4',
    question: 'As you evacuate through a smoke-filled corridor, what is the correct body position?',
    options: [
      'Run upright as fast as possible to minimize exposure time',
      'Crawl low on hands and knees — smoke rises, cleaner air stays near the floor',
      'Walk normally while covering your mouth with your shirt',
      'Climb onto machinery to stay above the smoke level',
    ],
    correctIndex: 1,
    explanation:
      'Smoke and toxic gases rise. The air closest to the floor is significantly cleaner and has higher oxygen concentration. Crawling on hands and knees keeps your nose and mouth in the breathable zone. Toxic gases from solvent fires (CO, HCN) cause unconsciousness within 2-3 breaths at smoke layer height.',
    hazardId: 'smoke-cloud-01',
  },
  {
    id: 'fq5',
    question: 'You pass through a fire door while evacuating. What must you do with it?',
    options: [
      'Prop it open so other evacuees can follow you through easily',
      'Close it completely — fire doors are rated to hold back fire and smoke for 20–90 minutes',
      'Leave it however you found it to avoid slowing your escape',
      'Break the glass panel to activate automatic door closer',
    ],
    correctIndex: 1,
    explanation:
      'Fire doors are engineered barriers rated to contain fire and smoke for 20 to 90 minutes. Propping them open eliminates this protection and can allow fire to consume an entire building in minutes. Always close fire doors behind you during evacuation — the door you close may save the lives of people still inside.',
    hazardId: 'blocked-exit-01',
  },
]

// ─── Construction Fall Scenario ───────────────────────────────────────────────

export const CONSTRUCTION_FALL_SCENARIO: Scenario = {
  id: 'construction-fall-006',
  title: 'Construction Site Fall Prevention',
  description:
    'You are a structural ironworker on an 8-meter elevated steel beam during a multi-story building frame installation. A section of scaffolding plank is unsecured, guardrails are missing on the eastern edge, and a coworker has disconnected his lanyard to reach a bolt. Navigate the hazards, correct the violations, and execute proper 100% tie-off procedures.',
  category: 'construction_safety',
  severity: 'critical',
  environment: 'construction',
  estimatedDuration: 6,
  status: 'published',

  hazards: [
    {
      id: 'unsecured-plank-01',
      type: 'fall',
      label: 'Unsecured Scaffold Plank — Tip Hazard',
      description:
        'A 3-meter scaffold plank is bridging two supports but is not pin-locked or toe-boarded. Stepping on the overhang end will tip the plank and cause a fall to the concrete deck 8 meters below.',
      severity: 'critical',
      position: { x: 3, y: 8, z: 1 },
    },
    {
      id: 'missing-guardrail-01',
      type: 'fall',
      label: 'Missing Guardrail — Open Edge Exposure',
      description:
        'Eastern scaffold perimeter is missing top rail (1.07m) and mid-rail (0.5m). OSHA 1926.502 requires guardrail systems on all open edges above 6 feet (1.8m). A 8m fall without arrest is statistically fatal.',
      severity: 'critical',
      position: { x: 6, y: 8, z: 0 },
    },
    {
      id: 'disconnected-lanyard-01',
      type: 'fall',
      label: "Coworker's Disconnected Lanyard",
      description:
        'Coworker has unclipped both lanyards to lean over a beam edge. Any sudden movement, shift in weight, or surface loss will result in unrestrained fall. Must be corrected immediately.',
      severity: 'critical',
      position: { x: 5, y: 8, z: -2 },
    },
  ],

  learningObjectives: [
    'Identify and report all three categories of fall hazards: missing guardrails, unsecured planks, and PPE non-compliance',
    'Demonstrate 100% continuous tie-off using dual-lanyard leapfrog technique',
    'Calculate total fall clearance distance: free fall + deceleration + harness height',
    'Inspect full-body harness D-ring and webbing for pre-shift defects',
    'Intervene appropriately when observing a coworker in an unprotected position',
    'Understand OSHA 1926.502 fall protection trigger heights and required systems',
    'Identify proper anchor points rated for 5,000 lbs per worker',
  ],

  negativeCase: {
    id: 'negative-fall-006',
    label: 'Improper Tie-Off — Both Lanyards Disconnected',
    description:
      'Worker disconnects both lanyards to move across scaffold section quickly, steps onto the unsecured plank overhang, loses balance at the open edge, and falls from 8 meters.',
    actions: ['disconnect_both_lanyards', 'step_on_unsecured_plank', 'approach_unguarded_edge', 'fall_from_elevation'],
  },

  positiveCase: {
    id: 'positive-fall-006',
    label: '100% Tie-Off with Hazard Reporting',
    description:
      'Worker maintains dual-lanyard continuous tie-off, identifies all three hazards, verbally corrects coworker, avoids unsecured plank zone, and reports missing guardrail to site supervisor.',
    actions: ['maintain_dual_lanyard', 'identify_unsecured_plank', 'correct_coworker_loto', 'avoid_open_edge', 'report_missing_guardrail'],
  },

  assessment: {
    requiredActions: ['continuous_tie_off', 'identify_fall_hazards', 'intervene_coworker'],
    passingScore: 85,
    timeLimit: 360,
  },

  video: {
    positive: '/demo/videos/forklift-positive.mp4',
    negative: '/demo/videos/forklift-negative.mp4',
  },

  simulation: {
    environment: 'construction',
    assetSet: 'steel_frame_highrise',
    playerStart: { x: -6, y: 8, z: 0 },
    hazardPositions: {
      'unsecured-plank-01': { x: 3, y: 8, z: 1 },
      'missing-guardrail-01': { x: 6, y: 8, z: 0 },
      'disconnected-lanyard-01': { x: 5, y: 8, z: -2 },
    },
    interactionZones: [
      {
        id: 'zone-fall-hazard',
        type: 'hazard_detect',
        position: { x: 3, y: 8, z: 0 },
        radius: 4,
        label: 'Elevated Hazard Detection Zone',
        triggersEvent: 'hazard_detected',
      },
      {
        id: 'zone-decision',
        type: 'decision_point',
        position: { x: 5, y: 8, z: 0 },
        radius: 3,
        label: 'Compliance Decision Point',
        triggersEvent: 'decision_made',
      },
    ],
  },

  createdAt: new Date('2026-03-15'),
  updatedAt: new Date('2026-03-15'),
}

export const CONSTRUCTION_FALL_QUIZ_QUESTIONS = [
  {
    id: 'cfq1',
    question: 'Under OSHA 1926.502, at what minimum height above a lower level must fall protection be provided on a construction site?',
    options: [
      '3 meters (10 feet) — only when working on roof structures',
      '1.8 meters (6 feet) — for all construction activities near unprotected edges',
      '4.5 meters (15 feet) — when using scaffolding systems',
      '2.4 meters (8 feet) — only when no safety nets are deployed',
    ],
    correctIndex: 1,
    explanation:
      'OSHA 1926.502(b) mandates fall protection for all construction workers at heights of 6 feet (1.8 meters) or more above a lower level. This includes scaffolding, leading edges, floor holes, and wall openings. The 6-foot trigger height is absolute — no exceptions for speed of work or distance from edge.',
    hazardId: 'missing-guardrail-01',
  },
  {
    id: 'cfq2',
    question: 'What is the correct technique for maintaining continuous 100% fall protection when moving across a scaffold?',
    options: [
      'Disconnect both lanyards, move quickly, then reconnect at the next anchor point',
      'Use dual-lanyard leapfrog: connect second lanyard to new anchor before disconnecting first',
      'One lanyard is sufficient — OSHA only requires one attachment at a time',
      'Remove harness entirely if the distance is less than 2 meters',
    ],
    correctIndex: 1,
    explanation:
      'The dual-lanyard leapfrog technique ensures 100% continuous tie-off: connect Lanyard B to the next anchor point BEFORE unclipping Lanyard A from the previous one. This means you are always attached to at least one certified anchor point at every moment. Even a fraction of a second unattached at height represents a fatal risk.',
    hazardId: 'disconnected-lanyard-01',
  },
  {
    id: 'cfq3',
    question: 'You spot a scaffold plank that is bridging two supports but its far end is unsupported and can tip. What should you do?',
    options: [
      'Walk across it quickly on the supported side and mark it for later repair',
      'Stop, do not step on it, and immediately tag it out and report to the site supervisor',
      'Reposition it yourself by pulling it with a rope without stepping on it',
      'Place a warning cone next to it and continue your work task',
    ],
    correctIndex: 1,
    explanation:
      'An unsecured scaffold plank is an immediate life-safety hazard. The correct action is to stop, NOT approach the plank, apply a "Do Not Use" tag/barrier, and immediately notify the site safety officer or supervisor. Only a competent person may re-inspect and secure the plank. Taking independent action to reposition it without authorization risks your own fall.',
    hazardId: 'unsecured-plank-01',
  },
  {
    id: 'cfq4',
    question: 'Your coworker has disconnected both lanyards to reach a bolt over the beam edge. What is the correct response?',
    options: [
      'Ignore it — it is their personal choice and not your responsibility on site',
      'Complete your current task first, then speak to them about it afterward',
      'Immediately call out and stop their work — any worker can issue a stop-work authority for life-safety violations',
      'Report it to HR after the shift ends',
    ],
    correctIndex: 2,
    explanation:
      'Every worker has Stop Work Authority (SWA) for life-safety hazards on construction sites. An unattached worker at 8 meters with no fall arrest is an immediate fatal risk. Calling out immediately is not only your right — it is your ethical and legal obligation under OSHA\'s General Duty Clause. Do not wait, do not complete your task first.',
    hazardId: 'disconnected-lanyard-01',
  },
  {
    id: 'cfq5',
    question: 'When inspecting a full-body harness before use, which condition requires you to remove it from service immediately?',
    options: [
      'Minor surface dirt or construction dust on the webbing',
      'Any fraying, cuts, chemical burns, or heat damage to webbing, stitching, or D-rings',
      'Slightly stiff hardware from cold temperature at the job site',
      'A faded color label from extended UV exposure',
    ],
    correctIndex: 1,
    explanation:
      'Harness webbing must be inspected before every use under ANSI Z359 and OSHA standards. Any fraying (even a single broken strand), cuts, abrasion damage, chemical contamination, heat damage, or deformed hardware requires immediate removal from service. A compromised harness will not arrest a fall — it will fail at the exact moment you need it. Dirt and cold stiffness are NOT disqualifying; structural integrity is.',
    hazardId: 'unsecured-plank-01',
  },
]

// ─── All Available Scenarios ──────────────────────────────────────────────────

export const ALL_SCENARIOS: Scenario[] = [
  FORKLIFT_BLIND_CORNER_SCENARIO,
  INDUSTRIAL_FIRE_SCENARIO,
  CONSTRUCTION_FALL_SCENARIO,
  CHEMICAL_SPILL_SCENARIO,
  LOTO_ELECTRICAL_SCENARIO,
  FALL_PROTECTION_SCENARIO,
]

export function getScenarioById(id: string): Scenario | undefined {
  const exact = ALL_SCENARIOS.find((s) => s.id === id)
  if (exact) return exact
  const byPartial = ALL_SCENARIOS.find((s) => s.id.includes(id) || id.includes(s.id) || s.category.includes(id))
  if (byPartial) return byPartial
  return ALL_SCENARIOS[0]
}

// ─── Scenario-Specific Post-Video Incident Questions ──────────────────────────

export interface PostVideoQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const AFTER_VIDEO_QUESTIONS_MAP: Record<string, PostVideoQuestion> = {
  'forklift-blind-corner-001': {
    question: "You just watched the incident. What was the worker's critical mistake when approaching the intersection?",
    options: [
      'They were walking at a standard pace without looking at their phone',
      'They did not come to a complete stop or check left and right before entering the vehicle aisle',
      'They were carrying too many packages in both arms',
      'They made eye contact with the forklift operator from a distance',
    ],
    correctIndex: 1,
    explanation:
      'The worker failed to stop and check at the blind intersection. The shelving unit blocked their view of the approaching 3,000kg forklift, but they stepped out into the path anyway. Always stop, look both directions, and confirm the aisle is clear.',
  },
  'industrial-fire-005': {
    question: 'You just watched the paint storage fire outbreak. What was the critical error in the initial response?',
    options: [
      'Attempting evacuation through designated secondary emergency exits',
      'Failing to immediately pull the manual fire alarm and attempting improper water suppression on a Class B solvent fire',
      'Closing the fire-rated door behind them to slow smoke migration',
      'Crawling low to the ground beneath the dense toxic smoke layer',
    ],
    correctIndex: 1,
    explanation:
      'Under the RACE protocol, alerting building occupants via the manual pull station is mandatory before any suppression. Furthermore, using water on Class B solvent fires causes explosive splatter and rapid fire spread. Class B requires CO₂ or Dry Chemical.',
  },
  'construction-fall-006': {
    question: 'You just watched the elevated scaffolding incident. What was the fatal procedural violation at the 8-meter elevation?',
    options: [
      'Wearing a high-visibility orange safety vest with reflective striping',
      'Disconnecting both lanyards simultaneously, losing 100% continuous tie-off near an unprotected open edge',
      'Inspecting the modular scaffold frame joints before beginning the work shift',
      'Utilizing a 5,000-lb rated overhead static lifeline cable',
    ],
    correctIndex: 1,
    explanation:
      'OSHA 1926.502 mandates 100% continuous fall protection at heights above 6 feet. Disconnecting both lanyards left the worker completely unprotected against a fatal fall from the 8-meter steel frame. Always maintain continuous tie-off using the dual-lanyard leapfrog technique.',
  },
  'chemical-spill-002': {
    question: 'You just watched the acid container rupture. What was the primary safety violation during the initial hazard response?',
    options: [
      'Immediately retreating upwind of the toxic vapor plume',
      'Approaching the concentrated sulfuric acid pool downwind without donning certified Level B respiratory PPE',
      'Activating the emergency exhaust scrubbers and perimeter alarm',
      'Deploying chemical neutralizer socks from an upwind position',
    ],
    correctIndex: 1,
    explanation:
      'Corrosive acid spills produce toxic fumes that cause severe respiratory burns. Entering the vapor plume downwind without appropriate SCBA / Level B PPE creates instant incapacitation risk.',
  },
  'loto-electrical-003': {
    question: 'You just watched the 480V distribution panel incident. What was the critical failure in the LOTO procedure?',
    options: [
      'Using an OSHA-compliant red lockout hasp and personal padlock',
      'Touching internal busbars without verifying zero electrical energy using a calibrated multimeter and applying personal lock',
      'Establishing a 1.2-meter NFPA 70E Arc Flash boundary perimeter',
      'Informing the shift supervisor before de-energizing the main conveyor feed',
    ],
    correctIndex: 1,
    explanation:
      'Opening the breaker switch does not guarantee zero energy due to residual capacitor charge or mechanical switch failure. OSHA 1910.147 requires physical padlocking and multimeter zero-voltage verification.',
  },
  'fall-protection-004': {
    question: 'You just watched the scaffold work incident. What was the critical safety failure?',
    options: [
      'Inspecting the harness D-ring and webbing prior to shift start',
      'Stepping onto an unsecured, unpinned cantilever scaffold board without 100% tie-off',
      'Maintaining dual snap hook connections to certified anchor points',
      'Staying within designated perimeter guardrails',
    ],
    correctIndex: 1,
    explanation:
      'Stepping onto unpinned cantilever boards causes immediate tipping. Combined with unclipped lanyards, this creates an unarrested fall hazard.',
  },
}

export function getAfterVideoQuestion(scenario: Scenario): PostVideoQuestion {
  if (AFTER_VIDEO_QUESTIONS_MAP[scenario.id]) {
    return AFTER_VIDEO_QUESTIONS_MAP[scenario.id]
  }
  if (scenario.category === 'fire_safety') {
    return AFTER_VIDEO_QUESTIONS_MAP['industrial-fire-005']
  }
  if (scenario.category === 'construction_safety') {
    return AFTER_VIDEO_QUESTIONS_MAP['construction-fall-006']
  }
  if (scenario.category === 'chemical_safety') {
    return AFTER_VIDEO_QUESTIONS_MAP['chemical-spill-002']
  }
  if (scenario.category === 'electrical_safety') {
    return AFTER_VIDEO_QUESTIONS_MAP['loto-electrical-003']
  }
  return {
    question: `You just watched the ${scenario.title} incident. What was the worker's critical mistake?`,
    options: [
      'They followed standard operating procedures too rigidly',
      `They committed procedural violations: ${scenario.negativeCase.description || 'failed to follow safety protocols'}`,
      'They reported the hazard immediately to the safety coordinator',
      'They verified all personal protective equipment before entry',
    ],
    correctIndex: 1,
    explanation: `The critical error was: ${scenario.negativeCase.description}. Safe operational protocol requires: ${scenario.positiveCase.description}.`,
  }
}

// ─── Agentic Assessment Questions (3 per scenario, used before 3D simulation) ─

export interface AgenticQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const AGENTIC_QUESTIONS_MAP: Record<string, AgenticQuestion[]> = {
  'forklift-blind-corner-001': [
    {
      id: 'fk-a1',
      category: 'Hazard Identification',
      difficulty: 'medium',
      question: 'In the incident video, what created the primary visibility blind spot at the intersection?',
      options: [
        'Poor warehouse lighting and shadows cast by overhead fixtures',
        'A high-density shelving unit positioned directly at the corner, blocking line-of-sight in both directions',
        'The forklift operator was distracted by a two-way radio call',
        'The pedestrian was wearing earphones and could not hear the forklift horn',
      ],
      correctIndex: 1,
      explanation:
        'OSHA 1910.178(e)(1) requires physical mirrors, signage, or guardrails at blind intersections. The shelving unit created a 0° visibility window, leaving both parties unaware of each other until they were inside the 4-meter danger zone.',
    },
    {
      id: 'fk-a2',
      category: 'Emergency Protocol',
      difficulty: 'hard',
      question: 'A 3,000 kg forklift traveling at 8 km/h requires approximately how much stopping distance on a dry concrete warehouse floor?',
      options: [
        'Less than 0.5 meters — electric forklifts have regenerative braking',
        'Approximately 4 meters — far beyond typical pedestrian reaction distance',
        'About 1.5 meters if emergency brakes are applied immediately',
        'Over 10 meters — warehouse floors are too slippery for effective braking',
      ],
      correctIndex: 1,
      explanation:
        'A loaded 3,000 kg forklift at 8 km/h requires 3.5–4.5 meters to stop on dry concrete. This exceeds average human reaction distance (~2 m), which is why pedestrian exclusion zones and stop-and-check protocols are mandatory.',
    },
    {
      id: 'fk-a3',
      category: 'Standard Procedure',
      difficulty: 'medium',
      question: 'What is the correct pedestrian behavior mandated by OSHA 1910.178 when approaching any warehouse intersection?',
      options: [
        'Maintain walking pace while actively scanning for forklift lights and reflective markings',
        'Come to a complete stop 1 meter before the intersection line, visually clear both directions, make eye contact with any operators, then proceed',
        'Sound a verbal warning ("Passing!") and proceed at reduced walking speed',
        'Check your phone or radio for forklift traffic status updates before crossing',
      ],
      correctIndex: 1,
      explanation:
        'The Stop-Look-Proceed protocol is non-negotiable at forklift intersections. Full stop, two-direction visual sweep, and confirmed operator eye contact are all required before stepping into any vehicle aisle. Speed reduction alone is insufficient.',
    },
  ],

  'industrial-fire-005': [
    {
      id: 'fi-a1',
      category: 'Fire Classification',
      difficulty: 'medium',
      question: 'The fire in the video originated in a paint solvent storage area. What fire class does this represent and which suppression agent is correct?',
      options: [
        'Class A (ordinary combustibles) — requires pressurized water sprinkler activation',
        'Class B (flammable liquids) — requires CO₂ or dry chemical powder, NOT water',
        'Class C (electrical) — requires halon or clean-agent system activation',
        'Class D (combustible metals) — requires dry sand or specialized Class D extinguisher',
      ],
      correctIndex: 1,
      explanation:
        'Flammable paint solvents (toluene, xylene, acetone) are Class B fuels. Water application causes violent steam explosion and solvent splatter, spreading fire across a wider area. NFPA 10 mandates CO₂ or dry chemical for Class B industrial fires.',
    },
    {
      id: 'fi-a2',
      category: 'Emergency Response',
      difficulty: 'hard',
      question: 'During the fire incident, what is the correct RACE protocol sequence that was violated?',
      options: [
        'Rescue → Attack → Contain → Evacuate — the worker skipped Attack and went directly to Evacuate',
        'Rescue anyone in immediate danger → Alert/Alarm → Contain the fire → Evacuate — the worker skipped Alert and attempted suppression without alarming others',
        'Report → Assemble → Control → Evacuate — the worker attempted to control without reporting first',
        'Rescue → Assess → Contain → Extinguish — the worker only partially completed Contain before evacuating',
      ],
      correctIndex: 1,
      explanation:
        'RACE: Rescue (anyone in immediate danger), Alert (pull manual alarm, notify fire department), Contain (close fire doors to slow spread), Evacuate. The worker bypassed "Alert", leaving other workers uninformed, and attempted improper water suppression on a Class B fire.',
    },
    {
      id: 'fi-a3',
      category: 'Explosion Risk',
      difficulty: 'hard',
      question: 'At what concentration range do paint solvent vapors become explosively flammable in air?',
      options: [
        'Only above 50% concentration — industrial ventilation normally prevents this level',
        'Between 1% and 7% vapor concentration (LEL to UEL) — easily reached in poorly ventilated storage areas',
        'Only when ignition sources exceed 800°C surface temperature',
        'Concentrations above 25% are required — standard HVAC systems prevent this',
      ],
      correctIndex: 1,
      explanation:
        'Most paint solvents (toluene LEL 1.1%, UEL 7.1%) become explosive between just 1–7% air concentration — achievable rapidly in enclosed storage. A single static spark or electrical arc is sufficient to trigger detonation within this range.',
    },
  ],

  'construction-fall-006': [
    {
      id: 'cf-a1',
      category: 'Fall Protection',
      difficulty: 'medium',
      question: 'At what height above a lower level does OSHA 1926.502 mandate 100% fall protection for construction workers?',
      options: [
        '10 feet (3 meters) — only when working near open floor holes',
        '6 feet (1.8 meters) — for all construction activities near unprotected edges',
        '15 feet (4.5 meters) — only applicable to structural steel erection',
        '4 feet (1.2 meters) — but only when working on scaffolding without guardrails',
      ],
      correctIndex: 1,
      explanation:
        'OSHA 1926.502(d) is absolute: 100% fall protection is mandatory above 6 feet in construction. At 50 meters, the fall in this scenario was unsurvivable. The 6-foot threshold covers all construction activities — no exceptions for "quick tasks".',
    },
    {
      id: 'cf-a2',
      category: 'Equipment Standards',
      difficulty: 'hard',
      question: 'What is "100% continuous tie-off" and how is it correctly achieved on elevated steel structures?',
      options: [
        'Wearing a full-body harness at all times, even when not near an edge',
        'Using dual self-retracting lanyards in a "leapfrog" method so one is always attached while the other is moved to the next anchor point',
        'Tying off the lanyard once at the start of the shift to a single certified anchor point',
        'Attaching to a horizontal lifeline that spans the entire work area',
      ],
      correctIndex: 1,
      explanation:
        'Continuous tie-off means zero moments without fall protection. The dual-lanyard leapfrog technique: lanyard A clipped, advance to new position, clip lanyard B, then release lanyard A. In the video, the worker disconnected both simultaneously — creating a 100% unprotected window at 50 meters.',
    },
    {
      id: 'cf-a3',
      category: 'Risk Assessment',
      difficulty: 'medium',
      question: 'On a 50-meter elevated steel girder walk, what primary environmental factor most increases fall risk beyond the height itself?',
      options: [
        'Noise from construction equipment affecting worker concentration',
        'Narrow beam width combined with surface contamination (dew, dust) dramatically reducing friction and foot stability',
        'Lack of guardrails on the surrounding ground level below',
        'Insufficient PPE (hard hat, hi-vis) limiting peripheral vision',
      ],
      correctIndex: 1,
      explanation:
        'Steel girder surfaces (often 200–300mm wide) with any moisture or debris reduce friction coefficient by 40–60%. Combined with balance requirements at height, this creates a fall risk multiplier. Surface inspection and anti-slip footwear (ASTM F2413 rated) are mandatory before any elevated girder walk.',
    },
  ],
}

export function getAgenticQuestions(scenario: Scenario): AgenticQuestion[] {
  if (AGENTIC_QUESTIONS_MAP[scenario.id]) {
    return AGENTIC_QUESTIONS_MAP[scenario.id]
  }
  if (scenario.category === 'fire_safety') {
    return AGENTIC_QUESTIONS_MAP['industrial-fire-005']
  }
  if (scenario.category === 'construction_safety') {
    return AGENTIC_QUESTIONS_MAP['construction-fall-006']
  }
  // Fallback to forklift questions for warehouse/other categories
  return AGENTIC_QUESTIONS_MAP['forklift-blind-corner-001']
}


