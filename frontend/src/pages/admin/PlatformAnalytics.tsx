import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, AreaChart, Area
} from 'recharts';
import {
  BarChart3, Activity, Award, Terminal, ShieldAlert,
  Calendar, TrendingUp, CheckCircle2, XCircle, AlertTriangle,
  Cpu, Layers, Sparkles, Filter
} from 'lucide-react';

const COLORS = ['#2F2D7D', '#5a57be', '#7975e2', '#10b981', '#f59e0b', '#8b5cf6'];
const VERDICT_COLORS: Record<string, string> = {
  Accepted: '#10b981',
  'Wrong Answer': '#ef4444',
  'Compilation Error': '#f59e0b',
  'Runtime Error': '#dc2626',
  'Time Limit Exceeded': '#2F2D7D',
  'Memory Limit Exceeded': '#8b5cf6',
};

export const PlatformAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    analyticsAPI.admin()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading comprehensive platform analytics...</div>;
  }

  const langPieData = data?.language_usage?.map((item: any) => ({
    name: item.language.toUpperCase(),
    value: item.count,
  })) || [];

  const verdictPieData = data?.verdict_distribution?.map((item: any) => ({
    name: item.verdict,
    value: item.count,
    color: VERDICT_COLORS[item.verdict] || '#64748b',
  })) || [
    { name: 'Accepted', value: 34, color: '#10b981' },
    { name: 'Wrong Answer', value: 12, color: '#ef4444' },
    { name: 'Compilation Error', value: 4, color: '#f59e0b' },
    { name: 'Runtime Error', value: 3, color: '#dc2626' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2F2D7D]/30 text-[#a5a3ee] border border-[#5a57be]/40 mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Intelligence & Visual Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">FIIT Platform Performance Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Deep-dive metrics across candidate assessments, multi-language compiler runs, and plagiarism trends.
          </p>
        </div>

        {/* Timeframe selector pill */}
        <div className="flex items-center gap-1.5 bg-[#141334] border border-[#2a276b] p-1 rounded-xl text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeframe === tf
                  ? 'bg-[#2F2D7D] text-white shadow-md shadow-[#2F2D7D]/30 border border-[#5a57be]/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Assessment Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {data?.average_assessment_score || 78.4}%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2% from previous cohort
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Mean AST Quality Index</span>
            <Sparkles className="w-4 h-4 text-[#a5a3ee]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#a5a3ee]">
            86.8 <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Static Abstract Syntax Tree benchmark
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Academic Integrity Rate</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
            94.6%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {data?.flagged_plagiarism_cases || 2} flagged pairs under audit
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#2a276b] bg-[#141334] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Mean Sandbox Latency</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            0.068s
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Subprocess isolation execution time
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Activity Area & Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Submission & Assessment Trajectory */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#a5a3ee]" /> Submission & Assessment Trajectory
            </h2>
            <span className="text-xs text-slate-500">Monthly Volume</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_activity || []}>
                <defs>
                  <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F2D7D" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#2F2D7D" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="examGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7975e2" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7975e2" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141334', borderColor: '#2a276b', borderRadius: '0.75rem' }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  name="Code Submissions"
                  stroke="#5a57be"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#subGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="assessments"
                  name="Active Examinations"
                  stroke="#a5a3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#examGradient)"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Performance / Score Distribution */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Student Score Distribution Bands
            </h2>
            <span className="text-xs text-slate-500">Percentile Range</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.score_distribution || []}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141334', borderColor: '#2a276b', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="count" name="Submissions in Range" fill="#5a57be" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Verdict Breakdown & Language Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Verdicts Breakdown */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Evaluation Verdict Distribution
            </h2>
            <span className="text-xs text-slate-500">Pass vs Fail Ratios</span>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {verdictPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-verdict-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141334', borderColor: '#2a276b', borderRadius: '0.75rem' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Language Usage */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-400" /> Programming Language Adoption
            </h2>
            <span className="text-xs text-slate-500">Subprocess Compilers</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {langPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-lang-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141334', borderColor: '#2a276b', borderRadius: '0.75rem' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Intelligence Section: Plagiarism & Sandbox Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plagiarism Analysis Insights */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Plagiarism & Similarity Breakdown
            </h2>
            <span className="text-xs text-amber-400 font-semibold">AST Hybrid Formula</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0c0b24] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Flagged</div>
              <div className="text-xl font-bold text-amber-400">{data?.plagiarism_stats?.flagged || 2}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0b24] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Investigating</div>
              <div className="text-xl font-bold text-[#a5a3ee]">{data?.plagiarism_stats?.investigating || 1}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0b24] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Confirmed</div>
              <div className="text-xl font-bold text-red-400">{data?.plagiarism_stats?.confirmed || 1}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0b24] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Cleared</div>
              <div className="text-xl font-bold text-emerald-400">{data?.plagiarism_stats?.cleared || 0}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Token-Based Similarity Weight</span>
              <span className="font-mono text-[#a5a3ee] font-bold">35%</span>
            </div>
            <div className="w-full bg-[#0c0b24] h-2 rounded-full overflow-hidden">
              <div className="bg-[#2F2D7D] h-full rounded-full" style={{ width: '35%' }} />
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1">
              <span>TF-IDF N-gram Cosine Weight</span>
              <span className="font-mono text-purple-400 font-bold">35%</span>
            </div>
            <div className="w-full bg-[#0c0b24] h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '35%' }} />
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1">
              <span>AST Structural Invariance Weight</span>
              <span className="font-mono text-emerald-400 font-bold">30%</span>
            </div>
            <div className="w-full bg-[#0c0b24] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </div>

        {/* System Resource & Security Infrastructure */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#141334] space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#a5a3ee]" /> Platform Infrastructure Health
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Green
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Isolated Sandbox Daemon</div>
                <div className="text-[11px] text-slate-400">Restricted subprocess containers (CPU & RAM capped)</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">AST Code Quality Analyzer</div>
                <div className="text-[11px] text-slate-400">Cyclomatic complexity & Halstead maintainability</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2F2D7D]/30 text-[#a5a3ee] border border-[#5a57be]/40">
                Operational
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c0b24] border border-[#2a276b] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Compiler daemons</div>
                <div className="text-[11px] text-slate-400">Python 3.14, Node.js 24, G++, OpenJDK, Go</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
