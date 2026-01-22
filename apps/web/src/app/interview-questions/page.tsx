export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Card } from '@/components/ui/Card';

// 八股分类配置
const baguCategories = [
  {
    name: 'go',
    label: 'Go 八股',
    description: 'Go 语言面试高频题',
    href: '/interview-questions/go',
  },
  {
    name: 'cpp',
    label: 'C++ 八股',
    description: 'C++ 面试核心知识点',
    href: '/interview-questions/cpp',
  },
  {
    name: 'operation-system',
    label: '操作系统',
    description: '进程、线程、内存管理等',
    href: '/interview-questions/operation-system',
  },
  {
    name: 'computer-network',
    label: '计算机网络',
    description: 'TCP/IP、HTTP、网络协议',
    href: '/interview-questions/computer-network',
  },
  {
    name: 'mysql',
    label: 'MySQL',
    description: '索引、事务、锁机制',
    href: '/interview-questions/mysql',
  },
  {
    name: 'redis',
    label: 'Redis',
    description: '数据结构、持久化、集群',
    href: '/interview-questions/redis',
  },
  {
    name: 'data-structure-and-algorithms',
    label: '数据结构与算法',
    description: '常见算法与数据结构',
    href: '/interview-questions/data-structure-and-algorithms',
  },
  {
    name: 'microservices-and-cloud-native',
    label: '微服务与云原生',
    description: 'Docker、K8s、分布式系统',
    href: '/interview-questions/microservices-and-cloud-native',
  },
  {
    name: 'scenario',
    label: '场景题',
    description: '系统设计与场景分析',
    href: '/interview-questions/scenario',
  },
  {
    name: 'projects',
    label: '项目经验',
    description: '项目相关面试问题',
    href: '/interview-questions/projects',
  },
];

export default async function InterviewQuestionsPage() {
  // 获取八股文章列表
  const interviewPosts = await getPosts('interview-questions');

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 页面标题 */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-pink-500/70 mb-3">Interview Notes</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          八股文
        </h1>
        <p className="text-gray-500 max-w-2xl">
          面试必备知识点整理，涵盖语言、操作系统、网络、数据库等核心内容
        </p>
      </div>

      {/* 八股分类网格 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">按分类浏览</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {baguCategories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="h-full group cursor-pointer hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                    {category.label}
                  </h3>
                  <span className="text-xs text-pink-500/70 bg-pink-100/60 px-2 py-0.5 rounded-full">
                    {interviewPosts.filter((post) => post.slug.startsWith(`notes/interview-questions/${category.name}/`)).length} 篇
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {category.description}
                </p>
                <div className="mt-4 text-sm text-pink-600 font-medium">
                  进入目录 →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
