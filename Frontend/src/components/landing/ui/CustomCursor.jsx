import { useEffect, useRef } from 'react'
import { useCursorEffect } from '../../../hooks/useCursorEffect'

export default function CustomCursor() {
  const { position, isHovering, isClicking, isHidden } = useCursorEffect()
  const ringRef = useRef()
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let animationFrameId
    const render = () => {
      // Lerp for the ring
      ringPos.current.x += (position.x - ringPos.current.x) * 0.15
      ringPos.current.y += (position.y - ringPos.current.y) * 0.15

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      animationFrameId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [position])

  if (isHidden) return null

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      />
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[90] transition-all duration-150 ease-out"
        style={{
          width: isClicking ? '80px' : isHovering ? '60px' : '40px',
          height: isClicking ? '80px' : isHovering ? '60px' : '40px',
          border: isHovering ? '1px solid rgba(45,212,191,0.5)' : '1px solid rgba(0,0,0,0.2)',
          backgroundColor: isHovering ? 'rgba(45,212,191,0.1)' : 'transparent',
          boxShadow: isHovering ? '0 0 20px rgba(45,212,191,0.2)' : 'none',
        }}
      />
    </>
  )
}
