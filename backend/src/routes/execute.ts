import { Router, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { executeCode } from "../runners/codeRunner.js";
import { db } from "../store/sqliteDb.js";
import { TtlCache } from "../utils/ttlCache.js";
import { authenticateJwt, AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const executeRouter = Router();

// Rate limiter for code execution:
// - Anonymous users: 5 executions per minute
// - Authenticated free users: 30 executions per minute
// - Pro / Team users: 120 executions per minute
export const executeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: (req: AuthenticatedRequest) => {
    if (req.user) {
      return req.user.plan === "pro" || req.user.plan === "team" ? 120 : 30;
    }
    return 5;
  },
  keyGenerator: (req: AuthenticatedRequest) => {
    if (req.user && req.user.userId) {
      return `user_${req.user.userId}`;
    }
    return ipKeyGenerator(req.ip || "127.0.0.1");
  },
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: true,
  message: (req: AuthenticatedRequest) => {
    const isAuth = !!req.user;
    const limit = isAuth ? (req.user?.plan === "pro" || req.user?.plan === "team" ? 120 : 30) : 5;
    return {
      error: `Rate limit exceeded. ${
        isAuth
          ? `Your account allows ${limit} executions per minute.`
          : "Anonymous users are limited to 5 executions per minute. Please sign up or log in for 30/min."
      }`,
      status: "rate_limited",
      limit,
      retryAfterSeconds: 60,
    };
  },
});

// Bounded TTL-based cache for execution results (1 hour TTL, max 5,000 items)
export const executionResultsStore = new TtlCache<string, any>(60 * 60 * 1000, 5000);

// POST /api/v1/execute
executeRouter.post(
  "/",
  authenticateJwt(false),
  executeRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { language, code, stdin, snippetId, userId } = req.body;

    if (!language || typeof code !== "string") {
      res.status(400).json({ error: "Missing required fields: language and code" });
      return;
    }

    try {
      const result = await executeCode(language, code, stdin || "");
      executionResultsStore.set(result.submissionId, result);

      // Record execution history into persistent store
      db.recordExecution({
        snippetId,
        userId: req.user?.userId || userId,
        language: result.language,
        code,
        stdin: stdin || "",
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        wallTimeMs: result.wallTimeMs,
        memoryKb: result.memoryKb,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to execute code" });
    }
  }
);

// GET /api/v1/execute/:submissionId
executeRouter.get("/:submissionId", (req: AuthenticatedRequest, res: Response) => {
  const submissionId = req.params.submissionId as string;
  const result = executionResultsStore.get(submissionId);

  if (!result) {
    res.status(404).json({ error: "Submission ID not found or has expired" });
    return;
  }

  res.json(result);
});
