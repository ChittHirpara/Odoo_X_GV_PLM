import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Menu, X } from 'lucide-react'
import TealButton from './ui/TealButton'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Roles', href: '#roles' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 border-b border-black/5 ${
        scrolled ? 'bg-[#EADBC8]/80 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-black/10' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative z-50">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-teal-500/50 transition-colors">
            <Settings size={18} className="text-teal-400 group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 flex gap-1">
            PLM <span className="text-teal-600">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors relative group py-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-teal-400 transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4 relative z-50">
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Link to="/dashboard">
            <TealButton size="sm" glow>Get Started</TealButton>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden relative z-50 p-2 text-slate-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <div className={`
          fixed inset-0 bg-[#EADBC8] z-40 transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <nav className="flex flex-col gap-6 text-xl font-semibold">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-slate-900 hover:text-teal-600 border-b border-black/10 pb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-4">
            <Link to="/login" className="w-full py-4 text-center rounded-lg border border-white/20 text-white font-medium">
              Sign In
            </Link>
            <Link to="/dashboard">
              <TealButton className="w-full py-4 justify-center" size="lg" glow>Get Started Now</TealButton>
            </Link>
          </div>
        </div>

      </div>
    </header>
  )
}
