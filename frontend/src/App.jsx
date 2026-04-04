import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Rocket, ClipboardList, Settings as SettingsIcon, Menu, 
  MessageSquare, LogOut, Loader2, Mail, Users, FileText, Layout, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// WhatsApp Pages
import Dashboard from './pages/Dashboard';
import CampaignCreator from './pages/CampaignCreator';
import MessageLogs from './pages/MessageLogs';
import Chat from './pages/Chat';

// Email Pages
import EmailDashboard from './pages/EmailDashboard';
import EmailCampaigns from './pages/EmailCampaigns';
import EmailTemplates from './pages/EmailTemplates';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

import Login from './pages/Login';
import { authService } from './services/api';

const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.verify();
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <div className="min-h-screen bg-gray-50 flex">
              {/* Sidebar */}
              <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm">
                <div className="p-8">
                  <div className="flex items-center space-x-3 text-blue-600 mb-2">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-gray-900 italic">BlastApp</span>
                  </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide py-4">
                  {/* WhatsApp Section */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">WhatsApp System</h3>
                    <div className="space-y-1">
                      <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="WA Dashboard" />
                      <NavItem to="/chat" icon={<MessageSquare className="w-5 h-5" />} label="Live Chat" />
                      <NavItem to="/wa-campaign" icon={<Rocket className="w-5 h-5" />} label="WA Campaign" />
                    </div>
                  </div>

                  {/* Email Section */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Email Marketing</h3>
                    <div className="space-y-1">
                      <NavItem to="/email-dashboard" icon={<BarChart3Icon className="w-5 h-5" />} label="Email Stats" />
                      <NavItem to="/email-campaigns" icon={<Mail className="w-5 h-5" />} label="Mail Blasts" />
                      <NavItem to="/email-templates" icon={<Layout className="w-5 h-5" />} label="Templates" />
                    </div>
                  </div>

                  {/* CRM Section */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contacts & Data</h3>
                    <div className="space-y-1">
                      <NavItem to="/contacts" icon={<Users className="w-5 h-5" />} label="Contact List" />
                      <NavItem to="/wa-logs" icon={<ClipboardList className="w-5 h-5" />} label="WA History" />
                    </div>
                  </div>

                  {/* System Section */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Administration</h3>
                    <div className="space-y-1">
                      <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Configuration" />
                    </div>
                  </div>
                </nav>

                {/* Footer User Profile */}
                <div className="p-6 border-t border-gray-100">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none mb-1">{user?.name || 'Admin'}</p>
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{user?.role || 'Admin'}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-[#FBFBFF]">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-50">
                   <div className="flex items-center space-x-2 text-blue-600">
                    <Rocket className="w-6 h-6" />
                    <span className="text-lg font-bold text-gray-900 uppercase italic">BlastApp</span>
                  </div>
                  <Menu className="w-6 h-6 text-gray-600" />
                </header>

                <div className="p-0 md:p-10 lg:p-12 max-w-[1600px] mx-auto min-h-screen">
                   <AnimatedRoutes />
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/wa-campaign" element={<CampaignCreator />} />
          <Route path="/wa-logs" element={<MessageLogs />} />
          
          <Route path="/email-dashboard" element={<EmailDashboard />} />
          <Route path="/email-campaigns" element={<EmailCampaigns />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
          
          <Route path="*" element={<Navigate to="/email-dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold group
      ${isActive 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02] -translate-y-0.5' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}
    `}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110`}>
      {icon}
    </div>
    <span className="text-[13px] tracking-tight">{label}</span>
  </NavLink>
);

const BarChart3Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);

export default App;
