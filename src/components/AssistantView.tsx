import React, { useState } from 'react';
import { FileItem } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { Bot, Send, Sparkles, FileText, CheckCircle2, Copy, BookOpen } from 'lucide-react';

interface AssistantViewProps {
  files: FileItem[];
  preselectedFileId?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  contextUsed?: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ files, preselectedFileId }) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your RAG-powered Academic & Technical Assistant. I ground answers in your uploaded documents and full database knowledge with verifiable citations. Ask me anything about your files, technical concepts, or research papers in English, Marathi, or Hindi!',
      contextUsed: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    preselectedFileId ? [preselectedFileId] : []
  );

  const samplePrompts = [
    'What are the key findings in our low-resource language attention paper?',
    'Explain how hybrid search combines dense embeddings with BM25 in RAG.',
    'Summarize the core concepts across all my uploaded documents.',
    'What invariants does the transformer self-attention mechanism guarantee?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          targetFileIds: selectedFileIds,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Assistant query failed');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
          contextUsed: data.contextUsed,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Apologies, an error occurred while querying knowledge: ${err.message}. Ensure your backend server is active.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <LanguageSelector variant="banner" featureName="AI Assistant (RAG)" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: RAG Context Selector */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">RAG Knowledge Base</h3>
          </div>
          <p className="text-xs text-slate-500">
            Select which uploaded files to ground answers on. Leave blank to search across your entire workspace library.
          </p>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {files.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No files uploaded yet in Storage tab.</p>
            ) : (
              files.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFileIds(selectedFileIds.filter((id) => id !== file.id));
                      } else {
                        setSelectedFileIds([...selectedFileIds, file.id]);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{file.originalName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                      v{file.version}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedFileIds.length > 0 && (
            <button
              onClick={() => setSelectedFileIds([])}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters (Search All Docs)
            </button>
          )}
        </div>

        {/* Suggested RAG Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Inquiries</h4>
          <div className="space-y-1.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-100 text-xs text-slate-700 hover:text-blue-900 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">AI Research & RAG Assistant</h2>
              <p className="text-[11px] text-slate-500">
                Grounding mode:{' '}
                {selectedFileIds.length > 0
                  ? `${selectedFileIds.length} file(s) targeted`
                  : 'Full Workspace Knowledge Base'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            gemini-3.8-flash
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citations block */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Grounding Sources:
                    </span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 text-[10px] font-medium"
                      >
                        <FileText className="w-3 h-3 text-indigo-500" />
                        <span>{c}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <button
                    onClick={() => copyToClipboard(m.content)}
                    className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-600">
                Retrieving relevant document chunks and synthesizing answer...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical question or query your documents..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};
