import "dotenv/config";

// Refuse to start if JWT_SECRET isn't configured
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("❌ FATAL CONFIGURATION ERROR: JWT_SECRET is not set in environment variables (.env).");
  console.error("Refusing to start server in insecure configuration.");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { executeRouter } from "./routes/execute.js";
import { languagesRouter } from "./routes/languages.js";
import { snippetsRouter } from "./routes/snippets.js";
import { authRouter } from "./routes/auth.js";
import { historyRouter } from "./routes/history.js";
import { feedbackRouter } from "./routes/feedback.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests without origin (e.g. curl, health checks, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Health Check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Codeticz Compiler Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/execute", executeRouter);
app.use("/api/v1/languages", languagesRouter);
app.use("/api/v1/snippets", snippetsRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/user", historyRouter);
app.use("/api/v1/feedback", feedbackRouter);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err.message === "string" && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`🚀 Codeticz Backend Server running on http://localhost:${PORT}`);
  console.log(`⚡ Execution Engine & Persistent DB ready`);
});
