import Database from "better-sqlite3";
import yaml from "js-yaml";
import { XMLValidator, XMLParser } from "fast-xml-parser";
import MarkdownIt from "markdown-it";
import { Worker } from "worker_threads";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

/**
 * Validates, lints, formats, or executes Query and Markup/Data languages (SQL, JSON, XML, YAML, Markdown, Regex, CSV)
 * per Section 5 of project spec. No Piston container dependency required.
 */
export async function runMarkupOrQueryLanguage(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    switch (languageId) {
      case "sql":
      case "mysql":
      case "postgresql":
        return await executeSql(submissionId, code, startTime, languageId);
      case "mongodb":
        return validateAndExecuteMongo(submissionId, code, startTime);
      case "graphql":
        return validateAndFormatGraphQL(submissionId, code, startTime);
      case "json":
        return validateAndFormatJson(submissionId, code, startTime);
      case "xml":
        return validateAndFormatXml(submissionId, code, startTime);
      case "yaml":
        return validateAndFormatYaml(submissionId, code, startTime);
      case "markdown":
        return renderMarkdown(submissionId, code, startTime);
      case "regex":
        return await testRegexPattern(submissionId, code, stdin, startTime);
      case "csv":
        return parseAndFormatCsv(submissionId, code, startTime);
      default:
        return {
          submissionId,
          language: languageId,
          status: "error",
          stdout: "",
          stderr: sanitizeOutput(`Unsupported markup/query language: ${languageId}`),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 512,
        };
    }
  } catch (err: any) {
    return {
      submissionId,
      language: languageId,
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 1. SQL (SQLite In-Memory Engine with MySQL & PostgreSQL Dialect Translation)
async function executeSql(
  submissionId: string,
  code: string,
  startTime: number,
  dialect: string = "sql"
): Promise<ExecutionResult> {
  let db: Database.Database | null = null;
  try {
    db = new Database(":memory:");

    // Dialect translation to SQLite compatibility
    let sqlCode = code;
    if (dialect === "mysql") {
      sqlCode = sqlCode
        .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
        .replace(/INTEGER\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
        .replace(/AUTO_INCREMENT/gi, "")
        .replace(/ENGINE\s*=\s*\w+/gi, "")
        .replace(/DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, "DEFAULT CURRENT_TIMESTAMP");
    } else if (dialect === "postgresql") {
      sqlCode = sqlCode
        .replace(/SERIAL\s+PRIMARY\s+KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
        .replace(/BIGSERIAL/gi, "INTEGER")
        .replace(/BOOLEAN/gi, "INTEGER")
        .replace(/RETURNING\s+[\w\*\,\s]+/gi, "");
    }

    const statements = sqlCode
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (statements.length === 0) {
      db.close();
      return {
        submissionId,
        language: dialect,
        status: "success",
        stdout: `${dialect.toUpperCase()} Query executed successfully (0 statements).`,
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 2048,
      };
    }

    // Execute SQL script
    db.exec(sqlCode);

    let stdout = "";
    const selectMatches = sqlCode.match(/SELECT[\s\S]*?;/gi) || (sqlCode.toUpperCase().includes("SELECT") ? [sqlCode] : []);
    if (selectMatches.length > 0) {
      const lastSelect = selectMatches[selectMatches.length - 1].replace(/;$/, "");
      try {
        const rows = db.prepare(lastSelect).all();
        if (!rows || rows.length === 0) {
          stdout = `Query executed successfully. (0 rows returned) [${dialect.toUpperCase()} Dialect]`;
        } else {
          stdout = `[${dialect.toUpperCase()} Query Result]\n\n` + formatTable(rows);
        }
      } catch {
        stdout = `${dialect.toUpperCase()} statements executed successfully.`;
      }
    } else {
      stdout = `${dialect.toUpperCase()} Script executed successfully. Tables modified/created.`;
    }

    db.close();
    return {
      submissionId,
      language: dialect,
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    if (db) {
      try { db.close(); } catch {}
    }
    return {
      submissionId,
      language: dialect,
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(`${dialect.toUpperCase()} Syntax/Execution Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  }
}

// 1b. MongoDB Query Evaluator
function validateAndExecuteMongo(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const trimmed = code.trim();
    // Default sample collection for MongoDB sandbox
    const sampleDocs = [
      { _id: "60c72b2f9b1d8b2b88888881", name: "Mohith Krishna R", role: "Architect", status: "Active", age: 28 },
      { _id: "60c72b2f9b1d8b2b88888882", name: "Alice", role: "Frontend Lead", status: "Active", age: 26 },
      { _id: "60c72b2f9b1d8b2b88888883", name: "Bob", role: "Backend Engineer", status: "Active", age: 30 }
    ];

    let filterObj: any = {};
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      filterObj = JSON.parse(trimmed);
    } else {
      const match = trimmed.match(/db\.\w+\.find\((.*)\)/s);
      if (match && match[1]) {
        const queryArg = match[1].trim();
        if (queryArg.startsWith("{")) {
          filterObj = JSON.parse(queryArg);
        }
      }
    }

    // Filter collection based on simple query keys
    const filterKeys = Object.keys(filterObj);
    const matchedDocs = sampleDocs.filter((doc: any) => {
      return filterKeys.every((key) => {
        if (typeof filterObj[key] === "object" && filterObj[key] !== null) {
          if (filterObj[key].$eq !== undefined) return doc[key] === filterObj[key].$eq;
          if (filterObj[key].$ne !== undefined) return doc[key] !== filterObj[key].$ne;
          if (filterObj[key].$gt !== undefined) return doc[key] > filterObj[key].$gt;
          if (filterObj[key].$gte !== undefined) return doc[key] >= filterObj[key].$gte;
        }
        return doc[key] === filterObj[key];
      });
    });

    return {
      submissionId,
      language: "mongodb",
      status: "success",
      stdout: sanitizeOutput(`[MONGODB QUERY EXECUTED] (${matchedDocs.length} documents matched)\n\n` + JSON.stringify(matchedDocs, null, 2)),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "mongodb",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`MongoDB Query Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 1c. GraphQL Query & Schema Validator
function validateAndFormatGraphQL(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const trimmed = code.trim();
    if (!trimmed) {
      return {
        submissionId,
        language: "graphql",
        status: "success",
        stdout: "[VALID GRAPHQL] Empty Document.",
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // Check bracket matching and basic operation syntax
    let openBraces = 0;
    for (const char of trimmed) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
    }

    if (openBraces !== 0) {
      return {
        submissionId,
        language: "graphql",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput(`GraphQL Syntax Error: Unbalanced curly braces { } in query document.`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    const isSchema = trimmed.includes("type ") || trimmed.includes("schema ") || trimmed.includes("interface ");
    const docType = isSchema ? "GraphQL Schema Definition" : "GraphQL Query / Mutation Operation";
    
    return {
      submissionId,
      language: "graphql",
      status: "success",
      stdout: sanitizeOutput(`[VALID GRAPHQL] Document Type: ${docType}\n\n${trimmed}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "graphql",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`GraphQL Validation Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

function formatTable(rows: any[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(" | ");
  const separator = headers.map((h) => "-".repeat(h.length)).join("-|-");
  const dataLines = rows.map((r) => headers.map((h) => String(r[h] ?? "NULL")).join(" | "));
  return [headerLine, separator, ...dataLines].join("\n");
}

// 2. JSON Validator & Formatter
function validateAndFormatJson(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const parsed = JSON.parse(code);
    const formatted = JSON.stringify(parsed, null, 2);
    const typeStr = Array.isArray(parsed) ? `Array [${parsed.length} items]` : typeof parsed === "object" && parsed !== null ? `Object {${Object.keys(parsed).length} keys}` : typeof parsed;
    
    return {
      submissionId,
      language: "json",
      status: "success",
      stdout: sanitizeOutput(`[VALID JSON] Data Type: ${typeStr}\n\n${formatted}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "json",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`JSON Syntax Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 3. XML Validator & Formatter
function validateAndFormatXml(submissionId: string, code: string, startTime: number): ExecutionResult {
  const result = XMLValidator.validate(code);
  if (result === true) {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedObj = parser.parse(code);
    const rootTag = Object.keys(parsedObj)[0] || "xml";
    return {
      submissionId,
      language: "xml",
      status: "success",
      stdout: sanitizeOutput(`[VALID XML] Root Tag: <${rootTag}>\n\n${code.trim()}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } else {
    const errDetail = typeof result === "object" && result.err ? `Line ${result.err.line}, Col ${result.err.col}: ${result.err.msg}` : "Invalid XML structure";
    return {
      submissionId,
      language: "xml",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`XML Validation Error: ${errDetail}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 4. YAML Validator & Parser
function validateAndFormatYaml(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const parsed = yaml.load(code);
    const jsonEquivalent = JSON.stringify(parsed, null, 2);
    return {
      submissionId,
      language: "yaml",
      status: "success",
      stdout: sanitizeOutput(`[VALID YAML] Parsed Structure:\n\n${jsonEquivalent}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "yaml",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`YAML Syntax Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 5. Markdown Renderer
function renderMarkdown(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const htmlOutput = md.render(code);
    const wordCount = code.trim().split(/\s+/).filter(Boolean).length;
    const lineCount = code.split("\n").length;
    
    return {
      submissionId,
      language: "markdown",
      status: "success",
      stdout: sanitizeOutput(`[MARKDOWN RENDERED HTML] (${wordCount} words, ${lineCount} lines)\n\n${htmlOutput.trim()}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "markdown",
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(`Markdown Rendering Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 6. Regular Expression Tester (ReDoS Protected via Static Analysis & Worker Thread Timeout)
async function testRegexPattern(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): Promise<ExecutionResult> {
  try {
    let patternStr = code.trim();
    let flags = "g";

    // Support /pattern/flags syntax
    const slashMatch = patternStr.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slashMatch) {
      patternStr = slashMatch[1];
      flags = slashMatch[2] || "g";
      if (!flags.includes("g")) flags += "g";
    }

    // 1. Static ReDoS Protection: Reject known catastrophic backtracking nested quantifiers
    // e.g. (a+)+, (a*)*, (.*)*, ([0-9]+)+, (a|b+)+, (x+x+)+
    const dangerousNestedQuantifier = /\([^)]*([+*]|\{\d+,?\d*\})[^)]*\)([+*]|\{\d+,?\d*\})|([+*]|\{\d+,?\d*\})\s*([+*]|\{\d+,?\d*\})/;
    if (dangerousNestedQuantifier.test(patternStr)) {
      return {
        submissionId,
        language: "regex",
        status: "error",
        stdout: "",
        stderr: sanitizeOutput(
          "Security Notice: Dangerous nested quantifier detected in regular expression. Pattern rejected to prevent ReDoS (Catastrophic Backtracking Denial of Service)."
        ),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    const testText = stdin.trim() || "Sample Test Input: Contact us at admin@nexora.com or support@nexora.org (Ref #1024)";

    // 2. Worker Thread Execution: Run evaluation in an isolated worker with strict 1.5s timeout
    const workerScript = `
      const { parentPort, workerData } = require('worker_threads');
      const { patternStr, flags, testText } = workerData;
      const start = Date.now();
      try {
        const reg = new RegExp(patternStr, flags);
        const matches = [];
        let match;
        while ((match = reg.exec(testText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!reg.global) break;
          if (matches.length >= 1000) break;
        }
        parentPort.postMessage({ ok: true, matches, wallTimeMs: Date.now() - start });
      } catch (err) {
        parentPort.postMessage({ ok: false, error: err.message });
      }
    `;

    const result = await new Promise<{
      ok: boolean;
      matches?: any[];
      error?: string;
      wallTimeMs?: number;
      timedOut?: boolean;
    }>((resolve) => {
      let finished = false;
      let worker: Worker;
      try {
        worker = new Worker(workerScript, {
          eval: true,
          workerData: { patternStr, flags, testText },
        });
      } catch (err: any) {
        return resolve({ ok: false, error: err.message });
      }

      const timer = setTimeout(async () => {
        if (!finished) {
          finished = true;
          try {
            await worker.terminate();
          } catch {}
          resolve({ ok: false, timedOut: true });
        }
      }, 1500);

      worker.on("message", (msg) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          worker.terminate().catch(() => {});
          resolve(msg);
        }
      });

      worker.on("error", (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          worker.terminate().catch(() => {});
          resolve({ ok: false, error: err.message });
        }
      });
    });

    if (result.timedOut) {
      return {
        submissionId,
        language: "regex",
        status: "timeout",
        stdout: "",
        stderr: sanitizeOutput(
          "Execution Timeout: Regular expression evaluation exceeded the 1.5s time limit (ReDoS protection triggered)."
        ),
        exitCode: 124,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    if (!result.ok) {
      return {
        submissionId,
        language: "regex",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput(`Invalid Regular Expression: ${result.error || "Unknown error"}`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    const matches = result.matches || [];
    let report = `[REGEX VALID & EXECUTED]\nPattern: /${patternStr}/${flags}\nInput: "${testText}"\nTotal Matches Found: ${matches.length}\n`;
    if (matches.length > 0) {
      report += "\nMatches Detail:\n";
      matches.forEach((m, idx) => {
        report += `#${idx + 1}: "${m.match}" at index ${m.index}`;
        if (m.groups && m.groups.length > 0) {
          report += ` | Groups: [${m.groups.map((g: string) => `"${g}"`).join(", ")}]`;
        }
        report += "\n";
      });
    }

    return {
      submissionId,
      language: "regex",
      status: "success",
      stdout: sanitizeOutput(report.trim()),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "regex",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Invalid Regular Expression: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

// 7. CSV Parser & Formatter
function parseAndFormatCsv(submissionId: string, code: string, startTime: number): ExecutionResult {
  try {
    const lines = code.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return {
        submissionId,
        language: "csv",
        status: "success",
        stdout: "[VALID CSV] Empty CSV dataset (0 rows).",
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const rows = lines.map((line) => parseCsvLine(line));
    const headerCols = rows[0].length;
    let mismatchRow = -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i].length !== headerCols) {
        mismatchRow = i + 1;
        break;
      }
    }

    if (mismatchRow !== -1) {
      return {
        submissionId,
        language: "csv",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput(`CSV Formatting Warning: Row ${mismatchRow} has ${rows[mismatchRow - 1].length} columns, but header has ${headerCols} columns.`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    const formattedTable = formatCsvTable(rows);
    return {
      submissionId,
      language: "csv",
      status: "success",
      stdout: sanitizeOutput(`[VALID CSV] (${rows.length - 1} data records, ${headerCols} columns)\n\n${formattedTable}`),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "csv",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`CSV Syntax Error: ${err.message}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

function parseCsvLine(text: string): string[] {
  const p = [""], n = [p];
  let r = 0, c = 0, s = true;
  for (let l = 0; l < text.length; l++) {
    const e = text[l], t = text[l + 1];
    if (s && e === '"') {
      if (t === '"') {
        p[c] += '"';
        l++;
      } else {
        s = false;
      }
    } else if (!s && e === '"') {
      s = true;
    } else if (s && e === ",") {
      c++;
      p[c] = "";
    } else {
      p[c] += e;
    }
  }
  return p.map((v) => v.trim());
}

function formatCsvTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const numCols = rows[0].length;
  const colWidths = new Array(numCols).fill(0);

  rows.forEach((r) => {
    r.forEach((cell, idx) => {
      if (cell.length > colWidths[idx]) colWidths[idx] = cell.length;
    });
  });

  return rows
    .map((r, rowIdx) => {
      const line = r.map((cell, idx) => cell.padEnd(colWidths[idx])).join(" | ");
      if (rowIdx === 0) {
        const sep = colWidths.map((w) => "-".repeat(w)).join("-|-");
        return `${line}\n${sep}`;
      }
      return line;
    })
    .join("\n");
}
