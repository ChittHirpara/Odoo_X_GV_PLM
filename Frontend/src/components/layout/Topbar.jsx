import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { users } from '../../data/mockData';

export default function Topbar() {
  const { currentUser, switchRole, notificationList, markNotificationRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, BoMs, ECOs..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
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
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in">
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
            <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in">
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
    </header>
  );
}
