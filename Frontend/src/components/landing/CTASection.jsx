import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { ArrowRight } from 'lucide-react'
import TealButton from './ui/TealButton'

function RotatingCube() {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.1
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15
    }
  })

  return (
    <Box ref={meshRef} args={[4, 4, 4]} position={[0, 0, -2]}>
      <meshBasicMaterial color="#0d9488" wireframe transparent opacity={0.3} />
    </Box>
  )
}

function CTACanvas() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true }}>
        <RotatingCube />
      </Canvas>
    </div>
  )
}

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#EADBC8] border-t border-black/5 z-10">
      <CTACanvas />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center reveal-up">
        <p className="text-teal-600 font-bold uppercase tracking-widest text-sm mb-4">Ready to take control?</p>
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Stop losing money to uncontrolled changes.
        </h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Join modern manufacturing companies who trust PLM Flow to keep their engineering data immaculate and strictly versioned.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link to="/dashboard">
            <TealButton size="lg" glow className="w-full sm:w-auto">
              Start Free Trial <ArrowRight size={18} />
            </TealButton>
          </Link>
          <button className="px-8 py-4 bg-black/5 hover:bg-black/10 border border-black/10 rounded-full text-slate-900 font-semibold transition-colors active:scale-95 w-full sm:w-auto">
            Book a Demo
          </button>
        </div>

        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors inline-block">
          Already have an account? Sign in →
        </Link>
      </div>
    </section>
  )
}
