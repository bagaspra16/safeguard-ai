import { useMemo } from 'react'
import * as THREE from 'three'

// Deterministic PRNG so the generated texture is identical on every load
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createDirtTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const rand = mulberry32(7)

  ctx.fillStyle = '#b7a68c'
  ctx.fillRect(0, 0, size, size)
  // Patches of darker and lighter soil
  for (let i = 0; i < 260; i++) {
    const r = 4 + rand() * 22
    const shade = rand() > 0.5 ? '120, 100, 76' : '214, 200, 176'
    ctx.fillStyle = `rgba(${shade}, ${0.05 + rand() * 0.1})`
    ctx.beginPath()
    ctx.arc(rand() * size, rand() * size, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // Gravel specks
  for (let i = 0; i < 1400; i++) {
    const shade = rand() > 0.5 ? '90, 78, 62' : '232, 224, 208'
    ctx.fillStyle = `rgba(${shade}, ${0.2 + rand() * 0.35})`
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 1.5, 1 + rand() * 1.5)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(28, 28)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function Ground() {
  const texture = useMemo(() => createDirtTexture(), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[90, 48]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  )
}
