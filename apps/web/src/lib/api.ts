// apps/web/src/lib/api.ts

// --- 区分运行端：SSR(Node) vs 浏览器 ---
const isServer = typeof window === 'undefined';

// 把地址标准化为以 /api 结尾（避免 /api/api、尾部多 / 等问题）
function ensureApiBase(u?: string): string {
  if (!u) return '';
  const s = u.replace(/\/+$/, '');
  return s.endsWith('/api') ? s : `${s}/api`;
}

// 浏览器端走公网域名（Caddy 会反代到 API）
const clientOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL || // e.g. https://qingverse.com
  process.env.NEXT_PUBLIC_API_URL ||      // 兼容旧变量
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''); // 开发环境兜底到本地 API

// SSR/Node 端走容器内网（不出网，稳定快速）
const serverOrigin =
  process.env.INTERNAL_API_BASE_URL ||    // e.g. http://api:8080
  'http://api:8080';

export const API_BASE = isServer
  ? ensureApiBase(serverOrigin)           // => http://api:9000/api
  : ensureApiBase(clientOrigin);          // => https://qingverse.com/api

// 统一 JSON 请求（带超时）
async function fetchJSON<T>(
  url: string,
  init?: RequestInit,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      credentials: 'omit',
      signal: controller.signal,
      ...(init || {}),
    } as any);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

// ---------- 类型 ----------
export interface PostMeta {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  date: string;
}

export interface Post extends PostMeta {
  content: string;
  updated_at: string;
}

export interface Category {
  name: string;
  label: string;
  count: number;
}

export interface Stats {
  total_posts: number;
  total_categories: number;
  last_update: string;
  recent_posts: PostMeta[];
}

// ---------- API 方法（带兜底） ----------

// 获取统计信息（失败/异常时返回安全默认值）
export async function getStats(): Promise<Stats> {
  try {
    return await fetchJSON<Stats>(`${API_BASE}/stats`, {
      next: { revalidate: 60 } as any,
    });
  } catch {
    return {
      total_posts: 0,
      total_categories: 0,
      last_update: '',
      recent_posts: [],
    };
  }
}

// 获取文章列表（后端返回 null 时兜底为 []）
export async function getPosts(category?: string): Promise<PostMeta[]> {
  try {
    const url = category
      ? `${API_BASE}/posts?category=${encodeURIComponent(category)}`
      : `${API_BASE}/posts`;
    const data = await fetchJSON<any>(url, { next: { revalidate: 60 } as any });
    return Array.isArray(data) ? data as PostMeta[] : [];
  } catch {
    return [];
  }
}

// 获取文章详情（失败抛错；页面可根据需要再兜底）
export async function getPost(slug: string): Promise<Post> {
  return await fetchJSON<Post>(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 } as any,
  });
}

// 获取分类列表（后端返回 null 时兜底为 []）
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchJSON<any>(`${API_BASE}/categories`, {
      next: { revalidate: 60 } as any,
    });
    return Array.isArray(data) ? data as Category[] : [];
  } catch {
    return [];
  }
}

// 提交留言
export async function submitContact(data: {
  name: string;
  email: string;
  message: string;
  _honey?: string;
}) {
  return await fetchJSON(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
