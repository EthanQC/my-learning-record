.PHONY: help dev build test clean docker-up docker-down logs swagger

# 默认目标
help:
	@echo "可用命令:"
	@echo "  make dev         - 启动开发服务器"
	@echo "  make build       - 构建二进制文件"
	@echo "  make test        - 运行测试"
	@echo "  make docker-up   - 启动 MySQL 容器"
	@echo "  make docker-down - 停止 MySQL 容器"
	@echo "  make logs        - 查看 MySQL 日志"
	@echo "  make swagger     - 生成 Swagger 文档"
	@echo "  make clean       - 清理构建产物"

# 启动 MySQL(如果没运行)
docker-up:
	@docker ps | grep -q mysql8 || \
    (docker start mysql8 2>/dev/null || \
    docker run -d --name mysql8 \
        -e MYSQL_ROOT_PASSWORD=pass \
        -e MYSQL_DATABASE=qingverse \
        -p 3306:3306 \
        -v mysql-data:/var/lib/mysql \
        mysql:8.0 \
        --character-set-server=utf8mb4 \
        --collation-server=utf8mb4_0900_ai_ci)
	@echo "⏳ 等待 MySQL 启动..."
	@sleep 3
	@docker exec -i mysql8 mysql -uroot -ppass -e "CREATE DATABASE IF NOT EXISTS qingverse CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;" 2>/dev/null || true
	@docker exec -i mysql8 mysql -uroot -ppass qingverse < db/schema.sql 2>/dev/null || echo "✅ 表结构已存在"
	@echo "✅ MySQL 就绪"

# 生成 Swagger 文档
swagger:
	@echo "📖 生成 API 文档..."
	@swag init -g cmd/server/main.go -o docs
	@echo "✅ 文档已生成,访问: http://localhost:9000/swagger/index.html"

# 开发模式(依赖 MySQL)
dev: docker-up swagger
	@echo "🔥 启动 API 服务器..."
	@go mod tidy
	@go run cmd/server/main.go

# 构建二进制
build:
	@echo "🔨 构建中..."
	@mkdir -p bin
	@go build -o bin/server cmd/server/main.go
	@echo "✅ 构建完成: bin/server"

# 运行测试
test:
	@echo "🧪 运行测试..."
	@go test -v ./...

# 查看 MySQL 日志
logs:
	@docker logs -f mysql8

# 停止 MySQL
docker-down:
	@docker stop mysql8 2>/dev/null || true
	@echo "✅ MySQL 已停止"

# 清理
clean:
	@rm -rf bin/ docs/
	@docker rm -f mysql8 2>/dev/null || true
	@echo "✅ 清理完成"