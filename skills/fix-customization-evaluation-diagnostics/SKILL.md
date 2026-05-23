---
name: fix-customization-evaluation-diagnostics
description: Fixes diagnostics reported by the Chat Customizations Evaluations extension on the active prompt file. Reads the current diagnostics from the editor and applies suggested improvements.
---

# Fix Diagnostics

## Purpose

Fix issues found by the Chat Customizations Evaluations analyzer in prompt, agent, skill, and instruction files. The diagnostics include contradictions, ambiguities, persona conflicts, cognitive load issues, and coverage gaps.

## Usage

This skill is invoked automatically when the user clicks the "Fix Diagnostics" button in the editor title bar. It receives the diagnostics as context and rewrites the affected sections of the file to resolve them.

## Instructions

- You will receive a list of diagnostics from the Chat Customizations Evaluations extension. Each diagnostic includes a line number, code, message, and optionally a suggestion.
- For each diagnostic, apply the fix directly to the file content. Use the suggestion as a guide, but do not apply it verbatim if it makes the text longer or adds qualifying clauses — those introduce new ambiguity surface on the next analysis pass.
- **For ambiguity fixes specifically**: prefer shorter rewrites over longer ones. The goal is fewer words, not more. If the suggestion replaces a short phrase with a longer one, find a more concise resolution instead. If the ambiguous phrase is not essential, remove it.
- Preserve the overall structure, tone, and intent of the prompt file. Only change what is necessary to resolve the diagnostics.
- If two diagnostics conflict with each other, prefer the fix that keeps the prompt clearer and more consistent.
- Output the fixed file content as a code block so it can be applied as an edit.
- Do NOT add new instructions or sections that were not in the original file.
- Do NOT remove instructions unless a diagnostic specifically calls for it (e.g., contradictions).
