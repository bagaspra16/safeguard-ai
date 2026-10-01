'use client'

import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { ShieldAlert, Brain, Boxes, Glasses, Film, BarChart3, Zap } from 'lucide-react'

// ─── Mini Warehouse Hero Scene ────────────────────────────────────────────────

function WarehouseFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

function SafetyStripe({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.3, 6]} />
      <meshStandardMaterial color="#f97316" roughness={0.5} />
    </mesh>
  )
}

function Shelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1.2, 2.4].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[3, 0.08, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.06, 2.6, 0.06]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function HeroForklift({ t }: { t: number }) {
  const x = Math.sin(t * 0.4) * 4 + 4
  const color = t % (Math.PI * 2) < Math.PI ? '#f97316' : '#dc2626'
  return (
    <group position={[x, 0, 2]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.4, 1.0, 2]} />
        <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Mast */}
      <mesh position={[0.5, 1.5, 0]}>
        <boxGeometry args={[0.12, 2, 0.12]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      {/* Fork */}
      <mesh position={[0.5, 0.4, 0]}>
        <boxGeometry args={[0.1, 0.1, 1.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      {/* Warning light */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Wheels */}
      {[[-0.55, -0.8], [0.55, -0.8], [-0.55, 0.8], [0.55, 0.8]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx as number, 0.12, wz as number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.2, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Worker({ t }: { t: number }) {
  const x = Math.sin(t * 0.3 + 1) * 3 - 3
  return (
    <group position={[x, 0, -1]}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 8, 12]} />
        <meshStandardMaterial color="#f97316" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.18]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.9} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.21, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.5} />
      </mesh>
    </group>
  )
}

function HazardIndicator({ t }: { t: number }) {
  const opacity = (Math.sin(t * 2) + 1) / 2
  return (
    <group position={[0, 3, 0]}>
      <mesh>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={opacity * 2}
          transparent
          opacity={opacity * 0.9 + 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function HeroScene() {
  const [t, setT] = useState(0)
  const frameRef = useRef<number>(0)
  const lastRef = useRef<number>(0)

  useEffect(() => {
    const animate = (time: number) => {
      const dt = (time - lastRef.current) / 1000
      lastRef.current = time
      setT((prev) => prev + dt)
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 12, 5]} intensity={1.5} castShadow />
      <pointLight position={[-5, 4, 3]} intensity={0.9} color="#f97316" />
      <pointLight position={[5, 3, -3]} intensity={0.6} color="#3b82f6" />

      <WarehouseFloor />

      {/* Safety stripes */}
      {[-3, -2.7, -2.4].map((x) => (
        <SafetyStripe key={x} x={x} z={0} />
      ))}

      {/* Shelves */}
      <Shelf position={[-3, 0, -4]} />
      <Shelf position={[3, 0, -4]} />
      <Shelf position={[-3, 0, 4]} />

      {/* Moving forklift */}
      <HeroForklift t={t} />

      {/* Worker */}
      <Worker t={t} />

      {/* Hazard indicator */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <HazardIndicator t={t} />
      </Float>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-bg-base)', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 40px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--sg-border)',
        boxShadow: 'var(--sg-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 16, color: '#ffffff',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--sg-text-primary)' }}>SafeGuard AI</span>
          <span className="sg-badge sg-badge-orange" style={{ marginLeft: 6 }}>V1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={{ color: 'var(--sg-text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--sg-text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>How It Works</a>
          <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            Enter Platform
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
        {/* 3D Canvas */}
        <div style={{ position: 'absolute', inset: 0, top: 64 }}>
          <Canvas
            shadows
            camera={{ position: [10, 8, 10], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>

        {/* Light Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.7) 45%, rgba(248,250,252,0.88) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 10,
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 60px 60px',
          maxWidth: 720,
        }}>
          <div className="sg-badge sg-badge-orange" style={{ marginBottom: 20, width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} /> AI-Powered 360° Safety Training Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            color: 'var(--sg-text-primary)',
          }}>
            Turn workplace safety training into an{' '}
            <span style={{ color: 'var(--sg-accent)' }}>immersive 360°</span>{' '}
            simulation.
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, color: 'var(--sg-text-secondary)',
            marginBottom: 16, maxWidth: 580,
          }}>
            AI-generated safety drills combining realistic 360° incident videos, synchronized decision cues, WebXR spatial training, and adaptive AI evaluation.
          </p>

          <p style={{
            fontSize: 14, color: 'var(--sg-text-muted)',
            marginBottom: 36,
          }}>
            Built for warehouse safety • forklift operations • OSHA compliance
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: '14px 30px' }}>
              Explore Safety Simulation →
            </Link>
            <Link href="/dashboard/training/forklift-blind-corner-001" className="sg-btn sg-btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
              Launch Forklift Drill
            </Link>
          </div>
        </div>

        {/* Bottom feature strip */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '0 60px 40px',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          {[
            { icon: <ShieldAlert size={16} color="var(--sg-hazard)" />, label: '360° Equirectangular Videos' },
            { icon: <Brain size={16} color="var(--sg-info)" />, label: 'AI Safety Instructor' },
            { icon: <Boxes size={16} color="var(--sg-accent)" />, label: 'Real-Time Decision Cues' },
            { icon: <Glasses size={16} color="var(--sg-vr)" />, label: 'WebXR / Quest 2 Ready' },
          ].map((f) => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid var(--sg-border)',
              boxShadow: 'var(--sg-shadow-sm)',
            }}>
              <span>{f.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--sg-text-primary)', fontWeight: 600 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '90px 60px',
        background: 'var(--sg-bg-surface)',
        borderTop: '1px solid var(--sg-border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="sg-badge sg-badge-orange" style={{ margin: '0 auto 14px', width: 'fit-content' }}>Platform Capabilities</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 14 }}>One scenario. Every training format.</h2>
            <p style={{ color: 'var(--sg-text-secondary)', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
              SafeGuard AI transforms safety incidents into interactive, synchronized multi-modal training experiences.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {[
              {
                icon: <Film size={24} color="var(--sg-hazard)" />,
                title: '360° Incident & Safe Videos',
                desc: 'AI-generated 360° immersive videos showing what went wrong and demonstrating the correct OSHA procedure.',
                color: 'var(--sg-hazard)',
              },
              {
                icon: <Boxes size={24} color="var(--sg-accent)" />,
                title: 'Real-Time Decision Cues',
                desc: 'Videos pause dynamically at critical moments, prompting trainees to make real-time decisions with instant feedback.',
                color: 'var(--sg-accent)',
              },
              {
                icon: <Glasses size={24} color="var(--sg-vr)" />,
                title: 'WebXR / Headset Compatible',
                desc: 'Compatible with Meta Quest 2 and VR headsets via WebXR directly in the browser with zero installation.',
                color: 'var(--sg-vr)',
              },
              {
                icon: <Brain size={24} color="var(--sg-info)" />,
                title: 'AI Safety Instructor',
                desc: 'An adaptive AI coach that debriefs decisions, highlights OSHA regulations, and explains core safety concepts.',
                color: 'var(--sg-info)',
              },
              {
                icon: <BarChart3 size={24} color="var(--sg-safe)" />,
                title: 'Performance Analytics',
                desc: 'Comprehensive scoring on reaction times, hazard identification accuracy, and team compliance progress.',
                color: 'var(--sg-safe)',
              },
              {
                icon: <Zap size={24} color="var(--sg-accent)" />,
                title: 'SIVS Scenario Engine',
                desc: 'Compliant with SafeGuard Immersive Video Standard (SIVS v1.0) for consistent enterprise training production.',
                color: 'var(--sg-accent)',
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: 'var(--sg-bg-base)',
                  border: '1px solid var(--sg-border)',
                  borderRadius: 14,
                  padding: '28px 24px',
                  boxShadow: 'var(--sg-shadow-sm)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 10,
                  background: 'var(--sg-bg-surface)',
                  border: '1px solid var(--sg-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: 'var(--sg-shadow-sm)',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--sg-text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--sg-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '90px 60px', background: 'var(--sg-bg-base)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 14 }}>The Training Journey</h2>
            <p style={{ color: 'var(--sg-text-secondary)', fontSize: 16 }}>
              Structured 5-phase experiential learning pipeline from incident analysis to mastery.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { step: '01', label: 'Observe the Incident', desc: 'Watch the AI-generated incident in 360° and evaluate critical hazards in real-time.', color: 'var(--sg-hazard)' },
              { step: '02', label: 'AI Debrief & Analysis', desc: 'The AI instructor analyzes your observations and checks your understanding of the root cause.', color: 'var(--sg-warning)' },
              { step: '03', label: 'Study Correct Procedure', desc: 'Experience the safe procedure demonstration with embedded OSHA decision checkpoints.', color: 'var(--sg-safe)' },
              { step: '04', label: 'Knowledge Assessment', desc: 'Scenario-specific quiz verifying regulatory rules, stopping distances, and safety protocols.', color: 'var(--sg-info)' },
              { step: '05', label: 'Full Performance Report', desc: 'Detailed debrief with scoring, OSHA compliance alignment, and safety badges.', color: 'var(--sg-accent)' },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '20px 24px',
                  background: 'var(--sg-bg-surface)',
                  border: '1px solid var(--sg-border)',
                  borderRadius: 12,
                  boxShadow: 'var(--sg-shadow-sm)',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: 'var(--sg-accent-dim)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 15, color: 'var(--sg-accent)', fontFamily: 'JetBrains Mono, monospace',
                }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: 'var(--sg-text-primary)' }}>{s.label}</div>
                  <div style={{ color: 'var(--sg-text-secondary)', fontSize: 14 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 60px',
        background: 'var(--sg-bg-surface)',
        borderTop: '1px solid var(--sg-border)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>
          Ready to experience immersive safety training?
        </h2>
        <p style={{ color: 'var(--sg-text-secondary)', marginBottom: 36, fontSize: 16 }}>
          The Forklift Blind Corner scenario is available in full interactive demo mode now.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Start Demo Training →
          </Link>
          <Link href="/dashboard/scenarios" className="sg-btn sg-btn-secondary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Browse Scenarios
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '28px 60px',
        background: 'var(--sg-bg-base)',
        borderTop: '1px solid var(--sg-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ fontSize: 13, color: 'var(--sg-text-secondary)', fontWeight: 500 }}>
          © 2026 SafeGuard AI. Industrial Workplace Safety Training Platform.
        </div>
        <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>
          Running in Demo Mode — <span style={{ color: 'var(--sg-safe)', fontWeight: 600 }}>All Features Active</span>
        </div>
      </footer>
    </div>
  )
}
