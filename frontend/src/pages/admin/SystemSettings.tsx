import React, { useState } from 'react';
import { Settings, Shield, Cpu, Terminal, Save, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [engineMode, setEngineMode] = useState('local');
  const [executionTimeout, setExecutionTimeout] = useState(2.0);
  const [memoryLimit, setMemoryLimit] = useState(128);
  const [similarityThreshold, setSimilarityThreshold] = useState(60);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Configurations & Sandboxing</h1>
        <p className="text-slate-400 text-sm mt-1">
          Adjust code execution container limits, AST plagiarism thresholds, and security parameters.
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[#2a276b] bg-[#0c0b24] shadow-2xl space-y-6">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Configuration parameters successfully committed to backend environment.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#a5a3ee]" /> Code Execution Sandbox
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Execution Architecture</label>
                <select
                  value={engineMode}
                  onChange={(e) => setEngineMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-white focus:outline-none focus:border-[#5a57be]"
                >
                  <option value="local">Native Subprocess Isolation (Default zero-overhead sandbox)</option>
                  <option value="judge0">Self-Hosted / External Judge0 Engine Gateway</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Process CPU Timeout (Seconds)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="10.0"
                    value={executionTimeout}
                    onChange={(e) => setExecutionTimeout(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Process Memory Limit (MB)</label>
                  <input
                    type="number"
                    min="64"
                    max="512"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" /> Plagiarism Detection Parameters
            </h2>
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Default Flagging Similarity Threshold</span>
                <span className="text-[#a5a3ee] font-bold">{similarityThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Code pairs with composite Token + TF-IDF + AST similarity above this threshold are flagged for instructor audit.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
