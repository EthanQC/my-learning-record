# apps/web —— Devline 前台

Next.js 16（App Router）静态站（SSG），Devline 三主题（duo / editorial / night）双线技术博客前台。线上：<https://qingverse.com>。整体架构与部署说明见[仓库根 README](../../README.md)。

## 本地开发

```bash
# 在仓库根安装依赖（npm workspaces）
npm install

# 启动 dev server（predev 钩子会先跑 scripts/copy-article-assets.mjs 拷贝文章图片）
npm run dev:web
```

## 测试

```bash
# 在 apps/web 下（或仓库根 npm test，等价委托）
npm test          # node:test + tsx，tests/*.test.ts
```

## 结构要点

- `src/styles/tokens.css`——三主题设计 token 唯一色值来源（组件层禁止裸 hex，CI 有门禁）
- `src/styles/globals.css`——组件样式与 D5 主题装饰差异
- `src/lib/content.ts` / `content-schema.ts`——MDX 内容读取与 zod frontmatter 校验（构建期校验失败即 build 失败）
- 内容在仓库根 `content/articles/<track>/<slug>.mdx`（track ∈ deep|intro），图片放同名 `<slug>.assets/`
- 设计规格：`docs/superpowers/specs/2026-07-03-devline-redesign-design.md`

## 构建与部署

`apps/web/Dockerfile` 多阶段构建 standalone 产物；push main 命中触发路径后由 `.github/workflows/deploy.yml` 构建镜像、推 ACR、SSH 部署到 VPS（Caddy 反代 + GoatCounter 统计，见 `deploy/`）。非 Vercel 部署。
