import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, Plus, X, Wrench, Cog } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateBom() {
  const navigate = useNavigate();
  const { products, addBom } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    description: '',
  });

  const [components, setComponents] = useState([
    { id: 1, partNumber: '', name: '', quantity: 1, unit: 'pcs', cost: 0.00 }
  ]);
  
  const [operations, setOperations] = useState([
    { id: 1, name: '', workCenter: '', duration: '0 mins' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.productId) return;
    
    const product = products.find(p => p.id === formData.productId);
    
    const newBom = addBom({
      ...formData,
      productName: product?.name || 'Unknown Product',
      components: components.filter(c => c.partNumber.trim()),
      operations: operations.filter(o => o.name.trim())
    });
    
    navigate(`/bom/${newBom.id}`);
  };

  const addComponentRow = () => {
    setComponents([...components, { id: Date.now(), partNumber: '', name: '', quantity: 1, unit: 'pcs', cost: 0 }]);
  };
  const removeComponentRow = (id) => {
    if (components.length > 1) setComponents(components.filter(c => c.id !== id));
  };
  const updateComponent = (id, field, value) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addOperationRow = () => {
    setOperations([...operations, { id: Date.now(), name: '', workCenter: '', duration: '0 mins' }]);
  };
  const removeOperationRow = (id) => {
    if (operations.length > 1) setOperations(operations.filter(o => o.id !== id));
  };
  const updateOperation = (id, field, value) => {
    setOperations(operations.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Create New BoM</h1>
          <p className="text-sm text-surface-500 mt-1">Define an initial Bill of Materials structure and routing</p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        {/* General Information */}
        <div className="bg-surface-100 border border-surface-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-surface-800 uppercase tracking-wider mb-4 border-b border-surface-200 pb-2">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-600 uppercase">BoM Name *</label>
              <input
                required type="text" placeholder="e.g. Master Assembly v1"
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-600 uppercase">Target Product *</label>
              <select
                required className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="">Select a Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-semibold text-surface-600 uppercase">Description</label>
            <textarea
              rows={2} placeholder="BoM purpose or assembly instructions..."
              className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Components List */}
        <div className="bg-surface-100 border border-surface-200 rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-end mb-4 border-b border-surface-200 pb-2">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-surface-400" />
              <h2 className="text-sm font-semibold text-surface-800 uppercase tracking-wider">Components List</h2>
            </div>
            <button type="button" onClick={addComponentRow} className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md flex items-center gap-1">
               <Plus size={14} /> Add Part
            </button>
          </div>
          
          <div className="space-y-2 overflow-x-auto min-w-[700px]">
            <div className="grid grid-cols-[1.5fr_2fr_80px_80px_100px_auto] gap-3 px-2 mb-2 text-xs font-semibold text-surface-500 uppercase">
              <div>Part Number</div>
              <div>Component Name</div>
              <div>Qty</div>
              <div>Unit</div>
              <div>Cost ($)</div>
              <div className="w-8"></div>
            </div>
            {components.map((comp, idx) => (
              <div key={comp.id} className="grid grid-cols-[1.5fr_2fr_80px_80px_100px_auto] gap-3 items-center bg-surface-50 p-2 rounded-lg border border-surface-200">
                <input required={idx === 0} type="text" placeholder="e.g. PN-1234" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm font-mono focus:outline-none focus:border-primary-400" value={comp.partNumber} onChange={e => updateComponent(comp.id, 'partNumber', e.target.value)} />
                <input required={idx === 0} type="text" placeholder="e.g. M3 Screw" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm focus:outline-none focus:border-primary-400" value={comp.name} onChange={e => updateComponent(comp.id, 'name', e.target.value)} />
                <input required={idx === 0} type="number" min="0.1" step="0.1" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm text-right focus:outline-none focus:border-primary-400" value={comp.quantity} onChange={e => updateComponent(comp.id, 'quantity', parseFloat(e.target.value) || 0)} />
                <select className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm focus:outline-none focus:border-primary-400" value={comp.unit} onChange={e => updateComponent(comp.id, 'unit', e.target.value)}>
                  <option value="pcs">pcs</option><option value="kg">kg</option><option value="ml">ml</option><option value="m">m</option>
                </select>
                <input required={idx === 0} type="number" min="0" step="0.01" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm text-right focus:outline-none focus:border-primary-400" value={comp.cost} onChange={e => updateComponent(comp.id, 'cost', parseFloat(e.target.value) || 0)} />
                <button type="button" onClick={() => removeComponentRow(comp.id)} disabled={components.length === 1} className="p-1.5 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Routing / Operations */}
        <div className="bg-surface-100 border border-surface-200 rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-end mb-4 border-b border-surface-200 pb-2">
            <div className="flex items-center gap-2">
              <Cog size={16} className="text-surface-400" />
              <h2 className="text-sm font-semibold text-surface-800 uppercase tracking-wider">Manufacturing Operations</h2>
            </div>
            <button type="button" onClick={addOperationRow} className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md flex items-center gap-1">
               <Plus size={14} /> Add Operation
            </button>
          </div>
          
          <div className="space-y-2 overflow-x-auto min-w-[600px]">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_auto] gap-3 px-2 mb-2 text-xs font-semibold text-surface-500 uppercase">
              <div>Operation Name</div>
              <div>Work Center</div>
              <div>Duration</div>
              <div className="w-8"></div>
            </div>
            {operations.map((op, idx) => (
              <div key={op.id} className="grid grid-cols-[2fr_1.5fr_1fr_auto] gap-3 items-center bg-surface-50 p-2 rounded-lg border border-surface-200">
                <input required={idx === 0} type="text" placeholder="e.g. SMT Assembly" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm focus:outline-none focus:border-primary-400" value={op.name} onChange={e => updateOperation(op.id, 'name', e.target.value)} />
                <input required={idx === 0} type="text" placeholder="e.g. Line 1" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm focus:outline-none focus:border-primary-400" value={op.workCenter} onChange={e => updateOperation(op.id, 'workCenter', e.target.value)} />
                <input required={idx === 0} type="text" placeholder="e.g. 1.5 hrs" className="w-full px-2 py-1.5 bg-white border border-surface-200 rounded text-sm focus:outline-none focus:border-primary-400" value={op.duration} onChange={e => updateOperation(op.id, 'duration', e.target.value)} />
                <button type="button" onClick={() => removeOperationRow(op.id)} disabled={operations.length === 1} className="p-1.5 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition shadow-sm">
            <Save size={18} /> Save BoM
          </button>
        </div>
      </motion.form>
    </div>
  );
}
