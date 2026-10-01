export const BRAND = '#f59e0b'

export type Phase = 'normal' | 'warning' | 'detected'
export type ScenarioId = 'fall' | 'dropped-load' | 'machinery'

export interface SimClock {
  /** Seconds since the current scenario started. */
  t: number
}

export interface ScenarioMeta {
  id: ScenarioId
  label: string
  duration: number
  warningAt: number
  detectedAt: number
  status: Record<Phase, string>
  available: boolean
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'fall',
    label: 'Fall from height',
    duration: 12,
    warningAt: 3.5,
    detectedAt: 6.4,
    status: {
      normal: 'Monitoring · Scaffold level 2',
      warning: 'Missing guardrail · Open edge at 4.0 m',
      detected: 'Fall risk · Worker near unprotected edge',
    },
    available: true,
  },
  {
    id: 'dropped-load',
    label: 'Dropped load',
    duration: 12,
    warningAt: 4,
    detectedAt: 7,
    status: { normal: '', warning: '', detected: '' },
    available: false,
  },
  {
    id: 'machinery',
    label: 'Machinery zone',
    duration: 12,
    warningAt: 4,
    detectedAt: 7,
    status: { normal: '', warning: '', detected: '' },
    available: false,
  },
]

export function phaseAt(s: ScenarioMeta, t: number): Phase {
  if (t >= s.detectedAt) return 'detected'
  if (t >= s.warningAt) return 'warning'
  return 'normal'
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

export function smooth(v: number) {
  const u = clamp01(v)
  return u * u * (3 - 2 * u)
}
