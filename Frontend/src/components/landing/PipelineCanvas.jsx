import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Box, Line, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

// The nodes representing pipeline stages
const STAGES = [
  { position: [-5, 0, 0], color: '#64748b' }, // New - slate-500
  { position: [-1.5, 0, 0], color: '#3b82f6' }, // Review - blue-500
  { position: [1.5, 0, 0], color: '#f59e0b' },  // Approval - amber-500
  { position: [5, 0, 0], color: '#10b981' },  // Done - emerald-500
]

function PipelineNodes() {
  return (
    <>
      {STAGES.map((stage, i) => (
        <group key={i}>
          {/* Node core */}
          <Sphere args={[0.3, 16, 16]} position={stage.position}>
            <MeshWobbleMaterial color={stage.color} factor={0.5} speed={2} />
          </Sphere>
          {/* Node glow */}
          <Sphere args={[0.5, 16, 16]} position={stage.position}>
            <meshBasicMaterial color={stage.color} transparent opacity={0.2} />
          </Sphere>
        </group>
      ))}
      {/* Connecting lines */}
      <Line
        points={STAGES.map(s => s.position)}
        color="#0d9488"
        opacity={0.3}
        transparent
        lineWidth={3}
      />
    </>
  )
}

function Packet({ currentStage }) {
  const packetRef = useRef()
  
  // Animate the packet moving smoothly between nodes
  useFrame(() => {
    if (!packetRef.current) return
    const targetX = STAGES[currentStage].position[0]
    
    // lerp towards target
    packetRef.current.position.x += (targetX - packetRef.current.position.x) * 0.05
    // Add floating
    packetRef.current.rotation.x += 0.01
    packetRef.current.rotation.y += 0.01
  })

  return (
    <Box ref={packetRef} args={[0.4, 0.4, 0.4]} position={[STAGES[0].position[0], 0, 0]}>
      <meshStandardMaterial color="#0d9488" emissive="#0d9488" emissiveIntensity={0.5} />
    </Box>
  )
}

function Particles({ packetStage }) {
  const meshRef = useRef()
  const count = 50
  
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particleData = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.5 + Math.random()
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (Math.random() - 0.5) * 2
        ],
        speed: 0.02 + Math.random() * 0.05,
        targetStage: packetStage
      }
    })
  }, [packetStage])

  useFrame(() => {
    if (!meshRef.current) return
    const baseX = STAGES[packetStage].position[0]
    
    particleData.forEach((p, i) => {
      // Rotate around the target node
      const angle = Date.now() * 0.001 * p.speed
      dummy.position.set(
        baseX + p.position[0] * Math.cos(angle) - p.position[1] * Math.sin(angle),
        p.position[0] * Math.sin(angle) + p.position[1] * Math.cos(angle),
        p.position[2]
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#0d9488" transparent opacity={0.6} />
    </instancedMesh>
  )
}

export default function PipelineCanvas({ currentStage = 0 }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return <div className="h-full w-full bg-[#EADBC8] rounded-xl flex items-center justify-center text-teal-600/50">ECO Pipeline</div>

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} color="#fff" />
        <pointLight position={[0, 0, 5]} intensity={1.5} color="#0d9488" />
        <PipelineNodes />
        <Packet currentStage={currentStage} />
        <Particles packetStage={currentStage} />
      </Canvas>
    </div>
  )
}
