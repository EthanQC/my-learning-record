import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-pink-100/50 bg-white/50">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* 主要内容 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
          {/* Logo 和描述 */}
          <div className="text-center sm:text-left">
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
              Qingverse
            </Link>
            <p className="text-gray-500 text-sm mt-1">技术学习与成长记录</p>
          </div>
          
          {/* 社交链接 */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/EthanQC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="mailto:2367918546@qq.com"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <span
              className="text-gray-400 hover:text-pink-500 transition-colors cursor-pointer"
              title="微信: 13537821092"
              aria-label="微信"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.006-.27-.022-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
            </span>
            <a
              href="https://www.xiaohongshu.com/user/profile/60f596ce000000000101edb0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="小红书"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 3h3l.5 2h-4l.5-2zm-4 0h3l-.5 2h-4l1.5-2zm-2 4h11v2H6.5v-2zm0 4h11v2H6.5v-2zm2 4h7v2h-7v-2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 快速链接 */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-6">
          <Link href="/notes/interview-questions" className="hover:text-pink-500 transition-colors">八股</Link>
          <Link href="/interview-experiences" className="hover:text-pink-500 transition-colors">面经</Link>
          <Link href="/notes" className="hover:text-pink-500 transition-colors">学习记录</Link>
          <Link href="/murmurs" className="hover:text-pink-500 transition-colors">碎碎念</Link>
        </div>

        {/* 备案信息 */}
        <div className="pt-4 border-t border-pink-100/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-400">
            <span>© 2026 Qingverse</span>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002008906"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-pink-500 transition-colors"
            >
              <img
                src="/beian-gongan.png"
                alt=""
                className="h-3.5 w-3.5"
                loading="lazy"
              />
              粤公网安备44030002008906号
            </a>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors"
            >
              粤ICP备2025487305号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
