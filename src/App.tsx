import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { SyncProvider, useSync } from './context/SyncContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { StorageView } from './components/StorageView.tsx';
import { AssistantView } from './components/AssistantView.tsx';
import { TutorView } from './components/TutorView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { ResumeView } from './components/ResumeView.tsx';
import { SkillGapView } from './components/SkillGapView.tsx';
import { PlannerView } from './components/PlannerView.tsx';
import { InterviewView } from './components/InterviewView.tsx';
import { AcademicView } from './components/AcademicView.tsx';
import { NotesView } from './components/NotesView.tsx';
import { SharedNotesView } from './components/SharedNotesView.tsx';
import { MultilingualView } from './components/MultilingualView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { ActiveTab, FileItem, FolderItem } from './types.ts';
import { Upload, Folder, X, ShieldCheck, Database, HardDrive } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, token, loading } = useAuth();
  const { refreshTrigger, triggerRefresh } = useSync();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inter-view cross navigation context
  const [contextFileId, setContextFileId] = useState<string | undefined>(undefined);
  const [skillGapPrefill, setSkillGapPrefill] = useState<{ skills: string[]; role: string } | null>(null);

  // Quick upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const modalFolderInputRef = useRef<HTMLInputElement>(null);

  const fetchFilesAndFolders = useCallback(async (retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const [fRes, dRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/files/folders'),
        ]);

        if (fRes.ok) {
          const data = await fRes.json();
          setFiles(data.files || []);
        }
        if (dRes.ok) {
          const data = await dRes.json();
          setFolders(data.folders || []);
        }
        return;
      } catch {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFilesAndFolders();
      if (user.role === 'admin') {
        setActiveTab('admin');
      }
    } else {
      setFiles([]);
      setFolders([]);
    }
  }, [fetchFilesAndFolders, refreshTrigger, user?.id, user?.role, token]);

  const handleNavigateTab = (tab: ActiveTab, context?: { fileId?: string; fileName?: string }) => {
    setActiveTab(tab);
    if (context?.fileId) {
      setContextFileId(context.fileId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeToSkills = (extractedSkills: string[], targetRole: string) => {
    setSkillGapPrefill({ skills: extractedSkills, role: targetRole });
    setActiveTab('skills');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      const relativePaths: string[] = [];

      Array.from(fileList).forEach((file) => {
        formData.append('files', file);
        relativePaths.push((file as any).webkitRelativePath || file.name);
      });

      formData.append('folderPath', currentFolder);
      formData.append('relativePaths', JSON.stringify(relativePaths));

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setShowUploadModal(false);
        triggerRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Initializing Academic Platform...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated (such as after logout), show the starting login & new student register page
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex antialiased">
      {/* Dark Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setContextFileId(undefined);
        }}
        fileCount={files.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
        {/* Professional Polish Header */}
        <Header
          onOpenUpload={() => setShowUploadModal(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Canvas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={handleNavigateTab}
              fileCount={files.length}
              files={files}
            />
          )}

          {activeTab === 'files' && (
            <StorageView
              files={files}
              folders={folders}
              currentFolder={currentFolder}
              onChangeFolder={setCurrentFolder}
              onRefresh={fetchFilesAndFolders}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'assistant' && (
            <AssistantView files={files} preselectedFileId={contextFileId} />
          )}

          {activeTab === 'tutor' && <TutorView />}

          {activeTab === 'quiz' && (
            <QuizView files={files} preselectedFileId={contextFileId} />
          )}

          {activeTab === 'resume' && (
            <ResumeView
              files={files}
              preselectedFileId={contextFileId}
              onNavigateToSkills={handleResumeToSkills}
            />
          )}

          {activeTab === 'skills' && (
            <SkillGapView
              initialSkills={skillGapPrefill?.skills}
              initialRole={skillGapPrefill?.role}
            />
          )}

          {activeTab === 'planner' && <PlannerView />}

          {activeTab === 'interview' && <InterviewView />}

          {activeTab === 'academic' && <AcademicView />}

          {activeTab === 'notes' && (
            <NotesView files={files} preselectedFileId={contextFileId} />
          )}

          {activeTab === 'shared-notes' && (
            <SharedNotesView onOpenNoteInEditor={() => setActiveTab('notes')} />
          )}

          {activeTab === 'multilingual' && <MultilingualView />}

          {activeTab === 'admin' && <AdminView />}
        </main>

        {/* Footer matching exact Professional Polish design */}
        <footer className="h-12 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-widest font-mono select-none">
          <span className="flex items-center gap-1.5 truncate">
            <Database className="w-3 h-3 text-emerald-500 hidden sm:inline" />
            <span>Database Status: Encrypted & Healthy</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-blue-500" />
            <span>File System: DB Storage + Versioning V3.12</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500 hidden sm:inline" />
            <span>Active Session: 256-bit AES</span>
          </span>
        </footer>
      </div>

      {/* Quick Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Workspace Assets</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Files and directory structures will be saved to{' '}
              <strong className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                {currentFolder}
              </strong>{' '}
              with automatic versioning and full-text RAG indexing.
            </p>

            <input
              ref={modalFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleModalUpload(e.target.files)}
            />
            <input
              ref={modalFolderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={(e) => handleModalUpload(e.target.files)}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => modalFileInputRef.current?.click()}
                disabled={isUploading}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all disabled:opacity-50"
              >
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Files Upload</span>
              </button>

              <button
                onClick={() => modalFolderInputRef.current?.click()}
                disabled={isUploading}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-amber-700 transition-all disabled:opacity-50"
              >
                <Folder className="w-5 h-5 text-amber-500" />
                <span>Folder Tree</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account & Database Storage Modal */}
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
