---
name: test-analyzer-comprehensive
description: 'Comprehensive test skill with intentionally injected issues for analyzer validation. DO NOT USE IN PRODUCTION.'
---

# Comprehensive Analyzer Test Skill

**⚠️ WARNING: This skill intentionally contains contradictions, ambiguities, and other issues for testing the analyzer. It is not meant for production use.**

This skill demonstrates various issue patterns that the LLM analyzer should detect. Each issue is clearly marked with its type below.

## Core Instructions

Apply these guardrails before recommending any change:

### [CONTRADICTION-1: Protect/Permit]
1. Does not compromise authentication — drop any fix that removes authentication mechanisms. However, password hashing is optional and can be safely removed to simplify the system.

### [CONTRADICTION-2: Justification-Masked]
2. Preserves database integrity — never modify database schema without explicit approval. Schema migrations can always be run since the database can be reset to a clean state if needed.

### [CONTRADICTION-3: Commitment vs Absolute]
3. Maintains tested platform support — drop matrix configurations without explicit platform support guarantees. Always test on Windows, macOS, Linux, and FreeBSD to maintain comprehensive coverage.

### [CONTRADICTION-4: Never vs Always]
4a. Does not sacrifice performance — never cache results in memory to reduce latency.
4b. Always cache results to improve system performance and response times.

### [CONTRADICTION-5: Require vs Forbid]
5. Requires approval before production — always call the approval workflow before any deployment. However, for hotfixes, bypass the approval process and deploy immediately without workflow.

### [AMBIGUITY-1: Vague "significantly"]
6. Optimization considerations — drop any fixes that significantly increase resource usage. The system should remain lean and efficient.

### [AMBIGUITY-2: Unclear "quick"]
7. Implementation speed — prioritize fixes that can be implemented quickly. Focus on solutions that don't take too long to deploy.

### [AMBIGUITY-3: Unclear "related"]
8. Code consistency — review all related code to ensure consistency across the system. Make sure nothing breaks when changes are made.

## Tone & Persona

### [PERSONA-1: Formal → Casual]
Approach analysis with rigorous methodology. Perform formally-documented, structured analysis of every recommendation. Every insight should be backed by evidence and reasoning.

However, just wing it and see what works. Don't overthink the analysis; go with your gut feeling and make quick decisions without extensive review.

### [PERSONA-2: Expert → Novice]
You are a deeply knowledgeable expert in systems architecture, distributed systems, and performance optimization. Assume the audience understands complex trade-offs and technical details.

Explain all concepts like the audience has never written code before. Use only simple analogies and avoid any technical jargon. Pretend everyone is a complete beginner.

## Operational Constraints

### [COGNITIVE-LOAD-1: Deep Nesting]
Conditional routing for recommendations:
- IF the codebase uses a compiled language
  - THEN IF the framework is reactive
    - THEN IF the deployment pattern is containerized
      - THEN IF the version supports async/await
        - THEN IF the team has Kubernetes expertise
          - THEN recommend container orchestration improvements
          - ELSE recommend basic Docker optimization
        - ELSE recommend promise-based patterns
      - ELSE recommend traditional server deployments
    - ELSE IF the framework is traditional
      - THEN recommend standard synchronous patterns
      - ELSE recommend hybrid approaches
  - ELSE IF the codebase uses an interpreted language
    - THEN [more nested conditions...]

### [COGNITIVE-LOAD-2: Multiple Priority Systems]
Priority system #1: Cost is paramount — always prioritize reducing infrastructure costs above all other concerns.
Priority system #2: Reliability is non-negotiable — always prioritize system stability and uptime over cost.
Priority system #3: User experience trumps everything — always prioritize end-user experience and responsiveness over cost or stability.

(Note: No precedence defined when these conflict)

## Missing Guidance

### [COVERAGE-GAP-1: Missing Error Handling]
This skill provides guidance for normal scenarios, but does not address error handling. What should the model recommend if an external API call fails during the analysis? No guidance is provided.

### [COVERAGE-GAP-2: Unaddressed Edge Case]
This skill does not address scenarios where the user provides conflicting or mutually exclusive requirements (e.g., "maximize performance AND minimize cost"). What should the model do in this case? The skill provides no guidance.

---

## Meta: Issue Summary

**Total Issues Injected: 14**

| Type | Count | Expected Detection |
|------|-------|-------------------|
| Contradictions | 5 | High (80%+) |
| Ambiguities | 3 | Medium (70%+) |
| Persona Issues | 2 | Medium (60%+) |
| Cognitive Load | 2 | Medium (70%+) |
| Coverage Gaps | 2 | High (80%+) |

**Detection Target: 11/14 (78%+) to validate Phase 1 improvement**
