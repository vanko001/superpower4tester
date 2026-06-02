---
name: blackbox-edgecase-design
description: Use when designing black-box test cases for edge cases, risks, state transitions, integrations, or complex business rules
---

# Black-Box Edgecase Design

Design from external behavior and risk, not from source code. Your goal is to find the cases most likely to reveal defects while keeping one behavior per testcase.

## Enhanced Black-Box Prompt

Before writing `testcase.json`, build a short design matrix from the requirement/UI evidence:

1. **Business goal**: what user/business outcome must be protected.
2. **Business rules**: permissions, validation, calculations, limits, required states.
3. **Risk-Based Testing**: list high-impact/high-probability failure areas first.
4. **Happy path**: the minimum success flow.
5. **Alternate path**: optional flows, cancellation, retry, fallback, manual review.
6. **Validation**: required fields, formats, cross-field rules, duplicate data.
7. **Equivalence Partitioning**: valid class, invalid class, special class for each input.
8. **Boundary Value Analysis**: min, max, just below, just above, empty, huge.
9. **Negative Testing**: malformed, unicode, emoji, injection-like text, long text, wrong role, missing permission.
10. **State Transition Testing**: forward, backward, invalid, repeated, and concurrent transitions.
11. **Decision Table**: combinations of business rules that change the expected outcome.
12. **Pairwise Testing**: representative combinations when browser, device, role, language, payment type, or feature flags multiply.
13. **SFDPOT**: Structure, Function, Data, Platform, Operations, Time.
14. **Integration**: UI -> API -> service -> database -> external system; include timeout, retry, rollback, and third-party errors when visible to the user.
15. **Security / Performance**: authorization, session expiry, rate limits, double click, slow response, large payload.
16. **AI QA / Agent Testing** when testing agent workflows: tool failure, timeout, wrong tool order, hallucinated result, forgotten context, recovery after bad tool output.

## Output Rules

- Convert each useful risk/edge into a separate testcase.
- Do not create duplicate cases just to fill categories.
- Each `EXPECTED RESULT` must describe one observable outcome, but with enough context to understand the expected state.
- If a risk cannot be executed safely, create a `PENDING` case with the blocker in `COMMENT`.
- Prioritize edge cases by risk when the full matrix is too large.

## Common Edgecase Triggers

- Double click / repeated submit.
- Timeout between user action and server response.
- Lost network after request is sent.
- Retry creates duplicate record or transaction.
- Session expires mid-flow.
- User changes role/state while another tab is open.
- Unicode, emoji, whitespace-only, very long, and special-character inputs.
- API returns 400, 401, 403, 409, 422, 429, or 500.
- External provider succeeds but local persistence fails, or local commit succeeds but provider fails.
