import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Home, Code2, Compass, LayoutGrid, User as UserIcon, History as HistoryIcon, Share2 as ShareIcon, Bug, Flame, Sun, Moon } from 'lucide-react';
import { CodeticzLogo } from './CodeticzLogo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { setIsLangModalOpen, setIsAuthModalOpen, setIsHistoryOpen, setIsEmbedOpen, setIsFeedbackOpen, user, userStreak, theme, toggleTheme } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-3.5 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-[#121620]/90 border-white/10'
        : 'bg-white/90 border-slate-200/90 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo with High-Tech Animated Glow */}
        <Link to="/" className="flex items-center gap-3.5 group relative">
          <div className="relative flex items-center justify-center">
            {/* Transparent Glowing Codeticz Logo </>. */}
            <div className="group-hover:scale-110 transition-transform duration-300 relative z-10 flex items-center justify-center">
              <CodeticzLogo size={38} showBadge={false} withGlow={true} />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight flex items-center gap-2">
              <span className={`animate-logo-text drop-shadow-[0_0_12px_rgba(255,90,31,0.35)] ${
                theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
              }`}>
                Codeticz
              </span>
            </span>
            <span className={`text-[11px] font-mono -mt-0.5 flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shadow-[0_0_6px_#FF304F]" />
              128+ Multi-Lang Compiler
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border transition-colors ${
          theme === 'dark'
            ? 'bg-[#080A0F] border-white/10 shadow-inner'
            : 'bg-slate-100 border-slate-200/90'
        }`}>
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/')
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-white font-bold shadow-[0_0_14px_rgba(255,90,31,0.45)] border border-white/20'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-[#F4F7FB] hover:bg-white/5'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            to="/editor"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/editor')
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-white font-bold shadow-[0_0_14px_rgba(255,90,31,0.45)] border border-white/20'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-[#F4F7FB] hover:bg-white/5'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code Editor
          </Link>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-[#F4F7FB] hover:bg-white/5'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Compass className="w-4 h-4 text-[#FF5A1F]" />
            128+ Languages
          </button>

          <Link
            to="/gallery"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/gallery')
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-white font-bold shadow-[0_0_14px_rgba(255,90,31,0.45)] border border-white/20'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-[#F4F7FB] hover:bg-white/5'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Gallery
          </Link>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-[#F4F7FB] hover:bg-white/5'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <HistoryIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`} />
            History Logs
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Dual-Theme Switcher (Dark Mode / Bright Mode) */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center relative overflow-hidden group shadow-sm ${
              theme === 'dark'
                ? 'border-white/10 hover:border-[#FF5A1F]/60 bg-[#121620] hover:bg-[#1A202C] text-amber-400'
                : 'border-slate-200 hover:border-[#FF5A1F]/60 bg-white hover:bg-slate-50 text-[#FF5A1F]'
            }`}
            title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Bright/Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
            ) : (
              <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            )}
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm ${
              theme === 'dark'
                ? 'border-white/10 hover:border-[#FF5A1F]/60 bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F7FB]'
                : 'border-slate-200 hover:border-[#FF5A1F]/60 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0F172A]'
            }`}
            title="If you face any bug let me know that!"
          >
            <Bug className="w-4 h-4 text-[#FF304F]" />
            <span className="hidden sm:inline">Report Bug</span>
          </button>

          <button
            onClick={() => setIsEmbedOpen(true)}
            className={`p-2.5 rounded-xl transition-colors border shadow-sm ${
              theme === 'dark'
                ? 'border-white/10 hover:border-[#FF5A1F]/60 bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F7FB]'
                : 'border-slate-200 hover:border-[#FF5A1F]/60 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0F172A]'
            }`}
            title="Embed Code Snippet"
          >
            <ShareIcon className="w-4 h-4" />
          </button>

          {user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-[#FF5A1F]/40 hover:border-[#FF5A1F] bg-[#FF5A1F]/10 hover:bg-[#FF5A1F]/20 text-[#FF5A1F] font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,90,31,0.2)]"
              title={`Daily Streak: ${userStreak || 5} Days Active. Click to view Developer Profile`}
            >
              <Flame className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]/20 animate-pulse" />
              <span>{userStreak || 5}</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all border flex items-center gap-2 shadow-sm ${
              theme === 'dark'
                ? 'border-white/10 hover:border-[#FF5A1F]/60 bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F7FB]'
                : 'border-slate-200 hover:border-[#FF5A1F]/60 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0F172A]'
            }`}
            title={user ? `${user.displayName}'s Profile & Developer Stats` : 'Developer Sign In'}
          >
            {user ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF5A1F] to-[#FF304F] text-white font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(255,90,31,0.5)] border border-white/20">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className={`text-xs font-bold hidden sm:inline max-w-[110px] truncate ${
                  theme === 'dark' ? 'text-[#F4F7FB]' : 'text-[#0F172A]'
                }`}>
                  {user.displayName}
                </span>
              </>
            ) : (
              <div className="p-1">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Highly Defined & Vibrant Animated Moving Wave Border in Codeticz Flame */}
      <div className="absolute -bottom-[2px] left-0 w-full h-[16px] overflow-hidden pointer-events-none z-30">
        {/* Wave Layer 1: Primary Orange-Red Glow Wave */}
        <div className="flex w-[200%] h-full animate-wave-slow opacity-90 filter drop-shadow-[0_0_8px_rgba(255,90,31,0.7)]">
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nav-wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FF304F" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-1)"
              fillOpacity="0.35"
            />
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18"
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-1)"
              fillOpacity="0.35"
            />
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18"
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Wave Layer 2: Secondary Ice White Counter Wave */}
        <div className="flex w-[200%] h-full animate-wave-fast opacity-75 absolute top-0 left-0 filter drop-shadow-[0_0_6px_rgba(244,247,251,0.4)]">
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nav-wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F4F7FB" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F4F7FB" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-2)"
              fillOpacity="0.2"
            />
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10"
              fill="none"
              stroke="#F4F7FB"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-2)"
              fillOpacity="0.2"
            />
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10"
              fill="none"
              stroke="#F4F7FB"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
