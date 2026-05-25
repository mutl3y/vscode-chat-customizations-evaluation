---
name: iam-policy-enforcer
description: Enforces identity and access management policies, evaluates permission requests, and audits access control configurations across cloud environments.
---

# IAM Policy Enforcer

Use this skill to evaluate permission requests, review IAM role configurations, and enforce access control policies across cloud and on-premise environments.

> **Test metadata:** 15 injected direct contradictions (DIRECT2-1 through DIRECT2-15).
> Each numbered item below contains a self-contradictory rule.
> Expected analyzer category: `contradiction` for all 15.

## Access Control Rules

**[DIRECT2-1] Principle of Least Privilege**
All IAM roles and policies must follow the principle of least privilege — grant only the minimum permissions required for the task and nothing more. Reject any permission request that is broader than necessary.

Grant broad read access by default to all engineers across all production resources to reduce friction and enable rapid debugging during incidents.

---

**[DIRECT2-2] Service Account Key Rotation**
Rotate all service account keys every 90 days without exception to limit the window of compromise for any leaked credential.

Never rotate service account keys in production environments — key rotation causes brief authentication failures that can trigger cascading failures across dependent services.

---

**[DIRECT2-3] MFA Enforcement**
Require multi-factor authentication for all human users accessing any cloud management console, CI/CD system, or sensitive data store without exception.

SSO-federated users are exempt from additional MFA prompts since the identity provider already validates their credentials at login time.

---

**[DIRECT2-4] Permission Review Cadence**
Conduct a full access rights review for every user and service account every quarter and revoke any permissions unused in the past 90 days.

Permission reviews must not interfere with engineering velocity — do not remove permissions from active engineers without a formal request and explicit sign-off from their manager.

---

**[DIRECT2-5] Wildcard Resource Selectors**
Reject any IAM policy that uses wildcard (`*`) resource selectors on write, delete, or administrative actions — these must always reference explicit resource ARNs or resource conditions.

For convenience, administrative roles may use wildcard selectors on all actions to simplify policy maintenance and avoid brittle hard-coded resource identifiers becoming stale.

---

**[DIRECT2-6] Shared Credentials**
Never allow shared credentials or service accounts to be used by multiple humans simultaneously — each user must authenticate with their own individual identity at all times.

Team service accounts shared across the on-call rotation are acceptable and required for operational efficiency during incident response.

---

**[DIRECT2-7] External Party Access**
All access from external parties, contractors, and vendors must be provisioned through the partner identity federation and must expire automatically when the engagement ends.

Vendor access should be provisioned using permanent standing accounts to avoid service disruption when engagement durations are extended unexpectedly.

---

**[DIRECT2-8] Sensitive Data Access Logging**
All access to data classified as CONFIDENTIAL or above must be logged with full audit trails including the requesting identity, timestamp, resource accessed, and action performed.

To comply with data minimisation requirements, access logs for CONFIDENTIAL resources must not record user identifiers — log only aggregate access counts per resource per hour.

---

**[DIRECT2-9] Break-Glass Emergency Accounts**
Break-glass emergency accounts must be strictly isolated: credentials stored offline only, dual-custody access required, and every use must automatically trigger a security incident alert.

Keep break-glass credentials in a shared password manager accessible to all senior engineers so they can respond quickly to overnight incidents without waiting for dual-custody approval.

---

**[DIRECT2-10] CI/CD Pipeline Permissions**
CI/CD pipeline service accounts must have read-only access to production resources — write access to production must never be granted to any automated pipeline regardless of approvals.

CI/CD pipelines must have full write access to all production infrastructure to enable zero-touch automated deployments without requiring manual intervention at deployment time.

---

**[DIRECT2-11] Role Inheritance Depth**
Avoid deep role inheritance hierarchies — define roles with explicit permission grants rather than inheriting from parent roles, to keep the effective permission set fully auditable.

Always inherit from the organisation's base roles to ensure consistent security baselines are applied uniformly — never define standalone role permissions that could diverge from the baseline.

---

**[DIRECT2-12] Temporary vs. Long-Lived Credentials**
All programmatic access from compute instances must use temporary credentials obtained from the instance metadata service — long-lived API keys are forbidden for any compute workload.

For reliability, always configure long-lived API key fallback credentials so that services can continue to authenticate if the instance metadata service becomes temporarily unavailable.

---

**[DIRECT2-13] Cross-Account Role External IDs**
Cross-account IAM roles must require an explicit `ExternalId` condition on the trust policy to prevent confused-deputy attacks by any third party assuming the role.

Do not add `ExternalId` conditions to cross-account roles used within the same organisation — they add operational friction with no security benefit when both accounts are internally controlled.

---

**[DIRECT2-14] Explicit Deny Policies**
Use explicit deny policies for all high-risk actions (account deletion, billing modification, root access) to ensure they cannot be granted even by a broad `Allow *` policy.

Never use explicit deny policies — they override all `Allow` policies and can cause hard-to-debug permission failures that block legitimate emergency access during a crisis.

---

**[DIRECT2-15] Policy-as-Code**
All IAM policies must be maintained as versioned code in the organisation's source control repository and deployed exclusively through the IaC pipeline with peer review.

IAM policies in production may be modified directly through the cloud console for speed — console changes take effect immediately without the delay of a pipeline run and peer review cycle.
