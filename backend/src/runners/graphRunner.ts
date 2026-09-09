// @ts-ignore
import Cypher from "cypherdotjs";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Genuine In-Memory Cypher Graph Sandbox using cypherdotjs
 * Executes openCypher subset statements (CREATE, MATCH, WHERE, RETURN) against an in-memory property graph.
 * 
 * Note: ORDER BY, LIMIT, and Aggregations (count, sum, etc.) are unsupported in this lightweight engine.
 */
export async function runCypher(
  submissionId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  const trimmed = code.trim();
  if (!trimmed) {
    return {
      submissionId,
      language: "cypher",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("Cypher Syntax Error: No query statement provided."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  // Pre-check for known unsupported clauses to provide helpful diagnostic hints
  const upper = trimmed.toUpperCase();
  if (/\bORDER\s+BY\b/.test(upper)) {
    return {
      submissionId,
      language: "cypher",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(
        "Cypher Syntax Error: 'ORDER BY' is not supported in this in-memory Cypher subset engine.\n" +
        "Supported clauses: CREATE, MATCH, WHERE, RETURN on nodes, labels, properties, and relationships."
      ),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  if (/\bLIMIT\b/.test(upper)) {
    return {
      submissionId,
      language: "cypher",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(
        "Cypher Syntax Error: 'LIMIT' is not supported in this in-memory Cypher subset engine.\n" +
        "Supported clauses: CREATE, MATCH, WHERE, RETURN on nodes, labels, properties, and relationships."
      ),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  if (/\b(COUNT|SUM|AVG|MIN|MAX|COLLECT)\s*\(/.test(upper)) {
    return {
      submissionId,
      language: "cypher",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(
        "Cypher Syntax Error: Aggregation functions (COUNT, SUM, AVG, MIN, MAX, COLLECT) are not supported in this in-memory Cypher subset engine.\n" +
        "Supported clauses: CREATE, MATCH, WHERE, RETURN on nodes, labels, properties, and relationships."
      ),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  // Strip line comments (// ...) and block comments (/* ... */)
  const cleanedQuery = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("//");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n")
    .trim();

  if (!cleanedQuery) {
    return {
      submissionId,
      language: "cypher",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("Cypher Syntax Error: Query contains only comments."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  // Ensure query has a RETURN clause so cypherdotjs emits results
  let executableQuery = cleanedQuery;
  if (!/\bRETURN\b/i.test(cleanedQuery)) {
    executableQuery = cleanedQuery + "\nRETURN 'Query executed successfully' AS status";
  }

  return new Promise<ExecutionResult>((resolve) => {
    try {
      const cypherEngine = new Cypher();

      cypherEngine.execute(
        executableQuery,
        (result: any) => {
          let outputText = "=== Cypher In-Memory Graph Query Results ===\n\n";

          if (result && result.stats) {
            const stats = result.stats;
            const changes: string[] = [];
            if (stats.nodesAdded) changes.push(`${stats.nodesAdded} node(s) created`);
            if (stats.relationshipsAdded) changes.push(`${stats.relationshipsAdded} relationship(s) created`);
            if (stats.propertiesSet) changes.push(`${stats.propertiesSet} property(ies) set`);
            if (changes.length > 0) {
              outputText += `Graph Updates: ${changes.join(", ")}\n\n`;
            }
          }

          if (result && Array.isArray(result.output) && result.output.length > 0) {
            const rows = result.output;
            const headers = Object.keys(rows[0]);

            // Format as readable ASCII tabular output
            const colWidths: Record<string, number> = {};
            for (const h of headers) {
              colWidths[h] = Math.max(h.length, 6);
            }
            for (const row of rows) {
              for (const h of headers) {
                const valStr = row[h] !== undefined ? String(row[h]) : "null";
                colWidths[h] = Math.max(colWidths[h], valStr.length);
              }
            }

            const headerLine = headers.map((h) => h.padEnd(colWidths[h])).join(" | ");
            const separatorLine = headers.map((h) => "-".repeat(colWidths[h])).join("-+-");

            outputText += headerLine + "\n" + separatorLine + "\n";
            for (const row of rows) {
              const rowLine = headers
                .map((h) => {
                  const valStr = row[h] !== undefined ? String(row[h]) : "null";
                  return valStr.padEnd(colWidths[h]);
                })
                .join(" | ");
              outputText += rowLine + "\n";
            }
            outputText += `\n(${rows.length} row${rows.length === 1 ? "" : "s"} returned)\n`;
          } else {
            outputText += "Query executed successfully with 0 rows returned.\n";
          }

          resolve({
            submissionId,
            language: "cypher",
            status: "success",
            stdout: sanitizeOutput(outputText.trimEnd()),
            stderr: "",
            exitCode: 0,
            wallTimeMs: Date.now() - startTime,
            memoryKb: 2048,
          });
        },
        (error: any) => {
          const errMsg = typeof error === "string" ? error : error?.message || String(error);
          resolve({
            submissionId,
            language: "cypher",
            status: "compilation_error",
            stdout: "",
            stderr: sanitizeOutput(`Cypher Syntax Error: ${errMsg}`),
            exitCode: 1,
            wallTimeMs: Date.now() - startTime,
            memoryKb: 512,
          });
        }
      );
    } catch (e: any) {
      resolve({
        submissionId,
        language: "cypher",
        status: "error",
        stdout: "",
        stderr: sanitizeOutput(`Cypher Execution Error: ${e.message || String(e)}`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      });
    }
  });
}
