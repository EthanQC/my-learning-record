import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { TrackFilter } from '@/components/TrackFilter';

export const metadata: Metadata = {
  title: '文章',
  description: 'Devline 全部文章：深度线与科普线',
  alternates: { canonical: '/articles' },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return (
    <section className="container-devline list-page">
      <p className="section-label">文章</p>
      <h1 className="list-title">全部文章</h1>
      <TrackFilter current="/articles" />
      <div className="list-items">
        {articles.map((a) => (
          <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
        ))}
      </div>
    </section>
  );
}
