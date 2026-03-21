import React, { useState } from 'react'
import { FileEdit, Send, CheckCircle2, Factory } from 'lucide-react'
import SectionBadge from './ui/SectionBadge'
import PipelineCanvas from './PipelineCanvas'
import GlassCard from './ui/GlassCard'
import AnimatedNumber from './ui/AnimatedNumber'

const steps = [
  {
    icon: FileEdit,
    title: 'Draft ECO',
    desc: 'Engineer branches the active BoM and stages modifications safely.',
    stat: '100%',
    statLabel: 'Data isolation',
    color: '#64748B'
  },
  {
    icon: Send,
    title: 'Submit Review',
    desc: 'Automated diff generation highlights precise cost and part changes.',
    stat: '< 2min',
    statLabel: 'Diff generation',
    color: '#3B82F6'
  },
  {
    icon: CheckCircle2,
    title: 'Approval Routing',
    desc: 'Rule-based routing forces sign-off from required department heads.',
    stat: '0',
    statLabel: 'Skipped approvals',
    color: '#F59E0B'
  },
  {
    icon: Factory,
    title: 'Live Deployment',
    desc: 'Approved changes instantly replace production data without downtime.',
    stat: 'Instantly',
    statLabel: 'Propagated',
    color: '#10B981'
  }
]

export default function HowItWorks() {
  const [activeStage, setActiveStage] = useState(0)

  const handleNextStage = () => {
    setActiveStage((prev) => (prev + 1) % steps.length)
  }

  return (
    <section id="how-it-works" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 reveal-up">
          <SectionBadge title="The Pipeline" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">How an ECO moves in PLM Flow.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            A linear, unbreakable chain of custody from proposal to production.
          </p>
        </div>

        {/* 3D Visualizer Canvas container */}
        <div className="w-full h-[300px] mb-8 relative rounded-2xl glass overflow-hidden reveal-up">
          <PipelineCanvas currentStage={activeStage} />
          
          {/* Controls overlay */}
          <div className="absolute bottom-6 right-6 z-10 flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-black/5 backdrop-blur-md">
            <span className="text-sm font-medium text-slate-700">Stage: {steps[activeStage].title}</span>
            <button 
              onClick={handleNextStage}
              className="px-4 py-2 bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              Simulate Transit ➔
            </button>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isActive = activeStage === idx
            return (
              <GlassCard 
                key={idx} 
                className={`transition-all duration-500 ${isActive ? 'ring-2 ring-teal-500/50 bg-white/80 -translate-y-2 scale-[1.02]' : 'opacity-70'} reveal-up`}
                style={{ transitionDelay: `${idx * 100}ms` }}
                onClick={() => setActiveStage(idx)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
                    style={{ backgroundColor: isActive ? step.color : 'rgba(255,255,255,0.05)' }}
                  >
                    <Icon size={24} className={isActive ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <span className="text-4xl font-black text-white/5 right-4 top-4 absolute pointer-events-none">
                    0{idx + 1}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 mb-8 min-h-[60px]">{step.desc}</p>
                
                <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{step.statLabel}</span>
                  <span className="text-xl font-mono font-bold text-slate-700">
                    {idx === 2 ? <AnimatedNumber value={0} /> : step.stat}
                  </span>
                </div>
              </GlassCard>
            )
          })}
        </div>

      </div>
    </section>
  )
}
