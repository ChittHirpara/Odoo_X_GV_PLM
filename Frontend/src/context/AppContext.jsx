// ============================================================//
//  AppContext.jsx — THE BRAIN OF THE APP                      //
//  ALL state + ALL business logic lives here                  //
//  Every page calls useApp() to access this data              //
// ============================================================//

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { users, products as initialProducts, boms as initialBoms, ecos as initialEcos, notifications as initialNotifications, ROLES } from '../data/mockData';
import { secureSet, secureGet, secureRemove } from '../capacitor/nativeServices';
import i18n from '../i18n/index';
import { API_BASE_URL } from '../config/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {

  // ================================//
  //  GLOBAL STATE — All app data    //
  // ================================//
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [products, setProducts] = useState(initialProducts);
  const [bomList, setBomList] = useState(initialBoms);
  const [ecoList, setEcoList] = useState(initialEcos);
  const [notificationList, setNotificationList] = useState(initialNotifications);

  // ================================================//
  //  SESSION RESTORE — Persist login across refresh //
  // ================================================//
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================//
  //  API DATA FETCHING — Backend integration  //
  // ==========================================//
  const fetchAllData = useCallback(async (token) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const apiBase = `${API_BASE_URL}`;
      
      const [prodRes, bomRes, ecoRes, notifRes] = await Promise.all([
        fetch(`${apiBase}/products`, { headers }),
        fetch(`${apiBase}/boms`, { headers }),
        fetch(`${apiBase}/ecos`, { headers }),
        fetch(`${apiBase}/notifications`, { headers })
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json().catch(() => ({ data: [] }));
        setProducts(prodData?.data || []);
      }
      if (bomRes.ok) {
        const bomData = await bomRes.json().catch(() => ({ data: [] }));
        setBomList(bomData?.data || []);
      }
      if (ecoRes.ok) {
        const ecoData = await ecoRes.json().catch(() => ({ data: [] }));
        setEcoList((ecoData?.data || []).filter(Boolean));
      }
      if (notifRes.ok) {
        const notifData = await notifRes.json().catch(() => ({ data: [] }));
        setNotificationList(notifData?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch data from backend', err);
    }
  }, []);

  // ================================//
  //  ROLE SWITCHER (demo feature)   //
  // ================================//
  const switchRole = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  // ==========================================//
  //  LOGIN / LOGOUT — Auth state              //
  // ==========================================//
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        await secureSet('token', data.data.token);
        const apiUser = data.data.user;
        // Use the real user data from the API (role comes from DB)
        setCurrentUser({
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          avatar: apiUser.avatar || apiUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        });
        setIsAuthenticated(true);
        fetchAllData(data.data.token);
        
        // Fetch language preset
        fetch(`${API_BASE_URL}/preferences`, {
          headers: { 'Authorization': `Bearer ${data.data.token}` }
        })
        .then(r => r.json())
        .then(prefData => {
          if (prefData.success && prefData.data.language) {
            const savedLang = prefData.data.language;
            i18n.changeLanguage(savedLang);
            localStorage.setItem('plm_language', savedLang);
          }
        })
        .catch(console.error);

        return { success: true };
      } else {
        return { error: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Server unavailable. Please try again.' };
    }
  }, [fetchAllData]);

  const logout = useCallback(async () => {
    await secureRemove('token');
    setIsAuthenticated(false);
    setCurrentUser(users[0]);
  }, []);

  // ==========================================//
  //  SESSION RESTORE — Check token on mount   //
  // ==========================================//
  useEffect(() => {
    const restoreSession = async () => {
      const token = await secureGet('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentUser({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            avatar: data.data.avatar || data.data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          });
          setIsAuthenticated(true);
          fetchAllData(token);

          // Fetch language preset
          fetch(`${API_BASE_URL}/preferences`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(r => r.json())
          .then(prefData => {
            if (prefData.success && prefData.data.language) {
              const savedLang = prefData.data.language;
              i18n.changeLanguage(savedLang);
              localStorage.setItem('plm_language', savedLang);
            }
          })
          .catch(console.error);
        } else {
          await secureRemove('token');
        }
      } catch {
        await secureRemove('token');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [fetchAllData]);

  // ==========================================//
  //  LIVE UPDATES — Poll every 30s            //
  // ==========================================//
  useEffect(() => {
    if (!isAuthenticated) return;
    const pollData = async () => {
      const token = await secureGet('token');
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const apiBase = `${API_BASE_URL}`;

        const [notifRes, ecoRes] = await Promise.all([
          fetch(`${apiBase}/notifications`, { headers }),
          fetch(`${apiBase}/ecos`, { headers }),
        ]);

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.data) setNotificationList(notifData.data);
        }
        if (ecoRes.ok) {
          const ecoData = await ecoRes.json();
          if (ecoData.data) setEcoList(ecoData.data.filter(Boolean));
        }
      } catch {}
    };

    const interval = setInterval(pollData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ===========================================//
  //  PERMISSION FLAGS — Role-based access      //
  //  These control what UI each role can see    //
  // ===========================================//
  const canCreateEco = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canEditDraft = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canApprove = currentUser.role === ROLES.APPROVER || currentUser.role === ROLES.ADMIN;
  const canAccessSettings = currentUser.role === ROLES.ADMIN;
  const isReadOnly = currentUser.role === ROLES.OPERATIONS;

  const authHeaders = async () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${await secureGet('token')}`
  });

  const addBom = useCallback(async (bom) => {
    try {
      const res = await fetch(`${API_BASE_URL}/boms`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(bom)
      });
      if (res.ok) {
        const { data } = await res.json();
        setBomList(prev => [data, ...prev]);
        return data;
      }
    } catch (err) { console.error('Error adding BOM', err); }
  }, []);

  const addEco = useCallback(async (eco) => {
    try {
      const payload = { ...eco, createdBy: currentUser.id };
      const res = await fetch(`${API_BASE_URL}/ecos`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { data } = await res.json();
        setEcoList(prev => [data, ...prev]);
        return data;
      }
    } catch (err) { console.error('Error adding ECO', err); }
  }, [currentUser.id]);

  const updateEcoStage = useCallback(async (ecoId, newStage, comment = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/ecos/${ecoId}/stage`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({ stage: newStage, comment })
      });
      if (res.ok) {
        const { data } = await res.json();
        setEcoList(prev => prev.map(eco => eco.id === ecoId ? data : eco));
      } else {
        const errData = await res.json();
        console.error('Backend returned error:', errData);
        alert(`Failed to update ECO: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) { 
      console.error('Error updating ECO stage', err);
      alert('Network error while updating ECO');
    }
  }, []);

  const rejectEco = useCallback(async (ecoId, comment = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/ecos/${ecoId}/reject`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ comment })
      });
      if (res.ok) {
        const { data } = await res.json();
        setEcoList(prev => prev.map(eco => eco.id === ecoId ? data : eco));
      }
    } catch (err) { console.error('Error rejecting ECO', err); }
  }, []);

  const updateEcoImages = useCallback(async (ecoId, images) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ecos/${ecoId}/images`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({ attachedImages: images, imageChanges: [] }) // imageChanges syncs based on existing architecture
      });
      if (res.ok) {
        const { data } = await res.json();
        setEcoList(prev => prev.map(eco => eco.id === ecoId ? data : eco));
      }
    } catch (err) { console.error('Error updating ECO images', err); }
  }, []);

  const reviewEcoImage = useCallback(async (ecoId, imageChangeId, status, comment) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ecos/${ecoId}/images/review/${imageChangeId}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({ status, comment })
      });
      if (res.ok) {
        const { data } = await res.json();
        setEcoList(prev => prev.map(eco => eco.id === ecoId ? data : eco));
      }
    } catch (err) { console.error('Error reviewing ECO image', err); }
  }, []);

  const markNotificationRead = useCallback(async (notifId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: await authHeaders()
      });
      if (res.ok) {
        setNotificationList(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      }
    } catch (err) { console.error('Error marking notification read', err); }
  }, []);

  const fetchPaginatedEcos = useCallback(async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/ecos?${query}`, {
        headers: { 'Authorization': `Bearer ${await secureGet('token')}` }
      });
      return await res.json();
    } catch (err) { return { success: false, message: err.message }; }
  }, []);

  const fetchPaginatedProducts = useCallback(async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/products?${query}`, {
        headers: { 'Authorization': `Bearer ${await secureGet('token')}` }
      });
      return await res.json();
    } catch (err) { return { success: false, message: err.message }; }
  }, []);

  const fetchPaginatedBoms = useCallback(async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/boms?${query}`, {
        headers: { 'Authorization': `Bearer ${await secureGet('token')}` }
      });
      return await res.json();
    } catch (err) { return { success: false, message: err.message }; }
  }, []);

  const value = {
    isAuthenticated,
    login,
    logout,
    currentUser,
    users,
    switchRole,
    products,
    bomList,
    ecoList,
    addEco,
    addBom,
    updateEcoStage,
    rejectEco,
    updateEcoImages,
    reviewEcoImage,
    notificationList,
    markNotificationRead,
    fetchPaginatedEcos,
    fetchPaginatedProducts,
    fetchPaginatedBoms,
    canCreateEco,
    canEditDraft,
    canApprove,
    canAccessSettings,
    isReadOnly,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
