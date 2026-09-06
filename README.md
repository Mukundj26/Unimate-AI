# 🎓 Unimate-Ai: Academic & Career Intelligence Hub

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2.svg?logo=google)](https://deepmind.google/technologies/gemini/)
[![Languages](https://img.shields.io/badge/Languages-English_%7C_मराठी_%7C_हिन्दी-success.svg)](#multilingual-voice-engine)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Unimate-Ai** is an all-in-one, full-stack Academic & Career Intelligence platform powered by **Google Gemini 2.5 Flash**, **Retrieval-Augmented Generation (RAG)**, and **Multi-Modal NLP**. Designed for students, researchers, university faculty, and ambitious professionals, Unimate-Ai combines intelligent document management with cutting-edge AI tutoring, ATS resume evaluation, live voice-enabled mock interviews, study planning, paper classification, and comprehensive trilingual support (**English**, **Marathi / मराठी**, and **Hindi / हिन्दी**).

---

## 📑 Table of Contents

- [Core Capabilities & Modules](#-core-capabilities--modules)
- [System Architecture](#-system-architecture)
  - [High-Level Architectural Diagram](#high-level-architectural-diagram)
  - [Data Flow: RAG Query Processing](#data-flow-rag-query-processing)
  - [Data Flow: Live Speech Interview Coaching](#data-flow-live-speech-interview-coaching)
- [Repository & File Structure](#-repository--file-structure)
- [REST API Reference](#-rest-api-reference)
- [Persistent Storage & Data Models](#-persistent-storage--data-models)
- [Multilingual & Voice Engine](#-multilingual--voice-engine)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation & Running](#installation--running)
  - [Production Build](#production-build)
- [Security & Engineering Highlights](#-security--engineering-highlights)
- [License](#-license)

---

## 🚀 Core Capabilities & Modules

Unimate-Ai delivers 11 tightly integrated modules designed around natural language processing, semantic indexing, and cognitive learning workflows:

### 1. 🗄️ Document Storage & Version Control
- **Format Ingestion**: Uploads and processes PDF research papers, course slides, plain-text lecture notes, and markdown documentation.
- **Deep Text Extraction**: Utilizes server-side `pdf-parse` for lossless text indexing and semantic tokenization.
- **Document Versioning**: Track iterative document revisions (`v1`, `v2`, `v3...`) with custom changelog notes, rollback capabilities, and atomic uploads via Multer.
- **Organized Directory Hierarchy**: Nested folder organization, full-text search, and automated keyword tag generation.

### 2. 🤖 RAG Academic Assistant (Retrieval-Augmented Generation)
- **Verifiable Grounding**: Queries multiple uploaded course documents with citation tracking, source attribution, and zero-hallucination guardrails.
- **Context Injection**: Intelligently selects, chunks, and injects relevant document segments into Gemini 2.5 context windows.
- **Multi-Turn Dialogue**: Maintains conversation context for deep follow-ups, theoretical debate, and code debugging.

### 3. 👨‍🏫 Personalized AI Tutor
- **Adaptive Difficulty Levels**: Seamlessly switches pedagogical depth across **Beginner**, **Intermediate**, and **Advanced** stages.
- **Cognitive Explanation Styles**:
  - *Analogy-rich*: Connects abstract paradigms to intuitive real-world concepts.
  - *Formal Proof*: Mathematical rigor with theorem-lemma derivations.
  - *Step-by-Step Code*: Functional code implementations with syntax breakdowns.
  - *Socratic Dialogue*: Guided inquiry that prompts users to reach correct conclusions.
- **Student Profile Adaptation**: Personalizes explanations based on individual user background and prerequisites.

### 4. 📝 Interactive Quiz & Assessment Engine
- **Automated Generation**: Produces challenging 4-option multiple-choice questions directly from user-selected documents or open topics.
- **Custom Question Count**: Flexible question selection with manual input (1 to 25 questions), stepper controls, range slider, and quick presets (`3`, `5`, `8`, `10`, `15`, `20` Qs).
- **Cognitive Grading**: Detailed answer rationales, concept mastery scoring, and question review.
- **Performance History**: Tracks historic scores and allows retries for spaced repetition and test preparation.

### 5. 📄 ATS Resume & CV Intelligence
- **Information Extraction & NER**: Extracts skills, technologies, education, certifications, and work experience from uploaded resumes.
- **Role Alignment Scoring**: Computes an ATS match index against target job titles (e.g., *AI/ML Engineer*, *Full Stack Developer*, *Data Scientist*).
- **Targeted Feedback**: Pinpoints missing domain keywords, strengths, formatting optimizations, and bullet-point suggestions.

### 6. 📈 Career Taxonomy & Skill Gap Analyzer
- **Semantic Distance Matching**: Evaluates current technical skills against current industry benchmarks and job role requirements.
- **Structured Skill Categories**: Classifies competencies into *Core / In-Demand*, *Identified Gaps*, and *Emerging Super-Skills*.
- **Personalized Roadmap**: Step-by-step milestone timeline with weekly objectives to close competency gaps.

### 7. 📅 Intelligent Study Planner & Schedule Synthesizer
- **Curriculum Decomposition**: Analyzes syllabi, textbook chapter lists, or exam topics.
- **Workload Balancing**: Automatically formats realistic weekly study blocks based on hours per day, days per week, and target exam deadlines.
- **Interactive Checklists**: Real-time completion checkboxes with progress bar computation.

### 8. 🎙️ AI Interview Coach with Voice STT
- **Speech-to-Text Voice Engine**: Uses the browser's native **Web Speech API** with dynamic language locale switching (`en-US`, `mr-IN`, `hi-IN`).
- **STAR Method Evaluation**: Evaluates answers based on Situation, Task, Action, and Result methodology.
- **NLP Articulation Metrics**: Quantitative grading for technical accuracy, clarity, relevance, confidence, and filler word detection.

### 9. 🤝 Academic Exchange & Research Classifier
- **Discipline Taxonomy**: Automatically classifies papers and articles into domains (e.g., *Computer Science / ML*, *Biomedical Engineering*, *Computational Linguistics*).
- **Executive Abstract Generation**: Generates structured summaries with problem statements, methodology, and key results.
- **Community Collaboration**: Peer paper sharing, semantic research tagging, and voting mechanics.

### 10. 📚 Smart Notes, Summarizer & Flashcards
- **Executive Summaries**: Synthesizes dense lecture slides and papers into structured executive summaries.
- **Key Takeaway Highlights**: Extracts the highest-impact principles and taxonomy keywords.
- **Two-Sided Flashcards**: Automatically generates active-recall flashcard decks with an interactive flip study interface.

### 11. 🌐 Multilingual Studio & Voice Processing
- **Universal Trilingual Support**: First-class support for **English**, **Marathi (मराठी)**, and **Hindi (हिन्दी)**.
- **Phonetic & Romanized Transliteration**: Generates accurate pronunciations alongside formal and conversational translations.
- **Audio Playback**: Speech synthesis synthesis via Web Speech API with regional accent presets.
- **Global Context Injection**: Prompts across all AI tools can be steered to produce outputs in the user's preferred language.

---

## 🏗️ System Architecture

### High-Level Architectural Diagram

```text
+-------------------------------------------------------------------------------+
|                                 CLIENT TIER                                   |
|  React 19 + TypeScript + Tailwind CSS v4 + Motion Animations + Lucide Icons   |
|                                                                               |
|  +-------------------+  +--------------------+  +--------------------------+  |
|  |    AuthContext    |  |    SyncContext     |  |     LanguageContext      |  |
|  |  (User & Session) |  | (Real-time Polling)|  | (EN / Marathi / Hindi)   |  |
|  +-------------------+  +--------------------+  +--------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | 11 Modular Feature Views: Storage, Assistant, Tutor, Quiz, Resume,      |  |
|  | Skill Gap, Planner, Interview, Academic Exchange, Notes, Multilingual   |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                      │
                         REST JSON & Multipart Uploads
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                             SERVER TIER (Express 4.21)                        |
|                                                                               |
|  Port 3000 | Host 0.0.0.0 | tsx (Dev Server) / esbuild Bundled .cjs (Prod)    |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | Routes:                                                                 |  |
|  |  • /api/auth    -> Password Hashing (Salt + SHA-256), Session Validation|  |
|  |  • /api/files   -> Multer Multi-part Uploads, Versioning, Search        |  |
|  |  • /api/ai      -> Centralized Gemini Prompt Engineering & NLP Pipeline |  |
|  |  • /api/sync    -> Event Polling & Cross-Tab Synchronization            |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +--------------------------+          +-----------------------------------+  |
|  |        pdf-parse         |          |          @google/genai            |  |
|  | (Raw Text Ingestion/RAG) |          |       (Gemini 2.5 Flash)          |  |
|  +--------------------------+          +-----------------------------------+  |
+-------------------------------------------------------------------------------+
                        │                                    │
               Local Disk Operations             Google GenAI Cloud API
                        │                                    │
                        ▼                                    ▼
+-----------------------------------------------+   +---------------------------+
|               PERSISTENCE TIER                |   |        AI SERVICES        |
|  • File-backed relational JSON: `data/db.json`|   |  • Gemini 2.5 Flash       |
|  • Uploads filesystem: `data/uploads/`        |   |  • JSON Schema Validation |
|  • Atomic file locking & safety mechanisms    |   |  • System Persona Guards  |
+-----------------------------------------------+   +---------------------------+
```

---

### Data Flow: RAG Query Processing

```text
User Question + Target Document IDs
               │
               ▼
   [Express POST /api/ai/assistant]
               │
               ▼
   [Fetch Document textContent from db.json]
               │
               ▼
   [Context Window Optimizer & Citation Formatter]
               │
               ▼
   [Inject Language Directives (English / Marathi / Hindi)]
               │
               ▼
   [Google GenAI SDK -> Gemini 2.5 Flash API]
               │
               ▼
   [Parse JSON Response: { answer, citations, suggestedFollowUps }]
               │
               ▼
   [Deliver Structured Payload to React UI]
```

---

### Data Flow: Live Speech Interview Coaching

```text
User Microphones -> Web Speech API (mr-IN / hi-IN / en-US)
                         │
                         ▼
             Live Streaming Transcript
                         │
                         ▼
         [POST /api/ai/interview/evaluate]
                         │
                         ▼
        [Analyze Candidate Response with Gemini]
        - STAR Methodology breakdown
        - NLP Articulation & Confidence metrics
        - Actionable Strengths & Improvement Vectors
                         │
                         ▼
       [Render Radar Metrics, Scorecards, & Model Answers]
```

---

## 📂 Repository & File Structure

```text
.
├── .env.example                # Blueprint for required environment variables
├── .gitignore                  # Git hygiene rules
├── index.html                  # HTML entry point with synchronized metadata & Google Fonts
├── metadata.json               # App metadata, major capabilities, & microphone permissions
├── package.json                # Dependencies, scripts, and build pipeline definitions
├── server.ts                   # Express server entry point & Vite middleware integration
├── tsconfig.json               # TypeScript compiler rules & path resolutions
├── vite.config.ts              # Vite bundling, React plugin, & Tailwind v4 plugin
├── data/                       # Local persistent storage (Auto-initialized on boot)
│   ├── db.json                 # Relational JSON database storing users, files, notes, etc.
│   └── uploads/                # Binary storage for uploaded documents and version revisions
├── server/                     # Backend TypeScript implementation
│   ├── db.ts                   # Database engine, data interfaces, crypto hashing, CRUD models
│   ├── gemini.ts               # Core Gemini 2.5 Flash prompt engineering & NLP executors
│   └── routes/
│       ├── ai.ts               # AI endpoints (Tutor, Quiz, Resume, Interview, Assistant, etc.)
│       ├── auth.ts             # User authentication, registration, profiles
│       ├── files.ts            # File uploads, versioning, folder hierarchies, search
│       └── sync.ts             # Event audit trail & polling synchronization
└── src/                        # Modern React 19 Frontend
    ├── App.tsx                 # Root application container & tab router
    ├── index.css               # Tailwind CSS entry point
    ├── main.tsx                # React DOM mount point
    ├── types.ts                # Shared TypeScript definitions, interfaces, and enums
    ├── context/
    │   ├── AuthContext.tsx     # Authentication state & user session provider
    │   ├── LanguageContext.tsx # Trilingual state management (EN / MR / HI) & translations
    │   └── SyncContext.tsx     # Synchronization provider with polling fallback
    └── components/
        ├── AcademicView.tsx    # Research paper repository & classification
        ├── AssistantView.tsx   # RAG assistant with document context selection
        ├── AuthModal.tsx       # Modal for sign-in and user registration
        ├── DashboardView.tsx   # Overview dashboard with analytics & quick actions
        ├── Header.tsx          # Top navigation, global language switcher, DB inspector
        ├── InterviewView.tsx   # Speech-to-text interview coach & STAR scoring
        ├── LanguageSelector.tsx# Reusable language switchers (Compact & Banner variants)
        ├── MultilingualView.tsx# Translation studio, audio synthesis, phrasebook
        ├── Navigation.tsx      # Mobile/tablet bottom & responsive tab bar
        ├── NotesView.tsx       # Summaries, key takeaways, & flip-card decks
        ├── PlannerView.tsx     # Curriculum decomposition & weekly study calendar
        ├── QuizView.tsx        # Multi-choice quiz generator & interactive testing
        ├── ResumeView.tsx      # ATS resume parser, entity extractor, & job matcher
        ├── Sidebar.tsx         # Collapsible desktop navigation & user status
        ├── SkillGapView.tsx    # Career taxonomy & gap milestone planner
        ├── StorageView.tsx     # Storage explorer, version manager, & file previewer
        └── TutorView.tsx       # AI Tutor with custom cognitive learning styles
```

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api` and return standardized JSON responses.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user with name, email, and password. |
| `POST` | `/api/auth/login` | Authenticate user credentials and return profile data. |
| `GET` | `/api/auth/me` | Fetch active user profile from request headers. |
| `GET` | `/api/auth/users` | List registered accounts (Used by Database Inspector). |

### 📁 Document Management & Versioning (`/api/files`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files` | List all files for the authenticated user. |
| `POST` | `/api/files/upload` | Upload new document with text extraction via `pdf-parse`. |
| `POST` | `/api/files/:id/version` | Upload and attach a new revision (`v2`, `v3`) to an existing file. |
| `GET` | `/api/files/:id/download` | Stream and download file binary. |
| `DELETE` | `/api/files/:id` | Delete a file and its complete version history. |
| `POST` | `/api/files/folders` | Create a directory path for organizing documents. |

### 🧠 Gemini AI Services (`/api/ai`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/assistant` | RAG query answering grounded in selected document IDs. |
| `POST` | `/api/ai/tutor` | Adaptive tutoring with cognitive styles and levels. |
| `POST` | `/api/ai/quiz/generate`| Generate multiple-choice quizzes from source documents or topics. |
| `POST` | `/api/ai/resume` | Analyze ATS score, missing keywords, and job role alignment. |
| `POST` | `/api/ai/skills` | Calculate technical skill gaps against industry career roles. |
| `POST` | `/api/ai/planner` | Synthesize a multi-week study schedule from a syllabus. |
| `POST` | `/api/ai/interview` | Evaluate mock interview responses using STAR methodology. |
| `POST` | `/api/ai/academic/classify` | Classify research papers into academic disciplines. |
| `POST` | `/api/ai/notes/summarize` | Generate executive summaries, key takeaways, and flashcards. |
| `POST` | `/api/ai/translate` | Translate text with pronunciation guides into Marathi, Hindi, or English. |

### 🔄 State Synchronization (`/api/sync`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sync/events` | Poll real-time system events (file uploads, notes, study updates). |
| `GET` | `/api/sync/stats` | Retrieve aggregate database metrics and storage statistics. |

---

## 💾 Persistent Storage & Data Models

Unimate-Ai features a resilient, file-backed database engine (`server/db.ts`) that guarantees data durability without external infrastructure requirements:

- **Relational Integrity**: Maintains distinct collections for `users`, `files`, `folders`, `studyPlans`, `quizzes`, `notes`, `academicPapers`, and `events`.
- **Cryptographic Security**: Passwords are saved with a unique per-user cryptographic salt and hashed using `crypto.pbkdf2` / SHA-256.
- **File Revisions Model**: Files contain a `versions` array preserving timestamp, byte size, changelog notes, and individual stored file pointers.
- **Atomic Operations**: State changes are written synchronously to `data/db.json` with fallback recovery in case of system reboots.

---

## 🌐 Multilingual & Voice Engine

Unimate-Ai provides native support for three primary languages:

```text
┌─────────────────────────────────────────────────────────────┐
│  Available Languages:                                       │
│   1. English           (en-US) - Global Academic & Industry │
│   2. Marathi / मराठी    (mr-IN) - Regional State Curriculum  │
│   3. Hindi / हिन्दी     (hi-IN) - National Standard          │
└─────────────────────────────────────────────────────────────┘
```

1. **Global UI Switching**: Users can toggle between languages via the header dropdown or the quick banner present on every tool.
2. **Dynamic Prompt Steering**: The active language is passed in every AI request, instructing Gemini to generate explanations, quizzes, and reviews directly in the chosen language.
3. **Voice STT Localization**: The Web Speech API dynamically updates its recognition language (`recognition.lang`), enabling voice input for mock interview responses in Marathi, Hindi, or English.
4. **Speech Synthesis**: The translation studio integrates text-to-speech with local phonetic guidance.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm** or **bun** package manager
- A valid **Google Gemini API Key** (obtainable from [Google AI Studio](https://aistudio.google.com/))

### Environment Setup

1. Clone this repository to your local workspace:
   ```bash
   git clone https://github.com/your-username/unimate-ai.git
   cd unimate-ai
   ```

2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and configure your credentials:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

### Installation & Running

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the full-stack development environment:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

### Production Build

To build the optimized client bundle and compile the standalone server:

```bash
# Compile client to /dist and server to /dist/server.cjs
npm run build

# Start the compiled production server
npm start
```

---

## 🔒 Security & Engineering Highlights

- **Server-Side API Key Isolation**: The Gemini API key is accessed strictly through server-side endpoints (`server/gemini.ts`), keeping credentials completely hidden from client browsers.
- **Strict Single-Port Routing**: Both the REST API and the Vite development middleware run unified on port `3000`, complying with containerized cloud environments.
- **Defensive Error Handling**: All Gemini API calls use structured JSON schemas, fallbacks, and parameter sanity checks to prevent runtime crashes.
- **Full Offline Persistence**: File uploads, version histories, and generated outputs persist safely on disk in `data/`, surviving dev server restarts.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for academic, personal, or commercial purposes.
