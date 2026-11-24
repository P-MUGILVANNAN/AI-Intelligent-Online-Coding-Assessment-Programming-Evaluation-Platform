import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import { Users, Search, Shield, GraduationCap, BookOpen, Check, X, Trash2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.list({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleActive = async (user: User) => {
    try {
      await usersAPI.update(user.id, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (e: any) {
      alert("Failed to toggle user status.");
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      await usersAPI.update(user.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: { id: u.role?.id || '', name: newRole } } : u))
      );
      alert(`User role updated to ${newRole}`);
    } catch (e) {
      alert("Failed to update role.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">User & Role Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage institutional credentials, account statuses, and system roles.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
        >
          <option value="">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Instructor">Instructor</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role?.name || 'Student'}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="px-2 py-1 rounded bg-[#141334] border border-[#2a276b] text-xs text-slate-200 font-semibold focus:outline-none focus:border-[#5a57be]"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Student">Student</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.institution?.name || 'MIT College of Engineering'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_active
                            ? 'bg-red-950/40 hover:bg-red-900/40 border border-red-800 text-red-300'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
