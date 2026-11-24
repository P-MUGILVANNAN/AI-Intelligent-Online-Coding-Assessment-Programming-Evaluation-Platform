import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionsAPI } from '../../services/api';
import { Submission } from '../../types';
import { History, FileCode, CheckCircle2, XCircle, ArrowRight, Clock, Search } from 'lucide-react';

export const SubmissionHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI.list()
      .then((res) => setSubmissions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((s) =>
    (s.question_title || '').toLowerCase().includes(search.toLowerCase()) ||
    s.verdict.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Submission History</h1>
          <p className="text-slate-400 text-sm mt-1">Review your evaluated code solutions, scores, and AI quality feedback.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by question or verdict..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading submission records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No submissions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[680px]">
              <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                <tr>
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Test Cases</th>
                  <th className="py-3 px-4">Execution Stats</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#a5a3ee] shrink-0" />
                      <span>{s.question_title || 'Programming Problem'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 uppercase font-semibold">{s.programming_language}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          s.verdict === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {s.verdict === 'Accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {s.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200 text-sm">{s.score}/100</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {s.passed_test_cases} / {s.total_test_cases} passed
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {s.execution_time.toFixed(3)}s • {s.memory_usage.toFixed(1)}MB
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(s.submitted_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/student/submissions/${s.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 border border-slate-700 text-[#a5a3ee] font-semibold transition"
                      >
                        View Report
                      </Link>
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
