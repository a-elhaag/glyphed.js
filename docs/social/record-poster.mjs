// Records docs/social/index.html (the static poster) to a short looping GIF.
// Usage: node docs/social/record-poster.mjs
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pageUrl = "file://" + path.join(dir, "index.html");
const videoDir = mkdtempSync(path.join(tmpdir(), "glyphed-poster-"));

// "Make it human." draws in ~1060ms (11 letters * 60ms stagger + 400ms stroke),
// then the red underline sweep (~480ms) plus a beat to hold the finished poster.
const CAPTURE_MS = 2600;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1080, height: 1350 },
  recordVideo: { dir: videoDir, size: { width: 1080, height: 1350 } },
});
const page = await context.newPage();
await page.goto(pageUrl);
await page.waitForTimeout(CAPTURE_MS);
const video = page.video();
await page.close();
await context.close();
await browser.close();

const webmPath = await video.path();
const outWebm = path.join(videoDir, "poster.webm");
renameSync(webmPath, outWebm);

const outGif = path.join(dir, "glyphed-js-social.gif");
const paletteFile = path.join(videoDir, "palette.png");

execFileSync("ffmpeg", [
  "-y",
  "-i", outWebm,
  "-vf", "fps=20,scale=540:-1:flags=lanczos,palettegen=max_colors=192",
  paletteFile,
]);
execFileSync("ffmpeg", [
  "-y",
  "-i", outWebm,
  "-i", paletteFile,
  "-lavfi", "fps=20,scale=540:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3",
  outGif,
]);

rmSync(videoDir, { recursive: true, force: true });
console.log("Wrote:", outGif);
