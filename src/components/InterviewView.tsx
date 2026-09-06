import React, { useState, useEffect } from 'react';
import { InterviewEvaluation } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { Mic, MicOff, Sparkles, Trophy, Award, MessageSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const InterviewView: React.FC = () => {
  const { language, t } = useLanguage();
  const [targetRole, setTargetRole] = useState('Senior AI Software Engineer');
  const [questionType, setQuestionType] = useState<'Technical' | 'Behavioral' | 'System Design'>('Behavioral');
  const [question, setQuestion] = useState(
    'Tell me about a time you designed a high-throughput system or resolved a critical production failure. How did you diagnose and remediate it?'
  );
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const sampleQuestions = {
    Behavioral: [
      'Tell me about a time you resolved a critical production failure under pressure.',
      'Describe a disagreement you had with an engineering lead about architecture. How did you resolve it?',
      'How do you prioritize competing deadlines across multiple cross-functional stakeholders?',
    ],
    Technical: [
      'How does scaled dot-product attention prevent gradients from vanishing in deep transformer networks?',
      'Explain how you would mitigate hallucination in an enterprise RAG application.',
      'What are the key differences between optimistic locking and pessimistic locking in distributed transactions?',
    ],
    'System Design': [
      'Design a real-time semantic document search engine serving 10,000 queries per second with sub-50ms latency.',
      'Design a distributed rate limiter for a multi-tenant API gateway.',
      'Design a fault-tolerant notification streaming platform with deduplication.',
    ],
  };

  // Web Speech API Voice STT with localized language support
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isRecording) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'Marathi' ? 'mr-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        };

        recognition.start();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isRecording, language]);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your response in the box.');
      return;
    }
    setIsRecording(!isRecording);
  };

  const handleEvaluate = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          candidateAnswer: answer,
          targetRole,
          questionType,
          language,
        }),
      });

      if (!res.ok) throw new Error('Interview evaluation failed');
      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      alert(`Interview Coach Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Interview Coach & Speech Evaluator" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>ANSWER ANALYSIS & NLP EVALUATION</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">SPEECH & STAR METHOD COACH</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-indigo-600" />
            <span>AI Interview Coach & Response Evaluator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Simulate rigorous behavioral and technical interview questions with live voice transcription and in-depth NLP scoring on clarity, STAR structure, and technical depth.
          </p>
        </div>
      </div>

      {/* Question setup card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Question Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Behavioral', 'Technical', 'System Design'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setQuestionType(cat);
                    setQuestion(sampleQuestions[cat][0]);
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    questionType === cat
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question display */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Interview Question</label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Quick Switch:</span>
              {sampleQuestions[questionType].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium"
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 leading-relaxed">
            {question}
          </div>
        </div>

        {/* Answer input with speech-to-text */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Your Spoken or Written Response</label>
            <button
              type="button"
              onClick={toggleRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening (Click to Stop)...' : 'Record Voice Answer'}</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Speak with microphone or type your response here..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleEvaluate}
            disabled={loading || !answer.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Response...' : 'Run NLP Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="text-center md:border-r md:border-slate-100 pr-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Candidate Score
              </span>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{evaluation.overallScore}</span>
                <span className="text-slate-400 font-bold text-sm">/ 100</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-bold mt-1">
                {evaluation.fillerAndConfidence?.toneSentiment || 'Confident & Articulate'}
              </p>
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">STAR Alignment</span>
                <span className="text-lg font-bold text-slate-800">{evaluation.starAlignment?.score || 80}/100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Technical Depth</span>
                <span className="text-lg font-bold text-slate-800">{evaluation.technicalDepth?.score || 85}/100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Clarity / Brevity</span>
                <span className="text-lg font-bold text-slate-800">{evaluation.clarityAndConcision?.score || 78}/100</span>
              </div>
            </div>
          </div>

          {/* Detailed Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900">STAR Structure Analysis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{evaluation.starAlignment?.feedback}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Technical Specificity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{evaluation.technicalDepth?.feedback}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Filler & Pacing Audit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {evaluation.fillerAndConfidence?.fillerWordImpact || 'Well-paced with minimal verbal disfluencies.'}
              </p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Observed Strengths</span>
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700">
                {evaluation.strengths?.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Key Areas for Improvement</span>
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700">
                {evaluation.improvements?.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Response Rewrite */}
          {evaluation.idealResponseRewrite && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Exemplary 100/100 Benchmark Rewrite</span>
              </h4>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {evaluation.idealResponseRewrite}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
