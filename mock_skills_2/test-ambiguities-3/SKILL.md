---
name: kubernetes-resource-advisor
description: Reviews Kubernetes resource configurations, RBAC policies, and workload manifests for production readiness and operational best practices.
---

# Kubernetes Resource Advisor

Use this skill to evaluate Kubernetes manifests, RBAC configurations, and cluster resource settings before workloads are deployed to production clusters.

> **Test metadata:** 20 injected ambiguities (AMBIG3-1 through AMBIG3-20).
> Expected analyzer category: `ambiguity` for all 20.

## Review Instructions

**[AMBIG3-1] Resource Request Sizing**
Ensure all containers have resource requests that are appropriately sized for their expected workload profile.

**[AMBIG3-2] Replica Count**
Verify that the replica count for each Deployment is suitable for the level of availability the service requires.

**[AMBIG3-3] Rolling Update Strategy**
Confirm that the rolling update strategy is configured in a way that balances availability with deployment speed.

**[AMBIG3-4] Secret Handling**
Check that Kubernetes Secrets are handled in a secure and appropriate manner given the sensitivity of the data they contain.

**[AMBIG3-5] Namespace Isolation**
Assess whether the workload's namespace isolation is adequate given the cluster's multi-tenancy requirements.

**[AMBIG3-6] Ingress Rules**
Verify that ingress rules are configured correctly for the expected traffic patterns and access control requirements.

**[AMBIG3-7] Service Account Permissions**
Confirm that the service account bound to each workload has permissions that are appropriate to its function.

**[AMBIG3-8] Pod Security Context**
Verify that the pod security context is appropriately restrictive for the risk profile of the workload.

**[AMBIG3-9] Health Probe Timing**
Ensure that liveness and readiness probe timings are tuned appropriately for this workload's startup and steady-state response characteristics.

**[AMBIG3-10] HPA Scaling Threshold**
Confirm that the Horizontal Pod Autoscaler scaling threshold is set at a level that maintains acceptable performance under load.

**[AMBIG3-11] Node Affinity Configuration**
Verify that node affinity and anti-affinity rules are configured in a way that is suitable for this workload's placement requirements.

**[AMBIG3-12] PodDisruptionBudget**
Ensure that a PodDisruptionBudget is configured to maintain adequate service continuity during voluntary node disruption.

**[AMBIG3-13] Logging Verbosity**
Assess whether the workload's logging verbosity is reasonable for a production environment.

**[AMBIG3-14] Image Pull Policy**
Confirm that the image pull policy is set appropriately for the deployment frequency and target environment.

**[AMBIG3-15] ConfigMap Change Visibility**
Verify that ConfigMaps are versioned or referenced in a way that makes configuration changes visible and traceable by operators.

**[AMBIG3-16] Ephemeral Storage Limits**
Check whether ephemeral storage limits are appropriate for this type of workload's log and temporary file usage.

**[AMBIG3-17] Init Container Behaviour**
Verify that init container behaviour is appropriate given the initialisation requirements of the application.

**[AMBIG3-18] Priority Class Assignment**
Confirm that the workload is assigned a PriorityClass that is appropriate relative to other workloads in the same cluster.

**[AMBIG3-19] Network Policy Scope**
Assess whether network policies are necessary and, if so, whether the current scope and rules are appropriate for this workload.

**[AMBIG3-20] Termination Grace Period**
Ensure that the termination grace period is configured to allow the workload to shut down cleanly without dropping in-flight requests.
