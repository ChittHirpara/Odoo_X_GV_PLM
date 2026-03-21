// ============================================================//
//  Topbar.jsx — HEADER: Search + Notifications + Role Switch  //
//  Bell icon with unread count badge                          //
//  Avatar dropdown to switch roles (demo feature)             //
// ============================================================//
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Check, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { users } from '../../data/mockData';
import GlobalSearch from '../search/GlobalSearch';

export default function Topbar({ setMobileMenuOpen }) {
  const { currentUser, switchRole, notificationList, markNotificationRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notificationList.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleColors = {
    'Engineering User': 'bg-blue-100 text-blue-700',
    'Approver': 'bg-amber-100 text-amber-700',
    'Operations User': 'bg-green-100 text-green-700',
    'Admin': 'bg-purple-100 text-purple-700',
  };

  return (
    <header className="h-16 bg-surface-50/80 backdrop-blur-md shadow-sm border-b border-surface-200/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="sm:hidden p-2 -ml-2 text-surface-500 hover:bg-surface-50 rounded-lg"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className={`relative flex-1 block`}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="w-full text-left pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-400 focus:outline-none hover:border-primary-300 hover:bg-white transition-all flex justify-between items-center"
          >
            <span>Search ECOs, Products, BoMs...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-slate-400">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className={`flex items-center gap-2 sm:gap-4 ml-4 flex`}>
        
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowGlobalSearch(true)}
          className="sm:hidden p-2 text-surface-500 hover:bg-surface-50 rounded-lg"
        >
          <Search size={20} />
        </button>
        {/* Notifications */}
        {/* ======================================== */}
        {/* NOTIFICATIONS — Bell icon + dropdown      */}
        {/* Shows unread count badge                   */}
        {/* ======================================== */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Bell size={20} className="text-surface-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-surface-100 rounded-xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-800">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs text-primary-600 font-medium">{unreadCount} new</span>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificationList.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.ecoId) {
                        navigate(`/eco/${n.ecoId}`);
                        setShowNotif(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-primary-50/40' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                    <div>
                      <p className={`text-sm ${!n.read ? 'font-medium text-surface-800' : 'text-surface-600'}`}>{n.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{n.timestamp}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User / Role Switcher */}
        {/* ======================================== */}
        {/* ROLE SWITCHER — Click to change user      */}
        {/* Shows all 4 demo users to swap between    */}
        {/* ======================================== */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{currentUser.avatar}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-surface-800 leading-tight">{currentUser.name}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${roleColors[currentUser.role]}`}>
                {currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-surface-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-14 w-64 bg-surface-100 rounded-xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Switch Role (Demo)</p>
              </div>
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => { switchRole(user.id); setShowUserMenu(false); }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-50 transition-colors ${currentUser.id === user.id ? 'bg-primary-50/50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800">{user.name}</p>
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                  {currentUser.id === user.id && <Check size={16} className="text-primary-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <GlobalSearch open={showGlobalSearch} setOpen={setShowGlobalSearch} />
    </header>
  );
}
