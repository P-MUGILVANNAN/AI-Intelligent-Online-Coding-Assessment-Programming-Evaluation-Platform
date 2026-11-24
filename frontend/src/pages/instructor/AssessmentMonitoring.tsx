import React, { useEffect, useState } from 'react';
import { assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  Eye, Clock, Users, ShieldAlert, CheckCircle2,
  AlertTriangle, RefreshCw, Search
} from 'lucide-react';

export const AssessmentMonitoring: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    assessmentsAPI.list()
      .then((res) => {
        setAssessments(res.data);
        if (res.data.length > 0) {
          setSelectedAssessmentId(res.data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loadParticipants = async (assmId: string) => {
    if (!assmId) return;
    setRefreshing(true);
    try {
      const res = await assessmentsAPI.getParticipants(assmId);
      setParticipants(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedAssessmentId) {
      loadParticipants(selectedAssessmentId);
      const interval = setInterval(() => loadParticipants(selectedAssessmentId), 15000);
      return () => clearInterval(interval);
    }
  }, [selectedAssessmentId]);

  const activeCount = participants.filter((p) => !p.is_submitted).length;
  const submittedCount = participants.filter((p) => p.is_submitted).length;
  const flaggedCount = participants.filter((p) => p.violation_count > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Live Examination Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time candidate tracking, timers, and academic integrity audit.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white font-semibold focus:outline-none focus:border-[#5a57be]"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>{a.title} ({a.status})</option>
            ))}
          </select>

          <button
            onClick={() => loadParticipants(selectedAssessmentId)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#141334] hover:bg-slate-800 border border-[#2a276b] text-[#a5a3ee]"
            title="Refresh participant list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Total Candidates</div>
          <div className="text-2xl font-bold text-white">{participants.length}</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Actively Writing</div>
          <div className="text-2xl font-bold text-[#a5a3ee]">{activeCount}</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Submitted</div>
          <div className="text-2xl font-bold text-emerald-400">{submittedCount}</div>
        </div>
        <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
          <div className="text-xs text-slate-400 mb-1">Focus Violations</div>
          <div className="text-2xl font-bold text-amber-400">{flaggedCount}</div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Exam Status</th>
                <th className="py-3 px-4">Remaining Time</th>
                <th className="py-3 px-4">Integrity Violations</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4 text-right">Submission Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No active student sessions initiated for this assessment.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.session_id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{p.student_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.student_email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.is_submitted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-[#18173d] text-[#c2c0f6] border border-[#2a276b] animate-pulse'
                        }`}
                      >
                        {p.is_submitted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {p.is_submitted ? 'Submitted' : 'In Progress'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.is_submitted ? 'Completed' : `${Math.floor(p.remaining_seconds / 60)}m ${p.remaining_seconds % 60}s`}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.violation_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900">
                          <AlertTriangle className="w-3 h-3" /> {p.violation_count} switches
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">Clean</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(p.start_time).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {p.submitted_at ? new Date(p.submitted_at).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
