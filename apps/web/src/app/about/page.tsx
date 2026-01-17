import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const techStack = [
  { category: '后端', items: ['Go', 'C++', 'Python'] },
  { category: '数据库', items: ['MySQL', 'Redis', 'PostgreSQL'] },
  { category: '前端', items: ['React', 'Next.js', 'TypeScript'] },
  { category: '工具', items: ['Docker', 'Git', 'Linux'] },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 个人介绍 */}
      <section className="text-center mb-12">
        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-pink-200 to-pink-100 mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
            <svg className="w-14 h-14 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          关于我
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
          情长
          未来，要保持健康，坚持锻炼
          要开心、乐观，难免要哭泣，但永远不要放弃自己
          要保持思考，保持愤怒，别丢掉对世界的细腻感知
        </p>
      </section>

      {/* 技术栈 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">技术栈</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {techStack.map((tech) => (
            <Card key={tech.category} hover={false} className="text-center">
              <h3 className="font-semibold text-gray-700 mb-3">{tech.category}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {tech.items.map((item) => (
                  <span 
                    key={item}
                    className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 关于这个网站 */}
      <section className="mb-12">
        <Card hover={false}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">关于这个网站</h2>
          <div className="text-gray-600 space-y-3 leading-relaxed">
            <p>
              这个网站是我的个人技术博客，用于记录学习笔记、面试经验和技术思考。
            </p>
            <p>
              主要内容包括：
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>八股文</strong> - 面试必备的基础知识整理</li>
              <li><strong>学习笔记</strong> - 日常学习的记录和总结</li>
              <li><strong>面经分享</strong> - 真实的面试经历与经验</li>
              <li><strong>实习记录</strong> - 实习期间的工作与成长</li>
            </ul>
          </div>
        </Card>
      </section>

      {/* 联系方式 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">联系我</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="https://github.com/EthanQC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-xl border border-pink-100 text-gray-700 hover:border-pink-300 hover:text-pink-500 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
          <a 
            href="mailto:2367918546@qq.com"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-xl border border-pink-100 text-gray-700 hover:border-pink-300 hover:text-pink-500 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      </section>

      {/* 返回首页 */}
      <div className="mt-12 text-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}