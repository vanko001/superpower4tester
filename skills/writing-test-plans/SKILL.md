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
- **Testcase groups**: logical groups (e.g., login, validation, permissions), each listing the behaviors to cover. One behavior maps to one future testcase.
- **Execution order**: the sequence to run groups, including any prerequisite setup or data dependencies.
- **Evidence requirements**: what proof each case needs to be marked PASS/FAIL (snapshot, screenshot, network status, etc.).
- **Validation commands**: how the plan/output is checked (e.g., `npm test`, schema validation of `testcase.json`).

## Writing the Plan

1. Confirm scope and environment first (`tester-scope-discovery`).
2. Derive groups from the source docs and UI, not from guesses.
3. Keep groups independent where possible so they can run in parallel (`parallel-test-analysis`).
4. State the environment safety constraints (test/staging only; destructive actions need approval).

Hand the plan to `executing-test-runs` for execution.
