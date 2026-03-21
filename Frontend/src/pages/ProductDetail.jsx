import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { ArrowLeft, AlertTriangle, Lock, GitBranch, ExternalLink, FileText, ImageIcon, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, bomList, ecoList } = useApp();
  const product = products.find(p => p.id === id);
  const [previewImages, setPreviewImages] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-400">Product not found.</p>
      </div>
    );
  }

  const bom = bomList.find(b => b.id === product.bomId);
  const relatedEcos = ecoList.filter(e => e.productId === product.id);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={16} /> Back to Products
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
          <p className="text-sm text-warning-600">Direct editing of product data is not allowed. All changes must be submitted via an <Link to="/eco" className="underline font-medium">Engineering Change Order (ECO)</Link>.</p>
        </div>
      </motion.div>

      {/* Product Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-surface-800">{product.name}</h1>
              <StatusBadge status={product.status} size="lg" />
            </div>
            <p className="text-sm text-surface-500 font-mono">{product.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-surface-400">Current Version</p>
            <p className="text-2xl font-bold text-primary-600">v{product.version}</p>
          </div>
        </div>
        <p className="text-sm text-surface-600 mb-6 leading-relaxed">{product.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Category', value: product.category },
            { label: 'Price', value: `$${product.price.toLocaleString()}` },
            { label: 'Weight', value: product.weight },
            { label: 'Material', value: product.material },
          ].map(item => (
            <div key={item.label} className="bg-surface-50 rounded-lg p-3">
              <p className="text-xs text-surface-400 font-medium mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-surface-700">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">Product Images</h2>
            <span className="text-xs bg-surface-100 text-surface-500 font-medium px-2 py-0.5 rounded-full">{product.images.length} approved</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => { setPreviewImages(product.images); setPreviewIndex(idx); }}
                className="group relative aspect-[4/3] bg-surface-50 rounded-xl border border-surface-200 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[10px] text-white font-medium truncate">{img.name}</p>
                  <span className="text-[9px] bg-success-500 text-white px-1.5 py-0.5 rounded-full font-bold">✓ Approved</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version History */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-2">
            <GitBranch size={16} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">Version History</h2>
          </div>
          <div className="px-6 py-4">
            {product.versions.map((v, idx) => (
              <div key={v.version} className="flex gap-3 relative pb-5 last:pb-0">
                {idx < product.versions.length - 1 && (
                  <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-8px)] bg-surface-200" />
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                  idx === 0 ? 'bg-primary-500' : 'bg-surface-200'
                }`}>
                  <span className={`text-[9px] font-bold ${idx === 0 ? 'text-white' : 'text-surface-500'}`}>
                    {v.version}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-surface-700">v{v.version}</span>
                    {v.eco && (
                      <span className="text-xs text-primary-500 font-mono">{v.eco}</span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500">{v.summary}</p>
                  <p className="text-xs text-surface-300 mt-0.5">{v.changedBy} · {v.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Attached BoM + Related ECOs */}
        <div className="space-y-6">
          {/* Attached BoM */}
          {bom && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-surface-800">Attached BoM</h2>
                <Link to={`/bom/${bom.id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  View BoM <ExternalLink size={12} />
                </Link>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm font-medium text-surface-700">{bom.name}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-surface-400">Version: <span className="font-semibold text-surface-600">v{bom.version}</span></span>
                  <StatusBadge status={bom.status} />
                  <span className="text-xs text-surface-400">{bom.components.length} components</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Related ECOs */}
          {relatedEcos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-2">
                <FileText size={16} className="text-surface-400" />
                <h2 className="text-base font-semibold text-surface-800">Related ECOs</h2>
              </div>
              <div className="divide-y divide-surface-100">
                {relatedEcos.map(eco => (
                  <Link key={eco.id} to={`/eco/${eco.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-surface-700">{eco.ecoNumber}</p>
                      <p className="text-xs text-surface-400 truncate">{eco.title}</p>
                    </div>
                    <StatusBadge status={eco.stage} />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        images={previewImages || []}
        initialIndex={previewIndex}
        isOpen={!!previewImages}
        onClose={() => setPreviewImages(null)}
      />
    </div>
  );
}
