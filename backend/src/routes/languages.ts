import { Router, Request, Response } from "express";
import { LANGUAGES, VERIFIED_ACTIVE_LANGUAGE_IDS } from "../data/languages.js";

import { transpileCode } from "../runners/codeTranspiler.js";

export const languagesRouter = Router();

// GET /api/v1/languages
languagesRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    total: LANGUAGES.length,
    activeCount: LANGUAGES.filter((l) => l.status === "active").length,
    comingSoonCount: LANGUAGES.filter((l) => l.status === "coming_soon").length,
    languages: LANGUAGES,
  });
});

// POST /api/v1/languages/transpile (Universal Cross-Language Code Transpiler)
languagesRouter.post("/transpile", (req: Request, res: Response) => {
  const { sourceLanguage, targetLanguage, code } = req.body;

  if (!sourceLanguage || !targetLanguage || typeof code !== "string") {
    res.status(400).json({ error: "sourceLanguage, targetLanguage, and code string are required" });
    return;
  }

  const result = transpileCode({ sourceLanguage, targetLanguage, code });
  res.json(result);
});
