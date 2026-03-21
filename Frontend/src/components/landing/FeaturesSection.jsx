import React, { useEffect } from 'react'
import { GitCompare, GitCommit, Shield, FileOutput, Bell, CalendarClock, ArrowRight } from 'lucide-react'
import SectionBadge from './ui/SectionBadge'
import { useInView } from '../../hooks/useScrollAnimation'
import { gsap } from 'gsap'

export default function FeaturesSection() {
  const [diffRef, diffInView] = useInView(0.5)

  useEffect(() => {
    if (diffInView) {
      gsap.to('.diff-row', {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out'
      })
    }
  }, [diffInView])

  return (
    <section id="features" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-up">
          <SectionBadge title="Core Features" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Everything an engineering team needs.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Purpose-built tools that replace generic task trackers and chaotic spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          
          {/* CARD 1: Diff View (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 p-8 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(13,148,136,0.1)] transition-all duration-300 reveal-up hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <GitCompare size={20} className="text-teal-600" /> Component Diff Engine
            </h3>
            <p className="text-sm text-slate-600 mb-8 max-w-md">Instantly visualize exactly what changed in a BoM line-by-line before approving anything.</p>
            
            <div ref={diffRef} className="bg-white/40 rounded-xl border border-black/5 overflow-hidden font-mono text-[10px] sm:text-xs">
              <div className="flex bg-black/5 px-4 py-2 text-slate-500 border-b border-black/5">
                <div className="w-1/3">Part No.</div>
                <div className="w-1/3">Old Value</div>
                <div className="w-1/3">New Value</div>
              </div>
              <div className="divide-y divide-white/5">
                <div className="diff-row flex items-center px-4 py-3 opacity-0 translate-y-4">
                  <div className="w-1/3 text-slate-700">SCW-M4-12</div>
                  <div className="w-1/3 text-slate-500">Qty: 4</div>
                  <div className="w-1/3 text-slate-700">Qty: 4</div>
                </div>
                <div className="diff-row flex items-center px-4 py-3 bg-red-500/5 opacity-0 translate-y-4 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
                  <div className="w-1/3 text-slate-700">MTR-BLDC-24V</div>
                  <div className="w-1/3 text-red-600 line-through">Cost: $45.00</div>
                  <div className="w-1/3 text-green-400 bg-green-500/10 px-2 py-0.5 rounded w-max">Cost: $42.50</div>
                </div>
                <div className="diff-row flex items-center px-4 py-3 bg-green-500/5 opacity-0 translate-y-4 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50" />
                  <div className="w-1/3 text-slate-700 flex items-center gap-2"><div className="px-1 bg-green-500/20 text-green-600 rounded text-[9px] font-bold">NEW</div> WSH-M4-FLT</div>
                  <div className="w-1/3 text-slate-400">-</div>
                  <div className="w-1/3 text-green-600">Qty: 8</div>
                </div>
              </div>
            </div>
          </div>

           {/* CARD 2: Version Control */}
          <div className="p-8 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(13,148,136,0.1)] transition-all duration-300 reveal-up hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <GitCommit size={20} className="text-teal-600" /> Immutable History
            </h3>
            <p className="text-sm text-slate-600 mb-8">Every modification creates a strict cryptographic version. Never lose a design variant.</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="w-10 h-10 rounded-full border border-teal-500/30 bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-sm z-10 relative shadow-[0_0_15px_rgba(13,148,136,0.2)]">v1</div>
              <div className="flex-1 h-px bg-black/10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-black/10 rounded text-[9px] text-slate-500">ECO-112</div>
              </div>
              <div className="w-10 h-10 rounded-full border border-teal-500/30 bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-sm z-10 relative shadow-[0_0_15px_rgba(13,148,136,0.2)]">v2</div>
              <div className="flex-1 h-px bg-black/10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-black/10 rounded text-[9px] text-slate-500">ECO-145</div>
              </div>
              <div className="w-10 h-10 rounded-full border border-teal-500/80 bg-teal-500/20 flex items-center justify-center text-teal-700 font-black text-sm z-10 relative shadow-[0_0_20px_rgba(13,148,136,0.4)]">v3</div>
            </div>
          </div>

          {/* CARD 3: Role Based Access */}
          <div className="p-8 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(13,148,136,0.1)] transition-all duration-300 reveal-up hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Shield size={20} className="text-teal-600" /> RBAC Security
            </h3>
            <p className="text-sm text-slate-600 mb-6">Enforce strict permissions. Operations can execute, Engineers can propose, Admins control.</p>
            
            <div className="space-y-2">
              {['Engineering User', 'Production Approver', 'Operations User', 'System Admin'].map((role, i) => (
                <div key={role} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-black/5 border border-black/5">
                  <span className="text-xs font-semibold text-slate-700">{role}</span>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className={`w-1.5 h-1.5 rounded-full ${i > 1 ? 'bg-slate-700' : 'bg-teal-500'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${i === 3 ? 'bg-teal-500' : 'bg-slate-700'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 4: Audit Trail */}
          <div className="p-8 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(13,148,136,0.1)] transition-all duration-300 reveal-up hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileOutput size={20} className="text-teal-600" /> Compliance Logs
            </h3>
            <p className="text-sm text-slate-600 mb-6">Automatic ISO/SOC2 compliant audit logs tracking exactly who clicked what, and when.</p>
            
            <div className="bg-white/40 rounded-lg p-4 font-mono text-[9px] text-slate-500 space-y-2 h-32 overflow-hidden relative border border-black/5">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 z-10" />
              <p>[08:42:11] user_seq_94 authenticated successfully.</p>
              <p>[08:42:15] <span className="text-teal-600">ACTION_CREATE</span> ECO-089 initiated.</p>
              <p>[08:45:03] DATA_MUTATION: Product_ID_442 status 1 → 2</p>
              <p>[08:51:22] <span className="text-amber-500">APPROVAL_REQUEST</span> routed to Group:Hardware</p>
              <p>[09:12:05] <span className="text-green-600">APPROVED</span> by user_seq_12 with signature: valid</p>
              <p>[09:12:06] SYSTEM_SYNC deploying changes to live BoM cluster...</p>
            </div>
          </div>

          {/* CARD 5: Notifications */}
          <div className="p-8 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(13,148,136,0.1)] transition-all duration-300 reveal-up hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Bell size={20} className="text-teal-600" /> Actionable Alerts
            </h3>
            <p className="text-sm text-slate-600 mb-8">Never miss a bottleneck. Get pinged the exact second your approval is required to proceed.</p>
            
            <div className="relative w-full max-w-[200px] mx-auto bg-white/80 rounded-xl border border-black/10 p-4 shadow-xl translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
                3
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-bold text-xs">SM</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Sarah requested approval</p>
                  <p className="text-[10px] text-slate-500 mt-1">ECO-099 • 2 mins ago</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
