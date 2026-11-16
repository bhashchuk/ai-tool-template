#!/usr/bin/env bash
# Runs on the Hetzner server (piped over SSH by the deploy workflow).
# Required env: APP_DIR, IMAGE
set -euo pipefail

cd "$APP_DIR"
PREV="$(cat .current_image 2>/dev/null || true)"

if [ ! -f .env ]; then
  echo "ERROR: $APP_DIR/.env is missing - create it from backend/.env.example before deploying." >&2
  exit 1
fi

export IMAGE
docker compose pull backend
docker compose up -d --remove-orphans

for _ in $(seq 1 30); do
  if docker compose exec -T backend python -c \
    "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)" \
    >/dev/null 2>&1; then
    echo "$IMAGE" > .current_image
    echo "Healthy: $IMAGE"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "Health check failed for $IMAGE" >&2
if [ -n "$PREV" ]; then
  echo "Rolling back to $PREV" >&2
  IMAGE="$PREV" docker compose up -d
fi
exit 1
