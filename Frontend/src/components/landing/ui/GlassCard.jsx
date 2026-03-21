import React from 'react'

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      relative rounded-2xl border border-black/5 bg-white/40 backdrop-blur-xl
      ${hover ? 'card-hover cursor-pointer p-6 sm:p-8' : 'p-6 sm:p-8'}
      ${className}
    `}>
      {children}
    </div>
  )
}
