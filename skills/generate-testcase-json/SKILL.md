---
name: generate-testcase-json
description: Use when producing test cases as a testcase.json file from requirements or UI evidence
---

# Generate testcase.json

Produce a `testcase.json` array where each element is one behavior. The output file is always named `testcase.json`.

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
    "TITLE": "Xác minh đăng nhập thành công với tài khoản hợp lệ",
    "STEPS": "B1: Mở trang đăng nhập\nB2: Nhập email và mật khẩu hợp lệ\nB3: Nhấn nút Đăng nhập",
    "DATATEST": "email: user@example.com, password: Passw0rd!",
    "EXPECTED RESULT": "Người dùng đăng nhập thành công và được chuyển đến trang chủ",
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
- Cover happy path, negative/invalid inputs, boundaries, and role/state variations.

After generating, run `testcase-quality-review`.
