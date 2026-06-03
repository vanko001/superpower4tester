---
name: testcase-quality-review
description: Use when reviewing generated test cases before execution to catch schema, granularity, coverage, and clarity problems
---

# Testcase Quality Review

Review every generated `testcase.json` against this checklist before execution. Fix issues by regenerating, not by lowering the bar.

## Checklist

- **Schema**: each case has `ID`, `TITLE`, `STEPS`, `DATATEST`, `EXPECTED RESULT`, `ACTUAL RESULT`, `STATUS`, `COMMENT` with exactly those key names.
- **ID order**: IDs are exactly `TC001`, `TC002`, `TC003`, ... in final array order. Reject feature prefixes, skipped numbers, and reordered IDs.
- **Titles**: every `TITLE` starts with `Xác nhận`, `Xác minh`, or `Kiểm tra` and clearly names the behavior.
- **Grouping**: each case covers exactly one behavior, one payload/rule, and one expected outcome. Reject cases that bundle multiple checks, multiple URLs/tags/roles, or multiple business-rule branches.
- **Data realism**: `DATATEST` uses plausible, concrete executable values, not placeholders such as `một dịch vụ bất kỳ`, `chuỗi 4001+ ký tự`, `18 URL`, `nhiều URL`, `xxx`, or `abc`.
- **Executable steps**: steps tell a tester exactly what to click/type/select. Reject vague actions such as "Chọn một dịch vụ bất kỳ" or "Nhập chuỗi 4001+ ký tự".
- **Browser evidence gate**: Reject UI testcase files that do not include browser evidence from `ui-discovery-with-chrome-devtools` before final expected results. For UI validation cases, check that the design notes include a Browser Evidence Map with route, controls, baseline state, representative observed outcomes, and relevant network evidence.
- **Expected Result Oracle**: Reject UI expected results that cannot be traced to both a Document Oracle and a Browser Oracle.
- **Language quality**: testcase wording is Vietnamese-first. Hạn chế tiếng Anh; allow English only for exact UI labels, field names, URLs, API/status/reason codes, product terms, or source requirement terms.
- **One deterministic result**: `EXPECTED RESULT` describes a single, verifiable outcome and is specific enough to identify the expected UI/API state.
- **Ambiguity ban**: reject `EXPECTED RESULT` or `ACTUAL RESULT` containing `hoặc`, `có thể`, `tùy validation rule`, `nếu submit được`, `chưa xác định`, or mixed success/error alternatives.
- **Status oracle coverage**: when requirements define statuses, rules, or reasons, verify that the set covers every documented level such as `true`, `true_warning`, and `invalidate`, plus expected reason codes.
- **Rule priority**: reject the set if overlapping rule conditions are not tested separately or if expected priority is hidden inside a grouped case.
- **Confirm and audit**: for warning/invalid flows, verify separate cases for initial warning/error, user confirm, user edit/retry, and audit queue behavior when the requirement includes `confirm` or `audit`.
- **Negative cases**: invalid inputs, empty fields, boundaries, and error paths are covered, not just the happy path.
- **Role / state coverage**: relevant user roles, permissions, and pre-states are represented.
- **Edgecase Coverage**: black-box techniques are represented where relevant: Risk-Based Testing, State Transition Testing, SFDPOT, Equivalence Partitioning, Boundary Value Analysis, Decision Table, Pairwise Testing, Negative Testing, Integration, security/performance, and AI QA / Agent Testing.
- **STEPS format**: ordered `B1`, `B2`, `B3` steps that map to the expected result.
- **Status / comment quality**: `STATUS` is `PASS`/`FAIL`/`PENDING`; un-executed cases are `PENDING`; `COMMENT` explains blockers or evidence rather than being noise.
- **Safety**: cases that submit, delete, upload, send email, pay, or change externally visible data must require explicit test-environment approval before execution.

## Outcome

List concrete defects per `ID`. If edgecase categories are missing, name the missing risk area and the smallest testcase that should be added. If browser evidence is missing for UI expected results, send the work back to `ui-discovery-with-chrome-devtools` before regenerating. If any case fails the checklist, send it back to `generate-testcase-json` for correction before any execution. Do not approve a file that fails `node scripts/validate-testcase-json.mjs <path-to-testcase.json>`.
