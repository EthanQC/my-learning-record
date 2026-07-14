import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RailTab, EmptyTrackNotice } from '../src/components/RailTab';

test('RailTab：tablist 语义 + 双 tab + 移动端不删减的全文标签（§5）', () => {
  const html = renderToStaticMarkup(createElement(RailTab));
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /aria-label="内容轨道"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 2);
  assert.match(html, /aria-controls="track-panel-deep"/);
  assert.match(html, /aria-controls="track-panel-intro"/);
  assert.ok(html.includes('深度线 · 给工程师'));
  assert.ok(html.includes('科普线 · 给所有人'));
  // SSG 默认 deep 选中，roving tabindex：选中 0 / 未选中 -1
  assert.match(html, /aria-selected="true"[^>]*tabindex="0"|tabindex="0"[^>]*aria-selected="true"/);
  assert.match(html, /tabindex="-1"/);
});

test('EmptyTrackNotice：轨道空态精确文案（§5 404 与空态）', () => {
  const deep = renderToStaticMarkup(createElement(EmptyTrackNotice, { track: 'deep' }));
  assert.ok(deep.includes('深度线首篇打磨中 · 先沿科普线逛逛 →'));
  const intro = renderToStaticMarkup(createElement(EmptyTrackNotice, { track: 'intro' }));
  assert.ok(intro.includes('科普线首篇打磨中 · 先沿深度线逛逛 →'));
});
