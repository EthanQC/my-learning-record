# syntax=docker/dockerfile:1.6

######## deps ########
FROM node:22-alpine AS deps
WORKDIR /repo/apps/web
COPY apps/web/package*.json ./
RUN npm ci --no-audit --no-fund

######## build ########
FROM node:22-alpine AS build
WORKDIR /repo

# 带上依赖
COPY --from=deps /repo/apps/web/node_modules apps/web/node_modules

# 拷贝整个仓库（构建期可能读取 content 生成静态路由）
COPY . .

# 通过 build-arg 传入对外 API 地址（默认生产）
ARG NEXT_PUBLIC_API_BASE_URL=https://qingverse.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# 给构建提一点内存余量（本地 32G 其实无所谓）
ENV NODE_OPTIONS=--max-old-space-size=2048

# 使用 BuildKit 缓存 next/.npm
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/repo/apps/web/.next/cache \
    npm --prefix apps/web run build
# 构建完成后应得到 apps/web/.next/standalone + .next/static

######## runtime ########
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 拷贝 standalone 运行产物（不需要 node_modules）
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public       ./apps/web/public

# 如果服务器用卷挂载 content，请保持这个容器内路径：
# /app/apps/web/content  （compose 我会给你配好）

EXPOSE 3000
CMD ["node", "server.js"]
