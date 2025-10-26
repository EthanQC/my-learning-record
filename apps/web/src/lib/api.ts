const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api';

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

// 获取统计信息
export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE_URL}/stats`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

// 获取文章列表
export async function getPosts(category?: string): Promise<PostMeta[]> {
  const url = category 
    ? `${API_BASE_URL}/posts?category=${category}`
    : `${API_BASE_URL}/posts`;
  
  const res = await fetch(url, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

// 获取文章详情
export async function getPost(slug: string): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

// 获取分类列表
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// 提交留言
export async function submitContact(data: {
  name: string;
  email: string;
  message: string;
}) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit contact');
  return res.json();
}