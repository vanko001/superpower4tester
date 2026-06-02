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

## Skill Map

- Unclear scope: `tester-scope-discovery`
- Before generation or execution: `testcase-design-first`
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
