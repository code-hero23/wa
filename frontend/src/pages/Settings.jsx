import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Mail, Shield, Users, Server, Save, Plus, 
  Trash2, UserPlus, Key, Info, CheckCircle, AlertCircle, RefreshCw, X, Lock
} from 'lucide-react';
import { emailService, authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [smtp, setSmtp] = useState({ host: '', port: 587, user: '', pass: '', secure: false, from_name: '', from_email: '', is_active: false });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '', role: 'employee' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, eRes] = await Promise.all([
        emailService.getSmtp(),
        authService.getEmployees()
      ]);
      if (sRes.data.settings?.length > 0) setSmtp(sRes.data.settings[0]);
      setEmployees(eRes.data.employees || []);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpSave = async (e) => {
    e.preventDefault();
    try {
      await emailService.updateSmtp(smtp);
      alert('SMTP Settings Saved');
      fetchData();
    } catch (err) {
      alert('Failed to save SMTP');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await authService.registerEmployee(newEmployee);
      setShowAddEmployee(false);
      fetchData();
      setNewEmployee({ name: '', email: '', password: '', role: 'employee' });
    } catch (err) {
      alert('Failed to create employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee account?')) return;
    try {
      await authService.deleteEmployee(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <SettingsIcon className="w-8 h-8 mr-4 text-blue-600" /> System Settings
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage global configurations and employee access.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <TabButton 
          active={activeTab === 'smtp'} 
          onClick={() => setActiveTab('smtp')} 
          icon={<Server className="w-4 h-4" />} 
          label="SMTP Configuration" 
        />
        <TabButton 
          active={activeTab === 'employees'} 
          onClick={() => setActiveTab('employees')} 
          icon={<Users className="w-4 h-4" />} 
          label="Employee Management" 
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'smtp' ? (
          <motion.div 
            key="smtp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                <Mail className="w-6 h-6 mr-3 text-blue-600" /> Outgoing Mail Server (SMTP)
              </h3>
              <form onSubmit={handleSmtpSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Host</label>
                  <input 
                    type="text" 
                    placeholder="smtp.gmail.com"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                    value={smtp.host}
                    onChange={(e) => setSmtp({...smtp, host: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Port</label>
                  <input 
                    type="number" 
                    placeholder="587"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                    value={smtp.port}
                    onChange={(e) => setSmtp({...smtp, port: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username / Email</label>
                  <input 
                    type="text" 
                    placeholder="user@example.com"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                    value={smtp.user}
                    onChange={(e) => setSmtp({...smtp, user: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password / App Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all pr-12"
                      value={smtp.pass}
                      onChange={(e) => setSmtp({...smtp, pass: e.target.value})}
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Name</label>
                  <input 
                    type="text" 
                    placeholder="BlastApp Marketing"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                    value={smtp.from_name}
                    onChange={(e) => setSmtp({...smtp, from_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Email Address</label>
                  <input 
                    type="email" 
                    placeholder="no-reply@example.com"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                    value={smtp.from_email}
                    onChange={(e) => setSmtp({...smtp, from_email: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={smtp.is_active}
                        onChange={(e) => setSmtp({...smtp, is_active: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Set as Primary Gateway</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Used for all outbound campaigns</p>
                    </div>
                  </div>
                  <button type="submit" className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-600 mb-6 border border-green-100">
                   <Shield className="w-10 h-10" />
                 </div>
                 <h4 className="text-xl font-bold text-gray-900 mb-2">Connection Status</h4>
                 <div className="flex items-center space-x-2 px-6 py-2 bg-green-100/50 text-green-700 rounded-full border border-green-200">
                   <CheckCircle className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Gateway Online</span>
                 </div>
                 <p className="text-sm text-gray-500 mt-6 leading-relaxed font-medium">
                   Your SMTP gateway is successfully connected. You can now start sending campaigns to your contacts.
                 </p>
                 <button className="mt-8 text-blue-600 text-xs font-black uppercase tracking-widest flex items-center hover:underline">
                   <RefreshCw className="w-4 h-4 mr-2" /> Send Test Email
                 </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="employees"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-xl font-bold text-gray-900">Registered Accounts</h3>
              <button 
                onClick={() => setShowAddEmployee(true)}
                className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span>New Account</span>
              </button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {employees.map((emp) => (
                <div key={emp.id} className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 transition-all group relative">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 mb-6 shadow-sm border border-gray-100">
                     <Users className="w-8 h-8" />
                   </div>
                   <h4 className="text-lg font-black text-gray-900 mb-1">{emp.name}</h4>
                   <p className="text-sm text-gray-500 font-medium mb-4">{emp.email}</p>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                     emp.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                   }`}>
                     {emp.role}
                   </span>
                   <button 
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="absolute top-6 right-6 p-3 text-red-100 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddEmployee && (
          <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <form onSubmit={handleCreateEmployee} className="p-10 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-gray-900">Register Account</h2>
                  <button type="button" onClick={() => setShowAddEmployee(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <X className="w-8 h-8 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      required
                      type="password" 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 font-bold outline-none transition-all"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-black text-sm uppercase tracking-widest"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddEmployee(false)} className="flex-1 py-5 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Create Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Settings;
