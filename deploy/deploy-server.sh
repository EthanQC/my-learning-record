#!/bin/bash
set -e

# 加载环境变量
cd "$(dirname "$0")"

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# 检查 docker-compose.yml 文件是否存在
if [ ! -f docker-compose.yml ]; then
    echo "Error: docker-compose.yml not found!"
    echo "Please copy docker-compose.example.yml to docker-compose.yml"
    exit 1
fi

# 检查 Caddyfile 文件是否存在
if [ ! -f Caddyfile ]; then
    echo "Error: Caddyfile not found!"
    echo "Please copy Caddyfile.example to Caddyfile and configure it."
    exit 1
fi

source .env

echo "=== Pulling Images from Docker Hub ==="
docker compose pull

echo "=== Stopping Old Containers ==="
docker compose down

echo "=== Starting Services ==="
docker compose up -d

echo "=== Waiting for services to be healthy ==="
sleep 10

echo "=== Deployment Completed! ==="
docker compose ps

echo ""
echo "Services are running:"
echo "  - Web: http://localhost:3000"
echo "  - API: http://localhost:9000 (internal)"
echo "  - Caddy: http://localhost:80 & https://localhost:443"
echo ""
echo "Check logs with:"
echo "  docker-compose logs -f"