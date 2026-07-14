import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';
import { SITE } from '@/lib/site';

const STATIC_PATHS = ['/', '/articles', '/articles/deep', '/articles/intro', '/projects', '/about', '/stats'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE.url}${p === '/' ? '' : p}` || SITE.url,
    lastModified: new Date(),
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/articles/${a.track}/${a.slug}`,
    lastModified: new Date(a.date),
  }));

  return [...staticPages, ...articlePages];
}
