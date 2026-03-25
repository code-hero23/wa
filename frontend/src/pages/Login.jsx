import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/'; // Full reload to refresh state
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        {/* Logo Section */}
        <div className="text-center mb-10 group">
          <div className="w-20 h-20 bg-white rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-500 rotate-[-5deg] group-hover:rotate-0 border border-blue-50">
            <Rocket className="w-10 h-10 text-blue-600 font-bold" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">BlastApp</h1>
          <p className="text-gray-500 font-medium tracking-tight">Enterprise WhatsApp Solution</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl shadow-blue-100/50 border border-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Welcome Back</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 text-lg mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Login Securely</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            Protected by CloudSecurity V2
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}} />
    </div>
  );
};

export default Login;
