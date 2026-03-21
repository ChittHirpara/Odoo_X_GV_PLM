import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ECO_STAGES } from '../data/mockData';
import { Plus, Trash2, GripVertical, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { canAccessSettings } = useApp();
  const [stages, setStages] = useState([...ECO_STAGES]);
  const [newStage, setNewStage] = useState('');
  const [rules, setRules] = useState([
    { id: 'r1', name: 'Require approval for BoM changes', enabled: true },
    { id: 'r2', name: 'Auto-create version on approval', enabled: true },
    { id: 'r3', name: 'Require comment on rejection', enabled: true },
    { id: 'r4', name: 'Notify creator on stage change', enabled: false },
    { id: 'r5', name: 'Allow multi-approver workflow', enabled: false },
  ]);

  if (!canAccessSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield size={40} className="text-surface-300 mb-4" />
        <p className="text-lg font-semibold text-surface-600 mb-2">Admin Access Required</p>
        <p className="text-sm text-surface-400 mb-4">Only administrators can access system settings.</p>
        <Link to="/" className="text-sm text-primary-600 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const addStage = () => {
    if (newStage.trim() && !stages.includes(newStage.trim())) {
      const insertIdx = stages.length - 1;
      const updated = [...stages];
      updated.splice(insertIdx, 0, newStage.trim());
      setStages(updated);
      setNewStage('');
    }
  };

  const removeStage = (idx) => {
    if (idx === 0 || idx === stages.length - 1) return;
    setStages(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Settings</h1>
        <p className="text-sm text-surface-500 mt-1">Configure ECO workflow stages and approval rules</p>
      </div>

      {/* ECO Stages */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-surface-800">ECO Workflow Stages</h2>
          <span className="text-xs text-surface-400">{stages.length} stages</span>
        </div>

        <div className="space-y-2">
          {stages.map((stage, idx) => {
            const isFixed = idx === 0 || idx === stages.length - 1;
            return (
              <div
                key={`${stage}-${idx}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  isFixed ? 'bg-surface-50 border-surface-200' : 'bg-white border-surface-200 hover:border-surface-300'
                }`}
              >
                <GripVertical size={16} className={`flex-shrink-0 ${isFixed ? 'text-surface-200' : 'text-surface-300 cursor-grab'}`} />
                <div className="flex-1 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                  <span className="text-sm font-medium text-surface-700">{stage}</span>
                </div>
                {isFixed ? (
                  <span className="text-xs text-surface-300 italic">Fixed</span>
                ) : (
                  <button onClick={() => removeStage(idx)} className="p-1 text-surface-400 hover:text-danger-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newStage}
            onChange={e => setNewStage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStage()}
            placeholder="e.g., QA Review"
            className="flex-1 px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
          <button
            onClick={addStage}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={14} /> Add Stage
          </button>
        </div>

        <div className="flex items-start gap-2 text-xs text-surface-400 bg-surface-50 rounded-lg p-3">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>The first and last stages (New and Done) are fixed and cannot be removed. Add intermediate stages like "QA Review" or "Manager Approval" between them.</span>
        </div>
      </motion.div>

      {/* Approval Rules */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-surface-800">Approval Rules</h2>

        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-surface-200 hover:border-surface-300 transition-colors">
              <span className="text-sm text-surface-700">{rule.name}</span>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                  rule.enabled ? 'bg-primary-500 justify-end' : 'bg-surface-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm mx-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
