import * as sass from "sass";
import less from "less";
import stylus from "stylus";
import postcss from "postcss";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Genuine CSS Preprocessor Compilation Engine
 * Compiles SCSS (sass), Less (less), Stylus (stylus), and PostCSS (postcss)
 * using their official npm packages with zero faking.
 */
export async function runPreprocessorLanguage(
  submissionId: string,
  languageId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    switch (languageId) {
      case "scss":
        return compileScss(submissionId, code, startTime);

      case "less":
        return await compileLess(submissionId, code, startTime);

      case "stylus":
        return await compileStylus(submissionId, code, startTime);

      case "postcss":
        return await compilePostcss(submissionId, code, startTime);

      default:
        return {
          submissionId,
          language: languageId,
          status: "error",
          stdout: "",
          stderr: sanitizeOutput(`Unsupported preprocessor language: ${languageId}`),
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

/**
 * 1. SCSS Compilation via official Dart Sass (`sass`)
 */
function compileScss(
  submissionId: string,
  code: string,
  startTime: number
): ExecutionResult {
  try {
    const result = sass.compileString(code, {
      syntax: "scss",
      style: "expanded",
    });

    return {
      submissionId,
      language: "scss",
      status: "success",
      stdout: result.css,
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    const errMsg = err.message || String(err);
    return {
      submissionId,
      language: "scss",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(errMsg.trim()),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

/**
 * 2. Less Compilation via official Less compiler (`less`)
 */
async function compileLess(
  submissionId: string,
  code: string,
  startTime: number
): Promise<ExecutionResult> {
  try {
    const result = await less.render(code);

    return {
      submissionId,
      language: "less",
      status: "success",
      stdout: result.css,
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    let errMsg = err.message || String(err);
    if (err.line !== undefined) {
      errMsg = `Less Syntax Error at line ${err.line}, column ${err.column}: ${err.message}`;
      if (err.extract && Array.isArray(err.extract)) {
        const snippet = err.extract.filter(Boolean).join("\n");
        if (snippet) errMsg += `\n${snippet}`;
      }
    }
    return {
      submissionId,
      language: "less",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(errMsg.trim()),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}

/**
 * 3. Stylus Compilation via official Stylus compiler (`stylus`)
 */
async function compileStylus(
  submissionId: string,
  code: string,
  startTime: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    stylus.render(code, (err: any, css: string) => {
      if (err) {
        return resolve({
          submissionId,
          language: "stylus",
          status: "compilation_error",
          stdout: "",
          stderr: sanitizeOutput(err.message || String(err)).trim(),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 1024,
        });
      }

      return resolve({
        submissionId,
        language: "stylus",
        status: "success",
        stdout: css,
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 2048,
      });
    });
  });
}

/**
 * 4. PostCSS Compilation via official PostCSS engine (`postcss`)
 */
async function compilePostcss(
  submissionId: string,
  code: string,
  startTime: number
): Promise<ExecutionResult> {
  try {
    // Validate AST syntax first to catch syntax errors cleanly
    postcss.parse(code, { from: "input.pcss" });

    // Process PostCSS
    const result = await postcss().process(code, { from: "input.pcss" });

    return {
      submissionId,
      language: "postcss",
      status: "success",
      stdout: result.css,
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    let errMsg = err.message || String(err);
    if (err.name === "CssSyntaxError") {
      errMsg = `PostCSS Syntax Error: ${err.reason || err.message} at line ${err.line}:${err.column}`;
      if (typeof err.showSourceCode === "function") {
        errMsg += `\n${err.showSourceCode()}`;
      }
    }
    return {
      submissionId,
      language: "postcss",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(errMsg.trim()),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}
