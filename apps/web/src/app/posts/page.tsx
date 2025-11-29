import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">所有文章</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-600">暂时没有文章数据，请稍后再试</p>
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
                  <Badge>{post.category}</Badge>
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
