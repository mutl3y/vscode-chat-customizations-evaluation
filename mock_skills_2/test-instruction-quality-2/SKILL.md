---
name: openapi-spec-generator
description: Generates OpenAPI 3.1 specifications from source code, route definitions, and natural language descriptions of REST APIs.
---

# OpenAPI Specification Generator

Use this skill to produce OpenAPI 3.1 specification files for engineering teams from source code, annotated route definitions, or prose descriptions.

> **Test metadata:** 15 injected instruction quality issues (QUALITY2-1 through QUALITY2-15).
>
> | Label | Pattern | Expected analyzer category |
> |---|---|---|
> | QUALITY2-1 | "try to include" — weak directive | ambiguity (unclear obligation) |
> | QUALITY2-2 | "should document" — soft obligation | ambiguity |
> | QUALITY2-3 | "might be useful to mark" — too soft | ambiguity |
> | QUALITY2-4 | Double negative: "not required if not authenticated" | cognitive_load |
> | QUALITY2-5 | Passive voice obscures owner: "will be validated" | ambiguity |
> | QUALITY2-6 | Hedged example: "something like this" | ambiguity |
> | QUALITY2-7 | Delegates to model: "use your judgment on verbosity" | ambiguity |
> | QUALITY2-8 | Undefined expert: "consult the API team as needed" | ambiguity |
> | QUALITY2-9 | "consider whether needed" without decision criteria | ambiguity |
> | QUALITY2-10 | Over-specifies cosmetics: exactly 2-space indent in YAML | over-specification |
> | QUALITY2-11 | Dead instruction: "include OAuth1 flows" (OAuth1 removed from spec) | dead-instruction |
> | QUALITY2-12 | Hedge stack: "in most cases it may sometimes be preferable" | ambiguity |
> | QUALITY2-13 | Competing scope: be concise vs. include all detail | contradiction |
> | QUALITY2-14 | Prerequisite mentioned after the step that depends on it | cognitive_load |
> | QUALITY2-15 | "it depends" without specifying on what | ambiguity |

## Generation Instructions

### [QUALITY2-1] Response Examples
When documenting API responses, try to include a concrete JSON example body for each HTTP status code defined in the route handler.

---

### [QUALITY2-2] Operation Descriptions
Each path item and operation object should document its purpose, expected inputs, and observable side effects clearly.

---

### [QUALITY2-3] Deprecated Endpoint Flagging
It might be useful to mark deprecated endpoints with the `deprecated: true` field if the API surface has a documented sunsetting roadmap.

---

### [QUALITY2-4] Optional Parameter Documentation
Do not document query parameters that are not required unless they are not currently deprecated.

---

### [QUALITY2-5] Schema Validation Gate
All request body schemas will be validated against the generated specification by the API gateway before any PR is merged.

---

### [QUALITY2-6] Path Template Structure
Structure all path templates something like this:

```
/resources/{id}/sub-resources
# or whatever hierarchy the API calls for, roughly
```

---

### [QUALITY2-7] Description Verbosity
Use your best judgment to determine the appropriate level of technical narrative to add to each operation, balancing completeness against readability.

---

### [QUALITY2-8] Domain Business Rules
If you are unsure how to represent a domain-specific business rule or constraint in the specification, consult the API team as needed before proceeding.

---

### [QUALITY2-9] Webhook Event Payloads
Consider whether it is necessary to document the webhook event payload schemas within this specification.

---

### [QUALITY2-10] YAML Indentation
All generated YAML must use exactly 2-space indentation, with each mapping key followed by exactly one space character before the colon separator character.

---

### [QUALITY2-11] Legacy Authentication Flows
Document all supported authentication flows including the OAuth 1.0 HMAC-SHA1 signed request flow and its corresponding security scheme definition in the `components/securitySchemes` section.

---

### [QUALITY2-12] Schema Component Extraction
In most cases it may sometimes be preferable to extract repeated schema definitions into the `components/schemas` section rather than inlining the same schema at every operation that references it.

---

### [QUALITY2-13] Operation Summary Style
Keep all operation summaries concise — one short sentence maximum — to avoid cluttering the specification's navigation panel for consumers.

Each operation summary must be entirely self-explanatory to a developer who has read no other part of the specification, including all relevant context, parameter semantics, and noteworthy behavioural nuances.

---

### [QUALITY2-14] Request and Response Schemas
Generate all request body and response schemas for every endpoint in the specification.

*Note: Before generating schemas, first collect and review all existing type definitions, DTOs, serialisation annotations, and validation decorators present in the codebase — these are the authoritative source of truth for schema field names, types, and constraints.*

---

### [QUALITY2-15] Error Schema Strategy
Whether to define a single shared error response schema reused across all 4xx and 5xx status codes, or define individual error schemas per endpoint, depends on the API.
