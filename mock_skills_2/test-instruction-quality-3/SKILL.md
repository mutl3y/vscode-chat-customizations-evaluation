---
name: cloud-cost-optimizer
description: Analyzes cloud infrastructure spend, identifies cost inefficiencies, and recommends optimization strategies across AWS, Azure, and GCP.
---

# Cloud Cost Optimizer

Use this skill to analyze cloud infrastructure costs and produce a prioritised list of actionable savings recommendations.

> **Test metadata:** 15 injected instruction quality issues (QUALITY3-1 through QUALITY3-15).
>
> | Label | Pattern | Expected analyzer category |
> |---|---|---|
> | QUALITY3-1 | "try to identify" — weak directive | ambiguity (unclear obligation) |
> | QUALITY3-2 | "should flag" — soft obligation | ambiguity |
> | QUALITY3-3 | "might consider reviewing" — too soft | ambiguity |
> | QUALITY3-4 | Double negative: "not unimportant unless not in scope" | cognitive_load |
> | QUALITY3-5 | Passive voice obscures owner: "will be reviewed" | ambiguity |
> | QUALITY3-6 | Hedged example: "something like Reserved Instances, or maybe Savings Plans" | ambiguity |
> | QUALITY3-7 | Delegates to model: "use judgment on materiality threshold" | ambiguity |
> | QUALITY3-8 | Undefined escalation target: "appropriate stakeholders" | ambiguity |
> | QUALITY3-9 | "consider whether relevant" without decision criteria | ambiguity |
> | QUALITY3-10 | Over-specifies cosmetics: exact column widths in the output table | over-specification |
> | QUALITY3-11 | Dead instruction: "include EC2-Classic pricing" (EC2-Classic retired 2022) | dead-instruction |
> | QUALITY3-12 | Hedge stack: "in certain situations it may sometimes potentially be worth" | ambiguity |
> | QUALITY3-13 | Competing scope: be concise vs. include full line-item breakdown | contradiction |
> | QUALITY3-14 | Prerequisite stated after dependent step | cognitive_load |
> | QUALITY3-15 | "it depends on the context" without specifying what context | ambiguity |

## Analysis Instructions

### [QUALITY3-1] Idle Resource Detection
Try to identify compute instances, containers, and managed services that are running but have been consistently under-utilised throughout the analysis period.

---

### [QUALITY3-2] Reserved Instance Coverage
The analysis should flag any compute workloads running on on-demand pricing where Reserved Instance or Savings Plan coverage would produce a meaningful cost reduction.

---

### [QUALITY3-3] Data Transfer Costs
You might consider reviewing cross-region and cross-availability-zone data transfer charges as a potential area for cost reduction.

---

### [QUALITY3-4] Tagging Compliance Scope
Resource optimisation opportunities that are not unimportant unless they are not excluded from the cost-allocation tagging policy scope should be included in the findings report.

---

### [QUALITY3-5] Recommendation Review Process
All cost optimisation recommendations will be reviewed by the FinOps team before any implementation begins.

---

### [QUALITY3-6] Commitment-Based Discounts
Consider commitment-based discount instruments such as something like Reserved Instances or maybe Savings Plans, or possibly Committed Use Discounts, depending on the cloud provider in use.

---

### [QUALITY3-7] Materiality Threshold
Use your best judgment to determine what level of potential monthly saving is worth surfacing as a finding versus filtering out as noise.

---

### [QUALITY3-8] High-Risk Recommendations
If a recommendation carries meaningful operational risk, escalate it to the appropriate stakeholders before including it in the published report.

---

### [QUALITY3-9] Storage Tiering Analysis
Consider whether storage lifecycle tiering recommendations are relevant for the storage services included in this analysis.

---

### [QUALITY3-10] Output Table Formatting
Format the findings table with columns of exactly: 20 characters wide for "Resource", 15 characters wide for "Current Monthly Cost", 15 characters wide for "Optimised Cost", and 10 characters wide for "Saving %".

---

### [QUALITY3-11] Legacy Instance Pricing
Include a dedicated section analysing EC2-Classic instance pricing for any workloads that may still be operating in the classic networking environment and have not yet been migrated to VPC.

---

### [QUALITY3-12] Spot and Preemptible Instance Suitability
In certain situations it may sometimes potentially be worth evaluating whether some batch or stateless workloads could be migrated to run on Spot or Preemptible instances.

---

### [QUALITY3-13] Executive Summary
Produce a concise one-paragraph executive summary at the top of the report covering total potential savings and top three recommendations only.

The report must include a full itemised cost breakdown for every resource analysed, with line-by-line detail of current spend, projected optimised spend, implementation complexity rating, and risk rating.

---

### [QUALITY3-14] Multi-Cloud Analysis Execution
Run the cost analysis across all cloud providers in scope and produce consolidated cross-cloud findings in a single report.

*Note: Before running the analysis, first collect current billing exports from AWS Cost Explorer, Azure Cost Management, and GCP Billing Console in CSV format, covering the same time range as the analysis period.*

---

### [QUALITY3-15] Optimisation Priority Ordering
Whether to sort findings by absolute dollar saving, percentage cost reduction, or implementation effort depends on the context.
