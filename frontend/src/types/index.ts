export interface LanguageConfig {
  id: string;
  name: string;
  category: string;
  version: string;
  monacoLanguage: string;
  icon: string;
  defaultCode: string;
  fileExtension: string;
  status?: 'active' | 'coming_soon';
}

export interface ExecutionResult {
  submissionId: string;
  language: string;
  code?: string;
  stdin?: string;
  status: 'success' | 'error' | 'timeout' | 'compilation_error';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  wallTimeMs: number;
  memoryKb: number;
  createdAt?: string;
}

export interface Snippet {
  id: string;
  userId?: string;
  title: string;
  language: string;
  code: string;
  stdin: string;
  visibility: 'public' | 'unlisted' | 'private';
  forkOf?: string;
  views: number;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro' | 'team';
}

export interface FeedbackItem {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  category: 'bug' | 'feature' | 'general' | 'performance';
  title: string;
  message: string;
  upvotes: number;
  status: 'new' | 'reviewing' | 'resolved';
  createdAt: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number;
}

export interface WeeklyDay {
  day: string;
  date: string;
  active: boolean;
  isToday: boolean;
}

export interface DeveloperBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LanguageUsageStat {
  language: string;
  count: number;
  percentage: number;
}

export interface DeveloperProfileStats {
  streak: {
    currentStreak: number;
    longestStreak: number;
    activeToday: boolean;
    lastActiveDate: string;
    history30Days: HeatmapDay[];
    weeklyDays: WeeklyDay[];
  };
  developerDetails: {
    totalExecutions: number;
    successCount: number;
    errorCount: number;
    successRate: number;
    totalWallTimeMs: number;
    snippetsCount: number;
    level: number;
    xp: number;
    nextLevelXp: number;
    rankTitle: string;
    onlineStatus: string;
    engineVersion: string;
    memberSince: string;
    topLanguages: LanguageUsageStat[];
    recentActivity: Array<{
      id: string;
      language: string;
      status: string;
      wallTimeMs: number;
      createdAt: string;
      codeSnippet?: string;
    }>;
    badges: DeveloperBadge[];
  };
}
