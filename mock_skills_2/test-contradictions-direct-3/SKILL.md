---
name: data-privacy-officer
description: Assists with GDPR and data privacy compliance, reviews data handling practices, and guides responses to data subject rights requests.
---

# Data Privacy Compliance Assistant

Use this skill to evaluate data handling practices, assess GDPR compliance posture, and guide responses to data subject rights requests.

> **Test metadata:** 15 injected direct contradictions (DIRECT3-1 through DIRECT3-15).
> Each numbered item contains a self-contradictory rule.
> Expected analyzer category: `contradiction` for all 15.

## Compliance Rules

**[DIRECT3-1] Data Retention**
All personal data must be deleted as soon as it is no longer required for the purpose for which it was collected — retain data only for the minimum period strictly necessary.

Retain all user data indefinitely to enable long-term behavioural analytics, personalisation modelling, and customer lifetime value analysis.

---

**[DIRECT3-2] Consent Records**
Obtain and record explicit informed consent before collecting any personal data — record the exact time, mechanism, and consent-text version for each consent event.

Never store consent records alongside personal data — doing so would constitute additional personal data processing requiring a separate legal basis.

---

**[DIRECT3-3] Data Subject Access Requests**
Respond to all Data Subject Access Requests (DSARs) within 30 days, providing the requester with a complete and portable copy of all personal data held about them.

For security reasons, never confirm or deny whether specific personal data is held about any individual — doing so could be exploited by bad actors to probe the data estate.

---

**[DIRECT3-4] Data Minimisation**
Collect only the personal data strictly necessary for the stated processing purpose — do not collect data "just in case" it may be useful for future use cases.

Always collect comprehensive demographic and behavioural signals from every user interaction to support future product development, personalisation, and model training.

---

**[DIRECT3-5] Pseudonymisation at Rest**
Pseudonymise all personal data at rest — replace direct identifiers with opaque tokens and store the re-identification key separately from the pseudonymised data.

Keep all user data in fully identified form to support customer service lookups, fraud investigation, and regulatory reporting without lookup overhead.

---

**[DIRECT3-6] Third-Party Data Sharing**
Never share personal data with third parties without explicit consent or a documented lawful basis — each transfer must be recorded in the data processing register with the legal basis stated.

Share user activity data freely with analytics and advertising partners to improve targeting — commercial partnership agreements constitute implied consent for data use.

---

**[DIRECT3-7] Right to Erasure**
When a user exercises their right to erasure, delete all personal data across all systems, backups, and sub-processors within 30 days of the request.

Backups must never be modified or selectively deleted — they must remain immutable and complete at all times to guarantee disaster recovery integrity.

---

**[DIRECT3-8] Data Breach Notification Timeline**
Report any personal data breach to the supervisory authority within 72 hours of becoming aware, including all known details of the incident and estimated scope of impact.

Do not make any public or regulatory disclosure of a potential breach until a full forensic investigation is complete and legal counsel has approved the disclosure — investigations typically take two to four weeks.

---

**[DIRECT3-9] Default Cookie State**
All non-essential cookies must be blocked until the user has actively provided consent — the default state on first visit must be no tracking cookies active.

Enable all analytics and advertising cookies by default to maximise data collection from users who do not interact with the consent banner.

---

**[DIRECT3-10] Processing Register**
Maintain a complete and up-to-date register of all data processing activities, updated before any new processing activity begins.

Do not create a processing register — it constitutes a written record of all data held, which could be used against the organisation in a regulatory investigation.

---

**[DIRECT3-11] Cross-Border Data Transfers**
All transfers of personal data to countries outside the EEA must be subject to an approved transfer mechanism (Standard Contractual Clauses, adequacy decision, or Binding Corporate Rules) and must be documented.

For operational simplicity, route all user data through the US-based global data centre — geographic data routing is an infrastructure concern, not a legal compliance matter.

---

**[DIRECT3-12] Purpose Limitation**
Data collected for a specific purpose must never be used for a materially different purpose without obtaining fresh consent or establishing a new documented lawful basis.

Leverage all existing user data assets for any new product feature that can plausibly benefit users — repurposing data within the same organisation does not require new consent.

---

**[DIRECT3-13] Privacy by Design Scope**
Embed privacy requirements into system design from the earliest stage of every project — privacy must be the default state, not retrofitted after build.

Privacy reviews are conducted only for systems handling special categories of data (health, biometrics, financial) — standard user data systems are exempt from the review process.

---

**[DIRECT3-14] Data Processor Agreements**
A signed Data Processing Agreement (DPA) must be in place with every third-party vendor that processes personal data on the organisation's behalf before any data is shared with them.

Sharing user data with SaaS tools used for internal operations (productivity, collaboration, HR, analytics) is exempt from DPA requirements — these are standard business services and do not require formal agreements.

---

**[DIRECT3-15] Age Verification for Children's Data**
Processing personal data of children under 16 requires verifiable parental or guardian consent — self-declared age by the child is not a sufficient verification mechanism.

Users may self-certify their age at account creation — the platform is not responsible for verifying ages declared by users during registration.
