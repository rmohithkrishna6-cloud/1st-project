import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSnippets, starSnippet, forkSnippet } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Search, Star, GitFork, Eye, Code2, ExternalLink, Sparkles } from 'lucide-react';
import { Snippet } from '../types';

export const GalleryPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { languages, setCurrentLanguage, setCode } = useAppStore();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Public Snippet Gallery
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#B4FF00]/15 text-[#B4FF00] font-mono border border-[#B4FF00]/30">
              Community Hub
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">Explore, star, and fork public code snippets across all 128+ languages</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search snippets or languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#B4FF00] neo-inset"
          />
        </div>
      </div>

      {/* SNIPPETS GRID */}
      {loading ? (
        <div className="py-20 text-center text-white/40 font-mono text-xs">
          <div className="w-6 h-6 border-2 border-[#B4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading gallery snippets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => handleOpenSnippet(snippet)}
              className="neo-flat p-6 rounded-2xl border border-white/10 hover:border-[#B4FF00]/40 cursor-pointer group flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#B4FF00]/15 text-[#B4FF00] border border-[#B4FF00]/30">
                    {snippet.language}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {snippet.views}
                    </span>
                    <button
                      onClick={(e) => handleStar(snippet.id, e)}
                      className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {snippet.stars}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-white group-hover:text-[#B4FF00] transition-colors">
                  {snippet.title}
                </h3>

                {/* Code Preview snippet */}
                <pre className="p-3 rounded-xl bg-[#0B1A12] border border-white/5 text-[11px] font-mono text-white/70 overflow-hidden max-h-24 leading-relaxed neo-inset">
                  {snippet.code.slice(0, 150)}...
                </pre>

              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40 text-[10px]">
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[#B4FF00] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open in Compiler <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/50">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-sm font-semibold">No snippets found</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
