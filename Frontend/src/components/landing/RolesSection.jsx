import React, { useState, useRef } from 'react'
import { Check, X, Users, Wrench, ShieldCheck, Cog } from 'lucide-react'
import SectionBadge from './ui/SectionBadge'
import { gsap } from 'gsap'

const ROLES = [
  {
    id: 'engineering',
    title: 'Engineering User',
    icon: Wrench,
    desc: 'The creators. They design parts, structure BoMs, and initiate change requests.',
    perms: [
      { text: 'View Products & BoMs', allowed: true },
      { text: 'Draft & Submit ECOs', allowed: true },
      { text: 'Approve ECOs', allowed: false },
      { text: 'Manage Users & Routing', allowed: false },
    ],
    mockup: 'Engineering UI: Products / BoMs / My ECOs'
  },
  {
    id: 'approver',
    title: 'Approver',
    icon: ShieldCheck,
    desc: 'The gatekeepers. Department heads that review and authorize changes.',
    perms: [
      { text: 'View Products & BoMs', allowed: true },
      { text: 'Approve/Reject ECOs', allowed: true },
      { text: 'Submit ECOs', allowed: true },
      { text: 'Mutate System Config', allowed: false },
    ],
    mockup: 'Approver UI: Pending Approval Queue'
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: Cog,
    desc: 'The executors. They need the absolute latest, verified truth for production.',
    perms: [
      { text: 'View ACTIVE BoMs', allowed: true },
      { text: 'Export Data', allowed: true },
      { text: 'Initiate Changes', allowed: false },
      { text: 'View Draft/Pending Data', allowed: false },
    ],
    mockup: 'Operations UI: Read-only live system'
  },
  {
    id: 'admin',
    title: 'Administrator',
    icon: Users,
    desc: 'System controllers. They map out the automated company workflows.',
    perms: [
      { text: 'Manage Users & Roles', allowed: true },
      { text: 'Configure Approval Routing', allowed: true },
      { text: 'Edit ECO Stages', allowed: true },
      { text: 'View Audit Logs', allowed: true },
    ],
    mockup: 'Admin UI: User & Stage Configs'
  }
]

export default function RolesSection() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const panelRef = useRef()

  const handleRoleChange = (role) => {
    if (activeRole.id === role.id) return
    
    // Animate out
    gsap.to(panelRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.15,
      onComplete: () => {
        setActiveRole(role)
        // Animate in
        gsap.fromTo(panelRef.current, 
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        )
      }
    })
  }

  return (
    <section id="roles" className="py-24 px-6 relative z-10 bg-white/20">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-16 reveal-up">
          <SectionBadge title="Authentication" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Tailored UI for every department.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Too much access causes errors. Too little causes bottlenecks. Give everyone exactly what they need.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto gap-2 md:gap-4 mb-8 pb-4 border-b border-black/5 reveal-up scrollbar-hide">
          {ROLES.map(role => {
            const isActive = activeRole.id === role.id
            const Icon = role.icon
            return (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-600 relative' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {role.title}
                {isActive && (
                  <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-teal-400 rounded-t-lg shadow-[0_-2px_10px_rgba(45,212,191,0.5)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="bg-white/40 rounded-3xl border border-black/5 p-8 lg:p-12 reveal-up overflow-hidden relative min-h-[400px]">
          <div ref={panelRef} className="grid lg:grid-cols-2 gap-12 w-full">
            
            {/* Permissions List */}
            <div>
              <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mb-6">
                <activeRole.icon size={24} className="text-slate-900" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">{activeRole.title}</h3>
              <p className="text-slate-600 mb-8 max-w-md text-lg">{activeRole.desc}</p>
              
              <div className="space-y-4">
                {activeRole.perms.map((perm, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {perm.allowed ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-500" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <X size={14} className="text-slate-400" />
                      </div>
                    )}
                    <span className={`font-medium ${perm.allowed ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-400/50'}`}>
                      {perm.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* UI Mockup Window */}
            <div className="flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-2xl relative overflow-hidden group">
              {/* Window header */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="mx-auto text-[10px] font-mono text-slate-400 bg-white px-3 py-1 rounded">plmflow.local/{activeRole.id}</div>
              </div>
              
              <div className="w-full mt-10 p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <activeRole.icon size={48} className="text-teal-500/20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{activeRole.mockup}</p>
                  
                  {/* Abstract skeleton UI indicating the role's view */}
                  <div className="mt-8 space-y-3 mx-auto w-48 opacity-50">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-5/6" />
                    {activeRole.id === 'approver' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                        <div className="h-6 w-1/2 bg-green-500/20 rounded" />
                        <div className="h-6 w-1/2 bg-red-500/20 rounded" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
