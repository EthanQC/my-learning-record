import { notFound } from 'next/navigation';
import { getPost } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

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

  return (
    <article className="container mx-auto max-w-4xl px-6 py-12">
      {/* 文章头部 */}
      <header className="mb-8 pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <Badge>{post.category}</Badge>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 文章内容 */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}