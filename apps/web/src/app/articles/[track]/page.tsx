import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles, TRACKS, TRACK_LABEL, type Track } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { TrackFilter } from '@/components/TrackFilter';

export const dynamicParams = false; // 未知 track 直接 404

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track }));
}

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  const label = TRACK_LABEL[track as Track];
  return {
    title: `${label}文章`,
    description: `Devline ${label}文章列表`,
    alternates: { canonical: `/articles/${track}` },
  };
}

export default async function TrackPage({ params }: Props) {
  const { track } = await params;
  const t = track as Track;
  const other: Track = t === 'deep' ? 'intro' : 'deep';
  const articles = (await getAllArticles()).filter((a) => a.track === t);
  return (
    <section className="container-devline list-page">
      <p className="section-label">{TRACK_LABEL[t]}</p>
      <h1 className="list-title">{TRACK_LABEL[t]}文章</h1>
      <TrackFilter current={`/articles/${t}`} />
      <div className="list-items">
        {articles.length === 0 ? (
          /* §5 空态：/articles/<track> 复用轨道空态文案，CTA 为链接（URL 承载，非切 tab） */
          <p className="empty-track">
            {TRACK_LABEL[t]}首篇打磨中 ·{' '}
            <Link href={`/articles/${other}`}>先沿{TRACK_LABEL[other]}逛逛 →</Link>
          </p>
        ) : (
          articles.map((a) => <ArticleCard key={a.slug} article={a} />)
        )}
      </div>
    </section>
  );
}
