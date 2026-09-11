import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSnippets, starSnippet, forkSnippet, deleteSnippet } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Search, Star, GitFork, Eye, Code2, ExternalLink, Sparkles, Trash2, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Snippet } from '../types';

export const GalleryPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { languages, setCurrentLanguage, setCode, theme } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets()
      .then((data) => setSnippets(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await starSnippet(id);
      setSnippets((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (snippet: Snippet, e: React.MouseEvent) => {
    e.stopPropagation();
    setSnippetToDelete(snippet);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!snippetToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSnippet(snippetToDelete.id);
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete.id));
      const deletedTitle = snippetToDelete.title;
      setSnippetToDelete(null);
      setSuccessNotice(`Snippet "${deletedTitle}" was successfully deleted.`);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete snippet. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenSnippet = (snippet: Snippet) => {
    const lang = languages.find((l) => l.id === snippet.language) || languages[0];
    if (lang) {
      setCurrentLanguage(lang);
    }
    setCode(snippet.code);
    navigate(`/editor?lang=${snippet.language}`);
  };

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER & SEARCH */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold flex items-center gap-3 ${
            theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
          }`}>
            Public Snippet Gallery
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF5A1F]/15 text-[#FF5A1F] font-mono border border-[#FF5A1F]/30 font-bold">
              Community Hub
            </span>
          </h1>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Explore, star, and fork public code snippets across all 128+ languages
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets or languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F] transition-colors ${
              theme === 'dark'
                ? 'bg-[#121620] border-white/10 text-[#F4F7FB]'
                : 'bg-white border-slate-200 text-[#0F172A] shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* SUCCESS NOTICE BANNER */}
      {successNotice && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 transition-colors p-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SNIPPETS GRID */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs">
          <div className="w-6 h-6 border-2 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading gallery snippets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => handleOpenSnippet(snippet)}
              className={`p-6 rounded-2xl border cursor-pointer group flex flex-col justify-between transition-all ${
                theme === 'dark'
                  ? 'bg-[#121620] border-white/10 hover:border-[#FF5A1F]/50 hover:bg-[#1A202C] hover:shadow-[0_4px_24px_rgba(255,90,31,0.2)]'
                  : 'bg-white border-slate-200 hover:border-[#FF5A1F]/60 hover:bg-slate-50 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30">
                    {snippet.language}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {snippet.views}
                    </span>
                    <button
                      onClick={(e) => handleStar(snippet.id, e)}
                      className="flex items-center gap-1 hover:text-yellow-400 transition-colors p-1 rounded hover:bg-yellow-400/10"
                      title="Star snippet"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {snippet.stars}
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(snippet, e)}
                      className="flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-colors"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-base transition-colors group-hover:text-[#FF5A1F] ${
                  theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
                }`}>
                  {snippet.title}
                </h3>

                {/* Code Preview snippet */}
                <pre className={`p-3 rounded-xl border text-[11px] font-mono overflow-hidden max-h-24 leading-relaxed ${
                  theme === 'dark'
                    ? 'bg-[#080A0F] border-white/5 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {snippet.code.slice(0, 150)}...
                </pre>

              </div>

              <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                theme === 'dark' ? 'border-white/5' : 'border-slate-100'
              }`}>
                <span className="text-slate-400 text-[10px]">
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[#FF5A1F] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open in Compiler <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold">No snippets found</p>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {snippetToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setSnippetToDelete(null)}
        >
          <div
            className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
              theme === 'dark'
                ? 'bg-[#121620] border-white/10 text-[#F4F7FB]'
                : 'bg-white border-slate-200 text-[#0F172A]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !isDeleting && setSnippetToDelete(null)}
              disabled={isDeleting}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 pr-4">
                <h3 className="font-bold text-base">Delete Snippet</h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Are you sure you want to delete <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>"{snippetToDelete.title}"</strong>? This will permanently remove it from the gallery.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSnippetToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(239,68,68,0.35)] disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Snippet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GalleryPage;
