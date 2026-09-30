'use client'

import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { SpatialInteractionZone } from '@/types'
import { Compass, Eye, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Props {
  videoElement: HTMLVideoElement | null
  spatialZones?: SpatialInteractionZone[]
  isNegative?: boolean
  onGazeZone?: (zoneId: string) => void
  onOrientationChange?: (yaw: number, pitch: number) => void
}

// ─── 3D Sphere Video Mesh ───────────────────────────────────────────────────
function VideoSphereMesh({ videoElement, isNegative }: { videoElement: HTMLVideoElement | null; isNegative?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.VideoTexture | THREE.CanvasTexture | null>(null)

  useEffect(() => {
    if (videoElement) {
      const tex = new THREE.VideoTexture(videoElement)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.format = THREE.RGBAFormat
      setTexture(tex)
      return () => {
        tex.dispose()
      }
    } else {
      // Create procedural equirectangular grid fallback canvas
      const canvas = document.createElement('canvas')
      canvas.width = 2048
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Warehouse background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, 1024)
        grad.addColorStop(0, '#020617')
        grad.addColorStop(0.5, '#0f172a')
        grad.addColorStop(1, '#050b14')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 2048, 1024)

        // Equirectangular grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'
        ctx.lineWidth = 1.5

        for (let y = 0; y <= 1024; y += 64) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(2048, y)
          ctx.stroke()
        }
        for (let x = 0; x <= 2048; x += 128) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, 1024)
          ctx.stroke()
        }

        // Industrial warehouse markings in 360 space
        // Floor line (yellow pedestrian lane marking)
        ctx.fillStyle = 'rgba(234, 179, 8, 0.45)'
        ctx.fillRect(0, 680, 2048, 40)

        // Forklift intersection warning zone (at 90° azimuth -> x around 1536)
        ctx.fillStyle = isNegative ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'
        ctx.fillRect(1400, 600, 300, 140)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(isNegative ? 'HAZARD ZONE: BLIND FORKLIFT CROSSING (90° RIGHT)' : 'SAFE OBSERVATION ZONE', 1420, 670)

        // Center forward marker
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)'
        ctx.font = 'bold 24px monospace'
        ctx.fillText('FORWARD 0° [PEDESTRIAN WALKWAY]', 900, 520)
      }

      const canvasTex = new THREE.CanvasTexture(canvas)
      canvasTex.colorSpace = THREE.SRGBColorSpace
      setTexture(canvasTex)
      return () => {
        canvasTex.dispose()
      }
    }
  }, [videoElement, isNegative])

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      {/* SIVS §35: Inverted Sphere Geometry (inside-facing) */}
      <sphereGeometry args={[500, 60, 40]} />
      {texture ? (
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      ) : (
        <meshBasicMaterial color="#0b1329" side={THREE.BackSide} />
      )}
    </mesh>
  )
}

// ─── Spatial Zone Marker in 3D ──────────────────────────────────────────────
function SpatialMarker({ zone }: { zone: SpatialInteractionZone }) {
  const markerRef = useRef<THREE.Group>(null)

  // Convert spherical coordinates (yaw, pitch) to Cartesian position on sphere r=450
  const yawRad = (zone.yaw * Math.PI) / 180
  const pitchRad = (zone.pitch * Math.PI) / 180
  const radius = 450

  const x = radius * Math.cos(pitchRad) * Math.sin(yawRad)
  const y = radius * Math.sin(pitchRad)
  const z = -radius * Math.cos(pitchRad) * Math.cos(yawRad)

  useFrame(({ clock }) => {
    if (markerRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 4) * 0.15 + 1
      markerRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  const isHazard = zone.type === 'hazard'
  const color = isHazard ? '#ef4444' : '#10b981'

  return (
    <group position={[x, y, z]} ref={markerRef}>
      <mesh>
        <ringGeometry args={[14, 20, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <circleGeometry args={[10, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

// ─── Orientation Tracker ────────────────────────────────────────────────────
function CameraTracker({ onOrientationChange }: { onOrientationChange?: (yaw: number, pitch: number) => void }) {
  useFrame(({ camera }) => {
    if (!onOrientationChange) return
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const yaw = Math.round((Math.atan2(dir.x, -dir.z) * 180) / Math.PI)
    const pitch = Math.round((Math.asin(dir.y) * 180) / Math.PI)
    onOrientationChange(yaw, pitch)
  })
  return null
}

// ─── Main 360 Viewer Export ─────────────────────────────────────────────────
export function Equirectangular360Viewer({
  videoElement,
  spatialZones = [],
  isNegative = false,
  onGazeZone,
  onOrientationChange,
}: Props) {
  const [currentYaw, setCurrentYaw] = useState(0)
  const [currentPitch, setCurrentPitch] = useState(0)

  const handleOrientation = (yaw: number, pitch: number) => {
    setCurrentYaw(yaw)
    setCurrentPitch(pitch)
    onOrientationChange?.(yaw, pitch)

    // Check if looking at any spatial zones
    if (onGazeZone && spatialZones.length > 0) {
      for (const zone of spatialZones) {
        const yawDiff = Math.abs(((yaw - zone.yaw + 540) % 360) - 180)
        const pitchDiff = Math.abs(pitch - zone.pitch)
        if (yawDiff <= zone.angleDeg && pitchDiff <= zone.angleDeg) {
          onGazeZone(zone.id)
        }
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 440, background: '#000', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <VideoSphereMesh videoElement={videoElement} isNegative={isNegative} />
          {spatialZones.map(zone => (
            <SpatialMarker key={zone.id} zone={zone} />
          ))}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.45} // Invert so dragging feels natural (panning looking around)
            maxPolarAngle={Math.PI - 0.1}
            minPolarAngle={0.1}
          />
          <CameraTracker onOrientationChange={handleOrientation} />
        </Suspense>
      </Canvas>

      {/* ── 360 HUD Overlay ── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {/* SIVS §33 Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 11, fontWeight: 700, color: '#38bdf8',
        }}>
          <Eye size={12} />
          <span>360° SIVS Equirectangular View</span>
        </div>

        {/* Compass Heading */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)',
        }}>
          <Compass size={12} color="#f59e0b" />
          <span>Yaw: {currentYaw > 0 ? `+${currentYaw}°` : `${currentYaw}°`}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Pitch: {currentPitch > 0 ? `+${currentPitch}°` : `${currentPitch}°`}</span>
        </div>
      </div>

      {/* ── Active Spatial Zones in Gaze HUD ── */}
      {spatialZones.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          display: 'flex', gap: 8, pointerEvents: 'none', flexWrap: 'wrap',
        }}>
          {spatialZones.map(zone => {
            const yawDiff = Math.abs(((currentYaw - zone.yaw + 540) % 360) - 180)
            const inGaze = yawDiff <= zone.angleDeg
            return (
              <div
                key={zone.id}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: inGaze
                    ? (zone.type === 'hazard' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)')
                    : 'rgba(0,0,0,0.5)',
                  border: `1px solid ${inGaze ? (zone.type === 'hazard' ? '#ef4444' : '#10b981') : 'rgba(255,255,255,0.1)'}`,
                  fontSize: 11, fontWeight: inGaze ? 700 : 500,
                  color: inGaze ? '#fff' : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                {zone.type === 'hazard' ? <AlertTriangle size={11} color="#ef4444" /> : <CheckCircle2 size={11} color="#10b981" />}
                <span>{zone.label}</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>({zone.yaw}°)</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Drag look hint */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        padding: '3px 8px', borderRadius: 4,
        background: 'rgba(0,0,0,0.4)',
        fontSize: 10, color: 'rgba(255,255,255,0.4)',
        pointerEvents: 'none',
      }}>
        Drag to look 360°
      </div>
    </div>
  )
}
