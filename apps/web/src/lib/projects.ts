export type Project = {
  slug: string;
  name: string;
  problem: string;
  approach: string;
  outcome: string;
  link?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'devline',
    name: '本站改造：Devline',
    problem: '旧站是动态渲染的个人博客，依赖一整套 Go API + MySQL，内容与品牌都不再匹配「技术 IP 平台」的目标。',
    approach: '重构为纯静态 Next.js：MDX 内容管线 + 三主题 design token 体系 + rail-tab 双轨交互，架构从 4 容器减到 3。',
    outcome: '零后端依赖的内容站，git push 即发布；三主题共用一套 DOM 即时切换，全站 CSS gzip ≤ 50KB。',
    link: 'https://github.com/EthanQC/my-learning-record',
  },
  {
    slug: 'systemwright',
    name: 'SystemWright',
    problem: '重复性工作流每次都要向 AI Agent 从头解释背景与规则，无法沉淀为可复用的工作系统。',
    approach: '做成跨平台 Agent Skill：把 Prompt / Context / Harness / Loop 四要素固化为可安装的技能包，内置人工审批闸门与小规模试跑。',
    outcome: '一条指令把模糊诉求产品化为可复用的 AI 工作系统，已接入 Claude Code 与 Codex 双平台。',
    link: 'https://github.com/EthanQC/SystemWright',
  },
  {
    slug: 'memory-system',
    name: 'Memory System',
    problem: 'AI 编码会话之间上下文全部丢失，每次开工都要重复同步项目背景与历史决策。',
    approach: '为编码 Agent 构建跨会话记忆层：主题化记忆文件 + 索引 + 会话钩子自动读写与巩固。',
    outcome: '新会话零解释接续先前工作，长期项目的决策与教训沉淀为可检索资产。',
  },
];
