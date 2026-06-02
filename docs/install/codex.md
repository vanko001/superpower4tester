# Codex Installation

Codex plugin manifest: `.codex-plugin/plugin.json`

Chrome DevTools MCP is bundled through `.mcp.json`:

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

Manual fallback:

```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@1.1.1
```

Codex caveat: the local plugin validator accepts `mcpServers` but rejects unsupported `hooks`. If Codex does not expose a validated plugin hook surface, `using-superpower4tester` is skill-triggered rather than turn-start enforced in Codex.
