import React from 'react';
import { ActiveTab } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  FolderArchive,
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
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  fileCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab, fileCount = 0 }) => {
  const { t } = useLanguage();

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; nlp: string }> = [
    { id: 'files', label: t('nav.files') || 'Storage & Versions', icon: FolderArchive, badge: fileCount > 0 ? fileCount : undefined, nlp: 'DB Store + Versioning' },
    { id: 'assistant', label: t('nav.assistant') || 'AI Assistant', icon: Bot, nlp: 'Question Understanding + RAG' },
    { id: 'tutor', label: t('nav.tutor') || 'AI Tutor', icon: GraduationCap, nlp: 'Personalized Explanations' },
    { id: 'quiz', label: t('nav.quiz') || 'Quiz Generator', icon: FileQuestion, nlp: 'Question Gen + Understanding' },
    { id: 'resume', label: t('nav.resume') || 'Resume Analyzer', icon: FileText, nlp: 'NER + Info Extraction' },
    { id: 'skills', label: t('nav.skills') || 'Skill Gap', icon: TrendingUp, nlp: 'Extraction + Semantic Match' },
    { id: 'planner', label: t('nav.planner') || 'Study Planner', icon: CalendarDays, nlp: 'Topic Extraction & Schedule' },
    { id: 'interview', label: t('nav.interview') || 'Interview Coach', icon: Mic, nlp: 'Answer NLP Evaluation' },
    { id: 'academic', label: t('nav.academic') || 'Academic Exchange', icon: Share2, nlp: 'Classification + Search' },
    { id: 'notes', label: t('nav.notes') || 'Notes & Flashcards', icon: BookOpen, nlp: 'Summarization + Keypoints' },
    { id: 'multilingual', label: t('nav.multilingual') || 'Multilingual + Voice', icon: Languages, nlp: 'Translation & Speech' },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
