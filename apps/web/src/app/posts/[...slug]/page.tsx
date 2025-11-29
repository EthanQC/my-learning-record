import { notFound } from 'next/navigation';
import { getPost } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { renderMarkdown } from '@/lib/markdown';

interface Props {
  params: Promise<{ slug: string[] }>;
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

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <article className="flex-1">
          {/* 文章头部 */}
          <header className="mb-10 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-600">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <Badge>{post.category}</Badge>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span key={tag} className="text-sm text-gray-500">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 文章内容 */}
          <div 
            className="prose prose-lg max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:bg-gray-100 prose-code:rounded prose-a:text-pink-600 hover:prose-a:text-pink-700 prose-img:rounded-xl prose-headings:scroll-mt-28 prose-headings:text-gray-900 prose-blockquote:border-pink-300"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-xl border border-pink-100 bg-white/70 backdrop-blur px-4 py-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">目录</h3>
              <nav className="space-y-2 text-sm text-gray-600">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="block hover:text-pink-600 transition-colors"
                    style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}
                  >
                    {h.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
