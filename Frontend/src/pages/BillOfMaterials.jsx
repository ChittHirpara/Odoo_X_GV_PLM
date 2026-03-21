import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { Search, Layers, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillOfMaterials() {
  const { bomList } = useApp();
  const [search, setSearch] = useState('');

  const filtered = bomList.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Bills of Materials</h1>
        <p className="text-sm text-surface-500 mt-1">Component structures and manufacturing operations</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search BoMs..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No BoMs found" description="Try adjusting your search." icon={Layers} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">BoM Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Version</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Components</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((bom, idx) => (
                <motion.tr
                  key={bom.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link to={`/bom/${bom.id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">
                      {bom.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/products/${bom.productId}`} className="text-sm text-primary-600 hover:underline">{bom.productName}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-surface-700">v{bom.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{bom.components.length} parts</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={bom.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/bom/${bom.id}`} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all">
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
