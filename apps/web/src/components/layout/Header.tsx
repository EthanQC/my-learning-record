'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/posts' },
  { name: '分类', href: '/categories' },
  { name: '关于', href: '/about' },
  { name: '留言', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-pink-100">
      <nav className="container mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Qingverse
          </Link>
          
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'text-gray-600 hover:text-pink-600 transition-colors',
                    pathname === item.href && 'text-pink-600 font-medium'
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
