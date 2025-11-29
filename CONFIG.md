# 配置总览

这里只区分两套环境：

1) 本地开发（笔记内容 + 前后端手动起，数据库用本机 docker 的 mysql8 容器）  
2) 服务器/生产（CI/CD 自动构建镜像，服务器用 docker compose + Caddy 反代）

`deploy` 目录只给服务器用；本地开发不需要它

---
## 文件与用途

- 本地后端：`apps/api/.env`（示例 `apps/api/.env.example`）  
  - `CORS_ORIGINS`：允许的跨域来源；记得包含本地前端和 Swagger 所在地址 (`http://localhost:9000` 等)  
  - `MYSQL_DSN`：直接连本机 MySQL 容器的 DSN  
  - `ADDR`：本地监听地址  
  - `ADMIN_TOKEN`：保护 `/api/contact` GET  
  - `CONTENT_DIR`：Markdown 内容目录

- 本地前端：`apps/web/.env.local`（示例 `apps/web/.env.local.example`）  
  - `NEXT_PUBLIC_API_BASE_URL`：浏览器访问 API 的地址（无需带 `/api`，代码会补）  
  - `INTERNAL_API_BASE_URL`：SSR/Node 访问 API 的地址（本地同样指向 9000）

- 服务器/CI：`deploy/.env`（示例 `deploy/.env.example`，不提交到 Git）  
  - `REGISTRY`：镜像仓库前缀；`API_TAG/WEB_TAG` 由 GitHub Actions 写入  
  - `DOMAIN`：Caddy 监听域名（可多个，逗号分隔）  
  - `CORS_ORIGINS`：生产允许的前端来源  
  - `PUBLIC_API_BASE_URL`：前端对外访问 API 的公网地址（供 web 容器读取）  
  - `MYSQL_*`：数据库账号；容器内部通过 `mysql:3306` 访问  
  - `ADMIN_TOKEN`：保护管理接口
  - 其余配置在 `deploy/docker-compose.yml`、`deploy/Caddyfile` 中使用

---
## 本地开发步骤
1) MySQL：确保 `mysql8` 容器运行（已有映射 3306:3306）。需要初始化可用 `make docker-up`（目录：`apps/api`）。  
2) 复制 env：`cp apps/api/.env.example apps/api/.env`（按需改密码）、`cp apps/web/.env.local.example apps/web/.env.local`。  
3) 启动：  
   - 后端：`cd apps/api && make dev`（或 `go run cmd/server/main.go`）  
   - 前端：`npm run dev:web`（仓库根目录）  
4) Swagger：访问 `http://localhost:9000/swagger/index.html`，若 CORS 报错，确认 `.env` 的 `CORS_ORIGINS` 包含 `http://localhost:9000`。

---
## 服务器/生产部署流程（CI/CD）
1) 在服务器 `deploy/` 下创建 `.env`：`cp .env.example .env`，填入实际域名、数据库密码、`ADMIN_TOKEN` 等。  
2) GitHub Actions (`.github/workflows/deploy.yml`) 在 `main` 推送时：  
   - 构建并推送镜像到 `REGISTRY`，Tag = 提交 SHA 前 7 位  
   - SSH 到服务器，写入 `.env` 的 `API_TAG/WEB_TAG`，执行 `docker compose pull/up` 并重启 `caddy`
3) 手动重部署（服务器上）：  
   ```
   cd ~/workspace/my-learning-record/deploy
   docker compose pull api web
   docker compose up -d api web
   docker compose restart caddy
   ```

---
## 变量速查

| 文件 | 必填键 | 作用 |
| --- | --- | --- |
| `apps/api/.env` | `CORS_ORIGINS` | 允许的跨域来源；需含 Swagger/前端来源 |
|  | `MYSQL_DSN` | 连接本地 MySQL |
|  | `ADDR` | API 监听地址（本地） |
|  | `ADMIN_TOKEN` | 保护 `/api/contact` GET |
|  | `CONTENT_DIR` | Markdown 内容路径 |
| `apps/web/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | 浏览器请求 API 的地址 |
|  | `INTERNAL_API_BASE_URL` | SSR/Node 请求 API 的地址 |
| `deploy/.env` | `REGISTRY` | 镜像仓库前缀 |
|  | `API_TAG` / `WEB_TAG` | 由 CI 写入镜像 Tag |
|  | `DOMAIN` | Caddy 域名 |
|  | `CORS_ORIGINS` | 生产跨域来源 |
|  | `PUBLIC_API_BASE_URL` | 前端使用的对外 API 基础地址 |
|  | `MYSQL_*` | 生产数据库账号信息 |
|  | `ADMIN_TOKEN` | 生产管理 Token |

---
## 使用提示
- 本地开发 **不需要** 读 `deploy` 目录；服务器部署 **只读** `deploy` 下的文件和 `.env`。  
- Swagger CORS 问题基本由 `CORS_ORIGINS` 覆盖本地 9000 端口解决。  
- 修改变量后，后端需重启；服务器改 `.env` 后要重新 `docker compose up -d`。  
- 不要把 `deploy/.env`、`apps/api/.env`、`apps/web/.env.local` 提交到 Git。
