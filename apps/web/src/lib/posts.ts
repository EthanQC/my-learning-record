// apps/web/src/lib/posts.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** 文章元信息在前端要用到的最小集合 */
export type PostMeta = {
  title: string;
  href: string;        // 形如 /blog/<cat>/<name>
  category: string;    // 形如 <cat>
  date: Date;          // 统一转为 Date，页面格式化即可
  dateStr?: string;    // 可选，若 frontmatter 有则保留
  summary?: string;
  tags?: string[];
  slug: string;        // 形如 <cat>/<name>
};

// apps/web 为 cwd，content 在仓库根：../../content/blog
const BLOG_DIR = path.join(process.cwd(), "../../content/blog");
const exts = new Set([".md", ".mdx"]);

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.isFile() && exts.has(path.extname(p))) files.push(p);
  }
  return files;
}

function parseDate(input: unknown, fallback: Date): Date {
  if (input instanceof Date) return input;
  if (typeof input === "string" && input.trim()) {
    // 兼容 2025-10-22 / 2025.10.22 / 2025/10/22 等
    const norm = input.replace(/\./g, "-").replace(/\//g, "-");
    const d = new Date(norm);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return fallback;
}

function firstH1(content: string): string | undefined {
  const m = content.match(/^\s*#\s+(.+)$/m);
  return m?.[1]?.trim();
}

function toSlug(absFile: string): string {
  const rel = path
    .relative(BLOG_DIR, absFile)
    .replace(/\.(md|mdx)$/i, "")
    .split(path.sep)
    .join("/");
  return rel; // e.g. "interview-experiences/shopee/SRE-daily-internship-first-round-ii"
}

function readPost(absFile: string): PostMeta {
  const raw = fs.readFileSync(absFile, "utf8");
  const stat = fs.statSync(absFile);
  const { data, content } = matter(raw);

  const slug = toSlug(absFile);
  const category = slug.split("/")[0];
  const href = "/blog/" + slug;

  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    firstH1(content) ||
    slug.split("/").pop()!;

  const date = parseDate(data.date, stat.mtime);
  const dateStr =
    typeof data.date === "string" && data.date.trim() ? data.date : undefined;

  let tags: string[] | undefined;
  if (Array.isArray(data.tags)) {
    tags = (data.tags as unknown[]).map(String);
  } else if (typeof data.tags === "string") {
    tags = data.tags
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const summary =
    typeof data.summary === "string" && data.summary.trim()
      ? data.summary
      : undefined;

  return { title, href, category, date, dateStr, summary, tags, slug };
}

/** 列出所有文章（按时间降序） */
export function listPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = walk(BLOG_DIR);
  const posts = files.map(readPost);
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return posts;
}

/** 把文章按分类分组，并给出分类顺序（按各分类最新一篇时间降序） */
export function getCategoriesWithPosts(): {
  byCat: Record<string, PostMeta[]>;
  ordered: string[];
} {
  const posts = listPosts();
  const byCat: Record<string, PostMeta[]> = {};
  for (const p of posts) {
    (byCat[p.category] ??= []).push(p);
  }
  // 每个组内部也按时间降序
  for (const cat of Object.keys(byCat)) {
    byCat[cat].sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  // 分类顺序：看每组第一篇（最新）时间
  const ordered = Object.keys(byCat).sort((a, b) => {
    const da = byCat[a][0]?.date?.getTime() ?? 0;
    const db = byCat[b][0]?.date?.getTime() ?? 0;
    return db - da;
  });
  return { byCat, ordered };
}

/** 用于页面展示的日期字符串 */
export function toDateString(d: Date): string {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(d);
}
