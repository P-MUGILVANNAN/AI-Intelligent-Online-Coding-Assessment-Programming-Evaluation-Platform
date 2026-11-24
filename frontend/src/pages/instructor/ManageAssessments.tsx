import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  CheckSquare, PlusCircle, Trash2, Edit, Eye,
  Clock, ShieldAlert, BarChart3, Search, AlertCircle
} from 'lucide-react';

export const ManageAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      const res = await assessmentsAPI.list();
      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this assessment? All attached session records will be removed.")) {
      try {
        await assessmentsAPI.delete(id);
        setAssessments((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        alert("Failed to delete assessment.");
      }
    }
  };

  const filtered = assessments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Assessment Management</h1>
          <p className="text-slate-400 text-sm mt-1">Configure, schedule, and administer programming assessments.</p>
        </div>

        <Link
          to="/instructor/assessments/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create New Assessment
        </Link>
      </div>

      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2a276b] flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
            />
          </div>
          <span className="text-xs text-slate-400">{filtered.length} Assessments</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading assessments...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No assessments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{a.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{a.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          a.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : a.status === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : a.status === 'Scheduled'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{a.duration} mins</td>
                    <td className="py-3.5 px-4 text-slate-300">{a.number_of_questions}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-bold">{a.total_marks}</td>
                    <td className="py-3.5 px-4 text-slate-400">{a.participants_count || 0} enrolled</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/instructor/monitoring`}
                          className="p-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 text-[#a5a3ee]"
                          title="Monitor Live Session"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/instructor/reports`}
                          className="p-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 text-brand-400"
                          title="View Reports"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
