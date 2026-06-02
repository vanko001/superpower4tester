---
name: subagent-driven-testing
description: Use when delegating test-suite generation or execution to subagents within the current session
---

# Subagent-Driven Testing

Delegate suites to subagents to keep context clean and scope tight, while you stay responsible for quality and safety.

## Fresh Subagent per Suite

- Dispatch one subagent per test suite/module with a focused, self-contained brief.
- A fresh subagent avoids context bleed between unrelated suites.
- Include in each brief: the module, source docs, URL, account/role, expected output, and the safety guardrails.

## Review Generated Cases

- When a subagent returns `testcase.json` cases, run `testcase-quality-review` before accepting them.
- Reject and re-dispatch suites whose cases violate schema, grouping, title, or coverage rules.

## Review Evidence / Results

- For executed suites, verify each `PASS`/`FAIL` is backed by fresh evidence (`evidence-before-result`).
- Confirm `FAIL`s include defect detail (`defect-root-cause-capture`) and `PENDING`s state their blocker.

## Stop Conditions

- **Stop on shared-state risk**: if suites would touch the same records, account, or ordering, do not run them concurrently — sequence them or isolate data.
- **Stop on destructive risk**: subagents must not perform submit/payment/email/upload/delete actions without explicit approval; otherwise those cases stay `PENDING`.

For independence analysis and merging, pair with `parallel-test-analysis`.
