'use client'

import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { ShieldAlert, Brain, Boxes, Glasses, Film, BarChart3, Zap } from 'lucide-react'

// ─── Mini Warehouse Hero Scene ────────────────────────────────────────────────

function WarehouseFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

function SafetyStripe({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.3, 6]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.5} />
    </mesh>
  )
}

function Shelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1.2, 2.4].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[3, 0.08, 0.8]} />
          <meshStandardMaterial color="#2a2f38" roughness={0.9} metalness={0.3} />
        </mesh>
      ))}
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.06, 2.6, 0.06]} />
          <meshStandardMaterial color="#3d4452" roughness={0.8} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function HeroForklift({ t }: { t: number }) {
  const x = Math.sin(t * 0.4) * 4 + 4
  const color = t % (Math.PI * 2) < Math.PI ? '#f59e0b' : '#ef4444'
  return (
    <group position={[x, 0, 2]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.4, 1.0, 2]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Mast */}
      <mesh position={[0.5, 1.5, 0]}>
        <boxGeometry args={[0.12, 2, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
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
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
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
        <meshStandardMaterial color="#facc15" roughness={0.5} />
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
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={opacity * 3}
          transparent
          opacity={opacity * 0.9 + 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function AIPanel() {
  return (
    <group position={[-6, 2.5, -5]} rotation={[0, Math.PI / 6, 0]}>
      {/* Panel background */}
      <mesh>
        <planeGeometry args={[3.5, 2.2]} />
        <meshStandardMaterial color="#13161a" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Panel border */}
      <mesh>
        <planeGeometry args={[3.52, 2.22]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
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
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 12, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 4, 3]} intensity={0.8} color="#f59e0b" />
      <pointLight position={[5, 3, -3]} intensity={0.4} color="#3b82f6" />

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

      {/* AI panel */}
      <AIPanel />

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
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(13,15,17,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--sg-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--sg-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#000',
          }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>SafeGuard AI</span>
          <span className="sg-badge sg-badge-warning" style={{ marginLeft: 8 }}>Beta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={{ color: 'var(--sg-text-secondary)', fontSize: 14, textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--sg-text-secondary)', fontSize: 14, textDecoration: 'none' }}>How It Works</a>
          <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>
            Enter Platform
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 3D Canvas */}
        <div style={{ position: 'absolute', inset: 0 }}>
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

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(13,15,17,0.85) 0%, rgba(13,15,17,0.4) 50%, rgba(13,15,17,0.6) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 10,
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '120px 60px 60px',
          maxWidth: 700,
        }}>
          <div className="sg-badge sg-badge-warning" style={{ marginBottom: 24, width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} /> AI-Powered Safety Training
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 5vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}>
            Turn safety training into a{' '}
            <span style={{ color: 'var(--sg-accent)' }}>decision-making</span>{' '}
            simulation.
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, color: 'var(--sg-text-secondary)',
            marginBottom: 16, maxWidth: 560,
          }}>
            AI-generated workplace safety drills combining realistic incident videos, interactive 3D environments, WebXR training, and adaptive personalized feedback.
          </p>

          <p style={{
            fontSize: 14, color: 'var(--sg-text-muted)',
            marginBottom: 40,
          }}>
            Built for warehouse safety • forklift operations • OSHA compliance
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
              Explore Safety Simulation →
            </Link>
            <Link href="/dashboard/training/forklift-blind-corner-001" className="sg-btn sg-btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>
              See How It Works
            </Link>
          </div>
        </div>

        {/* Bottom label */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '0 60px 40px',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          {[
            { icon: <ShieldAlert size={16} color="var(--sg-hazard)" />, label: 'Live Hazard Detection' },
            { icon: <Brain size={16} color="var(--sg-info)" />, label: 'AI Safety Instructor' },
            { icon: <Boxes size={16} color="var(--sg-accent)" />, label: 'Interactive 3D Warehouse' },
            { icon: <Glasses size={16} color="var(--sg-vr)" />, label: 'WebXR / Quest 2 Ready' },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{f.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)', fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '100px 60px',
        background: 'var(--sg-bg-surface)',
        borderTop: '1px solid var(--sg-border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="sg-badge sg-badge-info" style={{ margin: '0 auto 16px', width: 'fit-content' }}>Platform Capabilities</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>One scenario. Every training format.</h2>
            <p style={{ color: 'var(--sg-text-secondary)', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
              SafeGuard AI transforms a single safety incident into a synchronized multi-modal training experience.
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
                title: 'Positive & Negative Videos',
                desc: 'AI-generated incident videos showing exactly what went wrong and the correct safe procedure — side by side.',
                color: 'var(--sg-hazard)',
              },
              {
                icon: <Boxes size={24} color="var(--sg-accent)" />,
                title: 'Interactive 3D Simulation',
                desc: 'Walk through a full warehouse environment. Identify hazards, make decisions, and see real-time consequences.',
                color: 'var(--sg-accent)',
              },
              {
                icon: <Glasses size={24} color="var(--sg-vr)" />,
                title: 'WebXR Training',
                desc: 'Enter immersive VR mode on Meta Quest 2 directly from the browser. Same scene, no app install required.',
                color: 'var(--sg-vr)',
              },
              {
                icon: <Brain size={24} color="var(--sg-info)" />,
                title: 'AI Safety Instructor',
                desc: 'An AI trainer who knows your scenario, asks probing questions, evaluates your answers, and adapts to your performance.',
                color: 'var(--sg-info)',
              },
              {
                icon: <BarChart3 size={24} color="var(--sg-safe)" />,
                title: 'Performance Analytics',
                desc: 'Track hazard detection rate, decision accuracy, quiz scores, and reaction times across your entire team.',
                color: 'var(--sg-safe)',
              },
              {
                icon: <Zap size={24} color="var(--sg-accent)" />,
                title: 'Scenario Engine',
                desc: 'One structured scenario powers every format — video, 3D, VR, quiz, and AI feedback all share the same data source.',
                color: 'var(--sg-accent)',
              },
            ].map((f) => (
              <div key={f.title} className="sg-surface" style={{ padding: '28px 24px' }}>
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: f.color }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--sg-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '100px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>The Training Flow</h2>
            <p style={{ color: 'var(--sg-text-secondary)', fontSize: 16 }}>
              Every training session follows the same structured journey from incident to insight.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            {[
              { step: '01', label: 'Watch the Incident', desc: 'See the negative case — what went wrong and why.', color: 'var(--sg-hazard)' },
              { step: '02', label: 'AI Question', desc: 'The AI instructor asks you to identify the critical mistake.', color: 'var(--sg-warning)' },
              { step: '03', label: 'Enter 3D Simulation', desc: 'Walk through the environment. Find the hazards yourself.', color: 'var(--sg-accent)' },
              { step: '04', label: 'Make a Decision', desc: 'Stop and check, or continue? Your choice, real consequences.', color: 'var(--sg-info)' },
              { step: '05', label: 'Watch Correct Response', desc: 'See the positive case — the correct procedure in action.', color: 'var(--sg-safe)' },
              { step: '06', label: 'Quiz & Feedback', desc: 'Test your knowledge. AI evaluates and explains every answer.', color: 'var(--sg-vr)' },
              { step: '07', label: 'Performance Report', desc: 'Score, reaction time, hazard detection, and improvement areas.', color: 'var(--sg-accent)' },
            ].map((s, i) => (
              <div key={s.step} style={{
                display: 'flex', gap: 24, marginBottom: 24,
                opacity: 1,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: `rgba(${s.color === 'var(--sg-hazard)' ? '239,68,68' : s.color === 'var(--sg-warning)' ? '245,158,11' : s.color === 'var(--sg-accent)' ? '245,158,11' : s.color === 'var(--sg-info)' ? '59,130,246' : s.color === 'var(--sg-safe)' ? '34,197,94' : s.color === 'var(--sg-vr)' ? '139,92,246' : '245,158,11'},0.15)`,
                  border: `1px solid ${s.color === 'var(--sg-hazard)' ? 'rgba(239,68,68,0.3)' : s.color === 'var(--sg-info)' ? 'rgba(59,130,246,0.3)' : s.color === 'var(--sg-safe)' ? 'rgba(34,197,94,0.3)' : s.color === 'var(--sg-vr)' ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: s.color, fontFamily: 'JetBrains Mono, monospace',
                }}>{s.step}</div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.label}</div>
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
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
          Ready to run your first simulation?
        </h2>
        <p style={{ color: 'var(--sg-text-secondary)', marginBottom: 40, fontSize: 16 }}>
          The Forklift Blind Corner scenario runs in full demo mode — no API keys required.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/dashboard" className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Start Demo Training →
          </Link>
          <Link href="/dashboard/admin" className="sg-btn sg-btn-secondary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 60px',
        borderTop: '1px solid var(--sg-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>
          © 2026 SafeGuard AI. Industrial safety training platform.
        </div>
        <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>
          Running in Demo Mode — <span style={{ color: 'var(--sg-safe)' }}>All features available</span>
        </div>
      </footer>
    </div>
  )
}
