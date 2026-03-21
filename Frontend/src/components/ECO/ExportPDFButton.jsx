import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateECOPdf } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function ExportPDFButton({ eco }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/ecos/${eco.id}/export/pdf`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      generateECOPdf(json.data.eco, json.data.generatedBy);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg 
        border border-slate-200 bg-white text-slate-700 
        text-sm font-medium transition-all duration-150
        hover:bg-slate-50 hover:border-slate-300
        active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
      {loading ? 'Generating...' : 'Export PDF'}
    </button>
  );
}
