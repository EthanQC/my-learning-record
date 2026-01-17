import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// 分类标签映射
const categoryLabels: Record<string, string> = {
  'murmurs-and-reflection': '碎碎念',
  'interview-experiences': '面经',
  'internship-records': '实习记录',
  'join-in-open-source': '开源',
};

export default async function PostsPage() {
  const [posts, categories] = await Promise.all([
    getPosts(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">所有文章</h1>
        <p className="text-gray-500">
          共 {posts.length} 篇文章，包括博客、笔记和随笔
        </p>
      </div>

      {/* 分类快速筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/posts" className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium">
          全部
        </Link>
        {categories.slice(0, 6).map((cat) => (
          <Link 
            key={cat.name} 
            href={`/categories/${cat.name}`}
            className="px-4 py-2 bg-white text-gray-600 border border-pink-100 rounded-full text-sm font-medium hover:border-pink-300 hover:text-pink-500 transition-colors"
          >
            {cat.label} ({cat.count})
          </Link>
        ))}
      </div>
      
      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">暂时没有文章，请稍后再试</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-500 transition-colors truncate">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{post.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-shrink-0">
                    <Badge variant="outline">{categoryLabels[post.category] || post.category}</Badge>
                    <span className="text-gray-400">{formatDate(post.date)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 快速导航 */}
      <div className="mt-12 pt-8 border-t border-pink-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">快速导航</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/notes" className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors">
            学习记录
          </Link>
          <Link href="/notes/interview-questions" className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors">
            八股
          </Link>
          <Link href="/about" className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors">
            关于
          </Link>
        </div>
      </div>
    </div>
  );
}
