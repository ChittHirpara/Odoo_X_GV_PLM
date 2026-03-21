import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function FloatingObjects({ count = 80 }) {
  const meshRef = useRef()
  const color = useMemo(() => new THREE.Color('#0d9488'), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const objects = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        0,
      ],
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.3 + Math.random() * 0.5,
    }))
  }, [count])

  // Use InstancedMesh for performance (single draw call)
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.2), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d9488',
    metalness: 0.8,
    roughness: 0.2,
    wireframe: false,
    transparent: true,
    opacity: 0.6,
  }), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    objects.forEach((obj, i) => {
      dummy.position.set(
        obj.position[0],
        obj.position[1] + Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.5,
        obj.position[2]
      )
      dummy.rotation.set(
        obj.rotation[0] + time * obj.rotationSpeed[0],
        obj.rotation[1] + time * obj.rotationSpeed[1],
        0
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]}>
    </instancedMesh>
  )
}

function ParticleNetwork({ count = 300 }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1
    }
  })

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.05}
        color="#0d9488"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </Points>
  )
}

function MovingLight() {
  const lightRef = useRef()
  
  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const t = clock.getElapsedTime()
    lightRef.current.position.x = Math.sin(t * 0.5) * 8
    lightRef.current.position.y = Math.cos(t * 0.3) * 5
    lightRef.current.position.z = Math.cos(t * 0.4) * 5
  })
  
  return <pointLight ref={lightRef} color="#0d9488" intensity={5} />
}

export default function HeroCanvas() {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="absolute inset-0 z-0 bg-transparent pointer-events-none">
      {!prefersReducedMotion && (
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          style={{ background: 'transparent' }}
        >
          <ambientLight color="#ffffff" intensity={0.8} />
          <MovingLight />
          <FloatingObjects count={80} />
          <ParticleNetwork count={300} />
          <fog attach="fog" args={['#EADBC8', 20, 50]} />
        </Canvas>
      )}
    </div>
  )
}
