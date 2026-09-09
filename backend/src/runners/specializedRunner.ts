import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";
// @ts-ignore
import BiwaScheme from "biwascheme";
// @ts-ignore
import { Tcl } from "tcl-js";

/**
 * Genuine Scheme Interpreter using BiwaScheme (R6RS/R7RS)
 */
export async function executeSchemeCode(
  submissionId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  let stdout = "";
  let executionError: Error | null = null;

  try {
    const intp = new BiwaScheme.Interpreter((err: any) => {
      executionError = err instanceof Error ? err : new Error(String(err));
    });

    // Capture standard output from BiwaScheme display/write/newline
    BiwaScheme.Port.current_output.put_string = (str: string) => {
      stdout += str;
    };

    const rawResult = intp.evaluate(code);
    if (executionError) {
      throw executionError;
    }

    let finalOutput = stdout;
    if (!finalOutput.trim() && rawResult !== undefined && rawResult !== BiwaScheme.undef) {
      finalOutput = BiwaScheme.to_write(rawResult);
    }

    return {
      submissionId,
      language: "scheme",
      status: "success",
      stdout: sanitizeOutput(finalOutput || "[Scheme program evaluated successfully with no output]"),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 4096,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "scheme",
      status: "error",
      stdout: stdout ? sanitizeOutput(stdout) : "",
      stderr: sanitizeOutput(`Scheme Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  }
}

/**
 * Genuine Tcl Interpreter using tcl-js (pure TypeScript Tcl engine)
 */
export async function executeTclCode(
  submissionId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  let stdout = "";

  try {
    const tcl = new Tcl();

    // tcl-js write signature: write(channelId: string, string: string)
    tcl.getIO().write = (_channel: string, str: string) => {
      stdout += str;
    };

    const rawResult = await tcl.run(code);

    let finalOutput = stdout;
    if (!finalOutput.trim() && rawResult && rawResult.value !== undefined && rawResult.value !== "") {
      finalOutput = String(rawResult.value);
    }

    return {
      submissionId,
      language: "tcl",
      status: "success",
      stdout: sanitizeOutput(finalOutput || "[Tcl script evaluated successfully with no output]"),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 4096,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "tcl",
      status: "error",
      stdout: stdout ? sanitizeOutput(stdout) : "",
      stderr: sanitizeOutput(`Tcl Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  }
}

/**
 * Handles execution, syntax verification, and execution output parsing
 * for specialized, functional, and domain-specific programming languages.
 */
export async function runSpecializedLanguage(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  if (languageId === "scheme" || languageId === "scm") {
    return executeSchemeCode(submissionId, code);
  }

  if (languageId === "tcl") {
    return executeTclCode(submissionId, code);
  }

  const startTime = Date.now();
  return {
    submissionId,
    language: languageId,
    status: "error",
    stdout: "",
    stderr: sanitizeOutput(
      `Specialized Language Notice: ${languageId} does not have a verified execution backend in this sandbox.`
    ),
    exitCode: 1,
    wallTimeMs: Date.now() - startTime,
    memoryKb: 512,
  };
}
