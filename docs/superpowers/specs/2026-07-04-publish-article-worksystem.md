# Devline 发文流水线 · Work System Card

日期：2026-07-04（system-wright 设计产物）
路由：Loop 级 + Skill 化（可复用系统，完整轨道）
用户已确认：操作者=Claude Code 一句话调用；草稿来源=任意路径；审批门=预览确认+push 确认两道；发后验证=全套。

## 系统概览

- **System name**：publish-article（Devline 发文流水线）
- **Intended user**：EthanQC（站主，经 Claude Code 操作）
- **Job-to-be-done**：把一篇写好的文章从任意路径可靠地发布到 Devline 网站并完成线上验证，全程不改动正文内容
- **Trigger**：在 Claude Code 中说「发布 <文章路径>」（或 /publish-article <path>）
- **Inputs**：文章文件路径（仓库内外皆可，.md/.mdx）；可选指定 track / slug / tags
- **Outputs**：已上线且通过全套验证的文章页 + PUBLISH_LOG.md 中一条带证据的发布记录

## 四层设计

### Prompt 层

- 角色：发布编排者（不是编辑——**绝不改写正文文字**，只处理 frontmatter / 路径 / 图片引用）。
- 决策规则：track 归属与 slug 命名由系统给建议（依内容判断深度线/科普线、生成 kebab-case 英文 slug），**人拍板**；date 取当天；summary 缺失时从正文首段提议，人确认。
- 输出格式：阶段① 产出「发布工单」（track/slug/title/date/tags/summary/图片清单）供确认；收尾产出「验证报告」（每项验证 = 命令/截图证据，不接受"已完成"式空话）。

### Context 层

- 唯一校验事实源：`apps/web/src/lib/content-schema.ts`（zod schema，设计文档 v3 §3）——skill 文案不复制 schema 细节，永远以脚本为准。
- 必读：设计文档 v3 §3（内容策略）、`content/articles/PUBLISH_LOG.md`（历史发布记录与已知坑）。
- 环境事实：push main + 命中 `content/articles/**` 路径过滤 = 自动触发 CI 构建部署（deploy.yml）；文章 URL 规则 `/articles/<track>/<slug>`。

### Harness 层（权限分层 + 验证阶梯）

权限分层：

| Tier | 动作 | 门 |
|---|---|---|
| 0 读 | 读文章、读日志、读仓库状态 | 无 |
| 1 仓库内写（可逆） | 创建 `content/articles/<track>/<slug>.mdx` 与 `<slug>.assets/`、改写图片相对引用、本地 commit | 无（git 可逆） |
| 2 外部写（不可逆） | `git push`（= 触发线上部署） | **审批门②，永不自动** |

验证阶梯（便宜的确定性检查在前，人工在后）：

1. 【确定性】zod frontmatter 校验 + 图片引用存在性检查（`node scripts/validate-article.mjs <path>`）
2. 【确定性】`npm run build:web` 本地构建通过（MDX 编译 + 全站校验）
3. 【人工·门①】本地预览目检：`npm run dev:web` 打开文章页，三主题快速切一遍，用户确认排版
4. 【确定性】push 后 `gh run watch` 至 CI 全绿
5. 【确定性】线上断言：`curl -s https://qingverse.com/articles/<track>/<slug>?v=<sha>` 返回 200 且含标题；RSS 与 sitemap 含新条目（curl + grep）
6. 【规则+抽查】Playwright 实拍线上文章页（默认主题 + 随机另一主题 × PC/375px 各一张）
7. 【确定性】GoatCounter 收到该路径计数（访问一次后查 counter JSON）

guardrails：只允许触碰 `content/articles/**` 与 PUBLISH_LOG.md（git add 白名单路径）；禁 force push；禁改正文文字；CI 失败只允许 1 轮诊断修复，第 2 次同类失败停下升级给人。

### Loop 层

- 循环类型：**例行执行循环**（每篇一 run）+ **改进循环**（LOG 累积摩擦，定期反哺 skill）。
- Stop condition：验证 7 项全绿 → 输出报告收尾；任何一步失败 → 修复一轮，再失败即停并升级（不无限重试）。
- Budget：单次发布 ≤1 次 CI 往返（禁止靠反复 push 试错）；预览服务器用完即停。
- Observability：每 run 向 `content/articles/PUBLISH_LOG.md` 追加——时间 / 源路径 / slug / track / CI run id / 7 项验证矩阵 / 耗时 / 异常与处理。
- **禁止手段**（防指标游戏）：不许删改必填 frontmatter 以骗过校验；不许用 `draft: true` 先发再翻牌绕过预览门；不许跳过验证阶梯任何确定性步骤宣布完成。

## Top 运行期失败模式（自 failure-modes.md）与缓解

1. **Verification failure**（maker 自评：CI 绿即宣布完成，线上实为旧缓存/断图）→ 线上验证全部确定性命令（curl 带 cache-bust、断言标题串），Playwright 实拍留档，完成定义 = 证据链而非表态。
2. **Tool failure**（push 这个外部写被当成日常只读操作顺手做掉）→ push 独立为 Tier 2 + 审批门②；git add 只收白名单路径，工单未确认前不产生 commit。
3. **Loop-control failure**（CI 偶发红引发反复 push 重试、部署抖动）→ 重试上限 1；失败原因写入 LOG；第 2 次同类失败升级给人。

## 人工判断门

- track 归属与 slug 命名（系统建议、人拍板）；
- 门①预览目检（发布不可撤回——RSS/搜索引擎/缓存，上线前的最后一道人眼）；
- 门② push 确认；
- 反 cognitive surrender：验证报告必须逐项附证据（命令输出/截图路径），用户可抽查任意一项。

## MCP / Orchestrator / Skill 决策

- **MCP：不需要新增**。Playwright MCP 已在环境中；GoatCounter 走 curl 公开端点；无新外部系统接入。
- **Orchestrator：不需要**。单角色顺序流水线，无并行分支与多角色评审；CI 是现成的执行器不是编排器。
- **Skill：是**——沉淀为项目 skill `.claude/skills/publish-article/`（SKILL.md 流程指令 + 复用阶段三产出的校验脚本）。skill 即产品，一句话触发。

## 最小可用版本（v1）与扩展路径

- **v1**：intake → 工单确认 → 规范化落位 → 确定性校验 → 预览门① → commit → push 门② → CI watch → 线上全套验证 → LOG 记录。v1 唯一的外部写（push）永远在审批门后。
- **不做**：定时/排期发布、跨平台自动分发、批量发布、正文润色。
- **扩展路径**：排期发布（draft + 定时 workflow）→ 发布后生成小红书/公众号分发**草稿**（只生成不自动发）→ 批量模式。

## Trial Run（mode: design-consistency dry-run）

真实 run 依赖阶段三（content-schema.ts / build 管线）与阶段四（线上环境）落地，当前只能做设计一致性推演：

- 测试输入：假想文件 `~/Notes/优雅停机.md`，正文含两张本地图片引用，无 frontmatter。
- 推演：① intake 读文件→建议 track=deep、slug=`go-graceful-shutdown`、date=当天，列出 2 张图片→工单确认 ✓；② 落位 `content/articles/deep/go-graceful-shutdown.mdx` + `.assets/`（2 图拷入、引用改写）✓；③ validate 脚本因缺 summary 而 fail →回到工单补 summary（失败路径有出口，不会带病前进）✓；④ build 过→预览门①→commit（白名单路径）→门②→push→CI watch→7 项线上断言→LOG 追加 ✓。
- Observed capability：流程闭合，两道门位置与不可逆点对齐，每个失败分支都有明确出口（修复/升级），无一步依赖"agent 说好了就是好了"。
- Observed limitation：干跑无法验证 CI 时长、GoatCounter 计数延迟、Playwright 对线上首屏的实际断言——**首篇真实发布时按本卡逐项对照，偏差记入 LOG 并修订本卡**。

## 交接（Daily-Use Protocol）

**可复制的启动提示词**：

```text
发布 <文章路径>[ 到深度线/科普线][，slug 用 <slug>]
按 publish-article 流程走：先给我发布工单确认，预览和 push 前都要单独问我，最后给带证据的验证报告。
```

**PUBLISH_LOG.md 单条记录模板**：

```markdown
## 2026-MM-DD <slug>
- 源：<原路径> → content/articles/<track>/<slug>.mdx
- CI: run <id> ✅ | 线上: curl ✅ RSS ✅ sitemap ✅ Playwright ✅(截图x4) 统计 ✅
- 耗时：<分钟> | 异常：<无/描述与处理>
- 摩擦点：<下次想改进什么>
```

- **First task**：阶段三合并后，创建 `.claude/skills/publish-article/SKILL.md`（按本卡 Prompt 层写指令），用第一篇真实文章（建议科普线）走全流程，把干跑推演与真实表现的差异记入 LOG。
- **Review rule**：每发 5 篇复盘一次 LOG 的摩擦点栏，把重复出现的手工环节改进进 skill；首月内每篇发布后抽查一项验证证据的真实性。
