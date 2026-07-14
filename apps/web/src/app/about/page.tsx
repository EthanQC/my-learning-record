import type { Metadata } from 'next';
import { SITE, buildAlternates } from '@/lib/site';

export const metadata: Metadata = {
  title: '关于',
  description: '关于 Devline 与它的作者',
  alternates: buildAlternates('/about'),
};

const STACK = ['Go', 'MySQL', 'Redis', 'Docker', 'Next.js', 'TypeScript', 'CI/CD'];

export default function AboutPage() {
  return (
    <section className="container-devline about-page">
      <p className="section-label">关于</p>
      <h1 className="list-title">写代码，也把技术讲明白</h1>
      <div className="about-body">
        <p>
          我是 {SITE.author}，后端方向工程师。平时的工作是拆系统、读源码、做架构取舍；
          写作是把这些过程整理成能复用的判断。
        </p>
        <h2 className="about-heading">双线</h2>
        <p>
          Devline 的「line」是两条内容线：<strong>深度线</strong>写给工程师，
          拆源码、讲架构、复盘工程决策；<strong>科普线</strong>写给所有人，
          把同一批技术讲成人话。两条线共用一个标准：写清楚，不糊弄。
        </p>
        <h2 className="about-heading">技术栈</h2>
        <ul className="about-stack">
          {STACK.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h2 className="about-heading">联系</h2>
        <ul className="about-contact">
          <li>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </li>
          <li>
            <a href={SITE.github} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a href={SITE.xiaohongshu} rel="me noopener" target="_blank">
              小红书
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
