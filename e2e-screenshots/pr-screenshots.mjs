// Capture a screenshot of each dashboard variation and upload it to litterbox
// (https://litterbox.catbox.moe) — an anonymous, no-auth, auto-expiring file host.
//
// Runs inside the official Playwright container (node + chromium preinstalled),
// so it has no dependency on the app's own node_modules. Driven entirely by env:
//
//   SHOT_TARGETS   JSON array of { "name": "...", "url": "http://app-baseline:8080" }
//   OUT_DIR        directory for the PNGs and comment.md   (default: ./screenshots)
//   LITTERBOX_TIME retention window: 1h | 12h | 24h | 72h  (default: 72h)
//   COMMIT_SHA     short SHA, shown in the comment header   (default: "local")
//   VIEWPORT       "WxH" for the browser viewport           (default: 1440x900)
//
// Emits <OUT_DIR>/<name>.png for each target and <OUT_DIR>/comment.md — a
// ready-to-post Markdown body with the uploaded images embedded inline.

import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

const LITTERBOX_API =
  "https://litterbox.catbox.moe/resources/internals/api.php";

const targets = JSON.parse(process.env.SHOT_TARGETS || "[]");
const outDir = process.env.OUT_DIR || "screenshots";
const time = process.env.LITTERBOX_TIME || "72h";
const sha = process.env.COMMIT_SHA || "local";
const [vw, vh] = (process.env.VIEWPORT || "1440x900").split("x").map(Number);

if (targets.length === 0) {
  console.error("SHOT_TARGETS is empty — nothing to capture.");
  process.exit(1);
}

// Upload one file to litterbox and return its public URL. Throws on any
// non-URL response so the caller can record the failure per-variation rather
// than aborting the whole run.
async function uploadToLitterbox(filePath) {
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.set("reqtype", "fileupload");
  form.set("time", time);
  form.set(
    "fileToUpload",
    new Blob([bytes], { type: "image/png" }),
    filePath.split("/").pop(),
  );

  const res = await fetch(LITTERBOX_API, { method: "POST", body: form });
  const body = (await res.text()).trim();
  if (!res.ok || !body.startsWith("https://")) {
    throw new Error(`litterbox HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return body;
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const { name, url, caption } of targets) {
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
  });
  const page = await context.newPage();
  console.log(`▶ ${name}: ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  // Give webfonts/icons a beat to settle so text metrics are stable.
  await page.waitForTimeout(1_000);

  const file = join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();

  let url_ = null;
  let error = null;
  try {
    url_ = await uploadToLitterbox(file);
    console.log(`  ↑ ${url_}`);
  } catch (err) {
    error = String(err.message || err);
    console.error(`  ✗ upload failed: ${error}`);
  }
  results.push({ name, caption, url: url_, error });
}

await browser.close();

// Compose the sticky PR comment.
const lines = [
  `### 📸 UI Screenshots`,
  ``,
  `Rendered for \`${sha}\` · images expire in **${time}** ([litterbox](https://litterbox.catbox.moe), anonymous host).`,
  ``,
];
for (const { name, caption, url, error } of results) {
  lines.push(`#### ${name}`);
  if (caption) lines.push(`_${caption}_`);
  lines.push(``);
  if (url) lines.push(`![${name}](${url})`);
  else lines.push(`> ⚠️ upload failed: \`${error}\``);
  lines.push(``);
}

await writeFile(join(outDir, "comment.md"), lines.join("\n"));
console.log(`\n✔ wrote ${join(outDir, "comment.md")}`);

// Non-zero exit if every upload failed, so CI surfaces a hard problem while
// still tolerating a single flaky variation.
if (results.every((r) => !r.url)) {
  console.error("All uploads failed.");
  process.exit(1);
}
