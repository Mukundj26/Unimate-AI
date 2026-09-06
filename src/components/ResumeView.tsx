import React, { useState, useEffect } from 'react';
import { FileItem, ResumeAnalysis, MatchedJobRole } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Award,
  Briefcase,
  TrendingUp,
  Target,
  Check,
  Copy,
  Layers,
  Zap,
  DollarSign,
  GraduationCap,
  Code,
  Globe,
  Database,
  Terminal,
  Compass,
} from 'lucide-react';

interface ResumeViewProps {
  files: FileItem[];
  preselectedFileId?: string;
  onNavigateToSkills?: (extractedSkills: string[], targetRole: string) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({
  files,
  preselectedFileId,
  onNavigateToSkills,
}) => {
  const { language, t } = useLanguage();
  const [sourceType, setSourceType] = useState<'file' | 'text'>(preselectedFileId ? 'file' : 'text');
  const [selectedFileId, setSelectedFileId] = useState(preselectedFileId || files[0]?.id || '');
  const [resumeText, setResumeText] = useState('');
  const [targetJob, setTargetJob] = useState('Senior AI / Software Engineer');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jobFilter, setJobFilter] = useState<'all' | 'immediate' | 'near_term' | 'growth'>('all');
  const [skillDisplayMode, setSkillDisplayMode] = useState<'categorized' | 'all'>('categorized');
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedFileId) {
      setSelectedFileId(preselectedFileId);
      setSourceType('file');
    } else if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [preselectedFileId, files]);

  const sampleResume = `MUKUND MACHINDRA JARAD
Pune, Maharashtra | mukundjarad26@gmail.com | linkedin.com/in/mukundjarad | github.com/mukundjarad

CAREER OBJECTIVE
Undergraduate AI & Machine Learning engineer passionate about full-stack intelligent systems, natural language processing, and scalable civic technology solutions.

EDUCATION
B.E. in Artificial Intelligence and Machine Learning
AISSMS College of Engineering, Pune (2022 - 2026) | CGPA: 9.23 / 10

TECHNICAL SKILLS
- Programming Languages: Python, C++, Java, C, SQL, HTML/CSS, JavaScript
- Frameworks & Libraries: React, Node.js, Express, NLP (Spacy/NLTK concepts), PyTorch/Scikit-learn
- Databases & Cloud: Firebase, MySQL, PostgreSQL, Git, Linux CLI
- Core Competencies: Data Structures & Algorithms, Object-Oriented Programming, DBMS, Computer Networks, REST APIs

PROJECT HIGHLIGHTS
1. Gramseva Portal (Civic-Tech E-Governance Platform)
   - Architected responsive web application using HTML, CSS, JavaScript, and Firebase backend.
   - Streamlined administrative document requests, citizen service tracking, and notification workflows for Gram Panchayat communities.
2. AI-Enhanced Education Platform
   - Built personalized learning system integrating Natural Language Processing for adaptive quizzes, syllabus breakdowns, and AI tutoring.
   - Designed modular state synchronization and active recall flashcard generation pipelines.
3. Library Management System
   - Developed relational desktop/backend system in Python and SQL with automated book checkout tracking and fine calculation.

LEADERSHIP & HACKATHONS
- Team Leader at Kurukshetra 2.0 (MIT Alandi)
- Participant at HackFusion 2.0 (SGGS Nanded)`;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: sourceType === 'text' ? (resumeText || sampleResume) : undefined,
          fileId: sourceType === 'file' ? selectedFileId : undefined,
          targetJobTitle: targetJob,
          language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data: ResumeAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      alert(`Resume Analysis Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyRoleDetails = (job: MatchedJobRole, index: number) => {
    const text = `Job Role: ${job.roleTitle}
Match Score: ${job.matchScore}% (${job.tier})
Salary Benchmark: ${job.estimatedSalary}
Demand: ${job.industryDemand}

Why You Qualify:
${job.whyYouQualify}

Matched Skills:
${job.matchedSkills.join(', ')}

Skills to Learn / Improve:
${job.missingSkillsToLearn.join(', ')}

Recommended Action:
${job.recommendedAction}`;

    navigator.clipboard.writeText(text);
    setCopiedJobId(`job-${index}`);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  const filteredJobs = analysis?.matchingJobs?.filter((job) => {
    if (jobFilter === 'all') return true;
    return job.tier === jobFilter;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <LanguageSelector variant="banner" featureName="Resume & CV Intelligence" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>NER & SKILLS TAXONOMY</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">CAREER & JOB MATCHING ENGINE</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">ATS OPTIMIZATION</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Resume & CV Intelligence Analyzer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Extract verified skills, calculate ATS readiness scores, and discover exactly which high-paying tech jobs you qualify to achieve based on your personal skill profile.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Primary Career Interest / Target Title
            </label>
            <input
              type="text"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              placeholder="e.g. AI / ML Engineer, Full Stack Developer, Data Scientist..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Input Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType('text')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'text'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Paste Resume Text
              </button>
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'file'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Select from DB Storage ({files.length})
              </button>
            </div>
          </div>
        </div>

        {sourceType === 'text' ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Resume Plaintext / Markdown</label>
              <button
                type="button"
                onClick={() => setResumeText(sampleResume)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Insert Sample Resume
              </button>
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste complete resume text here..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Uploaded File</label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.originalName} ({f.mimeType.includes('pdf') ? 'PDF Document' : 'Text File'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Powered by Gemini multi-tier skills extraction & job role matching
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || (sourceType === 'text' && !resumeText.trim() && !sampleResume)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Extracting Skills & Matching Jobs...' : 'Analyze Resume & Match Jobs'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-1 text-center md:border-r md:border-slate-100 pr-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ATS Readiness Score
              </span>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{analysis.atsScore}</span>
                <span className="text-slate-400 font-bold text-sm">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                {analysis.atsScore >= 80 ? 'Highly Competitive' : 'Needs Targeted Revisions'}
              </p>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Impact / KPIs</span>
                <span className="text-lg font-bold text-slate-800">{analysis.scoreBreakdown?.impactAndMetrics || 75}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Formatting</span>
                <span className="text-lg font-bold text-slate-800">{analysis.scoreBreakdown?.formatting || 85}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Role Match</span>
                <span className="text-lg font-bold text-slate-800">{analysis.scoreBreakdown?.skillRelevance || 80}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Keywords</span>
                <span className="text-lg font-bold text-slate-800">{analysis.scoreBreakdown?.keywordDensity || 72}%</span>
              </div>
            </div>
          </div>

          {/* Career Trajectory Executive Summary */}
          {analysis.careerTrajectorySummary && (
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/30 border border-indigo-400/40 rounded-lg text-indigo-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                    Candidate Career Trajectory & Readiness
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {analysis.matchingJobs?.length || 0} Target Roles Identified
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                    Best Match: {Math.max(...(analysis.matchingJobs?.map(j => j.matchScore) || [85]))}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {analysis.careerTrajectorySummary}
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌟 KEY REQUESTED FEATURE: WHICH JOBS USER WILL ACHIEVE BASED ON SKILLS 🌟 */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Target Jobs You Can Achieve Based on Extracted Skills
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  AI-ranked job roles mapped directly to your technical capabilities, programming languages, and completed projects.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setJobFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    jobFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({analysis.matchingJobs?.length || 0})
                </button>
                <button
                  onClick={() => setJobFilter('immediate')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    jobFilter === 'immediate'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ready Now
                </button>
                <button
                  onClick={() => setJobFilter('near_term')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    jobFilter === 'near_term'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Near-Term
                </button>
                <button
                  onClick={() => setJobFilter('growth')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    jobFilter === 'growth'
                      ? 'bg-white text-amber-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Growth Role
                </button>
              </div>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 gap-5">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No roles match the selected filter.
                </div>
              ) : (
                filteredJobs.map((job, idx) => {
                  const isImmediate = job.tier === 'immediate';
                  const isNearTerm = job.tier === 'near_term';
                  const isCopied = copiedJobId === `job-${idx}`;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-4"
                    >
                      {/* Job Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">{job.roleTitle}</h4>
                            {isImmediate && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready Now (High Match)
                              </span>
                            )}
                            {isNearTerm && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Near-Term Target
                              </span>
                            )}
                            {job.tier === 'growth' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Aspirational / Growth
                              </span>
                            )}
                            {job.careerLevel && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                                {job.careerLevel}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              {job.estimatedSalary}
                            </span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                              {job.industryDemand}
                            </span>
                          </div>
                        </div>

                        {/* Match Meter */}
                        <div className="flex items-center gap-3 self-start sm:self-center">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase">Readiness</div>
                            <div className="text-2xl font-black text-slate-900">{job.matchScore}%</div>
                          </div>
                          <div className="w-14 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                job.matchScore >= 85
                                  ? 'bg-emerald-500'
                                  : job.matchScore >= 75
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${job.matchScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Why You Qualify */}
                      <div className="p-3.5 bg-slate-50/80 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                        <strong className="font-semibold text-slate-900 block mb-1">
                          Why Your Skills Qualify You for This Job:
                        </strong>
                        {job.whyYouQualify}
                      </div>

                      {/* Skills Alignment: Matched vs To Learn */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Matched Skills */}
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                          <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Your Matched Skills ({job.matchedSkills?.length || 0}):</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {job.matchedSkills?.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-[11px] font-medium shadow-2xs"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Skills to Learn */}
                        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                          <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Skills to Learn to Reach 100%:</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {job.missingSkillsToLearn?.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 text-[11px] font-medium shadow-2xs"
                              >
                                + {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Action & CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-600 flex items-start gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                          <span>
                            <strong className="text-slate-900">Next Action:</strong> {job.recommendedAction}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => copyRoleDetails(job, idx)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                            title="Copy role summary to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {onNavigateToSkills && (
                            <button
                              onClick={() => onNavigateToSkills(analysis.extractedSkills, job.roleTitle)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold inline-flex items-center gap-1 transition-all"
                            >
                              <span>Analyze Skill Gap</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🏷️ SKILLS TAXONOMY & CLASSIFICATION                                      */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Extracted Skills Inventory ({analysis.extractedSkills?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    NER extracted technologies, frameworks, and domain competencies
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSkillDisplayMode('categorized')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    skillDisplayMode === 'categorized'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Categorized
                </button>
                <button
                  onClick={() => setSkillDisplayMode('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    skillDisplayMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tags
                </button>
              </div>
            </div>

            {skillDisplayMode === 'categorized' && analysis.skillCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Languages */}
                {analysis.skillCategories.languages && analysis.skillCategories.languages.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Code className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Languages ({analysis.skillCategories.languages.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skillCategories.languages.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frameworks */}
                {analysis.skillCategories.frameworksAndLibraries && analysis.skillCategories.frameworksAndLibraries.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Frameworks & Libraries</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skillCategories.frameworksAndLibraries.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools & Cloud */}
                {analysis.skillCategories.toolsAndCloud && analysis.skillCategories.toolsAndCloud.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tools & Cloud</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skillCategories.toolsAndCloud.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Competencies */}
                {analysis.skillCategories.coreCompetencies && analysis.skillCategories.coreCompetencies.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Database className="w-3.5 h-3.5 text-purple-600" />
                      <span>Core CS Competencies</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skillCategories.coreCompetencies.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {analysis.skillCategories.softSkills && analysis.skillCategories.softSkills.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Leadership & Soft Skills</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skillCategories.softSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.extractedSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Entities & ATS Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Profile */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">NER Extracted Candidate Entities</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Candidate Name</span>
                  <span className="font-semibold text-slate-900">{analysis.candidateName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Contact Email</span>
                  <span className="font-mono text-slate-700">{analysis.contactInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-700">{analysis.contactInfo?.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Estimated Experience</span>
                  <span className="font-semibold text-slate-800">{analysis.experienceYears || '1.5'} Years</span>
                </div>
                {analysis.education && analysis.education.length > 0 && (
                  <div className="py-1 border-b border-slate-50">
                    <span className="text-slate-500 block mb-1">Education Background</span>
                    {analysis.education.map((edu, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <span>
                          <strong>{edu.degree}</strong> – {edu.institution} ({edu.year}) {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ATS Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Actionable ATS Improvements</h3>
              </div>

              <div className="space-y-3">
                {/* Critical improvements */}
                <div>
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>High-Impact Revisions:</span>
                  </span>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700">
                    {analysis.criticalImprovements?.map((imp, idx) => (
                      <li key={idx} className="leading-relaxed">{imp}</li>
                    ))}
                  </ul>
                </div>

                {/* Missing Keywords */}
                {analysis.missingKeywords?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Target Role Keywords Missing in Resume:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-mono"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
