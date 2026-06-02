---
name: executing-test-runs
description: Use when executing a written test plan against an application and recording observed results
---

# Executing Test Runs

Execute a reviewed test plan case by case, capturing real evidence and updating results honestly.

## Safety Preflight (do before any action)

- **Confirm test/staging environment**: never run against production. If unsure, stop and ask (`tester-scope-discovery`).
- **Identify destructive / externally-visible actions**: submit, payment, email, upload, delete, or anything that changes shared state or notifies real people.
- **Stop and ask explicit approval before destructive actions.** Do not proceed on assumption.
- **Do not expose secrets** in screenshots, comments, or logs.

## Per-Case Execution Loop

For each case in plan order:

1. Set up required preconditions (role, data, state).
2. Inspect the UI with `ui-discovery-with-chrome-devtools`; snapshot before acting.
3. Perform the `STEPS` exactly as written.
4. Capture evidence for the observed outcome (snapshot/screenshot/console/network).
5. Write `ACTUAL RESULT` from what you observed, then set `STATUS`:
   - `PASS` only with evidence that the expected result occurred.
   - `FAIL` with evidence of the discrepancy; then use `defect-root-cause-capture`.
6. Record evidence references in `COMMENT`.

## Blocked Cases

If a case cannot be executed (missing access, blocked by a defect, destructive action not yet approved), leave it `PENDING` with a clear `COMMENT` explaining the blocker. Do not guess a result.

Before reporting completion, apply `evidence-before-result`.
