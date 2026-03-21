import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { Search, FileText, Plus, ArrowUpRight, Filter, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EcoList() {
  const { ecoList, canCreateEco } = useApp();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const stages = ['All', 'New', 'In Review', 'Approval', 'Done'];

  const filtered = ecoList.filter(eco => {
    const matchesSearch = eco.title.toLowerCase().includes(search.toLowerCase()) ||
      eco.ecoNumber.toLowerCase().includes(search.toLowerCase()) ||
      eco.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'All' || eco.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Engineering Change Orders</h1>
          <p className="text-sm text-surface-500 mt-1">Manage all product and BoM changes through controlled workflow</p>
        </div>
        {canCreateEco && (
          <Link
            to="/eco/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> New ECO
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ECOs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-surface-400 mr-1" />
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                stageFilter === stage
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No ECOs found"
          description="No engineering change orders match your criteria."
          icon={FileText}
          action={canCreateEco ? (
            <Link to="/eco/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <Plus size={16} /> Create New ECO
            </Link>
          ) : null}
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">ECO Number</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Stage</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((eco, idx) => (
                <motion.tr
                  key={eco.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/eco/${eco.id}`} className="text-sm font-mono font-medium text-primary-600 hover:text-primary-700">{eco.ecoNumber}</Link>
                      {(eco.attachedImages?.length > 0 || eco.imageChanges?.length > 0) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold ring-1 ring-inset ring-indigo-500/20">
                          <Paperclip size={9} /> {(eco.attachedImages?.length || 0) + (eco.imageChanges?.length || 0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/eco/${eco.id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">{eco.title}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={eco.type} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{eco.productName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={eco.stage} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={eco.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{eco.createdByName}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/eco/${eco.id}`} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all">
                      View <ArrowUpRight size={12} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
