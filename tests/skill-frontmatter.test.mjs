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
