import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSync } from '../context/SyncContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  Search,
  Upload,
  Menu,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Database,
  UserPlus,
  LogIn,
  HardDrive,
  Shield,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onToggleSidebar: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onToggleSidebar,
  searchQuery = '',
  onSearchChange,
}) => {
  const { user, isAdmin, logout, quickStudentLogin, quickAdminLogin, openAuthModal } = useAuth();
  const { isConnected, syncCount } = useSync();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-60 sm:w-96 border border-slate-200 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search knowledge base, files, or peers..."
            className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 w-full"
          />
        </div>
      </div>

      {/* Right: Database Storage button, Upload Button, Divider, Status, Settings */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Role Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border">
          {isAdmin ? (
            <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3 text-indigo-600" /> Admin
            </span>
          ) : (
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <GraduationCap className="w-3 h-3 text-blue-600" /> Student
            </span>
          )}
        </div>

        {/* Secure sync pill on medium screens */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span>{isConnected ? 'Sync Active' : 'Connecting...'}</span>
          {syncCount > 0 && (
            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
              {syncCount}
            </span>
          )}
        </div>

        {/* Global Language Selector (English, Hindi, Marathi) */}
        <LanguageSelector variant="compact" />

        {/* Database & Account Inspector Button */}
        <button
          id="header-database-btn"
          onClick={() => openAuthModal('database')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all"
          title="Inspect stored user data and uploaded files in database"
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Database & Files</span>
        </button>

        {/* Primary Action Button */}
        <button
          id="header-upload-workspace-btn"
          onClick={onOpenUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Workspace</span>
          <span className="sm:hidden">Upload</span>
        </button>

        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        {/* Settings / Account Menu */}
        <div className="relative">
          <button
            id="header-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Settings & Profile"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
              isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {user?.name?.[0] || 'U'}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-28 truncate">
              {user?.name || 'User'}
            </span>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 truncate">{user?.name || 'Researcher'}</p>
                      {isAdmin ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                          Student
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      DB ID: {user?.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Role Portals
                </div>
                <button
                  onClick={() => {
                    openAuthModal('student-login');
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Portal Sign In</span>
                </button>

                <button
                  onClick={() => {
                    openAuthModal('admin-login');
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin Console Sign In</span>
                </button>

                <button
                  onClick={() => {
                    openAuthModal('register');
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Register New Student/Admin</span>
                </button>

                <button
                  onClick={() => {
                    openAuthModal('database');
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                  <span>Database Records & All Users</span>
                </button>
              </div>

              <div className="py-1 border-t border-slate-100">
                <div className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Instant Test Accounts
                </div>
                <button
                  onClick={() => {
                    quickStudentLogin();
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-blue-50 flex items-center gap-2 text-xs"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Student (Alex Rivera)</span>
                </button>
                <button
                  onClick={() => {
                    quickAdminLogin();
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-indigo-50 flex items-center gap-2 text-xs"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Admin (Dr. Arthur Vance)</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
