import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, ChevronLeft, ChevronRight, X, UserPlus, Mail, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { ROLES } from '../data/mockData';
import { sendWelcomeEmail } from '../services/emailService';
import { motion, AnimatePresence } from 'framer-motion';
import { secureGet } from '../capacitor/nativeServices';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation();
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: ROLES.ENGINEERING, status: 'Active' });
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = await secureGet('token');
        const res = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&role=${encodeURIComponent(roleFilter)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUsersList(data.data);
          setTotalPages(data.totalPages);
          setTotalUsers(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [page, searchQuery, roleFilter, refreshTrigger]);

  // Reset page when search/filter changes
  useEffect(() => { setPage(1); }, [searchQuery, roleFilter]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      console.log('Editing user:', user);
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, status: 'Active' });
    } else {
      console.log('Adding new user');
      setEditingUser(null);
      setFormData({ name: '', email: '', role: ROLES.ENGINEERING, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await secureGet('token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${API_BASE_URL}/users/${editingUser._id || editingUser.id}` : `${API_BASE_URL}/users`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingUser ? t('toasts.user_updated', 'User updated successfully') : t('toasts.user_added', 'New user added successfully'));
        
        if (!editingUser && data.tempPassword && data.data) {
          // Non-blocking EmailJS dispatch
          sendWelcomeEmail(data.data, data.tempPassword)
            .then(() => console.log('✅ Welcome email dispatched via EmailJS'))
            .catch(err => console.error('❌ Failed to dispatch welcome email:', err));
        }

        setRefreshTrigger(prev => prev + 1);
        setIsModalOpen(false);
      } else {
        showToast(t('toasts.error', 'Error') + ': ' + data.message);
      }
    } catch (err) {
      showToast(t('toasts.action_failed', 'Action failed'));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('admin.user_management')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('admin.um_sub')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
        >
          <UserPlus size={16} /> {t('admin.add_user')}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-50 relative">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder={t('admin.search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400" 
            />
          </div>
          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition text-sm font-medium ${isFilterOpen || roleFilter !== 'All' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'}`}
            >
              <Filter size={16} /> {t('admin.filter')} {roleFilter !== 'All' && '(1)'}
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-surface-200 shadow-lg rounded-lg py-2 z-10">
                <p className="px-3 py-1 text-xs font-semibold text-surface-400 uppercase">{t('admin.role')}</p>
                {['All', ...Object.values(ROLES)].map(role => (
                  <button
                    key={role}
                    onClick={() => { setRoleFilter(role); setIsFilterOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center justify-between"
                  >
                    {role === 'All' ? t('admin.filter_all', 'All') : t('roles.' + role, role)}
                    {roleFilter === role && <Check size={14} className="text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{t('admin.user')}</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{t('admin.role')}</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="animate-spin text-primary-600" size={24} />
                      <p>{t('admin.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-surface-500">
                    {t('admin.no_data')}
                  </td>
                </tr>
              ) : (
                usersList.map(user => (
                  <tr key={user.id || user._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0">{user.avatar}</div>
                        <div>
                          <p className="text-sm font-medium text-surface-800">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-surface-400 mt-0.5"><Mail size={12}/> {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-surface-600">
                        <Shield size={14} className="text-primary-500"/> {t('roles.' + user.role, user.role)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.status === 'Inactive' ? 'bg-surface-50 text-surface-500 border-surface-200' : 'bg-success-50 text-success-700 border-success-200'}`}>
                        {t('status.' + (user.status || 'Active').toLowerCase(), user.status || 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        {t('admin.edit')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalUsers > 0 && (
          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between">
            <p className="text-sm text-surface-500">
              {t('admin.showing')} <span className="font-medium text-surface-800">{(page - 1) * limit + 1}</span> {t('admin.to')} <span className="font-medium text-surface-800">{Math.min(page * limit, totalUsers)}</span> {t('admin.of')} <span className="font-medium text-surface-800">{totalUsers}</span> {t('admin.users_count')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 bg-white hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> {t('admin.prev')}
              </button>
              <div className="px-3 py-1.5 text-sm font-medium text-surface-700">
                {t('admin.page')} {page} {t('admin.of')} {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 bg-white hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('admin.next')} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-900/40 z-40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 border border-surface-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-surface-800">{editingUser ? t('admin.edit_user') : t('admin.add_new')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:bg-surface-50 p-1 rounded">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.full_name')}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.email_addr')}</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400" placeholder="e.g. john@plm.io" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.sys_role')}</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-400 flex-1">
                    {Object.values(ROLES).map(r => (
                      <option key={r} value={r}>{t('roles.' + r, r)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.status')}</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-400 flex-1">
                    <option value="Active">{t('admin.active')}</option>
                    <option value="Inactive">{t('admin.inactive')}</option>
                  </select>
                </div>
                
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-lg transition">{t('admin.cancel')}</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">{editingUser ? t('admin.save_changes') : t('admin.create_user')}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-surface-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 pointer-events-none"
          >
            <CheckCircle size={18} className="text-success-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
