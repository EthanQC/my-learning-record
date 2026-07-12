import Link from 'next/link';
import { getAllArticles, TRACKS, TRACK_LABEL } from '@/lib/content';
import { HeadlineCard } from '@/components/HeadlineCard';
import { ArticleCard } from '@/components/ArticleCard';
import { RailTab, EmptyTrackNotice } from '@/components/RailTab';
import { ProjectCard } from '@/components/ProjectCard';
import { PROJECTS } from '@/lib/projects';
import { SITE } from '@/lib/site';

export default async function HomePage() {
  const articles = await getAllArticles();
  const headline = articles[0]; // §5：最新一篇（不分轨道）

  // §5.1 条目 3：首页输出 WebSite + Person JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'Person',
        name: SITE.author,
        url: SITE.url,
        sameAs: [SITE.github, SITE.xiaohongshu],
      },
    ],
  };

  return (
    <div>
      {/* §5 首页 2：Hero 双线宣言 */}
      <section className="hero container-devline">
        <p className="section-label">Devline · 双线</p>
        <h1 className="hero-title">
          一条线给工程师，
          <br />
          一条线给
          <em className="hero-em" data-text="所有人">
            所有人
          </em>
          。
        </h1>
        <p className="hero-sub">
          深度线拆源码与架构，写给工程师；科普线把同一批技术讲成人话，写给所有人。
        </p>
      </section>

      {/* §5 首页 3：头条通栏（最新一篇，带轨道标记） */}
      {headline && (
        <section className="container-devline home-section">
          <p className="section-label">头条</p>
          <HeadlineCard article={headline} />
        </section>
      )}

      {/* §5 首页 4：rail-tab */}
      <RailTab />

      {/* §5 首页 5：当前轨道文章列表 + 沿线看全部。
          去重规则（§5）：头条属于某轨道时，该轨道面板排除头条；另一轨道面板不受影响 */}
      <section className="container-devline home-section home-lists">
        {TRACKS.map((track) => {
          const list = articles.filter(
            (a) =>
              a.track === track &&
              !(headline && headline.track === track && a.slug === headline.slug)
          );
          return (
            <div
              key={track}
              id={`track-panel-${track}`}
              role="tabpanel"
              aria-labelledby={`track-tab-${track}`}
              data-panel={track}
              className="home-panel"
            >
              {list.length === 0 ? (
                <EmptyTrackNotice track={track} />
              ) : (
                <>
                  {list.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                  <Link className="track-more" href={`/articles/${track}`}>
                    沿{TRACK_LABEL[track]}看全部 →
                  </Link>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* §5 首页 6：项目区 */}
      <section className="container-devline home-section">
        <p className="section-label">项目</p>
        <div className="project-grid">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
