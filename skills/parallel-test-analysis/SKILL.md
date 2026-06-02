---
name: parallel-test-analysis
description: Use when several independent modules can be tested or analyzed at once without shared state or sequential dependencies
---

# Parallel Test Analysis

Run independent testing work concurrently to save time — but only when the work is truly independent.

## Split Independent Modules Only

- Parallelize across modules/features that do not share state, data, or ordering.
- **Do not parallelize** flows that depend on each other (e.g., create-then-edit), share a single account/session, or mutate the same records.
- If in doubt about independence, run sequentially.

## Isolated Scope per Agent

Give each parallel agent a self-contained brief:

- Its specific module and source docs.
- Its own URL(s), account/role, and test data set.
- The expected output (`testcase.json` cases or results for its module only).
- The same safety guardrails (test/staging only; destructive actions need approval; no secret exposure).

## Merge and Review

- Collect each agent's `testcase.json` / results.
- Merge into a single coherent output with unique, consistent `ID`s.
- Run `testcase-quality-review` over the merged set before reporting.
- Reconcile any overlaps or duplicate behaviors.

For in-session subagent execution instead of fan-out analysis, see `subagent-driven-testing`.
