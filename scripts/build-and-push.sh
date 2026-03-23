#!/bin/bash

# Build & push image cố định: roseluren26/tnp:cms
# Usage: ./scripts/build-and-push.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FULL_IMAGE_NAME="roseluren26/tnp:cms"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build & Push — CMS Demego → ${FULL_IMAGE_NAME}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

NODE_ENV=${NODE_ENV:-"production"}
echo "NODE_ENV=${NODE_ENV}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${YELLOW}Step 1: Docker buildx...${NC}"
docker buildx create --use --name tnp-cms-builder 2>/dev/null || docker buildx use tnp-cms-builder 2>/dev/null || true
echo -e "${GREEN}✓ Buildx ready${NC}"
echo ""

echo -e "${YELLOW}Step 2: Docker Hub login...${NC}"
if ! docker info 2>/dev/null | grep -q "Username"; then
  echo "Đăng nhập Docker Hub (user roseluren26):"
  docker login
else
  echo -e "${GREEN}✓ Đã đăng nhập Docker Hub${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Build & push (linux/amd64)...${NC}"
docker buildx build \
  --platform linux/amd64 \
  -f Dockerfile.production \
  --build-arg NODE_ENV="${NODE_ENV}" \
  -t "${FULL_IMAGE_NAME}" \
  --push \
  .

echo -e "${GREEN}✓ Pushed ${FULL_IMAGE_NAME}${NC}"
echo ""
echo "  docker pull ${FULL_IMAGE_NAME}"
echo "  docker run --rm -p 3000:3000 ... ${FULL_IMAGE_NAME}"
