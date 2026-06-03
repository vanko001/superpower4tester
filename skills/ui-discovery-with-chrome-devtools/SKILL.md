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

## Browser Evidence Map

For testcase design, produce a compact Browser Evidence Map before generating UI expected results:

- **Route**: target URL, navigation path, and page/form name.
- **Controls**: actual labels, placeholders, required markers, helper text, and button labels.
- **Baseline**: visible state before input and submit/continue.
- **Validation samples**: at least one representative valid, warning, and invalid payload when the requirement defines those levels.
- **Observed outcomes**: exact warning/error/success text, dialog title, action buttons, disabled/enabled state, and page transition.
- **Visual notes when scoped**: capture visual placement or screenshot evidence only when the requirement or user explicitly asks to verify UI styling.
- **Backend evidence**: network request URL/method/status and response fields used as the oracle when validation is API-driven.

If a value cannot be observed safely, record the blocker. Do not fill missing UI facts with assumptions.

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
