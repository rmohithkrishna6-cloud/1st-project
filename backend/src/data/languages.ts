export interface LanguageConfig {
  id: string;
  name: string;
  category: string;
  version: string;
  monacoLanguage: string;
  icon: string;
  defaultCode: string;
  fileExtension: string;
  status?: "active" | "coming_soon";
}

export const VERIFIED_ACTIVE_LANGUAGE_IDS = new Set<string>([
  // 51 Isolated Piston Container Verified Languages (Exit 0)
  "python", "javascript", "typescript", "cpp", "c", "java", "go", "rust",
  "php", "ruby", "bash", "perl", "lua", "swift", "csharp", "r", "dart",
  "haskell", "elixir", "groovy", "julia", "nim", "crystal", "d", "fortran",
  "cobol", "prolog", "lisp", "racket", "ocaml", "assembly", "nasm64",
  "pascal", "freebasic", "forth", "erlang", "fsharp", "clojure",
  "visualbasic", "awk", "qbasic", "smalltalk", "pony", "powershell", "vlang", "rockstar",
  "octave", "emojicode", "kotlin", "scala", "zig",

  // 21 In-App Specialized & Educational Engines (Tested & Verified Real Parsers / Simulators)
  "sql", "mysql", "postgresql", "mongodb", "graphql", "json", "xml",
  "yaml", "markdown", "regex", "csv", "brainfuck", "befunge",
  "logo", "karel", "html", "css", "blockly", "scratch", "snap", "alice",

  // 4 CSS Preprocessor Compilers (sass, less, stylus, postcss npm packages)
  "scss", "less", "stylus", "postcss",

  // 3 Data & Configuration Parsers (toml, ini, protobufjs npm packages)
  "toml", "ini", "proto",

  // 4 DevOps & IaC Validators (js-yaml, dockerfile-ast, @cdktf/hcl2json, OPA Rego AST)
  "k8s", "dockerfile", "terraform", "rego",

  // 2 Template Compilers (handlebars, ejs)
  "handlebars", "ejs",

  // 5 Utility & Scripting Engines (diff, jq-web, native regex sed, cron-parser, coffeescript)
  "diff", "jq", "sed", "cron", "coffeescript",

  // 2 Web & Template Engines (pug, svg)
  "pug", "svg",

  // 1 Smart Contract Compiler (solidity via solc)
  "solidity",

  // 1 Live Key-Value Cache / Store (redis via live container)
  "redis",

  // 5 Esoteric Hand-Written Interpreters (whitespace, chef, lolcode, cow, malbolge)
  "whitespace", "chef", "lolcode", "cow", "malbolge",

  // 5 Functional & Scripting In-App Engines (scheme via biwascheme, tcl via tcl-js, purescript via purs, reason via bsc, gleam via wasm)
  "scheme", "tcl", "purescript", "reason", "gleam",

  // 5 Simulated Mobile Viewport & AST Syntax Validation Engines (TypeScript JSX AST, Fast-XML-Parser, Dart AST)
  "reactnative", "ionic", "cordova", "flutter", "nativescript",

  // 1 In-Memory Graph Query Engine (cypher via cypherdotjs)
  "cypher"
]);

const RAW_LANGUAGES: LanguageConfig[] = [
  {
    id: "python",
    name: "Python",
    category: "Popular",
    version: "3.11",
    monacoLanguage: "python",
    icon: "fa-brands fa-python",
    fileExtension: "py",
    defaultCode: `# Nexora Python Sandbox
import sys

def main():
    print("Welcome to Nexora Python Compiler!")
    
    # Read stdin if provided
    input_data = sys.stdin.read().strip()
    if input_data:
        print(f"Received input: {input_data}")
    
    # Symmetric Centered Star Pyramid
    rows = 5
    print(f"\\n--- Symmetric Star Pyramid ({rows} rows) ---")
    for i in range(1, rows + 1):
        spaces = " " * (rows - i)
        stars = "* " * i
        print(f"{spaces}{stars}")

    # Fibonacci calculation
    n = 10
    a, b = 0, 1
    fib = []
    for _ in range(n):
        fib.append(a)
        a, b = b, a + b
    
    print(f"\\nFirst {n} Fibonacci numbers: {fib}")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Popular",
    version: "20.11.1",
    monacoLanguage: "javascript",
    icon: "fa-brands fa-js",
    fileExtension: "js",
    defaultCode: `// Nexora JavaScript Sandbox
const fs = require('fs');

function main() {
    console.log("🚀 Welcome to Nexora JavaScript Compiler!");
    
    // Read input from stdin
    try {
        const input = fs.readFileSync(0, 'utf-8').trim();
        if (input) {
            console.log("Input received:", input);
        }
    } catch (e) {
        // No stdin
    }

    const numbers = [5, 2, 9, 1, 7, 6];
    const sorted = [...numbers].sort((a, b) => a - b);
    
    console.log("Original Array:", numbers);
    console.log("Sorted Array:", sorted);
}

main();
`
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Popular",
    version: "5.0.3",
    monacoLanguage: "typescript",
    icon: "fa-brands fa-js",
    fileExtension: "ts",
    defaultCode: `// Nexora TypeScript Sandbox
interface User {
  id: number;
  name: string;
  role: 'Developer' | 'Admin';
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are logged in as \${user.role}.\`;
}

const developer: User = {
  id: 101,
  name: "Nexora Dev",
  role: "Developer"
};

console.log(greetUser(developer));
`
  },
  {
    id: "cpp",
    name: "C++",
    category: "Popular",
    version: "GCC 13 (C++20)",
    monacoLanguage: "cpp",
    icon: "fa-solid fa-copyright",
    fileExtension: "cpp",
    defaultCode: `// Nexora C++ Sandbox
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "⚡ Hello from Nexora C++ Execution Engine!" << std::endl;
    
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Sum of elements: " << sum << std::endl;
    return 0;
}
`
  },
  {
    id: "c",
    name: "C",
    category: "Popular",
    version: "GCC 13 (C17)",
    monacoLanguage: "c",
    icon: "fa-solid fa-copyright",
    fileExtension: "c",
    defaultCode: `/* Nexora C Sandbox */
#include <stdio.h>

int main() {
    printf("Hello, Nexora C Compiler!\\n");
    int a = 15;
    int b = 27;
    printf("Result of %d + %d = %d\\n", a, b, a + b);
    return 0;
}
`
  },
  {
    id: "java",
    name: "Java",
    category: "Popular",
    version: "15.0.2",
    monacoLanguage: "java",
    icon: "fa-brands fa-java",
    fileExtension: "java",
    defaultCode: `// Nexora Java Sandbox
public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Welcome to Nexora Java Compiler!");
        
        int[] arr = {4, 1, 8, 3, 9, 2};
        java.util.Arrays.sort(arr);
        
        System.out.print("Sorted Array: ");
        for (int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println();
    }
}
`
  },
  {
    id: "go",
    name: "Go",
    category: "Popular",
    version: "1.16.2",
    monacoLanguage: "go",
    icon: "fa-brands fa-golang",
    fileExtension: "go",
    defaultCode: `// Nexora Go Sandbox
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println("💙 Hello from Nexora Go Runner!")
	msg := "nexora high performance compiler"
	fmt.Println("Uppercase:", strings.ToUpper(msg))
}
`
  },
  {
    id: "rust",
    name: "Rust",
    category: "Popular",
    version: "1.68.2",
    monacoLanguage: "rust",
    icon: "fa-brands fa-rust",
    fileExtension: "rs",
    defaultCode: `// Nexora Rust Sandbox
fn main() {
    println!("🦀 Hello, Rustaceans on Nexora!");
    let numbers = vec![1, 2, 3, 4, 5];
    let squared: Vec<i32> = numbers.iter().map(|x| x * x).collect();
    println!("Squared numbers: {:?}", squared);
}
`
  },
  {
    id: "php",
    name: "PHP",
    category: "Popular",
    version: "8.2.3",
    monacoLanguage: "php",
    icon: "fa-brands fa-php",
    fileExtension: "php",
    defaultCode: `<?php
// Nexora PHP Sandbox
echo "🐘 Hello from Nexora PHP Engine!\n";
$frameworks = ["Laravel", "Symfony", "ReactPHP"];
echo "Popular PHP Frameworks: " . implode(", ", $frameworks) . "\n";
?>
`
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "Popular",
    version: "3.0.1",
    monacoLanguage: "ruby",
    icon: "fa-solid fa-gem",
    fileExtension: "rb",
    defaultCode: `# Nexora Ruby Sandbox
puts "💎 Welcome to Nexora Ruby!"

words = ["nexora", "compiler", "fast", "secure"]
capitalized = words.map(&:capitalize)

puts "Capitalized: #{capitalized.join(', ')}"
`
  },
  {
    id: "sql",
    name: "SQL",
    category: "Databases",
    version: "SQLite 3 Engine",
    monacoLanguage: "sql",
    icon: "fa-solid fa-database",
    fileExtension: "sql",
    defaultCode: `-- Nexora SQL Sandbox (In-Memory SQLite Engine)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, role) VALUES 
('Mohith Krishna R', 'System Architect'),
('Alice', 'Frontend Lead'),
('Bob', 'Backend Engineer');

SELECT * FROM users WHERE role LIKE '%Engineer%' OR role LIKE '%Architect%';
`
  },
  {
    id: "html",
    name: "HTML / CSS / JS",
    category: "Web",
    version: "Browser Sandbox",
    monacoLanguage: "html",
    icon: "fa-brands fa-html5",
    fileExtension: "html",
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0B1A12;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #0E2117;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    h1 { color: #B4FF00; }
    button {
      background: #B4FF00;
      color: #0B1A12;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Nexora Web Preview</h1>
    <p>Live render HTML, CSS, and JS directly in your browser.</p>
    <button onclick="alert('Hello from Nexora Sandbox!')">Click Me</button>
  </div>
</body>
</html>
`
  },
  {
    id: "bash",
    name: "Bash",
    category: "Popular",
    version: "5.2.0",
    monacoLanguage: "shell",
    icon: "fa-solid fa-terminal",
    fileExtension: "sh",
    defaultCode: `#!/bin/bash
# Nexora Shell Script Sandbox
echo "🐚 Nexora Shell Environment"
echo "Current Date: $(date)"
echo "Kernel: $(uname -s -m 2>/dev/null || echo 'Isolated Container')"
`
  },
  {
    id: "perl",
    name: "Perl",
    category: "Scripting",
    version: "5.36.0",
    monacoLanguage: "perl",
    icon: "fa-solid fa-code",
    fileExtension: "pl",
    defaultCode: `#!/usr/bin/perl
# Nexora Perl Sandbox
use strict;
use warnings;

print "🐪 Hello from Nexora Perl Engine!\\n";
my @languages = ("Python", "Perl", "Ruby", "C++");
print "Languages: ", join(", ", @languages), "\\n";
`
  },
  {
    id: "lua",
    name: "Lua",
    category: "Scripting",
    version: "5.4.4",
    monacoLanguage: "lua",
    icon: "fa-solid fa-moon",
    fileExtension: "lua",
    defaultCode: `-- Nexora Lua Sandbox
print("🌙 Welcome to Nexora Lua Environment")

function factorial(n)
    if n == 0 then return 1 end
    return n * factorial(n - 1)
end

print("Factorial of 6 is:", factorial(6))
`
  },
  {
    id: "swift",
    name: "Swift",
    category: "Popular",
    version: "5.3.3",
    monacoLanguage: "swift",
    icon: "fa-brands fa-swift",
    fileExtension: "swift",
    defaultCode: `// Nexora Swift Sandbox
import Foundation

func greet(name: String) -> String {
    return "🚀 Hello, \\(name)! Welcome to Nexora Swift Execution Engine."
}

print(greet(name: "Developer"))

let numbers = [10, 20, 30, 40, 50]
let total = numbers.reduce(0, +)
print("Sum of numbers: \\(total)")
`
  },
  {
    id: "csharp",
    name: "C#",
    category: "Popular",
    version: "Mono 6.12.0",
    monacoLanguage: "csharp",
    icon: "fa-solid fa-code",
    fileExtension: "cs",
    defaultCode: `// Nexora C# Sandbox
using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        Console.WriteLine("Welcome to Nexora C# Sandbox!");
        
        var fruits = new List<string> { "Apple", "Banana", "Cherry", "Dragonfruit" };
        Console.WriteLine("Fruits count: " + fruits.Count);
        foreach (var fruit in fruits) {
            Console.WriteLine("- " + fruit);
        }
    }
}
`
  },
  {
    id: "r",
    name: "R",
    category: "Scripting",
    version: "4.1.1",
    monacoLanguage: "r",
    icon: "fa-solid fa-chart-line",
    fileExtension: "r",
    defaultCode: `# Nexora R Sandbox
cat("📊 Hello from Nexora R Statistical Sandbox!\\n")

data <- c(12, 25, 38, 44, 59)
mean_val <- mean(data)
cat("Data Vector:", data, "\\n")
cat("Mean Value:", mean_val, "\\n")
`
  },
  {
    id: "dart",
    name: "Dart",
    category: "Popular",
    version: "3.0.1",
    monacoLanguage: "dart",
    icon: "fa-solid fa-bullseye",
    fileExtension: "dart",
    defaultCode: `// Nexora Dart Sandbox
void main() {
  print('🎯 Hello from Nexora Dart Sandbox!');
  
  final techStack = ['Flutter', 'Dart', 'Web', 'Server'];
  techStack.forEach((tech) => print('⚡ \$tech'));
}
`
  },
  {
    id: "haskell",
    name: "Haskell",
    category: "Popular",
    version: "9.0.1",
    monacoLanguage: "haskell",
    icon: "fa-solid fa-code",
    fileExtension: "hs",
    defaultCode: `-- Nexora Haskell Sandbox
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)

main :: IO ()
main = do
    putStrLn "Hello from Nexora Functional Haskell Engine!"
    putStrLn $ "Factorial of 10 is: " ++ show (factorial 10)
`
  },
  {
    id: "elixir",
    name: "Elixir",
    category: "Scripting",
    version: "1.11.3",
    monacoLanguage: "elixir",
    icon: "fa-solid fa-code",
    fileExtension: "exs",
    defaultCode: `# Nexora Elixir Sandbox
IO.puts "💧 Hello from Nexora Concurrent Elixir Engine!"

list = [1, 2, 3, 4, 5]
sum = Enum.reduce(list, 0, fn x, acc -> x + acc end)
IO.puts "Sum of #{inspect(list)} is #{sum}"
`
  },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "JVM",
    version: "1.8.20",
    monacoLanguage: "kotlin",
    icon: "fa-solid fa-code",
    fileExtension: "kt",
    defaultCode: `// Nexora Kotlin Sandbox
fun main() {
    println("🚀 Welcome to Nexora Kotlin Compiler!")
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    println("Original: $numbers")
    println("Doubled:  $doubled")
}
`
  },
  {
    id: "scala",
    name: "Scala",
    category: "JVM",
    version: "3.2.2",
    monacoLanguage: "scala",
    icon: "fa-solid fa-code",
    fileExtension: "scala",
    defaultCode: `// Nexora Scala 3 Sandbox
@main def main(): Unit = {
    println("🚀 Welcome to Nexora Scala Compiler!")
    val list = List(1, 2, 3, 4, 5)
    val squared = list.map(x => x * x)
    println(s"Original: $list")
    println(s"Squared:  $squared")
}
`
  },
  {
    id: "groovy",
    name: "Groovy",
    category: "Scripting",
    version: "3.0.7",
    monacoLanguage: "groovy",
    icon: "fa-solid fa-code",
    fileExtension: "groovy",
    defaultCode: `// Nexora Groovy Sandbox
println "Hello from Nexora Groovy Sandbox!"
`
  },
  {
    id: "julia",
    name: "Julia",
    category: "Scripting",
    version: "1.8.5",
    monacoLanguage: "julia",
    icon: "fa-solid fa-square-root-variable",
    fileExtension: "jl",
    defaultCode: `# Nexora Julia Sandbox
println("Hello from Nexora Julia Sandbox!")
`
  },
  {
    id: "octave",
    name: "GNU Octave",
    category: "Scripting",
    version: "8.1.0",
    monacoLanguage: "matlab",
    icon: "fa-solid fa-square-root-variable",
    fileExtension: "m",
    defaultCode: `% Nexora GNU Octave Sandbox
disp("Hello from GNU Octave on Nexora!");
a = [1, 2; 3, 4];
disp("Matrix determinant:");
disp(det(a));
`
  },
  {
    id: "nim",
    name: "Nim",
    category: "Popular",
    version: "1.6.2",
    monacoLanguage: "nim",
    icon: "fa-solid fa-code",
    fileExtension: "nim",
    defaultCode: `# Nexora Nim Sandbox
echo "👑 Hello from Nexora Nim Execution Engine!"

let numbers = @[10, 20, 30, 40, 50]
echo "Numbers: ", numbers
`
  },
  {
    id: "crystal",
    name: "Crystal",
    category: "Scripting",
    version: "0.36.1",
    monacoLanguage: "crystal",
    icon: "fa-solid fa-gem",
    fileExtension: "cr",
    defaultCode: `# Nexora Crystal Sandbox
puts "🔮 Hello from Nexora Crystal Sandbox!"

words = ["crystal", "fast", "compiled"]
capitalized = words.map(&.upcase)
puts "Capitalized: #{capitalized.join(", ")}"
`
  },
  {
    id: "zig",
    name: "Zig",
    category: "Popular",
    version: "0.10.1",
    monacoLanguage: "zig",
    icon: "fa-solid fa-bolt",
    fileExtension: "zig",
    defaultCode: `// Nexora Zig Sandbox
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("⚡ Hello from Nexora Zig Execution Engine!\\n", .{});
}
`
  },
  {
    id: "d",
    name: "D",
    category: "Popular",
    version: "10.2.0",
    monacoLanguage: "d",
    icon: "fa-solid fa-code",
    fileExtension: "d",
    defaultCode: `// Nexora D Sandbox
import std.stdio;

void main() {
    writeln("🎯 Hello from Nexora D Language Sandbox!");
    int[] numbers = [10, 20, 30, 40, 50];
    writeln("Numbers: ", numbers);
}
`
  },
  {
    id: "fortran",
    name: "Fortran",
    category: "Scripting",
    version: "10.2.0",
    monacoLanguage: "fortran",
    icon: "fa-solid fa-code",
    fileExtension: "f90",
    defaultCode: `! Nexora Fortran Sandbox
program main
    print *, "Hello from Nexora Fortran Engine!"
end program main
`
  },
  {
    id: "cobol",
    name: "COBOL",
    category: "Popular",
    version: "3.1.2",
    monacoLanguage: "cobol",
    icon: "fa-solid fa-building",
    fileExtension: "cob",
    defaultCode: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY 'Hello from Nexora COBOL Engine!'.
           STOP RUN.
`
  },
  {
    id: "ada",
    name: "Ada",
    category: "Popular",
    version: "13.2",
    monacoLanguage: "ada",
    icon: "fa-solid fa-shield-halved",
    fileExtension: "adb",
    defaultCode: `-- Nexora Ada Sandbox (Pending Cloud Deployment)
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
    Put_Line ("Hello from Nexora Ada Sandbox!");
end Hello;
`
  },
  {
    id: "prolog",
    name: "Prolog",
    category: "Scripting",
    version: "8.2.4",
    monacoLanguage: "prolog",
    icon: "fa-solid fa-brain",
    fileExtension: "plg",
    defaultCode: `% Nexora Prolog Sandbox
:- initialization(main).
main :-
    write('Hello from Nexora Prolog Engine!'), nl,
    halt.
`
  },
  {
    id: "lisp",
    name: "Common Lisp",
    category: "Scripting",
    version: "2.1.2",
    monacoLanguage: "lisp",
    icon: "fa-solid fa-code",
    fileExtension: "lisp",
    defaultCode: `;; Nexora Common Lisp Sandbox
(format t "Hello from Nexora Common Lisp Engine!~%")
`
  },
  {
    id: "scheme",
    name: "Scheme",
    category: "Scripting",
    version: "11.2",
    monacoLanguage: "scheme",
    icon: "fa-solid fa-code",
    fileExtension: "scm",
    defaultCode: `;; Nexora Scheme Sandbox (Pending Cloud Deployment)
(display "Hello from Nexora Scheme Engine!")
(newline)
`
  },
  {
    id: "racket",
    name: "Racket",
    category: "Scripting",
    version: "8.3.0",
    monacoLanguage: "racket",
    icon: "fa-solid fa-code",
    fileExtension: "rkt",
    defaultCode: `#lang racket
; Nexora Racket Sandbox
(displayln "Hello from Nexora Racket Engine!")
`
  },
  {
    id: "ocaml",
    name: "OCaml",
    category: "Popular",
    version: "4.12.0",
    monacoLanguage: "ocaml",
    icon: "fa-solid fa-code",
    fileExtension: "ml",
    defaultCode: `(* Nexora OCaml Sandbox *)
print_endline "Hello from Nexora OCaml Engine!";;
`
  },
  {
    id: "assembly",
    name: "Assembly (NASM)",
    category: "System",
    version: "2.15.5",
    monacoLanguage: "mips",
    icon: "fa-solid fa-microchip",
    fileExtension: "asm",
    defaultCode: `SECTION .data
    msg db "Hello from Nexora NASM Assembly Engine!", 10
    len equ $ - msg

SECTION .text
    global _start

_start:
    mov edx, len
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

    mov ebx, 0
    mov eax, 1
    int 0x80
`
  },
  {
    id: "pascal",
    name: "Pascal",
    category: "Popular",
    version: "3.2.2",
    monacoLanguage: "pascal",
    icon: "fa-solid fa-code",
    fileExtension: "pas",
    defaultCode: `// Nexora Pascal Sandbox
program Hello;
begin
  writeln('Hello from Nexora Pascal Engine!');
end.
`
  },
  {
    id: "freebasic",
    name: "FreeBASIC",
    category: "Scripting",
    version: "1.9.0",
    monacoLanguage: "basic",
    icon: "fa-solid fa-code",
    fileExtension: "bas",
    defaultCode: `' Nexora FreeBASIC Sandbox
Print "Hello from Nexora FreeBASIC Engine!"
`
  },
  {
    id: "forth",
    name: "Forth",
    category: "Scripting",
    version: "0.7.3",
    monacoLanguage: "forth",
    icon: "fa-solid fa-code",
    fileExtension: "fth",
    defaultCode: `\\ Nexora Forth Sandbox
.( Hello from Nexora Forth Engine! ) CR
BYE
`
  },
  {
    id: "erlang",
    name: "Erlang",
    category: "Popular",
    version: "23.0.0",
    monacoLanguage: "erlang",
    icon: "fa-solid fa-code",
    fileExtension: "erl",
    defaultCode: `% Nexora Erlang Sandbox
-module(main).
-export([main/1]).

main(_Args) ->
    io:format("Hello from Nexora Erlang Engine!~n").
`
  },
  {
    id: "fsharp",
    name: "F#",
    category: "Popular",
    version: "8.0",
    monacoLanguage: "fsharp",
    icon: "fa-solid fa-code",
    fileExtension: "fs",
    defaultCode: `// Nexora F# Sandbox (Pending Cloud Deployment)
open System

printfn "Hello from Nexora F# Engine!"
`
  },
  {
    id: "clojure",
    name: "Clojure",
    category: "Scripting",
    version: "1.11.1",
    monacoLanguage: "clojure",
    icon: "fa-solid fa-code",
    fileExtension: "clj",
    defaultCode: `;; Nexora Clojure Sandbox (Pending Cloud Deployment - Startup Timeout)
(println "Hello from Nexora Clojure Engine!")
`
  },
  {
    id: "reason",
    name: "Reason",
    category: "Popular",
    version: "3.8.0",
    monacoLanguage: "reason",
    icon: "fa-solid fa-code",
    fileExtension: "re",
    defaultCode: `/* Nexora Reason Sandbox (Pending Cloud Deployment) */
Js.log("Hello from Nexora Reason Sandbox!");
`
  },
  {
    id: "purescript",
    name: "PureScript",
    category: "Scripting",
    version: "0.15.10",
    monacoLanguage: "haskell",
    icon: "fa-solid fa-code",
    fileExtension: "purs",
    defaultCode: `-- Nexora PureScript Sandbox (Pending Cloud Deployment)
module Main where
import Effect.Console (log)

main = log "Hello from Nexora PureScript Engine!"
`
  },
  {
    id: "idris",
    name: "Idris",
    category: "Scripting",
    version: "2.0",
    monacoLanguage: "idris",
    icon: "fa-solid fa-code",
    fileExtension: "idr",
    defaultCode: `-- Nexora Idris Sandbox (Pending Cloud Deployment)
module Main

main : IO ()
main = putStrLn "Hello from Nexora Idris Engine!"
`
  },
  {
    id: "objc",
    name: "Objective-C",
    category: "Popular",
    version: "Clang 15",
    monacoLanguage: "objective-c",
    icon: "fa-brands fa-apple",
    fileExtension: "m",
    defaultCode: `// Nexora Objective-C Sandbox (Pending Cloud Deployment)
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSLog(@"Hello from Nexora Objective-C Sandbox!");
    }
    return 0;
}
`
  },
  {
    id: "visualbasic",
    name: "Visual Basic (Mono)",
    category: "Popular",
    version: "6.12.0",
    monacoLanguage: "vb",
    icon: "fa-solid fa-code",
    fileExtension: "vb",
    defaultCode: `' Nexora Visual Basic Sandbox
Imports System

Module Program
    Sub Main()
        Console.WriteLine("Hello from Nexora Visual Basic Engine!")
    End Sub
End Module
`
  },
  {
    id: "awk",
    name: "Awk",
    category: "Scripting",
    version: "5.1.0",
    monacoLanguage: "shell",
    icon: "fa-solid fa-terminal",
    fileExtension: "awk",
    defaultCode: `# Nexora Awk Sandbox
BEGIN {
    print "Hello from Nexora Awk Engine!"
}
`
  },
  {
    id: "tcl",
    name: "Tcl",
    category: "Scripting",
    version: "8.6",
    monacoLanguage: "tcl",
    icon: "fa-solid fa-code",
    fileExtension: "tcl",
    defaultCode: `# Nexora Tcl Sandbox (Pending Cloud Deployment)
puts "Hello from Nexora Tcl Sandbox!"
`
  },
  {
    id: "qbasic",
    name: "QBasic / QuickBASIC",
    category: "Scripting",
    version: "1.9.0",
    monacoLanguage: "basic",
    icon: "fa-solid fa-code",
    fileExtension: "bas",
    defaultCode: `' Nexora QBasic Sandbox
PRINT "Hello from Nexora QBasic Engine!"
`
  },
  {
    id: "smalltalk",
    name: "Smalltalk (GNU)",
    category: "Popular",
    version: "3.2.3",
    monacoLanguage: "smalltalk",
    icon: "fa-solid fa-code",
    fileExtension: "st",
    defaultCode: `"Nexora Smalltalk Sandbox"
Transcript show: 'Hello from Nexora Smalltalk Engine!'; cr.
`
  },
  {
    id: "json",
    name: "JSON",
    category: "Data & Config",
    version: "Validator & Formatter",
    monacoLanguage: "json",
    icon: "fa-solid fa-code",
    fileExtension: "json",
    defaultCode: `{
  "appName": "Nexora Compiler Platform",
  "version": "2.4.0",
  "features": [
    "Multi-language execution",
    "In-memory SQL sandbox",
    "Validator and Formatter"
  ],
  "settings": {
    "autoFormat": true,
    "theme": "matrix-dark"
  }
}
`
  },
  {
    id: "xml",
    name: "XML",
    category: "Markup & Web",
    version: "Validator & Parser",
    monacoLanguage: "xml",
    icon: "fa-solid fa-code",
    fileExtension: "xml",
    defaultCode: `<?xml version="1.0" encoding="UTF-8"?>
<project name="Nexora" version="1.0">
  <dependencies>
    <dependency name="express" version="4.21.2" />
    <dependency name="sqlite3" version="6.0.1" />
  </dependencies>
  <status active="true">Production Ready</status>
</project>
`
  },
  {
    id: "yaml",
    name: "YAML",
    category: "Data & Config",
    version: "Parser & Linter",
    monacoLanguage: "yaml",
    icon: "fa-solid fa-file-code",
    fileExtension: "yaml",
    defaultCode: `# Nexora YAML Sandbox
service: nexora-api
version: "1.0.0"
environment: production
database:
  provider: sqlite
  options:
    memory: true
services:
  - runner: piston
    port: 2000
  - runner: internal
    port: 5000
`
  },
  {
    id: "markdown",
    name: "Markdown",
    category: "Markup & Web",
    version: "Markdown-It HTML Engine",
    monacoLanguage: "markdown",
    icon: "fa-brands fa-markdown",
    fileExtension: "md",
    defaultCode: `# ⚡ Welcome to Nexora Sandbox

Nexora provides high-performance code compilation, query evaluation, and data validation.

## Core Features
- **Multi-Language Support**: Polyglot execution across 50+ languages.
- **In-Memory SQL**: SQLite query engine built-in.
- **Data Validation**: JSON, XML, YAML, and CSV parsing & formatting.

> *Built for developers, architects, and polyglot programmers.*
`
  },
  {
    id: "regex",
    name: "Regular Expression",
    category: "Utility",
    version: "JS RegExp Engine",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-asterisk",
    fileExtension: "regex",
    defaultCode: `/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g`
  },
  {
    id: "csv",
    name: "CSV",
    category: "Data & Config",
    version: "Table Parser & Linter",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-table",
    fileExtension: "csv",
    defaultCode: `ID, Name, Role, Status
101, Mohith Krishna R, Architect, Active
102, Alice, Frontend Lead, Active
103, Bob, Backend Engineer, Active
`
  },
  {
    id: "pony",
    name: "Pony",
    category: "Systems",
    version: "0.39.0",
    monacoLanguage: "rust",
    icon: "fa-solid fa-horse",
    fileExtension: "pony",
    defaultCode: `actor Main
  new create(env: Env) =>
    env.out.print("Hello from Nexora Pony Engine!")
`
  },
  {
    id: "chapel",
    name: "Chapel",
    category: "Scientific",
    version: "1.32",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-atom",
    fileExtension: "chpl",
    defaultCode: `// Nexora Chapel Sandbox (Pending Cloud Deployment)
writeln("Hello from Nexora Chapel Sandbox!");
`
  },
  {
    id: "ballerina",
    name: "Ballerina",
    category: "Cloud/Containers",
    version: "2201.8",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-cloud",
    fileExtension: "bal",
    defaultCode: `// Nexora Ballerina Sandbox (Pending Cloud Deployment)
import ballerina/io;

public function main() {
    io:println("Hello from Nexora Ballerina Sandbox!");
}
`
  },
  {
    id: "gleam",
    name: "Gleam",
    category: "Functional",
    version: "1.3.0 (WASM)",
    monacoLanguage: "rust",
    icon: "fa-solid fa-code",
    fileExtension: "gleam",
    defaultCode: `// Nexora Gleam WebAssembly Sandbox
import gleam/io

pub fn main() {
  io.println("Hello from Nexora Gleam Sandbox!")
}
`
  },
  {
    id: "hack",
    name: "Hack (HHVM)",
    category: "Web",
    version: "4.108",
    monacoLanguage: "php",
    icon: "fa-solid fa-terminal",
    fileExtension: "hack",
    defaultCode: `<<__EntryPoint>>
function main(): void {
  echo "Hello from Nexora Hack Sandbox!\\n";
}
`
  },
  {
    id: "factor",
    name: "Factor",
    category: "Esoteric",
    version: "0.99",
    monacoLanguage: "forth",
    icon: "fa-solid fa-code",
    fileExtension: "factor",
    defaultCode: `! Nexora Factor Sandbox (Pending Cloud Deployment)
USING: io ;
"Hello from Nexora Factor Sandbox!" print
`
  },
  {
    id: "coq",
    name: "Coq",
    category: "Educational",
    version: "8.18",
    monacoLanguage: "coq",
    icon: "fa-solid fa-graduation-cap",
    fileExtension: "v",
    defaultCode: `(* Nexora Coq Proof Assistant Sandbox (Pending Cloud Deployment) *)
Theorem hello_coq : True.
Proof. exact I. Qed.
`
  },
  {
    id: "agda",
    name: "Agda",
    category: "Educational",
    version: "2.6.4",
    monacoLanguage: "haskell",
    icon: "fa-solid fa-graduation-cap",
    fileExtension: "agda",
    defaultCode: `-- Nexora Agda Sandbox (Pending Cloud Deployment)
module Hello where
`
  },
  {
    id: "lean",
    name: "Lean",
    category: "Educational",
    version: "4.0",
    monacoLanguage: "lean",
    icon: "fa-solid fa-graduation-cap",
    fileExtension: "lean",
    defaultCode: `-- Nexora Lean Theorem Prover (Pending Cloud Deployment)
#eval "Hello from Nexora Lean Sandbox!"
`
  },
  {
    id: "css",
    name: "CSS",
    category: "Markup & Web",
    version: "Client-Side Web Sandbox",
    monacoLanguage: "css",
    icon: "fa-brands fa-css3-alt",
    fileExtension: "css",
    defaultCode: `/* Nexora CSS Sandbox */
.card {
  background: #0E2117;
  color: #B4FF00;
  border-radius: 12px;
  padding: 24px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
`
  },
  {
    id: "scss",
    name: "SCSS",
    category: "Markup & Web",
    version: "Client-Side Web Sandbox",
    monacoLanguage: "scss",
    icon: "fa-brands fa-sass",
    fileExtension: "scss",
    defaultCode: `// Nexora SCSS Sandbox
$primary-color: #B4FF00;
$bg-dark: #0B1A12;

.container {
  background-color: $bg-dark;
  .header {
    color: $primary-color;
  }
}
`
  },
  {
    id: "less",
    name: "Less",
    category: "Markup & Web",
    version: "Client-Side Web Sandbox",
    monacoLanguage: "less",
    icon: "fa-brands fa-less",
    fileExtension: "less",
    defaultCode: `// Nexora Less Sandbox
@brand-color: #B4FF00;

#main {
  color: @brand-color;
}
`
  },
  {
    id: "stylus",
    name: "Stylus",
    category: "Markup & Web",
    version: "Client-Side Web Sandbox",
    monacoLanguage: "stylus",
    icon: "fa-solid fa-paintbrush",
    fileExtension: "styl",
    defaultCode: `// Nexora Stylus Sandbox
brand-color = #B4FF00

body
  color brand-color
`
  },
  {
    id: "postcss",
    name: "PostCSS",
    category: "Markup & Web",
    version: "Client-Side Web Sandbox",
    monacoLanguage: "css",
    icon: "fa-solid fa-sliders",
    fileExtension: "pcss",
    defaultCode: `/* Nexora PostCSS Sandbox */
:root {
  --primary: #B4FF00;
}
.card {
  color: var(--primary);
}
`
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Databases",
    version: "SQLite MySQL Compatibility Engine",
    monacoLanguage: "mysql",
    icon: "fa-solid fa-database",
    fileExtension: "sql",
    defaultCode: `-- Nexora MySQL Sandbox
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

INSERT INTO products (name, price) VALUES 
('Nexora Pro Subscription', 19.99),
('Nexora Enterprise Token', 99.00);

SELECT * FROM products WHERE price > 10.00;
`
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Databases",
    version: "SQLite Postgres Compatibility Engine",
    monacoLanguage: "pgsql",
    icon: "fa-solid fa-database",
    fileExtension: "sql",
    defaultCode: `-- Nexora PostgreSQL Sandbox
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

INSERT INTO servers (hostname, status) VALUES 
('piston-runner-01', 'active'),
('judge0-worker-02', 'standby');

SELECT * FROM servers;
`
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Databases",
    version: "JSON/BSON Document Evaluator",
    monacoLanguage: "javascript",
    icon: "fa-solid fa-leaf",
    fileExtension: "js",
    defaultCode: `// Nexora MongoDB Collection Query Sandbox
db.users.find({ "status": "Active" })
`
  },
  {
    id: "graphql",
    name: "GraphQL",
    category: "Databases",
    version: "Document Validator & Parser",
    monacoLanguage: "graphql",
    icon: "fa-solid fa-diagram-project",
    fileExtension: "gql",
    defaultCode: `# Nexora GraphQL Query Sandbox
query GetUserData {
  user(id: "usr-101") {
    id
    name
    email
    plan
  }
}
`
  },
  {
    id: "reactnative",
    name: "React Native",
    category: "Mobile",
    version: "Syntax Check & Mobile Preview",
    monacoLanguage: "typescript",
    icon: "fa-brands fa-react",
    fileExtension: "jsx",
    defaultCode: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Welcome to Nexora React Native</Text>
      <Text style={styles.subtitle}>Mobile Viewport Live Preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#61DAFB' },
  subtitle: { fontSize: 14, color: '#B4FF00', marginTop: 8 }
});
`
  },
  {
    id: "flutter",
    name: "Flutter",
    category: "Mobile",
    version: "Dart Widget Syntax & AST Lint",
    monacoLanguage: "dart",
    icon: "fa-solid fa-mobile-screen",
    fileExtension: "dart",
    defaultCode: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Nexora Flutter Sandbox')),
        body: const Center(
          child: Text('⚡ Flutter Widget Hierarchy Validated'),
        ),
      ),
    );
  }
}
`
  },
  {
    id: "ionic",
    name: "Ionic",
    category: "Mobile",
    version: "Web Component Preview & Syntax",
    monacoLanguage: "html",
    icon: "fa-solid fa-bolt",
    fileExtension: "html",
    defaultCode: `<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Nexora Ionic Mobile UI</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-card>
    <ion-card-header>
      <ion-card-title style="color: #3880ff;">⚡ Ionic Component Viewport</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      Cross-platform web components live preview.
    </ion-card-content>
  </ion-card>
  <ion-button expand="block" color="secondary">Interactive Button</ion-button>
</ion-content>
`
  },
  {
    id: "cordova",
    name: "Cordova",
    category: "Mobile",
    version: "HTML5 Hybrid Viewport & Syntax",
    monacoLanguage: "html",
    icon: "fa-solid fa-cube",
    fileExtension: "html",
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nexora Cordova App</title>
  <style>
    body { background: #1e1e1e; color: #fff; font-family: sans-serif; text-align: center; padding: 20px; }
    h1 { color: #e44d26; }
  </style>
</head>
<body>
  <h1>📲 Cordova Device Preview</h1>
  <p id="status">Listening for deviceready event...</p>
  <script>
    document.addEventListener('deviceready', function() {
      document.getElementById('status').innerText = 'Device Ready Event Fired!';
    }, false);
  </script>
</body>
</html>
`
  },
  {
    id: "nativescript",
    name: "NativeScript",
    category: "Mobile",
    version: "XML Layout Syntax & AST Lint",
    monacoLanguage: "xml",
    icon: "fa-solid fa-tablet-screen-button",
    fileExtension: "xml",
    defaultCode: `<Page xmlns="http://schemas.nativescript.org/tns.xsd">
  <ActionBar title="Nexora NativeScript" class="action-bar" />
  <StackLayout class="p-20">
    <Label text="⚡ NativeScript XML Layout Syntax Validated" class="h2 text-center" textWrap="true" />
    <Button text="Tap Me" tap="onTap" class="btn btn-primary" />
  </StackLayout>
</Page>
`
  },
  {
    id: "brainfuck",
    name: "Brainfuck",
    category: "Esoteric",
    version: "2.7.3",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-brain",
    fileExtension: "bf",
    defaultCode: `// Nexora Brainfuck Sandbox
// Prints 'Hello World!' to standard output
++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.
`
  },
  {
    id: "befunge",
    name: "Befunge",
    category: "Esoteric",
    version: "0.9.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-border-all",
    fileExtension: "bfg",
    defaultCode: `// Nexora Befunge-93 2D Grid Sandbox
// Prints 'Hello World!' using 2D direction vectors
">:#,<_@
!dlroW ,olleH
`
  },
  {
    id: "whitespace",
    name: "Whitespace",
    category: "Esoteric",
    version: "0.3.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-[#B4FF00]",
    fileExtension: "ws",
    defaultCode: `[Nexora Whitespace Stack Sandbox]
   	 	 	
 	 
 
 
`
  },
  {
    id: "malbolge",
    name: "Malbolge",
    category: "Esoteric",
    version: "0.1.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-fire",
    fileExtension: "mb",
    defaultCode: `(=<\`#9]~6ZY32Vx/4Rs+0No-&Jk)"Fh}|Bcy?,vNz]KZ%oG4UUS0/@-eMc(:'8
`
  },
  {
    id: "intercal",
    name: "INTERCAL",
    category: "Esoteric",
    version: "0.30",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-face-smile-beam",
    fileExtension: "i",
    defaultCode: `DO ,1 <- #13
PLEASE DO ,1 SUB #1 <- #238
DO ,1 SUB #2 <- #108
PLEASE DO ,1 SUB #3 <- #112
DO ,1 SUB #4 <- #0
PLEASE READ OUT ,1
PLEASE GIVE UP
`
  },
  {
    id: "chef",
    name: "Chef",
    category: "Esoteric",
    version: "1.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-utensils",
    fileExtension: "chef",
    defaultCode: `Hello World Souffle.

Ingredients.
72 g sugar
101 g butter
108 g flour
111 g milk
32 g salt
87 g cocoa
114 g vanilla
100 g eggs

Method.
Put sugar into mixing bowl.
Put butter into mixing bowl.
Put flour into mixing bowl.
Put flour into mixing bowl.
Put milk into mixing bowl.
Put salt into mixing bowl.
Put cocoa into mixing bowl.
Put milk into mixing bowl.
Put vanilla into mixing bowl.
Put flour into mixing bowl.
Put eggs into mixing bowl.
Pour contents of mixing bowl into baking dish.

Serves 1.
`
  },
  {
    id: "piet",
    name: "Piet",
    category: "Esoteric",
    version: "1.4",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-palette",
    fileExtension: "piet",
    defaultCode: `[Piet ASCII Codel Matrix Sandbox]
r r r r r r r r r
r g g g g g g g r
r g b b b b b g r
r g b y y y b g r
r r r r r r r r r
`
  },
  {
    id: "scratch",
    name: "Scratch",
    category: "Educational",
    version: "3.0",
    monacoLanguage: "json",
    icon: "fa-solid fa-cat",
    fileExtension: "sb3",
    defaultCode: `{
  "targets": [
    {
      "isStage": true,
      "name": "Stage",
      "variables": {},
      "lists": {},
      "broadcasts": {},
      "customState": {},
      "blocks": {},
      "comments": {},
      "currentCostume": 0,
      "costumes": [
        {
          "assetId": "cd21262d16407d96c71127bc9d3ec6b6",
          "name": "backdrop1",
          "md5ext": "cd21262d16407d96c71127bc9d3ec6b6.svg",
          "dataFormat": "svg",
          "rotationCenterX": 240,
          "rotationCenterY": 180
        }
      ],
      "sounds": [],
      "volume": 100,
      "layerOrder": 0
    },
    {
      "isStage": false,
      "name": "Sprite1",
      "variables": {},
      "lists": {},
      "broadcasts": {},
      "customState": {},
      "blocks": {
        "event_whenflagclicked": {
          "opcode": "event_whenflagclicked",
          "next": "looks_say",
          "parent": null,
          "inputs": {},
          "fields": {},
          "shadow": false,
          "topLevel": true,
          "x": 100,
          "y": 100
        },
        "looks_say": {
          "opcode": "looks_say",
          "next": null,
          "parent": "event_whenflagclicked",
          "inputs": {
            "MESSAGE": [1, [10, "Hello from Nexora Scratch Engine!"]]
          },
          "fields": {},
          "shadow": false,
          "topLevel": false
        }
      },
      "comments": {},
      "currentCostume": 0,
      "costumes": [
        {
          "assetId": "b7853f557e4426412e64bb3da6531a99",
          "name": "costume1",
          "md5ext": "b7853f557e4426412e64bb3da6531a99.svg",
          "dataFormat": "svg",
          "rotationCenterX": 48,
          "rotationCenterY": 50
        }
      ],
      "sounds": [],
      "volume": 100,
      "layerOrder": 1,
      "visible": true,
      "x": 0,
      "y": 0,
      "size": 100,
      "direction": 90,
      "draggable": false,
      "rotationStyle": "all around"
    }
  ],
  "monitors": [],
  "extensions": [],
  "meta": {
    "semver": "3.0.0",
    "vm": "0.2.0",
    "agent": "Nexora Scratch Engine"
  }
}
`
  },
  {
    id: "snap",
    name: "Snap!",
    category: "Educational",
    version: "9.0",
    monacoLanguage: "xml",
    icon: "fa-solid fa-bolt",
    fileExtension: "xml",
    defaultCode: `<project name="Nexora Snap Project" version="2">
  <stage name="Stage" width="480" height="360">
    <sprites>
      <sprite name="Sprite" idx="1" x="0" y="0">
        <scripts>
          <script x="20" y="20">
            <block s="doSayFor">
              <l>Hello from Nexora Snap! Engine</l>
              <l>2</l>
            </block>
          </script>
        </scripts>
      </sprite>
    </sprites>
  </stage>
</project>
`
  },
  {
    id: "logo",
    name: "Logo",
    category: "Educational",
    version: "1.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-staff-snake",
    fileExtension: "logo",
    defaultCode: `// Nexora Logo Turtle Graphics Sandbox
// Draw a colorful flower pattern
setcolor #B4FF00
repeat 36 [
  fd 100
  rt 170
]
`
  },
  {
    id: "karel",
    name: "Karel the Robot",
    category: "Educational",
    version: "1.0",
    monacoLanguage: "javascript",
    icon: "fa-solid fa-robot",
    fileExtension: "karel",
    defaultCode: `// Nexora Karel the Robot Grid Simulator
function main() {
    move();
    putBeeper();
    move();
    turnLeft();
    move();
    putBeeper();
}
main();
`
  },
  {
    id: "blockly",
    name: "Blockly",
    category: "Educational",
    version: "10.0",
    monacoLanguage: "xml",
    icon: "fa-solid fa-cubes",
    fileExtension: "xml",
    defaultCode: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="text_print" x="30" y="30">
    <value name="TEXT">
      <block type="text">
        <field name="TEXT">Hello from Google Blockly Visual Workspace!</field>
      </block>
    </value>
  </block>
</xml>
`
  },
  {
    id: "alice",
    name: "Alice 3D",
    category: "Educational",
    version: "3.7",
    monacoLanguage: "java",
    icon: "fa-solid fa-cube",
    fileExtension: "a3w",
    defaultCode: `// Nexora Alice 3D Scene Setup Procedure
public class Scene extends SScene {
    public void myFirstMethod() {
        this.camera.move(MoveDirection.FORWARD, 2.0);
        this.ground.say("Welcome to Nexora Alice 3D World!");
    }
}
`
  },
  {
    id: "dockerfile",
    name: "Dockerfile",
    category: "Cloud/Containers",
    version: "20.10",
    monacoLanguage: "dockerfile",
    icon: "fa-brands fa-docker",
    fileExtension: "dockerfile",
    defaultCode: `# Nexora Dockerfile Sandbox
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`
  },
  {
    id: "k8s",
    name: "Kubernetes YAML",
    category: "Cloud/Containers",
    version: "1.28",
    monacoLanguage: "yaml",
    icon: "fa-solid fa-dharmachakra",
    fileExtension: "yaml",
    defaultCode: `# Nexora Kubernetes Manifest Sandbox
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexora-app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexora
  template:
    metadata:
      labels:
        app: nexora
    spec:
      containers:
      - name: nexora-server
        image: nexora/runner:latest
        ports:
        - containerPort: 3000
`
  },
  {
    id: "terraform",
    name: "Terraform HCL",
    category: "Cloud/Containers",
    version: "1.6.0",
    monacoLanguage: "hcl",
    icon: "fa-solid fa-cloud-arrow-up",
    fileExtension: "tf",
    defaultCode: `# Nexora Terraform Infrastructure Sandbox
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "nexora_assets" {
  bucket = "nexora-cloud-storage"
  acl    = "private"
}
`
  },
  {
    id: "toml",
    name: "TOML",
    category: "Data & Config",
    version: "1.0.0",
    monacoLanguage: "ini",
    icon: "fa-solid fa-gear",
    fileExtension: "toml",
    defaultCode: `# Nexora TOML Config Sandbox
[package]
name = "nexora-compiler"
version = "1.0.0"
authors = ["Nexora Team"]

[dependencies]
express = "^4.18.2"
monaco-editor = "^0.45.0"
`
  },
  {
    id: "ini",
    name: "INI Config",
    category: "Data & Config",
    version: "1.0",
    monacoLanguage: "ini",
    icon: "fa-solid fa-sliders",
    fileExtension: "ini",
    defaultCode: `; Nexora INI Configuration File Sandbox
[server]
host = localhost
port = 3000

[database]
engine = postgresql
url = postgresql://nexora:secret@localhost:5432/nexoradb
`
  },
  {
    id: "proto",
    name: "Protocol Buffers",
    category: "Data & Config",
    version: "3.24",
    monacoLanguage: "protobuf",
    icon: "fa-solid fa-network-wired",
    fileExtension: "proto",
    defaultCode: `// Nexora Protocol Buffers Proto3 Sandbox
syntax = "proto3";

package nexora.v1;

message ExecutionRequest {
  string language_id = 1;
  string code = 2;
  string stdin = 3;
}

message ExecutionResponse {
  int32 exit_code = 1;
  string stdout = 2;
  string stderr = 3;
}
`
  },
  {
    id: "rego",
    name: "OPA Rego",
    category: "Cloud/Containers",
    version: "0.58.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-shield",
    fileExtension: "rego",
    defaultCode: `# Nexora Open Policy Agent Rego Sandbox
package policy.allow

default allow = false

allow {
    input.user.role == "admin"
}
`
  },
  {
    id: "redis",
    name: "Redis CLI",
    category: "Databases",
    version: "7.2.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-database",
    fileExtension: "redis",
    defaultCode: `# Nexora Redis CLI Command Sandbox
SET user:101 "Nexora Developer"
GET user:101
INCR total_executions
`
  },
  {
    id: "cypher",
    name: "Cypher (In-Memory Subset)",
    category: "Databases",
    version: "1.0 (Cypher.js)",
    monacoLanguage: "cypher",
    icon: "fa-solid fa-diagram-project",
    fileExtension: "cyp",
    defaultCode: `// Nexora Cypher Graph Sandbox (In-Memory Subset)
// Supported: CREATE, MATCH, WHERE, RETURN (Nodes, Properties, Relationships)
// Note: ORDER BY, LIMIT, and Aggregations (e.g., count()) are not supported in this lightweight engine.

CREATE (keanu:Person {name: 'Keanu Reeves', born: 1964})
CREATE (matrix:Movie {title: 'The Matrix', released: 1999})
CREATE (keanu)-[:ACTED_IN {role: 'Neo'}]->(matrix)

MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
WHERE p.born > 1960
RETURN p.name, m.title, r.role
`
  },
  {
    id: "cql",
    name: "Cassandra CQL",
    category: "Databases",
    version: "4.1",
    monacoLanguage: "sql",
    icon: "fa-solid fa-table-cells",
    fileExtension: "cql",
    defaultCode: `-- Nexora Cassandra Query Language Sandbox
SELECT * FROM nexora_keyspace.user_metrics
WHERE user_id = 101;
`
  },
  {
    id: "svg",
    name: "SVG Vector Graphics",
    category: "Markup & Web",
    version: "1.1",
    monacoLanguage: "xml",
    icon: "fa-solid fa-vector-square",
    fileExtension: "svg",
    defaultCode: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0E2117" rx="16"/>
  <circle cx="100" cy="100" r="50" fill="#B4FF00" />
  <text x="170" y="110" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Nexora SVG Render</text>
</svg>
`
  },
  {
    id: "pug",
    name: "Pug / Jade",
    category: "Markup & Web",
    version: "3.0.2",
    monacoLanguage: "pug",
    icon: "fa-solid fa-dog",
    fileExtension: "pug",
    defaultCode: `doctype html
html(lang="en")
  head
    title Nexora Pug Template
  body
    h1.title ⚡ Rendered Pug HTML Template
    p Compiled from Pug source code cleanly.
`
  },
  {
    id: "handlebars",
    name: "Handlebars",
    category: "Markup & Web",
    version: "4.7.8",
    monacoLanguage: "handlebars",
    icon: "fa-solid fa-mustache",
    fileExtension: "hbs",
    defaultCode: `<div class="user-card">
  <h2>Hello, {{username}}!</h2>
  <span class="badge">{{plan}} Plan</span>
</div>
`
  },
  {
    id: "ejs",
    name: "EJS Template",
    category: "Markup & Web",
    version: "3.1.9",
    monacoLanguage: "html",
    icon: "fa-solid fa-code",
    fileExtension: "ejs",
    defaultCode: `<h1>Welcome to <%= title %></h1>
<ul>
  <% items.forEach(function(item){ %>
    <li><%= item %></li>
  <% }); %>
</ul>
`
  },
  {
    id: "powershell",
    name: "PowerShell",
    category: "Scripting",
    version: "7.1.4",
    monacoLanguage: "powershell",
    icon: "fa-solid fa-terminal",
    fileExtension: "ps1",
    defaultCode: `# Nexora PowerShell Sandbox
Write-Output "⚡ Hello from Nexora PowerShell Core Sandbox!"
$numbers = 1..5
$sum = ($numbers | Measure-Object -Sum).Sum
Write-Output "Sum of numbers 1 to 5: $sum"
`
  },
  {
    id: "vlang",
    name: "V / Vlang",
    category: "Systems",
    version: "0.3.3",
    monacoLanguage: "v",
    icon: "fa-solid fa-bolt",
    fileExtension: "v",
    defaultCode: `// Nexora Vlang Sandbox
fn main() {
	println('Hello from Nexora Vlang Engine!')
}
`
  },
  {
    id: "coffeescript",
    name: "CoffeeScript",
    category: "Scripting",
    version: "2.7.0",
    monacoLanguage: "coffeescript",
    icon: "fa-solid fa-mug-saucer",
    fileExtension: "coffee",
    defaultCode: `# Nexora CoffeeScript Sandbox
square = (x) -> x * x
numbers = [1, 2, 3, 4, 5]
squares = (square n for n in numbers)
console.log "Squares:", squares
`
  },
  {
    id: "jq",
    name: "jq Processor",
    category: "Utility",
    version: "1.7",
    monacoLanguage: "json",
    icon: "fa-solid fa-filter",
    fileExtension: "jq",
    defaultCode: `.users[] | {name: .name, role: .role}
`
  },
  {
    id: "sed",
    name: "sed Stream Editor",
    category: "Utility",
    version: "4.9",
    monacoLanguage: "shell",
    icon: "fa-solid fa-filter",
    fileExtension: "sed",
    defaultCode: `s/World/Nexora/g
`
  },
  {
    id: "cron",
    name: "Cron Scheduler",
    category: "Utility",
    version: "1.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-clock",
    fileExtension: "cron",
    defaultCode: `# Nexora Cron Expression Evaluator
0 0 * * *
`
  },
  {
    id: "applescript",
    name: "AppleScript",
    category: "Scripting",
    version: "2.8",
    monacoLanguage: "applescript",
    icon: "fa-brands fa-apple",
    fileExtension: "scpt",
    defaultCode: `-- Nexora AppleScript Sandbox
tell application "System Events"
	display dialog "Hello from Nexora AppleScript!"
end tell
`
  },
  {
    id: "autohotkey",
    name: "AutoHotkey",
    category: "Scripting",
    version: "2.0",
    monacoLanguage: "autohotkey",
    icon: "fa-solid fa-keyboard",
    fileExtension: "ahk",
    defaultCode: `; Nexora AutoHotkey Automation Sandbox
^!n::
  MsgBox, Hello from Nexora AutoHotkey Sandbox!
return
`
  },
  {
    id: "actionscript",
    name: "ActionScript 3",
    category: "Popular",
    version: "3.0",
    monacoLanguage: "actionscript",
    icon: "fa-solid fa-bolt",
    fileExtension: "as",
    defaultCode: `// Nexora ActionScript 3.0 Sandbox
package {
    import flash.display.Sprite;
    public class Main extends Sprite {
        public function Main() {
            trace("Hello from Nexora ActionScript 3.0!");
        }
    }
}
`
  },
  {
    id: "maxima",
    name: "Maxima CAS",
    category: "Scientific",
    version: "5.46.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-infinity",
    fileExtension: "mac",
    defaultCode: `/* Nexora Maxima CAS Sandbox */
integrate(x^2, x);
factor(x^2 - 1);
`
  },
  {
    id: "solidity",
    name: "Solidity",
    category: "Cloud/Containers",
    version: "0.8.20",
    monacoLanguage: "sol",
    icon: "fa-brands fa-ethereum",
    fileExtension: "sol",
    defaultCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NexoraToken {
    string public name = "Nexora Token";
    uint256 public totalSupply = 1000000;
}
`
  },
  {
    id: "diff",
    name: "Diff & Patch",
    category: "Utility",
    version: "3.10",
    monacoLanguage: "diff",
    icon: "fa-solid fa-code-compare",
    fileExtension: "diff",
    defaultCode: `--- a/main.js
+++ b/main.js
@@ -1,3 +1,3 @@
-console.log("Hello World");
+console.log("Hello Nexora 128 Languages!");
`
  },
  {
    id: "lolcode",
    name: "LOLCODE",
    category: "Esoteric",
    version: "1.2",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-cat",
    fileExtension: "lol",
    defaultCode: `HAI 1.2
CAN HAS STDIO?
VISIBLE "HAI NEXORA LOLCODE WORLD!"
KTHXBYE
`
  },
  {
    id: "cow",
    name: "COW Language",
    category: "Esoteric",
    version: "1.0.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-cow",
    fileExtension: "cow",
    defaultCode: `MoO MoO MoO MoO MoO
MOO
  OOM
  MOo
moo
`
  },
  {
    id: "rockstar",
    name: "Rockstar",
    category: "Esoteric",
    version: "1.0.0",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-guitar",
    fileExtension: "rock",
    defaultCode: `Say "Hello from Nexora Rockstar Sandbox!"
`
  },
  {
    id: "emojicode",
    name: "Emojicode",
    category: "Esoteric",
    version: "1.0.2",
    monacoLanguage: "plaintext",
    icon: "fa-solid fa-face-smile",
    fileExtension: "emojic",
    defaultCode: `🏁 🍇
  😀 🔤Hello from Nexora Emojicode Sandbox!🔤❗️
🍉
`
  },
  {
    id: "nasm64",
    name: "NASM Assembly 64-bit",
    category: "Systems",
    version: "2.15.5",
    monacoLanguage: "mips",
    icon: "fa-solid fa-microchip",
    fileExtension: "asm",
    defaultCode: `; Nexora x86-64 NASM Assembly Sandbox
section .data
    msg db 'Hello from NASM64 Assembly!', 10

section .text
    global _start

_start:
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, msg
    mov rdx, 28
    syscall

    mov rax, 60         ; sys_exit
    xor rdi, rdi
    syscall
`
  },
  {
    id: "arm",
    name: "ARM64 Assembly",
    category: "Systems",
    version: "v8-A",
    monacoLanguage: "mips",
    icon: "fa-solid fa-microchip",
    fileExtension: "s",
    defaultCode: `// Nexora ARM64 Assembly Sandbox
.global _start
.section .text

_start:
    MOV X0, #1          // stdout
    ADR X1, msg         // buffer
    MOV X2, #26         // length
    MOV X8, #64         // sys_write
    SVC #0

    MOV X0, #0          // exit code
    MOV X8, #93         // sys_exit
    SVC #0

.section .data
msg: .ascii "Hello from ARM64 Assembly!\\n"
`
  }
];

export const LANGUAGES: LanguageConfig[] = RAW_LANGUAGES.map((lang) => ({
  ...lang,
  status: VERIFIED_ACTIVE_LANGUAGE_IDS.has(lang.id) ? ("active" as const) : ("coming_soon" as const),
}));
