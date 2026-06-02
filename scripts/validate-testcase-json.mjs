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
