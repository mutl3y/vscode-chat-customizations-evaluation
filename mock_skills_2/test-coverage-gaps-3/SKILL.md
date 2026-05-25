---
name: database-backup-auditor
description: Audits database backup configurations, recovery procedures, and data durability posture for production database systems.
---

# Database Backup & Recovery Auditor

Use this skill to evaluate database backup strategies and validate recovery readiness across all production database systems in scope.

> **Test metadata:** 15 injected coverage gaps (GAP3-1 through GAP3-15).
> These are SILENT gaps — the skill provides no guidance for these scenarios.
>
> | Gap | Scenario | Expected impact if missed | Severity |
> |---|---|---|---|
> | GAP3-1 | Database has no backup configuration at all | Audit produces misleading "no findings" output | CRITICAL |
> | GAP3-2 | Backup destination in the same region as the source database | Single-region failure destroys both source and backup simultaneously | HIGH |
> | GAP3-3 | Backup job has been silently failing for weeks | Weeks of data loss exposure undetected until an incident | CRITICAL |
> | GAP3-4 | Recovery procedure has never been tested against production data | Documented RTO/RPO values are fictional; actual restore time unknown | HIGH |
> | GAP3-5 | Point-in-time recovery window shorter than the RTO commitment | Cannot recover to the correct moment before the incident | HIGH |
> | GAP3-6 | Backup is encrypted but the key is managed by the same cloud account | Account compromise or key deletion loses both data and backup | HIGH |
> | GAP3-7 | Database exceeds 10 TB — full backup exceeds the nightly window | Backup never completes; only a partial snapshot is captured | HIGH |
> | GAP3-8 | Logical backup used where physical restore speed is required | Logical restore takes hours; undocumented against RTO requirement | HIGH |
> | GAP3-9 | Read replica promoted as a backup substitute | Replica lag means data loss at the moment of promotion | HIGH |
> | GAP3-10 | Backup file includes credentials or secrets in plaintext | Backup compromise exposes production authentication credentials | CRITICAL |
> | GAP3-11 | Schema-only backup with no data, or data-only with no schema | Neither backup alone is independently restorable | HIGH |
> | GAP3-12 | Retention period is compliant but the purge job is misconfigured | Backups accumulate indefinitely; storage costs escalate unexpectedly | MEDIUM |
> | GAP3-13 | Backup taken from database version N, restore target is version N+2 | Version incompatibility causes restore failure or data corruption | HIGH |
> | GAP3-14 | Sharded database — shard backups are not time-coordinated | Restoring shards to inconsistent points-in-time across the cluster | HIGH |
> | GAP3-15 | Backup audit log not retained | Compliance team cannot prove a backup was ever performed | MEDIUM |

## Audit Process

### Step 1: Backup Configuration Review
Document the backup configuration for each database in scope:
- Backup type (full, incremental, differential, logical, physical, snapshot)
- Backup frequency and schedule (cron expression or equivalent)
- Backup destination, region, and storage class
- Retention period and automated purge policy
- Encryption configuration at rest and in transit

### Step 2: Recovery Objective Validation
Verify that the configured backup strategy can meet the organisation's declared RTO (Recovery Time Objective) and RPO (Recovery Point Objective):
- Confirm the maximum data loss window implied by the backup frequency is within the declared RPO
- Estimate the restoration time for the current backup type and database size and compare it against the declared RTO

### Step 3: Backup Integrity Monitoring
Verify that backup integrity is actively monitored on an ongoing basis:
- Confirm backup completion status is checked and alerted after every scheduled run
- Confirm backup files are verified (via checksum validation or test-restore) at least monthly
- Confirm alerts are configured to fire for any backup job failure

### Step 4: Compliance and Retention Verification
Verify that backup retention satisfies regulatory and contractual obligations:
- Confirm the minimum retention period required by applicable data regulations
- Confirm backups are protected against deletion (immutable storage or object lock) for the required retention period
- Confirm that access to backup storage is logged and those access logs are themselves retained

### Step 5: Findings Report
Summarise findings with a compliance status for each audit criterion. Flag any gap between the documented backup posture and the verified actual configuration, with an assessed severity and a specific remediation action.

## Scope
This skill audits the backup configuration of **directly managed production databases** listed in the provided inventory. Managed database services, read replicas, analytics copies, and staging databases are out of scope unless explicitly listed in the inventory.
