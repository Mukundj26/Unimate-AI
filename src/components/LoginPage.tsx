import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  GraduationCap,
  Shield,
  UserPlus,
  LogIn,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  Bot,
  FileQuestion,
  FileText,
  TrendingUp,
  CalendarDays,
  Mic,
  Share2,
  FolderArchive,
  BookOpen,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

type StartAuthTab = 'register' | 'student-login' | 'admin-login';

export const LoginPage: React.FC = () => {
  const { login, register, quickAdminLogin, quickStudentLogin } = useAuth();

  // Active tab: defaults to 'register' to allow new student registration immediately
  const [activeTab, setActiveTab] = useState<StartAuthTab>('register');
  const [registerRole, setRegisterRole] = useState<'student' | 'admin'>('student');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscodeField, setShowAdminPasscodeField] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabChange = (tab: StartAuthTab) => {
    setActiveTab(tab);
    clearForm();
    if (tab === 'student-login') {
      setEmail('alex.rivera@edu.nlp');
      setPassword('demo1234');
      setShowAdminPasscodeField(false);
    } else if (tab === 'admin-login') {
      setEmail('admin@edu.nlp');
      setPassword('admin1234');
      setShowAdminPasscodeField(false);
    } else {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowAdminPasscodeField(false);
    }
  };

  // Quick fill sample credentials
  const fillSampleStudent = () => {
    setEmail('alex.rivera@edu.nlp');
    setPassword('demo1234');
    setErrorMessage('');
  };

  const fillSampleAdmin = () => {
    setEmail('admin@edu.nlp');
    setPassword('admin1234');
    setErrorMessage('');
  };

  // Direct 1-click instant login handlers
  const handleInstantAdminLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('Authenticating Faculty Administrator...');
    setIsSubmitting(true);
    try {
      await quickAdminLogin();
      setSuccessMessage('Faculty administrator authenticated! Launching Admin Console...');
    } catch (err: any) {
      setErrorMessage(err.message || 'Faculty admin authentication failed');
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantStudentLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('Authenticating Student Workspace...');
    setIsSubmitting(true);
    try {
      await quickStudentLogin();
      setSuccessMessage('Student authenticated! Launching workspace...');
    } catch (err: any) {
      setErrorMessage(err.message || 'Student authentication failed');
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (registerRole === 'admin' && adminPasscode.trim() !== 'ADMIN2026') {
          throw new Error('Admin registration requires the Security Passcode: ADMIN2026');
        }

        await register(
          name.trim(),
          email.trim(),
          password,
          registerRole,
          registerRole === 'admin' ? adminPasscode.trim() : undefined
        );
        setSuccessMessage(
          registerRole === 'admin'
            ? 'Faculty Administrator registered! Launching Admin Console...'
            : 'Student registration successful! Launching workspace...'
        );
      } else if (activeTab === 'student-login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both student email and password');
        }
        await login(email.trim(), password, 'student');
        setSuccessMessage('Student verified! Loading your workspace...');
      } else if (activeTab === 'admin-login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter administrator email and password');
        }
        await login(
          email.trim(),
          password,
          'admin',
          adminPasscode.trim() || undefined
        );
        setSuccessMessage('Faculty administrator authenticated! Loading Admin Console...');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication request failed');
      if (err.message && err.message.includes('registered as a Student')) {
        setShowAdminPasscodeField(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const core10Features = [
    { id: 'rag', name: 'RAG AI Assistant', desc: 'Context-grounded search across notes & versioned documents', icon: Bot },
    { id: 'tutor', name: 'Socratic AI Tutor', desc: 'Interactive step-by-step problem solver and pedagogy', icon: GraduationCap },
    { id: 'quiz', name: 'Quiz Generator', desc: 'Custom curriculum quizzes with rationale feedback', icon: FileQuestion },
    { id: 'resume', name: 'ATS Resume Analyzer', desc: 'Industry keyword matching and bullet point optimization', icon: FileText },
    { id: 'skills', name: 'Skill Gap Analyzer', desc: 'Target tech roles roadmap with curated learning milestones', icon: TrendingUp },
    { id: 'planner', name: 'Study Milestone Planner', desc: 'Weekly task agendas and exam countdown tracking', icon: CalendarDays },
    { id: 'interview', name: 'AI Interview Coach', desc: 'Live technical and behavioral mock interview simulation', icon: Mic },
    { id: 'exchange', name: 'Academic Exchange', desc: 'Peer research paper hub and collective study resources', icon: Share2 },
    { id: 'notes', name: 'Study Notes & Flashcards', desc: 'Active recall spaced repetition decks & key summaries', icon: BookOpen },
    { id: 'storage', name: 'Versioned File Storage', desc: 'Multi-folder cloud storage with revision tracking', icon: FolderArchive },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Academic & Career Intelligence Platform
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                10 Features Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Role-Based Authentication • Student Workspace & Centralized Faculty Admin Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Subtitle / Intro */}
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Registration & Secure Access Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Register or Sign In to Your Academic Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every registered student receives instant access to all 10 intelligence tools. All records are backed by versioned database storage and observable in faculty admin mode.
          </p>
        </div>

        {/* Central Auth Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 relative">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('student-login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student-login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Student Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin-login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin-login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Faculty Admin</span>
            </button>
          </div>

          {/* Tab Explanatory Header */}
          <div className="mb-5">
            {activeTab === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Account Registration</span>
                  </h2>
                  {/* Account Type Selector */}
                  <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('student');
                        setErrorMessage('');
                      }}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        registerRole === 'student'
                          ? 'bg-white text-blue-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('admin');
                        setAdminPasscode('ADMIN2026');
                        setErrorMessage('');
                      }}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        registerRole === 'admin'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🛡️ Faculty Admin
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {registerRole === 'student'
                    ? 'Create your personal student account with instant access to all 10 academic tools.'
                    : 'Create a centralized Faculty Administrator account with full student records inspection.'}
                </p>
              </div>
            )}
            {activeTab === 'student-login' && (
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student Sign In</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in with your student email to access your study plans, quizzes, flashcards, and notes.
                </p>
              </div>
            )}
            {activeTab === 'admin-login' && (
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Faculty Administrator Sign In</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in to inspect centralized student analytics, files, grades, and manage student accounts.
                </p>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
              {activeTab === 'admin-login' && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-rose-200/70">
                  <button
                    type="button"
                    onClick={handleInstantAdminLogin}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Sign In as Default Admin (Dr. Vance)</span>
                  </button>
                  {!showAdminPasscodeField && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminPasscodeField(true);
                        setAdminPasscode('ADMIN2026');
                      }}
                      className="px-2 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-md text-[11px] font-medium transition-all"
                    >
                      Enter Admin Passcode (ADMIN2026)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Quick 1-Click Banner for Faculty Admin */}
          {activeTab === 'admin-login' && (
            <div className="mb-5 p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-700" />
                  <span className="text-xs font-bold text-indigo-950">1-Click Instant Faculty Sign-In</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                Log in instantly as <strong>Dr. Arthur Vance (Faculty Admin)</strong> or use <strong>Mukund Jarad</strong> with administrative privileges.
              </p>
              <button
                type="button"
                onClick={handleInstantAdminLogin}
                disabled={isSubmitting}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>⚡ Sign In as Dr. Vance (Admin)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={registerRole === 'admin' ? 'Dr. Arthur Vance' : 'e.g. Maya Sharma'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeTab === 'admin-login'
                  ? 'Faculty Admin Email'
                  : registerRole === 'admin' && activeTab === 'register'
                  ? 'Faculty Email Address'
                  : 'Student Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === 'admin-login'
                      ? 'admin@edu.nlp'
                      : activeTab === 'register'
                      ? 'student.name@university.edu'
                      : 'alex.rivera@edu.nlp'
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Admin Security Passcode for Registering Admin */}
            {activeTab === 'register' && registerRole === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-1 flex items-center justify-between">
                  <span>Admin Security Passcode</span>
                  <span className="text-[10px] text-indigo-600 font-mono">Required: ADMIN2026</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="ADMIN2026"
                    className="w-full pl-9 pr-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-mono text-indigo-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Optional Admin Passcode on Admin Login (e.g. for student accounts elevating) */}
            {activeTab === 'admin-login' && showAdminPasscodeField && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>Elevate Account: Security Passcode</span>
                  <span className="text-[10px] font-mono text-amber-700">ADMIN2026</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter ADMIN2026 to elevate privileges"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-amber-700">
                  Entering ADMIN2026 will elevate this student account to Faculty Administrator status.
                </p>
              </div>
            )}

            {/* Feature Provisioning Notification for Register */}
            {activeTab === 'register' && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-blue-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatic Starter Provisioning Included</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Your new account will be initialized with starter folders, flashcards, study schedules, and immediate access to all 10 core academic tools.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 mt-2 ${
                activeTab === 'admin-login' || (activeTab === 'register' && registerRole === 'admin')
                  ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : activeTab === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {registerRole === 'admin'
                      ? 'Register & Launch Faculty Admin Console'
                      : 'Register & Launch Student Workspace'}
                  </span>
                </>
              ) : activeTab === 'student-login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Student</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Buttons for Easy Testing */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium">Or test with demo credentials:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleTabChange('student-login');
                  fillSampleStudent();
                }}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 hover:text-blue-700 font-medium transition-all text-left truncate"
                title="Fill Alex Rivera student credentials"
              >
                🎓 Student: Alex Rivera
              </button>
              <button
                type="button"
                onClick={() => {
                  handleTabChange('admin-login');
                  fillSampleAdmin();
                }}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] text-slate-700 hover:text-indigo-700 font-medium transition-all text-left truncate"
                title="Fill Dr. Arthur Vance faculty admin credentials"
              >
                🛡️ Admin: Dr. Vance
              </button>
            </div>
          </div>
        </div>

        {/* 10 Core Features Grid Preview */}
        <div className="mt-14 w-full max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>10 Academic & Career Capabilities Enabled for Every Registered Student</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-stack NLP toolchain synchronized with versioned storage and observable in Admin Mode.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hidden sm:inline-block">
              All 10 Included
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {core10Features.map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div
                  key={f.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {idx + 1}. {f.name}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      {f.desc}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-emerald-600">Active</span>
                    <span className="text-slate-400 font-mono">v1.0</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Academic & Career Intelligence Platform • Multi-Role NLP Architecture</span>
          <span className="font-mono text-[11px] text-slate-400">Database: data/db.json (JSON Storage)</span>
        </div>
      </footer>
    </div>
  );
};
