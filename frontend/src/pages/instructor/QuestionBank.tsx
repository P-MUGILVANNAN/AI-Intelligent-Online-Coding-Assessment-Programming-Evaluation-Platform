import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionsAPI } from '../../services/api';
import { Question } from '../../types';
import {
  FileCode, PlusCircle, Search, Trash2, Eye,
  CheckCircle2, XCircle, Clock, ShieldCheck, X
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const res = await questionsAPI.list({
        search: search || undefined,
        topic: topicFilter || undefined,
        difficulty: difficultyFilter || undefined,
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, topicFilter, difficultyFilter]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await questionsAPI.delete(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } catch (e) {
        alert("Failed to delete question.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Programming Question Bank</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse, manage, and configure questions with visible sample and hidden evaluation test cases.
          </p>
        </div>

        <Link
          to="/instructor/questions/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2D7D] hover:bg-[#4844af] text-white font-bold border border-[#5a57be]/40 text-xs transition shadow-lg shadow-[#2F2D7D]/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add New Question
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
        >
          <option value="">All Topics</option>
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

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0c0b24] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions Table */}
      <div className="rounded-2xl border border-[#2a276b] bg-[#0c0b24] overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No questions found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#141334] text-slate-400 uppercase border-b border-[#2a276b]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Expected Complexity</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Test Cases</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-[#141334]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#a5a3ee] shrink-0" />
                      <span>{q.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{q.topic}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : q.difficulty === 'Hard'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {q.expected_time_complexity} / {q.expected_space_complexity}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{q.max_marks}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {q.test_cases?.length || 0} cases
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedQuestion(q)}
                          className="p-1.5 rounded-lg bg-[#141334] hover:bg-slate-800 text-[#a5a3ee]"
                          title="Inspect Problem & Test Cases"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Question Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-[#0c0b24]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#141334] border border-[#2a276b] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#2a276b] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#a5a3ee] font-semibold">{selectedQuestion.topic}</span>
                <h2 className="text-lg font-bold text-white">{selectedQuestion.title}</h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Description</h3>
                <p className="whitespace-pre-line leading-relaxed text-slate-300">{selectedQuestion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-400 mb-1">Input Format</h4>
                  <pre className="p-2.5 rounded-lg bg-[#0c0b24] border border-[#2a276b] text-xs font-mono">{selectedQuestion.input_format}</pre>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 mb-1">Output Format</h4>
                  <pre className="p-2.5 rounded-lg bg-[#0c0b24] border border-[#2a276b] text-xs font-mono">{selectedQuestion.output_format}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">
                  Configured Test Cases ({selectedQuestion.test_cases?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedQuestion.test_cases?.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      className="p-3 rounded-xl border border-[#2a276b] bg-[#0c0b24] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          #{idx + 1} {tc.is_hidden ? (
                            <span className="text-amber-400 text-[10px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              Hidden Test Case
                            </span>
                          ) : (
                            <span className="text-[#a5a3ee] text-[10px] bg-[#18173d]/60 px-2 py-0.5 rounded border border-[#2a276b]">
                              Public Sample
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400">
                          {tc.marks} marks • {tc.time_limit}s • {tc.memory_limit}MB
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-sans">Input:</span>
                          <pre className="p-1.5 rounded bg-[#141334] overflow-x-auto">{tc.input_data}</pre>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-sans">Expected Output:</span>
                          <pre className="p-1.5 rounded bg-[#141334] overflow-x-auto text-emerald-300">{tc.expected_output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
