import { SITE } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-devline site-footer-inner">
        <p className="site-footer-copy">© Devline</p>
        <nav className="site-footer-links" aria-label="站外链接">
          <a href="/feed.xml">RSS</a>
          <a href={SITE.github} rel="me noopener" target="_blank">
            GitHub
          </a>
          <a href={SITE.xiaohongshu} rel="me noopener" target="_blank">
            小红书
          </a>
          <a href="/stats">统计</a>
        </nav>
        <p className="site-footer-privacy">统计自托管、无 cookie、不追踪个人</p>
        <p className="site-footer-beian">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            粤ICP备2025487305号
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002008906"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/beian-gongan.png" alt="" width={14} height={14} loading="lazy" />
            粤公网安备44030002008906号
          </a>
        </p>
      </div>
    </footer>
  );
}
