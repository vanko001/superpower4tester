---
name: evidence-before-result
description: Use when about to set a PASS or FAIL status or report test completion, to ensure every result is backed by fresh evidence
---

# Evidence Before Result

A result without evidence is a guess. Never claim a case passed or failed without having actually observed it.

## Rule

- **No `PASS`/`FAIL` without evidence.** If you did not exercise the behavior this run, the status stays `PENDING`.
- Evidence must be **fresh** — from this execution, not from memory or a prior run.

## Acceptable Evidence Sources

- A `take_snapshot` showing the resulting DOM/state.
- A `take_screenshot` showing the visual outcome.
- Console messages (`list_console_messages`) for error/no-error claims.
- Network requests (`list_network_requests` / `get_network_request`) for status codes and responses.

## Blocked State Handling

- If access, data, environment, or approval is missing, leave the case `PENDING` with a `COMMENT` naming the blocker.
- Never convert a blocker into a `PASS` or `FAIL`.

## Safety

- Confirm test/staging environment before exercising any behavior.
- Treat submit/payment/email/upload/delete as destructive; get explicit approval first, otherwise mark `PENDING`.
- Keep secrets out of evidence, comments, and logs.

## Final Report Requirements

- Totals: counts of `PASS`, `FAIL`, `PENDING`.
- For each `FAIL`: link to the defect detail (`defect-root-cause-capture`).
- For each `PENDING`: the blocker reason.
- The evidence backing the pass/fail decisions.
- Any coverage gaps or untestable areas.
