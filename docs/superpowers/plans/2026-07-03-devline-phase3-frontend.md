# Devline 阶段三：新前台重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `redesign/devline` 分支上把 `apps/web` 重构为 Devline 三主题纯静态站：MDX 内容管线、design token 体系、rail-tab 签名交互、六类页面与 SEO 资产，并删除全部旧前台代码。

**Architecture:** 内容层用 `content/articles/<track>/<slug>.mdx` + zod 校验 + `next-mdx-remote/rsc` 构建期编译；表现层用 `[data-theme]` 作用域 CSS token（RGB 通道值）驱动三主题、`html[data-track]` 属性驱动双轨切换，防闪烁由 `<body>` 首子内联脚本承载；全站 SSG，零客户端数据依赖（仅 `/stats` 客户端取数并可降级）。

**Tech Stack:** Next.js 16.2.x（App Router、SSG）、React 19、Tailwind CSS 3.4、zod、next-mdx-remote/rsc、rehype-pretty-code + shiki、next/font/google（Noto Serif SC 切片自托管）、tsx（node 测试驱动）、sharp + png-to-ico（图标/OG 生成）。

**规格来源：** `docs/superpowers/specs/2026-07-03-devline-redesign-design.md`（v3）。《设计系统规格》D1–D7、§5、§6、§7 是唯一事实来源；本计划所有色值/尺寸/机制均标注节号，AA 修正值以 D1 表为准（不回抄 mockup 原值）。

## Global Constraints

以下硬约束逐字（或按规格数值）来自规格，每个任务默认遵守：

- 「**同一套 DOM 骨架**，主题只经 `data-theme` + design token（CSS 自定义属性）+ 少量主题作用域装饰 CSS 切换；任何主题不得改变页面结构、不得增删 DOM 节点」（§4）
- 「所有颜色经 CSS 自定义属性下发，定义在 `[data-theme]` 选择器上（`:root` 放 duo 值兜底）……**组件层禁止出现 hex**」（D1）
- 「CSS 变量存 **RGB 通道值**（否则 Tailwind 透明度修饰符 `bg-accent/50` 静默失效）」（§6）
- 「`--text-muted` 仅限纯装饰……**禁作信息性文字**（日期/时长/标签一律 `--text-3`）」（D1）
- 「任何组件……引用轨道色一律走 `--track-deep` / `--track-intro`，不得写死墨/粉 hex」（D1）
- 「粉-主 `--accent`……**B 主题下 <19px 文字** 禁止」（D2）；三主题所有文字组合过 WCAG AA（正文 4.5:1、大字与 UI 组件 3:1）（D2/D7）
- 「衬线只用于标题层（h1–h3、品牌字、编号），正文全主题一律 sans」；「衬线 font-family 只写在 `[data-theme='editorial']` / `[data-theme='night']` 作用域规则里……**默认主题双线 B 首屏 0 个字体请求**」（D3）
- 「Noto Serif SC 自托管：必须走 next/font/google 的 unicode-range 切片管线，禁止整包」；配置 `Noto_Serif_SC({ weight: ['700','900'], display: 'swap', preload: false, adjustFontFallback: false, fallback: ['Songti SC','SimSun'] })`（D3）
- 「防闪烁脚本：作为 `<body>` 第一个子元素内联……`<html>` 加 `suppressHydrationWarning`」，脚本逐字取自 §4；「**不用 next-themes（从依赖删除）**」（§4）
- 「每主题 token 块内声明 `color-scheme`（夜航 `color-scheme: dark`）；`<meta name="theme-color">` 三主题各一值（#FDFBFC / #FAF6F3 / #171219），切换时 JS 同步更新」（§4）
- 「token 定义在 `[data-theme]` 选择器而非 `:root[data-theme]`，否则嵌套容器不生效」（§4 /dev/themes 前提）
- 「全部动画纯 CSS 实现，不引入 framer-motion」；「`prefers-reduced-motion: reduce` 时——rail-tab 列表交换退化为 120ms 纯 opacity，主题切换零过渡，汉堡图标无动画」（D6）
- 「**禁用 100vw 负 margin 破格技巧**（桌面滚动条宽度会造成横向溢出）」；「两条横线本身不可点、不响应事件（只有骑线标签可点）」（§5 rail-tab）
- 「触控目标 ≥ 44px，实现规约：视觉尺寸维持 mockup 基准不变，命中区用透明扩展达标」（§5 响应式）
- 「**单向传递**：首页 rail-tab 的 localStorage 只作用于首页，/articles 上的切换不写回首页状态」（§5）——本计划中 /articles 轨道筛选完全由 URL 承载，天然满足
- 「移除 rehype-raw……富内容直接写 JSX」；「不用 contentlayer」（§6）
- 「`metadataBase` 兜底改为硬编码 `https://qingverse.com`（`NEXT_PUBLIC_SITE_URL` 仅用于覆盖），sitemap.ts / robots.ts 同步去掉 `localhost:3000` fallback」（§6）
- 「三主题编进同一份 CSS（不按主题拆文件懒加载）；全站 CSS gzip ≤ 50KB……CI build 门禁附带 size check」（§6）
- 「全站页面不出现「情长」二字（`grep` 构建产物断言）」（§8/§2）
- 「筛选用 URL 承载而非客户端状态……三个列表页都是 SSG」（§5）
- 「禁止做成「点击图标循环切换」」（§5 主题切换器）
- 分支策略：「全程在特性分支（如 redesign/devline）进行」（§7 步骤 4）；本阶段**不合入 main、不部署**（切流属阶段四）
- 每个新组件合入前附 `/dev/themes` 三主题并排截图（§4/D7）

## 跨阶段固定契约（不得改名）

- 分支 `redesign/devline`；localStorage key `devline-theme` / `devline-track`
- `html[data-theme]` ∈ `duo|editorial|night`；`html[data-track]` ∈ `deep|intro`
- `apps/web/src/lib/content.ts`：`export type Article = { slug: string; track: 'deep'|'intro'; title: string; date: string; tags: string[]; summary: string; draft: boolean; readingMinutes: number }`；`export async function getAllArticles(): Promise<Article[]>`（已按 date 降序、过滤 draft）；`export async function getArticleMDX(track: string, slug: string)`（返回 compileMDX 结果与 frontmatter）
- `apps/web/src/lib/content-schema.ts` 导出 `frontmatterSchema`（zod）
- token CSS：`apps/web/src/styles/tokens.css`
- 组件：`apps/web/src/components/{ThemeSwitcher,RailTab,ArticleCard,HeadlineCard,SiteHeader,SiteFooter,MobileMenu}.tsx`
- 预览页：`apps/web/src/app/dev/themes/page.tsx`
- GoatCounter：子域 `stats.qingverse.com`（阶段四部署，本阶段前端按此地址取数与注入 count.js）
- 内容目录：`content/articles/<track>/<slug>.mdx`，图片 `content/articles/<track>/<slug>.assets/`

**执行约定**：所有命令默认在仓库根 `/Users/abble/my-learning-record` 执行；`npm install` 一律用 `-w apps/web` 工作区语法；测试用 `npx tsx --test`（tsx 在 Task 1 安装）。

---

### Task 1: 分支与依赖就位

**Files:**
- Modify: `apps/web/package.json:9-45`（dependencies/devDependencies，由 npm 命令改写）
- Modify: `package-lock.json`（由 npm 自动更新）

**Interfaces:**
- Consumes: 现有 main 分支（阶段一/二已完成：本地 commit 已推送、murmurs 历史已抹除）
- Produces: 分支 `redesign/devline`；依赖 `zod` / `next-mdx-remote` / `rehype-pretty-code` / `shiki` / `tsx` / `sharp` / `png-to-ico`；Next 16.2.x——供全部后续任务使用

- [ ] **Step 1: 确认起点干净并创建特性分支**

```bash
cd /Users/abble/my-learning-record
git status --porcelain
git checkout -b redesign/devline
git branch --show-current
```

期望输出：`git status` 无未提交改动（如有先让用户处理）；最后一行输出 `redesign/devline`。

- [ ] **Step 2: 确认 Next 已是 16.2.x（阶段二 Task 5 已升级到 16.2.10）**

```bash
npm ls next | head -3
```

期望输出：`next@16.2.x`（x ≥ 0，阶段二产出）。若显示仍为 16.0.7（阶段二未执行或被回退），先执行 `npm install -w apps/web next@^16.2.0 eslint-config-next@^16.2.0` 补齐后再继续。

- [ ] **Step 3: 安装内容管线与工具依赖**

```bash
npm install -w apps/web zod@^3.25.0 next-mdx-remote@^5.0.0 rehype-pretty-code@^0.14.0 shiki@^1.29.0
npm install -w apps/web -D tsx@^4.19.0 sharp@^0.33.0 png-to-ico@^2.1.0
```

期望输出：npm 安装成功、无 peer dependency 冲突报错（warning 可接受）。

- [ ] **Step 4: 验证现有构建未被升级破坏**

```bash
npm --prefix apps/web run build
```

期望输出：`next build` 以退出码 0 结束（旧页面 API fetch 失败会走 catch 兜底，不影响构建）。若 16.2 引入 breaking change 导致失败，修复点记录在案后再继续。

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json package-lock.json
git commit -m "chore(web): next 16.2.x + 内容管线依赖（zod/next-mdx-remote/rehype-pretty-code/shiki）"
```

**验收标准**：`git branch --show-current` = `redesign/devline`；`node -e "require('zod');require('shiki')"`（在 repo 根执行，利用 workspace 提升）不报错；`npm --prefix apps/web run build` 退出码 0。

---

### Task 2: frontmatter zod schema 与夹具文章

**Files:**
- Create: `apps/web/src/lib/content-schema.ts`
- Create: `content/articles/deep/hello-deep.mdx`
- Create: `content/articles/deep/hello-deep.assets/diagram.png`
- Create: `content/articles/intro/hello-intro.mdx`
- Create: `content/articles/intro/hello-intro.assets/cover.png`
- Create: `content/articles/deep/context-engineering.mdx`（第二篇 deep，供首页去重规则观测）
- Create: `content/articles/deep/draft-sample.mdx`（draft 夹具，验证过滤）
- Test: `apps/web/tests/content-schema.test.ts`

**Interfaces:**
- Consumes: `zod`（Task 1）
- Produces: `export const frontmatterSchema: z.ZodType`（默认导出规则见 §3）；`export type Frontmatter = z.infer<typeof frontmatterSchema>`；四篇夹具文章（deep×2 + intro×1 + draft×1）供 Task 3–5、11–18 作测试数据

- [ ] **Step 1: 写失败测试**

创建 `apps/web/tests/content-schema.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontmatterSchema } from '../src/lib/content-schema';

test('必填字段齐全时通过，且补默认值', () => {
  const fm = frontmatterSchema.parse({
    title: 'x', date: '2026-07-01', track: 'deep', summary: 's',
  });
  assert.equal(fm.track, 'deep');
  assert.deepEqual(fm.tags, []);        // §3: tags 默认 []
  assert.equal(fm.draft, false);        // §3: draft 默认 false
  assert.ok(fm.date instanceof Date);
});

test('gray-matter 解析出的 Date 对象也能通过', () => {
  const fm = frontmatterSchema.parse({
    title: 'x', date: new Date('2026-07-01'), track: 'intro', summary: 's',
  });
  assert.equal(fm.date.getUTCFullYear(), 2026);
});

test('track 非法时抛错', () => {
  assert.throws(() =>
    frontmatterSchema.parse({ title: 'x', date: '2026-07-01', track: 'blog', summary: 's' })
  );
});

test('缺 title / date 不可解析时抛错', () => {
  assert.throws(() => frontmatterSchema.parse({ date: '2026-07-01', track: 'deep', summary: 's' }));
  assert.throws(() => frontmatterSchema.parse({ title: 'x', date: '不是日期', track: 'deep', summary: 's' }));
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx tsx --test apps/web/tests/content-schema.test.ts
```

期望输出：FAIL，报 `Cannot find module '../src/lib/content-schema'`。

- [ ] **Step 3: 实现 schema**

创建 `apps/web/src/lib/content-schema.ts`（规则逐条对应 §3：必填 title/date/track/summary，track ∈ deep|intro，date 可解析；tags 默认 `[]`，draft 默认 `false`）：

```ts
import { z } from 'zod';

/** frontmatter 校验（规格 §3）。校验失败直接 throw，`next build` 即失败。 */
export const frontmatterSchema = z.object({
  title: z.string().min(1, 'title 必填'),
  date: z.coerce.date({ errorMap: () => ({ message: 'date 必须可解析为日期' }) }),
  track: z.enum(['deep', 'intro'], { errorMap: () => ({ message: 'track 必须 ∈ deep|intro' }) }),
  summary: z.string().min(1, 'summary 必填'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx tsx --test apps/web/tests/content-schema.test.ts
```

期望输出：`# pass 4`，退出码 0。

- [ ] **Step 5: 创建夹具文章（含图片资产）**

创建 `content/articles/deep/hello-deep.mdx`：

````mdx
---
title: 从零读 Go net/http：一次请求的完整生命周期
date: 2026-07-01
track: deep
tags: [Go, 源码]
summary: 以一次 GET 请求为线索，从 Listener.Accept 到 Handler 返回，走读 net/http 的核心调用链。
---

## 从 Accept 开始

`http.ListenAndServe` 背后是一个朴素的循环：`Accept` 一个连接，起一个 goroutine。

```go
for {
    rw, err := l.Accept()
    if err != nil {
        return err
    }
    c := srv.newConn(rw)
    go c.serve(connCtx)
}
```

## 请求解析

调用链如下图：

![net/http 调用链](./diagram.png)

## 小结

一条连接一个 goroutine，是 Go 网络编程最直白的心智模型。
````

创建 `content/articles/intro/hello-intro.mdx`：

```mdx
---
title: 网站是怎么知道你在暗色模式的？
date: 2026-06-28
track: intro
tags: [浏览器]
summary: 你没有告诉任何网站你开了暗色模式，但它们就是知道——这背后是一个叫 prefers-color-scheme 的浏览器机制。
---

## 一个小实验

把手机切到暗色模式，再打开一些网站，它们会自动变黑。

![暗色模式示意](./cover.png)

## 背后的机制

操作系统把「用户偏好暗色」作为一个系统级设置暴露给浏览器，浏览器再通过
CSS 媒体查询 `prefers-color-scheme` 告诉每一个网页。网页只是「问了一句」，
并没有拿到你的任何隐私。
```

创建 `content/articles/deep/context-engineering.mdx`（第二篇 deep 夹具，无图片资产——首页头条去重规则需要「同轨道第二新」才可观测，Task 13 依赖）：

```mdx
---
title: 上下文工程：给 LLM 喂对信息比喂多信息重要
date: 2026-06-20
track: deep
tags: [LLM, 工程实践]
summary: 上下文窗口是稀缺资源。这篇从检索、压缩、结构化三个层面拆解怎么把对的信息在对的时机放进上下文。
---

## 为什么不是越多越好

上下文窗口变大不等于免费：注意力被稀释、成本线性上涨、无关信息还会诱导模型跑偏。

## 三个层面

1. 检索：只取当前任务相关的片段；
2. 压缩：历史对话摘要化；
3. 结构化：让关键约束出现在提示的头尾。

## 小结

上下文工程的本质是信息的取舍，不是堆料。
```

创建 `content/articles/deep/draft-sample.mdx`：

```mdx
---
title: 草稿：尚未完成的文章
date: 2026-07-02
track: deep
summary: 这是一篇 draft 夹具，用于验证 draft: true 不进入构建。
draft: true
---

## 未完成

此文不应出现在任何列表、RSS 与 sitemap 中。
```

生成两张真实 PNG（1×1 会被误判占位，生成 64×64 纯色图）：

```bash
mkdir -p content/articles/deep/hello-deep.assets content/articles/intro/hello-intro.assets
node -e "
const sharp = require('sharp');
sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 236, g: 90, b: 135 } } })
  .png().toFile('content/articles/deep/hello-deep.assets/diagram.png');
sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 23, g: 20, b: 26 } } })
  .png().toFile('content/articles/intro/hello-intro.assets/cover.png');
"
ls -la content/articles/deep/hello-deep.assets content/articles/intro/hello-intro.assets
```

期望输出：两个目录各含一个 PNG 文件（几百字节）。

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/content-schema.ts apps/web/tests/content-schema.test.ts content/articles
git commit -m "feat(content): frontmatter zod schema + 双轨夹具文章"
```

**验收标准**：`npx tsx --test apps/web/tests/content-schema.test.ts` 全绿；`ls content/articles/deep content/articles/intro` 显示 deep 3 篇（含 draft）/ intro 1 篇 mdx 与两个 .assets 目录。

---

### Task 3: 内容加载器 getAllArticles

**Files:**
- Create: `apps/web/src/lib/content.ts`
- Test: `apps/web/tests/content.test.ts`

**Interfaces:**
- Consumes: `frontmatterSchema`（Task 2）、`gray-matter`（既有依赖）
- Produces: `export type Article = { slug: string; track: 'deep'|'intro'; title: string; date: string; tags: string[]; summary: string; draft: boolean; readingMinutes: number }`；`export async function getAllArticles(): Promise<Article[]>`（date 降序、已过滤 draft）；内部 `contentRoot(): string` 供 Task 4 复用

- [ ] **Step 1: 写失败测试**

创建 `apps/web/tests/content.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllArticles } from '../src/lib/content';

test('加载夹具文章：过滤 draft、date 降序、字段完整', async () => {
  const articles = await getAllArticles();
  // draft-sample.mdx (draft: true) 不得出现
  assert.ok(!articles.some((a) => a.slug === 'draft-sample'));
  // 两篇夹具都在
  const deep = articles.find((a) => a.slug === 'hello-deep');
  const intro = articles.find((a) => a.slug === 'hello-intro');
  assert.ok(deep && intro);
  assert.ok(articles.some((a) => a.slug === 'context-engineering')); // 第二篇 deep 夹具
  assert.equal(deep!.track, 'deep');
  assert.equal(deep!.date, '2026-07-01');
  assert.deepEqual(deep!.tags, ['Go', '源码']);
  assert.ok(deep!.summary.length > 0);
  assert.equal(deep!.draft, false);
  assert.ok(deep!.readingMinutes >= 1);
  // 降序：2026-07-01 (deep) 在 2026-06-28 (intro) 之前
  assert.ok(articles.indexOf(deep!) < articles.indexOf(intro!));
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx tsx --test apps/web/tests/content.test.ts
```

期望输出：FAIL，`Cannot find module '../src/lib/content'`。

- [ ] **Step 3: 实现加载器**

创建 `apps/web/src/lib/content.ts`：

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { frontmatterSchema } from './content-schema';

export type Article = {
  slug: string;
  track: 'deep' | 'intro';
  title: string;
  date: string; // ISO yyyy-mm-dd
  tags: string[];
  summary: string;
  draft: boolean;
  readingMinutes: number;
};

export const TRACKS = ['deep', 'intro'] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABEL: Record<Track, string> = {
  deep: '深度线',
  intro: '科普线',
};

/** 从 cwd 向上找 content/articles（next build 时 cwd=apps/web，测试时 cwd=repo 根） */
export function contentRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'content', 'articles');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error('content/articles 目录未找到');
}

/** 中文 350 字/分 + 英文 200 词/分，向上取整，至少 1 分钟 */
function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil(cjk / 350 + words / 200));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAllArticles(): Promise<Article[]> {
  const root = contentRoot();
  const articles: Article[] = [];
  for (const track of TRACKS) {
    const dir = path.join(root, track);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mdx')) continue;
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      let fm;
      try {
        fm = frontmatterSchema.parse(matter(raw).data);
      } catch (e) {
        // §3：校验失败直接 throw，next build 即失败
        throw new Error(`frontmatter 校验失败: content/articles/${track}/${file}\n${e}`);
      }
      if (fm.track !== track) {
        throw new Error(`track 与目录不一致: content/articles/${track}/${file} 声明 track=${fm.track}`);
      }
      if (fm.draft) continue; // §3：draft: true 不构建
      articles.push({
        slug: file.replace(/\.mdx$/, ''),
        track,
        title: fm.title,
        date: isoDate(fm.date),
        tags: fm.tags,
        summary: fm.summary,
        draft: fm.draft,
        readingMinutes: readingMinutes(matter(raw).content),
      });
    }
  }
  return articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx tsx --test apps/web/tests/content-schema.test.ts apps/web/tests/content.test.ts
```

期望输出：`# pass 5`，退出码 0。

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/content.ts apps/web/tests/content.test.ts
git commit -m "feat(content): getAllArticles 加载器（zod 校验/draft 过滤/降序/阅读时长）"
```

**验收标准**：Step 4 命令全绿；`node -e ""`（无额外断言）——核心断言已在测试中。

---

### Task 4: MDX 编译管线 getArticleMDX（remark 插件迁移 + rehype-pretty-code 多主题）

**Files:**
- Create: `apps/web/src/lib/mdx-plugins.ts`
- Modify: `apps/web/src/lib/content.ts:1-15`（新增 import）与文件末尾（新增 getArticleMDX）
- Test: `apps/web/tests/mdx.test.ts`

**Interfaces:**
- Consumes: `contentRoot` / `frontmatterSchema`（Task 2/3）、`next-mdx-remote/rsc` 的 `compileMDX`、`rehype-pretty-code`
- Produces: `export type HeadingItem = { id: string; title: string; depth: number }`；`export async function getArticleMDX(track: string, slug: string): Promise<{ content: React.ReactElement; frontmatter: Frontmatter; headings: HeadingItem[]; readingMinutes: number } | null>`；`remarkHeadingIds(headings)` / `remarkArticleImages(track, slug)` 插件工厂

- [ ] **Step 1: 迁移两个自定义 remark 插件**

创建 `apps/web/src/lib/mdx-plugins.ts`（标题 id/TOC 收集逻辑原样迁移自现 `apps/web/src/lib/markdown.ts` 的「收集标题 & 添加 id」remark 插件与 `slugify`/`extractText`——阶段二对该文件做过类型化重写，行号以实际为准、逻辑不变；图片插件按 §6 图片链路重写——改写为 `/article-assets/` 绝对路径并做存在性校验）：

```ts
import fs from 'node:fs';
import path from 'node:path';

export interface HeadingItem {
  id: string;
  title: string;
  depth: number;
}

function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9一-龥\s-]/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}

/** 收集 h1-h4 标题、为其加 id（迁移自旧 markdown.ts） */
export function remarkHeadingIds(headings: HeadingItem[]) {
  return () => (tree: any) => {
    const slugCount = new Map<string, number>();
    const walk = (node: any) => {
      if (node.type === 'heading' && node.depth >= 1 && node.depth <= 4) {
        const text = extractText(node);
        const base = slugify(text);
        const n = slugCount.get(base) || 0;
        const id = n === 0 ? base : `${base}-${n}`;
        slugCount.set(base, n + 1);
        headings.push({ id, title: text, depth: node.depth });
        node.data = node.data || {};
        node.data.hProperties = { ...(node.data.hProperties || {}), id };
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * 图片链路（§6）：MDX 内相对引用 → /article-assets/<track>/<slug>/<name> 绝对路径；
 * 构建时校验源文件存在于 content/articles/<track>/<slug>.assets/，缺失 fail build。
 */
export function remarkArticleImages(track: string, slug: string, assetsDir: string) {
  return () => (tree: any) => {
    const walk = (node: any) => {
      if (node.type === 'image' && node.url) {
        const url: string = node.url;
        const isExternal = url.startsWith('http://') || url.startsWith('https://');
        const isAbsolute = url.startsWith('/');
        if (!isExternal && !isAbsolute) {
          const name = url.replace(/^\.\//, '').replace(new RegExp(`^${slug}\\.assets/`), '');
          const source = path.join(assetsDir, name);
          if (!fs.existsSync(source)) {
            throw new Error(`图片缺失: ${source}（被 content/articles/${track}/${slug}.mdx 引用）`);
          }
          node.url = `/article-assets/${track}/${slug}/${name}`;
        }
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}
```

- [ ] **Step 2: 写失败测试**

创建 `apps/web/tests/mdx.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { getArticleMDX } from '../src/lib/content';

test('编译 deep 夹具：标题 id、TOC、图片路径改写、shiki 多主题变量', async () => {
  const result = await getArticleMDX('deep', 'hello-deep');
  assert.ok(result);
  const { content, frontmatter, headings, readingMinutes } = result!;
  assert.equal(frontmatter.title.includes('net/http'), true);
  assert.ok(readingMinutes >= 1);
  // TOC 收集（迁移自旧 markdown.ts 的行为）
  assert.ok(headings.some((h) => h.title === '从 accept 开始' || h.title === '从 Accept 开始'));
  const html = renderToStaticMarkup(content);
  // 标题带 id
  assert.match(html, /<h2[^>]*id="/);
  // 图片被改写为 /article-assets 绝对路径（§6 图片链路）
  assert.match(html, /src="\/article-assets\/deep\/hello-deep\/diagram\.png"/);
  // shiki 多主题 CSS 变量（§6 代码高亮：defaultColor:false → 输出 --shiki-<theme>）
  assert.match(html, /--shiki-duo:/);
  assert.match(html, /--shiki-night:/);
});

test('不存在的 slug 返回 null；非法 track 返回 null', async () => {
  assert.equal(await getArticleMDX('deep', 'no-such-post'), null);
  assert.equal(await getArticleMDX('blog', 'hello-deep'), null);
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
npx tsx --test apps/web/tests/mdx.test.ts
```

期望输出：FAIL，`content` 模块没有导出 `getArticleMDX`。

- [ ] **Step 4: 在 content.ts 追加 getArticleMDX**

在 `apps/web/src/lib/content.ts` 顶部 import 区（现第 1–4 行之后）追加：

```ts
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { remarkHeadingIds, remarkArticleImages, type HeadingItem } from './mdx-plugins';
import type { Frontmatter } from './content-schema';

export type { HeadingItem } from './mdx-plugins';
```

在文件末尾追加：

```ts
/** §6 代码高亮：shiki 多主题 CSS 变量方案，代码块随 data-theme 即时切换 */
const prettyCodeOptions = {
  themes: {
    duo: 'github-light',
    editorial: 'github-light',
    night: 'rose-pine-moon',
  },
  defaultColor: false as const,
  keepBackground: false,
};

export async function getArticleMDX(
  track: string,
  slug: string
): Promise<{
  content: React.ReactElement;
  frontmatter: Frontmatter;
  headings: HeadingItem[];
  readingMinutes: number;
} | null> {
  if (track !== 'deep' && track !== 'intro') return null;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return null; // 防路径穿越
  const filePath = path.join(contentRoot(), track, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(raw);
  const frontmatter = frontmatterSchema.parse(data);
  const headings: HeadingItem[] = [];
  const assetsDir = path.join(contentRoot(), track, `${slug}.assets`);

  const { content } = await compileMDX({
    source: body,
    options: {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkHeadingIds(headings),
          remarkArticleImages(track, slug, assetsDir),
        ],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    },
  });

  return { content, frontmatter, headings, readingMinutes: readingMinutesOf(body) };
}
```

同时把 Task 3 中的私有函数 `readingMinutes` 重命名为 `readingMinutesOf`（避免与局部变量歧义），`getAllArticles` 内调用点同步改名：

```ts
function readingMinutesOf(markdown: string): number {
  // 函数体与 Task 3 相同，仅改名
```

- [ ] **Step 5: 跑测试确认通过**

```bash
npx tsx --test apps/web/tests/mdx.test.ts && npx tsx --test apps/web/tests/content.test.ts
```

期望输出：两次均 pass，退出码 0。（若 `next-mdx-remote/rsc` 在纯 node 下因 React 版本报错，改用 `npm --prefix apps/web run build` 后到 Task 14 的详情页验收兜底断言，并在计划执行记录中注明。）

- [ ] **Step 6: 验证图片缺失 fail build 行为**

（本步临时改坏一个夹具文件并在命令末尾用 `git checkout --` 还原，非破坏性。）

```bash
node -e "
const fs = require('fs');
const p = 'content/articles/deep/hello-deep.mdx';
const bak = fs.readFileSync(p, 'utf8');
fs.writeFileSync(p, bak.replace('./diagram.png', './missing.png'));
console.log('已临时改坏图片引用');
" && npx tsx --eval "
import('./apps/web/src/lib/content.ts').then((m) => m.getArticleMDX('deep', 'hello-deep')).then(
  () => { console.error('不应成功'); process.exit(1); },
  (e) => { console.log('按预期抛错:', String(e).slice(0, 80)); }
);
"; git checkout -- content/articles/deep/hello-deep.mdx
```

期望输出：`按预期抛错: Error: 图片缺失: ...`，且最后文件被还原（`git status` 干净）。若 `next-mdx-remote/rsc` 在纯 node 下不可加载（同 Step 5 备注），改为在 Step 5 的兜底路径里验证：把图片引用改坏后跑 `npm --prefix apps/web run build`，断言 build 以「图片缺失」报错失败，再还原文件。

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/content.ts apps/web/src/lib/mdx-plugins.ts apps/web/tests/mdx.test.ts
git commit -m "feat(content): getArticleMDX（compileMDX + 标题id/TOC + 图片改写校验 + shiki 三主题）"
```

**验收标准**：三个测试文件 `npx tsx --test apps/web/tests/*.test.ts` 全绿；Step 6 的缺图断言按预期抛错。

---

### Task 5: 图片 prebuild 脚本 copy-article-assets

**Files:**
- Create: `scripts/copy-article-assets.mjs`
- Modify: `apps/web/package.json:5-10`（scripts 增 prebuild/predev）
- Modify: `.gitignore`（追加 1 行；若无该文件则创建）

**Interfaces:**
- Consumes: `content/articles/<track>/<slug>.assets/`（Task 2 夹具）
- Produces: `apps/web/public/article-assets/<track>/<slug>/<file>`（构建产物，供 Task 4 改写后的 `<img src>` 命中）；npm lifecycle：`next build`/`next dev` 前自动执行

- [ ] **Step 1: 实现拷贝脚本**

创建 `scripts/copy-article-assets.mjs`。**路径解析必须以 cwd 为基准而非脚本自身位置**：npm lifecycle 的 cwd = apps/web（本地），而 Docker 镜像 build 阶段把 apps/web 平铺在 `/app`、content 在 `/app/content`（见现 `apps/web/Dockerfile` build 阶段），脚本位置相对 repo 根的假设在镜像内不成立——两种布局下唯一不变量是「cwd 是 web 应用根（有 next.config.ts），content/articles 在 cwd 向上可找到」：

```js
// §6 图片链路：prebuild 把 content/articles/<track>/<slug>.assets/ 拷贝到
// <web 应用根>/public/article-assets/<track>/<slug>/，运行时镜像不再 COPY content。
// cwd 基准解析：本地 npm lifecycle cwd=apps/web；Docker build 阶段 cwd=/app。
import fs from 'node:fs';
import path from 'node:path';

const webRoot = process.cwd();
if (!fs.existsSync(path.join(webRoot, 'next.config.ts'))) {
  console.error(`copy-article-assets: 必须在 web 应用根下执行（cwd=${webRoot} 无 next.config.ts）`);
  process.exit(1);
}

/** 从 cwd 向上找 content/articles（本地 = ../../content，Docker = ./content） */
function findContentRoot() {
  let dir = webRoot;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'content', 'articles');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  console.error('copy-article-assets: content/articles 目录未找到');
  process.exit(1);
}

const srcRoot = findContentRoot();
const destRoot = path.join(webRoot, 'public', 'article-assets');

fs.rmSync(destRoot, { recursive: true, force: true });

let copied = 0;
for (const track of ['deep', 'intro']) {
  const trackDir = path.join(srcRoot, track);
  if (!fs.existsSync(trackDir)) continue;
  for (const entry of fs.readdirSync(trackDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.endsWith('.assets')) continue;
    const slug = entry.name.slice(0, -'.assets'.length);
    const dest = path.join(destRoot, track, slug);
    fs.cpSync(path.join(trackDir, entry.name), dest, { recursive: true });
    copied += fs.readdirSync(dest).length;
  }
}
console.log(`copy-article-assets: ${copied} 个文件 → ${path.relative(webRoot, destRoot)}/`);
```

- [ ] **Step 2: 运行并验证（cwd 必须是 apps/web）**

```bash
cd /Users/abble/my-learning-record/apps/web && node ../../scripts/copy-article-assets.mjs
cd /Users/abble/my-learning-record
test -f apps/web/public/article-assets/deep/hello-deep/diagram.png && \
test -f apps/web/public/article-assets/intro/hello-intro/cover.png && echo OK
```

期望输出：`copy-article-assets: 2 个文件 → ...` 与 `OK`。

- [ ] **Step 3: 接入 npm lifecycle 并忽略产物**

修改 `apps/web/package.json` 的 scripts 块（现第 5–10 行；`lint` 保持阶段二产出的 `eslint .` 不动）为：

```json
  "scripts": {
    "predev": "node ../../scripts/copy-article-assets.mjs",
    "dev": "next dev -H 0.0.0.0 -p 3000",
    "prebuild": "node ../../scripts/copy-article-assets.mjs",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000",
    "lint": "eslint ."
  },
```

> Docker 镜像内 `../../scripts/...` 从 `/app` 解析为 `/scripts/...`，Task 19 会给 Dockerfile 补 `COPY scripts/ /scripts/`（本地开发不受影响）。

在仓库根 `.gitignore` 追加：

```
apps/web/public/article-assets/
```

- [ ] **Step 4: 验证 lifecycle 生效**

（`rm -rf` 目标是 gitignore 的派生产物目录，下一条命令即重建，非破坏性。）

```bash
rm -rf apps/web/public/article-assets
npm --prefix apps/web run build 2>&1 | head -5
test -d apps/web/public/article-assets && echo LIFECYCLE-OK
git status --porcelain | grep article-assets || echo GITIGNORE-OK
```

期望输出：build 日志首行前出现 `copy-article-assets: 2 个文件`；`LIFECYCLE-OK`；`GITIGNORE-OK`。

- [ ] **Step 5: Commit**

```bash
git add scripts/copy-article-assets.mjs apps/web/package.json .gitignore
git commit -m "feat(build): 文章图片 prebuild 拷贝脚本接入 next build/dev lifecycle"
```

**验收标准**：Step 4 三个断言全部输出预期值。

---

### Task 6: token 体系（tokens.css 全量 + tailwind.config.ts 重写 + next/font）

**Files:**
- Create: `apps/web/src/styles/tokens.css`（本计划最重要的代码块，三主题 token 必须齐全）
- Create: `apps/web/src/lib/fonts.ts`
- Modify: `apps/web/tailwind.config.ts:1-81`（整体重写）
- Modify: `apps/web/src/styles/globals.css:1-60+`（整体重写；旧粉色系与渲染阻塞 @import 全部废弃）
- Test: `apps/web/tests/tokens.test.ts`

**Interfaces:**
- Consumes: D1/D3/D4/D5/D6 全部数值
- Produces: CSS 自定义属性 `--c-*`（RGB 通道）/`--surface-tint`/`--accent-soft`/`--theme-color`/`--font-*`/`--fs-*`/`--shadow-*`/`--dur-*`/`--ease-standard`；Tailwind 语义色 `bg/surface/ink/ink-2/ink-3/ink-muted/line/line-2/accent/accent-soft/accent-strong/accent-text/on-accent/track-deep/track-deep-dim/track-intro/track-intro-dim`；变体 `theme-duo/theme-editorial/theme-night/track-deep/track-intro`；`export const notoSerifSC`（变量名 `--font-noto-serif`）——后续所有组件任务的样式基座

- [ ] **Step 1: 写 token 完整性测试（先失败）**

创建 `apps/web/tests/tokens.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(
  path.join(process.cwd(), 'apps/web/src/styles/tokens.css'),
  'utf8'
);

const CHANNEL_TOKENS = [
  '--c-bg', '--c-surface', '--c-text', '--c-text-2', '--c-text-3', '--c-text-muted',
  '--c-border', '--c-border-2', '--c-accent', '--c-accent-strong', '--c-accent-text',
  '--c-on-accent', '--c-track-deep', '--c-track-deep-dim', '--c-track-intro',
  '--c-track-intro-dim', '--c-rail-deep-outline', '--c-focus-ring',
];
const VALUE_TOKENS = [
  '--surface-tint', '--accent-soft', '--theme-color', '--font-display',
  '--shadow-card', '--shadow-card-hover', '--shadow-headline', '--shadow-pill',
  '--glow-hover',
];

test('三主题各自声明全部 token', () => {
  for (const theme of ['duo', 'editorial', 'night']) {
    const m = css.match(new RegExp(`\\[data-theme='${theme}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`));
    assert.ok(m, `缺少 [data-theme='${theme}'] 块`);
    for (const t of [...CHANNEL_TOKENS, ...VALUE_TOKENS]) {
      assert.ok(m![1].includes(`${t}:`), `${theme} 缺 ${t}`);
    }
  }
});

test('D1 关键色值抽查（AA 修正值，不回抄 mockup）', () => {
  assert.match(css, /--c-accent: 236 90 135/);        // duo #EC5A87
  assert.match(css, /--c-text-3: 122 110 118/);       // duo AA 修正 #7A6E76
  assert.match(css, /--c-accent-strong: 198 58 100/); // duo AA 修正 #C63A64
  assert.match(css, /--c-accent: 194 37 92/);         // editorial #C2255C
  assert.match(css, /--c-text-3: 117 103 112/);       // editorial AA 修正 #756770
  assert.match(css, /--c-track-deep: 201 191 206/);   // night 月白 #C9BFCE
  assert.match(css, /--c-text-3: 148 138 155/);       // night AA 修正 #948A9B
  assert.match(css, /--surface-tint: rgb\(242 118 159 \/ 0\.08\)/); // night
  assert.match(css, /--accent-soft: rgb\(242 118 159 \/ 0\.4\)/);   // night
});

test('机制约束：color-scheme / :root 兜底 / 动效 token', () => {
  assert.match(css, /\[data-theme='night'\][^}]*color-scheme: dark/s);
  assert.match(css, /:root,\s*\[data-theme='duo'\]/); // :root 放 duo 值兜底（D1）
  assert.match(css, /--dur-fast: 150ms/);
  assert.match(css, /--dur-base: 250ms/);
  assert.match(css, /--ease-standard: cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.match(css, /--theme-color: #FDFBFC/);
  assert.match(css, /--theme-color: #FAF6F3/);
  assert.match(css, /--theme-color: #171219/);
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx tsx --test apps/web/tests/tokens.test.ts
```

期望输出：FAIL（tokens.css 不存在）。

- [ ] **Step 3: 写 tokens.css 全量**

创建 `apps/web/src/styles/tokens.css`（色值逐条对照 D1 表；AA 修正项以 D1 为准；带内建透明度的 token 存完整色值，其余存 RGB 通道值——§6 token 机制）：

```css
/* ============================================================
   Devline design tokens —— 唯一色值来源
   规格：docs/superpowers/specs/2026-07-03-devline-redesign-design.md
   D1 色板 / D3 字体 / D4 字阶 / D5 装饰 / D6 动效
   - 颜色存 RGB 通道值（--c-*），支持 Tailwind <alpha-value>（§6）
   - 自带透明度的 token（--surface-tint / --accent-soft / 辉光）存完整色值
   - token 定义在 [data-theme] 上，:root 放 duo 兜底（D1 / §4 /dev/themes 前提）
   - 组件层禁止出现 hex（D1）；本文件是唯一允许 hex/裸 RGB 的样式层
   ============================================================ */

/* ---------- 全局（与主题无关） ---------- */
:root {
  /* D3 三条字体栈 */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --font-serif: var(--font-noto-serif), 'Songti SC', 'STSong', 'SimSun', serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace;

  /* D4 字阶（375px ↔ 1120px 线性流式） */
  --fs-hero: clamp(28px, 2.4vw + 19px, 46px);
  --fs-headline: clamp(17px, 0.67vw + 14.5px, 22px);
  --fs-title: 15px;
  --fs-body: 16px;
  --fs-sub: clamp(14px, 0.53vw + 12px, 16px);
  --fs-meta: 12px;
  --fs-nav: 14px;
  --fs-brand: 24px;
  --lh-body: 1.9;

  /* D6 动效 token */
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* §5 主题切换器色卡圆点（三点并排即品牌展示；固定为各主题 --accent 值） */
  --dot-duo: 236 90 135;       /* #EC5A87 */
  --dot-editorial: 194 37 92;  /* #C2255C */
  --dot-night: 242 118 159;    /* #F2769F */
}

/* D4：移动端字阶 */
@media (max-width: 640px) {
  :root {
    --fs-title: 14px;
    --fs-meta: 11px;
    --fs-brand: 19px;
  }
}

/* ---------- 双线 B（duo，默认主题；:root 兜底） ---------- */
:root,
[data-theme='duo'] {
  color-scheme: light;
  --theme-color: #FDFBFC; /* §4 meta theme-color */

  /* D1 色板 */
  --c-bg: 253 251 252;            /* #FDFBFC */
  --c-surface: 255 255 255;       /* #FFFFFF */
  --surface-tint: rgb(253 238 244);   /* #FDEEF4 */
  --c-text: 23 20 26;             /* #17141A */
  --c-text-2: 92 82 90;           /* #5C525A */
  --c-text-3: 122 110 118;        /* #7A6E76  AA 修正 */
  --c-text-muted: 184 172 180;    /* #B8ACB4  仅纯装饰 */
  --c-border: 226 216 221;        /* #E2D8DD */
  --c-border-2: 239 231 235;      /* #EFE7EB */
  --c-accent: 236 90 135;         /* #EC5A87 */
  --accent-soft: rgb(246 189 210);    /* #F6BDD2 */
  --c-accent-strong: 198 58 100;  /* #C63A64  AA 修正 */
  --c-accent-text: 198 58 100;    /* #C63A64  AA 修正 */
  --c-on-accent: 255 255 255;     /* #FFFFFF on #C63A64 = 5.01:1 */
  --c-track-deep: 23 20 26;       /* #17141A */
  --c-track-deep-dim: 217 210 214;/* #D9D2D6 */
  --c-track-intro: 236 90 135;    /* #EC5A87 */
  --c-track-intro-dim: 242 191 210; /* #F2BFD2 */
  --c-rail-deep-outline: 138 126 134; /* #8A7E86 D1 组件级修正（3.77:1 ≥ 3:1） */
  --c-focus-ring: 23 20 26;       /* §5 focus ring 亮主题 #17141A */

  /* D3/D5：B 标题用重磅无衬线 */
  --font-display: var(--font-sans);
  --font-meta: var(--font-sans);
  --lh-hero: 1.3;
  --ls-hero: -0.02em;

  /* D4/D5 章节引子（B：13px/800/字距 0.12em） */
  --fs-label: 13px;
  --ls-label: 0.12em;
  --fw-label: 800;
  --font-label: var(--font-sans);

  /* D5 阴影：硬错位投影零模糊 */
  --shadow-card: 4px 4px 0 rgb(var(--c-track-deep));
  --shadow-card-hover: 6px 6px 0 rgb(var(--c-track-deep));
  --shadow-headline: 6px 6px 0 var(--accent-soft);
  --shadow-pill: 3px 3px 0 var(--accent-soft);
  --glow-hover: none;
  --glow-text: none;
}

/* ---------- 编辑刊 A（editorial） ---------- */
[data-theme='editorial'] {
  color-scheme: light;
  --theme-color: #FAF6F3;

  --c-bg: 250 246 243;            /* #FAF6F3 */
  --c-surface: 255 255 255;       /* #FFFFFF */
  --surface-tint: rgb(243 196 211);   /* #F3C4D3 仅小面积底衬 */
  --c-text: 34 26 32;             /* #221A20 */
  --c-text-2: 90 76 84;           /* #5A4C54 */
  --c-text-3: 117 103 112;        /* #756770  AA 修正 */
  --c-text-muted: 185 170 178;    /* #B9AAB2 */
  --c-border: 228 217 214;        /* #E4D9D6 */
  --c-border-2: 237 227 224;      /* #EDE3E0 */
  --c-accent: 194 37 92;          /* #C2255C */
  --accent-soft: rgb(243 196 211);    /* #F3C4D3 */
  --c-accent-strong: 194 37 92;   /* #C2255C */
  --c-accent-text: 194 37 92;     /* #C2255C（5.26:1 原值过 AA） */
  --c-on-accent: 255 255 255;     /* #FFFFFF on #C2255C = 5.7:1 */
  --c-track-deep: 34 26 32;       /* #221A20 */
  --c-track-deep-dim: 228 217 214;/* #E4D9D6 */
  --c-track-intro: 194 37 92;     /* #C2255C */
  --c-track-intro-dim: 243 196 211; /* #F3C4D3 */
  --c-rail-deep-outline: 34 26 32;  /* A 未激活深度描边 = --track-deep（无 B 特例） */
  --c-focus-ring: 34 26 32;

  --font-display: var(--font-serif); /* D3：衬线只写在 A/C 作用域 */
  --font-meta: var(--font-sans);
  --lh-hero: 1.4;   /* D4：衬线 lh 1.4、不加负字距 */
  --ls-hero: 0;

  /* D4/D5 章节引子（A：12px/字距 0.2em + 22px 短红线，短红线在组件 CSS 里画） */
  --fs-label: 12px;
  --ls-label: 0.2em;
  --fw-label: 700;
  --font-label: var(--font-sans);

  /* D5：A 无投影，气质靠留白与细线 */
  --shadow-card: none;
  --shadow-card-hover: none;
  --shadow-headline: none;
  --shadow-pill: none;
  --glow-hover: none;
  --glow-text: none;
}

/* ---------- 夜航 C（night，兼任暗色模式） ---------- */
[data-theme='night'] {
  color-scheme: dark; /* §4：否则 UA 滚动条/表单控件首帧闪白 */
  --theme-color: #171219;

  --c-bg: 23 18 25;               /* #171219 */
  --c-surface: 31 24 35;          /* #1F1823 */
  --surface-tint: rgb(242 118 159 / 0.08);
  --c-text: 244 237 242;          /* #F4EDF2 */
  --c-text-2: 156 143 160;        /* #9C8FA0 */
  --c-text-3: 148 138 155;        /* #948A9B  AA 修正 */
  --c-text-muted: 124 112 128;    /* #7C7080 */
  --c-border: 42 34 46;           /* #2A222E */
  --c-border-2: 58 47 64;         /* #3A2F40 */
  --c-accent: 242 118 159;        /* #F2769F */
  --accent-soft: rgb(242 118 159 / 0.4);
  --c-accent-strong: 242 118 159; /* D1：C 填色直接用 --accent */
  --c-accent-text: 242 118 159;   /* 6.92:1 原值过 AA */
  --c-on-accent: 23 18 25;        /* #171219 on #F2769F = 6.9:1 */
  --c-track-deep: 201 191 206;    /* #C9BFCE 月白（「墨」是语义色非固定 hex） */
  --c-track-deep-dim: 58 47 64;   /* #3A2F40 */
  --c-track-intro: 242 118 159;   /* #F2769F */
  --c-track-intro-dim: 58 47 64;  /* #3A2F40 */
  --c-rail-deep-outline: 201 191 206;
  --c-focus-ring: 242 118 159;    /* §5 focus ring 夜航 #F2769F */

  --font-display: var(--font-serif);
  --font-meta: var(--font-mono); /* D4：C 主题 meta 用 --font-mono */
  --lh-hero: 1.4;
  --ls-hero: 0;

  /* D4/D5 章节引子（C：12px mono，// 与 $ 前缀在组件 CSS 里加） */
  --fs-label: 12px;
  --ls-label: 0;
  --fw-label: 700;
  --font-label: var(--font-mono);

  /* D5：C 无投影；辉光三件套 */
  --shadow-card: none;
  --shadow-card-hover: none;
  --shadow-headline: none;
  --shadow-pill: none;
  --glow-hover: 0 0 20px rgb(242 118 159 / 0.15);
  --glow-text: 0 0 24px rgb(242 118 159 / 0.45);
}
```

- [ ] **Step 4: 跑 token 测试确认通过**

```bash
npx tsx --test apps/web/tests/tokens.test.ts
```

期望输出：`# pass 3`，退出码 0。

- [ ] **Step 5: 创建 next/font 配置**

创建 `apps/web/src/lib/fonts.ts`（配置逐字来自 D3；`variable` 模式让 @font-face 仅在 A/C 作用域规则命中时触发下载）：

```ts
import { Noto_Serif_SC } from 'next/font/google';

/** D3：Noto Serif SC 切片自托管，仅 A/C 主题标题层使用 */
export const notoSerifSC = Noto_Serif_SC({
  weight: ['700', '900'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Songti SC', 'SimSun'],
  variable: '--font-noto-serif',
});
```

- [ ] **Step 6: 重写 tailwind.config.ts**

用以下内容完整替换 `apps/web/tailwind.config.ts`（现第 1–81 行；旧 rose/pink 硬编码色板废弃——§6）：

```ts
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

export default {
  // §6：darkMode 绑定夜航主题（Tailwind 3.4 selector 语法）
  darkMode: ['selector', '[data-theme="night"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // §6：语义色一律经 CSS 变量下发；RGB 通道值 + <alpha-value>
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-tint': 'var(--surface-tint)', // 自带透明度（night），不走 alpha-value
        ink: 'rgb(var(--c-text) / <alpha-value>)',
        'ink-2': 'rgb(var(--c-text-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--c-text-3) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-text-muted) / <alpha-value>)', // 仅纯装饰（D1）
        line: 'rgb(var(--c-border) / <alpha-value>)',
        'line-2': 'rgb(var(--c-border-2) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-soft': 'var(--accent-soft)', // 自带透明度（night）
        'accent-strong': 'rgb(var(--c-accent-strong) / <alpha-value>)',
        'accent-text': 'rgb(var(--c-accent-text) / <alpha-value>)',
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
        'track-deep': 'rgb(var(--c-track-deep) / <alpha-value>)',
        'track-deep-dim': 'rgb(var(--c-track-deep-dim) / <alpha-value>)',
        'track-intro': 'rgb(var(--c-track-intro) / <alpha-value>)',
        'track-intro-dim': 'rgb(var(--c-track-intro-dim) / <alpha-value>)',
        'focus-ring': 'rgb(var(--c-focus-ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'], // duo=重磅无衬线 / editorial+night=Noto Serif SC（§6）
        mono: ['var(--font-mono)'],
        meta: ['var(--font-meta)'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        headline: 'var(--shadow-headline)',
        pill: 'var(--shadow-pill)',
        glow: 'var(--glow-hover)',
      },
      // D4 宽度节奏
      maxWidth: {
        container: '960px',
        hero: '640px',
        prose: '680px',
        headline: '760px',
        list: '856px',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
      },
    },
  },
  plugins: [
    typography,
    // §6：主题变体仅限装饰差异（阴影/圆角/伪元素），组件配色一律走 token
    plugin(({ addVariant }) => {
      addVariant('theme-duo', "[data-theme='duo'] &");
      addVariant('theme-editorial', "[data-theme='editorial'] &");
      addVariant('theme-night', "[data-theme='night'] &");
      addVariant('track-deep', "html[data-track='deep'] &");
      addVariant('track-intro', "html[data-track='intro'] &");
    }),
  ],
} satisfies Config;
```

- [ ] **Step 7: 重写 globals.css（基座部分）**

用以下内容完整替换 `apps/web/src/styles/globals.css`（旧文件的 Google Fonts @import、粉色系变量、.btn-*/.card/.badge 等组件类全部废弃；后续任务会在文件末尾按注释锚点追加组件 CSS）：

```css
@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-bg font-sans text-ink antialiased;
    font-size: var(--fs-body);
    line-height: 1.75;
  }

  ::selection {
    background: var(--accent-soft);
    color: rgb(var(--c-text));
  }

  /* §5：独立于选中填色的可见 focus ring（2px outline + 2px offset） */
  :focus-visible {
    outline: 2px solid rgb(var(--c-focus-ring));
    outline-offset: 2px;
  }
}

/* ---------- §4/D6 主题切换动效：临时 .theme-transition 类 ---------- */
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition:
    background-color 250ms ease,
    color 250ms ease,
    border-color 250ms ease,
    box-shadow 250ms ease !important;
}

@media (prefers-reduced-motion: reduce) {
  .theme-transition *,
  .theme-transition *::before,
  .theme-transition *::after {
    transition: none !important; /* D6：主题切换零过渡 */
  }
}

/* ---------- 通用布局（D4 宽度节奏：容器 960px 居中，侧 padding 48/20） ---------- */
.container-devline {
  max-width: 960px;
  margin-inline: auto;
  padding-inline: 48px;
}

@media (max-width: 640px) {
  .container-devline {
    padding-inline: 20px;
  }
}

/* ---------- 章节引子（D5 差异表：B 字距标签 / A 短红线 / C mono 前缀） ---------- */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-label);
  font-size: var(--fs-label);
  font-weight: var(--fw-label);
  letter-spacing: var(--ls-label);
  color: rgb(var(--c-text-2));
  text-transform: uppercase;
}

[data-theme='editorial'] .section-label::before {
  content: '';
  width: 22px;
  height: 2px;
  background: rgb(var(--c-accent)); /* A：22px 短红线 */
}

[data-theme='night'] .section-label::before {
  content: '// ';
  color: rgb(var(--c-accent-text)); /* C：等宽注释前缀 */
}

/* ---------- shiki 代码块三主题切换（§6 代码高亮：三行 CSS 按 data-theme 选变量） ---------- */
pre code span {
  color: var(--shiki-duo);
}
[data-theme='editorial'] pre code span {
  color: var(--shiki-editorial);
}
[data-theme='night'] pre code span {
  color: var(--shiki-night);
}

pre {
  background: rgb(var(--c-surface));
  border: 1px solid rgb(var(--c-border));
  padding: 16px 20px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
}

/* ==== 后续任务追加区（保持此注释在文件末尾之前） ==== */
```

- [ ] **Step 8: 构建验证 + token 进产物断言**

```bash
npm --prefix apps/web run build
grep -rl -- "--c-accent:236 90 135\|--c-accent: 236 90 135" apps/web/.next/static | head -2
```

期望输出：build 退出码 0（旧页面用 Tailwind 默认 pink/rose 色板类仍可编译）；grep 命中至少一个 CSS 产物文件。

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/styles/tokens.css apps/web/src/styles/globals.css \
  apps/web/src/lib/fonts.ts apps/web/tailwind.config.ts apps/web/tests/tokens.test.ts
git commit -m "feat(design): D1-D6 全量 token 体系（三主题 CSS 变量 + Tailwind 语义映射 + Noto Serif SC 切片）"
```

**验收标准**：`npx tsx --test apps/web/tests/tokens.test.ts` 全绿（三主题 27 个 token 齐全 + 关键 AA 修正值抽查 + color-scheme/:root 兜底/动效 token）；build 产物含 token 变量。

---

### Task 7: 防闪烁脚本 + layout 重写

**Files:**
- Modify: `apps/web/src/app/layout.tsx:1-43`（整体重写）

**Interfaces:**
- Consumes: `notoSerifSC`（Task 6）、旧 `Header`/`Footer`（临时保留，Task 9 换装）
- Produces: `html[data-theme]`/`html[data-track]` 首帧就位（供全部组件的属性选择器 CSS）；`meta[name="theme-color"]`（供 ThemeSwitcher 同步）；metadata 基建（metadataBase/OG/RSS link/twitter card）；GoatCounter count.js（仅生产）

- [ ] **Step 1: 重写 layout.tsx**

用以下内容完整替换 `apps/web/src/app/layout.tsx`（要点：删除 `force-dynamic`（§6）；`THEME_INIT` **逐字**来自规格 §4，一个字符不得改动；theme-color 同步用第二个内联脚本从 `--theme-color` 计算值读取，token 单一来源）：

```tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { notoSerifSC } from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// §6 metadata 基建：兜底硬编码，NEXT_PUBLIC_SITE_URL 仅用于覆盖
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qingverse.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Devline - 一条线给工程师，一条线给所有人',
    template: '%s | Devline',
  },
  description:
    'Devline 双线技术写作：深度线拆源码与架构，写给工程师；科普线把技术讲给所有人。',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Devline' }],
    },
  },
  openGraph: {
    siteName: 'Devline',
    locale: 'zh_CN',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// §4 防闪烁脚本（逐字来自规格，theme 与 track 共用）
const THEME_INIT = `(function(){try{var t=localStorage.getItem('devline-theme');if(t!=='duo'&&t!=='editorial'&&t!=='night'){t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'duo'}document.documentElement.dataset.theme=t;var k=localStorage.getItem('devline-track');document.documentElement.dataset.track=k==='intro'?'intro':'deep'}catch(e){document.documentElement.dataset.theme='duo';document.documentElement.dataset.track='deep'}})()`;

// §4：meta theme-color 三主题各一值——值从 tokens.css 的 --theme-color 读取（单一来源）
const THEME_COLOR_SYNC = `(function(){var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m)}m.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim())})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={notoSerifSC.variable}>
      <body className="flex min-h-screen flex-col">
        {/* §4：body 第一个子元素，同步脚本阻塞后续渲染，效果等同 head 内联 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SYNC }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* §5 /stats 采集：GoatCounter count.js，异步无 cookie；本地开发不计数 */}
        {process.env.NODE_ENV === 'production' && (
          <script
            data-goatcounter="https://stats.qingverse.com/count"
            async
            src="https://stats.qingverse.com/count.js"
          />
        )}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 启动 dev 并断言 HTML 结构**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/ > /tmp/devline-home.html
grep -c "devline-theme" /tmp/devline-home.html
grep -o '<body[^>]*>' /tmp/devline-home.html
node -e "
const html = require('fs').readFileSync('/tmp/devline-home.html', 'utf8');
const body = html.slice(html.indexOf('<body'));
const firstScript = body.indexOf('<script>');
const firstTag = body.indexOf('>', body.indexOf('<body')) + 1;
// body 首子元素即内联脚本（允许 next 注入的注释节点之前无其他元素标签）
if (!/^<script>\(function\(\)\{try\{var t=localStorage/.test(body.slice(firstTag).trim())) {
  console.error('防闪烁脚本不是 body 首子元素'); process.exit(1);
}
console.log('BODY-FIRST-CHILD-OK');
"
kill %1
```

期望输出：`devline-theme` 出现次数 ≥ 1；`BODY-FIRST-CHILD-OK`。（若 next dev 在 body 首注入自身节点导致断言失败，改为人工确认 view-source 中脚本先于 Header 输出，并记录。）

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat(web): 防闪烁内联脚本 + theme-color 同步 + Devline metadata 基建 layout"
```

**验收标准**：Step 2 断言通过；`curl -s localhost:3000 | grep suppressHydrationWarning` 无输出（React 属性不入 HTML，属预期），但 `grep 'data-goatcounter'` 在 dev 下无输出（仅生产注入）。

---

### Task 8: ThemeSwitcher（主题切换器）

**Files:**
- Create: `apps/web/src/components/ThemeSwitcher.tsx`
- Modify: `apps/web/src/styles/globals.css`（文件末尾「后续任务追加区」注释之前追加组件 CSS）

**Interfaces:**
- Consumes: `--dot-*` / `--theme-color` token（Task 6）、`.theme-transition`（Task 6）
- Produces: `export function ThemeSwitcher()`；`export function applyTheme(theme: 'duo'|'editorial'|'night')`（Task 9 的 SiteHeader 引用 ThemeSwitcher）

规格依据（§5 导航条目，逐条落实）：一个按钮（桌面=当前主题色点+「主题」文字，移动端仅色点，`aria-label="主题：当前双线"`）、`aria-haspopup`+`aria-expanded`、浮层内 `role="radiogroup" aria-label="主题"`、当前项 `aria-checked="true"`、键盘 ↑/↓ 移动 Enter/Space 选中 Esc 关闭回焦、选项行高 ≥44px、禁止循环切换。

- [ ] **Step 1: 实现组件**

创建 `apps/web/src/components/ThemeSwitcher.tsx`：

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export type ThemeName = 'duo' | 'editorial' | 'night';

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'duo', label: '双线' },
  { value: 'editorial', label: '编辑刊' },
  { value: 'night', label: '夜航' },
];

/** 换肤 + 写 localStorage + 同步 meta theme-color + 临时过渡类（§4/D6） */
export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 300);
  }
  root.dataset.theme = theme;
  try {
    localStorage.setItem('devline-theme', theme);
  } catch {
    /* 隐私模式下静默 */
  }
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  }
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>('duo');
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // mount 后从防闪烁脚本已设置的 html 属性同步（避免水合期不一致）
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === 'duo' || t === 'editorial' || t === 'night') setTheme(t);
  }, []);

  // 点击面板外关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !btnRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // 打开时焦点落当前项
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, THEMES.findIndex((t) => t.value === theme));
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        [idx]?.focus();
    });
  }, [open, theme]);

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? '双线';

  function select(t: ThemeName) {
    setTheme(t);
    applyTheme(t);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onPanelKeyDown(e: React.KeyboardEvent) {
    const radios = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []
    );
    const active = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      radios[(active + delta + radios.length) % radios.length]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (active >= 0) select(THEMES[active].value);
    }
  }

  return (
    <div className="theme-switcher">
      <button
        ref={btnRef}
        type="button"
        className="theme-switcher-btn"
        aria-label={`主题：当前${currentLabel}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-dot" data-dot={theme} aria-hidden="true" />
        <span className="theme-switcher-text">主题</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="theme-switcher-panel"
          role="radiogroup"
          aria-label="主题"
          onKeyDown={onPanelKeyDown}
        >
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={t.value === theme}
              className="theme-switcher-option"
              onClick={() => select(t.value)}
            >
              <span className="theme-dot" data-dot={t.value} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 追加组件 CSS**

在 `apps/web/src/styles/globals.css` 的 `/* ==== 后续任务追加区 ==== */` 注释**之前**追加：

```css
/* ---------- ThemeSwitcher（§5 导航条目） ---------- */
.theme-switcher {
  position: relative;
}

.theme-switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-nav);
  color: rgb(var(--c-text-2));
  padding: 10px 8px; /* §5 触控规约：热区扩展到 ≥44px */
  margin: -10px -8px;
  cursor: pointer;
}

.theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgb(var(--c-border));
}
.theme-dot[data-dot='duo'] {
  background: rgb(var(--dot-duo));
}
.theme-dot[data-dot='editorial'] {
  background: rgb(var(--dot-editorial));
}
.theme-dot[data-dot='night'] {
  background: rgb(var(--dot-night));
}

.theme-switcher-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 12px);
  min-width: 148px;
  background: rgb(var(--c-surface));
  border: 1px solid rgb(var(--c-border));
  padding: 6px;
  z-index: 50;
  box-shadow: var(--shadow-card);
}

.theme-switcher-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px; /* §5：每个选项行高 ≥44px */
  padding: 0 12px;
  font-size: var(--fs-nav);
  color: rgb(var(--c-text));
  text-align: left;
  cursor: pointer;
}

.theme-switcher-option:hover {
  background: var(--surface-tint);
}

.theme-switcher-option[aria-checked='true'] {
  font-weight: 700;
  color: rgb(var(--c-accent-text));
}

@media (max-width: 640px) {
  .theme-switcher-text {
    display: none; /* §5：移动端仅色点图标 */
  }
}
```

- [ ] **Step 3: 构建与 hex 自查**

```bash
npm --prefix apps/web run build
grep -nE '#[0-9a-fA-F]{3,8}' apps/web/src/components/ThemeSwitcher.tsx || echo NO-HEX-OK
```

期望输出：build 退出码 0；`NO-HEX-OK`。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/ThemeSwitcher.tsx apps/web/src/styles/globals.css
git commit -m "feat(component): ThemeSwitcher 浮层单选面板（radiogroup/键盘/44px/即时换肤）"
```

**验收标准**：build 通过 + `NO-HEX-OK`；行为验收（浮层开关/键盘/持久化）在 Task 10 建好 /dev/themes 后与 SiteHeader 一并目检截图。

---

### Task 9: SiteHeader（品牌字）+ MobileMenu + SiteFooter + layout 换装

**Files:**
- Create: `apps/web/src/lib/site.ts`
- Create: `apps/web/src/components/MobileMenu.tsx`
- Create: `apps/web/src/components/SiteHeader.tsx`
- Create: `apps/web/src/components/SiteFooter.tsx`
- Modify: `apps/web/src/app/layout.tsx`（Task 7 产物：Header/Footer 的 import 两行与 body 内使用两处换为 SiteHeader/SiteFooter）
- Modify: `apps/web/src/styles/globals.css`（追加品牌字/导航/汉堡/页脚 CSS）

**Interfaces:**
- Consumes: `ThemeSwitcher`（Task 8）
- Produces: `export function SiteHeader()` / `SiteFooter()` / `MobileMenu()`；`export const SITE`（站点常量）与 `export const NAV_ITEMS: { href: string; label: string }[]`——供 404/页脚/关于页复用

- [ ] **Step 1: 站点常量**

创建 `apps/web/src/lib/site.ts`（联系方式三项——邮箱/GitHub/小红书；**小红书主页 URL 与展示邮箱在执行时向用户确认后替换**，先以下真实可用的默认值提交（见计划末尾人工确认清单第 1 条））：

```ts
export const SITE = {
  name: 'Devline',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://qingverse.com',
  description:
    'Devline 双线技术写作：深度线拆源码与架构，写给工程师；科普线把技术讲给所有人。',
  author: 'Ethan',
  email: 'FlynnDillardoom@financier.com',
  github: 'https://github.com/EthanQC',
  xiaohongshu: 'https://www.xiaohongshu.com/user/profile/ethanqc',
} as const;

export const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '项目' },
  { href: '/about', label: '关于' },
] as const;
```

- [ ] **Step 2: MobileMenu**

创建 `apps/web/src/components/MobileMenu.tsx`（§5 响应式汉堡规格逐条落实：整宽下拉面板、四项 16px/行高≥48px/左对齐、当前页粉色短线、分隔线下 RSS/GitHub/小红书、`aria-expanded`+`aria-controls`、Esc/面板外关闭、焦点困在面板、关闭回焦、三道杠→关闭动画且尊重 reduced-motion）：

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SITE } from '@/lib/site';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 路由变化即关闭
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }
      // §5：焦点困在面板内
      if (e.key === 'Tab' && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>('a, button')
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div className="mobile-menu-root">
      <button
        ref={btnRef}
        type="button"
        className="hamburger"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        data-open={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar hamburger-bar-accent" aria-hidden="true" />
      </button>
      {open && (
        <div id="mobile-menu-panel" ref={panelRef} className="mobile-menu-panel">
          <nav aria-label="站内导航">
            {NAV_ITEMS.map((item) => {
              const current =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mobile-menu-item"
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mobile-menu-social">
            <a href="/feed.xml">RSS</a>
            <a href={SITE.github} rel="me noopener" target="_blank">
              GitHub
            </a>
            <a href={SITE.xiaohongshu} rel="me noopener" target="_blank">
              小红书
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: SiteHeader**

创建 `apps/web/src/components/SiteHeader.tsx`（品牌字 DOM 三主题共用，字尾差异全部由 D5 伪元素实现；主题切换器保留在导航栏、不塞进菜单——§5）：

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { MobileMenu } from '@/components/MobileMenu';
import { NAV_ITEMS } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container-devline site-header-inner">
        <Link href="/" className="brand" aria-label="Devline 首页">
          <span className="brand-dev">Dev</span>
          <span className="brand-line">line</span>
        </Link>
        <nav className="site-nav" aria-label="站内导航">
          {NAV_ITEMS.map((item) => {
            const current =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav-link"
                aria-current={current ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="site-header-actions">
          <ThemeSwitcher />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: SiteFooter**

创建 `apps/web/src/components/SiteFooter.tsx`（§5 页脚：B 半墨半粉双色顶线（D5/D1 固定值）+「© Devline」+ RSS/GitHub/小红书/统计 + 隐私一行；**不出现「情长」**；每链接独立 padding 行高 ≥44px）。

> **规格补充（不在 §5 清单但为法定义务）**：站点部署在阿里云大陆 VPS，ICP 备案号与公安备案号必须在页脚展示（旧页脚现值：粤ICP备2025487305号 / 粤公网安备44030002008906号，`public/beian-gongan.png` 保留不删）。此两行为合规保留项，与品牌无关。

```tsx
import { SITE } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-devline site-footer-inner">
        <p className="site-footer-copy">© Devline</p>
        <nav className="site-footer-links" aria-label="站外链接">
          <a href="/feed.xml">RSS</a>
          <a href={SITE.github} rel="me noopener" target="_blank">
            GitHub
          </a>
          <a href={SITE.xiaohongshu} rel="me noopener" target="_blank">
            小红书
          </a>
          <a href="/stats">统计</a>
        </nav>
        <p className="site-footer-privacy">统计自托管、无 cookie、不追踪个人</p>
        <p className="site-footer-beian">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            粤ICP备2025487305号
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002008906"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/beian-gongan.png" alt="" width={14} height={14} loading="lazy" />
            粤公网安备44030002008906号
          </a>
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: 追加 CSS（品牌字/导航/汉堡/页脚）**

在 `globals.css` 追加区之前追加：

```css
/* ---------- SiteHeader / 品牌字（D5 品牌字尾差异表） ---------- */
.site-header {
  border-bottom: 1px solid rgb(var(--c-border-2));
  background: rgb(var(--c-bg));
}

.site-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 64px;
}

.brand {
  position: relative;
  display: inline-flex;
  font-family: var(--font-display);
  font-size: var(--fs-brand);
  font-weight: 900;
  color: rgb(var(--c-text));
  line-height: 1.2;
}

/* B：sans 800「Dev line」，line 下双线（粉 3px 于 -4px、墨 3px 于 -9px，D5；粉线=--accent，D1 固定值） */
[data-theme='duo'] .brand {
  font-weight: 800;
}
[data-theme='duo'] .brand .brand-line {
  position: relative;
  margin-left: 0.18em;
}
[data-theme='duo'] .brand .brand-line::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 3px;
  background: rgb(var(--c-accent));
}
[data-theme='duo'] .brand .brand-line::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -9px;
  height: 3px;
  background: rgb(var(--c-track-deep));
}

/* A：衬线 900「Devline」+ 编辑红句点 */
[data-theme='editorial'] .brand::after {
  content: '.';
  color: rgb(var(--c-accent));
}

/* C：衬线 900「Devline」+ 粉色光标 */
[data-theme='night'] .brand::after {
  content: '_';
  color: rgb(var(--c-accent));
}

.site-nav {
  display: flex;
  gap: 8px;
}

.site-nav-link {
  font-size: var(--fs-nav);
  color: rgb(var(--c-text-2));
  padding: 14px 10px; /* 热区 ≥44px */
}

.site-nav-link:hover {
  color: rgb(var(--c-text));
}

.site-nav-link[aria-current='page'] {
  color: rgb(var(--c-text));
  font-weight: 700;
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 640px) {
  .site-nav {
    display: none; /* §5：手机导航折叠进汉堡菜单 */
  }
}

/* ---------- MobileMenu（§5 汉堡规格） ---------- */
.mobile-menu-root {
  display: none;
}

@media (max-width: 640px) {
  .mobile-menu-root {
    display: block;
  }
}

.hamburger {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 44px;
  height: 44px;
  align-items: center;
  cursor: pointer;
}

.hamburger-bar {
  width: 20px;
  height: 2px;
  background: rgb(var(--c-text));
  transition: transform var(--dur-base) var(--ease-standard),
    opacity var(--dur-base) var(--ease-standard);
}

/* D1 固定值：第三道杠 = --accent（不随主题变的固定关系） */
.hamburger-bar-accent {
  background: rgb(var(--c-accent));
}

/* 三道杠 → 关闭图标 */
.hamburger[data-open='true'] .hamburger-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.hamburger[data-open='true'] .hamburger-bar:nth-child(2) {
  opacity: 0;
}
.hamburger[data-open='true'] .hamburger-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (prefers-reduced-motion: reduce) {
  .hamburger-bar {
    transition: none; /* D6：汉堡图标无动画 */
  }
}

.mobile-menu-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 64px;
  background: rgb(var(--c-bg));
  border-bottom: 1px solid rgb(var(--c-border));
  padding: 8px 20px 16px;
  z-index: 40;
}

.mobile-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px; /* §5：行高 ≥48px */
  font-size: 16px;
  color: rgb(var(--c-text));
  padding-left: 18px;
  text-align: left;
}

/* §5：当前页项左侧粉色短线标记（呼应 rail 语言） */
.mobile-menu-item[aria-current='page']::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 3px;
  background: rgb(var(--c-accent));
}

.mobile-menu-social {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  border-top: 1px solid rgb(var(--c-border-2));
  padding-top: 8px;
}

.mobile-menu-social a {
  padding: 12px;
  font-size: var(--fs-nav);
  color: rgb(var(--c-text-2));
}

/* ---------- SiteFooter（§5 页脚 + D5 页脚顶线差异） ---------- */
.site-footer {
  margin-top: 64px;
  border-top: 1px solid rgb(var(--c-border));
}

/* B：2px 半墨半粉渐变顶线（D1 固定值），full-bleed 由 footer 全宽实现，非负 margin */
[data-theme='duo'] .site-footer {
  border-top: none;
}
[data-theme='duo'] .site-footer::before {
  content: '';
  display: block;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgb(var(--c-track-deep)) 50%,
    rgb(var(--c-track-intro)) 50%
  );
}

.site-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 24px;
  padding-block: 24px;
}

.site-footer-copy {
  font-size: var(--fs-meta);
  font-family: var(--font-meta);
  color: rgb(var(--c-text-3));
}

.site-footer-links {
  display: flex;
  gap: 4px;
}

.site-footer-links a {
  padding: 12px; /* §5：每链接独立热区 ≥44px、相邻不重叠 */
  font-size: var(--fs-nav);
  color: rgb(var(--c-text-2));
}

.site-footer-links a:hover {
  color: rgb(var(--c-accent-text));
}

.site-footer-privacy {
  font-size: var(--fs-meta);
  font-family: var(--font-meta);
  color: rgb(var(--c-text-3));
}

/* 备案信息（合规保留项，非品牌元素） */
.site-footer-beian {
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: var(--fs-meta);
  color: rgb(var(--c-text-3));
}

.site-footer-beian a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-block: 8px;
  color: rgb(var(--c-text-3));
}
```

- [ ] **Step 6: layout 换装**

修改 `apps/web/src/app/layout.tsx`：把

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
```

替换为

```tsx
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
```

并把 body 内 `<Header />` → `<SiteHeader />`、`<Footer />` → `<SiteFooter />`。

- [ ] **Step 7: 构建 + 断言**

```bash
npm --prefix apps/web run build
grep -rnE '#[0-9a-fA-F]{3,8}' apps/web/src/components/SiteHeader.tsx \
  apps/web/src/components/SiteFooter.tsx apps/web/src/components/MobileMenu.tsx || echo NO-HEX-OK
grep -rn "情长" apps/web/src/components apps/web/src/lib apps/web/src/app/layout.tsx && echo FOUND-BANNED || echo NO-QINGCHANG-OK
```

期望输出：build 通过；`NO-HEX-OK`；`NO-QINGCHANG-OK`（此时旧首页/关于页仍含「情长」属已知状态，分别在 Task 13/17 重写清除，全站断言在 Task 19/20 收口——本步只对新文件设红线）。

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/site.ts apps/web/src/components/MobileMenu.tsx \
  apps/web/src/components/SiteHeader.tsx apps/web/src/components/SiteFooter.tsx \
  apps/web/src/app/layout.tsx apps/web/src/styles/globals.css
git commit -m "feat(component): SiteHeader 品牌字/MobileMenu/SiteFooter 并接入 layout"
```

**验收标准**：Step 7 三个断言通过；`curl -s localhost:3000 | grep -o 'brand-line'` 命中（品牌字 DOM 就位）。三主题目检在 Task 10 /dev/themes 建好后补截图。

---

### Task 10: /dev/themes 预览页 + 裸 hex 检查脚本（三主题验收工具）

**Files:**
- Create: `apps/web/src/app/dev/themes/page.tsx`
- Create: `scripts/check-no-raw-hex.mjs`

**Interfaces:**
- Consumes: SiteHeader/SiteFooter/ThemeSwitcher（Task 8/9）；token 定义在 `[data-theme]`（Task 6，嵌套容器生效的前提）
- Produces: `/dev/themes` 页（后续每个组件任务向其中追加实例）；`node scripts/check-no-raw-hex.mjs`（组件层裸 hex 门禁，Task 19 进 CI）——两者合起来是 D7 第 3 条验收纪律的工具

- [ ] **Step 1: 创建预览页**

创建 `apps/web/src/app/dev/themes/page.tsx`（§4：生产环境 notFound；三个 `data-theme` 容器并排；后续任务在 `<PreviewSections />` 里追加组件实例）：

```tsx
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
```

- [ ] **Step 2: 实现裸 hex 检查脚本**

创建 `scripts/check-no-raw-hex.mjs`（D1「组件层禁止出现 hex」的机器断言：扫 `apps/web/src` 下所有 .tsx/.ts/.css，唯一豁免 `styles/tokens.css`——token 层是规格允许 hex 的唯一样式层）：

```js
// D1：组件层禁止出现 hex。唯一豁免：src/styles/tokens.css（token 单一来源）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(repoRoot, 'apps', 'web', 'src');
const EXEMPT = [path.join(srcRoot, 'styles', 'tokens.css')];
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(tsx|ts|css)$/.test(entry.name)) continue;
    if (EXEMPT.includes(full)) continue;
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(HEX_RE);
      if (m) violations.push(`${path.relative(repoRoot, full)}:${i + 1}  ${m.join(' ')}`);
    });
  }
}

walk(srcRoot);

if (violations.length) {
  console.error('组件层出现裸 hex（D1 违规）:\n' + violations.join('\n'));
  process.exit(1);
}
console.log('check-no-raw-hex: OK（组件层无裸 hex）');
```

- [ ] **Step 3: 运行脚本（应即时全绿）**

```bash
node scripts/check-no-raw-hex.mjs; echo "exit=$?"
```

期望输出：`check-no-raw-hex: OK（组件层无裸 hex）`、`exit=0`。依据现状核实：仓库 src 内唯一含裸 hex 的文件是旧 `styles/globals.css`（粉色系变量），Task 6 已整体重写为 token 引用；旧页面组件全部用 Tailwind 类名、无内联 hex。若出现违规清单，逐条修掉再继续（新旧文件一视同仁——该脚本从本任务起就是红线）。

- [ ] **Step 4: 三主题目检**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dev/themes
```

期望输出：`200`。随后用浏览器（或 MCP Playwright）打开 `http://localhost:3000/dev/themes`：三列并排，duo 列白底墨字粉点、editorial 列暖纸底衬线品牌字带红句点、night 列暗紫底月白/粉轨；品牌字尾三主题各不相同且 DOM 相同。截图存档（D7 验收纪律）。完成后 `kill %1`。

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/dev/themes/page.tsx scripts/check-no-raw-hex.mjs
git commit -m "feat(tooling): /dev/themes 三主题并排预览页 + 组件层裸 hex 检查脚本"
```

**验收标准**：`/dev/themes` 返回 200 且三主题渲染差异符合 D5；hex 脚本对新文件零违规；截图存档。

---

### Task 11: ArticleCard + HeadlineCard

**Files:**
- Create: `apps/web/src/lib/format.ts`
- Create: `apps/web/src/components/ArticleCard.tsx`
- Create: `apps/web/src/components/HeadlineCard.tsx`
- Modify: `apps/web/src/app/dev/themes/page.tsx`（PreviewSections 追加卡片实例）
- Modify: `apps/web/src/styles/globals.css`（追加卡片 CSS）

**Interfaces:**
- Consumes: `Article` 类型（Task 3）、track token
- Produces: `export function ArticleCard({ article }: { article: Article })`；`export function HeadlineCard({ article }: { article: Article })`；`export function formatDate(iso: string): string`——供首页/列表页（Task 13/14）复用

- [ ] **Step 1: 日期工具**

创建 `apps/web/src/lib/format.ts`：

```ts
/** '2026-07-01' → '2026 年 7 月 1 日' */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}
```

- [ ] **Step 2: ArticleCard**

创建 `apps/web/src/components/ArticleCard.tsx`（meta 一律 `--text-3`（D1 禁令）；轨道归属经 `data-track-card` 由 CSS 走 `--track-*`）：

```tsx
import Link from 'next/link';
import type { Article } from '@/lib/content';
import { formatDate } from '@/lib/format';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.track}/${article.slug}`}
      className="article-card"
      data-track-card={article.track}
    >
      <div className="article-card-head">
        <h3 className="article-card-title">{article.title}</h3>
        <span className="article-card-meta">
          {formatDate(article.date)} · {article.readingMinutes} 分钟
        </span>
      </div>
      <p className="article-card-summary">{article.summary}</p>
      {article.tags.length > 0 && (
        <div className="article-card-tags">
          {article.tags.map((t) => (
            <span key={t} className="article-card-tag">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
```

- [ ] **Step 3: HeadlineCard**

创建 `apps/web/src/components/HeadlineCard.tsx`（§5 首页第 3 条：最新一篇（不分轨道）带轨道标记「最新 · 科普线」，视觉层级=更大尺寸+6px 6px 0 硬阴影（duo））：

```tsx
import Link from 'next/link';
import type { Article } from '@/lib/content';
import { TRACK_LABEL } from '@/lib/content';
import { formatDate } from '@/lib/format';

export function HeadlineCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.track}/${article.slug}`}
      className="headline-card"
      data-track-card={article.track}
    >
      <p className="headline-card-marker">
        <span className="headline-card-dot" aria-hidden="true" />
        最新 · {TRACK_LABEL[article.track]}
      </p>
      <h2 className="headline-card-title">{article.title}</h2>
      <p className="headline-card-summary">{article.summary}</p>
      <span className="article-card-meta">
        {formatDate(article.date)} · {article.readingMinutes} 分钟
      </span>
    </Link>
  );
}
```

- [ ] **Step 4: 追加卡片 CSS**

在 `globals.css` 追加区之前追加（D5 差异表逐格落实：A 发丝线无投影、B 粗边硬投影+hover 位移、C 轨色边+辉光 hover；圆角 D5 圆角行）：

```css
/* ---------- ArticleCard（D5 列表卡） ---------- */
.article-card {
  display: block;
  background: rgb(var(--c-surface));
  padding: 16px 20px;
  border: 1px solid rgb(var(--c-border));
}

@media (max-width: 640px) {
  .article-card {
    padding: 14px 16px;
  }
}

.article-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.article-card-title {
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.6;
  color: rgb(var(--c-text));
}

.article-card-meta {
  flex-shrink: 0;
  font-family: var(--font-meta);
  font-size: var(--fs-meta);
  color: rgb(var(--c-text-3)); /* D1：信息性文字一律 --text-3 */
}

.article-card-summary {
  margin-top: 6px;
  font-size: var(--fs-sub);
  line-height: 1.8;
  color: rgb(var(--c-text-2));
}

.article-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.article-card-tag {
  font-size: var(--fs-meta);
  color: rgb(var(--c-text-3));
  border: 1px solid rgb(var(--c-border-2));
  padding: 2px 8px;
}

/* B：1.5px 实边 + 4px4px0 硬投影，激活轨用 --track-*，hover 位移+阴影加深（D5） */
[data-theme='duo'] .article-card {
  border-width: 1.5px;
  border-radius: 0;
  transition: transform var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard);
}
[data-theme='duo'] .article-card[data-track-card='deep'] {
  border-color: rgb(var(--c-track-deep));
  box-shadow: 4px 4px 0 rgb(var(--c-track-deep));
}
[data-theme='duo'] .article-card[data-track-card='intro'] {
  border-color: rgb(var(--c-track-intro));
  box-shadow: 4px 4px 0 var(--accent-soft);
}
[data-theme='duo'] .article-card[data-track-card='deep']:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 rgb(var(--c-track-deep));
}
[data-theme='duo'] .article-card[data-track-card='intro']:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--accent-soft);
}

/* A：一律 1px 发丝线、无投影、卡片 0 圆角（D5） */
[data-theme='editorial'] .article-card {
  border-color: rgb(var(--c-border));
  border-radius: 0;
}

/* C：1px 发丝线 + 左侧 2px 轨色边，圆角 0 8px 8px 0，hover 辉光（D5） */
[data-theme='night'] .article-card {
  border-radius: 0 8px 8px 0;
  border-left-width: 2px;
  transition: box-shadow var(--dur-fast) var(--ease-standard);
}
[data-theme='night'] .article-card[data-track-card='deep'] {
  border-left-color: rgb(var(--c-track-deep));
}
[data-theme='night'] .article-card[data-track-card='intro'] {
  border-left-color: rgb(var(--c-track-intro));
}
[data-theme='night'] .article-card:hover {
  box-shadow: var(--glow-hover);
}

/* ---------- HeadlineCard（§5 头条通栏，D4 头条卡 760px） ---------- */
.headline-card {
  display: block;
  max-width: 760px;
  background: rgb(var(--c-surface));
  border: 1px solid rgb(var(--c-border));
  padding: 24px 28px;
}

.headline-card-marker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-meta);
  font-size: var(--fs-meta);
  font-weight: 700;
  color: rgb(var(--c-text-3));
}

.headline-card-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.headline-card[data-track-card='deep'] .headline-card-dot {
  background: rgb(var(--c-track-deep));
}
.headline-card[data-track-card='intro'] .headline-card-dot {
  background: rgb(var(--c-track-intro));
}

.headline-card-title {
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: var(--fs-headline);
  font-weight: 800;
  line-height: 1.5;
  color: rgb(var(--c-text));
}

.headline-card-summary {
  margin-top: 8px;
  font-size: var(--fs-sub);
  line-height: 1.8;
  color: rgb(var(--c-text-2));
}

/* B：头条卡 6px 6px 0 var(--accent-soft) 硬阴影 + 2px 实边（D5），hover 同款位移 */
[data-theme='duo'] .headline-card {
  border-width: 2px;
  border-color: rgb(var(--c-text));
  box-shadow: var(--shadow-headline);
  transition: transform var(--dur-fast) var(--ease-standard);
}
[data-theme='duo'] .headline-card:hover {
  transform: translate(-2px, -2px);
}

/* C：顶部 2px 轨色边 + 圆角 0 0 8px 8px 变体（D5 项目卡规则的头条对应：左侧轨色边） */
[data-theme='night'] .headline-card {
  border-radius: 0 8px 8px 0;
  border-left-width: 2px;
}
[data-theme='night'] .headline-card[data-track-card='deep'] {
  border-left-color: rgb(var(--c-track-deep));
}
[data-theme='night'] .headline-card[data-track-card='intro'] {
  border-left-color: rgb(var(--c-track-intro));
}
[data-theme='night'] .headline-card:hover {
  box-shadow: var(--glow-hover);
}
```

- [ ] **Step 5: 挂进 /dev/themes**

修改 `apps/web/src/app/dev/themes/page.tsx`：把 `PreviewSections` 改为 async 并渲染真实夹具数据（token 与真实数据双重验证）：

```tsx
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ArticleCard } from '@/components/ArticleCard';
import { HeadlineCard } from '@/components/HeadlineCard';
import { getAllArticles } from '@/lib/content';

const THEMES = ['duo', 'editorial', 'night'] as const;

async function PreviewSections() {
  const articles = await getAllArticles();
  return (
    <div className="space-y-6 p-6">
      <SiteHeader />
      <HeadlineCard article={articles[0]} />
      {articles.map((a) => (
        <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
      ))}
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
```

- [ ] **Step 6: 验证**

```bash
npm --prefix apps/web run build
node scripts/check-no-raw-hex.mjs 2>&1 | grep -E "components/(ArticleCard|HeadlineCard)" || echo NEW-FILES-CLEAN
```

期望输出：build 通过；`NEW-FILES-CLEAN`。浏览器打开 `/dev/themes` 目检：duo 卡片硬投影且 hover 位移、editorial 发丝线无投影、night 左轨色边+hover 辉光；deep 卡与 intro 卡轨色不同。截图存档。

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/ArticleCard.tsx apps/web/src/components/HeadlineCard.tsx \
  apps/web/src/lib/format.ts apps/web/src/app/dev/themes/page.tsx apps/web/src/styles/globals.css
git commit -m "feat(component): ArticleCard/HeadlineCard 三主题卡片（D5 差异表落实）"
```

**验收标准**：build 通过 + 新文件无裸 hex + /dev/themes 三主题截图。

---

### Task 12: RailTab（§5 签名交互完整规格）

**Files:**
- Create: `apps/web/src/components/RailTab.tsx`
- Modify: `apps/web/src/styles/globals.css`（追加区之前追加 rail CSS）
- Modify: `apps/web/src/app/dev/themes/page.tsx`（PreviewSections 的 `{/* Task 12 追加：RailTab */}` 注释处替换为实例）
- Test: `apps/web/tests/railtab.test.ts`

**Interfaces:**
- Consumes: `--c-track-*` / `--c-rail-deep-outline` / `--shadow-pill` / `--dur-*` / `--ease-standard` token（Task 6）；`html[data-track]`（Task 7 防闪烁脚本已首帧设置）
- Produces: `export function RailTab()`；`export function applyTrack(track: 'deep'|'intro')`（内部 dispatch `TRACK_EVENT`）；`export const TRACK_EVENT`；`export function EmptyTrackNotice({ track }: { track: 'deep'|'intro' })`；tab id 约定 `track-tab-<track>` / 面板 id 约定 `track-panel-<track>`（Task 13 首页面板按此标注）——面板显隐由 `html[data-track]` + CSS 驱动，组件零渲染态依赖；RailTab 订阅 `TRACK_EVENT` 以保证外部切轨（空态 CTA）也同步 aria

- [ ] **Step 1: 写失败测试**

创建 `apps/web/tests/railtab.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RailTab, EmptyTrackNotice } from '../src/components/RailTab';

test('RailTab：tablist 语义 + 双 tab + 移动端不删减的全文标签（§5）', () => {
  const html = renderToStaticMarkup(createElement(RailTab));
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /aria-label="内容轨道"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 2);
  assert.match(html, /aria-controls="track-panel-deep"/);
  assert.match(html, /aria-controls="track-panel-intro"/);
  assert.ok(html.includes('深度线 · 给工程师'));
  assert.ok(html.includes('科普线 · 给所有人'));
  // SSG 默认 deep 选中，roving tabindex：选中 0 / 未选中 -1
  assert.match(html, /aria-selected="true"[^>]*tabindex="0"|tabindex="0"[^>]*aria-selected="true"/);
  assert.match(html, /tabindex="-1"/);
});

test('EmptyTrackNotice：轨道空态精确文案（§5 404 与空态）', () => {
  const deep = renderToStaticMarkup(createElement(EmptyTrackNotice, { track: 'deep' }));
  assert.ok(deep.includes('深度线首篇打磨中 · 先沿科普线逛逛 →'));
  const intro = renderToStaticMarkup(createElement(EmptyTrackNotice, { track: 'intro' }));
  assert.ok(intro.includes('科普线首篇打磨中 · 先沿深度线逛逛 →'));
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx tsx --test apps/web/tests/railtab.test.ts
```

期望输出：FAIL，`Cannot find module '../src/components/RailTab'`。

- [ ] **Step 3: 实现 RailTab 组件**

创建 `apps/web/src/components/RailTab.tsx`（§5 渲染与状态条目逐字落实：「React 组件只负责点击时改 html 属性 + 写 localStorage + mount 后同步 aria 属性」；键盘规格：roving tabindex、↑/↓ 移动、Home/End、自动激活）：

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export type TrackName = 'deep' | 'intro';

const TABS = [
  { value: 'deep' as const, label: '深度线 · 给工程师' },
  { value: 'intro' as const, label: '科普线 · 给所有人' },
];

/** 轨道变更事件名——applyTrack 广播、RailTab 订阅，保证任意来源切轨都同步 aria */
export const TRACK_EVENT = 'devline-track-change';

/** §5：点击改 html 属性 + 写 localStorage（key devline-track）；显隐全由 CSS 驱动 */
export function applyTrack(track: TrackName) {
  const root = document.documentElement;
  // D6：列表入场动效仅在交互后启用（rail-animated 一旦挂上不再摘），保证开屏零动画
  root.classList.add('rail-animated');
  root.dataset.track = track;
  try {
    localStorage.setItem('devline-track', track);
  } catch {
    /* 隐私模式下静默 */
  }
  // 广播：让 RailTab（或任何监听者）同步内部 state，避免"外部改了 data-track 但 tab 的 aria/tabindex 不动"
  window.dispatchEvent(new CustomEvent<TrackName>(TRACK_EVENT, { detail: track }));
}

export function RailTab() {
  const [track, setTrack] = useState<TrackName>('deep');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // §5：mount 后从防闪烁脚本已设置的 html 属性同步 aria
  useEffect(() => {
    const t = document.documentElement.dataset.track;
    if (t === 'deep' || t === 'intro') setTrack(t);
  }, []);

  // 订阅外部轨道变更（如空态 EmptyTrackNotice 的跨轨 CTA），同步 aria-selected / roving tabindex
  useEffect(() => {
    const onExternal = (e: Event) => {
      const t = (e as CustomEvent<TrackName>).detail;
      if (t === 'deep' || t === 'intro') setTrack(t);
    };
    window.addEventListener(TRACK_EVENT, onExternal);
    return () => window.removeEventListener(TRACK_EVENT, onExternal);
  }, []);

  function select(t: TrackName) {
    setTrack(t);
    applyTrack(t); // applyTrack 内会 dispatch，本组件的监听器忽略重复设值（幂等）
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.findIndex((t) => t.value === track);
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // aria-orientation="vertical"：↑/↓ 在两轨间移动焦点（§5）
      next = (idx + (e.key === 'ArrowDown' ? 1 : -1) + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = TABS.length - 1;
    }
    if (next >= 0) {
      e.preventDefault();
      select(TABS[next].value); // 自动激活模式（§5：列表已静态渲染无加载延迟）
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section className="rail-tab" aria-label="轨道切换">
      {/* §5：两条线 full-bleed（绝对定位 left:0/right:0，禁用 100vw 负 margin）、不可点 */}
      <span className="rail-line rail-line-deep" aria-hidden="true" />
      <span className="rail-line rail-line-intro" aria-hidden="true" />
      <div
        className="container-devline rail-tab-labels"
        role="tablist"
        aria-label="内容轨道"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {TABS.map((t, i) => (
          <button
            key={t.value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`track-tab-${t.value}`}
            aria-selected={track === t.value}
            aria-controls={`track-panel-${t.value}`}
            tabIndex={track === t.value ? 0 : -1}
            data-rail-tab={t.value}
            className="rail-pill"
            onClick={() => select(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/** §5 轨道空态：跨轨 CTA，点击即切 tab（仅用于首页面板内） */
export function EmptyTrackNotice({ track }: { track: TrackName }) {
  const other: TrackName = track === 'deep' ? 'intro' : 'deep';
  const text =
    track === 'deep'
      ? '深度线首篇打磨中 · 先沿科普线逛逛 →'
      : '科普线首篇打磨中 · 先沿深度线逛逛 →';
  return (
    <button type="button" className="empty-track" onClick={() => applyTrack(other)}>
      {text}
    </button>
  );
}
```

- [ ] **Step 4: 追加 rail CSS（几何/状态/动效逐条对照 §5 与 D6）**

在 `globals.css` 追加区之前追加：

```css
/* ---------- RailTab（§5 签名交互；几何数值取自 final-layout-v2.html，标签右锚定） ---------- */
.rail-tab {
  position: relative;
  height: 96px; /* §5：区域高度桌面 96px */
}

.rail-line {
  position: absolute;
  left: 0;
  right: 0; /* full-bleed；§5 禁用 100vw 负 margin */
  pointer-events: none; /* §5：两条横线本身不可点、不响应事件 */
  transition:
    height var(--dur-base) var(--ease-standard),
    background-color var(--dur-base) var(--ease-standard); /* D6：线过渡 250ms */
}

.rail-line-deep {
  top: 22px; /* §5：深度线桌面 top 22px */
  height: 2px; /* 未激活 2px */
  background: rgb(var(--c-track-deep-dim));
}

.rail-line-intro {
  top: 64px; /* §5：科普线桌面 top 64px */
  height: 2px;
  background: rgb(var(--c-track-intro-dim));
}

html[data-track='deep'] .rail-line-deep {
  height: 4px; /* §5：激活 4px 实色 */
  background: rgb(var(--c-track-deep));
}

html[data-track='intro'] .rail-line-intro {
  height: 4px;
  background: rgb(var(--c-track-intro));
}

.rail-tab-labels {
  position: relative;
  height: 100%;
}

.rail-pill {
  position: absolute;
  transform: translateY(-50%);
  font-size: var(--fs-nav);
  font-weight: 700; /* §5：未激活 700 */
  padding: 6px 20px; /* §5：激活/未激活同 padding，视觉尺寸不变 */
  border-radius: 16px;
  background: rgb(var(--c-bg)); /* §5：未激活 = --bg 底 */
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-pill); /* D5：B 硬投影 3px 3px 0 / A 无 / C 无 */
  transition:
    background-color 200ms ease-out,
    color 200ms ease-out,
    border-color 200ms ease-out; /* D6：标签填色/描边 200ms ease-out */
}

/* §5 右锚定：深度标签右缘对齐内容容器右缘（容器侧 padding 48px）；科普标签向左错开约 172px */
.rail-pill[data-rail-tab='deep'] {
  top: 24px; /* 深度线(22px) + 激活线一半(2px)，标签骑线居中 */
  right: 48px;
}

.rail-pill[data-rail-tab='intro'] {
  top: 66px;
  right: calc(48px + 172px);
}

/* §5 触控规约：视觉尺寸不变，::after 把热区扩到 ≥44px */
.rail-pill::after {
  content: '';
  position: absolute;
  inset: -10px -6px;
}

/* 未激活：1.5px --track-* 描边 + 主色文字（§5）；深度描边走 --c-rail-deep-outline（D1 组件修正：
   B 用 #8A7E86 达组件 3:1，A/C 下该 token 即轨色）；科普文字走 --accent-text（D2：B 下 <19px 粉字禁用 --accent） */
.rail-pill[data-rail-tab='deep'] {
  border: 1.5px solid rgb(var(--c-rail-deep-outline));
  color: rgb(var(--c-track-deep));
}

.rail-pill[data-rail-tab='intro'] {
  border: 1.5px solid rgb(var(--c-track-intro));
  color: rgb(var(--c-accent-text));
}

/* 激活：填色 + --on-accent 文字 + 800（§5）。intro 填 --accent-strong：B 下即 AA 修正值 #C63A64，
   editorial/night 下该 token 与轨色同值（D1），一条规则三主题成立 */
html[data-track='deep'] .rail-pill[data-rail-tab='deep'] {
  background: rgb(var(--c-track-deep));
  border-color: rgb(var(--c-track-deep));
  color: rgb(var(--c-on-accent));
  font-weight: 800;
}

html[data-track='intro'] .rail-pill[data-rail-tab='intro'] {
  background: rgb(var(--c-accent-strong));
  border-color: rgb(var(--c-accent-strong));
  color: rgb(var(--c-on-accent));
  font-weight: 800;
}

[data-theme='night'] .rail-pill:hover {
  box-shadow: var(--glow-hover); /* D5：C hover 辉光 */
}

/* §5 移动端几何：区域 78px、线 top 16/52px、激活 3px、标签 12px/5px 16px/radius 14px，文字不删减 */
@media (max-width: 640px) {
  .rail-tab {
    height: 78px;
  }
  .rail-line-deep {
    top: 16px;
  }
  .rail-line-intro {
    top: 52px;
  }
  html[data-track='deep'] .rail-line-deep,
  html[data-track='intro'] .rail-line-intro {
    height: 3px;
  }
  .rail-pill {
    font-size: 12px;
    padding: 5px 16px;
    border-radius: 14px;
  }
  .rail-pill[data-rail-tab='deep'] {
    top: 17px;
    right: 20px;
  }
  .rail-pill[data-rail-tab='intro'] {
    top: 53px;
    right: calc(20px + 116px);
  }
}

/* ---------- 轨道面板显隐（§5 渲染与状态：双面板都在静态 HTML，html[data-track] + CSS 驱动） ---------- */
html[data-track='deep'] [data-panel='intro'] {
  display: none;
}

html[data-track='intro'] [data-panel='deep'] {
  display: none;
}

/* D6 列表交换：新列表 opacity 0→1 + translateY(8px→0) 250ms ease-out，卡片逐张 stagger 40ms。
   仅交互后启用（html.rail-animated 由 applyTrack 挂上），开屏无动画。
   已知取舍：旧列表经 display:none 即时隐藏，150ms 退场动画在纯 CSS + display 切换机制下不可实现，
   属 §5 机制（React 只改属性）与 D6 退场动效的交集限制，出场动效完整保留。 */
html.rail-animated [data-panel] > * {
  animation: rail-panel-in var(--dur-base) ease-out backwards;
}

html.rail-animated [data-panel] > *:nth-child(1) { animation-delay: 0ms; }
html.rail-animated [data-panel] > *:nth-child(2) { animation-delay: 40ms; }
html.rail-animated [data-panel] > *:nth-child(3) { animation-delay: 80ms; }
html.rail-animated [data-panel] > *:nth-child(4) { animation-delay: 120ms; }
html.rail-animated [data-panel] > *:nth-child(5) { animation-delay: 160ms; }
html.rail-animated [data-panel] > *:nth-child(6) { animation-delay: 200ms; }

@keyframes rail-panel-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* D6 降级：reduce 时列表交换退化为 120ms 纯 opacity */
@media (prefers-reduced-motion: reduce) {
  html.rail-animated [data-panel] > * {
    animation: rail-panel-fade 120ms ease-out backwards;
    animation-delay: 0ms !important;
  }

  @keyframes rail-panel-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

/* ---------- 轨道空态（§5：跨轨 CTA） ---------- */
.empty-track {
  display: block;
  width: 100%;
  padding: 24px;
  border: 1.5px dashed rgb(var(--c-border));
  background: rgb(var(--c-surface));
  color: rgb(var(--c-accent-text));
  font-size: var(--fs-sub);
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}
```

- [ ] **Step 5: 跑测试确认通过**

```bash
npx tsx --test apps/web/tests/railtab.test.ts
```

期望输出：`# pass 2`，退出码 0。

- [ ] **Step 6: 挂进 /dev/themes**

修改 `apps/web/src/app/dev/themes/page.tsx`：import 区追加 `import { RailTab } from '@/components/RailTab';`，并把 `{/* Task 12 追加：RailTab */}` 替换为：

```tsx
      <RailTab />
```

> 说明：预览页三列各渲染一个 RailTab，tab id 会重复（dev-only 页面，`notFound()` 挡在生产之外，可接受）；点击任一列的 tab 三列同步切换（`html[data-track]` 是全局属性），这本身就是「CSS 驱动、零组件状态」机制的目检方式。

- [ ] **Step 7: 目检 + hex 自查**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/dev/themes | grep -o 'role="tablist"' | wc -l
node scripts/check-no-raw-hex.mjs 2>&1 | grep "components/RailTab" || echo RAILTAB-CLEAN
kill %1
```

期望输出：`3`（三列各一个 tablist）；`RAILTAB-CLEAN`。浏览器打开 `/dev/themes` 目检：duo 列墨线+粉线、深度 pill 硬投影；night 列深度线为月白；点击「科普线」两条线粗细互换、激活 pill 填色带 `--on-accent` 文字；键盘 Tab 落到选中 pill、↑/↓ 在两轨间移动并自动激活、focus ring 可见。截图存档（D7）。

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/RailTab.tsx apps/web/tests/railtab.test.ts \
  apps/web/src/app/dev/themes/page.tsx apps/web/src/styles/globals.css
git commit -m "feat(component): RailTab 轨道切换器（右锚定几何/CSS 驱动/tablist 语义/D6 动效）"
```

**验收标准**：`npx tsx --test apps/web/tests/railtab.test.ts` 全绿；/dev/themes 三主题目检截图；RailTab.tsx 无裸 hex；**空态跨轨联动**——在浏览器（或阶段四 Playwright）点击 EmptyTrackNotice 的跨轨 CTA 后，目标轨道的 tab `aria-selected="true"` 且 `tabindex="0"`、原轨道回到 `aria-selected="false"`（验证 applyTrack 的 CustomEvent 已同步 RailTab 内部 state，不只是 CSS 视觉切换）。

---

### Task 13: 首页（hero + 头条 + 双轨面板 + 项目区 + JSON-LD）

**Files:**
- Create: `apps/web/src/lib/projects.ts`
- Create: `apps/web/src/components/ProjectCard.tsx`
- Modify: `apps/web/src/app/page.tsx:1-165`（整体重写，旧「情长」首页全部废弃）
- Modify: `apps/web/src/styles/globals.css`（追加 hero/首页/项目卡 CSS）

**Interfaces:**
- Consumes: `getAllArticles`/`TRACKS`/`TRACK_LABEL`（Task 3）、`HeadlineCard`/`ArticleCard`（Task 11）、`RailTab`/`EmptyTrackNotice`（Task 12）、`SITE`（Task 9）
- Produces: `/` 页面（SSG）；`export type Project` 与 `export const PROJECTS: Project[]`、`export function ProjectCard({ project }: { project: Project })`——Task 16 的 /projects 页复用

- [ ] **Step 1: 项目数据**

创建 `apps/web/src/lib/projects.ts`（§5 首页第 6 条：case-study 卡，问题 → 方案 → 结果，v1 放 3 个。**三段文案在执行时向用户逐条确认事实性**，以下为默认稿）：

```ts
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
```

- [ ] **Step 2: ProjectCard 组件**

创建 `apps/web/src/components/ProjectCard.tsx`：

```tsx
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
```

- [ ] **Step 3: 重写首页**

用以下内容完整替换 `apps/web/src/app/page.tsx`（现第 1–165 行，含 `force-dynamic`、`@/lib/api` 依赖与「情长」文案全部删除）：

```tsx
import Link from 'next/link';
import { getAllArticles, TRACKS, TRACK_LABEL } from '@/lib/content';
import { HeadlineCard } from '@/components/HeadlineCard';
import { ArticleCard } from '@/components/ArticleCard';
import { RailTab, EmptyTrackNotice } from '@/components/RailTab';
import { ProjectCard } from '@/components/ProjectCard';
import { PROJECTS } from '@/lib/projects';
import { SITE } from '@/lib/site';

export default async function HomePage() {
  const articles = await getAllArticles();
  const headline = articles[0]; // §5：最新一篇（不分轨道）

  // §5.1 条目 3：首页输出 WebSite + Person JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'Person',
        name: SITE.author,
        url: SITE.url,
        sameAs: [SITE.github, SITE.xiaohongshu],
      },
    ],
  };

  return (
    <div>
      {/* §5 首页 2：Hero 双线宣言 */}
      <section className="hero container-devline">
        <p className="section-label">Devline · 双线</p>
        <h1 className="hero-title">
          一条线给工程师，
          <br />
          一条线给
          <em className="hero-em" data-text="所有人">
            所有人
          </em>
          。
        </h1>
        <p className="hero-sub">
          深度线拆源码与架构，写给工程师；科普线把同一批技术讲成人话，写给所有人。
        </p>
      </section>

      {/* §5 首页 3：头条通栏（最新一篇，带轨道标记） */}
      {headline && (
        <section className="container-devline home-section">
          <p className="section-label">头条</p>
          <HeadlineCard article={headline} />
        </section>
      )}

      {/* §5 首页 4：rail-tab */}
      <RailTab />

      {/* §5 首页 5：当前轨道文章列表 + 沿线看全部。
          去重规则（§5）：头条属于某轨道时，该轨道面板排除头条；另一轨道面板不受影响 */}
      <section className="container-devline home-section home-lists">
        {TRACKS.map((track) => {
          const list = articles.filter(
            (a) =>
              a.track === track &&
              !(headline && headline.track === track && a.slug === headline.slug)
          );
          return (
            <div
              key={track}
              id={`track-panel-${track}`}
              role="tabpanel"
              aria-labelledby={`track-tab-${track}`}
              data-panel={track}
              className="home-panel"
            >
              {list.length === 0 ? (
                <EmptyTrackNotice track={track} />
              ) : (
                <>
                  {list.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                  <Link className="track-more" href={`/articles/${track}`}>
                    沿{TRACK_LABEL[track]}看全部 →
                  </Link>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* §5 首页 6：项目区 */}
      <section className="container-devline home-section">
        <p className="section-label">项目</p>
        <div className="project-grid">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
```

- [ ] **Step 4: 追加首页 CSS**

在 `globals.css` 追加区之前追加：

```css
/* ---------- Hero（D4 字阶 + D5 hero 强调差异表） ---------- */
.hero {
  padding-block: 64px 44px; /* D4：区块垂直间距桌面 44–64px */
}

.hero-title {
  max-width: 640px; /* D4：hero 文本 640px */
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 900;
  line-height: var(--lh-hero);
  letter-spacing: var(--ls-hero);
  color: rgb(var(--c-text));
}

.hero-sub {
  max-width: 640px;
  margin-top: 16px;
  font-size: var(--fs-sub);
  line-height: 1.8; /* D4：--fs-sub lh 1.8 */
  color: rgb(var(--c-text-2));
}

/* hero 强调词（D5）：B 直接 --accent 着色（46px 大字，D2 大字标准 3:1 过线）；
   A 底衬 6px --accent-soft；C --accent + 辉光（辉光放伪元素装饰层，opacity 过渡——§4） */
.hero-em {
  position: relative;
  font-style: normal;
  color: rgb(var(--c-accent));
}

[data-theme='editorial'] .hero-em {
  color: inherit;
  border-bottom: 6px solid var(--accent-soft);
}

.hero-em::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  text-shadow: var(--glow-text);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
  pointer-events: none;
}

[data-theme='night'] .hero-em::after {
  opacity: 1;
}

/* D5 夜航页角氛围光：radial 420px 定位页面右上角外溢，opacity 门控（§4 辉光层过渡规则） */
body::before {
  content: '';
  position: fixed;
  z-index: -1;
  top: -210px;
  right: -210px;
  width: 420px;
  height: 420px;
  pointer-events: none;
  background: radial-gradient(circle, rgb(var(--c-accent) / 0.16) 0%, transparent 65%);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
}

[data-theme='night'] body::before {
  opacity: 1;
}

/* ---------- 首页区块（D4 间距/宽度节奏） ---------- */
.home-section {
  margin-block: 44px;
}

@media (max-width: 640px) {
  .hero {
    padding-block: 40px 26px;
  }
  .home-section {
    margin-block: 26px;
  }
}

.home-lists {
  max-width: calc(856px + 96px); /* D4：列表区 856px + 容器侧 padding */
}

.home-panel {
  display: flex;
  flex-direction: column;
  gap: 12px; /* D4：卡片间距 10–12px */
  max-width: 856px;
}

.track-more {
  align-self: flex-end;
  padding: 10px 0; /* 热区 ≥44px 由 padding 补足 */
  font-size: var(--fs-sub);
  font-weight: 700;
  color: rgb(var(--c-accent-text));
}

/* ---------- ProjectCard（D5 项目卡差异 + D2 粉-底允许项目卡底） ---------- */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px; /* D4：项目卡 gap 14px */
  max-width: 856px;
}

@media (max-width: 640px) {
  .project-grid {
    grid-template-columns: 1fr; /* §5：项目移动端单列 */
  }
}

.project-card {
  background: var(--surface-tint);
  border: 1px solid rgb(var(--c-border));
  padding: 16px 20px;
}

[data-theme='duo'] .project-card {
  border-width: 1.5px;
  border-radius: 6px; /* D5：B 项目卡 6px */
}

[data-theme='editorial'] .project-card {
  background: rgb(var(--c-surface)); /* D1：A 的 tint 仅小面积底衬，项目卡走 surface */
  border-radius: 0;
}

[data-theme='night'] .project-card {
  border-radius: 0 0 8px 8px; /* D5：C 项目卡 0 0 8px 8px + 顶部 2px accent 边 */
  border-top: 2px solid rgb(var(--c-accent));
}

.project-card-name {
  font-family: var(--font-display);
  font-size: var(--fs-title);
  font-weight: 800;
  color: rgb(var(--c-text));
}

.project-card-body {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-card-body dt {
  float: left;
  margin-right: 8px;
  font-size: var(--fs-meta);
  font-weight: 800;
  color: rgb(var(--c-accent-text));
}

.project-card-body dd {
  font-size: var(--fs-sub);
  line-height: 1.8;
  color: rgb(var(--c-text-2));
}

.project-card-link {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 0;
  font-size: var(--fs-sub);
  font-weight: 700;
  color: rgb(var(--c-accent-text));
}
```

- [ ] **Step 5: 构建 + HTML 断言（双面板/去重/JSON-LD/无情长）**

```bash
npm --prefix apps/web run build
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/ > /tmp/devline-home.html
node -e "
const html = require('fs').readFileSync('/tmp/devline-home.html', 'utf8');
const assert = require('assert');
assert.match(html, /id=\"track-panel-deep\"/, '缺 deep 面板');
assert.match(html, /id=\"track-panel-intro\"/, '缺 intro 面板');
assert.match(html, /role=\"tablist\"/);
// 去重：头条是 hello-deep（2026-07-01 最新），deep 面板内不得再出现它
const deepPanel = html.split('id=\"track-panel-deep\"')[1].split('id=\"track-panel-intro\"')[0];
assert.ok(!deepPanel.includes('/articles/deep/hello-deep'), 'deep 面板未排除头条');
assert.ok(deepPanel.includes('/articles/deep/context-engineering'), 'deep 面板缺第二新文章');
const introPanel = html.split('id=\"track-panel-intro\"')[1];
assert.ok(introPanel.includes('/articles/intro/hello-intro'), 'intro 面板不受头条影响');
assert.match(html, /application\/ld\+json/);
assert.ok(html.includes('WebSite') && html.includes('Person'), 'JSON-LD 缺 WebSite/Person');
assert.ok(!html.includes('情长'), '出现禁用品牌词');
console.log('HOME-ASSERT-OK');
"
kill %1
```

期望输出：`HOME-ASSERT-OK`。

- [ ] **Step 6: 三主题目检**

浏览器打开 `/`（非 /dev/themes——首页含 RailTab 全宽破格与氛围光，需整页看），用导航主题切换器切三主题各截一张（PC + 375px 各一）：duo hero 强调词纯粉、editorial 强调词粉底衬、night 强调词辉光 + 右上角氛围光；rail-tab 标签右锚定、两 pill 错位骑线。截图存档（D7）。

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/lib/projects.ts \
  apps/web/src/components/ProjectCard.tsx apps/web/src/styles/globals.css
git commit -m "feat(page): Devline 首页（hero/头条/双轨面板/项目区/JSON-LD）"
```

**验收标准**：Step 5 全部断言通过；`node scripts/check-no-raw-hex.mjs` 违规清单不含 page.tsx/projects.ts/ProjectCard.tsx；三主题截图存档。

---

### Task 14: /articles 三列表页 + 文章详情页（TOC / JSON-LD / prose）

**Files:**
- Create: `apps/web/src/components/TrackFilter.tsx`
- Create: `apps/web/src/components/Toc.tsx`
- Create: `apps/web/src/app/articles/page.tsx`
- Create: `apps/web/src/app/articles/[track]/page.tsx`
- Create: `apps/web/src/app/articles/[track]/[slug]/page.tsx`
- Modify: `apps/web/src/styles/globals.css`（追加列表页/详情页/prose CSS）

**Interfaces:**
- Consumes: `getAllArticles`/`getArticleMDX`/`TRACKS`/`TRACK_LABEL`/`HeadingItem`（Task 3/4）、`ArticleCard`（Task 11）、`formatDate`（Task 11）、`SITE`（Task 9）
- Produces: `/articles`、`/articles/deep`、`/articles/intro`（全部 SSG，筛选由 URL 承载——§5）、`/articles/<track>/<slug>`（generateStaticParams + dynamicParams=false）；`export function Toc({ headings }: { headings: HeadingItem[] })`；`export function TrackFilter({ current }: { current: string })`

> Next 16 约定：page/generateMetadata 的 `params` 是 `Promise`，必须 `await params` 后再解构。

- [ ] **Step 1: TrackFilter 与 Toc 组件**

创建 `apps/web/src/components/TrackFilter.tsx`：

```tsx
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
```

创建 `apps/web/src/components/Toc.tsx`：

```tsx
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
```

- [ ] **Step 2: /articles 全部列表页**

创建 `apps/web/src/app/articles/page.tsx`：

```tsx
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { TrackFilter } from '@/components/TrackFilter';

export const metadata: Metadata = {
  title: '文章',
  description: 'Devline 全部文章：深度线与科普线',
  alternates: { canonical: '/articles' },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return (
    <section className="container-devline list-page">
      <p className="section-label">文章</p>
      <h1 className="list-title">全部文章</h1>
      <TrackFilter current="/articles" />
      <div className="list-items">
        {articles.map((a) => (
          <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: /articles/[track] 轨道列表页（含空态）**

创建 `apps/web/src/app/articles/[track]/page.tsx`：

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles, TRACKS, TRACK_LABEL, type Track } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { TrackFilter } from '@/components/TrackFilter';

export const dynamicParams = false; // 未知 track 直接 404

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track }));
}

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  const label = TRACK_LABEL[track as Track];
  return {
    title: `${label}文章`,
    description: `Devline ${label}文章列表`,
    alternates: { canonical: `/articles/${track}` },
  };
}

export default async function TrackPage({ params }: Props) {
  const { track } = await params;
  const t = track as Track;
  const other: Track = t === 'deep' ? 'intro' : 'deep';
  const articles = (await getAllArticles()).filter((a) => a.track === t);
  return (
    <section className="container-devline list-page">
      <p className="section-label">{TRACK_LABEL[t]}</p>
      <h1 className="list-title">{TRACK_LABEL[t]}文章</h1>
      <TrackFilter current={`/articles/${t}`} />
      <div className="list-items">
        {articles.length === 0 ? (
          /* §5 空态：/articles/<track> 复用轨道空态文案，CTA 为链接（URL 承载，非切 tab） */
          <p className="empty-track">
            {TRACK_LABEL[t]}首篇打磨中 ·{' '}
            <Link href={`/articles/${other}`}>先沿{TRACK_LABEL[other]}逛逛 →</Link>
          </p>
        ) : (
          articles.map((a) => <ArticleCard key={a.slug} article={a} />)
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 文章详情页**

创建 `apps/web/src/app/articles/[track]/[slug]/page.tsx`（§5.1 条目 3 JSON-LD Article 字段逐项：headline / datePublished / dateModified / author→Person / image / inLanguage: zh-CN / mainEntityOfPage；§6 metadata 条目 4：og:type=article + published_time / modified_time / article:tag）：

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticleMDX, TRACK_LABEL, type Track } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { Toc } from '@/components/Toc';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ track: a.track, slug: a.slug }));
}

type Props = { params: Promise<{ track: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track, slug } = await params;
  const article = await getArticleMDX(track, slug);
  if (!article) return {};
  const { frontmatter } = article;
  const iso = frontmatter.date.toISOString().slice(0, 10);
  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    alternates: { canonical: `/articles/${track}/${slug}` },
    openGraph: {
      type: 'article',
      title: frontmatter.title,
      description: frontmatter.summary,
      publishedTime: iso,
      modifiedTime: iso,
      tags: frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.summary,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { track, slug } = await params;
  const article = await getArticleMDX(track, slug);
  if (!article) notFound();
  const { content, frontmatter, headings, readingMinutes } = article;
  const iso = frontmatter.date.toISOString().slice(0, 10);
  const pageUrl = `${SITE.url}/articles/${track}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.summary,
    datePublished: iso,
    dateModified: iso,
    author: { '@type': 'Person', name: SITE.author, url: SITE.url },
    image: `${SITE.url}/opengraph-image.png`,
    inLanguage: 'zh-CN',
    mainEntityOfPage: pageUrl,
  };

  return (
    <article className="container-devline article-page">
      <header className="article-header">
        <p className="section-label">{TRACK_LABEL[track as Track]}</p>
        <h1 className="article-title">{frontmatter.title}</h1>
        <p className="article-card-meta">
          {formatDate(iso)} · {readingMinutes} 分钟
          {frontmatter.tags.length > 0 && <> · {frontmatter.tags.join(' / ')}</>}
        </p>
      </header>
      {headings.length > 1 && <Toc headings={headings} />}
      <div className="prose-devline">{content}</div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
```

- [ ] **Step 5: 追加列表/详情/prose CSS**

在 `globals.css` 追加区之前追加（正文规格 D4：16px / lh 1.9 / 列宽 680px ≈ 40 汉字行；文内 h2 用 `--fs-headline`、h3 用 `--fs-body` 加重——D4 未定义文内标题字阶，取既有 token 组合，frontend-design 阶段可微调）：

```css
/* ---------- 列表页 ---------- */
.list-page {
  padding-block: 44px 64px;
}

.list-title {
  margin-top: 12px;
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 900;
  line-height: var(--lh-hero);
  letter-spacing: var(--ls-hero);
  color: rgb(var(--c-text));
}

.track-filter {
  display: flex;
  gap: 4px;
  margin-block: 24px;
}

.track-filter-link {
  padding: 10px 14px; /* 热区 ≥44px */
  font-size: var(--fs-nav);
  color: rgb(var(--c-text-2));
}

.track-filter-link[aria-current='page'] {
  color: rgb(var(--c-text));
  font-weight: 800;
  border-bottom: 2px solid rgb(var(--c-accent));
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 856px; /* D4：列表区 856px */
}

/* ---------- 文章详情（D4：正文列 680px / 16px / lh 1.9） ---------- */
.article-page {
  padding-block: 44px 64px;
}

.article-header {
  max-width: 680px;
}

.article-title {
  margin-top: 12px;
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 900;
  line-height: var(--lh-hero);
  letter-spacing: var(--ls-hero);
  color: rgb(var(--c-text));
}

.article-header .article-card-meta {
  display: block;
  margin-top: 12px;
}

.toc {
  max-width: 680px;
  margin-top: 32px;
  padding: 16px 20px;
  border: 1px solid rgb(var(--c-border-2));
  background: rgb(var(--c-surface));
}

.toc ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.toc li a {
  display: inline-block;
  padding-block: 6px;
  font-size: var(--fs-sub);
  color: rgb(var(--c-text-2));
}

.toc li[data-depth='3'] {
  padding-left: 16px;
}

.toc li[data-depth='4'] {
  padding-left: 32px;
}

.toc li a:hover {
  color: rgb(var(--c-accent-text));
}

.prose-devline {
  max-width: 680px;
  margin-top: 32px;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: rgb(var(--c-text));
}

.prose-devline h2 {
  margin: 44px 0 16px;
  font-family: var(--font-display);
  font-size: var(--fs-headline);
  font-weight: 800;
  line-height: 1.5;
  color: rgb(var(--c-text));
}

.prose-devline h3,
.prose-devline h4 {
  margin: 32px 0 12px;
  font-family: var(--font-display);
  font-size: var(--fs-body);
  font-weight: 800;
  color: rgb(var(--c-text));
}

.prose-devline p {
  margin: 16px 0;
}

.prose-devline a {
  color: rgb(var(--c-accent-text)); /* D2 粉-文：正文链接 */
  border-bottom: 1px solid var(--accent-soft);
}

.prose-devline a:hover {
  border-bottom-color: rgb(var(--c-accent-text));
}

.prose-devline code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--surface-tint);
  padding: 1px 5px;
}

.prose-devline pre {
  margin: 24px 0;
}

.prose-devline pre code {
  background: none;
  padding: 0;
  font-size: inherit;
}

.prose-devline img {
  max-width: 100%;
  height: auto;
  border: 1px solid rgb(var(--c-border-2));
}

.prose-devline blockquote {
  margin: 20px 0;
  padding: 8px 20px;
  border-left: 3px solid var(--accent-soft);
  color: rgb(var(--c-text-2));
}

.prose-devline ul,
.prose-devline ol {
  margin: 16px 0;
  padding-left: 24px;
}

.prose-devline li {
  margin: 6px 0;
}

.prose-devline li::marker {
  color: rgb(var(--c-accent-text));
}

.prose-devline table {
  width: 100%;
  margin: 24px 0;
  border-collapse: collapse;
  font-size: var(--fs-sub);
}

.prose-devline th,
.prose-devline td {
  border: 1px solid rgb(var(--c-border-2));
  padding: 8px 12px;
  text-align: left;
}

.prose-devline hr {
  border: none;
  border-top: 1px solid rgb(var(--c-border-2));
  margin: 32px 0;
}
```

- [ ] **Step 6: 构建断言（SSG 路由 + 详情页元数据）**

```bash
npm --prefix apps/web run build 2>&1 | tee /tmp/devline-build.log | grep -E "articles"
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/articles/deep/hello-deep > /tmp/devline-article.html
node -e "
const html = require('fs').readFileSync('/tmp/devline-article.html', 'utf8');
const assert = require('assert');
assert.match(html, /rel=\"canonical\" href=\"https:\/\/qingverse\.com\/articles\/deep\/hello-deep\"/);
assert.match(html, /property=\"og:type\" content=\"article\"/);
assert.match(html, /article:published_time/);
assert.match(html, /\"@type\":\"Article\"/);
assert.match(html, /\"inLanguage\":\"zh-CN\"/);
assert.match(html, /src=\"\/article-assets\/deep\/hello-deep\/diagram\.png\"/);
assert.match(html, /aria-label=\"目录\"/);
assert.match(html, /--shiki-night/);
console.log('ARTICLE-ASSERT-OK');
"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/articles/intro
curl -s http://localhost:3000/articles | grep -o 'class="article-card"' | wc -l
kill %1
```

期望输出：build 路由表中 `/articles` 为 `○`（Static——无 generateStaticParams 的纯静态页），`/articles/[track]` 与 `/articles/[track]/[slug]` 为 `●`（SSG——带 generateStaticParams 预渲染）；`○` 与 `●` 都表示构建期预渲染、无运行时服务端渲染，均符合 §6「纯 SSG」要求（判据是没有 `ƒ`/Dynamic 标记，而非全为 `●`）。其余：`ARTICLE-ASSERT-OK`；`200`；`3`（三篇已发布夹具的卡片；draft 不出现）。

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/articles apps/web/src/components/TrackFilter.tsx \
  apps/web/src/components/Toc.tsx apps/web/src/styles/globals.css
git commit -m "feat(page): /articles 三列表 + 文章详情（TOC/JSON-LD/prose/OG article）"
```

**验收标准**：Step 6 全部断言通过；hex 脚本对新文件零违规；三主题下打开详情页目检代码块高亮随主题切换（github-light ↔ rose-pine-moon）。

---

### Task 15: 404 页 + prose 样张挂 /dev/themes

**Files:**
- Create: `apps/web/src/app/not-found.tsx`
- Modify: `apps/web/src/app/dev/themes/page.tsx`（`{/* Task 15 追加：prose 样张（含代码块） */}` 注释处替换）
- Modify: `apps/web/src/styles/globals.css`（追加 404 装置 CSS）

**Interfaces:**
- Consumes: track token（Task 6）、`getArticleMDX`（Task 4，prose 样张数据源）
- Produces: 全站 404 页（未知路径由 Next 渲染；阶段四 Caddy 的 410 响应体复用此页面视觉——§5/§6）；/dev/themes 含 prose+代码块样张（D7 验收工具补全）

- [ ] **Step 1: 404 页**

创建 `apps/web/src/app/not-found.tsx`（§5：双线装置变奏——两条线横贯但中段断开错位；文案逐字；双 CTA）：

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notfound">
      {/* 双线断开装置：gradient 制造中段缺口，两线缺口错位 */}
      <span className="notfound-line notfound-line-deep" aria-hidden="true" />
      <span className="notfound-line notfound-line-intro" aria-hidden="true" />
      <div className="container-devline notfound-body">
        <h1 className="notfound-title">404 · 这条线还没铺到这里</h1>
        <p className="notfound-sub">你找的页面不存在，也可能已随改版下线。</p>
        <div className="notfound-cta">
          <Link className="notfound-btn notfound-btn-primary" href="/">
            回首页
          </Link>
          <Link className="notfound-btn" href="/articles">
            看文章
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 追加 404 CSS**

在 `globals.css` 追加区之前追加：

```css
/* ---------- 404（§5：双线装置变奏，中段断开错位） ---------- */
.notfound {
  position: relative;
  padding-block: 120px;
  overflow: hidden;
}

.notfound-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  pointer-events: none;
}

.notfound-line-deep {
  top: 72px;
  background: linear-gradient(
    90deg,
    rgb(var(--c-track-deep)) 0 44%,
    transparent 44% 56%,
    rgb(var(--c-track-deep)) 56% 100%
  );
}

.notfound-line-intro {
  top: 96px;
  background: linear-gradient(
    90deg,
    rgb(var(--c-track-intro)) 0 52%,
    transparent 52% 64%,
    rgb(var(--c-track-intro)) 64% 100%
  );
}

.notfound-title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 900;
  line-height: var(--lh-hero);
  color: rgb(var(--c-text));
}

.notfound-sub {
  margin-top: 16px;
  font-size: var(--fs-sub);
  color: rgb(var(--c-text-2));
}

.notfound-cta {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.notfound-btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  font-size: var(--fs-nav);
  font-weight: 700;
  border: 1.5px solid rgb(var(--c-border));
  color: rgb(var(--c-text));
  box-shadow: var(--shadow-pill);
}

.notfound-btn-primary {
  background: rgb(var(--c-accent-strong));
  border-color: rgb(var(--c-accent-strong));
  color: rgb(var(--c-on-accent));
}
```

- [ ] **Step 3: prose 样张挂 /dev/themes**

修改 `apps/web/src/app/dev/themes/page.tsx`：import 区追加 `import { getArticleMDX } from '@/lib/content';`（`getAllArticles` 的 import 行合并写），`PreviewSections` 内读取样张并把 `{/* Task 15 追加：prose 样张（含代码块） */}` 替换为真实渲染：

```tsx
async function PreviewSections() {
  const articles = await getAllArticles();
  const sample = await getArticleMDX('deep', 'hello-deep'); // 含 go 代码块的夹具
  return (
    <div className="space-y-6 p-6">
      <SiteHeader />
      <HeadlineCard article={articles[0]} />
      {articles.map((a) => (
        <ArticleCard key={`${a.track}/${a.slug}`} article={a} />
      ))}
      <RailTab />
      {sample && <div className="prose-devline">{sample.content}</div>}
      {/* Task 16 追加：项目卡 */}
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 4: 验证**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/no-such-page
curl -s http://localhost:3000/no-such-page | grep -c "这条线还没铺到这里"
curl -s http://localhost:3000/dev/themes | grep -o 'class="prose-devline"' | wc -l
kill %1
```

期望输出：`404`；`1`；`3`（三主题列各一份样张）。浏览器目检 /dev/themes：三列代码块配色不同（duo/editorial=github-light、night=rose-pine-moon）；打开 /no-such-page 三主题各截图（§5：404 需三主题各自验收）。

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/not-found.tsx apps/web/src/app/dev/themes/page.tsx \
  apps/web/src/styles/globals.css
git commit -m "feat(page): 404 双线断线装置 + /dev/themes prose 代码块样张"
```

**验收标准**：Step 4 三个断言通过；404 页与代码块三主题截图存档。

---

### Task 16: /projects 页 + 项目卡挂 /dev/themes

**Files:**
- Create: `apps/web/src/app/projects/page.tsx`
- Modify: `apps/web/src/app/dev/themes/page.tsx`（`{/* Task 16 追加：项目卡 */}` 注释处替换）

**Interfaces:**
- Consumes: `PROJECTS`/`ProjectCard`（Task 13）
- Produces: `/projects` 页（SSG，§5 首页第 6 条同款卡片的完整列表）

- [ ] **Step 1: /projects 页**

创建 `apps/web/src/app/projects/page.tsx`：

```tsx
import type { Metadata } from 'next';
import { ProjectCard } from '@/components/ProjectCard';
import { PROJECTS } from '@/lib/projects';

export const metadata: Metadata = {
  title: '项目',
  description: 'Devline 项目：问题 → 方案 → 结果的 case-study',
  alternates: { canonical: '/projects' },
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
```

- [ ] **Step 2: 项目卡挂 /dev/themes**

修改 `apps/web/src/app/dev/themes/page.tsx`：import 区追加

```tsx
import { ProjectCard } from '@/components/ProjectCard';
import { PROJECTS } from '@/lib/projects';
```

把 `{/* Task 16 追加：项目卡 */}` 替换为：

```tsx
      <ProjectCard project={PROJECTS[0]} />
```

- [ ] **Step 3: 验证**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/projects
curl -s http://localhost:3000/projects | grep -o 'class="project-card"' | wc -l
kill %1
```

期望输出：`200`；`3`。/dev/themes 目检项目卡：duo 圆角 6px 粉底、editorial 白底细线、night 顶部 2px 粉边 + 下圆角。截图存档。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/projects apps/web/src/app/dev/themes/page.tsx
git commit -m "feat(page): /projects 项目页（问题→方案→结果卡片）"
```

**验收标准**：Step 3 断言通过；三主题截图存档。

---

### Task 17: /about 重写 + /stats（GoatCounter 客户端取数与降级）

**Files:**
- Modify: `apps/web/src/app/about/page.tsx:1-114`（整体重写，旧「情长」介绍与 API 依赖废弃）
- Create: `apps/web/src/components/StatsDashboard.tsx`
- Create: `apps/web/src/app/stats/page.tsx`
- Modify: `apps/web/src/styles/globals.css`（追加 about/stats CSS）

**Interfaces:**
- Consumes: `SITE`（Task 9）、`getAllArticles`（Task 3，/stats 的文章清单）、GoatCounter 公开 counter 端点 `https://stats.qingverse.com/counter/<path>.json`（阶段四部署；返回 `{ count, count_unique }`，支持 `?start=&end=` 日期参数，特殊路径 `TOTAL` 为全站合计）
- Produces: `/about`（SSG 纯静态）；`/stats` = SSG 骨架 + `StatsDashboard`（client）取数渲染，statsAPI 失败显示「统计服务暂不可用」且不破版式（§5）

- [ ] **Step 1: 重写关于页**

用以下内容完整替换 `apps/web/src/app/about/page.tsx`（现第 1–114 行）。§5：个人介绍 + 技术栈 + 双线理念一段 + 联系方式（邮箱/GitHub/小红书直链，不做表单）；**不含起源故事、不出现「情长」**；个人介绍两段文案执行时向用户确认后可调：

```tsx
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: '关于',
  description: '关于 Devline 与它的作者',
  alternates: { canonical: '/about' },
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
```

- [ ] **Step 2: StatsDashboard 客户端组件**

创建 `apps/web/src/components/StatsDashboard.tsx`（§5 /stats 规格：累计 PV/UV、近 30 天趋势纯 SVG、文章浏览榜 Top 10 带轨道标记；图表颜色走 token；「当前在线粗略数」无公开端点，v1 以「今日 PV」呈现——见计划末尾人工确认清单）：

```tsx
'use client';

import { useEffect, useState } from 'react';

const GC = 'https://stats.qingverse.com';

type ArticleRef = { path: string; title: string; track: 'deep' | 'intro' };
type Counter = { count: string; count_unique: string };

function parseCount(c: string | undefined): number {
  return parseInt((c ?? '0').replace(/[^\d]/g, ''), 10) || 0;
}

async function fetchCounter(pagePath: string, query = ''): Promise<Counter | null> {
  try {
    const res = await fetch(`${GC}/counter/${pagePath}.json${query}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Counter;
  } catch {
    return null;
  }
}

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

type StatsState =
  | { status: 'loading' }
  | { status: 'down' }
  | {
      status: 'ok';
      totalPV: number;
      totalUV: number;
      todayPV: number;
      trend: { date: string; pv: number }[];
      top: { title: string; track: 'deep' | 'intro'; pv: number }[];
    };

export function StatsDashboard({ articles }: { articles: ArticleRef[] }) {
  const [state, setState] = useState<StatsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const total = await fetchCounter('TOTAL');
      if (!total) {
        // §5：statsAPI 失败时不破版式，优雅降级
        if (!cancelled) setState({ status: 'down' });
        return;
      }
      const today = isoDaysAgo(0);
      const [todayC, trend, top] = await Promise.all([
        fetchCounter('TOTAL', `?start=${today}&end=${today}`),
        Promise.all(
          Array.from({ length: 30 }, (_, i) => {
            const d = isoDaysAgo(29 - i);
            return fetchCounter('TOTAL', `?start=${d}&end=${d}`).then((c) => ({
              date: d,
              pv: parseCount(c?.count),
            }));
          })
        ),
        Promise.all(
          articles.map((a) =>
            fetchCounter(a.path, '').then((c) => ({
              title: a.title,
              track: a.track,
              pv: parseCount(c?.count),
            }))
          )
        ),
      ]);
      if (cancelled) return;
      setState({
        status: 'ok',
        totalPV: parseCount(total.count),
        totalUV: parseCount(total.count_unique),
        todayPV: parseCount(todayC?.count),
        trend,
        top: top.sort((x, y) => y.pv - x.pv).slice(0, 10),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [articles]);

  if (state.status === 'loading') {
    return <div className="stats-down">统计加载中…</div>;
  }
  if (state.status === 'down') {
    return <div className="stats-down">统计服务暂不可用</div>;
  }

  const max = Math.max(1, ...state.trend.map((t) => t.pv));
  const BAR_W = 20; // 600 / 30 天

  return (
    <div>
      <div className="stats-grid">
        <div className="stats-card">
          <p className="stats-card-label">累计 PV</p>
          <p className="stats-card-value">{state.totalPV.toLocaleString()}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">累计 UV</p>
          <p className="stats-card-value">{state.totalUV.toLocaleString()}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">今日 PV</p>
          <p className="stats-card-value">{state.todayPV.toLocaleString()}</p>
        </div>
      </div>
      <div className="stats-chart">
        <p className="section-label">近 30 天访问</p>
        {/* §5：纯 SVG，不引图表库；颜色走 token */}
        <svg viewBox="0 0 600 140" role="img" aria-label="近 30 天每日 PV 柱状图">
          {state.trend.map((t, i) => {
            const h = Math.round((t.pv / max) * 110);
            return (
              <rect
                key={t.date}
                x={i * BAR_W + 3}
                y={124 - Math.max(h, 1)}
                width={BAR_W - 6}
                height={Math.max(h, 1)}
                fill="rgb(var(--c-accent))"
              />
            );
          })}
          <line x1="0" y1="125" x2="600" y2="125" stroke="rgb(var(--c-border))" strokeWidth="1" />
        </svg>
      </div>
      <div className="stats-top">
        <p className="section-label">文章浏览榜</p>
        <ol>
          {state.top.map((t) => (
            <li key={t.title}>
              <span className="track-dot" data-track={t.track} aria-hidden="true" />
              <span className="stats-top-title">{t.title}</span>
              <span className="article-card-meta">{t.pv.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: /stats 页（SSG 骨架）**

创建 `apps/web/src/app/stats/page.tsx`：

```tsx
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import { StatsDashboard } from '@/components/StatsDashboard';

export const metadata: Metadata = {
  title: '统计',
  description: 'Devline 流量统计：自托管 GoatCounter，无 cookie，不追踪个人',
  alternates: { canonical: '/stats' },
};

export default async function StatsPage() {
  const articles = await getAllArticles();
  return (
    <section className="container-devline list-page">
      <p className="section-label">流量统计</p>
      <h1 className="list-title">数据公开</h1>
      <p className="hero-sub">统计自托管（GoatCounter）、无 cookie、不追踪个人。</p>
      <StatsDashboard
        articles={articles.map((a) => ({
          path: `/articles/${a.track}/${a.slug}`,
          title: a.title,
          track: a.track,
        }))}
      />
    </section>
  );
}
```

- [ ] **Step 4: 追加 about/stats CSS**

在 `globals.css` 追加区之前追加：

```css
/* ---------- 关于页 ---------- */
.about-page {
  padding-block: 44px 64px;
}

.about-body {
  max-width: 680px;
  margin-top: 24px;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: rgb(var(--c-text));
}

.about-heading {
  margin: 44px 0 12px;
  font-family: var(--font-display);
  font-size: var(--fs-headline);
  font-weight: 800;
  color: rgb(var(--c-text));
}

.about-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
}

.about-stack li {
  font-size: var(--fs-meta);
  font-family: var(--font-meta);
  color: rgb(var(--c-text-3));
  border: 1px solid rgb(var(--c-border-2));
  padding: 4px 10px;
}

.about-contact {
  list-style: none;
  padding: 0;
}

.about-contact li a {
  display: inline-block;
  padding-block: 10px; /* 热区 ≥44px */
  color: rgb(var(--c-accent-text));
}

/* ---------- 统计页（§5 /stats：骨架 SSG，降级不破版式） ---------- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;
  max-width: 856px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  border: 1px solid rgb(var(--c-border));
  background: rgb(var(--c-surface));
  padding: 16px 20px;
  min-height: 92px;
}

.stats-card-label {
  font-family: var(--font-meta);
  font-size: var(--fs-meta);
  color: rgb(var(--c-text-3));
}

.stats-card-value {
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: var(--fs-headline);
  font-weight: 800;
  color: rgb(var(--c-text));
}

.stats-chart {
  margin-top: 44px;
  max-width: 856px;
}

.stats-chart svg {
  width: 100%;
  height: auto;
  margin-top: 12px;
}

.stats-top {
  margin-top: 44px;
  max-width: 856px;
}

.stats-top ol {
  list-style: none;
  margin-top: 12px;
  padding: 0;
}

.stats-top li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border-bottom: 1px solid rgb(var(--c-border-2));
  font-size: var(--fs-sub);
  color: rgb(var(--c-text));
}

.stats-top-title {
  flex: 1;
}

.track-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.track-dot[data-track='deep'] {
  background: rgb(var(--c-track-deep));
}

.track-dot[data-track='intro'] {
  background: rgb(var(--c-track-intro));
}

.stats-down {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px; /* 固定高度：加载/降级/正常三态不跳版 */
  margin-top: 24px;
  max-width: 856px;
  border: 1.5px dashed rgb(var(--c-border));
  color: rgb(var(--c-text-3));
  font-size: var(--fs-sub);
}
```

- [ ] **Step 5: 验证（本地 GoatCounter 未部署 = 天然降级路径实测）**

```bash
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/about | grep -c "mailto:"
curl -s http://localhost:3000/about | grep -c "情长" || echo ABOUT-CLEAN
curl -s http://localhost:3000/stats | grep -c "数据公开"
kill %1
```

期望输出：`1`；`ABOUT-CLEAN`；`1`。浏览器打开 `/stats`：先显示「统计加载中…」，因 stats.qingverse.com 尚未部署（阶段四），数秒后落到「统计服务暂不可用」且版式完整——这正是 §8 要求的降级路径，三主题各截一张。

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/about/page.tsx apps/web/src/app/stats \
  apps/web/src/components/StatsDashboard.tsx apps/web/src/styles/globals.css
git commit -m "feat(page): 关于页重写 + /stats 统计页（GoatCounter 客户端取数/优雅降级）"
```

**验收标准**：Step 5 断言通过；/stats 降级态三主题截图；数据正常态验收挂账到阶段四 GoatCounter 部署后（§8 统计链路）。

---

### Task 18: SEO 资产（OG 图脚本 / icon 套件 / feed.xml / sitemap / robots / verification）

**Files:**
- Create: `scripts/generate-brand-assets.mjs`
- Create: `apps/web/src/app/icon.svg`
- Create: `apps/web/src/app/opengraph-image.png`（脚本生成后提交）
- Create: `apps/web/src/app/apple-icon.png`（脚本生成）
- Modify: `apps/web/src/app/favicon.ico`（脚本重新生成覆盖）
- Create: `apps/web/src/app/feed.xml/route.ts`
- Modify: `apps/web/src/app/sitemap.ts:1-27`（整体重写，摘掉 `@/lib/api` 依赖——§6 metadata 条目 2）
- Modify: `apps/web/src/app/robots.ts:1-13`（去 localhost fallback——§6 metadata 条目 1）
- Modify: `apps/web/src/app/layout.tsx`（metadata 追加 verification）

**Interfaces:**
- Consumes: `getAllArticles`（Task 3）、`SITE`（Task 9）、sharp/png-to-ico（Task 1）
- Produces: `/opengraph-image.png`（1200×630 ≤150KB，Next 约定式自动注入 og:image/twitter:image——§5.1 条目 1）；`/icon.svg`（内嵌 prefers-color-scheme——条目 2）；`/feed.xml`（RSS 2.0 单一全站 feed，`<category>` 标注轨道——§5.1 条目 4）；sitemap/robots 从 MDX 文件系统枚举、域名兜底硬编码

- [ ] **Step 1: 品牌资产生成脚本**

创建 `scripts/generate-brand-assets.mjs`（双线视觉母体 = duo 主题 D1 值：底 #FDFBFC、墨线 #17141A、粉线 #EC5A87；脚本在 `scripts/` 下，不受组件层 hex 禁令约束）：

```js
// 生成 OG 图（1200×630）、apple-icon（180）、favicon.ico（32）——双线视觉母体（§5.1）
// 用法：node scripts/generate-brand-assets.mjs（仓库根执行）
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const appDir = path.join(process.cwd(), 'apps', 'web', 'src', 'app');

const OG_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FDFBFC"/>
  <rect x="0" y="380" width="1200" height="12" fill="#17141A"/>
  <rect x="0" y="420" width="1200" height="12" fill="#EC5A87"/>
  <text x="96" y="280" font-family="PingFang SC, Hiragino Sans GB, Helvetica, Arial, sans-serif"
    font-size="128" font-weight="800" fill="#17141A">Devline</text>
  <text x="98" y="540" font-family="PingFang SC, Hiragino Sans GB, Helvetica, Arial, sans-serif"
    font-size="44" fill="#5C525A">一条线给工程师，一条线给所有人</text>
</svg>`;

const ICON_SVG = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FDFBFC"/>
  <rect x="${size * 0.125}" y="${size * 0.42}" width="${size * 0.75}" height="${size * 0.09}" rx="${size * 0.045}" fill="#17141A"/>
  <rect x="${size * 0.125}" y="${size * 0.6}" width="${size * 0.75}" height="${size * 0.09}" rx="${size * 0.045}" fill="#EC5A87"/>
</svg>`;

await sharp(Buffer.from(OG_SVG))
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(appDir, 'opengraph-image.png'));

await sharp(Buffer.from(ICON_SVG(180)))
  .png()
  .toFile(path.join(appDir, 'apple-icon.png'));

const png32 = await sharp(Buffer.from(ICON_SVG(32))).png().toBuffer();
fs.writeFileSync(path.join(appDir, 'favicon.ico'), await pngToIco(png32));

const ogSize = fs.statSync(path.join(appDir, 'opengraph-image.png')).size;
console.log(`opengraph-image.png: ${(ogSize / 1024).toFixed(1)}KB（预算 150KB）`);
if (ogSize > 150 * 1024) {
  console.error('OG 图超出 §5.1 体积预算');
  process.exit(1);
}
console.log('brand assets OK');
```

- [ ] **Step 2: 运行脚本并验证**

```bash
node scripts/generate-brand-assets.mjs
node -e "
const fs = require('fs');
const og = fs.statSync('apps/web/src/app/opengraph-image.png').size;
const ai = fs.statSync('apps/web/src/app/apple-icon.png').size;
const fi = fs.statSync('apps/web/src/app/favicon.ico').size;
console.log('og', og, 'apple', ai, 'ico', fi);
if (og > 153600 || og < 1000 || ai < 500 || fi < 500) process.exit(1);
console.log('ASSETS-OK');
"
```

期望输出：`opengraph-image.png: xx.xKB（预算 150KB）`、`brand assets OK`、`ASSETS-OK`。用预览打开 OG 图目检：白底、Devline 大字、墨/粉双线、副文案。

- [ ] **Step 3: 手写 icon.svg（暗色标签栏适配）**

创建 `apps/web/src/app/icon.svg`（§5.1 条目 2：SVG 内嵌 prefers-color-scheme media；色值为 duo/night 品牌固定值，SVG 资产不属组件层）：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    .ink { fill: #17141A; }
    @media (prefers-color-scheme: dark) {
      .ink { fill: #F4EDF2; }
    }
  </style>
  <rect class="ink" x="8" y="27" width="48" height="6" rx="3"/>
  <rect x="8" y="39" width="48" height="6" rx="3" fill="#EC5A87"/>
</svg>
```

- [ ] **Step 4: feed.xml route handler**

创建 `apps/web/src/app/feed.xml/route.ts`（§5.1 条目 4：RSS 2.0 单一全站 feed、两轨都进、`<category>` 标注、条目输出 summary + 链接、`force-static` 构建期生成）：

```ts
import { getAllArticles } from '@/lib/content';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const articles = await getAllArticles();
  const items = articles
    .map((a) => {
      const url = `${SITE.url}/articles/${a.track}/${a.slug}`;
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${a.track}</category>
      <description>${esc(a.summary)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${esc(SITE.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
```

- [ ] **Step 5: 重写 sitemap.ts 与 robots.ts**

用以下内容完整替换 `apps/web/src/app/sitemap.ts`（现第 1–27 行；数据源从 `@/lib/api` 改为本地 MDX 枚举，fallback 从 `localhost:3000` 改为硬编码生产域——§6 metadata 条目 1/2）：

```ts
import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';
import { SITE } from '@/lib/site';

const STATIC_PATHS = ['/', '/articles', '/articles/deep', '/articles/intro', '/projects', '/about', '/stats'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE.url}${p === '/' ? '' : p}` || SITE.url,
    lastModified: new Date(),
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/articles/${a.track}/${a.slug}`,
    lastModified: new Date(a.date),
  }));

  return [...staticPages, ...articlePages];
}
```

用以下内容完整替换 `apps/web/src/app/robots.ts`（现第 1–13 行）：

```ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

> `SITE.url` 的定义（Task 9 site.ts）即「硬编码 `https://qingverse.com` 兜底、`NEXT_PUBLIC_SITE_URL` 仅覆盖」，机制上杜绝 localhost 进 sitemap（§6）。

- [ ] **Step 6: layout 追加站点验证 meta**

修改 `apps/web/src/app/layout.tsx` 的 `metadata` 对象，在 `twitter` 字段后追加（§6 metadata 条目 6；验证码在阶段四上线清单里从 GSC/Bing 获取后配到部署环境变量，未配置时不输出任何 meta）：

```ts
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
```

- [ ] **Step 7: 构建断言**

```bash
npm --prefix apps/web run build
npm --prefix apps/web run dev &
sleep 8
curl -s http://localhost:3000/feed.xml > /tmp/devline-feed.xml
node -e "
const xml = require('fs').readFileSync('/tmp/devline-feed.xml', 'utf8');
const assert = require('assert');
assert.match(xml, /<rss version=\"2.0\">/);
assert.match(xml, /<category>deep<\/category>/);
assert.match(xml, /<category>intro<\/category>/);
assert.match(xml, /https:\/\/qingverse\.com\/articles\/deep\/hello-deep/);
assert.ok(!xml.includes('localhost'), 'feed 出现 localhost');
console.log('FEED-OK');
"
curl -s http://localhost:3000/sitemap.xml | grep -o "<loc>" | wc -l
curl -s http://localhost:3000/sitemap.xml | grep "localhost"; test $? -eq 1 && echo SITEMAP-NO-LOCALHOST
curl -s http://localhost:3000/robots.txt | grep "Sitemap"
curl -s http://localhost:3000/ | grep -o 'property="og:image" content="[^"]*opengraph-image[^"]*"' | head -1
kill %1
```

期望输出：`FEED-OK`；sitemap `<loc>` 计数 = 10（7 静态页 + 3 篇已发布夹具）；`SITEMAP-NO-LOCALHOST`；`Sitemap: https://qingverse.com/sitemap.xml`；og:image 指向绝对 URL 的 opengraph-image。

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-brand-assets.mjs apps/web/src/app/icon.svg \
  apps/web/src/app/opengraph-image.png apps/web/src/app/apple-icon.png \
  apps/web/src/app/favicon.ico apps/web/src/app/feed.xml \
  apps/web/src/app/sitemap.ts apps/web/src/app/robots.ts apps/web/src/app/layout.tsx
git commit -m "feat(seo): OG 图/icon 套件/feed.xml/sitemap/robots 重写 + verification meta"
```

**验收标准**：Step 2 与 Step 7 全部断言通过；OG 图 ≤150KB 且目检为双线母体。

---

### Task 19: 删除旧前台 + 依赖清理 + Dockerfile 修正 + CSS size check 进 CI

**Files:**
- Delete: `apps/web/src/app/{posts,notes,murmurs,interview-questions,interview-experiences,internship-records,categories,api}/`、`apps/web/src/components/{layout,post,ui}/`、`apps/web/src/lib/{api.ts,markdown.ts,utils.ts}`、`apps/web/src/types/index.ts`、`apps/web/src/app/favicon1.ico`、`apps/web/public/og-image.jpg`
- Modify: `apps/web/package.json`（依赖清理，由 npm 命令改写）
- Modify: `package.json:7-13`（根 scripts：dev 简化，去 npm-run-all）
- Modify: `apps/web/tsconfig.json:19`（删除阶段二遗留确认；若阶段二已删则跳过）
- Modify: `apps/web/Dockerfile`（build 阶段：content 收窄 + scripts 拷贝；runtime：去 content COPY；删除 API base build-arg）
- Create: `scripts/check-css-size.mjs`
- Modify: `.github/workflows/deploy.yml`（checks job 追加三个门禁 step）

**Interfaces:**
- Consumes: Task 7–18 的全部新页面（保证删除后无残余引用）；`scripts/check-no-raw-hex.mjs`（Task 10）
- Produces: 组件层零裸 hex（hex 脚本转绿）；§6 依赖清理清单落地；CI 门禁 = lint + tsc + build + CSS size + no-raw-hex + 品牌词断言；Dockerfile 与「运行时不再读 content」对齐（§6 图片链路）

- [ ] **Step 1: 删除前引用审计**

```bash
grep -rln "@/lib/api\|@/lib/markdown\|@/lib/utils\|@/components/ui\|@/components/layout\|@/components/post\|@/types" apps/web/src | sort
```

期望输出：列出的文件**全部**位于即将删除的目录（`app/posts/`、`app/notes/`、`app/murmurs/`、`app/interview-*`、`app/internship-records/`、`app/categories/`、`components/{ui,layout,post}/`）。若任何新建文件（`app/{articles,projects,stats,dev}/`、`app/page.tsx`、`app/about/page.tsx`、`app/layout.tsx`、`components/{Site,Rail,Article,Headline,Theme,Mobile,Project,Toc,Stats,Track}*`）出现在结果里，先修掉引用再继续。

- [ ] **Step 2: ⚠️ 等待用户确认后才可执行——批量删除旧前台**

向用户出示以下完整删除清单并等确认（均已被新页面替代或按 §6 判死；git 历史可恢复，但属大范围删除）：8 个旧路由目录、3 个旧组件目录、3 个旧 lib 文件、旧类型文件、`favicon1.ico`、`public/og-image.jpg`。确认后执行：

```bash
git rm -r apps/web/src/app/posts apps/web/src/app/notes apps/web/src/app/murmurs \
  apps/web/src/app/interview-questions apps/web/src/app/interview-experiences \
  apps/web/src/app/internship-records apps/web/src/app/categories apps/web/src/app/api
git rm -r apps/web/src/components/layout apps/web/src/components/post apps/web/src/components/ui
git rm apps/web/src/lib/api.ts apps/web/src/lib/markdown.ts apps/web/src/lib/utils.ts \
  apps/web/src/types/index.ts
git rm apps/web/src/app/favicon1.ico apps/web/public/og-image.jpg
```

期望输出：git rm 全部成功。保留项（明确不删）：`apps/web/src/types/css.d.ts`（CSS 模块声明）、`apps/web/public/beian-gongan.png`（页脚备案在用）、`apps/web/public/avatar.jpg`（暂留，是否弃用见人工确认清单）。

- [ ] **Step 3: 依赖清理（§6 清单 + 随 markdown.ts 死亡的管线依赖）**

```bash
# npm-run-all 在两处都有依赖（root package.json:35 与 apps/web/package.json:41），两处都要删
npm uninstall -w apps/web framer-motion next-seo next-sitemap next-themes \
  rehype-raw rehype-stringify remark remark-frontmatter remark-html remark-parse \
  remark-rehype unified clsx tailwind-merge npm-run-all
npm uninstall npm-run-all
grep -c "remark-gfm\|gray-matter" apps/web/package.json
grep -c "npm-run-all" package.json apps/web/package.json
```

期望输出：卸载成功；第一条 grep 输出 `2`（remark-gfm 与 gray-matter 是新管线依赖，必须还在）；第二条 grep 两个文件均输出 `0`（npm-run-all 在根与 apps/web 都已移除，落实 §6 依赖清理）。

- [ ] **Step 4: 根 package.json scripts 简化（§6：随 API 退役 dev 归一）**

修改根 `package.json` scripts 块（现第 7–13 行附近），把

```json
    "dev:api": "make -C apps/api dev",
    "dev": "npm-run-all -p dev:web dev:api",
```

替换为

```json
    "dev": "npm run dev:web",
```

（`dev:web`/`build:web`/`start:web`/`fix:frontmatter*` 保留不动。）

- [ ] **Step 5: Dockerfile 对齐（§6 图片链路：运行时镜像不再 COPY content）**

修改 `apps/web/Dockerfile`：

1. build 阶段，把

```dockerfile
# 3. 拷贝仓库根目录下的 content 目录（你之前已经有用到它）
COPY content/ ./content/

# 4. 通过 build-arg 传入对外 API 地址（默认生产）
ARG NEXT_PUBLIC_API_BASE_URL=https://qingverse.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
```

替换为

```dockerfile
# 3. 构建期只需要新内容目录（prebuild 拷贝图片 + SSG 编译 MDX）
COPY content/articles/ ./content/articles/

# 3.1 prebuild 脚本（package.json 里以 ../../scripts/ 引用，从 /app 解析为 /scripts/）
COPY scripts/copy-article-assets.mjs /scripts/copy-article-assets.mjs
```

2. runtime 阶段，删除以下两行（全静态生成后运行时不读 content——§6）：

```dockerfile
# 运行期如果还需要 content（例如你动态读 markdown 写文章页面）
COPY --from=build /app/content ./content
```

- [ ] **Step 6: 全量回归（tsc/lint/test/build/hex 转绿/品牌词）**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsc --noEmit && npm run lint && cd /Users/abble/my-learning-record
npx tsx --test apps/web/tests/*.test.ts
npm --prefix apps/web run build
node scripts/check-no-raw-hex.mjs
grep -rln "情长" apps/web/src apps/web/.next/server/app 2>/dev/null || echo QINGCHANG-CLEAN
```

期望输出：tsc/lint 零报错；测试全绿；build 成功；`check-no-raw-hex: OK（组件层无裸 hex）`（保持全绿）；`QINGCHANG-CLEAN`。

- [ ] **Step 7: CSS size check 脚本**

创建 `scripts/check-css-size.mjs`（§6 体积预算：全站 CSS gzip ≤ 50KB）：

```js
// §6：三主题编进同一份 CSS，全站 CSS gzip ≤ 50KB，CI build 门禁附带 size check
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const cssDir = path.join(process.cwd(), 'apps', 'web', '.next', 'static');
const LIMIT = 50 * 1024;

if (!fs.existsSync(cssDir)) {
  console.error('check-css-size: 未找到 apps/web/.next/static，先执行 next build');
  process.exit(1);
}

let total = 0;
const rows = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith('.css')) {
      const gz = gzipSync(fs.readFileSync(full)).length;
      total += gz;
      rows.push(`  ${path.relative(cssDir, full)}  ${(gz / 1024).toFixed(1)}KB gzip`);
    }
  }
}

walk(cssDir);
console.log(rows.join('\n'));
console.log(`check-css-size: 合计 ${(total / 1024).toFixed(1)}KB gzip（预算 ${LIMIT / 1024}KB）`);
if (total > LIMIT) {
  console.error('CSS 超出 §6 体积预算');
  process.exit(1);
}
```

```bash
node scripts/check-css-size.mjs
```

期望输出：逐文件清单 + `check-css-size: 合计 xx.xKB gzip（预算 50KB）`，退出码 0。

> **规格 §6 体积预算的显式偏差（须记入阶段交付说明，待用户认可）**：§6 有两个体积数——「全站 CSS gzip ≤ 50KB」（总量）与「三主题增量（token 块 + 装饰规则）合计 ≤ 10KB gzip」（子指标）。本脚本只对**总量 50KB** 做机器断言；**10KB 主题增量子指标不做独立机器断言**，理由是三主题 token 块与装饰规则在最终 bundle 里与基础样式交织、无稳定锚点可精确切分测量，强行切分反而引入脆弱断言。以 50KB 总量作兜底（三主题全部编进这一份 CSS，总量达标即隐含增量受控）。此偏差在 Task 20 交付说明「规格偏差」栏点名，请用户认可；若用户坚持要 10KB 断言，再改为「按 tokens.css 文件单独 gzip + globals.css 中 `[data-theme=]` 规则块注释锚点切分统计」的增强版。

- [ ] **Step 8: CI 门禁追加（阶段二 checks job 之后插三个 step）**

修改 `.github/workflows/deploy.yml` 的 `checks` job（阶段二 Task 6 插入；行号以实际为准），在其最后一个 step `- name: Build`（`run: npm run build:web`）之后追加：

```yaml
      - name: CSS size check
        run: node scripts/check-css-size.mjs

      - name: No raw hex in components
        run: node scripts/check-no-raw-hex.mjs

      - name: Brand ban check
        run: |
          if grep -rl "情长" apps/web/src apps/web/.next/server/app 2>/dev/null; then
            echo "构建产物或源码出现禁用品牌词"; exit 1
          fi
          echo "brand ban check OK"
```

```bash
npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo YAML-OK
grep -c "check-css-size\|check-no-raw-hex\|Brand ban" .github/workflows/deploy.yml
```

期望输出：`YAML-OK`；`3`。（这些 step 在本分支不会跑——deploy.yml 只监听 main push；它们随阶段四合并切流时生效。）

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(web): 删除旧前台与 Go API 依赖链 + 依赖清理 + Dockerfile 收窄 + CI 增 CSS size/hex/品牌词门禁"
```

**验收标准**：Step 6 全链绿 + hex 脚本退出码 0 + `node scripts/check-css-size.mjs` 退出码 0 + deploy.yml YAML 合法；`ls apps/web/src/app` 只剩 `about articles dev feed.xml layout.tsx not-found.tsx page.tsx projects robots.ts sitemap.ts stats icon.svg favicon.ico opengraph-image.png apple-icon.png`（外加 `.next` 类型产物无关项）。

---

### Task 20: 阶段整体验收（生产模式全站矩阵）

**Files:**
- 无新文件；只跑验证与截图

**Interfaces:**
- Consumes: Task 1–19 全部产出
- Produces: 阶段三验收记录（截图 + 断言输出），作为阶段四切流的前置条件

- [ ] **Step 0: ⚠️ 等待用户确认后才可执行——夹具文章处置决策（决定线上首发内容）**

Task 2 造的三篇夹具（`hello-deep`、`hello-intro`、`context-engineering`，均 `draft: false`）若原样保留，会随阶段四切流成为 Devline **线上首发文章**，进入 RSS/sitemap/GSC 提交与首页头条榜。这不该由计划默默决定。向用户三选一：

- **A 保留上线**：夹具即首发内容（占位性质，接受）——阶段四 Task 9/10 的文章断言维持现状（断言存在文章卡与详情页）。
- **B 全部置 `draft: true`**：切流时线上无文章、两轨道走空态（EmptyTrackNotice）——则本 Task 后续步骤与阶段四 Task 9/10 的「文章卡/详情页 200」断言改为「首页两轨道空态文案渲染、/articles 空列表、/articles/deep|intro 空态」。
- **C 换成用户真实首发文**：用户提供 1–N 篇真实文章走阶段四发文流程（publish-article 系统）替换夹具。

记录用户选择；若选 B/C，同步在阶段四 Task 7 切流确认清单（已含「夹具文章处置已按 phase3 Task 20 决定执行」一条）勾对，并按选择调整下方 Step 2 的路由期望（夹具详情路由在 B 下应为 404 或空态）。

- [ ] **Step 1: 全套自动化检查一遍过**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsc --noEmit && npm run lint && cd /Users/abble/my-learning-record
npx tsx --test apps/web/tests/*.test.ts
npm --prefix apps/web run build
node scripts/check-no-raw-hex.mjs && node scripts/check-css-size.mjs
grep -rln "情长" apps/web/src apps/web/.next/server/app 2>/dev/null || echo QINGCHANG-CLEAN
grep -rl "fonts.googleapis\|fonts.gstatic" apps/web/.next/static apps/web/src/styles 2>/dev/null || echo NO-GOOGLE-CDN-OK
```

期望输出：全部零报错；`QINGCHANG-CLEAN`；`NO-GOOGLE-CDN-OK`（Noto Serif SC 已自托管，产物无 Google Fonts 域名——D3/§8）。

- [ ] **Step 2: 生产模式启动 + 全路由矩阵**

```bash
npm --prefix apps/web run start &
sleep 5
for p in / /articles /articles/deep /articles/intro /articles/deep/hello-deep \
  /articles/intro/hello-intro /projects /about /stats /feed.xml /sitemap.xml /robots.txt; do
  curl -s -o /dev/null -w "%{http_code}  $p\n" "http://localhost:3000$p"
done
curl -s -o /dev/null -w "%{http_code}  /dev/themes（生产应 404）\n" http://localhost:3000/dev/themes
curl -s -o /dev/null -w "%{http_code}  /posts/old-url（应 404）\n" http://localhost:3000/posts/old-url
curl -s http://localhost:3000/ | grep -c "data-goatcounter"
lsof -ti:3000 | xargs kill
```

期望输出：12 条路由全部 `200`；`/dev/themes` = `404`（§4：生产 notFound）；`/posts/old-url` = `404`（品牌化 404 页，Caddy 410 属阶段四）；`data-goatcounter` 计数 `1`（生产模式注入 count.js）。

- [ ] **Step 3: MCP Playwright 实测（主题/轨道/键盘/字体）**

用 MCP Playwright 打开 `http://localhost:3000/`（`npm --prefix apps/web run start` 保持运行），逐项验证并截图：

1. **主题切换与持久化**：点主题按钮 → 面板出现三选项（radiogroup）→ 选「夜航」→ 页面即时变暗、`document.documentElement.dataset.theme === 'night'`、`localStorage['devline-theme'] === 'night'` → 刷新页面 → 仍是夜航且无闪白（防闪烁脚本生效）。
2. **prefers-color-scheme**：`localStorage.clear()` 后以 `colorScheme: 'dark'` 上下文重开首页 → `dataset.theme === 'night'`。
3. **rail-tab**：点「科普线」→ `html[data-track='intro']`、deep 面板隐藏、intro 面板带 stagger 入场、`localStorage['devline-track'] === 'intro'`；键盘：Tab 聚焦到选中 pill → ↑/↓ 在两轨间移动并自动激活 → focus ring 可见（截图）。
4. **字体请求断言（D3/§8）**：清缓存后加载首页（duo），network 里 **0 个** woff2/字体请求；切到「编辑刊」→ 出现 `/_next/static/media/*.woff2` 分片请求（切片管线生效）。
5. **截图矩阵（本地版）**：六类页面（/、/articles、/articles/deep/hello-deep、/projects、/about、/stats）× 3 主题 × 2 视口（1280 / 375），共 36 张存档；404 页与（临时把两篇夹具 draft 置 true 后 dev 模式下的）两轨空态补 8 张。完整线上矩阵在阶段四切流后按 §8 重跑。

- [ ] **Step 4: 对比度抽查（D2/D7）**

```bash
node -e "
// WCAG 相对亮度对比度抽查：D1 关键组合（AA 修正值）
function lum(hex) {
  const c = hex.match(/[0-9a-f]{2}/gi).map((v) => {
    const n = parseInt(v, 16) / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const checks = [
  ['duo text-3 on bg', '7A6E76', 'FDFBFC', 4.5],
  ['duo accent-text on bg', 'C63A64', 'FDFBFC', 4.5],
  ['duo on-accent on accent-strong', 'FFFFFF', 'C63A64', 4.5],
  ['editorial text-3 on bg', '756770', 'FAF6F3', 4.5],
  ['editorial accent-text on bg', 'C2255C', 'FAF6F3', 4.5],
  ['night text-3 on bg', '948A9B', '171219', 4.5],
  ['night accent-text on bg', 'F2769F', '171219', 4.5],
  ['night on-accent on accent', '171219', 'F2769F', 4.5],
  ['duo rail deep outline on bg', '8A7E86', 'FDFBFC', 3],
];
let fail = 0;
for (const [name, fg, bg, min] of checks) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  ' + r.toFixed(2) + ':1（≥' + min + '）');
}
process.exit(fail ? 1 : 0);
"
```

期望输出：9 行全 `PASS`，退出码 0。

- [ ] **Step 5: 阶段收尾**

```bash
git log --oneline main..redesign/devline | head -30
git status --short
```

期望输出：本阶段全部 commit 列表；工作区干净。**明确不做**：不合入 main、不 push 部署（deploy.yml 监听 main，合并与切流属阶段四——§7 步骤 4/5）。把 Step 3 的截图目录路径与本验收输出记入交付说明。

**验收标准**：Step 1–4 全部命令按期望输出通过；截图矩阵存档；分支未合 main。

---

## 阶段整体验收（对照 §8 可在本阶段完成的部分)

```bash
cd /Users/abble/my-learning-record
npx tsx --test apps/web/tests/*.test.ts          # 内容管线/token/RailTab 测试全绿
npm --prefix apps/web run build                   # SSG 构建成功，无 force-dynamic
node scripts/check-no-raw-hex.mjs                 # 组件层零裸 hex（D1）
node scripts/check-css-size.mjs                   # CSS gzip ≤ 50KB（§6）
grep -rln "情长" apps/web/src || echo CLEAN       # 品牌词清零（§2/§8）
```

线上项（Lighthouse ≥90、410 规则、GoatCounter 真数据、GSC 提交）按 §8 属阶段四切流后验收。

## 执行时需人工确认清单

1. **site.ts 联系方式**（Task 9）：展示邮箱与小红书主页 URL 是默认值，执行时向用户确认真实值。
2. **项目文案事实性**（Task 13）：PROJECTS 三段「问题→方案→结果」为默认稿，逐条向用户核实（尤其 Memory System / SystemWright 的结果表述）。
3. **关于页个人介绍**（Task 17）：两段自述为默认稿，需用户过目。
4. **页脚备案行**（Task 9 规格补充）：规格 §5 页脚清单未含 ICP/公安备案，但大陆服务器为法定义务，本计划按旧站现值保留——请用户确认保留口径（或确认域名切换后的备案变更计划）。
5. **GoatCounter 公开端点能力**（Task 17）：`/counter/<path>.json` 为官方公开计数端点；「近 30 天趋势」以 30 次逐日请求实现、「当前在线」以「今日 PV」替代（无公开实时端点）。若阶段四部署后实测端点不可用或希望更精细数据，改用 GoatCounter API token 方案另行迭代。
6. **rail-tab 退场动效**（Task 12）：D6 的旧列表 150ms 退场在「§5 纯 CSS + display 切换」机制下不可实现，本计划保留完整入场动效（250ms + stagger 40ms）、退场即时；如需退场动效须放宽 §5 的「React 只改属性」约束，需用户拍板。
7. **shiki 主题名**（Task 4）：`github-light` / `rose-pine-moon` 为 §6 给出的初值，「具体主题名实施阶段随 frontend-design 定」——frontend-design 打磨时可换，换后跑 Task 4 测试回归。
8. **public/avatar.jpg**：新站未引用（关于页 v1 纯文本），暂留仓库；是否删除或在关于页启用照片，请用户定。
9. **Dockerfile 变更验证**（Task 19）：本阶段只做静态修改 + 本地构建验证；镜像级 `docker build` 全链验证随阶段四 CI 首次构建完成（若本机装有 Docker，可提前 `docker build -f apps/web/Dockerfile .` 自检）。
