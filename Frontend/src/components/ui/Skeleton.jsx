export default function Skeleton({ className = '', count = 1 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse-soft bg-surface-200 rounded-lg ${className}`} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 h-4 bg-surface-200 rounded animate-pulse-soft" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-surface-100 rounded animate-pulse-soft" style={{ animationDelay: `${(i * cols + j) * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
