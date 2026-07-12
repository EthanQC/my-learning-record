'use client';

import { useEffect, useRef, useState } from 'react';

export type ThemeName = 'duo' | 'editorial' | 'night';

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'duo', label: '双线' },
  { value: 'editorial', label: '编辑刊' },
  { value: 'night', label: '夜航' },
];

/** 换肤 + 写 localStorage + 同步 meta theme-color + 临时过渡类（§4/D6） */
export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 300);
  }
  root.dataset.theme = theme;
  try {
    localStorage.setItem('devline-theme', theme);
  } catch {
    /* 隐私模式下静默 */
  }
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  }
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>('duo');
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // mount 后从防闪烁脚本已设置的 html 属性同步（避免水合期不一致）
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 一次性读取防闪烁脚本已写入的 DOM 属性做水合期校正，非级联更新
    if (t === 'duo' || t === 'editorial' || t === 'night') setTheme(t);
  }, []);

  // 点击面板外关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !btnRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // 打开时焦点落当前项
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, THEMES.findIndex((t) => t.value === theme));
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        [idx]?.focus();
    });
  }, [open, theme]);

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? '双线';

  function select(t: ThemeName) {
    setTheme(t);
    applyTheme(t);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onPanelKeyDown(e: React.KeyboardEvent) {
    const radios = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []
    );
    const active = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      radios[(active + delta + radios.length) % radios.length]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (active >= 0) select(THEMES[active].value);
    }
  }

  return (
    <div className="theme-switcher">
      <button
        ref={btnRef}
        type="button"
        className="theme-switcher-btn"
        aria-label={`主题：当前${currentLabel}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-dot" data-dot={theme} aria-hidden="true" />
        <span className="theme-switcher-text">主题</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="theme-switcher-panel"
          role="radiogroup"
          aria-label="主题"
          onKeyDown={onPanelKeyDown}
        >
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={t.value === theme}
              className="theme-switcher-option"
              onClick={() => select(t.value)}
            >
              <span className="theme-dot" data-dot={t.value} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
