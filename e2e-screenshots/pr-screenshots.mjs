// Capture a screenshot of each dashboard variation and upload it to litterbox
// (https://litterbox.catbox.moe) — an anonymous, no-auth, auto-expiring file host.
// If a litterbox upload fails, that image falls back to uguu.se (https://uguu.se),
// another anonymous host whose files expire after a fixed 3 hours.
//
// Runs inside the official Playwright container (node + chromium preinstalled),
// so it has no dependency on the app's own node_modules. Driven entirely by env:
//
//   SHOT_TARGETS   JSON array of { "name": "...", "url": "http://shot-baseline:8080" }
//   OUT_DIR        directory for the PNGs and comment.md   (default: ./screenshots)
//   LITTERBOX_TIME retention window: 1h | 12h | 24h | 72h  (default: 72h)
//   COMMIT_SHA     short SHA, shown in the comment header   (default: "local")
//   VIEWPORT       "WxH" for the browser viewport           (default: 1440x900)
//
// Each target is captured and uploaded independently: a failure on one (unreachable
// container, render error, upload error) is recorded against that variation and the
// run continues, so comment.md is ALWAYS written with whatever succeeded.

import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

const LITTERBOX_API =
  "https://litterbox.catbox.moe/resources/internals/api.php";
const UGUU_API = "https://uguu.se/upload";
const UGUU_TIME = "3h"; // fixed by uguu.se, not configurable
const NAV_TIMEOUT_MS = 60_000;
const UPLOAD_TIMEOUT_MS = 60_000;

const outDir = process.env.OUT_DIR || "screenshots";
const time = process.env.LITTERBOX_TIME || "72h";
const sha = process.env.COMMIT_SHA || "local";

// Parse the viewport, falling back to a sane default on anything malformed.
let vw = 1440;
let vh = 900;
{
  const [w, h] = (process.env.VIEWPORT || "").split("x").map(Number);
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
    vw = w;
    vh = h;
  } else if (process.env.VIEWPORT) {
    console.error(`Ignoring malformed VIEWPORT="${process.env.VIEWPORT}", using ${vw}x${vh}`);
  }
}

// Parse + validate SHOT_TARGETS up front with a clear error rather than a raw stack.
let targets;
try {
  targets = JSON.parse(process.env.SHOT_TARGETS || "[]");
} catch (err) {
  console.error(`SHOT_TARGETS is not valid JSON: ${err.message}`);
  process.exit(1);
}
if (!Array.isArray(targets) || targets.length === 0) {
  console.error("SHOT_TARGETS must be a non-empty JSON array — nothing to capture.");
  process.exit(1);
}

// Filesystem-safe slug so a target name can never escape outDir or collide oddly.
const slug = (name) => String(name).replace(/[^a-z0-9._-]+/gi, "_");

// Upload one file to litterbox and return its public URL. Throws on any non-URL
// response (litterbox reports errors as plain text with a 200) or a stall.
async function uploadToLitterbox(filePath) {
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.set("reqtype", "fileupload");
  form.set("time", time);
  form.set("fileToUpload", new Blob([bytes], { type: "image/png" }), basename(filePath));

  const res = await fetch(LITTERBOX_API, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });
  const body = (await res.text()).trim();
  if (!res.ok || !body.startsWith("https://")) {
    throw new Error(`litterbox HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return body;
}

// Upload one file to uguu.se and return its public URL. uguu answers with JSON
// ({ success, files: [{ url }] }); anything else is treated as a failure.
async function uploadToUguu(filePath) {
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.append("files[]", new Blob([bytes], { type: "image/png" }), basename(filePath));

  const res = await fetch(UGUU_API, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });
  const body = (await res.text()).trim();
  let url;
  try {
    url = JSON.parse(body)?.files?.[0]?.url;
  } catch {
    // not JSON — fall through to the error below
  }
  if (!res.ok || typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error(`uguu HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return url;
}

// Name the host in an error and flatten it to one line: a network failure is just
// "fetch failed", and an HTML error page would break the comment's inline code.
const describe = (host, err) => {
  const msg = String(err?.message || err).replace(/\s+/g, " ");
  return msg.startsWith(host) ? msg : `${host}: ${msg}`;
};

// Try litterbox first, then uguu.se. Returns where the image landed and how long
// it lives; throws with both errors if neither host accepted it.
async function uploadImage(filePath) {
  let litterboxErr;
  try {
    return { url: await uploadToLitterbox(filePath), host: "litterbox", expiry: time };
  } catch (err) {
    litterboxErr = describe("litterbox", err);
    console.error(`  ! ${litterboxErr} — falling back to uguu.se`);
  }
  try {
    return { url: await uploadToUguu(filePath), host: "uguu.se", expiry: UGUU_TIME };
  } catch (err) {
    throw new Error(`${litterboxErr} | ${describe("uguu", err)}`);
  }
}

// Kill animations/transitions and the text caret so a shot can't catch a
// mid-transition frame — a real source of visual-diff noise.
const STABILIZE_CSS =
  "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

try {
  for (const { name, caption, url } of targets) {
    let context = null;
    let upload = null;
    let error = null;
    try {
      context = await browser.newContext({ viewport: { width: vw, height: vh } });
      const page = await context.newPage();
      console.log(`▶ ${name}: ${url}`);
      // "load" (not "networkidle") so a chatty/polling page or a slow font CDN
      // can't stall us; then wait for webfonts so text metrics are stable.
      await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
      await page.addStyleTag({ content: STABILIZE_CSS });
      await page.evaluate(() => document.fonts.ready);

      const file = join(outDir, `${slug(name)}.png`);
      await page.screenshot({ path: file, fullPage: true });
      upload = await uploadImage(file);
      console.log(`  ↑ ${upload.url} (${upload.host})`);
    } catch (err) {
      error = String(err?.message || err);
      console.error(`  ✗ ${name}: ${error}`);
    } finally {
      if (context) await context.close();
    }
    results.push({ name, caption, upload, error });
  }
} finally {
  await browser.close();
}

// Compose the sticky PR comment — always written, even if some variations failed.
const lines = [
  `### 📸 UI Screenshots`,
  ``,
  `Rendered for \`${sha}\` · images expire in **${time}** ([litterbox](https://litterbox.catbox.moe), anonymous host).`,
  ``,
];
if (results.some((r) => r.upload?.host === "uguu.se")) {
  lines.push(
    `> ⏳ litterbox was unavailable for some images; those are on [uguu.se](https://uguu.se) and expire in **${UGUU_TIME}**.`,
    ``,
  );
}
for (const { name, caption, upload, error } of results) {
  lines.push(`#### ${name}`);
  if (caption) lines.push(`_${caption}_`);
  lines.push(``);
  if (upload) {
    lines.push(`![${name}](${upload.url})`);
    if (upload.host !== "litterbox") lines.push(``, `<sub>via ${upload.host} · expires in ${upload.expiry}</sub>`);
  } else {
    lines.push(`> ⚠️ failed: \`${error}\``);
  }
  lines.push(``);
}

await writeFile(join(outDir, "comment.md"), lines.join("\n"));
console.log(`\n✔ wrote ${join(outDir, "comment.md")}`);

// Exit non-zero only if EVERY variation failed — a hard problem worth surfacing.
// Partial success still writes a useful comment and exits 0.
if (results.every((r) => !r.upload)) {
  console.error("All variations failed.");
  process.exit(1);
}
