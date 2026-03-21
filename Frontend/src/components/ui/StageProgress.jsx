import { Check } from 'lucide-react';
import { ECO_STAGES } from '../../data/mockData';

export default function StageProgress({ currentStage }) {
  const currentIdx = ECO_STAGES.indexOf(currentStage);

  return (
    <div className="flex items-center gap-0 w-full">
      {ECO_STAGES.map((stage, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isComplete
                    ? 'bg-success-500 border-success-500 text-white'
                    : isCurrent
                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white border-surface-300 text-surface-400'
                }`}
              >
                {isComplete ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium whitespace-nowrap ${
                  isComplete ? 'text-success-600' : isCurrent ? 'text-primary-600' : 'text-surface-400'
                }`}
              >
                {stage}
              </span>
            </div>

            {/* Connector Line */}
            {idx < ECO_STAGES.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 relative -mt-5">
                <div className="absolute inset-0 bg-surface-200 rounded-full" />
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-success-500 w-full' : isCurrent ? 'bg-primary-400 w-1/2' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
