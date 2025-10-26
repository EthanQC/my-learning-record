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

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}