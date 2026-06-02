---
name: testcase-design-first
description: Use when about to generate or execute tests, to follow the correct ordered tester workflow instead of jumping straight to results
---

# Testcase Design First

Design before execution. Writing results before designing granular, reviewed cases produces shallow coverage and unverifiable claims.

## Ordered Workflow

1. **Understand docs / UI**: read the requirements and inspect the actual UI (see `ui-discovery-with-chrome-devtools`). Do not rely on assumed labels or flows.
2. **Design granular cases**: one behavior per testcase. Cover happy path, negative/invalid input, boundaries, roles, and state. See `generate-testcase-json`.
3. **Run quality review**: apply `testcase-quality-review` to the designed cases before executing.
4. **Execute**: run the cases against the confirmed test/staging environment. See `executing-test-runs` or `execute-testcase-json`.
5. **Write observed results**: record ACTUAL RESULT and STATUS only from fresh evidence. See `evidence-before-result`.
6. **Summarize gaps**: report coverage, blocked cases (PENDING), defects found, and anything not testable.

## Rules

- Never set `PASS`/`FAIL` for a case you have not actually exercised.
- Never collapse multiple behaviors into one testcase to "save space".
- If scope is unclear, stop and use `tester-scope-discovery` first.
