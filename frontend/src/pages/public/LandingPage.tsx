import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2, Shield, Cpu, Zap, Award, CheckCircle2,
  Terminal, Sparkles, ChevronRight, BarChart3, Lock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-24 py-12 md:py-20 overflow-hidden bg-[#0c0b24]">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Glow backdrop themed with #2F2D7D */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-[#2F2D7D]/25 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18173d] border border-[#2a276b] text-xs font-semibold text-[#a5a3ee] mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" /> FIIT – Create Your Value • Automated Coding Assessment
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-none">
          FIIT Coding Assessment{' '}
          <span className="block mt-2 bg-gradient-to-r from-white via-[#a5a3ee] to-[#6461d0] bg-clip-text text-transparent">
            AI Static Analysis & AST Plagiarism Detection
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Conduct secure online programming examinations with automated multi-language compilation, hidden test-case verification, AST code quality metrics, and hybrid similarity auditing.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold text-base transition shadow-xl shadow-[#2F2D7D]/35 hover:scale-[1.02] border border-[#5a57be]/40"
          >
            Start Free Assessment <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl bg-[#141334] hover:bg-[#18173d] border border-[#2a276b] text-white font-semibold text-base transition"
          >
            Explore Demo Accounts
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { label: 'Subprocess Sandbox', sub: 'Zero-Privilege Isolation', icon: Shield },
            { label: 'Multi-Language', sub: 'Python, C++, JS, Java, Go', icon: Terminal },
            { label: 'Hybrid Plagiarism', sub: 'AST + TF-IDF + Token', icon: Cpu },
            { label: 'AI Code Quality', sub: 'Complexity & Heuristics', icon: BarChart3 },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl border border-[#2a276b] bg-[#141334]/80 backdrop-blur-sm text-left shadow-lg">
                <Icon className="w-5 h-5 text-[#a5a3ee] mb-2" />
                <div className="font-semibold text-sm text-white">{item.label}</div>
                <div className="text-xs text-slate-400">{item.sub}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Enterprise Assessment Pillars</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Engineered for university examinations, campus placements, and enterprise developer recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-[#2a276b] bg-[#141334]/80 hover:border-[#5a57be] transition shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#2F2D7D]/30 border border-[#5a57be]/40 flex items-center justify-center text-[#a5a3ee] mb-6">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Monaco Cloud IDE</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full browser coding with auto-indentation, syntax highlighting, starter code templates, sample runs, and test-case verdict diagnostics.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Interactive split-panel view</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Instant syntax checking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Time & Memory profiling</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-[#2a276b] bg-[#141334]/80 hover:border-[#5a57be] transition shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#2F2D7D]/30 border border-[#5a57be]/40 flex items-center justify-center text-[#a5a3ee] mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Code Quality & Complexity</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Goes beyond binary pass/fail verdicts. Evaluates cyclomatic complexity, maintainability index, loop nesting, and actionable style suggestions.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Static AST visitor analysis</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Big-O complexity estimates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Halstead maintainability scoring</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-[#2a276b] bg-[#141334]/80 hover:border-[#5a57be] transition shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#2F2D7D]/30 border border-[#5a57be]/40 flex items-center justify-center text-[#a5a3ee] mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Hybrid Plagiarism Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Combines lexical token analysis, TF-IDF cosine vectorization, and AST structural invariance to detect subtle code restructuring and variable renaming.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Boilerplate starter down-weighting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Side-by-side code diff inspector</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a5a3ee]" /> Instructor decision audit trail</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-tr from-[#2F2D7D] via-[#18173d] to-[#0c0b24] border border-[#5a57be]/40 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white">Experience FIIT Coding Assessment Now</h2>
          <p className="mt-3 text-slate-300 text-base max-w-lg mx-auto">
            Try the live platform with pre-configured Admin, Instructor, and Student accounts.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#2F2D7D] font-extrabold transition shadow-lg shadow-white/20"
            >
              Sign In to Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
