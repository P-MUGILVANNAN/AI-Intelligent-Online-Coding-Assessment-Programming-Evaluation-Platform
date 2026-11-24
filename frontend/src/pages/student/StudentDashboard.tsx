import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  CheckCircle2, Clock, Code2, Award, ArrowRight,
  TrendingUp, BarChart3, AlertCircle, FileCode
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeAssessments, setActiveAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aRes, assmRes] = await Promise.all([
          analyticsAPI.student(),
          assessmentsAPI.list({ limit: 4 })
        ]);
        setAnalytics(aRes.data);
        setActiveAssessments(assmRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#a5a3ee] font-semibold animate-pulse text-sm">Loading your candidate dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 border border-brand-800/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-[#a5a3ee]">{user?.full_name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Track your coding evaluation performance, attempt active institutional examinations, and review automated AI quality feedback.
          </p>
        </div>
        <Link
          to="/student/assessments"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-sm transition shadow-lg shadow-[#2F2D7D]/25 shrink-0"
        >
          View Available Exams <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Assessments</span>
            <Award className="w-4 h-4 text-[#a5a3ee]" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics?.total_assessments_attempted || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tests Completed</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{analytics?.average_score || 0}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Overall Accuracy</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Problems Solved</span>
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics?.problems_solved || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Accepted Solutions</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Acceptance Rate</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics?.acceptance_rate || 0}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Submission Success</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Examinations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#a5a3ee]" /> Available Examinations
            </h2>
            <Link to="/student/assessments" className="text-xs text-[#a5a3ee] hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAssessments.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24] hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-950 text-brand-300 border border-brand-800">
                      {a.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {a.duration} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{a.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{a.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{a.number_of_questions} Questions • {a.total_marks} Marks</span>
                  <Link
                    to={`/student/assessments/${a.id}/instructions`}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
                  >
                    Start Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill / Topic Performance */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" /> Topic Mastery
          </h2>
          <div className="space-y-3">
            {analytics?.topic_performance?.map((t: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{t.topic}</span>
                  <span className="text-[#a5a3ee] font-semibold">{t.average_score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#141334] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, t.average_score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#a5a3ee]" /> Recent Submissions
          </h2>
          <Link to="/student/submissions" className="text-xs text-[#a5a3ee] hover:underline">
            View All Submissions
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141334]/70 text-slate-400 uppercase border-b border-[#2a276b]">
              <tr>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Verdict</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analytics?.recent_submissions?.map((s: any) => (
                <tr key={s.id} className="hover:bg-[#141334]/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-white">{s.question_title}</td>
                  <td className="py-2.5 px-3 text-slate-300 uppercase">{s.language}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.verdict === 'Accepted'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {s.verdict}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{s.score}/100</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      to={`/student/submissions/${s.id}`}
                      className="text-[#a5a3ee] hover:underline font-medium"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
