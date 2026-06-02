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
