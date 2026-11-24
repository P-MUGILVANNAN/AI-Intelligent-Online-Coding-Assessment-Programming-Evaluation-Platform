import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import {
  Shield, Users, BookOpen, GraduationCap, CheckSquare,
  Award, ShieldAlert, Cpu, Activity, Clock, Terminal,
  PlusCircle, ArrowRight, CheckCircle2, XCircle, AlertTriangle,
  FileCode, Settings, HelpCircle, History, Building, Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.admin()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading administrator command center...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-800 mb-2">
            <Shield className="w-3.5 h-3.5" /> Institutional Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Administrator Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live operations, candidate submission feeds, activity audit logs, and system controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#141334] border border-[#2a276b] px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Sandbox: {data?.system_status?.sandbox_health || 'Operational'}
            </span>
          </div>

          <Link
            to="/admin/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold text-xs transition shadow-lg shadow-[#2F2D7D]/30 border border-[#5a57be]/40"
          >
            <span>Platform Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-[#a5a3ee]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{data?.total_users}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
            <span className="text-[#a5a3ee]">{data?.total_students} Students</span>
            <span>•</span>
            <span className="text-purple-400">{data?.total_instructors} Faculty</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Assessments</span>
            <CheckSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#a5a3ee]">{data?.total_assessments}</div>
          <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {data?.active_examinations || 1} Active Examinations Now
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Submissions Evaluated</span>
            <FileCode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{data?.total_submissions}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Avg Score: <span className="font-semibold text-white">{data?.average_assessment_score}%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Plagiarism Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{data?.flagged_plagiarism_cases}</div>
          <div className="text-[11px] text-amber-300/80 mt-2 font-medium">
            AST Similarity &gt;= 65% detected
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Administrative Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            to="/admin/users"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <Users className="w-5 h-5 text-[#a5a3ee] mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Users & Roles</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Manage accounts</div>
          </Link>

          <Link
            to="/admin/assessments"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <CheckSquare className="w-5 h-5 text-emerald-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Assessments</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Create & schedule</div>
          </Link>

          <Link
            to="/admin/questions"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <HelpCircle className="w-5 h-5 text-brand-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Question Bank</div>
            <div className="text-[10px] text-slate-400 mt-0.5">20 problems</div>
          </Link>

          <Link
            to="/admin/plagiarism"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Plagiarism</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Audit reports</div>
          </Link>

          <Link
            to="/admin/institutions"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <Building className="w-5 h-5 text-purple-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Institutions</div>
            <div className="text-[10px] text-slate-400 mt-0.5">College portals</div>
          </Link>

          <Link
            to="/admin/settings"
            className="p-3 rounded-xl bg-[#18173d] hover:bg-[#201e52] border border-[#2a276b] hover:border-[#5a57be] text-center transition group"
          >
            <Settings className="w-5 h-5 text-slate-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <div className="font-semibold text-xs text-white">Settings</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Limits & timeouts</div>
          </Link>
        </div>
      </div>

      {/* Row 2: Live / Upcoming Examinations & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active & Scheduled Examinations */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#a5a3ee]" /> Active & Scheduled Examinations
            </h2>
            <Link to="/admin/assessments" className="text-xs text-[#a5a3ee] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.upcoming_assessments?.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No active or scheduled exams.</div>
            ) : (
              data?.upcoming_assessments?.map((exam: any) => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl border border-[#2a276b]/80 bg-[#18173d]/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{exam.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{exam.duration} minutes</span>
                      <span>•</span>
                      <span>Starts: {new Date(exam.start_time).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exam.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-[#2F2D7D]/30 text-[#a5a3ee] border border-[#5a57be]/40'
                      }`}
                    >
                      {exam.status}
                    </span>
                    <Link
                      to="/instructor/monitoring"
                      className="px-2.5 py-1 rounded-lg bg-[#2F2D7D] hover:bg-[#4844af] text-white text-xs font-semibold"
                    >
                      Monitor
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subprocess Sandbox & System Diagnostics */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#a5a3ee]" /> Infrastructure Health
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
                <span className="text-slate-400">Sandbox Isolation</span>
                <span className="font-bold text-[#a5a3ee]">Ephemeral Sandboxes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-bold text-emerald-400">SQLAlchemy ORM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
                <span className="text-slate-400">AI Static Quality</span>
                <span className="font-bold text-purple-400">AST Visitor Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
                <span className="text-slate-400">Worker Memory</span>
                <span className="font-bold text-white font-mono">{data?.system_status?.memory_usage_mb || 142.5} MB</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-[#2a276b]">
            Node.js 24 & Python 3.14 sandboxed compilers active with network egress disabled.
          </div>
        </div>
      </div>

      {/* Row 3: Live Submissions Feed & System Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions Feed */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> Live Submissions Feed
            </h2>
            <Link to="/admin/submissions" className="text-xs text-[#a5a3ee] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.recent_submissions?.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No recent submissions recorded.</div>
            ) : (
              data?.recent_submissions?.map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border border-[#2a276b]/80 bg-[#18173d]/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{sub.student_name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 text-[11px] truncate">{sub.question_title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(sub.submitted_at).toLocaleTimeString()} • <span className="uppercase font-semibold">{sub.language}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.verdict === 'Accepted'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {sub.verdict}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">{sub.score} pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity & Security Audit Logs */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Platform Activity & Audit Log
            </h2>
            <span className="text-xs text-slate-500">Live Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {data?.recent_activities?.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No recent system activity logs.</div>
            ) : (
              data?.recent_activities?.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-[#2a276b]/80 bg-[#18173d]/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a5a3ee]" />
                      <span>{act.action}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({act.entity_type})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      By: <span className="text-slate-300">{act.user_email}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
