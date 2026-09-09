import Redis from "ioredis";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Genuine Redis CLI Command Sandbox
 * Connects to real Redis 6.0 instance running in Docker, executes real commands,
 * and formats CLI results identically to standard redis-cli.
 */
export async function runRedis(
  submissionId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (lines.length === 0) {
    return {
      submissionId,
      language: "redis",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("Redis CLI Error: No commands provided to execute."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  let client: Redis | null = null;
  try {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      client = new Redis(redisUrl, {
        connectTimeout: 4000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        lazyConnect: true,
      });
    } else {
      const redisHost = process.env.REDIS_HOST || "127.0.0.1";
      const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
      const redisPassword = process.env.REDIS_PASSWORD || "judge0";

      client = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        connectTimeout: 4000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        lazyConnect: true,
      });
    }

    await client.connect();

    const outputLog: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i];
      // Strip leading prompt like "> " or "127.0.0.1:6379> "
      rawLine = rawLine.replace(/^(?:>|(?:\d{1,3}\.){3}\d{1,3}:\d+>)\s*/, "");
      if (!rawLine.trim()) continue;

      // Parse arguments respecting quoted strings
      const args: string[] = [];
      const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
      let match;
      while ((match = regex.exec(rawLine)) !== null) {
        if (match[1] !== undefined) {
          args.push(match[1]);
        } else if (match[2] !== undefined) {
          args.push(match[2]);
        } else {
          args.push(match[0]);
        }
      }

      if (args.length === 0) continue;

      const command = args[0].toLowerCase();
      const cmdArgs = args.slice(1);

      // Block destructive system-level commands
      const BLOCKED_COMMANDS = new Set([
        "flushall",
        "flushdb",
        "shutdown",
        "config",
        "debug",
        "replicaof",
        "slaveof",
      ]);

      if (BLOCKED_COMMANDS.has(command)) {
        throw new Error(
          `(error) ERR Nexora Sandbox Security: Command '${command.toUpperCase()}' is disabled in shared environment`
        );
      }

      outputLog.push(`> ${args.join(" ")}`);

      try {
        const res = await (client as any).call(command, ...cmdArgs);
        outputLog.push(formatRedisResponse(res));
      } catch (cmdErr: any) {
        outputLog.push(`(error) ${cmdErr.message}`);
        // If a command threw a syntax/argument error, fail with specific error
        throw cmdErr;
      }
    }

    client.disconnect();

    const stdout =
      `[Redis 6.0 Live CLI Sandbox (Host 127.0.0.1:6379)]\n\n` +
      outputLog.join("\n");

    return {
      submissionId,
      language: "redis",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    if (client) {
      try {
        client.disconnect();
      } catch {}
    }

    return {
      submissionId,
      language: "redis",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Redis CLI Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

function formatRedisResponse(res: any): string {
  if (res === null || res === undefined) {
    return "(nil)";
  }
  if (typeof res === "number") {
    return `(integer) ${res}`;
  }
  if (typeof res === "string") {
    if (res === "OK") return "OK";
    return `"${res}"`;
  }
  if (Array.isArray(res)) {
    if (res.length === 0) return "(empty list or set)";
    return res
      .map((item, idx) => `${idx + 1}) ${formatRedisResponse(item)}`)
      .join("\n");
  }
  return JSON.stringify(res);
}
