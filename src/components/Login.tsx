import React, { useState } from 'react';
import { api } from '../api';
import { Eye, EyeOff, Lock, User, Dumbbell } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  darkMode: boolean;
}

export default function Login({ onLoginSuccess, darkMode }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>

      <div className={`w-full max-w-md p-8 rounded-3xl border transition-all shadow-2xl ${
        darkMode 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' 
          : 'bg-white border-slate-200 shadow-slate-200'
      }`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 mb-4 transform hover:scale-110 transition-transform">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-center">
            BHOIR FITNESS & GYM
          </h1>
          <p className={`text-xs mt-1 uppercase font-bold tracking-widest ${darkMode ? 'text-orange-500' : 'text-orange-600'}`}>
            Admin Workspace Portal
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button
                id="toggle-password-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'AUTHENTICATING...' : 'SECURE LOG IN'}
          </button>
        </form>

        {/* Support Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/20 text-center">
          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Authorized Personnel Only • Bhoir Fitness & Gym
          </p>
        </div>
      </div>
    </div>
  );
}
