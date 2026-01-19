export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';

// 八股分类映射
const categoryLabels: Record<string, string> = {
  'go': 'Go 八股',
  'cpp': 'C++ 八股',
  'operation-system': '操作系统',
  'computer-network': '计算机网络',
  'mysql': 'MySQL',
  'redis': 'Redis',
  'data-structure-and-algorithms': '数据结构与算法',
  'microservices-and-cloud-native': '微服务与云原生',
  'scenario': '场景题',
  'projects': '项目经验',
  'internships': '实习相关',
  'game-dev': '游戏开发',
};

interface Props {
  params: Promise<{ category: string }>;
}

export default async function InterviewQuestionsCategoryPage({ params }: Props) {
  const { category } = await params;
  
  const label = categoryLabels[category];
  if (!label) {
    notFound();
  }

  // 获取该分类的文章（后端 category 只支持第二级目录，这里按 slug 前缀过滤）
  const allPosts = await getPosts();
  const posts = allPosts.filter((post) =>
    post.slug.startsWith(`notes/interview-questions/${category}/`)
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/interview-questions" className="hover:text-pink-500 transition-colors">
          八股文
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{label}</span>
      </nav>

      {/* 页面标题 */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {label}
        </h1>
        <p className="text-gray-500">
          共 {posts.length} 篇文章
        </p>
      </div>

      {/* 文章列表 */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group cursor-pointer hover:shadow-md transition-all duration-300">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.summary}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  {post.date && <span>{post.date}</span>}
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{post.tags.slice(0, 3).join(', ')}</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>暂无文章</p>
          <Link 
            href="/interview-questions" 
            className="mt-4 inline-block text-pink-500 hover:text-pink-600"
          >
            返回八股文列表
          </Link>
        </div>
      )}

      {/* 返回按钮 */}
      <div className="mt-12 pt-6 border-t border-pink-100">
        <Link 
          href="/interview-questions" 
          className="text-pink-500 hover:text-pink-600 text-sm font-medium"
        >
          ← 返回八股文列表
        </Link>
      </div>
    </div>
  );
}
