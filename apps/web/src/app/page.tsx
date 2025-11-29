export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getStats, getCategories } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function HomePage() {
  const [stats, categories] = await Promise.all([
    getStats(),
    getCategories(),
  ]);

  const statsUnavailable =
    stats.total_posts === 0 &&
    stats.total_categories === 0 &&
    (!stats.last_update || stats.last_update.startsWith('0001-01-01'));
  const lastUpdateText = statsUnavailable ? '尚无数据' : formatDate(stats.last_update);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          欢迎来到 <span className="text-pink-600">Qingverse</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          这里记录着我的技术学习与成长之路 💖
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/posts">
            <Button variant="primary" size="lg">
              开始阅读 →
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              关于我
            </Button>
          </Link>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <Card className="text-center">
          <div className="text-4xl font-bold text-pink-600 mb-2">
            {stats.total_posts}
          </div>
          <div className="text-gray-600">篇文章</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-pink-600 mb-2">
            {stats.total_categories}
          </div>
          <div className="text-gray-600">个分类</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-pink-600 mb-2">
            {lastUpdateText}
          </div>
          <div className="text-gray-600">最后更新</div>
        </Card>
      </section>

      {/* 最近文章 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">最近文章</h2>
        {statsUnavailable && (
          <p className="text-gray-600 mb-4">暂时没有获取到文章数据，请稍后再试。</p>
        )}
        <div className="space-y-4">
          {stats.recent_posts.map((post) => (
            <Card key={post.slug} className="hover:border-pink-200 border border-transparent">
              <Link href={`/posts/${post.slug}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3">{post.summary}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <Badge>{post.category}</Badge>
                </div>
              </Link>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/posts">
            <Button variant="outline">查看全部文章 →</Button>
          </Link>
        </div>
      </section>

      {/* 分类卡片 */}
      <section>
        <h2 className="text-3xl font-bold mb-6">浏览分类</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={`/categories/${category.name}`}>
              <Card className="text-center hover:border-pink-300 border border-transparent">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.label}
                </h3>
                <p className="text-gray-600">{category.count} 篇文章</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
