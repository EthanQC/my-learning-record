# syntax=docker/dockerfile:1.6

########################
# build stage
########################
FROM golang:1.24-alpine AS build
WORKDIR /src

ARG GOPROXY=https://proxy.golang.com.cn,https://goproxy.cn,https://goproxy.io,direct
ENV GOPROXY=$GOPROXY

# 证书 + git（go mod 取包需要）
RUN apk add --no-cache ca-certificates git tzdata

# Go 模块代理与构建参数
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=sum.golang.google.cn \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# 仅拷贝 mod 文件以利用缓存
COPY go.mod go.sum ./

# 缓存 go mod & go build 中间产物
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# 拷贝源码并编译（-p 1 降内存峰值）
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -p 1 -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

########################
# runtime stage
########################
FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata \
 && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY --from=build /out/server ./server

EXPOSE 9000
ENV ADDR=0.0.0.0:9000
CMD ["./server"]
