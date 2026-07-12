'use client';

import { useEffect, useRef, useState } from 'react';

export type TrackName = 'deep' | 'intro';

const TABS = [
  { value: 'deep' as const, label: '深度线 · 给工程师' },
  { value: 'intro' as const, label: '科普线 · 给所有人' },
];

/** 轨道变更事件名——applyTrack 广播、RailTab 订阅，保证任意来源切轨都同步 aria */
export const TRACK_EVENT = 'devline-track-change';

/** §5：点击改 html 属性 + 写 localStorage（key devline-track）；显隐全由 CSS 驱动 */
export function applyTrack(track: TrackName) {
  const root = document.documentElement;
  // D6：列表入场动效仅在交互后启用（rail-animated 一旦挂上不再摘），保证开屏零动画
  root.classList.add('rail-animated');
  root.dataset.track = track;
  try {
    localStorage.setItem('devline-track', track);
  } catch {
    /* 隐私模式下静默 */
  }
  // 广播：让 RailTab（或任何监听者）同步内部 state，避免"外部改了 data-track 但 tab 的 aria/tabindex 不动"
  window.dispatchEvent(new CustomEvent<TrackName>(TRACK_EVENT, { detail: track }));
}

export function RailTab() {
  const [track, setTrack] = useState<TrackName>('deep');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // §5：mount 后从防闪烁脚本已设置的 html 属性同步 aria
  useEffect(() => {
    const t = document.documentElement.dataset.track;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 一次性读取防闪烁脚本已写入的 DOM 属性做水合期校正，非级联更新（同 T8 ThemeSwitcher 精确对应模式）
    if (t === 'deep' || t === 'intro') setTrack(t);
  }, []);

  // 订阅外部轨道变更（如空态 EmptyTrackNotice 的跨轨 CTA），同步 aria-selected / roving tabindex
  useEffect(() => {
    const onExternal = (e: Event) => {
      const t = (e as CustomEvent<TrackName>).detail;
      if (t === 'deep' || t === 'intro') setTrack(t);
    };
    window.addEventListener(TRACK_EVENT, onExternal);
    return () => window.removeEventListener(TRACK_EVENT, onExternal);
  }, []);

  function select(t: TrackName) {
    setTrack(t);
    applyTrack(t); // applyTrack 内会 dispatch，本组件的监听器忽略重复设值（幂等）
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.findIndex((t) => t.value === track);
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // aria-orientation="vertical"：↑/↓ 在两轨间移动焦点（§5）
      next = (idx + (e.key === 'ArrowDown' ? 1 : -1) + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = TABS.length - 1;
    }
    if (next >= 0) {
      e.preventDefault();
      select(TABS[next].value); // 自动激活模式（§5：列表已静态渲染无加载延迟）
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section className="rail-tab" aria-label="轨道切换">
      {/* §5：两条线 full-bleed（绝对定位 left:0/right:0，禁用 100vw 负 margin）、不可点 */}
      <span className="rail-line rail-line-deep" aria-hidden="true" />
      <span className="rail-line rail-line-intro" aria-hidden="true" />
      <div
        className="container-devline rail-tab-labels"
        role="tablist"
        aria-label="内容轨道"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {TABS.map((t, i) => (
          <button
            key={t.value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`track-tab-${t.value}`}
            aria-selected={track === t.value}
            aria-controls={`track-panel-${t.value}`}
            tabIndex={track === t.value ? 0 : -1}
            data-rail-tab={t.value}
            className="rail-pill"
            onClick={() => select(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/** §5 轨道空态：跨轨 CTA，点击即切 tab（仅用于首页面板内） */
export function EmptyTrackNotice({ track }: { track: TrackName }) {
  const other: TrackName = track === 'deep' ? 'intro' : 'deep';
  const text =
    track === 'deep'
      ? '深度线首篇打磨中 · 先沿科普线逛逛 →'
      : '科普线首篇打磨中 · 先沿深度线逛逛 →';
  return (
    <button type="button" className="empty-track" onClick={() => applyTrack(other)}>
      {text}
    </button>
  );
}
