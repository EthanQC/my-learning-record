'use client';

import { useRef, useState } from 'react';

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setOk(null); setErr(null); setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: (fd.get('name') as string)?.trim(),
      email: (fd.get('email') as string)?.trim(),
      subject: ((fd.get('subject') as string) || '').trim() || undefined, // 可选
      message: (fd.get('message') as string)?.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setErr('请填写姓名、邮箱和留言'); setLoading(false); return;
    }

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:9000';
      const r = await fetch(`${base}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      setOk('已发送成功！');
      formRef.current?.reset();         // ✅ 成功后重置
    } catch (e: any) {
      setErr(e?.message || '发送失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">联系我</h1>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" placeholder="你的姓名" className="border rounded px-3 py-2 w-full" />
          <input name="email" type="email" placeholder="你的邮箱" className="border rounded px-3 py-2 w-full" />
        </div>
        <input name="subject" placeholder="主题（可选）" className="border rounded px-3 py-2 w-full" />
        <textarea name="message" rows={8} placeholder="留言内容…" className="border rounded px-3 py-2 w-full" />
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {loading ? '发送中…' : '发送'}
        </button>
        {ok && <p className="text-green-600">{ok}</p>}
        {err && <p className="text-red-600">{err}</p>}
      </form>
    </main>
  );
}
