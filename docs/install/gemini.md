# Gemini CLI Installation

Gemini extension manifest: `gemini-extension.json`

## Chrome DevTools MCP

Gemini CLI registers Chrome DevTools MCP through an **inline `mcpServers`** block in the extension manifest (`gemini-extension.json`):

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
gemini mcp add chrome-devtools npx chrome-devtools-mcp@1.1.1
```

## Security note

Chrome DevTools MCP can inspect live browser content (DOM, network traffic, console, screenshots). Do **NOT** point it at sensitive production data or production sessions. Use disposable test accounts and non-production environments only.
