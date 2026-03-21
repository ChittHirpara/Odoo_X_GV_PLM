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
    ${glow ? 'hover:shadow-[0_0_30px_rgba(138,130,109,0.5)]' : ''}
    ${className}
  `

  if (outlined) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} bg-transparent text-[#312E24] border border-[#312E24]/40 hover:bg-[#312E24] hover:text-[#FAF8F5]`}
      >
        {children}
      </button>
    )
  }

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} bg-[#312E24] text-[#FAF8F5] shadow-md hover:bg-[#504A3C] border border-[#312E24]`}
    >
      {children}
    </button>
  )
}
