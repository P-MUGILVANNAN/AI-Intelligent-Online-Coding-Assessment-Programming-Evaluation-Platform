import React from 'react';
import {
  Code2, Shield, Cpu, Zap, Award, CheckCircle2,
  Terminal, BarChart3, Database, FileText, Lock, Globe
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const modules = [
    {
      title: "Isolated Code Sandbox Engine",
      icon: Shield,
      description: "Student code executes inside isolated temporary containers with hard resource limits: 2.0s execution timeout, 128MB memory ceiling, process termination on timeout, and strict module import filtering.",
      points: ["Zero-privilege process execution", "Strict process & memory limits via psutil", "Network egress completely disabled", "Automatic cleanup of temporary workspaces"]
    },
    {
      title: "Interactive Monaco Online IDE",
      icon: Terminal,
      description: "Full-featured browser coding environment modeled after industry standards (LeetCode, VS Code). Includes multi-language syntax highlighting, starter code loader, dark theme, and split-panel testing.",
      points: ["Support for Python, Node.js, C++, Java, and Go", "Auto-loaded starter code templates", "Run Code on public sample cases", "Submit Code with hidden test verification"]
    },
    {
      title: "AI-Powered Code Quality Analysis",
      icon: Cpu,
      description: "Evaluates the craft and maintainability of code independently from correctness. AST node analysis calculates cyclomatic complexity, Halstead maintainability, and identifies nested loops.",
      points: ["Static AST visitor tree analysis", "Separation of correctness marks vs quality score", "Algorithmic Big-O time complexity estimate", "Actionable refactoring recommendations"]
    },
    {
      title: "Hybrid AST Plagiarism Detection",
      icon: Lock,
      description: "IEEE research-oriented similarity engine combining Token-based Jaccard similarity, TF-IDF cosine vectorization, and canonical AST syntax structure comparison.",
      points: ["Resistant to variable renaming & comments removal", "Starter-code boilerplate down-weighting", "Interactive side-by-side code diff viewer", "Multi-stage instructor review & audit trail"]
    },
    {
      title: "Comprehensive Assessment Management",
      icon: FileText,
      description: "Instructors and administrators can create timed examinations with question banks, negative marking, randomized ordering, public/hidden test cases, and scheduled access windows.",
      points: ["Draft, Scheduled, Active, Completed lifecycle", "Per-test-case marks and execution time limits", "Real-time session timers & deadline auto-submit", "Institutional access control & student assignment"]
    },
    {
      title: "Analytics & Institutional Reports",
      icon: BarChart3,
      description: "Interactive visual dashboards using Recharts for students, instructors, and university administrators. Export assessment summaries in CSV and individual student scorecards in PDF.",
      points: ["Topic-wise performance breakdown", "Historical progress tracking over time", "One-click PDF student report generation", "Class-wide score distribution & difficult question metrics"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 bg-[#0c0b24]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">FIIT Coding Assessment Capabilities & Features</h1>
        <p className="mt-4 text-slate-400 text-lg">
          An end-to-end overview of FIIT Coding Assessment's technical architecture, code evaluation sandbox, and AI evaluation engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-8 rounded-2xl border border-[#2a276b] bg-[#141334]/80 hover:border-[#5a57be] transition shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#2F2D7D]/30 border border-[#5a57be]/40 flex items-center justify-center text-[#a5a3ee] mb-6">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{m.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{m.description}</p>
              <ul className="space-y-2.5">
                {m.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#a5a3ee] shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
