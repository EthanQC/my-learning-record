const isServer = typeof window === 'undefined';

function ensureApiBase(u?: string): string {
  if (!u) return '';
  const s = u.replace(/\/+$/, '');
  return s.endsWith('/api') ? s : `${s}/api`;
}

// 浏览器端：走公网域名（经 Caddy 统一反代，URL 需要带 /api）
const clientOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL || // 推荐：https://qingverse.com
  process.env.NEXT_PUBLIC_API_URL ||      // 兼容：可为 https://qingverse.com 或 http://localhost:9000/api
  '';

// 服务器端（SSR）：走容器内网直连后端，不加 /api
const serverOrigin =
  process.env.INTERNAL_API_BASE_URL ||    // 例如 http://api:9000
  'http://api:9000';

// 关键：SSR 直接用 http://api:9000；浏览器端用 https://qingverse.com/api
const API_BASE = isServer
  ? serverOrigin.replace(/\/+$/, '')      // => http://api:9000
  : ensureApiBase(clientOrigin);          // => https://qingverse.com/api

async function fetchJSON<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { credentials: 'omit', signal: controller.signal, ...(init || {}) } as any);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

export interface PostMeta { slug: string; title: string; category: string; tags: string[]; summary: string; date: string; }
export interface Post extends PostMeta { content: string; updated_at: string; }
export interface Category { name: string; label: string; count: number; }
export interface Stats { total_posts: number; total_categories: number; last_update: string; recent_posts: PostMeta[]; }

export async function getStats(): Promise<Stats> {
  return fetchJSON<Stats>(`${API_BASE}/stats`, { next: { revalidate: 60 } as any });
}
export async function getPosts(category?: string): Promise<PostMeta[]> {
  const url = category ? `${API_BASE}/posts?category=${encodeURIComponent(category)}` : `${API_BASE}/posts`;
  return fetchJSON<PostMeta[]>(url, { next: { revalidate: 60 } as any });
}
export async function getPost(slug: string): Promise<Post> {
  return fetchJSON<Post>(`${API_BASE}/posts/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } as any });
}
export async function getCategories(): Promise<Category[]> {
  return fetchJSON<Category[]>(`${API_BASE}/categories`, { next: { revalidate: 60 } as any });
}
export async function submitContact(data: { name: string; email: string; message: string }) {
  return fetchJSON(`${API_BASE}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
}
