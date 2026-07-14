import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import { StatsDashboard } from '@/components/StatsDashboard';

export const metadata: Metadata = {
  title: '统计',
  description: 'Devline 流量统计：自托管 GoatCounter，无 cookie，不追踪个人',
  alternates: { canonical: '/stats' },
};

export default async function StatsPage() {
  const articles = await getAllArticles();
  return (
    <section className="container-devline list-page">
      <p className="section-label">流量统计</p>
      <h1 className="list-title">数据公开</h1>
      <p className="hero-sub">统计自托管（GoatCounter）、无 cookie、不追踪个人。</p>
      <StatsDashboard
        articles={articles.map((a) => ({
          path: `/articles/${a.track}/${a.slug}`,
          title: a.title,
          track: a.track,
        }))}
      />
    </section>
  );
}
