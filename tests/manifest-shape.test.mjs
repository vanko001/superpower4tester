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

test('Gemini context file exists and points to tester bootstrap skill', () => {
  const manifest = readJson('gemini-extension.json');
  assert.equal(manifest.contextFileName, 'GEMINI.md');

  const content = fs.readFileSync(manifest.contextFileName, 'utf8');
  assert.match(content, /skills\/using-superpower4tester\/SKILL\.md/);
  assert.doesNotMatch(content, /skills\/using-superpowers\/SKILL\.md/);
});

test('package root exports the OpenCode plugin entrypoint', () => {
  const manifest = readJson('package.json');
  const entrypoint = './.opencode/plugins/superpower4tester.js';

  assert.equal(manifest.type, 'module');
  assert.equal(manifest.main, entrypoint);
  assert.equal(manifest.exports, entrypoint);
  assert.equal(fs.existsSync(entrypoint), true);
});
