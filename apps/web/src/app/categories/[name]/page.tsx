import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Props {
  params: Promise<{ name: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const posts = await getPosts(name);

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">分类: {name}</h1>
      <p className="text-gray-600 mb-8">共 {posts.length} 篇文章</p>
      
      {posts.length === 0 ? (
        <p className="text-gray-600">这个分类还没有文章</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.slug}>
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(post.date)}</span>
                  {(post.tags ?? []).map((tag) => (
                    <span key={tag} className="text-gray-400">#{tag}</span>
                  ))}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
