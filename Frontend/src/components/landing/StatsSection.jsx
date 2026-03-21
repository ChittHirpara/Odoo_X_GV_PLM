import React from 'react'
import { Quote } from 'lucide-react'
import AnimatedNumber from './ui/AnimatedNumber'
import GlassCard from './ui/GlassCard'

export default function StatsSection() {
  const stats = [
    { value: 99.9, suffix: '%', label: 'Uptime Guaranteed' },
    { prefix: '< ', value: 2, suffix: 'min', label: 'ECO Creation Time' },
    { value: 100, suffix: '%', label: 'Changes Traceable' },
    { value: 0, suffix: '', label: 'Unauthorized Edits' },
  ]

  return (
    <section className="py-24 px-6 relative z-10 overflow-hidden">
      {/* Dynamic background gradient for stats */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Number Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 mb-24 reveal-up">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl md:text-6xl font-black text-gradient font-mono mb-2 truncate">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8 reveal-up">
          <GlassCard className="flex flex-col h-full bg-gradient-to-br from-white/60 to-white/40 hover:scale-[1.01] transition-transform">
            <Quote size={40} className="text-teal-500/20 mb-6" />
            <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed mb-8 flex-1">
              "We used to lose days figuring out which BoM version was actually on the shop floor. PLM Flow completely eliminated version drift overnight. Implementation took 2 hours."
            </p>
            <div className="flex justify-between items-end border-t border-white/5 pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center font-bold text-teal-600">DR</div>
                <div>
                  <h4 className="font-bold text-slate-900">David Reynolds</h4>
                  <p className="text-xs text-slate-600">Director of Engineering, Machina Dynamics</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-full bg-gradient-to-br from-white/60 to-white/40 hover:scale-[1.01] transition-transform">
            <Quote size={40} className="text-teal-500/20 mb-6" />
            <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed mb-8 flex-1">
"The automated routing rules are a lifesaver. ISO compliance audits used to be a nightmare, but now we just export the cryptographic audit logs and we pass with zero friction."
            </p>
            <div className="flex justify-between items-end border-t border-white/5 pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-600">SK</div>
                <div>
                  <h4 className="font-bold text-slate-900">Sarah Kovac</h4>
                  <p className="text-xs text-slate-600">VP Operations, Precision CNC</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </section>
  )
}
