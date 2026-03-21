import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, FileText, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/bom', icon: Layers, label: 'Bills of Materials' },
  { to: '/eco', icon: FileText, label: 'Change Orders' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { canAccessSettings } = useApp();
  const location = useLocation();

  const filteredNav = navItems.filter(item => !item.adminOnly || canAccessSettings);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-surface-200 z-40 flex flex-col shadow-sm"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-surface-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold text-surface-800 tracking-tight">PLM</h1>
                <p className="text-[10px] text-surface-400 -mt-1 font-medium tracking-wider uppercase">Change Control</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-surface-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
