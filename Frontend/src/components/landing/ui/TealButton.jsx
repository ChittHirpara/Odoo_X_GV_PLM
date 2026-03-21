import React from 'react'

export default function TealButton({ 
  children, 
  size = 'md', 
  glow = false, 
  outlined = false, 
  onClick, 
  className = '' 
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200
    active:scale-95 hover:scale-[1.02] cursor-pointer
    ${sizeClasses[size]}
    ${glow ? 'hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]' : ''}
    ${className}
  `

  if (outlined) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} bg-transparent text-teal-400 border border-teal-500/50 hover:bg-teal-500/10 hover:border-teal-400`}
      >
        {children}
      </button>
    )
  }

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} bg-teal-gradient text-white border border-teal-400/20`}
    >
      {children}
    </button>
  )
}
