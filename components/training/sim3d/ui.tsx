'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Footprints,
  Lightbulb,
  MousePointer2,
  Navigation,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'

// ─── Shared drill content types ──────────────────────────────────────────────

export type Verdict = 'correct' | 'unsafe' | 'risky'

export interface Explanation {
  title: string
  /** What the trainee just saw happen */
  happened: string
  /** The physical / human reason behind it */
  why: string
  /** Rule text and its citation */
  rule: string
  ruleRef: string
  takeaway: string
}

export interface DecisionOption {
  id: string
  label: string
  detail: string
  verdict: Verdict
  outcome: Explanation
}

export interface Decision {
  id: string
  /** Short tag e.g. "Contain" */
  tag: string
  title: string
  situation: string
  cues: string[]
  question: string
  options: DecisionOption[]
}

export interface HazardIntel {
  id: string
  name: string
  severity: 'critical' | 'high' | 'medium'
  whatsWrong: string
  risk: string
  control: string
  ref: string
}

export interface StepDef {
  id: string
  label: string
}

export interface StepResult {
  attempts: number
  done: boolean
}

// ─── Design tokens (fixed: the sim is always dark, whatever the app theme) ───

const C = {
  glass: 'rgba(12, 17, 28, 0.82)',
  glassBorder: 'rgba(255,255,255,0.10)',
  text: '#f8fafc',
  sub: '#cbd5e1',
  muted: '#94a3b8',
  accent: '#f97316',
  accentDeep: '#ea580c',
  safe: '#22c55e',
  danger: '#ef4444',
  warn: '#f59e0b',
  card: '#ffffff',
  cardText: '#0f172a',
  cardSub: '#475569',
  cardMuted: '#64748b',
  cardBorder: '#e2e8f0',
}

const VERDICT = {
  correct: { color: '#16a34a', soft: '#f0fdf4', border: '#bbf7d0', label: 'Correct call', Icon: ShieldCheck },
  risky: { color: '#d97706', soft: '#fffbeb', border: '#fde68a', label: 'Risky choice', Icon: AlertTriangle },
  unsafe: { color: '#dc2626', soft: '#fef2f2', border: '#fecaca', label: 'Unsafe choice', Icon: AlertOctagon },
} as const

const SEVERITY = {
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
  high: { color: '#ea580c', bg: '#fff7ed', label: 'High' },
  medium: { color: '#d97706', bg: '#fffbeb', label: 'Medium' },
} as const

const font = 'Inter, ui-sans-serif, system-ui, sans-serif'

const glassPanel: React.CSSProperties = {
  background: C.glass,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 14,
  color: C.text,
  fontFamily: font,
  boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
}

const cardBase: React.CSSProperties = {
  background: C.card,
  color: C.cardText,
  borderRadius: 20,
  fontFamily: font,
  boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
  width: 'min(560px, calc(100vw - 32px))',
  maxHeight: 'calc(100vh - 120px)',
  overflowY: 'auto',
}

// ─── Backdrop + card shell ───────────────────────────────────────────────────

function Modal({ children, dim = 0.45, align = 'center' }: { children: ReactNode; dim?: number; align?: 'center' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: `radial-gradient(ellipse at center, rgba(2,6,23,${dim * 0.6}) 0%, rgba(2,6,23,${dim}) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-end',
        padding: align === 'center' ? 16 : '76px 20px 20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function Eyebrow({ children, color = C.accentDeep, bg = '#fff7ed' }: { children: ReactNode; color?: string; bg?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}

function PrimaryButton({ children, onClick, color = C.accent, autoFocus }: { children: ReactNode; onClick: () => void; color?: string; autoFocus?: boolean }) {
  return (
    <button
      autoFocus={autoFocus}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '13px 18px',
        borderRadius: 999,
        border: 'none',
        background: color === C.accent ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})` : color,
        color: '#fff',
        fontSize: 14,
        fontWeight: 800,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 6px 18px rgba(249,115,22,0.3)',
        fontFamily: font,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 18px',
        borderRadius: 999,
        border: `1px solid ${C.cardBorder}`,
        background: '#f8fafc',
        color: '#334155',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: font,
      }}
    >
      {children}
    </button>
  )
}

// ─── Briefing ────────────────────────────────────────────────────────────────

export function BriefingCard({
  eyebrow,
  title,
  role,
  situation,
  objectives,
  controls,
  onBegin,
}: {
  eyebrow: string
  title: string
  role: string
  situation: string
  objectives: string[]
  controls: [string, string][]
  onBegin: () => void
}) {
  return (
    <Modal dim={0.55}>
      <div style={{ ...cardBase, padding: '26px 28px 22px' }}>
        <Eyebrow>
          <CircleDot size={12} /> {eyebrow}
        </Eyebrow>
        <h2 style={{ margin: '12px 0 4px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em' }}>{title}</h2>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.accentDeep, marginBottom: 10 }}>{role}</div>
        <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.6, color: C.cardSub }}>{situation}</p>

        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: C.cardMuted, textTransform: 'uppercase', marginBottom: 8 }}>
          Your objectives
        </div>
        <ol style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {objectives.map((o, i) => (
            <li key={o} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: '#fff7ed',
                  color: C.accentDeep,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              {o}
            </li>
          ))}
        </ol>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 12px',
            background: '#f8fafc',
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            marginBottom: 18,
          }}
        >
          {controls.map(([k, d]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.cardSub }}>
              <kbd
                style={{
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: '#fff',
                  border: `1px solid ${C.cardBorder}`,
                  borderBottomWidth: 2,
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.cardText,
                }}
              >
                {k}
              </kbd>
              {d}
            </span>
          ))}
        </div>

        <PrimaryButton onClick={onBegin} autoFocus>
          Begin simulation <ChevronRight size={16} />
        </PrimaryButton>
      </div>
    </Modal>
  )
}

// ─── Hazard intel ────────────────────────────────────────────────────────────

export function HazardCard({ hazard, onAcknowledge, cta = 'Got it — decide next step' }: { hazard: HazardIntel; onAcknowledge: () => void; cta?: string }) {
  const sev = SEVERITY[hazard.severity]
  return (
    <Modal dim={0.3}>
      <div style={{ ...cardBase, width: 'min(500px, calc(100vw - 32px))', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 14px', background: `linear-gradient(135deg, ${sev.bg}, #ffffff)`, borderBottom: `1px solid ${C.cardBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Eyebrow color={sev.color} bg="#ffffff">
              <ShieldAlert size={12} /> Hazard identified
            </Eyebrow>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: sev.color, padding: '3px 9px', borderRadius: 999 }}>
              {sev.label} risk
            </span>
          </div>
          <h3 style={{ margin: '10px 0 0', fontSize: 19, fontWeight: 900 }}>{hazard.name}</h3>
        </div>
        <div style={{ padding: '16px 24px 20px', display: 'grid', gap: 12 }}>
          <InfoRow icon={<AlertTriangle size={15} color={sev.color} />} label="What's wrong" text={hazard.whatsWrong} />
          <InfoRow icon={<AlertOctagon size={15} color={C.danger} />} label="What could happen" text={hazard.risk} />
          <InfoRow icon={<ShieldCheck size={15} color="#16a34a" />} label="How it's controlled" text={hazard.control} />
          <div style={{ fontSize: 11, color: C.cardMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={12} /> {hazard.ref}
          </div>
          <PrimaryButton onClick={onAcknowledge} autoFocus>
            {cta} <ChevronRight size={16} />
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

function InfoRow({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: C.cardMuted, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#334155' }}>{text}</div>
      </div>
    </div>
  )
}

// ─── Decision ────────────────────────────────────────────────────────────────

export function DecisionCard({
  decision,
  index,
  total,
  onChoose,
}: {
  decision: Decision
  index: number
  total: number
  onChoose: (option: DecisionOption) => void
}) {
  const [hover, setHover] = useState<string | null>(null)
  const chosen = useRef(false)

  const choose = useCallback(
    (o: DecisionOption) => {
      if (chosen.current) return
      chosen.current = true
      onChoose(o)
    },
    [onChoose]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= decision.options.length) choose(decision.options[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decision, choose])

  return (
    <Modal dim={0.4}>
      <div style={{ ...cardBase, padding: '22px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <Eyebrow>
            <ShieldAlert size={12} /> Decision {index} of {total} · {decision.tag}
          </Eyebrow>
          <span style={{ fontSize: 11, color: C.cardMuted, fontWeight: 600 }}>Press 1–{decision.options.length}</span>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 900, lineHeight: 1.3 }}>{decision.title}</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.6, color: C.cardSub }}>{decision.situation}</p>

        {decision.cues.length > 0 && (
          <div style={{ display: 'grid', gap: 5, padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${C.cardBorder}`, marginBottom: 14 }}>
            {decision.cues.map((c) => (
              <div key={c} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                <span style={{ color: C.accent, fontWeight: 900 }}>›</span>
                {c}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{decision.question}</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {decision.options.map((o, i) => {
            const isHover = hover === o.id
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                onMouseEnter={() => setHover(o.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: `1.5px solid ${isHover ? C.accent : C.cardBorder}`,
                  background: isHover ? '#fff7ed' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: isHover ? 'translateY(-1px)' : 'none',
                  fontFamily: font,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: isHover ? C.accent : '#f1f5f9',
                    color: isHover ? '#fff' : '#334155',
                    fontWeight: 900,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {i + 1}
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: C.cardText, marginBottom: 2 }}>{o.label}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: C.cardSub, lineHeight: 1.45 }}>{o.detail}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

// ─── Explanation after a decision plays out ─────────────────────────────────

export function ExplanationCard({
  verdict,
  explanation,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  verdict: Verdict
  explanation: Explanation
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}) {
  const v = VERDICT[verdict]
  return (
    <Modal dim={0.5}>
      <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', background: v.soft, borderBottom: `1px solid ${v.border}`, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: '#fff',
              border: `1.5px solid ${v.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <v.Icon size={24} color={v.color} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: v.color }}>{v.label}</div>
            <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, lineHeight: 1.3 }}>{explanation.title}</h3>
          </div>
        </div>
        <div style={{ padding: '16px 24px 20px', display: 'grid', gap: 12 }}>
          <InfoRow icon={<Footprints size={15} color={C.cardMuted} />} label="What happened" text={explanation.happened} />
          <InfoRow icon={<Lightbulb size={15} color="#d97706" />} label="Why it matters" text={explanation.why} />
          <div style={{ padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${C.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: C.cardMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              <BookOpen size={12} /> The standard · {explanation.ruleRef}
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{explanation.rule}</div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: 12,
              background: verdict === 'correct' ? '#f0fdf4' : '#fff7ed',
              border: `1px solid ${verdict === 'correct' ? '#bbf7d0' : '#fed7aa'}`,
              fontSize: 13,
              fontWeight: 700,
              color: verdict === 'correct' ? '#166534' : '#9a3412',
              lineHeight: 1.45,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            {explanation.takeaway}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
            {secondaryLabel && onSecondary && <SecondaryButton onClick={onSecondary}>{secondaryLabel}</SecondaryButton>}
            <PrimaryButton onClick={onPrimary} autoFocus>
              {verdict === 'correct' ? null : <RotateCcw size={15} />}
              {primaryLabel}
              {verdict === 'correct' ? <ChevronRight size={16} /> : null}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Debrief ─────────────────────────────────────────────────────────────────

export function DebriefCard({
  title,
  summary,
  steps,
  results,
  hazardsFound,
  totalHazards,
  onContinue,
  onReplay,
}: {
  title: string
  summary: string
  steps: StepDef[]
  results: Record<string, StepResult>
  hazardsFound: number
  totalHazards: number
  onContinue: () => void
  onReplay: () => void
}) {
  const firstTry = steps.filter((s) => results[s.id]?.attempts === 1).length
  const allClean = firstTry === steps.length
  return (
    <Modal dim={0.55}>
      <div style={{ ...cardBase, padding: '24px 26px 22px' }}>
        <Eyebrow color={allClean ? '#16a34a' : C.accentDeep} bg={allClean ? '#f0fdf4' : '#fff7ed'}>
          <ShieldCheck size={12} /> Drill complete
        </Eyebrow>
        <h2 style={{ margin: '12px 0 6px', fontSize: 21, fontWeight: 900 }}>{title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.6, color: C.cardSub }}>{summary}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
          <Stat label="Correct first time" value={`${firstTry} / ${steps.length}`} good={allClean} />
          <Stat label="Hazards identified" value={`${hazardsFound} / ${totalHazards}`} good={hazardsFound >= totalHazards} />
        </div>

        <div style={{ display: 'grid', gap: 6, marginBottom: 18 }}>
          {steps.map((s) => {
            const r = results[s.id]
            const clean = r?.attempts === 1
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  fontSize: 13,
                }}
              >
                {clean ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#d97706" />}
                <span style={{ flex: 1, fontWeight: 700 }}>{s.label}</span>
                <span style={{ fontSize: 12, color: clean ? '#16a34a' : '#b45309', fontWeight: 700 }}>
                  {clean ? 'First attempt' : `${r?.attempts ?? 0} attempts`}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SecondaryButton onClick={onReplay}>
            <RotateCcw size={14} /> Replay drill
          </SecondaryButton>
          <PrimaryButton onClick={onContinue} autoFocus>
            Watch correct procedure <ChevronRight size={16} />
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 12, background: good ? '#f0fdf4' : '#fff7ed', border: `1px solid ${good ? '#bbf7d0' : '#fed7aa'}` }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.cardMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: good ? '#166534' : '#9a3412' }}>{value}</div>
    </div>
  )
}

// ─── HUD: mission checklist ──────────────────────────────────────────────────

export function MissionPanel({
  title,
  steps,
  currentId,
  results,
  chips,
}: {
  title: string
  steps: StepDef[]
  currentId: string | null
  results: Record<string, StepResult>
  chips?: { label: string; value: string; tone: 'ok' | 'bad' | 'warn' | 'info' }[]
}) {
  const toneColor = { ok: C.safe, bad: C.danger, warn: C.warn, info: '#38bdf8' }
  return (
    <div className="sg-sim-mission" style={{ ...glassPanel, position: 'absolute', top: 76, left: 20, zIndex: 30, width: 248, padding: '12px 14px', pointerEvents: 'none' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {steps.map((s, i) => {
          const r = results[s.id]
          const done = r?.done
          const active = s.id === currentId
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: done || active ? 1 : 0.55 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 900,
                  background: done ? (r.attempts === 1 ? C.safe : C.warn) : active ? C.accent : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  boxShadow: active ? '0 0 0 3px rgba(249,115,22,0.3)' : 'none',
                }}
              >
                {done ? '✓' : i + 1}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: active ? 800 : 600, color: active ? C.text : C.sub }}>{s.label}</span>
            </div>
          )
        })}
      </div>
      {chips && chips.length > 0 && (
        <div style={{ display: 'grid', gap: 5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.glassBorder}` }}>
          {chips.map((c) => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span style={{ color: C.muted, fontWeight: 600 }}>{c.label}</span>
              <span style={{ color: toneColor[c.tone], fontWeight: 800 }}>{c.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── HUD: objective prompt (bottom centre) ───────────────────────────────────

export function ObjectivePrompt({
  text,
  sub,
  actionLabel,
  onAction,
  autoWalkLabel,
  onAutoWalk,
  tone = 'info',
}: {
  text: string
  sub?: string
  actionLabel?: string
  onAction?: () => void
  autoWalkLabel?: string
  onAutoWalk?: () => void
  tone?: 'info' | 'danger'
}) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        ...glassPanel,
        position: 'absolute',
        bottom: 64,
        left: '50%',
        x: '-50%',
        zIndex: 30,
        padding: '10px 12px 10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 'calc(100vw - 32px)',
        borderColor: tone === 'danger' ? 'rgba(239,68,68,0.5)' : C.glassBorder,
      }}
    >
      <Navigation size={18} color={tone === 'danger' ? C.danger : C.accent} style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.35 }}>{text}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      {onAutoWalk && autoWalkLabel && (
        <button
          onClick={onAutoWalk}
          style={{
            flexShrink: 0,
            padding: '7px 12px',
            borderRadius: 999,
            border: `1px solid ${C.glassBorder}`,
            background: 'rgba(255,255,255,0.06)',
            color: C.sub,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: font,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Footprints size={13} /> {autoWalkLabel}
        </button>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: font,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
          }}
        >
          {actionLabel}
          <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.22)', padding: '1px 5px', borderRadius: 4, fontFamily: font }}>E</kbd>
        </button>
      )}
    </motion.div>
  )
}

// ─── HUD: controls hint ──────────────────────────────────────────────────────

export function ControlsHint({ walk = true }: { walk?: boolean }) {
  return (
    <div className="sg-sim-hint" style={{ ...glassPanel, position: 'absolute', bottom: 22, left: 20, zIndex: 30, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11.5, color: C.sub, pointerEvents: 'none' }}>
      {walk && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <kbd style={kbdDark}>W A S D</kbd> walk
        </span>
      )}
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MousePointer2 size={13} color={C.accent} /> drag to look around
      </span>
    </div>
  )
}

const kbdDark: React.CSSProperties = {
  padding: '1px 6px',
  borderRadius: 5,
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: C.text,
  fontSize: 10.5,
  fontWeight: 800,
  fontFamily: font,
}

// ─── HUD: toolbar (top centre) ───────────────────────────────────────────────

export function SimToolbar({
  soundOn,
  onToggleSound,
  coachOpen,
  onToggleCoach,
}: {
  soundOn: boolean
  onToggleSound: () => void
  coachOpen?: boolean
  onToggleCoach?: () => void
}) {
  const btn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    border: 'none',
    background: active ? 'rgba(249,115,22,0.18)' : 'transparent',
    color: active ? '#fdba74' : C.sub,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: font,
  })
  return (
    <div style={{ ...glassPanel, position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 45, padding: 4, display: 'flex', gap: 2, borderRadius: 999 }}>
      <button onClick={onToggleSound} style={btn(!soundOn)} title={soundOn ? 'Mute' : 'Unmute'}>
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {soundOn ? 'Sound on' : 'Muted'}
      </button>
      {onToggleCoach && (
        <button onClick={onToggleCoach} style={btn(!!coachOpen)}>
          <Bot size={14} /> AI Coach
        </button>
      )}
    </div>
  )
}

// ─── Toasts ──────────────────────────────────────────────────────────────────

export interface Toast {
  id: number
  text: string
  tone: 'ok' | 'bad' | 'info' | 'warn'
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const push = useCallback((text: string, tone: Toast['tone'] = 'info', ms = 3800) => {
    const id = nextId.current++
    setToasts((t) => [...t.slice(-2), { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms)
  }, [])
  const clear = useCallback(() => setToasts([]), [])
  return { toasts, push, clear }
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  const tone = {
    ok: { c: C.safe, Icon: CheckCircle2 },
    bad: { c: C.danger, Icon: AlertOctagon },
    warn: { c: C.warn, Icon: AlertTriangle },
    info: { c: '#38bdf8', Icon: CircleDot },
  }
  return (
    <div style={{ position: 'absolute', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'grid', gap: 8, justifyItems: 'center', pointerEvents: 'none', width: 'min(520px, calc(100vw - 32px))' }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const { c, Icon } = tone[t.tone]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ ...glassPanel, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 700, borderColor: `${c}66` }}
            >
              <Icon size={16} color={c} style={{ flexShrink: 0 }} />
              {t.text}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ─── Screen effects ──────────────────────────────────────────────────────────

export function ScreenFX({
  slowmo,
  danger,
  flash,
  letterbox,
  blackout,
  caption,
}: {
  slowmo?: boolean
  danger?: boolean
  /** Increment to trigger a white/red flash */
  flash?: { key: number; color: string } | null
  letterbox?: boolean
  blackout?: number
  caption?: string | null
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 15,
          pointerEvents: 'none',
          transition: 'box-shadow 0.6s ease, background 0.6s ease',
          boxShadow: danger
            ? 'inset 0 0 160px 40px rgba(220,38,38,0.55)'
            : slowmo
              ? 'inset 0 0 140px 30px rgba(15,23,42,0.75)'
              : 'inset 0 0 120px 10px rgba(0,0,0,0.35)',
          background: slowmo ? 'rgba(30,41,59,0.12)' : 'transparent',
          backdropFilter: slowmo ? 'saturate(0.55)' : 'none',
        }}
      />
      {flash && (
        <motion.div
          key={flash.key}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: 'none', background: flash.color }}
        />
      )}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [i ? 'bottom' : 'top']: 0,
            height: letterbox ? '9vh' : 0,
            background: '#000',
            zIndex: 17,
            transition: 'height 0.6s cubic-bezier(.2,.8,.2,1)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 18,
          pointerEvents: 'none',
          background: '#000',
          opacity: blackout ?? 0,
          transition: 'opacity 0.8s ease',
        }}
      />
      <AnimatePresence>
        {caption && (
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: '12vh',
              left: '50%',
              x: '-50%',
              zIndex: 19,
              pointerEvents: 'none',
              color: '#fff',
              fontFamily: font,
              fontSize: 'clamp(15px, 2vw, 20px)',
              fontWeight: 800,
              textAlign: 'center',
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
              maxWidth: 'min(760px, calc(100vw - 32px))',
              lineHeight: 1.4,
            }}
          >
            {caption}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Hazard label floating in 3D (rendered via drei <Html>) ─────────────────

export function WorldTag({
  label,
  sub,
  tone = 'hazard',
  onClick,
}: {
  label: string
  sub?: string
  tone?: 'hazard' | 'target' | 'done'
  onClick?: () => void
}) {
  const color = tone === 'done' ? C.safe : tone === 'target' ? C.accent : C.danger
  return (
    <div
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 11px 6px 8px',
        borderRadius: 999,
        background: 'rgba(12,17,28,0.88)',
        border: `1.5px solid ${color}`,
        color: '#fff',
        fontFamily: font,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: `0 0 0 4px ${color}22, 0 8px 20px rgba(0,0,0,0.45)`,
        userSelect: 'none',
      }}
    >
      <span style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: color }} />
        {tone !== 'done' && (
          <span style={{ position: 'absolute', inset: -4, borderRadius: 999, border: `2px solid ${color}`, animation: 'sg-ripple 1.4s ease-out infinite' }} />
        )}
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>{label}</span>
        {sub && <span style={{ display: 'block', fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{sub}</span>}
      </span>
    </div>
  )
}

export { AnimatePresence }
