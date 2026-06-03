---
name: testcase-design-first
description: Use when about to generate or execute tests, to follow the correct ordered tester workflow instead of jumping straight to results
---

# Testcase Design First

Design before execution. Writing results before designing granular, reviewed cases produces shallow coverage and unverifiable claims.

## Ordered Workflow

1. **Understand docs / UI**: read the requirements and inspect the actual UI (see `ui-discovery-with-chrome-devtools`). Do not rely on assumed labels or flows.
2. **Build a Browser Evidence Map** for UI-facing work before writing expected results:
   - navigation path and exact page/form reached
   - visible field label, placeholder, required marker, helper text, and button labels
   - baseline state before input
   - observed state/message after submit/continue for representative valid, warning, and invalid data
   - Visual Evidence Matrix for warning/error/success styling, including screenshot or computed style evidence for color and placement
   - relevant console/network evidence when the UI result depends on an API response
   If Chrome DevTools MCP is unavailable or the page cannot be reached, record that blocker and do not finalize deterministic UI expected results from guesses.
3. **Map black-box risks and edge cases**: apply `blackbox-edgecase-design` before writing cases. Think beyond direct requirements: Risk-Based Testing, CRUD/lifecycle, State Transition Testing, SFDPOT, Equivalence Partitioning, Boundary Value Analysis, Decision Table, Pairwise Testing, Negative Testing, Integration, security, performance, and AI QA / Agent Testing when relevant.
4. **Design granular cases**: one behavior per testcase. Cover happy path, alternate path, validation, boundary, negative, role/state, integration, timeout/retry, and high-risk edge cases. See `generate-testcase-json`.
5. **Run quality review**: apply `testcase-quality-review` to the designed cases before executing.
6. **Execute**: run the cases against the confirmed test/staging environment. See `executing-test-runs` or `execute-testcase-json`.
7. **Write observed results**: record ACTUAL RESULT and STATUS only from fresh evidence. See `evidence-before-result`.
8. **Summarize gaps**: report coverage, blocked cases (PENDING), defects found, and anything not testable.

## Rules

- Never set `PASS`/`FAIL` for a case you have not actually exercised.
- Never collapse multiple behaviors into one testcase to "save space".
- Do not stop at 5W1H; include risk, lifecycle/state, data classes, boundaries, negative behavior, integrations, and time-based failures.
- For UI validation features, do not write final `EXPECTED RESULT` from documents alone. Use the Browser Evidence Map to anchor visible messages, action gates, and actual screen state.
- For expected results, combine documents and browser observation: documents define the business oracle, Chrome DevTools defines the UI oracle.
- If scope is unclear, stop and use `tester-scope-discovery` first.
