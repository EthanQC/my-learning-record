import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">关于我</h1>
      
      <Card>
        <h2 className="text-2xl font-semibold mb-4">👋 你好!</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          我是一名热爱技术的开发者,专注于 Go 后端开发和全栈工程。
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          这个博客记录了我的学习历程、技术笔记和碎碎念。
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">📚 技术栈</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>后端: Go, C++, MySQL, Redis</li>
          <li>前端: React, Next.js, TypeScript</li>
          <li>工具: Docker, Git, Linux</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">📫 联系方式</h3>
        <ul className="text-gray-700 space-y-2">
          <li>GitHub: <a href="https://github.com/EthanQC" className="text-pink-600 hover:underline">@EthanQC</a></li>
          <li>Email: <a href="mailto:wkr1835484520@qq.com" className="text-pink-600 hover:underline">wkr1835484520@qq.com</a></li>
        </ul>
      </Card>
    </div>
  );
}