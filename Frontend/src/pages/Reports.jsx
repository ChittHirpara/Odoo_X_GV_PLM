import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import DiffView from '../components/ui/DiffView';
import { BarChart3, FileText, Package, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const tabs = [
  { id: 'eco', label: 'ECO History', icon: FileText },
  { id: 'products', label: 'Product Versions', icon: Package },
  { id: 'bom', label: 'BoM Changes', icon: Layers },
];

export default function Reports() {
  const { ecoList, products } = useApp();
  const [activeTab, setActiveTab] = useState('eco');
  const [expandedId, setExpandedId] = useState(null);

  const typeCounts = ecoList.reduce((acc, eco) => {
    acc[eco.type] = (acc[eco.type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Reports</h1>
        <p className="text-sm text-surface-500 mt-1">Audit trail of all product and BoM changes</p>
      </div>

      {/* Dynamic Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden hidden sm:block p-6 mb-2"
      >
        <div className="mb-6">
          <h2 className="text-base font-bold text-surface-800 tracking-tight">ECO Distribution by Type</h2>
          <p className="text-xs text-surface-500 mt-1 font-medium">Breakdown of change order categories across all products</p>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-200)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-surface-500)', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-surface-500)', fontWeight: 500 }} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface-50)', borderRadius: '12px', border: '1px solid var(--color-surface-200)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: 13, fontWeight: 600, color: '#0F2C59' }}
                labelStyle={{ fontSize: 12, color: 'var(--color-surface-500)', marginBottom: 4 }}
                cursor={{ fill: 'var(--color-surface-200)', opacity: 0.4 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0F2C59' : '#DAC0A3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 rounded-lg p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedId(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-100 text-surface-800 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ECO History */}
      {activeTab === 'eco' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="divide-y divide-surface-100">
            {ecoList.map(eco => (
              <div key={eco.id}>
                <button
                  onClick={() => setExpandedId(expandedId === eco.id ? null : eco.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="text-sm font-mono text-surface-400 w-28 flex-shrink-0">{eco.ecoNumber}</span>
                    <span className="text-sm font-medium text-surface-700 truncate">{eco.title}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <StatusBadge status={eco.stage} />
                    <span className="text-xs text-surface-400">{eco.createdAt}</span>
                    {expandedId === eco.id ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedId === eco.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="flex items-center gap-4 mb-4 text-sm text-surface-500">
                          <span>By: {eco.createdByName}</span>
                          <span>Product: <Link to={`/products/${eco.productId}`} className="text-primary-600 hover:underline">{eco.productName}</Link></span>
                          <span>Type: <StatusBadge status={eco.type} /></span>
                        </div>
                        {eco.changes && <DiffView changes={eco.changes} />}
                        <Link to={`/eco/${eco.id}`} className="inline-block mt-4 text-sm text-primary-600 hover:underline font-medium">View Full ECO →</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Versions */}
      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-surface-700">{product.name}</span>
                  <StatusBadge status={product.status} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-surface-600">v{product.version}</span>
                  <span className="text-xs text-surface-400">{product.versions.length} versions</span>
                  {expandedId === product.id ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedId === product.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 border-t border-surface-100">
                      <table className="w-full mt-3">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-semibold text-surface-400 uppercase pb-2">Version</th>
                            <th className="text-left text-xs font-semibold text-surface-400 uppercase pb-2">Date</th>
                            <th className="text-left text-xs font-semibold text-surface-400 uppercase pb-2">ECO</th>
                            <th className="text-left text-xs font-semibold text-surface-400 uppercase pb-2">Changed By</th>
                            <th className="text-left text-xs font-semibold text-surface-400 uppercase pb-2">Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-50">
                          {product.versions.map(v => (
                            <tr key={v.version} className="text-sm">
                              <td className="py-2 font-semibold text-surface-700">v{v.version}</td>
                              <td className="py-2 text-surface-500">{v.date}</td>
                              <td className="py-2 font-mono text-primary-500">{v.eco || '—'}</td>
                              <td className="py-2 text-surface-500">{v.changedBy}</td>
                              <td className="py-2 text-surface-500">{v.summary}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}

      {/* BoM Changes */}
      {activeTab === 'bom' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="divide-y divide-surface-100">
            {ecoList.filter(e => e.type === 'BoM').map(eco => (
              <div key={eco.id}>
                <button
                  onClick={() => setExpandedId(expandedId === eco.id ? null : eco.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="text-sm font-mono text-surface-400 w-28 flex-shrink-0">{eco.ecoNumber}</span>
                    <span className="text-sm font-medium text-surface-700 truncate">{eco.title}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <StatusBadge status={eco.stage} />
                    {expandedId === eco.id ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedId === eco.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        {eco.changes && <DiffView changes={eco.changes} />}
                        <Link to={`/eco/${eco.id}`} className="inline-block mt-4 text-sm text-primary-600 hover:underline font-medium">View Full ECO →</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
