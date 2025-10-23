# -------- build --------
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# 你的入口是 ./cmd/server/main.go（按你项目实际改）
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server

# -------- runtime --------
FROM alpine:3.20
WORKDIR /app
ENV TZ=Asia/Shanghai
RUN apk add --no-cache ca-certificates tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY --from=build /src/server /app/server
EXPOSE 9000
CMD ["/app/server"]
