# Nexora — Project Specification

## 1. What This Is

Nexora is an online multi-language compiler/execution platform (like Programiz.com / OneCompiler.com). Users pick a language, write code in a browser-based editor, run it, and see output — no setup, no signup required to try it.

**Target scope: 128 languages** across Popular, Programming, Web, Query/Database, Markup/Data, Mobile, Cloud/Containers, Scripting, JVM, .NET, Functional, Systems, Scientific, Educational, and Esoteric categories.

Build in phases — do not attempt all 128 languages at once. MVP = ~10-30 languages, end-to-end, working solidly, before expanding.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Frontend state | TanStack Query (server state) + Zustand (UI state) |
| Backend API | Node.js — Express / Fastify |
| Database | SQLite (development) / PostgreSQL |
| Execution engine | Sandboxed runner with timeout / Judge0 support |

---

## 3. Design System (already established — preserve exactly)

Source of truth: `01-Nexora_-_Home.html`.

- Font: `Plus Jakarta Sans`
- Colors: `--primary: #B4FF00` (lime accent), `--deep-matrix: #0B1A12` (background), `--surface: #0E2117`
- Style language: neomorphism (`neo-flat`, `neo-inset`, `neo-button` classes) + glassmorphism (`glass-box`, backdrop-blur) on a dark background
- Motion: mouse-reactive blurred gradient blobs (`#motion-bg`)
- Icons: Font Awesome 6
- All new UI must reuse these existing CSS variables/classes.
