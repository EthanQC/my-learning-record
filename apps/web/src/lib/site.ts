import type { Metadata } from 'next';

export const SITE = {
  name: 'Devline',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://qingverse.com',
  description:
    'Devline 双线技术写作：深度线拆源码与架构，写给工程师；科普线把技术讲给所有人。',
  author: 'Ethan',
  email: '13537821092@163.com',
  github: 'https://github.com/EthanQC',
  xiaohongshu: 'https://xhslink.com/m/8w1icZpuGaJ',
} as const;

export const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '项目' },
  { href: '/about', label: '关于' },
] as const;

/**
 * §6 metadata 基建：Next.js 的 metadata.alternates 按段浅合并——子页面声明
 * alternates.canonical 会整体覆盖父级 layout 的 alternates，连同 RSS 的
 * types['application/rss+xml'] 一起被抹掉。所有设置 canonical 的页面必须
 * 用这个 helper 补回 RSS 自动发现链接，保证「全站」而非仅首页可发现 feed（F3）。
 */
export function buildAlternates(canonical: string): Metadata['alternates'] {
  return {
    canonical,
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Devline' }],
    },
  };
}
