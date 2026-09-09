import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Home, Code2, Compass, LayoutGrid, User as UserIcon, History as HistoryIcon, Share2 as ShareIcon, Bug, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { setIsLangModalOpen, setIsAuthModalOpen, setIsHistoryOpen, setIsEmbedOpen, setIsFeedbackOpen, user, userStreak } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-box border-b border-white/10 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo with High-Tech Animated Glow */}
        <Link to="/" className="flex items-center gap-3.5 group relative">
          <div className="relative flex items-center justify-center">
            {/* Glowing Main Logo Icon Box */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B4FF00] via-[#8EEB00] to-[#00F2FE] flex items-center justify-center font-black text-[#0B1A12] text-2xl animate-logo-pulse group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-[0_0_20px_rgba(180,255,0,0.5)]">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform -skew-x-6">N</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight flex items-center gap-2">
              <span className="animate-logo-text drop-shadow-[0_0_12px_rgba(180,255,0,0.3)]">
                Nexora
              </span>
            </span>
            <span className="text-[11px] text-white/50 font-mono -mt-0.5 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              128+ Multi-Lang Compiler
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#0E2117]/80 p-1.5 rounded-full border border-white/10 neo-inset">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/')
                ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_15px_rgba(180,255,0,0.5)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            to="/editor"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/editor')
                ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_15px_rgba(180,255,0,0.5)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code Editor
          </Link>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <Compass className="w-4 h-4 text-[#B4FF00]" />
            128+ Languages
          </button>

          <Link
            to="/gallery"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isActive('/gallery')
                ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_15px_rgba(180,255,0,0.5)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Gallery
          </Link>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <HistoryIcon className="w-4 h-4 text-cyan-400" />
            History Logs
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="neo-inset px-3 py-2 rounded-xl text-xs font-bold text-white/90 hover:text-[#B4FF00] transition-all border border-[#B4FF00]/30 hover:border-[#B4FF00] bg-white/5 flex items-center gap-1.5"
            title="If you face any bug let me know that!"
          >
            <Bug className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Report Bug</span>
          </button>

          <button
            onClick={() => setIsEmbedOpen(true)}
            className="neo-inset p-2.5 rounded-xl text-white/80 hover:text-[#B4FF00] transition-colors border border-white/5"
            title="Embed Code Snippet"
          >
            <ShareIcon className="w-4 h-4" />
          </button>

          {user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="neo-inset px-2.5 py-1.5 rounded-xl border border-orange-500/30 hover:border-orange-400 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 hover:text-amber-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
              title={`Daily Streak: ${userStreak || 5} Days Active. Click to view Developer Profile`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
              <span>{userStreak || 5}</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="neo-inset p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-white/80 hover:text-[#B4FF00] transition-all border border-white/5 flex items-center gap-2 hover:border-[#B4FF00]/40"
            title={user ? `${user.displayName}'s Profile & Developer Stats` : 'Developer Sign In'}
          >
            {user ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#B4FF00] to-cyan-400 text-[#0B1A12] font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(180,255,0,0.5)]">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white hidden sm:inline max-w-[110px] truncate">
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

      {/* Highly Defined & Vibrant Animated Moving Wave Border */}
      <div className="absolute -bottom-[2px] left-0 w-full h-[18px] overflow-hidden pointer-events-none z-30">
        {/* Wave Layer 1: Primary Lime Glow Wave */}
        <div className="flex w-[200%] h-full animate-wave-slow opacity-90 filter drop-shadow-[0_0_8px_rgba(180,255,0,0.7)]">
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nav-wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B4FF00" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#B4FF00" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-1)"
              fillOpacity="0.4"
            />
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18"
              fill="none"
              stroke="#B4FF00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-1)"
              fillOpacity="0.4"
            />
            <path
              d="M0,18 C150,38 350,2 500,22 C650,38 900,2 1200,18"
              fill="none"
              stroke="#B4FF00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Wave Layer 2: Secondary Cyan Counter Wave */}
        <div className="flex w-[200%] h-full animate-wave-fast opacity-80 absolute top-0 left-0 filter drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]">
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nav-wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#B4FF00" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-2)"
              fillOpacity="0.35"
            />
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10"
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-1/2 h-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10 L1200,40 L0,40 Z"
              fill="url(#nav-wave-gradient-2)"
              fillOpacity="0.35"
            />
            <path
              d="M0,10 C200,2 400,36 600,16 C800,2 1000,34 1200,10"
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </nav>
  );
};
