import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
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
import { AnimatePresence, motion } from 'framer-motion';

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
          <Route path="/" element={<LandingPage />} />
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

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (location.pathname === '/' || location.pathname === '/login') {
    return <AnimatedRoutes />;
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

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
}
