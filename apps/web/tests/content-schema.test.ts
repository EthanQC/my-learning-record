import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontmatterSchema } from '../src/lib/content-schema';

test('必填字段齐全时通过，且补默认值', () => {
  const fm = frontmatterSchema.parse({
    title: 'x', date: '2026-07-01', track: 'deep', summary: 's',
  });
  assert.equal(fm.track, 'deep');
  assert.deepEqual(fm.tags, []);        // §3: tags 默认 []
  assert.equal(fm.draft, false);        // §3: draft 默认 false
  assert.ok(fm.date instanceof Date);
});

test('gray-matter 解析出的 Date 对象也能通过', () => {
  const fm = frontmatterSchema.parse({
    title: 'x', date: new Date('2026-07-01'), track: 'intro', summary: 's',
  });
  assert.equal(fm.date.getUTCFullYear(), 2026);
});

test('track 非法时抛错', () => {
  assert.throws(() =>
    frontmatterSchema.parse({ title: 'x', date: '2026-07-01', track: 'blog', summary: 's' })
  );
});

test('缺 title / date 不可解析时抛错', () => {
  assert.throws(() => frontmatterSchema.parse({ date: '2026-07-01', track: 'deep', summary: 's' }));
  assert.throws(() => frontmatterSchema.parse({ title: 'x', date: '不是日期', track: 'deep', summary: 's' }));
});
