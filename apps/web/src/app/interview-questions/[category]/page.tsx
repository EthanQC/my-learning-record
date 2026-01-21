export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

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
  const allPosts = await getPosts('interview-questions');
  const posts = allPosts.filter((post) =>
    post.slug.startsWith(`notes/interview-questions/${category}/`)
  );

  const isFundamentals = (slug: string) => slug.includes('/fundamentals');
  const getDepth = (slug: string) => {
    const base = `notes/interview-questions/${category}/`;
    const rest = slug.replace(base, '');
    return rest.split('/').length;
  };
  const sortedPosts = posts.slice().sort((a, b) => {
    const aFund = isFundamentals(a.slug);
    const bFund = isFundamentals(b.slug);
    if (aFund !== bFund) {
      return aFund ? -1 : 1;
    }
    const depthDiff = getDepth(a.slug) - getDepth(b.slug);
    if (depthDiff !== 0) {
      return depthDiff;
    }
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  });

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
      {sortedPosts.length > 0 ? (
        <div className="space-y-4">
          {sortedPosts.map((post) => {
            const wordCount = post.word_count || 0;
            const readingTime = Math.max(1, Math.ceil(wordCount / 300));
            const updatedAt = post.updated_at || post.date;
            return (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group cursor-pointer hover:shadow-md transition-all duration-300">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.summary}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(updatedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {wordCount.toLocaleString()} 字
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {readingTime} 分钟
                  </span>
                </div>
              </Card>
            </Link>
          );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>暂无文章</p>
          <Link 
            href="/interview-questions" 
            className="mt-4 inline-block text-pink-600 hover:text-pink-700"
          >
            返回八股文列表
          </Link>
        </div>
      )}

      {/* 返回按钮 */}
      <div className="mt-12 pt-6 border-t border-pink-100">
        <Link 
          href="/interview-questions" 
          className="text-pink-600 hover:text-pink-700 text-sm font-medium"
        >
          ← 返回八股文列表
        </Link>
      </div>
    </div>
  );
}
