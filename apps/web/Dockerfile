######## deps：准备 web workspace 依赖 ########
FROM node:22-alpine AS deps

# 1. 先装一些构建 / 拉包必需的基础工具
#    - git：有些依赖是从 github 拉的，不装就会挂死
#    - build-base：有些 npm 包会编译本地扩展，没有这个会装不上
#    - python3：有些 node 模块会要求 node-gyp，用得到
RUN apk add --no-cache git python3 make g++

# 我们把 /repo 当成整个 monorepo 的根
WORKDIR /repo

# 1. 复制根的依赖声明和锁文件
#    注意：这里依赖你的仓库根目录已经有 package-lock.json
COPY package.json package-lock.json ./

# 2. 复制 web 这个子包的 package.json
#    不复制整个源码，只复制 package.json，是为了缓存友好
COPY apps/web/package.json apps/web/package.json

#    切 npm 源到一个镜像，比如 npmmirror（原淘宝源）
#    如果你将来在国外的服务器上打正式生产镜像，可以把这行注释掉，回到官方源保持一致性
RUN npm config set registry https://registry.npmmirror.com

# 3. 安装依赖，但只安装 web 这个 workspace 的依赖
#    这样 npm 不会因为没看到 apps/api 就报错
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --workspace apps/web

######## build：真正构建 Next.js ########
FROM node:22-alpine AS build

# 我们在 /app 下构建 web 应用
WORKDIR /app

# 1. 把依赖从 deps 阶段拷过来
#    这里合并根 node_modules 和 web 子包 node_modules
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./node_modules

# 2. 拷贝 web 的完整源码
COPY apps/web/ ./

# 3. 构建期只需要新内容目录（prebuild 拷贝图片 + SSG 编译 MDX）
COPY content/articles/ ./content/articles/

# 3.1 prebuild 脚本（package.json 里以 ../../scripts/ 引用，从 /app 解析为 /scripts/）
COPY scripts/copy-article-assets.mjs /scripts/copy-article-assets.mjs

# 4. 搜索引擎站长验证串（NEXT_PUBLIC_* 在构建期内联，必须走 build-arg 而非运行期 env；
#    值由 deploy.yml 的 build-args 从 GitHub Repository variables 传入，未设置时为空=不渲染 meta）
ARG NEXT_PUBLIC_GSC_VERIFICATION=
ARG NEXT_PUBLIC_BING_VERIFICATION=
ENV NEXT_PUBLIC_GSC_VERIFICATION=$NEXT_PUBLIC_GSC_VERIFICATION
ENV NEXT_PUBLIC_BING_VERIFICATION=$NEXT_PUBLIC_BING_VERIFICATION

# 5. 给构建过程多一点内存，避免 Next.js 构建时爆内存
ENV NODE_OPTIONS=--max-old-space-size=2048

# 6. 产出 Next.js 构建结果（包含 .next/standalone）
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npm run build

######## runtime：极简运行镜像 ########
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# standalone 运行产物（Next.js output: server.js 等）
COPY --from=build /app/.next/standalone ./

# 静态资源
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
