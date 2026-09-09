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
    engineVersion: 'Codeticz Isolated Sandbox v1.0.0',
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
        <div className="p-3.5 rounded-2xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#F4F7FB] text-xs flex items-center gap-3 shadow-[0_0_15px_rgba(255,90,31,0.25)] animate-pulse">
          <Sparkles className="w-5 h-5 shrink-0 text-[#FF5A1F]" />
          <div className="flex-1">
            <span className="font-extrabold text-sm block">{welcomeNotice}</span>
            <span className="text-slate-400 text-[11px]">Your daily coding streak and developer activity are live!</span>
          </div>
        </div>
      )}

      {/* Profile Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121620] border border-white/10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5A1F] via-[#FF6D38] to-[#FF304F] text-[#F4F7FB] font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(255,90,31,0.4)] border border-white/20">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            {/* Live Online Glowing Beacon */}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#121620] shadow-[0_0_8px_#34d399] flex items-center justify-center"
              title="Online & Compiling"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#F4F7FB] tracking-tight">
                {user.displayName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5A1F]/15 text-[#FF5A1F] font-mono border border-[#FF5A1F]/30 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Dev
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 font-mono border border-cyan-400/30 uppercase font-semibold">
                {user.plan} tier
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#FF5A1F]" />
                {dev.onlineStatus}
              </span>
              <span>•</span>
              <span className="text-slate-300">{dev.rankTitle}</span>
            </div>
          </div>
        </div>

        {/* Quick Streak Flame Counter in Header */}
        <div className="flex items-center gap-3 bg-[#080A0F] px-4 py-2.5 rounded-xl border border-white/10 shrink-0 shadow-inner">
          <div className="p-2 rounded-lg bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30">
            <Flame className="w-6 h-6 animate-pulse text-[#FF5A1F] fill-[#FF5A1F]/20" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
            <div className="text-lg font-black text-[#F4F7FB] font-mono flex items-center gap-1">
              <span className="text-[#FF5A1F] text-xl">{streak.currentStreak}</span>
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Level & XP Progress Card */}
      <div className="p-4 rounded-2xl bg-[#121620] border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-[#FF5A1F]/15 text-[#FF5A1F] font-mono font-bold text-xs border border-[#FF5A1F]/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Level {dev.level}
            </div>
            <span className="text-xs font-bold text-slate-300">{dev.rankTitle}</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            <span className="text-[#FF5A1F] font-bold">{dev.xp}</span> / {dev.nextLevelXp} XP
          </div>
        </div>

        {/* Flame XP Bar */}
        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#FF5A1F] via-[#FF6D38] to-[#FF304F] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,90,31,0.6)]"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
          <span>+40 XP per execution</span>
          <span>+150 XP per streak day</span>
          <span>Next rank in {dev.nextLevelXp - dev.xp} XP</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center bg-[#080A0F] p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab('streaks')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'streaks'
              ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] shadow-[0_0_12px_rgba(255,90,31,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          Daily Streaks
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'activity'
              ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] shadow-[0_0_12px_rgba(255,90,31,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Developer Stats
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] shadow-[0_0_12px_rgba(255,90,31,0.4)]'
              : 'text-slate-400 hover:text-white'
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
          <div className="p-5 rounded-2xl bg-[#121620] border border-white/10 relative overflow-hidden shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/15 border-2 border-[#FF5A1F]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,90,31,0.3)]">
                  <Flame className="w-8 h-8 text-[#FF5A1F] fill-[#FF5A1F]/20 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span>ACTIVE STREAK</span>
                    <span className="w-1 h-1 rounded-full bg-[#FF5A1F]" />
                    <span className="text-[#FF5A1F] font-bold">LOCKED IN</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#F4F7FB] flex items-baseline gap-2">
                    {streak.currentStreak}{' '}
                    <span className="text-sm font-semibold text-slate-400">Days Coding</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {streak.activeToday
                      ? '🔥 Active today! Keep your streak burning tomorrow.'
                      : '⚡ Run code in the editor today to keep your streak alive!'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <div className="px-3 py-1.5 rounded-xl bg-[#080A0F] border border-white/10 flex items-center gap-2 text-xs font-mono">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Longest Streak:</span>
                  <span className="font-bold text-amber-300">{streak.longestStreak} Days</span>
                </div>
                <button
                  onClick={handlePingStreak}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] hover:bg-[#FF6D38] text-[#F4F7FB] text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  {isPinging ? 'Recording...' : 'Check-in Today'}
                </button>
              </div>
            </div>

            {pingMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#F4F7FB] text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {pingMessage}
              </div>
            )}
          </div>

          {/* Weekly Streak Checklist */}
          <div className="p-4 rounded-2xl bg-[#121620] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                This Week's Activity
              </span>
              <span className="text-[11px] font-mono text-slate-500">Mon - Sun</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {streak.weeklyDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                    item.active
                      ? 'bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 shadow-[0_0_10px_rgba(255,90,31,0.2)]'
                      : item.isToday
                      ? 'bg-white/5 border-2 border-[#FF5A1F]'
                      : 'bg-black/30 border border-white/5 opacity-40'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mb-1">{item.day}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.active
                        ? 'bg-[#FF5A1F] text-[#F4F7FB]'
                        : item.isToday
                        ? 'bg-[#FF5A1F]/20 text-[#FF5A1F]'
                        : 'bg-white/5 text-white/20'
                    }`}
                  >
                    {item.active ? (
                      <Flame className="w-3.5 h-3.5 fill-[#F4F7FB]" />
                    ) : item.isToday ? (
                      <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 28-Day Activity Heatmap Grid */}
          <div className="p-4 rounded-2xl bg-[#121620] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  28-Day Activity Heatmap
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Daily code compilation and execution frequency
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
                <span className="w-2.5 h-2.5 rounded bg-[#FF5A1F]/30" />
                <span className="w-2.5 h-2.5 rounded bg-[#FF5A1F]" />
                <span className="w-2.5 h-2.5 rounded bg-[#F4F7FB] shadow-[0_0_6px_#F4F7FB]" />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 p-2 rounded-xl bg-[#080A0F] border border-white/5">
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
                      return 'bg-[#F4F7FB] border-[#F4F7FB] shadow-[0_0_8px_rgba(244,247,251,0.6)]';
                    case 3:
                      return 'bg-[#FF304F] border-[#FF304F]';
                    case 2:
                      return 'bg-[#FF5A1F] border-[#FF5A1F]';
                    case 1:
                      return 'bg-[#FF5A1F]/30 border-[#FF5A1F]/40';
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
                      <span className="text-[9px] font-mono font-bold text-[#080A0F]">
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
                <span className="text-[#F4F7FB] bg-[#1A202C] px-3 py-0.5 rounded-full border border-white/10">
                  📅 {hoveredDay.date}:{' '}
                  <strong className="text-[#FF5A1F] font-bold">{hoveredDay.count} code runs</strong>
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">Hover over squares to inspect daily runs</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER ACTIVE DETAILS & STATS */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Zap className="w-4 h-4 text-[#FF5A1F]" />
                <span>Total Runs</span>
              </div>
              <div className="text-xl font-extrabold text-[#F4F7FB] font-mono">
                {dev.totalExecutions}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                Active coder
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Success Rate</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-300 font-mono">
                {dev.successRate}%
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {dev.successCount} ok / {dev.errorCount} err
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Wall Time</span>
              </div>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">
                {dev.totalWallTimeMs}
                <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Engine sandbox</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Snippets</span>
              </div>
              <div className="text-xl font-extrabold text-purple-300 font-mono">
                {dev.snippetsCount}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Cloud Synced</span>
            </div>
          </div>

          {/* Polyglot Language Distribution */}
          <div className="p-4 rounded-2xl bg-[#121620] border border-white/10">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#FF5A1F]" />
              Polyglot Language Mastery
            </h4>

            {dev.topLanguages && dev.topLanguages.length > 0 ? (
              <div className="space-y-2.5">
                {dev.topLanguages.map((lang, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold capitalize text-[#F4F7FB] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                        {lang.language}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {lang.count} runs ({lang.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#080A0F] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] rounded-full transition-all duration-500"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Run scripts across multiple languages to build your polyglot chart!
              </p>
            )}
          </div>

          {/* Recent Developer Activity Feed */}
          <div className="p-4 rounded-2xl bg-[#121620] border border-white/10">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Recent Execution Activity
            </h4>

            {dev.recentActivity && dev.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {dev.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#080A0F] border border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[#F4F7FB] font-bold capitalize">
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
                        <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[200px] hidden sm:inline">
                          {act.codeSnippet}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
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
              <p className="text-xs text-slate-500 italic">
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
                    ? 'bg-[#121620] border-[#FF5A1F]/30 shadow-md'
                    : 'bg-black/30 border-white/5 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    badge.unlocked
                      ? 'bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 text-[#FF5A1F]'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#F4F7FB]">{badge.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        badge.unlocked
                          ? 'bg-[#FF5A1F]/20 text-[#FF5A1F]'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
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
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#FF5A1F] hover:bg-[#FF6D38] active:bg-[#E04812] text-[#F4F7FB] rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,90,31,0.4)]"
          >
            <span>Launch Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/gallery');
            }}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-white rounded-xl font-bold text-xs border border-white/10 transition-colors"
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

export default DeveloperProfileView;
