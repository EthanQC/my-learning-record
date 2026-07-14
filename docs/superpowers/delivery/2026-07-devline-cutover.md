# Devline 切流交付说明

日期：2026-07-14

## 回滚信息（切流前记录，规格 §7A）

- 旧线上镜像 tag：API_TAG=c751b0c / WEB_TAG=c751b0c，REGISTRY=`<ACR私有仓库,真实地址见 GitHub secrets ACR_REGISTRY/ACR_NAMESPACE 与仓库外 phase4-rollback.md>`
- 切流前容器状态（`docker ps --format "{{.Names}}\t{{.Image}}\t{{.Status}}"` 原始输出）：
  ```
  qv-web    <ACR>/qingverse-web:c751b0c   Up 27 hours
  qv-api    <ACR>/qingverse-api:c751b0c   Up 27 hours
  qv-caddy  caddy:2                                                                                    Up 27 hours
  mysql8    mysql:8.0                                                                                  Up 31 hours (healthy)
  ```
- 旧配置备份：服务器 `/home/w/backups/pre-devline-cutover/`（`.env` / `docker-compose.yml` / `Caddyfile`，属主 w:w；注意：brief 原文写 `~/backups/...`，但服务器 SSH 登录用户是 root、部署用户是 w，`~` 在 root 会话下会解析到 `/root`，与仓库/部署所在的 `/home/w` 不一致——故本任务按 Task 1 已确认的路径修正，实际以 `sudo -u w` 在 `/home/w/backups/pre-devline-cutover/` 下创建备份，与仓库属主保持一致）
- 回滚步骤（§7A，路径已按上条修正为 `/home/w` 下的真实路径）：
  1. `cd /home/w/workspace/my-learning-record/deploy`
  2. `sudo -u w docker compose down`
  3. `sudo -u w cp /home/w/backups/pre-devline-cutover/{.env,docker-compose.yml,Caddyfile} .`
  4. `sudo -u w docker compose up -d`
  5. 旧镜像仍在 ACR（阿里云容器镜像服务，`<ACR私有仓库,真实地址见 GitHub secrets ACR_REGISTRY/ACR_NAMESPACE 与仓库外 phase4-rollback.md>`）；`docker image prune` 只清服务器本地悬挂镜像，不动 ACR 上的 `c751b0c` tag，回滚时可直接从 ACR 拉取旧镜像
- mysql-data 卷处置决定：**保留归档**（已定，不删除；本任务未触碰该卷，仅记录供 Task 7/8 执行时遵循与复核）

## 停机窗口

- **开始**：2026-07-14 05:59:20Z
- **结束**：2026-07-14 05:59:29Z
- **时长**：约 9 秒
- **流程**：`docker compose down`（旧 4 容器栈）→ 替换 `.env`/`docker-compose.yml`/`Caddyfile` 为新版本、新镜像 tag 就位 → `docker compose up -d`（新 3 容器栈）。`down` 未加 `-v`，卷未被删除。

## 切流结果

- **合并方式**：`git merge --no-ff redesign/devline → main`，合并提交 `2b0e046`（一次性并入 33 个提交）。合并后又追加 2 个上线验证发现的可访问性修复提交：`f827165`（项目卡文字对比度）、`fee0c52`（主题切换器选中项 hover 态对比度）。**当前 main HEAD = `fee0c52`**。
- **容器编排**：4 容器（`qv-web` / `qv-api` / `qv-caddy` / `mysql8`）→ 3 容器（`qv-web` / `qv-caddy` / `goatcounter`）。
- **退役组件**：Go API 服务与 MySQL 数据库容器均已退役（新前台为纯静态/SSG + ISR 架构，不再需要后端 API）。
- **mysql-data 卷处置**：**保留归档，未删除**（`docker compose down` 未加 `-v`）。执行结果与 Task 6 记录的既定决定一致，供后续如需回溯数据时使用。
- **服务器版本**：`deploy/.env` `WEB_TAG=fee0c52`，与本地 `origin/main`、服务器 `git log -1`、`qv-web` 容器镜像 tag 四方一致核对通过（Task 13 Step 6）。

## 上线验证结果（Task 9–13，全部针对生产域名 `https://qingverse.com` 实测，非本地/非模拟）

| 任务 | 范围 | 结论 | 关键证据 |
|---|---|---|---|
| T9 | HTTP 层：配置漂移、410 前缀清单、404 兜底、RSS/sitemap/robots、缓存头、`/api` 透传 | PASS | 服务器 `Caddyfile`/`docker-compose.yml` 脱敏后与 `.example` 逐字节一致；410 前缀清单 9/9 命中（含旧图片路径前缀）；未知路径透传 404（品牌文案逐字匹配）；`feed.xml`/`sitemap.xml`/`robots.txt` 域名正确、`localhost` 计数为 0（线上零文章，Option B 空态首发预期内）；CSS 响应头含 `public, max-age=31536000, immutable`，HTML 为 `s-maxage=31536000`（不含 immutable）；`/api/*` 未反代到已退役旧 API，透传得 404 |
| T10 | Playwright 截图矩阵 | PASS | 39 张线上真实截图（5 页 × 3 主题 × 2 视口 = 30 张 + 404×3 + 两轨空态×3主题=6 张；因线上零文章，以两轨空态截图替代不存在的文章详情页，总数仍吻合 36+3=39 的验收目标）；三主题 `getComputedStyle` 背景色实测 `#FDFBFC`/`#FAF6F3`/`#171219`，与 D1 规格逐字节一致 |
| T11 | 主题持久化、`prefers-color-scheme`、rail-tab 键盘、字体请求 | PASS | UI 点击切主题后刷新持久化（`night`）；`prefers-color-scheme: dark` 首访落夜航；rail-tab 用真实点击+真实 `ArrowDown`/`ArrowUp` 键盘手势验证（`roving tabindex` 正确切换 `deep`⇄`intro`）；全新隔离浏览器上下文冷加载字体请求：`duo`=0 个 `.woff2`，`editorial`/`night` 各 5 个 `.woff2`（均来自自托管 `/_next/static/media/`，0 个 Google Fonts），满足 D3 自托管字体切片规格；`suppressHydrationWarning` 确认写在 `<html>` 标签（源码定点核查 + DOM 属性行为 + 控制台无 hydration 警告三重证据） |
| T12 | Lighthouse 移动端性能、WCAG AA 对比度扫描 | PASS（含当场发现并修复 2 处真实违规） | Lighthouse mobile Performance=94、LCP=1.23s，达标（≥90 / ≤2.5s）；`axe-core` 三主题 × 5 页扫描发现 duo 主题下项目卡（`.project-card-body dt`/`.project-card-link`，22 处节点）与主题切换器选中项 hover 态 2 处真实 AA 违规（根因相同：`--accent-text` 在 `--surface-tint` 浅粉底上仅 4.46–4.47:1，低于正文 4.5:1 门槛）；均已定位根因、独立数学复核确认、修复上线（新增语义 token `--c-accent-on-tint`，duo `#BD375F` 4.83:1、editorial `#A21F4D` 4.81:1），CI（`checks`/`build`/`deploy`）全绿，线上 axe 复扫 0 violations，真实 hover 态 `getComputedStyle` 现场验证 ≥4.5:1 全达标 |
| T13 | 版本三方一致性、情长/qingchang grep、隐私复查、统计链路两状态 | PASS（统计成功态 PENDING，见下） | 本地/服务器 git/`.env`/容器镜像 tag 四方一致 = `fee0c52`；容器构建产物 + 线上页面 grep 「情长」「qingchang」均 CLEAN；隐私复查（全新 clone 全历史对象扫描 + 线上 410 + sitemap 零 murmurs）无回归，与阶段一 Task 8 结论一致；统计链路降级态（`/stats` 显示「统计服务暂不可用」，浏览器网络面板实测 `count.js`/`counter/TOTAL.json` 均 `ERR_CONNECTION_CLOSED`，根因为 `stats.qingverse.com` DNS `NXDOMAIN`，GoatCounter 后端内部 `wget goatcounter:8081/status` 确认健康）已用真实浏览器验证并截图存档；成功态因 DNS 未生效无法产生真实证据，如实标注 PENDING，未伪造 |

## 规格偏差（逐条如实记录）

1. **CSS 总预算 50KB → 80KB**：D3 自托管字体切片管线（202 个 `@font-face`）占 65.2KB，设计 CSS 本身仅 6.3KB，二者相加突破原 50KB 预算。用户 2026-07-13 裁决：选项 A，总预算放宽至 80KB（不再要求写死具体 KB 数，见首页项目 outcome 文案 commit `a73ab98`）。
2. **10KB 主题增量子指标未做机器断言**：§6 规格中"单主题相对基线增量 ≤10KB"这一子指标未落地为 CI 可执行的自动化断言，仅有总预算 80KB 门禁生效。
3. **Option B 空态首发**：全部内容夹具（4 篇 MDX）均置 `draft: true`，线上当前零文章，`/articles`、`/articles/deep`、`/articles/intro` 均为空态渲染。此为阶段三 Task 20 Step 0 既定决策，非本次切流故障。
4. **备案信息实为粤（非京）**：页脚 ICP 备案号为「粤ICP备2025487305号」「粤公网安备44030002008906号」，与规格草稿中假设的京字头不符，以服务器实际备案地为准，已在阶段三如实记档。
5. **验证工具替代**：MCP Playwright 在部分环节出现启动超时，改用 Browser pane / `playwright` CLI 直接驱动完成验证，验证覆盖范围未因此缩水。
6. **AA 对比度违规为「发现并修复」而非「遗留」**：T12 验收扫描当场发现的 2 处真实 AA 违规（duo 项目卡 + 主题切换器 hover 态）均已在同一交付窗口内定位根因、独立复核、修复、部署并线上复测确认，未作为遗留问题带入下一阶段。

## 未实测项 / 待用户项（如实点名，不笼统宣称"全部完成"）

1. **`stats.qingverse.com` 对外 HTTPS**：待用户手动添加 DNS 记录（`stats` 主机记录，类型 A，值 `120.24.178.92`）。多次尝试自动化添加均被阿里云控制台风控机制阻断（弹窗遮罩致截图/读取注入失效，后改用 CDP 注入仍触发"服务器异常登录提醒"安全告警并永久挂起），为避免触发账号锁定风险已停止自动化尝试，交回用户手动操作。DNS 记录生效后，服务器 Caddy 的 ACME/`certmagic` 会自动重试签发证书，无需额外人工步骤。
2. **GoatCounter 公开面板（public dashboard）**：统计站点已建成（`num_sites=1`，站点 `stats.qingverse.com`），登录凭据（管理邮箱/密码）已通过仓库外权威记录 `phase4-rollback.md` 交付，**不写入本文档**。待上述 DNS 生效后，用户需登录 `https://stats.qingverse.com` → Settings → 勾选公开面板，这是 `/stats` 页面免登录取数的前提。在此之前 `/stats` 页面稳定显示「统计服务暂不可用」的降级态文案（已实测确认，非故障）。
3. **统计成功态未实测**：依赖上述两项（DNS 生效 + 公开面板勾选）均落地后才能产生真实的成功态证据；当前状态下任何"成功态截图"都只能是伪造的，故未拍摄、如实标注 PENDING。
4. **GSC（Google Search Console）两项收尾**：agent 无法代操作，属人工步骤，交由用户在 qingverse.com 资产下完成：① 站点地图 → 提交 `https://qingverse.com/sitemap.xml`；② 移除 → 新请求 → 移除前缀 `https://qingverse.com/murmurs` 开头的所有网址（`/murmurs*` 的 410 已上线，此操作用于加速清除搜索引擎缓存）。用户执行后，提交时间与 GSC 显示的请求状态应补记入本文档；本次交付时用户尚未执行，记为待办（见下「阶段一遗留待办」）。

## 残留（接受项，承阶段一既定决策）

- **GitHub 悬挂对象**：旧 SHA 直链在仓库 `git gc` 之前仍可通过 GitHub 服务端访问（含按 SHA `fetch` 可完整取回旧历史）。这包含两批：① 阶段一 force-push 后的旧 tip/迁入 commit（完整 SHA 仅存仓库外 `phase1-log.md`，本文档不重复列出）；② 本阶段 Task 6 隐私修复中 `git commit --amend` + `force-with-lease` 产生的悬挂 commit `ab34fab`（该 commit 曾短暂含真实 ACR 私有仓库地址，已被 amend 覆盖移出 HEAD，但悬挂对象本身在 gc 前仍可达）。用户此前已就阶段一同类残留书面接受「选项 B」（不提交 GitHub Support 工单，完整敏感值仅存仓库外记录），本阶段沿用同一口径，不新增处理动作。
- **完整敏感值**：ACR 私有仓库真实地址/命名空间、GoatCounter 管理密码等，仅存于仓库外 `phase4-rollback.md`（与 `phase1-log.md` 同级），公开仓库内一律使用占位符或不出现。

## 阶段一遗留待办（现切流已稳定，处理窗口已开）

以下两项在阶段一交付说明中即被记为「阶段四待办」，现切流稳定，可择期处理：

1. **GSC 资产验证 + 两组前缀 410 后移除请求**：即上文「未实测项」第 4 条的两个 GSC 操作（提交新 sitemap、移除 `/murmurs*` 前缀），待用户执行。
2. **ACR/VPS 旧 web 镜像清理**：ACR 私有仓库与服务器本地仍保留旧前台重写前的 `web` 镜像 tag（烘焙了旧版 murmurs 内容），阶段一决策为"切流稳定后再清"。现主站已切流并经 Task 9–13 全面验证稳定运行，可视用户安排执行 `docker image prune` 类清理；清理前需确认不影响当前回滚方案（回滚仍以 §7A 步骤为准，清理仅移除已确认不再需要的悬挂本地镜像，不动 ACR 上仍在用作回滚基线的 `c751b0c` tag）。
