# Devline · my-learning-record

![Build Status](https://img.shields.io/github/actions/workflow/status/EthanQC/my-learning-record/deploy.yml?label=Build&logo=github)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)

**Devline** 是我的双线个人技术博客：**深度线**拆源码与架构，写给工程师；**科普线**把同一批技术讲成人话，写给所有人。三套完整主题（duo / editorial / night），线上访问：**<https://qingverse.com>**。

仓库同时保管我的学习笔记与面试记录（`content/blog`、`content/notes`，冻结归档，不在站点展示）。

## 架构

- **前端**：Next.js 16（App Router）纯静态 SSG，standalone 产物，MDX 内容管线（zod frontmatter 校验，构建期失败即 build 失败）
- **反代**：Caddy（自动 HTTPS；旧路径前缀 410；未知路径透传 404）
- **统计**：GoatCounter（自托管，`stats.qingverse.com` 公开面板，无 Cookie）
- **部署**：Docker Compose 3 容器（`qv-web` / `qv-caddy` / `goatcounter`），GitHub Actions 构建镜像 → 推 ACR → SSH 部署
- 旧 Go API 与 MySQL 已于 2026-07 改版中退役（`apps/api/` 仅作代码归档保留，不参与构建与部署）

## 目录结构

```
.
├ apps/
│  ├ web/      # Next.js 前台（见 apps/web/README.md）
│  └ api/      # 已退役的 Go API（归档，不构建）
├ content/
│  ├ articles/ # 站点文章（deep/ 深度线、intro/ 科普线、PUBLISH_LOG.md 发布日志）
│  ├ blog/     # 面经、实习记录等（归档，不在站点展示）
│  └ notes/    # 各方向学习笔记（归档，不在站点展示）
├ deploy/      # 服务器 compose + Caddyfile + .env 的 .example 三件套
├ scripts/     # CI 门禁与内容工具脚本
└ docs/        # 设计规格 / 阶段计划 / 交付说明（superpowers/ 下）
```

## 快速开始（本地开发）

要求：Node 22 + npm 10，无需 Docker/数据库。

```bash
git clone git@github.com:EthanQC/my-learning-record.git
cd my-learning-record
npm install        # workspaces，一次装完
npm run dev        # 启动前台 http://localhost:3000（predev 自动拷贝文章图片）
```

常用命令：

```bash
npm test                 # 单测（node:test + tsx，apps/web/tests/）
npm run build:web        # 生产构建（SSG + MDX 编译 + frontmatter 校验）
node scripts/check-css-size.mjs    # CSS 预算门禁（总量 80KB + 三主题增量 10KB，需先 build）
node scripts/check-no-raw-hex.mjs  # 组件层禁裸 hex 门禁
```

## 发布文章

对 Claude Code 说「发布 <文章路径>」即可走 `publish-article` 流水线（工单确认 → 落位校验 → 本地预览门 → push 确认门 → CI → 线上全套验证 → 发布日志）。流程指令在 `.claude/skills/publish-article/SKILL.md`，规格在 `docs/superpowers/specs/2026-07-04-publish-article-worksystem.md`。

手动校验单篇：`npx tsx scripts/validate-article.mjs content/articles/<track>/<slug>.mdx`。

## 部署 / CI

push `main` 命中触发路径（`apps/web/**`、`content/articles/**`、`deploy/**`、`scripts/**`、workflow 与根锁文件）后，`.github/workflows/deploy.yml` 依次执行：

1. **checks**：lint / tsc / 单测 / build / CSS 预算 / 禁裸 hex / 品牌词门禁
2. **build**：Docker 构建 standalone 镜像并推送 ACR（tag = 短 SHA）
3. **deploy**：SSH 到 VPS 更新 `WEB_TAG` 并 `docker compose up -d web`

服务器侧配置见 `deploy/` 三个 `.example` 文件（真实 `.env` 只存在于服务器）。

## 文档

- 设计规格：`docs/superpowers/specs/2026-07-03-devline-redesign-design.md`（品牌/三主题/组件/页面/预算/a11y/SEO）
- 阶段计划与交付说明：`docs/superpowers/plans/`、`docs/superpowers/delivery/`（含隐私迁移与切流的完整记录）
