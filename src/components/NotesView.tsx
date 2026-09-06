import React, { useState, useEffect } from 'react';
import { FileItem, NoteItem } from '../types.ts';
import { useSync } from '../context/SyncContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { SharedNotesView } from './SharedNotesView.tsx';
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  Save,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  FileText,
  Copy,
  Check,
  Eye,
  EyeOff,
  Share2,
  Users,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

interface NotesViewProps {
  files: FileItem[];
  preselectedFileId?: string;
  initialTab?: 'my_notes' | 'shared_notes';
}

export const NotesView: React.FC<NotesViewProps> = ({ files, preselectedFileId, initialTab = 'my_notes' }) => {
  const { refreshTrigger } = useSync();
  const { language, t } = useLanguage();
  const [activeNotesTab, setActiveNotesTab] = useState<'my_notes' | 'shared_notes'>(initialTab);
  const [sourceType, setSourceType] = useState<'file' | 'text'>(preselectedFileId ? 'file' : 'text');
  const [selectedFileId, setSelectedFileId] = useState(preselectedFileId || files[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('Foundational Neural Attention & Vector Indexing');
  const [noteText, setNoteText] = useState(
    `Self-attention allows tokens to dynamically attend to one another regardless of their linear distance in a sequence. The key innovation is computing queries (Q), keys (K), and values (V) via linear projections. The dot product of Q and K divided by the square root of the head dimension prevents softmax saturation when dimension d_k is large. In vector search, Hierarchical Navigable Small World (HNSW) graphs and Inverted File with Product Quantization (IVF-PQ) index dense embeddings efficiently for sub-linear similarity search.`
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active generated note
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved notes library & sharing state
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [sharedNoteIds, setSharedNoteIds] = useState<Set<string>>(new Set());
  const [sharingNoteId, setSharingNoteId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if ((!selectedFileId || !files.some(f => f.id === selectedFileId)) && files.length > 0) {
      setSelectedFileId(preselectedFileId || files[0].id);
    }
  }, [files, preselectedFileId, selectedFileId]);

  useEffect(() => {
    fetchNotes();
    fetchSharedStatus();
  }, [refreshTrigger]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/ai/notes');
      if (res.ok) {
        const data = await res.json();
        setSavedNotes(data.notes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSharedStatus = async () => {
    try {
      const res = await fetch('/api/notes/shared-status');
      if (res.ok) {
        const data = await res.json();
        setSharedNoteIds(new Set(data.userSharedIds || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareNote = async (noteId: string, title: string) => {
    setSharingNoteId(noteId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to share note');
      }

      setSharedNoteIds(prev => new Set([...prev, noteId]));
      setShareFeedback({
        type: 'success',
        text: `"${title}" is now shared to the Community Shared Notes section!`,
      });
      fetchSharedStatus();
      setTimeout(() => setShareFeedback(null), 4000);
    } catch (err: any) {
      setShareFeedback({
        type: 'error',
        text: err.message || 'Unable to share note.',
      });
      setTimeout(() => setShareFeedback(null), 4000);
    } finally {
      setSharingNoteId(null);
    }
  };

  const handleUnshareNote = async (noteId: string, title: string) => {
    setSharingNoteId(noteId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unshare note');
      }

      setSharedNoteIds(prev => {
        const updated = new Set(prev);
        updated.delete(noteId);
        return updated;
      });
      setShareFeedback({
        type: 'success',
        text: `"${title}" has been unshared and is now private.`,
      });
      fetchSharedStatus();
      setTimeout(() => setShareFeedback(null), 4000);
    } catch (err: any) {
      setShareFeedback({
        type: 'error',
        text: err.message || 'Unable to unshare note.',
      });
      setTimeout(() => setShareFeedback(null), 4000);
    } finally {
      setSharingNoteId(null);
    }
  };

  const handleSummarize = async () => {
    setErrorMsg(null);
    setLoading(true);
    setIsCardFlipped(false);
    setActiveCardIndex(0);
    setSaveSuccess(false);

    const activeFileId = sourceType === 'file' ? (selectedFileId || files[0]?.id) : undefined;
    const activeText = sourceType === 'text' ? noteText.trim() : undefined;

    if (sourceType === 'text' && !activeText) {
      setErrorMsg('Please enter or paste note content to summarize.');
      setLoading(false);
      return;
    }

    if (sourceType === 'file' && !activeFileId) {
      setErrorMsg('Please select an uploaded document to summarize.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ai/notes/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle || (selectedFile?.originalName ? selectedFile.originalName : 'Study Document'),
          content: activeText,
          rawText: activeText,
          fileId: activeFileId,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Summarization request failed');
      }

      setSummary(data.summary || '');
      setKeyPoints(data.keyPoints || []);
      setKeywords(data.keywords || []);
      setFlashcards(data.flashcards || []);
      if (data.title && sourceType === 'file') {
        setNoteTitle(data.title);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Summarization error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    const textToCopy = `${noteTitle}\n\nEXECUTIVE SUMMARY:\n${summary}\n\nKEY TAKEAWAYS:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = async () => {
    try {
      const res = await fetch('/api/ai/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: sourceType === 'text' ? noteText : (selectedFile?.originalName || 'Uploaded File'),
          summary,
          keyPoints,
          keywords,
          flashcards,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchNotes();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const loadSavedNote = (item: any) => {
    setNoteTitle(item.title);
    setNoteText(item.content);
    setSummary(item.summary);
    setKeyPoints(item.keyPoints || []);
    setKeywords(item.keywords || []);
    setFlashcards(item.flashcards || []);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Notes & Resources Summarizer" />

      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>SUMMARIZATION & TOPIC EXTRACTION</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">COMMUNITY SHARING & COLLABORATION</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Smart Notes & Shared Knowledge Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Distill dense research articles and lecture notes into executive summaries and flashcards, and share your notes with fellow students across the platform.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-center shrink-0">
          <button
            onClick={() => setActiveNotesTab('my_notes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeNotesTab === 'my_notes'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Notes & AI</span>
          </button>
          <button
            onClick={() => setActiveNotesTab('shared_notes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeNotesTab === 'shared_notes'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>📚 Shared Notes</span>
          </button>
        </div>
      </div>

      {/* Global Share Feedback Toast */}
      {shareFeedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border animate-in fade-in ${
            shareFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {shareFeedback.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{shareFeedback.text}</span>
          </div>
          <button
            onClick={() => setShareFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render Active Tab */}
      {activeNotesTab === 'shared_notes' ? (
        <SharedNotesView
          onOpenNoteInEditor={(note) => {
            loadSavedNote(note);
            setActiveNotesTab('my_notes');
          }}
        />
      ) : (
        <>
          {errorMsg && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-bold text-amber-700 hover:text-amber-900 ml-3">✕</button>
            </div>
          )}

      {/* Input scratchpad card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Note or Topic Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Machine Learning Systems or Seminar Topics"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Input Source</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType('text')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'text'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Scratchpad Text
              </button>
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  sourceType === 'file'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Uploaded Document ({files.length})
              </button>
            </div>
          </div>
        </div>

        {sourceType === 'text' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Text Content to Summarize</label>
            <textarea
              rows={5}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Paste reading material, research excerpt, or lecture notes..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Select Uploaded File</label>
              {selectedFile?.textContent && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPreview ? 'Hide Text Preview' : 'Preview Extracted Text'}</span>
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No files uploaded yet. Upload PDFs or notes in the File Explorer tab or use Scratchpad Text above.
              </div>
            ) : (
              <select
                value={selectedFileId}
                onChange={(e) => {
                  setSelectedFileId(e.target.value);
                  const f = files.find(item => item.id === e.target.value);
                  if (f) setNoteTitle(f.originalName);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.originalName} ({f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`})
                  </option>
                ))}
              </select>
            )}

            {selectedFile && showPreview && selectedFile.textContent && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Extracted Document Text ({selectedFile.textContent.length} characters)
                </span>
                <p className="text-xs text-slate-600 font-mono line-clamp-6 leading-relaxed whitespace-pre-wrap">
                  {selectedFile.textContent}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSummarize}
            disabled={loading || (sourceType === 'text' && !noteText.trim()) || (sourceType === 'file' && files.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Summary & Flashcards...' : 'Summarize & Extract'}</span>
          </button>
        </div>
      </div>

      {/* Summary & Flashcards section */}
      {(summary || flashcards.length > 0) && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Executive Summary</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? 'Saved to Library!' : 'Save to Notes'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {summary}
            </div>

            {/* Structured Key Takeaways */}
            {keyPoints && keyPoints.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Takeaways & Core Findings</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Taxonomy Tags:</span>
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-700 text-[11px] font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Spaced Repetition Flashcards */}
          {flashcards.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Active Recall Flashcards</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Card {activeCardIndex + 1} of {flashcards.length}
                </span>
              </div>

              {/* Flashcard container with flip animation */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className={`min-h-[220px] rounded-2xl border-2 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${
                  isCardFlipped
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : 'border-indigo-200 bg-indigo-50/30 text-indigo-950 hover:border-indigo-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400">
                  {isCardFlipped ? 'Answer (Click to flip back)' : 'Question (Click to flip)'}
                </span>
                <p className="text-sm font-semibold max-w-lg leading-relaxed">
                  {isCardFlipped
                    ? flashcards[activeCardIndex].back
                    : flashcards[activeCardIndex].front}
                </p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-4">
                  <RotateCw className="w-3 h-3" />
                  <span>Click anywhere to toggle flip</span>
                </span>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setActiveCardIndex(Math.max(0, activeCardIndex - 1));
                    setIsCardFlipped(false);
                  }}
                  disabled={activeCardIndex === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex gap-1">
                  {flashcards.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === activeCardIndex ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveCardIndex(Math.min(flashcards.length - 1, activeCardIndex + 1));
                    setIsCardFlipped(false);
                  }}
                  disabled={activeCardIndex === flashcards.length - 1}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Notes List */}
      {savedNotes.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Note Repository ({savedNotes.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              {sharedNoteIds.size} shared to community
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedNotes.map((note) => {
              const isShared = sharedNoteIds.has(note.id);
              const isSharingThis = sharingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isShared
                      ? 'bg-indigo-50/30 border-indigo-200/80 hover:border-indigo-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{note.title}</h4>
                      {isShared && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Shared ✓</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{note.summary}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {note.flashcards?.length || 0} Flashcards • {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                    <div className="flex items-center gap-1.5">
                      {isShared ? (
                        <button
                          onClick={() => handleUnshareNote(note.id, note.title)}
                          disabled={isSharingThis}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1"
                          title="Unshare from community"
                        >
                          <X className="w-3 h-3" />
                          <span>{isSharingThis ? 'Unsharing...' : 'Unshare'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleShareNote(note.id, note.title)}
                          disabled={isSharingThis}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Share to community"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{isSharingThis ? 'Sharing...' : 'Share'}</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => loadSavedNote(note)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 shrink-0 shadow-2xs"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
