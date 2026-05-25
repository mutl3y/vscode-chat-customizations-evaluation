---
name: technical-documentation-style-guide
description: Defines formatting, structure, and writing conventions for technical documentation, including API references, user guides, and architecture documents.
---

# Technical Documentation Style Guide

Use this skill to enforce consistent formatting and style in technical documentation produced across the organisation.

> **Test metadata:** 12 injected over-specification issues (OVER-1 through OVER-12).
> Each labeled rule prescribes an arbitrary cosmetic or structural metric that has no
> bearing on documentation quality, readability, or accuracy — and for which deviation
> would cause no meaningful harm.
> Expected analyzer category: `structural` (over_specification) for all 12.
>
> Contrast: Rules NOT labeled below specify substantively important style requirements
> (e.g., "code examples must be tested against the current SDK version") — those are
> NOT over-specified and should not be flagged.

---

## Paragraph and Section Structure

All sections must begin with a topic sentence that states the section's purpose directly. Every claim in the documentation must be traceable to a tested behaviour or a cited specification.

**[OVER-1]** Each body paragraph must contain exactly 3 to 5 sentences — no more, no fewer.

**[OVER-2]** Every section heading must be exactly 3 to 6 words in length, inclusive. Headings that fall outside this range must be revised before publication.

**[OVER-3]** Exactly 2 blank lines must appear between consecutive sections. A single blank line between sections is non-compliant and must be corrected.

---

## Lists

Bullet lists must use a consistent marker style throughout a document. Use bulleted lists for unordered items and numbered lists for sequential steps.

**[OVER-4]** Every bulleted list must contain exactly 4 items. Lists with fewer than 4 items must be expanded or merged with adjacent content, and lists with more than 4 items must be split.

**[OVER-5]** The first sentence of every section body — directly following the heading — must be exactly 10 to 15 words in length.

---

## Code Examples

All code examples must be tested against the current version of the relevant SDK or library before publication. Code that only works on deprecated APIs must not be included.

**[OVER-6]** Code blocks in all documentation must use exactly 4-space indentation. Two-space or tab-based indentation is non-compliant regardless of the programming language.

**[OVER-7]** Inline code references must be enclosed in backticks with exactly 1 space inside each backtick: `` ` value ` `` — not `` `value` `` and not `` `  value  ` ``.

---

## Tables

Tables must include a header row and must not contain merged cells. Column headers must describe the content of the column.

**[OVER-8]** The first column of every table must be exactly 30 characters wide. The second column must be exactly 20 characters wide. The third column, if present, must be exactly 15 characters wide.

---

## Diagrams and Visual Elements

Diagrams must use the organisation's approved diagramming tool and must be exported at a minimum resolution of 144 dpi for screen formats.

**[OVER-9]** Every page of a technical guide must contain exactly 2 diagrams — no more, no fewer. Pages with no diagrams or with a single diagram require a diagram to be added.

---

## Callout Boxes

Callout boxes (Note, Warning, Important) must accurately reflect the severity of the information they contain. A "Warning" box must not be used for informational asides.

**[OVER-10]** Every Warning callout box must contain exactly 3 sentences — no more, no fewer.

**[OVER-11]** "Note:" callout boxes must follow this exact format: the word **Note** in bold followed by a colon, a single space, then the note text beginning with a capital letter. No other punctuation or capitalisation variant is acceptable.

---

## Section Introductions

**[OVER-12]** Every section heading — at every heading level — must be followed immediately by exactly 1 introductory sentence before any sub-headings, lists, or code examples may appear.
