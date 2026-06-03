---
name: generate-testcase-json
description: Use when producing test cases as a testcase.json file from requirements or UI evidence
---

# Generate testcase.json

Produce a `testcase.json` array where each element is one behavior. The output file is always named `testcase.json`.

## Enhanced Black-Box Prompt

Before outputting JSON, run this design pass and keep only useful, non-duplicate cases:

```text
Business Goal -> Business Rules -> Happy Path -> Alternate Path -> Validation -> Boundary -> Negative -> State Transition -> Integration -> Security -> Performance -> Risk-Based Cases
```

Apply `blackbox-edgecase-design`:

- **Risk-Based Testing**: prioritize high-impact/high-probability areas.
- **CRUD + lifecycle**: create/read/update/delete and valid/invalid state transitions.
- **State Transition Testing**: forward, backward, repeated, invalid, and concurrent transitions.
- **SFDPOT**: Structure, Function, Data, Platform, Operations, Time.
- **Equivalence Partitioning** and **Boundary Value Analysis** for every input/data rule.
- **Decision Table** for business rules with combinations.
- **Pairwise Testing** when many parameters multiply.
- **Negative Testing** for malformed, unexpected, hostile, missing, huge, unicode, emoji, whitespace, and unauthorized inputs.
- **Integration** risks across UI, API, service, database, and external systems: timeout, retry, rollback, duplicate transaction, third-party failure.
- **AI QA / Agent Testing** when applicable: tool call fail, tool timeout, wrong tool order, hallucinated result, forgotten context, recovery after bad tool output.

For each candidate ask: "What defect would this find?" If the answer is vague, remove or rewrite the case.

## Browser Evidence Gate

When a testcase depends on UI behavior, form validation, visible warnings/errors, button state, page transition, modal/dialog text, or browser-observed API behavior, you MUST run `ui-discovery-with-chrome-devtools` before finalizing UI testcase JSON.

Create a **Browser Evidence Map** before writing `EXPECTED RESULT`:

- target URL and exact navigation path used to reach the screen
- actual field label, placeholder, required marker, helper text, and button labels
- baseline state before data entry
- observed state after submit/continue for representative valid, warning, and invalid payloads
- actual warning/error text, dialog title, button labels, disabled/enabled state, and page transition
- **Visual Evidence Matrix** for visual states: screenshot reference plus computed style values for warning/error/success text, including `background-color`, `border-color`, `text color`, icon/class name, and placement near the affected control
- relevant network request URL/method/status/payload fields when expected behavior depends on backend validation

Use the Browser Evidence Map as the oracle for UI wording and action gates. Requirements remain the oracle for business rules, but browser evidence anchors how those rules appear in the product. If browser evidence is missing, blocked, or unsafe to collect, do not finalize the testcase set with guessed UI expected results; keep affected cases `PENDING` and put the blocker in `COMMENT`.

## Expected Result Oracle

Before writing each UI `EXPECTED RESULT`, trace the expected outcome to both sources:

- **Document Oracle**: the requirement rule, acceptance criterion, status/reason, or business behavior that defines what must happen.
- **Browser Oracle**: the state actually observed with Chrome DevTools MCP: visible text, dialog/action gate, page transition, network response, and visual state.
- **Visual Evidence Matrix**: required whenever the expected result mentions warning/error/success color, icon, placement, disabled/enabled styling, or other visual treatment.

Rules:

- Do not write a UI `EXPECTED RESULT` until the related browser state has been exercised with Chrome DevTools MCP.
- Do not write color words such as warning color, red, amber, green, disabled gray, or highlighted state unless the Browser Evidence Map contains a screenshot or computed style evidence for that exact state.
- Keep the `EXPECTED RESULT` to one observable outcome. Put document rule IDs, browser evidence IDs, screenshots, network request IDs, and unresolved gaps in `COMMENT`.
- If docs and browser disagree, do not write `hoặc` or `có thể`. Use the requirement-backed outcome as the expected result, record the browser mismatch in `COMMENT`, and keep the case `PENDING` until execution confirms whether it is a defect or a requirement gap.
- If Chrome DevTools MCP is unavailable, do not finalize UI expected results from documents alone. Create or keep a blocked `PENDING` case with the missing browser evidence in `COMMENT`.

## Status Oracle Matrix

When requirements define rule outcomes, validation levels, status codes, reasons, warnings, confirmations, or audit states, build a **Status Oracle Matrix** before writing JSON.

For each rule/status row, map:

- rule or business condition
- input data class
- expected status
- expected reason
- expected UI state
- expected action gate
- confirm/audit behavior
- minimum testcase count

Example rows for validation features:

| Rule | Input class | expected status | expected reason | UI state | Action gate |
| --- | --- | --- | --- | --- | --- |
| R01 | documented valid input | `true` | `VALID` | no warning/error | continue directly |
| R02 | documented warning-level input | `true_warning` | `WARNING_REASON` | warning message/dialog | confirm required |
| R03 | documented invalid input | `invalidate` | `INVALID_REASON` | error message/dialog | edit required |

Rules:

- Cover every documented status level, including `true`, `true_warning`, and `invalidate` when present.
- Cover rule priority with separate cases when one input can match multiple rules.
- Split status verification, UI message verification, action-gate verification, and audit/confirm verification into separate cases when they assert different outcomes.
- Put `expected status` and `expected reason` in `DATATEST` for rule-engine cases when those states are observable through UI, network, API, logs, or agreed requirements.
- If the requirement has a conflict, create a case with the chosen requirement-backed expected result and note the conflict in `COMMENT`; do not write `hoặc` or `có thể`.

## Exact Schema

Each testcase is an object with these keys (note the spaces in key names):

- `ID` — strict row-order identifier: `TC001`, `TC002`, `TC003`, ... only. Do not add module prefixes such as `TC-FE-001`.
- `TITLE` — starts with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- `STEPS` — ordered steps in `B1:`, `B2:`, `B3:` style.
- `DATATEST` — concrete, realistic input data used by the steps.
- `EXPECTED RESULT` — exactly one deterministic expected outcome.
- `ACTUAL RESULT` — empty at generation time; filled during execution.
- `STATUS` — `PASS`, `FAIL`, or `PENDING` (use `PENDING` until executed).
- `COMMENT` — notes, blockers, or evidence references.

## Example

```json
[
  {
    "ID": "TC001",
    "TITLE": "Xác minh đăng nhập với tài khoản hợp lệ",
    "STEPS": [
      "B1: Mở trang đăng nhập.",
      "B2: Nhập email hợp lệ.",
      "B3: Nhập mật khẩu hợp lệ.",
      "B4: Nhấn nút Đăng nhập."
    ],
    "DATATEST": "email: user@example.com, password: Passw0rd!",
    "EXPECTED RESULT": "Hiển thị trang chủ của người dùng sau khi đăng nhập thành công.",
    "ACTUAL RESULT": "",
    "STATUS": "PENDING",
    "COMMENT": ""
  }
]
```

## Rules

- **Sequential IDs only**: assign IDs by final array order: `TC001`, `TC002`, `TC003`, ... without gaps or feature prefixes.
- **No grouping**: one behavior, one payload/rule, and one expected outcome per case. Split matrices such as multiple tags, multiple URLs, multiple roles, or multiple validation messages into separate cases.
- **Realistic executable data**: use plausible exact values in `DATATEST`, not `xxx`, `abc`, `một dịch vụ bất kỳ`, `chuỗi 4001+ ký tự`, `18 URL`, `nhiều URL`, or other placeholders.
- **Concrete steps**: every step must be executable by a tester. Do not write vague steps such as "Chọn một dịch vụ bất kỳ" or "Nhập chuỗi 4001+ ký tự"; provide the actual visible option/value.
- **Vietnamese title prefixes**: every `TITLE` starts with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- **Browser evidence first for UI cases**: derive labels, flows, messages, action gates, and field names from a real snapshot/screenshot/network trace (`ui-discovery-with-chrome-devtools`), not from assumptions.
- **STATUS at generation** is `PENDING`; do not pre-fill `PASS`/`FAIL`.
- Cover happy path, alternate path, validation, boundary, negative, lifecycle/state, decision-table, pairwise, integration, security, performance, and risk-based edge cases when relevant.
- Keep `EXPECTED RESULT` one observable outcome, specific enough that a developer knows the expected state. It should normally be one clear sentence, not a tiny fragment, and it must follow the Expected Result Oracle.
- Never use ambiguous result wording: `hoặc`, `có thể`, `tùy validation rule`, `nếu submit được`, `chưa xác định`. If the requirement is unknown, add a separate `PENDING` case with a `COMMENT` explaining the missing requirement instead of inventing alternatives.
- For UI validation cases, never replace missing browser evidence with `hoặc`, `có thể`, or guessed modal/error wording. Re-run UI discovery, or mark the case blocked in `COMMENT` and do not finalize the testcase set.
- For destructive or externally visible flows such as submit/payment/delete/upload/send email, keep the case `PENDING` unless the test environment and approval are explicit.
- For status-driven validation, the final testcase set must include a visible distribution by expected status, expected reason, rule priority, confirm flow, and audit behavior where applicable.

After generating, run `testcase-quality-review`, then validate with `npm run validate:sample` or `node scripts/validate-testcase-json.mjs <path-to-testcase.json>` before execution.
