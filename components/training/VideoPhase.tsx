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

  useEffect(() => {
    addEvent('video_started', undefined, { caseType })
  }, [caseType, addEvent])

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
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      {/* Case label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {isNegative ? (
          <>
            <div className="sg-negative-label">
              <AlertTriangle size={10} style={{ display: 'inline', marginRight: 4 }} />
              NEGATIVE CASE — UNSAFE BEHAVIOR
            </div>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)' }}>Watch what goes wrong</span>
          </>
        ) : (
          <>
            <div className="sg-positive-label">
              <CheckCircle size={10} style={{ display: 'inline', marginRight: 4 }} />
              POSITIVE CASE — CORRECT PROCEDURE
            </div>
            <span style={{ fontSize: 13, color: 'var(--sg-text-secondary)' }}>The right way to handle this situation</span>
          </>
        )}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
        {isNegative ? 'Incident: What Went Wrong' : 'Safe Response: Correct Procedure'}
      </h2>
      <p style={{ color: 'var(--sg-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        {isNegative
          ? 'Watch this incident video carefully. Identify the exact moment the worker made the critical error.'
          : 'This video demonstrates the correct stop-and-check procedure. Notice every step the worker takes.'}
      </p>

      {/* Video player */}
      <div style={{
        background: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        border: isNegative ? '2px solid rgba(239,68,68,0.4)' : '2px solid rgba(34,197,94,0.4)',
        marginBottom: 16,
        position: 'relative',
      }}>
        {error ? (
          <div style={{
            height: 400,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0a', color: 'var(--sg-text-muted)', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--sg-bg-elevated)', border: '1px solid var(--sg-border)', color: 'var(--sg-accent)' }}>
              <Film size={28} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--sg-text-secondary)' }}>
                Synthetic Incident Recreation Video
              </div>
              <div style={{ fontSize: 13, color: 'var(--sg-text-muted)', maxWidth: 320 }}>
                In production, this plays an AI-generated {isNegative ? 'incident' : 'safe response'} video.
                <br />Demo mode uses a placeholder.
              </div>
            </div>
            {isNegative ? (
              <div style={{
                padding: '12px 20px',
                background: 'var(--sg-hazard-bg)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, fontSize: 13, color: 'var(--sg-hazard)', maxWidth: 380, textAlign: 'center',
              }}>
                Worker approaches blind corner intersection without stopping → forklift rounds corner → near-collision
              </div>
            ) : (
              <div style={{
                padding: '12px 20px',
                background: 'var(--sg-safe-bg)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8, fontSize: 13, color: 'var(--sg-safe)', maxWidth: 380, textAlign: 'center',
              }}>
                Worker slows down → stops completely → looks left and right → waits for forklift → proceeds safely
              </div>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl ?? undefined}
            style={{ width: '100%', display: 'block', maxHeight: 480 }}
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
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(245,158,11,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={24} fill="#000" style={{ color: '#000' }} />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div style={{
          background: 'var(--sg-bg-elevated)', border: '1px solid var(--sg-border)',
          borderRadius: 8, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        }}>
          <button
            onClick={handlePlay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sg-text-primary)', padding: 4 }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Progress */}
          <div
            onClick={handleSeek}
            style={{ flex: 1, height: 4, background: 'var(--sg-border)', borderRadius: 2, cursor: 'pointer' }}
          >
            <div style={{
              width: `${progress}%`, height: '100%',
              background: isNegative ? 'var(--sg-hazard)' : 'var(--sg-safe)',
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sg-text-secondary)', padding: 4 }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button onClick={handleReplay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sg-text-secondary)', padding: 4 }}>
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* Continue */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          className="sg-btn sg-btn-primary"
          onClick={onComplete}
          style={{ fontSize: 14, padding: '12px 28px' }}
        >
          {isNegative ? 'Continue — Discuss with AI →' : 'Continue — Take Quiz →'}
        </button>
        {!ended && (
          <span style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>
            Watch the video above, then continue
          </span>
        )}
      </div>
    </div>
  )
}
