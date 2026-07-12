import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ArticleCard } from '@/components/ArticleCard';
import { HeadlineCard } from '@/components/HeadlineCard';
import { RailTab } from '@/components/RailTab';
import { getAllArticles } from '@/lib/content';

const THEMES = ['duo', 'editorial', 'night'] as const;

async function PreviewSections() {
  const articles = await getAllArticles();
  return (
    <div className="space-y-6 p-6">
      <SiteHeader />
      <HeadlineCard article={articles[0]} />
      {articles.map((a) => (
        <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
      ))}
      <RailTab />
      {/* Task 15 追加：prose 样张（含代码块） */}
      {/* Task 16 追加：项目卡 */}
      <SiteFooter />
    </div>
  );
}

export default function ThemesPreview() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3">
      {THEMES.map((t) => (
        <section
          key={t}
          data-theme={t}
          className="min-h-screen border-r bg-bg text-ink"
          style={{ borderColor: 'rgb(var(--c-border))' }}
        >
          <p className="section-label p-4">{t}</p>
          <PreviewSections />
        </section>
      ))}
    </div>
  );
}
