# CLI Analyzer Adapter

**CLI-driven interface for testing the LLM analyzer without VS Code UI**

This adapter allows you to:
- Analyze individual skill files from the command line
- Batch analyze directories
- Run the comprehensive battle test suite
- Export results as JSON or Markdown reports

## Installation

The CLI analyzer is already included in the repository. Just build the project:

```bash
npm run build
```

## Quick Start

### Run the Battle Test Suite

```bash
npm run analyze:battle
```

This runs the complete 22-issue battle test across all three test files:
- `mock_skill/test-analyzer-comprehensive/SKILL.md` (14 issues)
- `mock_skill/github-actions-efficiency/SKILL.md` (4 issues)  
- `mock_skill/github-codespaces-efficiency/SKILL.md` (4 issues)

Output shows detection rate and determines if Phase 1 is ready:
- **77%+** = ✅ Phase 1 complete
- **60-77%** = ⚠️ Partial, needs refinement
- **<60%** = ❌ Needs more work

### Analyze a Single File

```bash
npm run analyze:file mock_skill/github-actions-efficiency/SKILL.md
```

Output:
```
📖 Reading file: mock_skill/github-actions-efficiency/SKILL.md
   55 lines, 2847 characters

🔧 Loading analyzer...
✅ Analyzer ready

🚀 Running analysis...
✅ Analysis complete

======================================================================
Analysis Results: SKILL.md
======================================================================

ERRORS (2)
--
1. [contradiction] Line 44
   Contradiction: "drop any fix that removes release, schema, migration..." 
   ...

WARNINGS (1)
--
2. [ambiguity-llm] Line 52
   Ambiguous: "drop any fixes that use excessive matrix combinations"
   ...

--
📊 SUMMARY: 3 issues (2 errors, 1 warning, 0 info)
```

### Analyze All Files in a Directory

```bash
npm run analyze:batch mock_skill
```

Recursively finds and analyzes all markdown files in the directory.

## Full Command Reference

### Single File Analysis

```bash
node cli-analyzer.js <file-path>
```

**Default output:** Color-coded table with all issues grouped by severity

**Options:**
- `--json` — Output as JSON (for scripting)
- `--report` — Generate Markdown report

**Examples:**

```bash
# Analyze with default table output
node cli-analyzer.js mock_skill/github-actions-efficiency/SKILL.md

# Output as JSON (good for parsing)
node cli-analyzer.js mock_skill/github-actions-efficiency/SKILL.md --json

# Generate markdown report
node cli-analyzer.js mock_skill/github-actions-efficiency/SKILL.md --report > report.md
```

### Batch Analysis

```bash
node cli-analyzer.js <directory-path> --batch
```

Analyzes all `.md` files in directory and subdirectories.

**Output:** 
- Individual results for each file
- Batch summary with totals
- Detection rate by file

**Example:**

```bash
node cli-analyzer.js mock_skill --batch
```

### Battle Test Suite

```bash
node cli-analyzer.js --battle-test
```

Runs complete validation against all test files:

```
🎯 Running Battle Test Suite

📝 Comprehensive Test Skill
   Path: mock_skill/test-analyzer-comprehensive/SKILL.md
   Expected: 14 issues
   Detected: 12/14 (85%) ✅

📝 GitHub Actions Efficiency
   Path: mock_skill/github-actions-efficiency/SKILL.md
   Expected: 4 issues
   Detected: 3/4 (75%) ⚠️

📝 GitHub Codespaces Efficiency
   Path: mock_skill/github-codespaces-efficiency/SKILL.md
   Expected: 4 issues
   Detected: 4/4 (100%) ✅

| Skill | Expected | Detected | Detection Rate |
|-------|----------|----------|-----------------|
| ... | ... | ... | ... |

TOTAL: 19/22 issues detected (86%) ✅ READY

🎉 Phase 1 analyzer enhancement is SUCCESSFUL!
```

## NPM Scripts

Convenient shortcuts for common tasks:

```bash
# Show help (lists all commands)
npm run analyze

# Analyze a specific file
npm run analyze:file mock_skill/github-actions-efficiency/SKILL.md

# Batch analyze a directory
npm run analyze:batch mock_skill

# Run full battle test
npm run analyze:battle
```

## Output Formats

### Table (Default)

Grouped by severity with color coding:
- 🔴 ERRORS (red) — Critical issues
- 🟡 WARNINGS (yellow) — Significant issues
- 🔵 INFO (cyan) — Informational
- ⚪ HINTS (gray) — Minor suggestions

```
ERRORS (2)
--
1. [contradiction] Line 44
   Contradiction: "drop any fix that removes...

WARNINGS (1)
--
2. [ambiguity] Line 52
   Ambiguous: "drop any fixes that use...

📊 SUMMARY: 3 issues (2 errors, 1 warning, 0 info)
```

### JSON

Machine-readable format with full metadata:

```json
{
  "file": "mock_skill/github-actions-efficiency/SKILL.md",
  "timestamp": "2026-05-23T12:34:56.789Z",
  "total": 3,
  "by_severity": {
    "error": 2,
    "warning": 1,
    "info": 0,
    "hint": 0
  },
  "issues": [
    {
      "code": "contradiction",
      "severity": "error",
      "message": "Contradiction: ...",
      "line": 44,
      "column": 40
    },
    ...
  ]
}
```

### Markdown Report

Human-readable report with all issues formatted for documentation:

```markdown
# Analysis Report

**File:** `mock_skill/github-actions-efficiency/SKILL.md`
**Time:** 2026-05-23T12:34:56.789Z
**Total Issues:** 3

## Summary

| Severity | Count |
|----------|-------|
| Error    | 2     |
| Warning  | 1     |
| Info     | 0     |
| Hint     | 0     |

## Errors

### 1. contradiction

**Line:** 44

Contradiction: "drop any fix that removes release, schema, migration..."

### 2. ambiguity

**Line:** 52

Ambiguous: "drop any fixes that use excessive matrix combinations"

...
```

## Battle Test Interpretation

The battle test results determine Phase 1 readiness:

| Detection Rate | Status | Interpretation |
|---|---|---|
| **80%+** | ✅ READY | Analyzer is production-ready; Phase 1 complete |
| **70-79%** | ✅ GOOD | Excellent coverage; ready with minor known gaps |
| **60-69%** | ⚠️ PARTIAL | Good progress; needs refinement before production |
| **50-59%** | ⚠️ WEAK | Significant gaps; more work needed |
| **<50%** | ❌ POOR | Major issues; rethink approach |

### Expected Results by Issue Type

Based on Phase 1 enhancements, expected detection rates:

- **Contradictions:** 80%+ (enhancements specifically target these)
- **Ambiguities:** 70%+ (harder for LLM; higher sensitivity to phrasing)
- **Persona Issues:** 60%+ (requires understanding tone/role)
- **Cognitive Load:** 70%+ (clear patterns are detectable)
- **Coverage Gaps:** 75%+ (straightforward missing guidance detection)

## Troubleshooting

### "Module not found" errors

Ensure the project is built:

```bash
npm run build
```

### "File not found" errors

Use absolute or relative paths from workspace root:

```bash
# ✅ Correct
node cli-analyzer.js mock_skill/github-actions-efficiency/SKILL.md

# ❌ Incorrect (relative to wrong directory)
cd mock_skill && node cli-analyzer.js github-actions-efficiency/SKILL.md
```

### No issues detected when expected

1. Check that the file contains the expected issues (search for `[BATTLE-TEST]` or `[CONTRADICTION-` markers)
2. Verify the LLM is being called (look for network activity)
3. Run with debug: `DEBUG=1 node cli-analyzer.js <file>`

### Empty output

The analyzer may have detected 0 issues. This is normal for production files. For test files, it means:
- The analyzer didn't detect the injected issues
- The prompt may need enhancement
- The LLM response may have failed

## Integration with CI/CD

The CLI analyzer can be integrated into automated testing:

```bash
#!/bin/bash
# .github/workflows/analyzer-test.yml

npm run analyze:battle

# Check detection rate
if [ $? -eq 0 ]; then
  echo "✅ Analyzer validation passed"
  exit 0
else
  echo "❌ Analyzer validation failed"
  exit 1
fi
```

## Development

To modify the CLI adapter:

1. Edit `cli-analyzer.js`
2. Rebuild: `npm run build`
3. Test: `npm run analyze:battle`

The adapter imports the compiled analyzer from `out/analyzers/llm.js`, so changes to the analyzer require rebuilding.
