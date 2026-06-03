---
name: writing-test-plans
description: Use when a testing effort spans multiple modules or steps and needs a written plan before generating or executing cases
---

# Writing Test Plans

A test plan turns a vague "test this" into an ordered, evidence-backed campaign that another session or agent can execute.

## Plan Contents

A complete plan records:

- **Source docs**: links/paths to requirements, tickets, specs, acceptance criteria the plan is derived from.
- **UI discovery targets**: the exact URLs/screens to inspect, and what to capture (snapshot, screenshot, console, network).
- **Browser Evidence Map**: route, controls, baseline state, representative valid/warning/invalid observed outcomes, and network evidence that will anchor UI expected results.
- **Expected Result Oracle**: how each UI expected result will combine the Document Oracle and Browser Oracle.
- **Language rule**: Vietnamese-first testcase wording; Hạn chế tiếng Anh except for exact UI labels, codes, URLs, field/API names, and source terms.
- **Testcase groups**: logical groups (e.g., login, validation, permissions), each listing the behaviors to cover. One behavior maps to one future testcase.
- **Black-box edgecase matrix**: risk, lifecycle/state, SFDPOT, equivalence partitions, boundaries, decision table, pairwise dimensions, negative inputs, integration failures, security/performance risks, and AI QA / Agent Testing risks when applicable.
- **Execution order**: the sequence to run groups, including any prerequisite setup or data dependencies.
- **Evidence requirements**: what proof each case needs to be marked PASS/FAIL (snapshot, screenshot, network status, etc.).
- **Validation commands**: how the plan/output is checked (e.g., `npm test`, schema validation of `testcase.json`).

## Writing the Plan

1. Confirm scope and environment first (`tester-scope-discovery`).
2. Apply `blackbox-edgecase-design` before writing testcase groups.
3. Derive groups from the source docs and Browser Evidence Map, not from guesses.
4. Keep groups independent where possible so they can run in parallel (`parallel-test-analysis`).
5. State the environment safety constraints (test/staging only; destructive actions need approval).

Hand the plan to `executing-test-runs` for execution.
