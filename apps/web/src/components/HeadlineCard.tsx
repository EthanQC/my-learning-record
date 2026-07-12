import Link from 'next/link';
import type { Article } from '@/lib/content';
import { TRACK_LABEL } from '@/lib/content';
import { formatDate } from '@/lib/format';

export function HeadlineCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.track}/${article.slug}`}
      className="headline-card"
      data-track-card={article.track}
    >
      <p className="headline-card-marker">
        <span className="headline-card-dot" aria-hidden="true" />
        最新 · {TRACK_LABEL[article.track]}
      </p>
      <h2 className="headline-card-title">{article.title}</h2>
      <p className="headline-card-summary">{article.summary}</p>
      <span className="article-card-meta">
        {formatDate(article.date)} · {article.readingMinutes} 分钟
      </span>
    </Link>
  );
}
