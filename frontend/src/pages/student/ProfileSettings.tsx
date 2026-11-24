import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { User, Mail, Lock, CheckCircle2, AlertCircle, Building } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMsg('');
    setErr('');
    setLoading(true);

    try {
      await usersAPI.update(user.id, {
        full_name: fullName,
        bio: bio,
        password: password.trim() ? password : undefined,
      });
      await refreshUser();
      setMsg('Profile settings updated successfully.');
      setPassword('');
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Profile & Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your identity, personal information, and credentials.</p>
      </div>

      <div className="p-8 rounded-2xl border border-[#2a276b] bg-[#0c0b24] shadow-xl">
        {msg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}
        {err && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email (Read-Only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white focus:outline-none focus:border-[#5a57be]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Bio / Affiliation</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Computer Science undergraduate specializing in algorithms..."
              className="w-full p-3 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white focus:outline-none focus:border-[#5a57be]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Update Password (Leave empty to keep current)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white focus:outline-none focus:border-[#5a57be]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-sm transition shadow-lg shadow-[#2F2D7D]/25 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
