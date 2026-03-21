import React from 'react'
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber'
import { useInView } from '../../../hooks/useScrollAnimation'

export default function AnimatedNumber({ value, suffix = '', prefix = '', className = '' }) {
  const [ref, inView] = useInView(0.5)
  // Ensure we pass only numbers to the hook
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  const isFloat = value.toString().includes('.')
  
  const current = useAnimatedNumber(numericValue, 1500, inView)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {isFloat ? current.toFixed(1) : current}
      {suffix}
    </span>
  )
}
