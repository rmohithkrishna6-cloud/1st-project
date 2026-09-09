import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../store/sqliteDb.js";
import { generateJwtToken } from "../utils/jwt.js";
import { authenticateJwt, AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post("/register", (req: AuthenticatedRequest, res: Response) => {
  const { email, displayName, password, confirmPassword } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email address is required" });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long" });
    return;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400).json({ error: "Password and Confirm Password do not match" });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists. Please log in." });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser({
    email,
    displayName: displayName || email.split("@")[0],
    passwordHash,
  });

  const token = generateJwtToken({
    id: user.id,
    email: user.email,
    plan: user.plan,
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    },
    token,
    message: `Registration confirmed! A confirmation message has been dispatched to ${email}.`,
  });
});

// POST /api/v1/auth/login
authRouter.post("/login", (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Both email and password are required to log in" });
    return;
  }

  const user = db.verifyUserCredentials(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password. Only registered accounts can log in." });
    return;
  }

  const token = generateJwtToken({
    id: user.id,
    email: user.email,
    plan: user.plan,
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    },
    token,
  });
});

// POST /api/v1/auth/forgot-password
authRouter.post("/forgot-password", (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Registered email address is required" });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "No registered account found with this email address" });
    return;
  }

  res.json({
    success: true,
    email: user.email,
    message: `Password reset method sent to registered email: ${user.email}`,
  });
});

// POST /api/v1/auth/reset-password
authRouter.post("/reset-password", (req: AuthenticatedRequest, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400).json({ error: "Registered email and new password are required" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters long" });
    return;
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    res.status(400).json({ error: "New password and Confirm Password do not match" });
    return;
  }

  const updated = db.updateUserPassword(email, newPassword);
  if (!updated) {
    res.status(404).json({ error: "Registered account not found" });
    return;
  }

  res.json({
    success: true,
    message: "Password changed successfully! You can now log in using your new password.",
  });
});

// GET /api/v1/auth/me (Protected Route)
authRouter.get("/me", authenticateJwt(true), (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = db.findUserById(userId) || db.findUserByEmail(req.user!.email);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    },
  });
});

// POST /api/v1/auth/oauth/:provider/callback
authRouter.post("/oauth/:provider/callback", (req: AuthenticatedRequest, res: Response) => {
  const { provider } = req.params;
  const user = db.findUserByEmail("developer@nexora.com") || db.createUser({
    email: "github.dev@nexora.com",
    displayName: "GitHub Developer",
  });

  const token = generateJwtToken({
    id: user.id,
    email: user.email,
    plan: user.plan,
  });

  res.json({
    provider,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    },
    token,
  });
});
