import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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

test('validator rejects an empty testcase file', () => {
  const result = validateCases([]);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /at least one testcase/);
});

test('validator rejects grouped testcase content', () => {
  const cases = readFixture('grouped-invalid-testcase.json');
  const result = validateCases(cases);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /TC001.*grouped/i);
});

test('validator rejects missing and unexpected columns before normalization', () => {
  const result = validateCases([
    {
      ID: 'TC001',
      TITLE: 'Xác minh thông báo lỗi khi bỏ trống email',
      STEPS: ['B1: Mở trang đăng nhập.'],
      DATATEST: 'Email: <trống>',
      'EXPECTED RESULT': 'Hiển thị lỗi bắt buộc nhập email.',
      STATUS: 'PENDING',
      COMMENT: '',
      EXTRA: 'unexpected'
    }
  ]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /missing column ACTUAL RESULT/);
  assert.match(result.errors.join('\n'), /unexpected column EXTRA/);
});

test('validator requires ACTUAL RESULT for PASS cases', () => {
  const result = validateCases([
    {
      ID: 'TC001',
      TITLE: 'Kiểm tra đăng nhập thành công với tài khoản hợp lệ',
      STEPS: ['B1: Mở trang đăng nhập.', 'B2: Bấm nút Đăng nhập.'],
      DATATEST: 'Email: tester@example.com; Mật khẩu: Test@123456',
      'EXPECTED RESULT': 'Chuyển đến trang tổng quan.',
      'ACTUAL RESULT': '',
      STATUS: 'PASS',
      COMMENT: ''
    }
  ]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /PASS requires ACTUAL RESULT/);
});

test('validator rejects steps that are not numbered reproduction steps', () => {
  const result = validateCases([
    {
      ID: 'TC001',
      TITLE: 'Xác nhận lỗi khi mật khẩu sai',
      STEPS: ['Open the login page.'],
      DATATEST: 'Email: tester@example.com; Mật khẩu: Wrong@123',
      'EXPECTED RESULT': 'Hiển thị lỗi thông tin đăng nhập không đúng.',
      'ACTUAL RESULT': '',
      STATUS: 'PENDING',
      COMMENT: ''
    }
  ]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /STEPS must use B1:/);
});

test('validator allows a single behavior step that mentions email and password', () => {
  const result = validateCases([
    {
      ID: 'TC001',
      TITLE: 'Kiểm tra đăng nhập thành công với tài khoản hợp lệ',
      STEPS: [
        'B1: Open the login page.',
        'B2: Enter email and password.',
        'B3: Click Login.'
      ],
      DATATEST: 'Email: tester@example.com; Password: Test@123456',
      'EXPECTED RESULT': 'Chuyển đến trang tổng quan.',
      'ACTUAL RESULT': '',
      STATUS: 'PENDING',
      COMMENT: ''
    }
  ]);

  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('validator accepts the Vietnamese title prefix kiểm tra case-insensitively', () => {
  const result = validateCases([
    {
      ID: 'TC001',
      TITLE: 'kiểm tra đăng nhập thành công với tài khoản hợp lệ',
      STEPS: ['B1: Mở trang đăng nhập.'],
      DATATEST: 'Email: tester@example.com; Mật khẩu: Test@123456',
      'EXPECTED RESULT': 'Chuyển đến trang tổng quan.',
      'ACTUAL RESULT': '',
      STATUS: 'PENDING',
      COMMENT: ''
    }
  ]);

  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
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

test('validate CLI reports malformed JSON without a stack trace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpower4tester-'));
  const file = path.join(dir, 'bad.json');
  fs.writeFileSync(file, '{bad json');

  const result = spawnSync('node', ['scripts/validate-testcase-json.mjs', file], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid JSON/);
  assert.doesNotMatch(result.stderr, /SyntaxError|at JSON\.parse/);
});

test('summary CLI reports malformed JSON without a stack trace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpower4tester-'));
  const file = path.join(dir, 'bad.json');
  fs.writeFileSync(file, '{bad json');

  const result = spawnSync('node', ['scripts/summarize-test-results.mjs', file], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid JSON/);
  assert.doesNotMatch(result.stderr, /SyntaxError|at JSON\.parse/);
});

test('summary CLI rejects invalid testcase schema instead of counting it', () => {
  const result = spawnSync('node', ['scripts/summarize-test-results.mjs', 'tests/fixtures/grouped-invalid-testcase.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /grouped testcase/i);
  assert.equal(result.stdout, '');
});

test('summary CLI prints status counts', () => {
  const result = spawnSync('node', ['scripts/summarize-test-results.mjs', 'tests/fixtures/valid-testcase.json'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PASS: 1/);
  assert.match(result.stdout, /FAIL: 1/);
  assert.match(result.stdout, /PENDING: 1/);
});

test('normalize CLI reports malformed JSON without a stack trace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpower4tester-'));
  const file = path.join(dir, 'bad.json');
  fs.writeFileSync(file, '{bad json');

  const result = spawnSync('node', ['scripts/normalize-testcase-json.mjs', file, '--check'], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid JSON/);
  assert.doesNotMatch(result.stderr, /SyntaxError|at JSON\.parse/);
});

test('normalize CLI check mode leaves valid fixture stable', () => {
  const result = spawnSync('node', ['scripts/normalize-testcase-json.mjs', 'tests/fixtures/valid-testcase.json', '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /already normalized/i);
});
