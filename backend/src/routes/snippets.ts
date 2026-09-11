import { Router, Request, Response } from "express";
import { db } from "../store/sqliteDb.js";

export const snippetsRouter = Router();

// GET /api/v1/snippets (Public Snippets / Gallery)
snippetsRouter.get("/", (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const q = req.query.q as string | undefined;

  const list = db.getAllPublicSnippets(lang, q);
  res.json({ total: list.length, snippets: list });
});

// GET /api/v1/snippets/:id
snippetsRouter.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const snippet = db.getSnippetById(id);

  if (!snippet) {
    res.status(404).json({ error: "Snippet not found" });
    return;
  }
  res.json(snippet);
});

// GET /api/v1/snippets/:id/embed (Embed Code Generator)
snippetsRouter.get("/:id/embed", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const snippet = db.getSnippetById(id);

  if (!snippet) {
    res.status(404).json({ error: "Snippet not found" });
    return;
  }

  const frontendUrl = "http://localhost:5173";
  const embedHtml = `<iframe src="${frontendUrl}/editor?lang=${snippet.language}&embed=true" width="100%" height="500" frameborder="0" style="border-radius:16px; border:1px solid #173525;"></iframe>`;
  
  res.json({
    snippetId: snippet.id,
    title: snippet.title,
    embedHtml,
    directUrl: `${frontendUrl}/editor?lang=${snippet.language}`,
  });
});

// POST /api/v1/snippets (Create or Save Snippet)
snippetsRouter.post("/", (req: Request, res: Response) => {
  const { title, language, code, stdin, visibility, userId } = req.body;

  if (!language || typeof code !== "string") {
    res.status(400).json({ error: "Language and code are required" });
    return;
  }

  const newSnippet = db.saveSnippet({
    userId,
    title,
    language,
    code,
    stdin,
    visibility: visibility || "public",
  });

  res.status(201).json(newSnippet);
});

// PATCH /api/v1/snippets/:id (Update Snippet)
snippetsRouter.patch("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.getSnippetById(id);

  if (!existing) {
    res.status(404).json({ error: "Snippet not found" });
    return;
  }

  const updated = db.saveSnippet({
    ...existing,
    ...req.body,
    id,
  });

  res.json(updated);
});

// DELETE /api/v1/snippets/:id
snippetsRouter.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const success = db.deleteSnippet(id);

  if (!success) {
    res.status(404).json({ error: "Snippet not found" });
    return;
  }

  res.json({ message: "Snippet deleted successfully", id });
});

// POST /api/v1/snippets/:id/fork
snippetsRouter.post("/:id/fork", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const original = db.getSnippetById(id);

  if (!original) {
    res.status(404).json({ error: "Original snippet not found" });
    return;
  }

  const forked = db.saveSnippet({
    title: `Fork of ${original.title}`,
    language: original.language,
    code: original.code,
    stdin: original.stdin,
    visibility: "public",
    forkOf: original.id,
  });

  res.status(201).json(forked);
});

// POST /api/v1/snippets/:id/star
snippetsRouter.post("/:id/star", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = db.starSnippet(id);

  if (!updated) {
    res.status(404).json({ error: "Snippet not found" });
    return;
  }

  res.json(updated);
});
