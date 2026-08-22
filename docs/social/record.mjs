// Records docs/social/reel.html to webm, then ffmpeg encodes mp4 (with a
// synthesized soundtrack) + a silent gif.
// Usage: node docs/social/record.mjs
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { synthesizeReelAudio } from "./synth-audio.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pageUrl = "file://" + path.join(dir, "reel.html");
const videoDir = mkdtempSync(path.join(tmpdir(), "strokes-reel-"));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1080, height: 1350 },
  recordVideo: { dir: videoDir, size: { width: 1080, height: 1350 } },
});
const page = await context.newPage();
await page.goto(pageUrl);
await page.waitForFunction("window.reelConfig !== undefined");
const reelConfig = await page.evaluate("window.reelConfig");
await page.waitForFunction("window.reelDone === true", null, { timeout: 30_000 });
await page.waitForTimeout(300); // settle last frame
const video = page.video();
await page.close();
await context.close();
await browser.close();

const webmPath = await video.path();
const outWebm = path.join(dir, "strokes-js-reel.webm");
renameSync(webmPath, outWebm);

const outMp4 = path.join(dir, "strokes-js-reel.mp4");
const outGif = path.join(dir, "strokes-js-reel.gif");
const silentMp4 = path.join(videoDir, "silent.mp4");
const wavPath = path.join(videoDir, "audio.wav");
const paletteFile = path.join(videoDir, "palette.png");

execFileSync("ffmpeg", [
  "-y",
  "-i", outWebm,
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  silentMp4,
]);

writeFileSync(wavPath, synthesizeReelAudio(reelConfig));
execFileSync("ffmpeg", [
  "-y",
  "-i", silentMp4,
  "-i", wavPath,
  "-c:v", "copy",
  "-c:a", "aac",
  "-b:a", "96k",
  "-shortest",
  outMp4,
]);

// Ken Burns drift shifts every pixel each frame, which wrecks GIF frame-diff
// compression over the full reel. GIFs are loop teasers anyway — cap it to
// the first phrase so the file stays README-sized.
function drawDurationMs(text, STAGGER_MS, STROKE_MS) {
  return text.replace(/\s+/g, "").length * STAGGER_MS + STROKE_MS;
}
const UNDERLINE_MS = 480;
const first = reelConfig.phrases[0];
const { STAGGER_MS, STROKE_MS, HOLD_MS, FADE_MS } = reelConfig;
const h1Draw = drawDurationMs(first.h1, STAGGER_MS, STROKE_MS);
const proofDraw = drawDurationMs(first.proof, STAGGER_MS, STROKE_MS);
const gifSeconds = (h1Draw + UNDERLINE_MS + proofDraw + HOLD_MS + FADE_MS) / 1000;

execFileSync("ffmpeg", [
  "-y",
  "-i", outWebm,
  "-t", String(gifSeconds),
  "-vf", "fps=16,scale=480:-1:flags=lanczos,palettegen=max_colors=192",
  paletteFile,
]);
execFileSync("ffmpeg", [
  "-y",
  "-i", outWebm,
  "-i", paletteFile,
  "-t", String(gifSeconds),
  "-lavfi", "fps=16,scale=480:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3",
  outGif,
]);

if (existsSync(videoDir)) rmSync(videoDir, { recursive: true, force: true });

console.log("Wrote:", outWebm, outMp4, outGif);
