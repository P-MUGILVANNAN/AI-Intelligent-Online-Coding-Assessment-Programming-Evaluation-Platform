import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import { Clock, CheckSquare, Search, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const AvailableAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      const res = await assessmentsAPI.list({
        search: search || undefined,
        difficulty: difficultyFilter || undefined,
      });
      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [search, difficultyFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Available Examinations & Assessments</h1>
        <p className="text-slate-400 text-sm mt-1">
          Select an assessment to begin your timed coding evaluation session.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assessments by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-sm text-white focus:outline-none focus:border-[#5a57be]"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading available assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No assessments found matching criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-[#c2c0f6] border border-brand-800">
                    {a.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      a.difficulty === 'Easy'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : a.difficulty === 'Hard'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {a.difficulty}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mb-2">{a.title}</h2>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6">
                  {a.description || 'Comprehensive programming assessment.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-6 bg-[#141334]/70 p-3 rounded-xl border border-[#2a276b]/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#a5a3ee]" />
                    <span>{a.duration} Minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
                    <span>{a.number_of_questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{a.total_marks} Total Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="capitalize">{a.status}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/student/assessments/${a.id}/instructions`}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
              >
                Start Examination <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
