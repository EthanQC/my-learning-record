import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAllArticles } from '../src/lib/content';

// T20 评审发现修复:Option B 后真实夹具全 draft,此测试用临时合成夹具恢复非 draft 路径(映射/排序/过滤)的集成覆盖
test('getAllArticles 非 draft 路径：字段映射（ISO 日期/tags/summary/readingMinutes）+ 日期降序 + draft 过滤', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'content-mapping-'));
  const originalCwd = process.cwd();

  try {
    const deepDir = path.join(tmpRoot, 'content', 'articles', 'deep');
    const introDir = path.join(tmpRoot, 'content', 'articles', 'intro');
    fs.mkdirSync(deepDir, { recursive: true });
    fs.mkdirSync(introDir, { recursive: true });

    // 最新：deep 轨，2025-06-15
    fs.writeFileSync(
      path.join(deepDir, 'a-newest.mdx'),
      [
        '---',
        'title: 最新一篇（deep）',
        'date: 2025-06-15',
        'track: deep',
        'summary: "deep 轨最新摘要"',
        'tags: ["t-alpha", "t-beta"]',
        'draft: false',
        '---',
        '',
        '正文内容，用于验证 readingMinutes 计算。',
        '',
      ].join('\n'),
      'utf8',
    );

    // 居中：intro 轨，2022-03-10
    fs.writeFileSync(
      path.join(introDir, 'b-middle.mdx'),
      [
        '---',
        'title: 居中一篇（intro）',
        'date: 2022-03-10',
        'track: intro',
        'summary: "intro 轨居中摘要"',
        'tags: []',
        'draft: false',
        '---',
        '',
        '正文内容，intro 轨。',
        '',
      ].join('\n'),
      'utf8',
    );

    // 最旧：deep 轨，2020-01-01
    fs.writeFileSync(
      path.join(deepDir, 'c-oldest.mdx'),
      [
        '---',
        'title: 最旧一篇（deep）',
        'date: 2020-01-01',
        'track: deep',
        'summary: "deep 轨最旧摘要"',
        'tags: ["t-gamma"]',
        'draft: false',
        '---',
        '',
        '正文内容，最旧一篇。',
        '',
      ].join('\n'),
      'utf8',
    );

    // draft:true 混入，同一批次内复证过滤（不应出现在返回结果中）
    fs.writeFileSync(
      path.join(deepDir, 'd-draft.mdx'),
      [
        '---',
        'title: 应被过滤的草稿',
        'date: 2025-12-31',
        'track: deep',
        'summary: "不应出现"',
        'tags: ["should-not-appear"]',
        'draft: true',
        '---',
        '',
        '此文不应出现在 getAllArticles 结果中。',
        '',
      ].join('\n'),
      'utf8',
    );

    process.chdir(tmpRoot);
    const articles = await getAllArticles();

    // 过滤：4 篇夹具中 1 篇 draft，返回应为 3 篇
    assert.equal(articles.length, 3, `应过滤掉 draft 文章，剩 3 篇，实际 ${articles.length} 篇`);
    assert.ok(
      articles.every((a) => a.slug !== 'd-draft'),
      'draft 文章不应出现在返回结果中',
    );

    // 排序：日期降序（新 → 旧）
    assert.deepEqual(
      articles.map((a) => a.slug),
      ['a-newest', 'b-middle', 'c-oldest'],
      '应按 date 降序排列',
    );

    // 字段映射：ISO 日期字符串、tags/summary 透传、readingMinutes ≥ 1
    const newest = articles.find((a) => a.slug === 'a-newest')!;
    assert.equal(newest.date, '2025-06-15', 'date 应转换为 ISO yyyy-mm-dd 字符串');
    assert.equal(newest.track, 'deep');
    assert.deepEqual(newest.tags, ['t-alpha', 't-beta'], 'tags 应原样透传');
    assert.equal(newest.summary, 'deep 轨最新摘要', 'summary 应原样透传');
    assert.equal(newest.draft, false);
    assert.ok(newest.readingMinutes >= 1, 'readingMinutes 应至少为 1');

    const middle = articles.find((a) => a.slug === 'b-middle')!;
    assert.equal(middle.date, '2022-03-10');
    assert.equal(middle.track, 'intro');
    assert.deepEqual(middle.tags, [], 'tags 缺省应透传为空数组');
    assert.equal(middle.summary, 'intro 轨居中摘要');
    assert.ok(middle.readingMinutes >= 1);

    const oldest = articles.find((a) => a.slug === 'c-oldest')!;
    assert.equal(oldest.date, '2020-01-01');
    assert.deepEqual(oldest.tags, ['t-gamma']);
    assert.ok(oldest.readingMinutes >= 1);
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
