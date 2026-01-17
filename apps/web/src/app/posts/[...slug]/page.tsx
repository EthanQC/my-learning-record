import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { renderMarkdown } from '@/lib/markdown';
import { TableOfContents } from '@/components/post/TableOfContents';

interface Props {
  params: Promise<{ slug: string[] }>;
}

// 计算字数
function countWords(content: string): number {
  // 移除 markdown 语法和 HTML 标签
  const text = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除行内代码
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接但保留文字
    .replace(/[#*_~>\-]/g, '') // 移除 markdown 符号
    .replace(/<[^>]+>/g, '') // 移除 HTML 标签
    .replace(/\s+/g, ''); // 移除空白
  
  return text.length;
}

// 计算阅读时间（假设每分钟阅读 300 字）
function calculateReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 300));
  return `${minutes} 分钟`;
}

// 根据 slug 生成面包屑
function generateBreadcrumbs(slug: string) {
  const parts = slug.split('/');
  const breadcrumbs: { label: string; href: string }[] = [
    { label: '首页', href: '/' },
  ];

  if (parts[0] === 'notes') {
    breadcrumbs.push({ label: '学习记录', href: '/notes' });
    if (parts[1] === 'interview-questions') {
      breadcrumbs.push({ label: '八股', href: '/notes/interview-questions' });
      if (parts[2]) {
        const categoryLabels: Record<string, string> = {
          'computer-network': '计算机网络',
          'operation-system': '操作系统',
          'mysql': 'MySQL',
          'redis': 'Redis',
          'cpp': 'C++',
          'go': 'Go',
          'data-structure-and-algorithms': '数据结构与算法',
        };
        breadcrumbs.push({ 
          label: categoryLabels[parts[2]] || parts[2], 
          href: `/notes/interview-questions/${parts[2]}` 
        });
      }
    } else if (parts[1]) {
      const categoryLabels: Record<string, string> = {
        'go': 'Go',
        'cpp': 'C++',
        'database': '数据库',
        'back-end': '后端',
        'front-end': '前端',
        'Linux': 'Linux',
        'redis': 'Redis',
        'data-structure-and-algorithm': '算法',
      };
      breadcrumbs.push({
        label: categoryLabels[parts[1]] || parts[1],
        href: `/notes/${parts[1]}`
      });
    }
  } else if (parts[0] === 'blog') {
    if (parts[1] === 'interview-experiences') {
      breadcrumbs.push({ label: '面经', href: '/interview-experiences' });
    } else if (parts[1] === 'internship-records') {
      breadcrumbs.push({ label: '实习记录', href: '/internship-records' });
    } else if (parts[1] === 'murmurs-and-reflection') {
      breadcrumbs.push({ label: '碎碎念', href: '/murmurs' });
    } else {
      breadcrumbs.push({ label: '博客', href: '/posts' });
    }
  }

  return breadcrumbs;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  
  let post;
  try {
    post = await getPost(fullSlug);
  } catch {
    notFound();
  }
  
  const tags = post?.tags ?? [];
  const { html, headings } = await renderMarkdown(post.content);
  const breadcrumbs = generateBreadcrumbs(fullSlug);
  
  // 计算字数和阅读时间
  const wordCount = countWords(post.content);
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* 左侧目录 - 桌面端 */}
        {headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
            {/* 面包屑导航 */}
            <nav className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    <Link href={crumb.href} className="hover:text-pink-500 transition-colors">
                      {crumb.label}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <span>/</span>
                  <span className="text-gray-800 font-medium truncate max-w-[200px]">{post.title}</span>
                </li>
              </ol>
            </nav>

            <article>
              {/* 文章头部 */}
              <header className="mb-8 pb-6 border-b border-pink-100">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <time dateTime={post.date} className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(post.date)}
                  </time>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {wordCount.toLocaleString()} 字
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {readingTime}
                  </span>
                  <Badge>{post.category}</Badge>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag) => (
                      <span key={tag} className="text-sm text-pink-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* 文章内容 */}
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:scroll-mt-20
                  prose-a:text-pink-500 prose-a:no-underline hover:prose-a:text-pink-600
                  prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
                  prose-pre:bg-gray-900 prose-pre:shadow-lg
                  prose-code:text-pink-600 prose-code:bg-pink-50
                  prose-blockquote:border-pink-300 prose-blockquote:bg-pink-50/50
                  prose-strong:text-gray-800
                  prose-table:shadow-sm prose-thead:bg-pink-50"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* 文章底部 */}
              <footer className="mt-12 pt-6 border-t border-pink-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-400">
                    最后更新于 {formatDate(post.updated_at || post.date)}
                  </p>
                  <Link 
                    href={breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].href : '/'}
                    className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium text-sm transition-colors"
                  >
                    ← 返回
                  </Link>
                </div>
              </footer>
            </article>
          </div>
        </main>
      </div>

      {/* 移动端目录按钮 */}
      {headings.length > 3 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <details className="group">
            <summary className="list-none cursor-pointer bg-pink-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </summary>
            <div className="absolute bottom-14 right-0 w-64 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-pink-100 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">目录</h3>
              <nav className="space-y-1 text-sm">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="block py-1.5 text-gray-500 hover:text-pink-500 transition-colors truncate"
                    style={{ paddingLeft: `${(h.depth - 1) * 10}px` }}
                  >
                    {h.title}
                  </a>
                ))}
              </nav>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
