// ============================================================//
//  AppContext.jsx — THE BRAIN OF THE APP                      //
//  ALL state + ALL business logic lives here                  //
//  Every page calls useApp() to access this data              //
// ============================================================//

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { users, products as initialProducts, boms as initialBoms, ecos as initialEcos, notifications as initialNotifications, ROLES } from '../data/mockData';

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
      const apiBase = 'http://localhost:3000/api';
      
      const [prodRes, bomRes, ecoRes, notifRes] = await Promise.all([
        fetch(`${apiBase}/products`, { headers }),
        fetch(`${apiBase}/boms`, { headers }),
        fetch(`${apiBase}/ecos`, { headers }),
        fetch(`${apiBase}/notifications`, { headers })
      ]);

      if (prodRes.ok) setProducts((await prodRes.json()).data);
      if (bomRes.ok) setBomList((await bomRes.json()).data);
      if (ecoRes.ok) setEcoList((await ecoRes.json()).data);
      if (notifRes.ok) setNotificationList((await notifRes.json()).data);
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
  const login = useCallback(async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: 'password123' })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        switchRole(userId);
        setIsAuthenticated(true);
        fetchAllData(data.data.token);
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      // Fallback to offline mode for now if server is down
      switchRole(userId);
      setIsAuthenticated(true);
    }
  }, [switchRole, fetchAllData]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(users[0]);
  }, []);

  // ==========================================//
  //  SESSION RESTORE — Check token on mount   //
  // ==========================================//
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Validate token and restore session
    fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const matchedUser = users.find(u => u.email === data.data.email) || {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            avatar: data.data.avatar
          };
          setCurrentUser(matchedUser);
          setIsAuthenticated(true);
          fetchAllData(token);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        // Token invalid or server down — stay on mock data
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, [fetchAllData]);

  // ===========================================//
  //  PERMISSION FLAGS — Role-based access      //
  //  These control what UI each role can see    //
  // ===========================================//
  const canCreateEco = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canEditDraft = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canApprove = currentUser.role === ROLES.APPROVER || currentUser.role === ROLES.ADMIN;
  const canAccessSettings = currentUser.role === ROLES.ADMIN;
  const isReadOnly = currentUser.role === ROLES.OPERATIONS;

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const addBom = useCallback(async (bom) => {
    try {
      const res = await fetch('http://localhost:3000/api/boms', {
        method: 'POST',
        headers: authHeaders(),
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
      const res = await fetch('http://localhost:3000/api/ecos', {
        method: 'POST',
        headers: authHeaders(),
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
      const res = await fetch(`http://localhost:3000/api/ecos/${ecoId}/stage`, {
        method: 'PATCH',
        headers: authHeaders(),
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
      const res = await fetch(`http://localhost:3000/api/ecos/${ecoId}/reject`, {
        method: 'POST',
        headers: authHeaders(),
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
      const res = await fetch(`http://localhost:3000/api/ecos/${ecoId}/images`, {
        method: 'PATCH',
        headers: authHeaders(),
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
      const res = await fetch(`http://localhost:3000/api/ecos/${ecoId}/images/review/${imageChangeId}`, {
        method: 'PATCH',
        headers: authHeaders(),
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
      const res = await fetch(`http://localhost:3000/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      if (res.ok) {
        setNotificationList(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      }
    } catch (err) { console.error('Error marking notification read', err); }
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
