import React from 'react'
import { XCircle, CheckCircle, FileSpreadsheet, Lock } from 'lucide-react'
import AnimatedNumber from './ui/AnimatedNumber'
import SectionBadge from './ui/SectionBadge'

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-up">
          <SectionBadge title="The Problem" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Without systems, manufacturing stalls.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">Spreadsheets and email threads are secretly draining your profit margins through errors and invisible rework.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center relative">
          
          {/* VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#EADBC8] border border-slate-300 z-20 items-center justify-center font-black text-xl text-slate-400 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            VS
          </div>

          {/* Left Panel: The Problem */}
          <div className="p-8 rounded-3xl border border-red-200 bg-red-500/5 relative overflow-hidden reveal-left group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              The Excel Chaos
            </h3>

            {/* Simulated Desktop File Chaos */}
            <div className="bg-white/20 rounded-xl p-6 border border-red-200 mb-8 h-48 relative overflow-hidden">
              {[
                { name: 'BoM_final.xlsx', x: 10, y: 10, rot: -5 },
                { name: 'BoM_FINAL_v2.xlsx', x: 20, y: 40, rot: 8 },
                { name: 'BoM_ACTUAL_FINAL.xlsx', x: 40, y: 20, rot: -2 },
                { name: 'Drawing_update_maybe.pdf', x: 15, y: 70, rot: 12 },
                { name: 'Costings_Q3_USE_THIS.xlsx', x: 55, y: 55, rot: -8 },
              ].map((file, i) => (
                <div 
                  key={i}
                  className="absolute p-3 rounded-lg bg-white shadow-lg border border-slate-200 flex flex-col items-center gap-2 hover:z-10 hover:scale-105 transition-transform duration-300 cursor-not-allowed"
                  style={{
                    left: `${file.x}%`,
                    top: `${file.y}%`,
                    transform: `rotate(${file.rot}deg)`,
                  }}
                >
                  <FileSpreadsheet size={24} className="text-red-500" />
                  <span className="text-[9px] font-medium text-slate-800 text-center leading-tight truncate w-16">{file.name}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Wrong versions sent to shop floor',
                'Unauthorized pricing overrides',
                'No audit trail of who changed what',
                'Approval bottlenecks over email'
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-700">
                  <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p>{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-red-200">
              <p className="text-sm text-red-900/60 font-medium mb-1 uppercase tracking-wide">Average Annual Loss</p>
              <div className="text-4xl font-black text-red-600 font-mono">
                $<AnimatedNumber value={2.4} suffix="M" prefix="" />
              </div>
            </div>
          </div>

          {/* Right Panel: The Solution */}
          <div className="p-8 rounded-3xl border border-teal-200 bg-teal-500/5 relative overflow-hidden reveal-right group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h3 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Controlled & Traceable
            </h3>

            {/* Simulated Clean Dashboard */}
            <div className="bg-white/40 rounded-xl p-6 border border-teal-100 mb-8 h-48 flex items-center justify-center">
              <div className="w-full max-w-sm bg-white/80 rounded-lg border border-slate-200 shadow-xl overflow-hidden group-hover:border-teal-500/50 transition-colors duration-500 p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-slate-900 font-medium flex items-center gap-2">Motor Assembly v2 <Lock size={12} className="text-teal-600" /></h4>
                    <p className="text-xs text-slate-500 mt-1">Last modified by Sarah P. · 2m ago</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-400 text-xs font-bold border border-teal-500/30">ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-700 rounded-full" />
                  <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Single source of truth via Live BoMs',
                'Granular role-based access control',
                'Cryptographic version history',
                'Automated approval workflows'
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <p>{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-teal-200">
              <p className="text-sm text-teal-900/60 font-medium mb-1 uppercase tracking-wide">Unauthorized Changes</p>
              <div className="text-4xl font-black text-teal-600 font-mono">
                <AnimatedNumber value={0} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
