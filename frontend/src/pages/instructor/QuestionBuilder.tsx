import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionsAPI } from '../../services/api';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle, Code2, CheckCircle2 } from 'lucide-react';

export const QuestionBuilder: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [maxMarks, setMaxMarks] = useState(100);
  const [timeComplexity, setTimeComplexity] = useState('O(N)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(1)');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [explanation, setExplanation] = useState('');

  const [pythonStarter, setPythonStarter] = useState("import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n");
  const [jsStarter, setJsStarter] = useState("const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    // Write your solution here\n}\n\nsolve();\n");

  const [testCases, setTestCases] = useState<Array<{
    input_data: string;
    expected_output: string;
    marks: number;
    is_hidden: boolean;
    time_limit: number;
    memory_limit: number;
  }>>([
    { input_data: '', expected_output: '', marks: 50, is_hidden: false, time_limit: 2.0, memory_limit: 128 },
    { input_data: '', expected_output: '', marks: 50, is_hidden: true, time_limit: 2.0, memory_limit: 128 }
  ]);

  const [loading, setLoading] = useState(false);

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { input_data: '', expected_output: '', marks: 25, is_hidden: true, time_limit: 2.0, memory_limit: 128 }
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, idx) => idx !== index));
  };

  const handleUpdateTestCase = (index: number, field: string, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await questionsAPI.create({
        title,
        topic,
        difficulty,
        max_marks: Number(maxMarks),
        expected_time_complexity: timeComplexity,
        expected_space_complexity: spaceComplexity,
        description,
        input_format: inputFormat,
        output_format: outputFormat,
        constraints,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        explanation,
        starter_code: {
          python: pythonStarter,
          javascript: jsStarter
        },
        test_cases: testCases.filter((tc) => tc.input_data.trim() || tc.expected_output.trim()),
      });
      navigate('/instructor/questions');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/instructor/questions"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      <div className="p-8 rounded-3xl border border-[#2a276b] bg-[#0c0b24] shadow-2xl">
        <h1 className="text-2xl font-extrabold text-white mb-1">Question Builder</h1>
        <p className="text-xs text-slate-400 mb-8">
          Author a new algorithmic problem, configure starter code, and define authorized public and hidden test cases.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Invert Binary Tree"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-sm text-white focus:outline-none focus:border-[#5a57be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
              >
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Sorting">Sorting</option>
                <option value="Searching">Searching</option>
                <option value="Recursion">Recursion</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Graphs">Graphs</option>
                <option value="Trees">Trees</option>
                <option value="Greedy Algorithms">Greedy Algorithms</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Data Structures">Data Structures</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Time Complexity</label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="O(N)"
                className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Space Complexity</label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="O(1)"
                className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the algorithmic problem, definitions, and requirements..."
              className="w-full p-3 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Format</label>
              <textarea
                rows={2}
                required
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="First line: N..."
                className="w-full p-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Output Format</label>
              <textarea
                rows={2}
                required
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="Return single integer..."
                className="w-full p-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Constraints</label>
              <textarea
                rows={2}
                required
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="1 <= N <= 10^5..."
                className="w-full p-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sample Input</label>
              <textarea
                rows={2}
                required
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sample Output</label>
              <textarea
                rows={2}
                required
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be] font-mono"
              />
            </div>
          </div>

          {/* Test Cases Manager */}
          <div className="pt-6 border-t border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Evaluation Test Cases</h2>
                <p className="text-[11px] text-slate-400">Configure visible sample tests and hidden validation tests.</p>
              </div>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="px-3 py-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 border border-slate-700 text-[#a5a3ee] font-semibold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Test Case
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#2a276b] bg-[#141334]/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Test Case #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.is_hidden}
                          onChange={(e) => handleUpdateTestCase(idx, 'is_hidden', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-cyan-500 bg-[#0c0b24] border-[#2a276b]"
                        />
                        <span>Hidden Test</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Standard Input</label>
                      <textarea
                        rows={2}
                        value={tc.input_data}
                        onChange={(e) => handleUpdateTestCase(idx, 'input_data', e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#0c0b24] border border-[#2a276b] text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Expected Output</label>
                      <textarea
                        rows={2}
                        value={tc.expected_output}
                        onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#0c0b24] border border-[#2a276b] text-xs text-white font-mono text-emerald-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-[#2F2D7D]/25 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Question...' : 'Save to Question Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
