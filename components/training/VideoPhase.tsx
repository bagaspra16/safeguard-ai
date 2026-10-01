'use client'

import { useRef, useState, useEffect } from 'react'
import type { Scenario, VideoCase } from '@/types'
import { useSimulationStore } from '@/lib/simulation/store'
import { Play, Pause, Volume2, VolumeX, AlertTriangle, CheckCircle, RotateCcw, Film } from 'lucide-react'

interface Props {
  scenario: Scenario
  caseType: VideoCase
  onComplete: () => void
}

export function VideoPhase({ scenario, caseType, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ended, setEnded] = useState(false)
  const [error, setError] = useState(false)
  const addEvent = useSimulationStore((s) => s.addEvent)

  const videoUrl = caseType === 'negative' ? scenario.video.negative : scenario.video.positive

  const isNegative = caseType === 'negative'
  const isPaused = useSimulationStore((s) => s.isPaused)

  useEffect(() => {
    addEvent('video_started', undefined, { caseType })
  }, [caseType, addEvent])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isPaused) {
      v.pause()
    }
  }, [isPaused])

  const handlePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => setError(true))
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
  }

  const handleEnded = () => {
    setPlaying(false)
    setEnded(true)
    addEvent('video_completed', undefined, { caseType })
  }

  const handleError = () => {
    setError(true)
    // Still allow proceeding even if video fails
    setEnded(true)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    v.currentTime = ratio * v.duration
  }

  const handleReplay = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
    setPlaying(true)
    setEnded(false)
    setProgress(0)
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        flexShrink: 0,
        padding: '16px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        {isNegative ? (
          <>
            <div className="sg-negative-label">
              <AlertTriangle size={10} style={{ display: 'inline', marginRight: 4 }} />
              NEGATIVE CASE — UNSAFE BEHAVIOR
            </div>
            <span style={{ fontSize: 13, color: '#64748b' }}>Watch what goes wrong and identify the critical mistake</span>
          </>
        ) : (
          <>
            <div className="sg-positive-label">
              <CheckCircle size={10} style={{ display: 'inline', marginRight: 4 }} />
              POSITIVE CASE — CORRECT PROCEDURE
            </div>
            <span style={{ fontSize: 13, color: '#64748b' }}>The right way to handle this situation — every step matters</span>
          </>
        )}

        {/* Continue button pushed to the right */}
        <button
          className="sg-btn sg-btn-primary"
          onClick={onComplete}
          style={{ fontSize: 13, padding: '8px 22px', marginLeft: 'auto', flexShrink: 0 }}
        >
          {isNegative ? 'Continue →' : 'Take Quiz →'}
        </button>
      </div>

      {/* Video fills remaining height */}
      <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {error ? (
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #0f172a 0%, #000 100%)',
            color: 'rgba(255,255,255,0.6)', gap: 20, padding: 40,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: isNegative ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              border: `2px solid ${isNegative ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isNegative ? '#ef4444' : '#10b981',
            }}>
              <Film size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#ffffff' }}>
                {isNegative ? 'Incident: What Went Wrong' : 'Safe Response: Correct Procedure'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.6 }}>
                In production, this plays an AI-generated {isNegative ? 'incident reconstruction' : 'safe procedure demonstration'} video.
              </div>
            </div>
            <div style={{
              padding: '14px 22px',
              background: isNegative ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${isNegative ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              borderRadius: 10, fontSize: 13,
              color: isNegative ? '#fca5a5' : '#6ee7b7',
              maxWidth: 520, textAlign: 'center', lineHeight: 1.6,
            }}>
              <strong>{isNegative ? 'Incident Sequence:' : 'Standard Protocol:'}</strong>{' '}
              {isNegative
                ? (scenario.negativeCase?.actions?.length ? scenario.negativeCase.actions.map(a => a.replace(/_/g, ' ')).join(' → ') : scenario.negativeCase?.description)
                : (scenario.positiveCase?.actions?.length ? scenario.positiveCase.actions.map(a => a.replace(/_/g, ' ')).join(' → ') : scenario.positiveCase?.description)
              }
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl ?? undefined}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            playsInline
          />
        )}

        {/* Play overlay */}
        {!playing && !ended && !error && (
          <div
            onClick={handlePlay}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: isNegative ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${isNegative ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
            }}>
              <Play size={30} fill="#fff" style={{ color: '#fff' }} />
            </div>
          </div>
        )}
      </div>

      {/* Controls bar at bottom */}
      {!error && (
        <div style={{
          flexShrink: 0,
          background: '#0f172a',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={handlePlay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 4, display: 'flex' }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div
            onClick={handleSeek}
            style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
          >
            <div style={{
              width: `${progress}%`, height: '100%',
              background: isNegative ? '#ef4444' : '#10b981',
              borderRadius: 2, transition: 'width 0.1s',
            }} />
          </div>

          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted
                setMuted(!muted)
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex' }}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button onClick={handleReplay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex' }}>
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
