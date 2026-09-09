import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { prisma, seedPrismaDatabase } from "./prismaClient.js";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  avatarUrl: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
  lastLoginAt: string;
}

export interface SnippetRecord {
  id: string;
  userId?: string;
  title: string;
  language: string;
  code: string;
  stdin: string;
  visibility: "public" | "unlisted" | "private";
  forkOf?: string;
  views: number;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionRecord {
  id: string;
  snippetId?: string;
  userId?: string;
  language: string;
  code?: string;
  stdin?: string;
  status: "success" | "error" | "timeout" | "compilation_error";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  wallTimeMs: number;
  memoryKb: number;
  createdAt: string;
}

export interface FeedbackRecord {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  category: "bug" | "feature" | "general" | "performance";
  title: string;
  message: string;
  upvotes: number;
  status: "new" | "reviewing" | "resolved";
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

class PrismaPersistentStore {
  private inMemUsers: Map<string, UserRecord> = new Map();
  private inMemSnippets: Map<string, SnippetRecord> = new Map();
  private inMemExecutions: ExecutionRecord[] = [];
  private inMemFeedbacks: FeedbackRecord[] = [];

  constructor() {
    this.seedDefaults();
    this.seedFeedbacks();
    this.initAsync();
  }

  private async initAsync() {
    await seedPrismaDatabase().catch(() => {});
    await this.loadFromDatabase().catch(() => {});
  }

  async loadFromDatabase(): Promise<void> {
    try {
      // 1. Load users from PostgreSQL
      const dbUsers = await prisma.user.findMany();
      for (const u of dbUsers) {
        let pwHash = u.passwordHash || undefined;
        if (pwHash && !pwHash.startsWith("$2")) {
          pwHash = bcrypt.hashSync(pwHash, 10);
          prisma.user
            .update({
              where: { id: u.id },
              data: { passwordHash: pwHash },
            })
            .catch(() => {});
        }
        this.inMemUsers.set(u.id, {
          id: u.id,
          email: u.email,
          passwordHash: pwHash,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`,
          plan: (u.plan as any) || "free",
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt.toISOString(),
        });
      }

      // 2. Load snippets from PostgreSQL
      const dbSnippets = await prisma.snippet.findMany();
      for (const s of dbSnippets) {
        this.inMemSnippets.set(s.id, {
          id: s.id,
          userId: s.userId || undefined,
          title: s.title,
          language: s.language,
          code: s.code,
          stdin: s.stdin || "",
          visibility: (s.visibility as any) || "public",
          forkOf: s.forkOf || undefined,
          views: s.viewCount,
          stars: s.starCount,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        });
      }

      // 3. Load recent executions from PostgreSQL
      const dbExecs = await prisma.execution.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      });
      this.inMemExecutions = dbExecs.map((e) => ({
        id: e.id,
        snippetId: e.snippetId || undefined,
        userId: e.userId || undefined,
        language: e.language,
        status: (e.status as any) || "success",
        stdout: e.stdout || "",
        stderr: e.stderr || "",
        exitCode: e.exitCode,
        wallTimeMs: e.wallTimeMs || 0,
        memoryKb: e.memoryKb || 0,
        createdAt: e.createdAt.toISOString(),
      }));

      console.log(`⚡ Postgres Hydration: Loaded ${dbUsers.length} users, ${dbSnippets.length} snippets, and ${dbExecs.length} executions from PostgreSQL.`);
    } catch (err: any) {
      console.log("Note: Postgres hydration notice:", err?.message || err);
    }
  }

  private seedDefaults() {
    const demoUser: UserRecord = {
      id: "usr-demo-123",
      email: "developer@nexora.com",
      passwordHash: bcrypt.hashSync("demo123hash", 10),
      displayName: "Mohith Krishna R",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=nexora",
      plan: "free",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    this.inMemUsers.set(demoUser.id, demoUser);

    const defaultSnippets: SnippetRecord[] = [
      {
        id: "demo-fib-python",
        userId: "usr-demo-123",
        title: "Fibonacci Sequence in Python",
        language: "python",
        code: `def fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("Fibonacci(10):", fibonacci(10))`,
        stdin: "",
        visibility: "public",
        views: 128,
        stars: 34,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "demo-web-sandbox",
        userId: "usr-demo-123",
        title: "Nexora Lime UI Card (HTML/CSS)",
        language: "html",
        code: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #0B1A12; color: white; font-family: sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; }\n    .card { background: #0E2117; padding: 2rem; border-radius: 16px; border: 1px solid rgba(180, 255, 0, 0.3); text-align: center; }\n    h2 { color: #B4FF00; margin: 0 0 10px 0; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h2>⚡ Nexora Live Preview</h2>\n    <p>Realtime HTML, CSS, and JS web sandbox rendering</p>\n  </div>\n</body>\n</html>`,
        stdin: "",
        visibility: "public",
        views: 95,
        stars: 21,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "demo-sql-users",
        userId: "usr-demo-123",
        title: "Relational User Queries in SQL",
        language: "sql",
        code: `-- Create users table\nCREATE TABLE users (id INT, name TEXT, role TEXT);\nINSERT INTO users VALUES (1, 'Mohith', 'Architect'), (2, 'Alice', 'Frontend Lead');\nSELECT * FROM users;`,
        stdin: "",
        visibility: "public",
        views: 64,
        stars: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultSnippets.forEach((s) => this.inMemSnippets.set(s.id, s));

    // Seed realistic developer executions over recent days for demo developer
    const now = Date.now();
    const dayMs = 86400000;
    const seedExecs: ExecutionRecord[] = [
      {
        id: "exec-seed-1",
        userId: "usr-demo-123",
        language: "python",
        status: "success",
        stdout: "Fibonacci(10): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 28,
        memoryKb: 14200,
        createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
        code: "def fibonacci(n):\n    return ...",
      },
      {
        id: "exec-seed-2",
        userId: "usr-demo-123",
        language: "typescript",
        status: "success",
        stdout: "⚡ Nexora Fast Runner: TypeScript 5.7 OK",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 42,
        memoryKb: 18400,
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        code: "const version: string = '5.7';\nconsole.log(version);",
      },
      {
        id: "exec-seed-3",
        userId: "usr-demo-123",
        language: "rust",
        status: "success",
        stdout: "Hello from compiled native Rust binary!",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 18,
        memoryKb: 8200,
        createdAt: new Date(now - dayMs - 1000 * 60 * 60).toISOString(),
        code: 'fn main() { println!("Hello from Rust!"); }',
      },
      {
        id: "exec-seed-4",
        userId: "usr-demo-123",
        language: "python",
        status: "success",
        stdout: "Array sorted in 0.002s",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 35,
        memoryKb: 12800,
        createdAt: new Date(now - dayMs * 2 - 1000 * 60 * 120).toISOString(),
        code: "print('Array sorted')",
      },
      {
        id: "exec-seed-5",
        userId: "usr-demo-123",
        language: "cpp",
        status: "success",
        stdout: "Matrix multiplication 100x100 completed",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 14,
        memoryKb: 6500,
        createdAt: new Date(now - dayMs * 3 - 1000 * 60 * 300).toISOString(),
        code: "int main() { return 0; }",
      },
      {
        id: "exec-seed-6",
        userId: "usr-demo-123",
        language: "html",
        status: "success",
        stdout: "Web sandbox DOM rendered",
        stderr: "",
        exitCode: 0,
        wallTimeMs: 8,
        memoryKb: 5000,
        createdAt: new Date(now - dayMs * 4 - 1000 * 60 * 400).toISOString(),
        code: "<h1>Hello Nexora</h1>",
      },
    ];
    this.inMemExecutions = [...seedExecs];
  }

  // USER OPERATIONS
  findUserByEmail(email: string): UserRecord | undefined {
    return Array.from(this.inMemUsers.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  findUserById(id: string): UserRecord | undefined {
    return this.inMemUsers.get(id);
  }

  verifyUserCredentials(email: string, password: string): UserRecord | undefined {
    const user = this.findUserByEmail(email);
    if (!user || !user.passwordHash) return undefined;

    // Standard bcrypt verification
    try {
      if (bcrypt.compareSync(password, user.passwordHash)) {
        return user;
      }
    } catch {
      // Ignore hash format errors and check legacy migration below
    }

    // One-time automatic migration for legacy unhashed passwords
    if (user.passwordHash === password || user.passwordHash === `hash_${password}`) {
      const newHash = bcrypt.hashSync(password, 10);
      user.passwordHash = newHash;
      prisma.user
        .update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        })
        .catch(() => {});
      return user;
    }

    return undefined;
  }

  updateUserPassword(email: string, newPasswordOrHash: string): boolean {
    const user = this.findUserByEmail(email);
    if (!user) return false;
    const finalHash = newPasswordOrHash.startsWith("$2")
      ? newPasswordOrHash
      : bcrypt.hashSync(newPasswordOrHash, 10);
    user.passwordHash = finalHash;
    prisma.user
      .update({
        where: { id: user.id },
        data: { passwordHash: finalHash },
      })
      .catch(() => {});
    return true;
  }

  createUser(data: { email: string; displayName?: string; passwordHash?: string }): UserRecord {
    const passwordHash = data.passwordHash
      ? (data.passwordHash.startsWith("$2") ? data.passwordHash : bcrypt.hashSync(data.passwordHash, 10))
      : "";
    const newUser: UserRecord = {
      id: `usr-${uuidv4().slice(0, 8)}`,
      email: data.email,
      passwordHash,
      displayName: data.displayName || data.email.split("@")[0],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.email}`,
      plan: "free",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    this.inMemUsers.set(newUser.id, newUser);

    // Sync with Prisma PostgreSQL if active
    prisma.user
      .create({
        data: {
          id: newUser.id,
          email: newUser.email,
          passwordHash: newUser.passwordHash,
          displayName: newUser.displayName,
          avatarUrl: newUser.avatarUrl,
          plan: newUser.plan,
        },
      })
      .catch(() => {});

    return newUser;
  }

  // SNIPPET OPERATIONS
  getAllPublicSnippets(langFilter?: string, searchQuery?: string): SnippetRecord[] {
    let list = Array.from(this.inMemSnippets.values()).filter((s) => s.visibility === "public");
    if (langFilter) {
      list = list.filter((s) => s.language.toLowerCase() === langFilter.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getSnippetById(id: string): SnippetRecord | undefined {
    const snippet = this.inMemSnippets.get(id);
    if (snippet) {
      snippet.views += 1;
    }
    return snippet;
  }

  saveSnippet(data: Partial<SnippetRecord>): SnippetRecord {
    const id = data.id || `snp-${uuidv4().slice(0, 8)}`;
    const existing = this.inMemSnippets.get(id);

    const snippet: SnippetRecord = {
      id,
      userId: data.userId || existing?.userId,
      title: data.title || "Untitled Snippet",
      language: data.language || "python",
      code: data.code || "",
      stdin: data.stdin || "",
      visibility: (data.visibility as any) || "public",
      forkOf: data.forkOf || existing?.forkOf,
      views: existing?.views || 0,
      stars: existing?.stars || 0,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemSnippets.set(id, snippet);

    // Sync with Prisma PostgreSQL if active
    prisma.snippet
      .upsert({
        where: { id: snippet.id },
        update: {
          title: snippet.title,
          code: snippet.code,
          stdin: snippet.stdin,
          visibility: snippet.visibility,
          viewCount: snippet.views,
          starCount: snippet.stars,
        },
        create: {
          id: snippet.id,
          userId: snippet.userId,
          language: snippet.language,
          title: snippet.title,
          code: snippet.code,
          stdin: snippet.stdin,
          visibility: snippet.visibility,
          forkOf: snippet.forkOf,
          viewCount: snippet.views,
          starCount: snippet.stars,
        },
      })
      .catch(() => {});

    return snippet;
  }

  deleteSnippet(id: string): boolean {
    const deleted = this.inMemSnippets.delete(id);
    if (deleted) {
      prisma.snippet.delete({ where: { id } }).catch(() => {});
    }
    return deleted;
  }

  starSnippet(id: string): SnippetRecord | undefined {
    const snippet = this.inMemSnippets.get(id);
    if (snippet) {
      snippet.stars += 1;
      prisma.snippet
        .update({
          where: { id },
          data: { starCount: { increment: 1 } },
        })
        .catch(() => {});
    }
    return snippet;
  }

  // EXECUTION LOG OPERATIONS
  recordExecution(data: Omit<ExecutionRecord, "id" | "createdAt">): ExecutionRecord {
    const record: ExecutionRecord = {
      id: `exec-${uuidv4().slice(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.inMemExecutions.unshift(record);

    // Sync with Prisma PostgreSQL if active
    const validUserId = record.userId && this.inMemUsers.has(record.userId) ? record.userId : undefined;
    const validSnippetId = record.snippetId && this.inMemSnippets.has(record.snippetId) ? record.snippetId : undefined;

    prisma.execution
      .create({
        data: {
          id: record.id,
          snippetId: validSnippetId,
          userId: validUserId,
          language: record.language,
          status: record.status,
          stdout: record.stdout,
          stderr: record.stderr,
          exitCode: record.exitCode,
          wallTimeMs: record.wallTimeMs,
          memoryKb: record.memoryKb,
        },
      })
      .catch(() => {});

    return record;
  }

  deleteExecutionRecord(id: string): boolean {
    const initialLen = this.inMemExecutions.length;
    this.inMemExecutions = this.inMemExecutions.filter((e) => e.id !== id);
    const deleted = this.inMemExecutions.length < initialLen;
    if (deleted) {
      prisma.execution.delete({ where: { id } }).catch(() => {});
    }
    return deleted;
  }

  clearExecutionHistory(): void {
    this.inMemExecutions = [];
    prisma.execution.deleteMany({}).catch(() => {});
  }

  getExecutionHistory(limit: number = 50): ExecutionRecord[] {
    return this.inMemExecutions.slice(0, limit);
  }

  // FEEDBACK OPERATIONS
  seedFeedbacks(): void {
    this.inMemFeedbacks = [];
  }

  getAllFeedbacks(): FeedbackRecord[] {
    return [...this.inMemFeedbacks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createFeedback(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    category?: "bug" | "feature" | "general" | "performance";
    title: string;
    message: string;
  }): FeedbackRecord {
    const newFb: FeedbackRecord = {
      id: `fb-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      userName: data.userName || "Anonymous Developer",
      userEmail: data.userEmail || "",
      category: data.category || "bug",
      title: data.title,
      message: data.message,
      upvotes: 1,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    this.inMemFeedbacks.unshift(newFb);
    return newFb;
  }

  upvoteFeedback(id: string): FeedbackRecord | undefined {
    const fb = this.inMemFeedbacks.find((item) => item.id === id);
    if (fb) {
      fb.upvotes += 1;
    }
    return fb;
  }

  // DEVELOPER PROFILE & DAILY STREAKS OPERATIONS
  getDeveloperProfileStats(userId?: string, userEmail?: string): DeveloperProfileStats {
    const user = userId ? this.findUserById(userId) : (userEmail ? this.findUserByEmail(userEmail) : undefined);
    const targetUserId = user?.id || userId || "usr-demo-123";

    // Gather executions for this user
    let userExecs = this.inMemExecutions.filter(
      (e) => e.userId === targetUserId || (user && e.userId === user.id)
    );
    if (userExecs.length === 0 && targetUserId === "usr-demo-123") {
      userExecs = this.inMemExecutions;
    }

    // Snippets by this user
    const userSnippets = Array.from(this.inMemSnippets.values()).filter(
      (s) => s.userId === targetUserId
    );

    // Build dates of activity
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const dayMs = 86400000;

    const dateCounts: Record<string, number> = {};
    for (const e of userExecs) {
      const d = e.createdAt.split("T")[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }

    // Compute Streaks
    const activeDates = new Set(Object.keys(dateCounts));
    const activeToday = activeDates.has(todayStr);

    let currentStreak = 0;
    let checkDate = new Date(now);
    if (!activeToday) {
      // Check if active yesterday to maintain streak
      checkDate = new Date(now.getTime() - dayMs);
    }
    while (activeDates.has(checkDate.toISOString().split("T")[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Longest streak calculation
    const sortedDates = Array.from(activeDates).sort();
    let longestStreak = currentStreak;
    let tempStreak = 0;
    let prevTime = 0;
    for (const dStr of sortedDates) {
      const time = new Date(dStr).getTime();
      if (prevTime === 0 || time - prevTime === dayMs) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      prevTime = time;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // 28-day Activity Heatmap (4 full weeks of 7 days)
    const history30Days: HeatmapDay[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now.getTime() - i * dayMs);
      const dStr = d.toISOString().split("T")[0];
      const count = dateCounts[dStr] || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 8) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      history30Days.push({
        date: dStr,
        count,
        level,
        dayOfWeek: d.getDay(),
      });
    }

    // Weekly checklist (Mon-Sun for current week)
    const currentDayOfWeek = now.getDay();
    const distToMon = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const monday = new Date(now.getTime() - distToMon * dayMs);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyDays: WeeklyDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * dayMs);
      const dStr = d.toISOString().split("T")[0];
      weeklyDays.push({
        day: dayNames[i],
        date: dStr,
        active: activeDates.has(dStr),
        isToday: dStr === todayStr,
      });
    }

    // Developer Metrics
    const totalExecutions = userExecs.length;
    const successCount = userExecs.filter((e) => e.status === "success").length;
    const errorCount = totalExecutions - successCount;
    const successRate = totalExecutions > 0
      ? Math.round((successCount / totalExecutions) * 1000) / 10
      : 100;
    const totalWallTimeMs = userExecs.reduce((acc, cur) => acc + (cur.wallTimeMs || 0), 0);

    // Top Languages Distribution
    const langCounts: Record<string, number> = {};
    for (const e of userExecs) {
      langCounts[e.language] = (langCounts[e.language] || 0) + 1;
    }
    const topLanguages: LanguageUsageStat[] = Object.entries(langCounts)
      .map(([lang, count]) => ({
        language: lang,
        count,
        percentage: totalExecutions > 0 ? Math.round((count / totalExecutions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // XP & Level
    const baseXP = 300;
    const xp = baseXP + (totalExecutions * 40) + (Math.max(1, currentStreak) * 150) + (userSnippets.length * 100);
    const level = Math.floor(xp / 500) + 1;
    const nextLevelXp = 500;
    const xpInLevel = xp % 500;

    let rankTitle = "Novice Coder";
    if (level >= 6) rankTitle = "Senior Systems Architect";
    else if (level >= 5) rankTitle = "Polyglot Engineer";
    else if (level >= 4) rankTitle = "Algorithm Specialist";
    else if (level >= 3) rankTitle = "Compiler Enthusiast";
    else if (level >= 2) rankTitle = "Script Crafter";

    // Min execution time
    const minWallTime = userExecs.length > 0
      ? Math.min(...userExecs.map((e) => e.wallTimeMs || 999))
      : 0;

    // Badges
    const badges: DeveloperBadge[] = [
      {
        id: "first_run",
        name: "First Compile",
        icon: "🚀",
        description: "Executed your first program on the Nexora Engine",
        unlocked: totalExecutions > 0,
        unlockedAt: userExecs[userExecs.length - 1]?.createdAt,
      },
      {
        id: "speed_demon",
        name: "Sub-50ms Demon",
        icon: "⚡",
        description: "Achieved an ultra-fast execution time under 50ms",
        unlocked: minWallTime > 0 && minWallTime <= 50,
      },
      {
        id: "streak_flame",
        name: "Streak Flamekeeper",
        icon: "🔥",
        description: "Maintained a 3+ day consecutive active coding streak",
        unlocked: currentStreak >= 3 || longestStreak >= 3,
      },
      {
        id: "polyglot",
        name: "Polyglot Specialist",
        icon: "🌐",
        description: "Compiled and executed code in 3+ distinct programming languages",
        unlocked: topLanguages.length >= 3,
      },
      {
        id: "clean_run",
        name: "Zero Defect",
        icon: "🛡️",
        description: "Maintained a 90%+ code execution success rate",
        unlocked: totalExecutions >= 3 && successRate >= 90,
      },
      {
        id: "cloud_arch",
        name: "Cloud Architect",
        icon: "☁️",
        description: "Saved reusable code snippets to cloud storage",
        unlocked: userSnippets.length > 0,
      },
    ];

    // Recent 8 executions for feed
    const recentActivity = userExecs.slice(0, 8).map((e) => ({
      id: e.id,
      language: e.language,
      status: e.status,
      wallTimeMs: e.wallTimeMs,
      createdAt: e.createdAt,
      codeSnippet: e.code ? e.code.slice(0, 100) : undefined,
    }));

    return {
      streak: {
        currentStreak: Math.max(1, currentStreak),
        longestStreak: Math.max(1, longestStreak),
        activeToday,
        lastActiveDate: sortedDates[sortedDates.length - 1] || todayStr,
        history30Days,
        weeklyDays,
      },
      developerDetails: {
        totalExecutions,
        successCount,
        errorCount,
        successRate,
        totalWallTimeMs,
        snippetsCount: userSnippets.length,
        level,
        xp: xpInLevel,
        nextLevelXp,
        rankTitle,
        onlineStatus: "Online & Compiling",
        engineVersion: "Nexora Isolated Sandbox v1.0.0",
        memberSince: user?.createdAt || "2025-01-01T00:00:00.000Z",
        topLanguages,
        recentActivity,
        badges,
      },
    };
  }
}

export const db = new PrismaPersistentStore();
