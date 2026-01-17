export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/api';
import { Card } from '@/components/ui/Card';

// 笔记分类配置
const noteCategories = [
  {
    name: 'interview-questions',
    label: '八股文',
    description: '面试必备知识点整理',
    href: '/notes/interview-questions',
  },
  {
    name: 'data-structure-and-algorithm',
    label: '算法笔记',
    description: '刷题记录与算法总结',
    href: '/notes/data-structure-and-algorithm',
  },
  {
    name: 'go',
    label: 'Go 语言',
    description: 'Go 语言学习与实践',
    href: '/notes/go',
  },
  {
    name: 'cpp',
    label: 'C++',
    description: 'C++ 特性与最佳实践',
    href: '/notes/cpp',
  },
  {
    name: 'back-end',
    label: '后端开发',
    description: '后端架构与开发技术',
    href: '/notes/back-end',
  },
  {
    name: 'database',
    label: '数据库',
    description: 'MySQL、Redis 等数据库知识',
    href: '/notes/database',
  },
  {
    name: 'front-end',
    label: '前端开发',
    description: 'React、TypeScript 等前端技术',
    href: '/notes/front-end',
  },
  {
    name: 'Linux',
    label: 'Linux',
    description: 'Linux 系统与命令',
    href: '/notes/Linux',
  },
];

export default async function NotesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 页面标题 */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          学习记录
        </h1>
        <p className="text-gray-500">
          系统整理的技术学习笔记，包括八股文、算法、编程语言等
        </p>
      </div>

      {/* 笔记分类网格 */}
      <section className="mb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {noteCategories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="h-full group cursor-pointer hover:shadow-md transition-all duration-300">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors">
                  {category.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 快速链接 */}
      <section className="pt-8 border-t border-pink-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">更多内容</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/interview-experiences" className="text-pink-500 hover:text-pink-600 text-sm font-medium px-4 py-2 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors">
            面经分享
          </Link>
          <Link href="/internship-records" className="text-pink-500 hover:text-pink-600 text-sm font-medium px-4 py-2 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors">
            实习记录
          </Link>
          <Link href="/murmurs" className="text-pink-500 hover:text-pink-600 text-sm font-medium px-4 py-2 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors">
            碎碎念
          </Link>
        </div>
      </section>
    </div>
  );
}
