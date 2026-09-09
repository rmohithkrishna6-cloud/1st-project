import { Router, Response } from "express";
import { db } from "../store/sqliteDb.js";
import { authenticateJwt, AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const feedbackRouter = Router();

// GET /api/v1/feedback (Public Feed - Shown to All Users)
feedbackRouter.get("/", (_req: AuthenticatedRequest, res: Response) => {
  const feedbacks = db.getAllFeedbacks();
  res.json({ feedbacks });
});

// POST /api/v1/feedback (Submit Bug Report / Feedback)
feedbackRouter.post("/", authenticateJwt(false), (req: AuthenticatedRequest, res: Response) => {
  const { category, title, message, userName, userEmail } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: "Title is required for feedback / bug report" });
    return;
  }

  if (!message || !message.trim()) {
    res.status(400).json({ error: "Description is required for feedback / bug report" });
    return;
  }

  const feedback = db.createFeedback({
    userId: req.user?.userId,
    userName: userName || (req.user ? req.user.email.split("@")[0] : "Anonymous Developer"),
    userEmail: userEmail || req.user?.email || "",
    category: category || "bug",
    title: title.trim(),
    message: message.trim(),
  });

  res.status(201).json({
    feedback,
    message: "Thank you! Your feedback / bug report has been submitted and stored permanently.",
  });
});

// POST /api/v1/feedback/:id/upvote
feedbackRouter.post("/:id/upvote", (_req: AuthenticatedRequest, res: Response) => {
  const id = String(_req.params.id);
  const updated = db.upvoteFeedback(id);

  if (!updated) {
    res.status(404).json({ error: "Feedback item not found" });
    return;
  }

  res.json({ feedback: updated });
});
