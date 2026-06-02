# superpower4tester Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `superpower4tester`, a multi-harness tester plugin that generates granular Vietnamese-first `testcase.json` files, inspects UI through Chrome DevTools MCP, executes test cases, and writes evidence-backed results.

**Architecture:** The repo is a plugin bundle, not a standalone web app. It contains multi-harness manifests, Chrome DevTools MCP registration, Superpowers-derived bootstrap hooks, tester-specific skills, deterministic Node.js scripts for testcase JSON validation/reporting, and local fixtures for repeatable verification.

**Tech Stack:** Node.js LTS, ESM `.mjs` scripts, `node:test`, JSON plugin manifests, Bash hook scripts, OpenCode JavaScript plugin, Chrome DevTools MCP via `npx -y chrome-devtools-mcp@1.1.1`.

---

## Implementation Notes

Read the design spec before starting:

```bash
sed -n '1,430p' docs/superpowers/specs/2026-06-02-superpower4tester-design.md
```

Use these source references only as implementation references:

- Superpowers upstream: `/home/vule/Documents/Codex/2026-06-02/superpowers-upstream`
- Chrome DevTools MCP upstream: `/home/vule/Documents/Codex/2026-06-02/chrome-devtools-mcp`
- Codex plugin validator: `/home/vule/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py`

Do not use the original upstream skill directory names in `skills/`. Every runtime skill directory must use the `superpower4tester` names from the design.

## File Structure

Create or modify these files:

- Create: `package.json`
- Create: `README.md`
- Create: `LICENSE`
- Create: `NOTICE`
- Create: `.gitignore`
- Create: `.codex-plugin/plugin.json`
- Create: `.mcp.json`
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.cursor-plugin/plugin.json`
- Create: `gemini-extension.json`
- Create: `.opencode/INSTALL.md`
- Create: `.opencode/plugins/superpower4tester.js`
- Create: `hooks/session-start`
- Create: `hooks/run-hook.cmd`
- Create: `hooks/hooks.json`
- Create: `hooks/hooks-cursor.json`
- Create: `scripts/lib/testcase-schema.mjs`
- Create: `scripts/validate-testcase-json.mjs`
- Create: `scripts/summarize-test-results.mjs`
- Create: `scripts/normalize-testcase-json.mjs`
- Create: `tests/testcase-schema.test.mjs`
- Create: `tests/manifest-shape.test.mjs`
- Create: `tests/skill-frontmatter.test.mjs`
- Create: `tests/fixtures/valid-testcase.json`
- Create: `tests/fixtures/grouped-invalid-testcase.json`
- Create: `tests/fixtures/destructive-testcase.json`
- Create: `tests/fixtures/test-page.html`
- Create: `skills/using-superpower4tester/SKILL.md`
- Create: `skills/tester-scope-discovery/SKILL.md`
- Create: `skills/testcase-design-first/SKILL.md`
- Create: `skills/writing-test-plans/SKILL.md`
- Create: `skills/generate-testcase-json/SKILL.md`
- Create: `skills/ui-discovery-with-chrome-devtools/SKILL.md`
- Create: `skills/testcase-quality-review/SKILL.md`
- Create: `skills/executing-test-runs/SKILL.md`
- Create: `skills/execute-testcase-json/SKILL.md`
- Create: `skills/defect-root-cause-capture/SKILL.md`
- Create: `skills/evidence-before-result/SKILL.md`
- Create: `skills/parallel-test-analysis/SKILL.md`
- Create: `skills/subagent-driven-testing/SKILL.md`
- Create: `skills/maintaining-tester-skills/SKILL.md`
- Create: `docs/install/codex.md`
- Create: `docs/install/claude-code.md`
- Create: `docs/install/cursor.md`
- Create: `docs/install/gemini.md`
- Create: `docs/install/opencode.md`

### Task 1: Baseline Repository Metadata

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `NOTICE`
- Create: `README.md`

- [ ] **Step 1: Create `package.json`**

Use this exact JSON:

```json
{
  "name": "superpower4tester",
  "version": "0.1.0",
  "type": "module",
  "description": "Multi-harness tester skills plugin with Chrome DevTools MCP for testcase generation and execution.",
  "license": "MIT",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "validate:sample": "node scripts/validate-testcase-json.mjs tests/fixtures/valid-testcase.json",
    "summarize:sample": "node scripts/summarize-test-results.mjs tests/fixtures/valid-testcase.json",
    "normalize:sample": "node scripts/normalize-testcase-json.mjs tests/fixtures/valid-testcase.json --check",
    "validate:codex-plugin": "python3 /home/vule/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .",
    "check:mcp": "npx -y chrome-devtools-mcp@1.1.1 --help"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

Use this content:

```gitignore
node_modules/
.DS_Store
*.log
coverage/
tmp/
```

- [ ] **Step 3: Create `LICENSE`**

Use the MIT license text from `/home/vule/Documents/Codex/2026-06-02/superpowers-upstream/LICENSE`.

- [ ] **Step 4: Create `NOTICE`**

Use this content:

```text
superpower4tester adapts workflow ideas and selected implementation patterns from obra/superpowers, licensed under the MIT License.

superpower4tester configures Chrome DevTools MCP as a runtime MCP dependency. Chrome DevTools MCP is owned by Google LLC and licensed under Apache-2.0. This repository does not vendor Chrome DevTools MCP source code.
```

- [ ] **Step 5: Create initial `README.md`**

Use this content:

````markdown
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
````

- [ ] **Step 6: Verify metadata**

Run:

```bash
node -e "const p=require('./package.json'); console.log(p.name, p.version)"
```

Expected output:

```text
superpower4tester 0.1.0
```

- [ ] **Step 7: Commit Task 1**

```bash
git add package.json .gitignore LICENSE NOTICE README.md
git commit -m "chore: add superpower4tester metadata"
```

### Task 2: Testcase Schema Tests First

**Files:**
- Create: `tests/fixtures/valid-testcase.json`
- Create: `tests/fixtures/grouped-invalid-testcase.json`
- Create: `tests/fixtures/destructive-testcase.json`
- Create: `tests/testcase-schema.test.mjs`
- Create: `scripts/lib/testcase-schema.mjs`

- [ ] **Step 1: Create `tests/fixtures/valid-testcase.json`**

```json
[
  {
    "ID": "TC001",
    "TITLE": "Xác minh thông báo lỗi khi bỏ trống email đăng nhập",
    "STEPS": [
      "B1: Mở trang đăng nhập.",
      "B2: Để trống ô Email.",
      "B3: Nhập mật khẩu hợp lệ.",
      "B4: Bấm nút Đăng nhập."
    ],
    "DATATEST": "Email: <trống>; Mật khẩu: Test@123456",
    "EXPECTED RESULT": "Hiển thị lỗi bắt buộc nhập email.",
    "ACTUAL RESULT": "",
    "STATUS": "PENDING",
    "COMMENT": ""
  },
  {
    "ID": "TC002",
    "TITLE": "Kiểm tra đăng nhập thành công với tài khoản hợp lệ",
    "STEPS": [
      "B1: Mở trang đăng nhập.",
      "B2: Nhập email hợp lệ.",
      "B3: Nhập mật khẩu hợp lệ.",
      "B4: Bấm nút Đăng nhập."
    ],
    "DATATEST": "Email: tester@example.com; Mật khẩu: Test@123456",
    "EXPECTED RESULT": "Chuyển đến trang tổng quan.",
    "ACTUAL RESULT": "Chuyển đến trang tổng quan.",
    "STATUS": "PASS",
    "COMMENT": ""
  },
  {
    "ID": "TC003",
    "TITLE": "Xác nhận lỗi khi mật khẩu sai",
    "STEPS": [
      "B1: Mở trang đăng nhập.",
      "B2: Nhập email hợp lệ.",
      "B3: Nhập mật khẩu sai.",
      "B4: Bấm nút Đăng nhập."
    ],
    "DATATEST": "Email: tester@example.com; Mật khẩu: Wrong@123",
    "EXPECTED RESULT": "Hiển thị lỗi thông tin đăng nhập không đúng.",
    "ACTUAL RESULT": "Không hiển thị lỗi và vẫn ở form đăng nhập.",
    "STATUS": "FAIL",
    "COMMENT": "Sau B4, hệ thống không hiển thị thông báo lỗi khi mật khẩu sai."
  }
]
```

- [ ] **Step 2: Create `tests/fixtures/grouped-invalid-testcase.json`**

```json
[
  {
    "ID": "TC001",
    "TITLE": "Kiểm tra đăng nhập và đăng xuất",
    "STEPS": [
      "B1: Đăng nhập bằng tài khoản hợp lệ.",
      "B2: Kiểm tra vào dashboard.",
      "B3: Bấm đăng xuất.",
      "B4: Kiểm tra quay về trang đăng nhập."
    ],
    "DATATEST": "Email: tester@example.com; Mật khẩu: Test@123456",
    "EXPECTED RESULT": "Đăng nhập thành công và đăng xuất thành công.",
    "ACTUAL RESULT": "",
    "STATUS": "PENDING",
    "COMMENT": ""
  }
]
```

- [ ] **Step 3: Create `tests/fixtures/destructive-testcase.json`**

```json
[
  {
    "ID": "TC001",
    "TITLE": "Kiểm tra xóa người dùng khỏi hệ thống",
    "STEPS": [
      "B1: Mở trang quản lý người dùng.",
      "B2: Chọn người dùng test-delete@example.com.",
      "B3: Bấm nút Xóa.",
      "B4: Xác nhận xóa."
    ],
    "DATATEST": "Người dùng: test-delete@example.com",
    "EXPECTED RESULT": "Người dùng bị xóa khỏi danh sách.",
    "ACTUAL RESULT": "",
    "STATUS": "PENDING",
    "COMMENT": ""
  }
]
```

- [ ] **Step 4: Create failing tests in `tests/testcase-schema.test.mjs`**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  REQUIRED_COLUMNS,
  normalizeCases,
  summarizeCases,
  validateCases
} from '../scripts/lib/testcase-schema.mjs';

const readFixture = (name) => {
  const file = path.join('tests', 'fixtures', name);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

test('valid fixture satisfies required testcase schema', () => {
  const cases = readFixture('valid-testcase.json');
  const result = validateCases(cases);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('schema exposes exact spreadsheet-facing columns including keys with spaces', () => {
  assert.deepEqual(REQUIRED_COLUMNS, [
    'ID',
    'TITLE',
    'STEPS',
    'DATATEST',
    'EXPECTED RESULT',
    'ACTUAL RESULT',
    'STATUS',
    'COMMENT'
  ]);
});

test('validator rejects grouped testcase content', () => {
  const cases = readFixture('grouped-invalid-testcase.json');
  const result = validateCases(cases);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /TC001.*grouped/i);
});

test('validator flags destructive cases for safety review without rejecting schema', () => {
  const cases = readFixture('destructive-testcase.json');
  const result = validateCases(cases);
  assert.equal(result.valid, true);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /destructive/i);
});

test('normalizer produces stable IDs and column order', () => {
  const normalized = normalizeCases([
    {
      TITLE: 'Xác minh mẫu dữ liệu hợp lệ',
      STEPS: ['B1: Mở trang mẫu.'],
      DATATEST: 'Mã: SAMPLE01',
      'EXPECTED RESULT': 'Hiển thị dữ liệu mẫu.',
      STATUS: 'PENDING'
    }
  ]);

  assert.deepEqual(Object.keys(normalized[0]), REQUIRED_COLUMNS);
  assert.equal(normalized[0].ID, 'TC001');
  assert.equal(normalized[0]['ACTUAL RESULT'], '');
  assert.equal(normalized[0].COMMENT, '');
});

test('summary counts PASS FAIL PENDING only', () => {
  const summary = summarizeCases(readFixture('valid-testcase.json'));
  assert.deepEqual(summary, { PASS: 1, FAIL: 1, PENDING: 1 });
});
```

- [ ] **Step 5: Run tests to verify RED**

Run:

```bash
npm test
```

Expected: fail with module not found for `scripts/lib/testcase-schema.mjs`.

- [ ] **Step 6: Create `scripts/lib/testcase-schema.mjs`**

Implement these exports:

```javascript
export const REQUIRED_COLUMNS = [
  'ID',
  'TITLE',
  'STEPS',
  'DATATEST',
  'EXPECTED RESULT',
  'ACTUAL RESULT',
  'STATUS',
  'COMMENT'
];

const STATUS_VALUES = new Set(['PASS', 'FAIL', 'PENDING']);
const TITLE_PREFIXES = ['Xác nhận', 'Xác minh', 'Kiểm tra'];
const GROUPING_HINTS = [
  /\bvà\b/i,
  /\band\b/i,
  /đăng nhập.*đăng xuất/i,
  /thành công.*thành công/i
];
const DESTRUCTIVE_HINTS = [
  /xóa/i,
  /delete/i,
  /remove/i,
  /submit/i,
  /thanh toán/i,
  /payment/i,
  /gửi mail/i,
  /send email/i,
  /upload/i
];

const emptyCase = () => ({
  ID: '',
  TITLE: '',
  STEPS: [],
  DATATEST: '',
  'EXPECTED RESULT': '',
  'ACTUAL RESULT': '',
  STATUS: 'PENDING',
  COMMENT: ''
});

export function normalizeCases(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((raw, index) => {
    const merged = { ...emptyCase(), ...raw };
    const id = typeof merged.ID === 'string' && merged.ID.trim()
      ? merged.ID.trim()
      : `TC${String(index + 1).padStart(3, '0')}`;
    const steps = Array.isArray(merged.STEPS)
      ? merged.STEPS
      : String(merged.STEPS || '').split(/\n+/).filter(Boolean);

    return {
      ID: id,
      TITLE: String(merged.TITLE || '').trim(),
      STEPS: steps.map((step) => String(step).trim()).filter(Boolean),
      DATATEST: String(merged.DATATEST || '').trim(),
      'EXPECTED RESULT': String(merged['EXPECTED RESULT'] || '').trim(),
      'ACTUAL RESULT': String(merged['ACTUAL RESULT'] || '').trim(),
      STATUS: String(merged.STATUS || 'PENDING').trim().toUpperCase(),
      COMMENT: String(merged.COMMENT || '').trim()
    };
  });
}

const isBlank = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return typeof value !== 'string' || value.trim() === '';
};

const hasTitlePrefix = (title) => TITLE_PREFIXES.some((prefix) => title.startsWith(prefix));

const looksGrouped = (testcase) => {
  const joined = [
    testcase.TITLE,
    testcase['EXPECTED RESULT'],
    ...testcase.STEPS
  ].join(' ');
  return GROUPING_HINTS.some((pattern) => pattern.test(joined));
};

const looksDestructive = (testcase) => {
  const joined = [
    testcase.TITLE,
    testcase.DATATEST,
    testcase['EXPECTED RESULT'],
    ...testcase.STEPS
  ].join(' ');
  return DESTRUCTIVE_HINTS.some((pattern) => pattern.test(joined));
};

export function validateCases(input) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(input)) {
    return { valid: false, errors: ['testcase.json root must be an array'], warnings };
  }

  const cases = normalizeCases(input);
  const seen = new Set();

  cases.forEach((testcase, index) => {
    const label = testcase.ID || `row ${index + 1}`;

    for (const column of REQUIRED_COLUMNS) {
      if (!(column in testcase)) {
        errors.push(`${label}: missing column ${column}`);
      }
    }

    if (seen.has(testcase.ID)) {
      errors.push(`${label}: duplicate ID`);
    }
    seen.add(testcase.ID);

    if (!/^TC\d{3,}$/.test(testcase.ID)) {
      errors.push(`${label}: ID must match TC001 format`);
    }
    if (!hasTitlePrefix(testcase.TITLE)) {
      errors.push(`${label}: TITLE must start with Xác nhận, Xác minh, or Kiểm tra`);
    }
    if (isBlank(testcase.STEPS)) {
      errors.push(`${label}: STEPS must contain at least one step`);
    }
    if (isBlank(testcase.DATATEST)) {
      errors.push(`${label}: DATATEST must not be empty`);
    }
    if (isBlank(testcase['EXPECTED RESULT'])) {
      errors.push(`${label}: EXPECTED RESULT must not be empty`);
    }
    if (!STATUS_VALUES.has(testcase.STATUS)) {
      errors.push(`${label}: STATUS must be PASS, FAIL, or PENDING`);
    }
    if (testcase.STATUS === 'FAIL' && isBlank(testcase['ACTUAL RESULT'])) {
      errors.push(`${label}: FAIL requires ACTUAL RESULT`);
    }
    if (testcase.STATUS === 'FAIL' && isBlank(testcase.COMMENT)) {
      errors.push(`${label}: FAIL requires COMMENT`);
    }
    if (looksGrouped(testcase)) {
      errors.push(`${label}: grouped testcase detected; split this behavior`);
    }
    if (looksDestructive(testcase)) {
      warnings.push(`${label}: destructive or externally visible action requires explicit approval`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function summarizeCases(input) {
  const summary = { PASS: 0, FAIL: 0, PENDING: 0 };
  for (const testcase of normalizeCases(input)) {
    if (testcase.STATUS in summary) {
      summary[testcase.STATUS] += 1;
    }
  }
  return summary;
}
```

- [ ] **Step 7: Run tests to verify GREEN**

Run:

```bash
npm test
```

Expected: all `tests/testcase-schema.test.mjs` tests pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add scripts/lib/testcase-schema.mjs tests/fixtures/*.json tests/testcase-schema.test.mjs
git commit -m "test: add testcase schema contract"
```

### Task 3: CLI Scripts For Testcase JSON

**Files:**
- Create: `scripts/validate-testcase-json.mjs`
- Create: `scripts/summarize-test-results.mjs`
- Create: `scripts/normalize-testcase-json.mjs`
- Modify: `tests/testcase-schema.test.mjs`

- [ ] **Step 1: Add CLI smoke tests to `tests/testcase-schema.test.mjs`**

Append:

```javascript
import { spawnSync } from 'node:child_process';

test('validate CLI exits zero for valid fixture', () => {
  const result = spawnSync('node', ['scripts/validate-testcase-json.mjs', 'tests/fixtures/valid-testcase.json'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /valid testcase file/i);
});

test('validate CLI exits non-zero for grouped fixture', () => {
  const result = spawnSync('node', ['scripts/validate-testcase-json.mjs', 'tests/fixtures/grouped-invalid-testcase.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /grouped testcase/i);
});

test('summary CLI prints status counts', () => {
  const result = spawnSync('node', ['scripts/summarize-test-results.mjs', 'tests/fixtures/valid-testcase.json'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PASS: 1/);
  assert.match(result.stdout, /FAIL: 1/);
  assert.match(result.stdout, /PENDING: 1/);
});

test('normalize CLI check mode leaves valid fixture stable', () => {
  const result = spawnSync('node', ['scripts/normalize-testcase-json.mjs', 'tests/fixtures/valid-testcase.json', '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /already normalized/i);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test
```

Expected: fail because the three CLI scripts do not exist.

- [ ] **Step 3: Create `scripts/validate-testcase-json.mjs`**

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import { validateCases } from './lib/testcase-schema.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: validate-testcase-json <testcase.json>');
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const result = validateCases(data);

for (const warning of result.warnings) {
  console.warn(`Warning: ${warning}`);
}

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(`Valid testcase file: ${file}`);
```

- [ ] **Step 4: Create `scripts/summarize-test-results.mjs`**

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import { normalizeCases, summarizeCases } from './lib/testcase-schema.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: summarize-test-results <testcase.json>');
  process.exit(2);
}

const cases = normalizeCases(JSON.parse(fs.readFileSync(file, 'utf8')));
const summary = summarizeCases(cases);

console.log(`PASS: ${summary.PASS}`);
console.log(`FAIL: ${summary.FAIL}`);
console.log(`PENDING: ${summary.PENDING}`);

const failures = cases.filter((testcase) => testcase.STATUS === 'FAIL');
if (failures.length > 0) {
  console.log('');
  console.log('Failures:');
  for (const testcase of failures) {
    console.log(`- ${testcase.ID}: ${testcase.COMMENT}`);
  }
}
```

- [ ] **Step 5: Create `scripts/normalize-testcase-json.mjs`**

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import { normalizeCases } from './lib/testcase-schema.mjs';

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('Usage: normalize-testcase-json <testcase.json> [--check]');
  process.exit(2);
}

const original = fs.readFileSync(file, 'utf8');
const normalized = `${JSON.stringify(normalizeCases(JSON.parse(original)), null, 2)}\n`;

if (flag === '--check') {
  if (original === normalized) {
    console.log(`File is already normalized: ${file}`);
    process.exit(0);
  }
  console.error(`File is not normalized: ${file}`);
  process.exit(1);
}

fs.writeFileSync(file, normalized);
console.log(`Normalized testcase file: ${file}`);
```

- [ ] **Step 6: Make scripts executable**

```bash
chmod +x scripts/validate-testcase-json.mjs scripts/summarize-test-results.mjs scripts/normalize-testcase-json.mjs
```

- [ ] **Step 7: Normalize fixtures**

Run:

```bash
node scripts/normalize-testcase-json.mjs tests/fixtures/valid-testcase.json
node scripts/normalize-testcase-json.mjs tests/fixtures/grouped-invalid-testcase.json
node scripts/normalize-testcase-json.mjs tests/fixtures/destructive-testcase.json
```

Expected: each command prints `Normalized testcase file: ...`.

- [ ] **Step 8: Run tests to verify GREEN**

Run:

```bash
npm test
npm run validate:sample
npm run summarize:sample
npm run normalize:sample
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit Task 3**

```bash
git add scripts/validate-testcase-json.mjs scripts/summarize-test-results.mjs scripts/normalize-testcase-json.mjs tests/testcase-schema.test.mjs tests/fixtures/*.json
git commit -m "feat: add testcase json cli tools"
```

### Task 4: Multi-Harness Manifests And MCP Config

**Files:**
- Create: `.codex-plugin/plugin.json`
- Create: `.mcp.json`
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.cursor-plugin/plugin.json`
- Create: `gemini-extension.json`
- Create: `tests/manifest-shape.test.mjs`

- [ ] **Step 1: Create `tests/manifest-shape.test.mjs` first**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('Codex manifest references skills and root mcp config', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  assert.equal(manifest.name, 'superpower4tester');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.mcpServers, './.mcp.json');
  assert.equal(manifest.interface.displayName, 'superpower4tester');
});

test('root mcp config pins Chrome DevTools MCP', () => {
  const mcp = readJson('.mcp.json');
  assert.deepEqual(mcp.mcpServers['chrome-devtools'], {
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@1.1.1']
  });
});

test('Claude, Cursor, and Gemini manifests carry inline mcpServers', () => {
  for (const file of ['.claude-plugin/plugin.json', '.cursor-plugin/plugin.json', 'gemini-extension.json']) {
    const manifest = readJson(file);
    assert.equal(manifest.mcpServers['chrome-devtools'].command, 'npx', file);
    assert.deepEqual(manifest.mcpServers['chrome-devtools'].args, ['-y', 'chrome-devtools-mcp@1.1.1'], file);
  }
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test
```

Expected: fail because manifests do not exist.

- [ ] **Step 3: Create `.mcp.json`**

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

- [ ] **Step 4: Create `.codex-plugin/plugin.json`**

Use this JSON. Do not add `hooks` because the local Codex validator rejects unsupported fields.

```json
{
  "name": "superpower4tester",
  "version": "0.1.0",
  "description": "Tester workflows for granular testcase JSON generation and Chrome DevTools MCP execution.",
  "author": {
    "name": "superpower4tester contributors",
    "url": "https://github.com/vanko001/superpower4tester"
  },
  "homepage": "https://github.com/vanko001/superpower4tester",
  "repository": "https://github.com/vanko001/superpower4tester",
  "license": "MIT",
  "keywords": ["testing", "testcase", "qa", "chrome-devtools-mcp", "skills"],
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "interface": {
    "displayName": "superpower4tester",
    "shortDescription": "Generate and execute granular testcase JSON with browser evidence",
    "longDescription": "Use superpower4tester to inspect requirements and UI, generate detailed Vietnamese-first testcase.json files, execute them through Chrome DevTools MCP, and write PASS, FAIL, or PENDING results with clear comments.",
    "developerName": "superpower4tester contributors",
    "category": "Coding",
    "capabilities": ["Interactive", "Read", "Write"],
    "defaultPrompt": [
      "Generate testcase.json from these requirements.",
      "Inspect this UI and design test cases.",
      "Execute testcase.json and update results."
    ],
    "websiteURL": "https://github.com/vanko001/superpower4tester",
    "privacyPolicyURL": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    "termsOfServiceURL": "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service",
    "brandColor": "#16A34A",
    "screenshots": []
  }
}
```

- [ ] **Step 5: Create `.claude-plugin/plugin.json`**

```json
{
  "name": "superpower4tester",
  "description": "Tester skills for testcase generation and Chrome DevTools MCP execution",
  "version": "0.1.0",
  "author": {
    "name": "superpower4tester contributors"
  },
  "homepage": "https://github.com/vanko001/superpower4tester",
  "repository": "https://github.com/vanko001/superpower4tester",
  "license": "MIT",
  "keywords": ["testing", "testcase", "qa", "chrome-devtools-mcp", "skills"],
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@1.1.1"]
    }
  }
}
```

- [ ] **Step 6: Create `.claude-plugin/marketplace.json`**

```json
{
  "name": "superpower4tester-dev",
  "description": "Development marketplace for superpower4tester tester skills",
  "owner": {
    "name": "superpower4tester contributors"
  },
  "plugins": [
    {
      "name": "superpower4tester",
      "description": "Tester skills for testcase generation and Chrome DevTools MCP execution",
      "version": "0.1.0",
      "source": "./",
      "author": {
        "name": "superpower4tester contributors"
      }
    }
  ]
}
```

- [ ] **Step 7: Create `.cursor-plugin/plugin.json`**

```json
{
  "name": "superpower4tester",
  "displayName": "superpower4tester",
  "description": "Tester skills for testcase generation and Chrome DevTools MCP execution",
  "version": "0.1.0",
  "author": {
    "name": "superpower4tester contributors"
  },
  "homepage": "https://github.com/vanko001/superpower4tester",
  "repository": "https://github.com/vanko001/superpower4tester",
  "license": "MIT",
  "keywords": ["testing", "testcase", "qa", "chrome-devtools-mcp", "skills"],
  "skills": "./skills/",
  "hooks": "./hooks/hooks-cursor.json",
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@1.1.1"]
    }
  }
}
```

- [ ] **Step 8: Create `gemini-extension.json`**

```json
{
  "name": "superpower4tester",
  "description": "Tester skills for testcase generation and Chrome DevTools MCP execution",
  "version": "0.1.0",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@1.1.1"]
    }
  }
}
```

- [ ] **Step 9: Run manifest tests**

Run:

```bash
npm test
npm run validate:codex-plugin
```

Expected: `npm test` passes and Codex validator prints `Plugin validation passed`.

- [ ] **Step 10: Commit Task 4**

```bash
git add .codex-plugin/plugin.json .mcp.json .claude-plugin/plugin.json .claude-plugin/marketplace.json .cursor-plugin/plugin.json gemini-extension.json tests/manifest-shape.test.mjs
git commit -m "feat: add multi-harness manifests"
```

### Task 5: Bootstrap Hooks

**Files:**
- Create: `hooks/session-start`
- Create: `hooks/run-hook.cmd`
- Create: `hooks/hooks.json`
- Create: `hooks/hooks-cursor.json`

- [ ] **Step 1: Create `hooks/session-start`**

Copy `/home/vule/Documents/Codex/2026-06-02/superpowers-upstream/hooks/session-start`, then make these exact replacements:

```text
superpowers plugin -> superpower4tester plugin
legacy_skills_dir="${HOME}/.config/superpowers/skills" -> remove the legacy warning block entirely
using_superpowers_content -> using_superpower4tester_content
skills/using-superpowers/SKILL.md -> skills/using-superpower4tester/SKILL.md
You have superpowers. -> You have superpower4tester.
superpowers:using-superpowers -> superpower4tester:using-superpower4tester
```

The resulting script must read `skills/using-superpower4tester/SKILL.md` and output one of `additional_context`, `hookSpecificOutput.additionalContext`, or `additionalContext` using the same platform branching as upstream.

- [ ] **Step 2: Create `hooks/run-hook.cmd`**

Copy `/home/vule/Documents/Codex/2026-06-02/superpowers-upstream/hooks/run-hook.cmd` unchanged.

- [ ] **Step 3: Create `hooks/hooks.json`**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 4: Create `hooks/hooks-cursor.json`**

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "command": "./hooks/run-hook.cmd session-start"
      }
    ]
  }
}
```

- [ ] **Step 5: Make hook scripts executable**

```bash
chmod +x hooks/session-start hooks/run-hook.cmd
```

- [ ] **Step 6: Verify hook output after the using skill exists**

Skip command execution until Task 8 creates `skills/using-superpower4tester/SKILL.md`. Add this command to the Task 8 verification:

```bash
hooks/session-start | grep -q "using-superpower4tester"
```

- [ ] **Step 7: Commit Task 5**

```bash
git add hooks/session-start hooks/run-hook.cmd hooks/hooks.json hooks/hooks-cursor.json
git commit -m "feat: add session bootstrap hooks"
```

### Task 6: OpenCode Plugin And Install Guide

**Files:**
- Create: `.opencode/plugins/superpower4tester.js`
- Create: `.opencode/INSTALL.md`

- [ ] **Step 1: Create `.opencode/plugins/superpower4tester.js`**

Use `/home/vule/Documents/Codex/2026-06-02/superpowers-upstream/.opencode/plugins/superpowers.js` as the implementation reference. Apply these changes:

```text
Superpowers plugin for OpenCode.ai -> superpower4tester plugin for OpenCode.ai
SuperpowersPlugin -> Superpower4TesterPlugin
superpowersSkillsDir -> testerSkillsDir
../../skills stays ../../skills
using-superpowers -> using-superpower4tester
You have superpowers. -> You have superpower4tester.
superpowers/brainstorming -> superpower4tester/tester-scope-discovery
```

Keep only the context injection and skills path registration behavior from upstream. Do not add OpenCode MCP auto-registration in v1 unless a smoke test proves it works. The `.opencode/INSTALL.md` fallback is the verified route for MCP.

- [ ] **Step 2: Create `.opencode/INSTALL.md`**

````markdown
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
````

- [ ] **Step 3: Verify OpenCode files parse**

Run:

```bash
node --check .opencode/plugins/superpower4tester.js
test -f .opencode/INSTALL.md
```

Expected: no syntax error and no command output from `test`.

- [ ] **Step 4: Commit Task 6**

```bash
git add .opencode/plugins/superpower4tester.js .opencode/INSTALL.md
git commit -m "feat: add opencode plugin support"
```

### Task 7: Skill Frontmatter Test

**Files:**
- Create: `tests/skill-frontmatter.test.mjs`

- [ ] **Step 1: Create `tests/skill-frontmatter.test.mjs`**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const expectedSkills = [
  'using-superpower4tester',
  'tester-scope-discovery',
  'testcase-design-first',
  'writing-test-plans',
  'generate-testcase-json',
  'ui-discovery-with-chrome-devtools',
  'testcase-quality-review',
  'executing-test-runs',
  'execute-testcase-json',
  'defect-root-cause-capture',
  'evidence-before-result',
  'parallel-test-analysis',
  'subagent-driven-testing',
  'maintaining-tester-skills'
];

const forbiddenUpstreamNames = new Set([
  'brainstorming',
  'writing-plans',
  'executing-plans',
  'verification-before-completion',
  'systematic-debugging',
  'requesting-code-review',
  'dispatching-parallel-agents',
  'subagent-driven-development',
  'writing-skills',
  'test-driven-development',
  'finishing-a-development-branch',
  'using-git-worktrees',
  'receiving-code-review'
]);

const parseFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, 'missing YAML frontmatter');
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':');
    if (index > 0) {
      frontmatter[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return frontmatter;
};

test('all expected tester skills exist with matching names', () => {
  for (const skill of expectedSkills) {
    const file = path.join('skills', skill, 'SKILL.md');
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(content);
    assert.equal(frontmatter.name, skill, file);
    assert.ok(frontmatter.description.startsWith('Use when'), `${skill} description must start with Use when`);
  }
});

test('runtime skill directories do not keep upstream Superpowers names', () => {
  const dirs = fs.readdirSync('skills', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const dir of dirs) {
    assert.equal(forbiddenUpstreamNames.has(dir), false, `${dir} collides with upstream`);
  }
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test
```

Expected: fail because skill files do not exist.

- [ ] **Step 3: Commit test before skills**

```bash
git add tests/skill-frontmatter.test.mjs
git commit -m "test: add tester skill frontmatter contract"
```

### Task 8: Core Tester Skills

**Files:**
- Create all `skills/*/SKILL.md` listed in Task 7.

- [ ] **Step 1: Create every skill directory**

```bash
mkdir -p \
  skills/using-superpower4tester \
  skills/tester-scope-discovery \
  skills/testcase-design-first \
  skills/writing-test-plans \
  skills/generate-testcase-json \
  skills/ui-discovery-with-chrome-devtools \
  skills/testcase-quality-review \
  skills/executing-test-runs \
  skills/execute-testcase-json \
  skills/defect-root-cause-capture \
  skills/evidence-before-result \
  skills/parallel-test-analysis \
  skills/subagent-driven-testing \
  skills/maintaining-tester-skills
```

- [ ] **Step 2: Write `skills/using-superpower4tester/SKILL.md`**

Include these required sections:

```markdown
---
name: using-superpower4tester
description: Use when starting a tester-focused session, generating testcase JSON, inspecting UI, executing test cases, or deciding which tester workflow skill to invoke
---

# Using superpower4tester

## Priority

1. Current user request and explicit scope.
2. Safety guardrails for production, destructive actions, credentials, payments, emails, uploads, and deletes.
3. Current requirements, UI evidence, testcase files, and runtime state.
4. `testcase.json` schema and quality rules.
5. Chrome DevTools MCP evidence.
6. Tester workflow skills.

## Turn Start Rule

Before testcase design, UI inspection, execution, result writing, or defect analysis, invoke the smallest relevant superpower4tester skill.

## Skill Map

- Unclear scope: `tester-scope-discovery`
- Before generation or execution: `testcase-design-first`
- Multi-step campaign planning: `writing-test-plans`
- Generate cases: `generate-testcase-json`
- Inspect UI: `ui-discovery-with-chrome-devtools`
- Review cases: `testcase-quality-review`
- Execute a plan: `executing-test-runs`
- Execute an existing file: `execute-testcase-json`
- Failed behavior: `defect-root-cause-capture`
- Before reporting completion: `evidence-before-result`
- Independent modules: `parallel-test-analysis` or `subagent-driven-testing`

## Non-Negotiable Output Rules

- Output file is `testcase.json`.
- Do not group multiple behaviors into one testcase.
- Titles start with `Xác nhận`, `Xác minh`, or `Kiểm tra`.
- Status is `PASS`, `FAIL`, or `PENDING`.
- Do not set `PASS` or `FAIL` without fresh evidence.
```

- [ ] **Step 3: Write the remaining skill files**

Each file must use the exact `name` from its directory and a `description` starting with `Use when`. Include the indicated body sections:

| Skill | Required sections |
| --- | --- |
| `tester-scope-discovery` | When to ask scope questions; one question at a time; inputs needed: docs, URL, account/session, module, roles, environment; when to proceed without asking. |
| `testcase-design-first` | Ordered workflow: understand docs/UI, design granular cases, run quality review, execute, write observed results, summarize gaps. |
| `writing-test-plans` | How to create test plans with source docs, UI discovery targets, testcase groups, execution order, evidence requirements, validation commands. |
| `generate-testcase-json` | How to generate `testcase.json`; exact schema; no grouping; realistic data; Vietnamese title prefixes; use UI evidence when available. |
| `ui-discovery-with-chrome-devtools` | Use `take_snapshot` before actions; use screenshots for visual assertions; inspect console/network when relevant; do not guess labels. |
| `testcase-quality-review` | Review checklist for schema, titles, grouping, data realism, one expected result, negative cases, role/state coverage, status/comment quality. |
| `executing-test-runs` | Execute a written test plan; safety preflight; per-case execution loop; update results; leave blocked cases `PENDING`. |
| `execute-testcase-json` | Execute existing `testcase.json`; do not redesign cases; validate first; update only result columns unless testcase is invalid. |
| `defect-root-cause-capture` | Capture failing step, data, expected vs actual, UI evidence, console/network evidence, likely field/module; do not fix app code. |
| `evidence-before-result` | No `PASS`/`FAIL` without evidence; acceptable evidence sources; blocked state handling; final report requirements. |
| `parallel-test-analysis` | Split independent modules only; give each agent isolated scope; merge and quality-review outputs. |
| `subagent-driven-testing` | Fresh subagent per suite; review generated cases; review evidence/results; stop on shared-state or destructive risk. |
| `maintaining-tester-skills` | Adapted skill maintenance guidance; use tests for skill frontmatter and trigger behavior; avoid upstream name collisions. |

- [ ] **Step 4: Verify skill frontmatter**

Run:

```bash
npm test
hooks/session-start | grep -q "using-superpower4tester"
```

Expected: tests pass and hook grep exits 0.

- [ ] **Step 5: Commit Task 8**

```bash
git add skills hooks/session-start tests/skill-frontmatter.test.mjs
git commit -m "feat: add tester workflow skills"
```

### Task 9: Installation Documentation

**Files:**
- Create: `docs/install/codex.md`
- Create: `docs/install/claude-code.md`
- Create: `docs/install/cursor.md`
- Create: `docs/install/gemini.md`
- Create: `docs/install/opencode.md`
- Modify: `README.md`

- [ ] **Step 1: Create `docs/install/codex.md`**

Include:

````markdown
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
````

- [ ] **Step 2: Create docs for Claude, Cursor, Gemini, and OpenCode**

Each doc must include:

- plugin manifest path
- Chrome DevTools MCP route from the spec table
- manual fallback command or UI path
- note that Chrome DevTools MCP can inspect browser content and should not be used with sensitive production data

Use exact fallback commands:

```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@1.1.1
gemini mcp add chrome-devtools npx chrome-devtools-mcp@1.1.1
```

For Cursor, document:

```text
Cursor Settings -> MCP -> New MCP Server -> npx -y chrome-devtools-mcp@1.1.1
```

For OpenCode, document the `opencode.json` block from Task 6.

- [ ] **Step 3: Update `README.md`**

Add links:

```markdown
## Installation

- [Codex](docs/install/codex.md)
- [Claude Code](docs/install/claude-code.md)
- [Cursor](docs/install/cursor.md)
- [Gemini CLI](docs/install/gemini.md)
- [OpenCode](docs/install/opencode.md)
```

- [ ] **Step 4: Verify docs exist**

Run:

```bash
for f in docs/install/codex.md docs/install/claude-code.md docs/install/cursor.md docs/install/gemini.md docs/install/opencode.md; do test -s "$f"; done
rg -n "Chrome DevTools MCP|chrome-devtools-mcp@1.1.1" docs/install README.md
```

Expected: `test` loop exits 0 and `rg` prints matches in all install docs.

- [ ] **Step 5: Commit Task 9**

```bash
git add docs/install README.md
git commit -m "docs: add harness installation guides"
```

### Task 10: Local Browser Fixture And Dry-Run Workflow

**Files:**
- Create: `tests/fixtures/test-page.html`
- Create: `tests/fixtures/browser-smoke-testcase.json`
- Modify: `package.json`

- [ ] **Step 1: Create `tests/fixtures/test-page.html`**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <title>superpower4tester fixture</title>
  </head>
  <body>
    <main>
      <h1>Đăng nhập</h1>
      <label>Email <input id="email" name="email" type="email"></label>
      <label>Mật khẩu <input id="password" name="password" type="password"></label>
      <button id="login">Đăng nhập</button>
      <button id="delete-account" data-dangerous="true">Xóa tài khoản</button>
      <p id="message" role="status"></p>
    </main>
    <script>
      document.querySelector('#login').addEventListener('click', () => {
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const message = document.querySelector('#message');
        if (!email) {
          message.textContent = 'Vui lòng nhập email.';
          return;
        }
        if (email === 'tester@example.com' && password === 'Test@123456') {
          message.textContent = 'Đăng nhập thành công.';
          return;
        }
        message.textContent = 'Thông tin đăng nhập không đúng.';
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Create `tests/fixtures/browser-smoke-testcase.json`**

Include three cases:

- `TC001` expected PASS for successful login.
- `TC002` expected FAIL by intentionally expecting `Chuyển đến trang tổng quan.` while fixture shows `Đăng nhập thành công.`
- `TC003` expected PENDING for `Xóa tài khoản` destructive action.

Use the same exact JSON schema from Task 2.

- [ ] **Step 3: Add package smoke command**

Modify `package.json` scripts:

```json
"smoke:browser-doc": "node scripts/validate-testcase-json.mjs tests/fixtures/browser-smoke-testcase.json && echo \"Use Chrome DevTools MCP to open tests/fixtures/test-page.html for browser smoke execution\""
```

- [ ] **Step 4: Verify fixture schema**

Run:

```bash
npm run smoke:browser-doc
```

Expected: validates the browser smoke testcase file and prints the browser smoke instruction.

- [ ] **Step 5: Commit Task 10**

```bash
git add tests/fixtures/test-page.html tests/fixtures/browser-smoke-testcase.json package.json
git commit -m "test: add browser smoke fixtures"
```

### Task 11: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run all script and manifest checks**

```bash
npm test
npm run validate:sample
npm run summarize:sample
npm run normalize:sample
npm run validate:codex-plugin
npm run check:mcp
node --check .opencode/plugins/superpower4tester.js
hooks/session-start | grep -q "using-superpower4tester"
bad1='superpower5''tester'
bad2='writing-skills''/SKILL'
bad3='opencode''/plugin.json'
rg -n "$bad1|$bad2|$bad3" . && exit 1 || true
```

Expected:

- all npm commands exit 0
- Codex validator prints `Plugin validation passed`
- `npx -y chrome-devtools-mcp@1.1.1 --help` exits 0
- OpenCode plugin has no syntax error
- hook grep exits 0
- forbidden string scan exits 0 because no forbidden strings are present

- [ ] **Step 2: Run self-review against design**

Check these requirements manually:

- Multi-harness files exist.
- Codex manifest uses `.mcp.json` and no unsupported `hooks` field.
- Claude/Cursor/Gemini manifests include inline `mcpServers`.
- OpenCode install guide includes verified `opencode.json` fallback.
- Hook files point to `using-superpower4tester`.
- Runtime skill names do not collide with upstream Superpowers names.
- Safety guardrails are present in `execute-testcase-json`, `executing-test-runs`, and `evidence-before-result`.
- Validator rejects grouped cases and warns on destructive cases.

- [ ] **Step 3: Commit final verification notes if any docs changed**

If no files changed, skip this commit. If README or docs changed during final review:

```bash
git add README.md docs/
git commit -m "docs: finalize superpower4tester verification notes"
```

- [ ] **Step 4: Report implementation result**

Report:

- files changed
- verification commands and results
- known gap: Codex turn-start bootstrap is not enforced unless a valid hook surface is found
- known gap: OpenCode MCP auto-registration is not guaranteed; `opencode.json` fallback is the verified route

---

## Execution Choice

Plan complete and saved to `docs/superpowers/plans/2026-06-02-superpower4tester-implementation.md`.

1. Subagent-Driven (recommended): dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution: execute tasks in this session using executing-plans with checkpoints.
