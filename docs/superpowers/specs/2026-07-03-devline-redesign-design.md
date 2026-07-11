# Devline 改版设计文档

日期：2026-07-03
状态：v3，用户已确认进入实施计划阶段
前置调研：5 路并行仓库审计（前端 / Go API / 内容资产 / 仓库健康 / 部署 CI），截图分析断言全部核实属实。
修订记录：v2 于 2026-07-03 经五视角评审（视觉设计系统 / UX 无障碍 / 前端工程 / 性能 SEO / 规格一致性，52 条发现→26 条修订），新增《设计系统规格》章，修正 WCAG AA 缺陷、字体策略、rail-tab 规格、迁移顺序竞态等。v3 同日按用户指示：「情长」从站点彻底移除（不保留起源故事）、新增流量统计页 `/stats`、域名候选调研中（devline 系）。

## 1. 背景与目标

现站 qingverse.com 是「情长」——粉色情感风格的个人学习记录站（Next.js 16 + Go API + MySQL，阿里云 VPS Docker Compose 部署）。本次改版将其重塑为技术 IP 平台 **Devline**。

**目标优先级**（用户确认）：

1. **技术影响力**（主目标，未来 6–12 个月）：网站是内容中枢，首页为最新/最好的内容服务；
2. 求职/招聘方背书（次级）：项目板块承载；
3. 副业获客（次级）：关于页联系方式承载，不做表单。

**关键决定**：新站从零开始。所有旧内容（碎碎念 68 篇、八股/面经/学习记录 276+ 篇、tech-intro 10 篇）全部下线；除碎碎念外源文件保留在仓库。改造在原仓库 my-learning-record 内进行（方案 A），仓库保持公开。

## 2. 品牌

- **站名/主标识：Devline**（用户的平台品牌名）。品牌梗：Dev + line，双线内容战略——一条线给工程师（深度线），一条线给所有人（科普线）。
- **「情长」彻底移除**（v3 用户决定）：**仅指站内文案/视觉**——站点任何页面、文案、页脚不出现「情长」及起源故事；它只存在于 git 历史与迁出的私有仓库。（域名 qingverse.com 的「qing=情」是旧品牌残留，但域名切换是上线后的独立步骤、见下条，不属于本条的"站内移除"范围——两者不矛盾。）
- **域名**：暂沿用 qingverse.com 切流上线；devline 系域名调研中（注册状态/价格/**大陆服务器备案约束**），若购得合适域名，切换作为上线后的独立步骤（Caddy 加新域 + 旧域 301 + GSC 变更地址），不阻塞本次改版。
- **粉色保留但升级**：从满屏粉底改为品牌点缀色（rail、标签、强调、选中态），用法分级见《设计系统规格》D2。

## 3. 内容策略

- 新内容目录 `content/articles/<track>/<slug>.mdx`，track ∈ `deep`（深度线）| `intro`（科普线）。
- frontmatter：`title / date / tags / summary / track / draft`。校验规则：**必填** title / date / track / summary（track 必须 ∈ deep|intro，date 必须可解析为日期）；**可选带默认** tags 默认 `[]`（允许空数组）、draft 默认 `false`；仅必填字段缺失或 track 非法时 fail build。`draft: true` 不构建。校验用 zod schema 在内容加载器里执行，校验失败直接 throw，`next build` 即失败。
- 发布流程：写 MDX → git push → CI 构建部署。
- 旧内容处置：
  - `content/blog/murmurs-and-reflection/`（68 篇情感内容 + 照片）：**迁出到独立私有仓库，并用 git-filter-repo 从本仓库全部历史中抹除**（仓库公开，仅站点下线藏不住）；
  - 其余旧内容（notes / interview-experiences / internship-records / tech-intro 等）：保留源文件、不接入站点，未来另行决策；
  - 轨道空态不留空白，具体文案见 §5「404 与空态」。

## 4. 三主题系统

用户决定做三个访客可切换的主题（不是三套设计，是一套骨架三套皮肤）：

| 主题 | data-theme | 气质 | 亮/暗 | 角色 |
|------|-----------|------|-------|------|
| **双线**（B） | `duo` | 几何图形、双线贯穿、墨线+玫瑰线 | 亮 | **默认主题 + 品牌主题**（站外形象：OG 卡片、favicon 的视觉母体） |
| **编辑刊**（A） | `editorial` | 暖纸底、衬线大标题、编辑红点缀 | 亮 | 备选亮色风格 |
| **夜航**（C） | `night` | 暗紫底、粉色辉光、衬线+等宽混排 | 暗 | **兼任暗色模式** |

技术约束与机制：

- **同一套 DOM 骨架**，主题只经 `data-theme` + design token（CSS 自定义属性）+ 少量主题作用域装饰 CSS 切换；任何主题不得改变页面结构、不得增删 DOM 节点。
- 导航栏内置主题切换器（规格见 §5 导航条目）；主题与轨道选择分别存 `localStorage['devline-theme']` / `localStorage['devline-track']`。
- **防闪烁脚本**：作为 `<body>` 第一个子元素内联（App Router 的 layout 无法手写 `<head>`；同步脚本阻塞后续内容渲染，效果等同 head 内联），`<html>` 加 `suppressHydrationWarning`。theme 与 track 共用这一个脚本：
  ```js
  (function(){try{var t=localStorage.getItem('devline-theme');if(t!=='duo'&&t!=='editorial'&&t!=='night'){t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'duo'}document.documentElement.dataset.theme=t;var k=localStorage.getItem('devline-track');document.documentElement.dataset.track=k==='intro'?'intro':'deep'}catch(e){document.documentElement.dataset.theme='duo';document.documentElement.dataset.track='deep'}})()
  ```
  相应决策：**不用 next-themes（从依赖删除）**——它只管 theme 不管 track，手写 15 行可两者合一。首次访问语义由脚本承载：暗色系统偏好 → 夜航，否则 → 双线；用户显式选择（localStorage）优先。
- 每主题 token 块内声明 `color-scheme`（夜航 `color-scheme: dark`），否则暗主题下 UA 滚动条/表单控件首帧闪白；`<meta name="theme-color">` 三主题各一值（#FDFBFC / #FAF6F3 / #171219），切换时 JS 同步更新。
- **主题切换动效**：切换瞬间给 `<html>` 挂临时类 `.theme-transition`（`* { transition: background-color 250ms ease, color 250ms ease, border-color 250ms ease, box-shadow 250ms ease }`），300ms 后移除；防闪烁脚本首帧设置 `data-theme` 时不带该类（保证开屏无动画）。夜航的氛围辉光与 hero 文字辉光放独立装饰层/伪元素上，用 opacity 0↔1 过渡 250ms（text-shadow 与渐变本身不可平滑过渡）。`prefers-reduced-motion: reduce` 时主题切换零过渡。
- 每个新组件必须在三个主题下各自验收（长期纪律）。**三主题验收工具**：建 `/dev/themes` 预览页（`apps/web/src/app/dev/themes/page.tsx`，生产环境 `if (process.env.NODE_ENV === 'production') notFound()`），把核心组件（导航、头条卡、rail-tab、文章卡、项目卡、页脚、prose 样张含代码块）在三个 `<div data-theme="duo|editorial|night">` 容器里并排渲染，一屏对照三主题（前提：token 定义在 `[data-theme]` 选择器而非 `:root[data-theme]`，否则嵌套容器不生效）。验收动作固化为：新组件合入前附 /dev/themes 截图。不引入 Storybook。

## 设计系统规格（三主题基准）

> 定位：本章是三主题实施与验收的**唯一**色值/字体/尺寸/动效依据，逐值对齐用户确认的 mockup，仅对不过 WCAG AA 的文字色做**同色相加深**修正（逐条标注「AA 修正」）。frontend-design 打磨只能在此之上微调：不得把已过 AA 的色调亮、不得偏离 token、不得为任何主题增删 DOM。
>
> **mockup 文件位置**（全章及 §5 反复引用的 visual-style.html / final-layout-v2.html / mobile-layout.html 三个基准文件）：`.superpowers/brainstorm/15484-1783011494/content/`（仓库根下的隐藏目录，`ls -a` 才可见）。三主题原版在 `visual-style.html`，定稿布局在 `final-layout-v2.html`，移动端在 `mobile-layout.html`。若目录被清理，色值以本章 D1 表为准（表本身已是自足的事实源，不依赖 mockup 存续）。

### D1 色板 token

所有颜色经 CSS 自定义属性下发，定义在 `[data-theme]` 选择器上（`:root` 放 duo 值兜底），`data-theme` 切换赋值，**组件层禁止出现 hex**。实现层变量存 RGB 通道值以支持 Tailwind 透明度修饰符（机制见 §6 token 条目）；下表为可读性写 hex。

| token | 双线 B（duo，默认） | 编辑刊 A（editorial） | 夜航 C（night） |
|---|---|---|---|
| `--bg` 页面底 | `#FDFBFC` | `#FAF6F3` | `#171219` |
| `--surface` 卡片面 | `#FFFFFF` | `#FFFFFF` | `#1F1823` |
| `--surface-tint` 粉底面 | `#FDEEF4` | `#F3C4D3`（仅小面积底衬） | `rgba(242,118,159,0.08)` |
| `--text` 主文字 | `#17141A` | `#221A20` | `#F4EDF2` |
| `--text-2` 次级文字 | `#5C525A` | `#5A4C54` | `#9C8FA0` |
| `--text-3` meta/弱化 | `#7A6E76` **AA 修正**（mockup 原值 #8A7E86 仅 3.77:1） | `#756770` **AA 修正**（原值 #8A7A82 仅 3.77:1） | `#948A9B` **AA 修正**（原值 #7C7080 仅 3.70:1） |
| `--text-muted` 纯装饰/占位 | `#B8ACB4` | `#B9AAB2` | `#7C7080` |
| `--border` 默认边框 | `#E2D8DD` | `#E4D9D6` | `#2A222E` |
| `--border-2` 浅一档分隔 | `#EFE7EB` | `#EDE3E0` | `#3A2F40` |
| `--accent` 主粉（图形/大字） | `#EC5A87` | `#C2255C` | `#F2769F` |
| `--accent-soft` 浅粉（阴影/衬线/未激活轨） | `#F6BDD2` | `#F3C4D3` | `rgba(242,118,159,0.4)` |
| `--accent-strong` 填色底（配 `--on-accent`） | `#C63A64` **AA 修正** | `#C2255C` | —（C 填色直接用 `--accent`） |
| `--accent-text` <19px 粉色文字 | `#C63A64` **AA 修正**（#EC5A87 对浅底仅 3.2:1；#C63A64 达 4.86:1） | `#C2255C`（5.26:1，原值即过 AA） | `#F2769F`（6.92:1，原值即过 AA） |
| `--on-accent` 填色组件内文字 | `#FFFFFF`（on #C63A64 = 5.01:1） | `#FFFFFF`（on #C2255C = 5.7:1） | `#171219`（on #F2769F = 6.9:1） |
| `--track-deep` 深度线轨色（激活） | `#17141A` | `#221A20` | `#C9BFCE`（月白——墨线在暗底不可见，「墨」是语义色非固定 hex） |
| `--track-deep-dim` 深度线（未激活） | `#D9D2D6` | `#E4D9D6` | `#3A2F40` |
| `--track-intro` 科普线轨色（激活） | `#EC5A87` | `#C2255C` | `#F2769F` |
| `--track-intro-dim` 科普线（未激活） | `#F2BFD2` | `#F3C4D3` | `#3A2F40` |

**组件级修正与固定值**：

- `--text-muted` 仅限纯装饰（占位、装饰图标），**禁作信息性文字**（日期/时长/标签一律 `--text-3`）；B 未选中深度 tab 的描边由 mockup 的 #B8ACB4（2.12:1）改 `#8A7E86`（3.77:1 ≥ 组件 3:1），tab 内副标统一走 `--text-3`。
- B 选中科普标签：mockup 的「白字 on #EC5A87」仅 3.3:1 不达标，**改填 `--accent-strong` #C63A64 + 纯白文字（5.01:1）**，副标由 #FBD9E5（2.53:1）改纯白、字重 400 与主文字区分——保持「粉底白字」观感、仅加深底色。此规则在实施首个填色组件时定死并全站沿用。
- 编辑刊 01/02 大序号 #D9C2CB（1.56:1）标注为纯装饰元素并加 `aria-hidden="true"`。
- 不随主题变的固定关系：B/移动端汉堡第三道杠与品牌双线下线 = `--accent`；B 页脚顶线 = `linear-gradient(90deg, var(--track-deep) 50%, var(--track-intro) 50%)`。
- 任何组件（rail-tab、卡片轨色边、头条轨道标记、页脚双色线）引用轨道色一律走 `--track-deep` / `--track-intro`，不得写死墨/粉 hex。

### D2 粉色用法分级

| 层级 | token | 允许用途 | 禁止 |
|---|---|---|---|
| 粉-底 | `--surface-tint` | 大面积底色、hero 底衬、项目卡底 | 作文字色 |
| 粉-浅 | `--accent-soft` | 硬投影、未激活轨线、装饰线 | 文字、细图标 |
| 粉-主 | `--accent` | ≥24px（或 ≥19px bold）大字（大字标准 3:1，#EC5A87 达 3.2:1 过线，hero 46px「所有人」保持原值不动）、边框、图形、rail、辉光 | **B 主题下 <19px 文字** |
| 粉-强 | `--accent-strong` | 填色组件底（激活标签、深色按钮），内文字用 `--on-accent` | 大面积铺底 |
| 粉-文 | `--accent-text` | 正文链接、小字强调、meta 高亮 | — |

验收：三主题所有文字组合过 WCAG AA（正文 4.5:1、大字与 UI 组件 3:1），纳入 §8 验证标准。

### D3 字体系统

**三条字体栈（token 化）**：

- `--font-sans`（全主题正文 + UI + B 主题标题）：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif`。纯系统栈，零下载。
- `--font-serif`（A/C 主题的标题、品牌字、A 的期刊编号）：`'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif`。Noto Serif SC 自托管（下述方案）。
- `--font-mono`（C 主题 meta/日期/章节引子、全站代码块）：`ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace`（中文回落 `--font-sans`，可接受）。

**Noto Serif SC 自托管：必须走 next/font/google 的 unicode-range 切片管线，禁止整包**（中文单字重全量 5–8MB）。构建期下载切片（每字重 100+ 片、每片 5–40KB woff2）随站点自托管，浏览器按页面实际出现的字按需拉片；标题级用字下单页通常只命中几片到十几片。配置：`Noto_Serif_SC({ weight: ['700','900'], display: 'swap', preload: false, adjustFontFallback: false, fallback: ['Songti SC','SimSun'] })`。

**两条硬规则**：① **衬线只用于标题层（h1–h3、品牌字、编号），正文全主题一律 sans**——这条规则本身就是控制 webfont 体积的手段；② 衬线 font-family 只写在 `[data-theme='editorial']` / `[data-theme='night']` 作用域规则里——CSS 字体仅在规则命中时才触发下载，**默认主题双线 B 首屏 0 个字体请求**（LCP = hero 大标题文本，不受字体加载影响），这是 §8 的机器可验证断言。

**平台落点矩阵**（swap 间隙的回退表现）：macOS/iOS → Songti SC（气质几乎无损）；Windows → SimSun（大标题可读，加载完成后替换）；Android → 无系统中文衬线，webfont 是 Android 的唯一衬线来源（这就是必须自托管的原因，否则 A/C 主题在 Android 整体退化为黑体，违背「三主题都保留」与「体验对等」）。

**已知取舍**：B 主题标题 `font-weight: 900` 在 PingFang SC（最重 Semibold）上实际落在 600 + 浏览器合成加粗，与 mockup 渲染一致，接受；若上线后觉得笔画不够重，再评估为 hero 单独引 Noto Sans SC 900（同样切片），当前不做。弃用现站 Space Grotesk 与 globals.css 顶部的渲染阻塞 @import。

### D4 字阶 / 间距 / 宽度节奏（自 mockup 提取）

**字阶 token**（375px ↔ 1120px 视口线性流式）：

- `--fs-hero`: `clamp(28px, 2.4vw + 19px, 46px)`，weight 900，line-height 1.3（B）/ 1.4（A/C 衬线），letter-spacing -0.02em（仅 B；衬线不加负字距）
- `--fs-headline`（头条卡标题）: `clamp(17px, 0.67vw + 14.5px, 22px)`，800，lh 1.5
- `--fs-title`（列表卡标题）: 桌面 15px / 移动 14px，700，lh 1.55–1.6
- `--fs-body`（文章正文）: 16px，lh 1.9，正文列宽 680px（约 40 汉字/行）
- `--fs-sub`（hero 副文案/摘要）: `clamp(14px, 0.53vw + 12px, 16px)`，lh 1.8
- `--fs-meta`: 桌面 12px / 移动 11px（C 主题 meta 用 `--font-mono`）
- `--fs-label`（章节引子）: 13px/800/字距 0.12em（B）、12px/字距 0.2em（A）、12px mono（C）；导航 14px；品牌字 24px 桌面 / 19px 移动

**间距**：4px 基数（4/8/12/16/20/24/32/44/64）。区块垂直间距桌面 44–64px / 移动 26–40px；卡片内边距 16px 20px（移动 14px 16px）；卡片间距 10–12px；双列 gap 32px；项目卡 gap 14px。

**宽度节奏（PC 居中的具体形态）**：内容容器 `max-width: 960px; margin-inline: auto`，侧 padding 48px 桌面 / 20px 移动；容器内分层限宽形成节奏——hero 文本 640px、正文列 680px、头条卡 760px、列表与项目区 856px；**只有 rail-tab 的两条线与页脚双色线 full-bleed 破容器**（实现禁用 100vw 负 margin，见 §5 rail-tab 结构）。

### D5 圆角 / 边框 / 阴影 / 装饰差异表（主题气质规格）

| 维度 | 编辑刊 A（细线） | 双线 B（粗边+硬投影） | 夜航 C（辉光） |
|---|---|---|---|
| 圆角 | 按钮 2px、标签胶囊 10px、卡片 0 | 文章卡 0、项目卡 6px、rail 标签 16px | 内容卡 0 8px 8px 0（左侧 2px 轨色边）、项目卡 0 0 8px 8px（顶部 2px 轨色边） |
| 边框 | 一律 1px 发丝线（`--border` / 列表分隔 `--border-2`） | 1.5–2px 实边；激活卡用 `--track-*`，非激活用 `--border` / #F2DDE6 | 1px `--border` 发丝线 + 2px 轨色 accent 边 |
| 阴影 | **无投影**（气质靠留白与细线） | 硬错位投影零模糊：列表卡 `4px 4px 0`（deep 激活 #17141A / intro 激活 `--accent-soft`），头条卡 `6px 6px 0 var(--accent-soft)`；hover = translate(-2px,-2px) + 阴影增至 6px 6px 0 | 无投影；辉光三件套：hero 强调词 `text-shadow: 0 0 24px rgba(242,118,159,.45)`、页角氛围光 `radial-gradient(circle, rgba(242,118,159,.16) 0%, transparent 65%)`（420px，定位页面右上角外溢）、hover `box-shadow: 0 0 20px rgba(242,118,159,.15)` |
| 品牌字尾 | 衬线 900「Devline」+ 编辑红句点「.」 | sans 800「Dev line」，line 下双线（粉 3px 于 -4px、墨 3px 于 -9px） | 衬线 900「Devline」+ 粉色光标「_」 |
| 章节引子 | 22px 短红线 + 0.2–0.25em 字距小标 | 0.12em 字距 / 800 重标签 | 等宽 `// 注释`、`$ 命令` 前缀 |
| hero 强调 | 强调词底衬 `border-bottom: 6px solid var(--accent-soft)` | 强调词直接 `--accent` 着色 | `--accent` 着色 + 辉光 |
| 页脚顶线 | 1px `--border` | 2px 半墨半粉渐变线（见 D1 固定值） | 1px `--border` |
| 主题切换器图标 | ◐ | ◐ | ☀ |

实现约束：以上装饰全部通过 `[data-theme]` 作用域 CSS + `::before/::after` 实现（品牌字尾用伪元素 content），**不允许为任何主题增删 DOM 节点**。

### D6 动效 token

```css
--dur-fast: 150ms;
--dur-base: 250ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

- **rail-tab**：线的 height/background/opacity 过渡 250ms `var(--ease-standard)`；标签填色/描边 200ms ease-out；列表交换：旧列表 opacity→0 + translateY(-6px) 150ms ease-in，新列表 opacity 0→1 + translateY(8px→0) 250ms ease-out、卡片逐张 stagger 40ms；只动 opacity/transform（不动 layout 属性）。
- **hover 微交互**：与 rail-tab 共用 `--dur-fast` / `--ease-standard`；B 卡片 hover 位移+阴影见 D5。
- **主题切换**：临时 `.theme-transition` 类方案（见 §4 技术约束），首帧无动画；夜航辉光层用 opacity 过渡（text-shadow/渐变不可直接 transition）。
- **降级**：`prefers-reduced-motion: reduce` 时——rail-tab 列表交换退化为 120ms 纯 opacity，主题切换零过渡，汉堡图标无动画。
- 全部动画纯 CSS 实现，不引入 framer-motion。
- CLS 说明：rail-tab 与主题切换均为用户交互触发（500ms 豁免窗口内）不计入 CLS；唯一 CLS 风险源是字体 swap，已由正文用系统栈规避。

### D7 本章验收标准

1. 用浏览器取色器对照 mockup：三主题每个 token 与 D1 表一致（AA 修正项以本表为准，不回抄 mockup 原值）；
2. 三主题所有文字组合过 WCAG AA（自动化对比度检查，见 §8）；
3. 每个新组件合入前附 `/dev/themes` 三主题并排截图（见 §4 验收工具）。

## 5. 页面与布局

页面：`/`（首页）、`/articles`（全部）、`/articles/deep`、`/articles/intro`（**筛选用 URL 承载而非客户端状态**，与详情页 `/articles/<track>/<slug>` 天然嵌套，三个列表页都是 SSG、可分享、后退正常）、`/projects`、`/about`、`/stats`（流量统计页，见下方规格）、404、RSS（`/feed.xml`）、`sitemap.xml`、`robots.txt`。

入口语义：首页「沿深度线看全部 →」链接到 `/articles/deep`（把当前轨道带过去）；导航「文章」永远指向 `/articles` 全部。**单向传递**：首页 rail-tab 的 localStorage 只作用于首页，/articles 上的切换不写回首页状态，避免「文章页点了科普、回首页 tab 自己变了」的隐式状态穿越。

**首页结构（三主题共用，用户逐项确认）**：

1. 导航：Devline 标识（"line"下双线装饰）+ 首页/文章/项目/关于 + **主题切换器**。切换器规格：一个按钮（桌面显示当前主题色点 + 「主题」文字，移动端仅色点图标，`aria-label="主题：当前双线"`），`aria-haspopup` + `aria-expanded`，点开小浮层面板；面板内 `role="radiogroup" aria-label="主题"`，三个选项各为「色卡圆点 + 主题名」——双线 / 编辑刊 / 夜航，当前项 `aria-checked="true"`；键盘 ↑/↓ 移动、Enter/Space 选中、Esc 关闭并回焦按钮；选中即时换肤 + 写 localStorage；每个选项行高 ≥44px。色卡圆点用各主题 `--accent` 值（#EC5A87 / #C2255C / #F2769F），三点并排本身就是品牌展示。禁止做成「点击图标循环切换」（不可发现、屏幕阅读器不可理解）。
2. Hero：双线宣言标题 + 副文案；
3. **头条通栏**：最新一篇（不分轨道）带轨道标记的大卡片。去重规则：当头条文章属于当前选中轨道时，下方列表自动排除该篇（列表从第二新开始）；切到另一轨道时列表不受影响。头条卡上的轨道标记（「最新 · 科普线」）保证轨道归属信息不丢。视觉层级维持 mockup 基准：头条卡 6px 6px 0 硬阴影 + 更大尺寸，列表卡 4px 4px 0，层级由阴影深度与卡片体量共同区分。
4. **轨道切换器（rail-tab，本站签名交互）**：
   - **轨道色语义**：「墨=深度、粉=科普」是语义轨道色而非固定 hex，经 `--track-deep` / `--track-intro` 随主题取值（夜航下深度线取月白 #C9BFCE，详见 D1）。
   - **几何**（数值取自 final-layout-v2.html，位置改为右锚定）：区域高度桌面 96px / 移动 78px；两条线 full-bleed 横贯 100% 视宽（深度线在上：桌面 top 22px / 移动 16px；科普线在下：桌面 top 64px / 移动 52px）；线激活 4px（移动 3px）实色 `--track-*`，未激活 2px `--track-*-dim`。**标签右锚定，以本文档「靠右」为准，覆盖 final-layout-v2.html 中 left:96px/210px 的左置画法**（该 mockup 早于靠右决定；右置关系参考 mobile-layout.html hero 装置）：深度线标签右缘对齐内容容器右缘，科普线标签向左错开约 172px（移动约 116px），两 pill 水平错位、各骑各的线；线粗、标签胶囊样式、硬阴影、色值等其余细节仍以该 mockup 为基准。标签：激活 = 填色 + `--on-accent` 文字 + 800 字重 + padding 6px 20px + radius 16px（移动 12px 字号 / padding 5px 16px / radius 14px），B 主题科普激活标签填 `--accent-strong` #C63A64 配纯白文字（AA 修正，见 D1）；未激活 = `--bg` 底 + 1.5px `--track-*` 描边 + 主色文字 + 700 字重，B 未选中深度标签描边用 #8A7E86（组件 3:1 修正）。阴影按 D5 主题差异表（B 硬投影 3px 3px 0 / A 无 / C 辉光）。
   - **结构与触控**：rail-tab 区块本身为全宽 section，两条线是其内 `position:absolute; left:0; right:0` 的子元素；标签放在与正文同宽的居中容器内绝对定位骑线；**禁用 100vw 负 margin 破格技巧**（桌面滚动条宽度会造成横向溢出）。两条横线本身不可点、不响应事件（只有骑线标签可点）；标签视觉尺寸保持 mockup 比例，触控热区用 `::after { position:absolute; inset:-10px -6px }` 扩展到 ≥44px。移动端标签保留全文「深度线 · 给工程师」，只降字号与内边距。
   - **渲染与状态**：SSG HTML 同时渲染两个轨道面板；面板显隐与标签选中态视觉全部由 `html[data-track]` 属性 + CSS 驱动（如 `html[data-track='deep'] [data-panel='intro'] { display:none }`，线粗/标签填色同理用属性选择器写），`data-track` 由 §4 防闪烁内联脚本一并设置（key `devline-track`，默认 deep），零水合闪动；React 组件只负责点击时改 html 属性 + 写 localStorage + mount 后同步 aria 属性。附带收益：两条轨道的文章链接都在静态 HTML 里，SEO 不受 tab 遮挡。
   - **语义与键盘**：容器 `role="tablist" aria-label="内容轨道" aria-orientation="vertical"`（两线上下排布）；每个标签为 `<button role="tab" aria-selected aria-controls>`，列表容器 `role="tabpanel" aria-labelledby`；roving tabindex（Tab 只落选中 tab，↑/↓ 在两轨间移动焦点，Home/End 到首尾），自动激活模式（列表已静态渲染无加载延迟）；焦点态有独立于选中填色的可见 focus ring（2px outline + 2px offset，亮主题 #17141A、夜航 #F2769F）。
   - **动效**：见 D6。
5. 当前轨道文章列表 + "沿 X 线看全部 →"（链接到 `/articles/<track>`）；
6. 项目区：3 卡（移动端单列），case-study 卡片（memory-system、OpenClaw、SystemWright、本站改造本身……），v1 先放 2-3 个，格式：问题 → 方案 → 结果；
7. 页脚：半墨半粉双色顶线（仅 B，见 D5）+ 「© Devline」+ RSS/GitHub/小红书/统计（链 /stats）。不出现「情长」。

**关于页**：个人介绍 + 技术栈 + Devline 双线理念一段 + 联系方式（邮箱、GitHub、小红书直链，**不做表单**——现有半成品 ContactForm 直接删除）。不含站点起源故事（v3 决定）。

**响应式（硬要求：PC 与手机体验对等）**：

- PC 与手机同一结构，无布局分叉；**PC 内容容器居中**（`max-width: 960px; margin-inline: auto`，分层限宽见 D4）；
- 手机：导航折叠汉堡菜单（第三道杠粉色）、rail-tab 原样保留、**标签文字不删减**（「深度线 · 给工程师」全文，只缩字号内边距）、项目单列。汉堡菜单规格：展开为导航栏下方的整宽下拉面板（非全屏遮盖）；内含首页/文章/项目/关于四项，每项 16px 字号、行高 ≥48px、左对齐，当前页项左侧加一段粉色短线标记（呼应 rail 语言）；分隔线下放 RSS/GitHub/小红书；主题切换器保留在导航栏上、不塞进菜单（切主题是本站展示性功能，入口不应藏两层）。汉堡为 `<button aria-expanded aria-controls>`，展开后 Esc 或点击面板外关闭、焦点困在面板内、关闭后焦点回按钮；三道杠→关闭图标有过渡动画且尊重 prefers-reduced-motion；
- 触控目标 ≥ 44px，**实现规约：视觉尺寸维持 mockup 基准不变，命中区用透明扩展达标**——tab 标签、汉堡按钮、主题按钮用 padding + 负 margin（或 ::after 伪元素覆盖）把可点区域扩到 ≥44×44px；页脚 RSS/GitHub/小红书每个链接独立加 padding 使行高 ≥44px、相邻热区不重叠；rail-tab 的两条横线本身不可点（避免贯穿全宽的 2–4px 线成为巨大误触面）；字号用 clamp() 流式缩放（字阶见 D4）。

**404 与空态**：

- 404 页用双线装置变奏——两条线横贯页面但在中段断开错位，主文案「404 · 这条线还没铺到这里」，副文案「你找的页面不存在，也可能已随改版下线」，双 CTA「回首页」「看文章」（链 /articles）。旧 URL 的 410 响应体（见 §6）复用此页面视觉。
- 轨道空态精确文案：深度线空 =「深度线首篇打磨中 · 先沿科普线逛逛 →」（带跨轨 CTA，点击即切 tab），科普线空为对称文案；`/articles/deep`（或 intro）空态复用同文案。
- 两者均需三主题各自验收；§8 的页面渲染验收明确包含 404 与两轨道空态。

**流量统计页 `/stats`（v3 新增）**：

- 展示内容：全站累计 PV / UV、近 30 天访问趋势（折线或柱状，纯 SVG/CSS 实现，不引图表库）、文章浏览榜 Top 10（标题 + 浏览数 + 轨道标记）、当前在线粗略数。页面自身遵守三主题 token（图表颜色用 `--track-deep` / `--track-intro` / `--accent`，禁止图表库自带配色）。
- 数据源：**自托管 GoatCounter**（单二进制 + SQLite，Go 技术栈与用户匹配；不是 umami——umami 需再养一个 Postgres，违背做减法）。部署为 compose 第三个容器 `goatcounter`，子域 `stats.<域名>` 由 Caddy 反代并自动签证书（需加一条 DNS A 记录）。
- 采集：全站 layout 注入 GoatCounter count.js（异步、~3KB、无 cookie、GDPR 友好；`data-allow-local` 关闭，本地开发不计数）；SPA 场景无需额外处理（全静态多页）。
- `/stats` 页取数：GoatCounter 开启 public dashboard 后，站点前端直接 fetch 其公开 JSON 端点（总量/趋势/热门路径），客户端渲染；页面骨架与空态（「统计服务暂不可用」）SSG 预渲染，statsAPI 失败时不破版式。
- 隐私说明一行放页脚：「统计自托管、无 cookie、不追踪个人」——这本身是技术品牌加分项。

1. OG image：v1 一张静态品牌图 `apps/web/src/app/opengraph-image.png`（1200×630，≤150KB，双线视觉母体，Next 约定式自动注入 og:image/twitter:image）；per-article 动态 OG 图列入 §9 未来另议；删除未被引用的旧 `public/og-image.jpg`。
2. favicon 套件：`src/app/icon.svg`（双线标，SVG 内嵌 prefers-color-scheme media 适配暗色标签栏）+ `favicon.ico`（32×32 兜底）+ `apple-icon.png`（180×180）；删除冗余 `src/app/favicon1.ico`。
3. JSON-LD：文章详情页输出 `Article`（headline / datePublished / dateModified / author→Person / image / inLanguage: zh-CN / mainEntityOfPage），首页输出 `WebSite` + `Person`；server component 内 `<script type="application/ld+json">` 输出，数据全部来自 frontmatter，零运行时成本。
4. RSS：`/feed.xml` 为 RSS 2.0 单一全站 feed，两轨都进（item 用 `<category>` 标注 deep/intro），条目输出 summary + 链接；route handler `export const dynamic = 'force-static'` 构建期生成；全站 head 加 `<link rel="alternate" type="application/rss+xml" title="Devline" href="/feed.xml">`。

**设计打磨**：实施阶段用 frontend-design 技能在《设计系统规格》基线之上做微调（不得偏离 token 与 AA 修正，见该章定位说明）。

## 6. 技术架构（做减法）

- **前端**：apps/web 重构为纯静态生成（SSG + generateStaticParams），去掉 force-dynamic；Next 升级到 16.2.x（修 14 条安全公告）。
- **文章管线**：**next-mdx-remote 的 RSC 接口（`next-mdx-remote/rsc` 的 compileMDX）**，SSG 构建期编译；`mdxOptions.remarkPlugins` 复用 remark-gfm 与现有 `apps/web/src/lib/markdown.ts` 里的标题 id / TOC 收集两个自定义 remark 插件（可原样迁移）；**移除 rehype-raw**（现有管线是 Markdown→HTML 字符串管线，编译不了 MDX，且 rehype-raw 与 MDX 语法互斥——MDX 中原始 HTML 会被当作 JSX 解析；富内容直接写 JSX）。frontmatter 用 zod schema 校验（规则见 §3）。不用 contentlayer（已停维护、无 Next 16 适配）。
- **图片链路**：删除 `apps/web/src/app/api/images/[...path]/route.ts` 与 markdown.ts 中的 transformImagePath 逻辑（运行时读 content 目录与「全静态生成」矛盾）。新文章图片随文放 `content/articles/<track>/<slug>.assets/`，prebuild 脚本在 `next build` 前拷贝到 `public/article-assets/<track>/<slug>/`，MDX 内相对引用、由内容加载器改写为绝对路径；构建时校验 MDX 引用的图片文件存在，缺失 fail build；运行时镜像不再 COPY content。
- **字体**：按 D3 执行（默认主题双线 B 零 webfont；正文全主题系统栈；Noto Serif SC 仅 A/C 标题、经 `next/font/google` 构建期下载自托管，衬线 font-family 只写在 `[data-theme='editorial']` / `[data-theme='night']` 作用域规则里）。前提说明：next/font/google 在构建期需访问 Google 网络，当前 CI 在 GitHub Actions ubuntu-latest 可达；若未来构建迁回国内环境，改 `next/font/local` + 分片 woff2 vendor 进仓库。
- **代码高亮**：rehype-pretty-code（shiki）构建期完成，零客户端 JS；用 shiki 多主题输出 CSS 变量方案：`themes: { duo:'github-light', editorial:'github-light', night:'rose-pine-moon' }`（具体主题名实施阶段随 frontend-design 定）+ `defaultColor: false`，再用三行 CSS 按 data-theme 选用对应变量，代码块随主题即时切换、无需重渲染。深度线核心内容形态是源码/架构文章，代码块是三主题下最容易遗漏的「第三方颜色源」。
- **设计 token 实现机制**（色值/字体/装饰参数见《设计系统规格》章）：
  1. CSS 变量存 **RGB 通道值**（否则 Tailwind 透明度修饰符 `bg-accent/50` 静默失效），定义在 `[data-theme='duo'|'editorial'|'night']` 选择器上，`:root` 放 duo 值兜底；夜航根上补 `color-scheme: dark`。
  2. `tailwind.config.ts` 整体重写（现硬编码 rose/pink 色板废弃）：`colors: { bg:'rgb(var(--c-bg)/<alpha-value>)', surface:…, ink:…, accent:…, track-deep:…, … }`；`darkMode: ['selector','[data-theme="night"]']`（Tailwind 3.4 语法）；plugin 加三个主题变体 `addVariant('theme-duo','[data-theme="duo"] &')` 等——**变体仅限装饰差异（阴影/圆角/伪元素装饰），组件配色一律走 token，禁止按主题复制组件类**。
  3. 非颜色 token 化：`--font-display`（duo=重磅无衬线，editorial/night=Noto Serif SC）、`--shadow-card`（duo=4px 4px 0 硬阴影 / editorial=无 / night=粉色辉光），Tailwind 侧 `fontFamily.display` / `boxShadow.card` 引用。
  4. 体积预算：三主题编进同一份 CSS（不按主题拆文件懒加载，否则切换闪白）；全站 CSS gzip ≤ 50KB，三主题增量（token 块 + 装饰规则）合计 ≤ 10KB gzip，CI build 门禁附带 size check。
- **流量统计（GoatCounter）**：compose 增 `goatcounter` 服务（官方镜像或源码构建，SQLite 数据落独立 volume `goatcounter-data`，内存限制 128M）；Caddy 增 `stats.<域名>` 站点块反代 :8081；首次部署后创建站点与 API 免登录公开读；备份策略：SQLite 单文件，随服务器现有备份走。该容器与 web 互不依赖，统计挂了不影响主站。
- **Go API + MySQL 退役**：compose 从 4 容器减为 **3**（web/caddy/goatcounter）；`apps/api` 代码保留仓库归档；Caddy 移除 `/api/*` 反代；**同步移除 Caddyfile 的 `@images path /images/*` file_server 块及对应 Cache-Control 规则**——该块经 `../content:/srv:ro` 挂载直接服务整个 content 目录且不限扩展名，面经/实习记录/notes 的全部 .md 源文件（乃至 murmurs 的 md 和照片）都能通过 `https://qingverse.com/images/blog/...` 直接下载，不移除则「旧内容保留源文件、不接入站点」形同虚设；compose 同步移除 caddy 的 `../content:/srv:ro` 与 web 的 `../content:/app/content:ro` 挂载（全静态生成后运行时不再读 content）；caddy 的 depends_on 从 [web, api] 改为 [web]。待决事项：mysql-data 卷（含旧文章数据副本）保留归档还是删除，切流前定。ContactForm 组件与 `/api/contact` 链路整体删除，联系方式 = mailto + 社交直链。静态资产缓存：Caddy 开启 `encode zstd gzip`；`/_next/static/*` 与字体分片响应 `Cache-Control: public, max-age=31536000, immutable`，HTML 保持默认短缓存。
- **旧 URL：显式前缀清单统一返回 410 Gone（Caddy 路径匹配 + `respond 410`），不做 301**。清单：`/posts/*`、`/notes/*`、`/murmurs*`、`/interview-questions/*`、`/interview-experiences*`、`/internship-records*`、`/categories/*`、`/images/*`。理由：现 sitemap 从未输出真实域名（`NEXT_PUBLIC_SITE_URL` 未配置），收录近零、无权重可迁，大批量 301→首页会被判定 soft-404 反而延缓出索引；**`/murmurs*` 必须是 410**——配合 git 历史抹除，这是让搜索引擎缓存最快清掉情感内容的方式，上线后在 Google Search Console 用「移除网址」工具对 /murmurs 前缀加速清缓存。410 响应体指向品牌化的 404/410 页面（见 §5），人类访客体验不受损。**除清单外的未知路径透传给 Next.js 渲染 404 页**（否则 catch-all 会让 404 页永远不被渲染）。若上线前发现个别页面确有外链，仅白名单保留 301，不做全量。
- **metadata 基建清单**：
  1. `metadataBase` 兜底改为硬编码 `https://qingverse.com`（`NEXT_PUBLIC_SITE_URL` 仅用于覆盖），sitemap.ts / robots.ts 同步去掉 `localhost:3000` fallback——从机制上杜绝 localhost URL 再进 sitemap；
  2. `sitemap.ts` / `robots.ts` 重写为从本地 MDX 文件系统枚举（**现实现的数据源是 `@/lib/api` 即将退役的 Go API，API 一停 sitemap 构建即挂**，须与 API 退役条目绑定处理）；
  3. 每页 `alternates.canonical`；
  4. OG：全站 og:site_name=Devline、og:locale=zh_CN，文章页 og:type=article + article:published_time / modified_time / article:tag；
  5. Twitter card：summary_large_image 且必须配 image（修复现站声明卡片却无图的问题）；
  6. 站点验证：Google Search Console + Bing 的 verification meta（`metadata.verification`），上线清单增加「GSC 提交新 sitemap」。
- **依赖清理**（做减法延伸到前端依赖）：同步移除零引用依赖 next-seo、next-sitemap（sitemap/robots 继续用 App Router metadata route）、framer-motion（rail-tab 动画纯 CSS）、next-themes（§4 已决策手写防闪烁脚本）、npm-run-all（根 dev 脚本随 API 退役简化为 dev:web）。
- **仓库健康（一并修）**：删除 tsconfig 非法 `ignoreDeprecations`；关闭 `typescript.ignoreBuildErrors`（被掩盖的类型错误只有 ContactForm 一处，删组件即消）；lint 脚本从已废弃的 `next lint` 改为 `eslint .` 并清零现存 12 error / 5 warning；**CI 增加 lint + tsc + build + CSS size check 门禁**（现 CI 只构建不检查）。

## 7. 迁移顺序

1. **止血**：push 本地领先的**全部** commit（截至本文档 v2 约 30 个：tech-intro 内容 + **apps/api 文章分类中文标签** + 设计文档等，**并非纯内容文件**）；该 push 命中 content/** 与 apps/api/** 路径过滤，会触发一次完整 CI 构建部署，线上变化仅限旧站文章分类中文标签，属预期；目的是防丢工作并让步骤 2 的历史重写基于已推送的完整历史。
2. **隐私**（不可逆操作，按序执行）：
   1. `git clone --mirror` 全量冷备存本地仓库外（filter-repo 唯一恢复途径）；
   2. 新建私有仓库存放 murmurs，**迁移形态：用 `git filter-repo --path` 提取 murmurs 子目录历史推入私有仓库（保留写作时间线）**；完整性核对：68 篇 .md + 1 张 .jpg 逐一清点通过后才允许执行下一步；
   3. **停用部署工作流**（`gh workflow disable` 或 GitHub UI）——filter-repo 后 force push 的 diff 是删除 content/blog/murmurs-and-reflection/**，命中 content/** 路径过滤，否则 CI 会在重建服务器仓库的同时 SSH 上去 `git reset --hard` + compose 重启，产生竞态；
   4. `git-filter-repo` 抹除本仓库全部历史 → force push；
   5. 服务器重建（此窗口站点短暂停机，属预期）：`docker compose down`（content 目录 bind mount 进运行中容器）→ 备份 `deploy/.env` 与 `deploy/Caddyfile` 到仓库外（两者都是服务器上的未跟踪文件，重 clone 会抹掉）→ 删除 ~/workspace/my-learning-record 并重新 clone（**目的是清除服务器 .git 对象库里 murmurs 的旧对象**；`git reset --hard` 本身兼容重写历史但不清对象）→ 恢复 .env 与 Caddyfile → `docker compose up -d` 并确认站点恢复；
   6. 重新启用工作流并用 workflow_dispatch 手动触发一次完整部署，作为「重写历史后部署链完好」的实测；
   7. GitHub 侧残留：force push 后旧 commit 经 SHA 直链仍可访问悬挂对象，联系 GitHub Support 请求 gc，或在交付说明中书面接受该残留风险。
   此步必须在大规模改造提交之前完成。
3. 仓库健康修复（§6 末条）。
4. 新前台重构（品牌/三主题 token 系统/五类页面/RSS）。**分支策略：全程在特性分支（如 redesign/devline）进行**——deploy.yml 监听 main 且 apps/web/** 命中路径过滤，在 main 上开发会把半成品 Devline 直接部署到 qingverse.com（此时 compose 还是 4 容器、Caddy 还在反代 /api、410 规则未就位）。步骤 4 验收通过后，与步骤 5 的全部修改合并为同一批合入 main，一次性切流。
5. 架构精简与切流（与步骤 4 同批合入）：compose 减容器与挂载（见 §6）；Caddy 410 清单与环境变量；**同批修改 `.github/workflows/deploy.yml`：删除 Build & Push API image step；部署脚本删除 API_TAG 的 sed 行；pull/up 命令改为只操作 web（`docker compose pull web && docker compose up -d web && docker compose restart caddy`）**——否则 compose 删掉 api 服务后 `docker compose pull api` 在 set -e 下直接失败、整条部署链中断；顺带把触发条件 content/** 收窄为 content/articles/**（旧内容目录的整理提交不再触发部署；docs/** 本就不触发，规格类提交安全）；部署验证。

## 7A. 风险与回滚

1. **切流回滚路径**：切流前记录当前线上镜像 tag（deploy/.env 的 API_TAG/WEB_TAG）；回滚 = 手动改回旧 tag + 恢复备份的旧 compose/Caddyfile + `docker compose up -d`。旧镜像保留在 ACR（注意 `docker image prune` 只清服务器本地悬挂镜像，不动 ACR）。
2. **filter-repo 不可逆**：唯一恢复途径是步骤 2.1 的 mirror 冷备，冷备在新站稳定运行前不得删除。
3. **切流窗口**：预期短暂停机（步骤 2.5 与步骤 5 各一次），选低流量时段执行，停机时长记入交付说明。

## 8. 验证标准（按全局 CLAUDE.md「完成」定义）

- CI 全绿（lint + tsc + build + CSS size check）仅为必要条件；
- 上线后 MCP Playwright 实测**线上** qingverse.com：
  - **六类页面（首页/列表/详情/项目/关于/统计）× 3 主题 × 2 视口（PC / 375px）的截图矩阵作为验收产物（36 张）**，逐张确认无结构错乱、无未覆盖的硬编码颜色；404 页与两轨道空态一并截图验收；
  - 三主题切换与持久化、`prefers-color-scheme: dark` 落夜航、rail-tab 切换与键盘操作（↑/↓ 方向键、focus ring 可见）；
  - RSS/sitemap 输出正确域名；**旧 URL 前缀返回 410**、未知路径渲染 404 页；
  - 断言首页默认主题下无任何字体网络请求（无 fonts.googleapis / 无 woff2），切到编辑刊/夜航后才出现衬线字体分片请求；
  - Lighthouse 移动端（375px）Performance ≥ 90、LCP ≤ 2.5s；
  - 三主题全部文字色对过 WCAG AA（正文 4.5:1、大字/组件 3:1），axe 或自动化对比度检查进 CI 或实测清单；
  - curl 检查文章页输出 canonical、og:image 绝对 URL、JSON-LD Article 可被 Rich Results Test 解析；
  - **统计链路**：访问任意页面后在 GoatCounter 后台看到计数增长；`/stats` 页在统计服务正常与手动停掉 goatcounter 容器两种状态下分别截图（数据渲染 / 优雅降级不破版）；全站页面不出现「情长」二字（`grep` 构建产物断言）；
- **隐私验收**：force push 后从 GitHub 全新 clone，执行 `git log --all --oneline -- content/blog/murmurs-and-reflection/` 及全历史 grep murmurs 均为零结果（**按内容路径口径**：docs/ 计划文档与历史中的 `apps/web/src/app/murmurs` 旧路由代码含该字样属既定偏差，见阶段一 Task 8 断言与交付说明）；GitHub 网页端访问任一旧 murmurs 文件路径与旧 commit SHA 直链，记录返回结果（404 或悬挂对象仍可达）写入交付说明；确认 `https://qingverse.com/images/blog/...` 旧源文件路径返回 410；
- 部署状态实时确认：镜像 tag、容器版本、`git log` 服务器工作区一致；
- 任何未实测项在交付说明中如实点名。

## 9. 明确不做（YAGNI）

- 评论系统、订阅邮件、后台管理、全文搜索（未来另议）；
- 旧技术内容的 curated collections（等新内容方向稳定后再议）；
- 联系表单；
- 多语言；
- per-article 动态 OG 图（next/og 需内嵌中文字体子集，成本高，上线后另议）；
- 分轨独立 RSS feed；
- Storybook（三主题验收用 /dev/themes 页替代）。
