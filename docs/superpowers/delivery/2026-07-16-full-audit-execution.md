# Devline 全量审查与执行交付说明

日期：2026-07-16 ｜ 范围：整个仓库（四阶段计划 + 设计规格 + 发文系统规格 vs 实际状态）｜ 结果：**审计确认四阶段全部完成且线上健康；新发现 17 项可执行缺口，本次全部执行完毕并部署上线（HEAD/线上 = `819ad27`）；余 5 项待用户**

## 一、审查方式

多代理审计工作流：8 个维度（阶段一~四计划、总设计规格、发文系统规格、仓库卫生、web 代码质量）各一个审计代理逐项核对文档要求 vs git 历史/文件/线上实态，非 done 项再各派一个怀疑式复核代理找反证，共 38 个代理、约 191 万 token。所有采信结论均有可复查证据（commit SHA / 文件行号 / curl 输出 / SSH 实测）。

## 二、存量结论：四阶段全部完成，线上健康

- **阶段一（隐私迁移）**：8 任务全部复核通过。murmurs 三路径全历史 0 commit、私仓树哈希与冷备逐字节一致、服务器无旧对象、线上 410。**好于记载的发现**：交付说明记为"可选、不做"的旧 Actions run/缓存清理实际已完成（旧 run 404、79 个缓存全部晚于重写），已补记入交付说明。
- **阶段二（仓库健康）**：7 任务 commit 链完整（a6cb211→c751b0c），豁免未回潮，门禁在位。
- **阶段三（前台）**：全部 Task 落地，T9-T13 上线验证 PASS；唯计划验收命令口径存在 cwd 陷阱（本次已修，见下）。
- **阶段四（切流）**：3 容器架构稳定运行；今日四方一致复核（本地 git = origin = 服务器 git = `.env`/容器 tag）通过；410 清单 9/9、/api 透传 404、RSS/sitemap/robots、缓存头、统计成功态（累计 PV 5 / UV 5，GoatCounter 公开面板免登录可访）全部实测正常。

## 三、本次执行的 17 项（7 个 commit，`332fb02..819ad27`，CI run 29501589747 全绿）

**CI / 质量门禁（commit `5cf384e`、`1e8bb29`）**

1. **CI 从不跑单测（严重）**：checks 加 Unit tests 步骤。此前 6 个测试文件是死代码级覆盖，套件断裂无人发现。
2. **测试套件断裂**：仓库根口径 railtab 假失败（根无 tsconfig → JSX 转译回退）、apps/web 口径 tokens.test ENOENT（硬编码仓库根前缀）——两口径互斥。tokens.test 改 `import.meta.url` 定位，跑法固化为 `npm test`（根委托 workspace），13/13 绿；phase3 计划补勘误注。
3. **触发路径静默漂移**：`on.push.paths` 补 `scripts/**`、`package.json`、`package-lock.json`（checks 直接执行 scripts/ 门禁脚本、Docker 构建依赖根锁文件，单独改动此前不触发 CI）。
4. **10KB 主题增量子指标落地为机器断言**（规格偏差 #2 清零）：check-css-size.mjs 抽取全部 `[data-theme]` 作用域规则 gzip 合计 ≤10KB，实测 1.7KB。
5. **GSC/Bing 验证串注入通道打通**：Dockerfile ARG + deploy build-args（读 GitHub Variables）。此前 layout.tsx 在读但构建期恒为空，meta 验证方式实际不可用。

**设计补齐（commit `332fb02`，D5 差异表 vs mockup 逐项核对）**

6. editorial 按钮/空态框 2px、标签胶囊 10px 圆角（此前全主题 0 圆角，D5 明文要求）。
7. editorial 期刊大序号 01/02（CSS counter，token `--ordinal-color` #D9C2CB，D1 纯装饰豁免 + content 备选文本置空对辅助技术隐藏）。
8. night hero 引子启用 D5 第二种前缀语言 `$`（其余章节维持 `//`）——三主题浏览器逐一目检确认。

**页面修复（commit `487cd0c`）**

9. `/articles` 全部页补空态：track 子页有空态而全部页没有，线上零文章期整页留白；文案「首批文章打磨中 · 先看看正在做的项目 →」链 /projects（不复用跨轨 CTA——两轨同空时会指向另一个空页）。已上线实测。

**发文工作系统 First task（commit `f6b3528`，规格 2026-07-04 首次落地）**

10. `scripts/validate-article.mjs`：zod frontmatter（复用 content-schema.ts 单一事实源）+ 图片引用存在性校验，成功/失败双路径实测。
11. `content/articles/PUBLISH_LOG.md`：交接节模板表头初始化。
12. `.claude/skills/publish-article/SKILL.md`：完整流程指令（两道人工门/白名单/Budget/7 项线上验证）；`.gitignore` 收窄为 `.claude/*` + `!.claude/skills/`。

**文档与仓库卫生（commit `0a438ad`、`819ad27`）**

13. **根 README 重写**（763 行旧站说明书 → Devline 现架构）：删 Go+MySQL/Swagger/API_TAG 全部字样、go-mod badge、152 条死链目录索引，以及 **63 条 murmurs 死链**（隐私迁移一致性，最高优先）；license badge 摘除（无 LICENSE 实体）。
14. apps/web/README 从 create-next-app 原始模板重写为项目实况。
15. 残留清理：package.json 描述/main/packages\* 空壳、tsconfig 死别名 `@lib/*`、死依赖 @tailwindcss/typography、.env.local.example（原指向已退役 API）、next.config.ts 过时缓存注释（与 Caddyfile 互相指认矛盾）、`.vscode/`（Windows C++ 残留，入 gitignore）、废弃脚本 add-frontmatter/generate-summaries 删除、fix-frontmatter 遍历收窄排除 content/articles。
16. **验证截图归档（抢救易失数据）**：42 张切流验证截图从 /private/tmp 会话目录归档至 `~/backup-devline/phase4-screenshots/`；补拍 stats 成功态与 GoatCounter 公开面板 2 张入 `supplement-2026-07-16/`；路径清单补入切流交付说明（Task 14 验收补齐）。
17. 交付说明补记（md/html 同步）：切流文档 HEAD 时点表述、d578aae/d80181d 交付后提交、规格偏差第 7 条（D6 退场动效机制取舍）与第 8 条（在线数→今日 PV 替代）、偏差 #2 已补齐标注、GSC 通道说明；阶段一文档旧 run 实清补记。

## 四、上线验证（全部真实系统实测，非本地推断）

- CI run **29501589747** 全绿（含新 Unit tests 步骤首跑）→ 自动部署。
- **四方一致 = `819ad27`**：本地 origin/main = 服务器 git log -1 = `deploy/.env` WEB_TAG = qv-web 容器镜像 tag（SSH 实测）。
- 线上探针：`/articles` 渲染新空态文案（curl 断言命中）、home/stats 200、410 清单与 /api 透传复测正常。
- 浏览器实测：三主题目检（editorial 序号/圆角、night `$`/`//` 前缀、辉光正常）；stats 成功态 tiles 渲染（累计 PV 5/UV 5）；GoatCounter 公开面板免登录可访。
- 本地门禁全绿：lint / tsc / 13 单测 / build / CSS 71.7KB≤80KB + 主题增量 1.7KB≤10KB / no-raw-hex。

## 五、待用户项（agent 无法代操作或需用户拍板）

1. **GSC 两项收尾**：先完成 qingverse.com 资产验证——现在有两条路：① 在仓库 Settings → Secrets and variables → Variables 配 `NEXT_PUBLIC_GSC_VERIFICATION`（meta 通道本次已打通，配好后任意一次部署即生效）；② DNS TXT 验证。验证后：提交 sitemap `https://qingverse.com/sitemap.xml` + 移除前缀 `https://qingverse.com/murmurs`。完成后补记入切流交付说明。
2. **ACR 云端旧镜像清理**（可选，风险低）：ACR 控制台删除重写前旧 web tag，保留 `c751b0c` 回滚基线。需 ACR 凭据。
3. **首篇真实文章发布**：发文系统已就绪，对 Claude Code 说「发布 <文章路径>」即走全流程（First task 后半段：真实 run 偏差记入 PUBLISH_LOG）。这是让站点走出 Option B 空态的唯一路径。
4. **LICENSE 决策**：仓库现无 LICENSE 文件（badge 已摘）；package.json 仍声明 ISC。开源则补 LICENSE 文件，不开源建议改 `"license": "UNLICENSED"`。
5. **avatar.jpg 去留**（phase3 人工确认清单唯一未闭环项）：`apps/web/public/avatar.jpg` 留仓未用——删除，或在关于页启用照片。

## 六、残留接受项（口径不变）

GitHub 悬挂对象（gc 前旧 SHA 直链可达，用户已书面接受选项 B；可发现性已随旧 run 清理收窄至"需预知完整 SHA"）；完整敏感值仅存仓库外 `phase4-rollback.md`/`phase1-log.md`。
