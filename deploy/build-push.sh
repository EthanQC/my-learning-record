#!/bin/bash
set -e

# 加载环境变量
cd "$(dirname "$0")"
source .env

echo "=== Docker Login ==="
if [ -z "$DOCKER_PAT" ]; then
    echo "Error: DOCKER_PAT not set in .env file"
    exit 1
fi

# 登录 Docker Hub
echo "${DOCKER_PAT}" | docker login -u ${DH_USER} --password-stdin

echo "=== Building API Image ==="
cd ../apps/api
docker build -t ${DH_USER}/qingverse-api:${TAG} .

echo "=== Pushing API Image ==="
docker push ${DH_USER}/qingverse-api:${TAG}

echo "=== Building Web Image ==="
cd ../web
docker build -t ${DH_USER}/qingverse-web:${TAG} .

echo "=== Pushing Web Image ==="
docker push ${DH_USER}/qingverse-web:${TAG}

echo "=== Build and Push Completed! ==="
echo "Images pushed:"
echo "  - ${DH_USER}/qingverse-api:${TAG}"
echo "  - ${DH_USER}/qingverse-web:${TAG}"