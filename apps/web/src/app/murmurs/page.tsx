export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default async function MurmursPage() {
  const allPosts = await getPosts();
  
  // 过滤碎碎念文章
  const posts = allPosts.filter(post => 
    post.slug.includes('murmurs-and-reflection') || post.category === 'murmurs-and-reflection'
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><Link href="/" className="hover:text-pink-500">首页</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">碎碎念</li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          碎碎念
        </h1>
        <p className="text-gray-500">日常思考与心路历程</p>
        <p className="text-sm text-gray-400 mt-2">共 {posts.length} 篇文章</p>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">暂无碎碎念</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group">
                <h2 className="font-semibold text-gray-800 group-hover:text-pink-500 transition-colors mb-2">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.summary}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{formatDate(post.date)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
