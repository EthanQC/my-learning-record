# Devline 阶段四：架构精简与切流 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把部署架构从 4 容器（mysql/api/web/caddy）精简为 3 容器（web/caddy/goatcounter），改造 CI，把 `redesign/devline` 一次性合入 `main` 完成切流，并按规格 §8 完成全套上线验证。

**Architecture:** 本阶段只动部署层（`deploy/` 两个 example 文件、`.github/workflows/deploy.yml`）与服务器真实配置，不动 `apps/web` 业务代码（阶段三已完成）。切流顺序为：仓库配置改造（分支上）→ DNS 就位 → 回滚信息记录 → 合并触发 CI 部署新 web 镜像 → 服务器同批换 compose/Caddyfile/.env 并启动 goatcounter → §8 逐条线上验证。

**Tech Stack:** Docker Compose、Caddy 2、GitHub Actions（appleboy/ssh-action）、GoatCounter（`arp242/goatcounter`，SQLite）、MCP Playwright、Lighthouse、axe-core、curl/dig/gh CLI。

**规格来源：** `docs/superpowers/specs/2026-07-03-devline-redesign-design.md`（v3）。本计划涉及 §6 架构条目、§7 步骤 5、§7A、§8。色值/尺寸/机制以规格为唯一事实来源。

## Global Constraints

以下硬约束逐字来自规格，本计划所有任务默认遵守：

- 「compose 从 4 容器减为 **3**（web/caddy/goatcounter）」（§6）
- 「SQLite 数据落独立 volume `goatcounter-data`，内存限制 128M」；「Caddy 增 `stats.<域名>` 站点块反代 :8081」；「该容器与 web 互不依赖，统计挂了不影响主站」（§6）
- 「Caddy 移除 `/api/*` 反代」；「同步移除 Caddyfile 的 `@images path /images/*` file_server 块及对应 Cache-Control 规则」（§6）
- 「compose 同步移除 caddy 的 `../content:/srv:ro` 与 web 的 `../content:/app/content:ro` 挂载（全静态生成后运行时不再读 content）；caddy 的 depends_on 从 [web, api] 改为 [web]」（§6）
- 「静态资产缓存：Caddy 开启 `encode zstd gzip`；`/_next/static/*` 与字体分片响应 `Cache-Control: public, max-age=31536000, immutable`，HTML 保持默认短缓存」（§6）
- 「旧 URL：显式前缀清单统一返回 410 Gone（Caddy 路径匹配 + `respond 410`），不做 301。清单：`/posts/*`、`/notes/*`、`/murmurs*`、`/interview-questions/*`、`/interview-experiences*`、`/internship-records*`、`/categories/*`、`/images/*`」（§6）
- 「除清单外的未知路径透传给 Next.js 渲染 404 页」（§6）
- 「同批修改 `.github/workflows/deploy.yml`：删除 Build & Push API image step；部署脚本删除 API_TAG 的 sed 行；pull/up 命令改为只操作 web（`docker compose pull web && docker compose up -d web && docker compose restart caddy`）」；「顺带把触发条件 content/** 收窄为 content/articles/**」（§7 步骤 5）
- 「步骤 4 验收通过后，与步骤 5 的全部修改合并为同一批合入 main，一次性切流」（§7 步骤 4）
- 「切流前记录当前线上镜像 tag（deploy/.env 的 API_TAG/WEB_TAG）；回滚 = 手动改回旧 tag + 恢复备份的旧 compose/Caddyfile + `docker compose up -d`」（§7A）
- 「待决事项：mysql-data 卷（含旧文章数据副本）保留归档还是删除，切流前定」（§6）
- 「预期短暂停机（……步骤 5 一次），选低流量时段执行，停机时长记入交付说明」（§7A）
- 「任何未实测项在交付说明中如实点名」（§8）
- 跨阶段固定契约：特性分支 `redesign/devline`；localStorage key `devline-theme` / `devline-track`；`html[data-theme]` ∈ duo/editorial/night、`html[data-track]` ∈ deep/intro；GoatCounter 子域 `stats.qingverse.com`、容器名 `goatcounter`、SQLite 卷 `goatcounter-data`
- 「全站页面不出现「情长」二字（`grep` 构建产物断言）」（§8/§2）——线上落实见 Task 13 Step 4（容器内构建产物 + 线上页面双重 grep）
- 破坏性操作（服务器改配置、合并切流、停容器）前必须有「⚠️ 等待用户确认」检查点
- 全局 CLAUDE.md「完成」定义：必须在线上实测并确认部署状态后才能说完成

## 执行前约定（占位变量，Task 1 中落实为真实值）

本计划用两个 shell 变量指代环境相关值，**Task 1 会向用户询问并确定真实值**，后续任务的命令直接代入：

- `$SERVER`：SSH 目标（ssh config 别名或 `user@ip`，即 CI secrets 里 SERVER_USER@SERVER_HOST 对应的可登录目标）
- `$GC_EMAIL`：GoatCounter 管理账号邮箱（建站用，建议用用户 GitHub 邮箱）

---

### Task 1: 前置检查与分支就位

**Files:**
- 不修改任何文件（只读检查）

**Interfaces:**
- Consumes: 阶段一产物（murmurs 历史已抹除、force push 已完成）、阶段三产物（`redesign/devline` 分支上的新前台：`apps/web/src/lib/content.ts`、`apps/web/src/styles/tokens.css` 等）
- Produces: 确认后的 `$SERVER`、`$GC_EMAIL` 真实值；确认 redesign/devline 可构建，供 Task 2–4 在其上继续提交

- [ ] **Step 1: 向用户确认环境变量与执行窗口**

用 AskUserQuestion（或直接提问）确认三件事，把答案记录在案（后续命令中代入真实值）：

1. `$SERVER` 的实际 SSH 目标（例如 `root@47.xx.xx.xx` 或 ssh config 别名）；
2. `$GC_EMAIL`（GoatCounter 建站邮箱）；
3. 本次切流的执行时段（规格 §7A：选低流量时段，预期短暂停机）。

- [ ] **Step 2: 确认 SSH 可达**

```bash
ssh $SERVER 'hostname && ls ~/workspace/my-learning-record/deploy/'
```

期望输出：主机名 + deploy 目录文件列表。**记录 deploy/ 下真实文件名**（预期有未跟踪的 `docker-compose.yml`、`Caddyfile`、`.env`；若实际是 `compose.yaml` 等其它名字，后续任务以真实名字为准）。

- [ ] **Step 3: 切到特性分支并确认阶段三产物存在**

```bash
cd /Users/abble/my-learning-record
git checkout redesign/devline
git pull origin redesign/devline
ls apps/web/src/lib/content.ts apps/web/src/lib/content-schema.ts apps/web/src/styles/tokens.css apps/web/src/app/dev/themes/page.tsx
```

期望：4 个文件都存在（跨阶段固定契约路径）。任一缺失 → 阶段三未完成，停止本计划并上报。

- [ ] **Step 4: 确认阶段一/三清理到位（murmurs 历史、API 链路与运行时 content 依赖）**

```bash
cd /Users/abble/my-learning-record
grep -rn "INTERNAL_API_BASE_URL\|NEXT_PUBLIC_API_BASE_URL" apps/web/src/ || echo "WEB-CLEAN"
grep -n "COPY --from=build /app/content ./content" apps/web/Dockerfile || echo "DOCKERFILE-CLEAN"
git log --all --oneline -- content/blog/murmurs-and-reflection/ | head -5
```

期望：前两条输出 `WEB-CLEAN` / `DOCKERFILE-CLEAN`，第三条零输出（murmurs 历史已抹除）。若 Dockerfile 仍有运行时 `COPY content`（规格 §6「运行时镜像不再 COPY content」属阶段三范围），停止并上报阶段三补漏，不在本阶段私自改。

- [ ] **Step 5: 确认分支可构建（切流前最后一道本地闸）**

```bash
cd /Users/abble/my-learning-record/apps/web && npm run build
```

期望：`next build` 成功退出（exit 0），无类型错误。失败则停止本计划，回到阶段三修复。

**验收标准：** Step 2–5 全部得到期望输出；`$SERVER`、`$GC_EMAIL`、执行窗口三项已确认并记录。本任务无仓库变更，无需 commit。

---

### Task 2: 重写 deploy/docker-compose.example.yml（4 容器 → 3 容器）

**Files:**
- Modify: `deploy/docker-compose.example.yml:1-87`（整文件重写：现状 1–26 行 mysql、28–46 行 api、48–63 行 web 含 content 挂载与 API env、65–78 行 caddy 含 /srv 挂载与 depends_on [web, api]、80–83 行 volumes 含 mysql-data）

**Interfaces:**
- Consumes: `.env` 变量 `REGISTRY` / `WEB_TAG`（既有）、新增 `DOMAIN` / `NEXT_PUBLIC_SITE_URL`（Task 8 写入服务器 .env）
- Produces: 服务名 `web` / `goatcounter` / `caddy`，容器名 `qv-web` / `goatcounter` / `qv-caddy`，卷 `goatcounter-data`；Task 3 的 Caddyfile 反代目标 `web:3000` 与 `goatcounter:8081`；Task 8 在服务器上 `cp` 此文件为真实 `docker-compose.yml`

- [ ] **Step 1: 在 redesign/devline 分支上整文件重写**

用以下内容完整覆盖 `deploy/docker-compose.example.yml`（依据规格 §6：去 mysql/api、去两处 content 挂载、caddy depends_on 改 [web]、增 goatcounter 128M + `goatcounter-data` 卷；goatcounter 不进 caddy 的 depends_on——规格明言「与 web 互不依赖，统计挂了不影响主站」）：

```yaml
services:
  web:
    image: ${REGISTRY}/qingverse-web:${WEB_TAG}
    container_name: qv-web
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-https://qingverse.com}
      NODE_OPTIONS: --max_old_space_size=256
    networks: [app]
    ports:
      - "3000:3000"
    mem_limit: 512m
    cpus: "1.00"

  goatcounter:
    # 固定版本，禁用 :latest 漂移；实际 tag 由 Task 8 预检步骤解析当前稳定版后写入 deploy/.env 的 GOATCOUNTER_TAG，
    # 并记录镜像 digest（升级需手动改 tag 重新预拉、重测）。
    image: arp242/goatcounter:${GOATCOUNTER_TAG}
    container_name: goatcounter
    restart: unless-stopped
    environment:
      # 监听 8081，与 Caddyfile 的 reverse_proxy http://goatcounter:8081 对齐（规格 §6）
      GOATCOUNTER_LISTEN: ":8081"
      # TLS 由 Caddy 终结，容器内走纯 HTTP
      GOATCOUNTER_TLS: "http"
    volumes:
      # 官方镜像的 SQLite 与数据目录固定在 /home/goatcounter/goatcounter-data
      - goatcounter-data:/home/goatcounter/goatcounter-data
    networks: [app]
    mem_limit: 128m

  caddy:
    image: caddy:2
    container_name: qv-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      # Caddyfile 里的 {$DOMAIN}（主站块，可逗号多值）与 {$STATS_DOMAIN}（stats 子域，单值）从这里解析
      DOMAIN: ${DOMAIN:-qingverse.com}
      STATS_DOMAIN: ${STATS_DOMAIN:-stats.qingverse.com}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on: [web]
    networks: [app]

volumes:
  caddy-data:
  caddy-config:
  goatcounter-data:

networks:
  app:
    driver: bridge
```

- [ ] **Step 2: 本地校验 compose 语法与服务清单**

```bash
cd /Users/abble/my-learning-record/deploy
REGISTRY=registry.example.com/ns WEB_TAG=test DOMAIN=qingverse.com NEXT_PUBLIC_SITE_URL=https://qingverse.com \
  docker compose -f docker-compose.example.yml config --services | sort
```

期望输出（恰好三行，无 mysql/api）：

```
caddy
goatcounter
web
```

- [ ] **Step 3: 断言旧内容彻底移除**

```bash
cd /Users/abble/my-learning-record
! grep -qE "mysql|qv-api|qingverse-api|/app/content|/srv" deploy/docker-compose.example.yml && echo COMPOSE-CLEAN
grep -q "goatcounter-data:/home/goatcounter/goatcounter-data" deploy/docker-compose.example.yml && echo VOLUME-OK
```

期望输出：`COMPOSE-CLEAN` 和 `VOLUME-OK`。

- [ ] **Step 4: Commit**

```bash
cd /Users/abble/my-learning-record
git add deploy/docker-compose.example.yml
git commit -m "chore(deploy): compose 4 容器减为 3（去 mysql/api，加 goatcounter，去 content 挂载）"
```

**验收标准：** Step 2 输出恰为 `caddy/goatcounter/web` 三行；Step 3 两条断言通过；commit 落在 redesign/devline。

---

### Task 3: 重写 deploy/Caddyfile.example（410 清单 / 缓存头 / stats 站点块）

**Files:**
- Modify: `deploy/Caddyfile.example:1-41`（整文件重写：现状 8–17 行 /api 反代、19–26 行 /images file_server、32–39 行 header 块含 /images Cache-Control）

**Interfaces:**
- Consumes: Task 2 的服务名 `web`（:3000）、`goatcounter`（:8081）；caddy 容器 env `DOMAIN`
- Produces: 主站点块（410 前缀 + 反代 web + 静态资产 immutable 缓存）与 `stats.{$DOMAIN}` 站点块；Task 8 在服务器上以此为模板生成真实 `Caddyfile`（只替换 email）

- [ ] **Step 1: 整文件重写**

用以下内容完整覆盖 `deploy/Caddyfile.example`。要点对照规格：410 前缀清单逐字来自 §6；`respond 410` 带内联 HTML 响应体（§5「旧 URL 的 410 响应体复用 404 页面视觉」——双线断线装置 + 回首页/看文章双 CTA，色值取 D1 duo 主题 token 的字面值：底 #FDFBFC、主文字 #17141A、次级 #5C525A、accent-text #C63A64）；未匹配路径全部透传 web，由 Next.js 渲染 404（§6）；`/_next/static/*` 覆盖 next/font 字体分片（其产物路径在 `/_next/static/media/` 下）：

```caddyfile
{
    email xxx@xx.com
}

{$DOMAIN} {
  encode zstd gzip

  # 旧 URL 前缀统一 410 Gone，不做 301（清单逐字来自设计文档 §6）
  @gone path /posts/* /notes/* /murmurs* /interview-questions/* /interview-experiences* /internship-records* /categories/* /images/*
  handle @gone {
    header Content-Type "text/html; charset=utf-8"
    respond <<HTML
    <!doctype html>
    <html lang="zh-CN">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>410 · Devline</title>
    <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FDFBFC;color:#17141A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif}
    .wrap{max-width:640px;width:100%;padding:48px 20px}
    .rail{height:4px;background:#17141A;width:42%}
    .rail.pink{height:4px;background:#EC5A87;width:34%;margin:10px 0 0 24%}
    h1{font-size:clamp(24px,4vw,34px);font-weight:900;line-height:1.3;margin:28px 0 12px}
    p{color:#5C525A;font-size:15px;line-height:1.8;margin:0 0 28px}
    a{display:inline-block;padding:10px 20px;border:2px solid #17141A;color:#17141A;text-decoration:none;font-weight:700;margin-right:12px}
    a.pink{border-color:#C63A64;color:#C63A64}
    </style>
    </head>
    <body>
    <div class="wrap">
    <div class="rail"></div>
    <div class="rail pink"></div>
    <h1>410 · 这条线已随改版下线</h1>
    <p>你访问的旧地址已永久移除，去看看新的 Devline。</p>
    <a href="/">回首页</a><a class="pink" href="/articles">看文章</a>
    </div>
    </body>
    </html>
    HTML 410
  }

  # 除 410 清单外的未知路径全部透传给 Next.js 渲染 404 页（设计文档 §6）
  handle {
    reverse_proxy http://web:3000
  }

  # 静态资产长缓存：/_next/static/* 含 next/font 字体分片（/_next/static/media/）
  @static path /_next/static/*
  header @static Cache-Control "public, max-age=31536000, immutable"

  header {
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "strict-origin-when-cross-origin"
  }
}

# ⚠️ 用独立单值变量 {$STATS_DOMAIN}，不要写 stats.{$DOMAIN}：
# 服务器 .env 的 DOMAIN 是逗号多值（deploy/.env.example: `DOMAIN=yourdomain.com, www.yourdomain.com`），
# 主站块 `{$DOMAIN} {` 用逗号多主机名是合法的；但 `stats.{$DOMAIN}` 的 `stats.` 前缀只会贴到第一个主机名，
# 第二个 www.<域名> 会漏进 stats 块被 goatcounter 劫持。因此 stats 子域用单值 STATS_DOMAIN（Task 8 Step 4 写入）。
{$STATS_DOMAIN} {
  encode zstd gzip
  reverse_proxy http://goatcounter:8081
}
```

- [ ] **Step 2: 用 caddy 容器做离线语法校验**

```bash
cd /Users/abble/my-learning-record
# 用逗号多值 DOMAIN + 独立 STATS_DOMAIN 校验（复现服务器真实 .env 格式，验证 stats 块不劫持 www）
docker run --rm -e DOMAIN="qingverse.com, www.qingverse.com" -e STATS_DOMAIN=stats.qingverse.com \
  -v "$PWD/deploy/Caddyfile.example:/etc/caddy/Caddyfile:ro" \
  caddy:2 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

期望输出末尾：`Valid configuration`。同时 `caddy adapt` 出的站点地址应为三个独立主机：`qingverse.com`、`www.qingverse.com`、`stats.qingverse.com`——确认 `www.qingverse.com` 归主站块（web）而非 stats 块（goatcounter）。

- [ ] **Step 3: 断言删除项与新增项**

```bash
cd /Users/abble/my-learning-record
! grep -qE "api:9000|/api/\*|file_server|strip_prefix|/srv" deploy/Caddyfile.example && echo CADDY-CLEAN
grep -c "respond <<HTML" deploy/Caddyfile.example        # 期望 1
grep -q "goatcounter:8081" deploy/Caddyfile.example && echo STATS-OK
grep -q "immutable" deploy/Caddyfile.example && echo CACHE-OK
for p in "/posts/\*" "/notes/\*" "/murmurs\*" "/interview-questions/\*" "/interview-experiences\*" "/internship-records\*" "/categories/\*" "/images/\*"; do
  grep -q -- "$p" deploy/Caddyfile.example || echo "MISSING: $p"
done; echo PREFIX-CHECK-DONE
```

期望：`CADDY-CLEAN`、`1`、`STATS-OK`、`CACHE-OK`，且 PREFIX 检查无任何 `MISSING:` 行、以 `PREFIX-CHECK-DONE` 结束。

- [ ] **Step 4: Commit**

```bash
cd /Users/abble/my-learning-record
git add deploy/Caddyfile.example
git commit -m "chore(deploy): Caddyfile 去 /api 反代与 /images file_server，加 410 前缀清单/immutable 缓存/stats 站点块"
```

**验收标准：** `caddy validate` 输出 Valid configuration；Step 3 全部断言通过；commit 落在 redesign/devline。

---

### Task 4: 改造 .github/workflows/deploy.yml（删 API 链路、收窄触发路径）

**Files:**
- Modify: `.github/workflows/deploy.yml:1`（name）、`:6-11`（paths）、`:43-55`（Build & Push API image step，整段删除）、`:89-98`（部署脚本 sed 与 pull/up）

> 注意：行号基于 main 现状。若前序阶段（仓库健康修复）已在此文件加入 lint/tsc/build 门禁 job，**保留该 job 不动**，只按下述四处 old→new 精确修改；动手前先 `git diff main -- .github/workflows/deploy.yml` 看清分支现状。

**Interfaces:**
- Consumes: Task 2 的 compose 服务名 `web` / `caddy`（服务器端 `docker compose pull web` 的操作对象）；secrets `ACR_*` / `SERVER_*`（不变）
- Produces: 合并到 main 后的自动部署链：build job 只构建 `qingverse-web:<sha7>` 镜像，deploy job 执行 `docker compose pull web && docker compose up -d web && docker compose restart caddy`

- [ ] **Step 1: 修改 workflow name（第 1 行，注意原行尾有一个空格）**

old（行尾含空格）：

```yaml
name: Build & Deploy Qingverse 
```

new：

```yaml
name: Build & Deploy Devline
```

- [ ] **Step 2: 收窄触发路径（去 apps/api/**，content/** → content/articles/**）**

old：

```yaml
    paths:
      - "apps/api/**"
      - "apps/web/**"
      - "content/**"
      - "deploy/**"
      - ".github/workflows/**"
```

new：

```yaml
    paths:
      - "apps/web/**"
      - "content/articles/**"
      - "deploy/**"
      - ".github/workflows/**"
```

- [ ] **Step 3: 删除 Build & Push API image step（整段删除，不留残行）**

删除以下整段（现状 43–55 行）：

```yaml
      - name: Build & Push API image
        uses: docker/build-push-action@v6
        with:
          context: apps/api
          file: apps/api/Dockerfile
          platforms: linux/amd64
          push: true
          tags: |
            ${{ secrets.ACR_REGISTRY }}/${{ secrets.ACR_NAMESPACE }}/qingverse-api:${{ steps.vars.outputs.tag }}
          build-args: |
            GOPROXY=https://proxy.golang.com.cn,https://goproxy.cn,https://goproxy.io,direct
          cache-from: type=gha,scope=api
          cache-to: type=gha,mode=max,scope=api
```

- [ ] **Step 4: 部署脚本删 API_TAG sed、pull/up 只操作 web（规格 §7 步骤 5 逐字命令）**

old：

```yaml
            cd deploy

            # 更新 API_TAG / WEB_TAG 为本次构建的 tag
            sed -i "s/^API_TAG=.*/API_TAG=${{ needs.build.outputs.tag }}/" .env
            sed -i "s/^WEB_TAG=.*/WEB_TAG=${{ needs.build.outputs.tag }}/" .env

            # 拉取新镜像并重启
            docker compose pull api web
            docker compose up -d api web
            docker compose restart caddy
```

new：

```yaml
            cd deploy

            # 更新 WEB_TAG 为本次构建的 tag（API 已退役，无 API_TAG）
            sed -i "s/^WEB_TAG=.*/WEB_TAG=${{ needs.build.outputs.tag }}/" .env

            # 拉取新镜像并重启（只操作 web；goatcounter 不随部署重启）
            docker compose pull web
            docker compose up -d web
            docker compose restart caddy
```

- [ ] **Step 5: 校验 YAML 语法与删除项断言**

```bash
cd /Users/abble/my-learning-record
npx -y js-yaml .github/workflows/deploy.yml > /dev/null && echo YAML-OK
! grep -qE "qingverse-api|API_TAG|apps/api|pull api|up -d api" .github/workflows/deploy.yml && echo WORKFLOW-CLEAN
grep -q 'content/articles/\*\*' .github/workflows/deploy.yml && echo PATHS-OK
grep -q "docker compose pull web" .github/workflows/deploy.yml && grep -q "docker compose up -d web" .github/workflows/deploy.yml && grep -q "docker compose restart caddy" .github/workflows/deploy.yml && echo SCRIPT-OK
```

期望输出：`YAML-OK`、`WORKFLOW-CLEAN`、`PATHS-OK`、`SCRIPT-OK` 各一行。

- [ ] **Step 6: Commit**

```bash
cd /Users/abble/my-learning-record
git add .github/workflows/deploy.yml
git commit -m "ci: 删除 API 构建与部署链路，触发路径收窄为 content/articles/**"
git push origin redesign/devline
```

**验收标准：** Step 5 四条断言全过；redesign/devline 已推送（push 到特性分支不触发 deploy.yml——它只监听 main）。

---

### Task 5: stats 子域 DNS A 记录（用户手动操作 + dig 确认）

**Files:**
- 不修改任何文件

**Interfaces:**
- Consumes: 现有 `qingverse.com` 的 A 记录 IP
- Produces: `stats.qingverse.com` 解析到同一 IP，供 Task 8 中 Caddy 为其签发 ACME 证书（DNS 必须先于服务器切换就位，否则 stats 站点块签证书失败重试）

- [ ] **Step 1: 查出主域当前 IP**

```bash
dig +short qingverse.com A
```

期望输出：一行 IPv4 地址（记为 `<SERVER_IP>`）。

- [ ] **Step 2: 请用户在 DNS 服务商控制台添加记录**

告知用户添加（这是用户手动步骤，代理不代办）：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---|---|---|---|
| A | `stats` | `<SERVER_IP>`（Step 1 的输出） | 600（或服务商默认） |

- [ ] **Step 3: 确认解析生效（可轮询，DNS 传播通常几分钟内）**

```bash
dig +short stats.qingverse.com A
```

期望输出：与 Step 1 完全相同的 IP。不一致或为空则等待传播后重试，未生效前**不得**进入 Task 8。

**验收标准：** `dig +short stats.qingverse.com A` 输出等于 `dig +short qingverse.com A`。本任务无仓库变更，无需 commit。

---

### Task 6: 切流前回滚信息记录与服务器备份（§7A）

**Files:**
- Create: `docs/superpowers/delivery/2026-07-devline-cutover.md`（交付说明，本任务写入「回滚信息」章节，后续任务持续追加）

**Interfaces:**
- Consumes: `$SERVER`（Task 1）；服务器上的 `deploy/.env`、`deploy/docker-compose.yml`、`deploy/Caddyfile`（真实文件名以 Task 1 Step 2 记录为准）
- Produces: 服务器 `~/backups/pre-devline-cutover/` 备份目录；交付说明中的回滚三要素（旧镜像 tag、旧配置备份路径、回滚命令），供任何时刻按 §7A 回滚

- [ ] **Step 1: 记录当前线上镜像 tag 与容器状态**

```bash
ssh $SERVER 'grep -E "^(API_TAG|WEB_TAG|REGISTRY)=" ~/workspace/my-learning-record/deploy/.env; docker ps --format "{{.Names}}\t{{.Image}}\t{{.Status}}"'
```

期望输出：API_TAG/WEB_TAG/REGISTRY 三行 + 四个容器（mysql8/qv-api/qv-web/qv-caddy）的镜像与状态。完整保存这段输出。

- [ ] **Step 2: 在服务器上备份旧配置（§7A 回滚依赖）**

```bash
ssh $SERVER 'mkdir -p ~/backups/pre-devline-cutover && cd ~/workspace/my-learning-record/deploy && cp -v .env docker-compose.yml Caddyfile ~/backups/pre-devline-cutover/ && ls -la ~/backups/pre-devline-cutover/'
```

期望输出：三个文件的 cp 记录 + 目录列表（`.env`、`docker-compose.yml`、`Caddyfile` 各一份，若真实文件名不同按 Task 1 记录调整）。

- [ ] **Step 3: 在本地分支创建交付说明并写入回滚信息**

创建 `docs/superpowers/delivery/2026-07-devline-cutover.md`，内容如下（尖括号处代入 Step 1/2 的真实输出）：

```markdown
# Devline 切流交付说明

日期：2026-07-04（实际执行日期为准）

## 回滚信息（切流前记录，规格 §7A）

- 旧线上镜像 tag：API_TAG=<旧值> / WEB_TAG=<旧值>，REGISTRY=<值>
- 切流前容器状态：
  <粘贴 Task 6 Step 1 的 docker ps 输出>
- 旧配置备份：服务器 `~/backups/pre-devline-cutover/`（.env / docker-compose.yml / Caddyfile）
- 回滚步骤（§7A）：
  1. `cd ~/workspace/my-learning-record/deploy`
  2. `docker compose down`
  3. `cp ~/backups/pre-devline-cutover/{.env,docker-compose.yml,Caddyfile} .`
  4. `docker compose up -d`
  5. 旧镜像仍在 ACR（`docker image prune` 只清服务器本地悬挂镜像，不动 ACR）
- mysql-data 卷处置决定：<Task 8 Step 8 填写>

## 停机窗口

<Task 8 完成后填写：开始/结束时间、时长>

## 验证结果与未实测项

<Task 9–13 完成后逐条填写>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/abble/my-learning-record
git add docs/superpowers/delivery/2026-07-devline-cutover.md
git commit -m "docs: 切流交付说明——回滚信息记录（旧镜像 tag/配置备份/回滚步骤）"
git push origin redesign/devline
```

**验收标准：** 服务器 `~/backups/pre-devline-cutover/` 存在且含 3 个文件；交付说明中旧 API_TAG/WEB_TAG 为真实值（非占位符）；commit 已推送。

---

### Task 7: 合并 redesign/devline → main 一次性切流

**Files:**
- 不修改文件内容（git merge + push；改变 main 分支指向）

**Interfaces:**
- Consumes: Task 2–4、6 的全部 commit（连同阶段三的前台重构，均在 redesign/devline 上）
- Produces: main 上的完整 Devline 代码；CI 构建的新镜像 `qingverse-web:<sha7>`（deploy job 会先在**旧 compose**上部署新 web 容器——旧 Caddyfile 仍反代 `web:3000`，站点此刻即切为 Devline 前台，410/stats 等待 Task 8 生效）

- [ ] **Step 1: ⚠️ 等待用户确认后才可执行——合并切流是不可逆动作**

向用户逐条确认后才继续：

1. Task 1–6 验收标准全部通过（逐条列出证据）；
2. **夹具文章处置已按阶段三 Task 20 Step 0 的用户决定执行**（保留上线 / 全部置 draft 走空态 / 换真实首发文）——确认线上首发内容就是用户想要的状态，而非三篇占位夹具意外成为首发；
3. 现在处于约定的低流量执行窗口；
4. 合并后 CI 会立即把 Devline 部署到 qingverse.com，且在 Task 8 完成前存在一个「新前台 + 旧 Caddy 配置」的过渡窗口（约几分钟：/api 反代与 /images file_server 仍在、410 未生效）；
5. 用户明确回复「确认切流」。

- [ ] **Step 2: 合并并推送**

```bash
cd /Users/abble/my-learning-record
git checkout main
git pull origin main
git merge --no-ff redesign/devline -m "feat!: Devline 改版切流——新前台 + 架构精简（4 容器减为 3，API/MySQL 退役）"
git push origin main
```

期望：merge 无冲突（若有冲突，停止并逐个冲突文件向用户说明后处理）；push 成功。

- [ ] **Step 3: 观察 CI 直至全绿**

```bash
cd /Users/abble/my-learning-record
gh run list --workflow=deploy.yml --limit 1
gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

期望：`gh run watch` 以 exit 0 结束，deploy job 日志末尾出现 `✅ Deployed tag=<sha7>`。记录 `<sha7>`（后续版本一致性验证用）。若失败：读日志定位，**不要**在服务器上手工救火，先回本地修。

- [ ] **Step 4: 确认新前台已上线（过渡态冒烟）**

```bash
curl -s https://qingverse.com | grep -o "Devline" | head -1
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com/
```

期望输出：`Devline` 和 `200`。

**验收标准：** CI 全绿、线上首页出现 Devline 品牌字、HTTP 200。记录停机/过渡窗口开始时间到交付说明。本任务的「commit」即 merge commit 本身。

---

### Task 8: 服务器配置同步与新栈启动（compose/Caddyfile/.env + GoatCounter 首次建站）

**Files:**
- 服务器文件（非仓库）：`~/workspace/my-learning-record/deploy/docker-compose.yml`、`deploy/Caddyfile`、`deploy/.env`

**Interfaces:**
- Consumes: Task 2/3 的 example 文件（CI 部署时 `git reset --hard` 已同步到服务器工作区）；Task 5 的 DNS 解析；Task 6 的备份；`$GC_EMAIL`
- Produces: 3 容器新栈（qv-web / qv-caddy / goatcounter）运行中；`stats.qingverse.com` 可访问且已建站、public dashboard 开启；410/缓存头/未知路径 404 全部生效——Task 9–13 的验证对象

- [ ] **Step 0: 进停机窗口前预检——预拉 GoatCounter 镜像并固定版本（停机外完成，避免拉取失败卡在停机窗口里）**

阿里云大陆 VPS 拉 Docker Hub 常慢/间歇失败；若把首次拉取留到 `docker compose up` 阶段（已在停机窗口内），一旦失败停机被迫延长。因此在**停机确认之前**先解析当前稳定 tag、预拉、并把 tag/digest 固化进 `.env`：

```bash
# 1) 解析当前稳定 tag（在服务器上查 Docker Hub；避开 latest。若网络查不到，回退用已知稳定版如 release-2.6 并在下方 pull 处验证其存在）
ssh $SERVER 'GC_TAG=$(curl -s "https://hub.docker.com/v2/repositories/arp242/goatcounter/tags?page_size=100" \
  | grep -Eo "\"name\":\"[^\"]+\"" | sed -E "s/\"name\":\"([^\"]+)\"/\1/" \
  | grep -Ev "^latest$" | sort -V | tail -1); echo "解析到 tag: ${GC_TAG:-<空,手动指定>}"'
# 2) 预拉该 tag（停机窗口外；失败就先解决镜像源——见下方 ACR 中转兜底——再进 Step 1）
ssh $SERVER 'docker pull arp242/goatcounter:<上一步解析到的 tag>'
# 3) 记录 digest 并写入 deploy/.env 的 GOATCOUNTER_TAG（compose 的 image 引用它）
ssh $SERVER 'docker inspect --format "{{index .RepoDigests 0}}" arp242/goatcounter:<tag>; \
  grep -q "^GOATCOUNTER_TAG=" ~/workspace/my-learning-record/deploy/.env \
    && sed -i "s#^GOATCOUNTER_TAG=.*#GOATCOUNTER_TAG=<tag>#" ~/workspace/my-learning-record/deploy/.env \
    || echo "GOATCOUNTER_TAG=<tag>" >> ~/workspace/my-learning-record/deploy/.env'
# 4) 核对镜像 entrypoint 确实读 GOATCOUNTER_LISTEN/GOATCOUNTER_TLS 这些 env（否则 Caddy 反代 8081 会连不通——见下方 Step 7 建站命令依赖同一 entrypoint 约定）
ssh $SERVER 'docker inspect --format "{{json .Config.Entrypoint}} {{json .Config.Cmd}}" arp242/goatcounter:<tag>; \
  docker run --rm arp242/goatcounter:<tag> help serve 2>&1 | head -20'
```

期望：解析到一个具体 tag（非 latest）；`docker pull` 成功；`.env` 出现 `GOATCOUNTER_TAG=<tag>`；`help serve` 输出里能看到监听地址/TLS 相关选项（确认 env 或等价 flag 生效）。**镜像源兜底（ACR 中转）**：若服务器直连 Docker Hub 拉取失败——在本机 `docker pull arp242/goatcounter:<tag>` → `docker tag` 成自家 ACR 地址 → `docker push` 到 ACR → 把 compose 的 `image:` 改成 ACR 地址、服务器 `docker pull` ACR。全部在停机窗口外完成。

- [ ] **Step 1: ⚠️ 等待用户确认后才可执行——本步骤将 down 掉全部旧容器（含 mysql/api），站点短暂停机**

向用户确认：「GoatCounter 镜像已在 Step 0 预拉并固定版本；即将执行 `docker compose down` 并替换服务器 compose/Caddyfile/.env，预期停机 1–3 分钟，是否继续？」得到肯定答复后才执行 Step 2。记录停机开始时间。

- [ ] **Step 2: 停旧栈**

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && docker compose down'
```

期望输出：mysql8 / qv-api / qv-web / qv-caddy 四容器 Stopped + Removed（named volumes 不会被 down 删除）。

- [ ] **Step 3: 用新 example 生成真实配置（保留原 Caddyfile 的真实 email）**

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && \
  REAL_EMAIL=$(grep -Eo "email +[^ ]+" ~/backups/pre-devline-cutover/Caddyfile | awk "{print \$2}") && \
  echo "real email = $REAL_EMAIL" && \
  cp docker-compose.example.yml docker-compose.yml && \
  cp Caddyfile.example Caddyfile && \
  sed -i "s/xxx@xx.com/$REAL_EMAIL/" Caddyfile && \
  grep -n "email" Caddyfile'
```

期望输出：`real email = <真实邮箱>`，且新 Caddyfile 的 email 行已是真实邮箱。若旧 Caddyfile 无 email 行（为空），向用户要一个 ACME 通知邮箱再 sed。

- [ ] **Step 4: 更新服务器 .env（追加新变量，保留旧变量便于回滚）**

关键：`DOMAIN` 在服务器 .env 里很可能是逗号多值（如 `qingverse.com, www.qingverse.com`，见 deploy/.env.example）；主站块用它没问题，但 **stats 子域必须用单值 `STATS_DOMAIN`**（取 DOMAIN 的第一个主机名派生 `stats.<apex>`），否则 www 会漏进 stats 块（见 Task 2 Caddyfile 注释）。

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && \
  grep -q "^DOMAIN=" .env || echo "DOMAIN=qingverse.com" >> .env; \
  grep -q "^NEXT_PUBLIC_SITE_URL=" .env || echo "NEXT_PUBLIC_SITE_URL=https://qingverse.com" >> .env; \
  # 从 DOMAIN 第一个主机名派生单值 apex，再拼 stats. 前缀，写入 STATS_DOMAIN
  APEX=$(grep "^DOMAIN=" .env | head -1 | cut -d= -f2- | tr -d " " | cut -d, -f1); \
  grep -q "^STATS_DOMAIN=" .env || echo "STATS_DOMAIN=stats.$APEX" >> .env; \
  grep -q "^GOATCOUNTER_TAG=" .env || echo "GOATCOUNTER_TAG=<Step 0 解析的固定 tag>" >> .env; \
  grep -E "^(DOMAIN|STATS_DOMAIN|NEXT_PUBLIC_SITE_URL|WEB_TAG|REGISTRY|GOATCOUNTER_TAG)=" .env'
```

期望输出：`STATS_DOMAIN=stats.qingverse.com`（单值，无逗号/空格）、`GOATCOUNTER_TAG=<具体版本>`，以及既有的 DOMAIN/NEXT_PUBLIC_SITE_URL/WEB_TAG/REGISTRY 全部列出。若 `STATS_DOMAIN` 出现逗号或多主机，说明 APEX 派生失败，停止排查。

期望输出：四个变量各一行，`WEB_TAG` 已是 Task 7 的 `<sha7>`（CI deploy job 的 sed 写入）。

- [ ] **Step 5: 启动新栈**

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && docker compose up -d && sleep 5 && docker compose ps --format "{{.Name}}\t{{.Image}}\t{{.Status}}"'
```

期望输出：恰好三行——`qv-web`、`qv-caddy`、`goatcounter`，Status 均为 Up。记录停机结束时间（与 Step 1 开始时间一起写入交付说明「停机窗口」）。

- [ ] **Step 6: 主站与 stats 证书冒烟**

```bash
curl -s -o /dev/null -w 'main: %{http_code}\n' https://qingverse.com/
curl -s -o /dev/null -w 'stats: %{http_code}\n' https://stats.qingverse.com/
```

期望：`main: 200`；`stats: 200`（GoatCounter 未建站时首页可能是 404/302，只要不是 SSL 错误即证书已签成；若 curl 报 SSL 错误，等 1–2 分钟 Caddy 重试签发后再试）。

- [ ] **Step 7: GoatCounter 首次建站（规格 §6「首次部署后创建站点与 API 免登录公开读」）**

```bash
ssh $SERVER 'docker exec -i goatcounter goatcounter db create site -vhost=stats.qingverse.com -user.email=$GC_EMAIL -password="$(openssl rand -base64 18)"'
```

（把 `$GC_EMAIL` 代入真实邮箱；随机密码会回显在命令构造时，妥善交给用户。）期望：命令 exit 0，输出建站成功信息。然后引导**用户手动**完成一次性 UI 操作：浏览器访问 `https://stats.qingverse.com`，用上述邮箱+密码登录 → Settings → 勾选公开面板（"Allow viewing the dashboard without logging in" / public dashboard）→ Save。这是 `/stats` 页免登录取数的前提。

- [ ] **Step 8: ⚠️ 等待用户确认后才可执行——mysql-data 卷处置（规格 §6 待决事项）**

向用户提问：「mysql-data 卷（含旧文章数据副本）保留归档还是删除？」

- 用户选**保留**：不执行任何命令，交付说明记「保留归档」；
- 用户选**删除**：

```bash
ssh $SERVER 'docker volume rm mysql-data && docker volume ls | grep -c mysql'
```

期望：删除成功且 grep 计数为 0（注意：compose 项目卷可能带项目前缀，如 `deploy_mysql-data`，先 `docker volume ls` 确认真实卷名再 rm）。把决定写入交付说明。

**验收标准：** `docker compose ps` 恰好 3 容器 Up；主站与 stats 均 HTTPS 可达；GoatCounter 已建站且 public dashboard 开启；mysql-data 决策已记录。服务器操作无仓库 commit；停机窗口时间已记入交付说明（本地暂不 commit，Task 14 统一提交）。

---

### Task 9: 上线验证 A——HTTP 层（410/404、RSS/sitemap/canonical/JSON-LD、缓存头）

**Files:**
- 不修改文件（验证输出记入交付说明，Task 14 提交）

**Interfaces:**
- Consumes: Task 8 完成的线上环境；一篇真实文章 URL（从 `curl -s https://qingverse.com/feed.xml` 的第一个 `<link>` 取，记为 `$ARTICLE_URL`）
- Produces: 交付说明「验证结果」中 HTTP 层各条的 PASS/FAIL 证据

- [ ] **Step 1: 410 前缀清单逐条实测（§8「旧 URL 前缀返回 410」）**

```bash
for u in /posts/anything /notes/x /murmurs /murmurs/2024 /interview-questions/x /interview-experiences /internship-records /categories/x /images/blog/murmurs-and-reflection/a.jpg; do
  printf '%-55s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://qingverse.com$u)"
done
```

期望输出：9 行全部为 `410`（其中 `/images/blog/...` 一条同时覆盖 §8 隐私验收「旧源文件路径返回 410」）。

- [ ] **Step 2: 410 响应体是品牌化页面、未知路径透传 404**

```bash
curl -s https://qingverse.com/murmurs | grep -c "410 · 这条线已随改版下线"
curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com/definitely-not-a-page
curl -s https://qingverse.com/definitely-not-a-page | grep -c "404 · 这条线还没铺到这里"
```

期望输出：`1`、`404`、`1`（第三条断言 Next.js 404 页文案，逐字来自规格 §5）。

- [ ] **Step 3: RSS 与 sitemap 输出正确域名（§8）**

```bash
curl -s https://qingverse.com/feed.xml | head -20
curl -s https://qingverse.com/feed.xml | grep -c "localhost"
curl -s https://qingverse.com/sitemap.xml | grep -c "https://qingverse.com"
curl -s https://qingverse.com/sitemap.xml | grep -c "localhost"
curl -s https://qingverse.com/robots.txt
```

期望：feed.xml 是 RSS 2.0（含 `<rss version="2.0"` 与 `<category>deep|intro</category>`）；两个 `localhost` 计数为 `0`（grep 计数 0 时 exit 1，属预期）；sitemap 计数 ≥ 1；robots.txt 引用 `https://qingverse.com/sitemap.xml`。同时取 `$ARTICLE_URL`：

```bash
ARTICLE_URL=$(curl -s https://qingverse.com/feed.xml | grep -o '<link>https://qingverse.com/articles/[^<]*' | head -1 | sed 's/<link>//')
echo $ARTICLE_URL
```

期望：形如 `https://qingverse.com/articles/<track>/<slug>` 的 URL。

- [ ] **Step 4: 文章页 canonical / og:image / JSON-LD（§8 curl 检查）**

```bash
curl -s $ARTICLE_URL | grep -o '<link rel="canonical"[^>]*>'
curl -s $ARTICLE_URL | grep -o 'property="og:image" content="https://[^"]*"' | head -1
curl -s $ARTICLE_URL | grep -o '"@type":"Article"' | head -1
curl -s $ARTICLE_URL | grep -oE '"datePublished":"[^"]*"' | head -1
```

期望：canonical 为 `$ARTICLE_URL` 本身；og:image 是 `https://` 绝对 URL；JSON-LD 含 `"@type":"Article"` 与 datePublished。另请用户（或用浏览器工具）把 `$ARTICLE_URL` 贴入 Google Rich Results Test 确认可解析，结果记入交付说明。

- [ ] **Step 5: 缓存头断言（§6 静态资产 immutable、HTML 短缓存、encode 生效）**

```bash
CSS_PATH=$(curl -s https://qingverse.com | grep -o '/_next/static/[^"]*\.css' | head -1)
curl -sI "https://qingverse.com$CSS_PATH" | grep -i cache-control
curl -sI https://qingverse.com/ | grep -i cache-control
curl -sI -H 'Accept-Encoding: gzip' "https://qingverse.com$CSS_PATH" | grep -i content-encoding
```

期望：第一条含 `public, max-age=31536000, immutable`；第二条**不含** immutable（HTML 默认短缓存）；第三条含 `gzip` 或 `zstd`。

**验收标准：** 以上每条与期望一致；任何 FAIL 立即停在本任务修复（Caddyfile 问题回 Task 3 改→commit→push main 触发重新部署→服务器 `cp` 同步→复测）。全部结果（命令+输出）追加到交付说明「验证结果」。

---

### Task 10: 上线验证 B——Playwright 截图矩阵（36 张 + 404）

**Files:**
- 产物：截图文件（MCP Playwright 输出目录），文件名清单见 Step 2；路径清单记入交付说明

**Interfaces:**
- Consumes: 线上站点；`$ARTICLE_URL`（Task 9 Step 3）；MCP Playwright 工具（browser_navigate / browser_resize / browser_evaluate / browser_take_screenshot）
- Produces: §8 要求的「六类页面 × 3 主题 × 2 视口 = 36 张截图矩阵」验收产物 + 404 页 3 主题截图

- [ ] **Step 1: 确定六类页面 URL**

六类页面（§8）：`/`、`/articles`、`$ARTICLE_URL`（详情）、`/projects`、`/about`、`/stats`。

- [ ] **Step 2: 执行 36 张截图矩阵**

对两个视口依次执行（先 `browser_resize` 到 1280×800，跑完 18 张再 resize 到 375×812 跑 18 张）。每个「页面 × 主题」组合的操作序列：

1. `browser_navigate` 到页面 URL；
2. `browser_evaluate`：`() => localStorage.setItem('devline-theme', '<theme>')`（theme ∈ duo/editorial/night）；
3. `browser_navigate` 同 URL（重新加载使防闪烁脚本按 localStorage 应用主题）；
4. `browser_evaluate`：`() => document.documentElement.dataset.theme` —— 断言返回值 === `<theme>`；
5. `browser_take_screenshot`，`fullPage: true`，filename 按下表。

文件名矩阵（36 个，`<page>` ∈ home/articles/article/projects/about/stats，`<theme>` ∈ duo/editorial/night，`<vp>` ∈ desktop/mobile）：`<page>-<theme>-<vp>.png`，例如 `home-duo-desktop.png` … `stats-night-mobile.png`。

逐张人工过目断言（§8）：无结构错乱、无未随主题切换的硬编码颜色块（对照规格 D1 色板：duo 底 #FDFBFC / editorial 底 #FAF6F3 / night 底 #171219）。

- [ ] **Step 3: 404 页三主题截图**

`browser_navigate` 到 `https://qingverse.com/definitely-not-a-page`，按 Step 2 的主题切换序列截 `404-duo-desktop.png` / `404-editorial-desktop.png` / `404-night-desktop.png`，确认双线断线装置与「404 · 这条线还没铺到这里」文案（§5）。

- [ ] **Step 4: 轨道空态处置**

线上两轨若都已有文章，空态无法在线复现（§8 要求空态截图）：检查 `/articles/deep` 与 `/articles/intro` 是否有一轨为空——为空则照常截 3 主题空态图（文案断言：「深度线首篇打磨中 · 先沿科普线逛逛 →」或对称文案，§5）；两轨都非空则在交付说明如实点名「空态未在线上复现，引用阶段三 /dev/themes 本地验收截图」。

**验收标准：** 36 + 3 张截图齐全且逐张过目通过；截图存放路径清单写入交付说明。无仓库 commit。

---

### Task 11: 上线验证 C——主题持久化 / prefers-color-scheme / rail-tab 键盘 / 字体请求断言

**Files:**
- 产物：focus ring 截图 1 张 + 断言记录（记入交付说明）

**Interfaces:**
- Consumes: 线上首页；MCP Playwright（browser_navigate / browser_evaluate / browser_click / browser_press_key / browser_network_requests / browser_run_code_unsafe / browser_take_screenshot / browser_snapshot）
- Produces: §8 交互与字体条目的 PASS/FAIL 证据

- [ ] **Step 1: 主题切换器 UI 切换 + 持久化**

1. `browser_navigate` `https://qingverse.com/`；`browser_evaluate`：`() => localStorage.clear()`；重新 navigate；
2. `browser_evaluate`：`() => document.documentElement.dataset.theme` → 期望 `duo`（默认）；
3. `browser_snapshot` 找到导航栏主题切换按钮（`aria-label` 含「主题」），`browser_click` 打开面板，`browser_click` 「夜航」选项；
4. `browser_evaluate`：`() => [document.documentElement.dataset.theme, localStorage.getItem('devline-theme')]` → 期望 `["night","night"]`；
5. `browser_navigate` 重新加载 → `dataset.theme` 仍为 `night`（持久化 PASS）。

- [ ] **Step 2: prefers-color-scheme: dark 落夜航**

`browser_run_code_unsafe`：

```js
await page.emulateMedia({ colorScheme: 'dark' });
await page.evaluate(() => localStorage.clear());
await page.reload();
return await page.evaluate(() => document.documentElement.dataset.theme);
```

期望返回 `night`。随后恢复：`await page.emulateMedia({ colorScheme: 'light' })`。

- [ ] **Step 3: rail-tab 键盘操作与 focus ring（§8）**

1. `browser_navigate` `https://qingverse.com/`；`browser_evaluate`：`() => localStorage.clear()`；重新 navigate（回到默认 deep 轨）；
2. `browser_evaluate` 聚焦选中 tab：`() => { document.querySelector('[role="tab"][aria-selected="true"]').focus(); return document.activeElement.textContent }` → 期望含「深度线」；
3. `browser_take_screenshot` `railtab-focusring.png` —— 人工确认可见 focus ring（2px outline，规格 §5）；
4. `browser_press_key` `ArrowDown`；`browser_evaluate`：`() => [document.documentElement.dataset.track, localStorage.getItem('devline-track'), document.activeElement.getAttribute('aria-selected')]` → 期望 `["intro","intro","true"]`（roving tabindex + 自动激活，§5）；
5. `browser_press_key` `ArrowUp`；同样断言回到 `["deep","deep","true"]`。

- [ ] **Step 4: 字体请求断言（§8 机器可验证断言，规格 D3）**

1. `browser_navigate` `https://qingverse.com/`；`browser_evaluate`：`() => { localStorage.clear() }`；重新 `browser_navigate`（保证 duo 默认主题冷加载）；
2. `browser_network_requests` → 断言：**没有任何** URL 含 `fonts.googleapis`、`fonts.gstatic`，且没有任何 `.woff2` 请求（默认主题双线 B 首屏 0 字体请求）；
3. `browser_evaluate`：`() => localStorage.setItem('devline-theme','editorial')`；`browser_navigate` 重新加载；
4. `browser_network_requests` → 断言：出现来自 `/_next/static/media/` 的 `.woff2` 请求（Noto Serif SC 切片，按需拉取），且仍无 `fonts.googleapis`（自托管）。

**验收标准：** Step 1–4 全部断言 PASS，focus ring 截图存档；结果记入交付说明。无仓库 commit。

---

### Task 12: 上线验证 D——Lighthouse 与 WCAG AA 对比度

**Files:**
- Create（临时，scratchpad 不入仓库）：`/private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/axe-check/check.js`

**Interfaces:**
- Consumes: 线上站点；`$ARTICLE_URL`
- Produces: Lighthouse Performance 分数与 LCP 数值、三主题 axe 对比度报告——§8 两条硬指标的证据

- [ ] **Step 1: Lighthouse 移动端（§8：Performance ≥ 90、LCP ≤ 2.5s）**

```bash
npx -y lighthouse https://qingverse.com \
  --only-categories=performance \
  --form-factor=mobile --screenEmulation.mobile \
  --screenEmulation.width=375 --screenEmulation.height=812 \
  --chrome-flags="--headless=new" --quiet \
  --output=json --output-path=/private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/lh.json
node -e '
const r = require("/private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/lh.json");
const perf = r.categories.performance.score * 100;
const lcp = r.audits["largest-contentful-paint"].numericValue;
console.log(`Performance: ${perf}  LCP: ${lcp}ms`);
process.exit(perf >= 90 && lcp <= 2500 ? 0 : 1);
'
```

期望：打印分数与 LCP，exit 0。失败则记录数值、分析 lh.json 的 opportunities，作为待修项如实写入交付说明（不静默放过）。

- [ ] **Step 2: 搭建 axe 检查脚本**

```bash
mkdir -p /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/axe-check
cd /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/axe-check
npm init -y >/dev/null && npm i --no-audit --no-fund playwright @axe-core/playwright >/dev/null && npx playwright install chromium
```

写入 `check.js`（完整代码）：

```js
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

const BASE = 'https://qingverse.com';
const ARTICLE = process.argv[2]; // 传入 $ARTICLE_URL
const PAGES = ['/', '/articles', '/projects', '/about', '/stats', ARTICLE.replace(BASE, '')];
const THEMES = ['duo', 'editorial', 'night'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failed = false;
  for (const theme of THEMES) {
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.evaluate(t => localStorage.setItem('devline-theme', t), theme);
      await page.reload({ waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
      const contrast = results.violations.filter(v => v.id === 'color-contrast');
      const n = contrast.reduce((s, v) => s + v.nodes.length, 0);
      console.log(`${theme} ${path} color-contrast violations: ${n}`);
      for (const v of contrast) for (const node of v.nodes) {
        console.log(`  FAIL ${node.target.join(' ')}\n    ${node.failureSummary.replace(/\n/g, ' ')}`);
        failed = true;
      }
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
```

- [ ] **Step 3: 运行三主题 × 六页面对比度检查（§8 AA）**

```bash
cd /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad/axe-check
node check.js "$ARTICLE_URL"
```

期望：18 行 `... color-contrast violations: 0`，exit 0。有违规则逐条对照规格 D1「AA 修正」列核实（修正项以 D1 表为准，不回抄 mockup 原值），前台代码问题回阶段三对应组件修复后重新部署复测。

**验收标准：** Lighthouse 断言 exit 0（或数值+待修项如实记录）；axe 对比度 18 项全 0；结果记入交付说明。无仓库 commit。

---

### Task 13: 上线验证 E——统计链路两状态、grep 无情长、隐私复查、版本一致性

**Files:**
- 产物：`stats-normal.png` / `stats-degraded.png` / GoatCounter 后台截图；断言记录

**Interfaces:**
- Consumes: `$SERVER`；Task 8 建好的 GoatCounter 站点；GitHub 仓库 `EthanQC/my-learning-record`
- Produces: §8 统计链路 / 品牌清洁 / 隐私验收 / 部署一致性四组证据

- [ ] **Step 1: 统计链路——计数增长（§8）**

1. `browser_navigate` `https://qingverse.com/` 与 `https://qingverse.com/articles`（制造 2 次真实 pageview；注意 count.js 的 `data-allow-local` 已关，线上访问才计数）；
2. 等待约 30 秒（GoatCounter 有内存缓冲落库延迟）；
3. `browser_navigate` `https://stats.qingverse.com`（public dashboard 已开启，免登录可见）→ `browser_take_screenshot` `goatcounter-dashboard.png`，确认 pageview 计数 ≥ 2 且路径列表出现 `/` 与 `/articles`。

- [ ] **Step 2: /stats 页正常态截图**

`browser_navigate` `https://qingverse.com/stats` → 确认渲染出 PV/UV 数字与趋势图（数据来自 GoatCounter 公开 JSON 端点）→ `browser_take_screenshot` `stats-normal.png`。

- [ ] **Step 3: ⚠️ 等待用户确认后才可执行——手动停掉 goatcounter 容器测降级**

向用户确认：「即将 `docker compose stop goatcounter` 约 1 分钟以验证 /stats 优雅降级（主站不受影响），是否继续？」确认后：

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && docker compose stop goatcounter'
```

然后 `browser_navigate` `https://qingverse.com/stats`（强制刷新）→ 期望页面骨架完好并显示「统计服务暂不可用」（§5 空态文案）、版式不破 → `browser_take_screenshot` `stats-degraded.png`。同时 `curl -s -o /dev/null -w '%{http_code}\n' https://qingverse.com/` 期望 `200`（统计挂了不影响主站，§6）。最后恢复：

```bash
ssh $SERVER 'cd ~/workspace/my-learning-record/deploy && docker compose start goatcounter && docker compose ps --format "{{.Name}}\t{{.Status}}" | grep goatcounter'
```

期望：goatcounter Up。

- [ ] **Step 4: 全站无「情长」（§8 grep 构建产物断言）**

```bash
ssh $SERVER 'docker exec qv-web sh -c "grep -R \"情长\" .next public 2>/dev/null" && echo FOUND || echo CLEAN'
curl -s https://qingverse.com/ https://qingverse.com/about https://qingverse.com/articles | grep -c "情长" || echo PAGES-CLEAN
```

期望：`CLEAN` 与 `PAGES-CLEAN`（任何 FOUND → 定位来源文件，回阶段三修复）。

- [ ] **Step 5: 隐私验收复查（§8）**

```bash
cd /private/tmp/claude-501/-Users-abble-my-learning-record/3bd41468-2b65-4f49-bd58-591810d16abe/scratchpad
git clone https://github.com/EthanQC/my-learning-record.git fresh-clone && cd fresh-clone
# 口径与阶段一 Task 8 一致：按【内容路径】判定，而非对文件内容 grep "murmurs"
# （否则会误命中两类预期残留：docs/ 下含 "murmurs" 字样的 spec/计划文档、以及历史里的 apps/web/src/app/murmurs 旧路由代码）
# 1) murmurs 情感内容的三个历史路径：全历史零文件
git log --all --format= --name-only -- \
  'content/blog/murmurs-and-reflection/*' 'murmurs-and-reflection/*' 'murmurs/*' | sort -u | grep . && echo "FOUND-CONTENT!" || echo CONTENT-PATHS-CLEAN
# 2) 全历史对象里除【已知代码路径】外无 murmurs 路径（apps/web/src/app/murmurs 是纯路由代码、非隐私，属既定偏差）
git rev-list --all --objects | awk '{print $2}' | grep -i murmur | grep -v '^apps/web/src/app/murmurs' | sort -u && echo "FOUND-UNEXPECTED!" || echo OBJECT-PATHS-CLEAN
```

期望：`CONTENT-PATHS-CLEAN` 与 `OBJECT-PATHS-CLEAN`（三个情感内容路径在全历史零文件；对象路径除 `apps/web/src/app/murmurs`（旧路由代码，阶段三 HEAD 已删，历史残留属阶段一交付说明既定偏差）外无 murmurs 命中）。**不使用 `git grep murmurs $(git rev-list --all)`**——那会对文件*内容*grep，必然命中 docs/ 里的 spec/计划文档与旧路由代码，与「按内容路径判定」的阶段一口径冲突、永远无法 CLEAN。另外：用浏览器访问一个旧 murmurs 文件的 GitHub 网页路径与阶段一交付说明记录的旧 commit SHA 直链（完整 SHA 见阶段一 `phase1-log.md`，不粘贴于此），把返回结果（404 或悬挂对象仍可达）**如实记录**进交付说明（§8：悬挂对象残留风险书面化）。`/images/blog/...` 的 410 已在 Task 9 Step 1 覆盖，交叉引用即可。

- [ ] **Step 6: 服务器版本一致性（§8：镜像 tag、容器版本、git log 三方一致）**

```bash
git -C /Users/abble/my-learning-record fetch origin main && git -C /Users/abble/my-learning-record rev-parse --short origin/main
ssh $SERVER 'cd ~/workspace/my-learning-record && git log -1 --format=%h && grep ^WEB_TAG deploy/.env && docker inspect qv-web --format "{{.Config.Image}}"'
```

期望：本地 `origin/main` 短 SHA == 服务器工作区短 SHA == `WEB_TAG` 值 == qv-web 镜像 tag 后缀（即 Task 7 Step 3 记录的 `<sha7>`）。

**验收标准：** 四组证据全部 PASS 并连同截图路径记入交付说明；goatcounter 已恢复 Up。无仓库 commit。

---

### Task 14: 交付说明收尾与提交

**Files:**
- Modify: `docs/superpowers/delivery/2026-07-devline-cutover.md`（Task 6 创建，本任务补全「停机窗口」「验证结果与未实测项」「mysql-data 决定」）

**Interfaces:**
- Consumes: Task 7–13 的全部记录（停机时间、`<sha7>`、各验证 PASS/FAIL、截图路径、悬挂对象探测结果、Rich Results Test 结果）
- Produces: 完整交付说明——按全局 CLAUDE.md「完成」定义，未实测项逐条点名后才能对用户宣布切流完成

- [ ] **Step 1: 补全交付说明**

把以下内容如实填入对应章节（全部来自前序任务的真实输出，禁止出现"待补充"字样——没做的项写为「未实测：<原因>」）：

1. 停机窗口起止时间与时长（Task 8 Step 1/5）；
2. 上线版本 `<sha7>` 与三方一致性核对结果（Task 13 Step 6）；
3. §8 每条验证的 PASS/FAIL 与证据（命令输出摘录、截图文件路径清单：36+3 张矩阵、focus ring、goatcounter-dashboard、stats-normal/degraded）；
4. 未实测项如实点名（预期至少可能包括：轨道空态若未在线上复现、GitHub 悬挂对象残留状态、Rich Results Test 若未人工执行）；
5. mysql-data 卷处置决定（Task 8 Step 8）；
6. GoatCounter 管理账号信息移交方式（密码已线下交付用户，不写入文档）。

- [ ] **Step 2: GSC 收尾（人工步骤——规格 §6 与阶段一交付说明的两项待办）**

指引用户在 Google Search Console（qingverse.com 资产，阶段一 Task 8 Step 5 已验证/记录）完成两件事（agent 无法代操作，属人工步骤，如实记录）：

1. 「站点地图」→ 提交 `https://qingverse.com/sitemap.xml`（规格 §6 metadata 条目 6「上线清单增加『GSC 提交新 sitemap』」）；
2. 「移除」→「新请求」→「移除此前缀开头的所有网址」，提交前缀 `https://qingverse.com/murmurs`（规格 §6：`/murmurs*` 的 410 已上线——Task 9 Step 1 已实测——用「移除网址」工具加速清搜索引擎缓存；阶段一交付说明中记为「阶段四待办」的即此项）。

完成后把提交时间与 GSC 显示的请求状态写入交付说明「验证结果」；若用户暂不执行，逐条记入「未实测项」。

- [ ] **Step 3: 检查交付说明无占位符**

```bash
cd /Users/abble/my-learning-record
! grep -nE "<sha7>|<旧值>|<值>|待补充|TODO|TBD|Task [0-9]+ Step [0-9]+ 填写" docs/superpowers/delivery/2026-07-devline-cutover.md && echo DELIVERY-CLEAN
```

期望输出：`DELIVERY-CLEAN`。

- [ ] **Step 4: Commit 到 main**

```bash
cd /Users/abble/my-learning-record
git checkout main && git pull origin main
git add docs/superpowers/delivery/2026-07-devline-cutover.md
git commit -m "docs: Devline 切流交付说明（验证结果/停机窗口/回滚信息/未实测项）"
git push origin main
```

说明：`docs/**` 不在 deploy.yml 触发路径中，此提交不会触发部署（Task 4 已收窄路径）。

- [ ] **Step 5: 向用户汇报**

按全局 CLAUDE.md「完成」定义汇报：已在线上实测的项逐条给证据（截图/命令输出），未实测项逐条如实点名，不笼统宣称「全部完成」。

**验收标准：** 交付说明无占位符、已推送 main；用户收到含证据与未实测项清单的汇报。

---

## 自审记录（计划作者）

- **规格覆盖**：§6 架构条目（compose 3 容器 / 410 清单 / 缓存 / stats / 挂载移除 / depends_on）→ Task 2、3、8；§7 步骤 5（deploy.yml 三处修改 + content 路径收窄 + 同批合入）→ Task 4、7；§7A（旧 tag 记录 / 配置备份 / 回滚步骤 / 停机窗口）→ Task 6、8、14；§8 全部验证标准逐条落到 Task 9–13（截图矩阵 36 张 = Task 10、交互与字体 = Task 11、Lighthouse+AA = Task 12、统计/情长/隐私/一致性 = Task 13、RSS/sitemap/canonical/JSON-LD/410/404 = Task 9）。
- **破坏性检查点**：合并切流（Task 7 Step 1）、服务器 down 旧栈（Task 8 Step 1）、mysql-data 删除（Task 8 Step 8）、停 goatcounter（Task 13 Step 3）均设「⚠️ 等待用户确认」。
- **类型/契约一致性**：容器名 goatcounter、卷 goatcounter-data、子域 stats.qingverse.com、localStorage key devline-theme/devline-track、data-theme/data-track 取值均与跨阶段固定契约一致。
