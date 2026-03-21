import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { Search, Package, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Products() {
  const { products, isReadOnly } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    if (isReadOnly && p.status !== 'Active') return false;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Products</h1>
          <p className="text-sm text-surface-500 mt-1">Managed product catalog with version control</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
        </div>
        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {['All', 'Active', 'Archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === status
                  ? 'bg-white text-surface-800 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your search or filters." icon={Package} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-surface-200 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Version</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link to={`/products/${product.id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-surface-500">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-surface-700">v{product.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/products/${product.id}`}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all"
                    >
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
