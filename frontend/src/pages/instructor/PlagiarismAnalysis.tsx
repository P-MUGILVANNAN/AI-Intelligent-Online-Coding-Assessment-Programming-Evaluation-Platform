import React, { useEffect, useState } from 'react';
import { plagiarismAPI, assessmentsAPI } from '../../services/api';
import { PlagiarismReport, Assessment } from '../../types';
import {
  ShieldAlert, Cpu, Eye, CheckCircle2, AlertTriangle,
  Play, RefreshCw, X, ArrowRight, Check, Shield
} from 'lucide-react';

export const PlagiarismAnalysis: React.FC = () => {
  const [reports, setReports] = useState<PlagiarismReport[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('Under Investigation');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(60);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await plagiarismAPI.reports({
        assessment_id: selectedAssessmentId || undefined,
      });
      setReports(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    assessmentsAPI.list().then((res) => setAssessments(res.data));
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedAssessmentId]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await plagiarismAPI.analyze({
        assessment_id: selectedAssessmentId || undefined,
        similarity_threshold: threshold,
      });
      alert(res.data.message);
      fetchReports();
    } catch (e: any) {
      alert("Failed to run plagiarism analysis.");
    } finally {
      setScanning(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await plagiarismAPI.getReport(id);
      setSelectedReport(res.data);
      setReviewStatus(res.data.review_status || 'Under Investigation');
      setReviewerNotes(res.data.reviewer_notes || '');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedReport) return;
    try {
      await plagiarismAPI.review(selectedReport.id, {
        review_status: reviewStatus,
        reviewer_notes: reviewerNotes,
      });
      alert("Instructor decision recorded into the audit trail.");
      setSelectedReport(null);
      fetchReports();
    } catch (e) {
      alert("Failed to record review.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">AI Plagiarism & Code Similarity Detection</h1>
          <p className="text-slate-400 text-sm mt-1">
            Hybrid AST structural invariance, lexical token sequencing, and TF-IDF cosine comparison.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
          >
            <option value="">All Assessments</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning AST Trees...' : 'Trigger Scan'}
          </button>
        </div>
      </div>

      {/* Flagged Submissions Table */}
      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2a276b] flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Flagged Submission Pairs ({reports.length})
          </span>
          <span className="text-xs text-slate-500">Threshold: &gt;={threshold}%</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading similarity reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No code pairs exceeded the similarity threshold. The codebases show independent originality.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                <tr>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Candidate A</th>
                  <th className="py-3 px-4">Candidate B</th>
                  <th className="py-3 px-4">Composite Similarity</th>
                  <th className="py-3 px-4">Token / TF-IDF / AST</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right">Inspect Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{r.question_title}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-semibold text-white">{r.student_a_name}</div>
                      <div className="text-[10px] text-slate-500">{r.student_a_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-semibold text-white">{r.student_b_name}</div>
                      <div className="text-[10px] text-slate-500">{r.student_b_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-950 text-red-300 border border-red-800">
                        {r.similarity_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      T:{r.token_similarity}% • TF:{r.tfidf_similarity}% • AST:{r.ast_similarity}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.review_status === 'Confirmed Violation'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : r.review_status === 'Not Plagiarism'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {r.review_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(r.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 border border-slate-700 text-[#a5a3ee] font-semibold transition"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side Diff Inspector Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-[#0c0b24]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] bg-[#141334] border border-[#2a276b] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2a276b] bg-[#0c0b24] flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Similarity Audit: {selectedReport.similarity_score}% Composite Match
                </span>
                <h2 className="text-lg font-bold text-white">Side-by-Side Code Diff Inspection</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side by side code view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-[#2a276b]">
                    <span className="font-bold text-white">{selectedReport.submission_a?.student_name}</span>
                    <span className="text-slate-400">{selectedReport.submission_a?.verdict} ({selectedReport.submission_a?.score} pts)</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-80">
                    {selectedReport.submission_a?.source_code}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-[#2a276b]">
                    <span className="font-bold text-white">{selectedReport.submission_b?.student_name}</span>
                    <span className="text-slate-400">{selectedReport.submission_b?.verdict} ({selectedReport.submission_b?.score} pts)</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-80">
                    {selectedReport.submission_b?.source_code}
                  </pre>
                </div>
              </div>

              {/* Matching Sections */}
              {selectedReport.matching_sections?.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0c0b24] border border-[#2a276b] space-y-2 text-xs">
                  <div className="font-bold text-amber-400">Common Contiguous Logic Block Identified:</div>
                  <pre className="p-2 rounded bg-[#141334] text-slate-300 font-mono text-[11px] overflow-x-auto">
                    {selectedReport.matching_sections[0].code_snippet}
                  </pre>
                </div>
              )}

              {/* Review Decision Form */}
              <div className="p-5 rounded-2xl bg-[#0c0b24] border border-[#2a276b] space-y-4">
                <h3 className="text-sm font-bold text-white">Record Instructor Determination</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Decision Status</label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                    >
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Confirmed Violation">Confirmed Violation</option>
                      <option value="Not Plagiarism">Not Plagiarism (False Positive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instructor Audit Notes</label>
                    <input
                      type="text"
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="e.g. Variable names renamed; syntax tree structure is identical."
                      className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveReview}
                    className="px-5 py-2 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Decision to Audit Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
