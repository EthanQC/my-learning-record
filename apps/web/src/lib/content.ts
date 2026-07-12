import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { frontmatterSchema } from './content-schema';

export type Article = {
  slug: string;
  track: 'deep' | 'intro';
  title: string;
  date: string; // ISO yyyy-mm-dd
  tags: string[];
  summary: string;
  draft: boolean;
  readingMinutes: number;
};

export const TRACKS = ['deep', 'intro'] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABEL: Record<Track, string> = {
  deep: '深度线',
  intro: '科普线',
};

/** 从 cwd 向上找 content/articles（next build 时 cwd=apps/web，测试时 cwd=repo 根） */
export function contentRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'content', 'articles');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error('content/articles 目录未找到');
}

/** 中文 350 字/分 + 英文 200 词/分，向上取整，至少 1 分钟 */
function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil(cjk / 350 + words / 200));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAllArticles(): Promise<Article[]> {
  const root = contentRoot();
  const articles: Article[] = [];
  for (const track of TRACKS) {
    const dir = path.join(root, track);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mdx')) continue;
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      let fm;
      try {
        fm = frontmatterSchema.parse(matter(raw).data);
      } catch (e) {
        // §3：校验失败直接 throw，next build 即失败
        throw new Error(`frontmatter 校验失败: content/articles/${track}/${file}\n${e}`);
      }
      if (fm.track !== track) {
        throw new Error(`track 与目录不一致: content/articles/${track}/${file} 声明 track=${fm.track}`);
      }
      if (fm.draft) continue; // §3：draft: true 不构建
      articles.push({
        slug: file.replace(/\.mdx$/, ''),
        track,
        title: fm.title,
        date: isoDate(fm.date),
        tags: fm.tags,
        summary: fm.summary,
        draft: fm.draft,
        readingMinutes: readingMinutes(matter(raw).content),
      });
    }
  }
  return articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
