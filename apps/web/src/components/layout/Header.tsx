'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '八股', href: '/interview-questions' },
  { name: '面经', href: '/interview-experiences' },
  { name: '学习记录', href: '/notes' },
  { name: '碎碎念', href: '/murmurs' },
];

interface SocialLinkItem {
  name: string;
  href: string;
  icon: ReactNode;
}

const socialLinks: SocialLinkItem[] = [
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
    name: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/60f596ce000000000101edb0',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972.794.794 0 0 0-.884-.618.795.795 0 0 0-.692.794c0 .101-.002.666.001.777zm-11.509 4.808c-.203.001-1.353.004-1.685.003a2.528 2.528 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124.66.01 1.32.002 1.981 0 .01 0 .02-.006.023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01a.834.834 0 0 0-.01.08c-.027.397-.038.495-.234 3.06-.012.24-.034.389-.135.607-.026.057-.033.042.003.112.046.092.681 1.523.787 1.74.008.015.011.02.017.02.008 0 .033-.026.047-.044.147-.187.268-.391.371-.606.306-.635.44-1.325.486-1.706.014-.11.021-.22.03-.33l.204-2.616.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.427 1.427 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.443.443 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293c.076.982.153 1.964.233 2.946.05.4.186 1.085.487 1.706.103.215.223.419.37.606.015.018.037.051.048.049.02-.003.742-1.642.804-1.765.036-.07.03-.055.003-.112zm3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56c-.01 0-.02.006-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.534.534 0 0 0-.02.191.46.46 0 0 0 .23.378.981.981 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.53.53 0 0 0-.023.172.465.465 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001c.01 0 .02-.006.023-.015l.575-1.28a.025.025 0 0 0-.024-.035zm-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829 0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047.001.037.465 1.064.555 1.263.01.02.03.033.051.033.157.003.767.009.938-.014.153-.02.3-.06.438-.132.3-.156.49-.419.595-.765.052-.172.075-.353.075-.533.002-2.33 0-4.66-.007-6.991a.032.032 0 0 0-.032-.032zm11.784 6.896c0-.014-.01-.021-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084-.37 0-1.11-.002-1.304 0-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036c.006.01.013.008.058.008 1.748.003 3.495.002 5.243.002.03-.001.034-.006.035-.033v-1.539zm4.177-3.43c0 .013-.007.023-.02.024-.346.006-.692.004-1.037.004-.014-.002-.022-.01-.022-.024-.005-.434-.007-.869-.01-1.303 0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015.093.025.16.107.165.204.006.431.002 1.153.001 1.153zm2.67.244a1.953 1.953 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21c0-.132-.007-.263-.025-.394a1.823 1.823 0 0 0-.153-.53 1.533 1.533 0 0 0-.677-.71 2.167 2.167 0 0 0-1-.258c-.153-.003-.567 0-.72 0-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007c-.006.006-.008.012-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128V11.19s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003c.098 0 .191.02.28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185 0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033.184.437.374.871.57 1.303a.045.045 0 0 0 .04.026c.17.005.34.002.51.003.15-.002.517.004.666-.01a2.03 2.03 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981c0-.128-.01-.254-.034-.38 0 .078-.029-.641-.724-.998z" />
      </svg>
    ),
  },
];

export function Header() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isInterviewQuestionsPath =
    pathname.startsWith('/interview-questions') ||
    pathname.startsWith('/notes/interview-questions');

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
    // 八股页面精确匹配，避免与学习记录冲突
    if (href === '/interview-questions' || href === '/notes/interview-questions') {
      return (
        pathname === '/interview-questions' ||
        pathname.startsWith('/interview-questions/') ||
        isInterviewQuestionsPath
      );
    }
    // 学习记录排除八股路径
    if (href === '/notes') {
      return pathname.startsWith('/notes') && !isInterviewQuestionsPath;
    }
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
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all"
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
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
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all"
                  title={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
