#!/bin/bash
set -e

# 加载环境变量
cd "$(dirname "$0")"

if [ ! -f .env ]; then
    echo "Error: deploy/.env not found"
    echo "Please create deploy/.env with DH_USER, TAG, and DOCKER_PAT"
    exit 1
fi

source .env

if [ -z "$DOCKER_PAT" ]; then
    echo "Error: DOCKER_PAT not set in deploy/.env"
    exit 1
fi

if [ -z "$DH_USER" ]; then
    echo "Error: DH_USER not set in deploy/.env"
    exit 1
fi

if [ -z "$TAG" ]; then
    echo "Error: TAG not set in deploy/.env"
    exit 1
fi

echo "=== Docker Login ==="
echo "${DOCKER_PAT}" | docker login -u ${DH_USER} --password-stdin

echo "=== Building API Image ==="
cd ../apps/api
docker build -t ${DH_USER}/qingverse-api:${TAG} .

echo "=== Pushing API Image ==="
docker push ${DH_USER}/qingverse-api:${TAG}

echo "=== Building Web Image ==="
cd ../..
docker build -t ${DH_USER}/qingverse-web:${TAG} -f apps/web/Dockerfile .

echo "=== Pushing Web Image ==="
docker push ${DH_USER}/qingverse-web:${TAG}

echo ""
echo "=== Build and Push Completed! ==="
echo "Images pushed:"
echo "  - ${DH_USER}/qingverse-api:${TAG}"
echo "  - ${DH_USER}/qingverse-web:${TAG}"