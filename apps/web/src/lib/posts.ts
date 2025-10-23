import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "../../content/blog");

export type PostMeta = { slug:string; title:string; date:string; tags?:string[]; summary?:string };

export function listPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => /\.mdx?$/.test(f));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
    const { data } = matter(raw);
    return { slug:f.replace(/\.mdx?$/,""), title:data.title, date:data.date, tags:data.tags, summary:data.summary };
  }).sort((a,b)=> a.date<b.date?1:-1);
}
