import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { Building, Plus, Search, ShieldCheck } from 'lucide-react';

export const InstitutionManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchInstitutions = async () => {
    try {
      const res = await usersAPI.institutions();
      setInstitutions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersAPI.createInstitution({ name, code, description: desc });
      setName('');
      setCode('');
      setDesc('');
      setShowModal(false);
      fetchInstitutions();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to create institution.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Institution Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage partner colleges, universities, and enterprise organizations.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Institution
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-sm">Loading institutions...</div>
        ) : (
          institutions.map((inst) => (
            <div key={inst.id} className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-[#a5a3ee]">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">{inst.name}</h2>
              <div className="text-xs font-mono text-[#a5a3ee] bg-[#141334] px-2 py-0.5 rounded w-fit border border-[#2a276b]">
                Code: {inst.code}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {inst.description || 'Enterprise educational institution.'}
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0c0b24]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141334] border border-[#2a276b] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Register Educational Institution</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oxford Institute of Technology"
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-white focus:outline-none focus:border-[#5a57be]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Institution Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. OXFORD-IT"
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-white focus:outline-none focus:border-[#5a57be] uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-white focus:outline-none focus:border-[#5a57be]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
