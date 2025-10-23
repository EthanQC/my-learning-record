import Link from "next/link";
import { listPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = listPosts();
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <ul className="space-y-4">
        {posts.map(p => (
          <li key={p.slug}>
            <Link className="text-xl underline" href={`/blog/${p.slug}`}>{p.title}</Link>
            <div className="text-sm opacity-70">{p.date} · {p.tags?.join(", ")}</div>
            {p.summary && <p className="mt-1">{p.summary}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
