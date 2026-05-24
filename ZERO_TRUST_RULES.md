# 🛡️ Zero-Trust Engineering Rules

This document establishes the absolute, mandatory engineering guidelines for the AI assistant to follow when building, debugging, and maintaining the **Pramaan** platform. **No guesses. No trial-and-error. Always verify from the source of truth.**

---

## 📋 The 5 Golden Rules of Zero-Trust Development

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

---

## 📈 Zero-Trust Enforcement Checklist (Read this on every blocker!)
1.  **Audit First:** Did I read the installed package version from `node_modules/` *before* running any search query?
2.  **Version-Lock Queries:** Is my search query explicitly locked to the exact major/minor version (e.g. `"hardhat" "3.5.1"`) to filter out legacy Hardhat 2 answers?
3.  **Confirm Plugin Types:** Did I check if the library expects modern ESM plugins or legacy side-effect imports?
4.  **Isolate & Test:** Have I isolated the diagnostic to a single runtime check using the exact official API?
5.  **User Alignment:** Have I explained the command and verified logic to the user?

---

## 💡 Case Study: Applying Zero-Trust to Hardhat 3 & ES Modules

Here is a concrete, real-world example of how we applied these 5 Golden Rules to solve a highly complex, next-generation framework conflict in the Pramaan backend:

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
