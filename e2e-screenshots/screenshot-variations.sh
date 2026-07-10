#!/usr/bin/env bash
#
# Build the dashboard image, run every flag/CA variation as a container, screenshot
# each with Playwright, and upload the PNGs to litterbox (anonymous, auto-expiring).
# Produces ./screenshots/<name>.png and ./screenshots/comment.md (a ready-to-post
# Markdown body with the images embedded inline).
#
# Runnable locally with nothing but Docker — no node/npm needed on the host:
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
#   SKIP_BUILD        set to 1 to reuse an existing IMAGE

set -euo pipefail

CAPTAIN_DOMAIN="${CAPTAIN_DOMAIN:-verylongenvnamehere.anotherverylongtenantnamehere.glueops.rocks}"
IMAGE="${IMAGE:-cluster-help-page:pr}"
LITTERBOX_TIME="${LITTERBOX_TIME:-72h}"
COMMIT_SHA="${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.49.1-noble}"
# Must match PLAYWRIGHT_IMAGE's tag: the image ships the browsers, we add the
# matching npm package at runtime (browser download skipped — they're preinstalled).
PLAYWRIGHT_VERSION="${PLAYWRIGHT_VERSION:-1.49.1}"
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
trap cleanup EXIT

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
  docker run -d --name "shot-$name" --network "$NETWORK" \
    -e CAPTAIN_DOMAIN="$CAPTAIN_DOMAIN" \
    -e INTERNAL_LB_ENABLED="$internal" \
    -e KUBEADM_ENABLED="$kubeadm" \
    "${ca_env[@]}" \
    "$IMAGE" >/dev/null
  [ $first -eq 0 ] && targets_json+=","
  first=0
  targets_json+="{\"name\":\"$name\",\"url\":\"http://shot-$name:8080\",\"caption\":\"$caption\"}"
done
targets_json+="]"

echo "==> Capturing screenshots + uploading to litterbox"
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

echo "==> Done. See $OUT_DIR/comment.md"
