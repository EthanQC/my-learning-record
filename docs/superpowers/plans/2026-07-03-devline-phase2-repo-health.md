# Devline 阶段二：仓库健康修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 摘掉 apps/web 的两处类型检查豁免、清零 eslint 12 error + 5 warning、Next 16.0.7 → 16.2.10 升级、CI 增加 lint/tsc/build 门禁，让仓库在阶段三前台重构前处于「检查全开、全绿」状态。

**Architecture:** 本阶段全部是修复性改动，**直接在 main 上做**（不开特性分支）：先删掉唯一被 `ignoreBuildErrors` 掩盖的类型错误来源（孤儿组件 ContactForm.tsx），再摘掉 tsconfig / next.config 的两个豁免开关；然后把 lint 脚本从已废弃的 `next lint` 切到 `eslint .` 并逐文件清零现存问题；最后升级 Next 并给 deploy.yml 加质量门禁 job。每个任务独立可验证、独立 commit，最后统一 push。

**Tech Stack:** Next.js 16（App Router, standalone output）、TypeScript 5 strict、ESLint 9 flat config（eslint-config-next）、npm workspaces（monorepo 根锁文件）、GitHub Actions、Docker（node:22-alpine 多阶段构建）。

## Global Constraints

- 规格 §6「仓库健康（一并修）」逐字要求：「删除 tsconfig 非法 `ignoreDeprecations`；关闭 `typescript.ignoreBuildErrors`（被掩盖的类型错误只有 ContactForm 一处，删组件即消）；lint 脚本从已废弃的 `next lint` 改为 `eslint .` 并清零现存 12 error / 5 warning；CI 增加 lint + tsc + build + CSS size check 门禁（现 CI 只构建不检查）」。其中 **CSS size check 依赖阶段三才创建的 tokens.css，本阶段只做 lint + tsc + build 三项门禁**，CSS size check 由阶段三计划（Task 19 Step 7–8：`scripts/check-css-size.mjs` 追加进本阶段建立的 checks job）补上。
- 规格 §6「前端」条：「Next 升级到 16.2.x（修 14 条安全公告）」——本计划取当前 16.2.x 最新稳定版 **16.2.10**（已查 npm dist-tags.latest = 16.2.10）。
- 规格 §7 步骤 3：「仓库健康修复（§6 末条）」——即本阶段；步骤 4 起才切到特性分支 `redesign/devline`，本阶段在 main。
- 规格 §7 步骤 4 分支策略警示适用范围外（本阶段改动均为修复性质，部署后线上行为不变），但 **deploy.yml 的路径过滤含 `.github/workflows/**` 与 `apps/web/**`，本阶段 push 到 main 必然触发一次线上部署**——push 前设确认检查点。
- 修 eslint error 的类型必须基于真实代码（api.ts 7 处 any、markdown.ts 5 处 any），不得改变任何导出函数签名与运行时行为（阶段四切流之前 Go API 链路仍在线上服役）。
- 验收硬标准：`npm run lint` 零 error 零 warning、`npx tsc --noEmit` 零 error、`npm run build:web` 成功且输出**不含** `Skipping validation of types` 字样、CI 全绿。

---

## 现状基线（2026-07-04 实测）

- `npx tsc --noEmit`（apps/web）当前唯一输出：`tsconfig.json(20,27): error TS5103: Invalid value for '--ignoreDeprecations'.`（tsconfig 里的值是 `"6.0"`，TS 5.x 不接受）。
- 摘掉 `ignoreDeprecations` 后 tsc 唯一报错：`src/components/ContactForm.tsx(4,10): error TS2305: Module '"@/lib/api"' has no exported member 'submitContact'.`——与规格断言一致，ContactForm 是唯一被掩盖的类型错误，且全仓库无任何文件 import 它（孤儿组件，91 行）。
- `npx eslint .`（apps/web）：17 problems（12 errors, 5 warnings），error 全部是 `@typescript-eslint/no-explicit-any`（api.ts 行 41/88/106×2/116/123×2 共 7 处；markdown.ts 行 74/75/86/87/120 共 5 处）；warning 为 postcss.config.mjs 匿名默认导出 1 处、categories/[name]/page.tsx 未用 Badge 1 处、notes/page.tsx 未用 getPosts + 未用 categories 2 处、Footer.tsx `<img>` 1 处。
- `npm run build:web` 当前成功，输出含 `Skipping validation of types`（因 `ignoreBuildErrors: true`）。
- 本计划中 api.ts / markdown.ts 的替换实现已预先用 `tsc --strict` 单文件编译 + `eslint` 验证通过（零报错）。

---

### Task 1: 摘掉类型检查豁免 + 删除孤儿 ContactForm

**Files:**
- Modify: `apps/web/tsconfig.json:20`（删除 `"ignoreDeprecations": "6.0",` 一行）
- Modify: `apps/web/next.config.ts:16-18`（删除 `typescript: { ignoreBuildErrors: true },` 块）
- Delete: `apps/web/src/components/ContactForm.tsx`（91 行孤儿组件，无任何 import 方）
- Test: 无单测文件；用 `npx tsc --noEmit` 与 `npm run build:web` 作可执行验证

**Interfaces:**
- Consumes: 现状 `apps/web/tsconfig.json`（`compilerOptions` 含非法 `ignoreDeprecations`）、`apps/web/next.config.ts`（含 `typescript.ignoreBuildErrors`）
- Produces: 类型检查全开的 tsconfig / next.config（后续所有任务的 `npx tsc --noEmit` 与 build 都依赖此状态）；`@/components/ContactForm` 模块不复存在（阶段三新前台不得再引用，规格 §5 关于页「不做表单——现有半成品 ContactForm 直接删除」）

- [ ] **Step 1: 记录失败基线——运行 tsc，确认当前报 TS5103**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsc --noEmit
```

Expected: 退出码非 0，输出恰为一行：
`tsconfig.json(20,27): error TS5103: Invalid value for '--ignoreDeprecations'.`

- [ ] **Step 2: 删除 tsconfig.json 的 ignoreDeprecations 行**

编辑 `apps/web/tsconfig.json`，删除第 20 行。改动前后对照（仅展示上下文）：

```json
    "jsx": "react-jsx",
    "incremental": true,
    "ignoreDeprecations": "6.0",
    "plugins": [
```

改为：

```json
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
```

- [ ] **Step 3: 再跑 tsc，确认被掩盖的错误正是 ContactForm**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsc --noEmit
```

Expected: 退出码非 0，输出恰为一行：
`src/components/ContactForm.tsx(4,10): error TS2305: Module '"@/lib/api"' has no exported member 'submitContact'.`

（这验证了规格 §6 的断言：被掩盖的类型错误只有 ContactForm 一处。若出现其他错误，停下来报告，不要继续。）

- [ ] **Step 4: ⚠️ 等待用户确认后才可执行——删除 ContactForm.tsx**

即将执行 `git rm`（删除文件属破坏性操作，虽然 git 可恢复）。确认理由：全仓库 `grep -rn "ContactForm" apps/web/src` 只命中该文件自身的定义行，无任何调用方；规格 §5 明确「不做表单——现有半成品 ContactForm 直接删除」。用户确认后执行：

```bash
cd /Users/abble/my-learning-record && git rm apps/web/src/components/ContactForm.tsx
```

Expected: `rm 'apps/web/src/components/ContactForm.tsx'`

- [ ] **Step 5: 跑 tsc，确认零错误**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsc --noEmit && echo "TSC_CLEAN"
```

Expected: 无任何 error 输出，最后一行 `TSC_CLEAN`

- [ ] **Step 6: 删除 next.config.ts 的 typescript.ignoreBuildErrors 块**

编辑 `apps/web/next.config.ts`，删除第 16–18 行整块。改动前：

```ts
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  // 图片优化
```

改后：

```ts
  output: 'standalone',

  // 图片优化
```

- [ ] **Step 7: build 回归，确认成功且不再跳过类型校验**

```bash
cd /Users/abble/my-learning-record && npm run build:web 2>&1 | tee /tmp/phase2-task1-build.log | tail -5
grep -c "Skipping validation of types" /tmp/phase2-task1-build.log || echo "NO_SKIP_FOUND"
```

Expected: build 成功（tail 输出含路由表，出现 `○  (Static)` / `ƒ  (Dynamic)` 图例行）；第二条命令输出 `0` 或 `NO_SKIP_FOUND`（grep -c 无匹配时退出码 1 走到 echo）。

- [ ] **Step 8: Commit**

```bash
cd /Users/abble/my-learning-record
git add apps/web/tsconfig.json apps/web/next.config.ts apps/web/src/components/ContactForm.tsx
git commit -m "fix(web): 摘掉 ignoreDeprecations/ignoreBuildErrors 豁免并删除孤儿 ContactForm"
```

**验收标准：** `cd apps/web && npx tsc --noEmit` 退出码 0；`npm run build:web` 成功且输出不含 `Skipping validation of types`；`ls apps/web/src/components/ContactForm.tsx` 报 No such file。

---

### Task 2: lint 脚本切换 eslint . + 清零 api.ts 的 7 处 any

**Files:**
- Modify: `apps/web/package.json:9`（`"lint": "next lint"` → `"lint": "eslint ."`）
- Modify: `apps/web/src/lib/api.ts:1-131`（整体替换，见 Step 3——改动点：新增 `FetchInit` 类型、删除全部 5 处 `as any` 断言、`fetchJSON<any>` 两处改 `fetchJSON<unknown>` + 类型收窄）
- Test: `npm run lint` 与 `npx tsc --noEmit` 作可执行验证

**Interfaces:**
- Consumes: Task 1 产出的「类型检查全开」状态（tsc 必须保持零错误）
- Produces: `apps/web/package.json` 的 `lint` 脚本 = `eslint .`（Task 6 的 CI job 依赖）；api.ts 导出签名**保持不变**：`export const API_BASE: string`、`export async function getStats(): Promise<Stats>`、`export async function getPosts(category?: string): Promise<PostMeta[]>`、`export async function getPost(slug: string): Promise<Post>`、`export async function getCategories(): Promise<Category[]>`，以及 `PostMeta` / `Post` / `Category` / `Stats` 四个 interface 原样保留（现有页面在阶段四前仍然消费它们）

- [ ] **Step 1: 修改 lint 脚本**

编辑 `apps/web/package.json` 第 9 行：

```json
    "lint": "next lint"
```

改为：

```json
    "lint": "eslint ."
```

- [ ] **Step 2: 记录失败基线——运行新 lint 脚本，确认 17 problems**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run lint
```

Expected: 退出码非 0，末尾统计行为 `✖ 17 problems (12 errors, 5 warnings)`（stderr 可能出现 `[baseline-browser-mapping] The data in this module is over two months old` 提示，无害，忽略）。

- [ ] **Step 3: 整体替换 api.ts**

用以下内容**整体替换** `apps/web/src/lib/api.ts`（该实现已预先通过 `tsc --strict` 与 eslint 验证）：

```ts
// apps/web/src/lib/api.ts

// --- 区分运行端：SSR(Node) vs 浏览器 ---
const isServer = typeof window === 'undefined';

// 把地址标准化为以 /api 结尾（避免 /api/api、尾部多 / 等问题）
function ensureApiBase(u?: string): string {
  if (!u) return '';
  const s = u.replace(/\/+$/, '');
  return s.endsWith('/api') ? s : `${s}/api`;
}

// 浏览器端走公网域名（Caddy 会反代到 API）
const clientOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL || // e.g. https://qingverse.com
  process.env.NEXT_PUBLIC_API_URL ||      // 兼容旧变量
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''); // 开发环境兜底到本地 API

// SSR/Node 端走容器内网（不出网，稳定快速）
const serverOrigin =
  process.env.INTERNAL_API_BASE_URL ||    // e.g. http://api:8080
  'http://api:8080';

export const API_BASE = isServer
  ? ensureApiBase(serverOrigin)           // => http://api:9000/api
  : ensureApiBase(clientOrigin);          // => https://qingverse.com/api

// Next.js 扩展的 fetch 选项（RequestInit + next 缓存配置）
type FetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

// 统一 JSON 请求（带超时）
async function fetchJSON<T>(
  url: string,
  init?: FetchInit,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      credentials: 'omit',
      signal: controller.signal,
      ...(init || {}),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

// ---------- 类型 ----------
export interface PostMeta {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  date: string;
  updated_at?: string;
  word_count?: number;
}

export interface Post extends PostMeta {
  content: string;
  updated_at: string;
}

export interface Category {
  name: string;
  label: string;
  count: number;
}

export interface Stats {
  total_posts: number;
  total_categories: number;
  last_update: string;
  recent_posts: PostMeta[];
}

// ---------- API 方法（带兜底） ----------

// 获取统计信息（失败/异常时返回安全默认值）
export async function getStats(): Promise<Stats> {
  try {
    return await fetchJSON<Stats>(`${API_BASE}/stats`, {
      next: { revalidate: 60 },
    });
  } catch {
    return {
      total_posts: 0,
      total_categories: 0,
      last_update: '',
      recent_posts: [],
    };
  }
}

// 获取文章列表（后端返回 null 时兜底为 []）
export async function getPosts(category?: string): Promise<PostMeta[]> {
  try {
    const url = category
      ? `${API_BASE}/posts?category=${encodeURIComponent(category)}`
      : `${API_BASE}/posts`;
    const data = await fetchJSON<unknown>(url, { next: { revalidate: 60 } });
    return Array.isArray(data) ? (data as PostMeta[]) : [];
  } catch {
    return [];
  }
}

// 获取文章详情（失败抛错；页面可根据需要再兜底）
export async function getPost(slug: string): Promise<Post> {
  return await fetchJSON<Post>(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
}

// 获取分类列表（后端返回 null 时兜底为 []）
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchJSON<unknown>(`${API_BASE}/categories`, {
      next: { revalidate: 60 },
    });
    return Array.isArray(data) ? (data as Category[]) : [];
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: 验证 api.ts 零 lint error、tsc 零错误**

```bash
cd /Users/abble/my-learning-record/apps/web && npx eslint src/lib/api.ts && echo "API_LINT_CLEAN" && npx tsc --noEmit && echo "TSC_CLEAN"
```

Expected: 无 error/warning 输出，依次打印 `API_LINT_CLEAN`、`TSC_CLEAN`

- [ ] **Step 5: 全量 lint 确认只剩 markdown.ts 的 5 error + 5 warning**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run lint
```

Expected: 退出码非 0，统计行 `✖ 10 problems (5 errors, 5 warnings)`，5 个 error 全部位于 `src/lib/markdown.ts`

- [ ] **Step 6: Commit**

```bash
cd /Users/abble/my-learning-record
git add apps/web/package.json apps/web/src/lib/api.ts
git commit -m "fix(web): lint 脚本切换 eslint . 并清零 api.ts 的 no-explicit-any"
```

**验收标准：** `npx eslint src/lib/api.ts` 零输出退出码 0；`npx tsc --noEmit` 退出码 0；`grep -c '"lint": "eslint ."' apps/web/package.json` 输出 `1`；`grep -c "any" apps/web/src/lib/api.ts` 输出 `0`。

---

### Task 3: 清零 markdown.ts 的 5 处 any

**Files:**
- Modify: `apps/web/src/lib/markdown.ts:1-139`（整体替换，见 Step 1——改动点：新增 `MdNode` 最小结构类型替代两处插件 transformer、两处 walk、一处 extractText 的 `any`；heading 深度判断补 `typeof node.depth === 'number'` 收窄）
- Test: `npm run lint`、`npx tsc --noEmit`、node 脚本断言渲染行为不变

**Interfaces:**
- Consumes: Task 2 产出的 `lint` 脚本（`eslint .`）
- Produces: markdown.ts 导出签名**保持不变**：`export interface HeadingItem { id: string; title: string; depth: number }`、`export async function renderMarkdown(markdown: string, slug?: string): Promise<{ html: string; headings: HeadingItem[] }>`（现有文章页在阶段四前仍然消费）

- [ ] **Step 1: 整体替换 markdown.ts**

用以下内容**整体替换** `apps/web/src/lib/markdown.ts`（该实现已预先通过 `tsc --strict` 与 eslint 验证；`transformImagePath`、`slugify`、标题收集逻辑与原文件逐行为同一逻辑，仅类型标注变化）：

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

export interface HeadingItem {
  id: string;
  title: string;
  depth: number;
}

// mdast 节点的最小结构类型（只声明本文件用到的字段）
interface MdNode {
  type: string;
  depth?: number;
  url?: string;
  value?: string;
  children?: MdNode[];
  data?: {
    hProperties?: Record<string, unknown>;
  };
}

// 图片路径转换函数
function transformImagePath(src: string, slug: string): string {
  // 如果是外部链接，直接返回
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // 如果是后端已处理的 /images/ 路径，转换为 /api/images/
  if (src.startsWith('/images/')) {
    return `/api${src}`;
  }

  // 如果是其他绝对路径，直接返回
  if (src.startsWith('/')) {
    return src;
  }

  // 获取文章所在目录路径
  const slugParts = slug.split('/');
  slugParts.pop(); // 移除文件名部分
  const basePath = slugParts.join('/');

  // 处理相对路径中的 ../ 和 ./
  let imagePath = src;
  if (src.startsWith('../')) {
    // 向上一级目录
    const pathParts = basePath.split('/');
    const srcParts = src.split('/');
    let upCount = 0;
    for (const part of srcParts) {
      if (part === '..') {
        upCount++;
      } else {
        break;
      }
    }
    pathParts.splice(-upCount);
    imagePath = [...pathParts, ...srcParts.slice(upCount)].join('/');
  } else if (src.startsWith('./')) {
    imagePath = `${basePath}/${src.slice(2)}`;
  } else {
    imagePath = `${basePath}/${src}`;
  }

  // 返回通过 API 访问的路径
  return `/api/images/${imagePath}`;
}

// 将 Markdown 渲染为 HTML，并提取 h1-h4 生成目录
export async function renderMarkdown(markdown: string, slug?: string): Promise<{
  html: string;
  headings: HeadingItem[];
}> {
  const headings: HeadingItem[] = [];
  const slugCount = new Map<string, number>();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // 转换图片路径
    .use(() => (tree: MdNode) => {
      const walk = (node: MdNode) => {
        if (node.type === 'image' && node.url && slug) {
          node.url = transformImagePath(node.url, slug);
        }
        if (node.children) {
          node.children.forEach(walk);
        }
      };
      walk(tree);
    })
    // 收集标题 & 添加 id
    .use(() => (tree: MdNode) => {
      const walk = (node: MdNode) => {
        if (
          node.type === 'heading' &&
          typeof node.depth === 'number' &&
          node.depth >= 1 &&
          node.depth <= 4
        ) {
          const text = extractText(node);
          const base = slugify(text);
          const n = slugCount.get(base) || 0;
          const slug = n === 0 ? base : `${base}-${n}`;
          slugCount.set(base, n + 1);

          headings.push({ id: slug, title: text, depth: node.depth });

          node.data = node.data || {};
          node.data.hProperties = {
            ...(node.data.hProperties || {}),
            id: slug,
          };
        }
        if (node.children) {
          node.children.forEach(walk);
        }
      };
      walk(tree);
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: String(file),
    headings,
  };
}

function extractText(node: MdNode): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
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
      // 保留中英文和数字，其他替换为空格
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}
```

- [ ] **Step 2: 行为回归——node 脚本断言 renderMarkdown 输出不变**

```bash
cd /Users/abble/my-learning-record/apps/web && npx tsx --version >/dev/null 2>&1 || true
cat > /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/check-markdown.mjs <<'EOF'
import { renderMarkdown } from '/Users/abble/my-learning-record/apps/web/src/lib/markdown.ts';
const md = '# 标题 A\n\n## 标题 A\n\n![pic](./cover.png)\n\n正文';
const { html, headings } = await renderMarkdown(md, 'blog/foo/index.md');
console.assert(headings.length === 2, 'headings length');
console.assert(headings[0].id === '标题-a' && headings[0].depth === 1, 'first heading');
console.assert(headings[1].id === '标题-a-1' && headings[1].depth === 2, 'dedup suffix');
console.assert(html.includes('id="标题-a"'), 'h1 id injected');
console.assert(html.includes('/api/images/blog/foo/cover.png'), 'image path rewrite');
console.log('MARKDOWN_BEHAVIOR_OK');
EOF
npx tsx /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/check-markdown.mjs
```

Expected: 输出 `MARKDOWN_BEHAVIOR_OK` 且无 `Assertion failed`（tsx 会临时下载，npx 提示 y/N 时选 y；若网络受限改用 `npx --yes tsx`）。

- [ ] **Step 3: lint 确认 error 清零、只剩 5 warning**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run lint; npx tsc --noEmit && echo "TSC_CLEAN"
```

Expected: lint 统计行 `✖ 5 problems (0 errors, 5 warnings)`；随后打印 `TSC_CLEAN`

- [ ] **Step 4: Commit**

```bash
cd /Users/abble/my-learning-record
git add apps/web/src/lib/markdown.ts
git commit -m "fix(web): 用 MdNode 最小结构类型清零 markdown.ts 的 no-explicit-any"
```

**验收标准：** `npx eslint src/lib/markdown.ts` 零输出退出码 0；`npm run lint` 统计行为 0 errors；`npx tsc --noEmit` 退出码 0；Step 2 的行为断言脚本输出 `MARKDOWN_BEHAVIOR_OK`。

---

### Task 4: 清零 5 个 eslint warning

**Files:**
- Modify: `apps/web/postcss.config.mjs:1-6`（匿名默认导出改为具名变量）
- Modify: `apps/web/src/app/categories/[name]/page.tsx:5`（删除未用的 Badge import）
- Modify: `apps/web/src/app/notes/page.tsx:4,54`（删除未用的 import 行与 `categories` 赋值行）
- Modify: `apps/web/src/components/layout/Footer.tsx:1,72-77`（`<img>` 改 next/image）
- Test: `npm run lint` 零 problems + `npm run build:web` 成功

**Interfaces:**
- Consumes: Task 3 之后的 lint 状态（只剩 5 warnings）
- Produces: `npm run lint` 完全干净（Task 6 的 CI 门禁将以此为红线）；`Footer` 组件导出签名不变（`export function Footer()`）

- [ ] **Step 1: postcss.config.mjs 改具名导出**

用以下内容**整体替换** `apps/web/postcss.config.mjs`：

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 2: 删除 categories/[name]/page.tsx 未用的 Badge import**

编辑 `apps/web/src/app/categories/[name]/page.tsx`，删除第 5 行（全文件仅此一处出现 Badge，已核实）：

```tsx
import { Badge } from '@/components/ui/Badge';
```

- [ ] **Step 3: 删除 notes/page.tsx 的死 import 与死赋值**

编辑 `apps/web/src/app/notes/page.tsx`：

删除第 4 行（`getPosts` 本就未用；`getCategories` 在第 54 行删除后也无人用，整行 import 移除）：

```tsx
import { getPosts, getCategories } from '@/lib/api';
```

删除第 54 行（`categories` 变量从未被读取，删除后该页少一次运行时 API 调用，行为无损）：

```tsx
  const categories = await getCategories();
```

（`NotesPage` 保持 `async` 不变，Next 页面组件允许无 await 的 async。）

- [ ] **Step 4: Footer.tsx 的 img 改 next/image**

编辑 `apps/web/src/components/layout/Footer.tsx`。第 1 行：

```tsx
import Link from 'next/link';
```

改为：

```tsx
import Image from 'next/image';
import Link from 'next/link';
```

第 72–77 行（备案图标）：

```tsx
              <img
                src="/beian-gongan.png"
                alt=""
                className="h-3.5 w-3.5"
                loading="lazy"
              />
```

改为（`width/height={14}` 即 3.5×4px，与 Tailwind `h-3.5 w-3.5` 一致；next/image 默认 lazy，无需 loading 属性）：

```tsx
              <Image
                src="/beian-gongan.png"
                alt=""
                width={14}
                height={14}
                className="h-3.5 w-3.5"
              />
```

- [ ] **Step 5: lint 全绿 + build 回归**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run lint && echo "LINT_CLEAN" && npx tsc --noEmit && echo "TSC_CLEAN"
cd /Users/abble/my-learning-record && npm run build:web 2>&1 | tail -3
```

Expected: 依次打印 `LINT_CLEAN`、`TSC_CLEAN`（lint 无任何 problems 输出）；build 成功（末行为路由图例 `ƒ  (Dynamic)  server-rendered on demand`）。

- [ ] **Step 6: Commit**

```bash
cd /Users/abble/my-learning-record
git add apps/web/postcss.config.mjs "apps/web/src/app/categories/[name]/page.tsx" apps/web/src/app/notes/page.tsx apps/web/src/components/layout/Footer.tsx
git commit -m "fix(web): 清零 eslint warnings（匿名导出/死 import/img 转 next-image）"
```

**验收标准：** `cd apps/web && npm run lint` 退出码 0 且无 problems 输出；`npx tsc --noEmit` 退出码 0；`npm run build:web` 成功。

---

### Task 5: Next 16.0.7 → 16.2.10 升级 + Docker standalone 冒烟

**Files:**
- Modify: `apps/web/package.json:15`（`"next": "16.0.7"` → `"next": "16.2.10"`）
- Modify: `apps/web/package.json:40`（`"eslint-config-next": "16.0.0"` → `"eslint-config-next": "16.2.10"`，与 next 同版避免 lint 规则版本漂移）
- Modify: `package-lock.json`（由 `npm install` 自动更新，workspaces 锁文件在仓库根）
- Test: lint/tsc/build 三连回归 + Docker standalone 镜像本地冒烟

**Interfaces:**
- Consumes: Task 1–4 产出的「检查全开、lint/tsc 全绿」状态（升级引入的任何回归都能被立即暴露）
- Produces: `next@16.2.10` 精确版本（规格 §6：「Next 升级到 16.2.x（修 14 条安全公告）」；阶段三在此版本上重构）；更新后的根 `package-lock.json`（Dockerfile 与 CI 的 `npm ci` 都消费它）

- [ ] **Step 1: 修改 package.json 两处版本号**

编辑 `apps/web/package.json` 第 15 行：

```json
    "next": "16.0.7",
```

改为：

```json
    "next": "16.2.10",
```

第 40 行：

```json
    "eslint-config-next": "16.0.0",
```

改为：

```json
    "eslint-config-next": "16.2.10",
```

- [ ] **Step 2: 在仓库根执行 npm install 更新锁文件**

```bash
cd /Users/abble/my-learning-record && npm install --no-audit --no-fund
cd /Users/abble/my-learning-record/apps/web && node -p "require('next/package.json').version"
```

Expected: install 无 ERESOLVE 报错；版本打印 `16.2.10`。若出现 peer 依赖冲突（如 babel-plugin-react-compiler），停下来报告，不要加 `--force`。

- [ ] **Step 3: lint / tsc / build 三连回归**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run lint && echo "LINT_CLEAN" && npx tsc --noEmit && echo "TSC_CLEAN"
cd /Users/abble/my-learning-record && npm run build:web 2>&1 | tee /tmp/phase2-task5-build.log | tail -5
grep -c "Skipping validation of types" /tmp/phase2-task5-build.log || echo "NO_SKIP_FOUND"
```

Expected: `LINT_CLEAN`、`TSC_CLEAN`；build 成功输出路由表；最后输出 `0` 或 `NO_SKIP_FOUND`。若 16.2.10 的 eslint-config-next 引入了新规则告警，逐条修复到零再继续（修复内容一并进本任务 commit）。

- [ ] **Step 4: Docker standalone 冒烟——构建镜像**

```bash
cd /Users/abble/my-learning-record && docker build -f apps/web/Dockerfile -t qingverse-web-smoke:phase2 . 2>&1 | tail -3
```

Expected: 末行含 `naming to docker.io/library/qingverse-web-smoke:phase2`（或 `DONE` 收尾）。前提：本机 Docker daemon 在运行（`docker info` 可用）；Dockerfile 内置 npmmirror 源，无需代理。

- [ ] **Step 5: Docker standalone 冒烟——运行并探活**

```bash
docker run --rm -d --name web-smoke -p 3100:3000 qingverse-web-smoke:phase2
sleep 5
curl -s --max-time 30 -o /tmp/phase2-smoke.html -w "%{http_code}\n" http://localhost:3100/
grep -c "Qingverse" /tmp/phase2-smoke.html
docker rm -f web-smoke
```

Expected: curl 输出 `200`；grep 输出 `>= 1`（首页品牌词渲染成功）。说明：首页是 force-dynamic，SSR 会尝试请求 `http://api:8080` 失败后走 api.ts 的 catch 兜底（约 8s 超时），所以 curl 可能耗时数秒，属预期；`--max-time 30` 已覆盖。

- [ ] **Step 6: Commit**

```bash
cd /Users/abble/my-learning-record
git add apps/web/package.json package-lock.json
git commit -m "chore(web): next 16.0.7 -> 16.2.10, eslint-config-next 同步 16.2.10"
```

**验收标准：** `cd apps/web && node -p "require('next/package.json').version"` 输出 `16.2.10`；lint/tsc/build 三连全绿且 build 输出无 `Skipping validation of types`；Docker 冒烟 curl 返回 200。若本机无 Docker daemon，Step 4–5 标记为「已改，但 Docker 冒烟未实测」，如实汇报后由 push 后的 CI 镜像构建兜底验证。

---

### Task 6: deploy.yml 增加 lint + tsc + build 门禁 job

**Files:**
- Modify: `.github/workflows/deploy.yml:14-16`（`jobs:` 与 `build:` 之间插入 `checks` job；`build` job 增加 `needs: checks`）
- Test: js-yaml 语法校验 + push 后 CI 实绿（Task 7）

**Interfaces:**
- Consumes: Task 2 的 `lint` 脚本（`eslint .`）、Task 5 更新后的根 `package-lock.json`（`npm ci` 依赖锁文件一致）
- Produces: CI job 链 `checks → build → deploy`，checks 失败即止，build/deploy 不会执行（规格 §6：「CI 增加 lint + tsc + build …门禁（现 CI 只构建不检查）」）

- [ ] **Step 1: 插入 checks job 并让 build 依赖它**

编辑 `.github/workflows/deploy.yml`，现状第 14–16 行：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

改为（插入完整 checks job，`build` 增加 `needs: checks`）：

```yaml
jobs:
  checks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: main

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci --no-audit --no-fund --workspace apps/web

      - name: Lint
        working-directory: apps/web
        run: npm run lint

      - name: Typecheck
        working-directory: apps/web
        run: npx tsc --noEmit

      - name: Build
        run: npm run build:web

  build:
    needs: checks
    runs-on: ubuntu-latest
```

（node-version 22 与 Dockerfile 的 `node:22-alpine` 对齐；`npm ci --workspace apps/web` 与 Dockerfile deps 阶段同款命令，消费根锁文件。）

- [ ] **Step 2: YAML 语法校验**

```bash
cd /Users/abble/my-learning-record && npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo "YAML_OK"
grep -n "needs: checks" .github/workflows/deploy.yml
```

Expected: 打印 `YAML_OK`；grep 命中一行（build job 下）。

- [ ] **Step 3: Commit**

```bash
cd /Users/abble/my-learning-record
git add .github/workflows/deploy.yml
git commit -m "ci: deploy 前置 checks 门禁（lint + tsc --noEmit + build，失败即止）"
```

**验收标准：** `npx --yes js-yaml .github/workflows/deploy.yml` 退出码 0；`grep -c "needs: checks" .github/workflows/deploy.yml` 输出 `1`；deploy job 仍保持 `needs: build` 不变（`grep -c "needs: build"` 输出 `1`）。

---

### Task 7: push 到 main，验证 CI 全绿与线上无回归

**Files:**
- 无新改动；推送 Task 1–6 的 6 个 commit

**Interfaces:**
- Consumes: Task 1–6 的全部 commit（本地 main 领先 origin/main 6 个提交）
- Produces: 线上运行新构建（行为不变）；CI 出现 `checks → build → deploy` 三段绿链，作为阶段三/四的基线

- [ ] **Step 1: 复核待推内容**

```bash
cd /Users/abble/my-learning-record && git log --oneline origin/main..main && git status --short
```

Expected: 恰好列出本计划 6 个 commit（fix×3、chore×1、ci×1、fix warnings×1 的顺序按实际执行）；`git status --short` 无未提交改动。

- [ ] **Step 2: ⚠️ 等待用户确认后才可执行——push main（将触发线上部署）**

说明给用户：deploy.yml 路径过滤含 `apps/web/**` 与 `.github/workflows/**`，本次 push **必然触发一次完整构建 + 线上部署**；所有改动均为修复性质，部署后 qingverse.com 行为不变（页面、API 反代、容器拓扑均未动）。用户确认后执行：

```bash
cd /Users/abble/my-learning-record && git push origin main
```

Expected: push 成功，输出 `main -> main`

- [ ] **Step 3: 盯 CI 到全绿**

```bash
cd /Users/abble/my-learning-record && gh run list --branch main --limit 1
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status && echo "CI_GREEN"
```

Expected: watch 结束打印 `CI_GREEN`；run 详情里能看到 `checks`、`build`、`deploy` 三个 job 均 ✓。若 checks 失败，回到对应任务修复后重新 commit + push（门禁生效本身就是验收的一部分）。

- [ ] **Step 4: 线上冒烟——确认部署后行为不变**

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 30 https://qingverse.com/
curl -s --max-time 30 https://qingverse.com/ | grep -c "Qingverse"
```

Expected: `200`；grep `>= 1`。至此按全局约定可宣布「修好」：CI 全绿（部署状态确认）+ 线上 curl 实测（真实系统验证）。

**验收标准：** `gh run watch … --exit-status` 退出码 0（checks/build/deploy 全绿）；`curl -s -o /dev/null -w "%{http_code}" https://qingverse.com/` 输出 `200`；`git status` 干净且 `origin/main == main`。

---

## 整体验收（对照任务书）

```bash
cd /Users/abble/my-learning-record/apps/web
npm run lint && echo OK1          # 零 error 零 warning，退出码 0
npx tsc --noEmit && echo OK2      # 零 error
cd /Users/abble/my-learning-record
npm run build:web 2>&1 | tee /tmp/phase2-final.log | tail -3   # 构建成功
grep -c "Skipping validation of types" /tmp/phase2-final.log || echo OK3   # 输出 0 或 OK3
gh run list --branch main --limit 1                             # 最新 run 全绿
```
