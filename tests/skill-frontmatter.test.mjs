import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateCases } from '../scripts/lib/testcase-schema.mjs';

const expectedSkills = [
  'using-superpower4tester',
  'tester-scope-discovery',
  'testcase-design-first',
  'blackbox-edgecase-design',
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

test('generate-testcase-json example follows the validated schema', () => {
  const content = fs.readFileSync(path.join('skills', 'generate-testcase-json', 'SKILL.md'), 'utf8');
  const match = content.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match, 'generate-testcase-json must include a JSON example');

  const cases = JSON.parse(match[1]);
  assert.equal(Array.isArray(cases[0].STEPS), true, 'example STEPS must be an array');
  assert.match(
    cases[0]['EXPECTED RESULT'],
    /trang chủ của người dùng sau khi đăng nhập thành công/,
    'example EXPECTED RESULT must be specific enough to understand the expected state'
  );
  assert.equal(validateCases(cases).valid, true, 'example must pass testcase validation');
});

test('testcase design skills include black-box edgecase heuristics', () => {
  const designFirst = fs.readFileSync(path.join('skills', 'testcase-design-first', 'SKILL.md'), 'utf8');
  const blackbox = fs.readFileSync(path.join('skills', 'blackbox-edgecase-design', 'SKILL.md'), 'utf8');
  const generator = fs.readFileSync(path.join('skills', 'generate-testcase-json', 'SKILL.md'), 'utf8');
  const quality = fs.readFileSync(path.join('skills', 'testcase-quality-review', 'SKILL.md'), 'utf8');
  const using = fs.readFileSync(path.join('skills', 'using-superpower4tester', 'SKILL.md'), 'utf8');
  const plan = fs.readFileSync(path.join('skills', 'writing-test-plans', 'SKILL.md'), 'utf8');
  const combined = `${designFirst}\n${blackbox}\n${generator}\n${quality}\n${using}\n${plan}`;

  for (const keyword of [
    'Risk-Based Testing',
    'State Transition Testing',
    'SFDPOT',
    'Equivalence Partitioning',
    'Boundary Value Analysis',
    'Decision Table',
    'Pairwise Testing',
    'Negative Testing',
    'Integration',
    'AI QA / Agent Testing'
  ]) {
    assert.match(combined, new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing ${keyword}`);
  }

  assert.match(generator, /Enhanced Black-Box Prompt/);
  assert.match(quality, /Edgecase Coverage/);
  assert.match(using, /Black-box edgecase design: `blackbox-edgecase-design`/);
  assert.match(plan, /Black-box edgecase matrix/);
});

test('testcase generation requires a status oracle coverage matrix', () => {
  const generator = fs.readFileSync(path.join('skills', 'generate-testcase-json', 'SKILL.md'), 'utf8');
  const quality = fs.readFileSync(path.join('skills', 'testcase-quality-review', 'SKILL.md'), 'utf8');

  for (const keyword of [
    'Status Oracle Matrix',
    'expected status',
    'expected reason',
    'rule priority',
    'true_warning',
    'invalidate'
  ]) {
    assert.match(generator, new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `generator missing ${keyword}`);
  }

  for (const keyword of [
    'Status oracle coverage',
    'true',
    'true_warning',
    'invalidate',
    'confirm',
    'audit'
  ]) {
    assert.match(quality, new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `quality review missing ${keyword}`);
  }
});

test('UI testcase generation requires browser evidence before final expected results', () => {
  const designFirst = fs.readFileSync(path.join('skills', 'testcase-design-first', 'SKILL.md'), 'utf8');
  const generator = fs.readFileSync(path.join('skills', 'generate-testcase-json', 'SKILL.md'), 'utf8');
  const quality = fs.readFileSync(path.join('skills', 'testcase-quality-review', 'SKILL.md'), 'utf8');
  const uiDiscovery = fs.readFileSync(path.join('skills', 'ui-discovery-with-chrome-devtools', 'SKILL.md'), 'utf8');

  for (const [label, content] of [
    ['testcase-design-first', designFirst],
    ['generate-testcase-json', generator],
    ['testcase-quality-review', quality],
    ['ui-discovery-with-chrome-devtools', uiDiscovery]
  ]) {
    assert.match(content, /Browser Evidence Map/, `${label} must require a Browser Evidence Map`);
  }

  assert.match(generator, /MUST run `ui-discovery-with-chrome-devtools` before finalizing UI testcase JSON/);
  assert.match(generator, /do not finalize the testcase set/);
  assert.match(quality, /Reject UI testcase files that do not include browser evidence/);
});
