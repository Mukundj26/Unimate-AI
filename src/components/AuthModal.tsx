import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import {
  X,
  User,
  Mail,
  Lock,
  Database,
  FileText,
  HardDrive,
  CheckCircle2,
  Users,
  Download,
  Folder,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Shield,
  GraduationCap,
  Key,
  ChevronRight
} from 'lucide-react';

interface DatabaseUserSummary {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: UserRole;
    createdAt: string;
    hasPasswordHash: boolean;
  } | null;
  stats: {
    totalFiles: number;
    totalFolders: number;
    totalNotes: number;
    totalStudyPlans: number;
    totalQuizzes: number;
    totalStorageBytes: number;
  };
  files: Array<{
    id: string;
    originalName: string;
    storedFilename: string;
    folderPath: string;
    size: number;
    mimeType: string;
    version: number;
    versionsCount: number;
    hasTextExtracted: boolean;
    textLength: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  databaseFile: string;
  storageDirectory: string;
  globalStats?: {
    dbFileSize: number;
    uploadFilesCount: number;
    totalUploadsSize: number;
    totalUsers: number;
    totalFiles: number;
    totalFolders: number;
    totalNotes: number;
    totalStudyPlans: number;
    totalQuizzes: number;
  };
}

interface AllUserSummary {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: UserRole;
  createdAt: string;
  fileCount: number;
  noteCount: number;
}

export const AuthModal: React.FC = () => {
  const {
    user,
    token,
    login,
    register,
    switchUser,
    quickStudentLogin,
    quickAdminLogin,
    isAuthModalOpen,
    closeAuthModal,
    activeModalTab,
    setActiveModalTab,
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Database Summary state
  const [dbSummary, setDbSummary] = useState<DatabaseUserSummary | null>(null);
  const [allUsers, setAllUsers] = useState<AllUserSummary[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  const currentTab = activeModalTab === 'signin' ? 'student-login' : activeModalTab;

  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      if (currentTab === 'database') {
        fetchDatabaseSummary();
      }
    }
  }, [isAuthModalOpen, currentTab, user?.id]);

  const fetchDatabaseSummary = async (retries = 2) => {
    setIsLoadingDb(true);
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const safeFetch = async (url: string) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetch(url, { headers: authHeader });
          if (res.ok) {
            return await res.json();
          }
        } catch {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          }
        }
      }
      return null;
    };

    try {
      const [sumData, usersData] = await Promise.all([
        safeFetch('/api/auth/database-summary'),
        safeFetch('/api/auth/users'),
      ]);

      if (sumData) {
        setDbSummary(sumData);
      }
      if (usersData && usersData.users) {
        setAllUsers(usersData.users);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoadingDb(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, 'student');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Student login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, 'admin');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (selectedRole === 'admin' && adminPasscode.trim() !== 'ADMIN2026') {
      setError('Invalid Admin Security Passcode. Enter ADMIN2026 to verify faculty/admin status.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, selectedRole, adminPasscode.trim());
      setName('');
      setEmail('');
      setPassword('');
      setAdminPasscode('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    setError(null);
    try {
      await switchUser(userId);
      await fetchDatabaseSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to switch user');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B1120] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
              currentTab === 'admin-login' ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {currentTab === 'admin-login' ? (
                <Shield className="w-5 h-5" />
              ) : currentTab === 'student-login' ? (
                <GraduationCap className="w-5 h-5" />
              ) : (
                <Database className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">OmniFlow Authentication</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Role-Based Portals
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent authentication portals for Students and Administrators
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 pt-2 overflow-x-auto gap-1">
          {/* Student Login Tab */}
          <button
            onClick={() => {
              setActiveModalTab('student-login');
              setError(null);
            }}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              currentTab === 'student-login'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Portal</span>
          </button>

          {/* Admin Login Tab */}
          <button
            onClick={() => {
              setActiveModalTab('admin-login');
              setError(null);
            }}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              currentTab === 'admin-login'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin Portal</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
              Staff
            </span>
          </button>

          {/* Register Tab */}
          <button
            onClick={() => {
              setActiveModalTab('register');
              setError(null);
            }}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              currentTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Register</span>
          </button>

          {/* Database & Files Tab */}
          <button
            onClick={() => {
              setActiveModalTab('database');
              setError(null);
              fetchDatabaseSummary();
            }}
            className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ml-auto ${
              currentTab === 'database'
                ? 'border-slate-800 text-slate-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Database & Users</span>
            <span className="sm:hidden">DB</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: STUDENT LOGIN */}
          {currentTab === 'student-login' && (
            <div className="space-y-5">
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Student & Learner Sign In</span>
                  <span className="text-blue-700">
                    Access your personalized study schedule, private notes repository, flashcards, and AI research tutor.
                  </span>
                </div>
              </div>

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex.rivera@edu.nlp"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter student password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => quickStudentLogin()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>⚡ Quick Student Login (Alex Rivera)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Verifying...' : 'Sign In as Student'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Are you a faculty member or administrator?</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalTab('admin-login');
                    setError(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Go to Admin Portal</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN LOGIN */}
          {currentTab === 'admin-login' && (
            <div className="space-y-5">
              <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Administrative & Faculty Portal</span>
                  <span className="text-indigo-800">
                    Restricted to platform operators, faculty coordinators, and course managers. Provides access to User Management, role promotion, storage telemetry, and system controls.
                  </span>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@edu.nlp"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrator Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => quickAdminLogin()}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-indigo-50 transition-colors text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>⚡ Quick Admin Login (Dr. Arthur Vance)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">Default Admin: <code className="font-mono text-slate-800 bg-slate-200 px-1 py-0.5 rounded">admin@edu.nlp</code> / <code className="font-mono text-slate-800 bg-slate-200 px-1 py-0.5 rounded">admin1234</code></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalTab('student-login');
                    setError(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                >
                  Switch to Student Login
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER */}
          {currentTab === 'register' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <Database className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Registering creates a cryptographically secured account in <code>data/db.json</code> with an isolated workspace directory in <code>data/uploads/</code>.
                </p>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Account Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'student'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className={`w-4 h-4 ${selectedRole === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-900">Student Account</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Coursework, AI tutor, flashcards, personalized notes.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-900">Administrator</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Admin Console, user management, telemetry audit.
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={selectedRole === 'admin' ? 'e.g. Prof. Sarah Jenkins' : 'e.g. Jordan Lee'}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@edu.nlp"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* If Administrator selected, require security passcode */}
                {selectedRole === 'admin' && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                    <label className="block text-xs font-semibold text-indigo-900 mb-1 flex items-center justify-between">
                      <span>Admin Verification Passcode</span>
                      <span className="text-[10px] text-indigo-700 font-mono">Default: ADMIN2026</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter ADMIN2026"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 ${
                      selectedRole === 'admin'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Registering...' : `Create ${selectedRole === 'admin' ? 'Admin' : 'Student'} Account`}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: DATABASE RECORDS & FILES */}
          {currentTab === 'database' && (
            <div className="space-y-6">
              {isLoadingDb ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Reading database records and disk storage...</span>
                </div>
              ) : (
                <>
                  {/* Current User Record in Database */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Active Session Database Record</span>
                      </h3>
                      <button
                        onClick={fetchDatabaseSummary}
                        className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1"
                        title="Refresh database records"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">User Name</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {user?.name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Account Role</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {user?.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                              <GraduationCap className="w-3 h-3" /> Student
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Database User ID</span>
                        <span className="font-mono font-semibold text-slate-700 truncate block text-[11px]">
                          {user?.id || 'none'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Password Storage</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> PBKDF2 Salted
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2 border-t border-slate-200">
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Stored Files</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {dbSummary?.stats.totalFiles ?? 0}
                        </span>
                      </div>
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Folders</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {dbSummary?.stats.totalFolders ?? 0}
                        </span>
                      </div>
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Notes</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {dbSummary?.stats.totalNotes ?? 0}
                        </span>
                      </div>
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Study Plans</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {dbSummary?.stats.totalStudyPlans ?? 0}
                        </span>
                      </div>
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Quizzes</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {dbSummary?.stats.totalQuizzes ?? 0}
                        </span>
                      </div>
                      <div className="bg-white py-1.5 px-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Disk Space</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatBytes(dbSummary?.stats.totalStorageBytes || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Storage Paths Information */}
                  <div className="bg-slate-900 text-slate-300 rounded-xl p-3.5 text-xs font-mono space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      <span>Physical Storage Paths</span>
                    </div>
                    <div className="text-[11px] truncate">
                      <span className="text-slate-500">Database JSON:</span>{' '}
                      <span className="text-emerald-400">{dbSummary?.databaseFile || 'data/db.json'}</span>
                    </div>
                    <div className="text-[11px] truncate">
                      <span className="text-slate-500">Uploaded Files Dir:</span>{' '}
                      <span className="text-blue-400">{dbSummary?.storageDirectory || 'data/uploads'}</span>
                    </div>
                    {dbSummary?.globalStats && (
                      <div className="text-[11px] pt-1 text-slate-400 border-t border-slate-800 flex items-center justify-between">
                        <span>Total Users: {dbSummary.globalStats.totalUsers}</span>
                        <span>Total Files: {dbSummary.globalStats.uploadFilesCount}</span>
                        <span>DB Size: {formatBytes(dbSummary.globalStats.dbFileSize)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stored Files in Database for Current User */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Disk-Stored Files for {user?.name || 'Active User'} ({dbSummary?.files.length ?? 0})</span>
                      </span>
                    </h3>

                    {dbSummary?.files && dbSummary.files.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {dbSummary.files.map((file) => (
                          <div
                            key={file.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between text-xs gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">
                                  {file.originalName}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{file.folderPath}</span>
                                  <span>•</span>
                                  <span>{formatBytes(file.size)}</span>
                                  <span>•</span>
                                  <span className="text-blue-600 font-mono">v{file.version}</span>
                                  {file.hasTextExtracted && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-600">Text Extracted</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`/api/files/${file.id}/download`}
                                download={file.originalName}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px] font-medium"
                                title="Download stored file from server disk"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                        <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No files uploaded yet for this user</p>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Use the "Upload Workspace" button in the header or upload area to store files in the database and server storage.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Registered Users Directory */}
                  <div className="pt-2 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Registered Accounts in Database ({allUsers.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">Click "Switch" to test account roles</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allUsers.map((u) => {
                        const isCurrent = u.id === user?.id;
                        const isAdminUser = u.role === 'admin';
                        return (
                          <div
                            key={u.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                              isCurrent
                                ? isAdminUser
                                  ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                                  : 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                                  {isAdminUser ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 shrink-0">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 shrink-0">
                                      Student
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {u.email} • {u.fileCount} files
                                </p>
                              </div>
                            </div>

                            {isCurrent ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isAdminUser ? 'text-indigo-700 bg-indigo-100' : 'text-blue-700 bg-blue-100'
                              }`}>
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwitchUser(u.id)}
                                className="text-[11px] text-slate-600 hover:text-blue-600 font-medium px-2 py-1 bg-slate-100 hover:bg-blue-50 rounded-lg shrink-0 transition-colors"
                              >
                                Switch
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database persistence online: <code>data/db.json</code></span>
          </div>
          <button
            onClick={closeAuthModal}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
