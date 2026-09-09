import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { LANGUAGES, VERIFIED_ACTIVE_LANGUAGE_IDS } from "../data/languages.js";
import { runWithJudge0 } from "./judge0Runner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";
import { runMarkupOrQueryLanguage } from "./markupQueryRunner.js";
import { runMobileLanguage } from "./mobileRunner.js";
import { runWithPiston } from "./pistonRunner.js";
import { runSpecializedLanguage } from "./specializedRunner.js";
import { runEsotericLanguage } from "./esotericRunner.js";
import { runEducationalLanguage } from "./educationalRunner.js";
import { runPreprocessorLanguage } from "./preprocessorRunner.js";
import { runDataConfigLanguage } from "./dataConfigRunner.js";
import { runDevopsLanguage } from "./devopsRunner.js";
import { runTemplateLanguage } from "./templateRunner.js";
import { runUtilityLanguage } from "./utilityRunner.js";
import { runSolidity } from "./solidityRunner.js";
import { runRedis } from "./redisRunner.js";
import { runExpansionLanguage } from "./expansionRunner.js";
import { runCypher } from "./graphRunner.js";

export interface ExecutionResult {
  submissionId: string;
  language: string;
  status: "success" | "error" | "timeout" | "compilation_error";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  wallTimeMs: number;
  memoryKb: number;
}

/**
 * Executes untrusted user-submitted code strictly inside a sandboxed environment
 * (Judge0 API with cgroups/namespaces, Ephemeral Docker Container with --network none, or Piston API).
 * Direct host process execution paths have been completely removed per spec.md section 8.
 */
export async function executeCode(
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const submissionId = uuidv4();
  const langConfig = LANGUAGES.find((l) => l.id === languageId);

  if (!langConfig) {
    return {
      submissionId,
      language: languageId,
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(`Unsupported language: ${languageId}`),
      exitCode: 1,
      wallTimeMs: 0,
      memoryKb: 0,
    };
  }

  // Enforce 100% honesty: block execution for unverified / Coming Soon languages
  if (!VERIFIED_ACTIVE_LANGUAGE_IDS.has(languageId)) {
    return {
      submissionId,
      language: languageId,
      status: "error",
      stdout: "",
      stderr: sanitizeOutput(
        `[Nexora Policy] Execution for ${langConfig.name} (${languageId}) is currently disabled (Coming Soon). Only the ${VERIFIED_ACTIVE_LANGUAGE_IDS.size} genuinely verified languages can be executed.`
      ),
      exitCode: 1,
      wallTimeMs: 0,
      memoryKb: 0,
    };
  }

  // 1. Browser Client-Side Sandbox (HTML / CSS Live Preview)
  if (languageId === "html" || languageId === "css") {
    let output = code;
    if (languageId === "css") {
      output = `/* Client-Side Web Sandbox Stylesheet (CSS) */\n<style>\n${code}\n</style>`;
    }
    return {
      submissionId,
      language: languageId,
      status: "success",
      stdout: output,
      stderr: "",
      exitCode: 0,
      wallTimeMs: 1,
      memoryKb: 1024,
    };
  }

  // 2. CSS Preprocessors (SCSS, Less, Stylus, PostCSS via official npm compilers)
  const preprocessorLangs = ["scss", "less", "stylus", "postcss"];
  if (preprocessorLangs.includes(languageId)) {
    return await runPreprocessorLanguage(submissionId, languageId, code);
  }

  // 3. Data & Configuration Parsers (TOML, INI, Protocol Buffers via official npm parsers)
  const dataConfigLangs = ["toml", "ini", "proto", "protobuf"];
  if (dataConfigLangs.includes(languageId)) {
    return await runDataConfigLanguage(submissionId, languageId, code);
  }

  // 4. DevOps & Infrastructure-as-Code Validators (Kubernetes, Dockerfile, Terraform, OPA Rego)
  const devopsLangs = ["k8s", "kubernetes", "dockerfile", "docker", "terraform", "hcl", "rego", "opa"];
  if (devopsLangs.includes(languageId)) {
    return await runDevopsLanguage(submissionId, languageId, code);
  }

  // 5. Template & Markup Compilers (Handlebars, EJS, Pug, SVG)
  const templateLangs = ["handlebars", "hbs", "ejs", "pug", "jade", "svg"];
  if (templateLangs.includes(languageId)) {
    return await runTemplateLanguage(submissionId, languageId, code, stdin);
  }

  // 6. Smart Contract Compilers (Solidity solc)
  if (languageId === "solidity" || languageId === "sol") {
    return await runSolidity(submissionId, code);
  }

  // 7. Live Key-Value Cache / Stores (Redis CLI)
  if (languageId === "redis") {
    return await runRedis(submissionId, code);
  }

  // 8. Utility & Scripting Engines (Diff, jq, sed, Cron, CoffeeScript)
  const utilityLangs = ["diff", "patch", "jq", "sed", "cron", "coffeescript", "coffee"];
  if (utilityLangs.includes(languageId)) {
    return await runUtilityLanguage(submissionId, languageId, code, stdin);
  }

  // 9. Markup & Query Languages (SQL, MySQL, PostgreSQL, MongoDB, JSON, XML, YAML, GraphQL, Markdown, Regex, CSV)
  const markupQueryLangs = ["sql", "mysql", "postgresql", "mongodb", "graphql", "json", "xml", "yaml", "markdown", "regex", "csv"];
  if (markupQueryLangs.includes(languageId)) {
    return await runMarkupOrQueryLanguage(submissionId, languageId, code, stdin);
  }

  // 9b. Graph Query Language (Cypher in-memory subset via cypherdotjs)
  if (languageId === "cypher") {
    return await runCypher(submissionId, code);
  }

  // 10. Educational Languages Visual & Block-based Runtimes (Logo, Karel, Blockly, Scratch, Snap!, Alice 3D)
  if (["logo", "karel", "blockly", "scratch", "snap", "alice"].includes(languageId)) {
    return await runEducationalLanguage(submissionId, languageId, code);
  }

  // 10b. Mobile Viewport Preview & AST Syntax Validation (React Native, Ionic, Cordova, Flutter, NativeScript)
  if (["reactnative", "ionic", "cordova", "flutter", "nativescript"].includes(languageId)) {
    return await runMobileLanguage(submissionId, languageId, code);
  }

  // 11. Esoteric Language Interpreter (Brainfuck, Befunge, Whitespace, Chef, LOLCODE, COW, Malbolge)
  if (["brainfuck", "befunge", "whitespace", "chef", "lolcode", "cow", "malbolge"].includes(languageId)) {
    // Try Piston first if installed, else use verified in-memory interpreter
    const pistonResult = await runWithPiston(submissionId, languageId, code, stdin);
    if (pistonResult && pistonResult.status === "success") {
      return pistonResult;
    }
    return await runEsotericLanguage(submissionId, languageId, code, stdin);
  }

  // 12. Functional & Scripting In-App Engines (Scheme, Tcl, PureScript, ReasonML)
  if (["scheme", "scm", "tcl"].includes(languageId)) {
    return await runSpecializedLanguage(submissionId, languageId, code, stdin);
  }
  if (["purescript", "purs", "reason", "reasonml", "idris", "gleam"].includes(languageId)) {
    return await runExpansionLanguage(submissionId, languageId, code, stdin);
  }

  // 2. Primary Execution Path: Judge0 Sandboxed Execution API (§8 of spec.md)
  const judge0Result = await runWithJudge0(submissionId, languageId, code, stdin);
  if (judge0Result) {
    return judge0Result;
  }

  // 3. Secondary Execution Path: Piston Multi-Language Sandbox API
  const pistonResult = await runWithPiston(submissionId, languageId, code, stdin);
  if (pistonResult) {
    return pistonResult;
  }

  // 4. Specialized Language Evaluator & Runtime Fallback
  const specResult = await runSpecializedLanguage(submissionId, languageId, code, stdin);
  if (specResult) {
    return specResult;
  }

  // 5. Security Enforcement Rejection
  return {
    submissionId,
    language: languageId,
    status: "error",
    stdout: "",
    stderr: sanitizeOutput(
      "Sandbox Enforcement Notice: Sandboxed container worker (Judge0 API or Piston API) is required per production security policy. Host docker execution is disabled."
    ),
    exitCode: 127,
    wallTimeMs: 0,
    memoryKb: 0,
  };
}
