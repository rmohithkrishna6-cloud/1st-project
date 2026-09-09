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
  const { languages, setCurrentLanguage, setIsLangModalOpen } = useAppStore();
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(180,255,0,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nexora Engine v1.0 — 128+ Multi-Language Compiler</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Execute Code at the <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B4FF00] via-[#00f2fe] to-[#B4FF00] animate-pulse">
            Speed of Light.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-normal leading-relaxed">
          Zero-setup online multi-language compiler & execution platform. Pick a language, write code, run it, and see output in milliseconds — no login required.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handleLaunchLanguage('python')}
            className="neo-button px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 w-full sm:w-auto justify-center group"
          >
            <Play className="w-5 h-5 fill-[#0B1A12] group-hover:scale-110 transition-transform" />
            Start Coding Now (Python)
          </button>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="neo-flat px-8 py-4 rounded-2xl text-base font-semibold border border-white/10 hover:border-[#B4FF00]/40 hover:text-[#B4FF00] transition-all flex items-center gap-2 text-white/90 w-full sm:w-auto justify-center"
          >
            <Code2 className="w-5 h-5 text-[#B4FF00]" />
            Browse 128+ Languages
          </button>
        </div>

        {/* Quick Launch Language Badges */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-3">
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider mr-2">Popular:</span>
          {[
            { id: 'python', name: 'Python 3', icon: 'fa-brands fa-python', color: 'text-yellow-400' },
            { id: 'javascript', name: 'JavaScript', icon: 'fa-brands fa-js', color: 'text-yellow-300' },
            { id: 'typescript', name: 'TypeScript', icon: 'fa-brands fa-js', color: 'text-blue-400' },
            { id: 'cpp', name: 'C++', icon: 'fa-solid fa-copyright', color: 'text-blue-500' },
            { id: 'java', name: 'Java 21', icon: 'fa-brands fa-java', color: 'text-orange-400' },
            { id: 'go', name: 'Go', icon: 'fa-brands fa-golang', color: 'text-cyan-400' },
            { id: 'rust', name: 'Rust', icon: 'fa-brands fa-rust', color: 'text-orange-500' },
            { id: 'sql', name: 'SQL Sandbox', icon: 'fa-solid fa-database', color: 'text-[#B4FF00]' },
            { id: 'html', name: 'HTML Web Preview', icon: 'fa-brands fa-html5', color: 'text-orange-600' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleLaunchLanguage(item.id)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E2117] border border-white/10 hover:border-[#B4FF00]/50 hover:bg-[#142E20] transition-all flex items-center gap-2 text-xs text-white/90 font-medium neo-flat"
            >
              <i className={`${item.icon} ${item.color}`} />
              {item.name}
            </button>
          ))}
        </div>

      </section>

      {/* CORE STATS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-box p-6 text-center neo-inset">
          <div className="text-3xl md:text-4xl font-extrabold text-[#B4FF00]">128+</div>
          <div className="text-xs uppercase tracking-widest text-white/40 mt-1 font-mono">Languages Supported</div>
        </div>
        <div className="glass-box p-6 text-center neo-inset">
          <div className="text-3xl md:text-4xl font-extrabold text-[#B4FF00]">0ms</div>
          <div className="text-xs uppercase tracking-widest text-white/40 mt-1 font-mono">Execution Overhead</div>
        </div>
        <div className="glass-box p-6 text-center neo-inset">
          <div className="text-3xl md:text-4xl font-extrabold text-white">100%</div>
          <div className="text-xs uppercase tracking-widest text-white/40 mt-1 font-mono">Zero Setup Needed</div>
        </div>
        <div className="glass-box p-6 text-center neo-inset">
          <div className="text-3xl md:text-4xl font-extrabold text-[#B4FF00]">Sandboxed</div>
          <div className="text-xs uppercase tracking-widest text-white/40 mt-1 font-mono">Isolated Container Environment</div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="relative space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">Engine Architecture & Features</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto">Built for developers, students, and competitive coders seeking speed and precision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="neo-flat p-8 rounded-3xl border border-white/10 space-y-4 hover:border-[#B4FF00]/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] flex items-center justify-center text-xl">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Multi-Language Sandbox</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Native support for Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, PHP, Ruby, Bash, Lua, Perl, and SQL. Instant stdin/stdout capture.
            </p>
          </div>

          <div className="neo-flat p-8 rounded-3xl border border-white/10 space-y-4 hover:border-[#B4FF00]/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Live Web Preview</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Render HTML5, CSS3, and JavaScript snippets instantly inside an isolated browser iframe. See live DOM updates with zero page reloads.
            </p>
          </div>

          <div className="neo-flat p-8 rounded-3xl border border-white/10 space-y-4 hover:border-[#B4FF00]/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">In-Memory SQL Runner</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Test relational database queries with SQLite standard engine. Create tables, insert records, and inspect relational query results.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURED LANGUAGES GRID */}
      <section className="relative space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Languages</h2>
            <p className="text-xs text-white/50">Click any language to launch the Monaco Code Editor sandbox</p>
          </div>
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="text-xs font-semibold text-[#B4FF00] hover:underline flex items-center gap-1"
          >
            View All 128+ Languages &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredLangs.map((lang) => (
            <div
              key={lang.id}
              onClick={() => handleLaunchLanguage(lang.id)}
              className="neo-flat p-5 rounded-2xl border border-white/5 hover:border-[#B4FF00]/40 cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-[#B4FF00]/40 transition-colors">
                    <LanguageIcon id={lang.id} fallback={lang.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#B4FF00] transition-colors">
                      {lang.name}
                    </h3>
                    <span className="text-[10px] text-white/40 font-mono">v{lang.version}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono">
                  {lang.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY DEVELOPER MOTIVATION BANNER (Below Featured Languages) */}
      <section className="relative overflow-hidden rounded-3xl neo-inset border border-[#B4FF00]/30 bg-[#0E2117]/90 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(180,255,0,0.15)] group transition-all hover:border-[#B4FF00]/50 !mt-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-[#B4FF00]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B4FF00]/15 text-[#B4FF00] border border-[#B4FF00]/40 text-xs font-bold font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(180,255,0,0.2)]">
                <Quote className="w-3.5 h-3.5 fill-[#B4FF00]" />
                Daily Dev Motivation
              </span>
              <span className="text-xs text-white/40 font-mono">| {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <blockquote className="text-lg md:text-2xl font-bold text-white leading-relaxed italic">
              "{currentQuote.quote}"
            </blockquote>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-extrabold text-[#B4FF00]">— {currentQuote.author}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60 text-xs font-mono">{currentQuote.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopyQuote}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-semibold flex items-center gap-2 transition-all hover:text-white"
              title="Copy quote to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-[#00F2FE]" />
              {copied ? 'Copied! ✓' : 'Copy Quote'}
            </button>

            <button
              onClick={handleNextQuote}
              className="px-4 py-2.5 rounded-xl bg-[#B4FF00] text-[#0B1A12] font-bold text-xs flex items-center gap-2 hover:bg-[#8EEB00] transition-all shadow-[0_0_15px_rgba(180,255,0,0.4)]"
              title="Get another motivational quote"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Next Quote
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CALLOUT */}
      <section className="glass-box p-10 text-center rounded-3xl space-y-4 border border-[#B4FF00]/20">
        <h2 className="text-3xl font-extrabold text-white">Ready to Run Your Code?</h2>
        <p className="text-sm text-white/70 max-w-xl mx-auto">
          No signups, no installations, no complexity. Launch Monaco Editor and compile immediately.
        </p>
        <button
          onClick={() => handleLaunchLanguage('python')}
          className="neo-button px-8 py-3.5 rounded-xl font-bold text-xs inline-flex items-center gap-2"
        >
          Open Code Editor Workspace &rarr;
        </button>
      </section>

    </div>
  );
};
