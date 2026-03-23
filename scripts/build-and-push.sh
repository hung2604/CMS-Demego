#!/bin/bash

# Build & push Docker image CMS-Demego lên Docker Hub (tag mặc định: cms)
# Usage: ./scripts/build-and-push.sh [tag] [dockerhub-username]
# Example: ./scripts/build-and-push.sh cms
# Example: ./scripts/build-and-push.sh v1.0.0 roseluren26
#
# Biến môi trường (tuỳ chọn, dùng làm build-arg nếu sau này Dockerfile dùng):
#   NUXT_PUBLIC_SITE_URL - URL public của site (vd: https://cms.example.com)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TAG=${1:-cms}
DOCKERHUB_USERNAME=${2:-"roseluren26"}

# Image: <user>/cms-demego:<tag> — tách biệt image backend tnp
REPO_NAME="cms-demego"
FULL_IMAGE_NAME="${DOCKERHUB_USERNAME}/${REPO_NAME}:${TAG}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build & Push — CMS Demego (Nuxt)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Repository: ${DOCKERHUB_USERNAME}/${REPO_NAME}"
echo "Tag: ${TAG}"
echo "Image: ${FULL_IMAGE_NAME}"
echo ""
echo "Usage: ./scripts/build-and-push.sh [tag] [dockerhub-username]  (mặc định user: roseluren26)"
echo "Example: ./scripts/build-and-push.sh cms"
echo "Example: ./scripts/build-and-push.sh v1.0.0"
echo ""

NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL:-"https://example.com"}
NODE_ENV=${NODE_ENV:-"production"}

echo "Build context:"
echo "  NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL} (chỉ dùng nếu Dockerfile có ARG)"
echo "  NODE_ENV=${NODE_ENV}"
echo ""

# Chạy từ root repo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${YELLOW}Step 1: Docker buildx...${NC}"
docker buildx create --use --name cms-demego-builder 2>/dev/null || docker buildx use cms-demego-builder 2>/dev/null || true
echo -e "${GREEN}✓ Buildx ready${NC}"
echo ""

echo -e "${YELLOW}Step 2: Docker Hub login...${NC}"
if ! docker info 2>/dev/null | grep -q "Username"; then
  echo "Đăng nhập Docker Hub:"
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
echo -e "${GREEN}========================================${NC}"
echo "Pull & chạy thử:"
echo "  docker pull ${FULL_IMAGE_NAME}"
echo "  docker run --rm -p 3000:3000 -e STUDIO_GITHUB_CLIENT_ID=... -e STUDIO_GITHUB_CLIENT_SECRET=... ${FULL_IMAGE_NAME}"
echo ""
echo "Hoặc dùng docker-compose.yml trong repo."
echo -e "${GREEN}========================================${NC}"
