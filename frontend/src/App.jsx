import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Rocket, ClipboardList, Settings, Menu, MessageSquare } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CampaignCreator from './pages/CampaignCreator';
import MessageLogs from './pages/MessageLogs';
import Chat from './pages/Chat';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 text-blue-600">
              <Rocket className="w-8 h-8 font-bold" />
              <span className="text-xl font-black tracking-tight text-gray-900 uppercase italic">BlastApp</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
            <NavItem to="/chat" icon={<MessageSquare className="w-5 h-5" />} label="Live Chat" />
            <NavItem to="/create" icon={<Rocket className="w-5 h-5" />} label="New Campaign" />
            <NavItem to="/logs" icon={<ClipboardList className="w-5 h-5" />} label="Message Logs" />
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-inner">A</div>
              <div>
                <p className="text-sm font-bold text-gray-900">Admin User</p>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Online</p>
                </div>
              </div>
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

          <div className="p-0 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/create" element={<CampaignCreator />} />
              <Route path="/logs" element={<MessageLogs />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default App;
