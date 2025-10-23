# apps/web/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app

# 只拷贝包管理文件，利用缓存
COPY package.json package-lock.json* .npmrc* ./

# 有 lockfile 用 npm ci；否则退回 npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ../../content ./content

# 生产环境变量（也可在 compose 里传）
ENV NEXT_PUBLIC_API_BASE_URL=https://qingverse.com
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
