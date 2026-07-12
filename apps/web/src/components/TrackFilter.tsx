import Link from 'next/link';

const FILTERS = [
  { href: '/articles', label: '全部' },
  { href: '/articles/deep', label: '深度线' },
  { href: '/articles/intro', label: '科普线' },
] as const;

/** §5：筛选用 URL 承载而非客户端状态，三个列表页都是 SSG、可分享、后退正常 */
export function TrackFilter({ current }: { current: string }) {
  return (
    <nav className="track-filter" aria-label="轨道筛选">
      {FILTERS.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          className="track-filter-link"
          aria-current={f.href === current ? 'page' : undefined}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
}
