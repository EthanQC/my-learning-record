import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { getArticleMDX } from '../src/lib/content';

test('编译 deep 夹具：标题 id、TOC、图片路径改写、shiki 多主题变量', async () => {
  const result = await getArticleMDX('deep', 'hello-deep');
  assert.ok(result);
  const { content, frontmatter, headings, readingMinutes } = result!;
  assert.equal(frontmatter.title.includes('net/http'), true);
  assert.ok(readingMinutes >= 1);
  // TOC 收集（迁移自旧 markdown.ts 的行为）
  assert.ok(headings.some((h) => h.title === '从 accept 开始' || h.title === '从 Accept 开始'));
  const html = renderToStaticMarkup(content);
  // 标题带 id
  assert.match(html, /<h2[^>]*id="/);
  // 图片被改写为 /article-assets 绝对路径（§6 图片链路）
  assert.match(html, /src="\/article-assets\/deep\/hello-deep\/diagram\.png"/);
  // shiki 多主题 CSS 变量（§6 代码高亮：defaultColor:false → 输出 --shiki-<theme>）
  assert.match(html, /--shiki-duo:/);
  assert.match(html, /--shiki-night:/);
});

test('不存在的 slug 返回 null；非法 track 返回 null', async () => {
  assert.equal(await getArticleMDX('deep', 'no-such-post'), null);
  assert.equal(await getArticleMDX('blog', 'hello-deep'), null);
});
