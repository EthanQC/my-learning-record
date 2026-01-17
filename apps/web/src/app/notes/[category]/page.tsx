export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

// 笔记分类配置
const categoryConfig: Record<string, { label: string; description: string }> = {
  'data-structure-and-algorithm': {
    label: '算法笔记',
    description: '刷题记录与算法总结',
  },
  'go': {
    label: 'Go 语言',
    description: 'Go 语言学习与实践',
  },
  'cpp': {
    label: 'C++',
    description: 'C++ 特性与最佳实践',
  },
  'back-end': {
    label: '后端开发',
    description: '后端架构与开发技术',
  },
  'database': {
    label: '数据库',
    description: 'MySQL、Redis 等数据库知识',
  },
  'front-end': {
    label: '前端开发',
    description: 'React、TypeScript 等前端技术',
  },
  'Linux': {
    label: 'Linux',
    description: 'Linux 系统与命令',
  },
  'redis': {
    label: 'Redis',
    description: 'Redis 缓存与数据结构',
  },
  'elasticsearch': {
    label: 'Elasticsearch',
    description: '搜索引擎与全文检索',
  },
  'git': {
    label: 'Git',
    description: '版本控制与协作',
  },
  'design-mod': {
    label: '设计模式',
    description: '常用设计模式与实践',
  },
  'other': {
    label: '其他',
    description: '其他技术笔记',
  },
};

interface Props {
  params: Promise<{ category: string }>;
}

export default async function NoteCategoryPage({ params }: Props) {
  const { category } = await params;
  
  const config = categoryConfig[category];
  if (!config) {
    notFound();
  }

  // 获取该分类下的文章
  const allPosts = await getPosts();
  
  // 过滤出 notes/[category] 下的文章
  const categoryPosts = allPosts.filter(post => 
    post.slug.startsWith(`notes/${category}/`) || post.category === category
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-pink-500">首页</Link></li>
          <li>/</li>
          <li><Link href="/notes" className="hover:text-pink-500">笔记</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">{config.label}</li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {config.label}
        </h1>
        <p className="text-gray-500">{config.description}</p>
        <p className="text-sm text-gray-400 mt-2">共 {categoryPosts.length} 篇笔记</p>
      </div>

      {/* 文章列表 */}
      {categoryPosts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">该分类下暂无文章</p>
          <Link href="/notes" className="text-pink-500 hover:text-pink-600 mt-4 inline-block">
            返回笔记列表
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {categoryPosts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors truncate">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.summary}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0">
                    {formatDate(post.date)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 返回链接 */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link href="/notes" className="text-pink-500 hover:text-pink-600 font-medium text-sm">
          ← 返回学习笔记
        </Link>
      </div>
    </div>
  );
}
