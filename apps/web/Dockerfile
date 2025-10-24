# -------- deps --------
FROM node:22-alpine AS deps
RUN mkdir -p /repo/apps/web
WORKDIR /repo/apps/web
COPY apps/web/package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# -------- build --------
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .                                   
WORKDIR /repo/apps/web
ENV NEXT_PUBLIC_API_BASE_URL=http://api:9000
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# -------- runtime --------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/web/.next ./.next
COPY --from=build /repo/apps/web/public ./public
COPY --from=deps  /repo/apps/web/node_modules ./node_modules
COPY apps/web/package.json ./package.json
EXPOSE 3000
CMD ["npm","run","start","--","-p","3000"]
