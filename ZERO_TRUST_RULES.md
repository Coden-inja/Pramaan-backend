# 🛡️ Zero-Trust Engineering Rules

This document establishes the absolute, mandatory engineering guidelines for the AI assistant to follow when building, debugging, and maintaining the **Pramaan** platform. **No guesses. No trial-and-error. Always verify from the source of truth.**

---

## 📋 Workflow Rules
These rules govern how the AI assistant approaches code auditing, web searches, diagnostics, command execution, and resource checks during development.

### Rule 1: Never Predict Local Versions
*   **The Problem:** Relying on semver ranges (like `^5.6.1`) in `package.json` can lead to installing slightly newer or different sub-versions on different machines, causing silent compiler breaks.
*   **The Rule:** Before writing configuration files or importing libraries, **always read the local `node_modules/<library>/package.json`** to check the absolute, installed version on the user's disk.

### Rule 2: Strict Internet Search & Sourcing Protocol
*   **The Problem:** AI models often rely on outdated pre-training weights, leading them to guess modern API designs or grab incorrect legacy syntax from 5 years ago.
*   **The Rule:** Before writing any code or proposing dependencies, you **MUST** run a targeted web search to outsource decision-making to the absolute, current ground truth of the internet.
    *   **Version-Lock Queries:** Every search query must include the exact version number fetched from `node_modules` (e.g., `"hardhat" "3.5.1"`).
    *   **Strict Source Credibility:** You are only allowed to trust official registries (e.g., `npmjs.com`, NPM registry metadata), official project documentation sites (e.g., `hardhat.org`, `ethers.org`), and official GitHub repositories (issues/pull requests). **Never trust random, unverified personal blogs or forum answers.**
    *   **Dependency Tree Checks:** If adding a package, look up its peer dependencies on the official NPM Registry first to ensure perfect alignment with existing packages.

### Rule 3: Audit Library Source Code Directly
*   **The Problem:** Libraries can have silent fallbacks, hidden config limits, or custom file-loading structures that are not documented clearly online.
*   **The Rule:** If a framework is ignoring a config file or throwing an error, **run a recursive `grep` search inside the local `node_modules/` directory** to view the framework's actual compiled JavaScript source code and see exactly what it is hardcoded to look for.

### Rule 4: Isolate & Diagnose First
*   **The Problem:** Running massive, end-to-end integration tests (like a full smart contract deployment script) makes it incredibly hard to locate the exact point of failure.
*   **The Rule:** Always write a tiny, lightweight, isolated diagnostics script (like `check-hre.ts`) to inspect runtime objects and print keys in memory before running heavy deployments.

### Rule 5: No Trial-and-Error Command Spam
*   **The Problem:** Running multiple commands in rapid succession to "see if it works" is bad engineering and wastes development cycles.
*   **The Rule:** Explain the precise technical purpose and the verified reasoning behind every command *before* requesting user approval.

### Rule 6: Proactive External Resource Verification
*   **The Problem:** The local filesystem and codebase cannot see external, real-world states (e.g., live wallet balances, third-party API usage limits, cloud billing statuses, or physical server states). Proposing live commands assuming these are ready can lead to silent failures or wasted transaction attempts.
*   **The Rule:** You **MUST** proactively ask the user to explicitly confirm that external funding, credentials, account permissions, and third-party resources are ready *before* proposing any command that executes against them.

### Rule 7: Hands-Off Testing Phase / Dev Command Ownership
*   **The Problem:** If the AI executes long-running dev servers (`npm run dev`) or triggers interactive API requests for final testing, it deprives the user of first-hand console visibility, runtime logs, and operational self-reliance. In real CI/CD and production environments, no AI exists to run the app; the human developer must own the execution.
*   **The Rule:** You are **strictly forbidden** from proposing or executing long-running dev commands, runtime servers, or interactive testing suites meant for final live verification. You may run compilers, type-checkers, test-compiles, or diagnostics scripts to locate bugs, but the **final testing, dev server execution, and endpoint verification must remain entirely in the user's hands** to build operational developer mastery.

### Rule 8: Never Trust Blindly / Mandatory Verification
*   **The Problem:** Humans under development momentum can easily overlook a minor console warning, a rejected database index, or a silent validator exception. If the AI blindly accepts verbal statements of "it works" or "it succeeded", it risks building subsequent code layers on top of a hidden flaw.
*   **The Rule:** You **MUST NEVER** proceed to subsequent development phases based solely on a verbal report of execution success. You **MUST** ask the user to paste the exact console trace, terminal outputs, or log segments to verify the execution state yourself before starting the next integration task.

### Rule 9: Prioritize Quick and Definite Verification (Build-First Auditing)
*   **The Problem:** Manually reading massive source code files to scan for typos or compile bugs is slow and prone to human oversight.
*   **The Rule:** If a fast, simple verification action exists that gives absolute, 100% accurate compiler results (such as running a test build, a TypeScript syntax check, or a local compiler run), **always execute that action first** rather than guessing or manually inspecting code.

### Rule 10: Active Speculative Auditing (ASA)
*   **The Problem:** Static type-checkers (like `tsc`) only check structural syntax. They are completely blind to browser network behaviors, framework runtime limitations, or DOM double-render warnings (such as passing an empty string `""` to an image `src` or anchor `href`, which triggers infinite relative-path page download loops in React 19 / Next.js).
*   **The Rule:** You **MUST NOT** declare any UI or full-stack integration complete based solely on a passing static compile check. Before claiming success, you **MUST** actively speculate and trace empty/null attribute fallback states, check for console warning edge cases, and ensure missing dynamic API keys fail gracefully with a premium counterfeit alert shield rather than throwing uncaught exceptions.

---

## 🎯 Meta-Rules (Ruleset Governance)
These rules do not govern our development workflow directly, but instead define the strict boundaries of what is allowed to be written inside this file to prevent bloat.

### Meta-Rule 1: Ruleset Contribution Threshold
*   **The Problem:** Documenting minor successes, standard type warnings, or routine coding fixes bloats the ruleset, diluting its core authority and making it difficult to scan.
*   **The Rule:** You are **strictly forbidden** from adding new entries to this ruleset or the Case Study section unless they meet one of the following criteria:
    *   **Criteria A:** A major architectural paradigm shift that broke conventional patterns (e.g., Hardhat 3's ESM transition).
    *   **Criteria B:** High-risk runtime bugs that would bypass local testing but silently fail or cause financial loss on production networks.
    *   **Criteria C:** Fundamental behavioral guidelines that improve AI reasoning precision.
    *   *Explicit Exclusions:* Do **NOT** document standard TypeScript compiler errors, simple build successes, minor syntax adjustments, or common framework configurations.

### Meta-Rule 2: Adding Important New Method Findings
*   **The Problem:** Discovering a breakthrough, non-obvious engineering method (such as an advanced decentralized design, a unique library hook, or a major framework workaround) is wasted if it is forgotten in a chat log, forcing future systems to rebuild it from scratch.
*   **The Rule:** You **MUST** document any newly discovered, non-obvious engineering methods, unique hooks, or major framework workarounds in the Case Study section of this document. This ensures future executions use these verified findings directly for surgical speed, rather than playing guess games.

---

## 📈 Zero-Trust Enforcement Checklist (Read this on every blocker!)
1.  **Audit First:** Did I read the installed package version from `node_modules/` *before* running any search query?
2.  **Version-Lock Queries:** Is my search query explicitly locked to the exact major/minor version (e.g. `"hardhat" "3.5.1"`) to filter out legacy Hardhat 2 answers?
3.  **Confirm Plugin Types:** Did I check if the library expects modern ESM plugins or legacy side-effect imports?
4.  **Isolate & Test:** Have I isolated the diagnostic to a single runtime check using the exact official API?
5.  **External Resource Check:** Have I proactively asked the user to confirm that live wallet funds, API keys, or external states are ready?
6.  **Hands-Off Dev Check:** Did I keep the long-running dev server and final testing phase in the user's hands (Rule 7)?
7.  **Terminal Output Verification:** Did I request the exact, raw terminal logs/outputs to verify execution success myself (Rule 8)?
8.  **Meta-Rules Contribution Check:** Does any proposed edit to this file strictly meet the Meta-Rule 1 & 2 guidelines?
9.  **User Alignment:** Have I explained the command and verified logic to the user?

---

## 💡 Case Study: Applying Zero-Trust to Hardhat 3 & ES Modules

Here is a concrete, real-world example of how we applied these Golden Rules to solve a highly complex, next-generation framework conflict in the Pramaan backend:

### The Scenario:
Our backend runs under native Node.js ES Modules (`"type": "module"` in `package.json`). We needed to integrate Ethers.js within a Hardhat 3 sandbox testing suite.

### How the Zero-Trust Rules Solved It:
1.  **Audit First (Rule 1):** Instead of assuming we were on legacy Hardhat 2, we audited `node_modules/hardhat/package.json` and discovered we were running **Hardhat v3.5.1**.
2.  **Version-Locked Searches (Rule 2):** We searched the web specifically for `"hardhat" "3.5.1" config "plugins"`, which revealed that Hardhat 3 completely threw out legacy side-effect plugins in favor of an **explicit, static `plugins` array** inside `defineConfig()` in `hardhat.config.ts`.
3.  **Direct Code Audit (Rule 3):** When a `.cjs` configuration file threw a `No Config File Found` error, we grepped Hardhat's core config-loading code directly on disk and proved that the engine was hardcoded to *only* search for `.ts` and `.js` config files on ESM systems.
4.  **Isolate & Diagnose (Rule 4):** We wrote a tiny 10-line `check-hre.ts` script to verify if the plugin was loaded. This proved that Ethers is not global in Hardhat 3, but is attached directly to connections spun up via `await network.create()`.

### The Resulting Sourced Code Implementation:
*   **Config file (`hardhat.config.ts`):**
    ```typescript
    import { defineConfig } from "hardhat/config";
    import hardhatEthers from "@nomicfoundation/hardhat-ethers";
    
    export default defineConfig({
      plugins: [hardhatEthers],
      solidity: {
        version: "0.8.24",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    });
    ```
*   **Script/Test connection hook:**
    ```typescript
    const connection = await hre.network.create();
    const { ethers } = connection;
    const [admin] = await ethers.getSigners();
    ```
