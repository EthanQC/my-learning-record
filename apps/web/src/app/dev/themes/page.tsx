import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const THEMES = ['duo', 'editorial', 'night'] as const;

/** 后续组件任务把新组件实例加进这里，一处添加、三主题同时预览 */
function PreviewSections() {
  return (
    <div className="space-y-6 p-6">
      <SiteHeader />
      {/* Task 11 追加：HeadlineCard / ArticleCard */}
      {/* Task 12 追加：RailTab */}
      {/* Task 15 追加：prose 样张（含代码块） */}
      {/* Task 16 追加：项目卡 */}
      <SiteFooter />
    </div>
  );
}

export default function ThemesPreview() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3">
      {THEMES.map((t) => (
        <section
          key={t}
          data-theme={t}
          className="min-h-screen border-r bg-bg text-ink"
          style={{ borderColor: 'rgb(var(--c-border))' }}
        >
          <p className="section-label p-4">{t}</p>
          <PreviewSections />
        </section>
      ))}
    </div>
  );
}
