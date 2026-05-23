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

### ⏳ REMAINING: Phase 1 (Loop Detection & Context Integration)
- ❌ Loop detection logic
- ❌ Recommendation history tracking
- ❌ Skill JIT context loading integration
- ❌ Feedback loop prevention

## Implementation Order

1. ✅ **Phase 2** (cache & refresh) — DONE
2. ✅ **Phase 3** (UX) — DONE
3. ⏳ **Phase 1** (loop detection) — NEXT

## Immediate Todos

1. **Register `clearCacheAndRescan` in package.json**
   - File: `client/package.json`
   - Add to `contributes.commands` array
   - Icon: `$(refresh)` or `$(sync)`

2. **Implement Phase 1: Loop Detection**
   - File: `src/analyzers/llm.ts`
   - Track recommendation history
   - Parse skill YAML frontmatter for JIT context
   - Detect and log feedback loops

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
