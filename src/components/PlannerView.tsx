import React, { useState, useEffect } from 'react';
import { StudyPlan } from '../types.ts';
import { useSync } from '../context/SyncContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { CalendarDays, Sparkles, CheckCircle2, Clock, CheckSquare, Square, Plus, Trash2 } from 'lucide-react';

export const PlannerView: React.FC = () => {
  const { refreshTrigger } = useSync();
  const { language, t } = useLanguage();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Creation form state
  const [goal, setGoal] = useState('Pass NLP & Distributed Systems Final Exam');
  const [syllabus, setSyllabus] = useState(
    'Covers Transformer architectures, BERT/GPT pre-training, RoBERTa, LoRA fine-tuning, vector databases, and Raft consensus algorithm.'
  );
  const [weeks, setWeeks] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [examDate, setExamDate] = useState('2026-06-15');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [refreshTrigger]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/ai/planner');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        if (data.plans?.length > 0 && !selectedPlanId) {
          setSelectedPlanId(data.plans[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch plans error:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          syllabusOrTopics: syllabus,
          availableWeeks: weeks,
          hoursPerWeek,
          examDate,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate study plan');
      const data = await res.json();
      setPlans((prev) => [data.plan, ...prev]);
      setSelectedPlanId(data.plan.id);
    } catch (err: any) {
      alert(`Study Planner Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (planId: string, weekIndex: number, taskIndex: number) => {
    // Optimistic UI update
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id !== planId) return p;
        const newSchedule = [...p.schedule];
        const targetWeek = { ...newSchedule[weekIndex] };
        const newTasks = [...targetWeek.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], done: !newTasks[taskIndex].done };
        targetWeek.tasks = newTasks;
        newSchedule[weekIndex] = targetWeek;
        return { ...p, schedule: newSchedule };
      })
    );

    try {
      await fetch(`/api/ai/planner/${planId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekIndex, taskIndex }),
      });
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Calculate stats
  let totalTasks = 0;
  let completedTasks = 0;
  if (activePlan?.schedule) {
    activePlan.schedule.forEach((w) => {
      w.tasks.forEach((t) => {
        totalTasks += 1;
        if (t.done) completedTasks += 1;
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Study Planner & Schedule" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>TOPIC EXTRACTION & CLASSIFICATION</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">TIMELINE OPTIMIZATION</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <span>Intelligent Study Planner & Syllabus Scheduler</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Extract key topics and concepts from course syllabi, pace your study intervals, and track milestones with persistent synchronization.
          </p>
        </div>
      </div>

      {/* Plan generator card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Generate New Study Timeline</h3>
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course or Goal</label>
              <input
                type="text"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Advanced NLP & PyTorch"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam / Due Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Syllabus Text or Topics to Cover</label>
            <textarea
              rows={3}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Paste course modules, syllabus text, or list of subjects..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Duration:</span>
                <select
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value={2}>2 Weeks (Crash Course)</option>
                  <option value={4}>4 Weeks (Standard)</option>
                  <option value={8}>8 Weeks (Comprehensive)</option>
                  <option value={12}>12 Weeks (Semester)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Effort:</span>
                <select
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value={5}>5 hrs/week</option>
                  <option value={10}>10 hrs/week</option>
                  <option value={20}>20 hrs/week</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Roadmap...' : 'Generate Plan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active plan view */}
      {activePlan && (
        <div className="space-y-6 animate-in fade-in">
          {/* Plan Selector tabs if multiple */}
          {plans.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                    p.id === activePlan.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* Plan Dashboard Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{activePlan.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Goal: {activePlan.goal} • Exam Date: {activePlan.examDate || 'Self-paced'}
              </p>
              {activePlan.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activePlan.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-56 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Progress</span>
                <span>{progressPercent}% ({completedTasks}/{totalTasks})</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Weeks Schedule */}
          <div className="space-y-4">
            {activePlan.schedule?.map((week, wIdx) => (
              <div
                key={week.week || wIdx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      W{week.week}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{week.title}</h4>
                      <p className="text-[11px] text-slate-500">{week.focus}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {week.tasks?.map((taskObj, tIdx) => (
                    <div
                      key={tIdx}
                      onClick={() => handleToggleTask(activePlan.id, wIdx, tIdx)}
                      className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        taskObj.done
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="pt-0.5 text-indigo-600">
                        {taskObj.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs flex-1 font-medium">{taskObj.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
