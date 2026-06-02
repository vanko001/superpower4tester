# superpower4tester

`superpower4tester` is a multi-harness tester plugin. It helps agents read requirements, inspect a real browser UI with Chrome DevTools MCP, generate granular Vietnamese-first `testcase.json`, execute those cases, and write evidence-backed results.

## Core Output

The primary output is `testcase.json` with exact columns:

`ID | TITLE | STEPS | DATATEST | EXPECTED RESULT | ACTUAL RESULT | STATUS | COMMENT`

Rules:

- Titles start with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- Do not group multiple behaviors into one testcase.
- Steps use explicit reproduction steps such as `B1`, `B2`.
- `DATATEST` must be realistic for the project.
- `EXPECTED RESULT` and `ACTUAL RESULT` stay short and single-purpose.
- `STATUS` is `PASS`, `FAIL`, or `PENDING`.
- `COMMENT` describes real defects clearly for developers.

## Chrome DevTools MCP

This plugin uses Chrome DevTools MCP at runtime through:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@1.1.1"]
    }
  }
}
```

See `docs/install/` for harness-specific setup.

## Installation

- [Codex](docs/install/codex.md)
- [Claude Code](docs/install/claude-code.md)
- [Cursor](docs/install/cursor.md)
- [Gemini CLI](docs/install/gemini.md)
- [OpenCode](docs/install/opencode.md)
