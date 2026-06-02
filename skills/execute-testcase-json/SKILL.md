---
name: execute-testcase-json
description: Use when executing an existing testcase.json file, to run the cases as written and fill only the result columns
---

# Execute testcase.json

Run an existing `testcase.json` as authored. Your job is execution and honest result recording, not redesign.

## Do Not Redesign

- Do not rewrite `ID`, `TITLE`, `STEPS`, `DATATEST`, or `EXPECTED RESULT`.
- Update only `ACTUAL RESULT`, `STATUS`, and `COMMENT`.
- Exception: if a case is genuinely invalid (broken schema, impossible steps, ambiguous expected result), flag it in `COMMENT`, leave it `PENDING`, and report it — do not silently "fix" results.

## Validate First

Before executing, validate the file:

- Confirms the schema: `ID`, `TITLE`, `STEPS`, `DATATEST`, `EXPECTED RESULT`, `ACTUAL RESULT`, `STATUS`, `COMMENT`.
- Titles start with `Xác nhận`/`Xác minh`/`Kiểm tra`; `STATUS` values are within `{PASS, FAIL, PENDING}`.
- If validation fails, stop and report (or route through `testcase-quality-review`).

## Safety Preflight

- **Confirm test/staging environment**; never execute against production.
- **Identify destructive / externally-visible actions** (submit, payment, email, upload, delete).
- **Stop and ask explicit approval before destructive actions.**
- **Do not expose secrets** in screenshots, comments, or logs.

## Execution Loop

For each case: set up state, inspect UI (`ui-discovery-with-chrome-devtools`), perform `STEPS`, capture evidence, then write `ACTUAL RESULT` and set `STATUS`:

- `PASS`/`FAIL` only with fresh evidence (`evidence-before-result`).
- Blocked or unapproved-destructive cases stay `PENDING` with a clear `COMMENT`.

For each `FAIL`, apply `defect-root-cause-capture`.
