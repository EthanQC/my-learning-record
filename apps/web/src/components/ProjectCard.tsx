import type { Project } from '@/lib/projects';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      {/* h2：卡片是页面 h1 下的顶层内容单元，避免 H1→H3 跳级（axe heading-order，F5）;
          class 未变，视觉尺寸沿用既有 .project-card-name 样式 */}
      <h2 className="project-card-name">{project.name}</h2>
      <dl className="project-card-body">
        <div>
          <dt>问题</dt>
          <dd>{project.problem}</dd>
        </div>
        <div>
          <dt>方案</dt>
          <dd>{project.approach}</dd>
        </div>
        <div>
          <dt>结果</dt>
          <dd>{project.outcome}</dd>
        </div>
      </dl>
      {project.link && (
        <a className="project-card-link" href={project.link} target="_blank" rel="noopener">
          查看 →
        </a>
      )}
    </article>
  );
}
