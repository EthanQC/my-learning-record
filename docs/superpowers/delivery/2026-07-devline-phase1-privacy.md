# Devline 阶段一交付说明：止血与隐私迁移

日期：2026-07-12　执行依据：specs/2026-07-03-devline-redesign-design.md §7 步骤 1–2、§8

> 脱敏口径：本文进公开仓库。被抹除历史的旧 commit SHA 一律用代称「旧 tip」「迁入」，照片与私仓真实名不在此出现；完整值仅存仓库外 `phase1-log.md`（`/Users/abble/backup-devline/`）。重写后的新 main SHA 属公开信息，正常引用。

## 已完成并实测

- **止血 push**：39 个 commit（38 个领先 commit + 1 个计划/归档新提交），CI run `29161727843` success，线上仅分类标签变化（预期）。
  - 开工前先做 deploy.yml 空跑预验证：workflow_dispatch run `29161456713` success——部署链此前约 4 个月未运行，先证明链路可用再动历史。
- **冷备**：`/Users/abble/backup-devline/my-learning-record-mirror.git`（新站稳定运行前不得删除，§7A.2）。
- **murmurs 全历史提取**：3 个历史路径已提取至私仓（真实名见仓库外 phase1-log.md，`isPrivate=true` 创建前已核）。按选项 B（照片一并迁移）清点 72 文件 = murmurs 目录 70（69 md + 1 jpg，文件名见 phase1-log.md）+ 2 张站外照片（文件名见 phase1-log.md）；murmurs 子目录树哈希与原历史完全一致；提取历史 77 个 commit。
- **公开仓库历史重写**：旧 main（旧 tip，完整 SHA 仅存 phase1-log.md）→ 新 main `4dc72f940afe43654a245fb1bd8417d33d475582`，commit 数 650 → 606。
  - 计划外处置：本地工作仓库发现 Codex 工具残留 ref（`refs/codex/turn-diffs` 检查点树快照，仍保留旧目录），导致首轮 gc 未清干净；已删除该 ref 并二次 `reflog expire + gc --prune=now`，之后本地对象零残留、`git fsck --unreachable` 无输出。
- **服务器重建**：停机约 1 分 22 秒，重建后服务器 `.git` 无 murmurs 对象，站点恢复 200；配置三文件（.env / Caddyfile / docker-compose.yml）备份后原样恢复。
- **部署链实测**：workflow_dispatch run `29187862093` success，线上 tag=`4dc72f9` 与服务器 HEAD、origin/main 三方一致。
- **隐私断言（全新 clone 实测，§8 第一组）**：三条内容路径全历史 0 commit；全历史对象路径 grep murmurs 仅余 `apps/web/src/app/murmurs` 与 `apps/web/src/app/murmurs/page.tsx`（路由代码，非隐私内容——§8「零结果」按内容路径口径的既定偏差，阶段三新前台落地时从 HEAD 移除）；选项 B 附加断言：3 个照片文件名（2 站外 + murmurs 目录内 1 jpg）在全历史对象路径中零命中。
- **验证口径修正（Task 6 计划外发现）**：站点图片真实路由前缀为 `/api/images/*`（Caddy 仅把 `/api/*` 反代至图片路由，裸 `/images/*` 从未被路由、恒 404），原计划用裸前缀做「图片仍可访问」断言是空洞断言；已按真实前缀补测：对照图 `/api/images/blog/images/…`（非隐私）200，murmurs 图 `/api/images/blog/murmurs-and-reflection/…` 404，均符合预期。此行为重建前后一致，属应用既有特征、非重建引入。

## GitHub 侧残留（§7 步骤 2.7，实测记录）

| 探针 | 结果 |
| --- | --- |
| blob/main 旧文件路径 | **404** |
| 旧 tip commit 直链 | **200**（悬挂对象仍可达） |
| 迁入 commit 直链 | **200**（悬挂对象仍可达） |
| 旧 tip 上原始文件 raw 直链 | **200**（悬挂对象上的文件仍可下载） |
| 加测：对旧 tip SHA 执行 `git fetch` | **成功**——GitHub gc 前，知道旧 SHA 者可通过普通 fetch 完整取回被抹除历史 |

- **处置（用户 2026-07-12 决策）**：选项 B——**书面接受残留风险**：旧 SHA 直链在 GitHub gc 前仍可达（含按 SHA fetch 可取回完整旧历史）。不提交 GitHub Support 工单。
- **表述修正（终审发现）**：本文档此前的措辞暗示「完整旧 SHA 仅存仓库外 phase1-log.md」，此说法不准确——公开仓库自身的 Actions 页面就留有重写前的 build/deploy run，其元数据（`headSha`）原样带着旧 tip 等重写前 SHA，任何访问者浏览 run 列表即可读到，无需先从别处获知。结合「按 SHA fetch 可完整取回旧历史」，残留的实际可发现性门槛为零，而非「仅内部已知」。此项仍在用户书面接受的选项 B 范围内，这里只是把表述改准确；可选后续动作见文末「阶段二+ 待办」。

## 旧容器镜像残留（终审发现，§7 计划外）

`apps/web/Dockerfile` 构建阶段执行 `COPY content/ ./content/`，把仓库根 `content/` 目录全部内容原样烘焙进镜像层。因此**重写前构建的 qingverse-web 旧 tag 镜像**（阿里云私有 ACR + VPS 本地 docker 存储，对应 `deploy/docker-compose.example.yml` 中的 `${REGISTRY}/qingverse-web:${WEB_TAG}`）内仍完整保留全部 murmurs 文件与照片，未随公开仓库历史重写而清除。

- 暴露面：ACR 仓库私有、VPS 需 SSH 访问，非公开可读，风险低于上文 GitHub 侧残留。
- **处置**：用户书面接受为现状残留，本阶段不处理；具体后续动作见文末「阶段二+ 待办」第 1 项。

## 私仓名指向（终审发现，用户书面接受）

公开计划文档 `docs/superpowers/plans/2026-07-03-devline-phase1-privacy-migration.md`（Task 3 Step 5）给出的私仓命名建议是一个中性示例名，该示例恰好与用户实际选定的私仓真实名一致。计划文档本身已入公开仓库，读者据此示例可推知敏感归档仓的名字（该私仓本身仍是 private，示例名不授予任何访问权限）。

- **处置（用户 2026-07-12 决策）**：不改名，书面接受该指向风险。

## GSC

- `qingverse.com` 资产**从未在 Google Search Console 验证过**（用户 2026-07-12 确认）。
- 图片前缀（真实口径 `/api/images/blog/murmurs-and-reflection/`，现已 404）与 `/murmurs` 页面前缀的移除请求**整体延至阶段四**：先完成资产验证，待 `/murmurs` 上线 410（§6）后一并提交。
- 裸 `/images/*` 前缀从未被路由（恒 404），大概率未被搜索引擎按此前缀收录，无需单独移除。

## 未实测项（如实点名）

- GitHub 悬挂对象残留在 GitHub 侧 gc 前**持续存在**（网页 200 且可按 SHA fetch 取回），为选项 B 书面接受项；未提交工单，无法给出消失时间，也未再复测。
- GSC 资产验证与两组前缀移除请求整体延至阶段四，本阶段未提交、审核结果未实测。
- `/murmurs` 路由代码仍在 HEAD（`apps/web/src/app/murmurs/page.tsx`），线上 `/murmurs` 页面仍在服务（内容源已清空）；代码阶段三移除，页面阶段四上线 410 后再提交 GSC 移除。

## 阶段二+ 待办（handoff）

1. **阶段二**：新站稳定运行后，清理阿里云 ACR 上重写前的 qingverse-web 旧 tag 镜像，并在服务器本地 `docker rmi` 对应旧镜像。**阶段三**：评估去掉 `apps/web/Dockerfile` 的 `COPY content/ ./content/`（与运行时 bind-mount 内容目录冗余），让新构建的镜像不再烘焙 content。
2. （可选）清空 GitHub Actions 缓存、删除重写前的旧 run，收窄旧 SHA 经 Actions 元数据 / `git fetch` 的可发现性（不做也已书面接受为现状，见上文「表述修正」）。
   **2026-07-16 复核补记：此项实际已完成**（好于本文档原记载）——重写前 run 已全部删除（现存最早 run = 29187862093，2026-07-12 重写后首次 dispatch；旧 run 29161727843 查询返回 404），Actions 缓存现存 79 个全部晚于 2026-07-12 首次重写后构建。「Actions 元数据零门槛暴露旧 SHA」的暴露面已关闭；剩余残留仅为需预知完整 SHA 才能访问的 GitHub 悬挂对象（仍属用户书面接受的选项 B 范围）。
3. `.superpowers/sdd/` 下各任务报告（含完整旧 SHA、真实文件名等敏感值，已 git-ignored）迁出仓库工作目录，不长期留在仓库内。
4. CI workflow 的 Node 20 弃用告警，随后续 Node 版本升级一并处理。
5. 阶段三：从 HEAD 移除 `/murmurs` 路由代码（`apps/web/src/app/murmurs/`）；阶段四：完成 GSC 资产验证后，为图片前缀与 `/murmurs` 页面一并提交 410 + 移除请求（沿用原计划，非本次新增）。
