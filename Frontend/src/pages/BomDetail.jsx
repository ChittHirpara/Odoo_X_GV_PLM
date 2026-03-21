import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import { ArrowLeft, Lock, Wrench, Cog } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BomDetail() {
  const { id } = useParams();
  const { bomList } = useApp();
  const bom = bomList.find(b => b.id === id);

  if (!bom) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-400">BoM not found.</p>
      </div>
    );
  }

  const totalCost = bom.components.reduce((sum, c) => sum + (c.cost * c.quantity), 0);

  return (
    <div className="space-y-6">
      <Link to="/bom" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={16} /> Back to BoMs
      </Link>

      {/* Edit Warning */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-warning-50 border border-warning-500/30 rounded-xl p-4 flex items-start gap-3"
      >
        <Lock size={18} className="text-warning-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-warning-700">Editing Disabled</p>
          <p className="text-sm text-warning-600">BoM changes must go through an <Link to="/eco" className="underline font-medium">Engineering Change Order (ECO)</Link>.</p>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-800">{bom.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Link to={`/products/${bom.productId}`} className="text-sm text-primary-600 hover:underline">{bom.productName}</Link>
              <StatusBadge status={bom.status} size="lg" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-surface-400">Version</p>
            <p className="text-2xl font-bold text-primary-600">v{bom.version}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Components Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-2">
            <Wrench size={16} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">Components</h2>
            <span className="text-xs text-surface-400 ml-auto">{bom.components.length} parts · Total cost: ${totalCost.toFixed(2)}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-2.5 text-xs font-semibold text-surface-400 uppercase">Part Name</th>
                <th className="text-left px-6 py-2.5 text-xs font-semibold text-surface-400 uppercase">Part Number</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-surface-400 uppercase">Qty</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-surface-400 uppercase">Unit Cost</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-surface-400 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {bom.components.map(c => (
                <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-surface-700">{c.name}</td>
                  <td className="px-6 py-3 text-sm font-mono text-surface-500">{c.partNumber}</td>
                  <td className="px-6 py-3 text-sm text-surface-600 text-right">{c.quantity} {c.unit}</td>
                  <td className="px-6 py-3 text-sm text-surface-600 text-right">${c.cost.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-surface-700 text-right">${(c.cost * c.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Operations */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-2">
            <Cog size={16} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">Operations</h2>
          </div>
          <div className="divide-y divide-surface-100">
            {bom.operations.map((op, idx) => (
              <div key={op.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                  <p className="text-sm font-medium text-surface-700">{op.name}</p>
                </div>
                <div className="ml-8 flex items-center gap-3">
                  <span className="text-xs text-surface-400">{op.workCenter}</span>
                  <span className="text-xs font-semibold text-surface-500">{op.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
