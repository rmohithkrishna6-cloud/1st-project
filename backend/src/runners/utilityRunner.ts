import * as Diff from "diff";
import { CronExpressionParser } from "cron-parser";
import CoffeeScript from "coffeescript";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

// Cached jq instance from WebAssembly module
let jqInstance: any = null;

async function getJqInstance() {
  if (!jqInstance) {
    // jq-web exports a Promise that resolves to { json, raw }
    const mod = await import("jq-web" as any);
    jqInstance = mod.default ? await mod.default : await mod;
  }
  return jqInstance;
}

/**
 * Genuine Utility & Scripting Engines
 * Supports:
 * - Diff (diff) via official `diff` package (unified diff generator & patch inspector)
 * - jq (jq) via WebAssembly `jq-web` (compiled libjq stream processor)
 * - sed (sed) via Node's native regex substitution engine
 * - Cron (cron) via official `cron-parser` (expression validator & schedule generator)
 * - CoffeeScript (coffeescript) via official `coffeescript` compiler
 */
export async function runUtilityLanguage(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    switch (languageId) {
      case "diff":
      case "patch":
        return processDiff(submissionId, code, stdin, startTime);

      case "jq":
        return await processJq(submissionId, code, stdin, startTime);

      case "sed":
        return processSed(submissionId, code, stdin, startTime);

      case "cron":
        return processCron(submissionId, code, startTime);

      case "coffeescript":
      case "coffee":
        return compileCoffeeScript(submissionId, code, startTime);

      default:
        return {
          submissionId,
          language: languageId,
          status: "error",
          stdout: "",
          stderr: sanitizeOutput(`Unsupported utility language: ${languageId}`),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 512,
        };
    }
  } catch (err: any) {
    return {
      submissionId,
      language: languageId,
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

/**
 * 1. Diff & Patch Processing via `diff` package
 */
function processDiff(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): ExecutionResult {
  try {
    // Scenario A: stdin provided -> generate unified diff between stdin and code
    if (stdin && stdin.trim()) {
      const patch = Diff.createTwoFilesPatch(
        "original.txt",
        "modified.txt",
        stdin,
        code,
        "original",
        "modified"
      );
      const parsed = Diff.parsePatch(patch);
      const hunksCount = parsed.reduce((acc, f) => acc + (f.hunks ? f.hunks.length : 0), 0);

      const stdout =
        `[Unified Diff Generator]\n` +
        `Compared: original.txt vs modified.txt (${hunksCount} diff hunk(s))\n\n` +
        patch;

      return {
        submissionId,
        language: "diff",
        status: "success",
        stdout: sanitizeOutput(stdout),
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    // Scenario B: code contains split marker "--- OLD ---" and "+++ NEW +++"
    if (code.includes("--- OLD ---") && code.includes("+++ NEW +++")) {
      const parts = code.split("+++ NEW +++");
      const oldText = parts[0].replace("--- OLD ---", "").trim();
      const newText = parts[1].trim();
      const patch = Diff.createTwoFilesPatch("old.txt", "new.txt", oldText, newText);

      const stdout =
        `[Unified Diff Generator: Explicit Split Mode]\n\n` +
        patch;

      return {
        submissionId,
        language: "diff",
        status: "success",
        stdout: sanitizeOutput(stdout),
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    // Scenario C: code is an existing unified diff patch -> parse and validate its hunks
    const parsed = Diff.parsePatch(code);
    if (!parsed || parsed.length === 0 || !parsed.some((f) => f.hunks && f.hunks.length > 0)) {
      return {
        submissionId,
        language: "diff",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput(
          "Diff Syntax Error: Input is not a valid unified diff patch.\n" +
          "Missing valid file headers ('--- a/...' / '+++ b/...') or hunk headers ('@@ -start,count +start,count @@').\n" +
          "Tip: To generate a diff between two files, provide the original file in Stdin and the modified file in the Editor."
        ),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const fileSummaries = parsed.map((f, i) => {
      const added = f.hunks.reduce((hAcc, h) => hAcc + h.lines.filter(l => l.startsWith("+")).length, 0);
      const removed = f.hunks.reduce((hAcc, h) => hAcc + h.lines.filter(l => l.startsWith("-")).length, 0);
      return `  File #${i + 1}: ${f.oldFileName || 'a'} -> ${f.newFileName || 'b'} (${f.hunks.length} hunk(s), +${added}/-${removed})`;
    });

    const stdout =
      `[Unified Diff Patch Analyzer: ${parsed.length} File(s) Inspected]\n` +
      fileSummaries.join("\n") +
      `\n\nRaw Verified Patch Content:\n` +
      code;

    return {
      submissionId,
      language: "diff",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "diff",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Diff Patch Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 2. jq JSON Stream Processing via WebAssembly libjq (`jq-web`)
 */
async function processJq(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): Promise<ExecutionResult> {
  try {
    const jq = await getJqInstance();
    const filter = code.trim();

    if (!filter) {
      return {
        submissionId,
        language: "jq",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("jq Error: Filter expression cannot be empty"),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // Input JSON: from stdin or standard sample dataset
    let jsonString = stdin && stdin.trim() ? stdin.trim() : JSON.stringify({
      compiler: "Nexora",
      version: "1.0.0",
      stats: {
        activeLanguages: 67,
        totalCatalog: 128
      },
      languages: [
        { id: "python", name: "Python", type: "interpreted", tier: "popular" },
        { id: "rust", name: "Rust", type: "compiled", tier: "systems" },
        { id: "go", name: "Go", type: "compiled", tier: "backend" },
        { id: "typescript", name: "TypeScript", type: "transpiled", tier: "web" }
      ]
    }, null, 2);

    // Execute through libjq WebAssembly
    const rawResult = jq.raw(jsonString, filter);

    const stdout =
      `[jq JSON Processor & Stream Filter]\n` +
      `Filter: ${filter}\n` +
      `Input Data: ${stdin.trim() ? "Custom (stdin JSON)" : "Default Nexora Catalog Sample"}\n\n` +
      `Output:\n` +
      (typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult, null, 2));

    return {
      submissionId,
      language: "jq",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "jq",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`jq Execution Error:\n${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 3. sed Stream Editor via Native Pattern Substitution Engine
 */
function processSed(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): ExecutionResult {
  try {
    let inputText = stdin && stdin.trim()
      ? stdin
      : "Hello World!\nWelcome to the Nexora Multi-Language Compiler.\nHello World once more.";

    const lines = code.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length === 0) {
      return {
        submissionId,
        language: "sed",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("sed: no commands provided"),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    let result = inputText;

    for (let idx = 0; idx < lines.length; idx++) {
      const cmd = lines[idx];

      if (cmd.startsWith("s")) {
        if (cmd.length < 3) {
          throw new Error(`sed: -e expression #${idx + 1}: unterminated 's' command`);
        }
        const delim = cmd[1];
        if (/[a-zA-Z0-9\\]/.test(delim)) {
          throw new Error(`sed: -e expression #${idx + 1}: invalid delimiter '${delim}'`);
        }

        const parts: string[] = [];
        let current = "";
        let escaped = false;
        for (let i = 2; i < cmd.length; i++) {
          const ch = cmd[i];
          if (escaped) {
            current += ch;
            escaped = false;
          } else if (ch === "\\") {
            escaped = true;
            current += ch;
          } else if (ch === delim) {
            parts.push(current);
            current = "";
          } else {
            current += ch;
          }
        }
        parts.push(current);

        if (parts.length < 2) {
          throw new Error(`sed: -e expression #${idx + 1}: unterminated 's' command`);
        }

        const pattern = parts[0];
        const replacement = parts[1];
        const flagsStr = parts.slice(2).join(delim);

        let regexFlags = "";
        for (const f of flagsStr) {
          if (f === "g") {
            if (!regexFlags.includes("g")) regexFlags += "g";
          } else if (f === "i") {
            if (!regexFlags.includes("i")) regexFlags += "i";
          } else if (f === "m") {
            if (!regexFlags.includes("m")) regexFlags += "m";
          } else {
            throw new Error(`sed: -e expression #${idx + 1}: unknown option to 's' '${f}'`);
          }
        }

        let regex: RegExp;
        try {
          regex = new RegExp(pattern, regexFlags);
        } catch (rErr: any) {
          throw new Error(`sed: -e expression #${idx + 1}: invalid regular expression: ${rErr.message}`);
        }

        result = result.replace(regex, replacement);
      } else {
        throw new Error(`sed: -e expression #${idx + 1}, char 1: unknown command: '${cmd[0]}'`);
      }
    }

    const stdout =
      `[sed Stream Editor Pattern Matcher]\n` +
      `Commands Executed: ${lines.length} substitution(s)\n` +
      `Input Source: ${stdin.trim() ? "Custom (stdin)" : "Default Sample Text"}\n\n` +
      `Transformed Output:\n` +
      result;

    return {
      submissionId,
      language: "sed",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "sed",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 4. Cron Expression Parser via `cron-parser`
 */
function processCron(
  submissionId: string,
  code: string,
  startTime: number
): ExecutionResult {
  try {
    const cronExpr = code.trim().replace(/^['"]|['"]$/g, "");
    if (!cronExpr) {
      return {
        submissionId,
        language: "cron",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Cron Error: Empty cron expression"),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const interval = CronExpressionParser.parse(cronExpr, { tz: "UTC" });
    const runs: string[] = [];
    for (let i = 0; i < 5; i++) {
      const nextDate: any = interval.next();
      if (nextDate && typeof nextDate.toISOString === "function") {
        runs.push(`  ${i + 1}. ${nextDate.toISOString().replace("T", " ").replace(/\.\d+Z/, " UTC")}`);
      }
    }

    const stdout =
      `[Cron Expression Timeline Evaluator]\n` +
      `Cron Expression: '${cronExpr}'\n` +
      `Status: Valid cron expression syntax.\n\n` +
      `Next 5 Scheduled Execution Runs (UTC):\n` +
      runs.join("\n");

    return {
      submissionId,
      language: "cron",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "cron",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Cron Parse Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 5. CoffeeScript Compiler via `coffeescript`
 */
function compileCoffeeScript(
  submissionId: string,
  code: string,
  startTime: number
): ExecutionResult {
  try {
    const compiledJs = CoffeeScript.compile(code, { bare: true });

    const stdout =
      `[CoffeeScript 2.7.0 Transpiler]\n` +
      `JavaScript Transpiled Output:\n\n` +
      compiledJs;

    return {
      submissionId,
      language: "coffeescript",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "coffeescript",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`CoffeeScript Syntax Error:\n${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}
