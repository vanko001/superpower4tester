import fs from 'node:fs';

export function readTextFileForCli(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    const message = error && error.code === 'ENOENT'
      ? `Cannot read file: ${file}`
      : `Failed to read file ${file}: ${error.message}`;
    console.error(message);
    process.exit(1);
  }
}

export function parseJsonForCli(content, file) {
  try {
    return JSON.parse(content);
  } catch {
    console.error(`Invalid JSON in ${file}`);
    process.exit(1);
  }
}

export function readJsonFileForCli(file) {
  return parseJsonForCli(readTextFileForCli(file), file);
}
