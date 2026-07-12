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
