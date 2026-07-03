import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Saikumar' && password === '1234') {
      onLogin(username);
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-bg-dark px-4 font-sans transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl shadow-xl shadow-accent/20 mb-6">
            <span className="text-white font-black text-3xl">H</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">HostelHub Portal</h1>
          <p className="text-text-secondary mt-2 font-medium">Please sign in to manage your facility</p>
        </div>

        <div className="bg-white dark:bg-card-bg p-8 rounded-3xl border dark:border-border shadow-2xl shadow-gray-200/50 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm font-semibold"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent focus:bg-white dark:focus:bg-transparent outline-none transition-all text-sm font-medium text-[#1A1A1A] dark:text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent focus:bg-white dark:focus:bg-transparent outline-none transition-all text-sm font-medium text-[#1A1A1A] dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/30 group active:scale-95"
            >
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Log In to Dashboard</span>
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t dark:border-border text-center">
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold">
              © 2024 HostelHub • Secured Access
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
