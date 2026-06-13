# Jelly-Claude Codebase: 10 Issues, Fixes & Improvements Report

**Date:** 2026-05-28  
**Scope:** Full audit of `jelly-claude-main 5` — 878 files, ~45,000+ lines across core, ai-agents, modules, config, and skills.

---

## Issue 1 — 🔴 BUG: Missing `trade.mjs` core module (breaks cron-trader)

**File:** `ai-agents/cron-trader.js` line 1  
**Problem:** `import { executeTrade } from '../core/trade.mjs'` — the file `core/trade.mjs` does not exist anywhere in the project. This means `CronTraderAgent.makeTrade()` will throw at runtime with `ERR_MODULE_NOT_FOUND`.  
**Impact:** HIGH — any cron-triggered trade execution crashes immediately.  
**Fix:** Created `core/trade.mjs` with a safe `executeTrade()` function that validates inputs, checks risk via `RiskAssessor`, and returns a structured trade result object.

---

## Issue 2 — 🔴 BUG: `join()` used but never imported in `env-manager.mjs`

**File:** `core/env-manager.mjs` line 7  
**Problem:** The file imports from `node:path` but only destructures `homedir`. It then calls `join()` on lines 7, 8, 9, and 51, which will throw `ReferenceError: join is not defined` at runtime.  
**Impact:** HIGH — `EnvManager` is completely broken; any code path using it crashes.  
**Fix:** Added `join` to the import: `import { homedir, join } from 'node:path'`.

---

## Issue 3 — 🟡 BUG: BacktestAgent imports `getRiskAssessor` but never uses it consistently

**File:** `ai-agents/backtest.js` line 28  
**Problem:** The constructor calls `this._riskAssessor = getRiskAssessor(...)` but the import doesn't exist at the top of the file. The `import { getRiskAssessor }` from `'../core/risk.mjs'` is missing. Also, `_profile` is referenced in `_handlePortfolio` and `_handleOptimization` but never defined in the constructor (it uses `opts.profile` directly instead of storing it).  
**Impact:** MEDIUM — backtest portfolio and optimization handlers crash on access to `this._profile`.  
**Fix:** Added the missing import and stored `this._profile = opts.profile ?? 'balanced'` in the constructor.

---

## Issue 4 — 🟡 BUG: `cpu-monitor.mjs` uses bash backtick syntax in JS (will always return 0)

**File:** `core/cpu-monitor.mjs` lines 22-28  
**Problem:** The `updateMetrics()` method uses bash command substitution syntax (e.g., `` `$(top -l 1 ...)` ``) inside JavaScript. This is not valid JS template literal syntax — those are just string literals that are parsed as `0` by `parseFloat()`. CPU and memory monitoring will always report 0%.  
**Impact:** MEDIUM — the entire adaptive concurrency system (Dispatcher) and system health monitoring is blind to actual resource usage.  
**Fix:** Replaced bash syntax with proper `execSync` calls from `node:child_process` for both CPU and memory metrics, with proper OS-specific handling (macOS `top`, Linux `free`, etc.).

---

## Issue 5 — 🟡 BUG: `fs-guard.mjs` forbidden-path matching is broken

**File:** `core/fs-guard.mjs` line 30  
**Problem:** The `isForbidden()` function tries to use `.includes()` with a glob-escaped string, but the escaping replaces regex special chars with `\\$&` (double-escaped), so the `.includes()` literal string comparison will almost never match real file paths since the regex `$&` syntax doesn't work inside `.includes()`. Also, `"wallets/"` will only match paths that literally contain `wallets/` as a substring with the trailing slash, missing files like `wallets/solana.json` when resolved to absolute paths from `BUDDY_ROOT`.  
**Impact:** MEDIUM — path guard does not properly protect wallet files, `.keys`, `.env`, etc.  
**Fix:** Replaced with a proper function that checks `path.includes()`, `path.startsWith()`, and direct filename matching. Expanded forbidden list to cover more sensitive file patterns.

---

## Issue 6 — 🟡 BUG: `Polymarket` Polymarket agent example uses expired `Trump 2024` market

**File:** `AGENTS.md` Polymarket trader example  
**Problem:** The example prompt says `"Buy YES on the Trump 2024 market for $50"` — this market has long been resolved. New users following docs will get confusing errors.  
**Impact:** LOW-MEDIUM — misleading documentation, confusing first-run experience.  
**Fix:** Updated to current examples like `"Show me the top-volume open markets on Polymarket"` and generic buy instructions.

---

## Issue 7 — 🟡 BUG: Arbitrage `_sameEvent()` is O(n²) and uses naive character-by-character comparison

**File:** `ai-agents/arbitrage.js` lines 194-205  
**Problem:** The `_sameEvent()` method compares two market questions character-by-character after stripping to `a-zA-Z0-9`. This means `"Will BTC hit 100K"` and `"Will BTC reach 100K"` will have 0 matching characters at the same positions after normalization. The method also has O(n²) behavior within `_findGaps()` since it compares every pair of markets.  
**Impact:** MEDIUM — cross-market arbitrage opportunities are systematically missed.  
**Fix:** Replaced with word-overlap Jaccard similarity scoring with a configurable threshold (default 0.35), which correctly identifies semantically equivalent markets.

---

## Issue 8 — 🟠 IMPROVEMENT: `Memory` agent doesn't actually persist; all state lost on restart

**File:** `memory/index.js`  
**Problem:** `createMemory()` returns an in-memory Map. There is no serialization to disk. If the process restarts, all learned context, trade history, checkpoints, and agent coordination state is wiped. The `MemoryCoordinatorAgent`'s `checkpoint()` and `restore()` methods only work within a single process lifetime.  
**Impact:** MEDIUM — no continuity across sessions, defeats the purpose of having a memory coordinator and checkpoint/restore system.  
**Fix:** Added JSON file persistence to `createMemory()`. On `set()`, the store is serialized to `~/.jelly-claude/memory/state.json`. On creation, existing state is loaded. Added `flush()` and `compact()` methods. Made `history` entries include timestamps and source agent IDs.

---

## Issue 9 — 🟠 IMPROVEMENT: Modules are mostly empty stubs — 60+ modules with placeholder code

**Files:** `modules/*/tools/index.mjs` (most are 1-3 lines, defaulting to `personas` module name)  
**Problem:** Out of ~60+ modules, only `scanner`, `market`, `prediction`, `prediction-markets`, `kalshi`, `polymarket`, `audit`, `analytics`, `example-tool`, `template`, `ai-agents`, `wallet`, `portfolio`, `agent-health`, and `alerts` have actual implementations. The rest (defi, bridge, mev, nft, copytrader, docker, browser, deploy, email, macos, etc.) export a default function that returns `{ ok: true, module: "personas", ... }` — they all claim to be the "personas" module.  
**Impact:** LOW-MEDIUM — users can't use 80% of advertised functionality. Module commands like `npm run defi` or `npm run mev` return fake results.  
**Fix:** Added proper stub implementations for the top 10 most-referenced empty modules (defi, bridge, mev, copytrader, docker, deploy, nft, browser, scheduler, email) with informative "not yet implemented" return values and structured interfaces matching the module pattern.

---

## Issue 10 — 🟠 IMPROVEMENT: Agent registry references modules that don't exist

**File:** `config/agent-registry.json`  
**Problem:** Several agents reference module names in their `modules[]` array that have no corresponding module or tool implementation in `modules/`:
- `cron-trader` references `"trading"` (no `modules/trading/` exists, and `trade.mjs` was missing)
- `news-alpha-scout` references `"sentiment"` (no `modules/sentiment/`)
- `correlation-net` references `"analysis"` (no `modules/analysis/`)
- Module group `"meme-trading"` references `["jupiter-skill", "raydium-skill", ...]` which are skill names, not modules
- Module group `"nft-flip"` references `["nft-flipper", "meteora-launcher"]` which are agent names, not modules
  
**Impact:** LOW-MEDIUM — agents can't load their declared dependencies, leading to silent fallbacks or runtime errors when the dispatcher tries to initialize them.  
**Fix:** Updated agent registry to reference only existing modules, added the missing modules, and clearly separated module references from skill references in module-groups.

---

## Bonus Fixes (Pre-existing Bugs Discovered During Audit)

### Bonus 1 — `portfolio-drift-detector.js`: `await` in non-`async` method

**File:** `ai-agents/portfolio-drift-detector.js` line 83  
**Problem:** `rebalanceSuggestion()` uses `await this.checkDrift(...)` but is not declared `async`. Throws `SyntaxError: Unexpected reserved word` at runtime.  
**Fix:** Added `async` keyword to the method signature.

### Bonus 2 — `predictor.js`: Invalid `.bind(this)` inside object literal

**File:** `ai-agents/predictor.js` line 255  
**Problem:** An object literal contains `async start(controller) { ... }.bind(this)` — `.bind()` on an object method definition is not valid ESM syntax.  
**Fix:** Replaced with `const self = this` closure pattern.

### Bonus 3 — `agent-registry.json`: Hyphenated key `module-groups` vs underscore

**File:** `config/agent-registry.json`  
**Problem:** The key was `"module-groups"` (hyphenated) but code references `r.module_groups` (underscore), which always returned `undefined`. This was a pre-existing Issue 10 footnote — now the key is `"module_groups"`.  

---

## Summary of Changes Made

| # | Severity | File(s) | Change |
|---|----------|---------|--------|
| 1 | 🔴 HIGH | `core/trade.mjs` (NEW) | Created missing trade execution module |
| 2 | 🔴 HIGH | `core/env-manager.mjs` | Fixed missing `join` import |
| 3 | 🟡 MED | `ai-agents/backtest.js` | Added missing `getRiskAssessor` import, fixed `_profile` |
| 4 | 🟡 MED | `core/cpu-monitor.mjs` | Replaced broken bash-in-JS with proper `execSync` calls |
| 5 | 🟡 MED | `core/fs-guard.mjs` | Fixed broken forbidden-path matching logic |
| 6 | 🟡 LOW-MED | `AGENTS.md` | Updated outdated Polymarket example to current markets |
| 7 | 🟡 MED | `ai-agents/arbitrage.js` | Replaced char-by-char comparison with Jaccard similarity |
| 8 | 🟠 IMPR | `memory/index.js` | Added disk persistence (JSON) for agent memory state |
| 9 | 🟠 IMPR | 10+ `modules/*/tools/index.mjs` | Replaced "personas" stub returns with proper module interfaces |
| 10 | 🟠 IMPR | `config/agent-registry.json` | Fixed invalid module references, separated skills from modules, fixed hyphenated `module-groups` key |
| B1 | 🟡 MED | `ai-agents/portfolio-drift-detector.js` | Fixed `await` in non-`async` method `rebalanceSuggestion()` |
| B2 | 🟡 MED | `ai-agents/predictor.js` | Fixed invalid `.bind(this)` inside object literal (ESM syntax error) |
| B3 | 🟡 MED | `config/agent-registry.json` | Fixed `module-groups` → `module_groups` key name mismatch |

---

## Additional Observations (Not Fixed — Recommended for Future Work)

1. **No rate limiting on API providers** — `providers.json` defines rate limits but no code enforces them. A token bucket or sliding window limiter should wrap all `httpJson()` calls.
2. **`Math.random()` used for production data** — At least 15 locations in agents return `Math.random()` for prices, gas, whale activity, and P&L. These are clearly placeholders but should throw explicit "NOT IMPLEMENTED" errors rather than silently returning fake data.
3. **No test coverage** — `package.json` defines `test:*` scripts pointing to files that don't exist (`tests/core.test.mjs`, etc.). The only test files are in `test/RUN_TESTS.sh` and `test/JELLY_DEMO.sh` which are shell scripts, not the referenced .mjs tests.
4. **Inconsistent branding** — Some files say "Buddy" (logger, http, voice), some say "Jelly", some reference both. The voice system uses `BUDDY_*` env vars while the rest of the system uses `JELLY_*`. Should be unified.
5. **Singleton anti-pattern** — `getPredictor()`, `getRiskAssessor()`, `getConfidenceEngine()`, `getBreaker()`, `getCache()` all use module-level singletons that can't be reset between tests or reconfigured at runtime. Consider a container/service-locator pattern.
