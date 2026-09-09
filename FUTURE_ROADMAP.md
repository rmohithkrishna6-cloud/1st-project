# Nexora IDE — Future Engineering Roadmap

This document outlines planned architectural features, infrastructure expansions, and interactive terminal engines deferred for future development milestones.

---

## 1. Interactive Real-Time PTY / WebSocket Terminal Engine
- **Goal**: Transition from batch `stdin` mode to live bidirectional streaming interactive terminal sessions (matching Programiz/Replit).
- **Architecture & Components**:
  - **Backend WebSocket Server**: Node.js `ws` / `socket.io` server attached to Express.
  - **Container PTY Session**: `node-pty` piping interactive container streams (`docker run -i -t --network none --memory 128m`).
  - **Frontend Terminal Canvas**: `@xterm/xterm` with `@xterm/addon-fit` replacing static `<pre>` blocks to support real-time keystroke input, mid-program `input()` prompts, and ANSI cursor positioning.
- **Estimated Effort**: ~12–17 Hours of core development and container isolation security hardening.

---

## 2. Production OAuth 2.0 Provider Integrations
- **Goal**: Replace the current simulated development OAuth callback endpoint with production authentication flows.
- **Integrations**:
  - **GitHub OAuth 2.0**: Live Authorization Code flow with `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
  - **Google OAuth 2.0 / OpenID Connect**: Live Identity token authentication with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **User Profile Sync**: Synchronize avatars, emails, and persistent user profiles to PostgreSQL.

---

## 3. Pending Cloud Execution Languages (20 Languages)
- **Goal**: Deploy dedicated cloud runner containers for languages not currently indexable in Piston local container instances.
- **Tracked Languages**:
  1. **Zig** (`zig`) — LLVM build CPU sandbox optimization (>15s timeout limit resolution)
  2. **Clojure** (`clojure`) — JVM cold-start CPU pre-warming optimization
  3. **F#** (`fsharp`) — Dotnet SDK container template file rename resolution
  4. **Kotlin** (`kotlin`) — JVM execution engine worker pool
  5. **Scala** (`scala`) — JVM execution engine worker pool
  6. **Chapel** (`chapel`)
  7. **Ballerina** (`ballerina`)
  8. **Gleam** (`gleam`)
  9. **Hack (HHVM)** (`hack`)
  10. **Factor** (`factor`)
  11. **Coq** (`coq`)
  12. **Agda** (`agda`)
  13. **Lean** (`lean`)
  14. **Objective-C** (`objc`)
  15. **Tcl** (`tcl`)
  16. **Reason** (`reason`)
  17. **PureScript** (`purescript`)
  18. **Idris** (`idris`)
  19. **Ada** (`ada`)
  20. **Scheme** (`scheme`)

---

## 4. Cloud Infrastructure & Distributed Scaling
- **Judge0 Worker Clusters**: Multi-node Judge0 sandbox execution cluster with Redis queue load balancing.
- **PostgreSQL Database Replication**: Read-replicas for snippet gallery query performance.
- **Monaco Editor Collaborative Editing**: Real-time multi-user pair programming using WebSockets & Yjs CRDTs.

---

*Last Updated: 2026-08-26*
