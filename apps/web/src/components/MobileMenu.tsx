'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SITE } from '@/lib/site';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 路由变化即关闭
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 响应外部系统(路由)变化关闭面板，非级联渲染；同一模式已在 ThemeSwitcher（Task 8）裁定成立
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }
      // §5：焦点困在面板内
      if (e.key === 'Tab' && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>('a, button')
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div className="mobile-menu-root">
      <button
        ref={btnRef}
        type="button"
        className="hamburger"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        data-open={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar hamburger-bar-accent" aria-hidden="true" />
      </button>
      {open && (
        <div id="mobile-menu-panel" ref={panelRef} className="mobile-menu-panel">
          <nav aria-label="站内导航">
            {NAV_ITEMS.map((item) => {
              const current =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mobile-menu-item"
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mobile-menu-social">
            <a href="/feed.xml">RSS</a>
            <a href={SITE.github} rel="me noopener" target="_blank">
              GitHub
            </a>
            <a href={SITE.xiaohongshu} rel="me noopener" target="_blank">
              小红书
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
