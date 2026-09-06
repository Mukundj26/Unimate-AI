import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
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
  folderPath: string; // e.g., "/" or "/MachineLearning"
  size: number;
  mimeType: string;
  version: number;
  versions: FileVersion[];
  textContent: string; // Extracted text content for RAG & full-text indexing
  summary?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  path: string; // e.g. "/MachineLearning"
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

export interface SyncEvent {
  id: number;
  type: 'file_uploaded' | 'file_versioned' | 'file_deleted' | 'folder_created' | 'note_updated' | 'academic_shared' | 'note_shared' | 'note_unshared';
  userId: string;
  payload: any;
  timestamp: string;
}

export interface SharedNoteItem {
  id: string;
  noteId: string;
  sharedBy: string; // userId of the sharer
  sharedAt: string;
}

interface DatabaseSchema {
  users: User[];
  files: FileItem[];
  folders: FolderItem[];
  academicPapers: AcademicPaper[];
  studyPlans: StudyPlan[];
  quizzes: SavedQuiz[];
  notes: NoteItem[];
  sharedNotes: SharedNoteItem[];
  events: SyncEvent[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

function getInitialData(): DatabaseSchema {
  const demoSalt = 'a8f9c2d4e1b34567';
  const demoHash = crypto.pbkdf2Sync('demo1234', demoSalt, 1000, 64, 'sha512').toString('hex');

  const defaultUser: User = {
    id: 'user-demo-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@edu.nlp',
    passwordHash: demoHash,
    salt: demoSalt,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  const adminSalt = 'a8f9c2d4e1b34567';
  const adminHash = 'd4153fc526696a8d0c51166f0f493ec972dfd80b971962e1afd2a02792c92c90c523e82a512612424f33ad297183a91d510db088495f52a0a0657ec7eb909633'; // admin1234
  const adminUser: User = {
    id: 'user-admin-1',
    name: 'Dr. Arthur Vance (Admin)',
    email: 'admin@edu.nlp',
    passwordHash: adminHash,
    salt: adminSalt,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  const samplePapers: AcademicPaper[] = [
    {
      id: 'paper-1',
      userId: defaultUser.id,
      authorName: 'Dr. Elena Rostova',
      title: 'Attention Mechanisms and Transformer Scaling in Low-Resource NLP',
      category: 'Natural Language Processing',
      abstract: 'An empirical exploration into parameter-efficient fine-tuning and cross-lingual transfer learning for under-resourced dialects.',
      content: 'This research systematically examines LoRA, Prefix-Tuning, and Adapter-based parameter adjustments on 12 distinct low-resource language families...',
      tags: ['Transformers', 'RAG', 'Low-Resource', 'Cross-Lingual'],
      upvotes: 24,
      upvotedBy: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'paper-2',
      userId: defaultUser.id,
      authorName: 'Marcus Vance & Priya Chen',
      title: 'Retrieval-Augmented Generation for Technical Documentation Verification',
      category: 'Information Retrieval',
      abstract: 'Integrating dense vector embeddings with BM25 hybrid ranking to mitigate hallucination in domain-specific code and technical manual assistants.',
      content: 'Hallucination remains a paramount bottleneck in deploying LLMs to mission-critical engineering stacks. By pairing reciprocal rank fusion (RRF) with rerankers...',
      tags: ['RAG', 'Vector Search', 'Hallucination Mitigation', 'BM25'],
      upvotes: 38,
      upvotedBy: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'paper-3',
      userId: defaultUser.id,
      authorName: 'Kaito Tanaka',
      title: 'Multi-Turn Conversational Alignment via Constitutional AI Frameworks',
      category: 'AI Ethics & Alignment',
      abstract: 'Analyzing reinforcement learning from AI feedback (RLAIF) in mitigating adversarial jailbreaks across multi-turn tutor dialogues.',
      content: 'Automated tutors must balance student encouragement with steadfast alignment boundaries against toxic and unverified STEM solutions...',
      tags: ['Alignment', 'RLAIF', 'Constitutional AI', 'AI Tutor'],
      upvotes: 19,
      upvotedBy: [],
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    }
  ];

  const sampleNotes: NoteItem[] = [
    {
      id: 'note-1',
      userId: defaultUser.id,
      title: 'Transformer Architecture Foundations',
      content: 'Key components of the Transformer: Multi-Head Self-Attention, Scaled Dot-Product Attention, Positional Encodings (Sinusoidal & RoPE), Feed-Forward Networks with GELU activations, and Layer Normalization (Pre-LN vs Post-LN). Self-attention calculates queries Q, keys K, and values V with softmax((QK^T)/sqrt(d_k))V.',
      summary: 'Transformers rely on scaled dot-product self-attention mechanisms and positional encodings to process sequential context in parallel rather than recurrently.',
      keywords: ['Self-Attention', 'Positional Encoding', 'Multi-Head Attention', 'LayerNorm', 'Softmax'],
      flashcards: [
        { front: 'What is the formula for Scaled Dot-Product Attention?', back: 'Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V' },
        { front: 'Why scale by sqrt(d_k)?', back: 'To prevent the dot products from growing excessively large for large dimensions, which would push softmax into regions with vanishingly small gradients.' },
        { front: 'What is the purpose of Positional Encodings?', back: 'Because self-attention is permutation-invariant, positional encodings inject sequence order information.' }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ];

  return {
    users: [defaultUser, adminUser],
    files: [],
    folders: [
      { id: 'f-1', userId: defaultUser.id, name: 'Machine Learning', path: '/Machine Learning', createdAt: new Date().toISOString() },
      { id: 'f-2', userId: defaultUser.id, name: 'Research Papers', path: '/Research Papers', createdAt: new Date().toISOString() },
      { id: 'f-3', userId: defaultUser.id, name: 'Interview Prep', path: '/Interview Prep', createdAt: new Date().toISOString() },
    ],
    academicPapers: samplePapers,
    studyPlans: [],
    quizzes: [],
    notes: sampleNotes,
    sharedNotes: [
      {
        id: 'SN-001',
        noteId: 'note-1',
        sharedBy: defaultUser.id,
        sharedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ],
    events: [],
  };
}

class Database {
  private data: DatabaseSchema;
  private eventListeners: Array<(event: SyncEvent) => void> = [];

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.sharedNotes)) {
          parsed.sharedNotes = [];
        }
        let modified = false;
        if (Array.isArray(parsed.users)) {
          for (const u of parsed.users) {
            if (!u.role) {
              u.role = u.email === 'admin@edu.nlp' ? 'admin' : 'student';
              modified = true;
            }
          }
          const hasAdmin = parsed.users.some((u: any) => u.role === 'admin' || u.email === 'admin@edu.nlp');
          if (!hasAdmin) {
            const adminSalt = 'a8f9c2d4e1b34567';
            const adminHash = 'd4153fc526696a8d0c51166f0f493ec972dfd80b971962e1afd2a02792c92c90c523e82a512612424f33ad297183a91d510db088495f52a0a0657ec7eb909633'; // admin1234
            parsed.users.push({
              id: 'user-admin-1',
              name: 'Dr. Arthur Vance (Admin)',
              email: 'admin@edu.nlp',
              passwordHash: adminHash,
              salt: adminSalt,
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              role: 'admin',
              createdAt: new Date().toISOString(),
            });
            modified = true;
          }
        }
        if (modified) {
          this.saveDirect(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to parse database file, reinitializing', err);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public broadcast(type: SyncEvent['type'], userId: string, payload: any) {
    const event: SyncEvent = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.data.events.push(event);
    if (this.data.events.length > 200) {
      this.data.events = this.data.events.slice(-200);
    }
    this.save();
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    }
  }

  public onSync(listener: (event: SyncEvent) => void) {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  // User auth methods
  public findUserByEmail(email: string): User | undefined {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return undefined;

    // Direct match
    const exact = this.data.users.find(u => u.email.toLowerCase() === clean);
    if (exact) return exact;

    // Faculty admin aliases
    if (clean === 'admin' || clean === 'admin@admin.com' || clean === 'faculty' || clean === 'faculty@edu.nlp') {
      return this.data.users.find(u => u.email.toLowerCase() === 'admin@edu.nlp') || this.data.users.find(u => u.role === 'admin');
    }

    // Mukund aliases
    if (clean === 'mukund' || clean === 'mukundjarad@gmail.com' || clean === 'mukundjarad26@gmail.com') {
      return this.data.users.find(u => 
        u.email.toLowerCase() === 'mukundjarad@gmail.com' || 
        u.email.toLowerCase() === 'mukundjarad26@gmail.com'
      );
    }

    return undefined;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(name: string, email: string, password: string, role: UserRole = 'student'): User {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('User already exists with this email');
    }
    const { hash, salt } = hashPassword(password);
    const user: User = {
      id: role === 'admin' ? 'admin-' + crypto.randomUUID() : 'user-' + crypto.randomUUID(),
      name,
      email,
      passwordHash: hash,
      salt,
      avatar: role === 'admin'
        ? `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(user);

    // If registering as a student, provision standard workspace folders & resources so all 10 features are immediately usable
    if (role === 'student') {
      this.provisionStudentStarterResources(user.id, user.name);
    }

    this.save();
    return user;
  }

  public provisionStudentStarterResources(userId: string, userName: string) {
    const now = new Date().toISOString();
    // 1. Core folders for Feature 2 (My Files & Storage)
    const starterFolders = ['Machine Learning', 'Course Materials', 'Research Papers', 'Interview Prep'];
    for (const fName of starterFolders) {
      if (!this.data.folders.some(f => f.userId === userId && f.path === `/${fName}`)) {
        this.data.folders.push({
          id: 'folder-' + crypto.randomUUID(),
          userId,
          name: fName,
          path: `/${fName}`,
          createdAt: now,
        });
      }
    }

    // 2. Starter Note & Flashcards for Feature 10 (Notes & Resources)
    if (!this.data.notes.some(n => n.userId === userId)) {
      this.data.notes.push({
        id: 'note-' + crypto.randomUUID(),
        userId,
        title: 'Core NLP & Transformer Foundations',
        content: `Welcome to your academic workspace, ${userName}! Key concepts: Multi-head attention allows neural models to jointly attend to information at different positions. Scaled dot-product attention computes Attention(Q, K, V) = softmax((QK^T)/sqrt(d_k))V. Positional encodings provide order awareness without recurrent bottlenecks.`,
        summary: 'Transformers use parallel self-attention and positional embeddings to model long-range sequence dependencies without recurrence.',
        keywords: ['Self-Attention', 'Positional Encoding', 'Multi-Head Attention', 'Softmax', 'RAG'],
        flashcards: [
          {
            front: 'What is the attention equation in standard Transformers?',
            back: 'Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V',
          },
          {
            front: 'Why scale by sqrt(d_k)?',
            back: 'To prevent large dot products that push softmax into regions with vanishingly small gradients.',
          },
          {
            front: 'What is the purpose of Positional Encodings?',
            back: 'Because self-attention is permutation-invariant, positional encodings provide essential sequence order information.',
          },
        ],
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Starter Study Plan for Feature 8 (Study Planner)
    if (!this.data.studyPlans.some(p => p.userId === userId)) {
      this.data.studyPlans.push({
        id: 'plan-' + crypto.randomUUID(),
        userId,
        title: 'AI & Machine Learning Core Mastery (4-Week Schedule)',
        goal: 'Semester Exams & Technical Interview Readiness',
        topics: ['Transformers & RAG', 'Vector Embeddings', 'Optimization & Fine-Tuning', 'System Design & APIs'],
        schedule: [
          {
            week: 1,
            title: 'Week 1 Foundations',
            focus: 'Foundations & Self-Attention Mechanics',
            tasks: [
              { task: 'Read Attention Is All You Need paper', done: true },
              { task: 'Implement scaled dot-product attention in PyTorch', done: true },
              { task: 'Test multi-head projection layers and masking', done: false },
            ],
          },
          {
            week: 2,
            title: 'Week 2 RAG & Embeddings',
            focus: 'Retrieval-Augmented Generation (RAG) & Vector Databases',
            tasks: [
              { task: 'Index course documents with dense embeddings', done: false },
              { task: 'Configure BM25 + dense hybrid reciprocal rank fusion', done: false },
              { task: 'Verify hallucination mitigation guardrails', done: false },
            ],
          },
          {
            week: 3,
            title: 'Week 3 Fine-Tuning',
            focus: 'Parameter-Efficient Fine-Tuning (LoRA & QLoRA)',
            tasks: [
              { task: 'Review low-rank adaptation matrix decomposition', done: false },
              { task: 'Run adapter fine-tuning on domain-specific dataset', done: false },
              { task: 'Benchmark inference latency vs full weights', done: false },
            ],
          },
          {
            week: 4,
            title: 'Week 4 Interview Prep',
            focus: 'Technical Interview & System Design Synthesis',
            tasks: [
              { task: 'Practice mock interview questions with Interview Coach', done: false },
              { task: 'Complete ATS resume review with Resume Analyzer', done: false },
              { task: 'Publish or share research notes on Academic Exchange', done: false },
            ],
          },
        ],
        examDate: '2026-06-30',
        createdAt: now,
      });
    }

    // 4. Starter Quiz for Feature 5 (Quiz Generator)
    if (!this.data.quizzes.some(q => q.userId === userId)) {
      this.data.quizzes.push({
        id: 'quiz-' + crypto.randomUUID(),
        userId,
        title: 'Machine Learning & NLP Readiness Assessment',
        sourceDocName: 'Curriculum Baseline',
        questions: [
          {
            id: 'q-1',
            question: 'Which component enables Transformers to process all tokens in parallel rather than sequentially?',
            options: [
              'Recurrent hidden states',
              'Self-Attention mechanism',
              'Convolutional sliding kernels',
              'Max-pooling stride layers',
            ],
            correctIndex: 1,
            explanation: 'Self-attention computes pairwise token affinities in parallel across the sequence, bypassing the sequential bottleneck of RNNs.',
            difficulty: 'easy',
          },
          {
            id: 'q-2',
            question: 'What is the purpose of temperature parameter T in language model decoding?',
            options: [
              'Controls GPU clock speeds',
              'Scales logits before softmax to modulate output randomness',
              'Determines context window token length',
              'Increases learning rate decay',
            ],
            correctIndex: 1,
            explanation: 'Dividing logits by temperature T before softmax affects the probability distribution: lower T concentrates probability on top tokens, higher T flattens it.',
            difficulty: 'medium',
          },
          {
            id: 'q-3',
            question: 'In Retrieval-Augmented Generation (RAG), what is Hybrid Search?',
            options: [
              'Searching both hard drives and flash memory',
              'Combining lexical keyword search (BM25) with semantic dense vector embeddings',
              'Querying multiple search engines simultaneously',
              'Translating queries into SQL statements',
            ],
            correctIndex: 1,
            explanation: 'Hybrid search pairs keyword matching (exact terms, codes) with vector search (semantic intent) for optimal recall and precision.',
            difficulty: 'medium',
          },
        ],
        history: [
          { score: 3, total: 3, date: now },
        ],
        createdAt: now,
      });
    }
  }

  public updateUserRole(userId: string, newRole: UserRole): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.role = newRole;
    this.save();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.save();
    return true;
  }

  public verifyUser(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;

    // Faculty admin master/demo passcodes
    if (user.role === 'admin' && (password === 'admin1234' || password === 'admin' || password === 'ADMIN2026')) {
      return user;
    }

    // Mukund convenient master passcodes
    if ((user.email.toLowerCase().includes('mukund') || user.id === 'user-mukund-admin') &&
        (password === 'admin1234' || password === 'demo1234' || password === 'admin' || password === 'ADMIN2026')) {
      return user;
    }

    const { hash } = hashPassword(password, user.salt);
    if (hash === user.passwordHash) {
      return user;
    }

    // Common demo password fallback for default student
    if (user.id === 'user-demo-1' && password === 'demo1234') {
      return user;
    }

    return null;
  }

  // Files & Folders
  public getFiles(userId: string, folderPath?: string): FileItem[] {
    return this.data.files.filter(f => f.userId === userId && (!folderPath || f.folderPath === folderPath));
  }

  public getAllUserFiles(userId: string): FileItem[] {
    return this.data.files.filter(f => f.userId === userId);
  }

  public getFileById(id: string, userId?: string): FileItem | undefined {
    if (userId) {
      const match = this.data.files.find(f => f.id === id && f.userId === userId);
      if (match) return match;
    }
    return this.data.files.find(f => f.id === id);
  }

  public updateFileTextContent(id: string, textContent: string): void {
    const file = this.data.files.find(f => f.id === id);
    if (file) {
      file.textContent = textContent;
      file.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  public addOrVersionFile(params: {
    userId: string;
    originalName: string;
    storedFilename: string;
    folderPath: string;
    size: number;
    mimeType: string;
    textContent: string;
    tags?: string[];
  }): { file: FileItem; isNewVersion: boolean } {
    const normalizedFolder = params.folderPath.startsWith('/') ? params.folderPath : `/${params.folderPath}`;
    const existing = this.data.files.find(
      f => f.userId === params.userId && f.originalName === params.originalName && f.folderPath === normalizedFolder
    );

    const now = new Date().toISOString();

    if (existing) {
      // Archive current version
      existing.versions.push({
        version: existing.version,
        storedFilename: existing.storedFilename,
        size: existing.size,
        uploadedAt: existing.updatedAt || existing.createdAt,
        note: `Version ${existing.version}`,
      });
      existing.version += 1;
      existing.storedFilename = params.storedFilename;
      existing.size = params.size;
      existing.mimeType = params.mimeType;
      existing.textContent = params.textContent;
      existing.updatedAt = now;
      if (params.tags) {
        existing.tags = Array.from(new Set([...existing.tags, ...params.tags]));
      }
      this.save();
      this.broadcast('file_versioned', params.userId, existing);
      return { file: existing, isNewVersion: true };
    } else {
      const newFile: FileItem = {
        id: 'file-' + crypto.randomUUID(),
        userId: params.userId,
        originalName: params.originalName,
        storedFilename: params.storedFilename,
        folderPath: normalizedFolder,
        size: params.size,
        mimeType: params.mimeType,
        version: 1,
        versions: [],
        textContent: params.textContent,
        tags: params.tags || ['document'],
        createdAt: now,
        updatedAt: now,
      };
      this.data.files.push(newFile);
      this.save();
      this.broadcast('file_uploaded', params.userId, newFile);
      return { file: newFile, isNewVersion: false };
    }
  }

  public rollbackFileVersion(fileId: string, userId: string, targetVersion: number): FileItem {
    const file = this.getFileById(fileId, userId);
    if (!file) throw new Error('File not found');
    const versionRecord = file.versions.find(v => v.version === targetVersion);
    if (!versionRecord) throw new Error(`Version ${targetVersion} not found in history`);

    // Add current version to history
    file.versions.push({
      version: file.version,
      storedFilename: file.storedFilename,
      size: file.size,
      uploadedAt: file.updatedAt,
      note: `Rollback snapshot from v${file.version}`,
    });

    file.version = targetVersion;
    file.storedFilename = versionRecord.storedFilename;
    file.size = versionRecord.size;
    file.updatedAt = new Date().toISOString();

    // Try reading text content if readable
    try {
      const filePath = path.join(UPLOADS_DIR, file.storedFilename);
      if (fs.existsSync(filePath)) {
        file.textContent = fs.readFileSync(filePath, 'utf-8').slice(0, 50000);
      }
    } catch {
      // Keep existing
    }

    this.save();
    this.broadcast('file_versioned', userId, file);
    return file;
  }

  public deleteFile(fileId: string, userId: string): boolean {
    const idx = this.data.files.findIndex(f => f.id === fileId && f.userId === userId);
    if (idx === -1) return false;
    const [deleted] = this.data.files.splice(idx, 1);
    this.save();
    this.broadcast('file_deleted', userId, { id: fileId, originalName: deleted.originalName });
    return true;
  }

  public getFolders(userId: string): FolderItem[] {
    let list = this.data.folders.filter(f => f.userId === userId);
    if (list.length === 0) {
      // Lazily create standard starter folders for this student
      const user = this.findUserById(userId);
      if (user) {
        this.provisionStudentStarterResources(userId, user.name);
        this.save();
        list = this.data.folders.filter(f => f.userId === userId);
      }
    }
    return list;
  }

  public createFolder(userId: string, name: string, parentPath: string = '/'): FolderItem {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const fullPath = `${cleanParent}/${name}`.replace(/\/+/g, '/');
    const existing = this.data.folders.find(f => f.userId === userId && f.path === fullPath);
    if (existing) return existing;

    const folder: FolderItem = {
      id: 'folder-' + crypto.randomUUID(),
      userId,
      name,
      path: fullPath,
      createdAt: new Date().toISOString(),
    };
    this.data.folders.push(folder);
    this.save();
    this.broadcast('folder_created', userId, folder);
    return folder;
  }

  // Academic Papers
  public getAcademicPapers(category?: string, query?: string): AcademicPaper[] {
    return this.data.academicPapers.filter(paper => {
      if (category && category !== 'All' && paper.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const matches = paper.title.toLowerCase().includes(q) ||
          paper.abstract.toLowerCase().includes(q) ||
          paper.tags.some(t => t.toLowerCase().includes(q)) ||
          paper.authorName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  public addAcademicPaper(paper: Omit<AcademicPaper, 'id' | 'upvotes' | 'upvotedBy' | 'createdAt'>): AcademicPaper {
    const newPaper: AcademicPaper = {
      ...paper,
      id: 'paper-' + crypto.randomUUID(),
      upvotes: 1,
      upvotedBy: [paper.userId],
      createdAt: new Date().toISOString(),
    };
    this.data.academicPapers.unshift(newPaper);
    this.save();
    this.broadcast('academic_shared', paper.userId, newPaper);
    return newPaper;
  }

  public upvoteAcademicPaper(paperId: string, userId: string): AcademicPaper | null {
    const paper = this.data.academicPapers.find(p => p.id === paperId);
    if (!paper) return null;
    if (paper.upvotedBy.includes(userId)) {
      paper.upvotedBy = paper.upvotedBy.filter(u => u !== userId);
      paper.upvotes = Math.max(0, paper.upvotes - 1);
    } else {
      paper.upvotedBy.push(userId);
      paper.upvotes += 1;
    }
    this.save();
    return paper;
  }

  // Study Plans
  public getStudyPlans(userId: string): StudyPlan[] {
    let plans = this.data.studyPlans.filter(p => p.userId === userId);
    if (plans.length === 0) {
      const user = this.findUserById(userId);
      if (user && user.role === 'student') {
        this.provisionStudentStarterResources(userId, user.name);
        this.save();
        plans = this.data.studyPlans.filter(p => p.userId === userId);
      }
    }
    return plans;
  }

  public saveStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt'>): StudyPlan {
    const newPlan: StudyPlan = {
      ...plan,
      id: 'plan-' + crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.studyPlans.unshift(newPlan);
    this.save();
    return newPlan;
  }

  public toggleStudyTask(planId: string, userId: string, weekIndex: number, taskIndex: number): StudyPlan | null {
    const plan = this.data.studyPlans.find(p => p.id === planId && p.userId === userId);
    if (!plan) return null;
    if (plan.schedule[weekIndex]?.tasks[taskIndex]) {
      plan.schedule[weekIndex].tasks[taskIndex].done = !plan.schedule[weekIndex].tasks[taskIndex].done;
      this.save();
    }
    return plan;
  }

  // Quizzes
  public getQuizzes(userId: string): SavedQuiz[] {
    let quizzes = this.data.quizzes.filter(q => q.userId === userId);
    if (quizzes.length === 0) {
      const user = this.findUserById(userId);
      if (user && user.role === 'student') {
        this.provisionStudentStarterResources(userId, user.name);
        this.save();
        quizzes = this.data.quizzes.filter(q => q.userId === userId);
      }
    }
    return quizzes;
  }

  public saveQuiz(quiz: Omit<SavedQuiz, 'id' | 'history' | 'createdAt'>): SavedQuiz {
    const newQuiz: SavedQuiz = {
      ...quiz,
      id: 'quiz-' + crypto.randomUUID(),
      history: [],
      createdAt: new Date().toISOString(),
    };
    this.data.quizzes.unshift(newQuiz);
    this.save();
    return newQuiz;
  }

  public recordQuizScore(quizId: string, userId: string, score: number, total: number): SavedQuiz | null {
    const quiz = this.data.quizzes.find(q => q.id === quizId && q.userId === userId);
    if (!quiz) return null;
    quiz.history.push({ score, total, date: new Date().toISOString() });
    this.save();
    return quiz;
  }

  // Notes & Flashcards
  public getNotes(userId: string): NoteItem[] {
    let notes = this.data.notes.filter(n => n.userId === userId);
    if (notes.length === 0) {
      const user = this.findUserById(userId);
      if (user && user.role === 'student') {
        this.provisionStudentStarterResources(userId, user.name);
        this.save();
        notes = this.data.notes.filter(n => n.userId === userId);
      }
    }
    return notes;
  }

  public getNoteById(noteId: string): NoteItem | undefined {
    return this.data.notes.find(n => n.id === noteId);
  }

  public saveNote(note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): NoteItem {
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...note,
      id: 'note-' + crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.data.notes.unshift(newNote);
    this.save();
    this.broadcast('note_updated', note.userId, newNote);
    return newNote;
  }

  public deleteNote(noteId: string, userId: string): boolean {
    const idx = this.data.notes.findIndex(n => n.id === noteId && n.userId === userId);
    if (idx === -1) return false;
    this.data.notes.splice(idx, 1);
    
    // Also remove from sharedNotes if it was shared
    const shareIdx = this.data.sharedNotes.findIndex(s => s.noteId === noteId);
    if (shareIdx !== -1) {
      this.data.sharedNotes.splice(shareIdx, 1);
      this.broadcast('note_unshared', userId, { noteId });
    }
    
    this.save();
    return true;
  }

  // 📚 Notes Sharing Implementation
  public shareNote(noteId: string, userId: string): { success: boolean; shareId?: string; message: string } {
    const note = this.data.notes.find(n => n.id === noteId);
    if (!note) {
      const err = new Error('Note not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (note.userId !== userId) {
      const err = new Error('Unauthorized: You can only share your own notes');
      (err as any).statusCode = 403;
      throw err;
    }

    // Check if already shared (prevent duplicate sharing)
    const existing = this.data.sharedNotes.find(s => s.noteId === noteId);
    if (existing) {
      return {
        success: true,
        shareId: existing.id,
        message: 'Note is already shared to the community',
      };
    }

    const newShare: SharedNoteItem = {
      id: 'SN-' + crypto.randomUUID().slice(0, 8),
      noteId,
      sharedBy: userId,
      sharedAt: new Date().toISOString(),
    };

    this.data.sharedNotes.unshift(newShare);
    this.save();
    this.broadcast('note_shared', userId, {
      shareId: newShare.id,
      noteId,
      title: note.title,
    });

    return {
      success: true,
      shareId: newShare.id,
      message: 'Note shared successfully',
    };
  }

  public unshareNote(noteId: string, userId: string): { success: boolean; message: string } {
    const shareIdx = this.data.sharedNotes.findIndex(s => s.noteId === noteId);
    if (shareIdx === -1) {
      return {
        success: true,
        message: 'Note was not shared',
      };
    }

    const share = this.data.sharedNotes[shareIdx];
    const note = this.data.notes.find(n => n.id === noteId);

    // Verify ownership: only owner or sharer can unshare
    const isOwner = (note && note.userId === userId) || share.sharedBy === userId;
    if (!isOwner) {
      const err = new Error('Unauthorized: You can only unshare your own notes');
      (err as any).statusCode = 403;
      throw err;
    }

    this.data.sharedNotes.splice(shareIdx, 1);
    this.save();
    this.broadcast('note_unshared', userId, { noteId });

    return {
      success: true,
      message: 'Note unshared successfully',
    };
  }

  public getSharedNotes() {
    return this.data.sharedNotes
      .map(share => {
        const note = this.data.notes.find(n => n.id === share.noteId);
        if (!note) return null; // Note was deleted or not found
        const sharer = this.findUserById(share.sharedBy);
        return {
          shareId: share.id,
          noteId: note.id,
          title: note.title,
          summary: note.summary,
          keywords: note.keywords || [],
          flashcardsCount: note.flashcards?.length || 0,
          sharedBy: {
            id: sharer ? sharer.id : share.sharedBy,
            name: sharer ? sharer.name : 'Community Scholar',
            avatar: sharer ? sharer.avatar : '',
          },
          sharedAt: share.sharedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  public getSharedNoteById(noteId: string) {
    const share = this.data.sharedNotes.find(s => s.noteId === noteId);
    if (!share) return null;

    const note = this.data.notes.find(n => n.id === noteId);
    if (!note) return null;

    const sharer = this.findUserById(share.sharedBy);

    return {
      id: note.id,
      shareId: share.id,
      title: note.title,
      content: note.content,
      summary: note.summary,
      keywords: note.keywords || [],
      flashcards: note.flashcards || [],
      sharedBy: {
        id: sharer ? sharer.id : share.sharedBy,
        name: sharer ? sharer.name : 'Community Scholar',
        avatar: sharer ? sharer.avatar : '',
      },
      sharedAt: share.sharedAt,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  public isNoteShared(noteId: string): boolean {
    return this.data.sharedNotes.some(s => s.noteId === noteId);
  }

  public getSharedNoteIds(userId?: string): string[] {
    if (userId) {
      return this.data.sharedNotes.filter(s => s.sharedBy === userId).map(s => s.noteId);
    }
    return this.data.sharedNotes.map(s => s.noteId);
  }

  // Database metadata & user metrics
  public getAllUsers(): Array<Omit<User, 'passwordHash' | 'salt'> & { fileCount: number; noteCount: number }> {
    return this.data.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role || 'student',
      createdAt: u.createdAt,
      fileCount: this.data.files.filter(f => f.userId === u.id).length,
      noteCount: this.data.notes.filter(n => n.userId === u.id).length,
    }));
  }

  public getDatabaseStats() {
    let dbFileSize = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        dbFileSize = fs.statSync(DB_FILE).size;
      }
    } catch {}

    let totalUploadsSize = 0;
    let uploadFilesCount = 0;
    try {
      if (fs.existsSync(UPLOADS_DIR)) {
        const filenames = fs.readdirSync(UPLOADS_DIR);
        uploadFilesCount = filenames.length;
        for (const fname of filenames) {
          try {
            const stat = fs.statSync(path.join(UPLOADS_DIR, fname));
            totalUploadsSize += stat.size;
          } catch {}
        }
      }
    } catch {}

    return {
      dbFilePath: DB_FILE,
      uploadsDirPath: UPLOADS_DIR,
      dbFileSize,
      uploadFilesCount,
      totalUploadsSize,
      totalUsers: this.data.users.length,
      totalFiles: this.data.files.length,
      totalFolders: this.data.folders.length,
      totalNotes: this.data.notes.length,
      totalSharedNotes: this.data.sharedNotes ? this.data.sharedNotes.length : 0,
      totalStudyPlans: this.data.studyPlans.length,
      totalQuizzes: this.data.quizzes.length,
      totalAcademicPapers: this.data.academicPapers.length,
      totalSyncEvents: this.data.events.length,
    };
  }

  public getUserDatabaseSummary(userId: string) {
    const user = this.findUserById(userId) || this.data.users[0] || null;
    const targetId = user ? user.id : userId;
    const files = this.getAllUserFiles(targetId);
    const folders = this.getFolders(targetId);
    const notes = this.getNotes(targetId);
    const studyPlans = this.getStudyPlans(targetId);
    const quizzes = this.getQuizzes(targetId);
    const sharedNotes = this.getSharedNotes();

    const totalStorageBytes = files.reduce((acc, f) => {
      const versions = Array.isArray(f?.versions) ? f.versions : [];
      const versionsSize = versions.reduce((vAcc, v) => vAcc + (Number(v?.size) || 0), 0);
      return acc + (Number(f?.size) || 0) + versionsSize;
    }, 0);

    return {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role || 'student',
            createdAt: user.createdAt,
            hasPasswordHash: Boolean(user.passwordHash),
          }
        : null,
      stats: {
        totalFiles: files.length,
        totalFolders: folders.length,
        totalNotes: notes.length,
        totalSharedNotes: this.data.sharedNotes ? this.data.sharedNotes.length : 0,
        totalStudyPlans: studyPlans.length,
        totalQuizzes: quizzes.length,
        totalStorageBytes,
      },
      files: files.map(f => ({
        id: f.id,
        originalName: f.originalName || 'Untitled',
        storedFilename: f.storedFilename || '',
        folderPath: f.folderPath || '/',
        size: Number(f.size) || 0,
        mimeType: f.mimeType || 'application/octet-stream',
        version: Number(f.version) || 1,
        versionsCount: Array.isArray(f.versions) ? f.versions.length : 0,
        hasTextExtracted: Boolean(f.textContent && f.textContent.trim().length > 0),
        textLength: f.textContent?.length || 0,
        tags: Array.isArray(f.tags) ? f.tags : [],
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      sharedNotes: (this.data.sharedNotes || []).map(s => ({
        id: s.id,
        noteId: s.noteId,
        sharedBy: s.sharedBy,
        sharedAt: s.sharedAt,
      })),
      databaseFile: DB_FILE,
      storageDirectory: UPLOADS_DIR,
    };
  }

  // 🎓 All Student Records Collector for Admin Mode
  public getAllStudentFullRecords() {
    const students = this.data.users.filter(u => (u.role || 'student') === 'student');

    const studentRecords = students.map(student => {
      const files = this.getAllUserFiles(student.id);
      const folders = this.getFolders(student.id);
      const notes = this.getNotes(student.id);
      const studyPlans = this.getStudyPlans(student.id);
      const quizzes = this.getQuizzes(student.id);
      const authoredPapers = (this.data.academicPapers || []).filter(p => p.userId === student.id);
      const sharedNotes = (this.data.sharedNotes || []).filter(s => s.sharedBy === student.id);

      const totalStorageBytes = files.reduce((acc, f) => {
        const versions = Array.isArray(f?.versions) ? f.versions : [];
        const versionsSize = versions.reduce((vAcc, v) => vAcc + (Number(v?.size) || 0), 0);
        return acc + (Number(f?.size) || 0) + versionsSize;
      }, 0);

      // Calculate quiz metrics
      let totalQuizAttempts = 0;
      let highestQuizScore = 0;
      quizzes.forEach(q => {
        if (Array.isArray(q.history)) {
          totalQuizAttempts += q.history.length;
          q.history.forEach(h => {
            const pct = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
            if (pct > highestQuizScore) highestQuizScore = pct;
          });
        }
      });

      // Calculate study plan tasks completion
      let totalPlanTasks = 0;
      let completedPlanTasks = 0;
      studyPlans.forEach(p => {
        if (Array.isArray(p.schedule)) {
          p.schedule.forEach(w => {
            if (Array.isArray(w.tasks)) {
              totalPlanTasks += w.tasks.length;
              completedPlanTasks += w.tasks.filter(t => t.done).length;
            }
          });
        }
      });

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        role: student.role || 'student',
        createdAt: student.createdAt,
        totalStorageBytes,
        counts: {
          files: files.length,
          folders: folders.length,
          notes: notes.length,
          studyPlans: studyPlans.length,
          quizzes: quizzes.length,
          quizAttempts: totalQuizAttempts,
          highestQuizScore,
          planTasksTotal: totalPlanTasks,
          planTasksDone: completedPlanTasks,
          academicPapers: authoredPapers.length,
          sharedNotes: sharedNotes.length,
        },
        files: files.map(f => ({
          id: f.id,
          originalName: f.originalName,
          storedFilename: f.storedFilename,
          folderPath: f.folderPath || '/',
          size: Number(f.size) || 0,
          mimeType: f.mimeType,
          version: Number(f.version) || 1,
          versionsCount: Array.isArray(f.versions) ? f.versions.length : 0,
          hasTextExtracted: Boolean(f.textContent && f.textContent.trim().length > 0),
          textLength: f.textContent?.length || 0,
          tags: f.tags || [],
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        })),
        folders: folders.map(f => ({
          id: f.id,
          name: f.name,
          path: f.path,
          createdAt: f.createdAt,
        })),
        notes: notes.map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          keywords: n.keywords || [],
          flashcardsCount: n.flashcards?.length || 0,
          flashcards: n.flashcards || [],
          isShared: this.isNoteShared(n.id),
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        })),
        studyPlans: studyPlans.map(p => ({
          id: p.id,
          title: p.title,
          goal: p.goal,
          topics: p.topics || [],
          examDate: p.examDate,
          totalWeeks: p.schedule?.length || 0,
          totalTasks: p.schedule?.reduce((acc, w) => acc + (w.tasks?.length || 0), 0) || 0,
          completedTasks: p.schedule?.reduce((acc, w) => acc + (w.tasks?.filter(t => t.done)?.length || 0), 0) || 0,
          schedule: p.schedule || [],
          createdAt: p.createdAt,
        })),
        quizzes: quizzes.map(q => ({
          id: q.id,
          title: q.title,
          sourceDocName: q.sourceDocName,
          questionsCount: q.questions?.length || 0,
          attemptsCount: q.history?.length || 0,
          history: q.history || [],
          questions: q.questions || [],
          createdAt: q.createdAt,
        })),
        academicPapers: authoredPapers.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          upvotes: p.upvotes,
          createdAt: p.createdAt,
        })),
        sharedNotes: sharedNotes.map(s => ({
          id: s.id,
          noteId: s.noteId,
          sharedAt: s.sharedAt,
        })),
        featureAccess: {
          dashboard: true,
          files: true,
          assistant: true,
          tutor: true,
          quiz: true,
          resume: true,
          skills: true,
          planner: true,
          interview: true,
          academicExchange: true,
          notes: true,
          multilingual: true,
          all10Active: true,
        },
      };
    });

    const aggregate = {
      totalStudents: studentRecords.length,
      totalStudentFiles: studentRecords.reduce((acc, s) => acc + s.counts.files, 0),
      totalStudentStorageBytes: studentRecords.reduce((acc, s) => acc + s.totalStorageBytes, 0),
      totalStudentNotes: studentRecords.reduce((acc, s) => acc + s.counts.notes, 0),
      totalStudentStudyPlans: studentRecords.reduce((acc, s) => acc + s.counts.studyPlans, 0),
      totalStudentQuizzes: studentRecords.reduce((acc, s) => acc + s.counts.quizzes, 0),
      totalStudentSharedContributions: studentRecords.reduce((acc, s) => acc + s.counts.academicPapers + s.counts.sharedNotes, 0),
      allStudents10FeaturesActive: true,
    };

    return {
      students: studentRecords,
      aggregate,
    };
  }
}

export const db = new Database();
