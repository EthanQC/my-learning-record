// apps/web/src/app/page.tsx
import Link from "next/link";
import { getCategoriesWithPosts, toDateString } from "@/lib/posts";

const prettyName: Record<string, string> = {
  "internship-records": "实习记录",
  "interview-experiences": "面经",
  "join-in-open-source": "开源",
  "murmurs-and-reflection": "碎碎念",
  notes: "技术笔记",
};

export default async function Home() {
  const { byCat, ordered } = getCategoriesWithPosts();

  // 每个分类取最近 3 篇
  const summaries = (ordered ?? []).map((cat) => ({
    cat,
    posts: (byCat?.[cat] ?? []).slice(0, 3),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold">Qingverse</h1>
        <p className="text-gray-600 mt-2">
          这里是我的学习记录与博客，主要聚焦 Go 后端与工程化。
        </p>
        <div className="mt-4">
          <Link
            href="/blog"
            className="inline-block rounded-lg px-4 py-2 border hover:bg-gray-50"
          >
            进入博客 →
          </Link>
        </div>
      </section>

      {/* 每个分类最近 3 篇 */}
      <section className="space-y-8">
        {summaries.map(({ cat, posts }) =>
          posts.length ? (
            <div key={cat}>
              <h2 className="text-xl font-semibold mb-3">
                {prettyName[cat] ?? cat}
                <Link
                  href="/blog"
                  className="ml-3 text-sm text-blue-600 hover:underline"
                >
                  更多 →
                </Link>
              </h2>
              <ul className="space-y-2">
                {posts.map((p) => (
                  <li key={p.href} className="leading-6">
                    <Link className="text-blue-600 hover:underline" href={p.href}>
                      {p.title}
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">
                      {toDateString(p.date)}
                    </span>
                    {p.summary && (
                      <div className="text-sm text-gray-600">{p.summary}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </section>
    </main>
  );
}
