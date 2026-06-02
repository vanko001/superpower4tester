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
