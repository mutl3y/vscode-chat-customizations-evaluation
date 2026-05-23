---
name: github-codespaces-efficiency
description: 'Audit and improve GitHub Codespaces efficiency. Use this skill when a user wants faster Codespaces startup, lower Codespaces spend, slim devcontainers, right-size machines, tune idle timeout, or scope prebuilds to branches with sustained usage.'
---

# GitHub Codespaces Efficiency

Use this skill as a lean entrypoint for GitHub Codespaces efficiency work. Inspect the repo, identify waste, and load only needed references.

If no `.devcontainer/` exists yet, load [`references/codespaces.md`](./references/codespaces.md) and define a baseline before proceeding with the steps below.

## Use This Skill When

- The user wants faster Codespaces startup or lower Codespaces spend.
- The repo has a `.devcontainer/` or explicit Codespaces configuration questions.
- The user asks for devcontainer optimization, machine sizing, prebuild strategy, or idle-timeout guidance.
- The user is setting up Codespaces for the first time or needs help creating a new `.devcontainer/` from scratch.

## Load Only What You Need

- [`references/codespaces.md`](./references/codespaces.md) — devcontainer, machine-sizing, prebuild, idle-timeout guidance, and reporting.
- [`references/review-rubric.md`](./references/review-rubric.md) — load only for review passes.

## Core Workflow

### 1. Measure first

```bash
find .devcontainer -maxdepth 2 -type f
gh codespace list
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api "/repos/$repo/codespaces/machines"
```

If `gh` auth fails or the user lacks repo admin scope, proceed with static analysis of `.devcontainer/` files; mark machine-type and prebuild recommendations as unverified.

Look for: devcontainer image >2 GB or more than 10 features, machine type larger than usage data supports, missing `devcontainer-lock.json` (recommend adding — many repos predate lock-file support), prebuilds scoped too broadly, and idle timeout mismatched to usage patterns.

### 2. Apply guardrails

Check each proposed fix against these rules before recommending it:

1. Does not remove tools the team uses every day — drop any fix that strips required development tools or extensions.
2. Does not assume smaller is always better — balance machine cost against developer experience and throughput.
3. Does not turn the devcontainer into a production image — drop any fix that adds production-only dependencies unless the team explicitly requires it.
4. Incremental changes preferred — a greenfield baseline is appropriate only when no `.devcontainer/` exists; flag (do not drop) changes that restructure an existing config.
5. Repo changes stay separate from org settings — split any fix that mixes repo-editable files with org-level or user-level Codespaces settings into two distinct recommendations.

### 3. Select the top 3 fixes

From the six candidates below, keep only those supported by audit evidence from step 1 *and* passing all guardrails from step 2. Rank survivors by estimated monthly cost savings (USD). Select all candidates that meet both criteria, up to a maximum of 3.

1. Trim devcontainer — remove features, packages, or extensions not needed for everyday development work; target image <2 GB and fewer than 10 features
2. Right-size machine type — match to observed usage patterns; if data is unavailable, state assumptions explicitly
3. Scope prebuilds — enable for the default branch, `release/*` branches active in the last 14 days, and branches with more than 5 Codespaces per week; disable for all others
4. Tune idle timeout — 30 min default; 15 min if most sessions end before 30 min; 60 min if most sessions run longer
5. Remove unused extensions or port-forwarding rules
6. Reduce devcontainer image size and improve layer caching

### 4. Verify

- Start a test Codespace to confirm devcontainer changes build and start as expected.
- Validate machine sizing against observed usage when telemetry is available; otherwise mark as unverified.
- Treat unexpected build or startup failures as real bugs even when the configuration looks correct.

## Example Output Structure

### Waste sources
- **Large base image**: `mcr.microsoft.com/vscode/devcontainers/typescript:1.23` + ~15 npm packages = 2.8 GB (target: <2 GB)
- **Excessive prebuilds**: Enabled on all 40 branches; only 3 branches have sustained usage
- **Idle timeout mismatch**: Default 30 min, but 80% of sessions end within 15 min

### Proposed fixes (top 3)
1. **Trim devcontainer image** (saves ~$180/month, no risk)
   - Evidence: Image is 2.8 GB; remove unused packages (webpack-cli, python3, Ruby)
   - Keep: Node, npm, git, Docker, TypeScript — used daily
   - Target: <2 GB, 8 enabled features

2. **Scope prebuilds** (saves ~$240/month, no risk)
   - Evidence: 40 branches with prebuilds; only `main`, `develop`, and `release/v*` have >5 Codespaces/week
   - Change: Enable for default branch + `release/*`; disable for all feature branches

3. **Tune idle timeout to 15 min** (saves ~$90/month, low risk)
   - Evidence: Telemetry shows 80% of sessions end before 30 min; 15 min better matches usage
   - Fallback: Document that users can manually extend timeout if needed

### Validation
- Image trim: ✅ Test Codespace built and started in 45 sec (was 90 sec)
- Prebuilds: ✅ Verified on develop branch; prebuild reduced spin-up from 120 sec to 30 sec
- Idle timeout: Unverified (needs user feedback on 15-min setting)

### Impact
- **Monthly cost**: $450 → $110 (76% reduction)
- **Startup time**: 90 sec → 35 sec average (includes prebuild hit)
- **Storage**: 2.8 GB → 1.5 GB per image

## Required Output

**Waste sources:** [top cost or startup-time drivers]

**Proposed fixes:** [top 3 changes supported by audit evidence and passing guardrails]

**Validation:** [proven live / static-only / remaining risk]

**Impact:**
- Startup time: [expected] / [measured if available]
- Monthly spend: [expected] / [measured if available]
- Resource utilization: [expected] / [measured if available]

## References

- [`references/codespaces.md`](./references/codespaces.md)
- [`references/review-rubric.md`](./references/review-rubric.md) — load when reviewing completed efficiency work
