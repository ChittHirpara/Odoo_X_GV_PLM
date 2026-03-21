import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function SLATimer({ 
  enteredAt,
  stage, 
  slaStatus = 'OK', 
  percentageUsed = 0,
  warnThreshold,
  escalateThreshold,
  compact = true 
}) {
  const [timeHuman, setTimeHuman] = useState('...');
  const [currentPercentage, setCurrentPercentage] = useState(percentageUsed);
  const [currentStatus, setCurrentStatus] = useState(slaStatus);

  useEffect(() => {
    if (!enteredAt || stage === 'Done' || stage === 'Rejected') {
      setTimeHuman('Completed');
      return;
    }

    const startMs = new Date(enteredAt).getTime();
    
    const updateTimer = () => {
      const ms = Math.max(0, Date.now() - startMs);
      
      // Update string
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      let newTimeHuman = '';
      if (h > 48) newTimeHuman = `${Math.floor(h/24)}d ${h%24}h`;
      else if (h > 0) newTimeHuman = `${h}h ${m}m`;
      else newTimeHuman = `${m}m`;
      
      setTimeHuman(newTimeHuman);

      // Update status/percentage if thresholds exist
      if (escalateThreshold && warnThreshold) {
        const p = Math.min((ms / escalateThreshold) * 100, 150);
        setCurrentPercentage(p);
        if (ms >= escalateThreshold) setCurrentStatus('CRITICAL');
        else if (ms >= warnThreshold) setCurrentStatus('WARNING');
        else setCurrentStatus('OK');
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 60000); // UI updates every minute

    return () => clearInterval(intervalId);
  }, [enteredAt, escalateThreshold, warnThreshold, stage]);

  if (stage === 'Done' || stage === 'Rejected') {
    if (compact) return null;
    return (
      <div className="bg-surface-100 rounded-lg p-4 border border-surface-200">
        <p className="text-sm font-medium text-surface-500">SLA: Completed</p>
      </div>
    );
  }

  const badgeColors = {
    'OK': 'bg-slate-100 text-slate-600 border-slate-200',
    'WARNING': 'bg-amber-100 text-amber-700 border-amber-200',
    'CRITICAL': 'bg-red-100 text-red-700 border-red-200'
  };

  const barColors = {
    'OK': 'bg-green-500',
    'WARNING': 'bg-amber-500',
    'CRITICAL': 'bg-red-500'
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border ${badgeColors[currentStatus]}`}>
        {currentStatus === 'CRITICAL' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
        {currentStatus === 'WARNING' && <AlertTriangle size={10} />}
        {currentStatus === 'OK' && <Clock size={10} />}
        {timeHuman}
      </div>
    );
  }

  // Detailed mode for ECO page
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Time in {stage} stage
          </h3>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {timeHuman}
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${badgeColors[currentStatus]} border`}>
          {currentStatus === 'CRITICAL' && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
          {currentStatus === 'WARNING' && <AlertTriangle size={14} />}
          SLA {currentStatus}
        </div>
      </div>

      {warnThreshold && escalateThreshold && (
        <div className="relative pt-2">
          {/* Progress bar background */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            {/* Progress bar fill */}
            <div 
              className={`h-full ${barColors[currentStatus]} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(currentPercentage, 100)}%` }}
            />
          </div>
          
          {/* Threshold markers */}
          <div className="absolute top-2 w-full h-2 pointer-events-none">
            {/* Warn Marker */}
            <div 
              className="absolute h-4 w-0.5 bg-amber-400 top-[-4px]" 
              style={{ left: `${(warnThreshold / escalateThreshold) * 100}%` }}
            >
              <span className="absolute top-5 -ml-8 text-[10px] font-medium text-amber-600 w-16 text-center">
                Warn at {warnThreshold / 3600000}h
              </span>
            </div>
            
            {/* Escalate Marker */}
            <div 
              className="absolute h-4 w-0.5 bg-red-500 top-[-4px]" 
              style={{ left: `100%` }}
            >
              <span className="absolute top-5 -ml-8 text-[10px] font-medium text-red-600 w-16 text-center">
                Escalate at {escalateThreshold / 3600000}h
              </span>
            </div>
          </div>
          <div className="h-6" /> {/* Spacer for labels */}
        </div>
      )}
    </div>
  );
}
