# Devline 阶段一：止血与隐私迁移 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把全部本地领先 commit 推上远端防丢，然后用 git-filter-repo 把碎碎念（murmurs）内容的完整历史迁出到私有仓库 `EthanQC/qingchang-private`，从公开仓库全部历史中抹除并 force push，重建服务器仓库清除旧对象，最后完成规格 §8 的隐私验收。

**Architecture:** 本阶段不写任何业务代码，操作对象是 git 历史（本地 + GitHub + 服务器三份拷贝）与部署链（GitHub Actions + 阿里云 VPS Docker Compose）。核心顺序不可打乱：先 push 止血 → mirror 冷备 → 提取入私仓并核对 → 停 CI → 抹历史 force push → 服务器删仓重建 → 恢复 CI 并实测 → 隐私验收。所有不可逆操作前有 ⚠️ 用户确认检查点，唯一恢复途径是 mirror 冷备。

**Tech Stack:** git、git-filter-repo（brew 安装）、gh CLI（已登录 EthanQC）、ssh、Docker Compose（服务器侧）、curl。

**规格来源：** `docs/superpowers/specs/2026-07-03-devline-redesign-design.md`（v3）。本计划覆盖 §7 步骤 1–2、§7A.2、§8 隐私验收。

## Global Constraints

以下硬约束逐字摘自规格，本计划所有任务默认遵守：

- 「**止血**：push 本地领先的**全部** commit……该 push 命中 content/** 与 apps/api/** 路径过滤，会触发一次完整 CI 构建部署，线上变化仅限旧站文章分类中文标签，属预期」（§7 步骤 1）
- 「`git clone --mirror` 全量冷备存本地仓库外（filter-repo 唯一恢复途径）」（§7 步骤 2.1）
- 「迁移形态：用 `git filter-repo --path` 提取 murmurs 子目录历史推入私有仓库（保留写作时间线）；完整性核对：68 篇 .md + 1 张 .jpg 逐一清点通过后才允许执行下一步」（§7 步骤 2.2）
- 「**停用部署工作流**（`gh workflow disable` 或 GitHub UI）——filter-repo 后 force push 的 diff 是删除 content/blog/murmurs-and-reflection/**，命中 content/** 路径过滤，否则 CI 会在重建服务器仓库的同时 SSH 上去 `git reset --hard` + compose 重启，产生竞态」（§7 步骤 2.3）
- 「`git-filter-repo` 抹除本仓库全部历史 → force push」（§7 步骤 2.4）
- 「服务器重建（此窗口站点短暂停机，属预期）：`docker compose down`→ 备份 `deploy/.env` 与 `deploy/Caddyfile` 到仓库外……→ 删除 ~/workspace/my-learning-record 并重新 clone（**目的是清除服务器 .git 对象库里 murmurs 的旧对象**；`git reset --hard` 本身兼容重写历史但不清对象）→ 恢复 .env 与 Caddyfile → `docker compose up -d` 并确认站点恢复」（§7 步骤 2.5）
- 「重新启用工作流并用 workflow_dispatch 手动触发一次完整部署，作为『重写历史后部署链完好』的实测」（§7 步骤 2.6）
- 「GitHub 侧残留：force push 后旧 commit 经 SHA 直链仍可访问悬挂对象，联系 GitHub Support 请求 gc，或在交付说明中书面接受该残留风险」（§7 步骤 2.7）
- 「此步必须在大规模改造提交之前完成」（§7 步骤 2）
- 「filter-repo 不可逆：唯一恢复途径是步骤 2.1 的 mirror 冷备，冷备在新站稳定运行前不得删除」（§7A.2）
- 「**隐私验收**：force push 后从 GitHub 全新 clone，执行 `git log --all --oneline -- content/blog/murmurs-and-reflection/` 及全历史 grep murmurs 均为零结果；GitHub 网页端访问任一旧 murmurs 文件路径与旧 commit SHA 直链，记录返回结果（404 或悬挂对象仍可达）写入交付说明」（§8）
- 「任何未实测项在交付说明中如实点名」（§8）
- 破坏性操作（force push、rm、filter-repo、服务器操作）前必须有「⚠️ 等待用户确认」检查点（本计划已内置）。
- 跨阶段固定契约：本阶段不建 `redesign/devline` 分支（阶段三/四使用），所有提交落 `main`。

## 执行前约定（环境占位变量）

服务器连接信息是密钥外置，计划中用以下占位变量书写，**Task 6 Step 1 向用户询问并落实为真实值后，后续命令直接代入**：

- `$VPS_HOST` / `$VPS_USER` / `$VPS_PORT`：SSH 目标。真实值与 GitHub 仓库 Actions secrets `SERVER_HOST` / `SERVER_USER` / `SERVER_PORT` 一致（`.github/workflows/deploy.yml:77-79` 引用；secrets 无法用 gh 读回，只能由用户提供，或用户本机 `~/.ssh/config` 已有别名——勘察时本机 ssh config 尚无 VPS 别名条目）。
- 统一 SSH 调用形态：`ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '<命令>'`。

固定目录约定（本计划内引用，不是占位符）：

- 本地冷备与过程日志：`/Users/abble/backup-devline/`（mirror + phase1-log.md，仓库外）
- 本地临时工作区：`/Users/abble/devline-phase1-work/`（提取克隆 / 重写克隆 / 验收克隆，Task 8 末清理）
- 服务器备份目录：`~/backup-devline/`（服务器侧，存 .env / Caddyfile）
- 服务器仓库路径：`~/workspace/my-learning-record`（来自 deploy.yml:83）

## 勘察结论（写计划时已核实的仓库事实，执行者直接采信并复核）

- 本地 `main` 领先 `origin/main` **31 个 commit**（截至 2026-07-04，含 tech-intro 内容、apps/api 分类标签、设计文档 v1–v3）；另有未跟踪的 `docs/superpowers/plans/*.md` 计划文件需先提交。
- murmurs 内容在**全部历史**中出现过 3 个路径（重构前在仓库根）：
  1. `content/blog/murmurs-and-reflection/`（现行，2025-10-23 重构 commit 0915a7f 迁入）
  2. `murmurs-and-reflection/`（旧根路径，R100 重命名而来）
  3. `murmurs/`（最早期路径，acffb95 起）
  **三个路径必须同时提取、同时抹除**，只滤现行路径会在旧根路径留下全部情感内容。
- 当前 HEAD 下 `content/blog/murmurs-and-reflection/` = **68 个 .md + 1 个 .jpg（situationship.jpg）= 69 文件**，与规格清点数一致；历史中另有 1 个已删除文件 `2025.12.28.md`（提取的私仓历史里会保留，属预期）。
- 历史中路径名含 "murmurs" 的**代码**文件：`apps/web/src/app/murmurs/page.tsx`（纯渲染代码，非隐私内容）。抹除后它仍在历史中，因此 §8 的「全历史 grep murmurs 零结果」按**内容路径**口径执行（见 Task 8 断言），代码残留在交付说明点名。
- 碎碎念 md 内引用了 2 张个人照片，位于 murmurs 目录**之外**：`content/blog/images/old-friends-reunion.jpg`、`content/blog/images/2024-summary.png`（历史上还存在于根 `images/` 路径），全仓库仅 murmurs 文章引用它们。规格清点范围（68+1）不含它们——Task 3 有专门 ⚠️ 决策步骤。
- 部署工作流：`.github/workflows/deploy.yml`，workflow 名 `Build & Deploy Qingverse`（id 210524041，注意 yml 里名字带尾随空格，gh 命令一律用文件名 `deploy.yml` 定位）。
- 本机 `git-filter-repo` **未安装**（Task 2 安装）；`gh` 已登录 EthanQC；origin = `git@github.com:EthanQC/my-learning-record.git`；仓库公开、无 tag、远端仅 main 分支；全历史 643 commit，.git 约 44MB。
- 用于 §8 SHA 直链检查的两个真实旧 commit（force push 后它们将不在新历史中）：
  - `ed6783b62b07e81dbd6b9cb8d9a9fe9c519ea36a`（2026-03-02 更新今天的碎碎念，最后一个 murmurs commit）
  - `0915a7fa58abd5c504f7a9ca285ac33330bafa98`（2025-10-23 重构迁入 commit）

---

### Task 1: 止血——提交计划文档并 push 全部领先 commit

**Files:**
- Create: `docs/superpowers/plans/2026-07-03-devline-phase1-privacy-migration.md`（本文件，纳入版本控制）
- Modify: 无源码修改（`docs/superpowers/plans/` 下现存未跟踪计划文件一并提交）
- Test: 无（验收为 CI 实测）

**Interfaces:**
- Consumes: 本地 main 领先 origin/main 的全部 commit（勘察时 31 个）
- Produces: `origin/main` 与本地 main 一致（ahead 0），CI 一次完整构建部署成功；这是 Task 2 冷备与 Task 5 重写的完整历史基线

- [ ] **Step 1: 核对领先状态与未跟踪文件**

```bash
cd /Users/abble/my-learning-record
git status -sb
git log --oneline origin/main..HEAD | wc -l
```

期望：第一行形如 `## main...origin/main [ahead 31]`（数字 ≥31）；未跟踪列表里只有 `.playwright-mcp/` 与 `docs/superpowers/plans/*.md`（`.playwright-mcp/` 是本地调试产物，**不提交**）。若出现其它未预期的未跟踪源码文件，先停下向用户确认归属。

- [ ] **Step 2: 提交计划文档**

```bash
cd /Users/abble/my-learning-record
git add docs/superpowers/plans/
git commit -m "docs: Devline 实施计划（阶段一隐私迁移/阶段四切流）"
```

期望：commit 成功，`git status` 下 `docs/superpowers/plans/` 不再出现在未跟踪列表。

- [ ] **Step 3: ⚠️ 等待用户确认后才可执行——push 全部领先 commit**

向用户确认两点后再执行：① 这次 push 会触发一次完整 CI 构建部署（命中 `content/**` 与 `apps/api/**` 路径过滤），线上变化仅限旧站文章分类中文标签，属规格 §7 步骤 1 预期；② push 的 31+ 个 commit 内容用户认可全部公开（此后它们进入将被冷备的正式历史）。

```bash
cd /Users/abble/my-learning-record
git push origin main
```

期望：push 成功，无 rejected。

- [ ] **Step 4: 确认 push 后本地与远端一致**

```bash
cd /Users/abble/my-learning-record
git fetch origin && git status -sb | head -1
git rev-parse main origin/main
```

期望：`## main...origin/main`（无 ahead/behind）；两个 SHA 相同。

- [ ] **Step 5: 实测 CI 构建部署全绿**

```bash
sleep 30
RUN_ID=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

期望：`gh run watch` 以退出码 0 结束，build 与 deploy 两个 job 均 ✓。若失败，先修 CI 再继续（后续所有步骤都以「部署链健康」为前提）。

- [ ] **Step 6: 实测线上站点存活**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com
```

期望输出：`200`。

**验收标准（全部满足才算完成本任务）：**
1. `git log --oneline origin/main..HEAD | wc -l` 输出 `0`；
2. `gh run list --workflow=deploy.yml --limit 1 --json conclusion -q '.[0].conclusion'` 输出 `success`；
3. `curl -s -o /dev/null -w '%{http_code}' https://qingverse.com` 输出 `200`。

**Git commit：** 本任务的 commit 在 Step 2 完成（计划文档），Step 3 已 push。

---

### Task 2: 安装 git-filter-repo 并制作 mirror 冷备

**Files:**
- Create: `/Users/abble/backup-devline/my-learning-record-mirror.git/`（仓库外冷备）
- Create: `/Users/abble/backup-devline/phase1-log.md`（过程记录，Task 8 收编为交付说明）
- Test: 无（验收为 SHA 比对断言）

**Interfaces:**
- Consumes: Task 1 产出的完整 `origin/main`
- Produces: 冷备路径 `/Users/abble/backup-devline/my-learning-record-mirror.git`（§7A.2 唯一恢复途径，新站稳定前不得删除）；过程日志文件路径（后续每个任务向其追加记录）

- [ ] **Step 1: 安装 git-filter-repo（勘察确认本机未安装）**

```bash
brew install git-filter-repo
git filter-repo --version
```

期望：第二条命令输出版本哈希/版本号（任意非空一行），退出码 0。

- [ ] **Step 2: 制作 mirror 冷备（从 GitHub 拉取，保证与远端逐字节一致）**

```bash
mkdir -p /Users/abble/backup-devline
git clone --mirror git@github.com:EthanQC/my-learning-record.git /Users/abble/backup-devline/my-learning-record-mirror.git
```

期望：clone 成功结束，无错误。

- [ ] **Step 3: 断言冷备完整性**

```bash
git -C /Users/abble/backup-devline/my-learning-record-mirror.git rev-parse main
git -C /Users/abble/my-learning-record rev-parse origin/main
git -C /Users/abble/backup-devline/my-learning-record-mirror.git rev-list --count main
```

期望：前两条输出**相同** SHA；第三条输出 ≥ 643（Task 1 提交后的总 commit 数，记下实际值 N_total 供 Task 5 对照）。

- [ ] **Step 4: 初始化过程日志**

写入文件 `/Users/abble/backup-devline/phase1-log.md`，初始内容如下（`<...>` 处填 Step 3 实测值）：

```markdown
# Devline 阶段一过程记录（隐私迁移）

- 执行日期：<YYYY-MM-DD>
- 止血 push 后 origin/main SHA（重写前旧历史基线）：<SHA>
- 冷备路径：/Users/abble/backup-devline/my-learning-record-mirror.git
- 重写前全历史 commit 总数 N_total：<N>
- CI 止血部署 run 结论：success
```

**验收标准：**
1. `git filter-repo --version` 退出码 0；
2. mirror 的 `main` SHA 与 `origin/main` 一致（Step 3 输出比对）；
3. `test -f /Users/abble/backup-devline/phase1-log.md && echo ok` 输出 `ok`。

**Git commit：** 本任务产物全部在仓库外（冷备与日志不入公开仓库——日志含隐私操作细节，Task 8 摘编脱敏后才入仓），无仓库 commit，属预期。

---

### Task 3: 提取 murmurs 全历史到私有仓库 EthanQC/qingchang-private

**Files:**
- Create: `/Users/abble/devline-phase1-work/murmurs-extract/`（提取用临时克隆）
- Create: GitHub 私有仓库 `EthanQC/qingchang-private`
- Test: 无（验收为文件清点 + 树哈希断言）

**Interfaces:**
- Consumes: Task 2 冷备存在（安全网）；GitHub 上完整的旧历史
- Produces: 私仓 `git@github.com:EthanQC/qingchang-private.git` 的 `main` 含 murmurs 三路径全历史；确定的抹除路径集合 `$FILTER_PATHS`（Task 5 逐字复用）

- [ ] **Step 1: ⚠️ 等待用户确认后才可执行——决策两张站外个人照片是否纳入迁移**

向用户呈现勘察事实并要求二选一：碎碎念文章引用的 2 张个人照片位于 murmurs 目录之外——`content/blog/images/old-friends-reunion.jpg` 与 `content/blog/images/2024-summary.png`（历史上还在根 `images/` 下），全仓库仅 murmurs 文章引用。规格清点范围（68 md + 1 jpg）不含它们，但仓库公开意味着它们的历史同样公开。

- **选项 A（保持规格字面范围）**：只迁移/抹除 murmurs 三路径。后续命令使用：

  ```bash
  FILTER_PATHS="--path content/blog/murmurs-and-reflection --path murmurs-and-reflection --path murmurs"
  ```

- **选项 B（照片一并迁移抹除，推荐）**：追加 4 个照片历史路径。后续命令使用：

  ```bash
  FILTER_PATHS="--path content/blog/murmurs-and-reflection --path murmurs-and-reflection --path murmurs --path content/blog/images/old-friends-reunion.jpg --path content/blog/images/2024-summary.png --path images/old-friends-reunion.jpg --path images/2024-summary.png"
  ```

把用户选择与对应 `$FILTER_PATHS` 逐字记入 `/Users/abble/backup-devline/phase1-log.md`。本任务与 Task 5 的所有后续命令共用这一个 `$FILTER_PATHS`（两处不一致 = 提取和抹除范围错位，是本计划最严重的可犯错误）。下文期望值按选项 A 书写；若选 B，清点数按「69 → 71 文件、68 md → 68 md + 3 图」相应调整，并在日志中记录调整后的实测值。

- [ ] **Step 2: 全新克隆（filter-repo 要求 fresh clone）**

```bash
mkdir -p /Users/abble/devline-phase1-work
git clone git@github.com:EthanQC/my-learning-record.git /Users/abble/devline-phase1-work/murmurs-extract
```

期望：clone 成功。

- [ ] **Step 3: 提取 murmurs 三路径历史（保留写作时间线）**

```bash
cd /Users/abble/devline-phase1-work/murmurs-extract
git filter-repo $FILTER_PATHS
```

期望：filter-repo 正常结束（输出 `Completely finished after ... seconds`）。注意：filter-repo 会自动移除 origin remote，这在本任务是期望行为（防止误推回公开仓库）。

- [ ] **Step 4: 完整性核对（规格 §7 步骤 2.2：逐一清点通过才允许进入下一任务）**

```bash
cd /Users/abble/devline-phase1-work/murmurs-extract
# 4a. HEAD 文件清点
git ls-files content/blog/murmurs-and-reflection/ | wc -l
git ls-files 'content/blog/murmurs-and-reflection/*.md' | wc -l
git ls-files 'content/blog/murmurs-and-reflection/*.jpg'
# 4b. 与源仓库逐文件比对（文件名集合零差异）
diff <(git ls-files content/blog/murmurs-and-reflection/ | sort) \
     <(git -C /Users/abble/my-learning-record ls-files content/blog/murmurs-and-reflection/ | sort) && echo FILELIST_OK
# 4c. 内容逐字节等价：子目录树哈希与源仓库一致
git rev-parse HEAD:content/blog/murmurs-and-reflection
git -C /Users/abble/my-learning-record rev-parse origin/main:content/blog/murmurs-and-reflection
# 4d. 时间线保留：最早两个 commit 是 2024-12-08 的「测试效果」「完成了仓库初步的框架搭建…」，含已删除的 2025.12.28.md
git log --oneline --reverse | head -3
git log --all --diff-filter=A --oneline -- content/blog/murmurs-and-reflection/2025.12.28.md
git log --oneline | wc -l
```

期望：4a 输出 `69`、`68`、`content/blog/murmurs-and-reflection/situationship.jpg`；4b 输出 `FILELIST_OK`；4c 两条输出**相同**树哈希；4d 头两行为「测试效果」「完成了仓库初步的框架搭建、些许内容填充排版和今天的记录」（2024-12-08 两个建仓 commit 的重写版），`2025.12.28.md` 有添加记录，总 commit 数约 76（记录实际值入日志）。任何一项不符，**停止**，不得进入 Step 5。

- [ ] **Step 5: 创建私有仓库并在 push 前断言其确为 private**

```bash
gh repo create EthanQC/qingchang-private --private --description "qingchang murmurs private archive"
gh repo view EthanQC/qingchang-private --json isPrivate -q '.isPrivate'
```

期望：第二条输出 `true`。**若输出不是 `true`，绝对不得执行 Step 6 的 push。**

- [ ] **Step 6: 推入私仓**

```bash
cd /Users/abble/devline-phase1-work/murmurs-extract
git remote add origin git@github.com:EthanQC/qingchang-private.git
git push -u origin main
```

期望：push 成功。

- [ ] **Step 7: 远端复核**

```bash
gh api repos/EthanQC/qingchang-private --jq '{private: .private, default_branch: .default_branch}'
gh api "repos/EthanQC/qingchang-private/contents/content/blog/murmurs-and-reflection" --jq 'length'
```

期望：第一条输出 `{"private":true,"default_branch":"main"}`；第二条输出 `69`（选项 B 时该目录仍为 69，另核 `repos/.../contents/content/blog/images` 含 2 张照片）。

- [ ] **Step 8: 记录日志**

向 `/Users/abble/backup-devline/phase1-log.md` 追加：

```markdown
## Task 3 提取记录
- $FILTER_PATHS：<逐字记录>
- 私仓：git@github.com:EthanQC/qingchang-private.git（isPrivate=true 已核）
- 清点：69 文件 = 68 md + 1 jpg（situationship.jpg）；树哈希与源仓库一致：<树哈希>
- 提取历史 commit 数：<实际值>
```

**验收标准：**
1. Step 4 四组断言全部通过（69/68/jpg、FILELIST_OK、树哈希相同、时间线存在）；
2. `gh repo view EthanQC/qingchang-private --json isPrivate -q '.isPrivate'` 输出 `true`；
3. Step 7 远端目录清点 `69`。

**Git commit：** 私仓 push 即本任务的提交动作；公开仓库无变更，无 commit，属预期。

---

### Task 4: 停用部署工作流（消除 force push 竞态）

**Files:**
- Modify: 无文件修改（GitHub 侧工作流状态变更）
- Test: 无（验收为 gh 状态断言）

**Interfaces:**
- Consumes: Task 1 已确认 CI 健康
- Produces: `deploy.yml` 处于 `disabled_manually` 状态，Task 5 的 force push 不会触发部署；Task 7 负责恢复

- [ ] **Step 1: 停用工作流（用文件名定位，规避 workflow 名尾随空格问题）**

```bash
gh workflow disable deploy.yml
```

期望：命令静默成功（退出码 0）。

- [ ] **Step 2: 断言已停用**

```bash
gh workflow list --all --json name,state,path -q '.[] | select(.path==".github/workflows/deploy.yml") | .state'
```

期望输出：`disabled_manually`。

- [ ] **Step 3: 记录日志**

向 `/Users/abble/backup-devline/phase1-log.md` 追加一行：`## Task 4：deploy.yml 已停用（disabled_manually），时间 <ISO 时间>`。

**验收标准：** Step 2 输出为 `disabled_manually`。

**Git commit：** 无文件变更，无 commit，属预期。

---

### Task 5: 抹除公开仓库历史中的 murmurs 并 force push

**Files:**
- Create: `/Users/abble/devline-phase1-work/rewrite/`（重写用临时克隆）
- Modify: GitHub `EthanQC/my-learning-record` 的 `main` 全历史（force push 重写）；本地工作仓库 `/Users/abble/my-learning-record` 同步到新历史
- Test: 无（验收为历史断言）

**Interfaces:**
- Consumes: Task 3 确定的 `$FILTER_PATHS`（逐字复用，见 phase1-log.md）；Task 4 已停用 CI；Task 2 冷备（唯一回退途径）
- Produces: 重写后的 `origin/main` 新 SHA（记入日志，Task 6/7/8 均以它为基准）；本地工作仓库处于新历史

- [ ] **Step 1: 全新克隆用于重写**

```bash
git clone git@github.com:EthanQC/my-learning-record.git /Users/abble/devline-phase1-work/rewrite
git -C /Users/abble/devline-phase1-work/rewrite rev-parse main
```

期望：clone 成功；SHA 与 phase1-log.md 记录的「止血 push 后 origin/main SHA」一致。

- [ ] **Step 2: 执行历史抹除（--invert-paths，路径集合与 Task 3 逐字一致）**

```bash
cd /Users/abble/devline-phase1-work/rewrite
git filter-repo --invert-paths $FILTER_PATHS
```

期望：`Completely finished after ... seconds`。此命令只影响本地克隆，尚未触碰远端。

- [ ] **Step 3: 重写结果断言（force push 前的最后防线）**

```bash
cd /Users/abble/devline-phase1-work/rewrite
# 3a. 三个内容路径全历史零 commit
git log --all --oneline -- content/blog/murmurs-and-reflection/ murmurs-and-reflection/ murmurs/ | wc -l
# 3b. 全历史对象路径级 grep：仅允许残留 app 代码路径
git rev-list --all --objects | awk '{print $2}' | grep -i murmur | sort -u
# 3c. 工作树无 murmurs 目录，其余内容目录完好
test ! -e content/blog/murmurs-and-reflection && echo TREE_CLEAN
ls content/blog/
# 3d. 记录新旧规模对比
git rev-list --count HEAD
```

期望：3a 输出 `0`；3b 输出**恰好**两行——`apps/web/src/app/murmurs` 与 `apps/web/src/app/murmurs/page.tsx`（勘察时已预判，为纯渲染代码；若选项 B，另断言 `git rev-list --all --objects | awk '{print $2}' | grep -E "old-friends-reunion|2024-summary"` 无输出）；3c 输出 `TREE_CLEAN` 且列表仍含 `images internship-records interview-experiences join-in-open-source`；3d 输出小于 N_total（filter-repo 会剪除变空的 commit，记实际值入日志）。任何一项不符，**停止并删除 rewrite 目录重来**，不得 push。

- [ ] **Step 4: 恢复 origin remote（filter-repo 会自动拆除 remote，必须重新添加）**

```bash
cd /Users/abble/devline-phase1-work/rewrite
git remote add origin git@github.com:EthanQC/my-learning-record.git
git remote -v
```

期望：fetch/push 两行均指向 `git@github.com:EthanQC/my-learning-record.git`。

- [ ] **Step 5: ⚠️ 等待用户确认后才可执行——force push 重写公开仓库历史**

向用户逐条确认：① Task 3 私仓提取已通过完整性核对；② Task 2 冷备存在（`/Users/abble/backup-devline/my-learning-record-mirror.git`，这是唯一恢复途径）；③ deploy.yml 已停用；④ Step 3 断言全部通过。确认后执行：

```bash
cd /Users/abble/devline-phase1-work/rewrite
git push --force origin main
```

期望：push 成功（输出含 `forced update`）。

- [ ] **Step 6: 断言远端已是新历史**

```bash
cd /Users/abble/devline-phase1-work/rewrite
git ls-remote origin main
git rev-parse main
```

期望：两条输出 SHA 相同（这就是「新 main SHA」，记入日志）。

- [ ] **Step 7: 本地工作仓库切换到新历史并清除旧对象**

```bash
cd /Users/abble/my-learning-record
git fetch origin
git reset --hard origin/main
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git log --all --oneline -- content/blog/murmurs-and-reflection/ | wc -l
test ! -e content/blog/murmurs-and-reflection && echo LOCAL_CLEAN
```

期望：最后两条输出 `0` 与 `LOCAL_CLEAN`。说明：Task 1 已把全部领先 commit 推上远端，`reset --hard` 无工作丢失；未跟踪的 `.playwright-mcp/` 不受影响。

- [ ] **Step 8: 记录日志**

向 `/Users/abble/backup-devline/phase1-log.md` 追加：

```markdown
## Task 5 历史抹除记录
- 旧 main SHA（重写前）：<SHA>
- 新 main SHA（重写后）：<SHA>
- 重写后 commit 总数：<N>（重写前 N_total=<N>）
- 3b 残留路径核对：仅 apps/web/src/app/murmurs{,/page.tsx}（代码，非隐私内容）
- force push 时间：<ISO 时间>
```

**验收标准：**
1. Step 3 全部断言通过后才发生 push；
2. `git ls-remote origin main` 的 SHA ≠ phase1-log 记录的旧 SHA，且 = rewrite 克隆本地 SHA；
3. 本地工作仓库 `git log --all --oneline -- content/blog/murmurs-and-reflection/ | wc -l` 输出 `0`。

**Git commit：** 本任务的「提交动作」即 force push 本身；不产生新 commit，属预期。

---

### Task 6: 服务器重建七步（清除服务器 .git 旧对象）

**Files:**
- Modify: 服务器 `~/workspace/my-learning-record`（删除重建）；服务器 `~/backup-devline/`（新建，存 .env / Caddyfile 备份）
- Test: 无（验收为 ssh/curl 断言）

**Interfaces:**
- Consumes: Task 5 产出的远端新历史；`$VPS_HOST` / `$VPS_USER` / `$VPS_PORT`（本任务 Step 1 落实真实值）
- Produces: 服务器仓库对象库无 murmurs 旧对象、站点恢复运行；Task 7 在此之上实测部署链

- [ ] **Step 1: 向用户获取 SSH 真实值并验证连通**

向用户询问 `$VPS_HOST` / `$VPS_USER` / `$VPS_PORT` 的真实值（与 GitHub secrets `SERVER_HOST/SERVER_USER/SERVER_PORT` 相同；用户可在仓库 Settings → Secrets and variables → Actions 页面核对键名，值以用户记录为准）。然后：

```bash
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'echo SSH_OK && docker compose version'
```

期望：输出 `SSH_OK` 与 compose 版本行。

- [ ] **Step 2: 重建前勘察（确认服务器可达 GitHub、清点未跟踪文件、记录当前镜像 tag）**

```bash
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '
  cd ~/workspace/my-learning-record &&
  git remote get-url origin &&
  git ls-remote origin main | cut -f1 &&
  git status --porcelain --ignored -- deploy/ &&
  grep -E "^(API_TAG|WEB_TAG)=" deploy/.env
'
```

期望：remote 为 `git@github.com:EthanQC/my-learning-record.git`（若是 https 变体，记录实际 URL，Step 5 clone 用同一 URL）；`ls-remote` 输出的 SHA = Task 5 的新 main SHA（证明服务器侧看到的远端已重写）；`git status` 列出的 deploy/ 未跟踪文件应为 `.env` 与 `Caddyfile` 两个（若有其它未跟踪文件，Step 4 一并备份）；记录 API_TAG/WEB_TAG 当前值入日志（重建后 up -d 用同一 tag 恢复原版本）。

- [ ] **Step 3: ⚠️ 等待用户确认后才可执行——进入停机窗口**

向用户确认：接下来 compose down + 删目录重 clone 会造成站点短暂停机（规格 §7 步骤 2.5 预期，§7A.3 要求选低流量时段），请用户确认现在执行。记录停机开始时间。

- [ ] **Step 4: 七步之 1–2——compose down 并备份 .env / Caddyfile 到仓库外**

```bash
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '
  cd ~/workspace/my-learning-record/deploy &&
  docker compose down &&
  mkdir -p ~/backup-devline &&
  cp .env ~/backup-devline/.env &&
  cp Caddyfile ~/backup-devline/Caddyfile &&
  ls -la ~/backup-devline/
'
```

期望：down 输出各容器 Removed；`ls -la` 列出 `.env` 与 `Caddyfile`（以及 Step 2 发现的其它未跟踪文件，若有则补一条 cp）。说明：`docker compose down` 不带 `-v`，命名卷 mysql-data / caddy-data / caddy-config 全部保留（caddy-data 里的 TLS 证书不丢）。

- [ ] **Step 5: 七步之 3–4——删除仓库目录并重新 clone（清除 .git 旧对象）**

```bash
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '
  rm -rf ~/workspace/my-learning-record &&
  git clone git@github.com:EthanQC/my-learning-record.git ~/workspace/my-learning-record &&
  cd ~/workspace/my-learning-record &&
  git rev-parse HEAD &&
  git log --all --oneline -- content/blog/murmurs-and-reflection/ | wc -l &&
  test ! -e content/blog/murmurs-and-reflection && echo SERVER_TREE_CLEAN
'
```

期望：`rev-parse HEAD` = Task 5 新 main SHA；wc -l 输出 `0`；输出 `SERVER_TREE_CLEAN`。（clone URL 以 Step 2 记录的实际 remote URL 为准。）

- [ ] **Step 6: 七步之 5–6——恢复配置并启动**

```bash
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '
  cp ~/backup-devline/.env ~/workspace/my-learning-record/deploy/.env &&
  cp ~/backup-devline/Caddyfile ~/workspace/my-learning-record/deploy/Caddyfile &&
  cd ~/workspace/my-learning-record/deploy &&
  docker compose up -d &&
  sleep 20 &&
  docker compose ps --format "table {{.Name}}\t{{.Status}}"
'
```

期望：4 个容器（mysql8 / qv-api / qv-web / qv-caddy）状态均 Up（mysql 需 healthy 后 api 才起，20 秒不够就再等再查）。

- [ ] **Step 7: 七步之 7——验证站点恢复**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com/images/blog/murmurs-and-reflection/situationship.jpg
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com/images/blog/images/explaining-atomic.png
```

期望依次：`200`（站点恢复）；`404`（murmurs 源文件已随重 clone 消失——阶段四才改成 410，本阶段 404 即达标，记录入日志）；`200`（非 murmurs 图片仍正常服务，证明 file_server 链路未被破坏）。记录停机结束时间与时长入日志。

- [ ] **Step 8: 记录日志**

向 `/Users/abble/backup-devline/phase1-log.md` 追加：

```markdown
## Task 6 服务器重建记录
- 停机窗口：<开始> ~ <结束>（时长 <分钟>）
- 重建前 API_TAG/WEB_TAG：<值>（重建后未变，容器恢复原版本）
- 服务器新 HEAD：<SHA>（= 新 main SHA）
- murmurs 源文件 URL 现状：/images/blog/murmurs-and-reflection/situationship.jpg → 404
```

**验收标准：**
1. 服务器 `git log --all --oneline -- content/blog/murmurs-and-reflection/ | wc -l` 输出 `0`；
2. `docker compose ps` 4 容器 Up；
3. `curl https://qingverse.com` → `200`，murmurs 源文件 URL → `404`。

**Git commit：** 无仓库文件变更，无 commit，属预期。

---

### Task 7: 恢复部署工作流并 workflow_dispatch 实测部署链

**Files:**
- Modify: 无文件修改（GitHub 侧工作流状态 + 一次真实部署）
- Test: 无（验收为 CI run + 服务器状态断言）

**Interfaces:**
- Consumes: Task 6 重建完成的服务器；Task 4 停用的 deploy.yml
- Produces: 「重写历史后部署链完好」的实测证据（规格 §7 步骤 2.6），阶段二/三可在健康部署链上开工

- [ ] **Step 1: 重新启用工作流**

```bash
gh workflow enable deploy.yml
gh workflow list --json name,state,path -q '.[] | select(.path==".github/workflows/deploy.yml") | .state'
```

期望：第二条输出 `active`。

- [ ] **Step 2: 手动触发一次完整部署**

```bash
gh workflow run deploy.yml --ref main
sleep 30
RUN_ID=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

期望：`gh run watch` 退出码 0，build（API+Web 镜像）与 deploy（SSH 上服务器 pull+up）均 ✓。这次部署会把线上镜像 tag 更新为**新历史** main SHA 的前 7 位——这正是要实测的内容。

- [ ] **Step 3: 断言服务器已跑新 tag、站点存活**

```bash
NEW_TAG=$(git -C /Users/abble/my-learning-record rev-parse --short=7 origin/main)
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'grep -E "^(API_TAG|WEB_TAG)=" ~/workspace/my-learning-record/deploy/.env && cd ~/workspace/my-learning-record && git rev-parse --short=7 HEAD'
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com
```

期望：服务器 `.env` 的 API_TAG 与 WEB_TAG 均等于 `$NEW_TAG`；服务器 HEAD 短 SHA 等于 `$NEW_TAG`；curl 输出 `200`。三者一致即满足规格 §8「部署状态实时确认：镜像 tag、容器版本、git log 服务器工作区一致」。

- [ ] **Step 4: 记录日志**

向 `/Users/abble/backup-devline/phase1-log.md` 追加：`## Task 7：deploy.yml 已恢复 active；workflow_dispatch run <RUN_ID> success；线上 tag=<NEW_TAG>，与服务器 HEAD 一致。`

**验收标准：**
1. workflow state = `active`；
2. dispatch run conclusion = `success`；
3. 服务器 .env 两个 tag、服务器 HEAD 短 SHA、本地 origin/main 短 SHA 三者一致；
4. `curl https://qingverse.com` → `200`。

**Git commit：** 无文件变更，无 commit，属预期。

---

### Task 8: 隐私验收、GitHub/GSC 残留处置与交付说明

**Files:**
- Create: `/Users/abble/devline-phase1-work/fresh-audit/`（验收用全新克隆，用后即删）
- Create: `docs/superpowers/delivery/2026-07-devline-phase1-privacy.md`（交付说明，入仓）
- Test: 本任务通体是验收断言

**Interfaces:**
- Consumes: Task 5 的新历史、Task 6 的服务器现状、phase1-log.md 全部记录
- Produces: 规格 §8 隐私验收证据 + 交付说明文档（阶段四切流验收会引用其中的 410 待办与残留记录）

- [ ] **Step 1: 从 GitHub 全新 clone（§8 要求的验收载体）**

```bash
git clone git@github.com:EthanQC/my-learning-record.git /Users/abble/devline-phase1-work/fresh-audit
```

期望：clone 成功。

- [ ] **Step 2: 零残留断言（§8 第一组）**

```bash
cd /Users/abble/devline-phase1-work/fresh-audit
git log --all --oneline -- content/blog/murmurs-and-reflection/ | wc -l
git log --all --oneline -- murmurs-and-reflection/ murmurs/ | wc -l
git rev-list --all --objects | awk '{print $2}' | grep -i murmur | sort -u
```

期望：前两条输出 `0`、`0`；第三条输出恰好两行 `apps/web/src/app/murmurs` 与 `apps/web/src/app/murmurs/page.tsx`（历史中的路由代码，非隐私内容——这是 §8「全历史 grep murmurs 零结果」按内容路径口径的既定偏差，写入交付说明点名；该代码会在阶段三新前台落地时从 HEAD 消失）。若选项 B，另断言 `git rev-list --all --objects | awk '{print $2}' | grep -E "old-friends-reunion|2024-summary" | wc -l` 输出 `0`。

- [ ] **Step 3: GitHub 网页端残留检查（§8 第二组：直链实测并记录）**

```bash
# 旧文件路径（main 分支视角，应 404）
curl -s -o /dev/null -w 'blob_main: %{http_code}\n' \
  "https://github.com/EthanQC/my-learning-record/blob/main/content/blog/murmurs-and-reflection/situationship.jpg"
# 旧 commit SHA 直链（悬挂对象，可能 404 也可能仍可达，如实记录）
curl -s -o /dev/null -w 'commit_ed6783b: %{http_code}\n' \
  "https://github.com/EthanQC/my-learning-record/commit/ed6783b62b07e81dbd6b9cb8d9a9fe9c519ea36a"
curl -s -o /dev/null -w 'commit_0915a7f: %{http_code}\n' \
  "https://github.com/EthanQC/my-learning-record/commit/0915a7fa58abd5c504f7a9ca285ac33330bafa98"
# 悬挂对象上的原始文件内容直链
curl -s -o /dev/null -w 'raw_old_sha: %{http_code}\n' \
  "https://raw.githubusercontent.com/EthanQC/my-learning-record/ed6783b62b07e81dbd6b9cb8d9a9fe9c519ea36a/content/blog/murmurs-and-reflection/situationship.jpg"
```

期望：`blob_main` 为 `404`；后三条**如实记录实际返回码**（GitHub 悬挂对象通常仍返回 200，直到 GitHub 侧 gc）——这正是 §7 步骤 2.7 描述的残留，返回码原样写入交付说明。

- [ ] **Step 4: ⚠️ 等待用户确认后才可执行——GitHub Support gc 请求 or 书面接受残留**

依据 Step 3 实测结果，让用户二选一（规格 §7 步骤 2.7）：

- **选项 A**：由用户到 https://support.github.com/contact 提交工单，请求对 `EthanQC/my-learning-record` 执行 gc 清除悬挂对象（工单需附 Step 3 中仍可达的 commit SHA 清单）；交付说明记「已提交工单 <编号/日期>，等待 GitHub 处理」。
- **选项 B**：交付说明记「书面接受残留风险：旧 SHA 直链在 GitHub gc 前仍可达，SHA 清单如下」。

把选择结果与依据记入 phase1-log.md。

- [ ] **Step 5: Google Search Console 移除请求（人工浏览器操作，记录结果）**

指引用户完成（agent 无法代操作 GSC，属人工步骤，如实记录）：

1. 打开 https://search.google.com/search-console，确认 `qingverse.com`（域名资产或网址前缀资产）已验证；**若从未验证过，先完成资产验证**（DNS TXT 或 HTML 标签任一），并把「首次验证」这一事实记入交付说明；
2. 左侧「移除」→「新请求」→「移除此前缀开头的所有网址」，提交前缀：`https://qingverse.com/images/blog/murmurs-and-reflection/`（该前缀现已 404，Task 6 已实测）；
3. 规格 §6 规定 `/murmurs` 页面前缀的移除在**上线 410 之后**执行（阶段四）——本阶段旧站 `/murmurs` 页面仍在线上服务，现在提交会因页面仍可达而被驳回，交付说明中记为「阶段四待办」。

完成后把提交时间与 GSC 显示的请求状态记入 phase1-log.md。

- [ ] **Step 6: 写交付说明并入仓**

创建 `docs/superpowers/delivery/2026-07-devline-phase1-privacy.md`，内容按下述模板、用 phase1-log.md 的实测值填充（`<...>` 全部替换为真实记录，不得留空）：

```markdown
# Devline 阶段一交付说明：止血与隐私迁移

日期：<YYYY-MM-DD>　执行依据：specs/2026-07-03-devline-redesign-design.md §7 步骤 1–2、§8

## 已完成并实测
- 止血 push：<N> 个 commit，CI run success，线上仅分类标签变化（预期）
- 冷备：/Users/abble/backup-devline/my-learning-record-mirror.git（新站稳定前不得删除，§7A.2）
- murmurs 全历史（3 个历史路径）已提取至私仓 EthanQC/qingchang-private（isPrivate=true）；
  清点 68 md + 1 jpg 通过，子目录树哈希与原历史一致
- 公开仓库历史重写：旧 main <旧SHA> → 新 main <新SHA>，commit 数 <N_total> → <N_new>
- 服务器重建：停机 <时长>，服务器 .git 无 murmurs 对象，站点恢复 200
- 部署链实测：workflow_dispatch run <RUN_ID> success，线上 tag=<TAG> 与服务器 HEAD 一致
- 隐私断言：全新 clone 下三内容路径历史 0 commit；全历史对象路径 grep murmurs
  仅余 apps/web/src/app/murmurs{,/page.tsx}（路由代码，非隐私内容，阶段三从 HEAD 移除）

## GitHub 侧残留（§7 步骤 2.7，实测记录）
- blob/main 旧文件路径：404
- 旧 commit SHA 直链返回码：ed6783b6…=<code>、0915a7fa…=<code>、raw=<code>
- 处置：<选项 A 工单编号/日期 或 选项 B 书面接受残留>

## GSC
- /images/blog/murmurs-and-reflection/ 前缀移除请求：<提交时间与状态 / 或首次验证记录>
- /murmurs 页面前缀移除：阶段四 410 上线后执行（§6），本阶段待办

## 未实测项（如实点名）
- <逐条列出，若无写「无」；至少核对：照片选项 A 时两张站外照片仍在公开历史这一事实是否需列入>
```

```bash
cd /Users/abble/my-learning-record
mkdir -p docs/superpowers/delivery
# （用 Write/编辑器创建上述文件后）
git add docs/superpowers/delivery/2026-07-devline-phase1-privacy.md
git commit -m "docs: 阶段一隐私迁移交付说明（历史重写/服务器重建/残留记录）"
git push origin main
```

期望：push 成功；`docs/**` 不命中 deploy.yml 路径过滤，**不触发部署**（push 后用 `gh run list --workflow=deploy.yml --limit 1` 确认没有新 run 产生）。

- [ ] **Step 7: 清理临时工作区（冷备保留）**

```bash
rm -rf /Users/abble/devline-phase1-work
test -d /Users/abble/backup-devline/my-learning-record-mirror.git && echo MIRROR_KEPT
```

期望：输出 `MIRROR_KEPT`（§7A.2：冷备在新站稳定运行前不得删除）。

**验收标准：**
1. Step 2 三条断言全部符合期望（0 / 0 / 仅两行代码路径）；
2. Step 3 四个返回码已如实记录且 `blob_main=404`；
3. 交付说明文件已 commit + push，且未触发部署 run；
4. `test -d /Users/abble/backup-devline/my-learning-record-mirror.git` 通过。

**Git commit：** Step 6 的交付说明 commit 即本任务收尾提交。

---

## 阶段完成定义（对照全局 CLAUDE.md）

- 实测：Task 1/6/7 的 curl 与 CI run、Task 8 的全新 clone 断言与直链返回码，全部是对真实运行系统的探针，不以「命令写完」为完成；
- 部署状态：Task 7 Step 3 已把「镜像 tag = 服务器 HEAD = origin/main」三方一致作为硬验收；
- 未实测项（GSC 审核结果、GitHub Support 工单处理结果等异步事项）在交付说明「未实测项」如实点名，不宣称完成。
