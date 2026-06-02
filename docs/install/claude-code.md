# Claude Code Installation

Claude Code plugin manifest: `.claude-plugin/plugin.json`

## Chrome DevTools MCP

Claude Code registers Chrome DevTools MCP through an **inline `mcpServers`** block in the plugin manifest (`.claude-plugin/plugin.json`):

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

The version is pinned to `chrome-devtools-mcp@1.1.1`.

## Manual fallback

If the inline manifest registration is unavailable, add the server manually:

```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@1.1.1
```

## Security note

Chrome DevTools MCP can inspect live browser content (DOM, network traffic, console, screenshots). Do **NOT** point it at sensitive production data or production sessions. Use disposable test accounts and non-production environments only.
