# Cluster Information Help Page

A single-page dashboard that gives GlueOps cluster users quick access to their
platform tooling and cluster endpoints. It renders links to per-cluster
services (ArgoCD, Grafana, Vault, Traefik, Goldilocks), lists the cluster's
network endpoints, and — when enabled — provides a ready-to-use `kubeconfig`.

It is a React + TypeScript + Vite app, served as static files by nginx and
**configured at runtime** (not build time) so a single container image works
for any cluster.

## How runtime configuration works

The app is built once into static assets. At container start,
[`docker-entrypoint.sh`](./docker-entrypoint.sh) reads environment variables and
writes `/usr/share/nginx/html/env-config.js`, which sets `window._env_`.
`index.html` loads that script before the app bundle, and the app reads its
config from `window._env_` (falling back to Vite's `import.meta.env`, then a
placeholder).

This means the same image can be deployed to any cluster — you only change the
environment variables.

### Environment variables

| Variable                 | Default     | Effect |
| ------------------------ | ----------- | ------ |
| `CAPTAIN_DOMAIN`         | `localhost` | Base domain for the cluster. All tool/endpoint URLs are derived from it (e.g. `argocd.<CAPTAIN_DOMAIN>`), and the default kubeconfig namespace is its first label. |
| `INTERNAL_LB_ENABLED`    | `FALSE`     | When `TRUE`, shows the Internal Load Balancer endpoint and the Traefik "Internal" dashboard link. |
| `KUBEADM_ENABLED`        | `FALSE`     | When `TRUE`, renders the copy-paste `kubeconfig` block (OIDC device-code login via `kubectl oidc-login`). |
| `GOLDILOCKS_ENABLED`     | `FALSE`     | When `TRUE`, shows the Goldilocks card linking to `goldilocks.<CAPTAIN_DOMAIN>`. |
| `CLUSTER_CA_CERTIFICATE` | *(empty)*   | Cluster CA in PEM format. The entrypoint base64-encodes it into the kubeconfig's `certificate-authority-data`. Only relevant when `KUBEADM_ENABLED=TRUE`. |

Boolean flags are case-insensitive; any value other than `TRUE` is treated as
disabled.

## Quick start (Docker)

```sh
docker build . -t cluster-info
docker run --rm -it \
  -e CAPTAIN_DOMAIN=nonprod.jupiter.onglueops.rocks \
  -e INTERNAL_LB_ENABLED=TRUE \
  -e GOLDILOCKS_ENABLED=TRUE \
  -p 8080:8080 \
  cluster-info
```

Then open http://localhost:8080. nginx runs as a non-root user and listens on
port `8080`.

A prebuilt image is published to
`ghcr.io/glueops/cluster-information-help-page-html`.

## Local development

Requires Node.js (see the `node:lts-alpine` base image in the
[`Dockerfile`](./Dockerfile) for the supported major version).

```sh
npm install
npm run dev      # Vite dev server on http://localhost:8080
```

In dev mode `env-config.js` is not generated, so flags fall back to their
defaults. To exercise the runtime flags locally, create a `public/env-config.js`
(this file is only produced inside the container, so it's safe to keep
untracked):

```js
window._env_ = {
  CAPTAIN_DOMAIN: "nonprod.jupiter.onglueops.rocks",
  INTERNAL_LB_ENABLED: "TRUE",
  KUBEADM_ENABLED: "FALSE",
  GOLDILOCKS_ENABLED: "TRUE",
  CLUSTER_CA_CERTIFICATE: "",
};
```

## Scripts

| Command             | Description |
| ------------------- | ----------- |
| `npm run dev`       | Start the Vite dev server (port 8080). |
| `npm run build`     | Type-check (`tsc -b`) and build production assets to `dist/`. |
| `npm run preview`   | Preview the production build locally. |
| `npm run lint`      | Run ESLint. |
| `npm test`          | Run the test suite in watch mode (Vitest). |
| `npm run test:run`  | Run the test suite once (CI / one-shot). |

## Testing

Rendering is a pure function of the runtime flags, so the app is covered by
**scoped snapshot tests** ([`src/App.test.tsx`](./src/App.test.tsx)) using Vitest
+ jsdom. Each test sets `window._env_`, renders `<App>`, and snapshots only the
region that flag controls (the tool grid, the network-endpoints list, or the
kubeconfig block) — so toggling a flag produces a small, reviewable diff instead
of a whole-page churn. The regions are anchored with `data-testid` attributes in
`App.tsx`.

```sh
npm run test:run        # run once
npm test                # watch mode
npx vitest -u           # update snapshots after an INTENTIONAL UI change
```

Snapshots live in `src/__snapshots__/` and are committed. When a snapshot test
fails, review the diff before updating — that's the whole point.

## Project structure

```
src/
  App.tsx                 # The dashboard: reads window._env_, renders cards/endpoints/kubeconfig
  App.test.tsx            # Scoped snapshot tests for flag-gated rendering
  main.tsx                # React entry point
  index.css               # Tailwind CSS entry
  components/ui/          # UI primitives (card, badge, table, sonner toaster)
  lib/utils.ts            # cn() class-name helper
docker-entrypoint.sh      # Generates env-config.js (window._env_) at container start
nginx.conf                # Non-root nginx config, listens on 8080, SPA fallback
Dockerfile                # Multi-stage: node build -> nginx runtime
```

## Deployment & releases

- **Container image** — built and pushed to GHCR by
  [`.github/workflows/container_image.yaml`](./.github/workflows/container_image.yaml),
  which runs on `v*` tags. A `lint_and_test` job (`npm ci` → `lint` → `test:run`
  → `build`) gates the image build, so a release only publishes when those pass.
- **Releases** — versioned automatically via release-please
  ([`.github/workflows/release-please.yaml`](./.github/workflows/release-please.yaml)),
  which relies on [Conventional Commits](https://www.conventionalcommits.org/).
- **Image cleanup** — old images are pruned by
  [`.github/workflows/cleanup_images.yaml`](./.github/workflows/cleanup_images.yaml).


