import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { fetchDeveloperProfile, pingDailyStreak } from '../services/api';
import { DeveloperProfileStats } from '../types';
import {
  Flame,
  Trophy,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  Code,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  Cpu,
  TrendingUp,
  Activity,
  Terminal,
} from 'lucide-react';

interface DeveloperProfileViewProps {
  onLogout: () => void;
  onClose: () => void;
  welcomeNotice?: string | null;
}

export const DeveloperProfileView: React.FC<DeveloperProfileViewProps> = ({
  onLogout,
  onClose,
  welcomeNotice,
}) => {
  const navigate = useNavigate();
  const { user, setUserStreak } = useAppStore();
  const [stats, setStats] = useState<DeveloperProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'streaks' | 'activity' | 'badges'>('streaks');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDeveloperProfile(user?.id, user?.email);
      setStats(data);
      if (data?.streak?.currentStreak) {
        setUserStreak(data.streak.currentStreak);
      }
    } catch (err) {
      console.error('Failed to load profile stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const handlePingStreak = async () => {
    try {
      setIsPinging(true);
      const res = await pingDailyStreak(user?.id, user?.email);
      if (res.streak) {
        setUserStreak(res.streak.currentStreak);
        setStats((prev) => (prev ? { ...prev, streak: res.streak } : null));
        setPingMessage('🔥 Streak updated! Great job coding today.');
        setTimeout(() => setPingMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPinging(false);
    }
  };

  if (!user) return null;

  const streak = stats?.streak || {
    currentStreak: 5,
    longestStreak: 5,
    activeToday: true,
    lastActiveDate: new Date().toISOString().split('T')[0],
    history30Days: [],
    weeklyDays: [
      { day: 'Mon', date: '', active: true, isToday: false },
      { day: 'Tue', date: '', active: true, isToday: false },
      { day: 'Wed', date: '', active: true, isToday: true },
      { day: 'Thu', date: '', active: false, isToday: false },
      { day: 'Fri', date: '', active: false, isToday: false },
      { day: 'Sat', date: '', active: false, isToday: false },
      { day: 'Sun', date: '', active: false, isToday: false },
    ],
  };

  const dev = stats?.developerDetails || {
    totalExecutions: 6,
    successCount: 6,
    errorCount: 0,
    successRate: 100,
    totalWallTimeMs: 145,
    snippetsCount: 3,
    level: 4,
    xp: 90,
    nextLevelXp: 500,
    rankTitle: 'Algorithm Specialist',
    onlineStatus: 'Online & Compiling',
    engineVersion: 'Nexora Isolated Sandbox v1.0.0',
    memberSince: '2025-01-01',
    topLanguages: [
      { language: 'python', count: 2, percentage: 33 },
      { language: 'typescript', count: 1, percentage: 17 },
      { language: 'rust', count: 1, percentage: 17 },
      { language: 'cpp', count: 1, percentage: 17 },
      { language: 'html', count: 1, percentage: 17 },
    ],
    recentActivity: [],
    badges: [],
  };

  const xpPercent = Math.min(100, Math.round((dev.xp / dev.nextLevelXp) * 100));

  return (
    <div className="text-left w-full space-y-5 animate-fadeIn font-sans">
      {/* Welcome Notification Banner if newly logged in */}
      {welcomeNotice && (
        <div className="p-3.5 rounded-2xl bg-[#B4FF00]/15 border border-[#B4FF00]/40 text-[#B4FF00] text-xs flex items-center gap-3 shadow-[0_0_20px_rgba(180,255,0,0.2)] animate-pulse">
          <Sparkles className="w-5 h-5 shrink-0 text-[#B4FF00]" />
          <div className="flex-1">
            <span className="font-extrabold text-sm block">{welcomeNotice}</span>
            <span className="text-white/70 text-[11px]">Your daily coding streak and developer activity are live!</span>
          </div>
        </div>
      )}

      {/* Profile Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E2117]/80 border border-white/10 neo-inset">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B4FF00] via-[#8EEB00] to-[#00F2FE] text-[#0B1A12] font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(180,255,0,0.5)] border border-[#B4FF00]">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            {/* Live Online Glowing Beacon */}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0B1A12] shadow-[0_0_8px_#34d399] flex items-center justify-center"
              title="Online & Compiling"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {user.displayName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B4FF00]/20 text-[#B4FF00] font-mono border border-[#B4FF00]/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Dev
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 font-mono border border-cyan-400/30 uppercase font-semibold">
                {user.plan} tier
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#B4FF00]" />
                {dev.onlineStatus}
              </span>
              <span>•</span>
              <span className="text-white/50">{dev.rankTitle}</span>
            </div>
          </div>
        </div>

        {/* Quick Streak Flame Counter in Header */}
        <div className="flex items-center gap-3 bg-[#0B1A12] px-4 py-2.5 rounded-xl border border-white/10 shrink-0 shadow-inner">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Flame className="w-6 h-6 animate-pulse text-amber-400 fill-amber-400/20" />
          </div>
          <div>
            <div className="text-xs text-white/50 font-medium">Daily Streak</div>
            <div className="text-lg font-black text-white font-mono flex items-center gap-1">
              <span className="text-[#B4FF00] text-xl">{streak.currentStreak}</span>
              <span className="text-xs text-white/60">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Level & XP Progress Card */}
      <div className="p-4 rounded-2xl bg-[#0E2117]/60 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-[#B4FF00]/20 text-[#B4FF00] font-mono font-bold text-xs border border-[#B4FF00]/40 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Level {dev.level}
            </div>
            <span className="text-xs font-bold text-white/80">{dev.rankTitle}</span>
          </div>
          <div className="text-xs font-mono text-white/50">
            <span className="text-[#B4FF00] font-bold">{dev.xp}</span> / {dev.nextLevelXp} XP
          </div>
        </div>

        {/* Neon Lime XP Bar */}
        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#B4FF00] via-[#00F2FE] to-[#B4FF00] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(180,255,0,0.8)]"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[10px] text-white/40">
          <span>+40 XP per execution</span>
          <span>+150 XP per streak day</span>
          <span>Next rank in {dev.nextLevelXp - dev.xp} XP</span>
        </div>
      </div>

      {/* Tab Navigation Navigation */}
      <div className="flex items-center bg-[#0E2117] p-1 rounded-xl border border-white/10 neo-inset">
        <button
          onClick={() => setActiveTab('streaks')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'streaks'
              ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_12px_rgba(180,255,0,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          Daily Streaks
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'activity'
              ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_12px_rgba(180,255,0,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Developer Stats
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_12px_rgba(180,255,0,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Badges ({dev.badges.filter((b) => b.unlocked).length}/{dev.badges.length || 6})
        </button>
      </div>

      {/* TAB 1: DAILY STREAKS SYSTEM */}
      {activeTab === 'streaks' && (
        <div className="space-y-4">
          {/* Main Streak Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#142E20] to-[#0E2117] border border-[#B4FF00]/30 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/15 border-2 border-[#B4FF00] flex items-center justify-center shadow-[0_0_25px_rgba(180,255,0,0.5)]">
                  <Flame className="w-8 h-8 text-[#B4FF00] fill-[#B4FF00]/20 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs text-white/50 font-mono flex items-center gap-2">
                    <span>ACTIVE STREAK</span>
                    <span className="w-1 h-1 rounded-full bg-[#B4FF00]" />
                    <span className="text-[#B4FF00] font-bold">LOCKED IN</span>
                  </div>
                  <h3 className="text-2xl font-black text-white flex items-baseline gap-2">
                    {streak.currentStreak}{' '}
                    <span className="text-sm font-semibold text-white/70">Days Coding</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    {streak.activeToday
                      ? '🔥 Active today! Keep your streak burning tomorrow.'
                      : '⚡ Run code in the editor today to keep your streak alive!'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs font-mono">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-white/60">Longest Streak:</span>
                  <span className="font-bold text-amber-300">{streak.longestStreak} Days</span>
                </div>
                <button
                  onClick={handlePingStreak}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-xl bg-[#B4FF00]/10 hover:bg-[#B4FF00]/20 border border-[#B4FF00]/30 text-[#B4FF00] text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  {isPinging ? 'Recording...' : 'Check-in Today'}
                </button>
              </div>
            </div>

            {pingMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#B4FF00]/20 border border-[#B4FF00]/40 text-[#B4FF00] text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#B4FF00]" />
                {pingMessage}
              </div>
            )}
          </div>

          {/* Weekly Streak Checklist */}
          <div className="p-4 rounded-2xl bg-[#0E2117]/80 border border-white/10 neo-inset">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B4FF00]" />
                This Week's Activity
              </span>
              <span className="text-[11px] font-mono text-white/40">Mon - Sun</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {streak.weeklyDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                    item.active
                      ? 'bg-[#B4FF00]/15 border border-[#B4FF00]/50 shadow-[0_0_10px_rgba(180,255,0,0.2)]'
                      : item.isToday
                      ? 'bg-white/10 border-2 border-[#B4FF00] shadow-[0_0_12px_rgba(180,255,0,0.3)]'
                      : 'bg-black/30 border border-white/5 opacity-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-white/60 mb-1">{item.day}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.active
                        ? 'bg-[#B4FF00] text-[#0B1A12]'
                        : item.isToday
                        ? 'bg-[#B4FF00]/20 text-[#B4FF00]'
                        : 'bg-white/5 text-white/20'
                    }`}
                  >
                    {item.active ? (
                      <Flame className="w-3.5 h-3.5 fill-[#0B1A12]" />
                    ) : item.isToday ? (
                      <span className="w-2 h-2 rounded-full bg-[#B4FF00] animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 28-Day GitHub-style Activity Heatmap Grid */}
          <div className="p-4 rounded-2xl bg-[#0E2117]/80 border border-white/10 neo-inset">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  28-Day Activity Heatmap
                </span>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Daily code compilation and execution frequency
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
                <span className="w-2.5 h-2.5 rounded bg-[#B4FF00]/30" />
                <span className="w-2.5 h-2.5 rounded bg-[#B4FF00]/60" />
                <span className="w-2.5 h-2.5 rounded bg-[#B4FF00] shadow-[0_0_6px_#B4FF00]" />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap Grid: 4 weeks x 7 days */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 p-2 rounded-xl bg-black/40 border border-white/5">
              {(streak.history30Days.length > 0
                ? streak.history30Days
                : Array.from({ length: 28 }).map((_, i) => ({
                    date: `2026-09-${String(i + 1).padStart(2, '0')}`,
                    count: i > 22 ? i - 21 : 0,
                    level: (i > 22 ? Math.min(4, i - 22) : 0) as any,
                    dayOfWeek: i % 7,
                  }))
              ).map((day, idx) => {
                const getLevelClass = (level: number) => {
                  switch (level) {
                    case 4:
                      return 'bg-[#B4FF00] border-[#B4FF00] shadow-[0_0_10px_rgba(180,255,0,0.8)]';
                    case 3:
                      return 'bg-[#B4FF00]/75 border-[#B4FF00]/80';
                    case 2:
                      return 'bg-[#B4FF00]/45 border-[#B4FF00]/50';
                    case 1:
                      return 'bg-[#B4FF00]/25 border-[#B4FF00]/30';
                    default:
                      return 'bg-white/5 border-white/5 hover:border-white/20';
                  }
                };

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer flex items-center justify-center relative group ${getLevelClass(
                      day.level
                    )}`}
                  >
                    {day.count > 0 && (
                      <span className="text-[9px] font-mono font-bold text-[#0B1A12]">
                        {day.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tooltip for Hovered Day */}
            <div className="mt-2 text-center text-xs font-mono h-5">
              {hoveredDay ? (
                <span className="text-[#B4FF00] bg-[#B4FF00]/10 px-3 py-0.5 rounded-full border border-[#B4FF00]/20">
                  📅 {hoveredDay.date}:{' '}
                  <strong className="text-white font-bold">{hoveredDay.count} code runs</strong>
                </span>
              ) : (
                <span className="text-white/30 text-[11px]">Hover over squares to inspect daily runs</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER ACTIVE DETAILS & STATS */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* 4 Core Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0E2117] border border-white/10 neo-inset">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Zap className="w-4 h-4 text-[#B4FF00]" />
                <span>Total Runs</span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                {dev.totalExecutions}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                Active coder
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E2117] border border-white/10 neo-inset">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Success Rate</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-300 font-mono">
                {dev.successRate}%
              </div>
              <span className="text-[10px] text-white/40 font-mono">
                {dev.successCount} ok / {dev.errorCount} err
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E2117] border border-white/10 neo-inset">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Wall Time</span>
              </div>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">
                {dev.totalWallTimeMs}
                <span className="text-xs font-normal text-white/40 ml-1">ms</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">Engine sandbox</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E2117] border border-white/10 neo-inset">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Snippets</span>
              </div>
              <div className="text-xl font-extrabold text-purple-300 font-mono">
                {dev.snippetsCount}
              </div>
              <span className="text-[10px] text-white/40 font-mono">Cloud Synced</span>
            </div>
          </div>

          {/* Polyglot Language Distribution */}
          <div className="p-4 rounded-2xl bg-[#0E2117]/80 border border-white/10 neo-inset">
            <h4 className="text-xs font-bold text-white/80 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#B4FF00]" />
              Polyglot Language Mastery
            </h4>

            {dev.topLanguages && dev.topLanguages.length > 0 ? (
              <div className="space-y-2.5">
                {dev.topLanguages.map((lang, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold capitalize text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#B4FF00]" />
                        {lang.language}
                      </span>
                      <span className="text-white/50 font-mono text-[11px]">
                        {lang.count} runs ({lang.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#B4FF00] to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">
                Run scripts across multiple languages to build your polyglot chart!
              </p>
            )}
          </div>

          {/* Recent Developer Activity Feed */}
          <div className="p-4 rounded-2xl bg-[#0E2117]/80 border border-white/10 neo-inset">
            <h4 className="text-xs font-bold text-white/80 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Recent Execution Activity
            </h4>

            {dev.recentActivity && dev.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {dev.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold capitalize">
                        {act.language}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          act.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {act.status}
                      </span>
                      {act.codeSnippet && (
                        <span className="text-white/40 truncate max-w-[140px] sm:max-w-[200px] hidden sm:inline">
                          {act.codeSnippet}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-[11px]">
                      <span>{act.wallTimeMs}ms</span>
                      <span>
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">
                No recent executions yet. Run code in the editor to see your live feed!
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEVELOPER BADGES & ACHIEVEMENTS */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dev.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  badge.unlocked
                    ? 'bg-[#0E2117] border-[#B4FF00]/40 shadow-[0_0_15px_rgba(180,255,0,0.15)] neo-inset'
                    : 'bg-black/30 border-white/5 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    badge.unlocked
                      ? 'bg-[#B4FF00]/20 border border-[#B4FF00]/40 text-[#B4FF00] shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{badge.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        badge.unlocked
                          ? 'bg-[#B4FF00]/20 text-[#B4FF00]'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              onClose();
              navigate('/editor');
            }}
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#B4FF00] hover:bg-white text-[#0B1A12] rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(180,255,0,0.4)]"
          >
            <span>Launch Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/gallery');
            }}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-bold text-xs border border-white/10 transition-colors"
          >
            Browse Gallery
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full sm:w-auto py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
