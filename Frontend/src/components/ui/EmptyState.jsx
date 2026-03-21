import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There are no items to display.', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-sm text-surface-400 mb-4 text-center max-w-sm">{description}</p>
      {action && action}
    </div>
  );
}
