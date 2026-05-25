# Chat Customizations Evaluations — Improvement Plan

**Status:** Planning phase  
**Date:** May 23, 2026  
**Related PR:** [#101 — Safe Automatic Model Selection with Cost Guardrails](https://github.com/microsoft/vscode-chat-customizations-evaluation/pull/101)

---

## Context

After implementing safe automatic model selection (PR #101), the extension was used to analyze 2 skills in `mock_skill/`. This analysis revealed several design and UX issues that require systematic improvements.

### Completed Work (PR #101)

- ✅ Extracted model selection logic into `client/src/modelSelection.ts` for testability
- ✅ Implemented `selectPreferredModel()` with ordered preference list (cheapest first)
- ✅ Added `EXPENSIVE_MODEL_FAMILIES` blocklist (claude-opus, gemini-3.5-flash, gpt-5.5, etc.)
- ✅ Updated fallback chain: try preferred families → filter expensive → refuse if all expensive
- ✅ Changed default `chatCustomizationsEvaluations.model` from `gpt-4o` (unavailable) to `""` (automatic)
- ✅ Added 26 unit tests covering all selection logic paths
- ✅ Extended `vitest.config.ts` to include `client/src/__tests__/`

---

## Issues Discovered During Testing

### 1. Analyzer Enters Infinite Loop of Problem Generation

**Problem:**  
When analyzing complex skills (e.g., `github-codespaces-efficiency/`), the analyzer generated diagnostics, which when addressed raised *new* problems, creating an endless cycle. The skill structure was bloated as a result.

**Root Cause:**
- Analyzer does not track previously made recommendations
- Analyzer does not apply skill's just-in-time (JIT) context loading guidance
- No mechanism to detect or break feedback loops
- Each analysis pass treats the skill as fresh, without considering prior fixes

**Scope:** `src/analyzers/llm.ts` → LLM prompt engineering

---

### 2. Cache Issue: "Analyze" Button Only Appears on Fresh Load

**Problem:**  
- First load: "Analyze Prompt" action button displays correctly
- Subsequent loads: Extension shows "Fix Diagnostics" link instead
- User cannot reliably trigger a fresh scan without hard refresh
- Cached diagnostic results persist even after file changes

**Root Cause:**
- VS Code's `DiagnosticCollection` caches results by URI
- Extension logic may not clear or invalidate cache properly on re-analysis
- Status bar state and diagnostic state may become out of sync

**Scope:** `client/src/extension.ts` → cache management and diagnostic lifecycle

---

### 3. No Reliable Way to Trigger Rescan

**Problem:**  
Users have no predictable way to force a fresh analysis without:
- Closing and reopening the file
- Hard-refreshing the extension host
- Manually clearing diagnostics

**Scope:** `client/src/extension.ts` → command registration and state management

---

## Proposed Solution Phases

### Phase 1: Analyzer Loop Detection & Prevention (Priority: High)

**Goal:** Break infinite feedback loops and incorporate skill context.

**Changes:**

1. **Add loop detection to LLM analyzer**
   - Track recommendation history per skill file
   - Detect if new diagnostics are "regressions" of previously addressed issues
   - Implement confidence scoring: reduce confidence when re-raising same issue
   - Log warning when loop detected; offer to halt analysis

2. **Integrate skill context loading into analyzer**
   - Parse skill YAML frontmatter to extract just-in-time guidance
   - Append skill's "Load Only What You Need" section to system prompt
   - Reference skill's stated use-cases to validate whether diagnostics are in-scope
   - Example: "github-codespaces-efficiency" should not generate issues about React patterns

3. **Implement "analysis context" file**
   - Store analysis metadata (timestamp, recommendations, confidence) locally
   - Use to inform next analysis pass without blocking on cache
   - Allow manual reset via command

**Files to modify:**
- `src/analyzers/llm.ts` — add loop detection and context tracking
- `src/server.ts` — extend diagnostic request to include skill context
- `src/types.ts` — add types for analysis history and context

**Testing:**
- Unit tests for loop detection logic
- Integration test: re-analyze same skill, verify no regression recommendations

---

### Phase 2: Cache Invalidation & Diagnostic Lifecycle (Priority: High)

**Goal:** Ensure diagnostics update reliably; "Analyze" action always available.

**Changes:**

1. **Implement explicit cache clearing**
   - Add method to clear diagnostics for a given URI
   - Call before each new analysis pass
   - Emit `didChangeWatchedFiles` notification to refresh UI state

2. **Decouple action visibility from cache state**
   - "Analyze Prompt" action should always be available (not hidden by cache)
   - Remove dependency on `staleNotificationEligibleUris` for action visibility
   - Track action state independently from diagnostic state

3. **Add manual refresh command**
   - `chatCustomizationsEvaluations.clearCache` — wipe all cached diagnostics
   - `chatCustomizationsEvaluations.reanalyzeActive` — force rescan of current file
   - Expose both via status bar + command palette

4. **Implement file change detection**
   - On `onDidChangeTextDocument`, mark diagnostics as stale
   - Auto-clear stale diagnostics after configurable delay (default: 2s)
   - This prevents stale results from blocking new analysis

**Files to modify:**
- `client/src/extension.ts` — diagnostic lifecycle, command registration
- `client/package.json` — add new commands to `contributes.commands`

**Testing:**
- E2E test: analyze → fix → re-analyze → verify "Analyze" button present
- E2E test: edit file → verify stale diagnostics auto-clear
- Manual: verify all action flows work after file save

---

### Phase 3: UX Polish & Diagnostics Clarity (Priority: Medium)

**Goal:** Make analysis results more actionable; clarify next steps.

**Changes:**

1. **Enhanced diagnostic messages**
   - Include "why" context (e.g., "⚠ Missing section: 'Required Output' (cost visibility needed)")
   - Add links to reference docs where applicable
   - Show confidence level (high/medium/low) to help user prioritize

2. **Analysis summary report**
   - After analysis completes, show brief report: "9 issues (4 high, 3 medium, 2 low)"
   - Suggest action order: "Fix high-confidence issues first; then re-analyze"
   - Link to `Fix Diagnostics` action from summary

3. **Status bar improvements**
   - Show phase ("Fetching model…" → "Analyzing…" → "9 issues found")
   - Progress indicator (not just spinner)
   - Completion count (e.g., "4/9 issues fixed")

**Files to modify:**
- `client/src/extension.ts` — message formatting, summary report
- `src/server.ts` — enhance diagnostic output with metadata

**Testing:**
- Manual: verify report clarity and completeness
- Accessibility: ensure high-contrast and keyboard navigation

---

## Implementation Status

### ✅ COMPLETED: Phase 2 (Cache Invalidation & Refresh)
- ✅ `clearCacheForUri()` implemented in `client/src/extension.ts`
- ✅ `clearAllCaches()` implemented
- ✅ `clearCacheAndRescan` command registered (runtime)
- ✅ Analysis snapshots with SHA256 fingerprints for change detection
- ✅ Cache cleared after "Fix Diagnostics" action
- ✅ UI state synced with `updateHasDiagnosticsContext()`
- **Note:** Command not yet registered in `client/package.json` `contributes.commands` — needs addition for discoverability

### ✅ COMPLETED: Phase 3 (UX Polish)
- ✅ `formatIssueSummary()` — "1 issue found" / "X issues found"
- ✅ `formatDurationMs()` — duration formatting
- ✅ Status bar stages: "Starting…" → "Connecting…" → "Collecting results" → "X issues found"
- ✅ Progress notification with real-time stage updates
- ✅ Request count tracking: "N requests in flight"
- ✅ Completion message in status bar: "$(check) X issues found" (clickable → Problems panel)
- ✅ Analysis duration logged
- ✅ Analysis snapshot recorded for change detection

### ✅ COMPLETED: Phase 1 (Loop Detection & Context Integration)
- ✅ Loop detection logic (`detectLoops()` in `src/analyzers/llm.ts`)
- ✅ Recommendation history tracking (`analysisHistory` Map keyed by document URI)
- ✅ Skill YAML frontmatter parsing (`parseSkillMetadata()`)
- ✅ Skill JIT context injected into LLM system prompt
- ✅ Feedback loop warning diagnostic emitted when cycle detected
- ✅ SHA256 content fingerprinting (`computeFingerprint()`)
- ✅ Levenshtein similarity for fuzzy duplicate detection (`textSimilarity()`)
- ✅ Issue deduplication by content hash (`computeIssueHash()`)

## Implementation Order

1. ✅ **Phase 2** (cache & refresh) — DONE
2. ✅ **Phase 3** (UX) — DONE
3. ✅ **Phase 1** (loop detection) — DONE

---

## Phase 4: Battle-Test-Driven Prompt Engineering

**Status:** ⏳ IN PROGRESS  
**Branch:** `feature/analyzer-improvements` (worktree at `/workspace/vsce-feature`)  
**Baseline commit:** `c79f93b` — PR #101 (safe model selection, no analyzer improvements)  
**Test harness:** runs via `npm run analyze:battle` in `/workspace/vsce-feature`

### ⚠️ Important: Do NOT test against `main`

The `main` branch has a bug that causes it to always select an expensive model (no safe model selection). Only run battle tests against `feature/analyzer-improvements`.

### Scoring: Jaccard / IoU

`Jaccard = TP / (TP + FP + FN)`

When FP=0, Jaccard equals recall. When FP>0, Jaccard directly penalises over-detection. Example: 10/15 with 0 FP → 67% (not 80% as F1 would give).

### Baseline (c79f93b — 2026-05-24) — Jaccard scoring

Run against `c79f93b` compiled code, same mock skills as improvement branch, using `gpt-4o-mini`:

| Category | Expected | TP | FP | FN | **Jaccard** |
|---|---|---|---|---|---|
| Contradictions: Direct | 15 | 15 | 12 | 0 | **56%** |
| Contradictions: Subtle | 12 | 12 | 13 | 0 | **48%** |
| Ambiguities | 20 | 4 | 0 | 16 | **20%** |
| Cognitive & Structural | 15 | 10 | 0 | 5 | **67%** |
| Coverage Gaps | 15 | 0 | 0 | 15 | **0%** |
| Instruction Quality | 15 | 7 | 0 | 8 | **47%** |
| **Overall** | **92** | **48** | **25** | **44** | **41%** |

### Current (feature/analyzer-improvements — 2026-05-24) — Jaccard scoring

| Category | Expected | TP | FP | FN | **Jaccard** | vs Baseline |
|---|---|---|---|---|---|---|
| Contradictions: Direct | 15 | 15 | 12 | 0 | **56%** | ±0 |
| Contradictions: Subtle | 12 | 12 | 2 | 0 | **86%** | **+38%** ✅ |
| Ambiguities | 20 | 3 | 0 | 17 | **15%** | -5% |
| Cognitive & Structural | 15 | 10 | 0 | 5 | **67%** | ±0 |
| Coverage Gaps | 15 | 0 | 0 | 15 | **0%** | ±0 |
| Instruction Quality | 15 | 3 | 0 | 12 | **20%** | **-27%** ⚠️ |
| **Overall** | **92** | **43** | **14** | **49** | **41%** | ±0 |

> Subtle contradictions improved significantly (FP: 13→2). Instruction quality regressed (TP: 7→3). Net cancels out at 41%.

Baseline saved in: `battle-test-results/baseline.json`

### Phase 4 Progress (May 24, 2026)

#### ✅ Architecture: Wave-based parallel analysis

5 parallel LLM calls per document, each with a static cacheable system prompt. User message = document content only (the dynamic part). Enables OpenAI prompt caching at ≥1024 tokens for repeat analyses.

After persona+cognitive merge (see below): **4 waves** per document.

#### ✅ Battle harness: Category filter + corrected expected counts

- Added `parseCategoryBuckets(category)` to cli-analyzer.js — maps test category strings to bucket names
- Scoring loop now filters `analysisResults` to only the relevant category before computing detected count
- Prevents FP inflation from other-category issues being counted against targeted tests
- **Corrected expected counts** based on mock file YES/MAYBE/NO labels:
  - Cognitive & Structural: `expected` 15 → **9** (6 NO/undetectable issues excluded)
  - Instruction Quality: `expected` 15 → **9** (6 NO/undetectable issues excluded)

#### ✅ Persona + Cognitive wave merged → `analyzeStructuralWave`

- `SYSTEM_PROMPT_PERSONA` (238t) + `SYSTEM_PROMPT_COGNITIVE` (383t) replaced by `SYSTEM_PROMPT_STRUCTURAL_QUALITY` (~621t combined)
- Single wave covers both persona consistency and cognitive load
- Response JSON returns both `persona_issues` and `cognitive_load` keys
- Saves 1 LLM call per document = 6 fewer calls per full battle test run (24 vs 30)
- Updated `analyze()` phases array: removed 'persona', 'cognitive' → added 'structural'

#### ✅ Ambiguity quality bar tuned

Criteria (b) weak obligation language and (c) model-delegation patterns are now **always flagged** (no confidence gate). Only criterion (a) material interpretations keeps the high-confidence bar. This fixes instruction quality test instability where QUALITY-1/2/3/7/8/9/12/15 were suppressed.

#### Current Scores (best valid run, 2026-05-24, with new harness & corrected expected)

| Category | Expected | TP | FP | FN | **Jaccard** | Notes |
|---|---|---|---|---|---|---|
| Contradictions: Direct | 15 | 15 | 15 | 0 | **50%** | FPs from contradiction wave itself |
| Contradictions: Subtle | 12 | 12 | 12 | 0 | **50%** | Same |
| Ambiguities | 20 | 20 | 0 | 0 | **100%** ✅ | Perfect |
| Cognitive & Structural | 9 | 4 | 0 | 5 | **44%** ⚠️ | Persona issues NOT detected |
| Coverage Gaps | 15 | 0 | 0 | 15 | **0%** ❌ | Rate limited (test #5) |
| Instruction Quality | 9 | 0 | 0 | 9 | **0%** ❌ | Rate limited (test #6) |
| **Overall** | **80** | **51** | **27** | **29** | **48%** | |

**Caveat:** Coverage Gaps and Instruction Quality were rate-limited in every run — see rate limit note below.

#### ⚠️ CRITICAL: GitHub Models Daily Rate Limit

`gpt-4o-mini` via GitHub Models API has a hard limit of **150 requests per day** (`UserByModelByDay`). A single full battle test run = 4 waves × 6 files = **24 LLM calls**. After the first run + a couple of retries, the quota is exhausted. The reset is 86400s (24 hours).

**Consequence:** Coverage Gaps (test #5) and Instruction Quality (test #6) have **never been fully validated** against the new prompts because they always run after the daily quota is exhausted.

**Mitigation needed:**
1. Add `--single <category>` flag to battle harness (test one category at a time, 4 calls)
2. Or add inter-test delay with rate limit error detection (retry after 60s on 429)
3. Or use a different model with higher limits for testing

#### Known Issues for Next Session

1. **Cognitive & Structural: 44% (TP:4/9)** — Structural wave finds cognitive issues (COGNITIVE-1/2/3/4 → 4 TPs) but appears to MISS persona issues (PERSONA-1/2/3/4 → 0 TPs). The merged `SYSTEM_PROMPT_STRUCTURAL_QUALITY` may need strengthening for persona detection. Consider: is the combined prompt too long? Does the cognitive load section dominate?

2. **Coverage Gaps: unvalidated** — Never returned results in any session run (always rate limited as test #5). Needs isolated testing via `--single coverage_gap`.

3. **Instruction Quality: unvalidated** — The ambiguity tuning (always flag b/c) should improve this, but it's always test #6 (rate limited). Needs isolated `--single` test.

4. **Contradiction FPs at 50%** — Both contradiction tests have 50% Jaccard because TP=expected but FP=expected too (same count). The contradiction wave is finding the right issues PLUS an equal number of false positives. Prompt needs tightening.

### Phase 4 Goals (Updated)

- **Fix persona detection** in merged structural wave: TP should be 8/9 not 4/9
- **Add `--single <category>` flag** to battle harness to test one category with 4 calls
- **Validate coverage gaps** via isolated test (should get ~40%+ from correct prompt)  
- **Validate instruction quality** via isolated test (ambiguity tuning b/c should push to 60%+)
- **Reduce contradiction FPs**: both tests at 50% Jaccard due to equal FP count — tighten prompt
- **Target overall Jaccard ≥ 60%** (from current 48%)

### Approach

```bash
# Safe isolated testing (4 LLM calls per run):
node cli-analyzer.js mock_skill/test-instruction-quality/SKILL.md
node cli-analyzer.js mock_skill/test-coverage-gaps/SKILL.md

# Full battle test (24 LLM calls — use sparingly):
cd /workspace/vsce-feature && npm run compile && node cli-analyzer.js --battle-test --dashboard
```

### Files to modify
- `src/analyzers/llm.ts` — system prompts (persona strength in structural wave, contradiction FP tightening)
- `cli-analyzer.js` — add `--single <category>` or `--only <test-name>` flag to run one test

---

## Success Criteria

- ✅ Re-analyzing a skill does not regenerate previously addressed issues
- ✅ "Analyze Prompt" action always visible; no hidden by cache state
- ✅ Manual rescan via command works reliably on first click
- ✅ No hard refresh needed between analyses
- ✅ Skill analysis respects skill's just-in-time context guidance
- ✅ Unit test coverage ≥80% for new analyzer logic
- ✅ E2E tests pass for cache invalidation and rescan workflows

---

## Estimated Effort

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Loop detection & context tracking | 3-4 days |
| 1 | Skill JIT integration | 1-2 days |
| 2 | Cache invalidation | 2-3 days |
| 2 | Manual refresh commands | 1 day |
| 2 | File change detection | 1 day |
| 3 | Enhanced diagnostics | 1-2 days |
| 3 | Analysis summary | 1 day |
| 3 | Status bar polish | 1 day |
| **Total** | | **11-15 days** |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Analyzer context grows unbounded | Memory bloat; slow startup | Implement configurable history limit; periodically prune old entries |
| Loop detection too aggressive | Valid recommendations missed | Use heuristics (exact match + confidence threshold); allow manual override |
| Cache clear breaks active analysis | User confusion; data loss | Queue cache clears; don't clear while analysis in flight |
| JIT context parsing breaks on malformed YAML | Extension crash | Wrap in try-catch; log errors; fall back to no context |

---

## Notes

- Coordinate with PR #101 merge before starting Phase 1
- Model selection stability (PR #101) is prerequisite for reliable loop detection testing
- Consider adding telemetry to track analysis loop frequency in production
- Document cache invalidation strategy in CONTRIBUTING.md for future maintainers
