import React from 'react'
import { Hexagon } from 'lucide-react'

export default function SectionBadge({ title, icon: Icon = Hexagon }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 mb-6">
      <Icon size={14} className="text-teal-600" />
      <span className="text-sm font-semibold tracking-wide text-teal-600 uppercase">
        {title}
      </span>
    </div>
  )
}
