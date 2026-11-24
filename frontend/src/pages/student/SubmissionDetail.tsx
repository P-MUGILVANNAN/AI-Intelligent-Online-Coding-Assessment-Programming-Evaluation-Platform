import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionsAPI, reportsAPI } from '../../services/api';
import { Submission } from '../../types';
import {
  FileCode, CheckCircle2, XCircle, ArrowLeft, Download,
  Sparkles, Terminal, Clock, Cpu, Award
} from 'lucide-react';

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      submissionsAPI.get(id)
        .then((res) => setSubmission(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!submission) return;
    setDownloading(true);
    await reportsAPI.downloadPdf(submission.student_id, submission.assessment_id);
    setDownloading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading submission analysis...</div>;
  }

  if (!submission) {
    return (
      <div className="p-8 text-center text-slate-400">
        Submission not found.
        <Link to="/student/submissions" className="block text-[#a5a3ee] mt-2 text-sm hover:underline">
          Return to submission history
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/student/submissions"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Submissions
        </Link>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141334] hover:bg-slate-800 border border-slate-700 text-[#a5a3ee] font-semibold text-xs transition shadow disabled:opacity-50"
        >
          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          {downloading ? 'Downloading Scorecard...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Scorecard Header */}
      <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                submission.verdict === 'Accepted'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {submission.verdict === 'Accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {submission.verdict}
            </span>
            <span className="text-xs text-slate-400 uppercase font-semibold">• {submission.programming_language}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{submission.question_title}</h1>
          <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-6 bg-[#141334]/70 p-4 rounded-xl border border-[#2a276b] text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Obtained Score</div>
            <div className="text-2xl font-extrabold text-white">{submission.score} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Test Cases</div>
            <div className="text-base font-bold text-[#a5a3ee]">{submission.passed_test_cases} / {submission.total_test_cases} passed</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Runtime</div>
            <div className="text-base font-bold text-slate-200">{submission.execution_time.toFixed(3)}s</div>
          </div>
        </div>
      </div>

      {/* AI Code Quality Card */}
      {submission.quality_report && (
        <div className="p-6 rounded-2xl border border-brand-800/40 bg-gradient-to-br from-brand-950/40 via-slate-950 to-slate-950 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a5a3ee]" /> AI Code Quality & Static AST Analysis
            </h2>
            <span className="text-xs text-[#c2c0f6] font-semibold bg-[#18173d] px-2.5 py-1 rounded-full border border-[#2a276b]">
              Quality Rating: {submission.quality_report.quality_score} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-[#141334] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Cyclomatic Complexity</div>
              <div className="text-lg font-bold text-white mt-1">{submission.quality_report.cyclomatic_complexity}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141334] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Time Complexity</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{submission.quality_report.estimated_time_complexity}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141334] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Maintainability Index</div>
              <div className="text-lg font-bold text-indigo-400 mt-1">{submission.quality_report.maintainability_index} / 100</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141334] border border-[#2a276b]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Readability Index</div>
              <div className="text-lg font-bold text-[#a5a3ee] mt-1">{submission.quality_report.readability_score} / 100</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141334]/70 border border-[#2a276b] text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Analyzer Explanation:</span>
            {submission.quality_report.explanation}
          </div>

          {submission.quality_report.improvement_suggestions?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Recommendations for Improvement:</div>
              <ul className="space-y-1.5">
                {submission.quality_report.improvement_suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#a5a3ee] shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Source Code Box */}
      <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#a5a3ee]" /> Submitted Source Code
        </h2>
        <pre className="p-4 rounded-xl bg-[#141334] border border-[#2a276b] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {submission.source_code}
        </pre>
      </div>

      {/* Test Results Breakdown */}
      <div className="p-6 rounded-2xl border border-[#2a276b] bg-[#0c0b24] space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" /> Detailed Test-Case Breakdown
        </h2>

        <div className="space-y-2">
          {submission.test_results?.map((tr, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs ${
                tr.verdict === 'Accepted'
                  ? 'bg-[#141334]/50 border-[#2a276b] text-slate-300'
                  : 'bg-red-950/20 border-red-900/60 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white flex items-center gap-2">
                  {tr.verdict === 'Accepted' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  Test Case #{idx + 1} {tr.is_hidden && <span className="text-[10px] text-slate-500 font-normal">(Hidden Evaluation Case)</span>}
                </span>
                <span className="text-slate-400">
                  {tr.execution_time.toFixed(3)}s • {tr.memory_usage.toFixed(1)}MB • {tr.marks_awarded} pts
                </span>
              </div>

              {!tr.is_hidden && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#0c0b24] p-3 rounded-lg border border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-1">Expected Output:</span>
                    <pre className="text-slate-300 overflow-x-auto">{tr.expected_output}</pre>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-1">Actual Output:</span>
                    <pre className={tr.verdict === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}>
                      {tr.actual_output || '(Empty)'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
