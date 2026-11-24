import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, CheckCircle2, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export const StudentAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.student()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading performance analytics...</div>;
  }

  // Format language pie data
  const langPieData = Object.entries(data?.language_usage || {}).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Student Skill & Performance Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed metrics covering your programming progress, topic mastery, and language distributions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Average Score</div>
          <div className="text-2xl font-bold text-[#a5a3ee]">{data?.average_score}%</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Highest Score</div>
          <div className="text-2xl font-bold text-emerald-400">{data?.highest_score}%</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Acceptance Rate</div>
          <div className="text-2xl font-bold text-brand-400">{data?.acceptance_rate}%</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Problems Solved</div>
          <div className="text-2xl font-bold text-white">{data?.problems_solved}</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Mastery Bar Chart */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#a5a3ee]" /> Topic Mastery & Accuracy
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topic_performance || []}>
                <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#00d2ff' }}
                />
                <Bar dataKey="average_score" name="Avg Score (%)" fill="#00d2ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Over Time Line Chart */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Score Progression Timeline
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.coding_progress || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
                <Line type="monotone" dataKey="score" name="Score (%)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Usage Pie Chart */}
        <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" /> Programming Language Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {langPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
