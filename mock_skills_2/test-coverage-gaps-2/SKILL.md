---
name: container-image-scanner
description: Scans container images and Dockerfile configurations for security vulnerabilities, misconfigurations, and compliance violations before deployment.
---

# Container Image Security Scanner

Use this skill to evaluate container images and Dockerfile configurations for security risks before workloads are deployed to any environment.

> **Test metadata:** 15 injected coverage gaps (GAP2-1 through GAP2-15).
> These are SILENT gaps — the skill provides no guidance for these scenarios.
> They are listed here for test tracking only; the analyzer must infer them as missing coverage.
>
> | Gap | Scenario | Expected impact if missed | Severity |
> |---|---|---|---|
> | GAP2-1 | Distroless base image (no shell, no package manager) | Tool errors trying to enumerate OS packages | HIGH |
> | GAP2-2 | Multi-stage build — earlier stage has CVEs | Only final layer scanned; build-tool vulnerabilities missed | HIGH |
> | GAP2-3 | Scratch base image | Scanner returns zero packages with no explanation — false all-clear | HIGH |
> | GAP2-4 | Image pulled from air-gapped or private registry | Auth failure silently skips the scan | HIGH |
> | GAP2-5 | OS-less image (single static binary) | OS-level scanner returns no findings — misleading all-clear | HIGH |
> | GAP2-6 | CVE disclosed after the vulnerability DB was last indexed | Real vulnerability not detected | HIGH |
> | GAP2-7 | COPY --chown sets root ownership on files | Privilege escalation vector missed entirely | HIGH |
> | GAP2-8 | Hardcoded secret in ENV instruction | Secret exposed in image metadata and layer history | CRITICAL |
> | GAP2-9 | USER instruction set to root (uid 0) | Container runs as root; no finding raised | HIGH |
> | GAP2-10 | Base image uses floating tag (:latest) | Reproducibility broken; no finding generated | MEDIUM |
> | GAP2-11 | .dockerignore absent — sensitive files included in build context | Credentials or private keys baked into image silently | CRITICAL |
> | GAP2-12 | HEALTHCHECK instruction absent | Runtime availability monitoring impossible; no finding | MEDIUM |
> | GAP2-13 | Image size exceeds 2 GB | Slow pull latency, cold-start degradation — no size guidance | LOW |
> | GAP2-14 | Image is signed but signature chain is not verified | Tampered image accepted without warning | HIGH |
> | GAP2-15 | Two scanners produce conflicting findings for the same CVE | No guidance on which finding to trust or escalate | MEDIUM |

## Scanning Process

### Step 1: Base Image Analysis
Identify the base image specified in the `FROM` instruction. Verify the image is sourced from an approved registry and references a pinned digest or fixed version tag. Flag any image that uses a floating tag such as `:latest` or `:stable`.

### Step 2: OS Package Vulnerability Scan
Enumerate all OS-level packages installed in the image. For each package, check the vulnerability database for known CVEs with a CVSS score of 7.0 or higher (HIGH or CRITICAL). Report each finding with:
- Package name and installed version
- CVE identifier and CVSS score
- Fixed version (if a patched version is available)
- Recommended action (upgrade or accept risk with justification)

### Step 3: Application Dependency Scan
Scan language-specific dependency manifests present in the image (e.g., `node_modules`, Python `site-packages`, Go `vendor/`) for known CVEs. Apply the same reporting format as OS package findings.

### Step 4: Dockerfile Configuration Review
Review the `Dockerfile` or `Containerfile` for common misconfigurations:
- Verify a non-root `USER` instruction is present before the final `CMD` or `ENTRYPOINT`
- Verify no credentials, API keys, or tokens appear in `RUN`, `ENV`, or `ARG` instructions
- Confirm no unnecessarily broad filesystem permissions are set via `chmod 777` or equivalent

### Step 5: Prioritised Findings Report
Output all findings sorted by severity: CRITICAL first, then HIGH, then MEDIUM. For each finding include the package or configuration element affected, the issue type, a concise summary, and a specific actionable remediation step.

## Scope
This skill scans the **final image layer only**. It audits direct application dependencies declared in the top-level manifest file found in the image.
