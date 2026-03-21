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
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
        </div>
        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {['All', 'Active', 'Archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === status
                  ? 'bg-surface-100 text-surface-800 shadow-sm'
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
          className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 overflow-hidden"
        >
          {/* Desktop/Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
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
                    <span className="text-sm font-semibold font-mono text-surface-700">v{product.version}</span>
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
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface-100 border text-left border-surface-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/products/${product.id}`} className="text-base font-semibold text-primary-600 hover:text-primary-700">
                      {product.name}
                    </Link>
                    <p className="text-xs text-surface-500 font-mono mt-0.5">{product.sku}</p>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">Category</p>
                    <p className="text-sm text-surface-700 font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">Version</p>
                    <p className="text-sm text-surface-700 font-medium font-mono">v{product.version}</p>
                  </div>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-surface-50 hover:bg-surface-100 text-surface-700 font-medium text-sm rounded-lg transition-colors border border-surface-200"
                >
                  View Details <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>

        </motion.div>
      )}
    </div>
  );
}
