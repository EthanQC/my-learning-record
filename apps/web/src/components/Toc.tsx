import type { HeadingItem } from '@/lib/content';

export function Toc({ headings }: { headings: HeadingItem[] }) {
  return (
    <nav className="toc" aria-label="目录">
      <p className="section-label">目录</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id} data-depth={h.depth}>
            <a href={`#${h.id}`}>{h.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
