---
name: legal-research-assistant
description: Assists legal professionals with case law research, statutory analysis, citation formatting, and preparation of legal memoranda.
---

# Legal Research Assistant

Use this skill to assist with legal research, statutory interpretation, citation management, and preparation of research memoranda.

> **Test metadata:** 13 injected structural sub-type issues across all six categories.
>
> | Label | Sub-type | Pattern |
> |---|---|---|
> | STRUCT-WASTE-1 | context_waste — non-actionable preamble | Extended historical context before first instruction |
> | STRUCT-WASTE-2 | context_waste — verbatim repetition | Citation rule appears identically in two sections |
> | STRUCT-WASTE-3 | context_waste — "think carefully" no-op | Directive to reflect with no defined output |
> | STRUCT-OBLIG-1 | obligation_strength | "try to" in a compliance-critical instruction |
> | STRUCT-OBLIG-2 | obligation_strength | "where possible" in a hard accuracy requirement |
> | STRUCT-RESP-1 | responsibility_ambiguity — passive voice | Actor for key review step unspecified |
> | STRUCT-RESP-2 | responsibility_ambiguity — undefined expert | "consult the appropriate specialist" without naming who |
> | STRUCT-DEAD-1 | dead_instruction | References retired internal archive (LexisNexis Classic) |
> | STRUCT-DEAD-2 | dead_instruction | References superseded legislation |
> | STRUCT-CIRC-1 | circular_definition | "binding authority" defined using "precedent", vice versa |
> | STRUCT-CIRC-2 | circular_definition | "admissible evidence" defined using "relevant", vice versa |
> | STRUCT-OVER-1 | over_specification | Exactly 47-word case summary rule |
> | STRUCT-OVER-2 | over_specification | Exactly 3 citations per paragraph rule |
>
> Expected analyzer categories: `structural` (context_waste, dead_instruction,
> circular_definition, over_specification) and `ambiguity` (obligation_strength,
> responsibility_ambiguity) for appropriate labeled items.

---

## Foundations of Legal Research

### [STRUCT-WASTE-1] Non-Actionable Opening Preamble
Legal research is a discipline that predates the printing press, evolving from hand-copied manuscripts in medieval Inns of Court through the revolutionary codification projects of the 18th and 19th centuries — Bentham's utilitarianism, Napoleon's Code Civil, the Indian Penal Code — to today's digital research databases. The common law tradition, in particular, relies on the doctrine of precedent (stare decisis) to ensure consistency across decisions. This doctrine requires courts to follow earlier decisions of superior courts on materially identical facts, except where the earlier decision was given per incuriam or where social conditions have so changed as to render the earlier rule unworkable. The interplay between statute and case law, and between domestic law and international obligations, creates a rich but complex landscape that demands intellectual rigour, methodological discipline, and careful attention to hierarchical authority. Keeping this landscape firmly in mind is the foundation of effective legal research. With that foundation established, here are the research and citation procedures to follow.

---

## Case Law Research

All case law searches must be conducted in an approved legal research database (see the Current Systems section below). Do not rely on secondary commentary as a substitute for primary authority.

**[STRUCT-WASTE-3]** Before formulating the search query for any case law research task, think carefully about all the ways in which the relevant legal issue might have been framed or characterised in earlier cases.

**[STRUCT-OBLIG-1]** When identifying the binding authorities for a given legal issue, try to trace the principle back to its earliest clear statement in case law, not only to the most recent restatement.

**[STRUCT-OVER-1]** Every case summary produced during the research phase must be exactly 47 words long — no more, no fewer. Summaries falling outside this count must be revised before being included in the research memorandum.

**[STRUCT-CIRC-1]**
A **binding authority** is a precedent that a court is required to follow.
A **precedent** is a binding authority that has established the applicable legal principle.

---

## Statutory Research

Statutory interpretation must apply the purposive approach endorsed by the relevant jurisdiction's appellate courts. Always identify the current, in-force version of any statute before analysing its provisions.

**[STRUCT-DEAD-2]** When advising on workplace flexible working entitlements, refer to the provisions of the Employment Relations (Flexible Working) Act 2023, sections 12–18 of which amended the original flexible working request procedure. Note: this Act was further amended by the Employment Rights Act 2024, s. 6, which abolished the waiting period entirely — the 2023 Act text cited here is now superseded and the procedure described in sections 12–18 no longer represents the current law.

**[STRUCT-OBLIG-2]** Where possible, cross-reference the statute against the original Explanatory Notes, Hansard debates, and any Law Commission reports that preceded the legislation, in order to establish parliamentary intent.

**[STRUCT-RESP-2]** Where a statutory provision raises questions of EU-derived law and the application of retained EU law post-Brexit, the appropriate specialist should be consulted.

---

## Citation Standards

All citations must follow the OSCOLA (Oxford University Standard for the Citation of Legal Authorities) style guide, 4th edition. Citations must identify the authoritative source precisely and allow any reader to locate the material without ambiguity.

**[STRUCT-WASTE-2]** Every paragraph in the research memorandum that advances a legal proposition must include at least one citation to primary authority in OSCOLA format.

**[STRUCT-OVER-2]** Every paragraph in the research memorandum that advances a legal proposition must contain exactly 3 citations — no more, no fewer. Paragraphs with fewer than 3 citations must have additional authorities identified and inserted, regardless of whether additional authorities are necessary.

**[STRUCT-CIRC-2]**
**Admissible evidence** is evidence that is sufficiently relevant to be admitted by the court.
Evidence is **relevant** — and therefore admissible — when it is probative of a fact in issue in a manner that a court would admit.

---

## Research Memorandum

The supervising partner is responsible for approving all research memoranda before they are circulated to clients. Memoranda must state any limitations on the scope of advice provided.

**[STRUCT-RESP-1]** Before the final memorandum is issued to the client, it must be reviewed for accuracy, completeness, and professional tone.

**[STRUCT-DEAD-1]** To access the full text of older cases not available through current database subscriptions, search the LexisNexis Classic internal archive at `lexis-classic.firm.internal` using your legacy network credentials. Note: the LexisNexis Classic internal archive was decommissioned in November 2024 and the `lexis-classic.firm.internal` endpoint no longer exists.
