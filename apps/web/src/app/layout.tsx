import type { Metadata } from 'next';
import '../styles/globals.css';
import { notoSerifSC } from '@/lib/fonts';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

// §6 metadata 基建：兜底硬编码，NEXT_PUBLIC_SITE_URL 仅用于覆盖
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qingverse.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Devline - 一条线给工程师，一条线给所有人',
    template: '%s | Devline',
  },
  description:
    'Devline 双线技术写作：深度线拆源码与架构，写给工程师；科普线把技术讲给所有人。',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Devline' }],
    },
  },
  openGraph: {
    siteName: 'Devline',
    locale: 'zh_CN',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// §4 防闪烁脚本（逐字来自规格，theme 与 track 共用）
const THEME_INIT = `(function(){try{var t=localStorage.getItem('devline-theme');if(t!=='duo'&&t!=='editorial'&&t!=='night'){t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'duo'}document.documentElement.dataset.theme=t;var k=localStorage.getItem('devline-track');document.documentElement.dataset.track=k==='intro'?'intro':'deep'}catch(e){document.documentElement.dataset.theme='duo';document.documentElement.dataset.track='deep'}})()`;

// §4：meta theme-color 三主题各一值——值从 tokens.css 的 --theme-color 读取（单一来源）
const THEME_COLOR_SYNC = `(function(){var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m)}m.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim())})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={notoSerifSC.variable}>
      <body className="flex min-h-screen flex-col">
        {/* §4：body 第一个子元素，同步脚本阻塞后续渲染，效果等同 head 内联 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SYNC }} />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/* §5 /stats 采集：GoatCounter count.js，异步无 cookie；本地开发不计数 */}
        {process.env.NODE_ENV === 'production' && (
          <script
            data-goatcounter="https://stats.qingverse.com/count"
            async
            src="https://stats.qingverse.com/count.js"
          />
        )}
      </body>
    </html>
  );
}
