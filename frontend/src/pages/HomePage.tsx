import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Terminal, Zap, ShieldCheck, Cpu, Code2, ArrowRight, Play, Database, Globe, Layers, Sparkles, Quote, Copy, RefreshCw } from 'lucide-react';
import { LanguageConfig } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';

const DEV_QUOTES = [
  {
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    role: "Computer Scientist"
  },
  {
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    role: "Creator of Linux & Git"
  },
  {
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    role: "Creator of Extreme Programming"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    role: "Software Architect & Author"
  },
  {
    quote: "The most damaging phrase in the language is: 'We've always done it this way.'",
    author: "Grace Hopper",
    role: "Computer Science Pioneer & US Navy Rear Admiral"
  },
  {
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    role: "Turing Award Winner"
  },
  {
    quote: "The computer was born to solve problems that did not exist before.",
    author: "Bill Gates",
    role: "Co-Founder of Microsoft"
  },
  {
    quote: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
    role: "Software Architect"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    role: "Co-Founder of Apple"
  },
  {
    quote: "Fix the cause, not the symptom.",
    author: "Steve Maguire",
    role: "Software Engineer"
  },
  {
    quote: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    role: "Pioneer & Writer"
  },
  {
    quote: "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
    role: "Co-Creator of Unix & C"
  }
];

const getDailyQuoteIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % DEV_QUOTES.length;
};

export const HomePage: React.FC = () => {
  const { languages, setCurrentLanguage, setIsLangModalOpen, theme } = useAppStore();
  const navigate = useNavigate();

  const [quoteIndex, setQuoteIndex] = useState(getDailyQuoteIndex);
  const [copied, setCopied] = useState(false);

  const currentQuote = DEV_QUOTES[quoteIndex];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DEV_QUOTES.length);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchLanguage = (langId: string) => {
    const lang = languages.find((l) => l.id === langId && l.status === 'active') || 
                 languages.find((l) => l.status === 'active') || 
                 languages[0];
    if (lang) {
      setCurrentLanguage(lang);
      navigate(`/editor?lang=${lang.id}`);
    } else {
      navigate('/editor');
    }
  };

  const featuredLangs = languages.filter((l) => l.status === 'active').slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      
      {/* HERO SECTION */}
      <section className="text-center space-y-8 pt-4 relative">
        
        {/* Glow Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-sm transition-colors ${
          theme === 'dark'
            ? 'bg-[#121620] border-[#FF5A1F]/30 text-[#F4F7FB] shadow-[0_0_15px_rgba(255,90,31,0.2)]'
            : 'bg-white border-[#FF5A1F]/40 text-[#0F172A] shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>Codeticz Engine v1.0 — 128+ Multi-Language Compiler</span>
        </div>

        {/* Hero Title */}
        <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight transition-colors ${
          theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
        }`}>
          Execute Code at the <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A1F] via-[#FF6D38] to-[#FF304F]">
            Speed of Light.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className={`text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed transition-colors ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Zero-setup online multi-language compiler & execution platform. Pick a language, write code, run it, and see output in milliseconds — no login required.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handleLaunchLanguage('python')}
            className="px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 w-full sm:w-auto justify-center group bg-[#FF5A1F] hover:bg-[#FF6D38] active:bg-[#E04812] text-[#F4F7FB] shadow-[0_4px_20px_rgba(255,90,31,0.4)] transition-all"
          >
            <Play className="w-5 h-5 fill-[#F4F7FB] group-hover:scale-110 transition-transform text-[#F4F7FB]" />
            Start Coding Now (Python)
          </button>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="btn-secondary px-8 py-4 rounded-2xl text-base font-semibold transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Code2 className="w-5 h-5 text-[#FF5A1F]" />
            Browse 128+ Languages
          </button>
        </div>

        {/* Quick Launch Language Badges */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-3">
          <span className="text-xs text-slate-500 uppercase font-mono tracking-wider mr-2">Popular:</span>
          {[
            { id: 'python', name: 'Python 3', icon: 'fa-brands fa-python', color: 'text-yellow-400' },
            { id: 'javascript', name: 'JavaScript', icon: 'fa-brands fa-js', color: 'text-yellow-300' },
            { id: 'typescript', name: 'TypeScript', icon: 'fa-brands fa-js', color: 'text-blue-400' },
            { id: 'cpp', name: 'C++', icon: 'fa-solid fa-copyright', color: 'text-blue-500' },
            { id: 'java', name: 'Java 21', icon: 'fa-brands fa-java', color: 'text-orange-400' },
            { id: 'go', name: 'Go', icon: 'fa-brands fa-golang', color: 'text-cyan-400' },
            { id: 'rust', name: 'Rust', icon: 'fa-brands fa-rust', color: 'text-orange-500' },
            { id: 'sql', name: 'SQL Sandbox', icon: 'fa-solid fa-database', color: 'text-[#FF5A1F]' },
            { id: 'html', name: 'HTML Web Preview', icon: 'fa-brands fa-html5', color: 'text-orange-500' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleLaunchLanguage(item.id)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium shadow-sm hover:shadow-[0_0_12px_rgba(255,90,31,0.25)] ${
                theme === 'dark'
                  ? 'bg-[#121620] border-white/10 hover:border-[#FF5A1F]/60 hover:bg-[#1A202C] text-[#F4F7FB]'
                  : 'bg-white border-slate-200 hover:border-[#FF5A1F]/60 hover:bg-slate-50 text-[#0F172A]'
              }`}
            >
              <i className={`${item.icon} ${item.color}`} />
              {item.name}
            </button>
          ))}
        </div>

      </section>

      {/* CORE STATS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className={`border rounded-2xl p-6 text-center shadow-md transition-colors ${
          theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200/90'
        }`}>
          <div className="text-3xl md:text-4xl font-extrabold text-[#FF5A1F]">128+</div>
          <div className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">Languages Supported</div>
        </div>
        <div className={`border rounded-2xl p-6 text-center shadow-md transition-colors ${
          theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200/90'
        }`}>
          <div className="text-3xl md:text-4xl font-extrabold text-[#FF5A1F]">0ms</div>
          <div className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">Execution Overhead</div>
        </div>
        <div className={`border rounded-2xl p-6 text-center shadow-md transition-colors ${
          theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200/90'
        }`}>
          <div className={`text-3xl md:text-4xl font-extrabold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>100%</div>
          <div className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">Zero Setup Needed</div>
        </div>
        <div className={`border rounded-2xl p-6 text-center shadow-md transition-colors ${
          theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200/90'
        }`}>
          <div className="text-3xl md:text-4xl font-extrabold text-[#FF5A1F]">Sandboxed</div>
          <div className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">Isolated Container Engine</div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="relative space-y-8">
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
            Engine Architecture & Features
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Built for developers, students, and competitive coders seeking speed and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className={`border p-8 rounded-3xl space-y-4 hover:border-[#FF5A1F]/50 transition-all hover:shadow-[0_4px_24px_rgba(255,90,31,0.18)] ${
            theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 text-[#FF5A1F] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,90,31,0.25)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
              Multi-Language Sandbox
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Native support for Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, PHP, Ruby, Bash, Lua, Perl, and SQL. Instant stdin/stdout capture.
            </p>
          </div>

          <div className={`border p-8 rounded-3xl space-y-4 hover:border-[#FF5A1F]/50 transition-all hover:shadow-[0_4px_24px_rgba(255,90,31,0.18)] ${
            theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl ${
              theme === 'dark' ? 'bg-[#1A202C] border-white/10 text-[#F4F7FB]' : 'bg-slate-100 border-slate-200 text-[#0F172A]'
            }`}>
              <Globe className="w-6 h-6" />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
              Live Web Preview
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Render HTML5, CSS3, and JavaScript snippets instantly inside an isolated browser iframe. See live DOM updates with zero page reloads.
            </p>
          </div>

          <div className={`border p-8 rounded-3xl space-y-4 hover:border-[#FF5A1F]/50 transition-all hover:shadow-[0_4px_24px_rgba(255,90,31,0.18)] ${
            theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-[#FF304F]/15 border border-[#FF304F]/40 text-[#FF304F] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,48,79,0.25)]">
              <Database className="w-6 h-6" />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
              In-Memory SQL Runner
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Test relational database queries with SQLite standard engine. Create tables, insert records, and inspect relational query results.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURED LANGUAGES GRID */}
      <section className="relative space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
              Featured Languages
            </h2>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Click any language to launch the Monaco Code Editor sandbox
            </p>
          </div>
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="text-xs font-semibold text-[#FF5A1F] hover:text-[#FF6D38] hover:underline flex items-center gap-1 transition-colors"
          >
            View All 128+ Languages &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredLangs.map((lang) => (
            <div
              key={lang.id}
              onClick={() => handleLaunchLanguage(lang.id)}
              className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                theme === 'dark'
                  ? 'bg-[#121620] border-white/10 hover:border-[#FF5A1F]/50 hover:bg-[#1A202C] hover:shadow-[0_4px_20px_rgba(255,90,31,0.2)]'
                  : 'bg-white border-slate-200 hover:border-[#FF5A1F]/60 hover:bg-slate-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 group-hover:border-[#FF5A1F]/50 transition-colors ${
                    theme === 'dark' ? 'bg-[#080A0F] border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <LanguageIcon id={lang.id} fallback={lang.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm transition-colors group-hover:text-[#FF5A1F] ${
                      theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
                    }`}>
                      {lang.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">v{lang.version}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {lang.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY DEVELOPER MOTIVATION BANNER */}
      <section className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 backdrop-blur-xl shadow-lg group transition-all hover:border-[#FF5A1F]/40 !mt-8 ${
        theme === 'dark' ? 'border-white/10 bg-[#121620]' : 'border-slate-200 bg-white shadow-md'
      }`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-[#FF5A1F]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-xs font-bold font-mono uppercase tracking-wider shadow-sm ${
                theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
              }`}>
                <Quote className="w-3.5 h-3.5 fill-[#FF5A1F] text-[#FF5A1F]" />
                Daily Dev Motivation
              </span>
              <span className="text-xs text-slate-400 font-mono">| {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <blockquote className={`text-lg md:text-2xl font-bold leading-relaxed italic ${
              theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
            }`}>
              "{currentQuote.quote}"
            </blockquote>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-extrabold text-[#FF5A1F]">— {currentQuote.author}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs font-mono">{currentQuote.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopyQuote}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-[#1A202C] hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Copy quote to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied! ✓' : 'Copy Quote'}
            </button>

            <button
              onClick={handleNextQuote}
              className="px-4 py-2.5 rounded-xl bg-[#FF5A1F] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#FF6D38] transition-all shadow-[0_0_15px_rgba(255,90,31,0.4)]"
              title="Get another motivational quote"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Next Quote
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CALLOUT */}
      <section className={`p-10 text-center rounded-3xl space-y-4 border shadow-lg ${
        theme === 'dark' ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'}`}>
          Ready to Run Your Code?
        </h2>
        <p className={`text-sm max-w-xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          No signups, no installations, no complexity. Launch Monaco Editor and compile immediately.
        </p>
        <button
          onClick={() => handleLaunchLanguage('python')}
          className="px-8 py-3.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF6D38] active:bg-[#E04812] text-white shadow-[0_4px_16px_rgba(255,90,31,0.35)] transition-all"
        >
          Open Code Editor Workspace &rarr;
        </button>
      </section>

    </div>
  );
};

export default HomePage;
