import fs from 'node:fs';
import path from 'node:path';

export interface HeadingItem {
  id: string;
  title: string;
  depth: number;
}

function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9一-龥\s-]/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}

/** 收集 h1-h4 标题、为其加 id（迁移自旧 markdown.ts） */
export function remarkHeadingIds(headings: HeadingItem[]) {
  return () => (tree: any) => {
    const slugCount = new Map<string, number>();
    const walk = (node: any) => {
      if (node.type === 'heading' && node.depth >= 1 && node.depth <= 4) {
        const text = extractText(node);
        const base = slugify(text);
        const n = slugCount.get(base) || 0;
        const id = n === 0 ? base : `${base}-${n}`;
        slugCount.set(base, n + 1);
        headings.push({ id, title: text, depth: node.depth });
        node.data = node.data || {};
        node.data.hProperties = { ...(node.data.hProperties || {}), id };
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * 图片链路（§6）：MDX 内相对引用 → /article-assets/<track>/<slug>/<name> 绝对路径；
 * 构建时校验源文件存在于 content/articles/<track>/<slug>.assets/，缺失 fail build。
 */
export function remarkArticleImages(track: string, slug: string, assetsDir: string) {
  return () => (tree: any) => {
    const walk = (node: any) => {
      if (node.type === 'image' && node.url) {
        const url: string = node.url;
        const isExternal = url.startsWith('http://') || url.startsWith('https://');
        const isAbsolute = url.startsWith('/');
        if (!isExternal && !isAbsolute) {
          const name = url.replace(/^\.\//, '').replace(new RegExp(`^${slug}\\.assets/`), '');
          const source = path.join(assetsDir, name);
          if (!fs.existsSync(source)) {
            throw new Error(`图片缺失: ${source}（被 content/articles/${track}/${slug}.mdx 引用）`);
          }
          node.url = `/article-assets/${track}/${slug}/${name}`;
        }
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}
