export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

// 分类标签映射
const categoryLabels: Record<string, { label: string; description: string }> = {
  'computer-network': { 
    label: '计算机网络', 
    description: 'TCP/UDP协议、HTTP、网络分层模型、Socket编程等'
  },
  'operation-system': { 
    label: '操作系统', 
    description: '进程与线程、内存管理、文件系统、IO模型等'
  },
  'mysql': { 
    label: 'MySQL', 
    description: '索引原理、事务隔离、MVCC、锁机制、SQL优化等'
  },
  'redis': { 
    label: 'Redis', 
    description: '数据结构、持久化、缓存策略、分布式锁等'
  },
  'cpp': { 
    label: 'C++', 
    description: '语言特性、STL、智能指针、多线程、内存管理等'
  },
  'go': { 
    label: 'Go', 
    description: 'goroutine、channel、GC机制、并发模式等'
  },
  'data-structure-and-algorithms': { 
    label: '数据结构与算法', 
    description: '常见数据结构与算法题目解析'
  },
  'microservices-and-cloud-native': { 
    label: '微服务与云原生', 
    description: 'Docker、Kubernetes、服务治理等'
  },
  'scenario': { 
    label: '场景题', 
    description: '系统设计与场景分析'
  },
  'projects': { 
    label: '项目相关', 
    description: '项目经验与技术选型'
  },
  'internships': { 
    label: '实习相关', 
    description: '实习经验与面试准备'
  },
};

interface Props {
  params: Promise<{ category: string }>;
}

export default async function InterviewCategoryPage({ params }: Props) {
  const { category } = await params;
  
  const categoryInfo = categoryLabels[category];
  if (!categoryInfo) {
    notFound();
  }

  // 获取该分类下的文章
  const allPosts = await getPosts();
  
  // 过滤出 notes/interview-questions/[category] 下的文章
  const categoryPosts = allPosts.filter(post => 
    post.slug.startsWith(`notes/interview-questions/${category}`)
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-pink-500">首页</Link></li>
          <li>/</li>
          <li><Link href="/notes" className="hover:text-pink-500">学习记录</Link></li>
          <li>/</li>
          <li><Link href="/notes/interview-questions" className="hover:text-pink-500">八股</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">{categoryInfo.label}</li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {categoryInfo.label}
        </h1>
        <p className="text-gray-500">{categoryInfo.description}</p>
        <p className="text-sm text-gray-400 mt-2">
          共 {categoryPosts.length} 篇笔记
        </p>
      </div>

      {/* 文章列表 */}
      {categoryPosts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">该分类暂时还没有笔记</p>
          <Link 
            href="/notes/interview-questions"
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            返回八股分类
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {categoryPosts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group hover:shadow-md transition-all duration-300">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {post.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{formatDate(post.date)}</span>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-pink-400">#{tag}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 返回导航 */}
      <div className="mt-8 pt-6 border-t border-pink-100">
        <Link 
          href="/notes/interview-questions" 
          className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium transition-colors"
        >
          ← 返回八股分类
        </Link>
      </div>
    </div>
  );
}
