import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

// The dashboard renders as a pure function of the runtime env flags exposed on
// `window._env_` (populated in production by docker-entrypoint.sh). These tests
// toggle the flags and snapshot only the region each flag controls, so a flag
// change produces a small, reviewable diff instead of a whole-page churn.

const BASE_ENV = { CAPTAIN_DOMAIN: "nonprod.jupiter.onglueops.rocks" };

type Env = Record<string, string>;

function regionHtml(env: Env, testid: string): string | null {
  (window as unknown as { _env_?: Env })._env_ = { ...BASE_ENV, ...env };
  const html = renderToStaticMarkup(<App />);
  const region = new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector(`[data-testid="${testid}"]`);
  return region?.innerHTML ?? null;
}

afterEach(() => {
  delete (window as unknown as { _env_?: Env })._env_;
});

describe("tool grid", () => {
  it("shows the Goldilocks card when GOLDILOCKS_ENABLED=TRUE", () => {
    expect(regionHtml({ GOLDILOCKS_ENABLED: "TRUE" }, "tool-grid")).toMatchSnapshot();
  });

  it("hides the Goldilocks card when GOLDILOCKS_ENABLED=FALSE", () => {
    expect(regionHtml({ GOLDILOCKS_ENABLED: "FALSE" }, "tool-grid")).toMatchSnapshot();
  });

  it("adds the internal LB link when INTERNAL_LB_ENABLED=TRUE", () => {
    expect(regionHtml({ INTERNAL_LB_ENABLED: "TRUE" }, "tool-grid")).toMatchSnapshot();
  });
});

describe("network endpoints", () => {
  it("lists the internal load balancer when INTERNAL_LB_ENABLED=TRUE", () => {
    expect(regionHtml({ INTERNAL_LB_ENABLED: "TRUE" }, "network-endpoints")).toMatchSnapshot();
  });

  it("omits the internal load balancer when INTERNAL_LB_ENABLED=FALSE", () => {
    expect(regionHtml({ INTERNAL_LB_ENABLED: "FALSE" }, "network-endpoints")).toMatchSnapshot();
  });
});

describe("kubeconfig", () => {
  it("renders the kubeconfig block when KUBEADM_ENABLED=TRUE", () => {
    expect(regionHtml({ KUBEADM_ENABLED: "TRUE" }, "kubeconfig")).toMatchSnapshot();
  });

  it("is absent when KUBEADM_ENABLED=FALSE", () => {
    expect(regionHtml({ KUBEADM_ENABLED: "FALSE" }, "kubeconfig")).toBeNull();
  });
});
