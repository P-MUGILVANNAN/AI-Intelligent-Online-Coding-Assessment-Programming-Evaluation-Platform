import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Code2, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      setMsg(res.data.message || 'Password reset link sent.');
    } catch (e: any) {
      setErr('Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0b24]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
            <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center justify-center shadow-xl shadow-[#2F2D7D]/25 border border-white/20 group-hover:scale-105 transition-transform">
              <img src="/fiit-logo.png" alt="FIIT - Create Your Value" className="h-10 w-auto object-contain" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white mt-1">
              FIIT <span className="text-[#a5a3ee]">Coding Assessment</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-0.5">Enter your registered email address</p>
        </div>

        <div className="p-7 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-2xl">
          {msg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}
          {err && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{err}</span>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold text-sm transition shadow-lg shadow-[#2F2D7D]/30 flex items-center justify-center gap-2 disabled:opacity-50 border border-[#5a57be]/40"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#a5a3ee] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
