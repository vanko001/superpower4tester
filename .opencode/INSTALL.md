# Installing superpower4tester for OpenCode

## Plugin

Add superpower4tester to the `plugin` array in your `opencode.json`:

```json
{
  "plugin": ["superpower4tester@git+https://github.com/vanko001/superpower4tester.git"]
}
```

Restart OpenCode.

## Chrome DevTools MCP

Add the verified Chrome DevTools MCP fallback to `opencode.json`:

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

The OpenCode plugin registers skills and injects `using-superpower4tester` context. MCP auto-registration is not assumed. Use the `opencode.json` MCP route unless a local smoke run proves automatic registration works.
