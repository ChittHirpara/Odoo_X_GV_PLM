import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageUpload from '../components/ui/ImageUpload';
import { ArrowLeft, Plus, Trash2, CalendarDays, ToggleLeft, ToggleRight, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateEco() {
  const { products, bomList, addEco, canCreateEco } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    type: 'Product',
    productId: '',
    bomId: '',
    effectiveDate: '',
    versionUpdate: true,
    newVersion: '',
    description: '',
  });

  const [changes, setChanges] = useState([
    { field: '', oldValue: '', newValue: '', type: 'modified' },
  ]);

  const [uploadedImages, setUploadedImages] = useState([]);

  if (!canCreateEco) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-surface-600 font-medium mb-2">Access Restricted</p>
        <p className="text-sm text-surface-400">Only Engineering Users and Admins can create ECOs.</p>
        <Link to="/eco" className="mt-4 text-sm text-primary-600 hover:underline">← Back to ECO List</Link>
      </div>
    );
  }

  const selectedProduct = products.find(p => p.id === form.productId);
  const productBoms = bomList.filter(b => b.productId === form.productId);

  const addChange = () => {
    setChanges(prev => [...prev, { field: '', oldValue: '', newValue: '', type: 'modified' }]);
  };

  const removeChange = (idx) => {
    setChanges(prev => prev.filter((_, i) => i !== idx));
  };

  const updateChange = (idx, key, value) => {
    setChanges(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.productId) return;

    const validChanges = changes.filter(c => c.field.trim());
    const product = products.find(p => p.id === form.productId);

    // Build image changes from uploaded images
    const imageChanges = uploadedImages.map((img, idx) => ({
      id: `ic_new_${idx}`,
      label: img.name,
      changeType: 'added',
      oldImage: null,
      newImage: { id: img.id, name: img.name, url: img.url, category: img.category },
      reviewStatus: null,
      reviewComment: null,
      reviewedBy: null,
    }));

    const eco = addEco({
      title: form.title,
      type: form.type,
      productId: form.productId,
      productName: product?.name || '',
      bomId: form.type === 'BoM' ? form.bomId : undefined,
      effectiveDate: form.effectiveDate,
      versionUpdate: form.versionUpdate,
      newVersion: form.newVersion || null,
      description: form.description,
      priority: 'Medium',
      changes: validChanges,
      attachedImages: uploadedImages,
      imageChanges,
    });

    navigate(`/eco/${eco.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/eco" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={16} /> Back to ECOs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Create Engineering Change Order</h1>
        <p className="text-sm text-surface-500 mt-1">Define the changes to be made through controlled workflow</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ECO Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-surface-800">ECO Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Upgrade seal material for high-temp applications"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">ECO Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value, bomId: '' })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
              >
                <option value="Product">Product Change</option>
                <option value="BoM">BoM Change</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Select Product *</label>
              <select
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value, bomId: '' })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                required
              >
                <option value="">Choose a product...</option>
                {products.filter(p => p.status === 'Active').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                ))}
              </select>
            </div>

            {form.type === 'BoM' && form.productId && (
              <div>
                <label className="block text-sm font-medium text-surface-600 mb-1.5">Select BoM</label>
                <select
                  value={form.bomId}
                  onChange={e => setForm({ ...form, bomId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                >
                  <option value="">Choose a BoM...</option>
                  {productBoms.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (v{b.version})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Effective Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setForm({ ...form, versionUpdate: !form.versionUpdate })}
                className="text-primary-600"
              >
                {form.versionUpdate ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-surface-400" />}
              </button>
              <div>
                <p className="text-sm font-medium text-surface-700">Version Update</p>
                <p className="text-xs text-surface-400">{form.versionUpdate ? 'A new version will be created' : 'No version bump'}</p>
              </div>
            </div>

            {form.versionUpdate && (
              <div>
                <label className="block text-sm font-medium text-surface-600 mb-1.5">New Version</label>
                <input
                  type="text"
                  value={form.newVersion}
                  onChange={e => setForm({ ...form, newVersion: e.target.value })}
                  placeholder={selectedProduct ? `e.g., ${parseFloat(selectedProduct.version) + 0.1}` : 'e.g., 2.1'}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the reason and impact of this change..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Change Editor */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-800">Change Details</h2>
            <button
              type="button"
              onClick={addChange}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus size={14} /> Add Change
            </button>
          </div>

          <div className="space-y-3">
            {changes.map((change, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs font-medium text-surface-400 mb-1">Field</label>}
                  <input
                    type="text"
                    value={change.field}
                    onChange={e => updateChange(idx, 'field', e.target.value)}
                    placeholder="e.g., Material"
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs font-medium text-surface-400 mb-1">Old Value</label>}
                  <input
                    type="text"
                    value={change.oldValue}
                    onChange={e => updateChange(idx, 'oldValue', e.target.value)}
                    placeholder="Current value"
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs font-medium text-surface-400 mb-1">New Value</label>}
                  <input
                    type="text"
                    value={change.newValue}
                    onChange={e => updateChange(idx, 'newValue', e.target.value)}
                    placeholder="Proposed value"
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs font-medium text-surface-400 mb-1">Type</label>}
                  <select
                    value={change.type}
                    onChange={e => updateChange(idx, 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                  >
                    <option value="modified">Modified</option>
                    <option value="added">Added</option>
                    <option value="removed">Removed</option>
                  </select>
                </div>
                <div className="col-span-1">
                  {changes.length > 1 && (
                    <button type="button" onClick={() => removeChange(idx)} className="p-2 text-surface-400 hover:text-danger-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Attachments */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">Attachments / Images</h2>
            {uploadedImages.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">{uploadedImages.length}</span>
            )}
          </div>
          <p className="text-sm text-surface-400">Upload product images, BoM diagrams, design sketches, or supporting documents. These will be reviewed during the approval process.</p>
          <ImageUpload
            images={uploadedImages}
            onImagesChange={setUploadedImages}
            disabled={false}
          />
        </motion.div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link to="/eco" className="px-5 py-2.5 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            Create ECO
          </button>
        </div>
      </form>
    </div>
  );
}
