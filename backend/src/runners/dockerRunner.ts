/**
 * DEPRECATED & DISABLED FOR PRODUCTION SECURITY
 * Host Docker socket execution is permanently disabled to prevent container escape
 * and host privilege escalation. Only dedicated sandboxed APIs (Piston & Judge0) are allowed.
 */
import { ExecutionResult } from "./codeRunner.js";

export async function runWithDocker(): Promise<ExecutionResult | null> {
  throw new Error("Security Violation: runWithDocker is permanently disabled in production. Use Piston or Judge0.");
}
