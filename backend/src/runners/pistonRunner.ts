import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";
import { LANGUAGES } from "../data/languages.js";

const PISTON_LANGUAGE_MAPPINGS: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  cpp: "c++",
  c: "c",
  java: "java",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  bash: "bash",
  sql: "sqlite3",
  lua: "lua",
  perl: "perl",
  swift: "swift",
  csharp: "csharp",
  r: "rscript",
  dart: "dart",
  haskell: "haskell",
  elixir: "elixir",
  kotlin: "kotlin",
  scala: "scala",
  groovy: "groovy",
  julia: "julia",
  nim: "nim",
  crystal: "crystal",
  zig: "zig",
  d: "d",
  fortran: "fortran",
  cobol: "cobol",
  ada: "ada",
  prolog: "prolog",
  lisp: "lisp",
  racket: "racket",
  ocaml: "ocaml",
  assembly: "nasm",
  nasm: "nasm",
  pascal: "pascal",
  freebasic: "freebasic",
  forth: "forth",
  erlang: "erlang",
  fsharp: "fsharp.net",
  clojure: "clojure",
  pure: "pure",
  "objective-c": "objc",
  objc: "objc",
  arm: "arm",
  maxima: "maxima",
  visualbasic: "basic",
  vb: "basic",
  node: "javascript",
  awk: "gawk",
  gawk: "gawk",
  qbasic: "freebasic",
  smalltalk: "smalltalk",
  pony: "ponylang",
  ponylang: "ponylang",
  chapel: "chapel",
  ballerina: "ballerina",
  gleam: "gleam",
  hack: "hack",
  factor: "factor",
  coq: "coq",
  agda: "agda",
  lean: "lean",
  raku: "raku",
  dash: "dash",
  bqn: "bqn",
  verilog: "iverilog",
  iverilog: "iverilog",
  emacs: "emacs",
  elisp: "emacs",
  deno: "deno",
  llvm_ir: "llvm_ir",
  llvm: "llvm_ir",
  brainfuck: "brainfuck",
  bf: "brainfuck",
  befunge: "befunge",
  befunge93: "befunge93",
  whitespace: "whitespace",
  malbolge: "malbolge",
  intercal: "intercal",
  chef: "chef",
  piet: "piet",
  powershell: "powershell",
  pwsh: "powershell",
  ps: "powershell",
  vlang: "vlang",
  v: "vlang",
  rockstar: "rockstar",
  rock: "rockstar",
  octave: "octave",
  emojicode: "emojicode",
  emojic: "emojicode",
};

interface PistonRuntime {
  language: string;
  version: string;
  aliases?: string[];
  runtime?: string;
}

let cachedRuntimes: PistonRuntime[] | null = null;
let lastRuntimesFetch = 0;

async function getPistonRuntimes(pistonUrl: string): Promise<PistonRuntime[]> {
  const now = Date.now();
  if (cachedRuntimes && now - lastRuntimesFetch < 300000) {
    return cachedRuntimes;
  }
  try {
    const res = await fetch(`${pistonUrl}/api/v2/runtimes`);
    if (res.ok) {
      cachedRuntimes = await res.json();
      lastRuntimesFetch = now;
      return cachedRuntimes || [];
    }
  } catch (err) {
    // Ignore fetch error
  }
  return cachedRuntimes || [];
}

export async function runWithPiston(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult | null> {
  const pistonLang = PISTON_LANGUAGE_MAPPINGS[languageId] || languageId;
  const pistonUrl = process.env.PISTON_URL || "http://localhost:2000";

  const startTime = Date.now();

  try {
    // 1. Fetch exact runtime version from /api/v2/runtimes
    const runtimes = await getPistonRuntimes(pistonUrl);
    const matchedRuntime =
      runtimes.find((r) => r.language === pistonLang) ||
      runtimes.find((r) => r.aliases && r.aliases.includes(pistonLang));

    if (runtimes.length > 0 && !matchedRuntime) {
      const langConfig = LANGUAGES.find((l) => l.id === languageId);
      return {
        submissionId,
        language: languageId,
        status: "error",
        stdout: "",
        stderr: sanitizeOutput(
          `Runtime Error: ${pistonLang} runtime (v${langConfig?.version || "unknown"}) is not installed on the Piston engine instance at ${pistonUrl}`
        ),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 0,
      };
    }

    const langConfig = LANGUAGES.find((l) => l.id === languageId);
    const version = matchedRuntime ? matchedRuntime.version : langConfig?.version || "*";

    let fileName = langConfig?.fileExtension ? `main.${langConfig.fileExtension}` : undefined;
    if (languageId === "agda") {
      const moduleMatch = code.match(/module\s+([A-Za-z0-9_]+)/);
      fileName = moduleMatch ? `${moduleMatch[1]}.agda` : "Main.agda";
    } else if (languageId === "ada") {
      const unitMatch = code.match(/procedure\s+([A-Za-z0-9_]+)/i);
      fileName = unitMatch ? `${unitMatch[1].toLowerCase()}.adb` : "main.adb";
    } else if (languageId === "verilog" || languageId === "iverilog") {
      fileName = "main.v";
    } else if (languageId === "emacs" || languageId === "elisp") {
      fileName = "main.el";
    } else if (languageId === "llvm_ir" || languageId === "llvm") {
      fileName = "main.ll";
    }
    const filePayload: { name?: string; content: string } = { content: code };
    if (fileName) filePayload.name = fileName;

    // 2. Execute via Piston API
    let response = await fetch(`${pistonUrl}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: version,
        files: [filePayload],
        stdin,
      }),
    });

    if (!response.ok) {
      // Fallback try without version field or with wildcard
      response = await fetch(`${pistonUrl}/api/v2/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLang,
          files: [filePayload],
          stdin,
        }),
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.message || errData.output || `Piston execution failed with status ${response.status}`;
      return {
        submissionId,
        language: languageId,
        status: "error",
        stdout: "",
        stderr: sanitizeOutput(`Runtime Error: ${errMsg}`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 0,
      };
    }

    const data = await response.json();
    const wallTimeMs = Date.now() - startTime;

    const runObj = data.run || {};
    const compileObj = data.compile || {};

    let status: "success" | "error" | "timeout" | "compilation_error" = "success";

    if (compileObj.code !== undefined && compileObj.code !== 0) {
      status = "compilation_error";
    } else if (runObj.code !== 0 && compileObj.stderr && /error found|Error:|Not found/i.test(compileObj.stderr)) {
      status = "compilation_error";
    } else if (runObj.signal === "SIGKILL" || runObj.code === 137) {
      status = "timeout";
    } else if (runObj.code !== 0) {
      status = "error";
    }

    let stdout = sanitizeOutput(runObj.stdout || "");

    let rawStderr = runObj.stderr || "";
    if (languageId === "maxima" && /incorrect syntax:|syntax error/i.test(stdout)) {
      status = "error";
      rawStderr = stdout;
    }
    if (languageId === "pure" && /syntax error/i.test(rawStderr || stdout)) {
      status = "error";
      if (!rawStderr) rawStderr = stdout;
    }
    if ((languageId === "emacs" || languageId === "elisp") && status === "success" && !stdout && rawStderr) {
      stdout = rawStderr;
      rawStderr = "";
    }
    if (status === "compilation_error") {
      rawStderr = compileObj.stderr || compileObj.output || runObj.stderr || "";
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

      if (rawStderr && (languageId === "rockstar" || rawStderr.toLowerCase().startsWith("error:"))) {
        status = "error";
      }
    }

    const stderr = sanitizeOutput(rawStderr);
    const exitCode = (status === "error" || status === "compilation_error")
      ? (runObj.code && runObj.code !== 0 ? runObj.code : 1)
      : (runObj.code ?? compileObj.code ?? 0);

    return {
      submissionId,
      language: languageId,
      status,
      stdout,
      stderr,
      exitCode,
      wallTimeMs,
      memoryKb: 0,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: languageId,
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(`Piston Connection Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 0,
    };
  }
}

export const REQUIRED_PISTON_PACKAGES: Array<{ language: string; version: string }> = [
  { language: "raku", version: "6.100.0" },
  { language: "pure", version: "0.68.0" },
  { language: "dash", version: "0.5.11" },
  { language: "bqn", version: "1.0.0" },
  { language: "iverilog", version: "11.0.0" },
  { language: "emacs", version: "27.1.0" },
  { language: "deno", version: "1.32.3" },
  { language: "llvm_ir", version: "12.0.1" },
];

/**
 * Ensures that all required Piston runtime packages are installed.
 * If connected to an instance with missing runtimes (e.g. fresh local Docker container),
 * this provisioner auto-installs them via the Piston package manager API.
 */
export async function ensurePistonPackages(): Promise<void> {
  const pistonUrl = process.env.PISTON_URL || "http://localhost:2000";
  try {
    const runtimes = await getPistonRuntimes(pistonUrl);
    if (!runtimes || runtimes.length === 0) return;

    for (const pkg of REQUIRED_PISTON_PACKAGES) {
      const isInstalled = runtimes.some(
        (r) => r.language === pkg.language || (r.aliases && r.aliases.includes(pkg.language))
      );
      if (!isInstalled) {
        console.log(`[Piston Provisioner] Auto-installing package ${pkg.language}-${pkg.version} on ${pistonUrl}...`);
        try {
          const res = await fetch(`${pistonUrl}/api/v2/packages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: pkg.language, version: pkg.version }),
          });
          if (res.ok) {
            console.log(`[Piston Provisioner] Successfully provisioned ${pkg.language}-${pkg.version}`);
          }
        } catch (e: any) {
          console.warn(`[Piston Provisioner] Failed to auto-install ${pkg.language}:`, e.message);
        }
      }
    }
    cachedRuntimes = null;
    lastRuntimesFetch = 0;
  } catch (err: any) {
    // Graceful fallback if Piston is unreachable during startup
  }
}

