---
name: content-moderation-reviewer
description: Reviews user-generated content against community guidelines to detect violations and apply appropriate enforcement actions.
---

# Content Moderation Reviewer

Use this skill to evaluate user-generated content against the platform's community guidelines and apply appropriate enforcement actions.

> **Test metadata:** 15 injected coverage gaps (GAP4-1 through GAP4-15).
> These are SILENT gaps — the skill provides no guidance for these scenarios.
> They are listed here for test tracking only; the analyzer must infer them as missing coverage.
>
> | Gap | Scenario | Expected impact if missed | Severity |
> |---|---|---|---|
> | GAP4-1 | Content written in a language the reviewing tool cannot assess | Violation passes undetected | HIGH |
> | GAP4-2 | Satirical content that closely mimics prohibited content | Legitimate satire removed OR real violation missed | HIGH |
> | GAP4-3 | Historical or educational context for otherwise prohibited material | Context-dependent content incorrectly removed | MEDIUM |
> | GAP4-4 | Coordinated mass reporting by bad actors targeting a legitimate account | Legitimate content removed via false-flagging campaign | HIGH |
> | GAP4-5 | Verified journalist documenting ongoing harm for newsgathering purposes | Press freedom chilled; documentation of wrongdoing removed | HIGH |
> | GAP4-6 | Coded or dog-whistle language that appears benign to automated classifiers | Hate speech passes detection entirely | HIGH |
> | GAP4-7 | User appeals an incorrect account suspension | User has no path to reinstatement; no guidance exists | HIGH |
> | GAP4-8 | Content posted by or about a minor | Age-specific protections not triggered | CRITICAL |
> | GAP4-9 | An escalating series of borderline posts (each fine individually, together a harassment pattern) | Pattern-based harassment campaign not detected | HIGH |
> | GAP4-10 | Government official or verified public figure posting content that violates rules for ordinary users | Inconsistent enforcement; perception of preferential treatment | HIGH |
> | GAP4-11 | Content that violates platform rules in one jurisdiction but is legally protected expression in another | Over- or under-enforcement with international legal implications | HIGH |
> | GAP4-12 | A mental health crisis signal embedded in an otherwise benign-looking post | At-risk user not identified or offered crisis resources | CRITICAL |
> | GAP4-13 | A violation whose identification requires knowing the real identity behind a pseudonymous account | Threat or doxxing not detected without external identity context | HIGH |
> | GAP4-14 | AI-generated synthetic media that is visually indistinguishable from authentic content | Synthetic disinformation accepted as genuine | HIGH |
> | GAP4-15 | A moderator experiencing secondary trauma from reviewing disturbing content | No guidance on moderator wellbeing, break protocols, or escalation | HIGH |

## Moderation Process

### Step 1: Initial Content Assessment
Review the flagged content against each applicable section of the platform's community guidelines. Identify which specific guideline the content appears to violate, if any. If the content does not violate any applicable guideline, mark it as compliant and release any hold immediately.

### Step 2: Context Evaluation
Before making a removal or enforcement decision, assess the context surrounding the content:
- The account history and standing of the poster
- Whether the content was flagged by an automated system, by the poster themselves, or by a third-party reporter
- The apparent purpose of the content (sharing information, creative expression, seeking peer support, entertainment)

### Step 3: Enforcement Action
Apply the appropriate enforcement action based on the severity and nature of the violation:
- **Warning:** First minor violation — issue a formal in-platform warning and leave the content visible
- **Content removal:** Content violates guidelines but the account otherwise remains in good standing
- **Temporary suspension:** Repeated or moderate violations — suspend the account for between 24 hours and 30 days scaled to severity
- **Permanent ban:** Severe violations (child safety content, credible threats of violence, terrorism glorification) — permanently disable the account

### Step 4: User Notification
Notify the account holder of any enforcement action taken, stating which community guideline was violated and what enforcement action was applied. Do not disclose the identity of any reporter or the mechanism by which the content was flagged.

### Step 5: Documentation
Record the enforcement decision in the moderation log with: the content category, the specific guideline violated, the enforcement action applied, the reviewer ID, and the timestamp.

## Scope
This skill applies to user-generated content posted to the main feed, comments sections, and direct messaging channels. Live streaming content, advertising content, and creator monetisation disputes are handled under separate review processes.
