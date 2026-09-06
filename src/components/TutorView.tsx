import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { GraduationCap, Sparkles, BookOpen, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react';

export const TutorView: React.FC = () => {
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [style, setStyle] = useState<'Analogy-rich' | 'Formal Proof' | 'Step-by-Step Code' | 'Socratic'>('Analogy-rich');
  const [background, setBackground] = useState('');
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<string | null>(null);

  const sampleTopics = [
    'Backpropagation and Chain Rule in Deep Learning',
    'Self-Attention Matrix Computation in Transformers',
    'CAP Theorem & Eventual Consistency in Distributed Databases',
    'Dynamic Programming: Longest Common Subsequence',
    'Retrieval-Augmented Generation (RAG) chunking strategies',
  ];

  const handleTeach = async (overrideTopic?: string) => {
    const t = overrideTopic || topic;
    if (!t.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrQuestion: t,
          level,
          explanationStyle: style,
          userBackground: background || undefined,
          language,
        }),
      });

      if (!res.ok) throw new Error('Tutoring service failed');
      const data = await res.json();
      setLesson(data.explanation);
    } catch (err: any) {
      alert(`Tutor error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Global language choice banner */}
      <LanguageSelector variant="banner" featureName="AI Tutor" />

      {/* Header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>PEDAGOGICAL INTELLIGENCE</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">ADAPTIVE LEARNING</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>AI Tutor & Personalized Explanations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Master difficult concepts with customized pedagogical depth, intuitive analogies, counterexamples, and active recall checks.
          </p>
        </div>
      </div>

      {/* Configuration & Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
            Concept, Question, or Algorithm to Master
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How does the transformer scaled dot-product attention formula work mathematically?"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleTeach()}
              disabled={loading || !topic.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Preparing Lesson...' : 'Teach Me'}</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Learner Level</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    level === lvl
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pedagogical Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Analogy-rich">Analogy-rich (Intuitive)</option>
              <option value="Formal Proof">Formal Proof & Math</option>
              <option value="Step-by-Step Code">Step-by-Step Code Implementation</option>
              <option value="Socratic">Socratic (Guiding Questions)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Learner Context (Optional)</label>
            <input
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="e.g. CS Sophomore, Python developer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Study Concepts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleTopics.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(s);
                  handleTeach(s);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Lesson */}
      {lesson && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                ✓
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Personalized Lesson Plan</h3>
                <p className="text-xs text-slate-500">Target Level: {level} • Style: {style}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTopic('');
                setLesson(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-xs text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap">
            {lesson}
          </div>
        </div>
      )}
    </div>
  );
};
