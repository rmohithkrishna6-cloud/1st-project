import Handlebars from "handlebars";
import ejs from "ejs";
import pug from "pug";
import { XMLValidator, XMLParser } from "fast-xml-parser";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Genuine Template Engine Runners
 * Supports:
 * - Handlebars (handlebars) via official `handlebars` compiler
 * - EJS (ejs) via official `ejs` template engine
 * - Pug (pug) via official `pug` template compiler
 * - SVG (svg) via real XML AST validation & DOM structure inspector
 * Reads template context from stdin JSON if provided, or supplies clean sample data.
 */
export async function runTemplateLanguage(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    switch (languageId) {
      case "handlebars":
      case "hbs":
        return compileHandlebars(submissionId, code, stdin, startTime);

      case "ejs":
        return renderEjs(submissionId, code, stdin, startTime);

      case "pug":
      case "jade":
        return renderPug(submissionId, code, stdin, startTime);

      case "svg":
        return validateSvg(submissionId, code, startTime);

      default:
        return {
          submissionId,
          language: languageId,
          status: "error",
          stdout: "",
          stderr: sanitizeOutput(`Unsupported template language: ${languageId}`),
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
 * Parse context data from stdin or return default context
 */
function getTemplateContext(stdin: string): Record<string, any> {
  if (stdin && stdin.trim()) {
    try {
      return JSON.parse(stdin.trim());
    } catch {
      // If stdin is not JSON, supply it as raw stdin property
      return {
        stdin: stdin.trim(),
        name: "Nexora User",
        role: "Developer",
        platform: "Nexora",
        items: ["Python", "Rust", "Go", "TypeScript"],
        count: 4,
        user: { name: "Nexora User", role: "Developer", active: true },
      };
    }
  }

  return {
    name: "Nexora User",
    role: "Developer",
    platform: "Nexora",
    items: ["Python", "Rust", "Go", "TypeScript"],
    count: 4,
    user: { name: "Nexora User", role: "Developer", active: true },
    title: "Nexora Code Sandbox",
    timestamp: new Date().toISOString(),
  };
}

/**
 * 1. Handlebars Template Compilation & Rendering
 */
function compileHandlebars(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): ExecutionResult {
  try {
    const context = getTemplateContext(stdin);
    const template = Handlebars.compile(code, { strict: false });
    const rendered = template(context);

    const stdout =
      `[Handlebars Template Compiler]\n` +
      `Context Used: ${stdin.trim() ? "Custom (stdin JSON)" : "Default Sample Data"}\n` +
      `Rendered HTML Output:\n` +
      rendered;

    return {
      submissionId,
      language: "handlebars",
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
      language: "handlebars",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Handlebars Parse Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 2. EJS Template Compilation & Rendering
 */
function renderEjs(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): ExecutionResult {
  try {
    const context = getTemplateContext(stdin);
    const rendered = ejs.render(code, context);

    const stdout =
      `[EJS Embedded JavaScript Compiler]\n` +
      `Context Used: ${stdin.trim() ? "Custom (stdin JSON)" : "Default Sample Data"}\n` +
      `Rendered HTML Output:\n` +
      rendered;

    return {
      submissionId,
      language: "ejs",
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
      language: "ejs",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`EJS Compilation Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 3. Pug Template Compilation & Rendering via official `pug` package
 */
function renderPug(
  submissionId: string,
  code: string,
  stdin: string,
  startTime: number
): ExecutionResult {
  try {
    const trimmed = code.trim();
    if (!trimmed) {
      return {
        submissionId,
        language: "pug",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Pug Error: Template code is empty."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const context = getTemplateContext(stdin);
    const compileFn = pug.compile(code, {
      pretty: true,
      filename: "template.pug",
    });
    const rendered = compileFn(context);

    const stdout =
      `[Pug Template Compiler]\n` +
      `Context Used: ${stdin.trim() ? "Custom (stdin JSON)" : "Default Sample Data"}\n` +
      `Rendered HTML Output:\n` +
      rendered;

    return {
      submissionId,
      language: "pug",
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
      language: "pug",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Pug Compilation Error:\n${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

/**
 * 4. SVG Markup Validator & DOM Structural Inspector
 */
function validateSvg(
  submissionId: string,
  code: string,
  startTime: number
): ExecutionResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      submissionId,
      language: "svg",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("SVG Error: Input is empty. Please provide valid SVG markup."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  // 1. Strict XML Validation using fast-xml-parser
  const validationResult = XMLValidator.validate(trimmed, { allowBooleanAttributes: true });
  if (validationResult !== true) {
    return {
      submissionId,
      language: "svg",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(
        `SVG XML Syntax Error: ${validationResult.err.msg} (line ${validationResult.err.line}, col ${validationResult.err.col})`
      ),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  // 2. Parse XML AST to check root element is <svg>
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
    });
    const parsed = parser.parse(trimmed);

    const svgNode = parsed.svg;
    if (!svgNode) {
      return {
        submissionId,
        language: "svg",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("SVG Schema Error: Document must contain a root <svg> element."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const width = svgNode["@_width"] || "unspecified";
    const height = svgNode["@_height"] || "unspecified";
    const viewBox = svgNode["@_viewBox"] || svgNode["@_viewbox"] || "unspecified";
    const xmlns = svgNode["@_xmlns"] || "unspecified";

    // Inspect child elements
    const childTags: string[] = [];
    for (const key of Object.keys(svgNode)) {
      if (!key.startsWith("@_") && !key.startsWith("#")) {
        const count = Array.isArray(svgNode[key]) ? svgNode[key].length : 1;
        childTags.push(`${count}x <${key}>`);
      }
    }

    const stdout =
      `[SVG Vector Graphics Validator & DOM Inspector]\n` +
      `Root: <svg> (xmlns: ${xmlns})\n` +
      `Dimensions: width=${width}, height=${height}, viewBox="${viewBox}"\n` +
      `Child Elements: ${childTags.length > 0 ? childTags.join(", ") : "None"}\n` +
      `Status: Well-formed SVG XML markup verified (0 errors).\n\n` +
      `Clean Verified SVG Content:\n` +
      trimmed;

    return {
      submissionId,
      language: "svg",
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
      language: "svg",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`SVG Parsing Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}
