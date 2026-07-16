import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 基于本文件定位，不依赖 cwd（此前硬编码仓库根前缀，导致从 apps/web 跑会 ENOENT）
const css = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/styles/tokens.css'),
  'utf8'
);

const CHANNEL_TOKENS = [
  '--c-bg', '--c-surface', '--c-text', '--c-text-2', '--c-text-3', '--c-text-muted',
  '--c-border', '--c-border-2', '--c-accent', '--c-accent-strong', '--c-accent-text',
  '--c-on-accent', '--c-track-deep', '--c-track-deep-dim', '--c-track-intro',
  '--c-track-intro-dim', '--c-rail-deep-outline', '--c-focus-ring',
];
const VALUE_TOKENS = [
  '--surface-tint', '--accent-soft', '--theme-color', '--font-display',
  '--shadow-card', '--shadow-card-hover', '--shadow-headline', '--shadow-pill',
  '--glow-hover',
];

test('三主题各自声明全部 token', () => {
  for (const theme of ['duo', 'editorial', 'night']) {
    const m = css.match(new RegExp(`\\[data-theme='${theme}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`));
    assert.ok(m, `缺少 [data-theme='${theme}'] 块`);
    for (const t of [...CHANNEL_TOKENS, ...VALUE_TOKENS]) {
      assert.ok(m![1].includes(`${t}:`), `${theme} 缺 ${t}`);
    }
  }
});

test('D1 关键色值抽查（AA 修正值，不回抄 mockup）', () => {
  assert.match(css, /--c-accent: 236 90 135/);        // duo #EC5A87
  assert.match(css, /--c-text-3: 122 110 118/);       // duo AA 修正 #7A6E76
  assert.match(css, /--c-accent-strong: 198 58 100/); // duo AA 修正 #C63A64
  assert.match(css, /--c-accent: 194 37 92/);         // editorial #C2255C
  assert.match(css, /--c-text-3: 117 103 112/);       // editorial AA 修正 #756770
  assert.match(css, /--c-track-deep: 201 191 206/);   // night 月白 #C9BFCE
  assert.match(css, /--c-text-3: 148 138 155/);       // night AA 修正 #948A9B
  assert.match(css, /--surface-tint: rgb\(242 118 159 \/ 0\.08\)/); // night
  assert.match(css, /--accent-soft: rgb\(242 118 159 \/ 0\.4\)/);   // night
});

test('机制约束：color-scheme / :root 兜底 / 动效 token', () => {
  // brief 原文此处带 /s (dotAll) 标志，但 tsconfig target=ES2017 不支持（TS1501）；
  // [^}]* 否定类本身可跨行匹配，/s 功能冗余，按评审确认移除——brief 代码缺陷修复
  assert.match(css, /\[data-theme='night'\][^}]*color-scheme: dark/);
  assert.match(css, /:root,\s*\[data-theme='duo'\]/); // :root 放 duo 值兜底（D1）
  assert.match(css, /--dur-fast: 150ms/);
  assert.match(css, /--dur-base: 250ms/);
  assert.match(css, /--ease-standard: cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.match(css, /--theme-color: #FDFBFC/);
  assert.match(css, /--theme-color: #FAF6F3/);
  assert.match(css, /--theme-color: #171219/);
});
