// publish-article 发文流水线·确定性校验（验证阶梯第 1 级）
// 规格：docs/superpowers/specs/2026-07-04-publish-article-worksystem.md
// 用法：npx tsx scripts/validate-article.mjs <path-to-mdx>
//   ——必须经 tsx 运行（复用 apps/web/src/lib/content-schema.ts 的 zod schema，
//   该文件是 TS；schema 是唯一校验事实源，本脚本不复制字段规则）
// 校验：① frontmatter 过 zod；② 正文相对图片引用逐张存在、且位于同名 <slug>.assets/ 下
// 任一不过 exit 1 并打印具体缺失项。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { frontmatterSchema } from '../apps/web/src/lib/content-schema.ts';

const target = process.argv[2];
if (!target) {
  console.error('用法: npx tsx scripts/validate-article.mjs <path-to-mdx>');
  process.exit(1);
}
const file = path.resolve(target);
if (!fs.existsSync(file)) {
  console.error(`validate-article: 文件不存在 ${file}`);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
const { data, content } = matter(raw);
const errors = [];

// ① frontmatter zod 校验（schema 即事实源）
const parsed = frontmatterSchema.safeParse(data);
if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    errors.push(`frontmatter: ${issue.path.join('.') || '(root)'} —— ${issue.message}`);
  }
}

// ② 图片引用存在性：markdown ![](...) 与 JSX <img src="...">，跳过 http(s)/data:
const slug = path.basename(file).replace(/\.(md|mdx)$/i, '');
const assetsDirName = `${slug}.assets`;
const dir = path.dirname(file);
const refs = [];
for (const m of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.push(m[1]);
for (const m of content.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/g)) refs.push(m[1]);

for (const ref of refs) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) continue;
  const resolved = path.resolve(dir, ref);
  if (!fs.existsSync(resolved)) {
    errors.push(`图片缺失: ${ref}（期望 ${path.relative(process.cwd(), resolved)}）`);
    continue;
  }
  // 落位后的文章要求图片收纳在同名 <slug>.assets/ 下（源文件阶段仅提示，不算失败）
  const inAssets = path.relative(path.join(dir, assetsDirName), resolved);
  if (inAssets.startsWith('..')) {
    const isPlaced = /content\/articles\/(deep|intro)\//.test(file.replaceAll(path.sep, '/'));
    const msg = `图片未收纳于 ${assetsDirName}/: ${ref}`;
    if (isPlaced) errors.push(msg);
    else console.warn(`提示（落位时需修正）: ${msg}`);
  }
}

if (errors.length > 0) {
  console.error(`validate-article: ${path.relative(process.cwd(), file)} 未通过——`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `validate-article: OK —— frontmatter 合规（track=${parsed.success ? parsed.data.track : '?'}），图片引用 ${refs.length} 处全部存在`
);
