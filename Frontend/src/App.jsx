// ============================================================//
//  App.jsx — ROOT FILE: All routes + layout wrapper           //
//  Landing page at '/' bypasses sidebar layout                //
//  15 routes total, animated with Framer Motion               //
// ============================================================//
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import BillOfMaterials from './pages/BillOfMaterials';
import CreateBom from './pages/CreateBom';
import BomDetail from './pages/BomDetail';
import EcoList from './pages/EcoList';
import CreateEco from './pages/CreateEco';
import EcoDetail from './pages/EcoDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import EcoStages from './pages/EcoStages';
import ApprovalRules from './pages/ApprovalRules';
import { useApp } from './context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================//
//  ANIMATED ROUTES — Page transitions       //
//  Uses AnimatePresence for smooth swaps    //
// ==========================================//
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/bom" element={<BillOfMaterials />} />
          <Route path="/bom/create" element={<CreateBom />} />
          <Route path="/bom/:id" element={<BomDetail />} />
          <Route path="/eco" element={<EcoList />} />
          <Route path="/eco/create" element={<CreateEco />} />
          <Route path="/eco/:id" element={<EcoDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/eco-stages" element={<EcoStages />} />
          <Route path="/rules" element={<ApprovalRules />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================//
//  APP LAYOUT — Sidebar + Topbar wrapper    //
//  Skips layout for '/' and '/login'        //
// ==========================================//
function AppLayout() {
  const { isAuthenticated, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Landing page — always public, no sidebar/topbar
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  // Login page — public, no sidebar/topbar
  if (location.pathname === '/login') {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Login />;
  }

  // Show loading while restoring session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-50 flex flex-col sm:block">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`transition-all duration-300 flex-1 flex flex-col ${collapsed ? 'sm:ml-[72px]' : 'sm:ml-[72px] lg:ml-[256px]'}`}>
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

// ==========================================//
//  APP ROOT — Router + AppProvider          //
// ==========================================//
export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
}
