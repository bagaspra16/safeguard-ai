import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { BRAND } from '../timeline'
import styles from '../simulator.module.css'

interface DetectionBoxProps {
  width?: number
  height?: number
  label: string
  detail?: string
}

/** Detection frame and alert label, placed inside the group of the detected object. */
export function DetectionBox({ width = 0.9, height = 2, label, detail }: DetectionBoxProps) {
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, width)),
    [width, height],
  )

  return (
    <group position={[0, height / 2, 0]}>
      <lineSegments geometry={edges} renderOrder={10}>
        <lineBasicMaterial color={BRAND} depthTest={false} transparent />
      </lineSegments>
      <mesh renderOrder={9}>
        <boxGeometry args={[width, height, width]} />
        <meshBasicMaterial color={BRAND} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      {/* Label sits to the left of the frame (offset in CSS), clear of the hero text above */}
      <Html zIndexRange={[12, 0]} style={{ pointerEvents: 'none' }}>
        <div className={styles.tag}>
          <span className={styles.tagLabel}>{label}</span>
          {detail && <span className={styles.tagDetail}>{detail}</span>}
        </div>
      </Html>
    </group>
  )
}
