const statusStyles = {
  Active: 'bg-success-50 text-success-700 ring-success-500/20',
  Archived: 'bg-surface-100 text-surface-500 ring-surface-500/20',
  Draft: 'bg-warning-50 text-warning-600 ring-warning-500/20',
  New: 'bg-blue-50 text-blue-700 ring-blue-500/20',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-500/20',
  Approval: 'bg-purple-50 text-purple-700 ring-purple-500/20',
  Done: 'bg-success-50 text-success-700 ring-success-500/20',
  High: 'bg-danger-50 text-danger-600 ring-danger-500/20',
  Medium: 'bg-warning-50 text-warning-600 ring-warning-500/20',
  Low: 'bg-surface-100 text-surface-500 ring-surface-500/20',
  Product: 'bg-blue-50 text-blue-700 ring-blue-500/20',
  BoM: 'bg-indigo-50 text-indigo-700 ring-indigo-500/20',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const style = statusStyles[status] || 'bg-surface-100 text-surface-600 ring-surface-500/20';
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ring-1 ring-inset ${style} ${sizeClass}`}>
      {status}
    </span>
  );
}
