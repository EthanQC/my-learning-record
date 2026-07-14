import Link from 'next/link';
import type { Article } from '@/lib/content';
import { formatDate } from '@/lib/format';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.track}/${article.slug}`}
      className="article-card"
      data-track-card={article.track}
    >
      <div className="article-card-head">
        <h3 className="article-card-title">{article.title}</h3>
        <span className="article-card-meta">
          {formatDate(article.date)} · {article.readingMinutes} 分钟
        </span>
      </div>
      <p className="article-card-summary">{article.summary}</p>
      {article.tags.length > 0 && (
        <div className="article-card-tags">
          {article.tags.map((t) => (
            <span key={t} className="article-card-tag">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
