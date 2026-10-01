'use client'

import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { BoxItem } from '@/components/landing/simulator/parts/Instances'

/** Unlit boxes (ceiling light panels, signs' glow) in one draw call. */
export function LightPanels({ items, color = '#fff8e6' }: { items: BoxItem[]; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    items.forEach((it, i) => m.setMatrixAt(i, mat.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(...it.s))))
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  )
}

/** Painted floor area / line. */
export function Paint({ position, size, color, rotation = 0 }: { position: [number, number, number]; size: [number, number]; color: string; rotation?: number }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.55} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  )
}

/**
 * Floor stencil. With rotation = -PI/2 the text reads upright for someone
 * walking towards +X; 0 for someone walking towards -Z.
 */
export function FloorDecal({
  map,
  position,
  size,
  rotation = 0,
  opacity = 0.9,
}: {
  map: THREE.Texture
  position: [number, number, number]
  size: [number, number]
  rotation?: number
  opacity?: number
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={map} transparent opacity={opacity} depthWrite={false} roughness={0.6} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  )
}

/** Flat sign facing +Z (rotate the parent to aim it). */
export function Sign({
  map,
  position,
  size,
  rotationY = 0,
  glow = false,
}: {
  map: THREE.Texture
  position: [number, number, number]
  size: [number, number]
  rotationY?: number
  glow?: boolean
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={size} />
      {glow ? <meshBasicMaterial map={map} toneMapped={false} /> : <meshStandardMaterial map={map} roughness={0.5} />}
    </mesh>
  )
}

export interface AABB {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export function box(cx: number, cz: number, sx: number, sz: number, pad = 0.35): AABB {
  return { minX: cx - sx / 2 - pad, maxX: cx + sx / 2 + pad, minZ: cz - sz / 2 - pad, maxZ: cz + sz / 2 + pad }
}

const inside = (b: AABB, x: number, z: number) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ

/** Slide along obstacles: undo the axis that caused the overlap. */
export function collide(next: THREE.Vector3, prev: THREE.Vector3, boxes: AABB[]) {
  for (const b of boxes) {
    if (!inside(b, next.x, next.z)) continue
    if (!inside(b, next.x, prev.z)) next.z = prev.z
    else if (!inside(b, prev.x, next.z)) next.x = prev.x
    else {
      next.x = prev.x
      next.z = prev.z
    }
  }
}
