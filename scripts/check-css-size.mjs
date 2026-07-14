// §6：三主题编进同一份 CSS，全站 CSS gzip 总量预算见下，CI build 门禁附带 size check
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const cssDir = path.join(process.cwd(), 'apps', 'web', '.next', 'static');
// 预算 80KB:用户 2026-07-13 裁决(规格冲突:D3 字体切片管线自身占 ~65KB,设计 CSS 实测 6.3KB;原 §6 预算 50KB 与 D3 不可兼得,总量口径放宽)
const LIMIT = 80 * 1024;

if (!fs.existsSync(cssDir)) {
  console.error('check-css-size: 未找到 apps/web/.next/static，先执行 next build');
  process.exit(1);
}

let total = 0;
const rows = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith('.css')) {
      const gz = gzipSync(fs.readFileSync(full)).length;
      total += gz;
      rows.push(`  ${path.relative(cssDir, full)}  ${(gz / 1024).toFixed(1)}KB gzip`);
    }
  }
}

walk(cssDir);
console.log(rows.join('\n'));
console.log(`check-css-size: 合计 ${(total / 1024).toFixed(1)}KB gzip（预算 ${LIMIT / 1024}KB）`);
if (total > LIMIT) {
  console.error('CSS 超出 §6 体积预算');
  process.exit(1);
}
