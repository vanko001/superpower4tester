---
name: testcase-quality-review
description: Use when reviewing generated test cases before execution to catch schema, granularity, coverage, and clarity problems
---

# Testcase Quality Review

Review every generated `testcase.json` against this checklist before execution. Fix issues by regenerating, not by lowering the bar.

## Checklist

- **Schema**: each case has `ID`, `TITLE`, `STEPS`, `DATATEST`, `EXPECTED RESULT`, `ACTUAL RESULT`, `STATUS`, `COMMENT` with exactly those key names.
- **Titles**: every `TITLE` starts with `Xác nhận`, `Xác minh`, or `Kiểm tra` and clearly names the behavior.
- **Grouping**: each case covers exactly one behavior. Reject cases that bundle multiple checks.
- **Data realism**: `DATATEST` uses plausible, concrete values, not placeholders.
- **One expected result**: `EXPECTED RESULT` describes a single, verifiable outcome.
- **Negative cases**: invalid inputs, empty fields, boundaries, and error paths are covered, not just the happy path.
- **Role / state coverage**: relevant user roles, permissions, and pre-states are represented.
- **Edgecase Coverage**: black-box techniques are represented where relevant: Risk-Based Testing, State Transition Testing, SFDPOT, Equivalence Partitioning, Boundary Value Analysis, Decision Table, Pairwise Testing, Negative Testing, Integration, security/performance, and AI QA / Agent Testing.
- **STEPS format**: ordered `B1`, `B2`, `B3` steps that map to the expected result.
- **Status / comment quality**: `STATUS` is `PASS`/`FAIL`/`PENDING`; un-executed cases are `PENDING`; `COMMENT` explains blockers or evidence rather than being noise.

## Outcome

List concrete defects per `ID`. If edgecase categories are missing, name the missing risk area and the smallest testcase that should be added. If any case fails the checklist, send it back to `generate-testcase-json` for correction before any execution.
