# superpower4tester Design

## Goal

Build `superpower4tester` as a multi-harness agent plugin for tester workflows:
read project documentation, inspect the real UI through Chrome DevTools MCP,
generate detailed `testcase.json`, execute those test cases in the browser, and
write back observed results.

The plugin must preserve the strongest workflow ideas from `obra/superpowers`
while changing the domain from software development to evidence-backed manual
and semi-automated testing.

## Source Reuse Strategy

Create a new repository instead of renaming the upstream Superpowers repo.
Copy and adapt only the process skills that are useful for tester behavior.
Keep upstream license attribution because Superpowers is MIT licensed.

Do not copy all original skills unchanged. Several original skills are
developer-specific and would pull the agent toward changing source code,
branch management, or pull-request workflows. `superpower4tester` should focus
on testcase design, UI discovery, execution, defect evidence, and result
reporting.

Do not keep upstream skill directory names unchanged. Runtime skill names must
be tester-specific and unique enough to install alongside the original
`superpowers` plugin without collisions. For example, copy `writing-skills`
only as `maintaining-tester-skills`, not as another `writing-skills` skill.

## Target Harnesses

The repo should support these harnesses from the first implementation plan:

- Codex / Codex App: `.codex-plugin/plugin.json` plus `.mcp.json`
- Claude Code: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  and `hooks/hooks.json`
- Cursor: `.cursor-plugin/plugin.json` plus `hooks/hooks-cursor.json`
- Gemini CLI: `gemini-extension.json`
- OpenCode: `.opencode/plugins/superpower4tester.js` plus
  `.opencode/INSTALL.md`

## Turn-Start Bootstrap And Hooks

The `using-superpower4tester` discipline is not only a normal skill. It must be
bootstrapped at session start where the harness supports that behavior.

Port the upstream Superpowers hook pattern:

- `hooks/session-start` reads `skills/using-superpower4tester/SKILL.md` and
  injects it as additional context.
- `hooks/run-hook.cmd` provides the Windows/Unix wrapper.
- `hooks/hooks.json` registers `SessionStart` for Claude Code compatible hook
  runtimes.
- `hooks/hooks-cursor.json` registers `sessionStart` for Cursor.
- `.opencode/plugins/superpower4tester.js` injects the bootstrap context through
  OpenCode's message transform and registers the plugin skills path, following
  the upstream `.opencode/plugins/superpowers.js` pattern.

Codex requires a separate verification step. The local Codex plugin validator
accepts `mcpServers` but does not accept a `hooks` field in
`.codex-plugin/plugin.json`. Do not add unsupported Codex manifest fields unless
the validator proves they are accepted. If Codex has no plugin hook surface for
session-start injection, Codex support should still expose the skills and MCP
server, but the implementation report must explicitly say that turn-start
bootstrap is not enforced in Codex.

Where a harness supports MCP server declarations, configure Chrome DevTools MCP
with:

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

## Harness MCP Registration

Use these concrete registration paths so implementation does not guess:

| Harness | MCP registration |
| --- | --- |
| Codex / Codex App | `.codex-plugin/plugin.json` includes `"mcpServers": "./.mcp.json"` and root `.mcp.json` contains the `mcpServers.chrome-devtools` block. Validate this with the local Codex plugin validator. |
| Claude Code | `.claude-plugin/plugin.json` includes inline `"mcpServers": { "chrome-devtools": ... }`, matching Chrome DevTools MCP's Claude plugin shape. |
| Cursor | `.cursor-plugin/plugin.json` includes inline `"mcpServers": { "chrome-devtools": ... }`, matching Chrome DevTools MCP's Cursor plugin shape. |
| Gemini CLI | `gemini-extension.json` includes inline `"mcpServers": { "chrome-devtools": ... }`, matching Chrome DevTools MCP's Gemini extension shape. |
| OpenCode | `.opencode/plugins/superpower4tester.js` should add `config.mcp["chrome-devtools"]` when absent. `.opencode/INSTALL.md` must also include the equivalent `opencode.json` fallback using `"mcp": { "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@1.1.1"] } }`. |

## Chrome DevTools MCP Dependency

Chrome DevTools MCP is a runtime dependency, not code to vendor into the plugin.
`superpower4tester` should rely on the harness exposing these tools when a test
run needs browser evidence:

- navigation: `list_pages`, `new_page`, `navigate_page`, `select_page`,
  `wait_for`
- UI inspection: `take_snapshot`, `take_screenshot`, `evaluate_script`
- input automation: `click`, `fill`, `fill_form`, `press_key`, `type_text`,
  `upload_file`, `handle_dialog`
- diagnostics: `list_console_messages`, `get_console_message`,
  `list_network_requests`, `get_network_request`
- optional coverage: `resize_page`, `emulate`, `lighthouse_audit`

The plugin should instruct the agent to prefer accessibility snapshots for
element targeting and to use screenshots when visual layout or visibility is
part of the expected result.

## Testcase JSON Contract

The primary output file is `testcase.json`. It must be an array of objects.
Each object must use these exact user-facing columns:

```json
{
  "ID": "TC001",
  "TITLE": "Xác minh ...",
  "STEPS": ["B1: ...", "B2: ..."],
  "DATATEST": "...",
  "EXPECTED RESULT": "...",
  "ACTUAL RESULT": "",
  "STATUS": "PENDING",
  "COMMENT": ""
}
```

Rules:

- `ID` is stable and unique. Prefer `TC001`, `TC002`, ...
- `TITLE` starts with one of: `Xác nhận`, `Xác minh`, `Kiểm tra`.
- This is a Vietnamese-first plugin by default. The validator should enforce
  the Vietnamese title prefixes for v1. A future config file may allow alternate
  prefixes, but v1 should not silently accept generic English titles.
- `TITLE` is short enough to scan but clear enough to know exactly what is
  being tested.
- Do not group multiple behaviors into one testcase.
- Split cases by field, validation rule, role, state, permission, input type,
  or workflow branch when the expected result differs.
- `STEPS` uses explicit reproduction steps, preferably `B1`, `B2`, ...
- `DATATEST` must be realistic for the project and must not be generic filler.
- `EXPECTED RESULT` is accurate, short, and contains one expected behavior.
- `ACTUAL RESULT` is filled only after execution and should mirror the style of
  `EXPECTED RESULT`.
- `STATUS` is one of `PASS`, `FAIL`, `PENDING`.
- `PENDING` covers both "not yet executed" and blocked cases because the user
  requirement allows only `PASS`, `FAIL`, and `PENDING`.
- `COMMENT` is blank for `PASS` unless useful context is needed; for `FAIL`,
  it must describe the defect clearly enough for a developer to locate the
  problem.
- Scripts must handle exact JSON keys with spaces, especially
  `EXPECTED RESULT` and `ACTUAL RESULT`, because the schema maps directly to
  tester-facing spreadsheet columns.

## Runtime Safety Guardrails

Browser execution can submit real forms, upload files, send emails, update
records, or delete data. The plugin must treat these as high-risk actions.

Before running `execute-testcase-json` or `executing-test-runs`, the agent must:

1. confirm the target environment is safe for testing or already provided by
   the user as a test/staging environment
2. identify destructive or externally visible actions in the steps
3. stop and ask for explicit approval before submitting destructive actions,
   payments, emails, irreversible updates, deletes, or uploads
4. mark the case `PENDING` with a clear `COMMENT` when execution is blocked by
   production risk or missing permission
5. avoid exposing secrets in screenshots, comments, logs, or generated fixtures

## Skills To Adapt From Superpowers

### `using-superpowers` -> `using-superpower4tester`

Keep the turn-start skill-selection discipline. Change the priority map to
tester phases:

1. user request and explicit scope
2. current docs, UI evidence, and environment state
3. testcase schema and quality rules
4. Chrome DevTools MCP evidence
5. reusable tester workflow skills

The skill should force the agent to choose a relevant tester skill before
designing or executing test cases.

### `brainstorming` -> `tester-scope-discovery`

Use before broad testcase generation or unclear test requests. It should ask
for scope only when needed: target module, URL, docs, account/session, browser
state, data constraints, supported roles, and output location. It should avoid
long product ideation unless the user is asking to design a testing workflow.

### `writing-plans` -> `writing-test-plans`

Convert implementation planning into test planning. The plan should map:

- input documents and assumptions
- pages/screens to inspect
- business rules to validate
- testcase groups to generate
- browser execution order
- evidence to capture for failures
- commands/scripts to validate `testcase.json`

### `executing-plans` -> `executing-test-runs`

Execute a written test plan or an existing `testcase.json`. For each case:

1. read steps and data
2. navigate/prepare the browser
3. run the steps with Chrome DevTools MCP
4. observe UI, console, and network where relevant
5. update `ACTUAL RESULT`, `STATUS`, and `COMMENT`
6. preserve `PENDING` when blocked by missing credentials, unavailable
   environment, ambiguous requirement, production risk, or unsafe action

### `verification-before-completion` -> `evidence-before-result`

Keep this skill almost intact in spirit. The tester agent cannot claim a case
passed or failed without fresh evidence from the browser, file validation, or a
clearly stated blocker.

### `systematic-debugging` -> `defect-root-cause-capture`

Use when a testcase fails or the UI behaves unexpectedly. The goal is not to
fix application code; the goal is to capture a reproducible defect:

- exact failing step
- data used
- expected vs actual
- visible UI evidence
- relevant console/network evidence
- likely impacted module or field

### `requesting-code-review` -> `testcase-quality-review`

Review generated or edited testcase files before execution. The reviewer checks
for merged cases, vague titles, generic data, multi-result expected values,
missing negative cases, missing role/state coverage, invalid schema, and weak
failure comments.

### `dispatching-parallel-agents` -> `parallel-test-analysis`

Use when modules are independent. Examples: login, profile, checkout, invoice,
permission settings. Each agent gets one module, its docs, and strict output
rules, then results are merged and reviewed.

### `subagent-driven-development` -> `subagent-driven-testing`

Use when a large test campaign can be split into independent suites. Keep the
fresh-subagent idea, but replace spec/code review with:

1. testcase quality review
2. evidence/result review

### `writing-skills`

Copy only as `maintaining-tester-skills`. Keep a lightly adapted version for
maintaining future tester skills.

## Skills To Omit Or Keep Out Of The Main Tester Flow

- `test-driven-development`: do not copy unchanged. Replace it with
  `testcase-design-first`, because tester workflow should design cases before
  execution, not write production code after a failing unit test.
- `finishing-a-development-branch`: keep only in contributor docs if needed.
  It is useful for developing the plugin, not for tester users.
- `using-git-worktrees`: keep only in contributor docs if needed. It should not
  trigger during normal testcase generation or execution.
- `receiving-code-review`: optional contributor skill. It is not part of the
  core tester runtime.
- `writing-skills`: do not copy under this name because it collides with the
  upstream Superpowers skill. Use `maintaining-tester-skills`.

## New Tester-Specific Skills

### `generate-testcase-json`

Use when the user provides documents, UI context, requirements, or a module and
wants detailed test cases. It should produce or update `testcase.json` only
after reading available sources and, when UI is available, inspecting it with
Chrome DevTools MCP.

### `ui-discovery-with-chrome-devtools`

Use when the UI must be inspected before writing steps or data. It should take
snapshots, identify fields/buttons/messages, note required states, and capture
actual UI labels instead of guessing.

### `execute-testcase-json`

Use when `testcase.json` exists and the user wants the agent to run it. It
updates results in place and must not rewrite designed cases unnecessarily.

### `testcase-design-first`

Use before generating or executing a suite. It enforces this order:

1. understand docs and UI
2. design granular testcase list
3. quality-review the cases
4. execute cases
5. write observed results
6. summarize gaps

## Scripts

Add small deterministic scripts under `scripts/`:

- `validate-testcase-json`: validate schema, required columns, unique IDs,
  title prefixes, status enum, non-empty steps/data/expected result.
- `summarize-test-results`: print counts for `PASS`, `FAIL`, `PENDING`, and
  list failing IDs with comments.
- `normalize-testcase-json`: optional helper to sort keys and normalize IDs
  without changing test meaning.

These scripts should be runnable in any harness with Node.js LTS.

## Repository Shape

```text
superpower4tester/
  .codex-plugin/plugin.json
  .claude-plugin/plugin.json
  .claude-plugin/marketplace.json
  .cursor-plugin/plugin.json
  .mcp.json
  gemini-extension.json
  .opencode/
    INSTALL.md
    plugins/
      superpower4tester.js
  package.json
  README.md
  LICENSE
  NOTICE
  docs/
    superpowers/
      specs/
      plans/
    install/
  scripts/
    validate-testcase-json.mjs
    summarize-test-results.mjs
    normalize-testcase-json.mjs
  skills/
    using-superpower4tester/SKILL.md
    tester-scope-discovery/SKILL.md
    testcase-design-first/SKILL.md
    writing-test-plans/SKILL.md
    generate-testcase-json/SKILL.md
    ui-discovery-with-chrome-devtools/SKILL.md
    testcase-quality-review/SKILL.md
    executing-test-runs/SKILL.md
    execute-testcase-json/SKILL.md
    defect-root-cause-capture/SKILL.md
    evidence-before-result/SKILL.md
    parallel-test-analysis/SKILL.md
    subagent-driven-testing/SKILL.md
    maintaining-tester-skills/SKILL.md
  hooks/
    hooks.json
    hooks-cursor.json
    run-hook.cmd
    session-start
```

## Quality Gates

Implementation should not be considered ready until:

- every manifest parses as JSON
- `.codex-plugin/plugin.json` validates against local Codex plugin validator
- `.mcp.json` launches Chrome DevTools MCP via `npx`
- Claude/Cursor hooks inject `using-superpower4tester` session-start context
- OpenCode plugin injects `using-superpower4tester` context and registers the
  skills path
- every `SKILL.md` has valid frontmatter with matching directory/name
- no runtime `SKILL.md` directory keeps an upstream Superpowers name unchanged
- testcase validation script catches grouped or malformed cases
- sample `testcase.json` passes validation
- a dry-run browser workflow proves the agent can inspect a page and write one
  `PENDING`, one `PASS`, and one simulated or fixture-based `FAIL`
- safety guardrails block a destructive fixture case and mark it `PENDING`

## Open Decisions For Implementation Plan

- Whether to pin `chrome-devtools-mcp@1.1.1` or use `@latest` in released
  manifests. The design defaults to `1.1.1` for reproducibility.
- Whether to publish as a personal local plugin first or prepare marketplace
  metadata for a public GitHub repo immediately.
- Whether the sample test run should target a local fixture page or a public
  static page. A local fixture is safer for repeatable tests.
- Whether Codex exposes a plugin hook mechanism that passes local validation.
  If not, document Codex as skill-triggered rather than turn-start enforced.
- Whether Vietnamese title prefixes remain hardcoded in v1 or move to a config
  file in v2. V1 defaults to hardcoded Vietnamese prefixes.
