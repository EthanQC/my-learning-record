export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';

// 八股文子分类配置
const interviewCategories = [
  {
    name: 'computer-network',
    label: '计算机网络',
    description: 'TCP/UDP、HTTP、网络分层等',
    subTopics: ['TCP三次握手', 'HTTP缓存', '网络分层模型', 'Socket编程']
  },
  {
    name: 'operation-system',
    label: '操作系统',
    description: '进程线程、内存管理、文件系统等',
    subTopics: ['进程与线程', '内存管理', '死锁', 'IO模型']
  },
  {
    name: 'mysql',
    label: 'MySQL',
    description: '索引、事务、锁机制、优化等',
    subTopics: ['索引原理', '事务隔离级别', 'MVCC', 'SQL优化']
  },
  {
    name: 'redis',
    label: 'Redis',
    description: '数据结构、持久化、集群等',
    subTopics: ['数据类型', '持久化机制', '缓存策略', '分布式锁']
  },
  {
    name: 'cpp',
    label: 'C++',
    description: '语言特性、STL、内存管理等',
    subTopics: ['智能指针', 'STL容器', '多线程', '内存模型']
  },
  {
    name: 'go',
    label: 'Go',
    description: 'goroutine、channel、GC 等',
    subTopics: ['goroutine调度', 'channel原理', 'GC机制', '并发模式']
  },
  {
    name: 'data-structure-and-algorithms',
    label: '数据结构与算法',
    description: '常见算法与数据结构',
    subTopics: ['排序算法', '树结构', '动态规划', '图算法']
  },
  {
    name: 'microservices-and-cloud-native',
    label: '微服务与云原生',
    description: 'Docker、K8s、服务治理等',
    subTopics: ['Docker', 'Kubernetes', '服务发现', '熔断降级']
  },
];

export default async function InterviewQuestionsPage() {
  // 获取八股文相关的文章
  const allPosts = await getPosts('interview-questions');

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><Link href="/" className="hover:text-pink-500">首页</Link></li>
          <li>/</li>
          <li><Link href="/notes" className="hover:text-pink-500">学习记录</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">八股</li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          后端开发常见面试问题总结
        </h1>
        <p className="text-gray-500 max-w-2xl">
          面试必备知识点整理，涵盖计算机网络、操作系统、数据库、编程语言等核心内容。
          点击分类查看详细笔记。
        </p>
      </div>

      {/* 分类卡片网格 */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {interviewCategories.map((category) => (
          <Link 
            key={category.name} 
            href={`/notes/interview-questions/${category.name}`}
          >
            <Card className="h-full group cursor-pointer hover:border-pink-200 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-pink-500 transition-colors">
                {category.label}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {category.subTopics.slice(0, 3).map((topic) => (
                  <span 
                    key={topic}
                    className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
                {category.subTopics.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-400 text-xs">
                    +{category.subTopics.length - 3}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 返回导航 */}
      <div className="mt-8 pt-6 border-t border-pink-100">
        <Link 
          href="/notes" 
          className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium transition-colors"
        >
          ← 返回学习记录
        </Link>
      </div>
    </div>
  );
}
