import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, Lock, Mail, ArrowRight, Shield, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // Determine redirection based on email / role
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (email.includes('instructor')) {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string, defaultPath: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    const res = await login(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      navigate(defaultPath);
    } else {
      setError(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0b24]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
            <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center justify-center shadow-xl shadow-[#2F2D7D]/25 border border-white/20 group-hover:scale-105 transition-transform">
              <img src="/fiit-logo.png" alt="FIIT - Create Your Value" className="h-10 w-auto object-contain" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white mt-1">
              FIIT <span className="text-[#a5a3ee]">Coding Assessment</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-xs text-slate-400 mt-0.5">Sign in to your assessment portal</p>
        </div>

        {/* Demo Accounts Panel */}
        <div className="mb-5 p-4 rounded-xl border border-[#2a276b] bg-[#141334]/80 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Instant Demo Accounts</span>
            <span className="text-[10px] text-[#a5a3ee] font-normal">Click to test</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@codeeval.ai', 'Admin@123', '/admin')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 text-red-200 transition text-xs font-medium"
            >
              <Shield className="w-4 h-4 mb-1 text-red-400" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('instructor@codeeval.ai', 'Instructor@123', '/instructor')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#2F2D7D]/30 hover:bg-[#2F2D7D]/50 border border-[#5a57be]/40 text-[#d5d6f4] transition text-xs font-medium"
            >
              <GraduationCap className="w-4 h-4 mb-1 text-[#a5a3ee]" />
              <span>Instructor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student@codeeval.ai', 'Student@123', '/student')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-emerald-200 transition text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 mb-1 text-emerald-400" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-7 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@codeeval.ai"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#a5a3ee] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold text-sm transition shadow-lg shadow-[#2F2D7D]/30 flex items-center justify-center gap-2 disabled:opacity-50 border border-[#5a57be]/40"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#a5a3ee] font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
