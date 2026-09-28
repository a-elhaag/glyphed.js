// Renders showcase.html frame by frame on a virtual clock, then scores and muxes it.
//
//   npm run build && node docs/social/showcase/render.mjs
//
// Env: FPS (default 60), FROM / TO (seconds, for quick partial drafts), FFMPEG (ffmpeg binary),
// CHROMIUM (browser executable), OUT (output mp4 path).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scoreShowcase } from "./audio.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = Number(process.env.FPS || 60);
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const OUT = process.env.OUT || path.join(dir, "..", "glyphed-js-showcase.mp4");
const POSTER = OUT.replace(/\.mp4$/, "-poster.png");
const work = mkdtempSync(path.join(tmpdir(), "glyphed-showcase-"));

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "inherit"] });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

const browser = await chromium.launch({
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
  args: ["--allow-file-access-from-files", "--font-render-hinting=none"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(pathToFileURL(path.join(dir, "showcase.html")).href + "?render");
await page.waitForFunction("window.__ready === true", null, { timeout: 30_000 });
const meta = await page.evaluate("window.__meta");

const from = Number(process.env.FROM || 0);
const to = Math.min(Number(process.env.TO || meta.total), meta.total);
const first = Math.round(from * FPS);
const last = Math.round(to * FPS);
const silent = path.join(work, "video.mp4");

const encoder = spawn(
  FFMPEG,
  [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "animation",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
    silent,
  ],
  { stdio: ["pipe", "ignore", "inherit"] },
);
const encoded = new Promise((resolve, reject) =>
  encoder.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`encoder exited ${code}`)))),
);

// Walk the clock from 0 even for partial drafts, so every stroke's sound event gets logged.
const started = Date.now();
for (let f = 0; f <= last; f++) {
  await page.evaluate((t) => window.__seek(t), f / FPS);
  if (f < first) continue;
  const png = await page.screenshot({ type: "png" });
  if (!encoder.stdin.write(png)) await new Promise((r) => encoder.stdin.once("drain", r));
  if (f % (FPS * 2) === 0) {
    const done = (f - first) / Math.max(1, last - first);
    process.stdout.write(`\rframe ${f}/${last}  ${(done * 100).toFixed(0)}%  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
}
encoder.stdin.end();
await encoded;
process.stdout.write("\n");

// Poster: the icon wall mid-ripple reads best as a thumbnail.
await page.evaluate((t) => window.__seek(t), Number(process.env.POSTER_AT || 18.3));
await page.screenshot({ path: POSTER, type: "png" });

const events = await page.evaluate("window.__events");
await browser.close();

const wavPath = path.join(work, "score.wav");
writeFileSync(wavPath, scoreShowcase({ total: meta.total, events, scenes: meta.scenes }));

await run([
  "-y", "-hide_banner", "-loglevel", "error", "-i", silent, "-ss", String(from), "-t", String(to - from), "-i", wavPath,
  "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
  "-movflags", "+faststart", OUT,
]);

rmSync(work, { recursive: true, force: true });
console.log(`Wrote ${OUT} (${(to - from).toFixed(1)}s @ ${FPS}fps) and ${POSTER}`);
