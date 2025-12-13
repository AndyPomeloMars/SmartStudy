import React, { useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ThemeColor } from '../types';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  themeColor: ThemeColor;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, themeColor }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for a realistic feel
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 bg-${themeColor}-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3`}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to SmartStudy</h2>
            <p className="text-slate-500 mt-2">Sign in to access your intelligent question bank</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white`}
                placeholder="student@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white`}
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <span className={`px-3 py-1 bg-${themeColor}-50 text-${themeColor}-600 text-xs font-medium rounded-full`}>
               Demo Mode: Any credentials work
             </span>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center text-sm text-slate-500">
          <span>Don't have an account? <button onClick={onSwitchToSignup} className={`text-${themeColor}-600 font-semibold hover:underline ml-1`}>Create one</button></span>
        </div>
      </div>
    </div>
  );
};
