// apps/web/src/app/blog/page.tsx
import Link from "next/link";
import { getCategoriesWithPosts, toDateString } from "@/lib/posts";

const prettyName: Record<string, string> = {
  "internship-records": "实习记录",
  "interview-experiences": "面经",
  "join-in-open-source": "开源",
  "murmurs-and-reflection": "碎碎念",
  notes: "技术笔记",
};

export default async function BlogIndex() {
  const { byCat, ordered } = getCategoriesWithPosts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      {(ordered ?? []).map((cat) => {
        const list = byCat?.[cat] ?? [];
        if (!Array.isArray(list) || list.length === 0) return null;

        return (
          <section key={cat} className="mb-10">
            <h2 className="text-xl font-semibold mb-3">
              {prettyName[cat] ?? cat}
            </h2>

            <ul className="space-y-2">
              {list.map((p) => (
                <li key={p.href} className="leading-6">
                  <Link
                    className="text-blue-600 hover:underline"
                    href={p.href}
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="ml-2 text-sm text-gray-500">
                    {toDateString(p.date)}
                  </span>
                  {p.summary && (
                    <div className="text-gray-600 text-sm">{p.summary}</div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
