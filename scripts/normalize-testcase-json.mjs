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
