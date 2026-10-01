'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { ImmersiveVideoTrack, TimelineCue, TimelineState, SeverityLevel } from '@/types'
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2,
  AlertTriangle, CheckCircle, Eye, ChevronRight, Film, Zap, Clock,
  Globe, MonitorPlay, Headset, Compass, Layers
} from 'lucide-react'
import { Equirectangular360Viewer } from './Equirectangular360Viewer'

interface Props {
  track: ImmersiveVideoTrack
  onComplete: (results: TimelineState['cueResults']) => void
  /** Optional: show a loading overlay while buffering */
  autoPlay?: boolean
}

// ─── Colour helpers keyed on ClumsAI semantics ──────────────────────────
const CUE_COLORS: Record<NonNullable<SeverityLevel | 'default'>, { border: string; bg: string; accent: string; label: string }> = {
  critical: { border: 'rgba(239,68,68,0.6)',  bg: 'rgba(127,29,29,0.85)',  accent: '#ef4444', label: 'CRITICAL HAZARD' },
  high:     { border: 'rgba(239,68,68,0.4)',  bg: 'rgba(30,10,10,0.9)',    accent: '#f87171', label: 'HIGH RISK'       },
  medium:   { border: 'rgba(245,158,11,0.5)', bg: 'rgba(30,20,0,0.9)',     accent: '#f59e0b', label: 'DECISION POINT'  },
  low:      { border: 'rgba(34,197,94,0.4)',  bg: 'rgba(0,30,10,0.9)',     accent: '#10b981', label: 'OBSERVATION'     },
  default:  { border: 'rgba(56,189,248,0.4)', bg: 'rgba(0,20,40,0.9)',     accent: '#38bdf8', label: 'AI QUESTION'     },
}

function getCueColors(cue: TimelineCue) {
  return CUE_COLORS[cue.severity ?? 'default'] ?? CUE_COLORS.default
}

// SIVS §41 — Learning stage labels
const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  recognize: { label: 'RECOGNIZE', color: '#38bdf8' },
  decide:    { label: 'DECISION POINT', color: '#f59e0b' },
  reflect:   { label: 'REFLECT', color: '#a855f7' },
}

// ─── Sub-component: Decision Overlay ─────────────────────────────────────────
interface DecisionOverlayProps {
  cue: TimelineCue
  onAnswer: (selectedIndex: number) => void
  answered: { selectedIndex: number; correct: boolean } | null
  onResume: () => void
  elapsedMs: number
}

function DecisionOverlay({ cue, onAnswer, answered, onResume, elapsedMs }: DecisionOverlayProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const c = getCueColors(cue)
  const hasOptions = (cue.options?.length ?? 0) > 0
  const stageInfo = cue.stage ? STAGE_LABELS[cue.stage] : null

  const handleSubmit = () => {
    if (selected === null) return
    onAnswer(selected)
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 20,
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 560, width: '100%',
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: `0 0 40px ${c.border}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            padding: '3px 10px', borderRadius: 999,
            background: c.accent, color: '#000',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
          }}>
            {c.label}
          </div>
          {/* SIVS §41 learning stage badge */}
          {stageInfo && (
            <div style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${stageInfo.color}40`,
              fontSize: 10, fontWeight: 700,
              color: stageInfo.color, letterSpacing: '0.06em',
            }}>
              {stageInfo.label}
            </div>
          )}
          {cue.type === 'question' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>
              <Clock size={11} />
              {Math.round(elapsedMs / 1000)}s
            </div>
          )}
        </div>

        {/* Prompt */}
        <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 20, color: '#fff' }}>
          {cue.prompt}
        </p>

        {/* Options */}
        {hasOptions && !answered && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {cue.options!.map((opt, i) => {
              const isSelected = selected === i
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    background: isSelected ? `rgba(${c.accent === '#38bdf8' ? '56,189,248' : c.accent === '#f59e0b' ? '245,158,11' : '239,68,68'},0.2)` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? c.accent : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, padding: '12px 14px',
                    textAlign: 'left', cursor: 'pointer',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.15s', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: 0.6, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Answered state */}
        {answered && hasOptions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {cue.options!.map((opt, i) => {
              const isCorrect = i === cue.correctOptionIndex
              const isUserPick = i === answered.selectedIndex
              let bg = 'rgba(255,255,255,0.04)'
              let border = 'rgba(255,255,255,0.08)'
              let color = 'rgba(255,255,255,0.5)'
              if (isCorrect) { bg = 'rgba(16,185,129,0.18)'; border = 'rgba(16,185,129,0.5)'; color = '#10b981' }
              else if (isUserPick && !answered.correct) { bg = 'rgba(239,68,68,0.18)'; border = 'rgba(239,68,68,0.5)'; color = '#ef4444' }
              return (
                <div key={i} style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 8, padding: '12px 14px',
                  color, fontSize: 13, fontWeight: isCorrect || isUserPick ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: 0.6, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {isCorrect && <CheckCircle size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {isUserPick && !answered.correct && <AlertTriangle size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </div>
              )
            })}
          </div>
        )}

        {/* Explanation */}
        {answered && cue.explanation && (
          <div style={{
            padding: '12px 16px',
            background: answered.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${answered.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 8, marginBottom: 16,
            fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 700, color: answered.correct ? '#10b981' : '#ef4444' }}>
              {answered.correct ? '✓ Correct: ' : '✗ Incorrect: '}
            </span>
            {cue.explanation}
          </div>
        )}

        {/* Non-question cue (observation / warning) */}
        {!hasOptions && !answered && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, marginBottom: 16,
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
          }}>
            {cue.explanation ?? 'Observe and continue.'}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {!answered && hasOptions && (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 8,
                background: selected !== null ? c.accent : 'rgba(255,255,255,0.1)',
                color: selected !== null ? '#000' : 'rgba(255,255,255,0.3)',
                fontWeight: 700, fontSize: 13, border: 'none', cursor: selected !== null ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              <Zap size={14} /> Submit Decision
            </button>
          )}
          {(answered || !hasOptions) && (
            <button
              onClick={onResume}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 8,
                background: '#38bdf8', color: '#000',
                fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              }}
            >
              Resume Video <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ImmersiveVideoPlayer({ track, onComplete, autoPlay = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(0)

  const [timelineState, setTimelineState] = useState<TimelineState>({
    phase: 'idle',
    currentTime: 0,
    activeCue: null,
    answeredCueIds: [],
    cueResults: {},
  })
  const [viewMode, setViewMode] = useState<'360' | 'flat'>(track.is360 ? '360' : 'flat')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [simulatedTime, setSimulatedTime] = useState(0)

  const isNegative = track.caseType === 'negative'
  const accentColor = isNegative ? '#ef4444' : '#10b981'
  const sivs = track.sivsMetadata

  // ── Cue trigger logic ─────────────────────────────────────────────────────
  const checkCues = useCallback((currentTimeSec: number) => {
    setTimelineState(prev => {
      if (prev.phase === 'cue_active') return prev
      const pendingCue = track.cues.find(c =>
        !prev.answeredCueIds.includes(c.id) &&
        currentTimeSec >= c.atSeconds &&
        currentTimeSec < c.atSeconds + 2
      )
      if (!pendingCue) return prev
      // Pause video
      videoRef.current?.pause()
      setPlaying(false)
      startTimeRef.current = Date.now()
      return {
        ...prev,
        phase: 'cue_active',
        activeCue: pendingCue,
      }
    })
  }, [track.cues])

  // ── Video event handlers ──────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    const t = v.currentTime
    setProgress(v.duration ? (t / v.duration) * 100 : 0)
    setTimelineState(prev => ({ ...prev, currentTime: t }))
    checkCues(t)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const handleEnded = () => {
    setPlaying(false)
    setTimelineState(prev => ({ ...prev, phase: 'completed' }))
  }

  const handleError = () => {
    setVideoError(true)
    setTimelineState(prev => ({ ...prev, phase: 'playing' }))
  }

  // ── Simulated timeline (when no real video) ───────────────────────────────
  useEffect(() => {
    if (!videoError) return
    if (timelineState.phase === 'cue_active' || timelineState.phase === 'completed') return
    if (!playing) return

    const interval = setInterval(() => {
      setSimulatedTime(prev => {
        const next = prev + 0.5
        checkCues(next)
        if (next >= 60) {
          clearInterval(interval)
          setPlaying(false)
          setTimelineState(s => ({ ...s, phase: 'completed' }))
        }
        setProgress((next / 60) * 100)
        return next
      })
    }, 500)
    return () => clearInterval(interval)
  }, [videoError, playing, timelineState.phase, checkCues])

  // ── Fullscreen handler ────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!fullscreen) containerRef.current.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (timelineState.phase === 'cue_active') return
    if (!videoError) {
      if (!v) return
      if (v.paused) { v.play().catch(() => setVideoError(true)); setPlaying(true) }
      else { v.pause(); setPlaying(false) }
    } else {
      setPlaying(p => !p)
    }
    if (timelineState.phase === 'idle') {
      setTimelineState(s => ({ ...s, phase: 'playing' }))
    }
  }

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleAnswer = (selectedIndex: number) => {
    const cue = timelineState.activeCue
    if (!cue) return
    const correct = selectedIndex === cue.correctOptionIndex
    setTimelineState(prev => ({
      ...prev,
      cueResults: {
        ...prev.cueResults,
        [cue.id]: { selectedIndex, correct },
      },
    }))
  }

  // ── Resume after cue ──────────────────────────────────────────────────────
  const handleResume = () => {
    const cue = timelineState.activeCue
    if (!cue) return
    setTimelineState(prev => ({
      ...prev,
      phase: 'playing',
      activeCue: null,
      answeredCueIds: [...prev.answeredCueIds, cue.id],
    }))
    if (!videoError) {
      videoRef.current?.play().catch(() => {})
      setPlaying(true)
    } else {
      setPlaying(true)
    }
  }

  // ── Seek ──────────────────────────────────────────────────────────────────
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * v.duration
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const allCuesAnswered = track.cues.length === 0 ||
    track.cues.every(c => timelineState.answeredCueIds.includes(c.id))
  const isComplete = timelineState.phase === 'completed'
  const currentDisplayTime = videoError ? simulatedTime : timelineState.currentTime
  const currentDuration = videoError ? 60 : duration

  return (
    <div ref={containerRef} style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', border: `2px solid ${isNegative ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}` }}>

      {/* ── SIVS Top Metadata Bar ── */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        zIndex: 15,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* SIVS Version Tag */}
          <div style={{
            padding: '2px 8px', borderRadius: 4,
            background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)',
            fontSize: 10, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em',
          }}>
            SIVS v1.0
          </div>

          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{track.label}</span>

          {/* Projection badge */}
          <span style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 4,
            background: track.is360 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
            color: track.is360 ? '#10b981' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${track.is360 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            fontWeight: 600,
          }}>
            {track.is360 ? '360° Equirectangular' : 'Flat 2D'}
          </span>

          {sivs?.resolution && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
              {sivs.resolution}
            </span>
          )}

          {sivs?.webXRCompatible && (
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(168,85,247,0.15)', color: '#c084fc',
              border: '1px solid rgba(168,85,247,0.3)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Headset size={10} /> WebXR Ready
            </span>
          )}
        </div>

        {/* View Mode Switcher */}
        {track.is360 && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: 2 }}>
            <button
              onClick={() => setViewMode('360')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 4,
                background: viewMode === '360' ? '#38bdf8' : 'transparent',
                color: viewMode === '360' ? '#000' : 'rgba(255,255,255,0.6)',
                border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Globe size={11} /> 360° Sphere
            </button>
            <button
              onClick={() => setViewMode('flat')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 4,
                background: viewMode === 'flat' ? '#38bdf8' : 'transparent',
                color: viewMode === 'flat' ? '#000' : 'rgba(255,255,255,0.6)',
                border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <MonitorPlay size={11} /> Flat View
            </button>
          </div>
        )}
      </div>

      {/* ── Main Display Viewport ── */}
      <div style={{ position: 'relative', width: '100%', minHeight: fullscreen ? 'calc(100vh - 90px)' : 440 }}>
        {/* Hidden / Underlying Video tag for texture binding & audio */}
        <video
          ref={videoRef}
          src={track.url ?? undefined}
          style={{
            width: '100%',
            display: viewMode === 'flat' && !videoError ? 'block' : 'none',
            maxHeight: fullscreen ? 'calc(100vh - 90px)' : 480,
            objectFit: 'cover',
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          onPlay={() => { setPlaying(true); setTimelineState(s => ({ ...s, phase: s.phase === 'idle' ? 'playing' : s.phase })) }}
          onPause={() => setPlaying(false)}
          playsInline
          autoPlay={autoPlay}
        />

        {/* 360 Mode View */}
        {viewMode === '360' && (
          <div style={{ width: '100%', height: fullscreen ? 'calc(100vh - 90px)' : 440, position: 'relative' }}>
            <Equirectangular360Viewer
              videoElement={!videoError ? videoRef.current : null}
              spatialZones={track.spatialZones}
              isNegative={isNegative}
            />
          </div>
        )}

        {/* Flat Mode Fallback Display */}
        {viewMode === 'flat' && videoError && (
          <div style={{ height: fullscreen ? 'calc(100vh - 90px)' : 440, background: 'radial-gradient(ellipse at center, #0f172a 0%, #000 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--sg-bg-elevated)', border: '1px solid var(--sg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
              <Film size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>
                {isNegative ? 'Incident Recreation' : 'Safe Response Demonstration'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 360, lineHeight: 1.6 }}>
                SIVS-compliant {isNegative ? '360° incident' : 'safe procedure'} scenario. Switch to 360° Sphere or click Play to run the interactive timeline cues.
              </div>
            </div>
            {/* Cue preview pills */}
            {track.cues.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {track.cues.map(c => (
                  <div key={c.id} style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: timelineState.answeredCueIds.includes(c.id) ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)',
                    border: `1px solid ${timelineState.answeredCueIds.includes(c.id) ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.3)'}`,
                    fontSize: 11, color: timelineState.answeredCueIds.includes(c.id) ? '#10b981' : '#f59e0b',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {timelineState.answeredCueIds.includes(c.id) ? <CheckCircle size={10} /> : <Eye size={10} />}
                    @{c.atSeconds}s · {c.type}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Play overlay (idle state) ── */}
        {!playing && timelineState.phase === 'idle' && (
          <div
            onClick={togglePlay}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.45)', zIndex: 10 }}
          >
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${accentColor}60` }}>
              <Play size={28} fill="#000" color="#000" />
            </div>
          </div>
        )}

        {/* ── Decision Overlay ── */}
        {timelineState.phase === 'cue_active' && timelineState.activeCue && (
          <DecisionOverlay
            cue={timelineState.activeCue}
            onAnswer={handleAnswer}
            answered={timelineState.cueResults[timelineState.activeCue.id] ?? null}
            onResume={handleResume}
            elapsedMs={Date.now() - startTimeRef.current}
          />
        )}

        {/* ── Completion overlay ── */}
        {isComplete && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 20, gap: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: isNegative ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', border: `2px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isNegative ? <AlertTriangle size={28} color={accentColor} /> : <CheckCircle size={28} color={accentColor} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 6 }}>Video Complete</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {allCuesAnswered ? `${track.cues.length} decision point${track.cues.length !== 1 ? 's' : ''} reviewed` : 'Continue to next phase'}
              </div>
            </div>
            <button
              onClick={() => onComplete(timelineState.cueResults)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, background: accentColor, color: '#000', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Controls Bar ── */}
      <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4, display: 'flex' }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Progress / seek */}
        <div style={{ flex: 1, position: 'relative', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: 'pointer' }} onClick={handleSeek}>
          {/* Cue markers */}
          {currentDuration > 0 && track.cues.map(c => (
            <div key={c.id} style={{
              position: 'absolute', top: -3, bottom: -3,
              left: `${(c.atSeconds / currentDuration) * 100}%`,
              width: 2, borderRadius: 1,
              background: timelineState.answeredCueIds.includes(c.id) ? '#10b981' : '#f59e0b',
            }} />
          ))}
          <div style={{ width: `${progress}%`, height: '100%', background: accentColor, borderRadius: 2, transition: 'width 0.1s' }} />
        </div>

        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', flexShrink: 0 }}>
          {formatTime(currentDisplayTime)} / {currentDuration > 0 ? formatTime(currentDuration) : '?:??'}
        </span>

        <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(!muted) } else setMuted(m => !m) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex' }}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = 0; setProgress(0) } setSimulatedTime(0); setPlaying(false); setTimelineState(s => ({ ...s, phase: 'idle', answeredCueIds: [], cueResults: {}, activeCue: null })) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex' }}>
          <RotateCcw size={14} />
        </button>
        <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex' }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  )
}
