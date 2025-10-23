import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const BLOG_DIR = path.join(process.cwd(), "../../../content/blog");

export async function generateStaticParams() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => /\.mdx?$/.test(f));
  return files.map(f => ({ slug: f.replace(/\.mdx?$/, "") }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${params.slug}.md`), "utf-8");
  const { content, data } = matter(raw);
  const htmlContent = (await remark().use(html).process(content)).toString();
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto p-6">
      <h1>{data.title}</h1>
      <div className="opacity-70 text-sm">{data.date} · {data.tags?.join(", ")}</div>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </article>
  );
}
