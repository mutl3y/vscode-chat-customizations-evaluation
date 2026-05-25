---
name: cicd-pipeline-reviewer
description: Reviews CI/CD pipeline configurations and workflow files for correctness, security, and operational reliability before merge.
---

# CI/CD Pipeline Review

Use this skill to evaluate GitHub Actions workflows, GitLab CI configurations, and other pipeline definition files before they are merged.

> **Test metadata:** 20 injected ambiguities (AMBIG2-1 through AMBIG2-20).
> Each numbered instruction below contains at least one term or phrase where a model could take
> clearly different concrete actions depending on interpretation.
> Expected analyzer category: `ambiguity` for all 20.

## Review Instructions

**[AMBIG2-1] Job Duration Threshold**
Flag any pipeline job that takes too long to complete and recommend optimisation strategies to improve it.

**[AMBIG2-2] Flaky Test Handling**
When flaky tests are detected in the pipeline results, recommend an appropriate remediation strategy for the team.

**[AMBIG2-3] Secret Management**
Verify that all sensitive values referenced in the pipeline are handled properly throughout the workflow.

**[AMBIG2-4] Dependency Caching**
Evaluate whether the pipeline makes effective use of caching for its dependencies given its execution frequency.

**[AMBIG2-5] Trigger Configuration**
Confirm that the pipeline is triggered under the right conditions to match the team's intended workflow.

**[AMBIG2-6] Parallelisation Opportunity**
Identify any jobs that could meaningfully benefit from running in parallel and suggest how to restructure the pipeline.

**[AMBIG2-7] Failure Notification**
Confirm that the team receives timely notification when a pipeline fails.

**[AMBIG2-8] Deployment Target Validation**
Verify that the pipeline deploys to the correct environment given the branch or event that triggered it.

**[AMBIG2-9] Self-Hosted Runner Risk**
Assess whether any use of self-hosted runners introduces an unacceptable risk level for this type of workflow.

**[AMBIG2-10] Test Coverage Gate**
Block merges when test coverage falls below an acceptable threshold for this project.

**[AMBIG2-11] Artifact Retention Period**
Ensure that build and test artifacts are retained for an appropriate length of time.

**[AMBIG2-12] Approval Gate Placement**
Determine where in the pipeline a manual approval gate should be positioned for production deployments.

**[AMBIG2-13] Base Image Freshness**
Flag any pipeline step that uses an outdated base image in its container definition.

**[AMBIG2-14] Rollback Capability**
Confirm that the pipeline supports a sufficiently fast rollback path in the event of a failed deployment.

**[AMBIG2-15] Compute Cost Efficiency**
Evaluate whether the pipeline makes reasonable use of compute resources to keep pipeline running costs under control.

**[AMBIG2-16] Matrix Build Configuration**
Advise on whether the matrix build strategy is configured appropriately for the breadth of target environments.

**[AMBIG2-17] Environment Variable Scope**
Check that environment variables are scoped at the appropriate level across jobs and steps in the pipeline.

**[AMBIG2-18] Pipeline Documentation**
Ensure that complex or non-obvious pipeline logic is documented sufficiently for future maintainers to understand.

**[AMBIG2-19] Concurrency Controls**
Advise whether the pipeline needs concurrency controls to prevent conflicting simultaneous executions.

**[AMBIG2-20] Post-Deployment Verification**
Confirm that the pipeline includes sufficient post-deployment checks after a release to detect regressions promptly.
