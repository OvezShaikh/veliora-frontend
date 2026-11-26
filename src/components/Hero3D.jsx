import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A three-fold gold loop (echoes the recycling symbol) ringed by drifting polymer pellets.
function Loop() {
  const g = useRef()
  useFrame((s, d) => {
    if (!g.current) return
    if (!calm) g.current.rotation.y += d * 0.22
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, s.pointer.y * 0.35, 0.05)
    g.current.rotation.z = THREE.MathUtils.lerp(g.current.rotation.z, -s.pointer.x * 0.2, 0.05)
  })
  return (
    <group ref={g}>
      <mesh>
        <torusKnotGeometry args={[1.15, 0.26, 260, 40, 3, 2]} />
        <meshStandardMaterial color="#c9a24a" metalness={1} roughness={0.2} envMapIntensity={1.4} />
      </mesh>
    </group>
  )
}

function Pellets({ n = 120 }) {
  const ref = useRef()
  const items = useMemo(() => Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2, r = 2.3 + Math.random() * 1.8
    return { p: [Math.cos(a) * r, (Math.random() - 0.5) * 3.4, Math.sin(a) * r], s: 0.04 + Math.random() * 0.07, c: i % 5 === 0 ? '#6f8f55' : i % 2 ? '#ecd28e' : '#2a2620' }
  }), [n])
  useFrame((_, d) => { if (ref.current && !calm) ref.current.rotation.y -= d * 0.07 })
  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} scale={it.s}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={it.c} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 42 }} dpr={[1, 1.8]} aria-hidden="true">
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color="#ffe7b0" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Loop />
        <Pellets />
      </Suspense>
    </Canvas>
  )
}
