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
