---
name: contract-reviewer
description: Reviews commercial contracts, vendor agreements, and NDAs for legal risk, unfair terms, and missing standard protections before signing.
---

# Commercial Contract Reviewer

Use this skill to evaluate draft contracts and vendor agreements for legal risk, missing protections, and terms that require negotiation before execution.

> **Test metadata:** 12 injected subtle contradictions (SUBTLE4-1 through SUBTLE4-12).
> Each section contains a contradiction that requires domain inference to detect — the rules don't
> use opposite words but their practical implications are mutually exclusive.
> Expected analyzer category: `contradiction` for all 12.

## Review Guidelines

### [SUBTLE4-1] Governing Law vs. Exclusive Jurisdiction Forum
Always verify that the governing law clause specifies a jurisdiction whose commercial contract law is well-developed and favourable to our standard terms.

All contracts must include an exclusive jurisdiction clause naming our home-state courts as the sole forum for any dispute arising under the agreement.

*(Domain inference required: choosing a specific home-state exclusive forum may force courts to apply their own forum law rather than the chosen governing law, since many jurisdictions assert primacy of forum law in exclusive-jurisdiction proceedings.)*

---

### [SUBTLE4-2] Limiting Indemnity Exposure vs. Mutual Indemnity
Negotiate to remove any broad indemnity clause that would expose the company to unlimited liability for third-party claims arising from the counterparty's use of our products or services.

Always insist on mutual indemnity provisions — any indemnity obligation we accept must be mirrored by an equivalent obligation on the counterparty's side.

*(Domain inference required: if we successfully remove the counterparty's broad indemnity claim against us, a mutual indemnity clause means they can require us to remove our equivalent claim against them.)*

---

### [SUBTLE4-3] Perpetual NDA Terms vs. Trade Secret Protection
Reject any NDA that imposes a perpetual confidentiality obligation — perpetual terms are unenforceable in many jurisdictions and create unreasonable open-ended exposure.

For agreements involving our core trade secrets and proprietary algorithms, insist on confidentiality obligations that survive termination of the agreement indefinitely.

*(Domain inference required: indefinitely surviving confidentiality for trade secrets is functionally perpetual, which the first rule states we must reject.)*

---

### [SUBTLE4-4] Liability Cap vs. Uncapped Carve-Outs for Misconduct
Always negotiate a total liability cap limiting our exposure under any agreement to the fees paid in the preceding 12-month period.

Ensure that liability limitations are carved out for fraud, wilful misconduct, and gross negligence — these categories must remain uncapped in all agreements.

*(Domain inference required: if the counterparty insists on symmetrical uncapped carve-outs for our fraud and wilful misconduct, the practical effect is the elimination of our liability cap for the highest-value claim scenarios.)*

---

### [SUBTLE4-5] IP Assignment vs. Vendor Background IP Retention
Ensure all agreements with contractors and vendors include IP assignment clauses transferring ownership of all created materials to our organisation.

Vendor agreements must not include IP assignment clauses that capture the vendor's pre-existing tools, frameworks, or background intellectual property — vendors must retain ownership of their foundational assets.

*(Domain inference required: a blanket IP assignment clause necessarily sweeps in materials built on vendor background IP; a narrow carve-out requires defining the boundary, which is often disputed.)*

---

### [SUBTLE4-6] Auto-Renewal Clauses vs. Service Continuity
Reject all auto-renewal provisions — they create unexpected financial commitments that require active contract management to monitor and cancel.

For business-critical services, insist on automatic renewal provisions that maintain uninterrupted service without requiring affirmative annual action from either party.

---

### [SUBTLE4-7] Termination for Convenience vs. Minimum Commitment Period
Always negotiate the right to terminate for convenience with 30 days' notice and no financial penalty — this preserves commercial flexibility as circumstances change.

Vendor agreements must include a minimum commitment period of at least 12 months to secure volume pricing and ensure the vendor allocates sufficient resources to the engagement.

*(Domain inference required: a 30-day termination for convenience right within a 12-month minimum commitment period defeats the minimum commitment entirely.)*

---

### [SUBTLE4-8] Data Processing Authorisation vs. Data Processing Prohibition
Ensure all vendor agreements include a Data Processing Addendum (DPA) authorising the vendor to process personal data on our behalf in compliance with applicable privacy law.

Include a clause explicitly prohibiting the counterparty from accessing, storing, or processing any personal data belonging to our customers or employees.

*(Domain inference required: a DPA authorising data processing and a prohibition on data processing cannot both validly apply to the same data simultaneously.)*

---

### [SUBTLE4-9] Broad Audit Rights vs. Counterparty Confidentiality
Include comprehensive audit rights allowing us — or our designated third-party auditors — to inspect the vendor's systems, processes, and financial records at any time to verify compliance.

Include robust confidentiality protections preventing either party from disclosing the other's internal processes, pricing arrangements, and operational information to any third party.

*(Domain inference required: exercising third-party audit rights necessarily exposes the vendor's confidential operational information to the auditor, which a reciprocal confidentiality clause would prohibit.)*

---

### [SUBTLE4-10] SLA Service Credits vs. Credits as Sole Remedy
Include service credit provisions entitling us to financial credits when uptime falls below the guaranteed service level threshold.

Negotiate that SLA service credits constitute the sole and exclusive remedy for any and all service level failures — accepting credits as sole remedy waives the right to claim further damages.

*(Domain inference required: accepting "sole remedy" language means that when a prolonged outage causes actual damages far exceeding the credit value, no additional claim can be brought.)*

---

### [SUBTLE4-11] Non-Solicitation Clause vs. Open Hiring Policy
Include a mutual non-solicitation clause preventing both parties from directly soliciting or hiring each other's employees for 12 months following termination of the agreement.

The company maintains an open hiring policy and will not agree to any contractual clause that restricts its ability to recruit freely from the available talent market.

---

### [SUBTLE4-12] Fixed-Price Commitment vs. Annual CPI Adjustment
Negotiate fully fixed pricing for the entire contract term — reject any provision that permits the counterparty to adjust fees without renegotiation.

Include a standard annual price adjustment clause allowing fees to increase in line with the official consumer price index to protect the vendor against inflation-driven margin erosion over a multi-year term.
