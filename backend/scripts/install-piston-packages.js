#!/usr/bin/env node
/**
 * Codeticz Piston Package Provisioner
 * Automatically installs all required language packages into a local or dedicated Piston container.
 * Reproducible for fresh deployments and CI/CD pipelines.
 */

const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

const REQUIRED_PACKAGES = [
  { language: "raku", version: "6.100.0" },
  { language: "pure", version: "0.68.0" },
  { language: "dash", version: "0.5.11" },
  { language: "bqn", version: "1.0.0" },
  { language: "iverilog", version: "11.0.0" },
  { language: "emacs", version: "27.1.0" },
  { language: "deno", version: "1.32.3" },
  { language: "llvm_ir", version: "12.0.1" }
];

async function provision() {
  console.log(`[Piston Setup] Checking runtimes at ${PISTON_URL}...`);
  let runtimes = [];
  try {
    const res = await fetch(`${PISTON_URL}/api/v2/runtimes`);
    if (res.ok) {
      runtimes = await res.json();
    }
  } catch (err) {
    console.error(`[Piston Setup] Failed to query ${PISTON_URL}:`, err.message);
    process.exit(1);
  }

  console.log(`[Piston Setup] Currently installed runtimes: ${runtimes.length}`);

  for (const pkg of REQUIRED_PACKAGES) {
    const isInstalled = runtimes.some(
      r => r.language === pkg.language || (r.aliases && r.aliases.includes(pkg.language))
    );

    if (isInstalled) {
      console.log(`  [OK] ${pkg.language} (${pkg.version}) already installed.`);
    } else {
      console.log(`  [INSTALLING] ${pkg.language} (${pkg.version})...`);
      try {
        const installRes = await fetch(`${PISTON_URL}/api/v2/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: pkg.language, version: pkg.version })
        });
        if (installRes.ok) {
          console.log(`  [SUCCESS] ${pkg.language} (${pkg.version}) installed successfully.`);
        } else {
          const errData = await installRes.json().catch(() => ({}));
          console.warn(`  [FAILED] Could not install ${pkg.language}:`, errData.message || installRes.statusText);
        }
      } catch (err) {
        console.warn(`  [ERROR] Network error installing ${pkg.language}:`, err.message);
      }
    }
  }

  console.log("[Piston Setup] Provisioning complete!");
}

provision();
