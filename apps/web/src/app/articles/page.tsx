import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { TrackFilter } from '@/components/TrackFilter';
import { buildAlternates } from '@/lib/site';

export const metadata: Metadata = {
  title: '文章',
  description: 'Devline 全部文章：深度线与科普线',
  alternates: buildAlternates('/articles'),
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return (
    <section className="container-devline list-page">
      <p className="section-label">文章</p>
      <h1 className="list-title">全部文章</h1>
      <TrackFilter current="/articles" />
      <div className="list-items">
        {articles.length === 0 ? (
          /* 全部页空态：此时两轨必然同空，CTA 不指向轨道子页（同为空态会打转），改链项目页 */
          <p className="empty-track">
            首批文章打磨中 · <Link href="/projects">先看看正在做的项目 →</Link>
          </p>
        ) : (
          articles.map((a) => (
            <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
          ))
        )}
      </div>
    </section>
  );
}
