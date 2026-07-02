# Devline 改版设计文档

日期：2026-07-03
状态：待用户审阅
前置调研：5 路并行仓库审计（前端 / Go API / 内容资产 / 仓库健康 / 部署 CI），截图分析断言全部核实属实。

## 1. 背景与目标

现站 qingverse.com 是「情长」——粉色情感风格的个人学习记录站（Next.js 16 + Go API + MySQL，阿里云 VPS Docker Compose 部署）。本次改版将其重塑为技术 IP 平台 **Devline**。

**目标优先级**（用户确认）：

1. **技术影响力**（主目标，未来 6–12 个月）：网站是内容中枢，首页为最新/最好的内容服务；
2. 求职/招聘方背书（次级）：项目板块承载；
3. 副业获客（次级）：关于页联系方式承载，不做表单。

**关键决定**：新站从零开始。所有旧内容（碎碎念 68 篇、八股/面经/学习记录 276+ 篇、tech-intro 10 篇）全部下线；除碎碎念外源文件保留在仓库。改造在原仓库 my-learning-record 内进行（方案 A），仓库保持公开。

## 2. 品牌

- **站名/主标识：Devline**（用户的平台品牌名）。品牌梗：Dev + line，双线内容战略——一条线给工程师（深度线），一条线给所有人（科普线）。
- **域名：qingverse.com 不变**。
- **「情长」退居 About 页**：作为站点起源故事保留（"为什么域名叫 qingverse"），老读者情感联结不丢，前台不再出现。
- **粉色保留但升级**：从满屏粉底改为品牌点缀色（rail、标签、强调、选中态）。

## 3. 内容策略

- 新内容目录 `content/articles/<track>/<slug>.mdx`，track ∈ `deep`（深度线）| `intro`（科普线）。
- frontmatter：`title / date / tags / summary / track / draft`。`draft: true` 不构建。构建时校验 frontmatter 完整性，缺字段直接 fail build。
- 发布流程：写 MDX → git push → CI 构建部署。
- 旧内容处置：
  - `content/blog/murmurs-and-reflection/`（68 篇情感内容 + 照片）：**迁出到独立私有仓库，并用 git-filter-repo 从本仓库全部历史中抹除**（仓库公开，仅站点下线藏不住）；
  - 其余旧内容（notes / interview-experiences / internship-records / tech-intro 等）：保留源文件、不接入站点，未来另行决策；
  - 两条线各自为空时，轨道区显示引导文案（如"深度线首篇打磨中"），不留空白。

## 4. 三主题系统

用户决定做三个访客可切换的主题（不是三套设计，是一套骨架三套皮肤）：

| 主题 | 气质 | 亮/暗 | 角色 |
|------|------|-------|------|
| **双线**（B） | 几何图形、双线贯穿、墨线+玫瑰线 | 亮 | **默认主题 + 品牌主题**（站外形象：OG 卡片、favicon 的视觉母体） |
| **编辑刊**（A） | 暖纸底、衬线大标题、编辑红点缀 | 亮 | 备选亮色风格 |
| **夜航**（C） | 暗紫底、粉色辉光、衬线+等宽混排 | 暗 | **兼任暗色模式** |

技术约束与机制：

- **同一套 DOM 骨架**，主题只经 `data-theme` + design token（CSS 自定义属性）+ 少量主题作用域装饰 CSS 切换；任何主题不得改变页面结构。
- 导航栏内置主题切换器（三选一）；选择存 localStorage；`<head>` 内联防闪烁脚本。
- 首次访问：`prefers-color-scheme: dark` → 夜航；否则 → 双线。
- 每个新组件必须在三个主题下各自验收（长期纪律）。

## 5. 页面与布局

页面：`/`（首页）、`/articles`（列表，全部/深度/科普筛选）、`/articles/<track>/<slug>`（详情）、`/projects`、`/about`、404、RSS（`/feed.xml`）、`sitemap.xml`、`robots.txt`。

**首页结构（三主题共用，用户逐项确认）**：

1. 导航：Devline 标识（"line"下双线装饰）+ 首页/文章/项目/关于 + 主题切换器；
2. Hero：双线宣言标题 + 副文案；
3. **头条通栏**：最新一篇（不分轨道）带轨道标记的大卡片；
4. **轨道切换器（rail-tab，本站签名交互）**：两条线（墨=深度、粉=科普）横贯页面全宽，**标签骑在线上、靠右放置**；选中态 = 线加粗变实 + 标签填色带阴影，未选中态 = 线细淡 + 标签描边；点击切换下方文章列表，切换带过渡动画；访客上次选择存 localStorage；
5. 当前轨道文章列表 + "沿 X 线看全部 →"；
6. 项目区：3 卡（移动端单列）；
7. 页脚：半墨半粉双色顶线 + 情长起源链接 + RSS/GitHub/小红书。

**响应式（硬要求：PC 与手机体验对等）**：

- PC 与手机同一结构，无布局分叉；**PC 内容容器居中**（非靠左）；
- 手机：导航折叠汉堡菜单（第三道杠粉色）、rail-tab 原样保留、**标签文字不删减**（「深度线 · 给工程师」全文，只缩字号内边距）、项目单列；
- 触控目标 ≥ 44px；字号用 clamp() 流式缩放。

**设计打磨**：实施阶段用 frontend-design 技能做完整视觉工艺（字阶、间距节奏、切换动画、hover 微交互、主题过渡），mockup 仅为布局骨架基线。

## 6. 技术架构（做减法）

- **前端**：Next.js 升级 16.2.x（修 14 条安全公告）；全静态生成（SSG + generateStaticParams），去掉 force-dynamic；文章构建时从本地 MDX 读取（gray-matter + 现有 unified 管线迁移）；字体 next/font 自托管（弃 Google Fonts @import）。
- **Go API + MySQL 退役**：compose 从 4 容器（mysql/api/web/caddy）减为 2（web/caddy）；`apps/api` 代码保留仓库归档；Caddy 移除 `/api/*` 反代；ContactForm 组件与 `/api/contact` 链路整体删除，联系方式 = mailto + 社交直链。
- **设计 token**：CSS 自定义属性承载三主题（颜色/字体/装饰参数），Tailwind 引用 token 而非硬编码色名。
- **旧 URL**：全部 301 到首页（Caddy 统一规则）。现 sitemap 输出 localhost URL（`NEXT_PUBLIC_SITE_URL` 未配置），搜索引擎实际未有效收录，无断链包袱；新站正确配置该变量。
- **仓库健康（一并修）**：删除 tsconfig 非法 `ignoreDeprecations`；关闭 `typescript.ignoreBuildErrors`；lint 脚本从已废弃的 `next lint` 改为 `eslint .` 并清零现存 12 error / 5 warning；**CI 增加 lint + tsc + build 门禁**（现 CI 只构建不检查）。

## 7. 迁移顺序

1. **止血**：push 本地领先的 28 个 commit（纯 tech-intro 内容文件，不影响线上表现，防丢工作）；
2. **隐私**：新建私有仓库存放 murmurs → `git-filter-repo` 抹除本仓库历史 → force push → **服务器重新 clone**（部署用 `git reset --hard`，需实测重写历史后部署链完好）；此步必须在大规模改造提交之前完成；
3. 仓库健康修复（§6 末条）；
4. 新前台重构（品牌/三主题 token 系统/五类页面/RSS）；
5. 架构精简与切流（compose 减容器、Caddy 301 与环境变量、部署验证）。

## 8. 验证标准（按全局 CLAUDE.md「完成」定义）

- CI 全绿（lint + tsc + build）仅为必要条件；
- 上线后 MCP Playwright 实测 **线上** qingverse.com：五类页面渲染、三主题切换与持久化、rail-tab 切换、375px 视口移动端布局、RSS/sitemap 输出正确域名、旧 URL 返回 301、`prefers-color-scheme: dark` 落夜航；
- 部署状态实时确认：镜像 tag、容器版本、`git log` 服务器工作区一致；
- 任何未实测项在交付说明中如实点名。

## 9. 明确不做（YAGNI）

- 评论系统、订阅邮件、后台管理、全文搜索（未来另议）；
- 旧技术内容的 curated collections（等新内容方向稳定后再议）；
- 联系表单；
- 多语言。
