export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export interface FileVersion {
  version: number;
  storedFilename: string;
  size: number;
  uploadedAt: string;
  note?: string;
}

export interface FileItem {
  id: string;
  userId: string;
  originalName: string;
  storedFilename: string;
  folderPath: string;
  size: number;
  mimeType: string;
  version: number;
  versions: FileVersion[];
  textContent: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  path: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SavedQuiz {
  id: string;
  userId: string;
  title: string;
  sourceDocName?: string;
  questions: QuizQuestion[];
  history: Array<{ score: number; total: number; date: string }>;
  createdAt: string;
}

export interface AcademicPaper {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  category: string;
  abstract: string;
  content: string;
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  examDate?: string;
  topics: string[];
  schedule: Array<{
    week: number;
    title: string;
    focus: string;
    tasks: Array<{ task: string; done: boolean }>;
  }>;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  flashcards: Array<{ front: string; back: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface SharedNoteItem {
  id: string;
  noteId: string;
  sharedBy: string;
  sharedAt: string;
}

export interface SharedNoteSummary {
  shareId: string;
  noteId: string;
  title: string;
  summary: string;
  keywords: string[];
  flashcardsCount: number;
  sharedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  sharedAt: string;
}

export interface SharedNoteDetail extends SharedNoteSummary {
  content: string;
  flashcards: Array<{ front: string; back: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface MatchedJobRole {
  roleTitle: string;
  matchScore: number;
  tier: 'immediate' | 'near_term' | 'growth';
  whyYouQualify: string;
  matchedSkills: string[];
  missingSkillsToLearn: string[];
  industryDemand: string;
  estimatedSalary: string;
  careerLevel?: string;
  recommendedAction: string;
}

export interface ResumeSkillCategories {
  languages?: string[];
  frameworksAndLibraries?: string[];
  toolsAndCloud?: string[];
  coreCompetencies?: string[];
  softSkills?: string[];
}

export interface ResumeAnalysis {
  candidateName: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  extractedSkills: string[];
  skillCategories?: ResumeSkillCategories;
  experienceYears?: number;
  workExperience?: Array<{
    role: string;
    company: string;
    duration: string;
    highlights: string[];
  }>;
  atsScore: number;
  scoreBreakdown: {
    impactAndMetrics: number;
    formatting: number;
    skillRelevance: number;
    keywordDensity: number;
  };
  strengths: string[];
  criticalImprovements: string[];
  missingKeywords: string[];
  matchingJobs?: MatchedJobRole[];
  careerTrajectorySummary?: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  missingNiceToHaveSkills: string[];
  learningRoadmap: Array<{
    phase: string;
    topic: string;
    estimatedWeeks: number;
    recommendedProjects: string[];
    keyConceptsToMaster: string[];
  }>;
  interviewReadinessAssessment: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  starAlignment: {
    score: number;
    feedback: string;
  };
  technicalDepth: {
    score: number;
    feedback: string;
  };
  clarityAndConcision: {
    score: number;
    feedback: string;
  };
  fillerAndConfidence: {
    fillerWordImpact: string;
    toneSentiment: string;
  };
  strengths: string[];
  improvements: string[];
  idealResponseRewrite: string;
}

export interface MultilingualResult {
  detectedSourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  phoneticPronunciation: string;
  linguisticNotes: string[];
  keyVocabulary: Array<{
    term: string;
    translation: string;
    partOfSpeech: string;
  }>;
}

export type SupportedLanguage = 'English' | 'Hindi' | 'Marathi';
export type SupportedLanguageCode = 'en' | 'hi' | 'mr';

export type ActiveTab =
  | 'dashboard'
  | 'files'
  | 'assistant'
  | 'tutor'
  | 'quiz'
  | 'resume'
  | 'skills'
  | 'planner'
  | 'interview'
  | 'academic'
  | 'notes'
  | 'shared-notes'
  | 'multilingual'
  | 'admin';

export interface StudentFullRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
  totalStorageBytes: number;
  counts: {
    files: number;
    folders: number;
    notes: number;
    studyPlans: number;
    quizzes: number;
    quizAttempts: number;
    highestQuizScore: number;
    planTasksTotal: number;
    planTasksDone: number;
    academicPapers: number;
    sharedNotes: number;
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
  folders: Array<{
    id: string;
    name: string;
    path: string;
    createdAt: string;
  }>;
  notes: Array<{
    id: string;
    title: string;
    summary: string;
    keywords: string[];
    flashcardsCount: number;
    flashcards: Array<{ front: string; back: string }>;
    isShared: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  studyPlans: Array<{
    id: string;
    title: string;
    goal: string;
    topics: string[];
    examDate?: string;
    totalWeeks: number;
    totalTasks: number;
    completedTasks: number;
    schedule: Array<{
      week: number;
      title: string;
      focus: string;
      tasks: Array<{ task: string; done: boolean }>;
    }>;
    createdAt: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    sourceDocName?: string;
    questionsCount: number;
    attemptsCount: number;
    history: Array<{ score: number; total: number; date: string }>;
    questions: QuizQuestion[];
    createdAt: string;
  }>;
  academicPapers: Array<{
    id: string;
    title: string;
    category: string;
    upvotes: number;
    createdAt: string;
  }>;
  sharedNotes: Array<{
    id: string;
    noteId: string;
    sharedAt: string;
  }>;
  featureAccess: {
    dashboard: boolean;
    files: boolean;
    assistant: boolean;
    tutor: boolean;
    quiz: boolean;
    resume: boolean;
    skills: boolean;
    planner: boolean;
    interview: boolean;
    academicExchange: boolean;
    notes: boolean;
    multilingual: boolean;
    all10Active: boolean;
  };
}

export interface StudentAggregateStats {
  totalStudents: number;
  totalStudentFiles: number;
  totalStudentStorageBytes: number;
  totalStudentNotes: number;
  totalStudentStudyPlans: number;
  totalStudentQuizzes: number;
  totalStudentSharedContributions: number;
  allStudents10FeaturesActive: boolean;
}

