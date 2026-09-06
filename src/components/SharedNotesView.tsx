import React, { useState, useEffect } from 'react';
import { SharedNoteSummary, SharedNoteDetail } from '../types.ts';
import { useSync } from '../context/SyncContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  BookOpen,
  Share2,
  Search,
  User,
  Calendar,
  Layers,
  X,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Trash2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SharedNotesViewProps {
  onOpenNoteInEditor?: (note: { title: string; content: string; summary: string; flashcards: any[] }) => void;
}

export const SharedNotesView: React.FC<SharedNotesViewProps> = ({ onOpenNoteInEditor }) => {
  const { refreshTrigger } = useSync();
  const { user } = useAuth();

  const [sharedNotes, setSharedNotes] = useState<SharedNoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<SharedNoteDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [unsharingId, setUnsharingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Flashcards state inside modal
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSharedNotes();
  }, [refreshTrigger]);

  const fetchSharedNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shared-notes');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.sharedNotes || []);
        setSharedNotes(list);
      }
    } catch (err) {
      console.error('Failed to load shared notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNote = async (noteId: string) => {
    setLoadingDetail(true);
    setDetailError(null);
    setSelectedNote(null);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setCopied(false);

    try {
      const res = await fetch(`/api/shared-notes/${noteId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load shared note content');
      }
      const data: SharedNoteDetail = await res.json();
      setSelectedNote(data);
    } catch (err: any) {
      setDetailError(err.message || 'Unable to open note');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUnshare = async (noteId: string, noteTitle: string) => {
    if (!window.confirm(`Are you sure you want to unshare "${noteTitle}" from the community?`)) {
      return;
    }

    setUnsharingId(noteId);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unshare note');
      }

      setFeedbackMsg({ type: 'success', text: `"${noteTitle}" has been unshared from the community.` });
      // If the currently open modal is this note, close it
      if (selectedNote && selectedNote.noteId === noteId) {
        setSelectedNote(null);
      }
      fetchSharedNotes();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to unshare note' });
    } finally {
      setUnsharingId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleCopyNote = () => {
    if (!selectedNote) return;
    const textToCopy = `# ${selectedNote.title}
Shared by: ${selectedNote.sharedBy.name} (${new Date(selectedNote.sharedAt).toLocaleDateString()})

## Executive Summary
${selectedNote.summary || ''}

## Content / Takeaways
${selectedNote.content || ''}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = sharedNotes.filter((note) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      note.title?.toLowerCase().includes(q) ||
      note.sharedBy?.name?.toLowerCase().includes(q) ||
      note.summary?.toLowerCase().includes(q) ||
      (note.keywords || []).some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-indigo-950/60 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/20">
              <Share2 className="w-3.5 h-3.5" />
              <span>Community Knowledge Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>📚 Shared Notes</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Study guides, AI-generated summaries, and revision decks shared by fellow students and scholars.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <div className="text-xl font-bold text-white">{sharedNotes.length}</div>
              <div className="text-[10px] uppercase font-semibold text-indigo-200 tracking-wider">Shared Notes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shared notes by title, topic, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium px-2 self-center shrink-0">
          Showing {filteredNotes.length} of {sharedNotes.length} notes
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading community shared notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'No matching shared notes' : 'No notes shared yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery
              ? 'Try modifying your search keywords to find other topics or authors.'
              : 'Be the first to share! Head over to "Notes & Resources", open any of your saved notes, and click "Share Note".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isOwner = user?.id === note.sharedBy?.id;
            return (
              <div
                key={note.shareId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col p-5 group"
              >
                {/* Header with Title and Owner Tag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  {isOwner && (
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                      Your Note
                    </span>
                  )}
                </div>

                {/* Author & Timestamp */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
                  {note.sharedBy?.avatar ? (
                    <img
                      src={note.sharedBy.avatar}
                      alt={note.sharedBy.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                      {note.sharedBy?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-slate-700 truncate">
                    Shared by {note.sharedBy?.name || 'Community Scholar'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 shrink-0 text-[11px]">
                    {new Date(note.sharedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary Excerpt */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-1">
                  {note.summary || 'No summary preview available.'}
                </p>

                {/* Keywords Chips */}
                {note.keywords && note.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.keywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                      >
                        {kw}
                      </span>
                    ))}
                    {note.keywords.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{note.keywords.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{note.flashcardsCount} Flashcards</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        onClick={() => handleUnshare(note.noteId, note.title)}
                        disabled={unsharingId === note.noteId}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1"
                        title="Unshare from community"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Unshare</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenNote(note.noteId)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Note</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Detail Modal */}
      {(selectedNote || loadingDetail || detailError) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
              {selectedNote ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Community Shared Note
                    </span>
                    <span className="text-xs text-slate-400">
                      Shared on {new Date(selectedNote.sharedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedNote.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <span>By <strong>{selectedNote.sharedBy.name}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="text-base font-bold text-slate-800">
                  {detailError ? 'Error Loading Note' : 'Opening Note...'}
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedNote(null);
                  setDetailError(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail ? (
                <div className="py-16 text-center">
                  <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Fetching complete note details...</p>
                </div>
              ) : detailError ? (
                <div className="p-6 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm">
                  <p className="font-semibold">Unable to view note</p>
                  <p className="text-xs mt-1 text-rose-600">{detailError}</p>
                </div>
              ) : selectedNote ? (
                <>
                  {/* Executive Summary */}
                  {selectedNote.summary && (
                    <div className="bg-indigo-50/70 p-5 rounded-xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Executive Summary</span>
                        </h4>
                        <button
                          onClick={handleCopyNote}
                          className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                        {selectedNote.summary}
                      </p>
                    </div>
                  )}

                  {/* Complete Note Content */}
                  {selectedNote.content && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Detailed Note Content
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedNote.content}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {selectedNote.keywords && selectedNote.keywords.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Topic Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flashcards Deck */}
                  {selectedNote.flashcards && selectedNote.flashcards.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Study Flashcards Deck ({activeCardIndex + 1} of {selectedNote.flashcards.length})</span>
                        </h4>
                      </div>

                      <div
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className="w-full min-h-[160px] p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50/50 to-white cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none shadow-xs group"
                      >
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 mb-2">
                          {isCardFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">
                          {isCardFlipped
                            ? selectedNote.flashcards[activeCardIndex].back
                            : selectedNote.flashcards[activeCardIndex].front}
                        </p>
                      </div>

                      {/* Flashcard Navigation */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            setActiveCardIndex(Math.max(0, activeCardIndex - 1));
                            setIsCardFlipped(false);
                          }}
                          disabled={activeCardIndex === 0}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>

                        <div className="flex gap-1">
                          {selectedNote.flashcards.map((_, idx) => (
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
                            setActiveCardIndex(Math.min(selectedNote.flashcards.length - 1, activeCardIndex + 1));
                            setIsCardFlipped(false);
                          }}
                          disabled={activeCardIndex === selectedNote.flashcards.length - 1}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            {selectedNote && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                {user?.id === selectedNote.sharedBy.id ? (
                  <button
                    onClick={() => handleUnshare(selectedNote.noteId, selectedNote.title)}
                    disabled={unsharingId === selectedNote.noteId}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100/70 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Unshare Note</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-400">
                    Shared by {selectedNote.sharedBy.name}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {onOpenNoteInEditor && (
                    <button
                      onClick={() => {
                        onOpenNoteInEditor({
                          title: selectedNote.title,
                          content: selectedNote.content,
                          summary: selectedNote.summary,
                          flashcards: selectedNote.flashcards,
                        });
                        setSelectedNote(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in AI Notes</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
