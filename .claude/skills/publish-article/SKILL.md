---
name: publish-article
description: Devline 发文流水线——把一篇写好的文章从任意路径可靠发布到 qingverse.com 并完成全套线上验证，全程不改动正文内容。触发语：「发布 <文章路径>」或 /publish-article <path>，可选指定 track/slug/tags。
---

# publish-article —— Devline 发文流水线

角色：**发布编排者，不是编辑**——绝不改写正文文字，只处理 frontmatter / 路径 / 图片引用。
规格事实源：`docs/superpowers/specs/2026-07-04-publish-article-worksystem.md`（本 skill 的上位文档）；
frontmatter 唯一校验事实源：`apps/web/src/lib/content-schema.ts`（zod schema，勿在此复制字段规则）。
必读上下文：`content/articles/PUBLISH_LOG.md`（历史记录与已知坑）。

## 环境事实

- 文章落位：`content/articles/<track>/<slug>.mdx`（track ∈ deep|intro），图片收纳同名 `<slug>.assets/`
- push main 命中 `content/articles/**` 即自动触发 CI 构建部署（`.github/workflows/deploy.yml`）
- 文章 URL：`/articles/<track>/<slug>`；`$SITE` = 当时生效的正式域名（现为 https://qingverse.com，勿硬编码进断言脚本）

## 权限分层（Harness）

| Tier | 动作 | 门 |
|---|---|---|
| 0 读 | 读文章、读日志、读仓库状态 | 无 |
| 1 仓库内写（可逆） | 落位 mdx 与 `.assets/`、改写图片相对引用、本地 commit | 无（git 可逆） |
| 2 外部写（不可逆） | `git push`（=触发线上部署） | **审批门②，永不自动** |

guardrails：git add 白名单只收 `content/articles/**`（含 PUBLISH_LOG.md）；禁 force push；禁改正文文字；禁删改必填 frontmatter 骗过校验；禁用 `draft: true` 先发再翻牌绕过预览门；禁跳过任何确定性验证步骤宣布完成。

## 流程（v1，逐步执行）

1. **intake**：读源文件（仓库内外皆可）。依内容建议 track（深度线=源码/架构/写给工程师；科普线=讲给所有人）与 kebab-case 英文 slug；date 取当天；summary 缺失时从正文首段提议。
2. **工单确认（人拍板）**：输出发布工单——track / slug / title / date / tags / summary / 图片清单——等用户确认或修改。**未确认不产生任何写操作。**
3. **落位**：创建 `content/articles/<track>/<slug>.mdx` 与 `<slug>.assets/`（图片拷入、正文相对引用改写为 `./<slug>.assets/...`）。
4. **确定性校验**：`npx tsx scripts/validate-article.mjs content/articles/<track>/<slug>.mdx`（zod frontmatter + 图片存在性；失败先修复再继续）。
5. **本地构建**：`npm run build:web` 通过（MDX 编译 + 全站校验）。
6. **预览门①（人工）**：`npm run dev:web` 打开文章页，三主题各切一遍请用户目检排版；用户确认后停掉预览服务器。
7. **commit**：只 add 白名单路径，提交信息 `content: 发布 <slug>（<track>）`。
8. **push 门②（人工，永不自动）**：单独请求用户确认后 `git push`。
9. **CI watch**：`gh run watch` 至全绿。CI 失败只允许 1 轮诊断修复（该轮修复 push 正当、计入 Budget 第 2 次）；第 2 次同类失败停下升级给人。
10. **线上全套验证（每项附证据，不接受"已完成"式空话）**：
    - `curl -s -o /dev/null -w '%{http_code}' "$SITE/articles/<track>/<slug>?v=<sha>"` = 200（cache-bust）
    - `curl -s "$SITE/articles/<track>/<slug>" | grep -qF "<标题>"`
    - RSS（`$SITE/feed.xml`）与 sitemap（`$SITE/sitemap.xml`）含新条目（curl + grep）
    - Playwright 实拍线上文章页：默认主题 + 随机另一主题 × PC/375px 各一张
    - GoatCounter 计数：访问一次文章页后 `curl -s "https://stats.<域名>/counter/<url-encoded 路径>.json"` 计数 +1
11. **LOG 记录**：按 `content/articles/PUBLISH_LOG.md` 模板追加一条（时间/源路径/slug/track/CI run id/验证矩阵/耗时/异常/摩擦点），随下一次白名单 commit 入库。
12. **收尾报告**：输出验证报告——每项验证 = 命令输出/截图路径证据。

## Budget 与停止条件

- 单次发布 ≤2 次 CI 往返（正常 1 + 正当修复 1；禁止反复 push 试错刷第 3 次）
- 验证全绿 → 输出报告收尾；任何一步失败 → 修复一轮，再失败即停并升级给人
- 预览服务器用完即停

## 复盘规则（改进循环）

- **每发 5 篇**复盘一次 PUBLISH_LOG 的「摩擦点」栏，把重复出现的手工环节改进进本 skill；
- **首月内**每篇发布后抽查一项验证证据的真实性（防 cognitive surrender：证据链必须经得起抽查）。

## 不做

定时/排期发布、跨平台自动分发、批量发布、正文润色。
