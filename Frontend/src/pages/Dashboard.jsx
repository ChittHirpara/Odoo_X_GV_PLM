import { Package, Layers, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, GitBranch } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { activityTimeline } from '../data/mockData';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const activityIcons = {
  eco_created: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  eco_submitted: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  eco_approved: { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50' },
  product_updated: { icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-50' },
};

export default function Dashboard() {
  const { products, bomList, ecoList } = useApp();

  const activeProducts = products.filter(p => p.status === 'Active').length;
  const activeBoms = bomList.filter(b => b.status === 'Active').length;
  const pendingEcos = ecoList.filter(e => e.stage !== 'Done').length;
  const approvedEcos = ecoList.filter(e => e.stage === 'Done').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Overview of your product lifecycle management</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title="Total Products" value={products.length} subtitle={`${activeProducts} active`} icon={Package} color="primary" delay={0} />
        <Card title="Active BoMs" value={activeBoms} subtitle={`${bomList.length} total`} icon={Layers} color="success" delay={1} />
        <Card title="Pending ECOs" value={pendingEcos} subtitle="Awaiting action" icon={AlertCircle} color="warning" delay={2} />
        <Card title="Completed ECOs" value={approvedEcos} subtitle="Applied to production" icon={CheckCircle} color="purple" delay={3} />
      </div>

      {/* Two columns: Recent ECOs + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pending ECOs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-white rounded-xl border border-surface-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-800">Active Change Orders</h2>
            <Link to="/eco" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {ecoList.filter(e => e.stage !== 'Done').slice(0, 5).map(eco => (
              <Link key={eco.id} to={`/eco/${eco.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-surface-400">{eco.ecoNumber}</span>
                    <StatusBadge status={eco.type} />
                  </div>
                  <p className="text-sm font-medium text-surface-800 truncate">{eco.title}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{eco.productName} · by {eco.createdByName}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <StatusBadge status={eco.stage} />
                  <StatusBadge status={eco.priority} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="text-base font-semibold text-surface-800">Recent Activity</h2>
          </div>
          <div className="px-6 py-4 space-y-0">
            {activityTimeline.slice(0, 6).map((activity, idx) => {
              const config = activityIcons[activity.type] || activityIcons.eco_created;
              const Icon = config.icon;
              return (
                <div key={activity.id} className="flex gap-3 relative pb-6 last:pb-0">
                  {/* Vertical line */}
                  {idx < 5 && (
                    <div className="absolute left-[15px] top-8 w-[2px] h-[calc(100%-16px)] bg-surface-200" />
                  )}
                  <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 relative z-10`}>
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-surface-700 leading-tight">{activity.title}</p>
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{activity.description}</p>
                    <p className="text-xs text-surface-300 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ECO Warning Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-5 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={20} className="text-primary-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary-800">Change Control Policy</h3>
          <p className="text-sm text-primary-600 mt-1">
            All modifications to Products and Bills of Materials must be submitted through an Engineering Change Order (ECO). 
            Direct editing of active data is not permitted to maintain version integrity and audit compliance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
