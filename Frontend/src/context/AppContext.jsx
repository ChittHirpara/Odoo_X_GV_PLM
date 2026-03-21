import { createContext, useContext, useState, useCallback } from 'react';
import { users, products as initialProducts, boms as initialBoms, ecos as initialEcos, notifications as initialNotifications, ROLES } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [products] = useState(initialProducts);
  const [bomList] = useState(initialBoms);
  const [ecoList, setEcoList] = useState(initialEcos);
  const [notificationList, setNotificationList] = useState(initialNotifications);

  const switchRole = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  const canCreateEco = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canEditDraft = currentUser.role === ROLES.ENGINEERING || currentUser.role === ROLES.ADMIN;
  const canApprove = currentUser.role === ROLES.APPROVER || currentUser.role === ROLES.ADMIN;
  const canAccessSettings = currentUser.role === ROLES.ADMIN;
  const isReadOnly = currentUser.role === ROLES.OPERATIONS;

  const addEco = useCallback((eco) => {
    const newEco = {
      ...eco,
      id: `eco${Date.now()}`,
      ecoNumber: `ECO-2026-${String(ecoList.length + 1).padStart(3, '0')}`,
      stage: 'New',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
      approvalLogs: [],
      attachedImages: eco.attachedImages || [],
      imageChanges: eco.imageChanges || [],
    };
    setEcoList(prev => [newEco, ...prev]);
    return newEco;
  }, [currentUser, ecoList.length]);

  const updateEcoStage = useCallback((ecoId, newStage, comment = '') => {
    setEcoList(prev => prev.map(eco => {
      if (eco.id !== ecoId) return eco;
      const logEntry = {
        user: currentUser.name,
        action: newStage === 'Approval' ? 'Submitted for Approval' : newStage === 'Done' ? 'Approved' : `Moved to ${newStage}`,
        timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        comment,
      };
      return { ...eco, stage: newStage, approvalLogs: [...eco.approvalLogs, logEntry] };
    }));
  }, [currentUser]);

  const rejectEco = useCallback((ecoId, comment = '') => {
    setEcoList(prev => prev.map(eco => {
      if (eco.id !== ecoId) return eco;
      const logEntry = {
        user: currentUser.name,
        action: 'Rejected',
        timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        comment,
      };
      return { ...eco, stage: 'New', approvalLogs: [...eco.approvalLogs, logEntry] };
    }));
  }, [currentUser]);

  const updateEcoImages = useCallback((ecoId, images) => {
    setEcoList(prev => prev.map(eco =>
      eco.id === ecoId ? { ...eco, attachedImages: images } : eco
    ));
  }, []);

  const reviewEcoImage = useCallback((ecoId, imageChangeId, status, comment) => {
    setEcoList(prev => prev.map(eco => {
      if (eco.id !== ecoId) return eco;
      const updatedChanges = (eco.imageChanges || []).map(ic =>
        (ic.id === imageChangeId) ? { ...ic, reviewStatus: status, reviewComment: comment || '', reviewedBy: currentUser.name } : ic
      );
      return { ...eco, imageChanges: updatedChanges };
    }));
  }, [currentUser]);

  const markNotificationRead = useCallback((notifId) => {
    setNotificationList(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const value = {
    currentUser,
    users,
    switchRole,
    products,
    bomList,
    ecoList,
    addEco,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
