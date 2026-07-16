// §6：三主题编进同一份 CSS，全站 CSS gzip 总量预算见下，CI build 门禁附带 size check
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const cssDir = path.join(process.cwd(), 'apps', 'web', '.next', 'static');
// 预算 80KB:用户 2026-07-13 裁决(规格冲突:D3 字体切片管线自身占 ~65KB,设计 CSS 实测 6.3KB;原 §6 预算 50KB 与 D3 不可兼得,总量口径放宽)
const LIMIT = 80 * 1024;
// §6 子指标：三主题增量（token 块 + [data-theme] 作用域装饰规则）合计 ≤10KB gzip。
// 80KB 裁决只放宽了总量口径（字体切片挤占），未触及此子指标。
const THEME_LIMIT = 10 * 1024;

// 从（压缩后）CSS 里抽出所有 selector 含 [data-theme 的规则；@media/@supports 递归取内部。
// 括号配对扫描对预算门禁足够精确（url()/字符串内出现花括号的场景在本站产物中不存在）。
function extractThemeCss(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const brace = css.indexOf('{', i);
    if (brace === -1) break;
    const selector = css.slice(i, brace).trim();
    let depth = 1;
    let j = brace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(brace + 1, j - 1);
    if (selector.startsWith('@media') || selector.startsWith('@supports')) {
      out += extractThemeCss(body);
    } else if (selector.includes('[data-theme')) {
      out += `${selector}{${body}}`;
    }
    i = j;
  }
  return out;
}

if (!fs.existsSync(cssDir)) {
  console.error('check-css-size: 未找到 apps/web/.next/static，先执行 next build');
  process.exit(1);
}

let total = 0;
let themeCss = '';
const rows = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith('.css')) {
      const css = fs.readFileSync(full, 'utf8');
      const gz = gzipSync(css).length;
      total += gz;
      themeCss += extractThemeCss(css);
      rows.push(`  ${path.relative(cssDir, full)}  ${(gz / 1024).toFixed(1)}KB gzip`);
    }
  }
}

walk(cssDir);
const themeGz = gzipSync(themeCss).length;
console.log(rows.join('\n'));
console.log(`check-css-size: 合计 ${(total / 1024).toFixed(1)}KB gzip（预算 ${LIMIT / 1024}KB）`);
console.log(
  `check-css-size: 三主题增量（[data-theme] 作用域规则）${(themeGz / 1024).toFixed(1)}KB gzip（子预算 ${THEME_LIMIT / 1024}KB）`
);
if (total > LIMIT) {
  console.error('CSS 超出 §6 体积预算');
  process.exit(1);
}
if (themeGz > THEME_LIMIT) {
  console.error('三主题增量超出 §6 的 10KB 子预算');
  process.exit(1);
}
