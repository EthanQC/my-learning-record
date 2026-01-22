'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  title: string;
  depth: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  // 监听滚动，高亮当前章节
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside 
      className={cn(
        'hidden lg:block flex-shrink-0 transition-all duration-300',
        isCollapsed ? 'w-14' : 'w-64'
      )}
    >
      <div className="sticky top-20 h-[calc(100vh-6rem)]">
        <div 
          className={cn(
            'h-full bg-white/80 backdrop-blur-sm border-r border-pink-100/60 transition-all duration-300 flex flex-col',
            isCollapsed ? 'w-14' : 'w-64'
          )}
        >
          {/* 收起/展开按钮 */}
          <div className={cn('px-3 pt-3', isCollapsed && 'px-2')}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 rounded-full border border-pink-100/70 bg-white/80 px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-pink-600 hover:border-pink-200 transition-colors',
                isCollapsed && 'px-2'
              )}
              title={isCollapsed ? '展开目录' : '收起目录'}
            >
              <svg 
                className={cn('w-4 h-4 transition-transform duration-300', isCollapsed && 'rotate-180')} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className={cn(isCollapsed && 'sr-only')}>收起目录</span>
            </button>
          </div>

          {/* 目录内容 */}
          {!isCollapsed && (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                目录
              </h3>
              <nav className="space-y-0.5 text-sm">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={cn(
                      'block py-1.5 transition-colors truncate border-l-2 rounded-r-md',
                      activeId === h.id
                        ? 'text-pink-700 border-pink-400 bg-pink-50/70 font-medium'
                        : 'text-gray-500 border-transparent hover:text-pink-600 hover:border-pink-200'
                    )}
                    style={{ paddingLeft: `${(h.depth - 1) * 12 + 8}px` }}
                  >
                    {h.title}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* 收起状态时显示图标 */}
          {isCollapsed && (
            <div className="flex-1 flex items-start justify-center pt-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
