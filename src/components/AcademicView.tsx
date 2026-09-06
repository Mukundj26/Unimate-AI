import React, { useState, useEffect } from 'react';
import { AcademicPaper } from '../types.ts';
import { useSync } from '../context/SyncContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { Share2, Sparkles, ThumbsUp, Search, Plus, Filter, BookOpen, Tag } from 'lucide-react';

export const AcademicView: React.FC = () => {
  const { refreshTrigger } = useSync();
  const { language, t } = useLanguage();
  const [papers, setPapers] = useState<AcademicPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  // New paper form
  const [newTitle, setNewTitle] = useState('');
  const [newAbstract, setNewAbstract] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifiedCategory, setClassifiedCategory] = useState('');
  const [classifiedTags, setClassifiedTags] = useState<string[]>([]);
  const [publishLoading, setPublishLoading] = useState(false);

  const categories = [
    'All',
    'Natural Language Processing',
    'Machine Learning',
    'Information Retrieval',
    'Multimodal & Speech',
    'Ethics & Alignment',
  ];

  useEffect(() => {
    fetchPapers();
  }, [refreshTrigger]);

  const fetchPapers = async () => {
    try {
      const url = searchQuery
        ? `/api/ai/academic/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/ai/academic';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers();
  };

  const handleUpvote = async (paperId: string) => {
    try {
      const res = await fetch(`/api/ai/academic/${paperId}/upvote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPapers((prev) =>
          prev.map((p) => (p.id === paperId ? { ...p, upvotes: data.upvotes } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run NLP classification on paper draft
  const handleClassifyDraft = async () => {
    if (!newAbstract.trim() && !newContent.trim()) return;
    setIsClassifying(true);
    try {
      const res = await fetch('/api/ai/academic/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: `${newAbstract}\n${newContent}`,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClassifiedCategory(data.category || data.primaryCategory);
        setClassifiedTags(data.tags || data.semanticTags || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAbstract.trim()) return;

    setPublishLoading(true);
    try {
      const res = await fetch('/api/ai/academic/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          abstract: newAbstract,
          content: newContent || newAbstract,
          category: classifiedCategory || 'Natural Language Processing',
          tags: classifiedTags.length > 0 ? classifiedTags : ['NLP', 'Research'],
        }),
      });

      if (res.ok) {
        setShowPublishModal(false);
        setNewTitle('');
        setNewAbstract('');
        setNewContent('');
        setClassifiedCategory('');
        setClassifiedTags([]);
        fetchPapers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishLoading(false);
    }
  };

  const filteredPapers = papers.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LanguageSelector variant="banner" featureName="Academic Exchange & Research Classifier" />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>DOCUMENT CLASSIFICATION & SEMANTIC SEARCH</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">COMMUNITY REPOSITORY</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" />
            <span>Academic Exchange & Research Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Discover peer research briefs with semantic search and publish your findings with automatic NLP taxonomy classification.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Research Brief</span>
        </button>
      </div>

      {/* Search & Category filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Semantic search research papers (e.g. 'sparse attention mechanism for edge devices')..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Papers listing */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">No papers found matching current query or category.</p>
          </div>
        ) : (
          filteredPapers.map((paper) => {
            const isExpanded = expandedPaperId === paper.id;
            return (
              <div
                key={paper.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                        {paper.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        by {paper.authorName} • {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{paper.title}</h3>
                  </div>

                  <button
                    onClick={() => handleUpvote(paper.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{paper.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{paper.abstract}</p>

                {isExpanded && paper.content && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                    {paper.content}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {paper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {isExpanded ? 'Collapse Abstract' : 'Read Full Document'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <span>Publish Academic Research Brief</span>
                </h3>
                <p className="text-xs text-slate-500">
                  NLP automatically extracts categories and topics from your draft.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Paper Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Flash-Decoders: Memory-Efficient Sparse Attention"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Abstract</label>
                  <button
                    type="button"
                    onClick={handleClassifyDraft}
                    disabled={isClassifying || !newAbstract.trim()}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isClassifying ? 'Classifying...' : 'Auto-Classify with NLP'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  placeholder="Paste or write your paper abstract..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Classified output badges */}
              {classifiedCategory && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">NLP Recommended Taxonomy:</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                      {classifiedCategory}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {classifiedTags.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-indigo-700 text-[10px] font-mono border border-indigo-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                  Full Document Body (Optional)
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste sections, methodology, or full text..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishLoading || !newTitle.trim() || !newAbstract.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {publishLoading ? 'Publishing...' : 'Publish to Exchange'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
