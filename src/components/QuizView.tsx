import React, { useState, useEffect } from 'react';
import { FileItem, SavedQuiz, QuizQuestion } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { FileQuestion, Sparkles, CheckCircle2, XCircle, RotateCcw, Save, Trophy, HelpCircle, FileText, Plus, Minus, Hash } from 'lucide-react';

interface QuizViewProps {
  files: FileItem[];
  preselectedFileId?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ files, preselectedFileId }) => {
  const { language, t } = useLanguage();
  const [sourceType, setSourceType] = useState<'file' | 'custom'>(preselectedFileId ? 'file' : 'custom');
  const [selectedFileId, setSelectedFileId] = useState<string>(preselectedFileId || (files[0]?.id || ''));
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active quiz state
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSavedQuizzes();
  }, []);

  const fetchSavedQuizzes = async () => {
    try {
      const res = await fetch('/api/ai/quiz/list');
      if (res.ok) {
        const data = await res.json();
        setSavedQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setUserAnswers({});
    setShowResults(false);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: sourceType === 'custom' ? customTopic : undefined,
          fileId: sourceType === 'file' ? selectedFileId : undefined,
          numQuestions,
          difficulty,
          language,
        }),
      });

      if (!res.ok) throw new Error('Quiz generation failed');
      const data = await res.json();
      setQuizTitle(data.title || 'Generated Quiz');
      setQuestions(data.questions || []);
    } catch (err: any) {
      alert(`Quiz Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSaveQuiz = async () => {
    try {
      const res = await fetch('/api/ai/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          questions,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchSavedQuizzes();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const loadSavedQuiz = (sq: SavedQuiz) => {
    setQuizTitle(sq.title);
    setQuestions(sq.questions);
    setUserAnswers({});
    setShowResults(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Quiz Generator" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>TEXT UNDERSTANDING & EVALUATION</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">AUTOMATED QUIZ GENERATION</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-amber-500" />
            <span>Interactive Quiz Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Synthesize rigorous multiple-choice assessments directly from your uploaded database files or custom topics.
          </p>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Quiz Source</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType('custom')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'custom'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Custom Topic
              </button>
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'file'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Uploaded File ({files.length})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Difficulty</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-semibold rounded-xl capitalize border transition-all ${
                    difficulty === d
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sourceType === 'custom' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Subject or Topic</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Transformer Attention, Distributed Consensus, Neural Machine Translation..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Uploaded File</label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.originalName} (v{f.version} - {f.folderPath})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Manual Question Selection & Configuration */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Number of Questions
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose a quick preset or manually type / step any custom count (1 to 25 questions)
              </p>
            </div>

            {/* Stepper + Direct Manual Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setNumQuestions((prev) => Math.max(1, prev - 1))}
                  disabled={numQuestions <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold transition-all"
                  aria-label="Decrease questions"
                  title="Decrease questions"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center px-2">
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={numQuestions}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setNumQuestions(Math.max(1, Math.min(25, val)));
                      }
                    }}
                    className="w-12 text-center text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-400">Qs</span>
                </div>

                <button
                  type="button"
                  onClick={() => setNumQuestions((prev) => Math.min(25, prev + 1))}
                  disabled={numQuestions >= 25}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold transition-all"
                  aria-label="Increase questions"
                  title="Increase questions"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Presets + Range Slider */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <span className="text-xs font-medium text-slate-500">Quick Presets:</span>
            {[3, 5, 8, 10, 15, 20].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumQuestions(n)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  numQuestions === n
                    ? 'bg-amber-600 border-amber-600 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n} Qs
              </button>
            ))}

            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-slate-400 font-mono">1</span>
              <input
                type="range"
                min={1}
                max={25}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-28 accent-amber-600 cursor-pointer"
                title="Slide to adjust questions"
              />
              <span className="text-[11px] text-slate-400 font-mono">25</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Configured:</span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-lg font-bold">
              {numQuestions} {numQuestions === 1 ? 'Question' : 'Questions'}
            </span>
            <span>•</span>
            <span className="capitalize text-slate-600">{difficulty} difficulty</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (sourceType === 'custom' && !customTopic.trim())}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing & Synthesizing...' : `Generate ${numQuestions} Questions`}</span>
          </button>
        </div>
      </div>

      {/* Active Quiz Card */}
      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{quizTitle}</h3>
              <p className="text-xs text-slate-500">
                {questions.length} Questions • Difficulty: {difficulty}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveQuiz}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? 'Saved!' : 'Save Quiz'}</span>
              </button>
              <button
                onClick={() => {
                  setUserAnswers({});
                  setShowResults(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => {
              const selectedOption = userAnswers[qIndex];
              const isAnswered = selectedOption !== undefined;

              return (
                <div key={q.id || qIndex} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug pt-0.5">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOption === optIndex;
                      const isCorrect = q.correctIndex === optIndex;

                      let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                      if (showResults) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-amber-100 border-amber-400 text-amber-900 font-semibold';
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-start gap-2 ${btnStyle}`}
                        >
                          <span className="font-bold uppercase text-[10px] px-1 rounded bg-slate-100 text-slate-600 shrink-0">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {showResults && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="mt-3 pl-8 text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Explanation:</span>
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Score view */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(userAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                Grade & Show Explanations
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Score</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {calculateScore()} / {questions.length} (
                    {Math.round((calculateScore() / questions.length) * 100)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Quizzes Shelf */}
      {savedQuizzes.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Saved Assessment Library ({savedQuizzes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedQuizzes.map((sq) => (
              <div
                key={sq.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{sq.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sq.questions.length} Qs • {new Date(sq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => loadSavedQuiz(sq)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-amber-50 text-slate-700"
                >
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
