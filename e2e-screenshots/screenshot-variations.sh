#!/usr/bin/env bash
#
# Build the dashboard image, run every flag/CA variation as a container, screenshot
# each with Playwright, and upload the PNGs to litterbox (anonymous, auto-expiring).
# Produces ./screenshots/<name>.png and ./screenshots/comment.md (a ready-to-post
# Markdown body with the images embedded inline).
#
# Runnable locally with Docker + openssl + bash 4+ (no node/npm needed on the host):
#
#   ./e2e-screenshots/screenshot-variations.sh
#
# and reused verbatim by .github/workflows/pr-screenshots.yaml in CI.
#
# Tunables (env):
#   CAPTAIN_DOMAIN    domain baked into every variation (default: long stress-test value)
#   IMAGE             image tag to build/use            (default: cluster-help-page:pr)
#   LITTERBOX_TIME    retention: 1h|12h|24h|72h         (default: 72h)
#   COMMIT_SHA        label shown in the comment        (default: git short SHA)
#   PLAYWRIGHT_IMAGE  pinned Playwright container        (default below)
#   PLAYWRIGHT_VERSION npm playwright version            (default: derived from the image tag)
#   SKIP_BUILD        set to 1 to reuse an existing IMAGE

set -euo pipefail

CAPTAIN_DOMAIN="${CAPTAIN_DOMAIN:-verylongenvnamehere.anotherverylongtenantnamehere.glueops.rocks}"
IMAGE="${IMAGE:-cluster-help-page:pr}"
LITTERBOX_TIME="${LITTERBOX_TIME:-72h}"
COMMIT_SHA="${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.61.1-noble}"
# Single source of truth: derive the npm package version from the image tag so the
# browsers baked into the image and the JS package we add at runtime can't drift.
PLAYWRIGHT_VERSION="${PLAYWRIGHT_VERSION:-$(printf '%s' "$PLAYWRIGHT_IMAGE" | sed -E 's/.*:v([0-9]+\.[0-9]+\.[0-9]+).*/\1/')}"
NETWORK="shots-$$"
OUT_DIR="screenshots"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# name  internal_lb  kubeadm  ca(yes|no)  caption
# kubeadm variations always carry a CA — a kubeadm cluster is never without one.
VARIATIONS=(
  "baseline|FALSE|FALSE|no|internal LB off · kubeadm off"
  "internal|TRUE|FALSE|no|internal LB on · kubeadm off"
  "kubeadm|FALSE|TRUE|yes|kubeadm on · CA present"
  "both|TRUE|TRUE|yes|internal LB on · kubeadm on · CA present"
)

cleanup() {
  for v in "${VARIATIONS[@]}"; do
    docker rm -f "shot-${v%%|*}" >/dev/null 2>&1 || true
  done
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# Minimal JSON string escaping (backslash + double-quote) so hand-built target JSON
# stays valid even if a caption ever gains a special character.
json_escape() { local s=$1; s=${s//\\/\\\\}; s=${s//\"/\\\"}; printf '%s' "$s"; }

echo "==> Building $IMAGE"
if [ "${SKIP_BUILD:-0}" != "1" ]; then
  docker build -t "$IMAGE" .
fi

echo "==> Generating throwaway fake CA (test-only, no private key kept)"
# Fixed short CN — X.509 caps CN at 64 chars, and the value is irrelevant to
# what the dashboard renders (it only base64-encodes the PEM into the kubeconfig).
FAKE_CA="$(openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
  -keyout /dev/null 2>/dev/null \
  -subj "/CN=glueops-test-fake-ca/O=GlueOps-Test")"

echo "==> Creating network $NETWORK and starting variation containers"
docker network create "$NETWORK" >/dev/null
targets_json="["
first=1
for v in "${VARIATIONS[@]}"; do
  IFS='|' read -r name internal kubeadm ca caption <<<"$v"
  ca_env=()
  [ "$ca" = "yes" ] && ca_env=(-e "CLUSTER_CA_CERTIFICATE=$FAKE_CA")
  # Idempotency: clear any leftover container from a hard-killed prior run.
  docker rm -f "shot-$name" >/dev/null 2>&1 || true
  docker run -d --name "shot-$name" --network "$NETWORK" \
    -e CAPTAIN_DOMAIN="$CAPTAIN_DOMAIN" \
    -e INTERNAL_LB_ENABLED="$internal" \
    -e KUBEADM_ENABLED="$kubeadm" \
    "${ca_env[@]+"${ca_env[@]}"}" \
    "$IMAGE" >/dev/null
  [ $first -eq 0 ] && targets_json+=","
  first=0
  targets_json+="{\"name\":\"$(json_escape "$name")\",\"url\":\"http://shot-$name:8080\",\"caption\":\"$(json_escape "$caption")\"}"
done
targets_json+="]"

echo "==> Waiting for containers to serve on :8080"
for v in "${VARIATIONS[@]}"; do
  name="${v%%|*}"
  ready=0
  for _ in $(seq 1 30); do
    # 127.0.0.1 (not localhost): nginx listens IPv4-only, busybox wget prefers ::1.
    if docker exec "shot-$name" wget -q -O /dev/null http://127.0.0.1:8080/ 2>/dev/null; then
      ready=1; break
    fi
    sleep 1
  done
  if [ "$ready" = 1 ]; then echo "   ✓ shot-$name"; else echo "   ! shot-$name not ready after 30s (capturing anyway)"; fi
done

echo "==> Capturing screenshots + uploading to litterbox"
rm -rf "$OUT_DIR" 2>/dev/null || true   # start clean so no stale PNGs linger/ship
mkdir -p "$OUT_DIR"
# Mount only the script (read-only) and an output dir, so npm's node_modules lands
# in the container's /app, never in the host repo.
docker run --rm --network "$NETWORK" \
  -v "$REPO_DIR/e2e-screenshots/pr-screenshots.mjs:/app/pr-screenshots.mjs:ro" \
  -v "$REPO_DIR/$OUT_DIR:/out" \
  -w /app \
  -e SHOT_TARGETS="$targets_json" \
  -e OUT_DIR="/out" \
  -e LITTERBOX_TIME="$LITTERBOX_TIME" \
  -e COMMIT_SHA="$COMMIT_SHA" \
  -e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  "$PLAYWRIGHT_IMAGE" \
  sh -c "npm i playwright@$PLAYWRIGHT_VERSION --no-save --no-audit --no-fund --silent && node pr-screenshots.mjs"

# The Playwright container runs as root; hand the outputs back to the caller so the
# host repo doesn't end up with root-owned files (harmless in CI, annoying locally).
# --user 0 because the app image otherwise runs as the unprivileged nginx user.
docker run --rm --user 0 --entrypoint chown -v "$REPO_DIR/$OUT_DIR:/out" "$IMAGE" \
  -R "$(id -u):$(id -g)" /out 2>/dev/null || true

echo "==> Done. See $OUT_DIR/comment.md"
