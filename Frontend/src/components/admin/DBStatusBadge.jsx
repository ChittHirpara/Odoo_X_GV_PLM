import { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { secureGet } from '../../capacitor/nativeServices';
import { useTranslation } from 'react-i18next';

export default function DBStatusBadge() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = await secureGet('token');
      if (!token) return; // Don't poll if not logged in
      try {
        const res = await fetch('http://localhost:5000/api/db/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return; // Silently skip on auth errors
        const data = await res.json();
        if (data.success) {
          setStatus(data.data);
          setLogs(data.data.recentLogs || []);
        }
      } catch (err) {
        // Silently ignore — server may not be ready yet
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const isNormal  = status.current === 'postgres';
  const isSyncing = status.isSyncing;

  const config = isNormal
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle }
    : isSyncing
    ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', icon: RefreshCw }
    : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', icon: AlertTriangle };

  const StatusIcon = config.icon;

  return (
    <div className="relative">
      {/* Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${config.bg} ${config.border} ${config.text}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot} ${!isNormal ? 'animate-pulse' : ''}`} />
        <StatusIcon size={12} className={isSyncing ? 'animate-spin' : ''} />
        <span className="hidden sm:inline">
          {isSyncing
            ? t('db_status.syncing', 'Syncing...')
            : isNormal
            ? 'Supabase'
            : 'Disconnected'}
        </span>
      </button>

      {/* Dropdown */}
      {expanded && (
        <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-surface-500" />
              <h3 className="text-sm font-semibold text-surface-800">{t('db_status.title', 'Database Status')}</h3>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
              {t('db_status.primary', 'Primary')}
            </span>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Connection status */}
            <div className={`p-3 rounded-lg border ${status.postgres?.healthy ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1">Supabase PostgreSQL</p>
              <div className="flex items-center gap-1.5">
                {status.postgres?.healthy
                  ? <CheckCircle size={14} className="text-emerald-500" />
                  : <XCircle size={14} className="text-red-500" />}
                <span className={`text-sm font-semibold ${status.postgres?.healthy ? 'text-emerald-700' : 'text-red-700'}`}>
                  {status.postgres?.healthy ? t('status.connected', 'Connected') : t('status.down', 'Down')}
                </span>
              </div>
            </div>

            {/* Status message */}
            <p className="text-[11px] text-surface-500 italic text-center px-1">
              {status.message}
            </p>
            
            <button 
              onClick={() => setExpanded(false)}
              className="w-full py-2 text-[11px] font-bold text-surface-400 hover:text-surface-600 transition-colors border-t border-surface-50"
            >
              {t('actions.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
