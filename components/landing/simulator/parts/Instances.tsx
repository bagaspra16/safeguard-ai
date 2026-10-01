import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

/** [ax, ay, az, bx, by, bz] */
export type Segment = [number, number, number, number, number, number]

interface TubesProps {
  segments: Segment[]
  radius?: number
  color?: string
  metalness?: number
  roughness?: number
}

const UP = new THREE.Vector3(0, 1, 0)

/** Many straight tubes (scaffold pipes, rebar) drawn in a single draw call. */
export function Tubes({ segments, radius = 0.03, color = '#aab2bb', metalness = 0.3, roughness = 0.5 }: TubesProps) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const dir = new THREE.Vector3()
    const mid = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const matrix = new THREE.Matrix4()

    segments.forEach((s, i) => {
      a.set(s[0], s[1], s[2])
      b.set(s[3], s[4], s[5])
      dir.subVectors(b, a)
      const length = dir.length()
      quat.setFromUnitVectors(UP, dir.normalize())
      mid.addVectors(a, b).multiplyScalar(0.5)
      scale.set(radius, length, radius)
      mesh.setMatrixAt(i, matrix.compose(mid, quat, scale))
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [segments, radius])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, segments.length]} castShadow receiveShadow>
      <cylinderGeometry args={[1, 1, 1, 6]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  )
}

export interface BoxItem {
  /** Center position */
  p: [number, number, number]
  /** Size */
  s: [number, number, number]
  /** Color */
  c: string
  /** Rotation around Y */
  ry?: number
}

/** Many boxes (planks, slabs, columns, bags) drawn in a single draw call. */
export function Boxes({ items, roughness = 0.9 }: { items: BoxItem[]; roughness?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const pos = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    items.forEach((item, i) => {
      pos.set(...item.p)
      scale.set(...item.s)
      quat.setFromAxisAngle(UP, item.ry ?? 0)
      mesh.setMatrixAt(i, matrix.compose(pos, quat, scale))
      mesh.setColorAt(i, color.set(item.c))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={roughness} metalness={0} />
    </instancedMesh>
  )
}
