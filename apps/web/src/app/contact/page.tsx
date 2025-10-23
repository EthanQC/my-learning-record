// apps/web/src/app/contact/page.tsx
"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:9000";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
      hp: String(fd.get("hp") || ""), // 蜜罐
    };

    try {
      const resp = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${resp.status}`);
      }
      setOk("已发送成功！");
      e.currentTarget.reset();
    } catch (e: any) {
      setErr(e.message || "发送失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">联系我</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="你的称呼" required
            className="w-full rounded-lg border px-3 py-2" />
          <input name="email" type="email" placeholder="邮箱" required
            className="w-full rounded-lg border px-3 py-2" />
        </div>
        <input name="subject" placeholder="主题" required
          className="w-full rounded-lg border px-3 py-2" />
        <textarea name="message" placeholder="留言内容" rows={6} required
          className="w-full rounded-lg border px-3 py-2" />

        {/* 蜜罐：人类看不到，机器人容易填 */}
        <div className="hidden">
          <input name="hp" autoComplete="off" />
        </div>

        <button
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "发送中…" : "发送"}
        </button>

        {ok && <p className="text-green-600">{ok}</p>}
        {err && <p className="text-red-600">{err}</p>}
      </form>
    </main>
  );
}
