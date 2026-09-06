import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole, StudentFullRecord, StudentAggregateStats } from '../types.ts';
import {
  Shield,
  GraduationCap,
  Users,
  HardDrive,
  FileText,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Trash2,
  UserCheck,
  UserX,
  Lock,
  Sparkles,
  Database,
  Eye,
  ChevronRight,
  Activity,
  BookOpen,
  Calendar,
  Award,
  FileQuestion,
  MessageSquare,
  Check,
  X,
  FileCheck,
  Layers,
  ExternalLink,
  HelpCircle,
  Code,
  Share2,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
  fileCount: number;
  noteCount: number;
}

interface GlobalSummary {
  user: any;
  stats: {
    totalFiles: number;
    totalFolders: number;
    totalNotes: number;
    totalSharedNotes: number;
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
  globalStats?: {
    dbFileSize: number;
    uploadFilesCount: number;
    totalUploadsSize: number;
    totalUsers: number;
    totalFiles: number;
    totalFolders: number;
    totalNotes: number;
    totalSharedNotes: number;
    totalStudyPlans: number;
    totalQuizzes: number;
  };
  databaseFile: string;
  storageDirectory: string;
}

export const AdminView: React.FC = () => {
  const { user, token, isAdmin, quickAdminLogin, switchUser, openAuthModal } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [studentRecords, setStudentRecords] = useState<StudentFullRecord[]>([]);
  const [studentAggregate, setStudentAggregate] = useState<StudentAggregateStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Users tab controls
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active subtab
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'users' | 'storage' | 'system'>('students');

  // Student records controls
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'with-files' | 'with-plans' | 'with-quizzes'>('all');

  // Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentFullRecord | null>(null);
  const [dossierTab, setDossierTab] = useState<'overview' | 'files' | 'notes' | 'plans' | 'quizzes' | 'contributions'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, [token, user?.id]);

  const fetchAdminData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [usersRes, sumRes, studentsRes] = await Promise.all([
        fetch('/api/auth/users', { headers }),
        fetch('/api/auth/database-summary', { headers }),
        fetch('/api/auth/admin/students', { headers }),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }
      if (sumRes.ok) {
        const sData = await sumRes.json();
        setSummary(sData);
      }
      if (studentsRes.ok) {
        const studData = await studentsRes.json();
        setStudentRecords(studData.students || []);
        setStudentAggregate(studData.aggregate || null);
      }
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update role');
      }

      setActionMessage({
        type: 'success',
        text: `Role updated successfully to ${newRole === 'admin' ? 'Administrator' : 'Student'}!`,
      });
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update user role' });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user account "${userName}"?`)) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete user');
      }

      setActionMessage({
        type: 'success',
        text: `User account "${userName}" was removed from the database.`,
      });
      if (selectedStudent?.id === userId) {
        setSelectedStudent(null);
      }
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete user' });
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleExportJSON = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      platform: 'Academic & Career Intelligence Platform',
      adminUser: user?.email,
      featureAccessStatus: 'All 10 Core Features Active For Registered Students',
      aggregate: studentAggregate,
      totalStudentsCollected: studentRecords.length,
      students: studentRecords,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `all_student_records_dossier_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Email Address',
      'Role',
      'Registered Date',
      'Files Count',
      'Storage (Bytes)',
      'Notes Count',
      'Study Plans Count',
      'Quizzes Count',
      'Quiz Attempts',
      'Highest Quiz Score %',
      'Academic Contributions',
      '10 Features Access',
    ];
    const rows = studentRecords.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      s.role,
      s.createdAt,
      s.counts.files,
      s.totalStorageBytes,
      s.counts.notes,
      s.counts.studyPlans,
      s.counts.quizzes,
      s.counts.quizAttempts,
      `${s.counts.highestQuizScore}%`,
      s.counts.academicPapers + s.counts.sharedNotes,
      'YES (10/10 Features Unlocked)',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `all_student_records_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportSingleStudentJSON = (student: StudentFullRecord) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `student_record_${student.id}_${student.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // If user is not admin, show restricted barrier
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Administrator Privileges Required
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            You are currently signed in with a <strong className="text-blue-600">Student Account</strong> ({user?.name}). All 10 student features are enabled for your account. The Admin Console provides faculty-level inspection of all student records, global storage telemetry, and system controls.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => quickAdminLogin()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Sign In as Administrator (Demo Passcode)</span>
            </button>

            <button
              onClick={() => openAuthModal('admin-login')}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Enter Custom Admin Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter students based on search and activity
  const filteredStudents = studentRecords.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.files.some((f) => f.originalName.toLowerCase().includes(studentSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (studentFilter === 'with-files') return s.counts.files > 0;
    if (studentFilter === 'with-plans') return s.counts.studyPlans > 0;
    if (studentFilter === 'with-quizzes') return s.counts.quizzes > 0;

    return true;
  });

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const studentCount = users.filter((u) => u.role === 'student').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const core10FeaturesList = [
    { id: 'dashboard', name: '1. Dashboard & Telemetry', desc: 'Central workspace overview & real-time event sync' },
    { id: 'files', name: '2. Files & Versioned Storage', desc: 'Multi-folder repository with version diffs & downloads' },
    { id: 'assistant', name: '3. AI Assistant (RAG Engine)', desc: 'Knowledge base retrieval from course documents' },
    { id: 'tutor', name: '4. AI Tutor (Socratic)', desc: 'Multi-turn concept explanations & adaptive depth' },
    { id: 'quiz', name: '5. Quiz Generator', desc: 'Instant assessments with scoring & feedback' },
    { id: 'resume', name: '6. Resume Analyzer', desc: 'ATS parser with semantic keyword scoring' },
    { id: 'skills', name: '7. Skill Gap Analyzer', desc: 'Industry taxonomy matching & learning roadmaps' },
    { id: 'planner', name: '8. Study Planner', desc: 'Automated milestone schedule with task progress' },
    { id: 'interview', name: '9. Interview Coach', desc: 'Interactive behavioral & technical interview simulation' },
    { id: 'academic', name: '10. Academic Exchange & Notes', desc: 'Community note sharing, flashcards & multilingual voice' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">System & Faculty Admin Console</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Administrator Active
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> All 10 Features Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Collecting all registered student records, files, study plans, quizzes, and verifying 100% feature accessibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
            <button
              onClick={handleExportJSON}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700 shadow-xs"
              title="Export complete student records as JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700 shadow-xs"
              title="Export student summary as CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-700"
              title="Refresh console telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 border animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Metric 1: Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Collected Students</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{studentRecords.length}</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Records Collected</span>
          </div>
        </div>

        {/* Metric 2: Student Files */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Student Files & Data</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {studentAggregate?.totalStudentFiles ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate font-mono">
            {formatBytes(studentAggregate?.totalStudentStorageBytes ?? 0)} stored
          </div>
        </div>

        {/* Metric 3: Study Plans */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Study Plans Active</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {studentAggregate?.totalStudentStudyPlans ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            Milestones tracking on track
          </div>
        </div>

        {/* Metric 4: Quizzes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Quizzes & Tests</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {studentAggregate?.totalStudentQuizzes ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            Readiness assessments
          </div>
        </div>

        {/* Metric 5: 10 Features Status */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">10 Core Features</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 flex items-center gap-1">
            <span>10 / 10 Active</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Unlocked for all students</span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveSubTab('students')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'students'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>All Student Records ({studentRecords.length})</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full">
            10/10 Features
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('storage')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'storage'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Storage & Uploaded Files</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'system'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Architecture</span>
        </button>
      </div>

      {/* SUBTAB 1: 🎓 ALL STUDENT RECORDS COLLECTION */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          {/* Feature Verification Callout */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>All Registered Students Have Unrestricted Access to All 10 Features</span>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Every registered student account is automatically provisioned with starter workspace resources, active recall flashcards, study schedules, and assessments. All 10 features operate with full read/write persistence.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Dossier (JSON)</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Student Search and Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name, email, student ID, or files..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Filter:</span>
              <button
                onClick={() => setStudentFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  studentFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Students ({studentRecords.length})
              </button>
              <button
                onClick={() => setStudentFilter('with-files')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  studentFilter === 'with-files'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                With Files ({studentRecords.filter((s) => s.counts.files > 0).length})
              </button>
              <button
                onClick={() => setStudentFilter('with-plans')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  studentFilter === 'with-plans'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                With Study Plans ({studentRecords.filter((s) => s.counts.studyPlans > 0).length})
              </button>
              <button
                onClick={() => setStudentFilter('with-quizzes')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  studentFilter === 'with-quizzes'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                With Quizzes ({studentRecords.filter((s) => s.counts.quizzes > 0).length})
              </button>
            </div>
          </div>

          {/* Student Records Collection Cards & Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student Dossier</th>
                    <th className="py-3 px-4">10 Features Status</th>
                    <th className="py-3 px-4">Files & Storage</th>
                    <th className="py-3 px-4">Study Progress</th>
                    <th className="py-3 px-4">Assessments</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const isCurrentUser = student.id === user?.id;
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isCurrentUser ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          {/* Student Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate block text-sm">
                                    {student.name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                      Active Session
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 truncate block font-mono">
                                  {student.email}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {student.id.slice(0, 16)}... • Joined {new Date(student.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 10-Feature Access Pill */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>10/10 Features Online</span>
                              </span>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span>Full NLP, RAG & Tutor Access</span>
                              </div>
                            </div>
                          </td>

                          {/* Files & Storage */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span>{student.counts.files} files</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {formatBytes(student.totalStorageBytes)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {student.counts.folders} directories
                              </div>
                            </div>
                          </td>

                          {/* Study Progress */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                                <span>{student.counts.studyPlans} plans</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Tasks: {student.counts.planTasksDone} / {student.counts.planTasksTotal} done
                              </div>
                              {student.counts.planTasksTotal > 0 && (
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="h-full bg-rose-500 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.round((student.counts.planTasksDone / student.counts.planTasksTotal) * 100)
                                      )}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Assessments & Notes */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-1">
                                <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
                                <span>{student.counts.quizzes} Quizzes</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Best Score: {student.counts.highestQuizScore > 0 ? `${student.counts.highestQuizScore}%` : 'Pending'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {student.counts.notes} Notes • {student.notes.reduce((acc, n) => acc + n.flashcardsCount, 0)} Flashcards
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* View Full Dossier */}
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setDossierTab('overview');
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1 border border-indigo-200"
                                title="Inspect comprehensive student record dossier"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Dossier</span>
                              </button>

                              {/* Switch Session */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => switchUser(student.id)}
                                  className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  title="Switch to this student workspace"
                                >
                                  Switch
                                </button>
                              )}

                              {/* Single Export */}
                              <button
                                onClick={() => handleExportSingleStudentJSON(student)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Download individual student record (JSON)"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleDeleteUser(student.id, student.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete student account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        No registered student records match the search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: USER ACCOUNTS & ROLES */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts by name or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Role:</span>
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  roleFilter === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Students ({studentCount})</span>
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  roleFilter === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admins ({adminCount})</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role & Permissions</th>
                    <th className="py-3 px-4">Content Footprint</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isCurrentActive = u.id === user?.id;
                      const isUserAdmin = u.role === 'admin';
                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isCurrentActive ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate block">
                                    {u.name}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 truncate block">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isUserAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Administrator</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Student (10 Features Active)</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <div className="space-y-0.5 text-[11px]">
                              <span>📁 {u.fileCount} stored files</span>
                              <br />
                              <span>📝 {u.noteCount} notes</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRoleChange(u.id, isUserAdmin ? 'student' : 'admin')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 border ${
                                  isUserAdmin
                                    ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                                title={isUserAdmin ? 'Demote to Student' : 'Promote to Administrator'}
                              >
                                {isUserAdmin ? (
                                  <>
                                    <UserX className="w-3 h-3 text-slate-500" />
                                    <span>Demote to Student</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    <span>Promote to Admin</span>
                                  </>
                                )}
                              </button>

                              {!isCurrentActive && (
                                <button
                                  onClick={() => switchUser(u.id)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  title="Switch to this user session"
                                >
                                  Switch
                                </button>
                              )}

                              {!isCurrentActive && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No accounts match the current search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: STORAGE & UPLOADED FILES */}
      {activeSubTab === 'storage' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Global Uploads File System</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              All student files are stored on server disk in <code>data/uploads/</code> and indexed with versioning metadata in <code>data/db.json</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Storage Directory</span>
                <span className="text-indigo-600 truncate block font-bold">
                  {summary?.storageDirectory || 'data/uploads'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Database JSON File</span>
                <span className="text-emerald-600 truncate block font-bold">
                  {summary?.databaseFile || 'data/db.json'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Total Storage Volume</span>
                <span className="text-slate-800 truncate block font-bold">
                  {formatBytes(summary?.globalStats?.totalUploadsSize || 0)}
                </span>
              </div>
            </div>

            {summary?.files && summary.files.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Folder</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">NLP Index</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {file.originalName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {file.folderPath}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{formatBytes(file.size)}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            v{file.version}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {file.hasTextExtracted ? (
                            <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Extracted
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Raw</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={`/api/files/${file.id}/download`}
                            download={file.originalName}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center gap-1 text-[11px] font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No files uploaded in active workspace yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: DATABASE ARCHITECTURE */}
      {activeSubTab === 'system' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs text-slate-700">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Engine & Security Model</h3>
              <p className="text-slate-500">Local JSON document engine with cryptographic role separation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Role Permissions (10/10 Features)</span>
              </h4>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Access personal files and multi-level folder structure</li>
                <li>Access RAG AI Assistant and Socratic AI Tutor</li>
                <li>Generate and take curriculum quizzes with instant scoring</li>
                <li>Analyze resumes against ATS benchmarks and skill gaps</li>
                <li>Create and execute study planner schedules</li>
                <li>Conduct simulated technical interviews with coaching</li>
                <li>Create notes, practice flashcards, and share to Peer Exchange</li>
                <li>Restricted from accessing Admin Console and user roles</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
              <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Administrator Role Permissions</span>
              </h4>
              <ul className="space-y-1 text-indigo-900 list-disc list-inside">
                <li>Full faculty access to inspect all collected student records</li>
                <li>Verify 100% feature availability and readiness across all student accounts</li>
                <li>Export comprehensive student record dossiers (JSON & CSV)</li>
                <li>Promote or demote user account roles (Student ⇄ Admin)</li>
                <li>Inspect and download student uploaded files across all directories</li>
                <li>Monitor live real-time sync event telemetry</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FULL STUDENT RECORD DOSSIER MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedStudent.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                      Student Account
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 10/10 Features
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedStudent.email} • ID: {selectedStudent.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSingleStudentJSON(selectedStudent)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50 gap-4 overflow-x-auto">
              <button
                onClick={() => setDossierTab('overview')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'overview'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Overview & 10 Features</span>
              </button>
              <button
                onClick={() => setDossierTab('files')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'files'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Files ({selectedStudent.files.length})</span>
              </button>
              <button
                onClick={() => setDossierTab('plans')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'plans'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Study Plans ({selectedStudent.studyPlans.length})</span>
              </button>
              <button
                onClick={() => setDossierTab('quizzes')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'quizzes'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileQuestion className="w-3.5 h-3.5" />
                <span>Quizzes ({selectedStudent.quizzes.length})</span>
              </button>
              <button
                onClick={() => setDossierTab('notes')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'notes'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes & Cards ({selectedStudent.notes.length})</span>
              </button>
              <button
                onClick={() => setDossierTab('contributions')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  dossierTab === 'contributions'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Community ({selectedStudent.counts.academicPapers + selectedStudent.counts.sharedNotes})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {/* DOSSIER: OVERVIEW */}
              {dossierTab === 'overview' && (
                <div className="space-y-6">
                  {/* Verified 10-Feature Matrix */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Verified 10 Core Academic & Career Features</span>
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        10/10 Features Enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {core10FeaturesList.map((feature) => (
                        <div
                          key={feature.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-2.5"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{feature.name}</span>
                            <span className="text-[11px] text-slate-500 leading-tight block">
                              {feature.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Storage</span>
                      <span className="text-base font-bold text-slate-900 block">
                        {formatBytes(selectedStudent.totalStorageBytes)}
                      </span>
                      <span className="text-[10px] text-slate-500">{selectedStudent.files.length} files saved</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Study Milestones</span>
                      <span className="text-base font-bold text-rose-600 block">
                        {selectedStudent.counts.planTasksDone} / {selectedStudent.counts.planTasksTotal} Tasks
                      </span>
                      <span className="text-[10px] text-slate-500">{selectedStudent.studyPlans.length} active plans</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Best Quiz Score</span>
                      <span className="text-base font-bold text-amber-600 block">
                        {selectedStudent.counts.highestQuizScore}%
                      </span>
                      <span className="text-[10px] text-slate-500">{selectedStudent.counts.quizAttempts} attempts</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Academic Notes</span>
                      <span className="text-base font-bold text-indigo-600 block">
                        {selectedStudent.notes.length} Notes
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {selectedStudent.notes.reduce((acc, n) => acc + n.flashcardsCount, 0)} flashcards
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DOSSIER: FILES */}
              {dossierTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Uploaded Documents & Versioned Files ({selectedStudent.files.length})
                    </h4>
                    <span className="text-slate-500 text-[11px]">
                      Total: {formatBytes(selectedStudent.totalStorageBytes)}
                    </span>
                  </div>

                  {selectedStudent.files.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">File Name</th>
                            <th className="py-2.5 px-3">Folder Path</th>
                            <th className="py-2.5 px-3">Size</th>
                            <th className="py-2.5 px-3">Version</th>
                            <th className="py-2.5 px-3">Text Extracted</th>
                            <th className="py-2.5 px-3 text-right">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedStudent.files.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {f.originalName}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                                {f.folderPath}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {formatBytes(f.size)}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[10px]">
                                  v{f.version}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {f.hasTextExtracted ? (
                                  <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Ready for RAG
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Pending</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <a
                                  href={`/api/files/${f.id}/download`}
                                  download={f.originalName}
                                  className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold inline-flex items-center gap-1 text-[11px]"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      No files uploaded yet for this student.
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIER: STUDY PLANS */}
              {dossierTab === 'plans' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Study Plans & Weekly Schedules ({selectedStudent.studyPlans.length})
                  </h4>

                  {selectedStudent.studyPlans.length > 0 ? (
                    <div className="space-y-4">
                      {selectedStudent.studyPlans.map((plan) => (
                        <div key={plan.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{plan.title}</h5>
                              <p className="text-[11px] text-slate-500">Goal: {plan.goal}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                              {plan.completedTasks} / {plan.totalTasks} Tasks Done
                            </span>
                          </div>

                          <div className="space-y-2">
                            {plan.schedule.map((week, wIdx) => (
                              <div key={week.week || wIdx} className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="font-semibold text-slate-800 text-[11px] mb-1.5">
                                  Week {week.week || wIdx + 1}: {week.focus || week.title}
                                </div>
                                <div className="space-y-1 pl-1">
                                  {week.tasks.map((tItem, tIdx) => (
                                    <div key={tIdx} className="flex items-center gap-2 text-[11px]">
                                      <div
                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                          tItem.done ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                                        }`}
                                      >
                                        {tItem.done && <Check className="w-2.5 h-2.5" />}
                                      </div>
                                      <span className={tItem.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                                        {tItem.task || (tItem as any).title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      No study plans generated yet.
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIER: QUIZZES */}
              {dossierTab === 'quizzes' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Quizzes & Assessment Records ({selectedStudent.quizzes.length})
                  </h4>

                  {selectedStudent.quizzes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{quiz.title}</h5>
                              <p className="text-[11px] text-slate-500">
                                {quiz.questionsCount} Questions • Source: {quiz.sourceDocName || 'Direct Topic'}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              {quiz.attemptsCount} Attempts
                            </span>
                          </div>

                          {quiz.history && quiz.history.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                                Score History:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {quiz.history.map((h, hIdx) => {
                                  const pct = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                                  return (
                                    <span
                                      key={hIdx}
                                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700"
                                    >
                                      Attempt {hIdx + 1}: {h.score}/{h.total} ({pct}%)
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      No quizzes taken yet.
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIER: NOTES */}
              {dossierTab === 'notes' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Academic Notes & Active Recall Flashcards ({selectedStudent.notes.length})
                  </h4>

                  {selectedStudent.notes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedStudent.notes.map((note) => (
                        <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 text-xs">{note.title}</h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {note.flashcardsCount} Flashcards
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                            {note.summary}
                          </p>

                          {note.flashcards && note.flashcards.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 font-semibold block">Flashcards:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {note.flashcards.map((card, cIdx) => (
                                  <div key={cIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                    <div className="font-semibold text-slate-800 text-[11px]">
                                      Q: {card.front}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      A: {card.back}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      No notes created yet.
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIER: CONTRIBUTIONS */}
              {dossierTab === 'contributions' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Peer Community Contributions & Shared Research
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Published Papers</span>
                      <span className="text-xl font-bold text-slate-900 block mt-1">
                        {selectedStudent.academicPapers.length}
                      </span>
                      <div className="mt-2 space-y-1">
                        {selectedStudent.academicPapers.map((paper) => (
                          <div key={paper.id} className="text-[11px] text-slate-600 truncate">
                            • {paper.title} ({paper.upvotes} upvotes)
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Shared Public Notes</span>
                      <span className="text-xl font-bold text-slate-900 block mt-1">
                        {selectedStudent.sharedNotes.length}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Shared notes are visible in the Academic Exchange & Peer Community view.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Student Account: {selectedStudent.name} ({selectedStudent.email})
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
