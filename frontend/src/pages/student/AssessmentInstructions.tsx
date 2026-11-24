import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assessmentsAPI } from '../../services/api';
import { Assessment } from '../../types';
import {
  Clock, ShieldAlert, CheckCircle, ArrowRight,
  AlertTriangle, Terminal, Code2, ArrowLeft
} from 'lucide-react';

export const AssessmentInstructions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (id) {
      assessmentsAPI.get(id)
        .then((res) => setAssessment(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleStartExam = async () => {
    if (!id) return;
    try {
      await assessmentsAPI.startSession(id);
      navigate(`/student/assessments/${id}/workspace`);
    } catch (err) {
      console.error('Failed to initialize assessment session:', err);
      // Still navigate to workspace if already started
      navigate(`/student/assessments/${id}/workspace`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading assessment instructions...</div>;
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center text-slate-400">
        Assessment not found.
        <Link to="/student/assessments" className="block text-[#a5a3ee] mt-2 text-sm hover:underline">
          Return to assessments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <Link
        to="/student/assessments"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <div className="p-8 rounded-3xl border border-[#2a276b] bg-[#0c0b24] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-[#c2c0f6] border border-brand-800">
                {assessment.category}
              </span>
              <span className="text-xs text-slate-400">• Difficulty: {assessment.difficulty}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{assessment.title}</h1>
          </div>

          <div className="flex items-center gap-4 bg-[#141334] px-4 py-2 rounded-2xl border border-[#2a276b] text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Duration</div>
              <div className="font-bold text-white text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#a5a3ee]" /> {assessment.duration} min
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Total Marks</div>
              <div className="font-bold text-white text-base">{assessment.total_marks} pts</div>
            </div>
          </div>
        </div>

        {/* Instructions Content */}
        <div className="py-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-2">Examination Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {assessment.description || 'This examination evaluates your proficiency in data structures and algorithmic design.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141334]/70 border border-[#2a276b] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a5a3ee] flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Examination Rules & Guidelines
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Monaco IDE:</b> Write code in Python 3, JavaScript (Node.js), C++, Java, or Go. Syntax checking and starter templates are provided.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Test Case Verification:</b> Click <b>Run Code</b> to test sample cases. When confident, click <b>Submit Solution</b> to evaluate against both visible and hidden evaluation test cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Server Authoritative Timer:</b> Your remaining time is calculated by the server. When the timer expires, ongoing work is automatically finalized.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>AI Code Quality:</b> Solutions are reviewed for cyclomatic complexity and maintainability alongside correctness marks.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Academic Integrity Policy</div>
              <p className="leading-relaxed">
                All submissions undergo automated AST and lexical hybrid similarity scanning. Browser window switches and full-screen exits are tracked for instructor review.
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox & Start Button */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-[#0c0b24] border-[#2a276b] focus:ring-cyan-500"
            />
            <span>I confirm that I will complete this assessment independently according to the honor code.</span>
          </label>

          <button
            onClick={handleStartExam}
            disabled={!agreed}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition shadow-xl shadow-[#2F2D7D]/25 flex items-center justify-center gap-2"
          >
            Enter Coding Workspace <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
