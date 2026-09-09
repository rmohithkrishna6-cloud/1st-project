import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";
import { runWithPiston } from "./pistonRunner.js";

// Judge0 Language ID Mapping (§5 & §8 of spec.md)
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,     // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  go: 60,         // Go (1.13.5)
  rust: 73,       // Rust (1.40.0)
  php: 68,        // PHP (7.4.1)
  ruby: 72,       // Ruby (2.7.0)
  bash: 46,       // Bash (5.0.0)
  sql: 82,        // SQL (SQLite 3.27.2)
  lua: 64,        // Lua (5.3.5)
  perl: 85,       // Perl (5.28.1)
};

/**
 * Sandboxed Execution Engine Runner (Piston locally / Judge0 in production)
 * Configured via process.env.EXECUTION_ENGINE ("piston" | "judge0").
 */
export async function runWithJudge0(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult | null> {
  const engine = (process.env.EXECUTION_ENGINE || "piston").toLowerCase();

  // Route to Piston execution engine for local development
  if (engine === "piston") {
    const pistonResult = await runWithPiston(submissionId, languageId, code, stdin);
    if (pistonResult) {
      return pistonResult;
    }
  }

  // Route to Judge0 execution engine for Linux server production deployments
  return executeJudge0Native(submissionId, languageId, code, stdin);
}

async function executeJudge0Native(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult | null> {
  const judge0LangId = JUDGE0_LANGUAGE_IDS[languageId];
  if (!judge0LangId) return null;

  const judge0Url = process.env.JUDGE0_URL || "http://localhost:2358";

  try {
    const response = await fetch(`${judge0Url}/submissions?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: judge0LangId,
        stdin,
        cpu_time_limit: 5.0, // 5s CPU Cap (§8)
        wall_time_limit: 10.0, // 10s Wall Clock Timeout (§8)
        memory_limit: 262144, // 256MB Memory Limit (§8)
        max_processes_and_or_threads: 60, // Thread/Process Limit (§8)
        enable_network: false, // --network none (§8)
        redirect_stderr_to_stdout: false,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Map Judge0 status ID
    // Status 3 = Accepted, Status 5 = Time Limit Exceeded, Status 6 = Compilation Error
    let status: "success" | "error" | "timeout" | "compilation_error" = "success";
    if (data.status?.id === 5) status = "timeout";
    else if (data.status?.id === 6) status = "compilation_error";
    else if (data.status?.id !== 3) status = "error";

    let rawStderr = data.stderr || "";
    if (status === "compilation_error") {
      rawStderr = data.compile_output || data.stderr || "";
    }

    if (status === "success" && rawStderr) {
      const harmlessLines = [
        /Microsoft \(R\) Visual C# Compiler version/i,
        /Copyright \(C\) Microsoft Corporation/i,
        /Picked up _JAVA_OPTIONS/i,
        /Picked up JAVA_TOOL_OPTIONS/i,
      ];
      const lines = rawStderr.split("\n").filter((line: string) => {
        return !harmlessLines.some((regex) => regex.test(line));
      });
      rawStderr = lines.join("\n").trim();
    }

    return {
      submissionId,
      language: languageId,
      status,
      stdout: sanitizeOutput(data.stdout || ""),
      stderr: sanitizeOutput(rawStderr),
      exitCode: data.exit_code ?? (status === "success" ? 0 : 1),
      wallTimeMs: Math.round(parseFloat(data.time || "0") * 1000),
      memoryKb: data.memory || 0,
    };
  } catch (err) {
    // Judge0 API not reachable
    return null;
  }
}
