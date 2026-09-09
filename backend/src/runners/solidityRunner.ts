import solc from "solc";
import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Genuine Solidity Smart Contract Compiler using official `solc` npm package
 * Performs real compilation, EVM bytecode generation, and contract ABI export.
 */
export async function runSolidity(
  submissionId: string,
  code: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    const trimmed = code.trim();
    if (!trimmed) {
      return {
        submissionId,
        language: "solidity",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Solidity Error: Empty source code. Please provide a valid Solidity smart contract."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    const input = {
      language: "Solidity",
      sources: {
        "contract.sol": {
          content: trimmed,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
          },
        },
      },
    };

    const outputJson = JSON.parse(solc.compile(JSON.stringify(input)));
    const errors: any[] = outputJson.errors || [];
    const fatalErrors = errors.filter((e) => e.severity === "error");

    if (fatalErrors.length > 0) {
      const errorDetails = fatalErrors
        .map((e) => e.formattedMessage || e.message)
        .join("\n");
      return {
        submissionId,
        language: "solidity",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput(`Solidity Compilation Errors:\n${errorDetails}`),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 2048,
      };
    }

    const warnings = errors.filter((e) => e.severity === "warning");
    const warningText =
      warnings.length > 0
        ? `Warnings (${warnings.length}):\n${warnings
            .slice(0, 3)
            .map((w) => "  - " + (w.formattedMessage || w.message).trim())
            .join("\n")}\n\n`
        : "";

    const contractsObj = outputJson.contracts?.["contract.sol"] || {};
    const contractNames = Object.keys(contractsObj);

    if (contractNames.length === 0) {
      return {
        submissionId,
        language: "solidity",
        status: "success",
        stdout: sanitizeOutput(
          `[Solidity solc Compiler]\nNotice: No contract definitions found in source file.\n${warningText}Status: Source validated cleanly.`
        ),
        stderr: "",
        exitCode: 0,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 2048,
      };
    }

    const contractSummaries = contractNames.map((name) => {
      const c = contractsObj[name];
      const bytecode = c.evm?.bytecode?.object || "";
      const deployedBytecode = c.evm?.deployedBytecode?.object || "";
      const abi = c.abi || [];
      const methods = abi
        .filter((item: any) => item.type === "function")
        .map(
          (f: any) =>
            `${f.name}(${(f.inputs || [])
              .map((i: any) => `${i.type} ${i.name}`)
              .join(", ")})`
        );

      return (
        `Contract: ${name}\n` +
        `  Bytecode Size: ${(bytecode.length / 2).toLocaleString()} bytes (Deployed: ${(
          deployedBytecode.length / 2
        ).toLocaleString()} bytes)\n` +
        `  ABI Functions: [${methods.join(", ") || "none"}]\n` +
        `  Generated ABI JSON:\n${JSON.stringify(abi, null, 2)}`
      );
    });

    const stdout =
      `[Solidity solc Smart Contract Compiler]\n` +
      `Compiled Contract(s): [${contractNames.join(", ")}]\n` +
      warningText +
      contractSummaries.join("\n\n") +
      `\n\nStatus: Compilation Successful (Exit 0).`;

    return {
      submissionId,
      language: "solidity",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 4096,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "solidity",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Solidity Compiler Error: ${err.message || String(err)}`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 1024,
    };
  }
}
