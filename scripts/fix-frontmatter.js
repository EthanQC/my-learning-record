// scripts/fix-frontmatter.js
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(process.cwd(), "content");
const DRY = process.argv.includes("--dry");

function ymd(d) { return d.toISOString().slice(0,10); }

function firstHeading(md) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}
function firstParagraph(md) {
  const blocks = md.split(/\r?\n\r?\n+/).map(s => s.trim());
  const p = blocks.find(b => b && !b.startsWith("#"));
  return (p || "").replace(/\s+/g," ").slice(0,180);
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/i.test(name)) out.push(p);
  }
  return out;
}
function normTags(file, existing) {
  if (Array.isArray(existing)) return existing.map(String);
  if (typeof existing === "string") return existing.split(/[,\s]+/).filter(Boolean);
  const rel = path.relative(ROOT, file);
  const segs = rel.split(path.sep);
  const tag = segs.length > 1 ? segs[segs.length - 2] : null;
  return tag ? [tag] : [];
}

// 规范正文：把“•/·/—/–”开头的行改成 markdown 列表；标题补空格；列表前补空行
function normalizeMarkdownBody(md) {
  let out = md.replace(/\r\n/g, "\n");

  // 1) 标题 `###标题` => `### 标题`
  out = out.replace(/^(\s*#{1,6})([^\s#])/gm, "$1 $2");

  // 2) 将「• / · / — / –」开头的行，替换成标准 `- `
  out = out.replace(/^(\t*|\s{0,3})[•·—–]\s+/gm, "$1- ");

  // 3) 统一列表前空行（上一行非空、下一行是 -/*/+ 列表项时补一行空白）
  out = out.replace(/([^\n])\n([ \t]*[-*+]\s+)/g, "$1\n\n$2");

  // 4) 修复任务列表写法（如果有人写了 `- [ ]` 之类，确保有空格）
  out = out.replace(/^([ \t]*[-*+])\s*\[( |x|X)\]\s*/gm, "$1 [$2] ");

  return out;
}

function fixOne(file) {
  const raw = fs.readFileSync(file, "utf8");
  const st = fs.statSync(file);
  const fm = matter(raw);
  const data = fm.data || {};
  let content = fm.content || "";

  // === Frontmatter 规范 ===
  if (!data.title) data.title = firstHeading(content) || path.basename(file).replace(/\.(md|mdx)$/i, "").replace(/[-_]/g, " ");
  if (!data.date) data.date = ymd(st.mtime);
  else if (data.date instanceof Date) data.date = ymd(data.date);
  else if (typeof data.date !== "string") data.date = ymd(st.mtime);
  data.tags = normTags(file, data.tags);
  if (!data.summary || typeof data.summary !== "string") data.summary = firstParagraph(content);

  // === 正文规范 ===
  content = normalizeMarkdownBody(content);

  const next = matter.stringify(content, data, { language: "yaml" });
  if (next !== raw) {
    if (DRY) console.log(`[DRY] would update: ${file}`);
    else { fs.writeFileSync(file, next); console.log(`updated: ${file}`); }
  }
}

function main() {
  if (!fs.existsSync(ROOT)) { console.error(`not found: ${ROOT}`); process.exit(1); }
  const files = walk(ROOT);
  console.log(`found ${files.length} md/mdx files`);
  files.forEach(fixOne);
}
main();
