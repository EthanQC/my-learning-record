# -------- deps --------
FROM node:22-alpine AS deps
WORKDIR /app
# 只拷贝 web 的包文件
COPY apps/web/package*.json ./
# 有 lockfile 用 ci，避免额外写入；没有就 install
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# -------- build --------
FROM node:22-alpine AS build
WORKDIR /app
# 带上依赖（这一步是你之前缺的）
COPY --from=deps /app/node_modules ./node_modules
# 拷贝 web 源码；如果你的构建需要 content 参与（如生成静态路径），一起拷贝
COPY apps/web ./ 
# COPY content ./content   # 若 generateStaticParams 在构建期读 content，则取消注释
ENV NEXT_PUBLIC_API_BASE_URL=http://api:9000
RUN npm run build

# -------- runtime --------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=deps  /app/node_modules ./node_modules
COPY apps/web/package.json ./package.json
EXPOSE 3000
CMD ["npm","run","start","--","-p","3000"]
