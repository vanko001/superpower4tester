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

## Exact Schema

Each testcase is an object with these keys (note the spaces in key names):

- `ID` — sequential identifier (e.g., `TC001`).
- `TITLE` — starts with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- `STEPS` — ordered steps in `B1`, `B2`, `B3` style.
- `DATATEST` — concrete, realistic input data used by the steps.
- `EXPECTED RESULT` — exactly one expected outcome.
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

- **No grouping**: one behavior per case. Do not bundle login + validation + redirect into one case.
- **Realistic data**: use plausible values in `DATATEST`, not `xxx` or `abc`.
- **Vietnamese title prefixes**: every `TITLE` starts with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- **Use UI evidence when available**: derive labels, flows, and field names from a real snapshot/screenshot (`ui-discovery-with-chrome-devtools`), not from assumptions.
- **STATUS at generation** is `PENDING`; do not pre-fill `PASS`/`FAIL`.
- Cover happy path, alternate path, validation, boundary, negative, lifecycle/state, decision-table, pairwise, integration, security, performance, and risk-based edge cases when relevant.
- Keep `EXPECTED RESULT` one observable outcome, but specific enough that a developer knows the expected state.

After generating, run `testcase-quality-review`.
