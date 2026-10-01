'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { smokeSpriteTexture, softSpriteTexture } from './textures'

// ─── GPU point-sprite particles ──────────────────────────────────────────────
// One draw call per emitter. The CPU only advances ~100 particles per frame.

export interface ParticleConfig {
  count: number
  kind: 'fire' | 'smoke' | 'spark' | 'dust' | 'spray'
  /** Emitter centre and half-extents */
  origin: [number, number, number]
  spread: [number, number, number]
  life: [number, number]
  /** Base velocity plus random jitter (m/s) */
  velocity: [number, number, number]
  jitter: [number, number, number]
  /** Particle diameter in metres at birth and death */
  size: [number, number]
  colorStart: string
  colorEnd: string
  opacity: number
  /** Upward acceleration (negative = gravity) */
  lift?: number
  /** Smoke pools under the ceiling and rolls outward */
  ceiling?: number
  drag?: number
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aSpin;
  attribute vec3 aColor;
  uniform float uScale;
  varying float vAlpha;
  varying float vSpin;
  varying vec3 vColor;
  #include <fog_pars_vertex>
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uScale / max(0.1, -mvPosition.z);
    vAlpha = aAlpha;
    vSpin = aSpin;
    vColor = aColor;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vSpin;
  varying vec3 vColor;
  #include <fog_pars_fragment>
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vSpin), s = sin(vSpin);
    uv = mat2(c, -s, s, c) * uv + 0.5;
    vec4 tex = texture2D(uMap, uv);
    float a = tex.a * vAlpha * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * tex.rgb, a);
    #include <fog_fragment>
  }
`

interface Particle {
  age: number
  life: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  spin: number
  spinRate: number
  alive: boolean
}

function createParticles(n: number, maxLife: number): Particle[] {
  // Staggered ages so the emitter starts "warm"
  return Array.from({ length: n }, () => ({
    age: Math.random() * maxLife,
    life: 0,
    x: 0,
    y: -999,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    spin: Math.random() * 6.28,
    spinRate: (Math.random() - 0.5) * 0.8,
    alive: false,
  }))
}

const scratchColor = new THREE.Color()

interface EmitterProps {
  config: ParticleConfig
  /** 0..1, scales how many particles are respawned and how big they get */
  intensityRef?: React.RefObject<number>
}

export function ParticleEmitter({ config, intensityRef }: EmitterProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<Particle[] | null>(null)
  const n = config.count
  const additive = config.kind === 'fire' || config.kind === 'spark'

  const buffers = useMemo(
    () => ({
      position: new Float32Array(n * 3),
      size: new Float32Array(n),
      alpha: new Float32Array(n),
      spin: new Float32Array(n),
      color: new Float32Array(n * 3),
    }),
    [n]
  )
  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uMap: { value: null },
          uScale: { value: 400 },
          uOpacity: { value: config.opacity },
        },
      ]),
    [config.opacity]
  )
  const map = useMemo(() => (config.kind === 'smoke' || config.kind === 'dust' ? smokeSpriteTexture() : softSpriteTexture()), [config.kind])
  const c0 = useMemo(() => new THREE.Color(config.colorStart), [config.colorStart])
  const c1 = useMemo(() => new THREE.Color(config.colorEnd), [config.colorEnd])

  useFrame((state, rawDt) => {
    const pts = pointsRef.current
    if (!pts) return
    let ps = particlesRef.current
    if (!ps || ps.length !== n) ps = particlesRef.current = createParticles(n, config.life[1])

    const dt = Math.min(rawDt, 0.05)
    const mat = pts.material as THREE.ShaderMaterial
    // Pixel scale so particle sizes are in world metres
    const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 65
    mat.uniforms.uScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan((Math.PI / 360) * fov))
    mat.uniforms.uMap.value = map

    const geo = pts.geometry
    const pos = geo.attributes.position.array as Float32Array
    const sz = geo.attributes.aSize.array as Float32Array
    const al = geo.attributes.aAlpha.array as Float32Array
    const sp = geo.attributes.aSpin.array as Float32Array
    const cl = geo.attributes.aColor.array as Float32Array
    const k = intensityRef ? intensityRef.current : 1
    const [ox, oy, oz] = config.origin
    const lift = config.lift ?? 0
    const drag = config.drag ?? 0

    for (let i = 0; i < n; i++) {
      const p = ps[i]
      p.age += dt
      if (p.age >= p.life) {
        if (k > 0.01 && Math.random() < Math.min(1, 0.25 + k)) {
          p.alive = true
          p.age = 0
          p.life = config.life[0] + Math.random() * (config.life[1] - config.life[0])
          const spreadK = 0.4 + 0.6 * k
          p.x = ox + (Math.random() * 2 - 1) * config.spread[0] * spreadK
          p.y = oy + (Math.random() * 2 - 1) * config.spread[1]
          p.z = oz + (Math.random() * 2 - 1) * config.spread[2] * spreadK
          p.vx = config.velocity[0] + (Math.random() * 2 - 1) * config.jitter[0]
          p.vy = (config.velocity[1] + (Math.random() * 2 - 1) * config.jitter[1]) * (0.6 + 0.4 * k)
          p.vz = config.velocity[2] + (Math.random() * 2 - 1) * config.jitter[2]
        } else {
          p.alive = false
          p.age = 0
          p.life = 0.1 + Math.random() * 0.3
        }
      }

      const j = i * 3
      if (!p.alive) {
        al[i] = 0
        pos[j + 1] = -999
        continue
      }

      p.vy += lift * dt
      if (drag) {
        const f = Math.exp(-drag * dt)
        p.vx *= f
        p.vy *= f
        p.vz *= f
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.z += p.vz * dt
      if (config.ceiling !== undefined && p.y > config.ceiling) {
        // Hot smoke hits the ceiling and spreads sideways
        p.y = config.ceiling
        const push = Math.abs(p.vy) * 0.8 + 0.2
        const ang = Math.atan2(p.z - oz, p.x - ox) + (Math.random() - 0.5) * 0.4
        p.vx += Math.cos(ang) * push * dt * 8
        p.vz += Math.sin(ang) * push * dt * 8
        p.vy = 0
      }
      p.spin += p.spinRate * dt

      const u = p.age / p.life
      pos[j] = p.x
      pos[j + 1] = p.y
      pos[j + 2] = p.z
      sz[i] = THREE.MathUtils.lerp(config.size[0], config.size[1], u) * (0.55 + 0.45 * k)
      // Quick fade-in, long fade-out
      al[i] = Math.min(1, u * 6) * (1 - u) * (1 - u) * 1.6
      sp[i] = p.spin
      scratchColor.copy(c0).lerp(c1, Math.min(1, u * 1.4))
      cl[j] = scratchColor.r
      cl[j + 1] = scratchColor.g
      cl[j + 2] = scratchColor.b
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.aSize.needsUpdate = true
    geo.attributes.aAlpha.needsUpdate = true
    geo.attributes.aSpin.needsUpdate = true
    geo.attributes.aColor.needsUpdate = true
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={config.kind === 'smoke' ? 2 : 3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.position, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[buffers.size, 1]} />
        <bufferAttribute attach="attributes-aAlpha" args={[buffers.alpha, 1]} />
        <bufferAttribute attach="attributes-aSpin" args={[buffers.spin, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[buffers.color, 3]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        fog
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

// ─── Flickering fire light ───────────────────────────────────────────────────

export function FlickerLight({
  position,
  intensityRef,
  color = '#ff7a1a',
  base = 18,
  distance = 18,
}: {
  position: [number, number, number]
  intensityRef?: React.RefObject<number>
  color?: string
  base?: number
  distance?: number
}) {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const k = intensityRef ? intensityRef.current : 1
    const flicker = 0.75 + Math.sin(t * 13) * 0.08 + Math.sin(t * 23.7) * 0.07 + Math.random() * 0.1
    ref.current.intensity = base * k * flicker
  })
  return <pointLight ref={ref} position={position} color={color} distance={distance} decay={1.6} />
}

// ─── Rotating amber beacon ───────────────────────────────────────────────────

export function Beacon({ color = '#f59e0b', on = true }: { color?: string; on?: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current && on) ref.current.rotation.y += dt * 9
  })
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.075, 0.09, 0.14, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={on ? 1.6 : 0.1} transparent opacity={0.9} />
      </mesh>
      <group ref={ref}>
        <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={on}>
          <coneGeometry args={[0.06, 0.5, 10, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Pulsing ground ring used to mark a target / zone ────────────────────────

export function PulseRing({
  position,
  color = '#f97316',
  radius = 0.7,
  visible = true,
}: {
  position: [number, number, number]
  color?: string
  radius?: number
  visible?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  const ref2 = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (const [m, off] of [[ref.current, 0], [ref2.current, 0.5]] as const) {
      if (!m) continue
      const u = (t * 0.7 + off) % 1
      m.scale.setScalar(0.6 + u * 0.8)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.75
    }
  })
  if (!visible) return null
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[radius * 0.82, radius, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[radius * 0.9, radius, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={ref2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[radius * 0.9, radius, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}
