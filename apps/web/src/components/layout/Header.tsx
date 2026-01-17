'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '八股', href: '/notes/interview-questions' },
  { name: '面经', href: '/interview-experiences' },
  { name: '学习记录', href: '/notes' },
  { name: '碎碎念', href: '/murmurs' },
];

type SocialLink = {
  name: string;
  href?: string;
  wechatId?: string;
  icon: ReactNode;
};

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    href: 'https://github.com/EthanQC',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: '邮箱',
    href: 'mailto:2367918546@qq.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: '微信',
    wechatId: '13537821092',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.006-.27-.022-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
      </svg>
    ),
  },
  {
    name: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/60f596ce000000000101edb0',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 3h3l.5 2h-4l.5-2zm-4 0h3l-.5 2h-4l1.5-2zm-2 4h11v2H6.5v-2zm0 4h11v2H6.5v-2zm2 4h7v2h-7v-2z"/>
      </svg>
    ),
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 滚动时自动收起/展开顶栏
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 只在文章页面启用滚动隐藏
      if (pathname.startsWith('/posts/')) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-pink-100/50 shadow-sm transition-transform duration-300',
        isHidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - 贴到最左边 */}
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent hover:from-pink-500 hover:to-pink-400 transition-all flex-shrink-0"
          >
            Qingverse
          </Link>
          
          {/* Desktop Navigation - 居中偏右 */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2 ml-auto mr-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'px-3 lg:px-4 py-2 rounded-full text-sm lg:text-base font-medium transition-all duration-200',
                    isActive(item.href) 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Social Links - 贴到最右边 */}
          <div className="hidden md:flex items-center gap-1">
            {socialLinks.map((link) => {
              if (link.wechatId) {
                return (
                  <span
                    key={link.name}
                    onClick={() => {
                      navigator.clipboard.writeText(link.wechatId!);
                      alert(`微信号已复制: ${link.wechatId}`);
                    }}
                    className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all cursor-pointer"
                    title={`微信: ${link.wechatId}`}
                    role="button"
                    tabIndex={0}
                  >
                    {link.icon}
                  </span>
                );
              }
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href?.startsWith('http') ? '_blank' : undefined}
                  rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all"
                  title={link.name}
                >
                  {link.icon}
                </a>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-pink-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100/50 animate-fade-in">
            <ul className="flex flex-col gap-1 mb-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-base font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Mobile Social Links */}
            <div className="flex items-center gap-3 px-4 pt-4 border-t border-pink-100/50">
              {socialLinks.map((link) => {
                if (link.wechatId) {
                  return (
                    <span
                      key={link.name}
                      onClick={() => {
                        navigator.clipboard.writeText(link.wechatId!);
                        alert(`微信号已复制: ${link.wechatId}`);
                      }}
                      className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all cursor-pointer"
                      title={`微信: ${link.wechatId}`}
                      role="button"
                      tabIndex={0}
                    >
                      {link.icon}
                    </span>
                  );
                }
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href?.startsWith('http') ? '_blank' : undefined}
                    rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
