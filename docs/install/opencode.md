# OpenCode Installation

OpenCode plugin: `.opencode/plugins/superpower4tester.js`

For the full step-by-step guide, see [.opencode/INSTALL.md](../../.opencode/INSTALL.md).

## Chrome DevTools MCP

OpenCode does not assume MCP auto-registration from the plugin. Use the **`opencode.json` `mcp` fallback** to register Chrome DevTools MCP:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@1.1.1"]
    }
  }
}
```

The version is pinned to `chrome-devtools-mcp@1.1.1`.

## Manual fallback

Edit `opencode.json` and add the `mcp.chrome-devtools` block shown above, then restart OpenCode. Use this route unless a local smoke run proves automatic registration works.

## Security note

Chrome DevTools MCP can inspect live browser content (DOM, network traffic, console, screenshots). Do **NOT** point it at sensitive production data or production sessions. Use disposable test accounts and non-production environments only.
