import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ title = 'No data found', description = 'There are no items to display.', icon: Icon = Inbox, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50/50"
    >
      <div className="w-16 h-16 bg-surface-200/50 rounded-2xl shadow-sm flex items-center justify-center mb-5 text-surface-500">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-surface-800 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-surface-500 font-medium max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
