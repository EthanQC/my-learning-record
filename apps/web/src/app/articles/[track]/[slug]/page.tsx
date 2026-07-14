import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticleMDX, TRACK_LABEL, type Track } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { Toc } from '@/components/Toc';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ track: a.track, slug: a.slug }));
}

type Props = { params: Promise<{ track: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track, slug } = await params;
  const article = await getArticleMDX(track, slug);
  if (!article) return {};
  const { frontmatter } = article;
  const iso = frontmatter.date.toISOString().slice(0, 10);
  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    alternates: { canonical: `/articles/${track}/${slug}` },
    openGraph: {
      type: 'article',
      title: frontmatter.title,
      description: frontmatter.summary,
      publishedTime: iso,
      modifiedTime: iso,
      tags: frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.summary,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { track, slug } = await params;
  const article = await getArticleMDX(track, slug);
  if (!article) notFound();
  const { content, frontmatter, headings, readingMinutes } = article;
  const iso = frontmatter.date.toISOString().slice(0, 10);
  const pageUrl = `${SITE.url}/articles/${track}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.summary,
    datePublished: iso,
    dateModified: iso,
    author: { '@type': 'Person', name: SITE.author, url: SITE.url },
    image: `${SITE.url}/opengraph-image.png`,
    inLanguage: 'zh-CN',
    mainEntityOfPage: pageUrl,
  };

  return (
    <article className="container-devline article-page">
      <header className="article-header">
        <p className="section-label">{TRACK_LABEL[track as Track]}</p>
        <h1 className="article-title">{frontmatter.title}</h1>
        <p className="article-card-meta">
          {formatDate(iso)} · {readingMinutes} 分钟
          {frontmatter.tags.length > 0 && <> · {frontmatter.tags.join(' / ')}</>}
        </p>
      </header>
      {headings.length > 1 && <Toc headings={headings} />}
      <div className="prose-devline">{content}</div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
