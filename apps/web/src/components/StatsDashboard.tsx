'use client';

import { useEffect, useState } from 'react';

const GC = 'https://stats.qingverse.com';

type ArticleRef = { path: string; title: string; track: 'deep' | 'intro' };
type Counter = { count: string; count_unique: string };

function parseCount(c: string | undefined): number {
  return parseInt((c ?? '0').replace(/[^\d]/g, ''), 10) || 0;
}

async function fetchCounter(pagePath: string, query = ''): Promise<Counter | null> {
  try {
    const res = await fetch(`${GC}/counter/${pagePath}.json${query}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Counter;
  } catch {
    return null;
  }
}

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

type StatsState =
  | { status: 'loading' }
  | { status: 'down' }
  | {
      status: 'ok';
      totalPV: number;
      totalUV: number;
      todayPV: number;
      trend: { date: string; pv: number }[];
      top: { title: string; track: 'deep' | 'intro'; pv: number }[];
    };

export function StatsDashboard({ articles }: { articles: ArticleRef[] }) {
  const [state, setState] = useState<StatsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const total = await fetchCounter('TOTAL');
      if (!total) {
        // §5：statsAPI 失败时不破版式，优雅降级
        if (!cancelled) setState({ status: 'down' });
        return;
      }
      const today = isoDaysAgo(0);
      const [todayC, trend, top] = await Promise.all([
        fetchCounter('TOTAL', `?start=${today}&end=${today}`),
        Promise.all(
          Array.from({ length: 30 }, (_, i) => {
            const d = isoDaysAgo(29 - i);
            return fetchCounter('TOTAL', `?start=${d}&end=${d}`).then((c) => ({
              date: d,
              pv: parseCount(c?.count),
            }));
          })
        ),
        Promise.all(
          articles.map((a) =>
            fetchCounter(a.path, '').then((c) => ({
              title: a.title,
              track: a.track,
              pv: parseCount(c?.count),
            }))
          )
        ),
      ]);
      if (cancelled) return;
      setState({
        status: 'ok',
        totalPV: parseCount(total.count),
        totalUV: parseCount(total.count_unique),
        todayPV: parseCount(todayC?.count),
        trend,
        top: top.sort((x, y) => y.pv - x.pv).slice(0, 10),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [articles]);

  if (state.status === 'loading') {
    return <div className="stats-down">统计加载中…</div>;
  }
  if (state.status === 'down') {
    return <div className="stats-down">统计服务暂不可用</div>;
  }

  const max = Math.max(1, ...state.trend.map((t) => t.pv));
  const BAR_W = 20; // 600 / 30 天

  return (
    <div>
      <div className="stats-grid">
        <div className="stats-card">
          <p className="stats-card-label">累计 PV</p>
          <p className="stats-card-value">{state.totalPV.toLocaleString()}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">累计 UV</p>
          <p className="stats-card-value">{state.totalUV.toLocaleString()}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">今日 PV</p>
          <p className="stats-card-value">{state.todayPV.toLocaleString()}</p>
        </div>
      </div>
      <div className="stats-chart">
        <p className="section-label">近 30 天访问</p>
        {/* §5：纯 SVG，不引图表库；颜色走 token */}
        <svg viewBox="0 0 600 140" role="img" aria-label="近 30 天每日 PV 柱状图">
          {state.trend.map((t, i) => {
            const h = Math.round((t.pv / max) * 110);
            return (
              <rect
                key={t.date}
                x={i * BAR_W + 3}
                y={124 - Math.max(h, 1)}
                width={BAR_W - 6}
                height={Math.max(h, 1)}
                fill="rgb(var(--c-accent))"
              />
            );
          })}
          <line x1="0" y1="125" x2="600" y2="125" stroke="rgb(var(--c-border))" strokeWidth="1" />
        </svg>
      </div>
      <div className="stats-top">
        <p className="section-label">文章浏览榜</p>
        <ol>
          {state.top.map((t) => (
            <li key={t.title}>
              <span className="track-dot" data-track={t.track} aria-hidden="true" />
              <span className="stats-top-title">{t.title}</span>
              <span className="article-card-meta">{t.pv.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
