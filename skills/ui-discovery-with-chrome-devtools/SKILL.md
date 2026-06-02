---
name: ui-discovery-with-chrome-devtools
description: Use when inspecting a real UI to design or execute tests, to gather accurate labels, structure, and evidence instead of guessing
---

# UI Discovery with Chrome DevTools

Use the Chrome DevTools MCP tools to observe the real application. Never invent button labels, field names, or flows.

## Core Practices

- **Snapshot before acting**: call `take_snapshot` to read the current DOM/accessibility tree before clicking, filling, or asserting. Use the snapshot's element references for subsequent actions.
- **Screenshots for visual assertions**: use `take_screenshot` when the expected result is visual (layout, rendered state, error banners, images). Attach/reference it as evidence.
- **Inspect console and network when relevant**: use `list_console_messages` for JS errors and `list_network_requests` / `get_network_request` to verify API calls, status codes, and payloads for behaviors that depend on backend responses.
- **Do not guess labels**: read actual text, placeholders, and roles from the snapshot. If an element is not found, re-snapshot rather than assuming.

## Typical Flow

1. `navigate_page` to the target URL (test/staging only).
2. `take_snapshot` to map the page.
3. Interact (`click`, `fill`, `fill_form`) using snapshot references.
4. `wait_for` expected text/state to settle.
5. Capture evidence: `take_screenshot`, console, and network as needed.

## Safety

- Confirm the URL is a non-production test/staging environment before interacting.
- Do not capture screenshots that expose secrets, tokens, or real personal data; mask or avoid such views.
- Treat submit/payment/email/upload/delete actions as destructive — see the execution skills before triggering them.
