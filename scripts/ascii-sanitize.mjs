import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REPLACEMENTS = [
  ['\uFEFF', ''],
  ['\u2014', '--'],
  ['\u2013', '-'],
  ['\u2192', '->'],
  ['\u2190', '<-'],
  ['\u2193', 'v'],
  ['\u2191', '^'],
  ['\u00D7', 'x'],
  ['\u00F7', '/'],
  ['\u2212', '-'],
  ['\u2265', '>='],
  ['\u2264', '<='],
  ['\u2248', '~'],
  ['\u00B2', '^2'],
  ['\u00B3', '^3'],
  ['\u00B7', '.'],
  ['\u23F8', '[paused]'],
  ['\u2026', '...'],
  ['\u2500', '-'],
  ['\u2501', '-'],
  ['\u2018', "'"],
  ['\u2019', "'"],
  ['\u201C', '"'],
  ['\u201D', '"'],
  ['\uFFFD', '-'],
  ['\u00F8', 'o'],
];

const SKIP = new Set(['node_modules', '.git', 'scripts', '.vs']);
const EXT = new Set(['.js', '.mjs', '.md', '.html', '.json', '.cff', '.txt', '.css']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (
      EXT.has(path.extname(ent.name).toLowerCase())
      || ent.name === 'LICENSE'
      || ent.name === 'CITATION.cff'
    ) out.push(p);
  }
  return out;
}

function asciiify(text) {
  let out = text;
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to);
  return out.replace(/[^\x00-\x7F]/g, '?');
}

let changed = 0;
for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  const next = asciiify(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
    console.log('updated:', path.relative(ROOT, file));
  }
}
console.log(`files changed: ${changed}`);
