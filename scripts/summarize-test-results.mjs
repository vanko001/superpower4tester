#!/usr/bin/env node
import { normalizeCases, summarizeCases, validateCases } from './lib/testcase-schema.mjs';
import { readJsonFileForCli } from './lib/cli-io.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: summarize-test-results <testcase.json>');
  process.exit(2);
}

const data = readJsonFileForCli(file);
const result = validateCases(data);
if (!result.valid) {
  for (const error of result.errors) {
    console.error(error);
  }
  process.exit(1);
}

const cases = normalizeCases(data);
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
