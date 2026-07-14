'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { MobileMenu } from '@/components/MobileMenu';
import { NAV_ITEMS } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container-devline site-header-inner">
        <Link href="/" className="brand" aria-label="Devline 首页">
          <span className="brand-dev">Dev</span>
          <span className="brand-line">line</span>
        </Link>
        <nav className="site-nav" aria-label="站内导航">
          {NAV_ITEMS.map((item) => {
            const current =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav-link"
                aria-current={current ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="site-header-actions">
          <ThemeSwitcher />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
