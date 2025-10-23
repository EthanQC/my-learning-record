// apps/web/src/app/blog/[...slug]/page.tsx
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { listPosts } from "@/lib/posts";

// apps/web 为 cwd，content 在仓库根：../../content/blog
const BLOG_DIR = path.join(process.cwd(), "../../content/blog");

export async function generateStaticParams() {
  // 有的 PostMeta 可能没有 slug，这里用 href 兜底
  return listPosts().map((p) => {
    const s =
      p.slug ??
      (p.href ? p.href.replace(/^\/blog\//, "") : "").replace(/^\//, "");
    return { slug: s.split("/").filter(Boolean) };
  });
}

// ✅ Next.js 15：params 是 Promise，先 await
export default async function PostPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await props.params;
  const rel = slug.join("/");

  const file = path.join(BLOG_DIR, `${rel}.md`);
  const fileMdx = path.join(BLOG_DIR, `${rel}.mdx`);
  const target = fs.existsSync(file) ? file : fileMdx;

  if (!fs.existsSync(target)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="text-gray-600 mt-2">找不到本文档：{rel}</p>
      </main>
    );
  }

  const raw = fs.readFileSync(target, "utf8");
  const stats = fs.statSync(target);
  const { data, content } = matter(raw);

  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    content.match(/^\s*#\s+(.+)$/m)?.[1] ||
    slug[slug.length - 1];

  const dateStr =
    (typeof data.date === "string" && data.date.trim()) ||
    new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(
      stats.mtime
    );

  const htmlContent = String(
    await unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["yaml", "toml"])
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(content)
  );

  const tags: string[] =
    Array.isArray(data?.tags)
      ? (data!.tags as string[])
      : typeof data?.tags === "string"
      ? String(data!.tags)
          .split(/[,\s]+/)
          .filter(Boolean)
      : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <article className="prose lg:prose-lg max-w-none">
        <h1>{title}</h1>
        <p className="opacity-70 text-sm">
          {dateStr}
          {tags.length ? " · " + tags.join(", ") : ""}
        </p>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </main>
  );
}
