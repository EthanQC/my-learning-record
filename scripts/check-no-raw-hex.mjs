// D1：组件层禁止出现 hex。唯一豁免：src/styles/tokens.css（token 单一来源）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(repoRoot, 'apps', 'web', 'src');
const EXEMPT = [path.join(srcRoot, 'styles', 'tokens.css')];
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(tsx|ts|css)$/.test(entry.name)) continue;
    if (EXEMPT.includes(full)) continue;
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(HEX_RE);
      if (m) violations.push(`${path.relative(repoRoot, full)}:${i + 1}  ${m.join(' ')}`);
    });
  }
}

walk(srcRoot);

if (violations.length) {
  console.error('组件层出现裸 hex（D1 违规）:\n' + violations.join('\n'));
  process.exit(1);
}
console.log('check-no-raw-hex: OK（组件层无裸 hex）');
