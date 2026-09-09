import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Search, X, Code2, Sparkles, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { LanguageConfig } from '../types';
import { LanguageIcon } from './LanguageIcon';

export const LanguageModal: React.FC = () => {
  const { languages, isLangModalOpen, setIsLangModalOpen, requestLanguageSwitch, currentLanguage, theme } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all' | 'coming_soon'>('active');
  const navigate = useNavigate();

  const categories = ['All', 'Popular', 'Web', 'Databases', 'Scripting', 'Educational', 'Esoteric', 'Mobile'];

  const activeCount = useMemo(() => languages.filter((l) => l.status === 'active').length, [languages]);
  const comingSoonCount = useMemo(() => languages.filter((l) => l.status === 'coming_soon').length, [languages]);

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) => {
      const isActive = lang.status === 'active';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'coming_soon' && !isActive);

      const matchesSearch =
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        lang.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesStatus && matchesSearch && matchesCategory;
    });
  }, [languages, searchQuery, selectedCategory, statusFilter]);

  if (!isLangModalOpen) return null;

  const handleSelectLanguage = (lang: LanguageConfig) => {
    if (lang.status === 'coming_soon') {
      return;
    }
    const switched = requestLanguageSwitch(lang);
    if (switched) {
      setIsLangModalOpen(false);
      navigate(`/editor?lang=${lang.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className={`max-w-5xl w-full h-[88vh] flex flex-col p-6 sm:p-8 relative overflow-hidden shadow-2xl border rounded-2xl transition-colors ${
        theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-5 border-b transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#FF304F] text-white flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(255,90,31,0.5)]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-2xl font-extrabold tracking-tight ${
                  theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
                }`}>
                  Explore Languages
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/15 text-[#FF5A1F] font-mono border border-[#FF5A1F]/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activeCount} Verified Active
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-mono border border-amber-500/30 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {comingSoonCount} Coming Soon
                </span>
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Select from 110 genuinely verified compilation runtimes. Fast zero-setup cloud sandboxes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLangModalOpen(false)}
            className={`p-2.5 rounded-xl border transition-colors ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white bg-[#080A0F] border-white/10 hover:border-white/20'
                : 'text-slate-600 hover:text-[#0F172A] bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="my-4 flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages (Python, Rust, C++)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F] transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB]'
                    : 'bg-slate-50 border-slate-200 text-[#0F172A]'
                }`}
              />
            </div>

            {/* Status Filter Tabs */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto justify-center sm:justify-start ${
              theme === 'dark' ? 'bg-[#080A0F] border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'active'
                    ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-white shadow-[0_0_10px_rgba(255,90,31,0.4)]'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                Active ({activeCount})
              </button>

              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? theme === 'dark' ? 'bg-white/20 text-white shadow' : 'bg-white text-[#0F172A] shadow-sm'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                All ({languages.length})
              </button>

              <button
                onClick={() => setStatusFilter('coming_soon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'coming_soon'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-sm'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Lock className="w-3 h-3" />
                Soon ({comingSoonCount})
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 font-bold'
                    : theme === 'dark'
                      ? 'bg-[#080A0F] text-slate-400 hover:text-white border border-white/5'
                      : 'bg-slate-100 text-slate-600 hover:text-[#0F172A] border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious, Clean Language Cards Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 content-start">
          {filteredLanguages.map((lang) => {
            const isActive = lang.status === 'active';
            const isSelected = currentLanguage?.id === lang.id;

            return (
              <div
                key={lang.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectLanguage(lang)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectLanguage(lang);
                  }
                }}
                className={`border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#080A0F] border-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'
                } ${
                  isActive
                    ? theme === 'dark'
                      ? 'cursor-pointer group hover:border-[#FF5A1F]/50 hover:bg-[#1A202C]'
                      : 'cursor-pointer group hover:border-[#FF5A1F]/60 hover:bg-white'
                    : 'disabled-card cursor-not-allowed opacity-60'
                } ${
                  isSelected
                    ? theme === 'dark'
                      ? 'border-[#FF5A1F] ring-1 ring-[#FF5A1F]/40 bg-[#1A202C]'
                      : 'border-[#FF5A1F] ring-1 ring-[#FF5A1F]/40 bg-orange-50/50'
                    : ''
                } px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl flex items-center justify-between gap-4`}
                title={
                  isActive
                    ? `Launch ${lang.name} sandbox`
                    : `${lang.name} runtime in development. Coming Soon.`
                }
              >
                {/* Left: Authentic Logo / Icon + Language Name in Bold */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-[#121620] border-white/10 group-hover:border-[#FF5A1F]/50 group-hover:bg-[#FF5A1F]/10 group-hover:scale-105'
                          : 'bg-white border-slate-200 group-hover:border-[#FF5A1F]/60 group-hover:bg-orange-50/40 group-hover:scale-105 shadow-sm'
                        : theme === 'dark'
                          ? 'bg-[#121620] border-white/5 opacity-60'
                          : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <LanguageIcon id={lang.id} fallback={lang.icon} className="text-2xl sm:text-[26px]" />
                  </div>

                  {/* Language Name as Primary Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-[15px] sm:text-base truncate transition-colors ${
                          isActive
                            ? theme === 'dark' ? 'text-[#F4F7FB] group-hover:text-[#FF5A1F]' : 'text-[#0F172A] group-hover:text-[#FF5A1F]'
                            : 'text-slate-400'
                        }`}
                      >
                        {lang.name}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F] flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Secondary details */}
                <div className="flex-shrink-0 flex items-center relative">
                  {isActive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#FF5A1F]/60 group-hover:opacity-0 transition-opacity" />

                      <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none flex items-center gap-1.5 text-xs text-slate-400 font-mono whitespace-nowrap bg-[#121620] backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/15 shadow-lg">
                        <span className="text-slate-300 text-[11px]">
                          {lang.version.startsWith('v') ? lang.version : `v${lang.version}`}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#FF5A1F]" />
                      </div>
                    </>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20 text-[10px] font-mono font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-amber-400/70" />
                      Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              {searchQuery ? (
                <>
                  <p className="text-sm font-semibold text-slate-300">No languages found matching "{searchQuery}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try switching the filter to "All" or clearing your search.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-300">No verified active languages in category "{selectedCategory}"</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Engines in this category are currently under development. Switch to the <strong>"Soon"</strong> or <strong>"All"</strong> tab to view roadmap items.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LanguageModal;
