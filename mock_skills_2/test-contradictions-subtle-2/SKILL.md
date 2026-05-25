---
name: iac-reviewer
description: Reviews Infrastructure-as-Code configurations (Terraform, Pulumi, CloudFormation) for security, reliability, and operational best practices before merge.
---

# Infrastructure-as-Code Reviewer

Use this skill to evaluate IaC pull requests for security vulnerabilities, reliability risks, and operational excellence before they are merged to the main branch.

> **Test metadata:** 12 injected subtle contradictions (SUBTLE2-1 through SUBTLE2-12).
> Each section contains a contradiction that requires domain inference to detect — the rules don't
> use opposite words but their practical implications are mutually exclusive.
> Expected analyzer category: `contradiction` for all 12.

## Review Guidelines

### [SUBTLE2-1] State File Security vs. Committed Reproducibility
All Terraform state files must be encrypted at rest and stored only in approved secure remote backends (S3 with SSE-KMS, GCS with CMEK). State files must never be committed to source control under any circumstances.

All infrastructure configurations must be fully reproducible from source control alone — ensure every piece of configuration and state needed to perform a `plan` or `apply` is committed alongside the code.

*(Domain inference required: Terraform state files contain sensitive resource metadata and secret outputs; committing them to source control directly violates the first rule.)*

---

### [SUBTLE2-2] Immutable Infrastructure vs. Automated In-Place Patching
Treat all compute resources as immutable — when changes are required, replace the resource rather than modifying it in-place to ensure clean, reproducible environments.

All EC2 instances must have AWS Systems Manager Agent installed and patch baselines configured to apply OS-level security patches automatically without requiring instance replacement.

*(Domain inference required: SSM automated patching modifies running instances in-place, which violates the immutable infrastructure principle.)*

---

### [SUBTLE2-3] Explicit Resource Tagging vs. Module-Level Tag Inheritance
Every resource provisioned through IaC must carry explicit tags for: `owner`, `cost-centre`, `environment`, and `data-classification`. Any resource missing a required tag must fail the policy check at plan time.

Use tag inheritance at the module or resource-group level to reduce repetition and avoid errors — individual resources should defer to their enclosing module's default tags rather than declaring their own.

*(Domain inference required: relying on inherited tags means individual resources do not carry explicit tags, which fails the per-resource completeness check in the first rule.)*

---

### [SUBTLE2-4] Deletion Protection vs. Automated Environment Teardown
All production databases, caches, and stateful message queues must have deletion protection enabled to prevent accidental data loss from a misconfigured `terraform destroy`.

Infrastructure for short-lived environments (feature branches, load-test runs) must be automatically torn down by the pipeline after use — no manual cleanup steps are permitted.

*(Domain inference required: deletion protection prevents automated teardown of any resource where it is enabled, blocking the automated cleanup requirement for environments that span both categories.)*

---

### [SUBTLE2-5] Pinned Module Versions vs. 24-Hour CVE Patch Velocity
Always pin Terraform module versions to exact semver tags or commit SHAs to prevent unexpected upstream changes from breaking infrastructure on the next `plan`.

When a critical security CVE is patched in an upstream module, apply the updated module version within 24 hours — never delay security patches waiting for a standard change window.

*(Domain inference required: pinned versions require an explicit version-bump commit through the change control process; the 24-hour patching requirement conflicts with the overhead of that process.)*

---

### [SUBTLE2-6] Least-Privilege Network Rules vs. Broad Operational Access
All security group and firewall rules must follow least-privilege: permit only the minimum required ports and CIDR ranges. Reject any rule that allows `0.0.0.0/0` on non-public-facing resources.

All internal compute resources must be reachable from the operations team's aggregated IP range on all ports to support rapid log collection, debugging, and emergency access during incidents.

*(Domain inference required: "all ports from ops CIDR" fails the least-privilege requirement for security group rules regardless of the source CIDR.)*

---

### [SUBTLE2-7] Locked Provider Version vs. Always-Latest
Lock the Terraform provider version in every root module using `required_providers` with an exact version string to guarantee consistent `plan`/`apply` behaviour across all environments and engineers.

Always use the latest stable provider version — provider updates frequently include critical bug fixes, new resource attributes, and compliance-required configuration options.

*(Domain inference required: exact version locking and "always use latest" are mutually exclusive states.)*

---

### [SUBTLE2-8] Blue-Green Deployment vs. Single Authoritative Database
All production services must support blue-green deployment with zero-downtime switchover and the ability to roll back the application tier without data loss.

Each service must maintain a single authoritative database instance — no service may connect to more than one database simultaneously to avoid data synchronisation complexity.

*(Domain inference required: blue-green deployments during schema migrations require both environments to share or simultaneously reference the same database, or run separate instances — the latter violates the single-database constraint.)*

---

### [SUBTLE2-9] Drift Detection with Auto-Remediation vs. Emergency Console Override
Configure continuous drift detection to alert on and auto-remediate any resource change made directly to cloud infrastructure outside of the IaC pipeline.

Operations engineers with appropriate IAM permissions may make emergency changes directly via the cloud console during active incidents without waiting for a pipeline run — these changes must not be rolled back automatically.

*(Domain inference required: auto-remediation of drift reverts manual changes, directly conflicting with the stated exemption for emergency console changes.)*

---

### [SUBTLE2-10] EU Data Residency vs. Global Active-Active Replication
All customer personal data must remain within the EU data-residency boundary at all times — no data may be replicated, cached, or processed outside of EU-region cloud infrastructure.

All production services must implement multi-region active-active architecture with data replicated globally to meet the 99.99% availability SLA committed to enterprise customers.

*(Domain inference required: global data replication necessarily moves customer data outside the EU boundary, violating the data-residency requirement.)*

---

### [SUBTLE2-11] Cost Predictability Gates vs. Granular Tagging Coverage
Estimate and bound infrastructure costs before every merge — reject any IaC change that introduces unbounded or unpredictable per-unit cost scaling.

Enable detailed cost-allocation tags on every resource, including ephemeral and auto-scaled resources, to ensure full per-team and per-feature cost attribution at all times.

*(Domain inference required: requiring tags on all auto-scaled and ephemeral resources incentivises provisioning many small tagged resources, which can introduce the unbounded cost scaling the first rule prohibits.)*

---

### [SUBTLE2-12] Zero-Downtime Apply vs. Terraform Resource Replacement
IaC changes must be applied with zero downtime — any change that causes service interruption must be restructured to use a rolling or blue-green approach before being merged.

When Terraform marks a resource as requiring replacement (destroy then recreate), allow the replace to proceed rather than restructuring the code to perform an in-place update — replacing resources guarantees a clean, drift-free state.

*(Domain inference required: Terraform resource replacement involves destroying then recreating the resource, causing downtime for stateful services — directly violating the zero-downtime requirement.)*
