import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assessmentsAPI, questionsAPI } from '../../services/api';
import { Question } from '../../types';
import { ArrowLeft, Save, PlusCircle, CheckSquare, Clock, Award, Shield } from 'lucide-react';

export const CreateAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Data Structures');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [status, setStatus] = useState('Active');
  const [visibility, setVisibility] = useState('Public');
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    questionsAPI.list({ limit: 100 })
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleToggleQuestion = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert("Please select at least one question from the Question Bank.");
      return;
    }

    setLoading(true);
    try {
      await assessmentsAPI.create({
        title,
        description,
        category,
        difficulty,
        duration: Number(duration),
        total_marks: Number(totalMarks),
        number_of_questions: selectedQuestionIds.length,
        status,
        visibility,
        negative_marking: negativeMarking,
        allowed_languages: ['python', 'javascript', 'cpp', 'java', 'go'],
        question_ids: selectedQuestionIds,
      });
      navigate('/instructor/assessments');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/instructor/assessments"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <div className="p-8 rounded-3xl border border-[#2a276b] bg-[#0c0b24] shadow-2xl">
        <h1 className="text-2xl font-extrabold text-white mb-1">Create Programming Assessment</h1>
        <p className="text-xs text-slate-400 mb-8">
          Design a structured online coding exam and link problems from the institutional question bank.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assessment Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Algorithms & Data Structures Examination"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141334] border border-[#2a276b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Instructions</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter candidate instructions, rules, and honor code statements..."
                className="w-full p-3 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5a57be]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Total Marks</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141334] border border-[#2a276b] text-xs text-white focus:outline-none focus:border-[#5a57be]"
                />
              </div>
            </div>
          </div>

          {/* Question Selector Bank */}
          <div className="pt-6 border-t border-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#a5a3ee]" /> Select Questions from Bank ({selectedQuestionIds.length} selected)
              </label>
              <Link to="/instructor/questions/create" className="text-xs text-[#a5a3ee] hover:underline">
                + Create New Question
              </Link>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-[#2a276b] p-3 rounded-2xl bg-[#141334]/50">
              {questions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#18173d]/40 border-[#2a276b]/80 text-white'
                        : 'bg-[#0c0b24]/40 border-[#2a276b] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-cyan-500 bg-[#0c0b24] border-[#2a276b]"
                      />
                      <div>
                        <div className="font-semibold text-xs text-white">{q.title}</div>
                        <div className="text-[10px] text-slate-400">{q.topic} • Max: {q.max_marks} pts</div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-300'
                          : q.difficulty === 'Hard'
                          ? 'bg-red-950 text-red-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-[#2F2D7D]/25 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating Assessment...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
