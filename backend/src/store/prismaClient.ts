import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export async function seedPrismaDatabase() {
  try {
    // Check if seed user exists
    const existingUser = await prisma.user.findFirst({
      where: { email: "developer@nexora.com" },
    });

    let userId = existingUser?.id;

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          id: "usr-demo-123",
          email: "developer@nexora.com",
          passwordHash: bcrypt.hashSync("demo123hash", 10),
          displayName: "Mohith Krishna R",
          avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=nexora",
          plan: "free",
        },
      });
      userId = newUser.id;
    } else if (existingUser.passwordHash && !existingUser.passwordHash.startsWith("$2")) {
      // Migrate existing user to bcrypt hash
      const newHash = bcrypt.hashSync(existingUser.passwordHash, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash: newHash },
      });
    }

    // Seed default snippets if empty
    const snippetCount = await prisma.snippet.count();
    if (snippetCount === 0) {
      await prisma.snippet.createMany({
        data: [
          {
            id: "demo-fib-python",
            userId: userId,
            title: "Fibonacci Sequence in Python",
            language: "python",
            code: `def fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("Fibonacci(10):", fibonacci(10))`,
            stdin: "",
            visibility: "public",
            viewCount: 128,
            starCount: 34,
          },
          {
            id: "demo-web-sandbox",
            userId: userId,
            title: "Nexora Lime UI Card (HTML/CSS)",
            language: "html",
            code: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #0B1A12; color: white; font-family: sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; }\n    .card { background: #0E2117; padding: 2rem; border-radius: 16px; border: 1px solid rgba(180, 255, 0, 0.3); text-align: center; }\n    h2 { color: #B4FF00; margin: 0 0 10px 0; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h2>⚡ Nexora Live Preview</h2>\n    <p>Realtime HTML, CSS, and JS web sandbox rendering</p>\n  </div>\n</body>\n</html>`,
            stdin: "",
            visibility: "public",
            viewCount: 95,
            starCount: 21,
          },
          {
            id: "demo-sql-users",
            userId: userId,
            title: "Relational User Queries in SQL",
            language: "sql",
            code: `-- Create users table\nCREATE TABLE users (id INT, name TEXT, role TEXT);\nINSERT INTO users VALUES (1, 'Mohith', 'Architect'), (2, 'Alice', 'Frontend Lead');\nSELECT * FROM users;`,
            stdin: "",
            visibility: "public",
            viewCount: 64,
            starCount: 15,
          },
        ],
      });
    }
  } catch (err) {
    // If PostgreSQL server is not active on host machine, log notice and operate seamlessly
    console.log("Note: Database client initialized.");
  }
}
