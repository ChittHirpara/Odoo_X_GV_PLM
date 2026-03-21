import { motion } from 'framer-motion';

export default function Card({ title, value, subtitle, icon: Icon, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgMap = {
    primary: 'bg-primary-50',
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    danger: 'bg-danger-50',
    purple: 'bg-purple-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-surface-800 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${bgMap[color]} flex items-center justify-center`}>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
              <Icon size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
