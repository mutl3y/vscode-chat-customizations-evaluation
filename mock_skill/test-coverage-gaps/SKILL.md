---
name: dependency-auditor
description: Audits project dependencies for known vulnerabilities, outdated versions, and license compliance issues.
---

# Dependency Audit

Use this skill to audit a project's dependencies and produce a prioritised remediation plan.

> **Test metadata:** 15 injected coverage gaps (GAP-1 through GAP-15).
> These are SILENT gaps — the skill provides no guidance for these scenarios.
> They are listed here for test tracking only; the LLM must infer them as missing coverage.
>
> | Gap | Scenario | Expected impact if missed | Detectable? |
> |---|---|---|---|
> | GAP-1 | Empty manifest (zero deps) | Confusing empty output | LOW |
> | GAP-2 | Private/air-gapped registry | Resolution failures silently ignored | HIGH |
> | GAP-3 | Diamond dependency conflict | Incompatible transitive versions ignored | HIGH |
> | GAP-4 | Transitive dependency vulnerabilities | Real CVEs missed entirely | HIGH |
> | GAP-5 | Dev vs production dependency risk distinction | Test-tool CVEs treated same as runtime | HIGH |
> | GAP-6 | Monorepo with multiple manifests | Only root package audited | HIGH |
> | GAP-7 | Missing lock file | Audit based on unresolved ranges, unreliable | HIGH |
> | GAP-8 | Two licenses individually compatible but conflicting with each other | Legal risk from dual-license stack | MEDIUM |
> | GAP-9 | Deprecated package with no maintained successor | Recommends removal with no migration path | HIGH |
> | GAP-10 | CRITICAL CVE with no patched version available | Recommends upgrade that doesn't exist | HIGH |
> | GAP-11 | Vulnerability scanner false positives | Teams cannot close non-applicable findings | MEDIUM |
> | GAP-12 | All-clear result (no issues found) | No output at all — confusing for users | MEDIUM |
> | GAP-13 | Before/after comparison post-upgrade | Cannot validate a fix was effective | MEDIUM |
> | GAP-14 | Success criteria not defined | Team cannot decide whether to ship | HIGH |
> | GAP-15 | Non-English package metadata | Risk summaries untranslated or skipped | LOW |

## How to Use This Skill

Provide the contents of the project's dependency manifest (`package.json`, `requirements.txt`, `Gemfile`, or `go.mod`) and the project's declared open-source license. This skill will audit all direct dependencies and return a prioritised list of findings.

## Audit Process

### Step 1: Enumerate Dependencies
Parse the manifest and list all declared direct dependencies with their declared version constraints.

### Step 2: Vulnerability Scan
For each dependency, identify known CVEs at HIGH or CRITICAL severity. For each finding, report:
- The CVE identifier and CVSS score
- The affected version range
- The minimum safe version to upgrade to
- Estimated upgrade effort (patch bump / minor upgrade / major migration)

### Step 3: License Compliance
Verify that each dependency's license is compatible with the project's own license. Flag dependencies whose license is:
- Copyleft (GPL, LGPL, AGPL) when the project is not itself open-source under a compatible licence
- Commercial or proprietary without a confirmed licence agreement on file
- Unknown or missing

### Step 4: Version Hygiene
Flag any dependency that is:
- More than two major versions behind the latest stable release
- Explicitly deprecated by the maintainer with a published end-of-life date
- Superseded by a renamed successor package recommended by the maintainer

### Step 5: Prioritised Remediation Report
Output all findings sorted by severity: CRITICAL first, then HIGH, then MEDIUM. For each finding, include:
- Package name and current version
- Issue type (vulnerability / licence / version hygiene)
- Concise issue summary
- A specific, actionable remediation step

## Scope

This skill audits **direct dependencies only** — packages listed explicitly in the top-level manifest file.
