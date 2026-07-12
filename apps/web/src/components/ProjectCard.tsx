import type { Project } from '@/lib/projects';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <h3 className="project-card-name">{project.name}</h3>
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
