import { Router, Response } from "express";
import { db } from "../store/sqliteDb.js";
import { authenticateJwt, AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const historyRouter = Router();

// GET /api/v1/history
historyRouter.get("/", (_req: AuthenticatedRequest, res: Response) => {
  const history = db.getExecutionHistory(50);
  res.json({ total: history.length, history });
});

// DELETE /api/v1/history/:id
historyRouter.delete("/:id", (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteExecutionRecord(id as string);
  res.json({ success: deleted, id });
});

// DELETE /api/v1/history (Clear all execution history logs)
historyRouter.delete("/", (_req: AuthenticatedRequest, res: Response) => {
  db.clearExecutionHistory();
  res.json({ success: true });
});

// GET /api/v1/user/usage
historyRouter.get("/usage", (_req: AuthenticatedRequest, res: Response) => {
  const history = db.getExecutionHistory(500);
  const today = new Date().toISOString().split("T")[0];

  const todayCount = history.filter((h) => h.createdAt.startsWith(today)).length;

  res.json({
    plan: "free",
    dailyLimit: 50,
    usedToday: todayCount,
    remainingToday: Math.max(0, 50 - todayCount),
    totalExecutions: history.length,
    cpuCapSeconds: 10,
    concurrentLimit: 1,
  });
});

// GET /api/v1/user/developer-profile (Streaks, Heatmap, Language Mastery, Developer Metrics)
historyRouter.get(
  "/developer-profile",
  authenticateJwt(false),
  (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId || (req.query.userId as string);
    const userEmail = req.user?.email || (req.query.email as string);
    const stats = db.getDeveloperProfileStats(userId, userEmail);
    res.json(stats);
  }
);

// POST /api/v1/user/streak/ping
historyRouter.post(
  "/streak/ping",
  authenticateJwt(false),
  (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId || (req.body.userId as string);
    const userEmail = req.user?.email || (req.body.email as string);
    const stats = db.getDeveloperProfileStats(userId, userEmail);
    res.json({
      success: true,
      message: "Developer activity ping recorded",
      streak: stats.streak,
    });
  }
);
