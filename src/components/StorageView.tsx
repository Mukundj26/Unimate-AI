import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { FileItem, FolderItem, ActiveTab } from '../types.ts';
import {
  Folder,
  FileText,
  Upload,
  FolderPlus,
  History,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  ArrowLeft,
  Search,
  Sparkles,
  Bot,
  FileQuestion,
  FileCode,
  File,
  Database,
} from 'lucide-react';

interface StorageViewProps {
  files: FileItem[];
  folders: FolderItem[];
  currentFolder: string;
  onChangeFolder: (folder: string) => void;
  onRefresh: () => void;
  onNavigateTab: (tab: ActiveTab, context?: { fileId?: string; fileName?: string }) => void;
}

export const StorageView: React.FC<StorageViewProps> = ({
  files,
  folders,
  currentFolder,
  onChangeFolder,
  onRefresh,
  onNavigateTab,
}) => {
  const { openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileForVersions, setSelectedFileForVersions] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Filter files by current folder and search
  const filteredFiles = files.filter((f) => {
    const inFolder = currentFolder === '/' ? f.folderPath === '/' : f.folderPath.startsWith(currentFolder);
    const matchesQuery = searchQuery
      ? f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return inFolder && matchesQuery;
  });

  const subFolders = folders.filter((folder) => {
    if (currentFolder === '/') {
      // Direct children of root
      const parts = folder.path.split('/').filter(Boolean);
      return parts.length === 1;
    }
    return folder.path.startsWith(currentFolder) && folder.path !== currentFolder;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFolder = false) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await uploadFiles(Array.from(fileList));
    e.target.value = '';
  };

  const uploadFiles = async (fileArray: File[]) => {
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const formData = new FormData();
      const relativePaths: string[] = [];

      fileArray.forEach((file) => {
        formData.append('files', file);
        // webkitRelativePath contains folder relative path if uploaded via folder input
        relativePaths.push((file as any).webkitRelativePath || file.name);
      });

      formData.append('folderPath', currentFolder);
      formData.append('relativePaths', JSON.stringify(relativePaths));

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadFeedback(`Successfully uploaded and indexed ${data.count} file(s)!`);
      onRefresh();
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles: File[] = [];
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) droppedFiles.push(file);
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        droppedFiles.push(e.dataTransfer.files[i]);
      }
    }

    if (droppedFiles.length > 0) {
      await uploadFiles(droppedFiles);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/files/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentPath: currentFolder,
        }),
      });

      if (res.ok) {
        setNewFolderName('');
        setShowNewFolderModal(false);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? All versions will be removed.')) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        if (selectedFileForVersions?.id === fileId) setSelectedFileForVersions(null);
        if (previewFile?.id === fileId) setPreviewFile(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRollback = async (fileId: string, targetVersion: number) => {
    try {
      const res = await fetch(`/api/files/${fileId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedFileForVersions(data.file);
        onRefresh();
        setUploadFeedback(`Rolled back to version v${targetVersion} successfully!`);
        setTimeout(() => setUploadFeedback(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Rollback failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>DATABASE STORAGE</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">AUTOMATIC VERSIONING</span>
          </div>
          <div className="flex items-center gap-2">
            {currentFolder !== '/' && (
              <button
                onClick={() => onChangeFolder('/')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                title="Go to root"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <span>{currentFolder === '/' ? 'Root Directory (/)' : currentFolder}</span>
            </h2>
          </div>
        </div>

        {/* Upload Buttons & New Folder */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, false)}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, true)}
          />

          <button
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>

          <button
            id="btn-upload-folder"
            onClick={() => folderInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
          >
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Upload Folder</span>
          </button>

          <button
            id="btn-new-folder"
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>New Folder</span>
          </button>

          <button
            id="btn-database-records"
            onClick={() => openAuthModal('database')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
            title="Inspect stored user data and uploaded files in database"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>Database Records</span>
          </button>
        </div>
      </div>

      {uploadFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
        }`}
      >
        <div className="max-w-md mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Drag and drop files or entire folders here
          </p>
          <p className="text-xs text-slate-500">
            Files are persisted in the database with full-text RAG indexing. Uploading a file with the same name
            automatically creates a <strong className="text-slate-700">new version</strong>!
          </p>
        </div>
      </div>

      {/* Search & Subfolders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name or tag..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500">
            {filteredFiles.length} file(s) in this path
          </span>
        </div>

        {/* Sub-folder chips */}
        {subFolders.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {subFolders.map((sf) => (
              <button
                key={sf.id}
                onClick={() => onChangeFolder(sf.path)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all shadow-2xs"
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>{sf.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Files Grid / Table */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm">No files found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload course materials, research drafts, resumes, or code to start using RAG, Quizzes, and Summaries.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">File Name</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Folder</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        {file.originalName.endsWith('.py') || file.originalName.endsWith('.ts') ? (
                          <FileCode className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate max-w-xs">{file.originalName}</p>
                        <div className="flex gap-1 mt-0.5">
                          {file.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedFileForVersions(file)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Click to view version history and rollback"
                      >
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>v{file.version}</span>
                        {file.versions.length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-normal">
                            (+{file.versions.length} prev)
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                      {formatBytes(file.size)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {file.folderPath}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(file.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick AI Action: Ask RAG */}
                        <button
                          onClick={() => onNavigateTab('assistant', { fileId: file.id, fileName: file.originalName })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Ask AI Assistant with RAG"
                        >
                          <Bot className="w-4 h-4" />
                        </button>

                        {/* Quick AI Action: Quiz */}
                        <button
                          onClick={() => onNavigateTab('quiz', { fileId: file.id, fileName: file.originalName })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Generate Quiz from Document"
                        >
                          <FileQuestion className="w-4 h-4" />
                        </button>

                        {/* Preview */}
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Preview Text"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download */}
                        <a
                          href={`/api/files/${file.id}/download`}
                          download
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Version History & Rollback Modal */}
      {selectedFileForVersions && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>Version History & Rollback</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedFileForVersions.originalName}</p>
              </div>
              <button
                onClick={() => setSelectedFileForVersions(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Current active version */}
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold">
                      Current: v{selectedFileForVersions.version}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {formatBytes(selectedFileForVersions.size)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Updated: {new Date(selectedFileForVersions.updatedAt).toLocaleString()}
                  </p>
                </div>
                <a
                  href={`/api/files/${selectedFileForVersions.id}/download`}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  Download
                </a>
              </div>

              {/* Previous versions */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                Previous Snapshots ({selectedFileForVersions.versions.length})
              </h4>

              {selectedFileForVersions.versions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No previous versions yet. Re-uploading this file with modifications will store subsequent versions automatically.</p>
              ) : (
                <div className="space-y-2">
                  {selectedFileForVersions.versions.map((ver) => (
                    <div
                      key={ver.version}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-bold">
                            v{ver.version}
                          </span>
                          <span className="text-xs text-slate-600">{formatBytes(ver.size)}</span>
                          {ver.note && <span className="text-[11px] text-slate-400">({ver.note})</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Archived: {new Date(ver.uploadedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/files/${selectedFileForVersions.id}/download?version=${ver.version}`}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleRollback(selectedFileForVersions.id, ver.version)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                          Rollback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedFileForVersions(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Content Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>{previewFile.originalName}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Extracted text preview for RAG and NLP search (v{previewFile.version})
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-50 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {previewFile.textContent || 'No readable text content extracted.'}
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const target = previewFile;
                    setPreviewFile(null);
                    onNavigateTab('assistant', { fileId: target.id, fileName: target.originalName });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant</span>
                </button>
                <button
                  onClick={() => {
                    const target = previewFile;
                    setPreviewFile(null);
                    onNavigateTab('quiz', { fileId: target.id, fileName: target.originalName });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </button>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              <span>Create New Folder</span>
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Machine Learning, Resumes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
