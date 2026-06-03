---
name: using-superpower4tester
description: Use when starting a tester-focused session, generating testcase JSON, inspecting UI, executing test cases, or deciding which tester workflow skill to invoke
---

# Using superpower4tester

## Priority

1. Current user request and explicit scope.
2. Safety guardrails for production, destructive actions, credentials, payments, emails, uploads, and deletes.
3. Current requirements, UI evidence, testcase files, and runtime state.
4. `testcase.json` schema and quality rules.
5. Chrome DevTools MCP evidence.
6. Tester workflow skills.

## Turn Start Rule

Before testcase design, UI inspection, execution, result writing, or defect analysis, invoke the smallest relevant superpower4tester skill.

For UI testcase generation, the required order is:

1. `testcase-design-first`
2. `ui-discovery-with-chrome-devtools` to build a Browser Evidence Map
3. `blackbox-edgecase-design`
4. `generate-testcase-json`
5. `testcase-quality-review`

Do not let `generate-testcase-json` finalize UI expected results from documents or a user prompt alone.

For UI cases, apply the **Expected Result Oracle** before writing JSON: use the current requirements as the Document Oracle and Chrome DevTools MCP observations as the Browser Oracle.

## Skill Map

- Unclear scope: `tester-scope-discovery`
- Before generation or execution: `testcase-design-first`
- Black-box edgecase design: `blackbox-edgecase-design`
- Multi-step campaign planning: `writing-test-plans`
- Generate cases: `generate-testcase-json`
- Inspect UI: `ui-discovery-with-chrome-devtools`
- Review cases: `testcase-quality-review`
- Execute a plan: `executing-test-runs`
- Execute an existing file: `execute-testcase-json`
- Failed behavior: `defect-root-cause-capture`
- Before reporting completion: `evidence-before-result`
- Independent modules: `parallel-test-analysis` or `subagent-driven-testing`

## Non-Negotiable Output Rules

- Output file is `testcase.json`.
- Do not group multiple behaviors into one testcase.
- Titles start with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- Status is `PASS`, `FAIL`, or `PENDING`.
- Do not set `PASS` or `FAIL` without fresh evidence.
- For UI cases, expected results must be grounded in a Browser Evidence Map or explicitly blocked in `COMMENT`.
- Vietnamese-first testcase wording. Hạn chế tiếng Anh unless it is an exact UI label, field/API/status/reason code, URL, or source requirement term.
