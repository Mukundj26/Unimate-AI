import React, { useState } from 'react';
import { SkillGapAnalysis } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { TrendingUp, Sparkles, CheckCircle2, AlertCircle, Calendar, Code, Check } from 'lucide-react';

interface SkillGapViewProps {
  initialSkills?: string[];
  initialRole?: string;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  initialSkills = ['Python', 'TypeScript', 'React', 'PyTorch', 'REST APIs', 'Git'],
  initialRole = 'AI / ML Engineer',
}) => {
  const { language, t } = useLanguage();
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState('');
  const [targetRole, setTargetRole] = useState(initialRole);
  const [level, setLevel] = useState('Mid-Level');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapAnalysis | null>(null);

  const rolePresets = [
    'AI / ML Engineer',
    'Senior Full-Stack Architect',
    'NLP Research Scientist',
    'MLOps & Infrastructure Engineer',
    'Distributed Systems Engineer',
    'Data Science Lead',
  ];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSkills: skills,
          targetRole,
          currentLevel: level,
          language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Skill analysis failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(`Skill Gap Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Skill Gap & Career Taxonomy" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>SEMANTIC SKILL MATCHING</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">CAREER ROADMAPPING</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Skill Gap & Career Taxonomy Analyzer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Semantically benchmark your verified competencies against industry hiring requirements and generate a personalized mastery curriculum.
          </p>
        </div>
      </div>

      {/* Inputs Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Target Career Role</label>
            <div className="space-y-2">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target Role"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <div className="flex flex-wrap gap-1.5">
                {rolePresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                      targetRole === r
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Current Seniority</label>
            <div className="grid grid-cols-3 gap-2">
              {['Junior / Entry', 'Mid-Level', 'Senior'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
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
        </div>

        {/* Current Skills List & Adder */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
            Your Current Skills ({skills.length})
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px] items-center">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="text-slate-400 hover:text-rose-600 leading-none text-sm"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Docker, Redis, Kubernetes, LoRA, CUDA)..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              + Add
            </button>
          </form>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={handleAnalyze}
            disabled={loading || skills.length === 0}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Running Semantic Match...' : 'Calculate Skill Gap'}</span>
          </button>
        </div>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Metric Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center text-indigo-700 shrink-0">
                <span className="text-2xl font-black">{result.matchPercentage}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider">Match</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{result.targetRole}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{result.interviewReadinessAssessment}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                {result.matchedSkills?.length || 0} Matched Skills
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {result.missingCriticalSkills?.length || 0} Critical Gaps
              </span>
            </div>
          </div>

          {/* Matched vs Missing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Competencies</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Missing Skills */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>High-Priority Skill Gaps</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingCriticalSkills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                  >
                    ! {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phased Learning Roadmap */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Prioritized Learning Curriculum</span>
            </h3>

            <div className="space-y-4">
              {result.learningRoadmap?.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                        {phase.phase}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{phase.topic}</h4>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      ~{phase.estimatedWeeks} Weeks
                    </span>
                  </div>

                  {/* Key concepts */}
                  {phase.keyConceptsToMaster && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {phase.keyConceptsToMaster.map((c, ci) => (
                        <span
                          key={ci}
                          className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended project */}
                  {phase.recommendedProjects?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                      <Code className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">Capstone Project:</strong>{' '}
                        {phase.recommendedProjects.join('; ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
