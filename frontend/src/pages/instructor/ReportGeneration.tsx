import React, { useEffect, useState } from 'react';
import { assessmentsAPI, reportsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  FileText, Download, CheckCircle2, AlertTriangle,
  Award, Search, BarChart3, Users
} from 'lucide-react';

export const ReportGeneration: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const handleDownloadCsv = async () => {
    if (!selectedAssessmentId) return;
    setDownloadingCsv(true);
    await reportsAPI.downloadCsv(selectedAssessmentId);
    setDownloadingCsv(false);
  };

  const handleDownloadPdf = async (studentId: string) => {
    setDownloadingPdfId(studentId);
    await reportsAPI.downloadPdf(studentId, selectedAssessmentId);
    setDownloadingPdfId(null);
  };

  useEffect(() => {
    assessmentsAPI.list().then((res) => {
      setAssessments(res.data);
      if (res.data.length > 0) {
        setSelectedAssessmentId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedAssessmentId) {
      setLoading(true);
      reportsAPI.assessment(selectedAssessmentId)
        .then((res) => setReportData(res.data))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [selectedAssessmentId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Assessment Reports & Exports</h1>
          <p className="text-slate-400 text-sm mt-1">Export CSV spreadsheets and download candidate PDF evaluation scorecards.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white font-semibold focus:outline-none focus:border-[#5a57be]"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          {selectedAssessmentId && (
            <button
              onClick={handleDownloadCsv}
              disabled={downloadingCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${downloadingCsv ? 'animate-bounce' : ''}`} />
              {downloadingCsv ? 'Exporting...' : 'Export CSV Sheet'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading assessment report...</div>
      ) : !reportData ? (
        <div className="text-center py-12 text-slate-400 text-sm">No report data found.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
              <div className="text-xs text-slate-400 mb-1">Total Enrolled</div>
              <div className="text-2xl font-bold text-white">{reportData.total_participants}</div>
            </div>
            <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
              <div className="text-xs text-slate-400 mb-1">Total Exam Marks</div>
              <div className="text-2xl font-bold text-[#a5a3ee]">{reportData.total_marks} pts</div>
            </div>
            <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
              <div className="text-xs text-slate-400 mb-1">Duration</div>
              <div className="text-2xl font-bold text-slate-200">{reportData.duration} min</div>
            </div>
            <div className="p-5 rounded-xl border border-[#2a276b] bg-[#0c0b24]">
              <div className="text-xs text-slate-400 mb-1">Submissions Received</div>
              <div className="text-2xl font-bold text-emerald-400">{reportData.results?.length || 0}</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#2a276b] flex items-center justify-between">
              <span className="font-bold text-white text-xs">Student Scorecards & PDF Exports</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                  <tr>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Exam Status</th>
                    <th className="py-3 px-4">Violations</th>
                    <th className="py-3 px-4 text-right">PDF Scorecard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {reportData.results?.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#141334]/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{r.student_name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{r.student_email}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{r.score} pts</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#a5a3ee]">{r.percentage}%</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-[#18173d] text-[#c2c0f6] border border-[#2a276b]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {r.violations > 0 ? (
                          <span className="text-amber-400 font-semibold">{r.violations} alerts</span>
                        ) : (
                          <span className="text-emerald-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDownloadPdf(r.student_id)}
                          disabled={downloadingPdfId === r.student_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 border border-slate-700 text-[#a5a3ee] font-semibold text-xs transition disabled:opacity-50"
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingPdfId === r.student_id ? 'animate-bounce' : ''}`} />
                          {downloadingPdfId === r.student_id ? 'Downloading...' : 'PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
