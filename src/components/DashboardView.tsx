import React from 'react';
import { ActiveTab, FileItem } from '../types.ts';
import { LanguageSelector } from './LanguageSelector.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Bot,
  GraduationCap,
  FileQuestion,
  FileText,
  TrendingUp,
  CalendarDays,
  Mic,
  Share2,
  BookOpen,
  Languages,
  FolderArchive,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  fileCount: number;
  files: FileItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  fileCount,
}) => {
  const { user, isAdmin, openAuthModal } = useAuth();
  return (
    <div className="space-y-6">
      <LanguageSelector variant="banner" featureName="All AI Capabilities" />

      {/* Welcome Banner with Professional Polish Accents */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Workspace Overview</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">10 NLP Capabilities Active</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic & Career Intelligence Platform
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            All AI engines are online and synchronized with your versioned database storage and real-time SSE stream.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('files')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5"
          >
            <FolderArchive className="w-4 h-4 text-blue-600" />
            <span>Files & Snapshots ({fileCount})</span>
          </button>
          <button
            onClick={() => onNavigateTab('assistant')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Open RAG Assistant</span>
          </button>
        </div>
      </div>

      {/* Registered Student Access Verification Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                {isAdmin ? 'Admin Faculty Session' : 'Registered Student Workspace'}: {user?.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                All 10 Features Active & Unlocked
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isAdmin
                ? 'Faculty Administrator active. All student records, files, study plans, and quizzes are collected in the Admin Console.'
                : 'Your registered student account has full unrestricted access to all 10 academic and career tools below.'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => onNavigateTab('admin')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Open Admin Records Console</span>
          </button>
        )}
      </div>

      {/* 10-Module Grid matching the exact Professional Polish layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. AI Assistant */}
        <div
          onClick={() => onNavigateTab('assistant')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🤖
            </div>
            <h3 className="font-bold text-sm text-slate-900">AI Assistant</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              RAG-powered contextual understanding for your documents.
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab('assistant');
            }}
            className="w-full mt-4 py-1.5 border border-indigo-200 text-indigo-600 text-xs font-semibold rounded-md hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
          >
            <span>Open Chat</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 2. AI Tutor */}
        <div
          onClick={() => onNavigateTab('tutor')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              👨‍🏫
            </div>
            <h3 className="font-bold text-sm text-slate-900">AI Tutor</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Personalized explanations for complex academic topics.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded inline-block w-fit">
              Adaptive Depth
            </span>
            <span className="text-xs text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* 3. Quiz Generator */}
        <div
          onClick={() => onNavigateTab('quiz')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📝
            </div>
            <h3 className="font-bold text-sm text-slate-900">Quiz Generator</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Instant assessments from your lecture notes & PDFs.
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab('quiz');
            }}
            className="w-full mt-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Create New
          </button>
        </div>

        {/* 4. Resume Analyzer */}
        <div
          onClick={() => onNavigateTab('resume')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📄
            </div>
            <h3 className="font-bold text-sm text-slate-900">Resume Analyzer</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              NER-based extraction and scoring against job roles.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="w-[82%] h-full bg-blue-600 rounded-full" />
            </div>
            <span className="text-[10px] text-blue-600 font-bold">82% ATS</span>
          </div>
        </div>

        {/* 5. Skill Gap Analyzer */}
        <div
          onClick={() => onNavigateTab('skills')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📈
            </div>
            <h3 className="font-bold text-sm text-slate-900">Skill Gap Analyzer</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Semantic matching for professional growth paths.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-300 text-[8px] flex items-center justify-center font-bold">Py</div>
              <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-400 text-[8px] flex items-center justify-center font-bold text-white">TS</div>
              <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-[8px] flex items-center justify-center font-bold text-white">ML</div>
            </div>
            <span className="text-[10px] text-purple-600 font-bold">Taxonomy</span>
          </div>
        </div>

        {/* 6. Study Planner */}
        <div
          onClick={() => onNavigateTab('planner')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📅
            </div>
            <h3 className="font-bold text-sm text-slate-900">Study Planner</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated scheduling based on topic extraction.
            </p>
          </div>
          <p className="mt-4 text-[10px] font-medium text-rose-600 italic">
            Exam in 4 days (NLP 101)
          </p>
        </div>

        {/* 7. Interview Coach */}
        <div
          onClick={() => onNavigateTab('interview')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🎤
            </div>
            <h3 className="font-bold text-sm text-slate-900">Interview Coach</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Real-time feedback and NLP performance evaluation.
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab('interview');
            }}
            className="w-full mt-4 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
          >
            Start Mock
          </button>
        </div>

        {/* 8. Academic Exchange */}
        <div
          onClick={() => onNavigateTab('academic')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🤝
            </div>
            <h3 className="font-bold text-sm text-slate-900">Academic Exchange</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Secure peer-to-peer sharing and discovery.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-cyan-700 font-bold">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span>12 Peers Online</span>
          </div>
        </div>

        {/* 9. Notes & Resources */}
        <div
          onClick={() => onNavigateTab('notes')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📚
            </div>
            <h3 className="font-bold text-sm text-slate-900">Notes & Resources</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Smart summarization, topic indexing, and community shared notes.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 font-semibold px-2 py-0.5 rounded">
              Active Recall & Shared
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('shared-notes');
              }}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Community Notes →
            </button>
          </div>
        </div>

        {/* 10. Multilingual + Voice */}
        <div
          onClick={() => onNavigateTab('multilingual')}
          className="bg-[#F1F5F9] p-5 rounded-xl border border-slate-300 border-dashed hover:border-blue-400 transition-all flex flex-col justify-center items-center text-center cursor-pointer group"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-105 transition-transform">
            🌐
          </div>
          <h3 className="font-bold text-sm text-slate-900">Multilingual + Voice</h3>
          <p className="text-[10px] text-slate-500 leading-tight mt-1">
            Real-time translation & speech-to-text.
          </p>
          <div className="mt-3 flex gap-1.5">
            <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold border border-slate-200 text-slate-700">EN</span>
            <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold border border-slate-200 text-slate-700">ES</span>
            <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold border border-slate-200 text-slate-700">FR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
