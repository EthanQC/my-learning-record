import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllArticles, contentRoot, TRACKS } from '../src/lib/content';
import { frontmatterSchema } from '../src/lib/content-schema';

// Option B(用户 2026-07-13):全部夹具置 draft,空态首发;本测试改为实证 draft 过滤(磁盘4篇→返回0)
test('draft 过滤实证：磁盘 4 篇 .mdx（deep 3 + intro 1）全部 draft，getAllArticles 返回 0', async () => {
  const root = contentRoot();

  // (a) 磁盘结构断言：fs 计数，不绑定具体文件名
  const mdxOf = (track: string) =>
    fs.readdirSync(path.join(root, track)).filter((f) => f.endsWith('.mdx'));
  const deepFiles = mdxOf('deep');
  const introFiles = mdxOf('intro');
  assert.equal(deepFiles.length, 3, `deep 轨磁盘应有 3 篇 .mdx，实际 ${deepFiles.length}`);
  assert.equal(introFiles.length, 1, `intro 轨磁盘应有 1 篇 .mdx，实际 ${introFiles.length}`);

  // 每篇 frontmatter 都能过 schema 且 draft === true（证明"0 篇返回"确因 draft 过滤，
  // 而非目录缺失/解析失败等旁路原因）
  for (const track of TRACKS) {
    for (const file of mdxOf(track)) {
      const raw = fs.readFileSync(path.join(root, track, file), 'utf8');
      const fm = frontmatterSchema.parse(matter(raw).data);
      assert.equal(fm.draft, true, `${track}/${file} 应为 draft:true`);
    }
  }

  // (b) draft 过滤正证：4 篇在磁盘、0 篇被返回 ⇒ 过滤器对全量 draft 生效
  const articles = await getAllArticles();
  assert.equal(
    articles.length,
    0,
    `全部夹具已置 draft:true，getAllArticles 应返回 0 篇，实际 ${articles.length} 篇`,
  );
});
