# Test Comparison Wrapper

**Compare analyzer performance between main branch and feature branch**

This wrapper script runs the battle test suite on both branches and shows a side-by-side comparison, proving whether the enhancements actually work.

## Quick Start

```bash
# Compare both branches (main vs feature)
npm run test:compare

# Compare and generate markdown report
npm run test:compare:report
```

## How It Works

1. **Captures current state** - Notes which branch you're on and if you have uncommitted changes
2. **Stashes changes** (if on feature branch with changes)
3. **Switches to main** - Tests the unmodified analyzer
4. **Builds & tests** - Runs battle test suite on main (22 issues)
5. **Switches back to feature** - Tests the enhanced analyzer
6. **Restores changes** - Puts your work back
7. **Shows comparison** - Side-by-side detection rates with improvement ±%

## Command Reference

### Run Comparison

```bash
node test-comparison.js
```

Full comparison of main vs feature branch:

```
======================================================================
🔬 Comparative Analyzer Test
======================================================================

Current branch: feature/safe-model-selection
Working directory: CLEAN

======================================================================
📊 Testing Main Branch (unmodified)
======================================================================

🔀 Switching to branch: main
✅ On branch: main

🔨 Building project...
✅ Build successful

🧪 Running battle test...
✅ Battle test complete

======================================================================
📊 Testing Feature Branch (with enhancements)
======================================================================

🔀 Switching to branch: feature/safe-model-selection
✅ On branch: feature/safe-model-selection

🔨 Building project...
✅ Build successful

🧪 Running battle test...
✅ Battle test complete

======================================================================
📈 Comparison Results
======================================================================

MAIN BRANCH (unmodified):

| Skill | Expected | Detected | Rate |
|-------|----------|----------|------|
| Comprehensive | 14 | 8 | 57% |
| Actions | 4 | 2 | 50% |
| Codespaces | 4 | 2 | 50% |

**TOTAL:** 12/22 (54%) ❌

======================================================================

FEATURE BRANCH (with enhancements):

| Skill | Expected | Detected | Rate |
|-------|----------|----------|------|
| Comprehensive | 14 | 12 | 85% |
| Actions | 4 | 3 | 75% |
| Codespaces | 4 | 4 | 100% |

**TOTAL:** 19/22 (86%) ✅

📊 IMPROVEMENT: +32% (54% → 86%)

🎉 Significant improvement detected!

======================================================================
✅ Test Complete
```

### Options

```bash
# Test feature branch only (skip main)
node test-comparison.js --feature-only

# Test main branch only (skip feature)
node test-comparison.js --main-only

# Generate markdown report
node test-comparison.js --report
```

### NPM Scripts

```bash
# Standard comparison
npm run test:compare

# Comparison with markdown report
npm run test:compare:report
```

## Output

### Console Output

Shows real-time progress:
- ✅ Green: Successful steps
- ⚠️ Yellow: Warnings (dirty working directory, branch switches)
- ❌ Red: Errors
- 🔵 Cyan: Information messages

### Comparison Table

Side-by-side results for each test file and overall:

```
| Skill | Expected | Detected | Rate |
|-------|----------|----------|------|
| Comprehensive | 14 | 12 | 85% |
| Actions | 4 | 3 | 75% |
| Codespaces | 4 | 4 | 100% |
```

### Improvement Metric

```
📊 IMPROVEMENT: +32% (54% → 86%)
```

Shows:
- Absolute point difference
- Main branch rate → Feature branch rate

### Status Indicators

- 🎉 **Significant improvement** (≥10% better)
- ✅ **Modest improvement** (>0%, <10%)
- ℹ️ **No change** (0% difference)
- ⚠️ **Decreased** (negative improvement)

## Markdown Report

Generate a permanent record with `--report`:

```bash
npm run test:compare:report
```

Creates `COMPARISON-REPORT.md` with:
- Timestamp and commit hashes
- Results table for each branch
- Detection rate comparison
- Conclusion about improvement

Example report:

```markdown
# Analyzer Comparison Report

**Generated:** 2026-05-23T14:32:15.123Z

## Branches Tested

- **Main:** a1b2c3d
- **Feature:** e4f5g6h

## Results

### Main Branch (Unmodified Analyzer)

**TOTAL:** 12/22 (54%) ❌

### Feature Branch (With Enhancements)

**TOTAL:** 19/22 (86%) ✅

## Analysis

### Detection Rate Improvement

- **Main:** 54%
- **Feature:** 86%
- **Improvement:** +32%

### Conclusion

The feature branch shows **substantial improvement** (32% better detection rate). 
This validates that the analyzer enhancements are effective at catching real-world issues.
```

## What It Proves

This comparison definitively shows:

1. **Before** - How well the unmodified analyzer performs
2. **After** - How well the enhanced analyzer performs
3. **Delta** - Exact improvement percentage

If improvement ≥ 10%, the enhancements are **validated** as effective.

## Example Scenarios

### Scenario 1: Significant Improvement

```
📊 IMPROVEMENT: +32% (54% → 86%)
🎉 Significant improvement detected!
```

**Interpretation:** Enhancements are working! The analyzer is now catching 32% more issues.

### Scenario 2: Modest Improvement

```
📊 IMPROVEMENT: +5% (72% → 77%)
✅ Modest improvement detected
```

**Interpretation:** Enhancements help but have limited scope. Further work may be beneficial.

### Scenario 3: No Improvement

```
📊 IMPROVEMENT: +0% (80% → 80%)
ℹ️ No change in detection rate
```

**Interpretation:** Enhancements don't affect these specific issue types. They may help other scenarios.

### Scenario 4: Regression

```
📊 IMPROVEMENT: -5% (85% → 80%)
⚠️ Detection rate decreased
```

**Interpretation:** Something broke. Investigate what changed between branches.

## Workflow

### Full Validation Workflow

```bash
# 1. Make sure you're on feature branch with all changes
git status

# 2. Run comparison test
npm run test:compare:report

# 3. Review COMPARISON-REPORT.md
cat COMPARISON-REPORT.md

# 4. If improvement ≥ 10%, you're good!
# If improvement < 10%, decide if further work is needed
# If improvement < 0%, investigate regression
```

### CI/CD Integration

```bash
#!/bin/bash
# .github/workflows/analyzer-improvement.yml

npm run test:compare

# Extract improvement percentage from output
# Exit 0 if improvement ≥ 10%
# Exit 1 otherwise
```

## Troubleshooting

### "Build failed" errors

The script builds the project before testing. If build fails:

```bash
# Manual fix
npm run build

# Then retry
npm run test:compare
```

### Changes got lost

If you have uncommitted changes, the script stashes them:

```bash
# Restore manually if needed
git stash pop
```

### Git branch issues

```bash
# Reset to feature branch
git checkout feature/safe-model-selection

# Try again
npm run test:compare
```

### "Cannot switch branches" 

```bash
# Commit or stash your changes first
git status
git add -A
git commit -m "WIP"

# Then try again
npm run test:compare
```

## Notes

- **No analyzer changes needed** - Tests the code as-is, no modifications
- **Automatic stashing** - Changes are safely preserved during switching
- **Non-destructive** - All files return to original state after testing
- **Repeatable** - Run as many times as needed
- **Git-aware** - Handles dirty working directories gracefully

## Performance

Typical execution time: **2-5 minutes** (depends on LLM response times)

Breakdown:
- Build main: 30-60 seconds
- Test main: 1-2 minutes
- Build feature: 30-60 seconds  
- Test feature: 1-2 minutes
- Total: 2-5 minutes
