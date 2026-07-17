// publish-article 发文流水线·确定性校验（验证阶梯第 1 级）
// 规格：docs/superpowers/specs/2026-07-04-publish-article-worksystem.md
// 用法：npx tsx scripts/validate-article.mjs <path-to-mdx>
//   ——必须经 tsx 运行（复用 apps/web/src/lib/content-schema.ts 的 zod schema，
//   该文件是 TS；schema 是唯一校验事实源，本脚本不复制字段规则）
// 校验：① frontmatter 过 zod；② 图片引用逐张存在。
// 图片解析规则与运行时事实源 apps/web/src/lib/mdx-plugins.ts 的 remarkArticleImages 对齐：
//   跳过 http(s)/data:/以「/」开头的站内绝对路径；已落位文章的相对引用剥 ./ 与 <slug>.assets/
//   前缀后到同名 <slug>.assets/ 目录找（运行时即如此改写）；代码块内的示例引用不计
//   （运行时基于 mdast 天然排除，本脚本先剥除围栏与行内代码再扫描）。
// 任一不过 exit 1 并打印具体缺失项。
import fs from 'node:fs';
import path from 'node:path';
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

// ② 图片引用存在性（解析规则对齐 remarkArticleImages，见文件头注释）
const slug = path.basename(file).replace(/\.(md|mdx)$/i, '');
const assetsDirName = `${slug}.assets`;
const dir = path.dirname(file);
const isPlaced = /content\/articles\/(deep|intro)\//.test(file.split(path.sep).join('/'));
const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 剥除围栏代码块与行内代码（其中的 ![](…) 是示例不是真实引用）
const scannable = content
  .replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '')
  .replace(/`[^`\n]*`/g, '');

const refs = [];
// alt 允许一层方括号嵌套；src 允许 <> 包裹
for (const m of scannable.matchAll(/!\[(?:[^\[\]]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)/g)) refs.push(m[1]);
for (const m of scannable.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/g)) refs.push(m[1]);

for (const ref of refs) {
  // 与运行时同口径跳过：外链、data:、站内绝对路径（运行时不改写「/」开头引用）
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:') || ref.startsWith('/')) continue;

  if (isPlaced) {
    // 运行时规则：剥 ./ 与 <slug>.assets/ 前缀，到 <slug>.assets/ 下找
    const name = ref.replace(/^\.\//, '').replace(new RegExp(`^${escapedSlug}\\.assets/`), '');
    const source = path.join(dir, assetsDirName, name);
    if (!fs.existsSync(source)) {
      errors.push(`图片缺失: ${ref}（运行时解析为 ${assetsDirName}/${name}，该文件不存在）`);
    }
  } else {
    // 源文件阶段：按字面相对路径找（落位时才会改写进 .assets/）
    const resolved = path.resolve(dir, ref);
    if (!fs.existsSync(resolved)) {
      errors.push(`图片缺失: ${ref}（期望 ${path.relative(process.cwd(), resolved)}）`);
      continue;
    }
    const inAssets = !path.relative(path.join(dir, assetsDirName), resolved).startsWith('..');
    if (!inAssets) {
      console.warn(`提示（落位时需收纳）: 图片不在 ${assetsDirName}/ 下: ${ref}`);
    }
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
