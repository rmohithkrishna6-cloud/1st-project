import { v4 as uuidv4 } from "uuid";

export interface Snippet {
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

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
}

class InMemoryStore {
  private snippets: Map<string, Snippet> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    // Seed initial demo snippets
    const demoSnippet: Snippet = {
      id: "demo-fib-python",
      title: "Fibonacci Calculation in Python",
      language: "python",
      code: `def fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("Fibonacci(10):", fibonacci(10))`,
      stdin: "",
      visibility: "public",
      views: 42,
      stars: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.snippets.set(demoSnippet.id, demoSnippet);
  }

  // Snippets
  getAllSnippets(): Snippet[] {
    return Array.from(this.snippets.values()).filter((s) => s.visibility === "public");
  }

  getSnippetById(id: string): Snippet | undefined {
    const snippet = this.snippets.get(id);
    if (snippet) {
      snippet.views += 1;
    }
    return snippet;
  }

  saveSnippet(data: Partial<Snippet>): Snippet {
    const id = data.id || uuidv4();
    const existing = this.snippets.get(id);

    const snippet: Snippet = {
      id,
      title: data.title || "Untitled Snippet",
      language: data.language || "python",
      code: data.code || "",
      stdin: data.stdin || "",
      visibility: data.visibility || "public",
      forkOf: data.forkOf,
      views: existing?.views || 0,
      stars: existing?.stars || 0,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.snippets.set(id, snippet);
    return snippet;
  }

  starSnippet(id: string): Snippet | undefined {
    const snippet = this.snippets.get(id);
    if (snippet) {
      snippet.stars += 1;
    }
    return snippet;
  }
}

export const db = new InMemoryStore();
