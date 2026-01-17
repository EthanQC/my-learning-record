export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getStats, getCategories } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

// 计算阅读时间（假设每分钟阅读 300 字）
function estimateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 300);
  return `${minutes} 分钟`;
}

export default async function HomePage() {
  const [stats, categories] = await Promise.all([
    getStats(),
    getCategories(),
  ]);

  const statsUnavailable =
    stats.total_posts === 0 &&
    stats.total_categories === 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section - 自我介绍 + 网站介绍 */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* 主标题区域 - 带渐变动画背景 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-pink-50 p-8 sm:p-12 mb-8 border border-pink-100/50 shadow-sm">
            {/* 装饰性背景元素 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-100/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                <span className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent animate-gradient">情长</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                未来，要保持健康，坚持锻炼
              </p>
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                要开心、乐观，难免要哭泣，但永远不要放弃自己
              </p>
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                要保持思考，保持愤怒，别丢掉对世界的细腻感知
              </p>

              {/* 技术栈标签 */}
              <div className="flex flex-wrap gap-2 mt-6">
                {['Go', 'MySQL', 'Redis', 'Docker', 'Kubernetes'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-3 py-1.5 bg-white/80 text-gray-600 rounded-full text-sm border border-pink-100 shadow-sm hover:border-pink-200 hover:shadow transition-all cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 网站介绍 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-pink-100/50 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Qingverse</h2>
            <p className="text-gray-600 leading-relaxed">
              个人学习记录网站，主要包含后端开发相关的八股、面经、实习记录以及日常的碎碎念
            </p>
            <p className="text-gray-600 leading-relaxed">
              希望这些内容能帮助到同样在准备面试或学习技术的你
            </p>
          </div>
        </div>
      </section>

      {/* 最近更新 - 居中展示 */}
      {stats.recent_posts.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">最近更新</h2>
              <Link href="/posts" className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors">
                查看全部
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recent_posts.slice(0, 6).map((post) => {
                // 估算字数（基于标题和摘要长度的简单估算）
                const estimatedWords = (post.title.length + (post.summary?.length || 0)) * 10 + 500;
                
                return (
                  <Link key={post.slug} href={`/posts/${post.slug}`}>
                    <Card className="group hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 group-hover:text-pink-500 transition-colors mb-2 line-clamp-1">
                            {post.title}
                          </h3>
                          {post.summary && (
                            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.summary}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(post.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              约 {estimatedWords} 字
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {estimateReadingTime(estimatedWords)}
                            </span>
                            <span className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 统计数据 - 放到底部 */}
      {!statsUnavailable && (
        <section className="py-12 px-4 bg-gradient-to-b from-transparent to-pink-50/30">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center py-6 sm:py-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-pink-100/50 shadow-sm hover:shadow transition-shadow">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent mb-1">
                  {stats.total_posts}
                </div>
                <div className="text-gray-500 text-sm">篇文章</div>
              </div>
              <div className="text-center py-6 sm:py-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-pink-100/50 shadow-sm hover:shadow transition-shadow">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent mb-1">
                  {stats.total_categories}
                </div>
                <div className="text-gray-500 text-sm">个分类</div>
              </div>
              <div className="text-center py-6 sm:py-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-pink-100/50 shadow-sm hover:shadow transition-shadow">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent mb-1">
                  {categories.length}
                </div>
                <div className="text-gray-500 text-sm">个主题</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
