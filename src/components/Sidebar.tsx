import React from 'react';
import { ActiveTab } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useSync } from '../context/SyncContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  LayoutDashboard,
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
  X,
  Shield,
  LogIn,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  fileCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  fileCount,
  isOpen,
  onClose,
}) => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { isConnected, syncCount } = useSync();
  const { t } = useLanguage();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'files', label: 'My Files & Storage', icon: FolderArchive, badge: fileCount > 0 ? `${fileCount} files` : 'v3.0' },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'tutor', label: 'AI Tutor', icon: GraduationCap },
    { id: 'quiz', label: 'Quiz Generator', icon: FileQuestion },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText, badge: 'ATS' },
    { id: 'skills', label: 'Skill Gap Analyzer', icon: TrendingUp },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'interview', label: 'Interview Coach', icon: Mic, badge: 'Voice' },
    { id: 'academic', label: 'Academic Exchange', icon: Share2 },
    { id: 'notes', label: 'Notes & Resources', icon: BookOpen },
    { id: 'shared-notes', label: 'Shared Notes', icon: Share2, badge: 'Community' },
    { id: 'multilingual', label: 'Multilingual + Voice', icon: Languages },
    {
      id: 'admin',
      label: 'Admin Console',
      icon: Shield,
      badge: isAdmin ? 'Admin' : 'Restricted',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 lg:w-72 bg-[#0F172A] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl lg:shadow-none select-none`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm shadow-blue-500/30">
                <span>U</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">Unimate-Ai</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Academic & Career Hub</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
            Intelligence Modules
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  onChangeTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{t(item.id, item.label)}</span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-blue-700/60 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Sync Panel */}
        <div className="mt-auto p-4 border-t border-slate-800/80 bg-[#0B1120]">
          {/* User Card - Interactive Button */}
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 mb-2.5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User'}
                  className={`w-9 h-9 rounded-full object-cover border-2 shadow-sm ${
                    isAdmin ? 'border-indigo-500' : 'border-blue-500'
                  }`}
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#0B1120] ${
                    isAdmin ? 'bg-indigo-500' : 'bg-blue-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white block truncate">
                    {user?.name || 'Researcher'}
                  </span>
                  {isAdmin ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                      Student
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {user?.email || 'alex.rivera@edu.nlp'}
                </span>
              </div>
            </div>

            {/* Quick Switch / Sign in / Logout actions */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
              <button
                onClick={() => openAuthModal(isAdmin ? 'student-login' : 'admin-login')}
                className="text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-1"
                title="Switch account role"
              >
                <LogIn className="w-3 h-3" />
                <span>{isAdmin ? 'Student Portal' : 'Admin Portal'}</span>
              </button>
              <button
                onClick={logout}
                className="text-rose-400 hover:text-rose-300 font-medium transition-colors flex items-center gap-1"
                title="Sign out and return to login page"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Secure Sync Active line */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <button
              onClick={() => openAuthModal('database')}
              className="font-medium hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>DB Sync Active</span>
            </button>
            <div className="flex items-center gap-1.5">
              {syncCount > 0 && (
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {syncCount}
                </span>
              )}
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
