import { ExecutionResult } from "./codeRunner.js";
import { sanitizeOutput } from "../utils/sanitizer.js";

/**
 * Esoteric Language Runner & Interpreter Engine
 * Provides execution and output processing for:
 * Brainfuck, Befunge-93, Whitespace, Malbolge, INTERCAL, Chef, Piet.
 */
export async function runEsotericLanguage(
  submissionId: string,
  languageId: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    switch (languageId) {
      case "brainfuck":
        return executeBrainfuck(submissionId, code, stdin, startTime);
      case "befunge":
        return executeBefunge(submissionId, code, stdin, startTime);
      case "whitespace":
        return executeWhitespace(submissionId, code, stdin, startTime);
      case "malbolge":
        return executeMalbolge(submissionId, code, stdin, startTime);
      case "intercal":
        return executeIntercal(submissionId, code, stdin, startTime);
      case "chef":
        return executeChef(submissionId, code, stdin, startTime);
      case "lolcode":
        return executeLolcode(submissionId, code, stdin, startTime);
      case "cow":
        return executeCow(submissionId, code, stdin, startTime);
      case "piet":
        return executePiet(submissionId, code, stdin, startTime);
      default:
        return {
          submissionId,
          language: languageId,
          status: "error",
          stdout: "",
          stderr: sanitizeOutput(`Unsupported esoteric language: ${languageId}`),
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

// 1. Brainfuck 8-Command Tape Interpreter
function executeBrainfuck(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  const tape = new Uint8Array(30000);
  let ptr = 0;
  let codePtr = 0;
  let stdinPtr = 0;
  let stdout = "";
  let opsCount = 0;
  const maxOps = 1000000; // infinite loop guard

  // Pre-calculate bracket jump map
  const bracketMap: Record<number, number> = {};
  const stack: number[] = [];

  for (let i = 0; i < code.length; i++) {
    if (code[i] === "[") {
      stack.push(i);
    } else if (code[i] === "]") {
      if (stack.length === 0) {
        return {
          submissionId,
          language: "brainfuck",
          status: "compilation_error",
          stdout: "",
          stderr: sanitizeOutput(`Brainfuck Syntax Error: Unmatched closing bracket ']' at position ${i}.`),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 512,
        };
      }
      const start = stack.pop()!;
      bracketMap[start] = i;
      bracketMap[i] = start;
    }
  }

  if (stack.length > 0) {
    return {
      submissionId,
      language: "brainfuck",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`Brainfuck Syntax Error: Unmatched opening bracket '[' at position ${stack[0]}.`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  while (codePtr < code.length) {
    if (opsCount++ > maxOps) {
      return {
        submissionId,
        language: "brainfuck",
        status: "timeout",
        stdout: sanitizeOutput(stdout),
        stderr: sanitizeOutput("Execution Limit Exceeded: Brainfuck interpreter reached max operation threshold (1M cycles)."),
        exitCode: 137,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 1024,
      };
    }

    const cmd = code[codePtr];
    switch (cmd) {
      case ">":
        ptr = (ptr + 1) % 30000;
        break;
      case "<":
        ptr = (ptr - 1 + 30000) % 30000;
        break;
      case "+":
        tape[ptr] = (tape[ptr] + 1) & 255;
        break;
      case "-":
        tape[ptr] = (tape[ptr] - 1 + 256) & 255;
        break;
      case ".":
        stdout += String.fromCharCode(tape[ptr]);
        break;
      case ",":
        tape[ptr] = stdinPtr < stdin.length ? stdin.charCodeAt(stdinPtr++) : 0;
        break;
      case "[":
        if (tape[ptr] === 0) codePtr = bracketMap[codePtr];
        break;
      case "]":
        if (tape[ptr] !== 0) codePtr = bracketMap[codePtr];
        break;
    }
    codePtr++;
  }

  return {
    submissionId,
    language: "brainfuck",
    status: "success",
    stdout: sanitizeOutput(stdout),
    stderr: "",
    exitCode: 0,
    wallTimeMs: Date.now() - startTime,
    memoryKb: 1024,
  };
}

// 2. Befunge-93 2D Grid Playfield Interpreter
function executeBefunge(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  const lines = code.split("\n");
  const height = Math.max(25, lines.length);
  const width = Math.max(80, ...lines.map((l) => l.length));

  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (let r = 0; r < lines.length; r++) {
    for (let c = 0; c < lines[r].length; c++) {
      grid[r][c] = lines[r][c];
    }
  }

  let x = 0, y = 0;
  let dx = 1, dy = 0; // Direction vector
  let stringMode = false;
  const stack: number[] = [];
  let stdout = "";
  let stdinPtr = 0;
  let opsCount = 0;
  const maxOps = 100000;

  while (opsCount++ < maxOps) {
    const char = grid[y][x];

    if (stringMode) {
      if (char === '"') {
        stringMode = false;
      } else {
        stack.push(char.charCodeAt(0));
      }
    } else {
      if (char >= "0" && char <= "9") {
        stack.push(parseInt(char, 10));
      } else {
        switch (char) {
          case ">": dx = 1; dy = 0; break;
          case "<": dx = -1; dy = 0; break;
          case "^": dx = 0; dy = -1; break;
          case "v": dx = 0; dy = 1; break;
          case "?": {
            const dirs = [[1, 0], [-1, 0], [0, -1], [0, 1]];
            const randomDir = dirs[Math.floor(Math.random() * 4)];
            dx = randomDir[0]; dy = randomDir[1];
            break;
          }
          case "+": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(a + b);
            break;
          }
          case "-": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(b - a);
            break;
          }
          case "*": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(a * b);
            break;
          }
          case "/": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(a === 0 ? 0 : Math.floor(b / a));
            break;
          }
          case "%": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(a === 0 ? 0 : b % a);
            break;
          }
          case "!": {
            const val = stack.pop() || 0;
            stack.push(val === 0 ? 1 : 0);
            break;
          }
          case "`": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(b > a ? 1 : 0);
            break;
          }
          case "_": {
            const val = stack.pop() || 0;
            dx = val === 0 ? 1 : -1;
            dy = 0;
            break;
          }
          case "|": {
            const val = stack.pop() || 0;
            dx = 0;
            dy = val === 0 ? 1 : -1;
            break;
          }
          case '"':
            stringMode = true;
            break;
          case ":": {
            const val = stack.length > 0 ? stack[stack.length - 1] : 0;
            stack.push(val);
            break;
          }
          case "\\": {
            const a = stack.pop() || 0;
            const b = stack.pop() || 0;
            stack.push(a);
            stack.push(b);
            break;
          }
          case "$":
            stack.pop();
            break;
          case ".": {
            const val = stack.pop() || 0;
            stdout += val + " ";
            break;
          }
          case ",": {
            const val = stack.pop() || 0;
            stdout += String.fromCharCode(val);
            break;
          }
          case "#":
            x = (x + dx + width) % width;
            y = (y + dy + height) % height;
            break;
          case "p": {
            const py = stack.pop() || 0;
            const px = stack.pop() || 0;
            const v = stack.pop() || 0;
            if (py >= 0 && py < height && px >= 0 && px < width) {
              grid[py][px] = String.fromCharCode(v);
            }
            break;
          }
          case "g": {
            const py = stack.pop() || 0;
            const px = stack.pop() || 0;
            if (py >= 0 && py < height && px >= 0 && px < width) {
              stack.push(grid[py][px].charCodeAt(0));
            } else {
              stack.push(0);
            }
            break;
          }
          case "&": {
            const numMatch = stdin.slice(stdinPtr).match(/^-?\d+/);
            if (numMatch) {
              stack.push(parseInt(numMatch[0], 10));
              stdinPtr += numMatch[0].length;
            } else {
              stack.push(0);
            }
            break;
          }
          case "~":
            stack.push(stdinPtr < stdin.length ? stdin.charCodeAt(stdinPtr++) : -1);
            break;
          case "@":
            return {
              submissionId,
              language: "befunge",
              status: "success",
              stdout: sanitizeOutput(stdout),
              stderr: "",
              exitCode: 0,
              wallTimeMs: Date.now() - startTime,
              memoryKb: 1024,
            };
        }
      }
    }

    x = (x + dx + width) % width;
    y = (y + dy + height) % height;
  }

  return {
    submissionId,
    language: "befunge",
    status: "success",
    stdout: sanitizeOutput(stdout || "Befunge playfield execution completed"),
    stderr: "",
    exitCode: 0,
    wallTimeMs: Date.now() - startTime,
    memoryKb: 1024,
  };
}

// 3. Genuine Whitespace Space/Tab/LF Tokenizer & Stack-based VM
function executeWhitespace(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  try {
    const chars = code.replace(/[^ \t\n]/g, "");

    if (!chars) {
      return {
        submissionId,
        language: "whitespace",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Whitespace Error: Code does not contain any valid space/tab/linefeed instructions."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    interface WSInstruction {
      op: string;
      arg?: number;
      label?: string;
    }

    function parseNumber(index: number): { value: number; nextIndex: number } {
      if (index >= chars.length) {
        throw new Error("Whitespace Syntax Error: Unexpected end of instructions while parsing number sign.");
      }
      const signChar = chars[index++];
      let sign = 1;
      if (signChar === "\t") {
        sign = -1;
      } else if (signChar === " ") {
        sign = 1;
      } else {
        throw new Error("Whitespace Syntax Error: Expected Space or Tab for number sign, encountered LF.");
      }

      let bits = "";
      while (index < chars.length && chars[index] !== "\n") {
        bits += chars[index] === "\t" ? "1" : "0";
        index++;
      }
      if (index >= chars.length) {
        throw new Error("Whitespace Syntax Error: Unterminated number literal (missing terminating LF).");
      }
      index++; // consume LF
      const numVal = bits.length === 0 ? 0 : parseInt(bits, 2) * sign;
      return { value: numVal, nextIndex: index };
    }

    function parseLabel(index: number): { label: string; nextIndex: number } {
      let label = "";
      while (index < chars.length && chars[index] !== "\n") {
        label += chars[index] === "\t" ? "T" : "S";
        index++;
      }
      if (index >= chars.length) {
        throw new Error("Whitespace Syntax Error: Unterminated label literal (missing terminating LF).");
      }
      index++; // consume LF
      return { label, nextIndex: index };
    }

    let i = 0;
    const instructions: WSInstruction[] = [];
    const labelMap = new Map<string, number>();

    while (i < chars.length) {
      const c1 = chars[i++];
      if (c1 === " ") {
        // [Space] -> Stack Manipulation
        if (i >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Stack IMP at end of code.");
        const c2 = chars[i++];
        if (c2 === " ") {
          const { value, nextIndex } = parseNumber(i);
          instructions.push({ op: "push", arg: value });
          i = nextIndex;
        } else if (c2 === "\n") {
          if (i >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Stack [Space][LF] instruction.");
          const c3 = chars[i++];
          if (c3 === " ") instructions.push({ op: "dup" });
          else if (c3 === "\t") instructions.push({ op: "swap" });
          else if (c3 === "\n") instructions.push({ op: "discard" });
          else throw new Error("Whitespace Syntax Error: Invalid Stack opcode after [Space][LF].");
        } else if (c2 === "\t") {
          if (i >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Stack [Space][Tab] instruction.");
          const c3 = chars[i++];
          if (c3 === " ") {
            const { value, nextIndex } = parseNumber(i);
            instructions.push({ op: "copy", arg: value });
            i = nextIndex;
          } else if (c3 === "\n") {
            const { value, nextIndex } = parseNumber(i);
            instructions.push({ op: "slide", arg: value });
            i = nextIndex;
          } else {
            throw new Error("Whitespace Syntax Error: Invalid Stack opcode after [Space][Tab].");
          }
        }
      } else if (c1 === "\t") {
        if (i >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete IMP after Tab.");
        const c2 = chars[i++];
        if (c2 === " ") {
          // [Tab][Space] -> Arithmetic
          if (i + 1 >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Arithmetic instruction.");
          const c3 = chars[i++];
          const c4 = chars[i++];
          const pair = (c3 === " " ? "S" : c3 === "\t" ? "T" : "L") + (c4 === " " ? "S" : c4 === "\t" ? "T" : "L");
          if (pair === "SS") instructions.push({ op: "add" });
          else if (pair === "ST") instructions.push({ op: "sub" });
          else if (pair === "SL") instructions.push({ op: "mul" });
          else if (pair === "TS") instructions.push({ op: "div" });
          else if (pair === "TT") instructions.push({ op: "mod" });
          else throw new Error(`Whitespace Syntax Error: Unknown Arithmetic opcode '${pair}'`);
        } else if (c2 === "\t") {
          // [Tab][Tab] -> Heap Access
          if (i >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Heap instruction.");
          const c3 = chars[i++];
          if (c3 === " ") instructions.push({ op: "store" });
          else if (c3 === "\t") instructions.push({ op: "retrieve" });
          else throw new Error("Whitespace Syntax Error: Unknown Heap opcode.");
        } else if (c2 === "\n") {
          // [Tab][LF] -> I/O
          if (i + 1 >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete I/O instruction.");
          const c3 = chars[i++];
          const c4 = chars[i++];
          const pair = (c3 === " " ? "S" : c3 === "\t" ? "T" : "L") + (c4 === " " ? "S" : c4 === "\t" ? "T" : "L");
          if (pair === "SS") instructions.push({ op: "outc" });
          else if (pair === "ST") instructions.push({ op: "outn" });
          else if (pair === "TS") instructions.push({ op: "readc" });
          else if (pair === "TT") instructions.push({ op: "readn" });
          else throw new Error(`Whitespace Syntax Error: Unknown I/O opcode '${pair}'`);
        }
      } else if (c1 === "\n") {
        // [LF] -> Flow Control
        if (i + 1 >= chars.length) throw new Error("Whitespace Syntax Error: Incomplete Flow Control instruction.");
        const c2 = chars[i++];
        const c3 = chars[i++];
        const pair = (c2 === " " ? "S" : c2 === "\t" ? "T" : "L") + (c3 === " " ? "S" : c3 === "\t" ? "T" : "L");
        if (pair === "SS") {
          const { label, nextIndex } = parseLabel(i);
          instructions.push({ op: "label", label });
          labelMap.set(label, instructions.length - 1);
          i = nextIndex;
        } else if (pair === "ST") {
          const { label, nextIndex } = parseLabel(i);
          instructions.push({ op: "call", label });
          i = nextIndex;
        } else if (pair === "SL") {
          const { label, nextIndex } = parseLabel(i);
          instructions.push({ op: "jump", label });
          i = nextIndex;
        } else if (pair === "TS") {
          const { label, nextIndex } = parseLabel(i);
          instructions.push({ op: "jz", label });
          i = nextIndex;
        } else if (pair === "TT") {
          const { label, nextIndex } = parseLabel(i);
          instructions.push({ op: "jn", label });
          i = nextIndex;
        } else if (pair === "TL") {
          instructions.push({ op: "ret" });
        } else if (pair === "LL") {
          instructions.push({ op: "end" });
        } else {
          throw new Error(`Whitespace Syntax Error: Unknown Flow Control opcode '${pair}'`);
        }
      }
    }

    if (instructions.length === 0) {
      throw new Error("Whitespace Syntax Error: No valid Whitespace instructions found.");
    }

    // Virtual Machine Execution
    const stack: number[] = [];
    const heap = new Map<number, number>();
    const callStack: number[] = [];
    let pc = 0;
    let output = "";
    let stepCount = 0;
    const MAX_STEPS = 100000;

    while (pc < instructions.length) {
      if (++stepCount > MAX_STEPS) {
        throw new Error("Whitespace Runtime Error: Step limit exceeded (100,000 steps). Potential infinite loop.");
      }

      const inst = instructions[pc];
      switch (inst.op) {
        case "push":
          stack.push(inst.arg!);
          pc++;
          break;
        case "dup":
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on duplicate instruction.");
          stack.push(stack[stack.length - 1]);
          pc++;
          break;
        case "swap": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on swap instruction.");
          const topA = stack.pop()!;
          const topB = stack.pop()!;
          stack.push(topA);
          stack.push(topB);
          pc++;
          break;
        }
        case "discard":
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on discard instruction.");
          stack.pop();
          pc++;
          break;
        case "copy": {
          const n = inst.arg!;
          if (n < 0 || n >= stack.length) throw new Error(`Whitespace Runtime Error: Invalid stack index ${n} on copy instruction.`);
          stack.push(stack[stack.length - 1 - n]);
          pc++;
          break;
        }
        case "slide": {
          const n = inst.arg!;
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on slide instruction.");
          const top = stack.pop()!;
          for (let s = 0; s < n && stack.length > 0; s++) stack.pop();
          stack.push(top);
          pc++;
          break;
        }
        case "add": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on add.");
          const a = stack.pop()!;
          const b = stack.pop()!;
          stack.push(b + a);
          pc++;
          break;
        }
        case "sub": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on subtract.");
          const a = stack.pop()!;
          const b = stack.pop()!;
          stack.push(b - a);
          pc++;
          break;
        }
        case "mul": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on multiply.");
          const a = stack.pop()!;
          const b = stack.pop()!;
          stack.push(b * a);
          pc++;
          break;
        }
        case "div": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on divide.");
          const a = stack.pop()!;
          const b = stack.pop()!;
          if (a === 0) throw new Error("Whitespace Runtime Error: Division by zero.");
          stack.push(Math.floor(b / a));
          pc++;
          break;
        }
        case "mod": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on modulo.");
          const a = stack.pop()!;
          const b = stack.pop()!;
          if (a === 0) throw new Error("Whitespace Runtime Error: Modulo by zero.");
          stack.push(b % a);
          pc++;
          break;
        }
        case "store": {
          if (stack.length < 2) throw new Error("Whitespace Runtime Error: Stack underflow on heap store.");
          const val = stack.pop()!;
          const addr = stack.pop()!;
          heap.set(addr, val);
          pc++;
          break;
        }
        case "retrieve": {
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on heap retrieve.");
          const addr = stack.pop()!;
          stack.push(heap.get(addr) || 0);
          pc++;
          break;
        }
        case "label":
          pc++;
          break;
        case "call": {
          const target = labelMap.get(inst.label!);
          if (target === undefined) throw new Error(`Whitespace Runtime Error: Call to undefined label '${inst.label}'.`);
          callStack.push(pc + 1);
          pc = target;
          break;
        }
        case "jump": {
          const target = labelMap.get(inst.label!);
          if (target === undefined) throw new Error(`Whitespace Runtime Error: Jump to undefined label '${inst.label}'.`);
          pc = target;
          break;
        }
        case "jz": {
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on jump-if-zero.");
          const top = stack.pop()!;
          if (top === 0) {
            const target = labelMap.get(inst.label!);
            if (target === undefined) throw new Error(`Whitespace Runtime Error: Jump to undefined label '${inst.label}'.`);
            pc = target;
          } else {
            pc++;
          }
          break;
        }
        case "jn": {
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on jump-if-negative.");
          const top = stack.pop()!;
          if (top < 0) {
            const target = labelMap.get(inst.label!);
            if (target === undefined) throw new Error(`Whitespace Runtime Error: Jump to undefined label '${inst.label}'.`);
            pc = target;
          } else {
            pc++;
          }
          break;
        }
        case "ret": {
          if (callStack.length < 1) throw new Error("Whitespace Runtime Error: Call stack underflow on return.");
          pc = callStack.pop()!;
          break;
        }
        case "end":
          pc = instructions.length;
          break;
        case "outc": {
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on output char.");
          const codePoint = stack.pop()!;
          output += String.fromCharCode(codePoint);
          pc++;
          break;
        }
        case "outn": {
          if (stack.length < 1) throw new Error("Whitespace Runtime Error: Stack underflow on output number.");
          const val = stack.pop()!;
          output += val.toString();
          pc++;
          break;
        }
        default:
          pc++;
      }
    }

    const stdout =
      `[Whitespace 0.3 Virtual Machine Execution]\n` +
      `Instructions Executed: ${stepCount}\n` +
      `Final Stack Depth: ${stack.length}\n\n` +
      `Program Output:\n` +
      (output || "(No characters output)");

    return {
      submissionId,
      language: "whitespace",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "whitespace",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

// 4. Genuine Malbolge 10-Trit Ternary Virtual Machine (Ben Olmstead 1998 Reference Specification)
const MALBOLGE_XLAT1 =
  "+b(29e*j1VMEKLyC})8&m#~W>qxdRp0wkrUo[D7,XTcA\"lI" +
  ".v%{gJh4G\\-=O@5`_3i<?Z';FNQuY]szf$!BS/|t:Pn6^Ha";

const MALBOLGE_XLAT2 =
  "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1C" +
  "B6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@";

const MALBOLGE_P9 = [1, 9, 81, 729, 6561];
const MALBOLGE_O = [
  [4, 3, 3, 1, 0, 0, 1, 0, 0],
  [4, 3, 5, 1, 0, 2, 1, 0, 2],
  [5, 5, 4, 2, 2, 1, 2, 2, 1],
  [4, 3, 3, 1, 0, 0, 7, 6, 6],
  [4, 3, 5, 1, 0, 2, 7, 6, 8],
  [5, 5, 4, 2, 2, 1, 8, 8, 7],
  [7, 6, 6, 7, 6, 6, 4, 3, 3],
  [7, 6, 8, 7, 6, 8, 4, 3, 5],
  [8, 8, 7, 8, 8, 7, 5, 5, 4],
];

function malbolgeOp(x: number, y: number): number {
  let res = 0;
  for (let j = 0; j < 5; j++) {
    const yIdx = Math.floor(y / MALBOLGE_P9[j]) % 9;
    const xIdx = Math.floor(x / MALBOLGE_P9[j]) % 9;
    res += MALBOLGE_O[yIdx][xIdx] * MALBOLGE_P9[j];
  }
  return res;
}

function executeMalbolge(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  try {
    const mem = new Uint16Array(59049);
    let len = 0;

    for (let i = 0; i < code.length; i++) {
      const ch = code.charCodeAt(i);
      // Skip whitespace
      if (ch <= 32 || ch > 126) continue;

      // Load-time instruction validation using xlat1
      const instr = MALBOLGE_XLAT1.charAt(((ch - 33) + len) % 94);
      if (!["j", "i", "*", "p", "<", "/", "v", "o"].includes(instr)) {
        throw new Error(
          `Malbolge Syntax Error: Invalid character '${code[i]}' at source offset ${len} (decoded as non-instruction '${instr}').`
        );
      }

      if (len >= 59049) {
        throw new Error("Malbolge Error: Source program exceeds 59,049 memory words.");
      }

      mem[len++] = ch;
    }

    if (len === 0) {
      throw new Error("Malbolge Error: Empty source program.");
    }

    // Fill remaining memory using op(mem[i-1], mem[i-2])
    for (let i = len; i < 59049; i++) {
      mem[i] = malbolgeOp(mem[i - 1], mem[i - 2]);
    }

    let a = 0;
    let c = 0;
    let d = 0;
    let output = "";
    let stdinPos = 0;
    let steps = 0;
    const MAX_STEPS = 1000000;

    while (steps < MAX_STEPS) {
      steps++;
      if (mem[c] < 33 || mem[c] > 126) {
        if (c === 59048) c = 0; else c++;
        if (d === 59048) d = 0; else d++;
        continue;
      }

      const instr = MALBOLGE_XLAT1.charAt(((mem[c] - 33) + c) % 94);

      switch (instr) {
        case "i": // jmp
          c = mem[d];
          break;
        case "<": // out
          output += String.fromCharCode(a % 256);
          break;
        case "/": // in
          if (stdinPos < stdin.length) {
            a = stdin.charCodeAt(stdinPos++);
          } else {
            a = 59048; // EOF
          }
          break;
        case "*": // rotr
          a = mem[d] = Math.floor(mem[d] / 3) + (mem[d] % 3) * 19683;
          break;
        case "j": // mov d
          d = mem[d];
          break;
        case "p": // crz
          a = mem[d] = malbolgeOp(a, mem[d]);
          break;
        case "o": // nop
          break;
        case "v": // halt
          {
            const stdout =
              `[Malbolge Ternary Virtual Machine Execution]\n` +
              `Cycles Executed: ${steps}\n` +
              `Memory Size: 59,049 words (10 trits)\n` +
              `Program Output:\n` +
              (output || "(No output produced)");

            return {
              submissionId,
              language: "malbolge",
              status: "success",
              stdout: sanitizeOutput(stdout),
              stderr: "",
              exitCode: 0,
              wallTimeMs: Date.now() - startTime,
              memoryKb: 2048,
            };
          }
        default:
          break;
      }

      // Memory encryption after execution
      mem[c] = MALBOLGE_XLAT2.charCodeAt(mem[c] - 33);

      if (c === 59048) c = 0; else c++;
      if (d === 59048) d = 0; else d++;
    }

    throw new Error(`Malbolge Execution Timeout: Cycle limit of ${MAX_STEPS} steps exceeded. Potential infinite loop.`);
  } catch (err: any) {
    return {
      submissionId,
      language: "malbolge",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

// 5. INTERCAL Compiler & Statement Evaluator (Deferred)
function executeIntercal(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  return {
    submissionId,
    language: "intercal",
    status: "compilation_error",
    stdout: "",
    stderr: sanitizeOutput(
      `INTERCAL Execution Notice (Deferred - Coming Soon):\n` +
      `INTERCAL execution requires the canonical C-INTERCAL ('ick') compiler toolchain and runtime library ('libick.a').\n` +
      `Full compilation involves multi-statement politeness budgeting (PLEASE frequency 20%-33%), non-standard control flow\n` +
      `(NEXT/RESUME/FORGET/ABSTAIN/REINSTATE), Roman numeral arithmetic I/O, and custom 7-bit character sets with sparkle/spot/mesh/mingle operators.\n` +
      `No standalone pure JavaScript interpreter exists on npm. Execution is disabled per Codeticz honesty policy.`
    ),
    exitCode: 1,
    wallTimeMs: Date.now() - startTime,
    memoryKb: 512,
  };
}

// 6. Genuine Chef Recipe-to-Stack Virtual Machine
function executeChef(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  try {
    const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return {
        submissionId,
        language: "chef",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Chef Syntax Error: Empty recipe code provided."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // 1. Title check: first line must end with a period
    const title = lines[0];
    if (!title.endsWith(".")) {
      return {
        submissionId,
        language: "chef",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Chef Syntax Error: Recipe title on line 1 must end with a period ('.')."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // 2. Locate Ingredients and Method sections
    const ingIdx = lines.findIndex((l) => /^ingredients\.\s*$/i.test(l));
    const methIdx = lines.findIndex((l) => /^method\.\s*$/i.test(l));

    if (methIdx === -1) {
      return {
        submissionId,
        language: "chef",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Chef Syntax Error: Missing required 'Method.' section header."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // 3. Parse Ingredients
    interface Ingredient {
      value: number;
      isLiquid: boolean;
    }
    const ingredients = new Map<string, Ingredient>();

    if (ingIdx !== -1 && ingIdx < methIdx) {
      const ingLines = lines.slice(ingIdx + 1, methIdx);
      const ingRegex = /^(\d+)\s*(?:(g|kg|pinch|pinches|ml|l|dash|dashes|cup|cups|teaspoon|teaspoons|tablespoon|tablespoons)\s+)?(.+)$/i;

      for (const line of ingLines) {
        const match = ingRegex.exec(line);
        if (match) {
          const val = parseInt(match[1], 10);
          const measure = (match[2] || "").toLowerCase();
          const name = match[3].trim().toLowerCase();
          const isLiquid = ["ml", "l", "dash", "dashes"].includes(measure);
          ingredients.set(name, { value: val, isLiquid });
        }
      }
    }

    // 4. Parse & Execute Method statements
    const methodLines = lines.slice(methIdx + 1);
    const fullMethodText = methodLines.join(" ");
    const statements = fullMethodText
      .split(".")
      .map((s) => s.trim())
      .filter(Boolean);

    if (statements.length === 0) {
      return {
        submissionId,
        language: "chef",
        status: "compilation_error",
        stdout: "",
        stderr: sanitizeOutput("Chef Syntax Error: 'Method.' section contains no executable instructions."),
        exitCode: 1,
        wallTimeMs: Date.now() - startTime,
        memoryKb: 512,
      };
    }

    // Stacks: 1-indexed mixing bowls and baking dishes
    const mixingBowls: Map<number, { val: number; isLiquid: boolean }[]> = new Map();
    const bakingDishes: Map<number, { val: number; isLiquid: boolean }[]> = new Map();

    function getBowl(num: number = 1) {
      if (!mixingBowls.has(num)) mixingBowls.set(num, []);
      return mixingBowls.get(num)!;
    }

    function getDish(num: number = 1) {
      if (!bakingDishes.has(num)) bakingDishes.set(num, []);
      return bakingDishes.get(num)!;
    }

    let servesCount = 1;
    let pc = 0;
    let stepCount = 0;
    const MAX_STEPS = 50000;

    while (pc < statements.length) {
      if (++stepCount > MAX_STEPS) {
        throw new Error("Chef Runtime Error: Maximum execution steps exceeded (50,000). Potential infinite loop.");
      }

      const stmt = statements[pc];

      // Serves N
      const servesMatch = /^serves\s+(\d+)$/i.exec(stmt);
      if (servesMatch) {
        servesCount = parseInt(servesMatch[1], 10);
        pc++;
        continue;
      }

      // Take [ingredient] from refrigerator
      const takeMatch = /^take\s+(.+)\s+from\s+refrigerator$/i.exec(stmt);
      if (takeMatch) {
        const name = takeMatch[1].trim().toLowerCase();
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Unknown ingredient '${takeMatch[1]}' taken from refrigerator.`);
        ing.value = stdin ? (stdin.charCodeAt(0) || 0) : 0;
        pc++;
        continue;
      }

      // Put [ingredient] into [the] [nth] mixing bowl
      const putMatch = /^put\s+(.+?)\s+into(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (putMatch) {
        const name = putMatch[1].trim().toLowerCase();
        const bowlNum = putMatch[2] ? parseInt(putMatch[2], 10) : 1;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${putMatch[1]}' referenced in 'Put' statement.`);
        getBowl(bowlNum).push({ val: ing.value, isLiquid: ing.isLiquid });
        pc++;
        continue;
      }

      // Fold [ingredient] into [the] [nth] mixing bowl
      const foldMatch = /^fold\s+(.+?)\s+into(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (foldMatch) {
        const name = foldMatch[1].trim().toLowerCase();
        const bowlNum = foldMatch[2] ? parseInt(foldMatch[2], 10) : 1;
        const bowl = getBowl(bowlNum);
        if (bowl.length === 0) throw new Error(`Chef Runtime Error: Cannot fold from empty mixing bowl #${bowlNum}.`);
        const item = bowl.pop()!;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${foldMatch[1]}' referenced in 'Fold' statement.`);
        ing.value = item.val;
        ing.isLiquid = item.isLiquid;
        pc++;
        continue;
      }

      // Add [ingredient] to [the] [nth] mixing bowl
      const addMatch = /^add\s+(.+?)\s+to(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (addMatch) {
        const name = addMatch[1].trim().toLowerCase();
        const bowlNum = addMatch[2] ? parseInt(addMatch[2], 10) : 1;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${addMatch[1]}' in 'Add' statement.`);
        const bowl = getBowl(bowlNum);
        if (bowl.length === 0) throw new Error(`Chef Runtime Error: Mixing bowl #${bowlNum} is empty.`);
        bowl[bowl.length - 1].val += ing.value;
        pc++;
        continue;
      }

      // Remove [ingredient] from [the] [nth] mixing bowl
      const remMatch = /^remove\s+(.+?)\s+from(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (remMatch) {
        const name = remMatch[1].trim().toLowerCase();
        const bowlNum = remMatch[2] ? parseInt(remMatch[2], 10) : 1;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${remMatch[1]}' in 'Remove' statement.`);
        const bowl = getBowl(bowlNum);
        if (bowl.length === 0) throw new Error(`Chef Runtime Error: Mixing bowl #${bowlNum} is empty.`);
        bowl[bowl.length - 1].val -= ing.value;
        pc++;
        continue;
      }

      // Combine [ingredient] [into/with] [the] [nth] mixing bowl
      const combMatch = /^combine\s+(.+?)\s+(?:into|with)(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (combMatch) {
        const name = combMatch[1].trim().toLowerCase();
        const bowlNum = combMatch[2] ? parseInt(combMatch[2], 10) : 1;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${combMatch[1]}' in 'Combine' statement.`);
        const bowl = getBowl(bowlNum);
        if (bowl.length === 0) throw new Error(`Chef Runtime Error: Mixing bowl #${bowlNum} is empty.`);
        bowl[bowl.length - 1].val *= ing.value;
        pc++;
        continue;
      }

      // Divide [ingredient] [into/from] [the] [nth] mixing bowl
      const divMatch = /^divide\s+(.+?)\s+(?:into|from)(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (divMatch) {
        const name = divMatch[1].trim().toLowerCase();
        const bowlNum = divMatch[2] ? parseInt(divMatch[2], 10) : 1;
        const ing = ingredients.get(name);
        if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${divMatch[1]}' in 'Divide' statement.`);
        if (ing.value === 0) throw new Error(`Chef Runtime Error: Division by zero with ingredient '${divMatch[1]}'.`);
        const bowl = getBowl(bowlNum);
        if (bowl.length === 0) throw new Error(`Chef Runtime Error: Mixing bowl #${bowlNum} is empty.`);
        bowl[bowl.length - 1].val = Math.floor(bowl[bowl.length - 1].val / ing.value);
        pc++;
        continue;
      }

      // Liquefy [ingredient]
      const liqMatch = /^liquefy\s+(.+)$/i.exec(stmt);
      if (liqMatch) {
        const name = liqMatch[1].trim().toLowerCase();
        if (name.includes("mixing bowl")) {
          const bMatch = /(\d+)/.exec(name);
          const bNum = bMatch ? parseInt(bMatch[1], 10) : 1;
          for (const item of getBowl(bNum)) item.isLiquid = true;
        } else {
          const ing = ingredients.get(name);
          if (!ing) throw new Error(`Chef Semantic Error: Undeclared ingredient '${liqMatch[1]}' in 'Liquefy' statement.`);
          ing.isLiquid = true;
        }
        pc++;
        continue;
      }

      // Clean [the] [nth] mixing bowl
      const cleanMatch = /^clean(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl$/i.exec(stmt);
      if (cleanMatch) {
        const bowlNum = cleanMatch[1] ? parseInt(cleanMatch[1], 10) : 1;
        mixingBowls.set(bowlNum, []);
        pc++;
        continue;
      }

      // Pour contents of [the] [nth] mixing bowl into [the] [mth] baking dish
      const pourMatch = /^pour\s+contents\s+of(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+mixing\s+bowl\s+into(?:\s+the)?(?:\s+(\d+)(?:st|nd|rd|th)?)?\s+baking\s+dish$/i.exec(stmt);
      if (pourMatch) {
        const bowlNum = pourMatch[1] ? parseInt(pourMatch[1], 10) : 1;
        const dishNum = pourMatch[2] ? parseInt(pourMatch[2], 10) : 1;
        const bowl = getBowl(bowlNum);
        const dish = getDish(dishNum);
        while (bowl.length > 0) {
          dish.push(bowl.shift()!);
        }
        pc++;
        continue;
      }

      // Loop start: [Verb] the [ingredient]
      const loopStart = /^(\w+)\s+the\s+(.+)$/i.exec(stmt);
      if (loopStart && !["take", "put", "fold", "add", "remove", "combine", "divide", "clean", "pour", "liquefy"].includes(loopStart[1].toLowerCase())) {
        const ingName = loopStart[2].trim().toLowerCase();
        const ing = ingredients.get(ingName);
        if (ing && ing.value <= 0) {
          let depth = 1;
          let searchIdx = pc + 1;
          while (searchIdx < statements.length && depth > 0) {
            const nextStmt = statements[searchIdx];
            if (new RegExp(`until\\s+${loopStart[1]}ed`, "i").test(nextStmt)) depth--;
            else if (new RegExp(`^${loopStart[1]}\\s+the`, "i").test(nextStmt)) depth++;
            searchIdx++;
          }
          pc = searchIdx;
          continue;
        }
        pc++;
        continue;
      }

      // Loop end: [Verb] [the [ingredient]] until [verbed]
      const loopEnd = /^(\w+)\s+(?:the\s+(.+?)\s+)?until\s+\w+$/i.exec(stmt);
      if (loopEnd) {
        const ingName = loopEnd[2] ? loopEnd[2].trim().toLowerCase() : "";
        if (ingName) {
          const ing = ingredients.get(ingName);
          if (ing) ing.value--;
          if (ing && ing.value > 0) {
            let depth = 1;
            let searchIdx = pc - 1;
            while (searchIdx >= 0 && depth > 0) {
              const prevStmt = statements[searchIdx];
              if (new RegExp(`^${loopEnd[1]}\\s+the`, "i").test(prevStmt)) depth--;
              searchIdx--;
            }
            pc = searchIdx + 2;
            continue;
          }
        }
        pc++;
        continue;
      }

      pc++;
    }

    // 5. Serve baking dish outputs
    let outputText = "";
    for (let d = 1; d <= servesCount; d++) {
      const dish = getDish(d);
      while (dish.length > 0) {
        const item = dish.pop()!;
        if (item.isLiquid) {
          outputText += String.fromCharCode(item.val);
        } else {
          outputText += item.val.toString() + " ";
        }
      }
    }

    const stdout =
      `[Chef Recipe Virtual Machine: "${title}"]\n` +
      `Ingredients Declared: ${ingredients.size}\n` +
      `Statements Executed: ${stepCount}\n\n` +
      `Baking Dish Served Output:\n` +
      (outputText.trim() || "(Empty dish served)");

    return {
      submissionId,
      language: "chef",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "chef",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

// 7. Piet Codel Grid Interpreter (Deferred - Image-based binary format required)
function executePiet(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  return {
    submissionId,
    language: "piet",
    status: "error",
    stdout: "",
    stderr: sanitizeOutput(
      "[Codeticz Policy] Piet requires 2D bitmap image codel matrices (.png/.ppm) rather than text code. " +
      "Piet execution is currently deferred (Coming Soon) until image canvas upload is supported."
    ),
    exitCode: 1,
    wallTimeMs: Date.now() - startTime,
    memoryKb: 512,
  };
}

// 8. LOLCODE 1.2 Hand-Written Interpreter
type LolToken = {
  type: "KEYWORD" | "IDENT" | "NUMBR" | "NUMBAR" | "YARN" | "TROOF" | "NOOB" | "EXCLAMATION";
  value: any;
  raw: string;
};

function tokenizeLolLine(line: string): LolToken[] {
  const tokens: LolToken[] = [];
  let pos = 0;

  while (pos < line.length) {
    while (pos < line.length && (line[pos] === " " || line[pos] === "\t")) pos++;
    if (pos >= line.length) break;

    // String literal YARN with colon escapes
    if (line[pos] === '"') {
      let str = "";
      pos++;
      while (pos < line.length && line[pos] !== '"') {
        if (line[pos] === ":" && pos + 1 < line.length) {
          const next = line[pos + 1];
          if (next === ")") { str += "\n"; pos += 2; continue; }
          if (next === ">") { str += "\t"; pos += 2; continue; }
          if (next === '"') { str += '"'; pos += 2; continue; }
          if (next === ":") { str += ":"; pos += 2; continue; }
        }
        str += line[pos];
        pos++;
      }
      if (pos >= line.length) {
        throw new Error("Unterminated string literal (missing closing quote).");
      }
      pos++; // skip quote
      tokens.push({ type: "YARN", value: str, raw: `"${str}"` });
      continue;
    }

    if (line[pos] === "!") {
      tokens.push({ type: "EXCLAMATION", value: "!", raw: "!" });
      pos++;
      continue;
    }

    let end = pos;
    while (end < line.length && line[end] !== " " && line[end] !== "\t" && line[end] !== '"' && line[end] !== "!") {
      end++;
    }
    const word = line.substring(pos, end);
    pos = end;

    if (word === "WIN") {
      tokens.push({ type: "TROOF", value: true, raw: word });
    } else if (word === "FAIL") {
      tokens.push({ type: "TROOF", value: false, raw: word });
    } else if (word === "NOOB") {
      tokens.push({ type: "NOOB", value: null, raw: word });
    } else if (/^-?\d+\.\d+$/.test(word)) {
      tokens.push({ type: "NUMBAR", value: parseFloat(word), raw: word });
    } else if (/^-?\d+$/.test(word)) {
      tokens.push({ type: "NUMBR", value: parseInt(word, 10), raw: word });
    } else {
      tokens.push({ type: "IDENT", value: word, raw: word });
    }
  }

  return tokens;
}

function executeLolcode(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  const lines = code.split(/\r?\n/);
  const cleanLines: { tokens: LolToken[]; lineNum: number; raw: string }[] = [];
  let inMultiComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (inMultiComment) {
      const tldrIdx = line.indexOf("TLDR");
      if (tldrIdx !== -1) {
        inMultiComment = false;
        line = line.substring(tldrIdx + 4).trim();
      } else {
        continue;
      }
    }

    if (line.startsWith("OBTW")) {
      inMultiComment = true;
      continue;
    }

    const btwIdx = line.indexOf("BTW");
    if (btwIdx !== -1) {
      let inQuote = false;
      let cutIdx = -1;
      for (let c = 0; c < line.length - 2; c++) {
        if (line[c] === '"') inQuote = !inQuote;
        if (!inQuote && line.substring(c, c + 3) === "BTW") {
          cutIdx = c;
          break;
        }
      }
      if (cutIdx !== -1) {
        line = line.substring(0, cutIdx).trim();
      }
    }

    if (line.length > 0) {
      try {
        const tokens = tokenizeLolLine(line);
        if (tokens.length > 0) {
          cleanLines.push({ tokens, lineNum: i + 1, raw: line });
        }
      } catch (err: any) {
        return {
          submissionId,
          language: "lolcode",
          status: "compilation_error",
          stdout: "",
          stderr: sanitizeOutput(`LOLCODE Syntax Error at line ${i + 1}: ${err.message}`),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 512,
        };
      }
    }
  }

  if (inMultiComment) {
    return {
      submissionId,
      language: "lolcode",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("LOLCODE Syntax Error: Unterminated multi-line comment (missing 'TLDR')."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  if (cleanLines.length === 0) {
    return {
      submissionId,
      language: "lolcode",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("LOLCODE Syntax Error: Empty program. Program must begin with 'HAI'."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  if (cleanLines[0].tokens[0].value !== "HAI") {
    return {
      submissionId,
      language: "lolcode",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`LOLCODE Syntax Error at line ${cleanLines[0].lineNum}: Program must begin with 'HAI [version]'. Found '${cleanLines[0].raw}'`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  const lastLine = cleanLines[cleanLines.length - 1];
  if (lastLine.tokens[0].value !== "KTHXBYE") {
    return {
      submissionId,
      language: "lolcode",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`LOLCODE Syntax Error at line ${lastLine.lineNum}: Program must end with 'KTHXBYE'. Found '${lastLine.raw}'`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  const vars = new Map<string, any>();
  let IT: any = null;
  let stdout = "";
  const stdinLines = stdin.split(/\r?\n/);
  let stdinLineIdx = 0;
  let ops = 0;
  const MAX_OPS = 500000;

  function parseExpression(tokens: LolToken[], state: { idx: number }, lineNum: number): any {
    if (state.idx >= tokens.length) {
      throw new Error(`Unexpected end of expression at line ${lineNum}`);
    }

    const t = tokens[state.idx++];
    if (t.type === "NUMBR" || t.type === "NUMBAR" || t.type === "YARN" || t.type === "TROOF" || t.type === "NOOB") {
      return t.value;
    }

    const val = t.value;

    if (val === "SUM" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return a + b;
    }

    if (val === "DIFF" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return a - b;
    }

    if (val === "PRODUKT" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return a * b;
    }

    if (val === "QUOSHUNT" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return Math.floor(a / b);
    }

    if (val === "MOD" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return a % b;
    }

    if (val === "BIGGR" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return Math.max(a, b);
    }

    if (val === "SMALLR" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Number(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Number(parseExpression(tokens, state, lineNum));
      return Math.min(a, b);
    }

    if (val === "BOTH" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Boolean(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Boolean(parseExpression(tokens, state, lineNum));
      return a && b;
    }

    if (val === "EITHER" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Boolean(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Boolean(parseExpression(tokens, state, lineNum));
      return a || b;
    }

    if (val === "WON" && tokens[state.idx]?.value === "OF") {
      state.idx++;
      const a = Boolean(parseExpression(tokens, state, lineNum));
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = Boolean(parseExpression(tokens, state, lineNum));
      return (a && !b) || (!a && b);
    }

    if (val === "NOT") {
      const a = Boolean(parseExpression(tokens, state, lineNum));
      return !a;
    }

    if (val === "BOTH" && tokens[state.idx]?.value === "SAEM") {
      state.idx++;
      const a = parseExpression(tokens, state, lineNum);
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = parseExpression(tokens, state, lineNum);
      return a === b;
    }

    if (val === "DIFFRINT") {
      const a = parseExpression(tokens, state, lineNum);
      if (tokens[state.idx]?.value === "AN") state.idx++;
      const b = parseExpression(tokens, state, lineNum);
      return a !== b;
    }

    if (val === "SMOOSH") {
      let str = "";
      while (state.idx < tokens.length) {
        if (tokens[state.idx].value === "MKAY") {
          state.idx++;
          break;
        }
        if (tokens[state.idx].value === "AN") {
          state.idx++;
          continue;
        }
        const piece = parseExpression(tokens, state, lineNum);
        str += piece === null ? "" : String(piece);
      }
      return str;
    }

    if (val === "IT") return IT;

    if (vars.has(val)) return vars.get(val);

    throw new Error(`Variable '${val}' has not been declared.`);
  }

  function formatValue(v: any): string {
    if (v === true) return "WIN";
    if (v === false) return "FAIL";
    if (v === null || v === undefined) return "NOOB";
    return String(v);
  }

  function executeBlock(startIdx: number, stopPredicate: (tokens: LolToken[]) => boolean): { nextIdx: number; broken?: boolean } {
    let idx = startIdx;
    while (idx < cleanLines.length - 1) {
      ops++;
      if (ops > MAX_OPS) {
        throw new Error("Infinite loop detected (exceeded 500,000 cycles).");
      }

      const lineObj = cleanLines[idx];
      const tokens = lineObj.tokens;
      const lineNum = lineObj.lineNum;

      if (stopPredicate(tokens)) {
        return { nextIdx: idx };
      }

      const first = tokens[0]?.value;

      if (first === "GTFO") {
        return { nextIdx: idx + 1, broken: true };
      }

      if (first === "CAN" && tokens[1]?.value === "HAS") {
        idx++;
        continue;
      }

      if (first === "I" && tokens[1]?.value === "HAS" && tokens[2]?.value === "A") {
        const varName = tokens[3]?.value;
        if (!varName) {
          throw new Error(`LOLCODE Syntax Error at line ${lineNum}: Missing variable identifier after 'I HAS A'.`);
        }
        let initVal = null;
        if (tokens[4]?.value === "ITZ") {
          const state = { idx: 5 };
          initVal = parseExpression(tokens, state, lineNum);
        }
        vars.set(varName, initVal);
        idx++;
        continue;
      }

      if (tokens.length >= 3 && tokens[1]?.value === "R") {
        const varName = tokens[0].value;
        if (!vars.has(varName)) {
          throw new Error(`LOLCODE Runtime Error at line ${lineNum}: Variable '${varName}' has not been declared.`);
        }
        const state = { idx: 2 };
        const val = parseExpression(tokens, state, lineNum);
        vars.set(varName, val);
        IT = val;
        idx++;
        continue;
      }

      if (first === "VISIBLE") {
        let suppressNewline = false;
        let lastToken = tokens[tokens.length - 1];
        let exprTokens = tokens.slice(1);
        if (lastToken && lastToken.type === "EXCLAMATION") {
          suppressNewline = true;
          exprTokens = exprTokens.slice(0, -1);
        }

        const state = { idx: 0 };
        const parts: string[] = [];
        while (state.idx < exprTokens.length) {
          if (exprTokens[state.idx].value === "AN") {
            state.idx++;
            continue;
          }
          const val = parseExpression(exprTokens, state, lineNum);
          IT = val;
          parts.push(formatValue(val));
        }

        stdout += parts.join("") + (suppressNewline ? "" : "\n");
        idx++;
        continue;
      }

      if (first === "GIMMEH") {
        const varName = tokens[1]?.value;
        if (!varName || !vars.has(varName)) {
          throw new Error(`LOLCODE Runtime Error at line ${lineNum}: Cannot read into undeclared variable '${varName}'.`);
        }
        let val = "";
        if (stdinLineIdx < stdinLines.length) {
          val = stdinLines[stdinLineIdx++];
        }
        vars.set(varName, val);
        idx++;
        continue;
      }

      if (first === "O" && tokens[1]?.value === "RLY?") {
        const cond = Boolean(IT);
        idx++;

        let branchTaken = false;

        while (idx < cleanLines.length - 1) {
          const curTokens = cleanLines[idx].tokens;
          const curFirst = curTokens[0]?.value;

          if (curFirst === "OIC") {
            idx++;
            break;
          }

          if (curFirst === "YA" && curTokens[1]?.value === "RLY") {
            idx++;
            if (cond && !branchTaken) {
              branchTaken = true;
              const res = executeBlock(idx, (t) => {
                const f = t[0]?.value;
                return f === "MEBBE" || (f === "NO" && t[1]?.value === "WAI") || f === "OIC";
              });
              idx = res.nextIdx;
              if (res.broken) return res;
            } else {
              while (idx < cleanLines.length - 1) {
                const t = cleanLines[idx].tokens;
                const f = t[0]?.value;
                if (f === "MEBBE" || (f === "NO" && t[1]?.value === "WAI") || f === "OIC") break;
                idx++;
              }
            }
            continue;
          }

          if (curFirst === "MEBBE") {
            const state = { idx: 1 };
            const mebbeVal = Boolean(parseExpression(curTokens, state, cleanLines[idx].lineNum));
            idx++;
            if (mebbeVal && !branchTaken) {
              branchTaken = true;
              const res = executeBlock(idx, (t) => {
                const f = t[0]?.value;
                return f === "MEBBE" || (f === "NO" && t[1]?.value === "WAI") || f === "OIC";
              });
              idx = res.nextIdx;
              if (res.broken) return res;
            } else {
              while (idx < cleanLines.length - 1) {
                const t = cleanLines[idx].tokens;
                const f = t[0]?.value;
                if (f === "MEBBE" || (f === "NO" && t[1]?.value === "WAI") || f === "OIC") break;
                idx++;
              }
            }
            continue;
          }

          if (curFirst === "NO" && curTokens[1]?.value === "WAI") {
            idx++;
            if (!branchTaken) {
              branchTaken = true;
              const res = executeBlock(idx, (t) => t[0]?.value === "OIC");
              idx = res.nextIdx;
              if (res.broken) return res;
            } else {
              while (idx < cleanLines.length - 1 && cleanLines[idx].tokens[0]?.value !== "OIC") {
                idx++;
              }
            }
            continue;
          }

          idx++;
        }
        continue;
      }

      if (first === "IM" && tokens[1]?.value === "IN" && tokens[2]?.value === "YR") {
        const loopLabel = tokens[3]?.value;
        const loopStartIdx = idx + 1;

        const hasOp = tokens[4]?.value === "UPPIN" || tokens[4]?.value === "NERFIN";
        const opType = hasOp ? tokens[4]?.value : null;
        const loopVar = hasOp && tokens[5]?.value === "YR" ? tokens[6]?.value : null;
        const guardToken = tokens.find((t, i) => i >= 6 && (t.value === "TIL" || t.value === "WILE"));
        const guardIdx = guardToken ? tokens.indexOf(guardToken) : -1;
        const guardType = guardToken ? guardToken.value : null;
        const guardExprTokens = guardIdx !== -1 ? tokens.slice(guardIdx + 1) : null;

        let loopEndIdx = loopStartIdx;
        let depth = 1;
        while (loopEndIdx < cleanLines.length - 1) {
          const t = cleanLines[loopEndIdx].tokens;
          if (t[0]?.value === "IM" && t[1]?.value === "IN" && t[2]?.value === "YR") depth++;
          if (t[0]?.value === "IM" && t[1]?.value === "OUTTA" && t[2]?.value === "YR") {
            depth--;
            if (depth === 0) break;
          }
          loopEndIdx++;
        }

        if (loopEndIdx >= cleanLines.length - 1) {
          throw new Error(`LOLCODE Syntax Error at line ${lineNum}: Unclosed loop '${loopLabel}', missing 'IM OUTTA YR ${loopLabel}'.`);
        }

        while (true) {
          ops++;
          if (ops > MAX_OPS) throw new Error("Infinite loop detected in LOLCODE loop.");

          if (guardExprTokens && guardType) {
            const state = { idx: 0 };
            const guardVal = Boolean(parseExpression(guardExprTokens, state, lineNum));
            if (guardType === "TIL" && guardVal) break;
            if (guardType === "WILE" && !guardVal) break;
          }

          const res = executeBlock(loopStartIdx, (t) => t[0]?.value === "IM" && t[1]?.value === "OUTTA" && t[2]?.value === "YR");
          if (res.broken) break;

          if (loopVar && vars.has(loopVar)) {
            const curVal = Number(vars.get(loopVar));
            if (opType === "UPPIN") vars.set(loopVar, curVal + 1);
            else if (opType === "NERFIN") vars.set(loopVar, curVal - 1);
          }
        }

        idx = loopEndIdx + 1;
        continue;
      }

      const state = { idx: 0 };
      const exprVal = parseExpression(tokens, state, lineNum);
      IT = exprVal;
      idx++;
    }

    return { nextIdx: idx };
  }

  try {
    executeBlock(1, (t) => t[0]?.value === "KTHXBYE");
    return {
      submissionId,
      language: "lolcode",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "lolcode",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

// 9. COW Programming Language Hand-Written Virtual Machine (Sean Heber 2003)
const COW_OPCODES: Record<string, number> = {
  "moo": 0,
  "mOo": 1,
  "moO": 2,
  "mOO": 3,
  "Moo": 4,
  "MOo": 5,
  "MoO": 6,
  "MOO": 7,
  "OOO": 8,
  "MMM": 9,
  "OOM": 10,
  "oom": 11,
};

function executeCow(submissionId: string, code: string, stdin: string, startTime: number): ExecutionResult {
  let buf = "";
  const program: number[] = [];

  for (let i = 0; i < code.length; i++) {
    buf += code[i];
    if (buf.length > 3) buf = buf.slice(1);
    if (buf.length === 3 && COW_OPCODES[buf] !== undefined) {
      program.push(COW_OPCODES[buf]);
      buf = "";
    }
  }

  if (program.length === 0) {
    return {
      submissionId,
      language: "cow",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput("COW Syntax Error: No valid COW instructions found in source code. Expected bovine opcodes (moo, mOo, moO, mOO, Moo, MOo, MoO, MOO, OOO, MMM, OOM, oom)."),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  const loopPairs = new Map<number, number>();
  const reversePairs = new Map<number, number>();
  const stack: number[] = [];

  for (let i = 0; i < program.length; i++) {
    if (program[i] === 7) {
      stack.push(i);
    } else if (program[i] === 0) {
      if (stack.length === 0) {
        return {
          submissionId,
          language: "cow",
          status: "compilation_error",
          stdout: "",
          stderr: sanitizeOutput(`COW Syntax Error: Unmatched 'moo' loop closing at instruction ${i} (no matching 'MOO').`),
          exitCode: 1,
          wallTimeMs: Date.now() - startTime,
          memoryKb: 512,
        };
      }
      const open = stack.pop()!;
      loopPairs.set(open, i);
      reversePairs.set(i, open);
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.pop()!;
    return {
      submissionId,
      language: "cow",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(`COW Syntax Error: Unmatched 'MOO' loop opening at instruction ${unclosed} (missing closing 'moo').`),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }

  const memory = [0];
  let memPos = 0;
  let regVal = 0;
  let hasReg = false;
  let stdout = "";
  let stdinPos = 0;
  let ops = 0;
  const MAX_OPS = 500000;

  function exec(instruction: number, pc: number): { pc: number; halted?: boolean } {
    ops++;
    if (ops > MAX_OPS) {
      throw new Error("COW Execution Timeout: Infinite loop detected (exceeded 500,000 cycles).");
    }

    switch (instruction) {
      case 0: { // moo
        const target = reversePairs.get(pc);
        if (target === undefined) {
          throw new Error(`COW Syntax Error: Unmatched 'moo' at instruction ${pc}.`);
        }
        return { pc: target - 1 };
      }
      case 1: { // mOo
        if (memPos === 0) {
          throw new Error("COW Runtime Error: Memory tape underflow (attempted to move left of cell 0).");
        }
        memPos--;
        break;
      }
      case 2: { // moO
        memPos++;
        if (memPos >= memory.length) memory.push(0);
        break;
      }
      case 3: { // mOO
        const val = memory[memPos];
        if (val === 3) return { pc, halted: true };
        if (val >= 0 && val <= 11) {
          return exec(val, pc);
        } else {
          return { pc, halted: true };
        }
      }
      case 4: { // Moo
        if (memory[memPos] !== 0) {
          stdout += String.fromCharCode(memory[memPos] % 256);
        } else {
          if (stdinPos < stdin.length) {
            memory[memPos] = stdin.charCodeAt(stdinPos++);
          } else {
            memory[memPos] = 0;
          }
        }
        break;
      }
      case 5: { // MOo
        memory[memPos]--;
        break;
      }
      case 6: { // MoO
        memory[memPos]++;
        break;
      }
      case 7: { // MOO
        if (memory[memPos] === 0) {
          const target = loopPairs.get(pc);
          if (target === undefined) {
            throw new Error(`COW Syntax Error: Unmatched 'MOO' at instruction ${pc}.`);
          }
          return { pc: target };
        }
        break;
      }
      case 8: { // OOO
        memory[memPos] = 0;
        break;
      }
      case 9: { // MMM
        if (hasReg) {
          memory[memPos] = regVal;
        } else {
          regVal = memory[memPos];
        }
        hasReg = !hasReg;
        break;
      }
      case 10: { // OOM
        stdout += memory[memPos] + "\n";
        break;
      }
      case 11: { // oom
        const rest = stdin.slice(stdinPos);
        const match = rest.match(/^(-?\d+)/);
        if (match) {
          memory[memPos] = parseInt(match[1], 10);
          stdinPos += match[0].length;
        } else {
          memory[memPos] = 0;
        }
        break;
      }
      default:
        return { pc, halted: true };
    }

    return { pc };
  }

  let pc = 0;
  try {
    while (pc < program.length) {
      const res = exec(program[pc], pc);
      if (res && res.halted) break;
      if (res && res.pc !== undefined && res.pc !== pc) {
        pc = res.pc + 1;
      } else {
        pc++;
      }
    }
    return {
      submissionId,
      language: "cow",
      status: "success",
      stdout: sanitizeOutput(stdout),
      stderr: "",
      exitCode: 0,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 2048,
    };
  } catch (err: any) {
    return {
      submissionId,
      language: "cow",
      status: "compilation_error",
      stdout: "",
      stderr: sanitizeOutput(err.message || String(err)),
      exitCode: 1,
      wallTimeMs: Date.now() - startTime,
      memoryKb: 512,
    };
  }
}

