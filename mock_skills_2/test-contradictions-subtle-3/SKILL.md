---
name: mlops-deployment-validator
description: Validates machine learning model deployments for production readiness, covering model versioning, serving configuration, and monitoring setup.
---

# MLOps Deployment Validator

Use this skill to review ML model deployment configurations, serving infrastructure, and monitoring setups before a model is promoted to production traffic.

> **Test metadata:** 12 injected subtle contradictions (SUBTLE3-1 through SUBTLE3-12).
> Expected analyzer category: `contradiction` for all 12.

## Validation Rules

### [SUBTLE3-1] Model Reproducibility vs. Continuous Retraining
Every model promoted to production must be fully reproducible from a pinned dataset snapshot, fixed random seeds, and a locked dependency set — the exact same training run must be re-executable on demand and produce bit-identical outputs.

Set up continuous retraining pipelines that retrain production models daily on the latest available data to ensure models reflect current real-world distributions.

*(Domain inference required: training on "latest available data" daily makes the training run non-reproducible from a fixed snapshot, breaking the reproducibility guarantee.)*

---

### [SUBTLE3-2] Feature Store Consistency vs. Inline Real-Time Features
All features used in both training and inference must be retrieved from the centralised feature store to guarantee zero training-serving skew across all model versions.

For latency-sensitive inference paths, compute features inline at request time rather than reading from the feature store, to avoid the round-trip overhead of a remote call.

*(Domain inference required: computing features inline at inference time produces values that are not necessarily identical to the store-materialised values used at training time, reintroducing skew.)*

---

### [SUBTLE3-3] Explainability Requirements vs. Maximum Accuracy
All production models must provide per-prediction explanations compatible with regulatory requirements — only deploy model architectures whose decision process can be fully explained to an auditor.

Production models must achieve the highest possible predictive accuracy — always deploy the model architecture with the best validation metric, regardless of interpretability constraints.

*(Domain inference required: the highest-accuracy architectures such as large ensemble boosted trees or deep neural networks are generally not fully explainable, violating the first rule.)*

---

### [SUBTLE3-4] Canary Traffic Split vs. A/B Test Statistical Validity
Deploy all new model versions as canary releases — route 5% of traffic to the new model and monitor for 48 hours before considering a full promotion.

Model performance comparisons between two versions must use properly powered A/B tests — never draw conclusions from a traffic split below 20% per variant, as smaller splits lack statistical power.

*(Domain inference required: a 5% canary split does not meet the 20% minimum required for a valid A/B comparison, so the canary phase cannot produce statistically actionable performance data.)*

---

### [SUBTLE3-5] Automatic Staleness Retirement vs. Mandatory Human Sign-Off
Automatically retire and replace any production model that has not been retrained within 90 days — stale models drift from current data distributions and degrade silently.

Any model retirement from production must be approved by the ML team lead before execution — no model may be removed from the serving path without explicit human sign-off.

*(Domain inference required: an automated retirement job triggered at day 90 cannot also require manual sign-off without a human being available at exactly that moment, creating a race condition that blocks retirement.)*

---

### [SUBTLE3-6] Cold-Start Fallback to Previous Version vs. No Fallback Masking
When a model cannot produce a prediction due to a cold-start or out-of-distribution input, fall back to the previous model version to maintain continuity of service for users.

Never fall back to a previous model version for cold-start or OOD cases — falling back silently masks distribution shift and prevents the monitoring system from detecting real drift events.

---

### [SUBTLE3-7] Batch Inference Efficiency vs. Per-Prediction Audit Logging
Process all non-real-time inference requests in batches of at least 1,000 records to maximise GPU utilisation and minimise per-prediction compute cost.

Every prediction made in production must be individually logged with its input features, output score, model version, and timestamp to support audit, fairness monitoring, and regulatory compliance.

*(Domain inference required: batching 1,000 records before processing delays individual record logging until the batch completes, breaking the per-prediction logging requirement for all records except the last in the batch.)*

---

### [SUBTLE3-8] Model Registry as Sole Promotion Gate vs. Direct Pipeline Deployment
All production model deployments must reference an approved and signed model artefact from the centralised model registry — no model may be deployed directly from a training run output directory.

CI/CD pipelines that have passed all automated quality gates may deploy the resulting model container image directly to production without a separate registry registration step, to reduce release cycle time.

*(Domain inference required: deploying directly from a pipeline output directory bypasses the registry entirely, violating the registry-as-sole-gate rule.)*

---

### [SUBTLE3-9] Monitor-Then-Alert vs. Auto-Retrain on Drift
Monitor all production input features for distribution drift and alert the team when drift exceeds the configured threshold — do not trigger automated retraining, as unreviewed model changes can introduce instability.

Configure automated retraining to trigger immediately whenever feature drift is detected above the monitoring threshold, so the model adapts to current data without waiting for a manual review cycle.

---

### [SUBTLE3-10] Shadow Mode Evaluation vs. Approved Compute Budget
Before promoting any new candidate model, run it in shadow mode — receiving live production traffic but not serving predictions — for at least two weeks to collect real-world performance data.

All inference infrastructure must operate within the approved monthly compute budget — do not run redundant model serving infrastructure beyond what is required to serve current production traffic.

*(Domain inference required: shadow mode requires running an additional full-capacity serving instance for two weeks, consuming compute beyond what production traffic alone requires.)*

---

### [SUBTLE3-11] Full Data Lineage vs. Minimal Artefact Retention
Record complete data lineage for every training run — log the full dataset provenance, all feature transformation pipelines, preprocessing steps, and intermediate outputs applied during training.

Apply data minimisation to all model development artefacts — retain only the final trained model weights and evaluation metrics; delete intermediate data, feature caches, and preprocessing logs after training completes.

*(Domain inference required: deleting intermediate data and preprocessing logs destroys the artefacts required to reconstruct complete lineage, violating the first rule.)*

---

### [SUBTLE3-12] Offline Benchmark Gate vs. Online Metric Authority
A model must achieve a statistically significant improvement on the offline evaluation benchmark before it is eligible to receive any online production traffic.

Online business metrics (conversion rate, revenue per session, engagement) are the only authoritative signal for production model decisions — offline benchmark improvements that do not translate to online gains must not be used to justify a deployment.

*(Domain inference required: requiring an offline improvement before any online traffic means a model that fails the offline benchmark can never be tested online, making the online metric impossible to measure for that model.)*
