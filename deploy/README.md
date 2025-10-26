# 部署指南

## 本地构建推送（开发机器）

在你的 32GB 开发机器上执行：

```bash
cd deploy

# 首次使用需要添加执行权限
chmod +x build-push.sh

# 构建并推送镜像到 Docker Hub
./build-push.sh
```

构建完成后，镜像会被推送到 Docker Hub：
- `ethanqc/qingverse-api:${TAG}`
- `ethanqc/qingverse-web:${TAG}`

## 服务器部署

### 1. 准备服务器环境

```bash
# 克隆或上传 deploy 目录到服务器
scp -r deploy user@your-server:/path/to/

# 或者只上传必要文件
scp deploy/.env.example user@your-server:/path/to/deploy/
scp deploy/docker-compose.yml user@your-server:/path/to/deploy/
scp deploy/Caddyfile user@your-server:/path/to/deploy/
scp deploy/deploy-server.sh user@your-server:/path/to/deploy/
```

### 2. 配置环境变量

在服务器上：

```bash
cd /path/to/deploy

# 复制并编辑配置文件
cp .env.example .env
nano .env  # 修改必要的配置
```

**服务器 .env 配置**（不需要 DOCKER_PAT）：

```env
# Docker Hub
DH_USER=ethanqc
TAG=2025-10-26-01

# 域名/跨域
DOMAIN=qingverse.com
CORS_ORIGIN=https://qingverse.com
PUBLIC_API_BASE_URL=https://qingverse.com

# MySQL
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_USER=app
MYSQL_PASSWORD=your-app-password
MYSQL_DATABASE=qingverse
```

### 3. 部署服务

```bash
cd /path/to/deploy

# 添加执行权限
chmod +x deploy-server.sh

# 部署服务
./deploy-server.sh
```

## 更新流程

### 本地开发机器

```bash
# 1. 修改代码后，更新 TAG
nano deploy/.env  # 修改 TAG=2025-10-26-02

# 2. 构建并推送新镜像
cd deploy
./build-push.sh
```

### 服务器

```bash
# 1. 更新 TAG
nano /path/to/deploy/.env  # 修改 TAG=2025-10-26-02

# 2. 部署新版本
cd /path/to/deploy
./deploy-server.sh
```

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f api

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 停止并删除数据卷（危险操作！）
docker-compose down -v
```