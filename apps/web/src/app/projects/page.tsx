import type { Metadata } from 'next';
import { ProjectCard } from '@/components/ProjectCard';
import { PROJECTS } from '@/lib/projects';
import { buildAlternates } from '@/lib/site';

export const metadata: Metadata = {
  title: '项目',
  description: 'Devline 项目：问题 → 方案 → 结果的 case-study',
  alternates: buildAlternates('/projects'),
};

export default function ProjectsPage() {
  return (
    <section className="container-devline list-page">
      <p className="section-label">项目</p>
      <h1 className="list-title">项目</h1>
      <p className="hero-sub">每个项目按同一个格式复盘：问题 → 方案 → 结果。</p>
      <div className="project-grid" style={{ marginTop: '32px' }}>
        {PROJECTS.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
