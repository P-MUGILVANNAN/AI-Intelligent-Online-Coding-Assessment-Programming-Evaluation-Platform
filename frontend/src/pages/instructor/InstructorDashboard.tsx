import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  GraduationCap, CheckSquare, PlusCircle, ShieldAlert,
  Users, BarChart3, Eye, FileCode, ArrowRight, Award
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.instructor(),
      assessmentsAPI.list({ limit: 5 })
    ])
      .then(([aRes, assmRes]) => {
        setAnalytics(aRes.data);
        setAssessments(assmRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading instructor dashboard...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-900/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800 mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Instructor Evaluation Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, <span className="text-[#a5a3ee]">{user?.full_name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Configure assessments, review candidate programming submissions, monitor active exams in real-time, and audit hybrid plagiarism reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/instructor/assessments/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25"
          >
            <PlusCircle className="w-4 h-4" /> Create Assessment
          </Link>
          <Link
            to="/instructor/questions/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141334] hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs transition"
          >
            <FileCode className="w-4 h-4" /> Add Question
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Total Assessments</div>
          <div className="text-2xl font-bold text-white">{analytics?.total_assessments || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Managed Exams</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Total Submissions</div>
          <div className="text-2xl font-bold text-brand-400">{analytics?.total_submissions || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Evaluated Code Runs</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Average Class Score</div>
          <div className="text-2xl font-bold text-emerald-400">{analytics?.average_class_score || 0}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Performance Mean</div>
        </div>

        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Flagged Plagiarism</div>
          <div className="text-2xl font-bold text-amber-400">{analytics?.plagiarism_summary?.total_cases || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cases Under Audit</div>
        </div>
      </div>

      {/* Ongoing Assessments & Quick Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#a5a3ee]" /> Active Assessments
            </h2>
            <Link to="/instructor/assessments" className="text-xs text-[#a5a3ee] hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-900 bg-[#141334]/50 hover:bg-[#141334]/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{a.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : a.status === 'Completed'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {a.duration} mins • {a.number_of_questions} Questions • {a.total_marks} Marks
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/instructor/monitoring`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#a5a3ee]" /> Live Monitor
                  </Link>
                  <Link
                    to={`/instructor/reports`}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-800 text-xs font-semibold transition"
                  >
                    Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plagiarism & Quick Shortcuts */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Plagiarism Quick Audit
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated hybrid code similarity engine flags suspect submission pairs with normalized token analysis, TF-IDF cosine similarity, and AST node matching.
            </p>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
              <span className="font-bold">{analytics?.plagiarism_summary?.total_cases || 0} flagged pairs</span> require review.
            </div>
            <Link
              to="/instructor/plagiarism"
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              Open Plagiarism Auditor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" /> Class Ranking & Reports
            </h2>
            <p className="text-xs text-slate-400">
              Export comprehensive grade sheets in CSV or download individual student PDF reports.
            </p>
            <Link
              to="/instructor/reports"
              className="w-full py-2.5 rounded-xl bg-[#141334] hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              Export Assessment Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
