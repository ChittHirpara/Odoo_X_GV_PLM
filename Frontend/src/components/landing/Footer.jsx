import React from 'react'
import { Link } from 'react-router-dom'
import { Settings, Github, Twitter, Linkedin, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="pricing" className="bg-[#EADBC8] pt-24 pb-8 px-6 border-t border-black/5 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center shadow-lg group-hover:border-teal-500/50 transition-colors">
                <Settings size={18} className="text-teal-600" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex gap-1">
                PLM <span className="text-teal-600">Flow</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-8">
              The premier engineering change control management system built for high-velocity manufacturing.
            </p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-teal-500/10 hover:border-teal-500/30 border border-transparent transition-all"><Twitter size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-teal-500/10 hover:border-teal-500/30 border border-transparent transition-all"><Github size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-teal-500/10 hover:border-teal-500/30 border border-transparent transition-all"><Linkedin size={18}/></button>
            </div>
          </div>

          {/* Col 2: Links */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-slate-900 font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Security', 'Integrations', 'Pricing', 'Changelog'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-slate-900 font-bold mb-6">Subscribe to Engineering Weekly</h4>
            <p className="text-sm text-slate-600 mb-4">Latest insights on manufacturing workflows and PLM strategies. No spam.</p>
            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-black/5 border border-black/10 rounded-lg px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
              />
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <p>© 2024 PLM Flow by ERP Titans | Built for Odoo x Gujarat Vidyapith Hackathon 🏆</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
