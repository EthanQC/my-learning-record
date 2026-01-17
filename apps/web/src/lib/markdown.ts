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

// 图片路径转换函数
function transformImagePath(src: string, slug: string): string {
  // 如果是外部链接，直接返回
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // 如果是后端已处理的 /images/ 路径，转换为 /api/images/
  if (src.startsWith('/images/')) {
    return `/api${src}`;
  }
  
  // 如果是其他绝对路径，直接返回
  if (src.startsWith('/')) {
    return src;
  }
  
  // 获取文章所在目录路径
  const slugParts = slug.split('/');
  slugParts.pop(); // 移除文件名部分
  const basePath = slugParts.join('/');
  
  // 处理相对路径中的 ../ 和 ./
  let imagePath = src;
  if (src.startsWith('../')) {
    // 向上一级目录
    const pathParts = basePath.split('/');
    const srcParts = src.split('/');
    let upCount = 0;
    for (const part of srcParts) {
      if (part === '..') {
        upCount++;
      } else {
        break;
      }
    }
    pathParts.splice(-upCount);
    imagePath = [...pathParts, ...srcParts.slice(upCount)].join('/');
  } else if (src.startsWith('./')) {
    imagePath = `${basePath}/${src.slice(2)}`;
  } else {
    imagePath = `${basePath}/${src}`;
  }
  
  // 返回通过 API 访问的路径
  return `/api/images/${imagePath}`;
}

// 将 Markdown 渲染为 HTML，并提取 h1-h3 生成目录
export async function renderMarkdown(markdown: string, slug?: string): Promise<{
  html: string;
  headings: HeadingItem[];
}> {
  const headings: HeadingItem[] = [];
  const slugCount = new Map<string, number>();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // 转换图片路径
    .use(() => (tree: any) => {
      const walk = (node: any) => {
        if (node.type === 'image' && node.url && slug) {
          node.url = transformImagePath(node.url, slug);
        }
        if (node.children) {
          node.children.forEach(walk);
        }
      };
      walk(tree);
    })
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
