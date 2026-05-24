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

### Phase 4 Goals

- **Fix instruction quality regression**: restore from 20% back to ≥47% baseline, then push higher
- Raise Coverage Gaps from **0% → 40%+** (zero detection currently)
- Raise Ambiguities from **15% → 40%+**
- Reduce Direct Contradiction FP (12 FP → <5) without losing the 15/15 TP
- Maintain Cognitive/Structural at **67%+**
- Target overall: **Jaccard ≥ 60%** (from current 41%)

### Approach

Improve `src/analyzers/llm.ts` LLM prompts to:
1. Fix instruction quality detection — diagnose why TP dropped from 7→3 vs baseline
2. Add explicit detection for coverage gaps (missing scenarios, unhandled edge cases)
3. Add explicit detection for ambiguities (vague terms, underspecified thresholds)
4. Tighten contradiction detection to reduce FP (require true logical conflict, not topic overlap)

### Workflow

```bash
# 1. Improve prompts in /workspace/vsce-feature/src/analyzers/llm.ts
# 2. Build and test (NEVER run from main)
cd /workspace/vsce-feature && npm run compile && node cli-analyzer.js --battle-test --dashboard
# 3. Compare latest.json vs baseline.json automatically in dashboard
```

### Files to modify
- `src/analyzers/llm.ts` — LLM system prompt and analysis phase prompts
- `src/server.ts` — if new diagnostic codes needed for new categories

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
