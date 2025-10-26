# syntax=docker/dockerfile:1.6

########################
# build stage
########################
FROM golang:1.24-alpine AS build
WORKDIR /src

# 可选：把 Alpine 源换到更快的（不是 163）
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 证书 + git 必须有，否则 go get 会失败
RUN apk add --no-cache ca-certificates git tzdata

# 设置 Go 模块镜像（关键）
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=sum.golang.google.cn \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# 先只拷贝 mod 文件，利用缓存
COPY go.mod go.sum ./

# 用 BuildKit 缓存模块与构建中间产物，避免重复下载
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# 再拷贝源码并编译（-p 1 降低内存峰值）
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -p 1 -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

########################
# runtime stage
########################
FROM alpine:3.20
WORKDIR /app

# 同步时区 + 证书
RUN apk add --no-cache ca-certificates tzdata \
 && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

COPY --from=build /out/server ./server

EXPOSE 9000
ENV ADDR=0.0.0.0:9000
CMD ["./server"]
