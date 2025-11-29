import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

export interface HeadingItem {
  id: string;
  title: string;
  depth: number;
}

// 将 Markdown 渲染为 HTML，并提取 h1-h3 生成目录
export async function renderMarkdown(markdown: string): Promise<{
  html: string;
  headings: HeadingItem[];
}> {
  const headings: HeadingItem[] = [];
  const slugCount = new Map<string, number>();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // 收集标题 & 添加 id
    .use(() => (tree: any) => {
      const walk = (node: any) => {
        if (node.type === 'heading' && node.depth >= 1 && node.depth <= 3) {
          const text = extractText(node);
          const base = slugify(text);
          const n = slugCount.get(base) || 0;
          const slug = n === 0 ? base : `${base}-${n}`;
          slugCount.set(base, n + 1);

          headings.push({ id: slug, title: text, depth: node.depth });

          node.data = node.data || {};
          node.data.hProperties = {
            ...(node.data.hProperties || {}),
            id: slug,
          };
        }
        if (node.children) {
          node.children.forEach(walk);
        }
      };
      walk(tree);
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: String(file),
    headings,
  };
}

function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
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
      // 保留中英文和数字，其他替换为空格
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}
