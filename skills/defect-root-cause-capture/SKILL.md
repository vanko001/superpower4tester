---
name: defect-root-cause-capture
description: Use when a test case fails, to capture a complete, actionable defect report instead of a vague failure note
---

# Defect Root Cause Capture

When a case fails, capture enough detail for a developer to reproduce and locate the problem. You are a tester: report the defect, do not fix application code.

## Capture For Each Defect

- **Failing step**: which `B`-step failed and what you did.
- **Data**: the exact `DATATEST` / inputs used.
- **Expected vs actual**: the `EXPECTED RESULT` versus what actually happened, stated precisely.
- **UI evidence**: screenshot and/or snapshot showing the failure state.
- **Console / network evidence**: relevant JS console errors and failing requests (URL, method, status, response) via `ui-discovery-with-chrome-devtools`.
- **Likely field / module**: your best hypothesis about the responsible form field, component, endpoint, or module — clearly marked as a hypothesis.

## Rules

- **Do not modify application code** to make a test pass.
- Record all of the above in the case `COMMENT` (or a linked defect note) and set `STATUS` to `FAIL`.
- Keep secrets out of evidence and comments.
- If the failure blocks downstream cases, mark those `PENDING` with a reference to this defect.
