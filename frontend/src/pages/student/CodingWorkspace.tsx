import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { assessmentsAPI, codeAPI, submissionsAPI } from '../../services/api';
import { Assessment, Question, CodeRunResponse, Submission } from '../../types';
import {
  Play, Send, Clock, CheckCircle2, XCircle, AlertTriangle,
  RotateCcw, Sparkles, Terminal, FileCode, CheckSquare,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Maximize2,
  Minimize2, Shield, Eye, BookOpen, Code2
} from 'lucide-react';

export const CodingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [customInput, setCustomInput] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);

  // Responsive mode for mobile & tablet screens: 'problem' | 'editor' | 'console'
  const [mobilePanel, setMobilePanel] = useState<'problem' | 'editor' | 'console'>('editor');

  // Bottom Console expansion state: 'collapsed' | 'normal' | 'expanded'
  const [consoleState, setConsoleState] = useState<'collapsed' | 'normal' | 'expanded'>('normal');

  // Results state
  const [activeTab, setActiveTab] = useState<'console' | 'quality' | 'history'>('console');
  const [runResult, setRunResult] = useState<CodeRunResponse | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);

  // Timer & Violations
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationToast, setShowViolationToast] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Load Assessment & Session
  useEffect(() => {
    if (id) {
      assessmentsAPI.get(id).then((res) => {
        setAssessment(res.data);
        const firstQ = res.data.questions?.[0];
        if (firstQ) {
          loadStarterCode(firstQ, 'python');
        }
      });

      // Get or start session
      assessmentsAPI.startSession(id).then((sRes) => {
        if (sRes.data) {
          setRemainingSeconds(sRes.data.remaining_seconds);
          setViolationCount(sRes.data.violation_count || 0);
          if (sRes.data.is_submitted) {
            setIsFinished(true);
          }
        }
      });
    }
  }, [id]);

  // Server-authoritative timer countdown
  useEffect(() => {
    if (isFinished || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds, isFinished]);

  // Tab switch / focus integrity listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && id && !isFinished) {
        assessmentsAPI.logViolation(id).then((res) => {
          setViolationCount(res.data.violation_count);
          setShowViolationToast(true);
          setTimeout(() => setShowViolationToast(false), 5000);
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id, isFinished]);

  const currentQuestion: Question | undefined = assessment?.questions?.[currentQuestionIndex];

  const loadStarterCode = (q: Question, lang: string) => {
    if (q.starter_code && q.starter_code[lang]) {
      setCode(q.starter_code[lang]);
    } else {
      if (lang === 'python') {
        setCode("import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n");
      } else if (lang === 'javascript') {
        setCode("const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    // Write your solution here\n}\n\nsolve();\n");
      } else if (lang === 'cpp') {
        setCode("#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n");
      } else if (lang === 'java') {
        setCode("import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n");
      } else if (lang === 'go') {
        setCode("package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println()\n}\n");
      }
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (currentQuestion) {
      loadStarterCode(currentQuestion, newLang);
    }
  };

  const handleQuestionSelect = (idx: number) => {
    setCurrentQuestionIndex(idx);
    const q = assessment?.questions?.[idx];
    if (q) {
      loadStarterCode(q, language);
      fetchQuestionSubmissions(q.id);
    }
  };

  const fetchQuestionSubmissions = async (qId: string) => {
    try {
      const res = await submissionsAPI.list({ question_id: qId, assessment_id: id });
      setPastSubmissions(res.data);
    } catch (e) {
      // ignore
    }
  };

  const handleResetCode = () => {
    if (currentQuestion && window.confirm("Reset editor to original starter code? Any unsaved edits will be discarded.")) {
      loadStarterCode(currentQuestion, language);
    }
  };

  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setIsRunning(true);
    setActiveTab('console');
    if (consoleState === 'collapsed') {
      setConsoleState('normal');
    }
    setMobilePanel('console');

    try {
      const res = await codeAPI.run({
        source_code: code,
        programming_language: language,
        question_id: currentQuestion.id,
        custom_input: isCustomInput ? customInput : undefined
      });
      setRunResult(res.data);
    } catch (err: any) {
      setRunResult({
        status: 'Error',
        verdict: 'Execution Failed',
        total_test_cases: 0,
        passed_test_cases: 0,
        execution_time: 0,
        memory_usage: 0,
        compiler_output: err.response?.data?.detail || 'An error occurred during execution.',
        results: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!currentQuestion) return;
    setIsSubmitting(true);
    setActiveTab('console');
    if (consoleState === 'collapsed') {
      setConsoleState('normal');
    }
    setMobilePanel('console');

    try {
      const res = await codeAPI.submit({
        source_code: code,
        programming_language: language,
        question_id: currentQuestion.id,
        assessment_id: id
      });

      // Fetch detailed submission
      const detailRes = await submissionsAPI.get(res.data.id);
      setLatestSubmission(detailRes.data);
      fetchQuestionSubmissions(currentQuestion.id);

      // Map submission result to console view
      setRunResult({
        status: detailRes.data.verdict,
        verdict: detailRes.data.verdict,
        total_test_cases: detailRes.data.total_test_cases,
        passed_test_cases: detailRes.data.passed_test_cases,
        execution_time: detailRes.data.execution_time,
        memory_usage: detailRes.data.memory_usage,
        compiler_output: detailRes.data.compiler_output,
        results: detailRes.data.test_results || []
      });

      if (detailRes.data.quality_report) {
        setActiveTab('quality');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Submission evaluation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (id) {
      await assessmentsAPI.finishSession(id).catch(() => {});
      setIsFinished(true);
      alert("Assessment time has elapsed. Your solutions have been finalized and recorded.");
      navigate('/student/submissions');
    }
  };

  const handleManualFinish = async () => {
    if (window.confirm("Are you sure you want to finalize and submit this examination? You will not be able to edit solutions once submitted.")) {
      if (id) {
        await assessmentsAPI.finishSession(id).catch(() => {});
        setIsFinished(true);
        navigate('/student/submissions');
      }
    }
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen flex flex-col bg-[#0c0b24] text-slate-100 overflow-hidden select-none">
      {/* Integrity Violation Warning Toast */}
      {showViolationToast && (
        <div className="fixed top-14 right-4 z-50 p-3 sm:p-4 rounded-xl bg-amber-950/95 border border-amber-800 text-amber-200 text-xs shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-xs sm:text-sm">Window Focus Lost ({violationCount} recorded)</div>
            <p className="text-[11px] text-amber-300/80">Please remain inside the examination browser window.</p>
          </div>
        </div>
      )}

      {/* Top Workspace Bar */}
      <header className="h-14 border-b border-[#2a276b] bg-[#141334]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/student/assessments"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18173d] transition shrink-0"
            title="Exit Workspace"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="bg-white/95 rounded px-2 py-0.5 hidden sm:flex items-center shadow-sm shrink-0">
            <img src="/fiit-logo.png" alt="FIIT" className="h-5 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {assessment?.title || 'FIIT Coding Assessment'}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-[#a5a3ee] font-semibold">
                Q{currentQuestionIndex + 1}/{assessment?.questions?.length || 1}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline truncate max-w-[200px]">{currentQuestion?.title}</span>
            </div>
          </div>
        </div>

        {/* Multi-Question Selector pills */}
        <div className="hidden md:flex items-center gap-1.5 mx-2">
          {assessment?.questions?.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => handleQuestionSelect(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                currentQuestionIndex === idx
                  ? 'bg-[#2F2D7D] text-white shadow-md shadow-[#2F2D7D]/35 border border-[#5a57be]'
                  : 'text-slate-400 hover:text-white hover:bg-[#18173d]'
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>

        {/* Timer & Finish button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold ${
              remainingSeconds < 300
                ? 'bg-red-950/80 text-red-400 border border-red-800 animate-pulse'
                : 'bg-[#0c0b24] text-[#a5a3ee] border border-[#2a276b]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={handleManualFinish}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
          >
            <span className="hidden sm:inline">Finish Exam</span>
            <span className="sm:hidden">Finish</span>
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Panel Switcher (Visible on < lg screens) */}
      <div className="lg:hidden h-10 border-b border-[#2a276b] bg-[#0c0b24] px-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 w-full justify-around">
          <button
            onClick={() => setMobilePanel('problem')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobilePanel === 'problem'
                ? 'bg-[#18173d] text-[#a5a3ee] border border-[#2a276b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Problem
          </button>
          <button
            onClick={() => setMobilePanel('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobilePanel === 'editor'
                ? 'bg-[#2F2D7D]/40 text-white border border-[#5a57be]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Code Editor
          </button>
          <button
            onClick={() => setMobilePanel('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobilePanel === 'console'
                ? 'bg-[#18173d] text-[#a5a3ee] border border-[#2a276b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Console {runResult && `(${runResult.verdict})`}
          </button>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel: Problem Statement */}
        <div
          className={`${
            mobilePanel === 'problem' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-5/12 xl:w-4/12 border-r border-[#2a276b] bg-[#0c0b24] flex-col overflow-hidden min-h-0 shrink-0`}
        >
          {/* Question Metadata Subheader */}
          <div className="p-3 sm:p-4 border-b border-[#2a276b]/80 bg-[#141334]/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentQuestion?.difficulty === 'Easy'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : currentQuestion?.difficulty === 'Hard'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {currentQuestion?.difficulty || 'Medium'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{currentQuestion?.topic}</span>
            </div>
            <span className="text-xs font-bold text-slate-300">{currentQuestion?.max_marks || 100} pts</span>
          </div>

          {/* Question Statement Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-sm text-slate-300">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mb-2">{currentQuestion?.title}</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-300 text-xs sm:text-sm">
                {currentQuestion?.description}
              </p>
            </div>

            {/* Input & Output Format */}
            <div className="space-y-3 pt-1">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Input Format</h3>
                <div className="p-2.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-slate-300 whitespace-pre-line font-mono">
                  {currentQuestion?.input_format}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Output Format</h3>
                <div className="p-2.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-slate-300 whitespace-pre-line font-mono">
                  {currentQuestion?.output_format}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Constraints</h3>
                <div className="p-2.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-slate-300 whitespace-pre-line font-mono">
                  {currentQuestion?.constraints}
                </div>
              </div>
            </div>

            {/* Sample Test Case */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a5a3ee]">Sample Test Case</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 mb-1 block">Sample Input</span>
                  <pre className="p-2.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-white font-mono overflow-x-auto">
                    {currentQuestion?.sample_input}
                  </pre>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 mb-1 block">Sample Output</span>
                  <pre className="p-2.5 rounded-lg bg-[#141334] border border-[#2a276b] text-xs text-white font-mono overflow-x-auto">
                    {currentQuestion?.sample_output}
                  </pre>
                </div>
              </div>

              {currentQuestion?.explanation && (
                <div className="p-3 rounded-lg bg-[#141334]/60 border border-[#2a276b]/80 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Explanation: </span>
                  {currentQuestion.explanation}
                </div>
              )}
            </div>

            {/* Mobile Switcher Prompt */}
            <div className="lg:hidden pt-4">
              <button
                onClick={() => setMobilePanel('editor')}
                className="w-full py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Code Editor</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right / Center Panel: Monaco Editor & Output Console */}
        <div
          className={`${
            mobilePanel === 'problem' ? 'hidden' : 'flex'
          } lg:flex flex-1 flex-col overflow-hidden min-w-0 min-h-0 bg-[#0c0b24]`}
        >
          {/* Editor Header Controls */}
          <div className="h-11 border-b border-[#2a276b] bg-[#141334] px-3 sm:px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#0c0b24] border border-[#2a276b] text-xs text-white font-semibold focus:outline-none focus:border-[#5a57be]"
              >
                <option value="python">Python 3 (CPython 3.14)</option>
                <option value="javascript">JavaScript (Node.js 24)</option>
                <option value="cpp">C++ (G++ / Clang)</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="go">Go (Golang)</option>
              </select>

              <button
                onClick={handleResetCode}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#18173d] transition text-xs flex items-center gap-1"
                title="Reset to Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 mr-2">
                <span>Font:</span>
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="px-1.5 py-0.5 rounded bg-[#0c0b24] hover:bg-[#18173d] text-xs"
                >
                  -
                </button>
                <span className="font-mono text-xs px-1">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                  className="px-1.5 py-0.5 rounded bg-[#0c0b24] hover:bg-[#18173d] text-xs"
                >
                  +
                </button>
              </div>

              {/* Quick Action buttons in header for easy reach */}
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#18173d] hover:bg-[#2F2D7D] disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition shadow border border-[#2a276b]"
              >
                <Play className="w-3 h-3 text-[#a5a3ee]" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting || isRunning}
                className="px-3 sm:px-3.5 py-1 rounded-lg bg-[#2F2D7D] hover:bg-[#4844af] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-[#2F2D7D]/30 border border-[#5a57be]/40"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div
            className={`${
              mobilePanel === 'console' ? 'hidden lg:block' : 'block'
            } flex-1 overflow-hidden relative min-h-[220px]`}
          >
            <Editor
              height="100%"
              language={
                language === 'python'
                  ? 'python'
                  : language === 'javascript'
                  ? 'javascript'
                  : language === 'cpp'
                  ? 'cpp'
                  : language === 'java'
                  ? 'java'
                  : 'go'
              }
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: 'on',
              }}
            />
          </div>

          {/* Bottom Console & AI Feedback Panel */}
          <div
            className={`${
              mobilePanel === 'editor' ? 'hidden lg:flex' : 'flex'
            } ${
              consoleState === 'collapsed'
                ? 'h-10'
                : consoleState === 'expanded'
                ? 'h-[60%] lg:h-[55%]'
                : 'h-64 sm:h-72'
            } border-t border-[#2a276b] bg-[#141334] flex-col shrink-0 transition-all duration-200`}
          >
            {/* Console Tab Headers & Expansion Controls */}
            <div className="h-10 border-b border-[#2a276b] bg-[#18173d]/80 px-3 sm:px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                <button
                  onClick={() => {
                    setActiveTab('console');
                    if (consoleState === 'collapsed') setConsoleState('normal');
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeTab === 'console'
                      ? 'bg-[#2F2D7D] text-white border border-[#5a57be]/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Test Results
                </button>

                <button
                  onClick={() => {
                    setActiveTab('quality');
                    if (consoleState === 'collapsed') setConsoleState('normal');
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeTab === 'quality'
                      ? 'bg-[#2F2D7D] text-white border border-[#5a57be]/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a5a3ee]" /> AI Quality
                </button>

                <button
                  onClick={() => {
                    setActiveTab('history');
                    if (consoleState === 'collapsed') setConsoleState('normal');
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'bg-[#2F2D7D] text-white border border-[#5a57be]/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" /> Past Runs ({pastSubmissions.length})
                </button>
              </div>

              {/* Console Resize / Toggle buttons */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setConsoleState(consoleState === 'collapsed' ? 'normal' : 'collapsed')}
                  className="p-1 rounded hover:bg-[#18173d] hover:text-white transition"
                  title={consoleState === 'collapsed' ? 'Expand console' : 'Minimize console'}
                >
                  {consoleState === 'collapsed' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setConsoleState(consoleState === 'expanded' ? 'normal' : 'expanded')}
                  className="hidden sm:inline-block p-1 rounded hover:bg-[#18173d] hover:text-white transition"
                  title={consoleState === 'expanded' ? 'Standard height' : 'Maximize console'}
                >
                  {consoleState === 'expanded' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {consoleState !== 'collapsed' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs min-h-0 bg-[#0c0b24]">
                {activeTab === 'console' && (
                  <div>
                    {!runResult ? (
                      <div className="text-slate-500 flex flex-col items-center justify-center py-6 sm:py-8 font-sans">
                        <Terminal className="w-6 h-6 mb-2 opacity-50 text-[#a5a3ee]" />
                        <span className="text-center text-xs">
                          Click 'Run' to test sample cases or 'Submit' to evaluate all test cases.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 font-sans">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-900">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                runResult.verdict === 'Accepted'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-red-950 text-red-300 border border-red-800'
                              }`}
                            >
                              {runResult.verdict}
                            </span>
                            <span className="text-slate-400 text-xs">
                              Passed {runResult.passed_test_cases} / {runResult.total_test_cases} test cases
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] font-mono">
                            Time: {runResult.execution_time.toFixed(3)}s • Mem: {runResult.memory_usage.toFixed(1)} MB
                          </div>
                        </div>

                        {runResult.compiler_output && (
                          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-200 whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                            {runResult.compiler_output}
                          </div>
                        )}

                        {/* Test case breakdown */}
                        <div className="space-y-2">
                          {runResult.results.map((r, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg border text-xs ${
                                r.verdict === 'Accepted'
                                  ? 'bg-[#141334]/70 border-[#2a276b] text-slate-300'
                                  : 'bg-red-950/20 border-red-900/60 text-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-white flex items-center gap-1.5">
                                  {r.verdict === 'Accepted' ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  )}
                                  Test Case #{idx + 1} {r.is_hidden && <span className="text-[10px] text-slate-400">(Hidden)</span>}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {r.execution_time.toFixed(3)}s • {r.marks_awarded} pts
                                </span>
                              </div>

                              {!r.is_hidden && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-2 bg-[#0c0b24] p-2 rounded border border-slate-900">
                                  <div>
                                    <span className="text-slate-500 block text-[10px] font-sans">Expected Output:</span>
                                    <span className="text-slate-200 break-all">{r.expected_output || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[10px] font-sans">Actual Output:</span>
                                    <span className={`break-all ${r.verdict === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {r.actual_output || '(Empty)'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div>
                    {!latestSubmission?.quality_report ? (
                      <div className="text-slate-500 text-center py-6 sm:py-8 font-sans text-xs">
                        Submit your solution to generate an AI Static AST Code Quality report.
                      </div>
                    ) : (
                      <div className="space-y-4 font-sans">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="p-3 rounded-xl bg-[#141334] border border-[#2a276b]">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Quality Score</div>
                            <div className="text-base sm:text-lg font-bold text-[#a5a3ee]">
                              {latestSubmission.quality_report.quality_score} / 100
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#141334] border border-[#2a276b]">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cyclomatic Complexity</div>
                            <div className="text-base sm:text-lg font-bold text-white">
                              {latestSubmission.quality_report.cyclomatic_complexity}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#141334] border border-[#2a276b]">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Complexity</div>
                            <div className="text-base sm:text-lg font-bold text-emerald-400">
                              {latestSubmission.quality_report.estimated_time_complexity}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#141334] border border-[#2a276b]">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Maintainability</div>
                            <div className="text-base sm:text-lg font-bold text-indigo-400">
                              {latestSubmission.quality_report.maintainability_index} / 100
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#141334]/70 border border-[#2a276b] text-xs">
                          <div className="font-semibold text-white mb-1">AST Analysis Findings</div>
                          <p className="text-slate-400 leading-relaxed text-xs">{latestSubmission.quality_report.explanation}</p>
                        </div>

                        {latestSubmission.quality_report.improvement_suggestions?.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-slate-300">Actionable Suggestions:</div>
                            {latestSubmission.quality_report.improvement_suggestions.map((sug, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                                <Sparkles className="w-3.5 h-3.5 text-[#a5a3ee] shrink-0 mt-0.5" />
                                <span>{sug}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="font-sans space-y-2">
                    {pastSubmissions.length === 0 ? (
                      <div className="text-slate-500 text-center py-6 sm:py-8 text-xs">
                        No previous submissions for this question.
                      </div>
                    ) : (
                      pastSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl border border-[#2a276b] bg-[#141334]/70 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.verdict === 'Accepted'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-red-950 text-red-300 border border-red-800'
                              }`}
                            >
                              {sub.verdict}
                            </span>
                            <span className="font-bold text-white">{sub.score} pts</span>
                            <span className="text-slate-500 uppercase">{sub.programming_language}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                            <span>
                              {sub.passed_test_cases}/{sub.total_test_cases} passed
                            </span>
                            <Link
                              to={`/student/submissions/${sub.id}`}
                              className="text-[#a5a3ee] hover:underline font-semibold"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
