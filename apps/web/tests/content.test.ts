import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllArticles } from '../src/lib/content';

test('加载夹具文章：过滤 draft、date 降序、字段完整', async () => {
  const articles = await getAllArticles();
  // draft-sample.mdx (draft: true) 不得出现
  assert.ok(!articles.some((a) => a.slug === 'draft-sample'));
  // 两篇夹具都在
  const deep = articles.find((a) => a.slug === 'hello-deep');
  const intro = articles.find((a) => a.slug === 'hello-intro');
  assert.ok(deep && intro);
  assert.ok(articles.some((a) => a.slug === 'context-engineering')); // 第二篇 deep 夹具
  assert.equal(deep!.track, 'deep');
  assert.equal(deep!.date, '2026-07-01');
  assert.deepEqual(deep!.tags, ['Go', '源码']);
  assert.ok(deep!.summary.length > 0);
  assert.equal(deep!.draft, false);
  assert.ok(deep!.readingMinutes >= 1);
  // 降序：2026-07-01 (deep) 在 2026-06-28 (intro) 之前
  assert.ok(articles.indexOf(deep!) < articles.indexOf(intro!));
});
